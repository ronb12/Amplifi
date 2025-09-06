/* global db, auth, firebase, storage */
// Amplifi - Main Application JavaScript v13

class AmplifiApp {
    constructor() {
        this.currentUser = null;
        this.currentTab = 'feed';
        this.posts = [];
        this.isLoading = false;
        this.lastPost = null;
        this.postsPerPage = 10;
        
        // AdSense configuration
        this.adSenseConfig = {
            publisherId: 'pub-3565666509316178',
            customerId: '4925311126',
            bannerAdUnitId: 'ca-pub-3565666509316178/your-banner-ad-unit-id',
            interstitialAdUnitId: 'ca-pub-3565666509316178/your-interstitial-ad-unit-id',
            rewardedAdUnitId: 'ca-pub-3565666509316178/your-rewarded-ad-unit-id'
        };
        
        // Push notification configuration
        this.notificationConfig = {
            vapidKey: 'BEl62iUYgUivxIkv69yViEuiBIa1l9aQvYN8cRUPB4wLvcMwiK3NDTfH5Gv0HwxxS6JdkTY4ZY00XhH_NePI0A',
            supported: 'serviceWorker' in window && 'PushManager' in window
        };
        
        // Global theme management
        this.themeManager = {
            settings: {},
            init: () => this.initGlobalTheme(),
            applyTheme: (settings) => this.applyGlobalTheme(settings),
            updateTheme: (settingName, value) => this.updateGlobalTheme(settingName, value)
        };
        
        // Wait for Firebase to be ready before initializing
        this.waitForFirebaseAndInit();
    }

