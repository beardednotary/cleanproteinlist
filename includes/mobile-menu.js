(function() {
    function initMenu() {
        const hamburger = document.getElementById('hamburger-btn');
        const nav = document.getElementById('mobile-nav');
        const overlay = document.getElementById('menu-overlay');

        // If the include hasn't finished yet, wait and try again
        if (!hamburger || !nav || !overlay) {
            setTimeout(initMenu, 50); 
            return;
        }

        // Use onclick to overwrite any previous failed attempts
        hamburger.onclick = function(e) {
            e.preventDefault();
            hamburger.classList.toggle('open');
            nav.classList.toggle('menu-open');
            overlay.classList.toggle('active');
            
            if (nav.classList.contains('menu-open')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        };

        overlay.onclick = function() {
            hamburger.classList.remove('open');
            nav.classList.remove('menu-open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        console.log("Menu successfully attached to injected HTML.");
    }

    initMenu();
})();
