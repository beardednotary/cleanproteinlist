// Mobile menu functionality - Universal (works from any directory)
(function() {
    // We wrap the logic in a function so we can retry if elements aren't ready
    function initMobileMenu() {
        const hamburger = document.getElementById('hamburger-btn');
        const nav = document.getElementById('mobile-nav');
        const overlay = document.getElementById('menu-overlay');
        
        // Exit if elements don't exist yet
        if (!hamburger || !nav || !overlay) return false;
        
        function toggleMenu() {
            const isOpen = nav.classList.contains('menu-open');
            hamburger.classList.toggle('open');
            nav.classList.toggle('menu-open');
            overlay.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = isOpen ? '' : 'hidden';
        }
        
        function closeMenu() {
            hamburger.classList.remove('open');
            nav.classList.remove('menu-open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        // Remove existing listeners first to prevent double-firing
        hamburger.onclick = null;
        hamburger.addEventListener('click', toggleMenu);
        overlay.onclick = null;
        overlay.addEventListener('click', closeMenu);
        
        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.onclick = null;
            link.addEventListener('click', closeMenu);
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && nav.classList.contains('menu-open')) {
                closeMenu();
            }
        });
        
        window.addEventListener('popstate', closeMenu);
        
        console.log("Mobile menu initialized successfully.");
        return true;
    }

    // Execution Logic: Try immediately, then again on DOMContentLoaded, then one last time.
    if (!initMobileMenu()) {
        document.addEventListener('DOMContentLoaded', initMobileMenu);
        // Last resort for slow 'includes' injections
        setTimeout(initMobileMenu, 500);
    }
})();
