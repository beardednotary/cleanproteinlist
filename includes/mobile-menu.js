// Mobile menu functionality - Universal (works from any directory)
(function() {
    const hamburger = document.getElementById('hamburger-btn');
    const nav = document.getElementById('mobile-nav');
    const overlay = document.getElementById('menu-overlay');
    
    // Exit if elements don't exist (graceful failure)
    if (!hamburger || !nav || !overlay) return;
    
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
    
    // Toggle menu on hamburger click
    hamburger.addEventListener('click', toggleMenu);
    
    // Close menu when clicking overlay
    overlay.addEventListener('click', closeMenu);
    
    // Close menu when clicking any nav link
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && nav.classList.contains('menu-open')) {
            closeMenu();
        }
    });
    
    // Close menu when browser back button is pressed (mobile)
    window.addEventListener('popstate', closeMenu);
})();
