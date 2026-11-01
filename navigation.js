/* =====================================================
   SHARED SITE NAVIGATION
   Used by index.html, bugs.html, and future pages.

   Menu content: menu.json
   Menu styling: navigation.css
   ===================================================== */

// Wait until the page has created the navigation placeholder.
document.addEventListener('DOMContentLoaded', function () {
    const navHub = document.getElementById('global-navigation-hub');
    if (!navHub) return;

    fetch('menu.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Could not load menu.json (HTTP ' + response.status + ')');
            }
            return response.json();
        })
        .then(menuData => {
            // Highlight the current page (including links inside dropdowns).
            const currentFilename = window.location.pathname.split('/').pop() || 'index.html';

            let headerHTML = `
                <header class="site-header">
                    <div class="header-title">Laura's Adventures</div>
                    <button type="button" class="menu-toggle" id="menuToggle"
                            aria-label="Toggle Navigation Menu"
                            aria-controls="navMenu" aria-expanded="false">
                        <span></span><span></span><span></span>
                    </button>
                    <nav class="nav-menu" id="navMenu">
            `;

            menuData.forEach(node => {
                if (node.type === 'link') {
                    const isActive = currentFilename === node.href ? 'active' : '';
                    headerHTML += `<a href="${node.href}" class="nav-link ${isActive}">${node.text}</a>`;
                } else if (node.type === 'dropdown') {
                    const hasActiveChild = node.items.some(sub => currentFilename === sub.href);
                    const parentActive = hasActiveChild ? 'active' : '';

                    headerHTML += `
                        <div class="dropdown">
                            <a href="#" class="nav-link dropdown-toggle ${parentActive}"
                               aria-haspopup="true" aria-expanded="false">${node.text}</a>
                            <div class="dropdown-content">
                    `;

                    node.items.forEach(sub => {
                        const isSubActive = currentFilename === sub.href ? 'active-sub' : '';
                        headerHTML += `<a href="${sub.href}" class="${isSubActive}">${sub.text}</a>`;
                    });

                    headerHTML += `</div></div>`;
                }
            });

            headerHTML += `</nav></header>`;
            navHub.innerHTML = headerHTML;

            // The menu is now in the document, so attach its click handlers.
            const menuToggle = document.getElementById('menuToggle');
            const navMenu = document.getElementById('navMenu');

            if (menuToggle && navMenu) {
                menuToggle.addEventListener('click', function () {
                    const isOpen = navMenu.classList.toggle('open');
                    menuToggle.setAttribute('aria-expanded', String(isOpen));
                });
            }

            navHub.querySelectorAll('.dropdown').forEach(dropdown => {
                const toggleLink = dropdown.querySelector('.dropdown-toggle');
                if (!toggleLink) return;

                toggleLink.addEventListener('click', function (event) {
                    // The parent heading isn't a destination page.
                    event.preventDefault();

                    // On mobile, tapping a heading opens or closes its submenu.
                    // On desktop, navigation.css handles hover and keyboard focus.
                    if (window.innerWidth <= 768) {
                        const isOpen = dropdown.classList.toggle('mobile-open');
                        toggleLink.setAttribute('aria-expanded', String(isOpen));
                    }
                });
            });
        })
        .catch(error => console.error('Error loading site navigation:', error));
});
