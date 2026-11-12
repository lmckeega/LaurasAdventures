NEW ZEALAND MAIN PAGE — INSTALLATION AND EDITING NOTES
======================================================

This package contains:
  newzealand.html                    New travel landing page
  newzealand-gallery-data.json       Empty gallery list: []
  images/newzealand/*-preview.jpg     Five LOW-RESOLUTION temporary story previews

FILES ALREADY ON YOUR WEBSITE (NOT INCLUDED)
  /navigation.css
  /navigation.js
  /content-layouts.css
  /lightbox.css
  /lightbox.js
  /images/newzealand-bg.jpg         Your existing blurred green background

INSTALL
1. Upload newzealand.html to the website root folder.
2. Upload newzealand-gallery-data.json to the website root folder.
3. Upload the five preview JPG files into images/newzealand/.
4. Keep your existing navigation, content-layouts and lightbox files.
5. Change the New Zealand menu entry in menu.json to:
      { "text": "New Zealand", "href": "newzealand.html" }
6. Commit/push and refresh the page after GitHub Pages deploys.

STORY LINKS
- Making Knives links to /newzealand/making-knives.html on your website.
- The other seven story cards currently point to their original Wix posts.
  As you convert each story, edit that card's href in newzealand.html
  to the new local .html file and remove target="_blank" if desired.

STORY PHOTOS
The five *-preview.jpg files were cropped from the screenshot you uploaded.
They are only for testing the layout, and will look fuzzy when enlarged.
Replace them with original photos and keep the same filenames, OR update
src= in the matching story card.

The last three stories use simple icons for now: Driving, Auckland, Tramping.
Replace the <div class="story-image-placeholder"> with an <img> as above
when you have selected their pictures.

PAGE LAYOUT / MENU SPACING
Search newzealand.html for 'SECTION 1'. The variable --nz-menu-height
controls where the page begins under the fixed navigation:
  --nz-menu-height: 121px;   DESKTOP
  --nz-menu-height: 64px;    PHONE / TABLET
Adjust these if your actual menu is taller or shorter.

Search for 'SECTION 3' to change left/right column widths.
Search for 'SECTION 4' for itinerary scroll behavior.
Search for 'SECTION 5' to adjust story cards.

ADDING A GALLERY LATER
The gallery is already built into newzealand.html but remains invisible
while newzealand-gallery-data.json contains [] (an empty list).

Replace [] with entries such as:
[
  {
    "src": "images/newzealand/gallery/photo01.jpg",
    "title": "Waitomo Caves",
    "desc": "A note about this photograph."
  },
  {
    "src": "images/newzealand/gallery/photo02.jpg",
    "title": "Milford Track",
    "desc": "Another note."
  }
]

Upload those photo files to the matching image folder. The bottom gallery
then appears automatically, with click-to-enlarge and captions via lightbox.js.

The example filenames above are placeholders, not existing files.
