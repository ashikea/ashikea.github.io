        // ============ AURORA CANVAS BACKGROUND ============
        const canvas = document.getElementById('auroraCanvas');
        const ctx = canvas.getContext('2d');
        let width, height;
        let time = 0;
        let mouseX = 0.5;
        let mouseY = 0.5;
        let targetMouseX = 0.5;
        let targetMouseY = 0.5;

        function resizeCanvas() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        document.addEventListener('mousemove', (e) => {
            targetMouseX = e.clientX / width;
            targetMouseY = e.clientY / height;
        });

        // Touch support
        document.addEventListener('touchmove', (e) => {
            targetMouseX = e.touches[0].clientX / width;
            targetMouseY = e.touches[0].clientY / height;
        }, { passive: true });

        function drawAurora() {
            mouseX += (targetMouseX - mouseX) * 0.03;
            mouseY += (targetMouseY - mouseY) * 0.03;
            time += 0.004;

            ctx.clearRect(0, 0, width, height);

            // Multiple flowing gradient blobs
            const blobs = [
                { x: width * 0.25 + Math.sin(time * 0.7) * width * 0.2, y: height * 0.35 + Math.cos(time * 0.5) * height *
                        0.25, r: Math.min(width, height) * 0.45, color: [99, 102, 241], alpha: 0.07 },
                { x: width * 0.7 + Math.cos(time * 0.6) * width * 0.25, y: height * 0.55 + Math.sin(time * 0.8) * height *
                        0.2, r: Math.min(width, height) * 0.5, color: [168, 85, 247], alpha: 0.06 },
                { x: width * 0.5 + Math.sin(time * 0.9) * width * 0.3, y: height * 0.45 + Math.cos(time * 0.55) * height *
                        0.3, r: Math.min(width, height) * 0.55, color: [20, 184, 166], alpha: 0.05 },
                { x: width * 0.4 + Math.cos(time * 0.75) * width * 0.2, y: height * 0.6 + Math.sin(time * 0.65) * height *
                        0.22, r: Math.min(width, height) * 0.4, color: [244, 114, 182], alpha: 0.04 },
                { x: width * mouseX, y: height * mouseY, r: Math.min(width, height) * 0.35, color: [139, 92, 246],
                    alpha: 0.06 },
            ];

            blobs.forEach(blob => {
                const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.r);
                gradient.addColorStop(0, `rgba(${blob.color[0]},${blob.color[1]},${blob.color[2]},${blob.alpha * 1.5})`);
                gradient.addColorStop(0.5, `rgba(${blob.color[0]},${blob.color[1]},${blob.color[2]},${blob.alpha})`);
                gradient.addColorStop(1, 'rgba(6,6,14,0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
            });

            requestAnimationFrame(drawAurora);
        }
        drawAurora();

        // ============ GLOW CURSOR FOLLOWER ============
        const glowCursor = document.getElementById('glowCursor');
        let cursorX = -500;
        let cursorY = -500;
        let currentCX = -500;
        let currentCY = -500;

        document.addEventListener('mousemove', (e) => {
            cursorX = e.clientX;
            cursorY = e.clientY;
        });
        document.addEventListener('touchmove', (e) => {
            cursorX = e.touches[0].clientX;
            cursorY = e.touches[0].clientY;
        }, { passive: true });

        function animateCursor() {
            currentCX += (cursorX - currentCX) * 0.08;
            currentCY += (cursorY - currentCY) * 0.08;
            glowCursor.style.left = currentCX + 'px';
            glowCursor.style.top = currentCY + 'px';
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Hide cursor glow on mobile
        if (window.innerWidth < 768) {
            glowCursor.style.display = 'none';
        }
        window.addEventListener('resize', () => {
            if (window.innerWidth < 768) {
                glowCursor.style.display = 'none';
            } else {
                glowCursor.style.display = 'block';
            }
        });

        // ============ MOBILE MENU ============
        const menuToggle = document.getElementById('menuToggle');
        const mobileMenu = document.getElementById('mobileMenu');
        const closeMenu = document.getElementById('closeMenu');
        const menuOverlay = document.getElementById('menuOverlay');
        const mobileLinks = mobileMenu.querySelectorAll('a');

        function openMenu() {
            mobileMenu.classList.add('active');
            menuOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeMenuFn() {
            mobileMenu.classList.remove('active');
            menuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
        menuToggle.addEventListener('click', openMenu);
        closeMenu.addEventListener('click', closeMenuFn);
        menuOverlay.addEventListener('click', closeMenuFn);
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(closeMenuFn, 200);
            });
        });

        // ============ SCROLL REVEAL ============
        const revealElements = document.querySelectorAll('.reveal');
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -60px 0px',
            threshold: 0.1,
        };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        revealElements.forEach(el => observer.observe(el));

        // ============ 3D TILT FOR PROJECT CARDS ============
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;
                card.style.transform =
                    `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
                card.style.transition = 'transform 0.1s ease-out';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
                card.style.transition = 'transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1)';
            });
        });

        // ============ MAGNETIC BUTTONS ============
        const magneticBtns = document.querySelectorAll('.btn, .hire-btn, .mobile-hire-btn, .contact-pill');
        magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
                btn.style.transition = 'transform 0.15s ease-out';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0px, 0px)';
                btn.style.transition = 'transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1)';
            });
        });

        // ============ SKILL ORB HOVER INTERACTION ============
        const skillOrbs = document.querySelectorAll('.skill-orb');
        skillOrbs.forEach(orb => {
            orb.addEventListener('mouseenter', () => {
                orb.style.transform = 'scale(1.08)';
                orb.style.zIndex = '5';
            });
            orb.addEventListener('mouseleave', () => {
                orb.style.transform = 'scale(1)';
                orb.style.zIndex = '1';
            });
        });

        console.log('%c🚀 Ashik E A — Cosmic Portfolio %cLoaded',
            'color:#a855f7;font-size:1.2rem;font-weight:bold;',
            'color:#14b8a6;');
        console.log('%cThanks for checking out the source! Feel free to connect.',
            'color:#a0a0c0;font-style:italic;');