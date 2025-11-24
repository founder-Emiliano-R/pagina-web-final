// ===========================================
// AURUMVISION MEDIA - MAIN JAVASCRIPT
// ===========================================

// Configuración global
const CONFIG = {
    whatsappNumber: '526565537949',
    emailJSConfig: {
        serviceId: 'service_bvffiiw',
        templateId: 'template_8w9xev8',
        publicKey: 'KmFZOET7b8HIyyt03'
    },
    // Configuración alternativa con Formspree
    formspreeEndpoint: 'YOUR_FORMSPREE_ENDPOINT', // https://formspree.io/f/YOUR_ID
    autoplayInterval: 4000,
    scrollOffset: 80
};

// ===========================================
// UTILIDADES
// ===========================================

const Utils = {
    // Debounce function para optimizar eventos
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function para scroll events
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Smooth scroll helper
    smoothScrollTo(element, offset = CONFIG.scrollOffset) {
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    },

    // Extraer video ID de URL de YouTube
    extractYouTubeID(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }
};

// ===========================================
// PAGE LOADER
// ===========================================

class PageLoader {
    constructor() {
        this.loader = document.getElementById('pageLoader');
    }

    init() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (this.loader) {
                    this.loader.classList.add('hidden');
                }
            }, 800);
        });
    }
}

// ===========================================
// NAVIGATION
// ===========================================

class Navigation {
    constructor() {
        this.hamburger = document.getElementById('hamburger');
        this.mobileMenu = document.getElementById('mobileMenu');
        this.header = document.getElementById('header');
        this.mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        this.mobileSubmenu = document.querySelector('.mobile-submenu');
        this.menuArrow = document.querySelector('.menu-arrow');
        this.logoLink = document.querySelector('.logo-link');
    }

    init() {
        this.setupMobileMenu();
        this.setupScrollEffect();
        this.setupSmoothScroll();
        this.setupSubmenu();
        this.fixLogoMobileIssue();
    }

    // SOLUCIÓN PROBLEMA 4: Evitar que el logo bloquee el menú en móvil
    fixLogoMobileIssue() {
        if (!this.logoLink) return;

        // Detectar si estamos en móvil
        const isMobile = () => window.innerWidth < 1024;

        // Desactivar el hover del texto en móvil
        const handleResize = () => {
            const logoText = this.logoLink.querySelector('.logo-text');
            if (logoText) {
                if (isMobile()) {
                    // En móvil, mantener el texto oculto siempre
                    logoText.style.opacity = '0';
                    logoText.style.maxWidth = '0';
                    logoText.style.pointerEvents = 'none';
                } else {
                    // En desktop, restaurar comportamiento normal
                    logoText.style.pointerEvents = 'auto';
                }
            }
        };

        // Ejecutar al cargar y al redimensionar
        handleResize();
        window.addEventListener('resize', Utils.debounce(handleResize, 250));
    }

    setupMobileMenu() {
        if (!this.hamburger || !this.mobileMenu) return;

        this.hamburger.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Close menu on link click
        document.querySelectorAll('.mobile-menu a').forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });

        // Close menu when clicking outside
        this.mobileMenu.addEventListener('click', (e) => {
            if (e.target === this.mobileMenu) {
                this.closeMobileMenu();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.mobileMenu.classList.contains('active')) {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        this.hamburger.classList.toggle('active');
        this.mobileMenu.classList.toggle('active');
        document.body.style.overflow = this.mobileMenu.classList.contains('active') ? 'hidden' : 'auto';
    }

    closeMobileMenu() {
        this.hamburger.classList.remove('active');
        this.mobileMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    setupScrollEffect() {
        if (!this.header) return;

        const handleScroll = Utils.throttle(() => {
            if (window.pageYOffset > 100) {
                this.header.classList.add('scrolled');
            } else {
                this.header.classList.remove('scrolled');
            }
        }, 100);

        window.addEventListener('scroll', handleScroll);
    }

    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                
                // Skip modal links
                if (href === '#privacy-policy' || href === '#terms' || href === '#') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    Utils.smoothScrollTo(target);
                }
            });
        });
    }

    setupSubmenu() {
        if (!this.mobileMenuToggle) return;

        this.mobileMenuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (this.mobileSubmenu) {
                this.mobileSubmenu.classList.toggle('active');
            }
            if (this.menuArrow) {
                this.menuArrow.classList.toggle('active');
            }
        });
    }
}

