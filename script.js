// ===== DOM Elements =====
let navbar, hamburger, navMenu, contactForm, navDropdowns;

// ===== Initialize DOM Elements =====
function initializeDOMElements() {
    navbar = document.getElementById('navbar');
    hamburger = document.getElementById('hamburger');
    navMenu = document.querySelector('.nav-menu');
    contactForm = document.getElementById('contactForm');
    navDropdowns = document.querySelectorAll('.nav-dropdown');
}

// ===== Navigation Scroll Effect =====
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar && window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else if (navbar) {
        navbar.classList.remove('scrolled');
    }
});

// ===== Enhanced Mobile Menu Toggle =====
function initMobileMenuToggle() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            const isOpen = hamburger.classList.contains('active');

            // Toggle hamburger and menu
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');

            // Add device-specific behaviors
            if (deviceDetector) {
                const interactionMode = deviceDetector.getInteractionMode();

                // For tablets, also close any open dropdowns when opening mobile menu
                if (interactionMode === 'hybrid' && !isOpen) {
                    document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
                        dropdown.classList.remove('active', 'touch-active');
                    });
                }
            }
        });
    }

    // Enhanced scroll listener to close mobile menu
    let isScrolling = false;
    window.addEventListener('scroll', () => {
        if (deviceDetector) {
            const shouldCloseOnScroll = deviceDetector.isMobile ||
                (deviceDetector.isTablet && deviceDetector.hasTouch);

            if (shouldCloseOnScroll && hamburger && hamburger.classList.contains('active')) {
                if (!isScrolling) {
                    isScrolling = true;
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');

                    // Reset flag after scroll ends
                    setTimeout(() => {
                        isScrolling = false;
                    }, 150);
                }
            }
        } else {
            // Fallback to original logic if device detector not initialized
            if (window.innerWidth <= 768 && hamburger && hamburger.classList.contains('active')) {
                if (!isScrolling) {
                    isScrolling = true;
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                    setTimeout(() => {
                        isScrolling = false;
                    }, 150);
                }
            }
        }
    }, { passive: true });

    // Close menu when clicking outside on mobile/tablet
    document.addEventListener('click', (e) => {
        if (deviceDetector && (deviceDetector.isMobile || deviceDetector.isTablet)) {
            if (!e.target.closest('.navbar') && hamburger && hamburger.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        }
    });

    // Handle window resize - close mobile menu if switching to desktop
    window.addEventListener('resize', () => {
        let resizeTimer;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (deviceDetector && deviceDetector.isDesktop && hamburger && hamburger.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        }, 150);
    });
}

// Mobile menu toggle will be initialized by initializeAllFeatures()

// ===== Device Capability Detector =====
class DeviceCapabilityDetector {
    constructor() {
        this.updateCapabilities();
        this.setupResizeListener();
    }

    updateCapabilities() {
        const width = window.innerWidth;

        // Determine device category based on our 6-breakpoint system
        if (width <= 475) {
            this.deviceCategory = 'nano-mobile';
            this.isMobile = true;
            this.isTablet = false;
            this.isDesktop = false;
        } else if (width <= 768) {
            this.deviceCategory = 'small-mobile';
            this.isMobile = true;
            this.isTablet = false;
            this.isDesktop = false;
        } else if (width <= 1024) {
            this.deviceCategory = 'tablet';
            this.isMobile = false;
            this.isTablet = true;
            this.isDesktop = false;
        } else if (width <= 1366) {
            this.deviceCategory = 'small-laptop';
            this.isMobile = false;
            this.isTablet = false;
            this.isDesktop = true;
        } else if (width <= 1920) {
            this.deviceCategory = 'standard-desktop';
            this.isMobile = false;
            this.isTablet = false;
            this.isDesktop = true;
        } else {
            this.deviceCategory = 'large-desktop';
            this.isMobile = false;
            this.isTablet = false;
            this.isDesktop = true;
        }

        // Detect input capabilities
        this.hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this.hasFinePointer = window.matchMedia('(pointer: fine)').matches;
        this.hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
        this.supportsHover = window.matchMedia('(hover: hover)').matches;

        // Tablet-specific: hybrid interaction support
        this.isHybridTablet = this.isTablet && this.hasTouch && this.hasFinePointer;

        // Add device classes to body for CSS targeting (if unified detector is not present)
        this.updateBodyClasses();
    }

