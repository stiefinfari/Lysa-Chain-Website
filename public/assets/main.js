document.addEventListener('DOMContentLoaded', () => {
    // --- Preloader Logic ---
    const preloader = document.getElementById('preloader');
    const mainContent = document.getElementById('main-content');
    const heroVideo = document.getElementById('hero-video'); 
    const logoContainer = document.getElementById('logo-layer');

    // 1. Setup Logo Animations
    // Le animazioni sono gestite interamente da CSS (style.css).
    // Non c'è bisogno di aggiungere classi via JS.

    // 2. Clone Logo to Hero (if needed) or just ensure visibility logic
    if (preloader && logoContainer) {
        const preloaderSvg = preloader.querySelector('svg');
        if (preloaderSvg) {
            const heroSvg = preloaderSvg.cloneNode(true);
            // Remove animations from hero clone initially or reset them
            heroSvg.querySelectorAll('image').forEach(img => {
                img.style.animation = 'none';
                img.style.opacity = '1';
            });
            logoContainer.innerHTML = ''; // Clear existing
            logoContainer.appendChild(heroSvg);
        }
    }

    // 3. Dismiss Preloader
    if (preloader) {
        // Durata Animazione Totale:
        // Ultimo elemento (C) inizia il glow a 2.8s e finisce a 3.8s.
        // Aggiungiamo un piccolo margine (200ms) -> 4.0s
        
        setTimeout(() => {
            // Dissolvenza finale (Opacità 1 -> 0)
            preloader.style.opacity = '0';
            
            // Rimozione dal DOM dopo la transizione (0.8s definiti in CSS)
            setTimeout(() => {
                preloader.style.display = 'none';
                if (mainContent) {
                    mainContent.style.display = 'block';
                    // Trigger reflow
                    void mainContent.offsetWidth;
                    mainContent.style.opacity = '1';
                    
                    if (heroVideo) {
                        heroVideo.play().catch(e => console.error("Autoplay failed", e));
                    }
                }
            }, 800); 
        }, 4000); // 4.0s total time
    }

    // --- Scroll & Parallax Logic ---
    let ticking = false;
    const videoLayer = document.getElementById('video-layer');
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                const windowHeight = window.innerHeight;
                
                // Video Fade Out Effect
                const fadeEnd = windowHeight * 0.8; 
                let opacity = 1 - (scrollY / fadeEnd);
                
                if (opacity < 0) opacity = 0;
                if (opacity > 1) opacity = 1;
                
                if (videoLayer) {
                    videoLayer.style.opacity = opacity;
                }
                ticking = false;
            });
            ticking = true;
        }
    });
});