// ===========================================
// SCROLL TO TOP BUTTON
// ===========================================

class ScrollToTop {
    constructor() {
        this.button = document.getElementById('scrollTop');
    }

    init() {
        if (!this.button) return;

        const handleScroll = Utils.throttle(() => {
            if (window.pageYOffset > 300) {
                this.button.classList.add('visible');
            } else {
                this.button.classList.remove('visible');
            }
        }, 100);

        window.addEventListener('scroll', handleScroll);

        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ===========================================
// INTERSECTION OBSERVER (ANIMATIONS)
// ===========================================

class AnimationObserver {
    constructor() {
        this.options = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, this.options);

        // Observe elements
        const elements = document.querySelectorAll(
            '.section-header, .portfolio-grid, .service-card, .about-content, .testimonial-card, .contact-container'
        );

        elements.forEach(el => observer.observe(el));
    }
}

// ===========================================
// PORTFOLIO FILTER
// ===========================================

class PortfolioFilter {
    constructor() {
        this.categoryBtns = document.querySelectorAll('.category-btn');
        this.portfolioItems = document.querySelectorAll('.portfolio-item');
        this.portfolioSections = document.querySelectorAll('.portfolio-section');
    }

    init() {
        if (this.categoryBtns.length === 0) return;

        this.categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterPortfolio(btn);
            });
        });
    }

    filterPortfolio(btn) {
        // Update active button
        this.categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.getAttribute('data-category');

        // Filter portfolio items (for grid view)
        if (this.portfolioItems.length > 0) {
            this.portfolioItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                
                if (category === 'todos' || itemCategory === category) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        }

        // Filter portfolio sections (for detailed view)
        if (this.portfolioSections.length > 0) {
            this.portfolioSections.forEach(section => {
                const sectionCategory = section.getAttribute('data-category');
                
                if (category === 'todos') {
                    section.style.display = 'block';
                } else if (sectionCategory === category) {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });
        }
    }
}

// ===========================================
// CAROUSEL SYSTEM - MEJORADO PARA MÓVILES
// ===========================================

class Carousel {
    constructor(carouselElement) {
        this.carousel = carouselElement;
        this.container = carouselElement.closest('.portfolio-carousel-container');
        if (!this.container) return;

        this.prevBtn = this.container.querySelector('.carousel-arrow.prev');
        this.nextBtn = this.container.querySelector('.carousel-arrow.next');
        this.indicatorsContainer = this.container.querySelector('.carousel-indicators');
        this.slides = this.carousel.querySelectorAll('.carousel-slide');
        this.totalSlides = this.slides.length;
        
        this.currentIndex = 0;
        this.autoplayInterval = null;

        // SOLUCIÓN PROBLEMA 2: Configuración mejorada para móviles
        this.touchSensitivity = 30; // Reducido de 50 para más sensibilidad
        this.verticalSwipeThreshold = 30; // Para distinguir swipe vertical de horizontal

        if (this.totalSlides > 0) {
            this.init();
        }
    }

    init() {
        this.createIndicators();
        this.setupNavigation();
        this.setupTouchEvents();
        this.setupMouseDrag();
        this.setupAutoplay();
        this.goToSlide(0);
    }

    createIndicators() {
        if (!this.indicatorsContainer) return;

        this.indicatorsContainer.innerHTML = '';
        this.slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('indicator-dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToSlide(index));
            this.indicatorsContainer.appendChild(dot);
        });

