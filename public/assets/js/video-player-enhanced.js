// Enhanced Video Player for Amplifi - Complete Creator Platform
// Includes: Picture-in-Picture, Speed Controls, Chapters, Captions, End Screens, Annotations

class EnhancedVideoPlayer {
    constructor(videoElement, options = {}) {
        this.video = videoElement;
        this.options = {
            enablePiP: true,
            enableSpeedControls: true,
            enableChapters: true,
            enableCaptions: true,
            enableEndScreens: true,
            enableAnnotations: true,
            enableAutoQuality: true,
            enableKeyboardShortcuts: true,
            ...options
        };
        
        this.currentSpeed = 1;
        this.speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
        this.chapters = [];
        this.captions = [];
        this.annotations = [];
        this.endScreenCards = [];
        this.isPiPActive = false;
        this.qualityLevels = ['144p', '240p', '360p', '480p', '720p', '1080p'];
        this.currentQuality = '720p';
        
        this.init();
    }

    init() {
        this.setupVideoElement();
        this.createPlayerControls();
        this.setupEventListeners();
        this.loadVideoMetadata();
        this.setupKeyboardShortcuts();
        
        if (this.options.enablePiP) this.setupPictureInPicture();
        if (this.options.enableSpeedControls) this.setupSpeedControls();
        if (this.options.enableChapters) this.setupChapters();
        if (this.options.enableCaptions) this.setupCaptions();
        if (this.options.enableEndScreens) this.setupEndScreens();
        if (this.options.enableAnnotations) this.setupAnnotations();
        if (this.options.enableAutoQuality) this.setupAutoQuality();
        
        console.log('🎥 Enhanced Video Player initialized with all professional features');
    }

    setupVideoElement() {
        // Add required attributes
        this.video.setAttribute('playsinline', '');
        this.video.setAttribute('webkit-playsinline', '');
        this.video.setAttribute('controls', '');
        
        // Create video wrapper
        this.videoWrapper = document.createElement('div');
        this.videoWrapper.className = 'enhanced-video-wrapper';
        this.video.parentNode.insertBefore(this.videoWrapper, this.video);
        this.videoWrapper.appendChild(this.video);
        
        // Add custom controls container
        this.controlsContainer = document.createElement('div');
        this.controlsContainer.className = 'enhanced-video-controls';
        this.videoWrapper.appendChild(this.controlsContainer);
    }

    createPlayerControls() {
        // Progress bar with chapters
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'video-progress-bar';
        this.progressBar.innerHTML = `
            <div class="progress-track">
                <div class="progress-fill"></div>
                <div class="progress-handle"></div>
            </div>
            <div class="time-display">
                <span class="current-time">0:00</span>
                <span class="duration">0:00</span>
            </div>
        `;

        // Control buttons
        this.controlButtons = document.createElement('div');
        this.controlButtons.className = 'video-control-buttons';
        this.controlButtons.innerHTML = `
            <button class="play-pause" title="Play/Pause">
                <i class="fas fa-play"></i>
            </button>
            <button class="rewind" title="Rewind 10s">
                <i class="fas fa-backward"></i>
            </button>
            <button class="forward" title="Forward 10s">
                <i class="fas fa-forward"></i>
            </button>
            <div class="volume-control">
                <button class="volume" title="Mute/Unmute">
                    <i class="fas fa-volume-up"></i>
                </button>
                <input type="range" class="volume-range" min="0" max="100" value="100">
            </div>
            <button class="speed" title="Playback Speed">
                <span class="speed-text">1x</span>
            </button>
            <button class="quality" title="Video Quality">
                <i class="fas fa-cog"></i>
            </button>
            <button class="captions" title="Captions">
                <i class="fas fa-closed-captioning"></i>
            </button>
            <button class="pip" title="Picture in Picture">
                <i class="fas fa-external-link-alt"></i>
            </button>
            <button class="fullscreen" title="Fullscreen">
                <i class="fas fa-expand"></i>
            </button>
        `;

        // Add controls to container
        this.controlsContainer.appendChild(this.progressBar);
        this.controlsContainer.appendChild(this.controlButtons);
        
        // Add styles
        this.addPlayerStyles();
    }

