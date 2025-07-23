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
        
        // AdMob configuration
        this.adMobConfig = {
            bannerAdUnitId: 'ca-pub-YOUR_ADMOB_BANNER_ID',
            interstitialAdUnitId: 'ca-pub-YOUR_ADMOB_INTERSTITIAL_ID',
            rewardedAdUnitId: 'ca-pub-YOUR_ADMOB_REWARDED_ID'
        };
        
        // Push notification configuration
        this.notificationConfig = {
            vapidKey: 'YOUR_VAPID_KEY',
            supported: 'serviceWorker' in navigator && 'PushManager' in window
        };
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupAuthStateListener();
        this.loadPosts();
        this.initializeAdMob();
        this.initializePushNotifications();
        this.registerServiceWorker();
    }

    // Initialize AdMob
    initializeAdMob() {
        if (typeof adsbygoogle !== 'undefined') {
            this.loadBannerAd();
            this.loadInterstitialAd();
        }
    }

    // Load banner ad
    loadBannerAd() {
        const bannerAd = document.getElementById('bannerAd');
        if (bannerAd) {
            try {
                (adsbygoogle = window.adsbygoogle || []).push({});
                document.getElementById('adBanner').style.display = 'block';
            } catch (error) {
                console.error('Error loading banner ad:', error);
            }
        }
    }

    // Load interstitial ad
    loadInterstitialAd() {
        const interstitialAd = document.getElementById('interstitialAdContent');
        if (interstitialAd) {
            try {
                (adsbygoogle = window.adsbygoogle || []).push({});
            } catch (error) {
                console.error('Error loading interstitial ad:', error);
            }
        }
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
    async initializePushNotifications() {
        if (!this.notificationConfig.supported) {
            console.log('Push notifications not supported');
            return;
        }

        // Check if user has already granted permission
        if (Notification.permission === 'granted') {
            this.setupNotificationButton();
        } else if (Notification.permission === 'default') {
            this.showNotificationPermissionModal();
        }
    }

    // Show notification permission modal
    showNotificationPermissionModal() {
        const modal = document.getElementById('notificationPermissionModal');
        if (modal) {
            modal.style.display = 'block';
            
            // Setup event listeners
            document.getElementById('enableNotifications').addEventListener('click', () => {
                this.requestNotificationPermission();
                modal.style.display = 'none';
            });
            
            document.getElementById('skipNotifications').addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
    }

    // Request notification permission
    async requestNotificationPermission() {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.setupNotificationButton();
                this.subscribeToPushNotifications();
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        }
    }

    // Setup notification button
    setupNotificationButton() {
        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationBtn) {
            notificationBtn.style.display = 'block';
            notificationBtn.addEventListener('click', () => {
                this.showNotificationSettings();
            });
        }
    }

    // Show notification settings
    showNotificationSettings() {
        // Show notification settings modal or redirect to browser settings
        if (Notification.permission === 'granted') {
            alert('Notifications are enabled! You can manage them in your browser settings.');
        } else {
            this.requestNotificationPermission();
        }
    }

    // Subscribe to push notifications
    async subscribeToPushNotifications() {
        if (!this.currentUser) return;

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(this.notificationConfig.vapidKey)
            });

            // Save subscription to Firestore
            await db.collection('pushSubscriptions').doc(this.currentUser.uid).set({
                subscription: subscription,
                userId: this.currentUser.uid,
                createdAt: new Date()
            });

            console.log('Push notification subscription saved');
        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
        }
    }

    // Convert VAPID key to Uint8Array
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
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', registration);

                // Listen for updates and show update banner
                if (navigator.serviceWorker.controller) {
                    navigator.serviceWorker.addEventListener('controllerchange', function() {
                        // Show a banner/toast to the user
                        showUpdateBanner();
                    });
                }
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
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
        // Navigation tabs - use tab-btn instead of nav-link
        document.querySelectorAll('.tab-btn[data-tab]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Modals - handle missing elements gracefully
        const loginModal = document.getElementById('loginModal');
        const signupModal = document.getElementById('signupModal');
        const tipModal = document.getElementById('tipModal');
        const commentsModal = document.getElementById('commentsModal');
        const newConversationModal = document.getElementById('newConversationModal');
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const closeBtns = document.querySelectorAll('.close');

        if (loginBtn && loginModal) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                loginModal.style.display = 'block';
            });
        }

        if (signupBtn && signupModal) {
            signupBtn.addEventListener('click', (e) => {
                e.preventDefault();
                signupModal.style.display = 'block';
            });
        }

        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (loginModal) loginModal.style.display = 'none';
                if (signupModal) signupModal.style.display = 'none';
                if (tipModal) tipModal.style.display = 'none';
                if (commentsModal) commentsModal.style.display = 'none';
                if (newConversationModal) newConversationModal.style.display = 'none';
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
            }
            if (e.target === signupModal) {
                signupModal.style.display = 'none';
            }
            if (e.target === tipModal) {
                tipModal.style.display = 'none';
            }
            if (e.target === commentsModal) {
                commentsModal.style.display = 'none';
            }
            if (e.target === newConversationModal) {
                newConversationModal.style.display = 'none';
            }
        });

        // Auth forms
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const logoutBtn = document.getElementById('logoutBtn');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(e.target);
            });
        }

        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup(e.target);
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }

        // Upload form
        this.setupUploadForm();

        // Feed filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterPosts(e.target.dataset.filter);
            });
        });
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

    async setupAuthStateListener() {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                this.currentUser = user;
                await this.loadUserProfile();
                this.updateUIForAuthenticatedUser();
            } else {
                this.currentUser = null;
                this.updateUIForUnauthenticatedUser();
            }
        });
    }

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

    updateUIForAuthenticatedUser() {
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const userMenu = document.getElementById('userMenu');
        const profileLink = document.getElementById('profileLink');
        
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (userMenu) userMenu.style.display = 'block';
        if (profileLink) {
            profileLink.style.display = 'block';
            profileLink.href = `/channel/${this.userProfile.username}`;
        }
        
        // Show app content
        const appContent = document.getElementById('appContent');
        if (appContent) appContent.style.display = 'block';
    }

    updateUIForUnauthenticatedUser() {
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const userMenu = document.getElementById('userMenu');
        const profileLink = document.getElementById('profileLink');
        const appContent = document.getElementById('appContent');
        
        if (loginBtn) loginBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (userMenu) userMenu.style.display = 'none';
        if (profileLink) profileLink.style.display = 'none';
        if (appContent) appContent.style.display = 'none';
        
        // Switch to feed if on upload, dashboard, or messages
        if (this.currentTab === 'upload' || this.currentTab === 'dashboard' || this.currentTab === 'messages') {
            this.switchTab('feed');
        }
    }

    switchTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Remove active class from all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab content
        const selectedTab = document.getElementById(`${tabName}Tab`);
        const selectedBtn = document.querySelector(`[data-tab="${tabName}"]`);
        
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }

        this.currentTab = tabName;

        // Load specific content for tabs
        if (tabName === 'dashboard' && this.currentUser) {
            this.loadDashboard();
        }
        if (tabName === 'messages' && this.currentUser) {
            this.loadConversations();
        }
    }

    switchAuthTab(tabName) {
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.auth-form').forEach(form => {
            form.style.display = 'none';
        });

        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}Form`).style.display = 'block';
    }

    async handleLogin(form) {
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;

        try {
            await auth.signInWithEmailAndPassword(email, password);
            document.getElementById('authModal').style.display = 'none';
            form.reset();
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    }

    async handleSignup(form) {
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
            
            document.getElementById('authModal').style.display = 'none';
            form.reset();
        } catch (error) {
            alert('Signup failed: ' + error.message);
        }
    }

    async handleLogout() {
        try {
            await auth.signOut();
        } catch (error) {
            console.error('Logout error:', error);
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

    async handleUpload() {
        if (!this.selectedFile || !this.currentUser) return;

        const caption = document.getElementById('postCaption').value;
        const uploadBtn = document.getElementById('uploadBtn');
        const progressDiv = document.getElementById('uploadProgress');
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.getElementById('progressText');

        uploadBtn.disabled = true;
        progressDiv.style.display = 'block';

        try {
            // Create post document first
            const postRef = db.collection('posts').doc();
            const postData = {
                id: postRef.id,
                authorId: this.currentUser.uid,
                authorName: this.userProfile.displayName,
                authorUsername: this.userProfile.username,
                authorPic: this.userProfile.profilePic,
                caption,
                mediaType: this.selectedFile.type.startsWith('video/') ? 'video' : 'image',
                mediaUrl: '',
                thumbnailUrl: '',
                likes: 0,
                comments: 0,
                views: 0,
                status: 'active',
                createdAt: new Date()
            };

            // Upload file to Storage
            const fileExtension = this.selectedFile.name.split('.').pop();
            const fileName = `${postRef.id}.${fileExtension}`;
            const storageRef = storage.ref(`posts/${postRef.id}/${fileName}`);
            
            const uploadTask = storageRef.put(this.selectedFile);
            
            uploadTask.on('state_changed', 
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    progressFill.style.width = progress + '%';
                    progressText.textContent = Math.round(progress) + '%';
                },
                (error) => {
                    throw error;
                },
                async () => {
                    // Upload completed
                    const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                    postData.mediaUrl = downloadURL;

                    // Generate thumbnail for videos
                    if (postData.mediaType === 'video') {
                        postData.thumbnailUrl = await this.generateVideoThumbnail(this.selectedFile, postRef.id);
                    } else {
                        postData.thumbnailUrl = downloadURL;
                    }

                    // Save post to Firestore
                    await postRef.set(postData);

                    // Reset form
                    this.removeSelectedFile();
                    document.getElementById('postCaption').value = '';
                    progressDiv.style.display = 'none';
                    uploadBtn.disabled = true;

                    // Reload posts
                    this.loadPosts();

                    alert('Post uploaded successfully!');
                }
            );
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed: ' + error.message);
            progressDiv.style.display = 'none';
            uploadBtn.disabled = false;
        }
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
            let query = db.collection('posts')
                .where('status', '==', 'active')
                .orderBy('createdAt', 'desc')
                .limit(this.postsPerPage);

            if (this.lastPost) {
                query = query.startAfter(this.lastPost);
            }

            const snapshot = await query.get();
            
            if (snapshot.empty) {
                if (loadingSpinner) loadingSpinner.style.display = 'none';
                this.isLoading = false;
                return;
            }

            const newPosts = [];
            snapshot.forEach(doc => {
                newPosts.push({ id: doc.id, ...doc.data() });
            });

            this.lastPost = snapshot.docs[snapshot.docs.length - 1];
            this.posts = this.lastPost ? [...this.posts, ...newPosts] : newPosts;
            
            this.renderPosts();
            if (loadingSpinner) loadingSpinner.style.display = 'none';
        } catch (error) {
            console.error('Error loading posts:', error);
            if (loadingSpinner) loadingSpinner.style.display = 'none';
        }
        
        this.isLoading = false;
    }

    renderPosts() {
        const feedPosts = document.getElementById('feedPosts');
        
        if (!this.lastPost) {
            feedPosts.innerHTML = '';
        }

        this.posts.forEach(post => {
            if (!document.getElementById(`post-${post.id}`)) {
                const postElement = this.createPostElement(post);
                feedPosts.appendChild(postElement);
            }
        });
    }

    createPostElement(post) {
        const postDiv = document.createElement('div');
        postDiv.className = 'post-card';
        postDiv.id = `post-${post.id}`;

        const mediaElement = post.mediaType === 'video' 
            ? `<video src="${post.mediaUrl}" poster="${post.thumbnailUrl}" onclick="app.playVideo(this)"></video>`
            : `<img src="${post.mediaUrl}" alt="Post image">`;

        postDiv.innerHTML = `
            <div class="post-media">
                ${mediaElement}
            </div>
            <div class="post-info">
                <div class="post-header">
                    <img src="${post.authorPic || 'https://via.placeholder.com/32x32/6366f1/ffffff?text=?'}" 
                         alt="${post.authorName}" class="post-author-pic">
                    <a href="/channel/${post.authorUsername}" class="post-author">${post.authorName}</a>
                    <span class="post-timestamp">${this.formatTimestamp(post.createdAt)}</span>
                </div>
                <p class="post-caption">${post.caption}</p>
                <div class="post-actions">
                    <div class="post-stats">
                        <span><i class="fas fa-eye"></i> ${post.views}</span>
                        <span><i class="fas fa-heart"></i> ${post.likes}</span>
                        <span><i class="fas fa-comment"></i> ${post.comments}</span>
                    </div>
                    <div class="action-buttons">
                        <button class="btn btn-sm" onclick="app.toggleLike('${post.id}')" id="like-${post.id}">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="btn btn-sm" onclick="app.showComments('${post.id}')">
                            <i class="fas fa-comment"></i>
                        </button>
                        <button class="btn btn-sm" onclick="app.showTipModal('${post.authorId}', '${post.authorName}')">
                            <i class="fas fa-gift"></i>
                        </button>
                        <button class="btn btn-sm" onclick="app.reportPost('${post.id}')">
                            <i class="fas fa-flag"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        return postDiv;
    }

    async toggleLike(postId) {
        if (!this.currentUser) {
            alert('Please login to like posts');
            return;
        }

        const likeRef = db.collection('likes').doc(`${this.currentUser.uid}_${postId}`);
        const likeDoc = await likeRef.get();

        try {
            if (likeDoc.exists) {
                // Unlike
                await likeRef.delete();
                await db.collection('posts').doc(postId).update({
                    likes: firebase.firestore.FieldValue.increment(-1)
                });
                document.getElementById(`like-${postId}`).classList.remove('liked');
            } else {
                // Like
                await likeRef.set({
                    userId: this.currentUser.uid,
                    postId: postId,
                    createdAt: new Date()
                });
                await db.collection('posts').doc(postId).update({
                    likes: firebase.firestore.FieldValue.increment(1)
                });
                document.getElementById(`like-${postId}`).classList.add('liked');
            }

            // Update the post in our local array
            const postIndex = this.posts.findIndex(p => p.id === postId);
            if (postIndex !== -1) {
                this.posts[postIndex].likes += likeDoc.exists ? -1 : 1;
                this.renderPosts();
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    }

    async showComments(postId) {
        if (!this.currentUser) {
            alert('Please login to view comments');
            return;
        }

        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        const commentsModal = document.getElementById('commentsModal');
        const commentsPostInfo = document.getElementById('commentsPostInfo');
        const commentsList = document.getElementById('commentsList');
        const commentsLoading = document.getElementById('commentsLoading');
        const commentUserPic = document.getElementById('commentUserPic');

        // Set post info
        commentsPostInfo.innerHTML = `
            <p><strong>${post.authorName}</strong> • ${this.formatTimestamp(post.createdAt)}</p>
            <p>${post.caption}</p>
        `;

        // Set user profile pic for comment form
        commentUserPic.src = this.userProfile.profilePic || 'https://via.placeholder.com/32x32/6366f1/ffffff?text=?';

        // Show modal
        commentsModal.style.display = 'block';
        commentsLoading.style.display = 'block';
        commentsList.innerHTML = '';

        // Load comments
        await this.loadComments(postId);

        // Setup comment form
        this.setupCommentForm(postId);
    }

    async loadComments(postId) {
        try {
            const commentsRef = db.collection('comments')
                .where('postId', '==', postId)
                .orderBy('createdAt', 'desc');
            
            const snapshot = await commentsRef.get();
            const comments = [];

            snapshot.forEach(doc => {
                comments.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            this.renderComments(comments);
        } catch (error) {
            console.error('Error loading comments:', error);
            this.renderComments([]);
        }
    }

    renderComments(comments) {
        const commentsList = document.getElementById('commentsList');
        const commentsLoading = document.getElementById('commentsLoading');

        commentsLoading.style.display = 'none';

        if (comments.length === 0) {
            commentsList.innerHTML = `
                <div class="no-comments">
                    <i class="fas fa-comment-slash"></i>
                    <p>No comments yet. Be the first to comment!</p>
                </div>
            `;
            return;
        }

        commentsList.innerHTML = comments.map(comment => `
            <div class="comment-item" id="comment-${comment.id}">
                <img src="${comment.authorPic || 'https://via.placeholder.com/32x32/6366f1/ffffff?text=?'}" 
                     alt="${comment.authorName}" class="comment-user-pic">
                <div class="comment-content">
                    <div class="comment-header">
                        <a href="/channel/${comment.authorUsername}" class="comment-author">${comment.authorName}</a>
                        <span class="comment-timestamp">${this.formatTimestamp(comment.createdAt)}</span>
                    </div>
                    <p class="comment-text">${comment.text}</p>
                    <div class="comment-actions">
                        ${comment.authorId === this.currentUser?.uid ? 
                            `<button class="comment-action" onclick="app.deleteComment('${comment.id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>` : ''
                        }
                    </div>
                </div>
            </div>
        `).join('');
    }

    setupCommentForm(postId) {
        const commentForm = document.getElementById('commentForm');
        const commentText = document.getElementById('commentText');
        const commentSubmitBtn = document.getElementById('commentSubmitBtn');

        // Reset form
        commentForm.reset();
        commentSubmitBtn.disabled = true;

        // Handle text input
        commentText.addEventListener('input', () => {
            commentSubmitBtn.disabled = !commentText.value.trim();
        });

        // Handle form submission
        commentForm.onsubmit = async (e) => {
            e.preventDefault();
            await this.postComment(postId);
        };
    }

    async postComment(postId) {
        const commentText = document.getElementById('commentText');
        const commentSubmitBtn = document.getElementById('commentSubmitBtn');
        const text = commentText.value.trim();

        if (!text) return;

        try {
            commentSubmitBtn.disabled = true;
            commentSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';

            const commentData = {
                postId: postId,
                authorId: this.currentUser.uid,
                authorName: this.userProfile.displayName,
                authorUsername: this.userProfile.username,
                authorPic: this.userProfile.profilePic,
                text: text,
                createdAt: new Date()
            };

            await db.collection('comments').add(commentData);

            // Update post comment count
            await db.collection('posts').doc(postId).update({
                comments: firebase.firestore.FieldValue.increment(1)
            });

            // Update local post data
            const postIndex = this.posts.findIndex(p => p.id === postId);
            if (postIndex !== -1) {
                this.posts[postIndex].comments += 1;
                this.renderPosts();
            }

            // Reload comments
            await this.loadComments(postId);

            // Reset form
            commentText.value = '';
            commentSubmitBtn.disabled = true;
            commentSubmitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Post Comment';

        } catch (error) {
            console.error('Error posting comment:', error);
            alert('Failed to post comment. Please try again.');
            commentSubmitBtn.disabled = false;
            commentSubmitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Post Comment';
        }
    }

    async deleteComment(commentId) {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        try {
            const commentRef = db.collection('comments').doc(commentId);
            const commentDoc = await commentRef.get();

            if (!commentDoc.exists) return;

            const commentData = commentDoc.data();

            // Delete comment
            await commentRef.delete();

            // Update post comment count
            await db.collection('posts').doc(commentData.postId).update({
                comments: firebase.firestore.FieldValue.increment(-1)
            });

            // Update local post data
            const postIndex = this.posts.findIndex(p => p.id === commentData.postId);
            if (postIndex !== -1) {
                this.posts[postIndex].comments -= 1;
                this.renderPosts();
            }

            // Remove comment from UI
            const commentElement = document.getElementById(`comment-${commentId}`);
            if (commentElement) {
                commentElement.remove();
            }

        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('Failed to delete comment. Please try again.');
        }
    }

    // Messaging System
    async loadConversations() {
        if (!this.currentUser) return;

        try {
            const conversationsRef = db.collection('conversations')
                .where('participants', 'array-contains', this.currentUser.uid)
                .orderBy('lastMessageAt', 'desc');
            
            const snapshot = await conversationsRef.get();
            const conversations = [];

            for (const doc of snapshot.docs) {
                const conversation = doc.data();
                const otherUserId = conversation.participants.find(id => id !== this.currentUser.uid);
                
                // Get other user's profile
                const userDoc = await db.collection('users').doc(otherUserId).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    conversations.push({
                        id: doc.id,
                        ...conversation,
                        otherUser: {
                            id: otherUserId,
                            ...userData
                        }
                    });
                }
            }

            this.renderConversations(conversations);
        } catch (error) {
            console.error('Error loading conversations:', error);
        }
    }

    renderConversations(conversations) {
        const conversationsList = document.getElementById('conversationsList');

        if (conversations.length === 0) {
            conversationsList.innerHTML = `
                <div class="no-conversations">
                    <i class="fas fa-comments"></i>
                    <p>No conversations yet</p>
                    <p>Start a new conversation to begin messaging!</p>
                </div>
            `;
            return;
        }

        conversationsList.innerHTML = conversations.map(conversation => `
            <div class="conversation-item" onclick="app.selectConversation('${conversation.id}', '${conversation.otherUser.id}')">
                <img src="${conversation.otherUser.profilePic || 'https://via.placeholder.com/48x48/6366f1/ffffff?text=?'}" 
                     alt="${conversation.otherUser.displayName}">
                <div class="conversation-info">
                    <div class="conversation-name">${conversation.otherUser.displayName}</div>
                    <div class="conversation-preview">${conversation.lastMessage || 'No messages yet'}</div>
                    <div class="conversation-time">${conversation.lastMessageAt ? this.formatTimestamp(conversation.lastMessageAt) : ''}</div>
                </div>
            </div>
        `).join('');
    }

    async selectConversation(conversationId, otherUserId) {
        this.currentConversationId = conversationId;
        this.currentOtherUserId = otherUserId;

        // Update UI
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        event.target.closest('.conversation-item').classList.add('active');

        // Show chat area
        document.getElementById('chatHeader').style.display = 'block';
        document.getElementById('messageForm').style.display = 'block';

        // Load user info
        const userDoc = await db.collection('users').doc(otherUserId).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            document.getElementById('chatUserPic').src = userData.profilePic || 'https://via.placeholder.com/40x40/6366f1/ffffff?text=?';
            document.getElementById('chatUserName').textContent = userData.displayName;
        }

        // Load messages
        await this.loadMessages(conversationId);

        // Setup message form
        this.setupMessageForm(conversationId);
    }

    async loadMessages(conversationId) {
        try {
            const messagesRef = db.collection('messages')
                .where('conversationId', '==', conversationId)
                .orderBy('createdAt', 'asc');
            
            const snapshot = await messagesRef.get();
            const messages = [];

            snapshot.forEach(doc => {
                messages.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            this.renderMessages(messages);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    renderMessages(messages) {
        const chatMessages = document.getElementById('chatMessages');

        if (messages.length === 0) {
            chatMessages.innerHTML = `
                <div class="no-messages">
                    <i class="fas fa-comment-slash"></i>
                    <p>No messages yet. Start the conversation!</p>
                </div>
            `;
            return;
        }

        chatMessages.innerHTML = messages.map(message => `
            <div class="message-item ${message.senderId === this.currentUser.uid ? 'sent' : 'received'}">
                <div class="message-bubble">
                    ${message.text}
                    <div class="message-time">${this.formatTimestamp(message.createdAt)}</div>
                </div>
            </div>
        `).join('');

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    setupMessageForm(conversationId) {
        const messageForm = document.getElementById('messageForm');
        const messageText = document.getElementById('messageText');
        const sendMessageBtn = document.getElementById('sendMessageBtn');

        // Reset form
        messageForm.reset();
        sendMessageBtn.disabled = true;

        // Handle text input
        messageText.addEventListener('input', () => {
            sendMessageBtn.disabled = !messageText.value.trim();
        });

        // Handle form submission
        messageForm.onsubmit = async (e) => {
            e.preventDefault();
            await this.sendMessage(conversationId);
        };
    }

    async sendMessage(conversationId) {
        const messageText = document.getElementById('messageText');
        const sendMessageBtn = document.getElementById('sendMessageBtn');
        const text = messageText.value.trim();

        if (!text) return;

        try {
            sendMessageBtn.disabled = true;
            sendMessageBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

            const messageData = {
                conversationId: conversationId,
                senderId: this.currentUser.uid,
                senderName: this.userProfile.displayName,
                text: text,
                createdAt: new Date()
            };

            await db.collection('messages').add(messageData);

            // Update conversation
            await db.collection('conversations').doc(conversationId).update({
                lastMessage: text,
                lastMessageAt: new Date()
            });

            // Reload messages
            await this.loadMessages(conversationId);

            // Reset form
            messageText.value = '';
            sendMessageBtn.disabled = true;
            sendMessageBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';

        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
            sendMessageBtn.disabled = false;
            sendMessageBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
        }
    }

    async startNewConversation() {
        if (!this.currentUser) {
            alert('Please login to start a conversation');
            return;
        }

        const newConversationModal = document.getElementById('newConversationModal');
        const usersList = document.getElementById('usersList');
        const usersLoading = document.getElementById('usersLoading');

        newConversationModal.style.display = 'block';
        usersLoading.style.display = 'block';
        usersList.innerHTML = '';

        // Load users
        await this.loadUsers();

        // Setup user selection
        this.setupUserSelection();
    }

    async loadUsers() {
        try {
            const usersRef = db.collection('users')
                .where('uid', '!=', this.currentUser.uid);
            
            const snapshot = await usersRef.get();
            const users = [];

            snapshot.forEach(doc => {
                users.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            this.renderUsers(users);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    renderUsers(users) {
        const usersList = document.getElementById('usersList');
        const usersLoading = document.getElementById('usersLoading');

        usersLoading.style.display = 'none';

        if (users.length === 0) {
            usersList.innerHTML = `
                <div class="no-users">
                    <i class="fas fa-users"></i>
                    <p>No users found</p>
                </div>
            `;
            return;
        }

        usersList.innerHTML = users.map(user => `
            <div class="user-item" data-user-id="${user.id}">
                <img src="${user.profilePic || 'https://via.placeholder.com/40x40/6366f1/ffffff?text=?'}" 
                     alt="${user.displayName}">
                <div class="user-item-info">
                    <h4>${user.displayName}</h4>
                    <p>@${user.username}</p>
                </div>
            </div>
        `).join('');
    }

    setupUserSelection() {
        const userItems = document.querySelectorAll('.user-item');
        
        userItems.forEach(item => {
            item.addEventListener('click', async () => {
                const userId = item.dataset.userId;
                await this.createConversation(userId);
            });
        });
    }

    async createConversation(otherUserId) {
        try {
            // Check if conversation already exists
            const existingConversation = await db.collection('conversations')
                .where('participants', 'array-contains', this.currentUser.uid)
                .get();

            let conversationId = null;
            
            for (const doc of existingConversation.docs) {
                const conversation = doc.data();
                if (conversation.participants.includes(otherUserId)) {
                    conversationId = doc.id;
                    break;
                }
            }

            if (!conversationId) {
                // Create new conversation
                const conversationData = {
                    participants: [this.currentUser.uid, otherUserId],
                    createdAt: new Date(),
                    lastMessageAt: new Date()
                };

                const conversationRef = await db.collection('conversations').add(conversationData);
                conversationId = conversationRef.id;
            }

            // Close modal and switch to messages tab
            document.getElementById('newConversationModal').style.display = 'none';
            this.switchTab('messages');

            // Select the conversation
            await this.selectConversation(conversationId, otherUserId);

        } catch (error) {
            console.error('Error creating conversation:', error);
            alert('Failed to create conversation. Please try again.');
        }
    }

    // Live Streaming System
    async startLiveStream() {
        if (!this.currentUser) {
            alert('Please login to start a live stream');
            return;
        }

        // Show setup form
        document.getElementById('liveSetup').style.display = 'block';
        document.getElementById('livePlayer').style.display = 'none';
        document.getElementById('liveStreamsList').style.display = 'none';

        // Setup form submission
        this.setupLiveStreamForm();
    }

    setupLiveStreamForm() {
        const liveStreamForm = document.getElementById('liveStreamForm');
        
        liveStreamForm.onsubmit = async (e) => {
            e.preventDefault();
            await this.createLiveStream();
        };
    }

    async createLiveStream() {
        const title = document.getElementById('streamTitle').value;
        const description = document.getElementById('streamDescription').value;
        const category = document.getElementById('streamCategory').value;
        const privacy = document.getElementById('streamPrivacy').value;

        if (!title || !category || !privacy) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            // Request camera and microphone permissions
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            // Create live stream document
            const streamData = {
                title: title,
                description: description,
                category: category,
                privacy: privacy,
                streamerId: this.currentUser.uid,
                streamerName: this.userProfile.displayName,
                streamerUsername: this.userProfile.username,
                streamerPic: this.userProfile.profilePic,
                status: 'live',
                viewers: 0,
                startedAt: new Date(),
                thumbnailUrl: ''
            };

            const streamRef = await db.collection('liveStreams').add(streamData);
            this.currentStreamId = streamRef.id;

            // Start the stream
            await this.startStreaming(stream, streamRef.id);

        } catch (error) {
            console.error('Error starting live stream:', error);
            if (error.name === 'NotAllowedError') {
                alert('Camera and microphone access is required to start a live stream');
            } else {
                alert('Failed to start live stream. Please try again.');
            }
        }
    }

    async startStreaming(mediaStream, streamId) {
        // Hide setup, show player
        document.getElementById('liveSetup').style.display = 'none';
        document.getElementById('livePlayer').style.display = 'block';

        // Set video source
        const videoElement = document.getElementById('liveVideo');
        videoElement.srcObject = mediaStream;

        // Update stream title
        document.getElementById('currentStreamTitle').textContent = 
            document.getElementById('streamTitle').value;

        // Start stream timer
        this.startStreamTimer();

        // Setup live chat
        this.setupLiveChat(streamId);

        // Listen for viewers
        this.listenForViewers(streamId);

        // Store media stream for cleanup
        this.currentMediaStream = mediaStream;
    }

    startStreamTimer() {
        this.streamStartTime = Date.now();
        this.streamTimer = setInterval(() => {
            const duration = Date.now() - this.streamStartTime;
            const minutes = Math.floor(duration / 60000);
            const seconds = Math.floor((duration % 60000) / 1000);
            document.getElementById('streamDuration').innerHTML = 
                `<i class="fas fa-clock"></i> ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    setupLiveChat(streamId) {
        const liveChatForm = document.getElementById('liveChatForm');
        const liveChatInput = document.getElementById('liveChatInput');

        liveChatForm.onsubmit = async (e) => {
            e.preventDefault();
            const message = liveChatInput.value.trim();
            if (!message) return;

            await this.sendLiveChatMessage(streamId, message);
            liveChatInput.value = '';
        };

        // Listen for live chat messages
        this.listenForLiveChat(streamId);
    }

    async sendLiveChatMessage(streamId, message) {
        try {
            const chatData = {
                streamId: streamId,
                authorId: this.currentUser.uid,
                authorName: this.userProfile.displayName,
                message: message,
                createdAt: new Date()
            };

            await db.collection('liveChat').add(chatData);
        } catch (error) {
            console.error('Error sending live chat message:', error);
        }
    }

    listenForLiveChat(streamId) {
        const chatRef = db.collection('liveChat')
            .where('streamId', '==', streamId)
            .orderBy('createdAt', 'desc')
            .limit(50);

        chatRef.onSnapshot((snapshot) => {
            const messages = [];
            snapshot.forEach(doc => {
                messages.unshift({
                    id: doc.id,
                    ...doc.data()
                });
            });

            this.renderLiveChat(messages);
        });
    }

    renderLiveChat(messages) {
        const chatMessages = document.getElementById('liveChatMessages');
        
        chatMessages.innerHTML = messages.map(msg => `
            <div class="chat-message">
                <span class="author">${msg.authorName}:</span>
                <span class="text">${msg.message}</span>
            </div>
        `).join('');

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    listenForViewers(streamId) {
        const streamRef = db.collection('liveStreams').doc(streamId);
        
        streamRef.onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                document.getElementById('viewerCount').innerHTML = 
                    `<i class="fas fa-eye"></i> ${data.viewers} viewers`;
            }
        });
    }

    async endLiveStream() {
        if (!this.currentStreamId) return;

        try {
            // Stop media stream
            if (this.currentMediaStream) {
                this.currentMediaStream.getTracks().forEach(track => track.stop());
            }

            // Clear timer
            if (this.streamTimer) {
                clearInterval(this.streamTimer);
            }

            // Update stream status
            await db.collection('liveStreams').doc(this.currentStreamId).update({
                status: 'ended',
                endedAt: new Date()
            });

            // Reset UI
            document.getElementById('livePlayer').style.display = 'none';
            document.getElementById('liveSetup').style.display = 'none';
            document.getElementById('liveStreamsList').style.display = 'none';

            // Clear current stream
            this.currentStreamId = null;
            this.currentMediaStream = null;

            alert('Live stream ended successfully');

        } catch (error) {
            console.error('Error ending live stream:', error);
            alert('Failed to end live stream. Please try again.');
        }
    }

    async showLiveStreams() {
        // Hide other sections
        document.getElementById('liveSetup').style.display = 'none';
        document.getElementById('livePlayer').style.display = 'none';
        document.getElementById('liveStreamsList').style.display = 'block';

        // Load active streams
        await this.loadActiveStreams();
    }

    async loadActiveStreams() {
        try {
            const streamsRef = db.collection('liveStreams')
                .where('status', '==', 'live')
                .where('privacy', '==', 'public')
                .orderBy('startedAt', 'desc');

            const snapshot = await streamsRef.get();
            const streams = [];

            snapshot.forEach(doc => {
                streams.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            this.renderActiveStreams(streams);
        } catch (error) {
            console.error('Error loading active streams:', error);
        }
    }

    renderActiveStreams(streams) {
        const activeStreams = document.getElementById('activeStreams');

        if (activeStreams) {
            if (streams.length === 0) {
                activeStreams.innerHTML = `
                    <div class="no-streams">
                        <i class="fas fa-broadcast-tower"></i>
                        <p>No live streams at the moment</p>
                        <p>Be the first to go live!</p>
                    </div>
                `;
                return;
            }

            activeStreams.innerHTML = streams.map(stream => `
                <div class="stream-card" onclick="app.joinLiveStream('${stream.id}')">
                    <div class="stream-thumbnail">
                        <img src="${stream.thumbnailUrl || 'https://via.placeholder.com/300x169/6366f1/ffffff?text=Live'}" 
                             alt="${stream.title}">
                        <div class="live-badge">LIVE</div>
                    </div>
                    <div class="stream-info">
                        <div class="stream-title">${stream.title}</div>
                        <div class="stream-meta">
                            <div class="stream-author">
                                <img src="${stream.streamerPic || 'https://via.placeholder.com/24x24/6366f1/ffffff?text=?'}" 
                                     alt="${stream.streamerName}">
                                <span>${stream.streamerName}</span>
                            </div>
                            <span>${stream.viewers} viewers</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    async joinLiveStream(streamId) {
        try {
            // Get stream data
            const streamDoc = await db.collection('liveStreams').doc(streamId).get();
            if (!streamDoc.exists) {
                alert('Stream not found');
                return;
            }

            const streamData = streamDoc.data();

            // Increment viewer count
            await db.collection('liveStreams').doc(streamId).update({
                viewers: firebase.firestore.FieldValue.increment(1)
            });

            // Show stream player
            document.getElementById('livePlayer').style.display = 'block';
            document.getElementById('liveStreamsList').style.display = 'none';

            // Update stream title
            document.getElementById('currentStreamTitle').textContent = streamData.title;

            // Setup live chat for viewing
            this.setupLiveChat(streamId);

            // Store current stream ID
            this.currentStreamId = streamId;

            // Show join message
            alert(`Joined ${streamData.streamerName}'s live stream!`);

        } catch (error) {
            console.error('Error joining live stream:', error);
            alert('Failed to join live stream. Please try again.');
        }
    }

    toggleChat() {
        const liveChat = document.getElementById('liveChat');
        if (liveChat) {
            if (liveChat.style.display === 'none') {
                liveChat.style.display = 'flex';
            } else {
                liveChat.style.display = 'none';
            }
        }
    }

    cancelLiveSetup() {
        document.getElementById('liveSetup').style.display = 'none';
        document.getElementById('liveStreamForm').reset();
    }

    async showTipModal(creatorId, creatorName) {
        if (!this.currentUser) {
            alert('Please login to tip creators');
            return;
        }

        if (this.currentUser.uid === creatorId) {
            alert('You cannot tip yourself');
            return;
        }

        const tipModal = document.getElementById('tipModal');
        const creatorInfo = document.getElementById('tipCreatorInfo');
        
        creatorInfo.innerHTML = `
            <p>Tip <strong>${creatorName}</strong></p>
            <p>Show your appreciation for their content!</p>
        `;

        tipModal.style.display = 'block';

        // Setup tip form
        this.setupTipForm(creatorId);
    }

    setupTipForm(creatorId) {
        const tipForm = document.getElementById('tipForm');
        const tipAmounts = document.querySelectorAll('.tip-amount');
        const customAmount = document.getElementById('customTipAmount');

        // Reset form
        tipForm.reset();
        tipAmounts.forEach(btn => btn.classList.remove('selected'));

        // Handle preset amounts
        tipAmounts.forEach(btn => {
            btn.addEventListener('click', () => {
                tipAmounts.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                customAmount.value = btn.dataset.amount;
            });
        });

        // Handle form submission
        tipForm.onsubmit = async (e) => {
            e.preventDefault();
            await this.processTip(creatorId);
        };
    }

    async processTip(creatorId) {
        const amount = parseFloat(document.getElementById('customTipAmount').value);
        
        if (!amount || amount < 0.50) {
            alert('Minimum tip amount is $0.50');
            return;
        }

        try {
            // Create tip record
            const tipData = {
                senderId: this.currentUser.uid,
                senderName: this.userProfile.displayName,
                recipientId: creatorId,
                amount: amount,
                createdAt: new Date()
            };

            await db.collection('tips').add(tipData);

            // Update creator's earnings
            const earningsRef = db.collection('earnings').doc(creatorId);
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

    async reportPost(postId) {
        if (!this.currentUser) {
            alert('Please login to report posts');
            return;
        }

        const reason = prompt('Please provide a reason for reporting this post:');
        if (!reason) return;

        try {
            await db.collection('reports').add({
                postId: postId,
                reporterId: this.currentUser.uid,
                reporterName: this.userProfile.displayName,
                reason: reason,
                createdAt: new Date(),
                status: 'pending'
            });

            alert('Post reported successfully. Thank you for helping keep our community safe.');
        } catch (error) {
            console.error('Error reporting post:', error);
            alert('Failed to report post. Please try again.');
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
        const now = new Date();
        // Handle both Firestore timestamps and regular Date objects
        const postDate = timestamp && typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date(timestamp);
        const diffInSeconds = Math.floor((now - postDate) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            return `${Math.floor(diffInSeconds / 60)}m ago`;
        } else if (diffInSeconds < 86400) {
            return `${Math.floor(diffInSeconds / 3600)}h ago`;
        } else if (diffInSeconds < 2592000) {
            return `${Math.floor(diffInSeconds / 86400)}d ago`;
        } else {
            return postDate.toLocaleDateString();
        }
    }
}

// Add update banner logic outside the class so it's available globally
function showUpdateBanner() {
    if (document.getElementById('updateBanner')) return; // Prevent duplicates
    const banner = document.createElement('div');
    banner.id = 'updateBanner';
    banner.textContent = 'A new version is available. Click to refresh.';
    banner.style = 'position:fixed;bottom:0;left:0;right:0;background:#1976d2;color:#fff;padding:1em 2em;text-align:center;z-index:9999;cursor:pointer;font-size:1.1em;box-shadow:0 -2px 8px rgba(0,0,0,0.08);border-radius:8px 8px 0 0;transition:bottom 0.3s;';
    banner.onclick = () => window.location.reload(true);
    document.body.appendChild(banner);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AmplifiApp();
});

// Infinite scroll
window.addEventListener('scroll', () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
        if (window.app && window.app.currentTab === 'feed') {
            window.app.loadPosts();
        }
    }
}); 