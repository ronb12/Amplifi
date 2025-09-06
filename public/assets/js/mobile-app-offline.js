// Mobile App & Offline Functionality for Amplifi - Complete Creator Platform
// Includes: PWA, offline video, background audio, mobile gestures, app-like experience

class MobileAppOffline {
    constructor() {
        this.isOnline = navigator.onLine;
        this.offlineVideos = new Map();
        this.backgroundAudio = null;
        this.mobileGestures = new MobileGestures();
        this.pwaManager = new PWAManager();
        this.offlineStorage = new OfflineStorage();
        
        this.init();
    }

    init() {
        this.setupNetworkDetection();
        this.setupOfflineCapabilities();
        this.setupMobileFeatures();
        this.setupBackgroundAudio();
        this.setupPWA();
        this.setupTouchGestures();
        
        console.log('📱 Mobile App & Offline functionality initialized');
    }

    setupNetworkDetection() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.handleOnlineStatus();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.handleOfflineStatus();
        });
        
        // Check initial status
        this.isOnline = navigator.onLine;
        if (!this.isOnline) {
            this.handleOfflineStatus();
        }
    }

    setupOfflineCapabilities() {
        // Setup offline video storage
        this.setupOfflineVideoStorage();
        
        // Setup offline data sync
        this.setupOfflineDataSync();
        
        // Setup offline search
        this.setupOfflineSearch();
    }

    setupMobileFeatures() {
        // Mobile-specific optimizations
        this.optimizeForMobile();
        
        // Touch-friendly controls
        this.setupTouchControls();
        
        // Mobile navigation
        this.setupMobileNavigation();
        
        // Mobile performance monitoring
        this.setupPerformanceMonitoring();
    }

    setupBackgroundAudio() {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('play', () => this.playBackgroundAudio());
            navigator.mediaSession.setActionHandler('pause', () => this.pauseBackgroundAudio());
            navigator.mediaSession.setActionHandler('stop', () => this.stopBackgroundAudio());
            navigator.mediaSession.setActionHandler('seekbackward', () => this.seekBackward());
            navigator.mediaSession.setActionHandler('seekforward', () => this.seekForward());
        }
    }

    setupPWA() {
        this.pwaManager.init();
    }

    setupTouchGestures() {
        this.mobileGestures.init();
    }

    // Offline video functionality
    setupOfflineVideoStorage() {
        // Request storage permission
        if ('storage' in navigator && 'persist' in navigator.storage) {
            navigator.storage.persist().then(isPersisted => {
                console.log(`Persistent storage: ${isPersisted ? 'enabled' : 'disabled'}`);
            });
        }
    }

    async downloadVideoForOffline(videoId, quality = '720p') {
        try {
            if (!this.isOnline) {
                throw new Error('Cannot download while offline');
            }

            console.log(`📥 Downloading video ${videoId} for offline viewing...`);
            
            // Get video metadata
            const videoMetadata = await this.getVideoMetadata(videoId);
            if (!videoMetadata) {
                throw new Error('Video not found');
            }

            // Check storage quota
            const quota = await this.checkStorageQuota();
            if (quota.usage + videoMetadata.size > quota.quota) {
                throw new Error('Insufficient storage space');
            }

            // Download video chunks
            const videoChunks = await this.downloadVideoChunks(videoId, quality);
            
            // Store video offline
            await this.storeOfflineVideo(videoId, videoMetadata, videoChunks);
            
            // Update offline video list
            this.offlineVideos.set(videoId, {
                ...videoMetadata,
                quality,
                downloadDate: Date.now(),
                size: videoMetadata.size
            });

            console.log(`✅ Video ${videoId} downloaded successfully for offline viewing`);
            
            // Emit download complete event
            document.dispatchEvent(new CustomEvent('offlineVideoDownloaded', {
                detail: { videoId, metadata: videoMetadata }
            }));

            return true;
        } catch (error) {
            console.error(`❌ Failed to download video ${videoId}:`, error);
            throw error;
        }
    }

    async getVideoMetadata(videoId) {
        try {
            if (typeof db !== 'undefined') {
                const videoDoc = await db.collection('videos').doc(videoId).get();
                if (videoDoc.exists) {
                    return videoDoc.data();
                }
            }
        } catch (error) {
            console.error('Error getting video metadata:', error);
        }
        return null;
    }

    async checkStorageQuota() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            return await navigator.storage.estimate();
        }
        return { usage: 0, quota: 1024 * 1024 * 1024 }; // 1GB default
    }

    async downloadVideoChunks(videoId, quality) {
        // This would implement chunked video downloading
        // For now, return mock chunks
        return [
            { index: 0, data: new ArrayBuffer(1024), size: 1024 },
            { index: 1, data: new ArrayBuffer(1024), size: 1024 }
        ];
    }

    async storeOfflineVideo(videoId, metadata, chunks) {
        try {
            // Store in IndexedDB
            await this.offlineStorage.storeVideo(videoId, metadata, chunks);
            
            // Store in Cache API
            await this.storeInCache(videoId, metadata, chunks);
            
            console.log(`💾 Video ${videoId} stored offline successfully`);
        } catch (error) {
            console.error('Error storing offline video:', error);
            throw error;
        }
    }

    async storeInCache(videoId, metadata, chunks) {
        const cache = await caches.open('offline-videos');
        const videoBlob = new Blob(chunks.map(chunk => chunk.data), { type: 'video/mp4' });
        const response = new Response(videoBlob);
        await cache.put(`/offline-video/${videoId}`, response);
    }

    async playOfflineVideo(videoId) {
        try {
            if (!this.offlineVideos.has(videoId)) {
                throw new Error('Video not available offline');
            }

            const videoData = await this.offlineStorage.getVideo(videoId);
            if (!videoData) {
                throw new Error('Failed to retrieve offline video');
            }

            // Create video element and play
            const videoElement = document.createElement('video');
            videoElement.src = URL.createObjectURL(videoData.blob);
            videoElement.controls = true;
            
            // Add to page
            const container = document.getElementById('videoContainer') || document.body;
            container.appendChild(videoElement);
            
            // Start playback
            await videoElement.play();
            
            console.log(`▶️ Playing offline video ${videoId}`);
            
            return videoElement;
        } catch (error) {
            console.error(`❌ Failed to play offline video ${videoId}:`, error);
            throw error;
        }
    }

    // Background audio functionality
    setupBackgroundAudio() {
        // Create background audio player
        this.backgroundAudio = document.createElement('audio');
        this.backgroundAudio.id = 'backgroundAudio';
        this.backgroundAudio.style.display = 'none';
        document.body.appendChild(this.backgroundAudio);
        
        // Setup background audio events
        this.backgroundAudio.addEventListener('ended', () => this.handleBackgroundAudioEnded());
        this.backgroundAudio.addEventListener('error', (e) => this.handleBackgroundAudioError(e));
    }

    async playBackgroundAudio(videoUrl, startTime = 0) {
        try {
            this.backgroundAudio.src = videoUrl;
            this.backgroundAudio.currentTime = startTime;
            
            // Set media session metadata
            if ('mediaSession' in navigator) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: 'Amplifi Video',
                    artist: 'Background Audio',
                    album: 'Amplifi',
                    artwork: [
                        { src: '/amplifi-logo.svg', sizes: '96x96', type: 'image/svg+xml' }
                    ]
                });
            }
            
            // Start playback
            await this.backgroundAudio.play();
            
            console.log('🎵 Background audio started');
            
            // Emit event
            document.dispatchEvent(new CustomEvent('backgroundAudioStarted', {
                detail: { videoUrl, startTime }
            }));
            
            return true;
        } catch (error) {
            console.error('Failed to start background audio:', error);
            return false;
        }
    }

    pauseBackgroundAudio() {
        if (this.backgroundAudio) {
            this.backgroundAudio.pause();
            console.log('⏸️ Background audio paused');
        }
    }

    stopBackgroundAudio() {
        if (this.backgroundAudio) {
            this.backgroundAudio.pause();
            this.backgroundAudio.currentTime = 0;
            console.log('⏹️ Background audio stopped');
        }
    }

    seekBackward() {
        if (this.backgroundAudio) {
            this.backgroundAudio.currentTime = Math.max(0, this.backgroundAudio.currentTime - 10);
        }
    }

    seekForward() {
        if (this.backgroundAudio) {
            this.backgroundAudio.currentTime = Math.min(
                this.backgroundAudio.duration,
                this.backgroundAudio.currentTime + 10
            );
        }
    }

    handleBackgroundAudioEnded() {
        console.log('🎵 Background audio ended');
        document.dispatchEvent(new CustomEvent('backgroundAudioEnded'));
    }

    handleBackgroundAudioError(error) {
        console.error('Background audio error:', error);
        document.dispatchEvent(new CustomEvent('backgroundAudioError', { detail: error }));
    }

    // Mobile optimizations
    optimizeForMobile() {
        // Touch-friendly button sizes
        this.adjustTouchTargets();
        
        // Mobile viewport optimization
        this.optimizeViewport();
        
        // Mobile performance optimizations
        this.optimizePerformance();
    }

    adjustTouchTargets() {
        // Ensure all interactive elements meet minimum touch target size (44px)
        const touchTargets = document.querySelectorAll('button, a, input, select, textarea');
        touchTargets.forEach(target => {
            const rect = target.getBoundingClientRect();
            if (rect.width < 44 || rect.height < 44) {
                target.style.minWidth = '44px';
                target.style.minHeight = '44px';
            }
        });
    }

    optimizeViewport() {
        // Set mobile-optimized viewport
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
    }

    optimizePerformance() {
        // Reduce animations on low-end devices
        if (navigator.hardwareConcurrency < 4) {
            document.body.style.setProperty('--animation-duration', '0.1s');
        }
        
        // Optimize images for mobile
        this.optimizeImagesForMobile();
    }

    optimizeImagesForMobile() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // Use responsive images
            if (img.srcset) {
                img.sizes = '(max-width: 768px) 100vw, 50vw';
            }
            
            // Lazy loading for mobile
            img.loading = 'lazy';
        });
    }

    setupTouchControls() {
        // Double-tap to seek
        this.setupDoubleTapSeek();
        
        // Swipe gestures
        this.setupSwipeGestures();
        
        // Pinch to zoom
        this.setupPinchZoom();
    }

    setupDoubleTapSeek() {
        let lastTap = 0;
        let tapCount = 0;
        
        document.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < 500 && tapLength > 0) {
                tapCount++;
                if (tapCount === 2) {
                    // Double tap detected
                    this.handleDoubleTap(e);
                    tapCount = 0;
                }
            } else {
                tapCount = 1;
            }
            lastTap = currentTime;
        });
    }

    handleDoubleTap(e) {
        const video = e.target.closest('video');
        if (video) {
            const rect = video.getBoundingClientRect();
            const tapX = e.changedTouches[0].clientX - rect.left;
            const videoWidth = rect.width;
            
            if (tapX < videoWidth / 2) {
                // Left side - seek backward
                video.currentTime = Math.max(0, video.currentTime - 10);
            } else {
                // Right side - seek forward
                video.currentTime = Math.min(video.duration, video.currentTime + 10);
            }
        }
    }

    setupSwipeGestures() {
        let startX = 0;
        let startY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    this.handleSwipeRight();
                } else {
                    this.handleSwipeLeft();
                }
            }
        });
    }

    handleSwipeRight() {
        // Navigate back or previous video
        if (window.history.length > 1) {
            window.history.back();
        }
    }

    handleSwipeLeft() {
        // Navigate forward or next video
        if (window.history.length > 1) {
            window.history.forward();
        }
    }

    setupPinchZoom() {
        let initialDistance = 0;
        let initialScale = 1;
        
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                initialDistance = this.getDistance(e.touches[0], e.touches[1]);
                const video = e.target.closest('video');
                if (video) {
                    initialScale = video.style.transform ? 
                        parseFloat(video.style.transform.replace('scale(', '').replace(')', '')) : 1;
                }
            }
        });
        
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
                const scale = (currentDistance / initialDistance) * initialScale;
                
                const video = e.target.closest('video');
                if (video) {
                    video.style.transform = `scale(${Math.max(0.5, Math.min(3, scale))})`;
                }
            }
        });
    }

    getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    setupMobileNavigation() {
        // Mobile navigation drawer
        this.setupNavigationDrawer();
        
        // Bottom navigation bar
        this.setupBottomNavigation();
        
        // Mobile search
        this.setupMobileSearch();
    }

    setupNavigationDrawer() {
        const drawer = document.createElement('div');
        drawer.className = 'mobile-navigation-drawer';
        drawer.innerHTML = `
            <div class="drawer-header">
                <h3>Menu</h3>
                <button class="drawer-close">&times;</button>
            </div>
            <div class="drawer-content">
                <a href="#home" class="drawer-item">
                    <i class="fas fa-home"></i> Home
                </a>
                <a href="#trending" class="drawer-item">
                    <i class="fas fa-fire"></i> Trending
                </a>
                <a href="#subscriptions" class="drawer-item">
                    <i class="fas fa-bell"></i> Subscriptions
                </a>
                <a href="#library" class="drawer-item">
                    <i class="fas fa-folder"></i> Library
                </a>
            </div>
        `;
        
        document.body.appendChild(drawer);
        
        // Toggle drawer
        const menuButton = document.querySelector('.mobile-menu-button');
        if (menuButton) {
            menuButton.addEventListener('click', () => this.toggleDrawer());
        }
        
        // Close drawer
        drawer.querySelector('.drawer-close').addEventListener('click', () => this.toggleDrawer());
    }

    toggleDrawer() {
        const drawer = document.querySelector('.mobile-navigation-drawer');
        drawer.classList.toggle('open');
    }

    setupBottomNavigation() {
        const bottomNav = document.createElement('nav');
        bottomNav.className = 'mobile-bottom-navigation';
        bottomNav.innerHTML = `
            <a href="#home" class="nav-item active">
                <i class="fas fa-home"></i>
                <span>Home</span>
            </a>
            <a href="#shorts" class="nav-item">
                <i class="fas fa-play-circle"></i>
                <span>Shorts</span>
            </a>
            <a href="#create" class="nav-item">
                <i class="fas fa-plus-circle"></i>
                <span>Create</span>
            </a>
            <a href="#subscriptions" class="nav-item">
                <i class="fas fa-bell"></i>
                <span>Subs</span>
            </a>
            <a href="#library" class="nav-item">
                <i class="fas fa-folder"></i>
                <span>Library</span>
            </a>
        `;
        
        document.body.appendChild(bottomNav);
        
        // Handle navigation
        bottomNav.addEventListener('click', (e) => {
            if (e.target.closest('.nav-item')) {
                bottomNav.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
                e.target.closest('.nav-item').classList.add('active');
            }
        });
    }

    setupMobileSearch() {
        // Mobile-optimized search
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            searchContainer.classList.add('mobile-search');
        }
    }

    // Offline data sync
    setupOfflineDataSync() {
        // Sync offline actions when back online
        this.setupOfflineSync();
        
        // Queue offline actions
        this.setupActionQueue();
    }

    setupOfflineSync() {
        window.addEventListener('online', () => {
            this.syncOfflineActions();
        });
    }

    setupActionQueue() {
        this.offlineActions = [];
        
        // Listen for actions that need to be synced
        document.addEventListener('offlineAction', (e) => {
            this.queueOfflineAction(e.detail);
        });
    }

    queueOfflineAction(action) {
        this.offlineActions.push({
            ...action,
            timestamp: Date.now(),
            id: Date.now() + Math.random()
        });
        
        // Store in localStorage
        localStorage.setItem('amplifi_offline_actions', JSON.stringify(this.offlineActions));
    }

    async syncOfflineActions() {
        if (this.offlineActions.length === 0) return;
        
        console.log('🔄 Syncing offline actions...');
        
        for (const action of this.offlineActions) {
            try {
                await this.syncAction(action);
                console.log(`✅ Synced action: ${action.type}`);
            } catch (error) {
                console.error(`❌ Failed to sync action: ${action.type}`, error);
            }
        }
        
        // Clear synced actions
        this.offlineActions = [];
        localStorage.removeItem('amplifi_offline_actions');
        
        console.log('✅ Offline sync completed');
    }

    async syncAction(action) {
        // Implement action syncing based on type
        switch (action.type) {
            case 'like':
                await this.syncLikeAction(action);
                break;
            case 'comment':
                await this.syncCommentAction(action);
                break;
            case 'subscribe':
                await this.syncSubscribeAction(action);
                break;
            default:
                console.log('Unknown action type:', action.type);
        }
    }

    async syncLikeAction(action) {
        // Sync like to Firebase
        if (typeof db !== 'undefined') {
            await db.collection('likes').add({
                videoId: action.videoId,
                userId: action.userId,
                timestamp: action.timestamp
            });
        }
    }

    async syncCommentAction(action) {
        // Sync comment to Firebase
        if (typeof db !== 'undefined') {
            await db.collection('comments').add({
                videoId: action.videoId,
                userId: action.userId,
                content: action.content,
                timestamp: action.timestamp
            });
        }
    }

    async syncSubscribeAction(action) {
        // Sync subscription to Firebase
        if (typeof db !== 'undefined') {
            await db.collection('subscriptions').add({
                creatorId: action.creatorId,
                userId: action.userId,
                timestamp: action.timestamp
            });
        }
    }

    // Offline search
    setupOfflineSearch() {
        // Index offline content for search
        this.indexOfflineContent();
    }

    async indexOfflineContent() {
        // Create search index for offline content
        this.offlineSearchIndex = new Map();
        
        for (const [videoId, videoData] of this.offlineVideos) {
            this.offlineSearchIndex.set(videoId, {
                title: videoData.title,
                description: videoData.description,
                tags: videoData.tags || [],
                category: videoData.category
            });
        }
    }

    searchOfflineContent(query) {
        const results = [];
        const queryLower = query.toLowerCase();
        
        for (const [videoId, data] of this.offlineSearchIndex) {
            let score = 0;
            
            // Search in title
            if (data.title.toLowerCase().includes(queryLower)) {
                score += 10;
            }
            
            // Search in description
            if (data.description.toLowerCase().includes(queryLower)) {
                score += 5;
            }
            
            // Search in tags
            data.tags.forEach(tag => {
                if (tag.toLowerCase().includes(queryLower)) {
                    score += 3;
                }
            });
            
            if (score > 0) {
                results.push({ videoId, data, score });
            }
        }
        
        return results.sort((a, b) => b.score - a.score);
    }

    // Performance monitoring
    setupPerformanceMonitoring() {
        // Monitor mobile performance
        this.monitorPerformance();
        
        // Monitor battery usage
        this.monitorBattery();
    }

    monitorPerformance() {
        if ('performance' in window) {
            // Monitor page load performance
            window.addEventListener('load', () => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('📊 Page load performance:', {
                    domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                    loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
                    totalTime: perfData.loadEventEnd - perfData.fetchStart
                });
            });
        }
    }

    monitorBattery() {
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                battery.addEventListener('levelchange', () => {
                    if (battery.level < 0.2) {
                        this.enableLowPowerMode();
                    }
                });
            });
        }
    }

    enableLowPowerMode() {
        // Reduce animations and effects for low battery
        document.body.classList.add('low-power-mode');
        console.log('🔋 Low power mode enabled');
    }

    // Utility methods
    handleOnlineStatus() {
        console.log('🌐 Back online - syncing data...');
        this.syncOfflineActions();
        document.body.classList.remove('offline-mode');
    }

    handleOfflineStatus() {
        console.log('📴 Going offline - enabling offline features...');
        document.body.classList.add('offline-mode');
    }

    getOfflineVideos() {
        return Array.from(this.offlineVideos.values());
    }

    isVideoAvailableOffline(videoId) {
        return this.offlineVideos.has(videoId);
    }

    getOfflineStorageUsage() {
        return this.offlineStorage.getUsage();
    }

    clearOfflineStorage() {
        this.offlineStorage.clear();
        this.offlineVideos.clear();
        console.log('🗑️ Offline storage cleared');
    }
}