    updateBodyClasses() {
        // Check if unified device detector is managing body classes
        if (window.UnifiedDeviceDetector && window.unifiedDeviceDetector) {
            return; // Skip body class management - unified detector handles it
        }

        document.body.classList.remove('device-mobile', 'device-tablet', 'device-desktop',
                                     'device-touch', 'device-hover', 'device-hybrid');

        if (this.isMobile) document.body.classList.add('device-mobile');
        if (this.isTablet) document.body.classList.add('device-tablet');
        if (this.isDesktop) document.body.classList.add('device-desktop');
        if (this.hasTouch) document.body.classList.add('device-touch');
        if (this.supportsHover) document.body.classList.add('device-hover');
        if (this.isHybridTablet) document.body.classList.add('device-hybrid');
    }

    setupResizeListener() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.updateCapabilities();
            }, 150);
        });
    }

    // Get interaction mode for dropdowns
    getInteractionMode() {
        if (this.isMobile) {
            return 'touch-only';
        } else if (this.isHybridTablet) {
            return 'hybrid'; // Both touch and hover
        } else if (this.isDesktop) {
            return 'hover-only';
        }
        return 'touch-only';
    }
}

// Global device detector instance
let deviceDetector;

// ===== Enhanced Dropdown Menu Interactive =====
function initDropdownMenus() {
    const navDropdowns = document.querySelectorAll('.nav-dropdown');

    // Initialize device detector if not already done
    if (!deviceDetector) {
        deviceDetector = new DeviceCapabilityDetector();
    }

    navDropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');

        // Handle click interactions for mobile and tablet touch
        if (toggle) {
            toggle.addEventListener('click', (e) => {
                const interactionMode = deviceDetector.getInteractionMode();

                if (interactionMode === 'touch-only' || interactionMode === 'hybrid') {
                    e.preventDefault();

                    // For hybrid tablets, toggle differently
                    if (interactionMode === 'hybrid') {
                        // On tablets, clicking toggle should close other dropdowns
                        navDropdowns.forEach(otherDropdown => {
                            if (otherDropdown !== dropdown) {
                                otherDropdown.classList.remove('active');
                                otherDropdown.classList.remove('touch-active');
                            }
                        });

                        // Add touch-active class for tablet-specific styling
                        dropdown.classList.toggle('active');
                        dropdown.classList.toggle('touch-active');
                    } else {
                        // Mobile: simple toggle
                        dropdown.classList.toggle('active');
                    }
                }
            });
        }

        // Handle mouse interactions for desktop and tablet hover
        dropdown.addEventListener('mouseenter', () => {
            const interactionMode = deviceDetector.getInteractionMode();

            if (interactionMode === 'hover-only' || interactionMode === 'hybrid') {
                // Close other dropdowns first
                navDropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        otherDropdown.classList.remove('active');
                        otherDropdown.classList.remove('touch-active');
                    }
                });
                dropdown.classList.add('active');
            }
        });

        dropdown.addEventListener('mouseleave', () => {
            const interactionMode = deviceDetector.getInteractionMode();

            if (interactionMode === 'hover-only' || interactionMode === 'hybrid') {
                // For hybrid tablets, don't remove if touch-active
                if (interactionMode === 'hybrid' && dropdown.classList.contains('touch-active')) {
                    return; // Keep open if touch-activated on tablet
                }
                dropdown.classList.remove('active');
            }
        });

        // Handle touch interactions for tablets
        dropdown.addEventListener('touchstart', (e) => {
            const interactionMode = deviceDetector.getInteractionMode();

            if (interactionMode === 'hybrid') {
                // Add touch feedback for tablets
                dropdown.style.transform = 'scale(0.98)';
            }
        }, { passive: true });

        dropdown.addEventListener('touchend', (e) => {
            const interactionMode = deviceDetector.getInteractionMode();

            if (interactionMode === 'hybrid') {
                setTimeout(() => {
                    dropdown.style.transform = '';
                }, 150);
            }
        }, { passive: true });
    });

    // Enhanced click outside handling
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-dropdown')) {
            const interactionMode = deviceDetector.getInteractionMode();

            navDropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
                if (interactionMode === 'hybrid') {
                    dropdown.classList.remove('touch-active');
                }
            });
        }
    });

    // Close dropdowns on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            navDropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
                dropdown.classList.remove('touch-active');
            });
        }
    });
}

// Dropdown menus will be initialized by initializeAllFeatures()

