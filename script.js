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

// ===== Mobile Menu Toggle =====
function initMobileMenuToggle() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
}

// Mobile menu toggle will be initialized by initializeAllFeatures()

// ===== Dropdown Menu Interactive =====
function initDropdownMenus() {
    const navDropdowns = document.querySelectorAll('.nav-dropdown');

    navDropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');

        // Click to toggle dropdown on mobile
        if (toggle) {
            toggle.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                }
            });
        }

        // Handle mouse enter/leave for desktop
        dropdown.addEventListener('mouseenter', () => {
            if (window.innerWidth > 768) {
                // Close other dropdowns
                document.querySelectorAll('.nav-dropdown').forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        otherDropdown.classList.remove('active');
                    }
                });
                dropdown.classList.add('active');
            }
        });

        dropdown.addEventListener('mouseleave', () => {
            if (window.innerWidth > 768) {
                dropdown.classList.remove('active');
            }
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-dropdown')) {
            document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
                dropdown.classList.remove('active');
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
        console.log('Form submitted:', data);

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
    // Initialize DOM elements
    initializeDOMElements();

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
console.log('%c🌉 Mobius Bridge - 中日企业无缝连接桥梁', 'font-size: 20px; font-weight: bold; color: #3b82f6;');
console.log('%cConnecting opportunities between China and Japan', 'font-size: 14px; color: #dc2626;');
console.log('%c🚀 Start your Japanese business journey with us!', 'font-size: 12px; color: #64748b;');