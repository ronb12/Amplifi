// Video Manager for Amplifi - Handles both long and short videos
// Professional video features and management

class VideoManager {
    constructor() {
        this.config = {
            maxVideoSize: 100 * 1024 * 1024, // 100MB
            supportedFormats: ['mp4', 'webm', 'mov', 'avi', 'mkv'],
            shortVideoThreshold: 60, // Videos under 60 seconds are "shorts"
            longVideoThreshold: 600, // Videos over 10 minutes are "long-form"
            qualityOptions: ['144p', '240p', '360p', '480p', '720p', '1080p'],
            autoPlay: false,
            loop: false,
            muted: false
        };
        
        this.currentVideo = null;
        this.videoQueue = [];
        this.playbackHistory = [];
        this.userPreferences = {};
        
        this.init();
    }

    init() {
        console.log('🎥 Video Manager: Initializing...');
        this.setupEventListeners();
        this.loadUserPreferences();
        this.initializeVideoPlayers();
        console.log('✅ Video Manager: Initialized successfully');
    }

    // Setup event listeners
    setupEventListeners() {
        // Video upload events
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="upload-video"]')) {
                this.showVideoUploadModal();
            }
            
            if (e.target.matches('[data-action="record-video"]')) {
                this.showVideoRecorder();
            }
        });

        // Video player events
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="play-video"]')) {
                this.playVideo(e.target.dataset.videoId);
            }
            
            if (e.target.matches('[data-action="like-video"]')) {
                this.toggleVideoLike(e.target.dataset.videoId);
            }
            
            if (e.target.matches('[data-action="share-video"]')) {
                this.shareVideo(e.target.dataset.videoId);
            }
        });
    }

    // Show video upload modal
    showVideoUploadModal() {
        const modal = document.createElement('div');
        modal.className = 'video-upload-modal modal';
        modal.innerHTML = `
            <div class="modal-content video-upload-content">
                <div class="modal-header">
                    <h3>Upload Video</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
                </div>
                
                <div class="upload-tabs">
                    <button class="tab-btn active" data-tab="upload">Upload File</button>
                    <button class="tab-btn" data-tab="record">Record Video</button>
                    <button class="tab-btn" data-tab="url">Import from URL</button>
                </div>
                
                <div class="tab-content active" data-tab="upload">
                    <div class="upload-area" id="uploadArea">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <h4>Drag & Drop your video here</h4>
                        <p>or click to browse</p>
                        <input type="file" id="videoFileInput" accept="video/*" multiple style="display: none;">
                    </div>
                    
                    <div class="upload-options">
                        <label>
                            <input type="checkbox" id="autoProcess"> Auto-process video
                        </label>
                        <label>
                            <input type="checkbox" id="generateThumbnail"> Generate thumbnail
                        </label>
                        <label>
                            <input type="checkbox" id="addSubtitles"> Add subtitles
                        </label>
                    </div>
                </div>
                
                <div class="tab-content" data-tab="record">
                    <div class="video-recorder">
                        <video id="recorderPreview" autoplay muted></video>
                        <div class="recorder-controls">
                            <button id="startRecording" class="btn btn-primary">
                                <i class="fas fa-record-vinyl"></i> Start Recording
                            </button>
                            <button id="stopRecording" class="btn btn-danger" style="display: none;">
                                <i class="fas fa-stop"></i> Stop Recording
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="tab-content" data-tab="url">
                    <div class="url-input">
                        <input type="url" id="videoUrl" placeholder="Enter video URL (Vimeo, direct links, etc.)" class="form-input">
                        <button id="importFromUrl" class="btn btn-primary">Import Video</button>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button class="btn btn-primary" id="uploadBtn" disabled>Upload Video</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.setupUploadModalEvents(modal);
    }

    // Setup upload modal events
    setupUploadModalEvents(modal) {
        const uploadArea = modal.querySelector('#uploadArea');
        const fileInput = modal.querySelector('#videoFileInput');
        const uploadBtn = modal.querySelector('#uploadBtn');
        
        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            this.handleVideoFiles(files);
        });
        
        // Click to browse
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
        
        // File selection
        fileInput.addEventListener('change', (e) => {
            this.handleVideoFiles(e.target.files);
        });
        
        // Tab switching
        const tabBtns = modal.querySelectorAll('.tab-btn');
        const tabContents = modal.querySelectorAll('.tab-content');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                
                // Update active tab
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                btn.classList.add('active');
                modal.querySelector(`[data-tab="${tab}"]`).classList.add('active');
            });
        });
    }

    // Handle video files
    async handleVideoFiles(files) {
        const videoFiles = Array.from(files).filter(file => 
            file.type.startsWith('video/') || 
            this.config.supportedFormats.includes(file.name.split('.').pop().toLowerCase())
        );
        
        if (videoFiles.length === 0) {
            this.showNotification('Please select valid video files', 'error');
            return;
        }
        
        for (const file of videoFiles) {
            await this.processVideoFile(file);
        }
    }

    // Process video file
    async processVideoFile(file) {
        try {
            console.log('🎥 Processing video file:', file.name);
            
            // Validate file size
            if (file.size > this.config.maxVideoSize) {
                this.showNotification(`File ${file.name} is too large. Maximum size: ${this.formatFileSize(this.config.maxVideoSize)}`, 'error');
                return;
            }
            
            // Create video preview
            const videoUrl = URL.createObjectURL(file);
            const videoData = await this.analyzeVideo(file, videoUrl);
            
            // Show video preview
            this.showVideoPreview(videoData, file);
            
        } catch (error) {
            console.error('❌ Error processing video file:', error);
            this.showNotification('Error processing video file', 'error');
        }
    }

    // Analyze video file
    async analyzeVideo(file, videoUrl) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.src = videoUrl;
            video.preload = 'metadata';
            
            video.onloadedmetadata = () => {
                const duration = video.duration;
                const isShort = duration <= this.config.shortVideoThreshold;
                const isLong = duration >= this.config.longVideoThreshold;
                
                resolve({
                    name: file.name,
                    size: file.size,
                    duration: duration,
                    type: this.getVideoType(duration),
                    isShort: isShort,
                    isLong: isLong,
                    url: videoUrl,
                    file: file
                });
            };
            
            video.onerror = () => {
                resolve({
                    name: file.name,
                    size: file.size,
                    duration: 0,
                    type: 'unknown',
                    isShort: false,
                    isLong: false,
                    url: videoUrl,
                    file: file
                });
            };
        });
    }

    // Get video type based on duration
    getVideoType(duration) {
        if (duration <= this.config.shortVideoThreshold) {
            return 'short';
        } else if (duration >= this.config.longVideoThreshold) {
            return 'long-form';
        } else {
            return 'standard';
        }
    }

    // Show video preview
    showVideoPreview(videoData, file) {
        const previewContainer = document.createElement('div');
        previewContainer.className = 'video-preview-container';
        previewContainer.innerHTML = `
            <div class="video-preview">
                <video src="${videoData.url}" controls preload="metadata"></video>
                <div class="video-info">
                    <h4>${videoData.name}</h4>
                    <p>Duration: ${this.formatDuration(videoData.duration)}</p>
                    <p>Size: ${this.formatFileSize(videoData.size)}</p>
                    <p>Type: <span class="video-type ${videoData.type}">${videoData.type}</span></p>
                </div>
                <div class="video-actions">
                    <button class="btn btn-primary" onclick="videoManager.uploadVideo('${videoData.url}', ${JSON.stringify(videoData)})">
                        Upload Video
                    </button>
                    <button class="btn btn-secondary" onclick="this.closest('.video-preview-container').remove()">
                        Cancel
                    </button>
                </div>
            </div>
        `;
        
        // Add to upload modal
        const modal = document.querySelector('.video-upload-modal');
        const tabContent = modal.querySelector('[data-tab="upload"]');
        tabContent.appendChild(previewContainer);
    }

    // Upload video
    async uploadVideo(videoUrl, videoData) {
        try {
            console.log('🚀 Uploading video:', videoData.name);
            
            // Show upload progress
            this.showUploadProgress(videoData.name);
            
            // Simulate upload process
            await this.simulateUpload(videoData);
            
            // Upload to Firebase Storage
            if (typeof storage !== 'undefined') {
                await this.uploadToFirebase(videoData);
            }
            
            // Save video metadata to Firestore
            if (typeof db !== 'undefined') {
                await this.saveVideoMetadata(videoData);
            }
            
            this.showNotification(`Video "${videoData.name}" uploaded successfully!`, 'success');
            
            // Refresh video feed
            this.refreshVideoFeed();
            
        } catch (error) {
            console.error('❌ Error uploading video:', error);
            this.showNotification('Error uploading video', 'error');
        }
    }

    // Simulate upload process
    async simulateUpload(videoData) {
        return new Promise((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 20;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    resolve();
                }
                this.updateUploadProgress(progress);
            }, 200);
        });
    }

    // Upload to Firebase Storage
    async uploadToFirebase(videoData) {
        const storageRef = storage.ref();
        const videoRef = storageRef.child(`videos/${Date.now()}_${videoData.name}`);
        
        const snapshot = await videoRef.put(videoData.file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        videoData.storageUrl = downloadURL;
        console.log('✅ Video uploaded to Firebase Storage:', downloadURL);
    }

    // Save video metadata to Firestore
    async saveVideoMetadata(videoData) {
        const videoDoc = {
            title: videoData.name,
            description: '',
            duration: videoData.duration,
            type: videoData.type,
            isShort: videoData.isShort,
            isLong: videoData.isLong,
            size: videoData.size,
            url: videoData.storageUrl || videoData.url,
            thumbnail: '',
            creatorId: 'current-user-id', // Get from auth
            creatorName: 'Current User', // Get from auth
            views: 0,
            likes: 0,
            dislikes: 0,
            comments: 0,
            shares: 0,
            category: 'general',
            tags: [],
            isPublic: true,
            isMonetized: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const docRef = await db.collection('videos').add(videoDoc);
        videoData.id = docRef.id;
        
        console.log('✅ Video metadata saved to Firestore:', docRef.id);
    }

    // Show upload progress
    showUploadProgress(fileName) {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'upload-progress-container';
        progressContainer.innerHTML = `
            <div class="upload-progress">
                <div class="progress-header">
                    <span class="filename">${fileName}</span>
                    <span class="progress-percentage">0%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <div class="progress-status">Preparing upload...</div>
            </div>
        `;
        
        document.body.appendChild(progressContainer);
    }

    // Update upload progress
    updateUploadProgress(percentage) {
        const progressContainer = document.querySelector('.upload-progress-container');
        if (progressContainer) {
            const progressFill = progressContainer.querySelector('.progress-fill');
            const progressPercentage = progressContainer.querySelector('.progress-percentage');
            const progressStatus = progressContainer.querySelector('.progress-status');
            
            progressFill.style.width = `${percentage}%`;
            progressPercentage.textContent = `${Math.round(percentage)}%`;
            
            if (percentage >= 100) {
                progressStatus.textContent = 'Upload complete!';
                setTimeout(() => {
                    progressContainer.remove();
                }, 2000);
            }
        }
    }

    // Initialize video players
    initializeVideoPlayers() {
        const videoPlayers = document.querySelectorAll('video[data-video-player]');
        
        videoPlayers.forEach(player => {
            this.setupVideoPlayer(player);
        });
    }

    // Setup individual video player
    setupVideoPlayer(player) {
        // Add custom controls
        this.addCustomControls(player);
        
        // Add quality selector
        this.addQualitySelector(player);
        
        // Add playback speed control
        this.addPlaybackSpeedControl(player);
        
        // Add video analytics
        this.addVideoAnalytics(player);
        
        // Add keyboard shortcuts
        this.addKeyboardShortcuts(player);
    }

    // Add custom video controls
    addCustomControls(player) {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'custom-video-controls';
        controlsContainer.innerHTML = `
            <div class="controls-bar">
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                        <div class="progress-handle"></div>
                    </div>
                    <div class="time-display">
                        <span class="current-time">0:00</span>
                        <span class="duration">0:00</span>
                    </div>
                </div>
                
                <div class="controls-buttons">
                    <button class="control-btn play-pause" title="Play/Pause">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="control-btn volume" title="Mute/Unmute">
                        <i class="fas fa-volume-up"></i>
                    </button>
                    <div class="volume-slider">
                        <input type="range" min="0" max="100" value="100" class="volume-range">
                    </div>
                    <button class="control-btn fullscreen" title="Fullscreen">
                        <i class="fas fa-expand"></i>
                    </button>
                </div>
            </div>
        `;
        
        player.parentNode.appendChild(controlsContainer);
        this.bindCustomControls(player, controlsContainer);
    }

    // Bind custom controls to video player
    bindCustomControls(player, controlsContainer) {
        const playPauseBtn = controlsContainer.querySelector('.play-pause');
        const volumeBtn = controlsContainer.querySelector('.volume');
        const volumeSlider = controlsContainer.querySelector('.volume-range');
        const fullscreenBtn = controlsContainer.querySelector('.fullscreen');
        const progressBar = controlsContainer.querySelector('.progress-bar');
        const progressFill = controlsContainer.querySelector('.progress-fill');
        const currentTime = controlsContainer.querySelector('.current-time');
        const duration = controlsContainer.querySelector('.duration');
        
        // Play/Pause
        playPauseBtn.addEventListener('click', () => {
            if (player.paused) {
                player.play();
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            } else {
                player.pause();
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            }
        });
        
        // Volume control
        volumeBtn.addEventListener('click', () => {
            if (player.muted) {
                player.muted = false;
                volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            } else {
                player.muted = true;
                volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            }
        });
        
        volumeSlider.addEventListener('input', (e) => {
            player.volume = e.target.value / 100;
        });
        
        // Fullscreen
        fullscreenBtn.addEventListener('click', () => {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                player.requestFullscreen();
            }
        });
        
        // Progress bar
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            player.currentTime = pos * player.duration;
        });
        
        // Update progress
        player.addEventListener('timeupdate', () => {
            const percent = (player.currentTime / player.duration) * 100;
            progressFill.style.width = `${percent}%`;
            currentTime.textContent = this.formatDuration(player.currentTime);
        });
        
        // Update duration
        player.addEventListener('loadedmetadata', () => {
            duration.textContent = this.formatDuration(player.duration);
        });
    }

    // Add quality selector
    addQualitySelector(player) {
        const qualityContainer = document.createElement('div');
        qualityContainer.className = 'quality-selector';
        qualityContainer.innerHTML = `
            <button class="quality-btn">
                <span class="current-quality">Auto</span>
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="quality-menu">
                <div class="quality-option" data-quality="auto">Auto</div>
                <div class="quality-option" data-quality="1080p">1080p</div>
                <div class="quality-option" data-quality="720p">720p</div>
                <div class="quality-option" data-quality="480p">480p</div>
                <div class="quality-option" data-quality="360p">360p</div>
            </div>
        `;
        
        // Add to controls
        const controls = player.parentNode.querySelector('.controls-buttons');
        controls.insertBefore(qualityContainer, controls.lastElementChild);
        
        // Bind quality selection
        this.bindQualitySelection(player, qualityContainer);
    }

    // Bind quality selection
    bindQualitySelection(player, qualityContainer) {
        const qualityBtn = qualityContainer.querySelector('.quality-btn');
        const qualityMenu = qualityContainer.querySelector('.quality-menu');
        const qualityOptions = qualityContainer.querySelectorAll('.quality-option');
        
        qualityBtn.addEventListener('click', () => {
            qualityMenu.classList.toggle('show');
        });
        
        qualityOptions.forEach(option => {
            option.addEventListener('click', () => {
                const quality = option.dataset.quality;
                this.changeVideoQuality(player, quality);
                
                // Update UI
                qualityContainer.querySelector('.current-quality').textContent = quality;
                qualityMenu.classList.remove('show');
            });
        });
    }

    // Change video quality
    changeVideoQuality(player, quality) {
        // This would typically switch to different video sources
        // For now, we'll just log the quality change
        console.log('🎥 Changing video quality to:', quality);
        
        // In a real implementation, you would:
        // 1. Switch video source to different quality stream
        // 2. Update player with new source
        // 3. Handle quality switching seamlessly
    }

    // Add playback speed control
    addPlaybackSpeedControl(player) {
        const speedContainer = document.createElement('div');
        speedContainer.className = 'speed-selector';
        speedContainer.innerHTML = `
            <button class="speed-btn">
                <span class="current-speed">1x</span>
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="speed-menu">
                <div class="speed-option" data-speed="0.25">0.25x</div>
                <div class="speed-option" data-speed="0.5">0.5x</div>
                <div class="speed-option" data-speed="0.75">0.75x</div>
                <div class="speed-option" data-speed="1" data-active>1x</div>
                <div class="speed-option" data-speed="1.25">1.25x</div>
                <div class="speed-option" data-speed="1.5">1.5x</div>
                <div class="speed-option" data-speed="2">2x</div>
            </div>
        `;
        
        // Add to controls
        const controls = player.parentNode.querySelector('.controls-buttons');
        controls.insertBefore(speedContainer, controls.lastElementChild);
        
        // Bind speed selection
        this.bindSpeedSelection(player, speedContainer);
    }

    // Bind speed selection
    bindSpeedSelection(player, speedContainer) {
        const speedBtn = speedContainer.querySelector('.speed-btn');
        const speedMenu = speedContainer.querySelector('.speed-menu');
        const speedOptions = speedContainer.querySelectorAll('.speed-option');
        
        speedBtn.addEventListener('click', () => {
            speedMenu.classList.toggle('show');
        });
        
        speedOptions.forEach(option => {
            option.addEventListener('click', () => {
                const speed = parseFloat(option.dataset.speed);
                player.playbackRate = speed;
                
                // Update UI
                speedContainer.querySelector('.current-speed').textContent = `${speed}x`;
                speedMenu.classList.remove('show');
                
                // Update active state
                speedOptions.forEach(opt => opt.removeAttribute('data-active'));
                option.setAttribute('data-active', '');
            });
        });
    }

    // Add video analytics
    addVideoAnalytics(player) {
        let startTime = 0;
        let totalWatchTime = 0;
        let isWatching = false;
        
        player.addEventListener('play', () => {
            startTime = Date.now();
            isWatching = true;
            this.recordVideoEvent('play', player.src);
        });
        
        player.addEventListener('pause', () => {
            if (isWatching) {
                totalWatchTime += Date.now() - startTime;
                isWatching = false;
                this.recordVideoEvent('pause', player.src);
            }
        });
        
        player.addEventListener('ended', () => {
            if (isWatching) {
                totalWatchTime += Date.now() - startTime;
                isWatching = false;
                this.recordVideoEvent('complete', player.src);
            }
        });
        
        player.addEventListener('seeked', () => {
            this.recordVideoEvent('seek', player.src);
        });
        
        // Track view time every 10 seconds
        setInterval(() => {
            if (isWatching) {
                totalWatchTime += 10000;
                this.recordVideoEvent('watch_time', player.src, totalWatchTime);
            }
        }, 10000);
    }

    // Record video event
    recordVideoEvent(event, videoUrl, data = null) {
        const eventData = {
            event: event,
            videoUrl: videoUrl,
            timestamp: Date.now(),
            data: data
        };
        
        console.log('📊 Video Event:', eventData);
        
        // Save to analytics if Firebase is available
        if (typeof db !== 'undefined') {
            this.saveVideoAnalytics(eventData);
        }
    }

    // Save video analytics
    async saveVideoAnalytics(eventData) {
        try {
            await db.collection('videoAnalytics').add(eventData);
        } catch (error) {
            console.error('❌ Error saving video analytics:', error);
        }
    }

    // Add keyboard shortcuts
    addKeyboardShortcuts(player) {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when video is focused
            if (document.activeElement === player || player.parentNode.contains(document.activeElement)) {
                switch (e.key) {
                    case ' ':
                        e.preventDefault();
                        if (player.paused) {
                            player.play();
                        } else {
                            player.pause();
                        }
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        player.currentTime -= 10;
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        player.currentTime += 10;
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        player.volume = Math.min(1, player.volume + 0.1);
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        player.volume = Math.max(0, player.volume - 0.1);
                        break;
                    case 'f':
                        e.preventDefault();
                        if (document.fullscreenElement) {
                            document.exitFullscreen();
                        } else {
                            player.requestFullscreen();
                        }
                        break;
                    case 'm':
                        e.preventDefault();
                        player.muted = !player.muted;
                        break;
                }
            }
        });
    }

    // Utility functions
    formatDuration(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    // Load user preferences
    loadUserPreferences() {
        const preferences = localStorage.getItem('videoPreferences');
        if (preferences) {
            this.userPreferences = JSON.parse(preferences);
        }
    }

    // Save user preferences
    saveUserPreferences() {
        localStorage.setItem('videoPreferences', JSON.stringify(this.userPreferences));
    }

    // Refresh video feed
    refreshVideoFeed() {
        // This would refresh the video feed on the page
        console.log('🔄 Refreshing video feed...');
        
        // Trigger a custom event that the main app can listen to
        document.dispatchEvent(new CustomEvent('videoFeedRefresh'));
    }
}

// Initialize Video Manager
const videoManager = new VideoManager();

// Export for global use
window.videoManager = videoManager;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        videoManager.init();
    });
} else {
    videoManager.init();
}