        this.indicators = this.indicatorsContainer.querySelectorAll('.indicator-dot');
    }

    goToSlide(index) {
        if (index < 0) index = this.totalSlides - 1;
        if (index >= this.totalSlides) index = 0;
        
        this.currentIndex = index;
        const translateValue = -this.currentIndex * 100;
        this.carousel.style.transform = `translateX(${translateValue}%)`;
        this.updateIndicators();
    }

    updateIndicators() {
        if (!this.indicators) return;
        
        this.indicators.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }

    nextSlide() {
        this.goToSlide(this.currentIndex + 1);
    }

    prevSlide() {
        this.goToSlide(this.currentIndex - 1);
    }

    setupNavigation() {
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.nextSlide();
                this.resetAutoplay();
            });
        }

        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.prevSlide();
                this.resetAutoplay();
            });
        }
    }

    // SOLUCIÓN PROBLEMA 2: Touch events mejorados y corregidos
    setupTouchEvents() {
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;
        let isDragging = false;
        let isSwiping = false;

        // Touch Start
        const handleTouchStart = (e) => {
            isDragging = true;
            isSwiping = false;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            currentX = startX;
            currentY = startY;
            
            this.carousel.style.transition = 'none';
            this.stopAutoplay();
        };

        // Touch Move
        const handleTouchMove = (e) => {
            if (!isDragging) return;
            
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
            
            const diffX = currentX - startX;
            const diffY = Math.abs(currentY - startY);
            
            // Determinar si es un swipe horizontal
            if (!isSwiping && Math.abs(diffX) > 10) {
                if (diffY < this.verticalSwipeThreshold) {
                    isSwiping = true;
                }
            }
            
            // Si es un swipe horizontal, mover el carrusel y prevenir scroll
            if (isSwiping) {
                e.preventDefault();
                const currentTranslate = -this.currentIndex * 100;
                const movePercent = (diffX / this.carousel.offsetWidth) * 100;
                this.carousel.style.transform = `translateX(${currentTranslate + movePercent}%)`;
            }
        };

        // Touch End
        const handleTouchEnd = () => {
            if (!isDragging) return;
            
            this.carousel.style.transition = '';
            
            if (isSwiping) {
                const diff = startX - currentX;
                
                if (Math.abs(diff) > this.touchSensitivity) {
                    if (diff > 0) {
                        this.nextSlide();
                    } else {
                        this.prevSlide();
                    }
                } else {
                    this.goToSlide(this.currentIndex);
                }
            } else {
                this.goToSlide(this.currentIndex);
            }
            
            // Resetear completamente el estado
            isDragging = false;
            isSwiping = false;
            startX = 0;
            startY = 0;
            currentX = 0;
            currentY = 0;
            
            this.resetAutoplay();
        };

        // Touch Cancel
        const handleTouchCancel = () => {
            if (isDragging) {
                this.carousel.style.transition = '';
                this.goToSlide(this.currentIndex);
                
                // Resetear estado
                isDragging = false;
                isSwiping = false;
                
                this.resetAutoplay();
            }
        };

        // Añadir listeners
        this.carousel.addEventListener('touchstart', handleTouchStart, { passive: true });
        this.carousel.addEventListener('touchmove', handleTouchMove, { passive: false });
        this.carousel.addEventListener('touchend', handleTouchEnd, { passive: true });
        this.carousel.addEventListener('touchcancel', handleTouchCancel, { passive: true });
    }

    setupMouseDrag() {
        this.carousel.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.startX = e.clientX;
            this.carousel.classList.add('dragging');
            this.carousel.style.cursor = 'grabbing';
            this.stopAutoplay();
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            this.currentX = e.clientX;
            e.preventDefault();
        });

        document.addEventListener('mouseup', () => {
            if (!this.isDragging) return;
            this.isDragging = false;
            this.carousel.classList.remove('dragging');
            this.carousel.style.cursor = 'grab';
            
            const diff = this.startX - this.currentX;

            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
            this.resetAutoplay();
        });
    }

    setupAutoplay() {
        this.container.addEventListener('mouseenter', () => this.stopAutoplay());
        this.container.addEventListener('mouseleave', () => this.startAutoplay());
        this.startAutoplay();
    }

    startAutoplay() {
        this.stopAutoplay();
        this.autoplayInterval = setInterval(() => {
            this.nextSlide();
        }, CONFIG.autoplayInterval);
    }

    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }

    resetAutoplay() {
        this.stopAutoplay();
        setTimeout(() => this.startAutoplay(), 8000);
    }
}