    async waitForFirebaseAndInit() {
        try {
            // Wait for Firebase services to be available with timeout
            const firebaseReady = await Promise.race([
                this.waitForFirebaseServices(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase timeout')), 10000))
            ]);

            if (firebaseReady) {
                console.log('✅ Firebase services ready, initializing app...');
                this.init();
            } else {
                console.log('⚠️ Firebase services not available, initializing with fallback...');
                this.init();
            }
        } catch (error) {
            console.log('ℹ️ Firebase initialization timeout, continuing with fallback...');
            // Continue with fallback instead of retrying
            this.init();
        }
    }

    async waitForFirebaseServices() {
        let attempts = 0;
        const maxAttempts = 100; // 10 seconds max

        while (attempts < maxAttempts) {
            if (typeof window.db !== 'undefined' &&
                typeof window.auth !== 'undefined' &&
                typeof window.storage !== 'undefined') {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        // If Firebase services aren't available after timeout, continue anyway
        console.log('ℹ️ Firebase services not available after timeout, continuing with fallback...');
        return false;
    }

    // Check Firebase services status
    checkFirebaseServices() {
        console.log('🔍 Checking Firebase services status...');
        
        const services = {
            firebase: typeof firebase !== 'undefined',
            auth: typeof window.auth !== 'undefined',
            db: typeof window.db !== 'undefined',
            storage: typeof window.storage !== 'undefined'
        };
        
        console.log('📊 Firebase Services Status:', services);
        
        if (Object.values(services).every(status => status)) {
            console.log('✅ All Firebase services are available');
            this.firebaseReady = true;
        } else {
            console.log('ℹ️ Some Firebase services are missing:', services);
            this.firebaseReady = false;
        }
        
        return services;
    }

    async init() {
        try {
            this.setupEventListeners();
            
            // Only setup auth state listener if Firebase is available
            if (typeof window.auth !== 'undefined') {
                this.setupAuthStateListener();
            } else {
                console.log('ℹ️ Firebase auth not available, skipping auth setup');
            }
            
            // Try to load posts, but don't fail if Firebase is unavailable
            try {
                if (typeof window.db !== 'undefined') {
                    await this.loadPosts();
                } else {
                    console.log('ℹ️ Firebase db not available, using fallback content');
                    this.loadFallbackContent();
                }
            } catch (error) {
                console.log('ℹ️ Could not load posts from Firebase, using fallback content');
                this.loadFallbackContent();
            }
            
            this.initializeAdSense();
            this.initializePushNotifications();
            this.registerServiceWorker();
            
            // Initialize global theme
            this.themeManager.init();
            
            // Initialize advanced features (only once)
            if (!window.featuresInitialized) {
                this.initializeAdvancedFeatures();
                window.featuresInitialized = true;
            }
            
            // Show home page content by default
            this.showHomePage();
            
            // Hide loading state
            this.hideLoadingState();
            
        } catch (error) {
            console.error('❌ Error during app initialization:', error);
            // Still try to show some content
            this.loadFallbackContent();
            this.hideLoadingState();
        }
    }

    // Load fallback content when Firebase is unavailable
    loadFallbackContent() {
        // console.log('📱 Loading fallback content...');
        
        // Load sample content for featured videos
        this.showSampleFeaturedContent();
    }

    // Hide loading state
    hideLoadingState() {
        const loadingElements = document.querySelectorAll('.loading, .spinner, [data-loading="true"]');
        loadingElements.forEach(element => {
            element.style.display = 'none';
        });
        
        // Show main content
        const mainContent = document.querySelector('.yt-main, .main-content, #mainContent');
        if (mainContent) {
            mainContent.style.display = 'block';
        }
        
        // Ensure video grids are visible
        const videoGrids = document.querySelectorAll('.video-grid');
        videoGrids.forEach(grid => {
            grid.style.display = 'grid';
        });
        
        // Hide any loading spinners
        const loadingSpinner = document.getElementById('loadingSpinner');
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
        
        console.log('✅ App initialization complete');
    }

    // Initialize AdSense
    initializeAdSense() {
        // Check if AdSense is already initialized
        if (window.adSenseInitialized) {
            console.log('⚠️ AdSense already initialized, skipping');
            return;
        }

        if (typeof adsbygoogle !== 'undefined') {
            try {
                // Mark as initialized
                window.adSenseInitialized = true;
                
                // Only load banner ad, skip interstitial for now
                console.log('✅ Loading AdSense banner ad...');
                this.loadBannerAd();
            } catch (error) {
                console.error('❌ Error initializing AdSense:', error);
            }
        } else {
            // console.log('⚠️ AdSense not available yet');
            // Retry after a delay
            setTimeout(() => this.initializeAdSense(), 2000);
        }
    }

    // Load banner ad
    loadBannerAd() {
        const bannerAd = document.getElementById('bannerAd');
        if (bannerAd && !bannerAd.hasAttribute('data-adsense-loaded')) {
            try {
                bannerAd.setAttribute('data-adsense-loaded', 'true');
                (adsbygoogle = window.adsbygoogle || []).push({});
                const adBanner = document.getElementById('adBanner');
                if (adBanner) adBanner.style.display = 'block';
            } catch (error) {
                console.error('Error loading banner ad:', error);
            }
        } else if (bannerAd && bannerAd.hasAttribute('data-adsense-loaded')) {
            console.log('⚠️ Banner ad already loaded');
        }
    }

    // Load interstitial ad (disabled for simplified home page)
    loadInterstitialAd() {
        console.log('⚠️ Interstitial ads disabled for simplified home page');
    }

    // Show interstitial ad
    showInterstitialAd() {
        const interstitialAd = document.getElementById('interstitialAd');
        if (interstitialAd) {
            interstitialAd.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                interstitialAd.style.display = 'none';
            }, 5000);
        }
    }

    // Initialize push notifications
    initializePushNotifications() {
        if (!this.notificationConfig.supported) {
            console.log('⚠️ Push notifications not supported');
            return;
        }

        // Request permission
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.subscribeToPushNotifications();
                }
            });
        } else if (Notification.permission === 'granted') {
            this.subscribeToPushNotifications();
        }
    }

    // Subscribe to push notifications
    async subscribeToPushNotifications() {
        try {
            const registration = await navigator.serviceWorker.ready;
            
            // Check if VAPID key is valid
            if (!this.notificationConfig.vapidKey || this.notificationConfig.vapidKey === 'YOUR_VAPID_KEY') {
                console.log('⚠️ VAPID key not configured, skipping push notifications');
                return;
            }
            
            // Validate VAPID key format before using
            try {
                const vapidKeyArray = this.urlBase64ToUint8Array(this.notificationConfig.vapidKey);
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: vapidKeyArray
                });

                // Save subscription to Firestore
                if (this.currentUser) {
                    await db.collection('pushSubscriptions').doc(this.currentUser.uid).set({
                        subscription: subscription,
                        createdAt: new Date()
                    });
                }

                console.log('✅ Push notification subscription successful');
            } catch (vapidError) {
                console.log('⚠️ Invalid VAPID key format, skipping push notifications');
                return;
            }
        } catch (error) {
            console.error('❌ Push notification subscription failed:', error);
            
            // Handle specific errors gracefully
            if (error.name === 'InvalidAccessError') {
                console.log('⚠️ Push notifications not supported or VAPID key invalid');
            } else if (error.name === 'NotAllowedError') {
                console.log('⚠️ Push notification permission denied');
            } else {
                console.log('⚠️ Push notification setup failed, continuing without notifications');
            }
        }
    }

    // Convert VAPID key
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    // Register service worker
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('✅ Service Worker registered:', registration);
                })
                .catch(error => {
                    console.error('❌ Service Worker registration failed:', error);
                });
        }
    }

    // Initialize advanced features
    initializeAdvancedFeatures() {
        try {
            // Initialize Enhanced Video Player only if video element exists
            if (typeof EnhancedVideoPlayer !== 'undefined') {
                const videoElement = document.querySelector('.enhanced-video-wrapper video');
                if (videoElement) {
                    window.enhancedVideoPlayer = new EnhancedVideoPlayer(videoElement);
                    console.log('✅ Enhanced Video Player initialized');
                } else {
                    console.log('⚠️ No video element found, skipping Enhanced Video Player');
                }
            }
            
            // Initialize Live Streaming
            if (typeof LiveStreaming !== 'undefined') {
                window.liveStreaming = new LiveStreaming();
                console.log('✅ Live Streaming initialized');
            }
            
            // Initialize PWA Manager
            if (typeof MobileAppOffline !== 'undefined') {
                window.mobileApp = new MobileAppOffline();
                console.log('✅ PWA Manager initialized');
            }
            
        } catch (error) {
            console.error('❌ Error initializing advanced features:', error);
        }
    }

    // Send local notification
    sendLocalNotification(title, options = {}) {
        if (Notification.permission === 'granted') {
            const notification = new Notification(title, {
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                ...options
            });

            notification.onclick = function() {
                window.focus();
                notification.close();
                // Navigate to notifications page
                window.location.href = '/notifications.html';
            };
        }
    }

    setupEventListeners() {
        // Navigation - Handle both hash-based and file-based navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // If it's a hash link (like #home), handle it as a tab
                if (href.startsWith('#')) {
                    e.preventDefault();
                    this.switchTab(href.substring(1));
                }
                // If it's a file link (like /trending.html), let it navigate normally
                // This allows proper page navigation while maintaining tab functionality
            });
        });

        // Authentication
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const authModal = document.getElementById('authModal');
        
        // Mobile navigation
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const nav = document.querySelector('.nav');
        const sidebar = document.querySelector('.yt-sidebar, .sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                this.switchAuthTab('login');
                authModal.style.display = 'block';
            });
        }
        
        if (signupBtn) {
            signupBtn.addEventListener('click', () => {
                this.switchAuthTab('signup');
                authModal.style.display = 'block';
            });
        }

        // Mobile navigation toggle - handle both nav and sidebar
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Toggle sidebar if available
                if (sidebar && sidebarOverlay) {
                    sidebar.classList.toggle('active');
                    sidebarOverlay.classList.toggle('active');
                }
                
                // Toggle nav if available (fallback)
                if (nav) {
                    nav.classList.toggle('mobile-active');
                }
                
                mobileMenuBtn.classList.toggle('active'); 
            });
        }
        
        // Sidebar overlay click to close
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                if (sidebar) {
                    sidebar.classList.remove('active');
                }
                sidebarOverlay.classList.remove('active');
            });
        }
        
        // Close sidebar on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                if (sidebarOverlay) {
                    sidebarOverlay.classList.remove('active');
                }
            }
        });
        
        // Initialize mobile plus modal functionality
        const mobilePlusBtn = document.getElementById('mobilePlusBtn');
        const mobilePlusModal = document.getElementById('mobilePlusModal');
        const mobilePlusOverlay = document.getElementById('mobilePlusOverlay');
        const closePlusModal = document.getElementById('closePlusModal');
        
        if (mobilePlusBtn && mobilePlusModal && mobilePlusOverlay && closePlusModal) {
            mobilePlusBtn.addEventListener('click', (e) => {
                e.preventDefault();
                mobilePlusModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
            
            const closeModal = () => {
                mobilePlusModal.classList.remove('active');
                document.body.style.overflow = '';
            };
            
            mobilePlusOverlay.addEventListener('click', closeModal);
            closePlusModal.addEventListener('click', closeModal);
            
            // Close on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && mobilePlusModal.classList.contains('active')) {
                    closeModal();
                }
            });
        }



        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === authModal) {
                authModal.style.display = 'none';
            }
        });

        // Upload functionality
        const uploadLink = document.querySelector('a[href="#upload"]');
        if (uploadLink) {
            uploadLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.currentUser) {
                    document.getElementById('uploadModal').style.display = 'block';
                } else {
                    alert('Please sign in to upload content');
                    this.switchAuthTab('login');
                    authModal.style.display = 'block';
                }
            });
        }

        // Tip functionality
        document.addEventListener('click', (e) => {
            if (e.target.matches('.tip-amount')) {
                const amount = e.target.dataset.amount;
                document.getElementById('customTipAmount').value = amount;
            }
        });

        // Earnings dashboard
        const profileLink = document.querySelector('a[href="#profile"]');
        if (profileLink) {
            profileLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.currentUser) {
                    this.showEarningsDashboard();
                } else {
                    alert('Please sign in to view your profile');
                    this.switchAuthTab('login');
                    authModal.style.display = 'block';
                }
            });
        }

        // Live streaming
        const startStreamingBtn = document.getElementById('startStreamingBtn');
        if (startStreamingBtn) {
            startStreamingBtn.addEventListener('click', () => {
                if (this.currentUser) {
                    window.location.href = '/live.html';
                } else {
                    alert('Please sign in to start streaming');
                    this.switchAuthTab('login');
                    authModal.style.display = 'block';
                }
            });
        }

        // Handle hash changes for backward compatibility
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.substring(1);
            if (hash === 'home' || hash === '') {
                this.showHomePage();
            } else {
                this.switchTab(hash);
            }
        });

        // Handle initial hash on page load
        if (window.location.hash === '#home' || window.location.hash === '') {
            setTimeout(() => this.showHomePage(), 100);
        }

        // Setup upload form
        this.setupUploadForm();
    }

    setupUploadForm() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const uploadForm = document.getElementById('uploadForm');
        const removeFileBtn = document.getElementById('removeFile');

        // Only set up event listeners if elements exist
        if (uploadArea) {
            uploadArea.addEventListener('click', () => {
                if (fileInput) fileInput.click();
            });

            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
                uploadArea.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-tertiary');
            });

            uploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = '';
                uploadArea.style.backgroundColor = '';
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = '';
                uploadArea.style.backgroundColor = '';
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFileSelect(files[0]);
                }
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileSelect(e.target.files[0]);
                }
            });
        }

        if (removeFileBtn) {
            removeFileBtn.addEventListener('click', () => {
                this.removeSelectedFile();
            });
        }

        if (uploadForm) {
            uploadForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleUpload();
            });
        }
    }

    // Setup authentication state listener
    setupAuthStateListener() {
        // Check if Firebase auth is available
        if (typeof auth === 'undefined') {
            console.log('⚠️ Firebase auth not available, skipping auth setup');
            // Set default signed-out state
            this.currentUser = null;
            this.updateUIForSignedOutUser();
            return;
        }

        auth.onAuthStateChanged(async (user) => {
            if (user) {
                this.currentUser = user;
                console.log('✅ User signed in:', user.email);
                
                // Update UI for signed-in user
                this.updateUIForSignedInUser();
                
                // Load user profile
                await this.loadUserProfile();
            } else {
                this.currentUser = null;
                console.log('👋 User signed out');
                
                // Update UI for signed-out user
                this.updateUIForSignedOutUser();
            }
        });
    }

    // Update UI for signed-in user
    updateUIForSignedInUser() {
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        
        // Add user menu
        this.addUserMenu();
    }

    // Update UI for signed-out user
    updateUIForSignedOutUser() {
        const authButtons = document.getElementById('authButtons');
        const userProfile = document.getElementById('userProfile');
        
        if (authButtons) authButtons.style.display = 'block';
        if (userProfile) userProfile.style.display = 'none';
        
        // Remove user menu
        this.removeUserMenu();
    }

    // Update UI for signed-in user
    updateUIForSignedInUser() {
        const authButtons = document.getElementById('authButtons');
        const userProfile = document.getElementById('userProfile');
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');
        
        if (authButtons) authButtons.style.display = 'none';
        if (userProfile) userProfile.style.display = 'block';
        
        if (userName && this.currentUser) {
            userName.textContent = this.currentUser.displayName || this.currentUser.email || 'User';
        }
        
        if (userAvatar && this.currentUser && this.currentUser.photoURL) {
            userAvatar.src = this.currentUser.photoURL;
        }
    }

    // Add user menu to header
    addUserMenu() {
        const headerActions = document.querySelector('.header-actions');
        if (!headerActions || headerActions.querySelector('.user-menu')) return;
        
        const userMenu = document.createElement('div');
        userMenu.className = 'user-menu';
        userMenu.innerHTML = `
            <div class="user-avatar">
                <img src="${this.currentUser.photoURL || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'%3E%3Crect width=\'32\' height=\'32\' fill=\'%23636f1\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'white\' font-family=\'Arial, sans-serif\' font-size=\'12\'%3EU%3C/text%3E%3C/svg%3E'}" alt="Profile">
            </div>
            <div class="user-dropdown">
                <a href="#profile" class="dropdown-item">
                    <i class="fas fa-user"></i> Profile
                </a>
                <a href="#dashboard" class="dropdown-item">
                    <i class="fas fa-chart-bar"></i> Dashboard
                </a>
                <a href="#earnings" class="dropdown-item" onclick="app.showEarningsDashboard(); return false;">
                    <i class="fas fa-dollar-sign"></i> Earnings
                </a>
                <button class="dropdown-item" onclick="app.handleLogout()">
                    <i class="fas fa-sign-out-alt"></i> Sign Out
                </button>
            </div>
        `;
        
        headerActions.appendChild(userMenu);
    }

    // Remove user menu from header
    removeUserMenu() {
        const userMenu = document.querySelector('.user-menu');
        if (userMenu) {
            userMenu.remove();
        }
    }

    // Switch between tabs
    switchTab(tabName) {
        // Remove active class from all tabs
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to current tab
        const currentTab = document.querySelector(`a[href="#${tabName}"]`);
        if (currentTab) {
            currentTab.classList.add('active');
        }
        
        // Update current tab
        this.currentTab = tabName;
        
        // Handle specific tab actions
        switch (tabName) {
            case 'home':
                this.showHomePage();
                break;
            case 'trending':
                this.loadTrendingPosts();
                break;
            case 'live':
                this.loadLiveStreams();
                break;
            case 'shorts':
                this.loadShorts();
                break;
            case 'subscriptions':
                this.loadSubscriptionPosts();
                break;
            case 'library':
                this.loadUserLibrary();
                break;
            case 'upload':
                if (this.currentUser) {
                    document.getElementById('uploadModal').style.display = 'block';
                } else {
                    alert('Please sign in to upload content');
                    this.switchAuthTab('login');
                    document.getElementById('authModal').style.display = 'block';
                }
                break;
            case 'profile':
                if (this.currentUser) {
                    this.showEarningsDashboard();
                } else {
                    alert('Please sign in to view your profile');
                    this.switchAuthTab('login');
                    document.getElementById('authModal').style.display = 'block';
                }
                break;
        }
    }

    // Show home page with all enhanced content
    showHomePage() {
        // Prevent multiple calls
        if (this.homePageShown) {
            console.log('🏠 Home page already shown, skipping...');
            return;
        }
        
        this.homePageShown = true;
        console.log('🏠 Showing enhanced home page...');
        
        // Ensure all home page sections are visible
        const sections = [
            '.hero-section',
            '.content-section',
            '.enhanced-video-section',
            '.live-stream-section'
        ];
        
        sections.forEach(selector => {
            const section = document.querySelector(selector);
            if (section) {
                section.style.display = 'block';
                section.style.visibility = 'visible';
                section.style.opacity = '1';
            }
        });
        
        // Load sample content for featured videos
        this.showSampleFeaturedContent();
        
        // Ensure video grids are properly displayed
        const videoGrids = document.querySelectorAll('.video-grid');
        videoGrids.forEach(grid => {
            grid.style.display = 'grid';
            grid.style.visibility = 'visible';
        });
        
        // Update navigation active state
        const homeLink = document.querySelector('a[href="/"]');
        if (homeLink) {
            homeLink.classList.add('active');
        }
        
        console.log('✅ Home page content displayed successfully');
    }

    // Show sample featured content
    showSampleFeaturedContent() {
        // console.log('🎬 Loading sample featured content...');
        
        const featuredContainer = document.getElementById('featuredVideos');
        if (featuredContainer) {
            // Content is already in HTML, just ensure it's visible
            featuredContainer.style.display = 'grid';
            featuredContainer.style.visibility = 'visible';
            console.log('✅ Featured content displayed');
        } else {
            // console.log('⚠️ Featured content container not found');
        }
    }

    // Load trending posts
    async loadTrendingPosts() {
        try {
            // Check if Firebase is available
            if (typeof db === 'undefined') {
                console.log('📱 Loading sample trending content...');
                this.showSampleTrendingContent();
                return;
            }

            // Use simpler query without complex ordering
            const snapshot = await db.collection('posts')
                .limit(20)
                .get();
            
            const trendingPosts = [];
            snapshot.forEach(doc => {
                const post = { id: doc.id, ...doc.data() };
                // Only include active posts
                if (post.status === 'active') {
                    trendingPosts.push(post);
                }
            });
            
            // Sort by views and likes on client side
            trendingPosts.sort((a, b) => {
                const aScore = (a.views || 0) + (a.likes || 0);
                const bScore = (b.views || 0) + (b.likes || 0);
                return bScore - aScore;
            });
            
            this.renderPosts(trendingPosts, 'trendingVideos');
        } catch (error) {
            console.error('Error loading trending posts:', error);
            // Show sample trending content
            this.showSampleTrendingContent();
        }
    }

    // Load live streams
    async loadLiveStreams() {
        try {
            // Check if Firebase is available
            if (typeof db === 'undefined') {
                console.log('📱 Loading sample live content...');
                this.showSampleLiveContent();
                return;
            }

            // Use simpler query without complex ordering
            const snapshot = await db.collection('liveStreams')
                .limit(10)
                .get();
            
            const liveStreams = [];
            snapshot.forEach(doc => {
                const stream = { id: doc.id, ...doc.data() };
                // Only include live streams
                if (stream.status === 'live') {
                    liveStreams.push(stream);
                }
            });
            
            // Sort by viewer count on client side
            liveStreams.sort((a, b) => (b.viewerCount || 0) - (a.viewerCount || 0));
            
            this.renderLiveStreams(liveStreams);
        } catch (error) {
            console.error('Error loading live streams:', error);
            // Show sample live content
            this.showSampleLiveContent();
        }
    }

    // Load shorts
    async loadShorts() {
        try {
            // Check if Firebase is available
            if (typeof db === 'undefined') {
                console.log('📱 Loading sample shorts content...');
                this.showSampleShortsContent();
                return;
            }

            // Use simpler query without complex filtering
            const snapshot = await db.collection('posts')
                .limit(20)
                .get();
            
            const shorts = [];
            snapshot.forEach(doc => {
                const post = { id: doc.id, ...doc.data() };
                // Filter for active video posts
                if (post.status === 'active' && post.mediaType === 'video') {
                    // Filter for short videos (under 60 seconds)
                    if (post.duration && post.duration < 60) {
                        shorts.push(post);
                    }
                }
            });
            
            // Sort by creation date on client side
            shorts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            this.renderShorts(shorts);
        } catch (error) {
            console.error('Error loading shorts:', error);
            // Show sample shorts content
        }
    }

    // Load subscription posts
    async loadSubscriptionPosts() {
        // Check if Firebase is available
        if (typeof db === 'undefined') {
            console.log('📱 Loading sample subscription content...');
            this.showSampleSubscriptionContent();
            return;
        }

        if (!this.currentUser) {
            console.log('⚠️ User not signed in, showing sample subscription content');
            this.showSampleSubscriptionContent();
            return;
        }

        try {
            // Get user's subscriptions
            const subscriptionsSnapshot = await db.collection('follows')
                .where('followerId', '==', this.currentUser.uid)
                .get();
            
            const creatorIds = [];
            subscriptionsSnapshot.forEach(doc => {
                creatorIds.push(doc.data().followingId);
            });
            
            if (creatorIds.length === 0) {
                this.showNoSubscriptionsMessage();
                return;
            }
            
            // Get posts from subscribed creators
            const postsSnapshot = await db.collection('posts')
                .where('creatorId', 'in', creatorIds)
                .where('status', '==', 'active')
                .orderBy('createdAt', 'desc')
                .limit(20)
                .get();
            
            const subscriptionPosts = [];
            postsSnapshot.forEach(doc => {
                subscriptionPosts.push({ id: doc.id, ...doc.data() });
            });
            
            this.renderPosts(subscriptionPosts, 'subscriptionVideos');
        } catch (error) {
            console.error('Error loading subscription posts:', error);
            this.showSampleSubscriptionContent();
        }
    }

    // Show sample subscription content
    showSampleSubscriptionContent() {
        console.log('📺 Showing sample subscription content');
        const container = document.getElementById('subscriptionVideos');
        if (container) {
            container.innerHTML = `
                <div class="sample-content">
                    <h3>Sample Subscription Content</h3>
                    <p>This is sample content to demonstrate the subscription feature.</p>
                    <div class="sample-videos">
                        <div class="video-card">
                            <h4>Sample Video 1</h4>
                            <p>This would show content from creators you follow.</p>
                        </div>
                        <div class="video-card">
                            <h4>Sample Video 2</h4>
                            <p>Subscribe to creators to see their content here.</p>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // Show sample library content
    showSampleLibraryContent() {
        console.log('📚 Showing sample library content');
        const container = document.getElementById('libraryVideos');
        if (container) {
            container.innerHTML = `
                <div class="sample-content">
                    <h3>Sample Library Content</h3>
                    <p>This is sample content to demonstrate the library feature.</p>
                    <div class="sample-videos">
                        <div class="video-card">
                            <h4>Sample Liked Video 1</h4>
                            <p>This would show videos you've liked.</p>
                        </div>
                        <div class="video-card">
                            <h4>Sample Liked Video 2</h4>
                            <p>Like videos to see them in your library.</p>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // Show no subscriptions message
    showNoSubscriptionsMessage() {
        const container = document.getElementById('subscriptionVideos');
        if (container) {
            container.innerHTML = `
                <div class="no-content">
                    <h3>No Subscriptions Yet</h3>
                    <p>Follow creators to see their content in your subscription feed.</p>
                    <button class="btn btn-primary" onclick="app.showDiscoverCreators()">Discover Creators</button>
                </div>
            `;
        }
    }

    // Show empty library message
    showEmptyLibraryMessage() {
        const container = document.getElementById('libraryVideos');
        if (container) {
            container.innerHTML = `
                <div class="no-content">
                    <h3>Your Library is Empty</h3>
                    <p>Like videos to build your personal library.</p>
                    <button class="btn btn-primary" onclick="app.showTrendingContent()">Explore Trending</button>
                </div>
            `;
        }
    }

    // Load user library
    async loadUserLibrary() {
        // Check if Firebase is available
        if (typeof db === 'undefined') {
            console.log('📱 Loading sample library content...');
            this.showSampleLibraryContent();
            return;
        }

        if (!this.currentUser) {
            console.log('⚠️ User not signed in, showing sample library content');
            this.showSampleLibraryContent();
            return;
        }

        try {
            // Get user's liked posts
            const likesSnapshot = await db.collection('likes')
                .where('userId', '==', this.currentUser.uid)
                .orderBy('createdAt', 'desc')
                .limit(20)
                .get();
            
            const likedPostIds = [];
            likesSnapshot.forEach(doc => {
                likedPostIds.push(doc.data().postId);
            });
            
            if (likedPostIds.length === 0) {
                this.showEmptyLibraryMessage();
                return;
            }
            
            // Get liked posts
            const postsSnapshot = await db.collection('posts')
                .where('__name__', 'in', likedPostIds)
                .get();
            
            const libraryPosts = [];
            postsSnapshot.forEach(doc => {
                libraryPosts.push({ id: doc.id, ...doc.data() });
            });
            
            this.renderPosts(libraryPosts, 'libraryVideos');
        } catch (error) {
            console.error('Error loading user library:', error);
            this.showSampleLibraryContent();
        }
    }

    // Show sample content when real data is unavailable
    showSampleTrendingContent() {
        const container = document.getElementById('trendingVideos');
        if (container) {
            container.innerHTML = `
                <div class="sample-content">
                    <h3>Trending Now</h3>
                    <p>Sample trending content will appear here</p>
                </div>
            `;
        }
    }

    showSampleLiveContent() {
        const container = document.getElementById('liveStreamSection');
        if (container) {
            container.innerHTML = `
                <div class="sample-content">
                    <h3>Live Streams</h3>
                    <p>Sample live streams will appear here</p>
                </div>
            `;
        }
    }

    showSampleShortsContent() {
        const container = document.getElementById('shortsSection');
        if (container) {
            container.innerHTML = `
                <div class="sample-content">
                    <h3>Shorts</h3>
                    <p>Sample shorts will appear here</p>
                </div>
            `;
        }
    }

    showNoSubscriptionsMessage() {
        const container = document.getElementById('subscriptionVideos');
        if (container) {
            container.innerHTML = `
                <div class="no-content">
                    <h3>No Subscriptions</h3>
                    <p>Follow some creators to see their content here</p>
                </div>
            `;
        }
    }

    showEmptyLibraryMessage() {
        const container = document.getElementById('libraryVideos');
        if (container) {
            container.innerHTML = `
                <div class="no-content">
                    <h3>Your Library is Empty</h3>
                    <p>Like some posts to see them here</p>
                </div>
            `;
        }
    }

    async handleLogin(form) {
        // Check if Firebase auth is available
        if (typeof auth === 'undefined') {
            alert('Authentication service not available. Please try again later.');
            return;
        }

        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;

        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            this.currentUser = userCredential.user;
            this.updateUIForSignedInUser();
            document.getElementById('authModal').style.display = 'none';
            form.reset();
            console.log('✅ Login successful:', this.currentUser.email);
        } catch (error) {
            alert('Login failed: ' + error.message);
            console.error('❌ Login error:', error);
        }
    }

    async handleSignup(form) {
        // Check if Firebase services are available
        if (typeof auth === 'undefined' || typeof db === 'undefined') {
            alert('Authentication service not available. Please try again later.');
            return;
        }

        const displayName = form.querySelector('input[type="text"]').value;
        const username = form.querySelectorAll('input[type="text"]')[1].value;
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;
        const bio = form.querySelector('textarea').value;

        try {
            // Check if username is available
            const usernameCheck = await db.collection('users').where('username', '==', username).get();
            if (!usernameCheck.empty) {
                alert('Username already taken. Please choose another.');
                return;
            }

            // Create user account
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            
            // Create user profile
            const userProfile = {
                displayName,
                username,
                bio,
                profilePic: '',
                banner: '',
                createdAt: new Date(),
                isAdmin: false
            };

            await db.collection('users').doc(userCredential.user.uid).set(userProfile);
            
            this.currentUser = userCredential.user;
            this.updateUIForSignedInUser();
            document.getElementById('authModal').style.display = 'none';
            form.reset();
            console.log('✅ Signup successful:', this.currentUser.email);
        } catch (error) {
            alert('Signup failed: ' + error.message);
        }
    }

    async handleLogout() {
        // Check if Firebase auth is available
        if (typeof auth === 'undefined') {
            console.log('⚠️ Firebase auth not available, clearing local user state');
            this.currentUser = null;
            this.updateUIForSignedOutUser();
            this.clearCreatorDashboardState();
            return;
        }

        try {
            await auth.signOut();
            this.currentUser = null;
            this.updateUIForSignedOutUser();
            this.clearCreatorDashboardState();
            console.log('✅ Logout successful');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Clear Creator Dashboard state and redirect if needed
    clearCreatorDashboardState() {
        console.log('🧹 Clearing Creator Dashboard state...');
        
        // Clear any Creator Dashboard related localStorage
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('stripe') || key.includes('dashboard') || key.includes('creator'))) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            console.log('🗑️ Removed Creator Dashboard data:', key);
        });
        
        // If user is on Creator Dashboard page, redirect to home with auth modal
        if (window.location.pathname.includes('creator-dashboard')) {
            console.log('🔄 User logged out from Creator Dashboard, redirecting to home...');
            window.location.href = '/?auth=login&message=logged_out';
        }
        
        // Clear any global Creator Dashboard state
        if (window.checkUserAuthentication) {
            try {
                window.checkUserAuthentication();
            } catch (e) {
                console.log('Creator Dashboard auth check not available');
            }
        }
        
        console.log('✅ Creator Dashboard state cleared');
    }

    // Switch between login and signup forms
    switchAuthTab(tab) {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        
        if (!loginForm || !signupForm) {
            console.warn('⚠️ Auth forms not found, skipping tab switch');
            return;
        }
        
        if (tab === 'signup') {
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
        } else {
            loginForm.style.display = 'block';
            signupForm.style.display = 'none';
        }
    }

    // Handle file upload
    async handleUpload(form) {
        if (!this.currentUser) {
            alert('Please sign in to upload content');
            return;
        }

        if (!this.selectedFile) {
            alert('Please select a file to upload');
            return;
        }

        const title = form.querySelector('input[type="text"]').value;
        const description = form.querySelector('textarea').value;
        const category = form.querySelector('select').value;

        try {
            // Show loading state
            const uploadBtn = document.getElementById('uploadBtn');
            uploadBtn.disabled = true;
            uploadBtn.textContent = 'Uploading...';

            // Upload file to Firebase Storage
            const fileRef = storage.ref(`uploads/${this.currentUser.uid}/${Date.now()}_${this.selectedFile.name}`);
            const uploadTask = await fileRef.put(this.selectedFile);
            const downloadURL = await uploadTask.ref.getDownloadURL();

            // Create post document
            const postData = {
                title: title,
                caption: description,
                mediaType: this.selectedFile.type.startsWith('video/') ? 'video' : 'image',
                mediaUrl: downloadURL,
                thumbnailUrl: downloadURL, // For now, use same URL
                category: category,
                creatorId: this.currentUser.uid,
                creatorName: this.currentUser.displayName || 'Anonymous',
                creatorUsername: this.currentUser.username || 'user',
                creatorPic: this.currentUser.photoURL || '',
                views: 0,
                likes: 0,
                comments: 0,
                status: 'active',
                createdAt: new Date()
            };

            await db.collection('posts').add(postData);

            // Reset form and close modal
            form.reset();
            this.selectedFile = null;
            document.getElementById('uploadModal').style.display = 'none';
            document.getElementById('filePreview').style.display = 'none';
            
            alert('Content uploaded successfully!');
            
            // Refresh posts
            this.loadPosts();
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed: ' + error.message);
        } finally {
            const uploadBtn = document.getElementById('uploadBtn');
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Upload';
        }
    }

    // Process tip payment
    async processTip() {
        if (!this.currentUser) {
            alert('Please sign in to send tips');
            return;
        }

        const amount = parseFloat(document.getElementById('customTipAmount').value);
        
        if (!amount || amount < 0.50) {
            alert('Minimum tip amount is $0.50');
            return;
        }

        try {
            // For demo purposes, we'll simulate a successful tip
            // In production, this would integrate with Stripe
            const tipData = {
                senderId: this.currentUser.uid,
                senderName: this.currentUser.displayName || 'Anonymous',
                recipientId: 'demo_creator', // This would be the actual creator ID
                amount: amount,
                createdAt: new Date(),
                status: 'completed'
            };

            // Add tip to Firestore
            await db.collection('tips').add(tipData);

            // Update creator's earnings
            const earningsRef = db.collection('earnings').doc('demo_creator');
            await earningsRef.set({
                totalTips: firebase.firestore.FieldValue.increment(amount),
                lastUpdated: new Date()
            }, { merge: true });

            document.getElementById('tipModal').style.display = 'none';
            alert(`Tip of $${amount.toFixed(2)} sent successfully!`);
        } catch (error) {
            console.error('Error processing tip:', error);
            alert('Failed to send tip. Please try again.');
        }
    }

    // Show earnings dashboard
    async showEarningsDashboard() {
        try {
            // Get user's earnings data
            const earningsRef = db.collection('earnings').doc(this.currentUser.uid);
            const earningsDoc = await earningsRef.get();
            
            let earnings = { totalEarnings: 0, monthlyEarnings: 0, viewEarnings: 0, tipEarnings: 0, adEarnings: 0 };
            
            if (earningsDoc.exists) {
                earnings = earningsDoc.data();
            }

            // Update UI
            document.getElementById('totalEarnings').textContent = `$${earnings.totalEarnings.toFixed(2)}`;
            document.getElementById('monthlyEarnings').textContent = `$${earnings.monthlyEarnings.toFixed(2)}`;
            document.getElementById('viewEarnings').textContent = `$${earnings.viewEarnings.toFixed(2)}`;
            document.getElementById('tipEarnings').textContent = `$${earnings.tipEarnings.toFixed(2)}`;
            document.getElementById('adEarnings').textContent = `$${earnings.adEarnings.toFixed(2)}`;

            // Show modal
            document.getElementById('earningsModal').style.display = 'block';
        } catch (error) {
            console.error('Error loading earnings:', error);
            alert('Failed to load earnings data');
        }
    }

    // Request payout with Stripe Connect
    async requestPayout() {
        try {
            const earningsRef = db.collection('earnings').doc(this.currentUser.uid);
            const earningsDoc = await earningsRef.get();
            
            if (!earningsDoc.exists) {
                alert('No earnings data found');
                return;
            }

            const earnings = earningsDoc.data();
            
            if (earnings.totalEarnings < 25) {
                alert('You need at least $25.00 in earnings to request a payout');
                return;
            }

            // Check if user has Stripe Connect account
            const userDoc = await db.collection('users').doc(this.currentUser.uid).get();
            const userData = userDoc.data();
            
            if (!userData.stripeAccountId) {
                // Create Stripe Connect account first
                const createAccount = confirm('You need to connect your Stripe account first. Would you like to do that now?');
                if (createAccount) {
                    await this.createStripeConnectAccount();
                }
                return;
            }

            // Show loading state
            const payoutBtn = document.querySelector('#earningsModal .btn-primary');
            const originalText = payoutBtn.textContent;
            payoutBtn.textContent = 'Processing...';
            payoutBtn.disabled = true;

            // Create payout through Stripe Connect
            const response = await fetch('/api/create-payout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    accountId: userData.stripeAccountId,
                    amount: Math.round(earnings.totalEarnings * 100), // Convert to cents
                    userId: this.currentUser.uid
                }),
            });

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error);
            }

            if (result.success) {
                alert('Payout initiated successfully! You will receive payment within 3-5 business days.');
            
            // Reset earnings after payout
            await earningsRef.set({
                totalEarnings: 0,
                monthlyEarnings: 0,
                viewEarnings: 0,
                tipEarnings: 0,
                adEarnings: 0,
                lastPayout: new Date(),
                lastUpdated: new Date()
            });

            // Refresh dashboard
            this.showEarningsDashboard();
            } else {
                throw new Error('Payout failed');
            }

        } catch (error) {
            console.error('Error requesting payout:', error);
            alert('Failed to request payout: ' + error.message);
        } finally {
            // Reset button state
            const payoutBtn = document.querySelector('#earningsModal .btn-primary');
            if (payoutBtn) {
                payoutBtn.textContent = 'Request Payout';
                payoutBtn.disabled = false;
            }
        }
    }

    // Create Stripe Connect account
    async createStripeConnectAccount() {
        try {
            const response = await fetch('/api/create-stripe-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: this.currentUser.email,
                    country: 'US', // Default country
                    userId: this.currentUser.uid,
                    displayName: this.currentUser.displayName || 'Creator'
                }),
            });

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error);
            }

            if (result.success && result.accountLink) {
                // Redirect to Stripe Connect onboarding
                window.open(result.accountLink, '_blank');
                
                // Update user document with Stripe account ID
                await db.collection('users').doc(this.currentUser.uid).update({
                    stripeAccountId: result.accountId,
                    stripeAccountStatus: 'pending'
                });

                alert('Stripe account creation initiated! Please complete the onboarding process in the new tab.');
            } else {
                throw new Error('Failed to create Stripe account');
            }

        } catch (error) {
            console.error('Error creating Stripe account:', error);
            alert('Failed to create Stripe account: ' + error.message);
        }
    }

    handleFileSelect(file) {
        if (file.size > 50 * 1024 * 1024) {
            alert('File size must be less than 50MB');
            return;
        }

        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');

        if (!isVideo && !isImage) {
            alert('Please select a video or image file');
            return;
        }

        this.selectedFile = file;
        this.showFilePreview(file);
        document.getElementById('uploadBtn').disabled = false;
    }

    showFilePreview(file) {
        const preview = document.getElementById('filePreview');
        const videoPreview = document.getElementById('videoPreview');
        const imagePreview = document.getElementById('imagePreview');

        preview.style.display = 'block';

        if (file.type.startsWith('video/')) {
            videoPreview.style.display = 'block';
            imagePreview.style.display = 'none';
            videoPreview.src = URL.createObjectURL(file);
        } else {
            imagePreview.style.display = 'block';
            videoPreview.style.display = 'none';
            imagePreview.src = URL.createObjectURL(file);
        }
    }

    removeSelectedFile() {
        this.selectedFile = null;
        document.getElementById('filePreview').style.display = 'none';
        document.getElementById('uploadBtn').disabled = true;
        document.getElementById('fileInput').value = '';
    }

    async generateVideoThumbnail(videoFile, postId) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(videoFile);
            video.currentTime = 1; // Seek to 1 second
            
            video.addEventListener('loadeddata', async () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0);
                
                canvas.toBlob(async (blob) => {
                    const thumbnailRef = storage.ref(`thumbnails/${postId}/thumbnail.jpg`);
                    await thumbnailRef.put(blob);
                    const thumbnailURL = await thumbnailRef.getDownloadURL();
                    resolve(thumbnailURL);
                }, 'image/jpeg', 0.8);
            });
        });
    }

    async loadPosts() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        const loadingSpinner = document.getElementById('loadingSpinner');
        if (loadingSpinner) loadingSpinner.style.display = 'block';

        try {
            // Check if db is available
            if (typeof db === 'undefined') {
                // console.log('📱 Database not ready, loading fallback content...');
                if (loadingSpinner) loadingSpinner.style.display = 'none';
                this.isLoading = false;
                this.loadFallbackContent();
                return;
            }

            // Use simpler query that doesn't require composite indexes
            let query = db.collection('posts')
                .limit(this.postsPerPage);

            if (this.lastPost) {
                query = query.startAfter(this.lastPost);
            }

            const snapshot = await query.get();
            
            if (snapshot.empty) {
                // console.log('📝 No posts found - using fallback content');
                if (loadingSpinner) loadingSpinner.style.display = 'none';
                this.isLoading = false;
                this.loadFallbackContent();
                return;
            }

            const newPosts = [];
            snapshot.forEach(doc => {
                const post = { id: doc.id, ...doc.data() };
                // Only include active posts
                if (post.status === 'active') {
                    newPosts.push(post);
                }
            });
            
            // Sort by creation date on client side
            newPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            this.lastPost = snapshot.docs[snapshot.docs.length - 1];
            this.posts = this.lastPost ? [...this.posts, ...newPosts] : newPosts;
            
            // Skip rendering posts on simplified home page
            // console.log('📱 Simplified home page - skipping posts rendering');
            if (loadingSpinner) loadingSpinner.style.display = 'none';
        } catch (error) {
            console.error('Error loading posts:', error);
            
            // Handle specific error types
            if (error.code === 'permission-denied') {
                console.log('🔒 Permission denied - using fallback content');
            } else if (error.code === 'unavailable') {
                console.log('🌐 Service temporarily unavailable - using fallback content');
            } else if (error.message.includes('Missing or insufficient permissions')) {
                console.log('🔒 Firestore permissions issue - using fallback content');
            } else if (error.message.includes('collection') || error.message.includes('not found')) {
                console.log('📝 Collections not found, creating sample data...');
                await this.createSampleData();
                return;
            }
            
            // Always load fallback content on error
            this.loadFallbackContent();
            if (loadingSpinner) loadingSpinner.style.display = 'none';
        }
        
        this.isLoading = false;
    }

    // Create sample data for demo purposes
    async createSampleData() {
        try {
            console.log('🎯 Creating sample data for demo...');
            
            // Create sample posts
            await this.createSamplePosts();
            
            // Create sample users
            await this.createSampleUsers();
            
            // Create sample live streams
            await this.createSampleLiveStreams();
            
            console.log('✅ Sample data created successfully');
            
            // Now try to load posts again
            await this.loadPosts();
        } catch (error) {
            console.error('❌ Error creating sample data:', error);
            this.loadFallbackContent();
        }
    }

    // Create sample posts for demo purposes
    async createSamplePosts() {
        try {
            console.log('🎯 Creating sample posts for demo...');
            
            const samplePosts = [
                {
                    title: 'Welcome to Amplifi! 🎉',
                    caption: 'This is your first post on Amplifi. Start sharing your content with the world!',
                    authorName: 'Amplifi Team',
                    authorUsername: 'amplifi',
                    authorPic: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'%3E%3Crect width=\'32\' height=\'32\' fill=\'%23636f1\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'white\' font-family=\'Arial, sans-serif\' font-size=\'12\'%3EA%3C/text%3E%3C/svg%3E',
                    mediaType: 'image',
                    mediaUrl: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'600\' height=\'400\' viewBox=\'0 0 600 400\'%3E%3Crect width=\'600\' height=\'400\' fill=\'%23667eea\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'white\' font-family=\'Arial, sans-serif\' font-size=\'24\'%3EWelcome to Amplifi%3C/text%3E%3C/svg%3E',
                    views: 42,
                    likes: 15,
                    comments: 3,
                    status: 'active',
                    createdAt: new Date(),
                    creatorId: 'demo'
                },
                {
                    title: 'Getting Started with Video 📹',
                    caption: 'Learn how to upload and share videos on Amplifi. Your creativity has no limits!',
                    authorName: 'Amplifi Team',
                    authorUsername: 'amplifi',
                    authorPic: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'%3E%3Crect width=\'32\' height=\'32\' fill=\'%23636f1\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'white\' font-family=\'Arial, sans-serif\' font-size=\'12\'%3EA%3C/text%3E%3C/svg%3E',
                    mediaType: 'video',
                    mediaUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
                    thumbnailUrl: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'600\' height=\'400\' viewBox=\'0 0 600 400\'%3E%3Crect width=\'600\' height=\'400\' fill=\'%23ff6b6b\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'white\' font-family=\'Arial, sans-serif\' font-size=\'24\'%3EVideo Content%3C/text%3E%3C/svg%3E',
                    views: 128,
                    likes: 28,
                    comments: 7,
                    status: 'active',
                    createdAt: new Date(Date.now() - 86400000), // 1 day ago
                    creatorId: 'demo'
                }
            ];

            // Add sample posts to local array for display
            this.posts = samplePosts;
            
            // Skip rendering posts on simplified home page
            // console.log('📱 Simplified home page - skipping posts rendering');
            
            console.log('✅ Sample posts created and displayed');
        } catch (error) {
            console.error('❌ Error creating sample posts:', error);
        }
    }

    // Create sample users for demo purposes
    async createSampleUsers() {
        try {
            console.log('👥 Creating sample users...');
            
            const sampleUsers = [
                {
                    displayName: 'Amplifi Team',
                    username: 'amplifi',
                    email: 'team@amplifi.com',
                    bio: 'Building the future of creator platforms',
                    profilePic: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'150\' height=\'150\' viewBox=\'0 0 150 150\'%3E%3Crect width=\'150\' height=\'150\' fill=\'%23636f1\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'white\' font-family=\'Arial, sans-serif\' font-size=\'48\'%3EA%3C/text%3E%3C/svg%3E',
                    banner: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'300\' viewBox=\'0 0 1200 300\'%3E%3Crect width=\'1200\' height=\'300\' fill=\'%23667eea\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'white\' font-family=\'Arial, sans-serif\' font-size=\'36\'%3EAmplifi Team%3C/text%3E%3C/svg%3E',
                    isAdmin: true,
                    createdAt: new Date(),
                    followers: 1250,
                    following: 45,
                    totalPosts: 12
                },
                {
                    displayName: 'Creative Creator',
                    username: 'creative',
                    email: 'creative@example.com',
                    bio: 'Passionate about sharing creative content',
                    profilePic: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'150\' height=\'150\' viewBox=\'0 0 150 150\'%3E%3Crect width=\'150\' height=\'150\' fill=\'%23ff6b6b\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'white\' font-family=\'Arial, sans-serif\' font-size=\'48\'%3EC%3C/text%3E%3C/svg%3E',
                    banner: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'300\' viewBox=\'0 0 1200 300\'%3E%3Crect width=\'1200\' height=\'300\' fill=\'%23ff6b6b\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'white\' font-family=\'Arial, sans-serif\' font-size=\'36\'%3ECreative Creator%3C/text%3E%3C/svg%3E',
                    isAdmin: false,
                    createdAt: new Date(),
                    followers: 890,
                    following: 120,
                    totalPosts: 8
                }
            ];

            for (const userData of sampleUsers) {
                await db.collection('users').add(userData);
            }
            
            console.log('✅ Sample users created');
        } catch (error) {
            console.error('❌ Error creating sample users:', error);
        }
    }

    // Create sample live streams for demo purposes
    async createSampleLiveStreams() {
        try {
            console.log('📺 Creating sample live streams...');
            
            const sampleStreams = [
                {
                    title: 'Amplifi Live Demo',
                    description: 'Join us for a live demonstration of Amplifi features',
                    creatorId: 'demo',
                    creatorName: 'Amplifi Team',
                    status: 'live',
                    viewerCount: 156,
                    startedAt: new Date(),
                    thumbnailUrl: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'600\' height=\'400\' viewBox=\'0 0 600 400\'%3E%3Crect width=\'600\' height=\'400\' fill=\'%23667eea\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'white\' font-family=\'Arial, sans-serif\' font-size=\'24\'%3ELive Stream%3C/text%3E%3C/svg%3E',
                    tags: ['demo', 'amplifi', 'live']
                },
                {
                    title: 'Creator Tips & Tricks',
                    description: 'Learn how to grow your audience on Amplifi',
                    creatorId: 'demo',
                    creatorName: 'Amplifi Team',
                    status: 'scheduled',
                    scheduledAt: new Date(Date.now() + 86400000), // Tomorrow
                    thumbnailUrl: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'600\' height=\'400\' viewBox=\'0 0 600 400\'%3E%3Crect width=\'600\' height=\'400\' fill=\'%23ff6b6b\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'white\' font-family=\'Arial, sans-serif\' font-size=\'24\'%3EScheduled Stream%3C/text%3E%3C/svg%3E',
                    tags: ['tips', 'creator', 'growth']
                }
            ];

            for (const streamData of sampleStreams) {
                await db.collection('liveStreams').add(streamData);
            }
            
            console.log('✅ Sample live streams created');
        } catch (error) {
            console.error('❌ Error creating sample live streams:', error);
        }
    }

    renderPosts(posts = null, containerId = null) {
        const postsToRender = posts || this.posts;
        let container;
        
        if (containerId) {
            container = document.getElementById(containerId);
        } else {
            // Default to trending videos if no specific container specified
            container = document.getElementById('trendingVideos') || 
                       document.getElementById('personalizedVideos') || 
                       document.getElementById('continueWatching') || 
                       document.getElementById('subscriptionVideos');
        }
        
        if (!container) {
            console.log('⚠️ Posts container not found:', containerId);
            return;
        }

        if (!postsToRender || postsToRender.length === 0) {
            container.innerHTML = `
                <div class="no-posts">
                    <i class="fas fa-video"></i>
                    <h3>No posts yet</h3>
                    <p>Be the first to share something amazing!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = postsToRender.map(post => `
            <div class="post-card" data-post-id="${post.id}">
                <div class="post-header">
                    <img src="${post.creatorPic || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'%3E%3Crect width=\'32\' height=\'32\' fill=\'%23636f1\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'white\' font-family=\'Arial, sans-serif\' font-size=\'12\'%3EU%3C/text%3E%3C/svg%3E'}" alt="Profile" class="profile-pic">
                    <div class="post-info">
                        <h4>${post.creatorName || 'Anonymous'}</h4>
                        <span class="username">@${post.creatorUsername || 'user'}</span>
                        <span class="timestamp">${this.formatTimestamp(post.createdAt)}</span>
                    </div>
                </div>
                
                <div class="post-content">
                    <h3>${post.title || 'Untitled'}</h3>
                    <p>${post.caption || ''}</p>
                    
                    ${post.mediaType === 'video' ? `
                        <video controls class="post-media">
                            <source src="${post.mediaUrl}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    ` : post.mediaType === 'image' ? `
                        <img src="${post.mediaUrl}" alt="Post image" class="post-media">
                    ` : ''}
                </div>
                
                <div class="post-actions">
                    <button class="action-btn like-btn" onclick="app.toggleLike('${post.id}')">
                        <i class="fas fa-heart ${post.liked ? 'liked' : ''}"></i>
                        <span>${post.likes || 0}</span>
                    </button>
                    <button class="action-btn comment-btn" onclick="app.showComments('${post.id}')">
                        <i class="fas fa-comment"></i>
                        <span>${post.comments || 0}</span>
                    </button>
                    <button class="action-btn share-btn" onclick="app.sharePost('${post.id}')">
                        <i class="fas fa-share"></i>
                    </button>
                    <button class="action-btn tip-btn" onclick="app.showTipModal('${post.creatorId}')">
                        <i class="fas fa-gift"></i>
                        <span>Tip</span>
                    </button>
                </div>
                
                <div class="post-stats">
                    <span class="views">${post.views || 0} views</span>
                    <span class="category">${post.category || 'general'}</span>
                </div>
            </div>
        `).join('');
    }

    // Show tip modal
    async showTipModal(creatorId) {
        if (!this.currentUser) {
            alert('Please login to tip creators');
            return;
        }

        if (creatorId === this.currentUser.uid) {
            alert('You cannot tip yourself');
            return;
        }

        // Get creator info
        try {
            const creatorDoc = await db.collection('users').doc(creatorId).get();
            let creatorName = 'Creator';
            
            if (creatorDoc.exists) {
                creatorName = creatorDoc.data().displayName || 'Creator';
            }

            // Update tip modal with creator info
            const creatorInfo = document.querySelector('.tip-modal p');
            if (creatorInfo) {
                creatorInfo.innerHTML = `Tip <strong>${creatorName}</strong>`;
            }

            // Show tip modal
            document.getElementById('tipModal').style.display = 'block';
        } catch (error) {
            console.error('Error loading creator info:', error);
            // Show tip modal anyway
            document.getElementById('tipModal').style.display = 'block';
        }
    }

    // Toggle like on a post
    async toggleLike(postId) {
        if (!this.currentUser) {
            alert('Please sign in to like posts');
            return;
        }

        try {
            const likeRef = db.collection('likes').doc(`${this.currentUser.uid}_${postId}`);
            const likeDoc = await likeRef.get();
            
            if (likeDoc.exists) {
                // Unlike
                await likeRef.delete();
                
                // Decrease post like count
                await db.collection('posts').doc(postId).update({
                    likes: firebase.firestore.FieldValue.increment(-1)
                });
                
                // Update UI
                const likeBtn = document.querySelector(`[data-post-id="${postId}"] .like-btn i`);
                if (likeBtn) {
                    likeBtn.classList.remove('liked');
                }
                
                const likeCount = document.querySelector(`[data-post-id="${postId}"] .like-btn span`);
                if (likeCount) {
                    const currentCount = parseInt(likeCount.textContent);
                    likeCount.textContent = Math.max(0, currentCount - 1);
                }
            } else {
                // Like
                await likeRef.set({
                    userId: this.currentUser.uid,
                    postId: postId,
                    createdAt: new Date()
                });
                
                // Increase post like count
                await db.collection('posts').doc(postId).update({
                    likes: firebase.firestore.FieldValue.increment(1)
                });
                
                // Update UI
                const likeBtn = document.querySelector(`[data-post-id="${postId}"] .like-btn i`);
                if (likeBtn) {
                    likeBtn.classList.add('liked');
                }
                
                const likeCount = document.querySelector(`[data-post-id="${postId}"] .like-btn span`);
                if (likeCount) {
                    const currentCount = parseInt(likeCount.textContent);
                    likeCount.textContent = currentCount + 1;
                }
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            alert('Failed to update like');
        }
    }

    // Show comments for a post
    async showComments(postId) {
        // For now, just show a simple alert
        // In a full implementation, this would open a comments modal
    }

    // Share a post
    async sharePost(postId) {
        try {
            const postDoc = await db.collection('posts').doc(postId).get();
            if (postDoc.exists) {
                const post = postDoc.data();
                const shareUrl = `${window.location.origin}/post/${postId}`;
                const shareText = `Check out this post: ${post.title || 'Amplifi Post'}`;
                
                if (navigator.share) {
                    // Use native sharing if available
                    await navigator.share({
                        title: post.title || 'Amplifi Post',
                        text: shareText,
                        url: shareUrl
                    });
                } else {
                    // Fallback to copying to clipboard
                    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
                    alert('Post link copied to clipboard!');
                }
            }
        } catch (error) {
            console.error('Error sharing post:', error);
            alert('Failed to share post');
        }
    }

    async loadDashboard() {
        if (!this.currentUser) return;

        try {
            // Load user's posts
            const postsSnapshot = await db.collection('posts')
                .where('authorId', '==', this.currentUser.uid)
                .orderBy('createdAt', 'desc')
                .get();

            const userPosts = [];
            postsSnapshot.forEach(doc => {
                userPosts.push({ id: doc.id, ...doc.data() });
            });

            this.renderUserPosts(userPosts);

            // Load earnings data
            const earningsDoc = await db.collection('earnings').doc(this.currentUser.uid).get();
            if (earningsDoc.exists) {
                const earnings = earningsDoc.data();
                document.getElementById('totalViews').textContent = earnings.totalViews || 0;
                document.getElementById('totalEarnings').textContent = `$${(earnings.totalEarnings || 0).toFixed(2)}`;
                document.getElementById('totalTips').textContent = `$${(earnings.totalTips || 0).toFixed(2)}`;
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    renderUserPosts(posts) {
        const userPostsContainer = document.getElementById('userPosts');
        if (userPostsContainer) {
            userPostsContainer.innerHTML = '';

            if (posts.length === 0) {
                userPostsContainer.innerHTML = '<p>No posts yet. Start sharing your content!</p>';
                return;
            }

            posts.forEach(post => {
                const postElement = this.createPostElement(post);
                userPostsContainer.appendChild(postElement);
            });
        }
    }

    filterPosts(filter) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        // Reset posts and reload with filter
        this.posts = [];
        this.lastPost = null;
        this.loadPosts();
    }

    playVideo(videoElement) {
        if (videoElement && !videoElement.paused) {
            videoElement.play();
        } else if (videoElement) {
            videoElement.pause();
        }
    }

    formatTimestamp(timestamp) {
        if (!timestamp) return '';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return date.toLocaleDateString();
    }

    // Check for account recovery when user logs in
    async checkAccountRecovery() {
        if (!this.currentUser || !this.userProfile) return;

        try {
            // Check if account is deactivated
            if (this.userProfile.deactivated) {
                this.showReactivatePrompt();
                return;
            }

            // Check if account is deleted
            if (this.userProfile.deleted) {
                this.showRestorePrompt();
                return;
            }

            // Check recovery collection for additional info
            const recoveryDoc = await db.collection('accountRecovery').doc(this.currentUser.uid).get();
            if (recoveryDoc.exists) {
                const recoveryData = recoveryDoc.data();
                
                if (recoveryData.accountType === 'deleted') {
                    // Check if recovery deadline has passed
                    if (recoveryData.recoveryDeadline && new Date() > recoveryData.recoveryDeadline.toDate()) {
                        this.showRecoveryExpiredPrompt();
                    } else {
                        this.showRestorePrompt();
                    }
                }
            }
        } catch (error) {
            console.error('Error checking account recovery:', error);
        }
    }

    // Show reactivation prompt
    showReactivatePrompt() {
        const modal = document.createElement('div');
        modal.className = 'account-recovery-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 1rem; text-align: center; max-width: 400px;">
                <h3>Welcome Back!</h3>
                <p>Your account was deactivated. Would you like to reactivate it?</p>
                <button id="reactivateBtn" style="background: #10b981; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; margin: 0.5rem;">Reactivate Account</button>
                <button id="cancelReactivateBtn" style="background: #6b7280; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; margin: 0.5rem;">Cancel</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('reactivateBtn').addEventListener('click', () => {
            this.reactivateAccount();
            document.body.removeChild(modal);
        });
        
        document.getElementById('cancelReactivateBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    // Show restore prompt
    showRestorePrompt() {
        const modal = document.createElement('div');
        modal.className = 'account-recovery-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 1rem; text-align: center; max-width: 400px;">
                <h3>Account Recovery</h3>
                <p>Your account was deleted. You can restore it within 30 days.</p>
                <button id="restoreBtn" style="background: #10b981; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; margin: 0.5rem;">Restore Account</button>
                <button id="cancelRestoreBtn" style="background: #6b7280; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; margin: 0.5rem;">Cancel</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('restoreBtn').addEventListener('click', () => {
            this.restoreDeletedAccount();
            document.body.removeChild(modal);
        });
        
        document.getElementById('cancelRestoreBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    // Show recovery expired prompt
    showRecoveryExpiredPrompt() {
        const modal = document.createElement('div');
        modal.className = 'account-recovery-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 1rem; text-align: center; max-width: 400px;">
                <h3>Recovery Period Expired</h3>
                <p>Your account recovery period has expired (30 days). Please contact support for assistance.</p>
                <button id="contactSupportBtn" style="background: #10b981; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; margin: 0.5rem;">Contact Support</button>
                <button id="cancelExpiredBtn" style="background: #6b7280; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; margin: 0.5rem;">Cancel</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('contactSupportBtn').addEventListener('click', () => {
            window.location.href = 'support.html';
            document.body.removeChild(modal);
        });
        
        document.getElementById('cancelExpiredBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    // Reactivate account
    async reactivateAccount() {
        try {
            await db.collection('users').doc(this.currentUser.uid).update({
                deactivated: false,
                reactivatedAt: new Date(),
                canRecover: false
            });

            // Remove from recovery collection
            await db.collection('accountRecovery').doc(this.currentUser.uid).delete();

            alert('Account reactivated successfully!');
            window.location.reload();
        } catch (error) {
            console.error('Error reactivating account:', error);
            alert('Failed to reactivate account');
        }
    }

    // Restore deleted account
    async restoreDeletedAccount() {
        try {
            // Check if account can still be recovered
            const recoveryDoc = await db.collection('accountRecovery').doc(this.currentUser.uid).get();
            if (!recoveryDoc.exists) {
                alert('Account recovery information not found');
                return;
            }

            const recoveryData = recoveryDoc.data();
            if (recoveryData.accountType !== 'deleted') {
                alert('This account is not deleted');
                return;
            }

            // Check if recovery deadline has passed
            if (recoveryData.recoveryDeadline && new Date() > recoveryData.recoveryDeadline.toDate()) {
                alert('Account recovery period has expired (30 days). Please contact support.');
                return;
            }

            // Restore account data
            const deletedAccountDoc = await db.collection('deletedAccounts').doc(this.currentUser.uid).get();
            if (deletedAccountDoc.exists) {
                const accountData = deletedAccountDoc.data();
                delete accountData.deleted;
                delete accountData.deletedAt;
                delete accountData.canRecover;
                delete accountData.recoveryDeadline;

                // Restore to users collection
                await db.collection('users').doc(this.currentUser.uid).set(accountData);

                // Remove from deleted accounts
                await db.collection('deletedAccounts').doc(this.currentUser.uid).delete();
            }

            // Update users collection
            await db.collection('users').doc(this.currentUser.uid).update({
                deleted: false,
                restoredAt: new Date(),
                canRecover: false
            });

            // Remove from recovery collection
            await db.collection('accountRecovery').doc(this.currentUser.uid).delete();

            alert('Account restored successfully!');
            window.location.reload();
        } catch (error) {
            console.error('Error restoring account:', error);
            alert('Failed to restore account');
        }
    }

    // Load user profile
    async loadUserProfile() {
        try {
            const userDoc = await db.collection('users').doc(this.currentUser.uid).get();
            if (userDoc.exists) {
                this.userProfile = userDoc.data();
            } else {
                // Create user profile if it doesn't exist
                this.userProfile = {
                    displayName: this.currentUser.displayName || 'Anonymous',
                    username: this.currentUser.email.split('@')[0],
                    bio: '',
                    profilePic: '',
                    banner: '',
                    createdAt: new Date(),
                    isAdmin: false
                };
                await db.collection('users').doc(this.currentUser.uid).set(this.userProfile);
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    // Render live streams
    renderLiveStreams(streams) {
        const container = document.getElementById('liveStreamSection');
        if (!container) return;
        
        if (!streams || streams.length === 0) {
            container.innerHTML = `
                <div class="no-live-streams">
                    <h3>No Live Streams</h3>
                    <p>Check back later for live content</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = streams.map(stream => `
            <div class="live-stream-card">
                <div class="stream-thumbnail">
                    <img src="${stream.thumbnailUrl || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'320\' height=\'180\' viewBox=\'0 0 320 180\'%3E%3Crect width=\'320\' height=\'180\' fill=\'%23ff6b6b\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'white\' font-family=\'Arial, sans-serif\' font-size=\'16\'%3ELive%3C/text%3E%3C/svg%3E'}" alt="Live stream">
                    <div class="live-indicator">
                        <span class="live-dot"></span>
                        LIVE
                    </div>
                    <div class="viewer-count">
                        <i class="fas fa-eye"></i>
                        ${stream.viewerCount || 0}
                    </div>
                </div>
                <div class="stream-info">
                    <h3>${stream.title}</h3>
                    <p>${stream.description}</p>
                    <div class="streamer-info">
                        <img src="${stream.streamerPic || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Crect width=\'24\' height=\'24\' fill=\'%23636f1\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'white\' font-family=\'Arial, sans-serif\' font-size=\'10\'%3ES%3C/text%3E%3C/svg%3E'}" alt="Streamer">
                        <span>${stream.streamerName}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Render shorts
    renderShorts(shorts) {
        const container = document.getElementById('shortsSection');
        if (!container) return;
        
        if (!shorts || shorts.length === 0) {
            container.innerHTML = `
                <div class="no-shorts">
                    <h3>No Shorts Available</h3>
                    <p>Check back later for short-form content</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = shorts.map(short => `
            <div class="short-card">
                <video controls class="short-video">
                    <source src="${short.mediaUrl}" type="video/mp4">
                </video>
                <div class="short-info">
                    <h4>${short.title || 'Untitled'}</h4>
                    <p>${short.caption || ''}</p>
                    <div class="short-stats">
                        <span>${short.views || 0} views</span>
                        <span>${short.likes || 0} likes</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Global theme management methods
    initGlobalTheme() {
        console.log('🎨 Initializing global theme...');
        const savedSettings = localStorage.getItem('amplifiSettings');
        if (savedSettings) {
            this.themeManager.settings = JSON.parse(savedSettings);
            this.applyGlobalTheme(this.themeManager.settings);
        }
    }

    applyGlobalTheme(settings) {
        if (!settings) return;
        
        console.log('🎨 Applying global theme:', settings);
        
        // Apply dark mode
        if (settings.darkMode) {
            document.body.classList.add('dark-theme');
            document.documentElement.setAttribute('data-theme', 'dark');
            this.applyDarkModeStyles();
        } else {
            document.body.classList.remove('dark-theme');
            document.documentElement.setAttribute('data-theme', 'light');
            this.applyLightModeStyles();
        }
        
        // Apply theme color
        if (settings.themeColor) {
            document.documentElement.style.setProperty('--primary-color', settings.themeColor);
            this.updateThemeElements(settings.themeColor);
        }
        
        // Apply font size
        if (settings.fontSize) {
            const baseSize = settings.fontSize + 'px';
            document.documentElement.style.setProperty('--base-font-size', baseSize);
            document.documentElement.style.setProperty('--font-size-base', baseSize);
            document.body.style.fontSize = baseSize;
        }
    }

    updateGlobalTheme(settingName, value) {
        console.log(`🎨 Updating global theme: ${settingName} = ${value}`);
        
        switch(settingName) {
            case 'darkMode':
                if (value) {
                    document.body.classList.add('dark-theme');
                    document.documentElement.setAttribute('data-theme', 'dark');
                    this.applyDarkModeStyles();
                } else {
                    document.body.classList.remove('dark-theme');
                    document.documentElement.setAttribute('data-theme', 'light');
                    this.applyLightModeStyles();
                }
                break;
                
            case 'themeColor':
                document.documentElement.style.setProperty('--primary-color', value);
                this.updateThemeElements(value);
                break;
                
            case 'fontSize':
                const baseSize = value + 'px';
                document.documentElement.style.setProperty('--base-font-size', baseSize);
                document.documentElement.style.setProperty('--font-size-base', baseSize);
                document.body.style.fontSize = baseSize;
                break;
        }
        
        // Save updated settings
        this.themeManager.settings[settingName] = value;
        localStorage.setItem('amplifiSettings', JSON.stringify(this.themeManager.settings));
    }

    applyDarkModeStyles() {
        // Apply dark mode CSS variables
        document.documentElement.style.setProperty('--bg-primary', '#1a1a1a');
        document.documentElement.style.setProperty('--bg-secondary', '#2d2d2d');
        document.documentElement.style.setProperty('--text-primary', '#ffffff');
        document.documentElement.style.setProperty('--text-secondary', '#b0b0b0');
        document.documentElement.style.setProperty('--border-light', '#404040');
        
        // Add dark mode class to body
        document.body.classList.add('dark-theme');
    }

    applyLightModeStyles() {
        // Apply light mode CSS variables
        document.documentElement.style.setProperty('--bg-primary', '#ffffff');
        document.documentElement.style.setProperty('--bg-secondary', '#f8f9fa');
        document.documentElement.style.setProperty('--text-primary', '#333333');
        document.documentElement.style.setProperty('--text-secondary', '#6c757d');
        document.documentElement.style.setProperty('--border-light', '#dee2e6');
        
        // Remove dark mode class from body
        document.body.classList.remove('dark-theme');
    }

    updateThemeElements(color) {
        // Update all primary buttons
        const primaryButtons = document.querySelectorAll('.btn-primary');
        primaryButtons.forEach(btn => {
            btn.style.background = color;
        });
        
        // Update active toggle switches
        const activeToggles = document.querySelectorAll('.toggle-switch.active');
        activeToggles.forEach(toggle => {
            toggle.style.background = color;
        });
        
        // Update theme previews
        const themePreviews = document.querySelectorAll('.theme-preview.active');
        themePreviews.forEach(preview => {
            preview.style.borderColor = color;
        });
    }
}

// Global function for opening auth modal
function openAuthModal(type = 'login') {
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.style.display = 'block';
        
        // Switch to the appropriate tab
        if (type === 'login') {
            const loginTab = document.querySelector('[data-tab="login"]');
            if (loginTab) {
                loginTab.click();
            }
        } else if (type === 'signup') {
            const signupTab = document.querySelector('[data-tab="signup"]');
            if (signupTab) {
                signupTab.click();
            }
        }
    } else {
        console.error('Auth modal not found');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    console.log("🚀 Initializing Amplifi App...");
    window.app = new AmplifiApp();
    window.app.init();
    console.log("✅ Amplifi App initialized and assigned to window.app");
});

