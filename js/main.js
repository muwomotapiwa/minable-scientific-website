// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initScrollEffects();
    initAnimations();
    initForms();
    initParticles();
    initScrollProgress();
    
    console.log('Minable Scientific website loaded successfully! 🧪');
});

// Navigation functionality
function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (hamburger && navMenu) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(href);
                
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// Scroll effects and animations
function initScrollEffects() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Special handling for different element types
                if (entry.target.classList.contains('stat-card')) {
                    animateStatCards(entry.target.parentElement);
                } else if (entry.target.classList.contains('category-card')) {
                    animateCategoryCards(entry.target.parentElement);
                } else if (entry.target.classList.contains('service-card')) {
                    animateServiceCards(entry.target.parentElement);
                } else if (entry.target.classList.contains('industry-card')) {
                    animateIndustryCards(entry.target.parentElement);
                }
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll(
        '.section-title, .section-line, .about-paragraph, .stat-card, .category-card, .service-card, .industry-card, .contact-item'
    );

    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // Parallax effect for floating cards
    window.addEventListener("scroll", function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll(".floating-card");
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.3 + (index * 0.1);
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// Animation functions
function initAnimations() {
    // Add loading animation to sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('loading');
    });

    // Reveal sections on scroll
    const sectionObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('loaded');
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        sectionObserver.observe(section);
    });
}

// Staggered animation functions
function animateStatCards(container) {
    const cards = container.querySelectorAll('.stat-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('animate');
            const numberElement = card.querySelector('.stat-number');
            if (numberElement) {
                animateCounter(numberElement);
            }
        }, index * 200);
    });
}

function animateCategoryCards(container) {
    const cards = container.querySelectorAll('.category-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('animate');
        }, index * 150);
    });
}

function animateServiceCards(container) {
    const cards = container.querySelectorAll('.service-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('animate');
        }, index * 100);
    });
}

function animateIndustryCards(container) {
    const cards = container.querySelectorAll('.industry-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('animate');
        }, index * 120);
    });
}

// Counter animation for statistics
function animateCounter(element) {
    const target = element.textContent;
    const isPercentage = target.includes('%');
    const isPlus = target.includes('+');
    const hasSlash = target.includes('/');
    
    if (hasSlash) {
        // Handle cases like "24/7"
        return;
    }
    
    const numericValue = parseInt(target.replace(/[^\d]/g, ''));
    
    if (isNaN(numericValue)) return;
    
    let current = 0;
    const increment = numericValue / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
            current = numericValue;
            clearInterval(timer);
        }
        
        let displayValue = Math.floor(current);
        if (isPercentage) {
            displayValue += '%';
        } else if (isPlus) {
            displayValue += '+';
        }
        
        element.textContent = displayValue;
    }, 40);
}

// Form handling
function initForms() {
    // Quote form
    const quoteForm = document.getElementById('quoteForm');
    if (quoteForm) {
        quoteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleQuoteSubmission(this);
        });
    }

    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleContactSubmission(this);
        });
    }

    // Add input validation and styling
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
        
        input.addEventListener('input', function() {
            validateInput(this);
        });
    });
}

function handleQuoteSubmission(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Show loading state
    const submitBtn = form.querySelector('.btn-submit');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
        showNotification('Quote request submitted successfully! We will contact you soon.', 'success');
        form.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
    
    console.log('Quote request:', data);
}

function handleContactSubmission(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Show loading state
    const submitBtn = form.querySelector('.btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
        showNotification('Message sent successfully! We will get back to you soon.', 'success');
        form.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
    
    console.log('Contact message:', data);
}

function validateInput(input) {
    const value = input.value.trim();
    const type = input.type;
    let isValid = true;
    
    // Remove previous error styling
    input.classList.remove('error');
    
    // Basic validation
    if (input.required && !value) {
        isValid = false;
    } else if (type === 'email' && value && !isValidEmail(value)) {
        isValid = false;
    } else if (type === 'tel' && value && !isValidPhone(value)) {
        isValid = false;
    }
    
    // Add error styling if invalid
    if (!isValid) {
        input.classList.add('error');
    }
    
    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add notification styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                padding: 1rem;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                min-width: 300px;
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification-success {
                border-left: 4px solid #10b981;
            }
            
            .notification-error {
                border-left: 4px solid #ef4444;
            }
            
            .notification-info {
                border-left: 4px solid #3b82f6;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .notification-content i {
                color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            }
            
            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                color: #64748b;
                padding: 0.25rem;
            }
            
            .notification-close:hover {
                color: #334155;
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        hideNotification(notification);
    });
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        hideNotification(notification);
    }, 5000);
}

function hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Particle system
function initParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    const particleCount = 30;
    const particles = hero.querySelector('.particles');
    
    if (!particles) return;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: particleFloat ${Math.random() * 10 + 10}s ease-in-out infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        particles.appendChild(particle);
    }
    
    // Add particle animation styles
    if (!document.querySelector('#particle-styles')) {
        const styles = document.createElement('style');
        styles.id = 'particle-styles';
        styles.textContent = `
            @keyframes particleFloat {
                0%, 100% { 
                    transform: translateY(0px) translateX(0px) rotate(0deg);
                    opacity: 0.3;
                }
                25% { 
                    transform: translateY(-20px) translateX(10px) rotate(90deg);
                    opacity: 0.8;
                }
                50% { 
                    transform: translateY(-40px) translateX(-5px) rotate(180deg);
                    opacity: 0.5;
                }
                75% { 
                    transform: translateY(-20px) translateX(-10px) rotate(270deg);
                    opacity: 0.9;
                }
            }
        `;
        document.head.appendChild(styles);
    }
}

// Scroll progress bar
function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.classList.add('scroll-progress');
    document.body.appendChild(progressBar);

    // Update progress bar on scroll
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.offsetHeight - window.innerHeight;
        const scrollPercent = Math.min((scrollTop / docHeight) * 100, 100);
        progressBar.style.width = scrollPercent + '%';
    });
}

// Product category interactions
function initProductInteractions() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Smooth reveal animation for elements
function revealOnScroll() {
    const reveals = document.querySelectorAll('.loading');
    
    reveals.forEach(reveal => {
        const windowHeight = window.innerHeight;
        const elementTop = reveal.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
            reveal.classList.add('loaded');
        }
    });
}

// Initialize product interactions when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initProductInteractions();
    
    // Add scroll listener for reveals
    window.addEventListener('scroll', revealOnScroll);
    
    // Initial check for elements already in view
    revealOnScroll();
});

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Add error styles for form validation
const errorStyles = document.createElement('style');
errorStyles.textContent = `
    .form-group input.error,
    .form-group textarea.error {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    }
    
    .form-group.focused label {
        color: var(--primary-blue);
    }
`;
document.head.appendChild(errorStyles);

// Performance optimization: Use passive listeners where appropriate
window.addEventListener('scroll', debounce(() => {
    // Scroll-based animations and effects
}, 16), { passive: true });

// Add click ripple effect to buttons
function addRippleEffect() {
    const buttons = document.querySelectorAll('.btn, .category-card, .service-card, .industry-card');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add ripple animation
    if (!document.querySelector('#ripple-animation')) {
        const rippleStyles = document.createElement('style');
        rippleStyles.id = 'ripple-animation';
        rippleStyles.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(rippleStyles);
    }
}

// Initialize ripple effect
document.addEventListener('DOMContentLoaded', addRippleEffect);