    setupEventListeners() {
        // Video events
        this.video.addEventListener('loadedmetadata', () => this.updateDuration());
        this.video.addEventListener('timeupdate', () => this.updateProgress());
        this.video.addEventListener('ended', () => this.showEndScreen());
        
        // Control button events
        this.controlButtons.addEventListener('click', (e) => {
            if (e.target.closest('.play-pause')) this.togglePlay();
            if (e.target.closest('.rewind')) this.seek(-10);
            if (e.target.closest('.forward')) this.seek(10);
            if (e.target.closest('.volume')) this.toggleMute();
            if (e.target.closest('.speed')) this.showSpeedMenu();
            if (e.target.closest('.quality')) this.showQualityMenu();
            if (e.target.closest('.captions')) this.toggleCaptions();
            if (e.target.closest('.pip')) this.togglePictureInPicture();
            if (e.target.closest('.fullscreen')) this.toggleFullscreen();
        });
        
        // Volume slider
        const volumeSlider = this.controlButtons.querySelector('.volume-range');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.video.volume = e.target.value / 100;
                this.updateVolumeIcon();
            });
        }
        
        // Progress bar
        this.progressBar.addEventListener('click', (e) => {
            const rect = this.progressBar.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = clickX / rect.width;
            this.seekToPercentage(percentage);
        });
    }

    setupPictureInPicture() {
        if (document.pictureInPictureEnabled) {
            this.video.addEventListener('enterpictureinpicture', () => {
                this.isPiPActive = true;
                const pipBtn = this.controlButtons.querySelector('.pip');
                if (pipBtn) pipBtn.classList.add('active');
            });
            
            this.video.addEventListener('leavepictureinpicture', () => {
                this.isPiPActive = false;
                const pipBtn = this.controlButtons.querySelector('.pip');
                if (pipBtn) pipBtn.classList.remove('active');
            });
        }
    }

    setupSpeedControls() {
        this.speedMenu = document.createElement('div');
        this.speedMenu.className = 'speed-menu';
        this.speedMenu.style.display = 'none';
        this.speedMenu.innerHTML = this.speeds.map(speed => 
            `<div class="speed-option" data-speed="${speed}">${speed}x</div>`
        ).join('');
        
        this.controlButtons.appendChild(this.speedMenu);
        
        this.speedMenu.addEventListener('click', (e) => {
            if (e.target.classList.contains('speed-option')) {
                const speed = parseFloat(e.target.dataset.speed);
                this.setPlaybackSpeed(speed);
                this.speedMenu.style.display = 'none';
            }
        });
    }

    setupChapters() {
        this.chaptersContainer = document.createElement('div');
        this.chaptersContainer.className = 'video-chapters';
        this.controlsContainer.appendChild(this.chaptersContainer);
    }

    setupCaptions() {
        this.captionsContainer = document.createElement('div');
        this.captionsContainer.className = 'video-captions';
        this.videoWrapper.appendChild(this.captionsContainer);
        this.loadCaptions();
    }

    setupEndScreens() {
        this.endScreenContainer = document.createElement('div');
        this.endScreenContainer.className = 'video-end-screen';
        this.endScreenContainer.style.display = 'none';
        this.videoWrapper.appendChild(this.endScreenContainer);
    }

    setupAnnotations() {
        this.annotationsContainer = document.createElement('div');
        this.annotationsContainer.className = 'video-annotations';
        this.videoWrapper.appendChild(this.annotationsContainer);
    }

    setupAutoQuality() {
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => {
                this.adjustQualityForNetwork();
            });
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePlay();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.seek(-10);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.seek(10);
                    break;
                case 'KeyM':
                    e.preventDefault();
                    this.toggleMute();
                    break;
                case 'KeyF':
                    e.preventDefault();
                    this.toggleFullscreen();
                    break;
                case 'KeyC':
                    e.preventDefault();
                    this.toggleCaptions();
                    break;
                case 'Digit1': case 'Digit2': case 'Digit3': case 'Digit4': case 'Digit5':
                case 'Digit6': case 'Digit7': case 'Digit8': case 'Digit9':
                    e.preventDefault();
                    const percentage = parseInt(e.code.replace('Digit', '')) * 10;
                    this.seekToPercentage(percentage / 100);
                    break;
                case 'Digit0':
                    e.preventDefault();
                    this.seekToPercentage(0);
                    break;
            }
        });
    }

    togglePlay() {
        if (this.video.paused) {
            this.video.play();
            const playBtn = this.controlButtons.querySelector('.play-pause i');
            if (playBtn) playBtn.className = 'fas fa-pause';
        } else {
            this.video.pause();
            const playBtn = this.controlButtons.querySelector('.play-pause i');
            if (playBtn) playBtn.className = 'fas fa-play';
        }
    }

    seek(seconds) {
        this.video.currentTime += seconds;
    }

    seekToPercentage(percentage) {
        this.video.currentTime = this.video.duration * percentage;
    }

    toggleMute() {
        this.video.muted = !this.video.muted;
        this.updateVolumeIcon();
    }

    setPlaybackSpeed(speed) {
        this.video.playbackRate = speed;
        this.currentSpeed = speed;
        const speedText = this.controlButtons.querySelector('.speed-text');
        if (speedText) speedText.textContent = `${speed}x`;
    }

    togglePictureInPicture() {
        if (this.isPiPActive) {
            document.exitPictureInPicture();
        } else {
            this.video.requestPictureInPicture();
        }
    }

    toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            this.videoWrapper.requestFullscreen();
        }
    }

    toggleCaptions() {
        const captionsBtn = this.controlButtons.querySelector('.captions');
        if (captionsBtn) captionsBtn.classList.toggle('active');
        
        if (this.captionsContainer) {
            this.captionsContainer.style.display = 
                this.captionsContainer.style.display === 'none' ? 'block' : 'none';
        }
    }

    showSpeedMenu() {
        if (this.speedMenu) {
            this.speedMenu.style.display = 
                this.speedMenu.style.display === 'block' ? 'none' : 'block';
        }
    }

    showQualityMenu() {
        console.log('Quality menu clicked');
    }

    updateProgress() {
        if (!this.video.duration) return;
        
        const progress = (this.video.currentTime / this.video.duration) * 100;
        const progressFill = this.progressBar.querySelector('.progress-fill');
        if (progressFill) progressFill.style.width = `${progress}%`;
        
        const currentTime = this.progressBar.querySelector('.current-time');
        if (currentTime) currentTime.textContent = this.formatTime(this.video.currentTime);
        
        this.updateChaptersProgress();
        this.showAnnotationsAtTime(this.video.currentTime);
    }

    updateDuration() {
        const duration = this.progressBar.querySelector('.duration');
        if (duration) duration.textContent = this.formatTime(this.video.duration);
    }

    updateVolumeIcon() {
        const volumeBtn = this.controlButtons.querySelector('.volume i');
        if (!volumeBtn) return;
        
        if (this.video.muted || this.video.volume === 0) {
            volumeBtn.className = 'fas fa-volume-mute';
        } else if (this.video.volume < 0.5) {
            volumeBtn.className = 'fas fa-volume-down';
        } else {
            volumeBtn.className = 'fas fa-volume-up';
        }
    }

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    loadChapters() {
        this.chapters = [
            { time: 0, title: 'Introduction' },
            { time: 30, title: 'Getting Started' },
            { time: 120, title: 'Main Content' },
            { time: 300, title: 'Conclusion' }
        ];
        this.renderChapters();
    }

    renderChapters() {
        if (!this.chaptersContainer) {
            console.log('⚠️ Chapters container not found, skipping chapters render');
            return;
        }
        
        if (!this.chapters || this.chapters.length === 0) {
            this.chaptersContainer.innerHTML = '<p>No chapters available</p>';
            return;
        }
        
        this.chaptersContainer.innerHTML = this.chapters.map(chapter => 
            `<div class="chapter-item" data-time="${chapter.time}">
                <span class="chapter-time">${this.formatTime(chapter.time)}</span>
                <span class="chapter-title">${chapter.title}</span>
            </div>`
        ).join('');
        
        this.chaptersContainer.addEventListener('click', (e) => {
            if (e.target.closest('.chapter-item')) {
                const time = parseInt(e.target.closest('.chapter-item').dataset.time);
                this.video.currentTime = time;
            }
        });
    }

    updateChaptersProgress() {
        if (!this.chapters || !this.chaptersContainer) return;
        
        const currentTime = this.video.currentTime;
        this.chapters.forEach((chapter, index) => {
            if (currentTime >= chapter.time && 
                (index === this.chapters.length - 1 || currentTime < this.chapters[index + 1].time)) {
                
                this.chaptersContainer.querySelectorAll('.chapter-item').forEach(item => 
                    item.classList.remove('active')
                );
                
                if (this.chaptersContainer.children[index]) {
                    this.chaptersContainer.children[index].classList.add('active');
                }
            }
        });
    }

    loadCaptions() {
        this.captions = [
            { start: 0, end: 5, text: 'Welcome to this video tutorial' },
            { start: 5, end: 10, text: 'Today we will learn about...' },
            { start: 10, end: 15, text: 'Let\'s get started!' }
        ];
    }

    showCaptionsAtTime(currentTime) {
        if (!this.captionsContainer || !this.captions) return;
        
        const currentCaption = this.captions.find(caption => 
            currentTime >= caption.start && currentTime <= caption.end
        );
        
        if (currentCaption) {
            this.captionsContainer.textContent = currentCaption.text;
        } else {
            this.captionsContainer.textContent = '';
        }
    }

    loadAnnotations() {
        this.annotations = [
            { time: 15, type: 'link', text: 'Visit our website', url: 'https://example.com' },
            { time: 45, type: 'note', text: 'Important information here' },
            { time: 90, type: 'highlight', text: 'Key point to remember' }
        ];
    }

    showAnnotationsAtTime(currentTime) {
        if (!this.annotations || !this.annotationsContainer) return;
        
        const currentAnnotation = this.annotations.find(annotation => 
            Math.abs(currentTime - annotation.time) < 2
        );
        
        if (currentAnnotation) {
            this.showAnnotation(currentAnnotation);
        }
    }

    showAnnotation(annotation) {
        if (!this.annotationsContainer) return;
        
        this.annotationsContainer.innerHTML = `
            <div class="annotation ${annotation.type}">
                <span class="annotation-text">${annotation.text}</span>
                ${annotation.url ? `<a href="${annotation.url}" target="_blank">Learn More</a>` : ''}
            </div>
        `;
        
        setTimeout(() => {
            if (this.annotationsContainer) {
                this.annotationsContainer.innerHTML = '';
            }
        }, 3000);
    }

    showEndScreen() {
        if (!this.endScreenContainer) return;
        
        this.endScreenContainer.style.display = 'block';
        this.endScreenContainer.innerHTML = `
            <div class="end-screen">
                <h3>Thanks for watching!</h3>
                <div class="end-screen-content">
                    ${this.generateEndScreenCards()}
                </div>
            </div>
        `;
    }

    generateEndScreenCards() {
        return `
            <div class="end-screen-card">
                <div class="card-thumbnail">
                    <img src="https://via.placeholder.com/200x150" alt="Related video">
                </div>
                <div class="card-info">
                    <h4>Related Video Title</h4>
                    <p>Channel Name • 1.2K views</p>
                </div>
            </div>
        `;
    }

    adjustQualityForNetwork() {
        if (navigator.connection) {
            const effectiveType = navigator.connection.effectiveType;
            const downlink = navigator.connection.downlink;
            
            let targetQuality = '720p';
            
            if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 1) {
                targetQuality = '144p';
            } else if (effectiveType === '3g' || downlink < 2) {
                targetQuality = '360p';
            } else if (effectiveType === '4g' && downlink >= 10) {
                targetQuality = '1080p';
            }
            
            this.setQuality(targetQuality);
        }
    }

    setQuality(quality) {
        this.currentQuality = quality;
        console.log(`Quality changed to ${quality}`);
    }

    addPlayerStyles() {
        const styles = `
            <style>
                .enhanced-video-wrapper {
                    position: relative;
                    width: 100%;
                    max-width: 100%;
                    background: #000;
                    border-radius: 8px;
                    overflow: hidden;
                }
                
                .enhanced-video-wrapper video {
                    width: 100%;
                    height: auto;
                    display: block;
                }
                
                .enhanced-video-controls {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(transparent, rgba(0,0,0,0.8));
                    padding: 20px 15px 15px;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                
                .enhanced-video-wrapper:hover .enhanced-video-controls {
                    opacity: 1;
                }
                
                .video-progress-bar {
                    width: 100%;
                    height: 4px;
                    background: rgba(255,255,255,0.3);
                    border-radius: 2px;
                    margin-bottom: 15px;
                    cursor: pointer;
                    position: relative;
                }
                
                .progress-track {
                    position: relative;
                    height: 100%;
                }
                
                .progress-fill {
                    height: 100%;
                    background: #ff0000;
                    border-radius: 2px;
                    transition: width 0.1s ease;
                }
                
                .progress-handle {
                    position: absolute;
                    right: -6px;
                    top: -4px;
                    width: 12px;
                    height: 12px;
                    background: #fff;
                    border-radius: 50%;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                }
                
                .time-display {
                    display: flex;
                    justify-content: space-between;
                    color: #fff;
                    font-size: 12px;
                    margin-bottom: 10px;
                }
                
                .video-control-buttons {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                
                .video-control-buttons button {
                    background: none;
                    border: none;
                    color: #fff;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 4px;
                    transition: background-color 0.2s ease;
                }
                
                .video-control-buttons button:hover {
                    background: rgba(255,255,255,0.1);
                }
                
                .video-control-buttons button.active {
                    background: rgba(255,255,255,0.2);
                }
                
                .volume-control {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .volume-range {
                    width: 60px;
                    height: 4px;
                    background: rgba(255,255,255,0.3);
                    border-radius: 2px;
                    outline: none;
                }
                
                .speed-menu {
                    position: absolute;
                    bottom: 100%;
                    left: 0;
                    background: rgba(0,0,0,0.9);
                    border-radius: 4px;
                    padding: 8px 0;
                    min-width: 80px;
                    z-index: 1000;
                }
                
                .speed-option {
                    padding: 8px 16px;
                    color: #fff;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }
                
                .speed-option:hover {
                    background: rgba(255,255,255,0.1);
                }
                
                .video-chapters {
                    margin-top: 10px;
                    padding: 10px;
                    background: rgba(0,0,0,0.7);
                    border-radius: 4px;
                }
                
                .chapter-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 5px 0;
                    cursor: pointer;
                    color: #fff;
                }
                
                .chapter-item:hover {
                    background: rgba(255,255,255,0.1);
                }
                
                .chapter-item.active {
                    color: #ff0000;
                }
                
                .video-captions {
                    position: absolute;
                    bottom: 80px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0,0,0,0.8);
                    color: #fff;
                    padding: 8px 16px;
                    border-radius: 4px;
                    max-width: 80%;
                    text-align: center;
                    display: none;
                }
                
                .video-annotations {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    max-width: 300px;
                    z-index: 1000;
                }
                
                .annotation {
                    background: rgba(0,0,0,0.9);
                    color: #fff;
                    padding: 12px;
                    border-radius: 4px;
                    margin-bottom: 10px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                }
                
                .annotation a {
                    color: #ff0000;
                    text-decoration: none;
                    margin-left: 10px;
                }
                
                .video-end-screen {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                
                .end-screen {
                    text-align: center;
                    color: #fff;
                }
                
                .end-screen h3 {
                    font-size: 24px;
                    margin-bottom: 20px;
                }
                
                .end-screen-card {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 15px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }
                
                .end-screen-card:hover {
                    background: rgba(255,255,255,0.2);
                }
                
                .card-thumbnail img {
                    width: 80px;
                    height: 60px;
                    border-radius: 4px;
                    object-fit: cover;
                }
                
                .card-info h4 {
                    margin: 0 0 5px 0;
                    font-size: 16px;
                }
                
                .card-info p {
                    margin: 0;
                    font-size: 14px;
                    opacity: 0.8;
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    loadVideo(videoUrl, metadata = {}) {
        this.video.src = videoUrl;
        this.loadVideoMetadata(metadata);
    }

    loadVideoMetadata(metadata = {}) {
        if (!metadata) {
            metadata = {};
        }
        
        if (metadata.chapters) this.chapters = metadata.chapters;
        if (metadata.captions) this.captions = metadata.captions;
        if (metadata.annotations) this.annotations = metadata.annotations;
        if (metadata.endScreenCards) this.endScreenCards = metadata.endScreenCards;
        
        if (!this.chapters || this.chapters.length === 0) {
            this.loadChapters();
        }
        if (!this.captions || this.captions.length === 0) {
            this.loadCaptions();
        }
        if (!this.annotations || this.annotations.length === 0) {
            this.loadAnnotations();
        }
        
        this.renderChapters();
    }

    destroy() {
        if (this.videoWrapper && this.videoWrapper.parentNode) {
            this.videoWrapper.remove();
        }
    }
}

// Export for global use
window.EnhancedVideoPlayer = EnhancedVideoPlayer;
