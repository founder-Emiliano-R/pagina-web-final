document.addEventListener('DOMContentLoaded', function() {
    initCarousels();
    initLightbox();
    initCategoryFilter();
    initVideoPlaceholders();
    initPageLoader();
    initScrollTop();
});

function initCarousels() {
    const carousels = document.querySelectorAll('[data-carousel]');
    
    carousels.forEach(carousel => {
        const slides = carousel.querySelectorAll('.carousel-slide');
        const container = carousel.closest('.portfolio-carousel-container');
        const prevBtn = container.querySelector('.carousel-arrow.prev');
        const nextBtn = container.querySelector('.carousel-arrow.next');
        const indicatorsContainer = container.querySelector('.carousel-indicators');
        
        let currentSlide = 0;
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        let startTime = 0;
        
        slides.forEach((slide, index) => {
            const indicator = document.createElement('div');
            indicator.className = 'indicator' + (index === 0 ? ' active' : '');
            indicator.addEventListener('click', () => goToSlide(index));
            indicatorsContainer.appendChild(indicator);
        });
        
        const indicators = indicatorsContainer.querySelectorAll('.indicator');
        
        function updateCarousel(smooth = true) {
            const offset = -currentSlide * 100;
            carousel.style.transition = smooth ? 'transform 0.5s ease' : 'none';
            carousel.style.transform = `translateX(${offset}%)`;
            
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentSlide);
            });
        }
        
        function goToSlide(index) {
            currentSlide = Math.max(0, Math.min(index, slides.length - 1));
            updateCarousel();
        }
        
        function nextSlide() {
            if (currentSlide < slides.length - 1) {
                currentSlide++;
                updateCarousel();
            }
        }
        
        function prevSlide() {
            if (currentSlide > 0) {
                currentSlide--;
                updateCarousel();
            }
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', prevSlide);
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', nextSlide);
        }
        
        carousel.addEventListener('touchstart', handleTouchStart, { passive: false });
        carousel.addEventListener('touchmove', handleTouchMove, { passive: false });
        carousel.addEventListener('touchend', handleTouchEnd, { passive: false });
        
        carousel.addEventListener('mousedown', handleMouseDown);
        carousel.addEventListener('mousemove', handleMouseMove);
        carousel.addEventListener('mouseup', handleMouseEnd);
        carousel.addEventListener('mouseleave', handleMouseEnd);
        
        function handleTouchStart(e) {
            startX = e.touches[0].clientX;
            startTime = Date.now();
            isDragging = true;
            carousel.style.transition = 'none';
        }
        
        function handleTouchMove(e) {
            if (!isDragging) return;
            
            currentX = e.touches[0].clientX;
            const diff = currentX - startX;
            const offset = (-currentSlide * 100) + (diff / carousel.offsetWidth * 100);
            carousel.style.transform = `translateX(${offset}%)`;
            
            if (Math.abs(diff) > 10) {
                e.preventDefault();
            }
        }
        
        function handleTouchEnd(e) {
            if (!isDragging) return;
            
            isDragging = false;
            const diff = currentX - startX;
            const timeElapsed = Date.now() - startTime;
            const velocity = Math.abs(diff) / timeElapsed;
            
            const threshold = 50;
            const velocityThreshold = 0.3;
            
            if ((Math.abs(diff) > threshold || velocity > velocityThreshold)) {
                if (diff > 0) {
                    prevSlide();
                } else {
                    nextSlide();
                }
            } else {
                updateCarousel();
            }
        }
        
        function handleMouseDown(e) {
            e.preventDefault();
            startX = e.clientX;
            startTime = Date.now();
            isDragging = true;
            carousel.style.transition = 'none';
            carousel.style.cursor = 'grabbing';
        }
        
        function handleMouseMove(e) {
            if (!isDragging) return;
            
            currentX = e.clientX;
            const diff = currentX - startX;
            const offset = (-currentSlide * 100) + (diff / carousel.offsetWidth * 100);
            carousel.style.transform = `translateX(${offset}%)`;
        }
        
        function handleMouseEnd(e) {
            if (!isDragging) return;
            
            isDragging = false;
            carousel.style.cursor = 'grab';
            const diff = currentX - startX;
            const timeElapsed = Date.now() - startTime;
            const velocity = Math.abs(diff) / timeElapsed;
            
            const threshold = 50;
            const velocityThreshold = 0.3;
            
            if ((Math.abs(diff) > threshold || velocity > velocityThreshold)) {
                if (diff > 0) {
                    prevSlide();
                } else {
                    nextSlide();
                }
            } else {
                updateCarousel();
            }
        }
        
        updateCarousel(false);
    });
}

function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    
    const carouselImages = document.querySelectorAll('.carousel-slide img');
    
    carouselImages.forEach(img => {
        img.style.cursor = 'pointer';
        
        img.addEventListener('click', function(e) {
            e.stopPropagation();
            lightboxImg.src = this.src;
            lightboxImg.alt = this.alt;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
    
    lightboxClose.addEventListener('click', closeLightbox);
    
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
    
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function initCategoryFilter() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const portfolioSections = document.querySelectorAll('.portfolio-section');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.dataset.category;
            
            portfolioSections.forEach(section => {
                if (category === 'todos') {
                    section.style.display = 'block';
                } else {
                    if (section.dataset.category === category) {
                        section.style.display = 'block';
                    } else {
                        section.style.display = 'none';
                    }
                }
            });
        });
    });
}

function initVideoPlaceholders() {
    const videoContainers = document.querySelectorAll('.video-container');
    
    videoContainers.forEach(container => {
        const placeholder = container.querySelector('.video-placeholder');
        const videoId = container.dataset.videoId;
        
        if (placeholder && videoId) {
            placeholder.addEventListener('click', function() {
                let embedUrl;
                
                if (videoId.includes('youtube.com') || videoId.includes('youtu.be')) {
                    const urlObj = new URL(videoId);
                    const params = new URLSearchParams(urlObj.search);
                    const id = params.get('v') || urlObj.pathname.split('/').pop();
                    embedUrl = `https://www.youtube.com/embed/${id}?autoplay=1`;
                } else {
                    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                }
                
                const iframe = document.createElement('iframe');
                iframe.src = embedUrl;
                iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                iframe.allowFullscreen = true;
                
                container.innerHTML = '';
                container.appendChild(iframe);
            });
        }
    });
}

function initPageLoader() {
    const pageLoader = document.getElementById('pageLoader');
    
    window.addEventListener('load', function() {
        setTimeout(() => {
            pageLoader.style.opacity = '0';
            setTimeout(() => {
                pageLoader.style.display = 'none';
            }, 300);
        }, 500);
    });
}

function initScrollTop() {
    const scrollTop = document.getElementById('scrollTop');
    
    if (scrollTop) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollTop.classList.add('visible');
            } else {
                scrollTop.classList.remove('visible');
            }
        });
        
        scrollTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}