// ===========================================
// CONTACT FORM - SOLUCIÓN PROBLEMA 1
// ===========================================


class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.message = document.getElementById('formMessage');
        this.submitBtn = document.getElementById('submitBtn');
    }

    init() {
        if (!this.form) return;

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    async handleSubmit() {
        // Validar formulario
        if (!this.form.checkValidity()) {
            this.form.reportValidity();
            return;
        }

        // Deshabilitar botón
        this.submitBtn.disabled = true;
        this.submitBtn.textContent = 'ENVIANDO...';

        const formData = {
            nombre: document.getElementById('nombre').value,
            email: document.getElementById('email').value,
            telefono: document.getElementById('telefono')?.value || 'No proporcionado',
            servicio: document.getElementById('servicio').value,
            tipo: document.getElementById('tipo').value,
            fecha: document.getElementById('fecha')?.value || 'No especificada',
            mensaje: document.getElementById('mensaje').value
        };

        try {
            // Llamar a la función de Netlify con Resend
            await this.sendWithResend(formData);

            this.showMessage('Mensaje enviado correctamente. Te contactaremos pronto.', 'success');
            this.form.reset();

        } catch (error) {
            console.error('Error al enviar:', error);
            
            // Si falla, ofrecer WhatsApp como respaldo
            this.showMessage(
                'Hubo un error al enviar el mensaje. ¿Deseas contactarnos por WhatsApp?',
                'error'
            );
            
            // Mostrar botón de WhatsApp después de 2 segundos
            setTimeout(() => {
                if (confirm('¿Quieres abrir WhatsApp para contactarnos?')) {
                    this.redirectToWhatsApp(formData);
                }
            }, 2000);
        } finally {
            this.submitBtn.disabled = false;
            this.submitBtn.textContent = 'ENVIAR MENSAJE';
        }
    }

    async sendWithResend(formData) {
        // Llamar a tu función de Netlify
        const response = await fetch('/.netlify/functions/enviar-contacto-resend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        // Verificar respuesta
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.mensaje || 'Error al enviar el email');
        }

        return data;
    }

    redirectToWhatsApp(formData) {
        const message = `Hola, me gustaría cotizar:\n\nNombre: ${formData.nombre}\nEmail: ${formData.email}\nTeléfono: ${formData.telefono}\nServicio: ${formData.servicio}\nTipo: ${formData.tipo}\nFecha: ${formData.fecha}\nMensaje: ${formData.mensaje}`;
        
        const whatsappURL = `https://wa.me/526565537949?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappURL, '_blank');
    }

    showMessage(text, type) {
        if (!this.message) return;

        this.message.textContent = text;
        this.message.className = `form-message ${type}`;
        this.message.style.display = 'block';

        // Ocultar mensaje después de 5 segundos
        setTimeout(() => {
            this.message.style.display = 'none';
        }, 5000);
    }
}

// ===========================================
// COOKIE CONSENT
// ===========================================

class CookieConsent {
    constructor() {
        this.consent = document.getElementById('cookieConsent');
        this.acceptBtn = document.getElementById('acceptCookies');
        this.declineBtn = document.getElementById('declineCookies');
    }

    init() {
        if (!this.consent) return;

        // Check if user already made a choice
        if (!localStorage.getItem('cookieConsent')) {
            setTimeout(() => {
                this.consent.classList.add('show');
            }, 2000);
        }

        this.acceptBtn?.addEventListener('click', () => {
            this.setCookieConsent('accepted');
        });

        this.declineBtn?.addEventListener('click', () => {
            this.setCookieConsent('declined');
        });
    }

    setCookieConsent(value) {
        localStorage.setItem('cookieConsent', value);
        this.consent.classList.remove('show');

        if (value === 'accepted') {
            console.log('Cookies aceptadas');
        }
    }
}

// ===========================================
// MODAL SYSTEM
// ===========================================

class Modal {
    constructor() {
        this.overlay = document.getElementById('modalOverlay');
        this.content = document.getElementById('modalContent');
        this.closeBtn = document.getElementById('closeModal');
        this.privacyLink = document.getElementById('privacyLink');
        this.termsLink = document.getElementById('termsLink');
    }

    init() {
        if (!this.overlay) return;

        this.privacyLink?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPrivacyPolicy();
        });

        this.termsLink?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showTerms();
        });

        this.closeBtn?.addEventListener('click', () => this.close());

        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay.style.display === 'block') {
                this.close();
            }
        });
    }

    open(content) {
        this.content.innerHTML = content;
        this.overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    showPrivacyPolicy() {
        const content = `
            <h2 style="font-size: 2rem; margin-bottom: 2rem; letter-spacing: 2px;">POLITICA DE PRIVACIDAD</h2>
            <p style="margin-bottom: 1rem;"><strong>Ultima actualizacion:</strong> Enero 2025</p>
            
            <h3 style="margin: 2rem 0 1rem; font-size: 1.3rem;">1. Informacion que Recopilamos</h3>
            <p style="margin-bottom: 1rem; line-height: 1.8;">Recopilamos informacion personal que usted nos proporciona directamente, incluyendo nombre, correo electronico, telefono y detalles del evento.</p>
            
            <h3 style="margin: 2rem 0 1rem; font-size: 1.3rem;">2. Uso de la Informacion</h3>
            <p style="margin-bottom: 1rem; line-height: 1.8;">Utilizamos su informacion para: contactarlo sobre sus consultas, proporcionar nuestros servicios, enviar actualizaciones sobre su proyecto, y mejorar nuestros servicios.</p>
            
            <h3 style="margin: 2rem 0 1rem; font-size: 1.3rem;">3. Proteccion de Datos</h3>
            <p style="margin-bottom: 1rem; line-height: 1.8;">Implementamos medidas de seguridad para proteger su informacion personal contra acceso no autorizado.</p>
            
            <h3 style="margin: 2rem 0 1rem; font-size: 1.3rem;">4. Cookies</h3>
            <p style="margin-bottom: 1rem; line-height: 1.8;">Utilizamos cookies para mejorar la experiencia del usuario en nuestro sitio web.</p>
            
            <h3 style="margin: 2rem 0 1rem; font-size: 1.3rem;">5. Sus Derechos</h3>
            <p style="margin-bottom: 1rem; line-height: 1.8;">Tiene derecho a acceder, rectificar o eliminar sus datos personales en cualquier momento.</p>
            
            <h3 style="margin: 2rem 0 1rem; font-size: 1.3rem;">6. Contacto</h3>
            <p style="margin-bottom: 1rem; line-height: 1.8;">Para cualquier consulta sobre esta politica, contactenos en: contacto@aurumvisionmedia.com</p>
        `;
        this.open(content);
    }

    showTerms() {
        const content = `
            <h2 style="font-size: 2rem; margin-bottom: 2rem; letter-spacing: 2px;">TERMINOS Y CONDICIONES</h2>
            <p style="margin-bottom: 1rem;"><strong>Ultima actualizacion:</strong> Enero 2025</p>
            
            <h3 style="margin: 2rem 0 1rem; font-size: 1.3rem;">1. Servicios</h3>
            <p style="margin-bottom: 1rem; line-height: 1.8;">AurumVision Media proporciona servicios de fotografia y videografia profesional segun lo acordado en cada contrato individual.</p>
            
            <h3 style="margin: 2rem 0 1rem; font-size: 1.3rem;">2. Reservas y Pagos</h3>
            <p style="margin-bottom: 1rem; line-height: 1.8;">Se requiere un deposito del 50% para confirmar la reserva. El saldo restante debe pagarse antes o el dia del evento.</p>
            
            <h3 style="margin: 2rem 0 1rem; font-size: 1.3rem;">3. Cancelaciones</h3>
            <p style="margin-bottom: 1rem; line-height: 1.8;">Las cancelaciones con mas de 30 dias de anticipacion recibiran un reembolso del 50%. No se realizan reembolsos para cancelaciones con menos de 30 dias.</p>
            
            <h3 style="margin: 2rem 0 1rem; font-size: 1.3rem;">4. Derechos de Autor</h3>
            <p style="margin-bottom: 1rem; line-height: 1.8;">Todos los derechos de autor de las fotografias y videos permanecen con AurumVision Media. El cliente recibe una licencia de uso personal.</p>
            
            <h3 style="margin: 2rem 0 1rem; font-size: 1.3rem;">5. Tiempo de Entrega</h3>
            <p style="margin-bottom: 1rem; line-height: 1.8;">Las imagenes editadas se entregan dentro de 2-4 semanas. Los videos pueden tomar hasta 6-8 semanas.</p>
            
            <h3 style="margin: 2rem 0 1rem; font-size: 1.3rem;">6. Uso de Imagenes</h3>
            <p style="margin-bottom: 1rem; line-height: 1.8;">AurumVision Media se reserva el derecho de usar las imagenes con fines promocionales y de portafolio, a menos que se acuerde lo contrario por escrito.</p>
            
            <h3 style="margin: 2rem 0 1rem; font-size: 1.3rem;">7. Limitacion de Responsabilidad</h3>
            <p style="margin-bottom: 1rem; line-height: 1.8;">No nos hacemos responsables por circunstancias fuera de nuestro control que impidan la prestacion del servicio.</p>
        `;
        this.open(content);
    }
}

// ===========================================
// PARALLAX EFFECT
// ===========================================

class ParallaxEffect {
    constructor() {
        this.heroOverlay = document.querySelector('.hero-overlay');
    }

    init() {
        if (!this.heroOverlay) return;

        const handleScroll = Utils.throttle(() => {
            const scrolled = window.pageYOffset;
            if (scrolled < window.innerHeight) {
                this.heroOverlay.style.opacity = 0.3 + (scrolled / window.innerHeight) * 0.5;
            }
        }, 50);

        window.addEventListener('scroll', handleScroll);
    }
}

// ===========================================
// VIDEO PLAYER - SOLUCIÓN PROBLEMA 5
// ===========================================

class VideoPlayer {
    init() {
        document.querySelectorAll('.video-container').forEach(container => {
            const videoURL = container.getAttribute('data-video-id');
            
            if (!videoURL) return;

            // Extraer el ID del video
            const videoId = Utils.extractYouTubeID(videoURL);
            
            if (!videoId) {
                console.error('URL de YouTube inválida:', videoURL);
                return;
            }

            // Crear y añadir iframe inmediatamente (sin placeholder)
            const iframe = document.createElement('iframe');
            iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}`);
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
            iframe.setAttribute('allowfullscreen', '');
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            
            // Limpiar el contenedor y añadir el iframe
            container.innerHTML = '';
            container.appendChild(iframe);
        });
    }
}

