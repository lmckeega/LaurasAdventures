/* ===========================================================
   SHARED PHOTO LIGHTBOX — ALL WEBSITE GALLERIES

   Works with BOTH gallery types:
   - JSON galleries (Bugs, Cakes, etc.)
   - HTML story galleries (via story-gallery.js)

   No changes needed to gallery pages or their existing HTML.
   This file creates the zoom controls automatically.

   CONTROLS:
   + / - / Reset    Zoom from 100% (fit) to 300%
   Mouse wheel      Zoom where the pointer is
   Mouse drag       Move a zoomed photograph
   Touch pinch      Zoom with two fingers
   Touch drag       Move a zoomed photograph
   Esc / arrows     Close / previous / next photograph
   +/- / 0 keys     Zoom in / zoom out / reset

   The photograph fits inside the window when first opened.
   Zoom always resets when moving to a different photograph.
   =========================================================== */
(function () {
    'use strict';

    let photos = [];
    let currentIndex = 0;

    /* -------------------------------------------------------
       1. ZOOM SETTINGS — CHANGE THESE IF DESIRED
       ------------------------------------------------------- */
    const MIN_ZOOM = 1;        // 1 = photo fitted to available screen space (100%)
    const MAX_ZOOM = 3;        // 3 = 300% of fitted size; change to 4 for 400%
    const ZOOM_STEP = 0.25;    // Button / keyboard step: 25%
    const WHEEL_FACTOR = 1.15;// Zoom factor for each mouse-wheel movement

    let zoom = MIN_ZOOM;
    let panX = 0;
    let panY = 0;
    const pointers = new Map();
    let pinchStart = null;

    function setLightboxImages(data) {
        photos = Array.isArray(data) ? data : [];
        currentIndex = 0;
    }

    function isOpen() {
        const modal = document.getElementById('myLightbox');
        return !!modal && modal.style.display === 'flex';
    }

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    /* -------------------------------------------------------
       2. CREATE THE ZOOM CONTROLS AUTOMATICALLY

       Existing HTML only needs #myLightbox and #lightboxImg.
       The JavaScript wraps the picture in a viewing area and
       adds the controls; gallery HTML can stay unchanged.
       ------------------------------------------------------- */
    function initializeZoomControls() {
        const modal = document.getElementById('myLightbox');
        const image = document.getElementById('lightboxImg');
        if (!modal || !image) return;
        if (modal.querySelector('.lightbox-photo-area')) return;

        const area = document.createElement('div');
        area.className = 'lightbox-photo-area';
        area.setAttribute('aria-label', 'Zoomable photograph');
        image.parentNode.insertBefore(area, image);
        area.appendChild(image);

        const controls = document.createElement('div');
        controls.className = 'lightbox-zoom-controls';
        controls.setAttribute('role', 'group');
        controls.setAttribute('aria-label', 'Photograph zoom controls');

        function makeButton(text, className, label, action) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = className;
            button.textContent = text;
            button.setAttribute('aria-label', label);
            button.title = label;
            button.addEventListener('click', action);
            controls.appendChild(button);
            return button;
        }

        makeButton('−', 'lightbox-zoom-out', 'Zoom out', function () {
            setZoom(zoom - ZOOM_STEP);
        });

        const level = document.createElement('span');
        level.className = 'lightbox-zoom-level';
        level.textContent = '100%';
        level.setAttribute('aria-live', 'off');
        controls.appendChild(level);

        makeButton('+', 'lightbox-zoom-in', 'Zoom in', function () {
            setZoom(zoom + ZOOM_STEP);
        });

        makeButton('Reset', 'lightbox-zoom-reset', 'Reset zoom to fit', function () {
            resetZoom();
        });

        area.after(controls);

        // Wheel zoom is focused on the position of the mouse pointer.
        area.addEventListener('wheel', function (event) {
            if (!isOpen() || !image.naturalWidth) return;
            event.preventDefault();

            const rect = area.getBoundingClientRect();
            const mouseX = event.clientX - rect.left - rect.width / 2;
            const mouseY = event.clientY - rect.top - rect.height / 2;
            const nextZoom = clamp(
                zoom * (event.deltaY < 0 ? WHEEL_FACTOR : 1 / WHEEL_FACTOR),
                MIN_ZOOM, MAX_ZOOM
            );
            const ratio = nextZoom / zoom;
            setZoom(nextZoom,
                mouseX - (mouseX - panX) * ratio,
                mouseY - (mouseY - panY) * ratio
            );
        }, { passive: false });

        // Pointer Events support mouse drag and phone/tablet pinch-to-zoom.
        area.addEventListener('pointerdown', function (event) {
            if (!isOpen() || !image.naturalWidth) return;
            if (event.pointerType === 'mouse' && event.button !== 0) return;

            pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
            area.setPointerCapture(event.pointerId);
            if (pointers.size === 2) {
                startPinch(area);
            } else if (zoom > MIN_ZOOM) {
                area.classList.add('is-dragging');
            }
        });

        area.addEventListener('pointermove', function (event) {
            if (!pointers.has(event.pointerId)) return;
            const previous = pointers.get(event.pointerId);
            pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

            if (pointers.size >= 2) {
                if (!pinchStart) startPinch(area);
                const [a, b] = Array.from(pointers.values()).slice(0, 2);
                const distance = Math.hypot(a.x - b.x, a.y - b.y);
                const midpointX = (a.x + b.x) / 2;
                const midpointY = (a.y + b.y) / 2;
                const nextZoom = clamp(
                    pinchStart.zoom * distance / pinchStart.distance,
                    MIN_ZOOM, MAX_ZOOM
                );
                const ratio = nextZoom / pinchStart.zoom;
                const rect = area.getBoundingClientRect();
                const midX = midpointX - rect.left - rect.width / 2;
                const midY = midpointY - rect.top - rect.height / 2;
                setZoom(nextZoom,
                    midX - (pinchStart.midX - pinchStart.panX) * ratio,
                    midY - (pinchStart.midY - pinchStart.panY) * ratio
                );
                event.preventDefault();
            } else if (zoom > MIN_ZOOM) {
                setZoom(zoom,
                    panX + event.clientX - previous.x,
                    panY + event.clientY - previous.y
                );
                event.preventDefault();
            }
        });

        function releasePointer(event) {
            pointers.delete(event.pointerId);
            if (pointers.size < 2) pinchStart = null;
            if (pointers.size === 0) area.classList.remove('is-dragging');
        }
        area.addEventListener('pointerup', releasePointer);
        area.addEventListener('pointercancel', releasePointer);
        area.addEventListener('lostpointercapture', releasePointer);

        updateZoomDisplay();
    }

    function startPinch(area) {
        const [a, b] = Array.from(pointers.values()).slice(0, 2);
        const rect = area.getBoundingClientRect();
        pinchStart = {
            distance: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)),
            zoom: zoom,
            panX: panX,
            panY: panY,
            midX: (a.x + b.x) / 2 - rect.left - rect.width / 2,
            midY: (a.y + b.y) / 2 - rect.top - rect.height / 2
        };
        area.classList.remove('is-dragging');
    }

    /* -------------------------------------------------------
       3. ZOOM AND PANNING — KEEP PICTURE WITHIN VIEWING AREA
       ------------------------------------------------------- */
    function setZoom(nextZoom, nextPanX = panX, nextPanY = panY) {
        const image = document.getElementById('lightboxImg');
        const area = document.querySelector('#myLightbox .lightbox-photo-area');
        if (!image || !area) return;

        zoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
        const maxPanX = Math.max(0, (image.offsetWidth * zoom - area.clientWidth) / 2);
        const maxPanY = Math.max(0, (image.offsetHeight * zoom - area.clientHeight) / 2);
        panX = zoom === MIN_ZOOM ? 0 : clamp(nextPanX, -maxPanX, maxPanX);
        panY = zoom === MIN_ZOOM ? 0 : clamp(nextPanY, -maxPanY, maxPanY);

        image.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
        area.classList.toggle('is-zoomed', zoom > MIN_ZOOM);
        updateZoomDisplay();
    }

    function updateZoomDisplay() {
        const controls = document.querySelector('#myLightbox .lightbox-zoom-controls');
        if (!controls) return;
        const level = controls.querySelector('.lightbox-zoom-level');
        const minus = controls.querySelector('.lightbox-zoom-out');
        const plus = controls.querySelector('.lightbox-zoom-in');
        const reset = controls.querySelector('.lightbox-zoom-reset');
        if (level) level.textContent = `${Math.round(zoom * 100)}%`;
        if (minus) minus.disabled = zoom <= MIN_ZOOM;
        if (plus) plus.disabled = zoom >= MAX_ZOOM;
        if (reset) reset.disabled = zoom <= MIN_ZOOM;
    }

    function resetZoom() {
        pointers.clear();
        pinchStart = null;
        const area = document.querySelector('#myLightbox .lightbox-photo-area');
        if (area) area.classList.remove('is-dragging');
        setZoom(MIN_ZOOM, 0, 0);
    }

    /* -------------------------------------------------------
       4. FIT EACH PHOTO TO ITS AVAILABLE SCREEN AREA

       The photo area automatically leaves room for captions,
       arrows, and the new zoom controls (handled by CSS).
       ------------------------------------------------------- */
    function fitLightboxImage() {
        const modal = document.getElementById('myLightbox');
        const image = document.getElementById('lightboxImg');
        const area = modal && modal.querySelector('.lightbox-photo-area');
        if (!modal || !image || !area || !isOpen() ||
            !image.naturalWidth || !image.naturalHeight) return;

        const style = getComputedStyle(image);
        const modalStyle = getComputedStyle(modal);
        const controls = modal.querySelector('.lightbox-zoom-controls');
        const caption = modal.querySelector('.lightbox-caption');
        const borderWidth = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
        const borderHeight = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
        const topAndBottomPadding = parseFloat(modalStyle.paddingTop) +
                                    parseFloat(modalStyle.paddingBottom);
        const controlsSpace = controls ? controls.offsetHeight +
                             parseFloat(getComputedStyle(controls).marginTop) : 0;
        const captionSpace = caption ? caption.offsetHeight +
                            parseFloat(getComputedStyle(caption).marginTop) : 0;

        // Reserve space for controls and captions before sizing the photo.
        const availableWidth = Math.max(1, area.clientWidth - borderWidth);
        const availableHeight = Math.max(1, modal.clientHeight - topAndBottomPadding -
                                         controlsSpace - captionSpace - borderHeight);

        // Not capped at 1: small originals may enlarge to fill the screen.
        const scale = Math.min(availableWidth / image.naturalWidth,
                               availableHeight / image.naturalHeight);
        const fitWidth = Math.max(1, Math.floor(image.naturalWidth * scale));
        const fitHeight = Math.max(1, Math.floor(image.naturalHeight * scale));
        image.style.width = `${fitWidth}px`;
        image.style.height = `${fitHeight}px`;

        // Keep the picture, zoom buttons and caption together in the center.
        // Without this, landscape photos on phones leave a huge blank gap.
        area.style.height = `${fitHeight + borderHeight}px`;
        setZoom(zoom, panX, panY);  // Recalculate pan limits after a resize.
    }

    /* -------------------------------------------------------
       5. LOAD PHOTO AND UPDATE ITS TITLE / DESCRIPTION
       ------------------------------------------------------- */
    function renderLightboxSnapshot() {
        if (!photos.length) return;
        const photo = photos[currentIndex];
        const image = document.getElementById('lightboxImg');
        const title = document.getElementById('captionTitle');
        const description = document.getElementById('captionDesc');
        if (!image || !title || !description) return;

        resetZoom(); // Each new photo starts fitted to the screen (100%).
        image.alt = photo.title || 'Gallery photo';
        title.textContent = photo.title || '';
        description.textContent = photo.desc || '';

        image.style.visibility = 'hidden';
        image.style.width = '0px';
        image.style.height = '0px';

        image.onload = function () {
            fitLightboxImage();
            image.style.visibility = 'visible';
        };
        image.onerror = function () {
            image.style.width = 'auto';
            image.style.height = 'auto';
            image.style.visibility = 'visible';
        };
        image.src = photo.src || '';

        // An image may already be cached when its URL is assigned.
        if (image.complete && image.naturalWidth > 0) {
            fitLightboxImage();
            image.style.visibility = 'visible';
        }
    }

    /* -------------------------------------------------------
       6. OPEN / CLOSE / PREVIOUS / NEXT

       These four global names stay the same for all galleries.
       ------------------------------------------------------- */
    function openLightbox(index) {
        const modal = document.getElementById('myLightbox');
        if (!modal || !photos.length || !Number.isInteger(index) ||
            index < 0 || index >= photos.length) return;
        initializeZoomControls();
        currentIndex = index;
        modal.style.display = 'flex';
        renderLightboxSnapshot();
    }

    function closeLightbox() {
        const modal = document.getElementById('myLightbox');
        if (modal) modal.style.display = 'none';
        resetZoom();
    }

    function changeImage(direction) {
        if (!photos.length) return;
        currentIndex = (currentIndex + direction + photos.length) % photos.length;
        renderLightboxSnapshot();
    }

    window.addEventListener('resize', fitLightboxImage);
    document.addEventListener('keydown', function (event) {
        if (!isOpen()) return;
        if (event.key === 'Escape') { closeLightbox(); return; }
        if (event.key === 'ArrowRight') { changeImage(1); return; }
        if (event.key === 'ArrowLeft') { changeImage(-1); return; }
        if (event.key === '+' || event.key === '=') setZoom(zoom + ZOOM_STEP);
        if (event.key === '-') setZoom(zoom - ZOOM_STEP);
        if (event.key === '0') resetZoom();
    });

    window.setLightboxImages = setLightboxImages;
    window.openLightbox = openLightbox;
    window.closeLightbox = closeLightbox;
    window.changeImage = changeImage;
})();