// ===== Service Button Unified Handler =====
function handleServiceButtonClick(e) {
    e.preventDefault();

    // For buttons that are links, let the link work normally
    if (e.target.tagName === 'A' && e.target.href) {
        // If it's a link to a service page, navigate normally
        window.location.href = e.target.href;
        return;
    }

    // For buttons that are not links, handle as before
    const serviceCard = e.target.closest('.service-card');
    const serviceType = serviceCard.dataset.service;

    const contactSection = document.getElementById('contact');
    const serviceSelect = document.getElementById('service');

    if (contactSection && serviceSelect) {
        serviceSelect.value = serviceType;
        contactSection.scrollIntoView({ behavior: 'smooth' });
        serviceSelect.style.borderColor = '#3b82f6';
        setTimeout(() => {
            serviceSelect.style.borderColor = '';
        }, 2000);
    }
}

// ===== Mobile-Optimized Service Cards =====
function initMobileServiceCards() {
    const serviceCards = document.querySelectorAll('.service-card');

    serviceCards.forEach(card => {
        // Add touch feedback for mobile
        card.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });

        card.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });

        // Add visual feedback for click
        card.addEventListener('click', function() {
            // Remove active class from all cards
            serviceCards.forEach(c => c.classList.remove('active'));
            // Add active class to clicked card
            this.classList.add('active');

            // Remove active class after animation
            setTimeout(() => {
                this.classList.remove('active');
            }, 300);
        });
    });
}

// ===== Smooth Scroll for Navigation Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80; // Account for fixed navbar
            const targetPosition = target.offsetTop - offset;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            const hamburger = document.getElementById('hamburger');
            const navMenu = document.querySelector('.nav-menu');
            if (hamburger) hamburger.classList.remove('active');
            if (navMenu) navMenu.classList.remove('active');
        }
    });
});

// ===== Contact Form Handling =====
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);

        // Basic validation
        if (!data.name || !data.email || !data.service) {
            alert('请填写必填字段：姓名、邮箱和咨询类型');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            alert('请输入有效的邮箱地址');
            return;
        }

        // Show success message
        alert('感谢您的咨询！我们会在24小时内回复您的邮件。\n\n我们会尽快安排专业顾问与您联系。');

        // Reset form
        contactForm.reset();

        // In a real implementation, you would send this data to a server
        // console.log('Form submitted:', data);

        // Example of sending to a server (commented out):
        /*
        fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            alert('感谢您的咨询！我们会在24小时内回复。');
            contactForm.reset();
        })
        .catch(error => {
            alert('提交失败，请稍后重试。');
            console.error('Error:', error);
        });
        */
    });
}

// ===== Service Card Animations =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe service cards
document.querySelectorAll('.service-card').forEach(card => {
    observer.observe(card);
});

// ===== Timeline Animation on Scroll =====
const timelineItems = document.querySelectorAll('.timeline-item');
const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('animate-in');
            }, index * 100);
        }
    });
}, observerOptions);

timelineItems.forEach(item => {
    timelineObserver.observe(item);
});

// ===== Number Counting Animation =====
const animateCounter = (element, target, duration = 2000) => {
    let start = 0;
    const increment = target / (duration / 16);

    const updateCounter = () => {
        start += increment;
        if (start < target) {
            element.textContent = Math.ceil(start) + (element.textContent.includes('+') ? '+' : '');
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + (element.textContent.includes('+') ? '+' : '');
        }
    };

    updateCounter();
};

// Observe stats for counter animation
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            entry.target.classList.add('counted');
            const statNumber = entry.target.querySelector('.stat-number');
            if (statNumber) {
                const text = statNumber.textContent;
                const number = parseInt(text);
                animateCounter(statNumber, number);
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-item').forEach(stat => {
    statsObserver.observe(stat);
});

// ===== Hero Animation =====
window.addEventListener('load', () => {
    // Animate hero elements on load
    const heroText = document.querySelector('.hero-text');
    const heroVisual = document.querySelector('.hero-visual');

    if (heroText) {
        heroText.style.opacity = '0';
        heroText.style.transform = 'translateX(-50px)';

        setTimeout(() => {
            heroText.style.transition = 'all 1s ease-out';
            heroText.style.opacity = '1';
            heroText.style.transform = 'translateX(0)';
        }, 300);
    }

    if (heroVisual) {
        heroVisual.style.opacity = '0';
        heroVisual.style.transform = 'translateX(50px)';

        setTimeout(() => {
            heroVisual.style.transition = 'all 1s ease-out';
            heroVisual.style.opacity = '1';
            heroVisual.style.transform = 'translateX(0)';
        }, 500);
    }
});

// ===== Service Button Event Binding =====
document.querySelectorAll('.service-btn').forEach(btn => {
    btn.addEventListener('click', handleServiceButtonClick);
});

