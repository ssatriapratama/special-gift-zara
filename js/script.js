document.addEventListener('DOMContentLoaded', () => {
    // Check if config exists
    if (typeof config === 'undefined') {
        console.error("Config not found. Please ensure data.js is loaded.");
        return;
    }

    // 0. PIN Screen Logic
    const pinScreen = document.getElementById('pinScreen');
    const pinBox = document.getElementById('pinBox');
    const welcomeBox = document.getElementById('welcomeBox');
    const pinDots = document.querySelectorAll('.pin-dot');
    const pinBtns = document.querySelectorAll('.pin-btn');
    const pinMessage = document.getElementById('pinMessage');
    const welcomeNameDisplay = document.getElementById('welcomeNameDisplay');
    const wrongOverlay = document.getElementById('wrongOverlay');
    const wrongMessageText = document.getElementById('wrongMessageText');
    const clueSection = document.getElementById('clueSection');
    const clueToggle = document.getElementById('clueToggle');
    const clueText = document.getElementById('clueText');

    const mockingTexts = [
        "Ehhh salah dong 😂",
        "Yakin tuh? Coba lagi!",
        "Aduh... bukan itu deh 😆",
        "Maknyak emang lemot 🙈",
        "Hayo inget-inget lagi!",
        "Pede banget salah mulu 🤭",
        "Wkwkwk salah lagi!",
        "Coba lebih serius dikit! 😂",
    ];

    let enteredPin = '';
    let wrongCount = 0;
    let isChecking = false;
    const correctPin = config.secretPin || '123456';

    if (pinScreen) {
        document.body.style.overflow = 'hidden';

        if (welcomeNameDisplay) {
            welcomeNameDisplay.textContent = config.partnerName || "Sayang";
        }
        if (clueText && config.pinClue) {
            clueText.textContent = '💡 ' + config.pinClue;
        }

        // Clue toggle logic
        if (clueToggle) {
            clueToggle.addEventListener('click', () => {
                clueText.classList.toggle('hidden');
            });
        }

        // On-screen buttons
        pinBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (isChecking) return;
                if (btn.classList.contains('pin-clear')) {
                    enteredPin = '';
                    updatePinDisplay();
                } else if (btn.classList.contains('pin-del')) {
                    enteredPin = enteredPin.slice(0, -1);
                    updatePinDisplay();
                } else {
                    if (enteredPin.length < 6) {
                        enteredPin += btn.dataset.val;
                        updatePinDisplay();
                        if (enteredPin.length === 6) checkPin();
                    }
                }
            });
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (isChecking) return;
            if (pinScreen && !pinScreen.classList.contains('hidden')) {
                if (e.key >= '0' && e.key <= '9') {
                    if (enteredPin.length < 6) {
                        enteredPin += e.key;
                        updatePinDisplay();
                        if (enteredPin.length === 6) checkPin();
                    }
                } else if (e.key === 'Backspace') {
                    enteredPin = enteredPin.slice(0, -1);
                    updatePinDisplay();
                } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
                    enteredPin = '';
                    updatePinDisplay();
                }
            }
        });

        function updatePinDisplay() {
            pinDots.forEach((dot, index) => {
                dot.classList.toggle('filled', index < enteredPin.length);
                dot.classList.remove('error');
            });
            if (enteredPin.length === 0) {
                pinMessage.textContent = 'Type 6 digits';
            } else {
                pinMessage.textContent = '';
            }
        }

        function unlockSuccess() {
            // Correct PIN: Show Welcome Animation
            pinBox.classList.add('hidden');
            welcomeBox.classList.remove('hidden');
            
            // Create Confetti
            createConfetti();

            // Unlock after 2.5 seconds — remove pinScreen, show mainContent
            setTimeout(() => {
                // Fully remove PIN screen from DOM flow
                pinScreen.style.display = 'none';
                document.body.style.overflow = 'auto';
                
                // Show main content with entrance animation
                const mainContent = document.getElementById('mainContent');
                if (mainContent) {
                    mainContent.style.display = 'block'; // ensure visible
                    // Trigger reflow so transition fires
                    mainContent.getBoundingClientRect();
                    mainContent.classList.add('web-loaded');
                }

                const bgMusic = document.getElementById('bgMusic');
                const musicToggle = document.getElementById('musicToggle');
                if (bgMusic && bgMusic.paused) {
                    bgMusic.play().then(() => {
                        if (musicToggle) musicToggle.classList.add('playing');
                    }).catch(e => console.log(e));
                }
            }, 2500);
        }

        function checkPin() {
            isChecking = true;
            if (enteredPin === correctPin) {
                // Correct — trigger success animation then unlock
                pinDots.forEach(dot => dot.classList.add('filled'));
                setTimeout(unlockSuccess, 300);
            } else {
                // Wrong PIN
                wrongCount++;
                pinDots.forEach(dot => dot.classList.add('error'));

                // Show sticker + mocking text in overlay
                const mockText = mockingTexts[Math.floor(Math.random() * mockingTexts.length)];
                if (wrongMessageText) wrongMessageText.textContent = mockText;
                if (wrongOverlay) wrongOverlay.classList.remove('hidden');

                // After animation, reset and show clue offer
                setTimeout(() => {
                    enteredPin = '';
                    pinDots.forEach(dot => {
                        dot.classList.remove('filled', 'error');
                    });
                    pinMessage.textContent = 'Type 6 digits';
                    if (wrongOverlay) wrongOverlay.classList.add('hidden');

                    // Show clue section after first wrong attempt
                    if (clueSection && wrongCount >= 1) {
                        clueSection.classList.remove('hidden');
                        clueSection.classList.add('clue-appear');
                    }

                    isChecking = false;
                }, 2500);
            }
        }

        function createConfetti() {
            const container = document.getElementById('confettiContainer');
            const elements = ['🌸', '💖', '✨', '💕', '🌺'];
            for (let i = 0; i < 60; i++) {
                const petal = document.createElement('div');
                petal.className = 'petal';
                petal.textContent = elements[Math.floor(Math.random() * elements.length)];
                petal.style.left = Math.random() * 100 + 'vw';
                petal.style.animationDuration = (Math.random() * 3 + 2.5) + 's';
                petal.style.animationDelay = Math.random() * 0.5 + 's';
                petal.style.fontSize = (Math.random() * 15 + 15) + 'px';
                container.appendChild(petal);
            }
        }
    }

    // 1. Inject Data from config
    try {
        document.getElementById('partnerNameDisplay').textContent = config.partnerName;
        document.getElementById('coverSubtitle').textContent = config.openingSubtitle;
        
        // Use placeholders if image loading fails for local paths without images
        const handleImgError = (e) => {
            e.target.src = `https://via.placeholder.com/400x400.png?text=Photo+Not+Found`;
        };

        // Story
        if (document.getElementById('storyText')) document.getElementById('storyText').textContent = config.storyText;
        const storyImg = document.getElementById('storyImage');
        if (storyImg) {
            storyImg.src = config.storyImage;
            storyImg.onerror = handleImgError;
        }
        let dateText = config.storyDate || '';
        if (config.storyLocation) {
            dateText += ' - ' + config.storyLocation;
        }
        if (document.getElementById('storyDate')) document.getElementById('storyDate').textContent = dateText;
        if (document.getElementById('storyCaption')) document.getElementById('storyCaption').textContent = config.storyCaption;

        // Timeline
        const timelineContainer = document.getElementById('timelineContainer');
        if (config.timeline && config.timeline.length > 0) {
            config.timeline.forEach((item, index) => {
                const div = document.createElement('div');
                div.className = `timeline-item reveal ${index % 2 === 0 ? 'left' : 'right'}`;
                
                let imgHtml = '';
                if (item.image) {
                    let captionHtml = item.photoCaption ? `<div class="timeline-photo-caption">${item.photoCaption}</div>` : '';
                    imgHtml = `
                        <div class="timeline-photo-wrapper">
                            <img src="${item.image}" alt="${item.title}" class="timeline-img" onerror="this.src='https://via.placeholder.com/400x300.png?text=Timeline+Photo'">
                            ${captionHtml}
                        </div>
                    `;
                }

                div.innerHTML = `
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <div class="timeline-text">
                            <h3>${item.title}</h3>
                            <p>${item.description}</p>
                        </div>
                        ${imgHtml}
                    </div>
                `;
                timelineContainer.appendChild(div);
            });
        }

        // Memory Wall
        const memoryGallery = document.getElementById('memoryGallery');
        if (config.memories && config.memories.length > 0) {
            config.memories.forEach((mem, index) => {
                const div = document.createElement('div');
                div.className = `memory-item reveal ${mem.type === 'polaroid' ? 'polaroid-style' : ''}`;
                
                let rot = Math.random() * 8 - 4; // Random rotation -4 to 4
                if (mem.type === 'polaroid') {
                    div.style.transform = `rotate(${rot}deg)`;
                }

                const stickerClasses = ['sticker-top-right', 'sticker-bottom-left', 'sticker-bottom-right'];
                const stickerClass = stickerClasses[index % stickerClasses.length];

                const img = document.createElement('img');
                img.src = mem.image;
                img.alt = mem.caption;
                img.loading = "lazy";
                img.onerror = handleImgError;
                
                div.appendChild(img);
                
                if (mem.type === 'polaroid') {
                    const cap = document.createElement('div');
                    cap.className = 'polaroid-caption';
                    cap.textContent = mem.caption;
                    div.appendChild(cap);
                    
                    // Add sticker to polaroids
                    const sticker = document.createElement('img');
                    sticker.src = "assets/gambar/bunga.jpeg";
                    sticker.className = `corner-sticker ${stickerClass}`;
                    div.appendChild(sticker);
                }

                div.addEventListener('click', () => openLightbox(mem.image, mem.caption));
                memoryGallery.appendChild(div);
            });
        }

        // Things I Love
        const reasonsContainer = document.getElementById('reasonsContainer');
        if (config.thingsILove && config.thingsILove.length > 0) {
            config.thingsILove.forEach((reason, index) => {
                const div = document.createElement('div');
                div.className = 'reason-card reveal';
                div.innerHTML = `
                    <img src="assets/gambar/bunga.jpeg" class="corner-sticker ${index % 2 === 0 ? 'sticker-top-left' : 'sticker-bottom-right'}" style="width: 60px;" alt="">
                    ${reason}
                `;
                
                let rot = Math.random() * 6 - 3; // Random rotation -3 to 3
                div.style.transform = `rotate(${rot}deg)`;
                
                reasonsContainer.appendChild(div);
            });
        }

        // Favorites
        const favoritesContainer = document.getElementById('favoritesContainer');
        if (config.favorites && config.favorites.length > 0) {
            config.favorites.forEach((fav, index) => {
                const div = document.createElement('div');
                div.className = 'favorite-item reveal';
                div.innerHTML = `
                    <img src="assets/gambar/bunga.jpeg" class="corner-sticker ${index % 2 === 0 ? 'sticker-bottom-left' : 'sticker-top-right'}" style="width: 50px;" alt="">
                    <div class="fav-icon">${fav.icon}</div>
                    <div class="fav-text">
                        <strong>${fav.label}</strong>
                        <span>${fav.value}</span>
                    </div>
                `;
                favoritesContainer.appendChild(div);
            });
        }

        // Letter
        document.getElementById('letterText').innerHTML = config.letterText.replace(/\n/g, '<br>');
        document.getElementById('yourNameSignature').textContent = config.yourName;

        // Final Confession
        document.getElementById('confessionText').innerHTML = config.finalConfession.replace(/\n/g, '<br>');
        document.getElementById('finalDateDisplay').textContent = config.finalDate;
        document.getElementById('yourNameFinal').textContent = config.yourName;

    } catch (error) {
        console.error("Error loading data:", error);
    }

    // 2. Interactions & Logic
    const startBtn = document.getElementById('startBtn');
    const revealBtn = document.getElementById('revealBtn');
    
    // 3. Audio Control
    const musicToggle = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');
    
    const tryPlayAudio = () => {
        if (bgMusic && bgMusic.paused) {
            bgMusic.play().then(() => {
                if (musicToggle) musicToggle.classList.add('playing');
            }).catch(e => {
                console.log("Autoplay prevented:", e);
            });
        }
    };

    if (musicToggle && bgMusic) {
        // Attempt autoplay immediately
        tryPlayAudio();
        
        // Also attempt to play on the very first interaction with the body (if autoplay was blocked)
        document.body.addEventListener('click', tryPlayAudio, { once: true });

        musicToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent triggering body click
            if (bgMusic.paused) {
                tryPlayAudio();
            } else {
                bgMusic.pause();
                musicToggle.classList.remove('playing');
            }
        });
    }

    startBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        tryPlayAudio(); // Ensure audio plays when they start the story
        
        // Show all hidden sections
        document.querySelectorAll('.section.hidden').forEach(sec => sec.classList.remove('hidden'));
        
        // Smooth scroll to the first story section
        setTimeout(() => {
            document.getElementById('story').scrollIntoView({ behavior: 'smooth' });
        }, 100);
    });

    revealBtn.addEventListener('click', (e) => {
        document.querySelector('.final-intro').classList.add('display-none');
        const finalMsg = document.getElementById('finalMessage');
        finalMsg.classList.remove('display-none');
        
        // Trigger surprise heart burst animation
        triggerSurpriseHeartBurst(e);
    });

    const sendLoveBtn = document.getElementById('sendLoveBtn');
    if (sendLoveBtn) {
        sendLoveBtn.addEventListener('click', (e) => {
            for (let i = 0; i < 15; i++) {
                setTimeout(() => {
                    spawnFloatingHeart(e.clientX, e.clientY);
                }, i * 50);
            }
        });
    }

    function triggerSurpriseHeartBurst(e) {
        const hearts = ['💖', '🌸', '✨', '💕', '🌺', '👑', '❤️', '💌'];
        const startX = e && e.clientX ? e.clientX : window.innerWidth / 2;
        const startY = e && e.clientY ? e.clientY : window.innerHeight / 2;

        for (let i = 0; i < 40; i++) {
            setTimeout(() => {
                const el = document.createElement('div');
                el.className = 'floating-heart-particle';
                el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
                
                const dx = (Math.random() - 0.5) * 300;
                el.style.setProperty('--dx', `${dx}px`);
                el.style.left = `${startX + (Math.random() - 0.5) * 60}px`;
                el.style.top = `${startY + (Math.random() - 0.5) * 60}px`;
                el.style.fontSize = `${Math.random() * 20 + 20}px`;

                document.body.appendChild(el);
                setTimeout(() => el.remove(), 2000);
            }, i * 35);
        }
    }

    function spawnFloatingHeart(x, y) {
        const hearts = ['💖', '💕', '❤️', '🌸', '✨'];
        const el = document.createElement('div');
        el.className = 'floating-heart-particle';
        el.textContent = hearts[Math.floor(Math.random() * hearts.length)];

        const dx = (Math.random() - 0.5) * 160;
        el.style.setProperty('--dx', `${dx}px`);
        el.style.left = `${(x || window.innerWidth / 2) + (Math.random() - 0.5) * 40}px`;
        el.style.top = `${(y || window.innerHeight / 2) + (Math.random() - 0.5) * 20}px`;
        el.style.fontSize = `${Math.random() * 18 + 18}px`;

        document.body.appendChild(el);
        setTimeout(() => el.remove(), 2000);
    }

    // 4. Lightbox Logic
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const closeBtn = document.querySelector('.close-lightbox');

    function openLightbox(src, caption) {
        lightboxImg.src = src;
        lightboxCaption.textContent = caption;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling in background
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scrolling
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });

    // 5. Scroll Reveal with Intersection Observer
    // Handles reduced motion preferences nicely
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Stop observing once animated
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal').forEach(el => {
            observer.observe(el);
        });
    } else {
        // If reduced motion is requested, just make everything active immediately
        document.querySelectorAll('.reveal').forEach(el => {
            el.classList.add('active');
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    }
});
