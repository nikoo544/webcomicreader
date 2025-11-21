document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // CONFIGURATION - Comic Data with Panels
    // ============================================
    const comicData = [
        {
            page: 1,
            image: 'images/dragon1.png',
            panels: [
                {
                    id: 'panel1',
                    crop: { x: 1.2, y: 0.1, width: 97.9, height: 11 },
                    audio: null,
                    hasAudio: false
                },
                {
                    id: 'panel2',
                    crop: { x: 3.7, y: 16.6, width: 92.5, height: 4 },
                    audio: null,
                    hasAudio: false
                },
                {
                    id: 'panel3',
                    crop: { x: 3.7, y: 20.8, width: 92.9, height: 3.9 },
                    audio: 'audio/sound-brue-brue.mp3',
                    hasAudio: true
                },
                {
                    id: 'panel4',
                    crop: { x: 3.7, y: 20.8, width: 92.9, height: 3.9 },
                    audio: null,
                    hasAudio: false
                }
            ]
        },
        {
            page: 2,
            image: 'images/33.gif',
            panels: [
                {
                    id: 'panel1',
                    crop: { x: 0, y: 0, width: 100, height: 100 },
                    audio: 'audio/sound-brue-brue.mp3',
                    hasAudio: true
                }
            ]
        }
    ];

    // ============================================
    // STATE MANAGEMENT
    // ============================================
    let currentPageIndex = 0;
    let currentPanelIndex = 0;
    let readingMode = 'cascade'; // 'single', 'double', 'cascade', 'panel'
    let zoomLevel = 1;
    let audioEnabled = true;
    let currentAudio = null;

    const maxZoom = 3;
    const minZoom = 0.5;

    // ============================================
    // DOM ELEMENTS
    // ============================================
    const comicContainer = document.getElementById('comicContainer');
    const panelOverlay = document.getElementById('panelOverlay');
    const panelWrapper = document.getElementById('panelWrapper');
    const audioIndicator = document.getElementById('audioIndicator');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const currentPageEl = document.getElementById('currentPage');
    const totalPagesEl = document.getElementById('totalPages');
    const progressBar = document.getElementById('progressBar');
    const loader = document.getElementById('loader');
    const navHint = document.getElementById('navHint');

    // Mode Buttons
    const singleModeBtn = document.getElementById('singleModeBtn');
    const doubleModeBtn = document.getElementById('doubleModeBtn');
    const cascadeModeBtn = document.getElementById('cascadeModeBtn');
    const panelModeBtn = document.getElementById('panelModeBtn');

    // Control Buttons
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const audioToggle = document.getElementById('audioToggle');

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        // Calculate total panels
        const totalPanels = comicData.reduce((sum, page) => sum + page.panels.length, 0);
        totalPagesEl.textContent = totalPanels;

        // Set default mode to cascade (better for thin horizontal panels)
        setReadingMode('cascade');

        // Show navigation hint
        showNavigationHint();
    }

    // ============================================
    // READING MODE MANAGEMENT
    // ============================================
    function setReadingMode(mode) {
        readingMode = mode;

        // Clean up panel observer if switching away from cascade
        if (mode !== 'cascade' && panelObserver) {
            panelObserver.disconnect();
            activePanels.clear();
        }

        // Update button states
        [singleModeBtn, doubleModeBtn, cascadeModeBtn, panelModeBtn].forEach(btn =>
            btn.classList.remove('active')
        );

        if (mode === 'single') singleModeBtn.classList.add('active');
        if (mode === 'double') doubleModeBtn.classList.add('active');
        if (mode === 'cascade') cascadeModeBtn.classList.add('active');
        if (mode === 'panel') panelModeBtn.classList.add('active');

        // Update container classes
        comicContainer.className = 'comic-container';
        comicContainer.classList.add(`${mode}-mode`);

        // Reset zoom
        zoomLevel = 1;
        comicContainer.style.transform = `scale(${zoomLevel})`;

        // Render based on mode
        if (mode === 'panel') {
            panelOverlay.classList.add('active');
            renderPanelMode();
        } else {
            panelOverlay.classList.remove('active');
            stopAudio();
            renderPageMode();
        }
    }

    // ============================================
    // PANEL MODE RENDERING (CSS-based cropping)
    // ============================================
    function renderPanelMode() {
        const currentPanel = getCurrentPanel();
        if (!currentPanel) {
            console.error('No current panel found!');
            return;
        }

        console.log('Rendering panel:', currentPanel.id, 'from page', currentPageIndex + 1);
        loader.style.display = 'block';

        // Clear previous content
        panelWrapper.innerHTML = '';

        const pageData = comicData[currentPageIndex];
        console.log('Loading image:', pageData.image);

        // Create container for the cropped panel
        const panelContainer = document.createElement('div');
        panelContainer.style.position = 'relative';
        panelContainer.style.maxWidth = '90vw';
        panelContainer.style.maxHeight = '85vh';
        panelContainer.style.overflow = 'hidden';
        panelContainer.style.display = 'flex';
        panelContainer.style.alignItems = 'center';
        panelContainer.style.justifyContent = 'center';
        panelContainer.style.boxShadow = '0 20px 60px rgba(0, 242, 255, 0.2)';
        panelContainer.style.borderRadius = '8px';

        // Create the image element
        const img = new Image();

        img.onerror = (error) => {
            console.error('Failed to load image:', pageData.image, error);
            loader.style.display = 'none';

            // Show error message
            const errorMsg = document.createElement('div');
            errorMsg.style.color = '#ff4444';
            errorMsg.style.padding = '2rem';
            errorMsg.style.textAlign = 'center';
            errorMsg.innerHTML = `
                <h3>Error al cargar la imagen</h3>
                <p>No se pudo cargar: ${pageData.image}</p>
                <p style="font-size: 0.9rem; margin-top: 1rem;">Verifica que la imagen existe en la carpeta correcta.</p>
            `;
            panelWrapper.appendChild(errorMsg);
        };

        img.onload = () => {
            console.log('Image loaded successfully:', img.width, 'x', img.height);

            // Calculate crop dimensions in pixels
            const cropX = (currentPanel.crop.x / 100) * img.width;
            const cropY = (currentPanel.crop.y / 100) * img.height;
            const cropWidth = (currentPanel.crop.width / 100) * img.width;
            const cropHeight = (currentPanel.crop.height / 100) * img.height;

            console.log('Crop dimensions:', {
                x: Math.round(cropX),
                y: Math.round(cropY),
                width: Math.round(cropWidth),
                height: Math.round(cropHeight),
                percentages: currentPanel.crop
            });

            // Calculate aspect ratio of the cropped area
            const aspectRatio = cropWidth / cropHeight;

            // Set container size based on viewport
            const maxWidth = window.innerWidth * 0.9;
            const maxHeight = window.innerHeight * 0.85;

            let containerWidth, containerHeight;

            // Fit the container to viewport while maintaining aspect ratio
            if (maxWidth / aspectRatio <= maxHeight) {
                containerWidth = maxWidth;
                containerHeight = maxWidth / aspectRatio;
            } else {
                containerHeight = maxHeight;
                containerWidth = maxHeight * aspectRatio;
            }

            panelContainer.style.width = containerWidth + 'px';
            panelContainer.style.height = containerHeight + 'px';

            // Calculate scale to fit the cropped area exactly into the container
            // We want the cropped area to fill the container exactly
            const scaleX = containerWidth / cropWidth;
            const scaleY = containerHeight / cropHeight;

            // Use the scale that makes the crop area fit exactly
            // Both should be the same if aspect ratio is preserved
            const scale = scaleX; // or scaleY, they should be equal

            console.log('Scale factors:', {
                scaleX: scaleX.toFixed(3),
                scaleY: scaleY.toFixed(3),
                finalScale: scale.toFixed(3)
            });

            // Position and scale the image
            // The image needs to be scaled and positioned so that the crop area
            // aligns perfectly with the container
            img.style.position = 'absolute';
            img.style.width = (img.width * scale) + 'px';
            img.style.height = (img.height * scale) + 'px';
            img.style.left = (-cropX * scale) + 'px';
            img.style.top = (-cropY * scale) + 'px';
            img.style.objectFit = 'none';
            img.style.pointerEvents = 'none'; // Prevent image dragging

            img.alt = `Panel ${currentPanelIndex + 1}`;

            panelContainer.appendChild(img);
            panelWrapper.appendChild(panelContainer);
            loader.style.display = 'none';

            console.log('✅ Panel rendered successfully');
            console.log('Container size:', containerWidth.toFixed(0), 'x', containerHeight.toFixed(0));
            console.log('Image scaled size:', (img.width * scale).toFixed(0), 'x', (img.height * scale).toFixed(0));
            console.log('Image offset:', (-cropX * scale).toFixed(0), ',', (-cropY * scale).toFixed(0));

            // Handle audio
            handlePanelAudio(currentPanel);
        };

        img.src = pageData.image;

        updateUI();
    }

    // ============================================
    // PAGE MODE RENDERING (Single/Double/Cascade)
    // ============================================
    function renderPageMode() {
        comicContainer.innerHTML = '';
        loader.style.display = 'block';

        const pages = comicData.map(p => p.image);

        if (readingMode === 'cascade') {
            // Render all pages with panel markers
            pages.forEach((src, pageIndex) => {
                const pageWrapper = document.createElement('div');
                pageWrapper.className = 'page-wrapper';
                pageWrapper.style.position = 'relative';
                pageWrapper.setAttribute('data-page-index', pageIndex);

                const img = createComicImage(src, pageIndex);
                img.onload = () => {
                    // Add panel markers after image loads
                    addPanelMarkers(pageWrapper, img, pageIndex);
                };

                pageWrapper.appendChild(img);
                comicContainer.appendChild(pageWrapper);
            });
            loader.style.display = 'none';

            // Setup scroll detection for panels
            setupScrollDetection();

        } else if (readingMode === 'double') {
            // Render current and next page
            const img1 = createComicImage(pages[currentPageIndex], currentPageIndex);
            comicContainer.appendChild(img1);

            if (currentPageIndex + 1 < pages.length) {
                const img2 = createComicImage(pages[currentPageIndex + 1], currentPageIndex + 1);
                comicContainer.appendChild(img2);
            }
            loader.style.display = 'none';

        } else {
            // Single mode
            const img = createComicImage(pages[currentPageIndex], currentPageIndex);
            comicContainer.appendChild(img);
            loader.style.display = 'none';
        }

        updateUI();
    }

    function createComicImage(src, index) {
        const img = document.createElement('img');
        img.src = src;
        img.className = 'comic-page';
        img.alt = `Page ${index + 1}`;
        img.loading = 'lazy';
        return img;
    }

    // ============================================
    // PANEL MARKERS FOR CASCADE MODE
    // ============================================
    function addPanelMarkers(pageWrapper, img, pageIndex) {
        const pageData = comicData[pageIndex];
        if (!pageData || !pageData.panels) return;

        pageData.panels.forEach((panel, panelIndex) => {
            // Create invisible marker div at panel position
            const marker = document.createElement('div');
            marker.className = 'panel-marker';
            marker.setAttribute('data-page', pageIndex);
            marker.setAttribute('data-panel', panelIndex);
            marker.setAttribute('data-panel-id', panel.id);

            // Position marker based on crop coordinates
            const topPercent = panel.crop.y;
            const heightPercent = panel.crop.height;

            marker.style.position = 'absolute';
            marker.style.top = `${topPercent}%`;
            marker.style.left = '0';
            marker.style.width = '100%';
            marker.style.height = `${heightPercent}%`;
            marker.style.pointerEvents = 'none';
            marker.style.border = '2px solid rgba(0, 242, 255, 0.3)';
            marker.style.boxSizing = 'border-box';
            marker.style.transition = 'all 0.3s ease';

            // Add label
            const label = document.createElement('div');
            label.textContent = panel.id;
            label.style.position = 'absolute';
            label.style.top = '5px';
            label.style.left = '5px';
            label.style.background = 'rgba(0, 242, 255, 0.8)';
            label.style.color = '#000';
            label.style.padding = '4px 8px';
            label.style.borderRadius = '4px';
            label.style.fontSize = '12px';
            label.style.fontWeight = 'bold';
            label.style.opacity = '0';
            label.style.transition = 'opacity 0.3s ease';

            marker.appendChild(label);

            // Store audio info
            if (panel.hasAudio && panel.audio) {
                marker.setAttribute('data-audio', panel.audio);
            }

            pageWrapper.appendChild(marker);
        });
    }

    let panelObserver = null;
    let activePanels = new Set();

    function setupScrollDetection() {
        // Clean up previous observer
        if (panelObserver) {
            panelObserver.disconnect();
        }

        activePanels.clear();

        // Create Intersection Observer to detect when panels enter viewport
        const options = {
            root: null, // viewport
            rootMargin: '-20% 0px -20% 0px', // Trigger when panel is 20% into viewport
            threshold: [0, 0.5, 1.0]
        };

        panelObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const marker = entry.target;
                const panelId = marker.getAttribute('data-panel-id');
                const pageIndex = parseInt(marker.getAttribute('data-page'));
                const panelIndex = parseInt(marker.getAttribute('data-panel'));

                if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                    // Panel is in view
                    marker.style.border = '3px solid rgba(0, 242, 255, 0.8)';
                    marker.querySelector('div').style.opacity = '1';

                    // Play audio if not already played
                    const panelKey = `${pageIndex}-${panelIndex}`;
                    if (!activePanels.has(panelKey)) {
                        activePanels.add(panelKey);

                        const audioPath = marker.getAttribute('data-audio');
                        if (audioPath && audioEnabled) {
                            playPanelAudio(audioPath, panelId);
                        }

                        console.log(`📍 Panel activated: ${panelId}`);
                    }
                } else {
                    // Panel is out of view
                    marker.style.border = '2px solid rgba(0, 242, 255, 0.3)';
                    marker.querySelector('div').style.opacity = '0';
                }
            });
        }, options);

        // Observe all panel markers
        setTimeout(() => {
            const markers = document.querySelectorAll('.panel-marker');
            markers.forEach(marker => {
                panelObserver.observe(marker);
            });
            console.log(`🎯 Observing ${markers.length} panel markers`);
        }, 500); // Wait for images to load
    }

    function playPanelAudio(audioPath, panelId) {
        // Stop current audio
        stopAudio();

        // Show audio indicator
        audioIndicator.classList.add('active');

        // Play new audio
        currentAudio = new Audio(audioPath);
        currentAudio.play().catch(err => {
            console.log(`Audio playback failed for ${panelId}:`, err);
            audioIndicator.classList.remove('active');
        });

        currentAudio.onended = () => {
            audioIndicator.classList.remove('active');
        };

        console.log(`🔊 Playing audio for ${panelId}: ${audioPath}`);
    }

    // ============================================
    // NAVIGATION
    // ============================================
    function navigate(direction) {
        if (readingMode === 'panel') {
            navigatePanel(direction);
        } else if (readingMode === 'cascade') {
            // Smooth scroll by viewport height
            const scrollAmount = window.innerHeight * 0.8; // 80% of viewport height
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

            if (direction === 'next') {
                window.scrollTo({
                    top: currentScroll + scrollAmount,
                    behavior: 'smooth'
                });
            } else if (direction === 'prev') {
                window.scrollTo({
                    top: currentScroll - scrollAmount,
                    behavior: 'smooth'
                });
            }
        } else {
            navigatePage(direction);
        }
    }

    function navigatePanel(direction) {
        const totalPanels = getTotalPanels();
        const globalPanelIndex = getGlobalPanelIndex();

        if (direction === 'next') {
            if (globalPanelIndex < totalPanels - 1) {
                moveToNextPanel();
                renderPanelMode();
            }
        } else if (direction === 'prev') {
            if (globalPanelIndex > 0) {
                moveToPrevPanel();
                renderPanelMode();
            }
        }
    }

    function navigatePage(direction) {
        const step = readingMode === 'double' ? 2 : 1;

        if (direction === 'next') {
            if (currentPageIndex + step < comicData.length) {
                currentPageIndex += step;
            } else if (readingMode === 'double' && currentPageIndex + 1 < comicData.length) {
                currentPageIndex = comicData.length - 1;
            }
            renderPageMode();
            window.scrollTo(0, 0);
        } else if (direction === 'prev') {
            if (currentPageIndex - step >= 0) {
                currentPageIndex -= step;
            } else {
                currentPageIndex = 0;
            }
            renderPageMode();
            window.scrollTo(0, 0);
        }
    }

    // ============================================
    // PANEL HELPERS
    // ============================================
    function getCurrentPanel() {
        const pageData = comicData[currentPageIndex];
        return pageData ? pageData.panels[currentPanelIndex] : null;
    }

    function getTotalPanels() {
        return comicData.reduce((sum, page) => sum + page.panels.length, 0);
    }

    function getGlobalPanelIndex() {
        let index = 0;
        for (let i = 0; i < currentPageIndex; i++) {
            index += comicData[i].panels.length;
        }
        index += currentPanelIndex;
        return index;
    }

    function moveToNextPanel() {
        const currentPage = comicData[currentPageIndex];
        if (currentPanelIndex < currentPage.panels.length - 1) {
            currentPanelIndex++;
        } else {
            // Move to next page
            if (currentPageIndex < comicData.length - 1) {
                currentPageIndex++;
                currentPanelIndex = 0;
            }
        }
    }

    function moveToPrevPanel() {
        if (currentPanelIndex > 0) {
            currentPanelIndex--;
        } else {
            // Move to previous page
            if (currentPageIndex > 0) {
                currentPageIndex--;
                currentPanelIndex = comicData[currentPageIndex].panels.length - 1;
            }
        }
    }

    // ============================================
    // AUDIO MANAGEMENT
    // ============================================
    function handlePanelAudio(panel) {
        stopAudio();

        if (panel.hasAudio && panel.audio && audioEnabled) {
            // Show audio indicator
            audioIndicator.classList.add('active');

            // Play audio (if file exists)
            currentAudio = new Audio(panel.audio);
            currentAudio.play().catch(err => {
                console.log('Audio playback failed:', err);
                // Hide indicator if audio fails
                audioIndicator.classList.remove('active');
            });

            currentAudio.onended = () => {
                audioIndicator.classList.remove('active');
            };
        } else {
            audioIndicator.classList.remove('active');
        }
    }

    function stopAudio() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        }
        audioIndicator.classList.remove('active');
    }

    function toggleAudio() {
        audioEnabled = !audioEnabled;

        if (audioEnabled) {
            audioToggle.classList.remove('muted');
            audioToggle.querySelector('i').className = 'fa-solid fa-volume-high';
        } else {
            audioToggle.classList.add('muted');
            audioToggle.querySelector('i').className = 'fa-solid fa-volume-xmark';
            stopAudio();
        }
    }

    // ============================================
    // UI UPDATES
    // ============================================
    function updateUI() {
        if (readingMode === 'panel') {
            const globalIndex = getGlobalPanelIndex();
            const totalPanels = getTotalPanels();

            currentPageEl.textContent = globalIndex + 1;
            totalPagesEl.textContent = totalPanels;

            prevBtn.disabled = globalIndex === 0;
            nextBtn.disabled = globalIndex === totalPanels - 1;

            const progress = ((globalIndex + 1) / totalPanels) * 100;
            progressBar.style.width = `${progress}%`;

        } else {
            if (readingMode === 'double' && currentPageIndex + 1 < comicData.length) {
                currentPageEl.textContent = `${currentPageIndex + 1}-${currentPageIndex + 2}`;
            } else {
                currentPageEl.textContent = currentPageIndex + 1;
            }

            totalPagesEl.textContent = comicData.length;

            prevBtn.disabled = currentPageIndex === 0;

            if (readingMode === 'double') {
                nextBtn.disabled = currentPageIndex >= comicData.length - 2;
            } else {
                nextBtn.disabled = currentPageIndex === comicData.length - 1;
            }

            if (readingMode === 'cascade') {
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'none';
            } else {
                prevBtn.style.display = 'flex';
                nextBtn.style.display = 'flex';
            }

            const progress = ((currentPageIndex + 1) / comicData.length) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }

    // ============================================
    // ZOOM & FULLSCREEN
    // ============================================
    function handleZoom(change) {
        const newZoom = zoomLevel + change;
        if (newZoom >= minZoom && newZoom <= maxZoom) {
            zoomLevel = newZoom;

            if (readingMode === 'panel') {
                panelWrapper.style.transform = `scale(${zoomLevel})`;
            } else {
                comicContainer.style.transform = `scale(${zoomLevel})`;
                comicContainer.style.transformOrigin = 'top center';
            }
        }
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error enabling fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    // ============================================
    // NAVIGATION HINT
    // ============================================
    function showNavigationHint() {
        navHint.classList.add('show');
        setTimeout(() => {
            navHint.classList.remove('show');
        }, 4000);
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    // Navigation
    prevBtn.addEventListener('click', () => navigate('prev'));
    nextBtn.addEventListener('click', () => navigate('next'));

    // Mode switches
    singleModeBtn.addEventListener('click', () => setReadingMode('single'));
    doubleModeBtn.addEventListener('click', () => setReadingMode('double'));
    cascadeModeBtn.addEventListener('click', () => setReadingMode('cascade'));
    panelModeBtn.addEventListener('click', () => setReadingMode('panel'));

    // Controls
    zoomInBtn.addEventListener('click', () => handleZoom(0.1));
    zoomOutBtn.addEventListener('click', () => handleZoom(-0.1));
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    audioToggle.addEventListener('click', toggleAudio);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            navigate('next');
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            navigate('prev');
        } else if (e.key === 'Escape' && readingMode === 'panel') {
            setReadingMode('single');
        } else if (e.key === 'm' || e.key === 'M') {
            toggleAudio();
        }
    });

    // Touch/Swipe support for panel mode
    let touchStartX = 0;
    let touchEndX = 0;

    panelOverlay.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    panelOverlay.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next
                navigate('next');
            } else {
                // Swipe right - prev
                navigate('prev');
            }
        }
    }

    // Scroll progress for cascade mode
    window.addEventListener('scroll', () => {
        if (readingMode === 'cascade') {
            const scrollTop = window.scrollY;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.width = `${scrollPercent}%`;
        }
    });

    // ============================================
    // START APPLICATION
    // ============================================
    init();
});
