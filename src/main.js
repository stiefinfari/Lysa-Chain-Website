import './style.css';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { Renderer } from 'interactive-shader-format';
import purpleNoiseShader from './shaders/PurpleNoise.frag?raw';

// Initialize Vercel Analytics
inject();

// Initialize Vercel Speed Insights
injectSpeedInsights();

document.addEventListener('DOMContentLoaded', () => {
    // console.log("Main.js loaded - Optimization v1");
    document.body.classList.add('no-scroll');
    
    const preloader = document.getElementById('preloader');
    const mainContent = document.getElementById('main-content');
    const heroVideo = document.getElementById('hero-video');
    const logoContainer = document.getElementById('logo-layer');
    const heroVideoLayer = document.getElementById('hero-video-layer');
    const gradientBg = document.getElementById('gradient-bg');
    const gridLayer = document.getElementById('grid-layer');
    const mainMenu = document.getElementById('main-menu');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    
    // --- Dynamic Copyright Year ---
    const copyrightYear = document.getElementById('copyright-year');
    if (copyrightYear) {
        copyrightYear.textContent = new Date().getFullYear();
    }

    // --- ISF Background Initialization ---
    const isfCanvas = document.getElementById('isf-canvas');
    const isfContainer = document.getElementById('isf-container');
    let isfRenderer;
    let isISFVisible = false; // Optimization flag

    if (isfCanvas) {
        try {
            const gl = isfCanvas.getContext('webgl');
            if (gl) {
                isfRenderer = new Renderer(gl);
                isfRenderer.loadSource(purpleNoiseShader);
                
                // Handle Resize
                const resizeISF = () => {
                    isfCanvas.width = window.innerWidth;
                    isfCanvas.height = window.innerHeight;
                };
                window.addEventListener('resize', resizeISF);
                resizeISF();

                function renderISF() {
                    if (isISFVisible) { 
                        isfRenderer.draw(isfCanvas);
                        requestAnimationFrame(renderISF);
                    } else {
                        // Pause loop when hidden, will be restarted by scroll handler
                    }
                }
                
                // Expose restart function
                window.restartISF = function() {
                    requestAnimationFrame(renderISF);
                };
                
                requestAnimationFrame(renderISF);
            }
        } catch (e) {
            console.error("ISF Init Failed:", e);
        }
    }

    // Grid Assets
    const keywords = ['EPIC', 'CRAZY', 'UNIQUE'];
    let gridItems = []; 
    
    // Initialize Grid
    if (gridLayer) initGrid();

    // Handle Resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (gridLayer) initGrid();
        }, 200);
    });

    function initGrid() {
        if (!gridLayer) return;
        
        gridLayer.innerHTML = '';
        gridItems = [];
        
        const cellSize = window.innerWidth < 768 ? 80 : 120; // Optimization: Larger cells on desktop to reduce DOM nodes
        const colCount = Math.ceil(window.innerWidth / cellSize);
        const rowCount = Math.ceil(window.innerHeight / cellSize);
        const cellCount = Math.ceil(colCount * rowCount * 1.2); 
        
        for (let i = 0; i < cellCount; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-item');
            cell.dataset.index = i;
            gridLayer.appendChild(cell);
            gridItems.push(cell);
            assignPatternContent(cell, i);
            cell.style.opacity = '0.2'; 
        }
    }

    function assignPatternContent(cell, index) {
        cell.innerHTML = ''; 
        if (index % 13 === 0) {
            const word = keywords[index % keywords.length];
            const span = document.createElement('span');
            span.textContent = word;
            cell.appendChild(span);
        } else {
            const img = document.createElement('img');
            img.src = '/assets/iconlogo-unicorno-lysa-chain.png';
            img.alt = "Lysa Chain Icon";
            cell.appendChild(img);
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
        const totalDuration = 3500; 
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

                    // START 5s TIMER for Sequence
                    setTimeout(() => {
                        startHeroSequence();
                    }, 5000);
                }
            }, 800); 
        }, totalDuration);
    } else {
        if (mainContent) {
            mainContent.style.display = 'block';
            // Fallback for no preloader
            setTimeout(() => {
                startHeroSequence();
            }, 5000);
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
            document.body.classList.remove('no-scroll');
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

        // Menu Visibility - Handled by Timer (always visible after 5s)
        // We can add a check to hide it if user scrolls back to very top BEFORE 5s? 
        // No, let's keep it simple. Once revealed, it stays (unless we want sticky behavior).
        // Standard sticky header behavior usually involves checking scrollY.
        // User said "video, after 5s appears... menu bar". 
        // Let's ensure it stays visible if scrolled.
        if (mainMenu && scrollY > 50) {
             mainMenu.classList.add('visible');
        }

        // Hero Fade Logic
        // Logo & Grid are revealed by TIMER. 
        // We do NOT fade them in on scroll.
        // We might want to fade them OUT if the user scrolls down (standard parallax).
        // But user instructions focus on "appears after 5s".
        // Let's leave them static and let the About section cover them.
        
        // Scroll Indicator: Fade out on scroll
        if (scrollIndicator && scrollIndicator.classList.contains('visible')) {
             if (scrollY > 50) {
                  scrollIndicator.style.opacity = Math.max(0, 1 - (scrollY / 200));
             } else {
                  scrollIndicator.style.opacity = ''; // Let CSS class handle it
             }
        }

        // ISF Opacity Logic
        // Fade in as we scroll past the hero (approx 100vh)
        // Full opacity by the time About section (150vh) is fully visible
        if (isfContainer) {
            // Start fading in when we scroll past 50% of the viewport
            const fadeStart = windowHeight * 0.5;
            // Fully opaque when we reach the spacer end (150vh) minus some buffer
            const fadeEnd = windowHeight * 1.2;
            
            let opacity = (scrollY - fadeStart) / (fadeEnd - fadeStart);
            opacity = Math.max(0, Math.min(1, opacity));
            
            // Apply opacity
            isfContainer.style.opacity = opacity;
            
            // Update visibility flag for renderer
            const wasVisible = isISFVisible;
            isISFVisible = opacity > 0.01;
            
            if (!wasVisible && isISFVisible && window.restartISF) {
                window.restartISF();
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
        
        featuredContainer.innerHTML = `
            <div class="video-preview" style="width:100%; height:100%; background:url('${thumbnailUrl}') center/cover no-repeat; cursor:pointer; position:relative; display:flex; justify-content:center; align-items:center;">
                <div class="play-button" style="width:80px; height:80px; background:rgba(0,0,0,0.7); border-radius:50%; border:2px solid var(--neon-purple); display:flex; justify-content:center; align-items:center; box-shadow:0 0 20px var(--neon-purple);">
                    <i class="fa-solid fa-play" style="color:white; font-size:30px; margin-left:5px;"></i>
                </div>
                <div style="position:absolute; bottom:0; left:0; width:100%; padding:20px; background:linear-gradient(to top, black, transparent); color:white; font-family:'Syne', sans-serif; font-size:1.5rem; font-weight:700;">${safeTitle}</div>
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

    // --- INTERACTIVE: Custom Cursor ---
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);

    const cursorDot = document.createElement('div');
    cursorDot.classList.add('custom-cursor-dot');
    document.body.appendChild(cursorDot);

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        // Optimization: Stop loop on touch devices or small screens
        if (window.matchMedia('(hover: none) and (pointer: coarse)').matches || window.innerWidth < 768) {
            // Ensure cursor elements are hidden
            if (cursor.style.display !== 'none') {
                cursor.style.display = 'none';
                cursorDot.style.display = 'none';
            }
            // Check periodically if we switched to desktop (e.g. rotation or dock)
            setTimeout(() => requestAnimationFrame(animateCursor), 1000); 
            return;
        } else {
             if (cursor.style.display === 'none') {
                cursor.style.display = 'block';
                cursorDot.style.display = 'block';
             }
        }

        // Smooth follow for outer ring
        // Increased speed from 0.15 to 0.3 for snappier response
        const speed = 0.3;
        cursorX += (mouseX - cursorX) * speed;
        cursorY += (mouseY - cursorY) * speed;
        
        cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
        
        // Dot follows instantly using transform for performance (moved to RAF loop)
        cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover Effects
    const interactiveElements = document.querySelectorAll('a, button, .clickable, .grid-item, .social-btn, .carousel-nav, iframe');
    
    // Use event delegation for better performance and dynamic elements
    document.body.addEventListener('mouseover', (e) => {
        if (e.target.matches('a, button, .clickable, .social-btn, .carousel-nav, input, textarea') || e.target.closest('a, button, .clickable')) {
            cursor.classList.add('hovered');
        }
    });

    document.body.addEventListener('mouseout', (e) => {
        if (e.target.matches('a, button, .clickable, .social-btn, .carousel-nav, input, textarea') || e.target.closest('a, button, .clickable')) {
            cursor.classList.remove('hovered');
        }
    });

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
