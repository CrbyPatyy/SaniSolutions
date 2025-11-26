// Register service worker for offline functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        try {
            navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(function(error) {
                console.log('ServiceWorker registration failed: ', error);
            });
        } catch (error) {
            console.error('Service Worker registration error:', error);
        }
    });
}

// Enhanced JavaScript with GSAP and all requested features

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize GSAP plugins
    gsap.registerPlugin(ScrollTrigger, TextPlugin);
    
    // Global error handler
    window.addEventListener('error', function(e) {
        console.error('Global error:', e.error);
    });
    
    // Detect touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Apply touch-device class to body for CSS styling
    if (isTouchDevice) {
        document.body.classList.add('touch-device');
    }
    
    // Loading screen animation with GSAP
    try {
        const loadingScreen = document.getElementById('loadingScreen');
        const loadingTimeline = gsap.timeline();
        
        loadingTimeline
            .to('.loading-logo', {
                duration: 1.5,
                opacity: 1,
                y: 0,
                ease: 'power3.out'
            })
            .to('.loading-logo', {
                duration: 0.5,
                opacity: 0,
                scale: 1.1,
                ease: 'power2.in'
            }, "+0.5")
            .to(loadingScreen, {
                duration: 0.7,
                y: "-100%",
                ease: 'expo.inOut',
                onComplete: () => {
                    loadingScreen.style.display = 'none';
                    // Start main page animations after loading is complete
                    initMainAnimations();
                }
            });
    } catch (e) {
        // Fallback if GSAP fails (e.g., script fails to load)
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        initMainAnimations();
    }

    function initMainAnimations() {
        // --- 1. Hero Section Animation ---
        gsap.from(".hero .eyebrow", { opacity: 0, y: 20, duration: 0.8, delay: 0.2 });
        gsap.from(".hero .headline span", { 
            opacity: 0, 
            y: 40, 
            stagger: 0.15, 
            duration: 1.2, 
            ease: "power3.out",
            delay: 0.3
        });
        gsap.from(".hero .subtext", { opacity: 0, y: 20, duration: 1, delay: 0.8 });
        gsap.from(".hero-cta a", { opacity: 0, y: 20, stagger: 0.2, duration: 0.8, delay: 1 });


        // --- 2. Header Scroll Behavior ---
        const header = document.getElementById('header');
        ScrollTrigger.create({
            trigger: document.body,
            start: "top -100px", 
            end: "bottom bottom",
            onUpdate: (self) => {
                if (self.direction === 1) { // Scrolling down
                    gsap.to(header, { y: -header.offsetHeight, duration: 0.3 });
                } else { // Scrolling up
                    gsap.to(header, { y: 0, duration: 0.3 });
                }
            },
            onLeaveBack: () => header.classList.remove('scrolled'),
            onEnter: () => header.classList.add('scrolled'),
        });


        // --- 3. Scroll Progress Bar ---
        gsap.to("#scrollProgress", {
            width: "100%",
            ease: "none",
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: "bottom bottom",
                scrub: true,
            }
        });


        // --- 4. Custom Cursor Logic (Only for non-touch devices) ---
        if (!isTouchDevice) {
            const cursorDot = document.getElementById('cursorDot');
            const cursorRing = document.getElementById('cursorRing');
            let isMoving = false;
            
            gsap.set([cursorDot, cursorRing], { opacity: 1 });

            document.addEventListener('mousemove', (e) => {
                isMoving = true;
                gsap.to(cursorDot, { duration: 0.2, x: e.clientX, y: e.clientY });
                gsap.to(cursorRing, { duration: 0.7, x: e.clientX, y: e.clientY });
            });

            // Handle hover states
            document.querySelectorAll('a, button, .service-card, .why-us-card, .pricing-card').forEach(el => {
                el.addEventListener('mouseenter', () => cursorRing.classList.add('grow'));
                el.addEventListener('mouseleave', () => cursorRing.classList.remove('grow'));
            });
        }


        // --- 5. Mobile Menu Toggle ---
        const mobileMenu = document.getElementById('mobileMenu');
        mobileMenu.addEventListener('click', function() {
            this.classList.toggle('open');
            // This is a placeholder. A full mobile menu modal/drawer implementation would go here.
            // For now, this just toggles the hamburger animation.
            // When building the full site, you'll need to create a mobile-nav element
            // and toggle its visibility here.
            // Example: document.getElementById('mobileNavDrawer').classList.toggle('visible');
        });

        // --- 6. ScrollTrigger Section Reveal (General) ---
        gsap.utils.toArray(".content-section").forEach(section => {
            gsap.from(section.querySelectorAll(".section-header, .services-grid > *, .why-us-grid > *, .pricing-grid > *, .testimonials-grid > *, .contact-container"), {
                opacity: 0,
                y: 50,
                stagger: 0.1,
                duration: 1.0,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: section,
                    start: "top 85%", // Start animation when section is 85% in view
                    toggleActions: "play none none none"
                }
            });
        });

        // --- 7. Form Validation (Kept simple) ---
        const contactForm = document.getElementById('contactForm');
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            let isValid = true;
            
            // Basic required field check (extend this for email/format validation)
            ['name', 'email', 'message', 'businessType', 'serviceInterest'].forEach(id => {
                const input = document.getElementById(id);
                const error = document.getElementById(id + 'Error');
                if (input.required && input.value.trim() === '') {
                    error.textContent = 'This field is required.';
                    isValid = false;
                } else {
                    error.textContent = '';
                }
            });

            const formMessage = document.getElementById('formMessage');
            if (isValid) {
                // Simulate form submission success
                formMessage.textContent = 'Thank you! Your consultation request has been sent. We will be in touch shortly.';
                formMessage.style.color = '#4a7c59';
                this.reset();
                
                // In a real application, you would send data via fetch/XMLHttpRequest here
                // Example: fetch('/submit-form', { method: 'POST', body: new FormData(this) });
                
            } else {
                formMessage.textContent = 'Please correct the errors above.';
                formMessage.style.color = '#cc0000';
            }
        });
        
        
        // --- 8. Smooth Scrolling for Navigation (Updated for new nav) ---
        document.querySelectorAll('.nav a[href^="#"], .hero-cta a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const target = document.querySelector(targetId);
                
                // Offset calculation for fixed header height
                const yOffset = document.getElementById('header').offsetHeight + 20; 
                
                if (target) {
                    const y = target.getBoundingClientRect().top + window.pageYOffset - yOffset;
                    
                    window.scrollTo({
                        top: y,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        // --- 9. Active navigation highlighting ---
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav a:not(.btn-header-cta)');
        
        function updateActiveNav() {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                // Offset by header height to ensure correct section highlighting
                if (window.pageYOffset >= sectionTop - document.getElementById('header').offsetHeight - 50) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        }
        
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (!scrollTimeout) {
                scrollTimeout = setTimeout(() => {
                    scrollTimeout = null;
                    updateActiveNav();
                }, 10);
            }
        });
        
        updateActiveNav();
    }
});