// Safe JavaScript with GSAP fallback
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing');
    
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
    
    // Mobile menu functionality
    function initMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileNav = document.createElement('div');
        const mobileNavOverlay = document.createElement('div');

        // Create mobile navigation
        mobileNav.className = 'mobile-nav';
        mobileNav.setAttribute('aria-label', 'Mobile navigation');
        mobileNavOverlay.className = 'mobile-nav-overlay';

        // Clone navigation links for mobile
        const navLinks = document.querySelectorAll('.nav a');
        navLinks.forEach(link => {
            const clonedLink = link.cloneNode(true);
            // Remove any existing active classes
            clonedLink.classList.remove('active');
            mobileNav.appendChild(clonedLink);
        });

        // Add to DOM
        document.body.appendChild(mobileNav);
        document.body.appendChild(mobileNavOverlay);

        // Toggle mobile menu
        mobileMenu.addEventListener('click', function() {
            const isOpen = this.classList.toggle('open');
            mobileNav.classList.toggle('active');
            mobileNavOverlay.classList.toggle('active');
            document.body.style.overflow = isOpen ? 'hidden' : '';
            
            // Update aria-expanded for accessibility
            this.setAttribute('aria-expanded', isOpen);
        });

        // Close mobile menu when clicking overlay
        mobileNavOverlay.addEventListener('click', function() {
            mobileMenu.classList.remove('open');
            mobileNav.classList.remove('active');
            this.classList.remove('active');
            document.body.style.overflow = '';
            mobileMenu.setAttribute('aria-expanded', 'false');
        });

        // Close mobile menu when clicking a link
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.remove('open');
                mobileNav.classList.remove('active');
                mobileNavOverlay.classList.remove('active');
                document.body.style.overflow = '';
                mobileMenu.setAttribute('aria-expanded', 'false');
            });
        });

        // Close mobile menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
                mobileMenu.classList.remove('open');
                mobileNav.classList.remove('active');
                mobileNavOverlay.classList.remove('active');
                document.body.style.overflow = '';
                mobileMenu.setAttribute('aria-expanded', 'false');
            }
        });
    }
    
    // Safe loading screen handler
    function handleLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        
        // If GSAP is available, use it for animations
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            try {
                gsap.registerPlugin(ScrollTrigger);
                
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
                            if (loadingScreen) {
                                loadingScreen.style.display = 'none';
                            }
                            initMainAnimations();
                        }
                    });
            } catch (e) {
                console.warn('GSAP animation failed, using fallback:', e);
                if (loadingScreen) {
                    loadingScreen.style.display = 'none';
                }
                initMainAnimations();
            }
        } else {
            // GSAP not available - immediate fallback
            console.warn('GSAP not available, using fallback loading');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
            initMainAnimations();
        }
    }
    
    // Start loading process
    handleLoadingScreen();

    function initMainAnimations() {
        console.log('Initializing main animations');
        
        // Initialize mobile menu
        initMobileMenu();
        
        // Initialize contact form
        initContactForm();
        
        // Safe GSAP animations with fallbacks
        if (typeof gsap !== 'undefined') {
            try {
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


                // --- 3. Scroll Progress Bar ---
                if (typeof ScrollTrigger !== 'undefined') {
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
                }

                // --- 4. Custom Cursor Logic (Only for non-touch devices) ---
                if (!isTouchDevice) {
                    const cursorDot = document.getElementById('cursorDot');
                    const cursorRing = document.getElementById('cursorRing');
                    
                    if (cursorDot && cursorRing) {
                        gsap.set([cursorDot, cursorRing], { opacity: 1 });

                        document.addEventListener('mousemove', (e) => {
                            gsap.to(cursorDot, { duration: 0.2, x: e.clientX, y: e.clientY });
                            gsap.to(cursorRing, { duration: 0.7, x: e.clientX, y: e.clientY });
                        });

                        // Handle hover states
                        document.querySelectorAll('a, button, .service-card, .why-us-card, .pricing-card').forEach(el => {
                            el.addEventListener('mouseenter', () => cursorRing.classList.add('grow'));
                            el.addEventListener('mouseleave', () => cursorRing.classList.remove('grow'));
                        });
                    }
                }

                // --- 6. ScrollTrigger Section Reveal (General) ---
                if (typeof ScrollTrigger !== 'undefined') {
                    gsap.utils.toArray(".content-section").forEach(section => {
                        gsap.from(section.querySelectorAll(".section-header, .services-grid > *, .why-us-grid > *, .pricing-grid > *, .testimonials-grid > *, .contact-container"), {
                            opacity: 0,
                            y: 50,
                            stagger: 0.1,
                            duration: 1.0,
                            ease: "power3.out",
                            scrollTrigger: {
                                trigger: section,
                                start: "top 85%",
                                toggleActions: "play none none none"
                            }
                        });
                    });
                }

            } catch (e) {
                console.warn('GSAP animations failed:', e);
                initFallbackAnimations();
            }
        } else {
            // GSAP not available at all
            initFallbackAnimations();
        }
        
        // --- 7. Smooth Scrolling ---
        document.querySelectorAll('.nav a[href^="#"], .hero-cta a[href^="#"], .mobile-nav a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const target = document.querySelector(targetId);
                
                if (target) {
                    const header = document.getElementById('header');
                    const yOffset = header ? header.offsetHeight + 20 : 20;
                    const y = target.getBoundingClientRect().top + window.pageYOffset - yOffset;
                    
                    window.scrollTo({
                        top: y,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        // --- 8. Active Navigation ---
        initActiveNavigation();
        
        console.log('All animations initialized');
    }
    
    // NEW: Contact Form Handler with Resend API
    function initContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;

        const submitBtn = contactForm.querySelector('.form-submit');
        const formMessage = document.getElementById('formMessage');

        // Real-time validation
        const fields = ['name', 'email', 'businessType', 'serviceInterest', 'message'];
        
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.addEventListener('blur', validateField);
                element.addEventListener('input', clearFieldError);
            }
        });

        function validateField(e) {
            const field = e.target;
            const errorElement = document.getElementById(field.id + 'Error');
            
            clearFieldError(e);

            if (field.required && !field.value.trim()) {
                showFieldError(field, errorElement, 'This field is required');
                return false;
            }

            if (field.type === 'email' && field.value.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(field.value.trim())) {
                    showFieldError(field, errorElement, 'Please enter a valid work email address');
                    return false;
                }
            }

            if (field.tagName === 'SELECT' && field.required && !field.value) {
                showFieldError(field, errorElement, 'Please select an option');
                return false;
            }

            return true;
        }

        function showFieldError(field, errorElement, message) {
            field.style.borderColor = '#e74c3c';
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }

        function clearFieldError(e) {
            const field = e.target;
            const errorElement = document.getElementById(field.id + 'Error');
            field.style.borderColor = '';
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }

        function validateForm() {
            let isValid = true;
            let firstErrorField = null;
            
            fields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                const errorElement = document.getElementById(fieldId + 'Error');
                
                if (field.required && !field.value.trim()) {
                    showFieldError(field, errorElement, 'This field is required');
                    isValid = false;
                    if (!firstErrorField) firstErrorField = field;
                } else if (field.type === 'email' && field.value.trim()) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(field.value.trim())) {
                        showFieldError(field, errorElement, 'Please enter a valid work email address');
                        isValid = false;
                        if (!firstErrorField) firstErrorField = field;
                    }
                } else if (field.tagName === 'SELECT' && field.required && !field.value) {
                    showFieldError(field, errorElement, 'Please select an option');
                    isValid = false;
                    if (!firstErrorField) firstErrorField = field;
                }
            });

            // Scroll to first error
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstErrorField.focus();
            }

            return isValid;
        }

        function showMessage(message, type) {
            formMessage.textContent = message;
            formMessage.className = `form-message ${type}`;
            formMessage.style.display = 'block';
            
            // Scroll to message
            formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            // Auto-hide success messages after 8 seconds
            if (type === 'success') {
                setTimeout(() => {
                    formMessage.style.display = 'none';
                }, 8000);
            }
        }

        // Form submission
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate all fields
            if (!validateForm()) {
                showMessage('Please fix the errors above before submitting.', 'error');
                return;
            }

            // Disable submit button and show loading state
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            submitBtn.style.opacity = '0.7';
            formMessage.style.display = 'none';

            try {
                // Get form data including honey pot
                const formData = {
                    name: document.getElementById('name').value.trim(),
                    email: document.getElementById('email').value.trim(),
                    businessType: document.getElementById('businessType').value,
                    serviceInterest: document.getElementById('serviceInterest').value,
                    message: document.getElementById('message').value.trim(),
                    company_name: document.getElementById('company_name')?.value || '' // Honey pot field
                };

                console.log('Sending form data to Resend API...');

                // Send to Resend API
                const response = await fetch('https://sani-solutions.vercel.app/api/send-email' {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok) {
                    // Success
                    showMessage('Thank you! Your consultation request has been sent successfully. We\'ll get back to you within 24 hours.', 'success');
                    contactForm.reset();
                } else {
                    // Error from API
                    console.error('API Error:', result);
                    showMessage(result.error || 'Sorry, there was an error sending your message. Please try again.', 'error');
                }
            } catch (error) {
                // Network error
                console.error('Network Error:', error);
                showMessage('Network error. Please check your internet connection and try again.', 'error');
            } finally {
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                submitBtn.style.opacity = '1';
            }
        });

        // Add input styling for better UX
        const inputs = contactForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.style.borderColor = '#007bff';
                this.style.boxShadow = '0 0 0 2px rgba(0, 123, 255, 0.25)';
            });
            
            input.addEventListener('blur', function() {
                this.style.boxShadow = '';
            });
        });
    }
    
    function initFallbackAnimations() {
        console.log('Using fallback animations');
        
        // Initialize mobile menu for fallback too
        initMobileMenu();
        
        // Initialize contact form
        initContactForm();
        
        // Basic scroll progress without GSAP
        const scrollProgress = document.getElementById('scrollProgress');
        if (scrollProgress) {
            window.addEventListener('scroll', function() {
                const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = (window.scrollY / windowHeight) * 100;
                scrollProgress.style.width = scrolled + '%';
            });
        }
        
        // Basic header scroll effect
        const header = document.getElementById('header');
        if (header) {
            window.addEventListener('scroll', function() {
                if (window.scrollY > 100) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });
        }
        
        // Hide custom cursor on touch devices
        if (isTouchDevice) {
            const cursorDot = document.getElementById('cursorDot');
            const cursorRing = document.getElementById('cursorRing');
            if (cursorDot) cursorDot.style.display = 'none';
            if (cursorRing) cursorRing.style.display = 'none';
        }
    }
    
    function initActiveNavigation() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav a:not(.btn-header-cta)');
        const mobileNavLinks = document.querySelectorAll('.mobile-nav a:not(.btn-header-cta)');
        
        function updateActiveNav() {
            let current = '';
            const header = document.getElementById('header');
            const headerHeight = header ? header.offsetHeight : 0;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (window.pageYOffset >= sectionTop - headerHeight - 50) {
                    current = section.getAttribute('id');
                }
            });
            
            // Update desktop navigation
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
            
            // Update mobile navigation
            mobileNavLinks.forEach(link => {
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
    
    // Handle window resize for responsive behavior
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            // Close mobile menu on resize to larger screens
            if (window.innerWidth > 768) {
                const mobileMenu = document.getElementById('mobileMenu');
                const mobileNav = document.querySelector('.mobile-nav');
                const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
                
                if (mobileMenu && mobileNav && mobileNavOverlay) {
                    mobileMenu.classList.remove('open');
                    mobileNav.classList.remove('active');
                    mobileNavOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                    mobileMenu.setAttribute('aria-expanded', 'false');
                }
            }
        }, 250);
    });
});

