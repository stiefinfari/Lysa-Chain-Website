import './style.css';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';

// Initialize Vercel Analytics
inject();

// Initialize Vercel Speed Insights
injectSpeedInsights();

document.addEventListener('DOMContentLoaded', () => {
    // console.log("Main.js loaded - Optimization v1");
    // document.body.classList.add('no-scroll'); // Disabled for better UX
    
    const preloader = document.getElementById('preloader');
    const mainContent = document.getElementById('main-content');
    const heroVideo = document.getElementById('hero-video');
    const logoContainer = document.getElementById('logo-layer');
    const heroVideoLayer = document.getElementById('hero-video-layer');
    // const gradientBg = document.getElementById('gradient-bg'); // Removed
    const gridLayer = document.getElementById('grid-layer');
    const mainMenu = document.getElementById('main-menu');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    
    // --- VIDEO HERO MOBILE AUTOPLAY FIX ---
    // Ensure video plays on mobile by forcing play() on touchstart if needed
    // and checking playsinline/muted attributes which are already in HTML
    if (heroVideo) {
        // Force muted for autoplay policy
        heroVideo.muted = true;
        
        // Attempt play immediately
        const playPromise = heroVideo.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn("Autoplay prevented:", error);
                // Add one-time touch listener to start video
                const startVideo = () => {
                    heroVideo.play();
                    document.removeEventListener('touchstart', startVideo);
                    document.removeEventListener('click', startVideo);
                };
                document.addEventListener('touchstart', startVideo);
                document.addEventListener('click', startVideo);
            });
        }
    }

    // --- Dynamic Copyright Year ---
    const copyrightYear = document.getElementById('copyright-year');
    if (copyrightYear) {
        copyrightYear.textContent = new Date().getFullYear();
    }

    // Grid Assets
    const keywords = ['EPIC', 'CRAZY', 'UNIQUE'];
    let gridItems = []; 
    
    // Initialize Grid
    if (gridLayer) initGrid();

    // Handle Resize
    let resizeTimeout;
    let lastWidth = window.innerWidth;
    
    window.addEventListener('resize', () => {
        // Ignore vertical resizes (e.g. mobile address bar)
        if (window.innerWidth === lastWidth) return;
        lastWidth = window.innerWidth;

        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (gridLayer) initGrid();
        }, 200);
    });

    function initGrid() {
        if (!gridLayer) return;
        
        gridLayer.innerHTML = '';
        gridItems = [];
        
        // Optimization: Significantly increased cell size to reduce DOM nodes
        const cellSize = window.innerWidth < 768 ? 100 : 150; 
        const colCount = Math.ceil(window.innerWidth / cellSize);
        const rowCount = Math.ceil(window.innerHeight / cellSize);
        const cellCount = Math.ceil(colCount * rowCount); // Removed 1.2 multiplier to reduce off-screen nodes
        
        // Use DocumentFragment to minimize reflows
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < cellCount; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-item');
            cell.dataset.index = i;
            fragment.appendChild(cell);
            gridItems.push(cell);
            assignPatternContent(cell, i);
            cell.style.opacity = '0.15'; // Slightly reduced opacity for performance/aesthetics
        }
        gridLayer.appendChild(fragment); 
    }

    function assignPatternContent(cell, index) {
        // Optimization: Use CSS classes instead of creating DOM nodes for images
        if (index % 13 === 0) {
            cell.classList.add('grid-text');
            cell.textContent = keywords[index % keywords.length];
        } else {
            cell.classList.add('grid-icon');
            // Background image handled in CSS to reduce DOM size
        }
    }

    // 1. Initialize Hero SVG (Hide initially)
    const heroSvg = document.querySelector('.hero-logo-svg');
    if (heroSvg) {
        // Prepare for animation: Hide all parts initially
        heroSvg.querySelectorAll('image, path, g').forEach(el => {
            el.style.opacity = '0';
            el.style.animation = 'none';
        });
    }

    // 2. Dismiss Preloader & Start Reveal Timer
    if (preloader) {
        const totalDuration = 5000; // Increased to allow full logo animation
        setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.style.pointerEvents = 'none'; 

            setTimeout(() => {
                preloader.style.display = 'none';
                if (mainContent) {
                    mainContent.style.display = 'block';
                    // Force reflow
                    void mainContent.offsetWidth; 
                    mainContent.style.opacity = '1';
                    
                    if (heroVideo) {
                        heroVideo.play().catch(e => console.warn("Autoplay:", e));
                    }

                    // Start Sequence immediately (reduced from 5000ms)
                    setTimeout(() => {
                        startHeroSequence();
                    }, 100);
                }
            }, 800); // Increased to match CSS transition
        }, totalDuration);
    } else {
        if (mainContent) {
            mainContent.style.display = 'block';
            // Fallback for no preloader
            setTimeout(() => {
                startHeroSequence();
            }, 100);
        }
    }

    function startHeroSequence() {
        // 1. Logo Reveal (Letter by Letter) - T=0 (relative to 5s)
        const heroSvg = document.querySelector('.hero-logo-svg');
        if (heroSvg) {
            const elements = heroSvg.querySelectorAll('image, path, g');
            elements.forEach(el => {
                // Restore animation (assuming CSS handles delays based on IDs)
                // We need to re-apply the animation class/properties
                // Since we set animation = 'none' above, we remove that inline style
                el.style.animation = ''; 
                // The CSS for #C, #H etc triggers 'appearBlur'. 
                // However, since they were already in DOM (just hidden), CSS animation might have 'finished'.
                // To restart, we force reflow or toggle class.
                // Best way: set animation explicitly
                
                // Get the computed animation delay from CSS if possible, or use standard
                // The IDs match the CSS rules (#C, #H etc).
                // Just clearing style.animation should let CSS take over IF the element is considered "new" or we force it.
                // Let's force a re-trigger by setting animation name explicitly.
                const id = el.id;
                // We'll rely on the CSS rules for #C, #H etc. 
                // But we need to make sure opacity goes to 1 via animation.
                
                el.style.animation = 'none';
                void el.offsetWidth; // trigger reflow
                el.style.animation = ''; // Revert to CSS rule
            });
        }

        // 2. Grid Reveal - T+500ms
        setTimeout(() => {
            if (gridLayer) gridLayer.style.opacity = '0.8';
        }, 500);

        // 3. Menu Reveal - T+1000ms
        setTimeout(() => {
            if (mainMenu) mainMenu.classList.add('visible');
        }, 1000);

        // 4. Scroll Indicator & Unlock - T+3000ms (After logo finishes)
        setTimeout(() => {
            if (scrollIndicator) {
                scrollIndicator.classList.add('visible');
                scrollIndicator.style.opacity = ''; 
            }
            // document.body.classList.remove('no-scroll');
        }, 3000);
    }

    function revealHeroElements() {
        // Deprecated by startHeroSequence - keeping empty or removing usage
    }

    // 3. Simplified Scroll Handler (Performance Optimized)
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });

    function handleScroll() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        // Menu Visibility
        if (mainMenu && scrollY > 50) {
             mainMenu.classList.add('visible');
        }

        // --- Fade Out Hero Elements on Scroll (Smooth & Gradual) ---
        // Video, Logo (in hero-layers), and Grid should fade to transparent
        // as we scroll down to reveal the unified background behind content.
        
        // Calculate opacity based on scroll.
        // Start fading at 10% scroll, fully faded by 80% of viewport height.
        const fadeStart = windowHeight * 0.1;
        const fadeEnd = windowHeight * 0.8;
        
        let heroOpacity = 1;
        if (scrollY > fadeStart) {
            heroOpacity = 1 - ((scrollY - fadeStart) / (fadeEnd - fadeStart));
        }
        
        heroOpacity = Math.max(0, Math.min(1, heroOpacity));

        // Apply to Hero Layers container if possible, or individual elements
        const heroLayers = document.getElementById('hero-layers');
        if (heroLayers) {
            heroLayers.style.opacity = heroOpacity;
            // Optimization: Hide if fully invisible to save GPU
            heroLayers.style.visibility = heroOpacity <= 0.01 ? 'hidden' : 'visible';
        }

        // Scroll Indicator: Fade out faster
        if (scrollIndicator && scrollIndicator.classList.contains('visible')) {
             if (scrollY > 50) {
                  scrollIndicator.style.opacity = Math.max(0, 1 - (scrollY / 200));
             } else {
                  scrollIndicator.style.opacity = ''; 
             }
        }
    }
    
    // Initial Scroll Check
    handleScroll();

    // --- SCROLL REVEAL ANIMATION ---
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    const staticRevealElements = document.querySelectorAll(
        '.about-title, .about-text-content p, ' +
        '.music-title, .music-card, ' +
        '.video-title, .featured-video-wrapper, .youtube-btn, ' +
        '.contact-title, .booking-section, .social-connect, .email-link, .social-icon-btn'
    );
    
    staticRevealElements.forEach(el => {
        el.classList.add('fade-on-scroll');
        revealObserver.observe(el);
    });

    // --- IFRAME OVERLAY MANAGEMENT ---
    // Function to inject overlays and handle click-to-activate
    function setupIframeOverlays(container) {
        if (!container) return;
        
        // Only add 'click-to-interact' overlay to MUSIC cards.
        // Video cards will use the Modal logic instead.
        if (container.classList.contains('music-card')) {
            addOverlay(container);
        } else {
            // Find children that need overlay
            container.querySelectorAll('.music-card').forEach(addOverlay);
        }
    }

    function addOverlay(wrapper) {
        if (wrapper.querySelector('.iframe-overlay')) return; // Already exists

        const overlay = document.createElement('div');
        overlay.className = 'iframe-overlay';
        overlay.title = 'Click to interact';
        
        wrapper.appendChild(overlay);

        // Click to activate (allow iframe interaction)
        overlay.addEventListener('click', () => {
            overlay.style.pointerEvents = 'none';
        });

        // Mouse leave to reset (restore overlay for custom cursor)
        wrapper.addEventListener('mouseleave', () => {
            overlay.style.pointerEvents = 'auto';
        });
    }

    // 1. Setup Static Music Cards
    document.querySelectorAll('.music-card').forEach(addOverlay);

    // --- VIDEO MODAL LOGIC ---
    const videoModal = document.getElementById('video-modal');
    const modalContent = videoModal ? videoModal.querySelector('.modal-video-container') : null;
    const closeModalBtn = videoModal ? videoModal.querySelector('.close-modal') : null;

    function openVideoModal(videoId) {
        if (!videoModal || !modalContent) return;
        
        // Autoplay enabled
        const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`;
        
        modalContent.innerHTML = `
            <iframe 
                src="${embedUrl}" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" 
                allowfullscreen>
            </iframe>
        `;
        
        videoModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    function closeVideoModal() {
        if (!videoModal) return;
        videoModal.classList.remove('active');
        if (modalContent) modalContent.innerHTML = ''; // Stop video
        document.body.style.overflow = '';
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeVideoModal);
    }
    
    // Close on click outside
    if (videoModal) {
        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) closeVideoModal();
        });
    }
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoModal && videoModal.classList.contains('active')) {
            closeVideoModal();
        }
    });

    // --- VIDEO SECTION LOGIC ---
    const YOUTUBE_CHANNEL_ID = 'UC0Yah4pYx76fqTCup7LF-iQ'; 
    const RSS_URL = `https://api.rss2json.com/v1/api.json?rss_url=https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;
    
    // Featured Video Container
    const featuredContainer = document.getElementById('featured-video-container');
    const carouselContainer = document.getElementById('dynamic-video-carousel');

    // Fetch Videos
    fetch(RSS_URL)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok' && data.items.length > 0) {
                const videos = data.items;
                
                // 1. Featured Video (Latest)
                const latestVideo = videos[0];
                updateFeaturedVideo(latestVideo);

                // 2. Carousel (Rest)
                const carouselVideos = videos.slice(1);
                renderCarousel(carouselVideos);
            } else {
                throw new Error('No items found');
            }
        })
        .catch(err => {
            console.warn('YouTube Fetch Error:', err);
            // Fallback content logic preserved but simplified for modal context
            if (featuredContainer) {
                // Keep default iframe for fallback but maybe add click listener if we had a default ID
                featuredContainer.innerHTML = `
                    <iframe 
                        src="https://www.youtube.com/embed/videoseries?list=PLB5A7F85854619376" 
                        title="Lysa Chain Latest" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" 
                        allowfullscreen>
                    </iframe>`;
            }
            if (carouselContainer) {
                carouselContainer.innerHTML = '<p style="color:white; text-align:center;">Check out more on YouTube!</p>';
            }
        });

    // Helper to escape HTML to prevent XSS
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag]));
    }

    function updateFeaturedVideo(video) {
        if (!featuredContainer) return;
        const videoId = video.guid.split(':')[2];
        const safeTitle = escapeHTML(video.title);
        
        // Create a static preview image (high quality) with a play button overlay
        // This prevents the double-click issue by not loading the iframe directly until clicked
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        
        // Updated HTML structure using CSS classes
        featuredContainer.innerHTML = `
            <div class="video-preview" style="background-image: url('${thumbnailUrl}');">
                <div class="play-button">
                    <i class="fa-solid fa-play"></i>
                </div>
                <div class="video-preview-title">${safeTitle}</div>
            </div>
        `;

        featuredContainer.addEventListener('click', () => openVideoModal(videoId));
    }

    function renderCarousel(videos) {
        if (!carouselContainer) return;
        carouselContainer.innerHTML = ''; 

        videos.forEach(video => {
            const videoId = video.guid.split(':')[2];
            const safeTitle = escapeHTML(video.title);
            const card = document.createElement('div');
            card.className = 'video-card fade-on-scroll'; 
            revealObserver.observe(card); 
            
            // Use Thumbnail instead of Iframe to avoid heavy loading and enable instant click
            const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

            card.innerHTML = `
                <div class="video-thumb" style="width:100%; aspect-ratio:16/9; background:url('${thumbnailUrl}') center/cover no-repeat; position:relative;">
                    <div class="play-overlay" style="position:absolute; inset:0; background:rgba(0,0,0,0.3); display:flex; justify-content:center; align-items:center; transition:0.3s;">
                        <i class="fa-solid fa-play" style="color:white; font-size:40px; filter:drop-shadow(0 0 10px black);"></i>
                    </div>
                </div>
                <h3>${safeTitle}</h3>
            `;
            
            // Click to open modal
            card.addEventListener('click', () => openVideoModal(videoId));
            
            carouselContainer.appendChild(card);
        });
    }

    // Carousel Navigation
    const prevBtn = document.querySelector('.carousel-nav.prev');
    const nextBtn = document.querySelector('.carousel-nav.next');

    if (prevBtn && nextBtn && carouselContainer) {
        prevBtn.addEventListener('click', () => {
            carouselContainer.scrollBy({ left: -400, behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', () => {
            carouselContainer.scrollBy({ left: 400, behavior: 'smooth' });
        });
    }

    // --- INTERACTIVE: Custom Cursor REMOVED ---
    /* 
    The custom cursor has been removed as per user request to use the default system cursor.
    Previous implementation code deleted to clean up the file.
    */

    // --- INTERACTIVE: Video Background Parallax (Removed for performance/simplicity) ---
    // const videoBg = document.querySelector('.section-video-bg');
    // if (videoBg) {
    //     videoBg.style.transform = 'none';
    // }

    // --- INTERACTIVE: Music Cards 3D Tilt (Removed for performance/simplicity) ---
    // const musicCards = document.querySelectorAll('.music-card');
    // musicCards.forEach(card => {
    //     card.style.transform = 'none';
    // });

    // --- HAMBURGER MENU LOGIC ---
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-links li a');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            
            // Toggle body scroll lock when menu is open
            if (navLinks.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close menu when a link is clicked
        navLinksItems.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // --- COOKIE BANNER LOGIC (Enhanced) ---
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');
    const rejectBtn = document.getElementById('reject-cookies');

    if (cookieBanner && acceptBtn && rejectBtn) {
        // Safe LocalStorage Access
        let consent = null;
        try {
            consent = localStorage.getItem('cookieConsent');
        } catch (e) {
            console.warn('LocalStorage access denied:', e);
        }

        if (!consent) {
            // Show banner after a short delay
            setTimeout(() => {
                cookieBanner.classList.add('visible');
            }, 2000);
        }

        const handleConsent = (type) => {
            try {
                localStorage.setItem('cookieConsent', type);
            } catch (e) {
                console.warn('LocalStorage write failed:', e);
            }
            cookieBanner.classList.remove('visible');
        };

        // Simple click listeners are sufficient and safer
        acceptBtn.addEventListener('click', (e) => {
            console.log('Cookie Accept Clicked');
            e.preventDefault();
            handleConsent('accepted');
        });

        rejectBtn.addEventListener('click', (e) => {
            console.log('Cookie Reject Clicked');
            e.preventDefault();
            handleConsent('rejected');
        });
    }

    // --- ROUTING LOGIC ---
    const routeMap = {
        '/': 'hero-layers',
        '/about': 'about-layer',
        '/music': 'music-layer',
        '/video': 'video-content-layer',
        '/contact': 'contact-layer'
    };

    function handleNavigation(path, push = true) {
        // Strip trailing slash if present (except root)
        const cleanPath = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
        const targetId = routeMap[cleanPath];
        
        if (!targetId) return;

        const targetEl = document.getElementById(targetId);
        if (targetEl) {
            if (push) {
                history.pushState({}, '', path);
            }

            if (targetId === 'hero-layers') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // Header offset logic
                const headerOffset = 80;
                const elementPosition = targetEl.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }
    }

    // Intercept navigation clicks
    const navLinksList = document.querySelectorAll('.nav-links a');
    navLinksList.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            // Check if it's an internal route
            if (href && href.startsWith('/') && routeMap[href]) {
                e.preventDefault();
                handleNavigation(href);
            }
        });
    });

    // Handle Browser Back/Forward
    window.addEventListener('popstate', () => {
        handleNavigation(window.location.pathname, false);
    });

    // Handle Initial Load (Direct Access)
    const initialPath = window.location.pathname;
    const cleanInitialPath = initialPath.length > 1 && initialPath.endsWith('/') ? initialPath.slice(0, -1) : initialPath;
    
    if (cleanInitialPath !== '/' && routeMap[cleanInitialPath]) {
        // Wait for preloader sequence to finish
        // We poll for mainContent visibility
        const checkReady = setInterval(() => {
            if (mainContent && getComputedStyle(mainContent).opacity === '1') {
                clearInterval(checkReady);
                setTimeout(() => {
                    handleNavigation(cleanInitialPath, false);
                }, 100);
            }
        }, 200);

        // Safety timeout (6s) to ensure navigation happens even if preloader gets stuck
        setTimeout(() => {
            clearInterval(checkReady);
            handleNavigation(cleanInitialPath, false);
        }, 6000);
    }
});
