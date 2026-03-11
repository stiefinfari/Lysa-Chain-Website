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
    
    const heroVideo = document.getElementById('hero-video');
    // const gradientBg = document.getElementById('gradient-bg'); // Removed
    const gridLayer = document.getElementById('grid-layer');
    const mainMenu = document.getElementById('main-menu');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const heroLayers = document.getElementById('hero-layers');
    const heroSvg = document.querySelector('.hero-logo-svg');
    const prefersReducedMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
    const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';
    
    // --- VIDEO HERO MOBILE AUTOPLAY FIX ---
    // Ensure video plays on mobile by forcing play() on touchstart if needed
    // and checking playsinline/muted attributes which are already in HTML
    let heroVideoStarted = false;
    function shouldAutoplayHeroVideo() {
        if (!heroVideo || prefersReducedMotion) return false;
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection && (connection.saveData || /(^|\b)(slow-2g|2g)(\b|$)/i.test(connection.effectiveType || ''))) return false;
        return true;
    }

    function startHeroVideo() {
        if (!heroVideo || heroVideoStarted) return;
        heroVideoStarted = true;
        heroVideo.muted = true;
        const playPromise = heroVideo.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
                const resume = () => {
                    heroVideo.play().catch(() => {});
                };
                window.addEventListener('pointerdown', resume, { once: true, passive: true });
                window.addEventListener('touchstart', resume, { once: true, passive: true });
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
    
    // Initialize Grid (Optimized LCP)
    if (gridLayer) {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => initGrid());
        } else {
            setTimeout(() => initGrid(), 0);
        }
    }

    // Handle Resize
    let resizeTimeout;
    let lastWidth = window.innerWidth;
    
    window.addEventListener('resize', () => {
        // Ignore vertical resizes (e.g. mobile address bar)
        if (window.innerWidth === lastWidth) return;
        lastWidth = window.innerWidth;

        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (gridLayer) {
                if ('requestIdleCallback' in window) {
                    requestIdleCallback(() => initGrid());
                } else {
                    setTimeout(() => initGrid(), 0);
                }
            }
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
    requestAnimationFrame(() => {
        startHeroSequence();
    });

    function startHeroSequence() {
        if (heroSvg) {
            heroSvg.classList.add('hero-anim-start');
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

        if (shouldAutoplayHeroVideo()) {
            setTimeout(() => {
                startHeroVideo();
            }, 150);
        }
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
    }, { passive: true });

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
    
    // Fallback Videos (Hardcoded in case API fails)
    const FALLBACK_VIDEOS = [
        {
            guid: 'yt:video:eQpK3q0sHm0',
            title: 'Lysa Chain - Live @ DJanes.net Italy 24.11.2023 / Melodic Techno & Progressive House DJ Mix',
            pubDate: '2023-11-24 12:00:00'
        },
        {
            guid: 'yt:video:SGH1ZaYUMXY',
            title: 'Lysa Chain - Live set @ DHOME Club',
            pubDate: '2023-01-08 12:00:00'
        },
        {
            guid: 'yt:video:B2JQuG0XnP0',
            title: 'Lysa Chain - Melodic techno Live set',
            pubDate: '2022-06-01 12:00:00' // Estimated based on context
        },
        {
            guid: 'yt:video:Bud5c2Gy12g',
            title: 'Lysa Chain - Live @ DJanes.net 25.11.2021',
            pubDate: '2021-11-25 12:00:00'
        },
        {
            guid: 'yt:video:yJa4ZOx4uNw',
            title: 'Lysa Chain | Castle of Toppo | Italy',
            pubDate: '2020-11-27 12:00:00'
        }
    ];

    // Featured Video Container
    const featuredContainer = document.getElementById('featured-video-container');
    const carouselContainer = document.getElementById('dynamic-video-carousel');

    // Fetch Videos
    fetch(RSS_URL)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok' && data.items.length > 0) {
                const videos = data.items;
                processVideos(videos);
            } else {
                throw new Error('No items found or API error');
            }
        })
        .catch(err => {
            console.warn('YouTube Fetch Error, using fallback:', err);
            processVideos(FALLBACK_VIDEOS);
        });

    function processVideos(videos) {
        if (!videos || videos.length === 0) return;

        // Sort videos by date (Newest first)
        // Ensure we handle cases where pubDate might be missing (though unlikely in RSS)
        videos.sort((a, b) => {
            const dateA = new Date(a.pubDate || 0);
            const dateB = new Date(b.pubDate || 0);
            return dateB - dateA;
        });

        // 1. Featured Video (Latest)
        const latestVideo = videos[0];
        updateFeaturedVideo(latestVideo);

        // 2. Carousel (Rest)
        // If we have enough videos, skip the first one for carousel. 
        // If few, maybe show all in carousel? Let's follow original logic: slice(1)
        const carouselVideos = videos.length > 1 ? videos.slice(1) : videos;
        renderCarousel(carouselVideos);
    }

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
            carouselContainer.scrollBy({ left: -400, behavior: scrollBehavior });
        });
        nextBtn.addEventListener('click', () => {
            carouselContainer.scrollBy({ left: 400, behavior: scrollBehavior });
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
        '/#about': 'about-layer',
        '/#about-layer': 'about-layer',
        '/#music': 'music-layer',
        '/#music-layer': 'music-layer',
        '/#video': 'video-content-layer',
        '/#video-content-layer': 'video-content-layer',
        '/#contact': 'contact-layer',
        '/#contact-layer': 'contact-layer'
    };

    function handleNavigation(path, push = false) {
        // Strip trailing slash if present (except root)
        const targetId = routeMap[path] || routeMap['/' + path]; // Handle both #about and /#about
        
        if (!targetId) return;

        const targetEl = document.getElementById(targetId);
        if (targetEl) {
            // No pushState needed for hash navigation, browser handles it or we just scroll
            
            if (targetId === 'hero-layers') {
                window.scrollTo({ top: 0, behavior: scrollBehavior });
                // Clean URL hash if going to home
                if (push && history.pushState) history.pushState(null, null, '/'); 
            } else {
                // Header offset logic
                const headerOffset = 80;
                const elementPosition = targetEl.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: scrollBehavior
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
            if (href && (routeMap[href] || href === '/')) {
                e.preventDefault();
                handleNavigation(href, true);
                // Manually set hash if needed for bookmarking, but avoid reload
                history.replaceState(null, null, href === '/' ? '/' : href);
            }
        });
    });

    // Handle Browser Back/Forward - Hash change
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash;
        if (hash) {
             handleNavigation('/' + hash, false);
        } else {
             handleNavigation('/', false);
        }
    });

    // Handle Initial Load (Direct Access)
    // Check both hash and pathname for legacy support
    const initialHash = window.location.hash;
    const initialPath = window.location.pathname;
    
    let targetRoute = null;
    if (initialHash) {
        targetRoute = '/' + initialHash;
    } else if (initialPath !== '/' && initialPath !== '/index.html') {
        // Map legacy paths to hash paths
        const legacyMap = {
            '/about': '/#about',
            '/music': '/#music',
            '/video': '/#video',
            '/contact': '/#contact'
        };
        targetRoute = legacyMap[initialPath.replace(/\/$/, '')];
    }

    if (targetRoute && routeMap[targetRoute]) {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                handleNavigation(targetRoute, false);
            });
        });
    }
});