// ===========================================
// LIGHTBOX - VERSIÓN CORREGIDA Y SIMPLIFICADA
// ===========================================

class Lightbox {
    constructor() {
        this.lightbox = document.getElementById('lightbox');
        this.lightboxImg = document.getElementById('lightboxImg');
        this.closeBtn = document.getElementById('lightboxClose');
        this.isOpen = false;
        
        // Variables para detectar tap vs drag
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchStartTime = 0;
        this.isTouching = false;
    }

    init() {
        if (!this.lightbox) {
            console.log('Lightbox element not found');
            return;
        }

        // Cerrar con botón X
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }

        // Cerrar al hacer clic en el overlay
        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) {
                this.close();
            }
        });

        // Cerrar con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Esperar a que el DOM esté completamente cargado antes de configurar las imágenes
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupImageListeners();
            });
        } else {
            this.setupImageListeners();
        }

        console.log('Lightbox initialized');
    }

    setupImageListeners() {
        // Pequeño delay para asegurar que los carruseles están listos
        setTimeout(() => {
            const images = document.querySelectorAll('.carousel-slide img');
            console.log(`Found ${images.length} carousel images`);

            images.forEach((img, index) => {
                // Remover listeners previos si existen (prevenir duplicados)
                img.removeEventListener('click', this.handleImageClick);
                
                // MÉTODO 1: Click simple (funciona en desktop y algunos móviles)
                img.addEventListener('click', (e) => {
                    // Si no estamos arrastrando, abrir lightbox
                    const carousel = img.closest('.portfolio-carousel');
                    if (carousel && !carousel.classList.contains('dragging')) {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log(`Image ${index} clicked - opening lightbox`);
                        this.open(img.src);
                    }
                });

                // MÉTODO 2: Touch events (para móviles)
                img.addEventListener('touchstart', (e) => {
                    this.isTouching = true;
                    this.touchStartX = e.touches[0].clientX;
                    this.touchStartY = e.touches[0].clientY;
                    this.touchStartTime = Date.now();
                }, { passive: true });

                img.addEventListener('touchend', (e) => {
                    if (!this.isTouching) return;

                    const touchEndX = e.changedTouches[0].clientX;
                    const touchEndY = e.changedTouches[0].clientY;
                    const touchDuration = Date.now() - this.touchStartTime;

                    // Calcular distancia del movimiento
                    const deltaX = Math.abs(touchEndX - this.touchStartX);
                    const deltaY = Math.abs(touchEndY - this.touchStartY);
                    const totalDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                    // Si fue un tap rápido (no drag)
                    if (touchDuration < 300 && totalDistance < 15) {
                        const carousel = img.closest('.portfolio-carousel');
                        if (carousel && !carousel.classList.contains('dragging')) {
                            e.preventDefault();
                            console.log(`Image ${index} tapped - opening lightbox`);
                            this.open(img.src);
                        }
                    }

                    this.isTouching = false;
                }, { passive: false });

                // Cancelar si el touch se interrumpe
                img.addEventListener('touchcancel', () => {
                    this.isTouching = false;
                }, { passive: true });
            });
        }, 500); // Esperamos 500ms para que todo esté cargado
    }

    open(src) {
        if (!this.lightboxImg || !this.lightbox) {
            console.error('Lightbox elements not found');
            return;
        }

        console.log('Opening lightbox with image:', src);
        this.lightboxImg.src = src;
        this.lightbox.classList.add('active');
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
    }

    close() {
        if (!this.lightbox) return;

        console.log('Closing lightbox');
        this.lightbox.classList.remove('active');
        this.isOpen = false;
        document.body.style.overflow = '';
    }
}

// ===========================================
// INITIALIZATION
// ===========================================

class App {
    constructor() {
        this.components = [];
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initComponents());
        } else {
            this.initComponents();
        }
    }

    initComponents() {
        // Initialize all components
        this.components = [
            new PageLoader(),
            new Navigation(),
            new ScrollToTop(),
            new AnimationObserver(),
            new PortfolioFilter(),
            new ContactForm(),
            new CookieConsent(),
            new Modal(),
            new ParallaxEffect(),
            new VideoPlayer(),
            new Lightbox()
        ];

        this.components.forEach(component => component.init());

        // Initialize carousels
        this.initCarousels();

        // Prevent horizontal scroll
        document.body.style.overflowX = 'hidden';
    }

    initCarousels() {
        document.querySelectorAll('[data-carousel]').forEach(carousel => {
            new Carousel(carousel);
        });
    }
}

// Start the application
const app = new App();
app.init();
