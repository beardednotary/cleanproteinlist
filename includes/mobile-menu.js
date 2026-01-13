(function() {
    function initMenu() {
        const hamburger = document.getElementById('hamburger-btn');
        const nav = document.getElementById('mobile-nav');
        const overlay = document.getElementById('menu-overlay');

        // If the header hasn't loaded yet, try again in 100ms
        if (!hamburger || !nav || !overlay) {
            setTimeout(initMenu, 100);
            return;
        }

        hamburger.onclick = function(e) {
            e.preventDefault();
            hamburger.classList.toggle('open');
            nav.classList.toggle('menu-open');
            overlay.classList.toggle('active');
            document.body.style.overflow = nav.classList.contains('menu-open') ? 'hidden' : '';
        };

        overlay.onclick = function() {
            hamburger.classList.remove('open');
            nav.classList.remove('menu-open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        };
    }

    initMenu();
})();