// ===== Knowledge Link Click Handlers =====
document.querySelectorAll('.knowledge-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();

        // In a real implementation, this would navigate to the knowledge base
        alert('知识库功能正在建设中，敬请期待！');
    });
});

// ===== WeChat QR Code Click Handler =====
document.querySelectorAll('.qr-placeholder').forEach(qr => {
    qr.addEventListener('click', () => {
        alert('请扫描微信二维码添加客服微信');
    });
});

// ===== Parallax Effect for Hero Background =====
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');

    if (hero && heroContent) {
        const speed = 0.5;
        hero.style.transform = `translateY(${scrolled * speed}px)`;
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});

// ===== Form Input Effects =====
document.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
    });

    input.addEventListener('blur', () => {
        if (!input.value) {
            input.parentElement.classList.remove('focused');
        }
    });
});

// ===== Add CSS animation classes dynamically =====
const style = document.createElement('style');
style.textContent = `
    .service-card {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease-out;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
    }

    .service-card.animate-in {
        opacity: 1;
        transform: translateY(0);
    }

    .service-card:active {
        transform: translateY(-2px) scale(0.98);
    }

    .service-card.active {
        transform: translateY(-5px);
        box-shadow: 0 15px 35px rgba(59, 130, 246, 0.3);
        border: 2px solid #3b82f6;
    }

    .timeline-item {
        opacity: 0;
        transform: translateX(-30px);
        transition: all 0.6s ease-out;
    }

    .timeline-item.animate-in {
        opacity: 1;
        transform: translateX(0);
    }

    .timeline-item:nth-child(even) {
        transform: translateX(30px);
    }

    .timeline-item:nth-child(even).animate-in {
        transform: translateX(0);
    }

    .focused label {
        color: #3b82f6;
        transform: translateY(-25px);
        font-size: 0.875rem;
        background: white;
        padding: 0 8px;
    }

    .form-group {
        position: relative;
    }

    .floating-icons .icon-item {
        animation-duration: 3s;
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .animate-fade-in {
        animation: fadeInUp 0.6s ease-out forwards;
    }
`;

document.head.appendChild(style);

// ===== Add hover effects to cards (desktop only) =====
document.querySelectorAll('.service-card, .knowledge-card, .feature-card').forEach(card => {
    // Only add hover effects on devices that support hover (not mobile)
    if (window.matchMedia('(hover: hover)').matches) {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px) scale(1.02)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    }
});

// ===== Initialize page animations =====
document.addEventListener('DOMContentLoaded', () => {
    // Add fade-in animation to sections
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';

        setTimeout(() => {
            section.style.transition = 'all 0.6s ease-out';
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, index * 200);
    });
});

// ===== Unified Initialization =====
function initializeAllFeatures() {
    // Initialize DOM elements first
    initializeDOMElements();

    // Check if unified device detector is available (from unified-device-detector.js)
    if (window.UnifiedDeviceDetector && window.unifiedDeviceDetector) {
        // Use unified device detector data
        deviceDetector = {
            isMobile: window.unifiedDeviceDetector.deviceState.isMobile,
            isTablet: window.unifiedDeviceDetector.deviceState.isTablet,
            isDesktop: window.unifiedDeviceDetector.deviceState.isDesktop,
            hasTouch: window.unifiedDeviceDetector.deviceState.hasTouch,
            getInteractionMode: function() {
                if (this.isMobile) return 'touch-only';
                if (this.isTablet && this.hasTouch) return 'hybrid';
                return 'mouse-only';
            }
        };
    } else {
        // Fallback to local device detector
        if (!deviceDetector) {
            deviceDetector = new DeviceCapabilityDetector();
        }
    }

    // Initialize all features that depend on DOM elements
    initMobileMenuToggle();
    initDropdownMenus();
    initContactForm();
    initMobileServiceCards();

    // Initialize with delay for component system
    setTimeout(() => {
        initMobileMenuToggle();
        initDropdownMenus();
        initContactForm();
    }, 100);

    // Second delay for safety
    setTimeout(() => {
        initMobileMenuToggle();
        initDropdownMenus();
        initContactForm();
    }, 500);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAllFeatures);
} else {
    initializeAllFeatures();
}

// ===== Console branding =====
// console.log('%c🌉 Mobius Bridge - 中日企业无缝连接桥梁', 'font-size: 20px; font-weight: bold; color: #3b82f6;');
// console.log('%cConnecting opportunities between China and Japan', 'font-size: 14px; color: #dc2626;');
// console.log('%c🚀 Start your Japanese business journey with us!', 'font-size: 12px; color: #64748b;');