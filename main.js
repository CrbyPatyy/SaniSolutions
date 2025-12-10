// Safe JavaScript with GSAP fallback
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded - initializing');

    // Global error handler
    window.addEventListener('error', function (e) {
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
        mobileMenu.addEventListener('click', function () {
            const isOpen = this.classList.toggle('open');
            mobileNav.classList.toggle('active');
            mobileNavOverlay.classList.toggle('active');
            document.body.style.overflow = isOpen ? 'hidden' : '';

            // Update aria-expanded for accessibility
            this.setAttribute('aria-expanded', isOpen);
        });

        // Close mobile menu when clicking overlay
        mobileNavOverlay.addEventListener('click', function () {
            mobileMenu.classList.remove('open');
            mobileNav.classList.remove('active');
            this.classList.remove('active');
            document.body.style.overflow = '';
            mobileMenu.setAttribute('aria-expanded', 'false');
        });

        // Close mobile menu when clicking a link
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function () {
                mobileMenu.classList.remove('open');
                mobileNav.classList.remove('active');
                mobileNavOverlay.classList.remove('active');
                document.body.style.overflow = '';
                mobileMenu.setAttribute('aria-expanded', 'false');
            });
        });

        // Close mobile menu on escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
                mobileMenu.classList.remove('open');
                mobileNav.classList.remove('active');
                mobileNavOverlay.classList.remove('active');
                document.body.style.overflow = '';
                mobileMenu.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Safe loading screen handler (FIXED - No scroll jump)
    function handleLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        let animationsInitialized = false;

        // Keep page at top during load
        window.scrollTo(0, 0);

        function initializeAnimations() {
            if (animationsInitialized) return;
            animationsInitialized = true;
            console.log('Initializing main animations');
            initMainAnimations();
        }

        if (!loadingScreen) {
            console.log('No loading screen found, proceeding directly');
            initializeAnimations();
            return;
        }

        // Lock scrolling while the loader is visible
        document.body.style.overflow = 'hidden';

        // Simple timeout fallback - if GSAP fails or takes too long
        const fallbackTimeout = setTimeout(() => {
            console.log('Fallback: Hiding loading screen after timeout');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
            document.body.style.overflow = '';
            initializeAnimations();
        }, 3000); // 3 second fallback

        // If GSAP is available, use it for animations
        if (typeof gsap !== 'undefined') {
            try {
                console.log('Using GSAP for loading animation');
                // Wait a minimum time to ensure loader is visible
                setTimeout(() => {
                    gsap.to(loadingScreen, {
                        opacity: 0,
                        duration: 0.5,
                        ease: 'power2.out',
                        onComplete: () => {
                            clearTimeout(fallbackTimeout);
                            if (loadingScreen) {
                                loadingScreen.style.display = 'none';
                            }
                            document.body.style.overflow = '';
                            window.scrollTo(0, 0);
                            console.log('GSAP loading complete');
                            initializeAnimations();
                        }
                    });
                }, 500); // Minimum 1 second show time
            } catch (e) {
                console.warn('GSAP animation failed, using fallback:', e);
                clearTimeout(fallbackTimeout);
                if (loadingScreen) {
                    loadingScreen.style.display = 'none';
                }
                document.body.style.overflow = '';
                initializeAnimations();
            }
        } else {
            // GSAP not available - use CSS transition
            console.log('GSAP not available, using CSS transition');
            clearTimeout(fallbackTimeout);
            setTimeout(() => {
                if (loadingScreen) {
                    loadingScreen.style.opacity = '0';
                }
                setTimeout(() => {
                    if (loadingScreen) {
                        loadingScreen.style.display = 'none';
                    }
                    document.body.style.overflow = '';
                    window.scrollTo(0, 0);
                    initializeAnimations();
                }, 500);
            }, 500);
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

                    // Enhanced smooth scroll with better easing
                    window.scrollTo({
                        top: y,
                        behavior: 'smooth',
                        block: 'start'
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
        contactForm.addEventListener('submit', async function (e) {
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
                const response = await fetch('/api/send-email', {
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
            input.addEventListener('focus', function () {
                this.style.borderColor = '#007bff';
                this.style.boxShadow = '0 0 0 2px rgba(0, 123, 255, 0.25)';
            });

            input.addEventListener('blur', function () {
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
            window.addEventListener('scroll', function () {
                const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = (window.scrollY / windowHeight) * 100;
                scrollProgress.style.width = scrolled + '%';
            });
        }

        // Smart header - hide on scroll down, show on scroll up
        const header = document.getElementById('header');
        if (header) {
            let lastScrollY = window.scrollY;
            let ticking = false;

            window.addEventListener('scroll', function () {
                if (!ticking) {
                    window.requestAnimationFrame(function () {
                        const currentScrollY = window.scrollY;

                        // Add scrolled class for background
                        if (currentScrollY > 100) {
                            header.classList.add('scrolled');
                        } else {
                            header.classList.remove('scrolled');
                        }

                        // Hide/show based on scroll direction
                        if (currentScrollY > lastScrollY && currentScrollY > 100) {
                            // Scrolling down - hide header
                            header.classList.add('header-hidden');
                        } else {
                            // Scrolling up - show header
                            header.classList.remove('header-hidden');
                        }

                        lastScrollY = currentScrollY;
                        ticking = false;
                    });
                    ticking = true;
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

    // Animated Counter for Statistics
    function initCounters() {
        const counters = document.querySelectorAll('.stat-number[data-target]');

        const options = {
            threshold: 0.5,
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = +counter.getAttribute('data-target');
                    const duration = 2000; // 2 seconds
                    const increment = target / (duration / 16); // 60fps
                    let current = 0;

                    const updateCounter = () => {
                        current += increment;
                        if (current < target) {
                            counter.textContent = Math.floor(current).toLocaleString();
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.textContent = target.toLocaleString();
                        }
                    };

                    updateCounter();
                    observer.unobserve(counter);
                }
            });
        }, options);

        counters.forEach(counter => observer.observe(counter));
    }

    // Initialize counters after page load
    if (document.querySelector('.stat-number[data-target]')) {
        initCounters();
    }

    // ========== SCROLL-TRIGGERED ANIMATIONS ==========
    function initScrollAnimations() {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            console.log('Reduced motion preferred, skipping scroll animations');
            return;
        }

        // Elements to animate on scroll
        const animationConfig = [
            // Section headers - fade up
            { selector: '.section-header', animationClass: 'scroll-animate' },
            // Service cards - staggered fade up
            { selector: '.service-card', animationClass: 'scroll-animate' },
            // Why us cards - staggered fade up
            { selector: '.why-us-card', animationClass: 'scroll-animate' },
            // Process steps - staggered fade up
            { selector: '.process-step', animationClass: 'scroll-animate' },
            // About section - slide animations
            { selector: '.about-text', animationClass: 'scroll-animate-left' },
            { selector: '.about-image', animationClass: 'scroll-animate-right' },
            // Testimonials - scale up
            { selector: '.testimonial', animationClass: 'scroll-animate-scale' },
            // FAQ items - fade up
            { selector: '.faq-item', animationClass: 'scroll-animate' },
            // Contact section
            { selector: '.contact-info', animationClass: 'scroll-animate-left' },
            { selector: '.contact-form-container', animationClass: 'scroll-animate-right' },
            // Trust badges
            { selector: '.trust-badges', animationClass: 'scroll-animate' },
            { selector: '.badge-item', animationClass: 'scroll-animate-scale' }
        ];

        // Add animation classes to elements
        animationConfig.forEach(config => {
            document.querySelectorAll(config.selector).forEach((el, index) => {
                el.classList.add(config.animationClass);
                // Add stagger delay for grid items
                if (['service-card', 'why-us-card', 'process-step', 'testimonial', 'faq-item', 'badge-item'].some(c => el.classList.contains(c))) {
                    el.style.transitionDelay = `${index * 0.1}s`;
                }
            });
        });

        // Create Intersection Observer for fade-in animations
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -80px 0px', // Trigger slightly before element enters viewport
            threshold: 0.1
        };

        const animateOnScroll = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    // Optionally unobserve after animation
                    // animateOnScroll.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all animated elements
        document.querySelectorAll('.scroll-animate, .scroll-animate-left, .scroll-animate-right, .scroll-animate-scale').forEach(el => {
            animateOnScroll.observe(el);
        });

        console.log('Scroll animations initialized');
    }

    // ========== PARALLAX EFFECT ==========
    function initParallaxEffects() {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        // Add parallax class to section headers
        document.querySelectorAll('.section-header').forEach(header => {
            header.classList.add('parallax-header');
        });

        // Add floating animation to about image
        const aboutImage = document.querySelector('.about-image img');
        if (aboutImage) {
            aboutImage.classList.add('float-animation');
        }

        // Smooth parallax on scroll (subtle effect)
        let ticking = false;

        function updateParallax() {
            const scrolled = window.pageYOffset;

            // Parallax for section headers (very subtle - moves slower than scroll)
            document.querySelectorAll('.parallax-header').forEach(header => {
                const rect = header.getBoundingClientRect();
                const centerOffset = rect.top + rect.height / 2 - window.innerHeight / 2;
                // Very subtle movement: divide by large number for smooth effect
                const parallaxOffset = centerOffset * 0.03;
                header.style.transform = `translateY(${parallaxOffset}px)`;
            });

            // Parallax for service icons (slight upward float effect)
            document.querySelectorAll('.service-icon, .feature-icon, .process-icon').forEach(icon => {
                const rect = icon.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    const centerOffset = rect.top - window.innerHeight / 2;
                    const parallaxOffset = centerOffset * -0.02;
                    icon.style.transform = `translateY(${parallaxOffset}px)`;
                }
            });

            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });

        console.log('Parallax effects initialized');
    }

    // Initialize scroll animations after a short delay (let page settle)
    setTimeout(() => {
        initScrollAnimations();
        initParallaxEffects();
    }, 100);

    // Handle window resize for responsive behavior
    let resizeTimeout;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () {
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
// FAQ Accordion
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle current item
            if (isActive) {
                item.classList.remove('active');
            } else {
                item.classList.add('active');
            }
        });

        // Keyboard accessibility
        question.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                question.click();
            }
        });

        // Make focusable
        question.setAttribute('tabindex', '0');
        question.setAttribute('role', 'button');
        question.setAttribute('aria-expanded', 'false');

        // Update aria-expanded on toggle
        const observer = new MutationObserver(() => {
            const isActive = item.classList.contains('active');
            question.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        });

        observer.observe(item, { attributes: true, attributeFilter: ['class'] });
    });
}

// Initialize FAQ
if (document.querySelector('.faq-item')) {
    initFAQ();
}