// Mobile Gestures Handler
class MobileGestures {
    constructor() {
        this.gestures = new Map();
        this.init();
    }

    init() {
        this.setupGestureRecognition();
    }

    setupGestureRecognition() {
        // Implement advanced gesture recognition
        console.log('👆 Mobile gestures initialized');
    }
}

// PWA Manager
class PWAManager {
    constructor() {
        this.isInstalled = false;
        this.deferredPrompt = null;
    }

    init() {
        this.setupInstallPrompt();
        this.checkInstallationStatus();
        console.log('📱 PWA Manager initialized');
    }

    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });
    }

    showInstallPrompt() {
        // Show custom install prompt
        const installPrompt = document.createElement('div');
        installPrompt.className = 'pwa-install-prompt';
        installPrompt.innerHTML = `
            <div class="install-content">
                <h3>Install Amplifi</h3>
                <p>Get the full app experience with offline support</p>
                <button class="install-btn">Install</button>
                <button class="dismiss-btn">Not now</button>
            </div>
        `;
        
        document.body.appendChild(installPrompt);
        
        // Handle install button
        installPrompt.querySelector('.install-btn').addEventListener('click', () => {
            this.installPWA();
        });
        
        // Handle dismiss button
        installPrompt.querySelector('.dismiss-btn').addEventListener('click', () => {
            installPrompt.remove();
        });
    }

    async installPWA() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('✅ PWA installed successfully');
                this.isInstalled = true;
            }
            
            this.deferredPrompt = null;
        }
    }

    checkInstallationStatus() {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
        }
    }
}

