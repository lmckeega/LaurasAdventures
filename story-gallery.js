/* ============================================================
   STORY GALLERY — SHARED JAVASCRIPT

   Used by story pages such as Hobbiton, Making Knives, etc.

   Each story page should contain:
     <div class="story-gallery" id="storyGallery"> ... </div>

   Each gallery photograph is inside a <button> with an <img>.
   The image attributes supply the lightbox details:
     src           = full-size image path
     alt           = lightbox title
     data-caption  = optional lightbox description

   The shared lightbox.js must load BEFORE this file.
   Do not change this file when adding photographs to a page.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
    // Locate the gallery on this page.
    const gallery = document.getElementById('storyGallery');

    // Some pages may not include a gallery. Do nothing on those pages.
    if (!gallery) return;

    // Collect only buttons that contain an image.
    const buttons = Array.from(gallery.querySelectorAll('button'))
        .filter(button => button.querySelector('img'));

    // Get image paths, titles, and optional captions from the HTML.
    const photos = buttons.map(button => {
        const img = button.querySelector('img');

        return {
            src: img.getAttribute('src'),
            title: img.alt,
            desc: img.dataset.caption || ''
        };
    });

    // Register the photographs with the shared lightbox viewer.
    if (photos.length === 0) return;
    setLightboxImages(photos);

    // Open the corresponding photograph when a thumbnail is clicked.
    buttons.forEach((button, index) => {
        button.addEventListener('click', () => openLightbox(index));
    });
});
