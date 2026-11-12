/* ===========================================================
   SHARED PHOTO LIGHTBOX — ALL WEBSITE GALLERIES

   Works with BOTH kinds of gallery:
   - JSON galleries (Bugs, Cakes, etc.)
   - HTML story galleries initialized by story-gallery.js

   Each gallery supplies photographs using setLightboxImages().
   The HTML and existing function names do not need changing.

   SIZE IMPROVEMENT:
   When each photo loads, this script calculates the largest
   width/height that fits between the arrows and above its
   caption, while keeping the photo's original proportions.
   It can enlarge small photos (which max-width alone cannot).
   =========================================================== */
(function () {
    'use strict';

    let photos = [];
    let currentIndex = 0;

    function setLightboxImages(data) {
        photos = Array.isArray(data) ? data : [];
        currentIndex = 0;
    }

    /* -------------------------------------------------------
       FIT PHOTO TO SCREEN WITHOUT CROPPING
       Edit the CSS variables in .lightbox to change margins.
       ------------------------------------------------------- */
    function fitLightboxImage() {
        const modal = document.getElementById('myLightbox');
        const image = document.getElementById('lightboxImg');
        if (!modal || !image || modal.style.display !== 'flex' ||
            !image.naturalWidth || !image.naturalHeight) return;

        const caption = modal.querySelector('.lightbox-caption');
        const modalStyle = getComputedStyle(modal);
        const imageStyle = getComputedStyle(image);

        // These values are set and explained in lightbox.css.
        const sideSpace = parseFloat(modalStyle.getPropertyValue('--lightbox-side-space')) || 160;
        const verticalSpace = parseFloat(modalStyle.getPropertyValue('--lightbox-vertical-space')) || 100;
        const captionGap = parseFloat(modalStyle.getPropertyValue('--lightbox-caption-gap')) || 16;
        const captionHeight = caption ? caption.getBoundingClientRect().height : 0;

        // Leave room for the photo's border as well as the arrows/caption.
        const borderWidth = parseFloat(imageStyle.borderLeftWidth) +
                            parseFloat(imageStyle.borderRightWidth);
        const borderHeight = parseFloat(imageStyle.borderTopWidth) +
                             parseFloat(imageStyle.borderBottomWidth);
        const availableWidth = Math.max(1, modal.clientWidth - sideSpace - borderWidth);
        const availableHeight = Math.max(1, modal.clientHeight - verticalSpace -
                                        captionHeight - captionGap - borderHeight);

        // The smaller scale factor is the one that fits BOTH directions.
        // Not capped at 1, so a small original photograph can grow larger.
        const scale = Math.min(
            availableWidth / image.naturalWidth,
            availableHeight / image.naturalHeight
        );

        image.style.width = `${Math.max(1, Math.floor(image.naturalWidth * scale))}px`;
        image.style.height = `${Math.max(1, Math.floor(image.naturalHeight * scale))}px`;
    }

    /* -------------------------------------------------------
       LOAD PHOTO AND UPDATE ITS TITLE / DESCRIPTION
       ------------------------------------------------------- */
    function renderLightboxSnapshot() {
        if (!photos.length) return;

        const photo = photos[currentIndex];
        const image = document.getElementById('lightboxImg');
        const title = document.getElementById('captionTitle');
        const description = document.getElementById('captionDesc');
        if (!image || !title || !description) return;

        image.alt = photo.title || 'Gallery photo';
        title.textContent = photo.title || '';
        description.textContent = photo.desc || '';

        // Hide the previous image until the new one has been sized.
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

        // Cached photos can already be loaded before the load event runs.
        if (image.complete && image.naturalWidth > 0) {
            fitLightboxImage();
            image.style.visibility = 'visible';
        }
    }

    /* -------------------------------------------------------
       OPEN / CLOSE / MOVE THROUGH PHOTOGRAPHS
       The names are unchanged for all existing gallery pages.
       ------------------------------------------------------- */
    function openLightbox(index) {
        const modal = document.getElementById('myLightbox');
        if (!modal || !photos.length || !Number.isInteger(index) ||
            index < 0 || index >= photos.length) return;

        currentIndex = index;
        modal.style.display = 'flex';
        renderLightboxSnapshot();
    }

    function closeLightbox() {
        const modal = document.getElementById('myLightbox');
        if (modal) modal.style.display = 'none';
    }

    function changeImage(direction) {
        if (!photos.length) return;
        currentIndex = (currentIndex + direction + photos.length) % photos.length;
        renderLightboxSnapshot();
    }

    // Fit again when a browser window is resized or a phone is rotated.
    window.addEventListener('resize', fitLightboxImage);

    document.addEventListener('keydown', function (event) {
        const modal = document.getElementById('myLightbox');
        if (!modal || modal.style.display !== 'flex') return;

        if (event.key === 'Escape') closeLightbox();
        if (event.key === 'ArrowRight') changeImage(1);
        if (event.key === 'ArrowLeft') changeImage(-1);
    });

    // Keep exactly the same global functions as the original version.
    window.setLightboxImages = setLightboxImages;
    window.openLightbox = openLightbox;
    window.closeLightbox = closeLightbox;
    window.changeImage = changeImage;
})();