// Offline Storage Manager
class OfflineStorage {
    constructor() {
        this.dbName = 'AmplifiOfflineDB';
        this.dbVersion = 1;
        this.db = null;
        this.init();
    }

    async init() {
        try {
            this.db = await this.openDatabase();
            console.log('💾 Offline storage initialized');
        } catch (error) {
            console.error('Failed to initialize offline storage:', error);
        }
    }

    openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create video store
                if (!db.objectStoreNames.contains('videos')) {
                    const videoStore = db.createObjectStore('videos', { keyPath: 'id' });
                    videoStore.createIndex('category', 'category', { unique: false });
                    videoStore.createIndex('downloadDate', 'downloadDate', { unique: false });
                }
                
                // Create action store
                if (!db.objectStoreNames.contains('actions')) {
                    const actionStore = db.createObjectStore('actions', { keyPath: 'id', autoIncrement: true });
                    actionStore.createIndex('type', 'type', { unique: false });
                    actionStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    async storeVideo(videoId, metadata, chunks) {
        const transaction = this.db.transaction(['videos'], 'readwrite');
        const store = transaction.objectStore('videos');
        
        const videoBlob = new Blob(chunks.map(chunk => chunk.data), { type: 'video/mp4' });
        
        await store.put({
            id: videoId,
            metadata,
            blob: videoBlob,
            downloadDate: Date.now()
        });
    }

    async getVideo(videoId) {
        const transaction = this.db.transaction(['videos'], 'readonly');
        const store = transaction.objectStore('videos');
        
        return await store.get(videoId);
    }

    async deleteVideo(videoId) {
        const transaction = this.db.transaction(['videos'], 'readwrite');
        const store = transaction.objectStore('videos');
        
        await store.delete(videoId);
    }

    async getUsage() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            return await navigator.storage.estimate();
        }
        return { usage: 0, quota: 0 };
    }

    async clear() {
        const transaction = this.db.transaction(['videos', 'actions'], 'readwrite');
        const videoStore = transaction.objectStore('videos');
        const actionStore = transaction.objectStore('actions');
        
        await videoStore.clear();
        await actionStore.clear();
    }
}

// Export for global use
window.MobileAppOffline = MobileAppOffline;
window.MobileGestures = MobileGestures;
window.PWAManager = PWAManager;
window.OfflineStorage = OfflineStorage;
