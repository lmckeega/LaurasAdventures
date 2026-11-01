/* Shared photo lightbox: used by bugs.html and cakes.html.
   Each gallery calls setLightboxImages(itsPhotos) after loading its JSON data.
   Gallery thumbnails can continue to use onclick="openLightbox(index)".
*/
(function () {
    'use strict';

    let photos = [];
    let currentIndex = 0;

    function setLightboxImages(data) {
        photos = Array.isArray(data) ? data : [];
        currentIndex = 0;
    }

    function renderLightboxSnapshot() {
        if (!photos.length) return;

        const photo = photos[currentIndex];
        const image = document.getElementById('lightboxImg');
        const title = document.getElementById('captionTitle');
        const description = document.getElementById('captionDesc');
        if (!image || !title || !description) return;

        image.src = photo.src || '';
        image.alt = photo.title || 'Gallery photo';
        title.textContent = photo.title || '';
        description.textContent = photo.desc || '';
    }

    function openLightbox(index) {
        const modal = document.getElementById('myLightbox');
        if (!modal || !photos.length || !Number.isInteger(index) || index < 0 || index >= photos.length) return;

        currentIndex = index;
        renderLightboxSnapshot();
        modal.style.display = 'flex';
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

    document.addEventListener('keydown', function (event) {
        const modal = document.getElementById('myLightbox');
        if (!modal || modal.style.display !== 'flex') return;

        if (event.key === 'Escape') closeLightbox();
        if (event.key === 'ArrowRight') changeImage(1);
        if (event.key === 'ArrowLeft') changeImage(-1);
    });

    // Expose functions for each gallery page's thumbnail and lightbox buttons.
    window.setLightboxImages = setLightboxImages;
    window.openLightbox = openLightbox;
    window.closeLightbox = closeLightbox;
    window.changeImage = changeImage;
})();
