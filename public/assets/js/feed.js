/* global db, auth, firebase, storage */
// Feed Page JavaScript
class FeedPage {
    constructor() {
        console.log('🎯 FeedPage constructor called');
        this.currentUser = null;
        this.userProfile = null;
        this.posts = [];
        this.lastPost = null;
        this.isLoading = false;
        this.noMorePosts = false;
        this.currentFilter = 'all';
        this.bookmarkedPosts = new Set();
        this.currentCommentPostId = null;
        
        console.log('🎯 FeedPage constructor completed, calling init');
        this.init();
    }

    async init() {
        console.log('🎯 FeedPage init started');
        
        // Setup global error handling
        if (window.ErrorUtils) {
            window.ErrorUtils.setupGlobalErrorHandler();
        }
        
        // Initialize payment processor
        this.initializePaymentProcessor();
        
        await this.setupAuthStateListener();
        this.setupEventListeners();
        this.initializeAdMob();
        
        // Initialize PWA features
        this.initializePWAFeatures();
        
        // Always show sample posts for now to ensure images are visible
        console.log('🎯 Showing sample posts by default');
        this.showSamplePosts();
        
        // Try to load real posts in the background
        try {
            await this.loadPosts();
        } catch (error) {
            console.error('❌ Failed to load posts from Firestore:', error);
            // Sample posts are already shown, so we don't need to show them again
        }
        
        this.loadBookmarks();
        this.initializeNotifications();
        this.startNewPostsBannerSimulation(); // Start banner simulation
        
        console.log('✅ FeedPage init completed');
    }

    initializePaymentProcessor() {
        try {
            // Initialize Stripe payment processor
            if (typeof StripeVercelBackend !== 'undefined') {
                window.paymentProcessor = new StripeVercelBackend();
                console.log('✅ Payment processor initialized successfully');
            } else {
                console.warn('⚠️ StripeVercelBackend not available');
            }
        } catch (error) {
            console.error('❌ Error initializing payment processor:', error);
        }
    }

    async setupAuthStateListener() {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                this.currentUser = user;
                await this.loadUserProfile();
                this.updateUIForAuthenticatedUser();
                this.loadBookmarks();
                this.requestNotificationPermission();
            } else {
                this.currentUser = null;
                this.updateUIForUnauthenticatedUser();
            }
        });
        
        // Fallback timeout: if auth state doesn't change within 3 seconds, show buttons for non-authenticated users
        setTimeout(() => {
            if (!this.currentUser) {
                console.log('🕐 Auth state timeout - showing buttons for non-authenticated users');
                this.updateUIForUnauthenticatedUser();
            }
        }, 3000);
    }

    async loadUserProfile() {
        try {
            const userDoc = await db.collection('users').doc(this.currentUser.uid).get();
            if (userDoc.exists) {
                this.userProfile = userDoc.data();
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    async loadBookmarks() {
        if (!this.currentUser) return;
        
        try {
            const bookmarksDoc = await db.collection('users').doc(this.currentUser.uid)
                .collection('bookmarks').get();
            
            this.bookmarkedPosts.clear();
            bookmarksDoc.forEach(doc => {
                this.bookmarkedPosts.add(doc.id);
            });
        } catch (error) {
            console.error('Error loading bookmarks:', error);
        }
    }

    updateUIForAuthenticatedUser() {
        const userMenu = document.getElementById('userMenu');
        const notificationBtn = document.getElementById('notificationBtn');
        
        if (userMenu) userMenu.style.display = 'block';
        if (notificationBtn) {
            notificationBtn.style.display = 'block';
        }
        
        if (this.userProfile) {
            const userAvatar = document.getElementById('userAvatar');
            if (userAvatar && this.userProfile.profilePic) {
                userAvatar.src = this.userProfile.profilePic;
            }
        }

        // Initialize notification badge
        this.updateNotificationBadge();
    }

    updateUIForUnauthenticatedUser() {
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const userMenu = document.querySelector('.user-menu');
        
        // Show auth buttons for non-authenticated users
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (signupBtn) signupBtn.style.display = 'inline-block';
        if (userMenu) userMenu.style.display = 'none';
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.performSearch();
            });
        }

        // Auth buttons
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showLoginModal('login'));
        }
        if (signupBtn) {
            signupBtn.addEventListener('click', () => this.showLoginModal('signup'));
        }

        // Modal close buttons
        const closeBtns = document.querySelectorAll('.close');
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        // Modal background clicks
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterPosts(e.target.dataset.filter);
            });
        });

        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadPosts();
            });
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Logout button clicked!');
                console.log('Logout event target:', e.target);
                this.handleLogout();
            });
        }

        // Mobile tab navigation
        this.setupMobileTabNavigation();

        // Pull to refresh functionality
        this.setupPullToRefresh();

        // Infinite scroll
        window.addEventListener('scroll', () => {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
                if (!this.isLoading && !this.noMorePosts) {
                    this.loadPosts();
                }
            }
        });

        // Notification system
        this.setupNotificationSystem();
    }

    setupMobileTabNavigation() {
        // Set active tab based on current page
        const currentPage = window.location.pathname.split('/').pop() || 'feed.html';
        const tabItems = document.querySelectorAll('.mobile-tab-nav .tab-item');
        
        tabItems.forEach(tab => {
            const href = tab.getAttribute('href');
            if (href === currentPage) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Add smooth transitions for tab clicks
        tabItems.forEach(tab => {
            tab.addEventListener('click', (e) => {
                // Add loading state
                tab.style.opacity = '0.7';
                tab.style.transform = 'scale(0.95)';
                
                // Reset after transition
                setTimeout(() => {
                    tab.style.opacity = '';
                    tab.style.transform = '';
                }, 150);
            });
        });
    }

    setupPullToRefresh() {
        let startY = 0;
        let currentY = 0;
        let pullDistance = 0;
        let isPulling = false;
        let isRefreshing = false;
        const threshold = 80; // Distance needed to trigger refresh
        const maxPull = 120; // Maximum pull distance

        // Create pull-to-refresh indicator
        const pullIndicator = document.createElement('div');
        pullIndicator.className = 'pull-to-refresh-indicator';
        pullIndicator.innerHTML = `
            <div class="pull-indicator-content">
                <div class="pull-icon">⬇️</div>
                <div class="pull-text">Pull to refresh</div>
            </div>
        `;
        document.body.appendChild(pullIndicator);

        // Touch events for mobile
        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0 && !isRefreshing) {
                startY = e.touches[0].clientY;
                isPulling = true;
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (isPulling && !isRefreshing) {
                currentY = e.touches[0].clientY;
                pullDistance = Math.max(0, currentY - startY);
                
                if (pullDistance > 0) {
                    e.preventDefault();
                    
                    // Limit pull distance
                    pullDistance = Math.min(pullDistance, maxPull);
                    
                    // Update indicator
                    this.updatePullIndicator(pullDistance, threshold);
                }
            }
        }, { passive: false });

        document.addEventListener('touchend', () => {
            if (isPulling && !isRefreshing) {
                if (pullDistance >= threshold) {
                    this.triggerRefresh();
                } else {
                    this.resetPullIndicator();
                }
                
                isPulling = false;
                pullDistance = 0;
            }
        });

        // Mouse events for desktop (for testing)
        document.addEventListener('mousedown', (e) => {
            if (window.scrollY === 0 && !isRefreshing && e.button === 0) {
                startY = e.clientY;
                isPulling = true;
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isPulling && !isRefreshing) {
                currentY = e.clientY;
                pullDistance = Math.max(0, currentY - startY);
                
                if (pullDistance > 0) {
                    // Limit pull distance
                    pullDistance = Math.min(pullDistance, maxPull);
                    
                    // Update indicator
                    this.updatePullIndicator(pullDistance, threshold);
                }
            }
        });

        document.addEventListener('mouseup', () => {
            if (isPulling && !isRefreshing) {
                if (pullDistance >= threshold) {
                    this.triggerRefresh();
                } else {
                    this.resetPullIndicator();
                }
                
                isPulling = false;
                pullDistance = 0;
            }
        });
    }

    updatePullIndicator(pullDistance, threshold) {
        const indicator = document.querySelector('.pull-to-refresh-indicator');
        if (!indicator) return;

        const progress = Math.min(pullDistance / threshold, 1);
        const icon = indicator.querySelector('.pull-icon');
        const text = indicator.querySelector('.pull-text');
        const feedContainer = document.querySelector('.feed-container');

        // Update position and opacity
        indicator.style.transform = `translateY(${pullDistance * 0.5}px)`;
        indicator.style.opacity = Math.min(pullDistance / 50, 1);

        // Add subtle visual feedback to feed container
        if (feedContainer) {
            feedContainer.style.transform = `translateY(${pullDistance * 0.3}px)`;
            feedContainer.style.transition = 'transform 0.1s ease';
        }

        // Update icon rotation
        if (icon) {
            icon.style.transform = `rotate(${progress * 180}deg)`;
        }

        // Update text
        if (text) {
            if (pullDistance >= threshold) {
                text.textContent = 'Release to refresh';
                icon.textContent = '⬆️';
            } else {
                text.textContent = 'Pull to refresh';
                icon.textContent = '⬇️';
            }
        }
    }

    resetPullIndicator() {
        const indicator = document.querySelector('.pull-to-refresh-indicator');
        const feedContainer = document.querySelector('.feed-container');
        
        if (!indicator) return;

        indicator.style.transform = 'translateY(-100%)';
        indicator.style.opacity = '0';
        
        // Reset feed container position
        if (feedContainer) {
            feedContainer.style.transform = 'translateY(0)';
            feedContainer.style.transition = 'transform 0.3s ease';
        }
        
        const icon = indicator.querySelector('.pull-icon');
        if (icon) {
            icon.style.transform = 'rotate(0deg)';
            icon.textContent = '⬇️';
        }
        
        const text = indicator.querySelector('.pull-text');
        if (text) {
            text.textContent = 'Pull to refresh';
        }
    }

    async triggerRefresh() {
        const indicator = document.querySelector('.pull-to-refresh-indicator');
        if (!indicator) return;

        // Show refreshing state
        const icon = indicator.querySelector('.pull-icon');
        const text = indicator.querySelector('.pull-text');
        
        if (icon) icon.textContent = '🔄';
        if (text) text.textContent = 'Refreshing...';
        
        indicator.style.transform = 'translateY(0)';
        indicator.style.opacity = '1';

        try {
            // Reset feed state
            this.posts = [];
            this.lastPost = null;
            this.noMorePosts = false;
            
            // Reload posts
            await this.loadPosts();
            
            // Show success message
            if (text) text.textContent = 'Updated!';
            if (icon) icon.textContent = '✅';
            
            // Hide indicator after delay
            setTimeout(() => {
                this.resetPullIndicator();
            }, 1000);
            
        } catch (error) {
            console.error('Error refreshing feed:', error);
            
            // Show error message
            if (text) text.textContent = 'Refresh failed';
            if (icon) icon.textContent = '❌';
            
            // Hide indicator after delay
            setTimeout(() => {
                this.resetPullIndicator();
            }, 2000);
        }
    }

    async loadPosts() {
        if (this.isLoading || this.noMorePosts) return;
        
        this.isLoading = true;
        console.log('loadPosts called');

        try {
        console.log('Starting to load posts from Firestore...');

            let query = db.collection('posts')
                .orderBy('createdAt', 'desc')
                .limit(10);
            
            if (this.lastPost) {
                query = query.startAfter(this.lastPost);
            }

            console.log('Executing Firestore query...');
            const snapshot = await query.get();
            console.log('Query completed, snapshot empty:', snapshot.empty);

            if (snapshot.empty) {
                console.log('No more posts to load');
                this.noMorePosts = true;
                
                // If this is the first load and no posts exist, show sample posts
                if (this.posts.length === 0) {
                    console.log('No posts found, showing sample posts');
                    this.showSamplePosts();
                }
                return;
            }

            const newPosts = [];
            snapshot.forEach(doc => {
                const postData = doc.data();
                // Replace Unsplash URLs with Pexels URLs
                const processedPost = this.replaceUnsplashWithPexels({
                    id: doc.id,
                    ...postData,
                    createdAt: postData.createdAt?.toDate() || new Date()
                });
                newPosts.push(processedPost);
            });
            
            console.log(`Loaded ${newPosts.length} new posts`);
            
            // Update last post for pagination
            this.lastPost = snapshot.docs[snapshot.docs.length - 1];
            
            // Add new posts to existing posts
            this.posts = [...this.posts, ...newPosts];
            
            // Render all posts
            this.renderPosts(this.posts);
            
            // Hide loading state
            const loadingElement = document.getElementById('feedLoading');
            const emptyStateElement = document.getElementById('feedEmptyState');
            
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            
            if (emptyStateElement && this.posts.length > 0) {
                emptyStateElement.style.display = 'none';
            }
            
        } catch (error) {
            console.error('Error loading posts:', error);
            
            // Show sample posts on error
            if (this.posts.length === 0) {
                console.log('Error loading posts, showing sample posts');
            this.showSamplePosts();
            }
        } finally {
            this.isLoading = false;
        }
    }

    // Function to replace Unsplash URLs with Pexels URLs
    replaceUnsplashWithPexels(post) {
        if (post.mediaUrl && post.mediaUrl.includes('unsplash.com')) {
            console.log('🎯 Replacing Unsplash URL with Pexels:', post.mediaUrl);
            
            // Map of Pexels URLs to use instead of Unsplash
            const pexelsReplacements = [
                'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                'https://images.pexels.com/photos/3183156/pexels-photo-3183156.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                'https://images.pexels.com/photos/3183159/pexels-photo-3183159.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                'https://images.pexels.com/photos/3183162/pexels-photo-3183162.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                'https://images.pexels.com/photos/3183165/pexels-photo-3183165.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                'https://images.pexels.com/photos/3183168/pexels-photo-3183168.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                'https://images.pexels.com/photos/3183171/pexels-photo-3183171.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
            ];
            
            // Pick a random Pexels URL
            const randomIndex = Math.floor(Math.random() * pexelsReplacements.length);
            post.mediaUrl = pexelsReplacements[randomIndex];
            
            console.log('✅ Replaced with Pexels URL:', post.mediaUrl);
        }
        
        return post;
    }

    showSamplePosts() {
        console.log('🎯 showSamplePosts called');
        
        const samplePosts = [
            {
                id: 'sample-1',
                title: 'Welcome to Amplifi! 🎉',
                description: 'This is a sample post to test the comment functionality. Try clicking the comment button below!',
                authorName: 'Amplifi Team',
                authorId: 'sample-user-1',
                authorPic: 'assets/images/default-avatar.svg',
                mediaUrl: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                mediaType: 'image',
                createdAt: new Date(Date.now() - 3600000), // 1 hour ago
                likes: 42,
                comments: 5,
                views: 1234,
                userReaction: null
            },
            {
                id: 'sample-2',
                title: 'Test Comment System 💬',
                description: 'This post is specifically for testing comments. Leave a comment below to see how it works!',
                authorName: 'Test User',
                authorId: 'sample-user-2',
                authorPic: 'assets/images/default-avatar.svg',
                mediaUrl: 'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                mediaType: 'image',
                createdAt: new Date(Date.now() - 7200000), // 2 hours ago
                likes: 18,
                comments: 2,
                views: 567,
                userReaction: null
            },
            {
                id: 'sample-3',
                title: 'Amplifi Features Demo 🚀',
                description: 'Explore all the amazing features of Amplifi including live streaming, music library, and more!',
                authorName: 'Demo Creator',
                authorId: 'sample-user-3',
                authorPic: 'assets/images/default-avatar.svg',
                mediaUrl: 'https://images.pexels.com/photos/3183156/pexels-photo-3183156.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                mediaType: 'image',
                createdAt: new Date(Date.now() - 10800000), // 3 hours ago
                likes: 89,
                comments: 12,
                views: 2345,
                userReaction: null
            }
        ];
        
        console.log('🎯 Sample posts created:', samplePosts.length, 'posts');
        console.log('🎯 Sample post 1 media URL:', samplePosts[0].mediaUrl);
        
        this.posts = samplePosts;
        this.renderPosts(samplePosts);
        
        // Hide loading and show empty state if needed
        const loadingElement = document.getElementById('feedLoading');
        const emptyStateElement = document.getElementById('feedEmptyState');
        
        if (loadingElement) {
            loadingElement.style.display = 'none';
            console.log('✅ Loading element hidden');
        }
        
        if (emptyStateElement) {
            emptyStateElement.style.display = 'none';
            console.log('✅ Empty state element hidden');
        }
        
        console.log('✅ Sample posts rendered successfully');
    }

    renderPosts(posts) {
        console.log('🎯 renderPosts called with', posts.length, 'posts');
        const postsContainer = document.getElementById('feedPosts');
        if (!postsContainer) {
            console.error('❌ feedPosts container not found');
            return;
        }

        // Clear existing posts if this is a fresh load
        if (posts.length > 0 && postsContainer.children.length === 0) {
            postsContainer.innerHTML = '';
        }

        posts.forEach((post, index) => {
            console.log(`🎯 Creating post element ${index + 1}:`, post.title, 'Media URL:', post.mediaUrl);
            const postElement = this.createPostElement(post);
            postsContainer.appendChild(postElement);
        });
        
        console.log('✅ renderPosts completed');
    }

    createPostElement(post) {
        console.log('🎯 createPostElement called for:', post.title);
        const postDiv = document.createElement('div');
        postDiv.className = 'post-card';
        postDiv.setAttribute('data-post-id', post.id);
        
        // Add click handler to open post details
        postDiv.onclick = (e) => {
            // Don't trigger if clicking on action buttons
            if (e.target.closest('.action-btn') || e.target.closest('.post-actions')) {
                return;
            }
            this.showPostDetails(post);
        };
        postDiv.style.cursor = 'pointer';

        // Create media section safely
        if (post.mediaUrl && post.mediaUrl.trim() !== '') {
            console.log('🎯 Creating media section for:', post.mediaUrl);
            const mediaDiv = document.createElement('div');
            mediaDiv.className = 'post-media';
            if (post.mediaType === 'video') {
                const videoWrapper = document.createElement('div');
                videoWrapper.className = 'post-video-wrapper';
                const video = document.createElement('video');
                video.src = post.mediaUrl;
                if (post.thumbnailUrl) video.poster = post.thumbnailUrl;
                video.onclick = (e) => {
                    e.stopPropagation();
                    this.playVideo(video);
                };
                videoWrapper.appendChild(video);

                // Play icon overlay
                const playIcon = document.createElement('div');
                playIcon.className = 'post-play-icon';
                playIcon.innerHTML = '<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="24" fill="rgba(0,0,0,0.4)"/><polygon points="20,16 34,24 20,32" fill="#fff"/></svg>';
                playIcon.onclick = (e) => { 
                    e.stopPropagation(); 
                    video.play(); 
                };
                videoWrapper.appendChild(playIcon);

                // Video duration overlay (bottom right)
                if (post.duration) {
                    const durationDiv = document.createElement('div');
                    durationDiv.className = 'video-duration-overlay';
                    durationDiv.textContent = this.formatDuration(post.duration);
                    videoWrapper.appendChild(durationDiv);
                }

                mediaDiv.appendChild(videoWrapper);
            } else {
                console.log('🎯 Creating image element with src:', post.mediaUrl);
                const img = document.createElement('img');
                img.src = post.mediaUrl;
                img.alt = 'Post image';
                img.onload = () => console.log('✅ Image loaded successfully:', post.mediaUrl);
                img.onerror = () => {
                    console.error('❌ Image failed to load:', post.mediaUrl);
                    img.style.display = 'none';
                };
                mediaDiv.appendChild(img);
            }
            postDiv.appendChild(mediaDiv);
            console.log('✅ Media section created');
        } else {
            console.log('⚠️ No media URL for post:', post.title);
        }

        // Create post info section
        const infoDiv = document.createElement('div');
        infoDiv.className = 'post-info';

        // Title
        const title = document.createElement('h3');
        title.className = 'post-title';
        title.textContent = post.title || '';
        infoDiv.appendChild(title);

        // Meta row (views, time, channel)
        const metaDiv = document.createElement('div');
        metaDiv.className = 'post-meta';
        // Views
        const viewsSpan = document.createElement('span');
        viewsSpan.className = 'post-views';
        viewsSpan.innerHTML = `<svg width='18' height='18' fill='none' stroke='#64748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10'/><circle cx='12' cy='12' r='4'/></svg> ${post.views || Math.floor(Math.random()*10000+100)} views`;
        metaDiv.appendChild(viewsSpan);
        // Time
        const timeSpan = document.createElement('span');
        timeSpan.className = 'post-time';
        timeSpan.textContent = this.formatTimestamp(post.createdAt);
        metaDiv.appendChild(timeSpan);
        // Channel/avatar
        const channelDiv = document.createElement('span');
        channelDiv.className = 'post-channel';
        channelDiv.innerHTML = `<img src='${post.authorPic || 'assets/images/default-avatar.svg'}' alt='Channel' class='post-author-pic' style='width:22px;height:22px;margin-right:0.4em;'> <span class='post-channel-name'>${post.authorName || 'Anonymous'}</span>`;
        metaDiv.appendChild(channelDiv);
        infoDiv.appendChild(metaDiv);

        // Caption (short description)
        if (post.description) {
            const caption = document.createElement('p');
            caption.className = 'post-caption';
            caption.textContent = post.description;
            infoDiv.appendChild(caption);
        }

        // Actions row (like, comment, tip, share)
        const actionRow = document.createElement('div');
        actionRow.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.25rem;
            margin-top: 1rem;
            padding: 0.5rem 0;
            border-top: 1px solid #e5e7eb;
            flex-wrap: wrap;
        `;

        // Helper to create action button with icon only
        function createActionBtn({className, title, innerHTML, onClick, isPrimary = false, accentColor = '#64748b', count = null}) {
            const btn = document.createElement('button');
            btn.className = `action-btn ${className || ''} ${isPrimary ? 'primary-action' : ''}`;
            btn.setAttribute('title', title);
            btn.setAttribute('aria-label', title);
            
            let content = `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 1px;">
                    <span style="font-size: 16px;">${innerHTML}</span>
                    <span style="font-size: 0.6rem; font-weight: 500; color: ${accentColor}; line-height: 1;">${title}</span>
                </div>
            `;
            if (count !== null && count > 0) {
                content = `
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 1px; position: relative;">
                        <span style="font-size: 16px;">${innerHTML}</span>
                        <span style="font-size: 0.6rem; font-weight: 500; color: ${accentColor}; line-height: 1;">${title}</span>
                        <span class="action-count" style="position: absolute; top: -5px; right: -8px; font-size: 0.55rem; font-weight: 600; color: white; background: ${accentColor}; padding: 1px 3px; border-radius: 6px; min-width: 12px; text-align: center;">${count}</span>
                    </div>
                `;
            }
            
            btn.innerHTML = content;
            btn.onclick = onClick;
            btn.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: center;
                background: none;
                border: none;
                cursor: pointer;
                padding: 0.4rem 0.2rem;
                border-radius: 6px;
                transition: all 0.2s ease;
                min-width: 50px;
                position: relative;
                ${isPrimary ? 'flex: 1;' : ''}
            `;
            
            // Add hover effect
            btn.addEventListener('mouseenter', () => {
                btn.style.backgroundColor = `${accentColor}10`;
                btn.style.transform = 'translateY(-1px)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.backgroundColor = 'transparent';
                btn.style.transform = 'translateY(0)';
            });
            
            return btn;
        }

        // Like - Primary action
        const likeBtn = createActionBtn({
            className: post.userReaction === 'like' ? 'active' : '',
            title: post.userReaction === 'like' ? 'Unlike' : 'Like',
            isPrimary: true,
            accentColor: '#ef4444',
            innerHTML: post.userReaction === 'like' 
                ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="#ef4444"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>'
                : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
            count: post.reactions?.like || post.likes || 0,
            onClick: (e) => {
                e.stopPropagation();
                this.toggleReaction(post.id, 'like');
                likeBtn.classList.remove('heart-burst');
                void likeBtn.offsetWidth;
                likeBtn.classList.add('heart-burst');
                setTimeout(() => likeBtn.classList.remove('heart-burst'), 400);
            }
        });
        actionRow.appendChild(likeBtn);

        // Comment - Secondary action
        const commentsBtn = createActionBtn({
            title: 'Comment',
            accentColor: '#64748b',
            innerHTML: '💬',
            count: post.reactions?.comment || post.comments || 0,
            onClick: (e) => {
                e.stopPropagation();
                this.showComments(post.id);
            }
        });
        actionRow.appendChild(commentsBtn);

        // Tip - Special action (only show if user is logged in)
        if (this.currentUser) {
            const tipBtn = createActionBtn({
                title: 'Tip',
                accentColor: '#10b981',
                innerHTML: '💰',
                onClick: (e) => {
                    e.stopPropagation();
                    this.showTipModal(post.authorId, post.authorName);
                }
            });
            actionRow.appendChild(tipBtn);
        }

        // Share - Standard action
        const shareBtn = createActionBtn({
            title: 'Share',
            accentColor: '#64748b',
            innerHTML: '📤',
            onClick: (e) => {
                e.stopPropagation();
                this.sharePost(post.id);
            }
        });
        actionRow.appendChild(shareBtn);

        infoDiv.appendChild(actionRow);

        postDiv.appendChild(infoDiv);
        return postDiv;
    }

    async showPostDetails(post) {
        try {
            // Fetch fresh post data from Firestore to get updated like count
            const postDoc = await db.collection('posts').doc(post.id).get();
            const freshPostData = postDoc.exists ? { id: post.id, ...postDoc.data() } : post;
            
        // Create modal for post details
        const modal = document.createElement('div');
        modal.className = 'modal post-detail-modal';
        modal.style.display = 'flex';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
        modal.style.zIndex = '9999';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.padding = '20px';

        const modalContent = document.createElement('div');
        modalContent.style.backgroundColor = 'white';
        modalContent.style.borderRadius = '12px';
        modalContent.style.maxWidth = '600px';
        modalContent.style.width = '100%';
        modalContent.style.maxHeight = '90vh';
        modalContent.style.overflow = 'auto';
        modalContent.style.position = 'relative';

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '15px';
        closeBtn.style.background = 'none';
        closeBtn.style.border = 'none';
        closeBtn.style.fontSize = '24px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.zIndex = '1';
        closeBtn.onclick = () => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        };

        // Post content
        const content = document.createElement('div');
        content.style.padding = '20px';

        // Author info
        const authorDiv = document.createElement('div');
        authorDiv.style.display = 'flex';
        authorDiv.style.alignItems = 'center';
        authorDiv.style.marginBottom = '15px';
        authorDiv.innerHTML = `
                <img src="${freshPostData.authorPic || 'assets/images/default-avatar.svg'}" alt="Author" style="width:40px;height:40px;border-radius:50%;margin-right:10px;">
            <div>
                    <div style="font-weight:bold;">${freshPostData.authorName || 'Anonymous'}</div>
                    <div style="color:#666;font-size:14px;">${this.formatTimestamp(freshPostData.createdAt)}</div>
            </div>
        `;

        // Title
        const title = document.createElement('h2');
            title.textContent = freshPostData.title || '';
        title.style.marginBottom = '15px';

        // Media
        let mediaElement = null;
            if (freshPostData.mediaUrl && freshPostData.mediaUrl.trim() !== '') {
                if (freshPostData.mediaType === 'video') {
                mediaElement = document.createElement('video');
                    mediaElement.src = freshPostData.mediaUrl;
                mediaElement.controls = true;
                mediaElement.style.width = '100%';
                mediaElement.style.borderRadius = '8px';
                mediaElement.style.marginBottom = '15px';
            } else {
                mediaElement = document.createElement('img');
                    mediaElement.src = freshPostData.mediaUrl;
                mediaElement.alt = 'Post image';
                mediaElement.style.width = '100%';
                mediaElement.style.borderRadius = '8px';
                mediaElement.style.marginBottom = '15px';
            }
        }

        // Description
        const description = document.createElement('p');
            description.textContent = freshPostData.description || '';
        description.style.lineHeight = '1.6';
        description.style.marginBottom = '15px';

            // Stats with fresh data
        const statsDiv = document.createElement('div');
        statsDiv.style.display = 'flex';
        statsDiv.style.gap = '20px';
        statsDiv.style.color = '#666';
        statsDiv.style.fontSize = '14px';
        statsDiv.innerHTML = `
                <span>👁️ ${freshPostData.views || Math.floor(Math.random()*10000+100)} views</span>
                <span>❤️ ${freshPostData.reactions?.like || freshPostData.likes || 0} likes</span>
                <span>💬 ${freshPostData.comments || 0} comments</span>
        `;

        // AI Generated badge
            if (freshPostData.isAIGenerated) {
            const aiBadge = document.createElement('div');
            aiBadge.innerHTML = '🤖 AI Generated';
            aiBadge.style.background = '#6366f1';
            aiBadge.style.color = 'white';
            aiBadge.style.padding = '4px 8px';
            aiBadge.style.borderRadius = '4px';
            aiBadge.style.fontSize = '12px';
            aiBadge.style.display = 'inline-block';
            aiBadge.style.marginTop = '10px';
            content.appendChild(aiBadge);
        }

        // Build content properly
        content.appendChild(authorDiv);
        content.appendChild(title);
        if (mediaElement) content.appendChild(mediaElement);
        content.appendChild(description);
        content.appendChild(statsDiv);

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(content);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Close on background click
        modal.onclick = (e) => {
            if (e.target === modal) {
                if (document.body.contains(modal)) {
                    document.body.removeChild(modal);
                }
            }
        };

        // Add escape key listener
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                if (document.body.contains(modal)) {
                    document.body.removeChild(modal);
                }
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        } catch (error) {
            console.error('Error showing post details:', error);
        }
    }

    async toggleReaction(postId, reactionType) {
        if (!this.currentUser) {
            alert('Please login to react to posts');
            return;
        }

        try {
            const reactionRef = db.collection('reactions').doc(`${postId}_${this.currentUser.uid}`);
            const reactionDoc = await reactionRef.get();

            if (reactionDoc.exists && reactionDoc.data().type === reactionType) {
                // Remove reaction
                await reactionRef.delete();
                await db.collection('posts').doc(postId).update({
                    [`reactions.${reactionType}`]: firebase.firestore.FieldValue.increment(-1)
                });
                this.updateReactionUI(postId, reactionType, false);
                
                // Update like count in UI
                if (reactionType === 'like') {
                    const postDoc = await db.collection('posts').doc(postId).get();
                    const newLikeCount = postDoc.data()?.reactions?.like || 0;
                    console.log(`Removing like, new count: ${newLikeCount}`);
                    this.updatePostLikeCount(postId, newLikeCount);
                }
            } else {
                // Add/Change reaction
                const reactionData = {
                    userId: this.currentUser.uid,
                    postId: postId,
                    type: reactionType,
                    createdAt: new Date()
                };

                if (reactionDoc.exists) {
                    // Remove previous reaction
                    const oldType = reactionDoc.data().type;
                    await db.collection('posts').doc(postId).update({
                        [`reactions.${oldType}`]: firebase.firestore.FieldValue.increment(-1)
                    });
                    this.updateReactionUI(postId, oldType, false);
                }

                // Add new reaction
                await reactionRef.set(reactionData);
                await db.collection('posts').doc(postId).update({
                    [`reactions.${reactionType}`]: firebase.firestore.FieldValue.increment(1)
                });
                this.updateReactionUI(postId, reactionType, true);
                
                // Update like count in UI
                if (reactionType === 'like') {
                    const postDoc = await db.collection('posts').doc(postId).get();
                    const newLikeCount = postDoc.data()?.reactions?.like || 0;
                    console.log(`Adding like, new count: ${newLikeCount}`);
                    this.updatePostLikeCount(postId, newLikeCount);
                }
            }
        } catch (error) {
            console.error('Error toggling reaction:', error);
        }
    }

    updateReactionUI(postId, reactionType, isActive) {
        // Find the post element and update the like button
        const postElement = document.querySelector(`[data-post-id="${postId}"]`);
        if (postElement) {
            const likeBtn = postElement.querySelector('.action-btn');
            if (likeBtn) {
            if (isActive) {
                    likeBtn.classList.add('active');
                    // Update the heart icon to filled
                    likeBtn.innerHTML = likeBtn.innerHTML.replace(
                        /<svg[^>]*fill="none"[^>]*>/,
                        '<svg width="20" height="20" viewBox="0 0 24 24" fill="#ef4444">'
                    );
            } else {
                    likeBtn.classList.remove('active');
                    // Update the heart icon to outline
                    likeBtn.innerHTML = likeBtn.innerHTML.replace(
                        /<svg[^>]*fill="#ef4444"[^>]*>/,
                        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">'
                    );
                }
            }
        }
    }

    async toggleBookmark(postId) {
        if (!this.currentUser) {
            alert('Please login to bookmark posts');
            return;
        }

        try {
            const bookmarkRef = db.collection('users').doc(this.currentUser.uid)
                .collection('bookmarks').doc(postId);
            const bookmarkDoc = await bookmarkRef.get();

            if (bookmarkDoc.exists) {
                // Remove bookmark
                await bookmarkRef.delete();
                this.bookmarkedPosts.delete(postId);
            } else {
                // Add bookmark
                await bookmarkRef.set({
                    postId: postId,
                    createdAt: new Date()
                });
                this.bookmarkedPosts.add(postId);
            }

            // Update UI
            this.updateBookmarkUI(postId, bookmarkDoc.exists);
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        }
    }

    updateBookmarkUI(postId, isBookmarked) {
        const bookmarkBtn = document.querySelector(`[onclick="feedPage.toggleBookmark('${postId}')"]`);
        if (bookmarkBtn) {
            if (isBookmarked) {
                bookmarkBtn.classList.add('bookmarked');
                bookmarkBtn.innerHTML = '🔖 Bookmark';
            } else {
                bookmarkBtn.classList.remove('bookmarked');
                bookmarkBtn.innerHTML = '📑 Bookmark';
            }
        }
    }

    searchHashtag(hashtag) {
        // Navigate to search page with hashtag
        window.location.href = `search.html?q=${encodeURIComponent(hashtag)}`;
    }

    async showComments(postId) {
        const modal = document.getElementById('commentsModal');
        const postInfo = document.getElementById('commentsPostInfo');
        const commentsList = document.getElementById('commentsList');
        const commentsLoading = document.getElementById('commentsLoading');
        
        if (modal && postInfo) {
            modal.style.display = 'block';
            postInfo.textContent = 'Loading comments...';
            
            // Clear comments list and show loading
            if (commentsList) {
                commentsList.innerHTML = '';
            }
            if (commentsLoading) {
                commentsLoading.style.display = 'block';
            }
            
            await this.loadComments(postId);
        }
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
        
        // Reset comment form tracking
        this.currentCommentPostId = null;
    }

    updatePostCommentCount(postId) {
        // Find the post element and update its comment count
        const postElement = document.querySelector(`[data-post-id="${postId}"]`);
        if (postElement) {
            const commentBtn = postElement.querySelector('.action-btn[title="Comment"], .action-btn[title="Comments"]');
            if (commentBtn) {
                const countSpan = commentBtn.querySelector('.action-count');
                if (countSpan) {
                    const currentCount = parseInt(countSpan.textContent) || 0;
                    countSpan.textContent = currentCount + 1;
                }
            }
        }
    }

    updatePostLikeCount(postId, newLikeCount) {
        console.log(`Updating like count for post ${postId} to ${newLikeCount}`);
        // Find the post element and update its like count
        const postElement = document.querySelector(`[data-post-id="${postId}"]`);
        if (postElement) {
            // Find the like button by looking for the first action button (which is the like button)
            const likeBtn = postElement.querySelector('.action-btn');
            if (likeBtn) {
                const countSpan = likeBtn.querySelector('.action-count');
                if (countSpan) {
                    countSpan.textContent = newLikeCount;
                    console.log(`Updated existing count span to ${newLikeCount}`);
                } else if (newLikeCount > 0) {
                    // If no count span exists but we have likes, create one
                    const existingContent = likeBtn.innerHTML;
                    const newContent = existingContent.replace(
                        /<span style="font-size: 0\.6rem; font-weight: 500; color: [^;]+; line-height: 1;">[^<]+<\/span>/,
                        `<span style="font-size: 0.6rem; font-weight: 500; color: #ef4444; line-height: 1;">${likeBtn.getAttribute('title')}</span><span class="action-count" style="position: absolute; top: -5px; right: -8px; font-size: 0.55rem; font-weight: 600; color: white; background: #ef4444; padding: 1px 3px; border-radius: 6px; min-width: 12px; text-align: center;">${newLikeCount}</span>`
                    );
                    likeBtn.innerHTML = newContent;
                    console.log(`Created new count span with ${newLikeCount}`);
                } else if (newLikeCount === 0) {
                    // Remove count span if count is 0
                    const countSpan = likeBtn.querySelector('.action-count');
                    if (countSpan) {
                        countSpan.remove();
                        console.log(`Removed count span for 0 likes`);
                    }
                }
            } else {
                console.log(`Like button not found for post ${postId}`);
            }
        } else {
            console.log(`Post element not found for post ${postId}`);
        }
    }

    async loadComments(postId) {
        try {
            const commentsSnapshot = await db.collection('comments')
                .where('postId', '==', postId)
                .orderBy('createdAt', 'desc')
                .limit(50) // Add limit to prevent large queries
                .get();

            const comments = [];
            commentsSnapshot.forEach(doc => {
                comments.push({ id: doc.id, ...doc.data() });
            });

            this.renderComments(comments, postId);
        } catch (error) {
            console.error('Error loading comments:', error);
            // Show user-friendly error message
            this.renderComments([], postId);
            const commentsList = document.getElementById('commentsList');
            if (commentsList) {
                commentsList.innerHTML = '<p class="no-comments">Unable to load comments. Please try again later.</p>';
            }
        }
    }

    renderComments(comments, postId) {
        const commentsList = document.getElementById('commentsList');
        const postInfo = document.getElementById('commentsPostInfo');
        const commentForm = document.getElementById('commentForm');
        const commentUserPic = document.getElementById('commentUserPic');
        const commentsLoading = document.getElementById('commentsLoading');
        
        // Hide loading indicator
        if (commentsLoading) {
            commentsLoading.style.display = 'none';
        }
        
        if (commentsList) {
            commentsList.innerHTML = '';
            
            if (comments.length === 0) {
                commentsList.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
            } else {
                                    comments.forEach(comment => {
                        const commentElement = document.createElement('div');
                        commentElement.className = 'comment-item';
                        
                        // Create elements safely
                        const img = document.createElement('img');
                        img.src = comment.authorPic || 'assets/images/default-avatar.svg';
                        img.alt = 'User';
                        img.className = 'comment-user-pic';
                    img.onerror = () => {
                        img.src = 'assets/images/default-avatar.svg';
                    };
                        
                        const contentDiv = document.createElement('div');
                        contentDiv.className = 'comment-content';
                        
                        const headerDiv = document.createElement('div');
                        headerDiv.className = 'comment-header';
                        
                        const authorSpan = document.createElement('span');
                        authorSpan.className = 'comment-author';
                        authorSpan.textContent = comment.authorName || 'Anonymous';
                        
                        const timestampSpan = document.createElement('span');
                        timestampSpan.className = 'comment-timestamp';
                        timestampSpan.textContent = this.formatTimestamp(comment.createdAt);
                        
                        const textP = document.createElement('p');
                        textP.className = 'comment-text';
                        textP.textContent = comment.text || '';
                        
                        // Assemble the comment
                        headerDiv.appendChild(authorSpan);
                        headerDiv.appendChild(timestampSpan);
                        contentDiv.appendChild(headerDiv);
                        contentDiv.appendChild(textP);
                        commentElement.appendChild(img);
                        commentElement.appendChild(contentDiv);
                        
                        commentsList.appendChild(commentElement);
                    });
            }
        }

        if (postInfo) {
            postInfo.textContent = `${comments.length} comments`;
        }

        if (commentForm) {
            commentForm.style.display = this.currentUser ? 'block' : 'none';
            
            // Set user profile picture in comment form
            if (commentUserPic && this.userProfile?.profilePic) {
                commentUserPic.src = this.userProfile.profilePic;
            } else if (commentUserPic) {
                commentUserPic.src = 'assets/images/default-avatar.svg';
            }
            
            this.setupCommentForm(postId);
        }
    }

    setupCommentForm(postId) {
        // Prevent duplicate setup for the same post
        if (this.currentCommentPostId === postId) {
            return;
        }
        
        const commentForm = document.getElementById('commentForm');
        const commentText = document.getElementById('commentText');
        const commentSubmitBtn = document.getElementById('commentSubmitBtn');
        
        if (commentForm && commentText && commentSubmitBtn) {
            // Remove existing event listeners to prevent duplicates
            const newForm = commentForm.cloneNode(true);
            commentForm.parentNode.replaceChild(newForm, commentForm);
            
            // Get the new elements
            const newCommentText = newForm.querySelector('#commentText');
            const newCommentSubmitBtn = newForm.querySelector('#commentSubmitBtn');
            
            newForm.onsubmit = async (e) => {
                e.preventDefault();
                
                if (!newCommentText.value.trim()) {
                    return;
                }
                
                // Show loading state
                newCommentSubmitBtn.textContent = 'Posting...';
                newCommentSubmitBtn.disabled = true;
                
                try {
                    await this.postComment(postId, newCommentText.value);
                    newCommentText.value = '';
                } catch (error) {
                    console.error('Error posting comment:', error);
                } finally {
                    // Reset button state
                    newCommentSubmitBtn.textContent = 'Post Comment';
                    newCommentSubmitBtn.disabled = false;
                }
            };
            
            // Mark this post as having its form set up
            this.currentCommentPostId = postId;
        }
    }

    async postComment(postId, text) {
        if (!this.currentUser || !text.trim()) return;

        try {
            const commentData = {
                postId: postId,
                authorId: this.currentUser.uid,
                authorName: this.userProfile?.displayName || 'Anonymous',
                authorPic: this.userProfile?.profilePic || '',
                text: text.trim(),
                createdAt: new Date()
            };

            // Add comment to database
            await db.collection('comments').add(commentData);
            
            // Update post comment count
            await db.collection('posts').doc(postId).update({
                comments: firebase.firestore.FieldValue.increment(1)
            });

            // Reload comments to show the new comment
            await this.loadComments(postId);
            
            // Update the post's comment count in the UI
            this.updatePostCommentCount(postId);
            
        } catch (error) {
            console.error('Error posting comment:', error);
            throw error; // Re-throw to be handled by the calling function
        }
    }

    filterPosts(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        // Reset posts and reload
        this.posts = [];
        this.lastPost = null;
        const postsContainer = document.getElementById('feedPosts');
        if (postsContainer) postsContainer.innerHTML = '';
        
        this.loadPosts();
    }

    handleSearch(query) {
        // Implement search functionality
        console.log('Search query:', query);
    }

    performSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `search.html?q=${encodeURIComponent(query)}`;
            }
        }
    }

    async showTipModal(creatorId, creatorName) {
        if (!this.currentUser) {
            alert('Please login to send tips');
            return;
        }

        const tipModal = document.getElementById('tipModal');
        const creatorInfo = document.getElementById('tipCreatorInfo');
        
        if (tipModal && creatorInfo) {
            creatorInfo.innerHTML = `
                <p>Tip <strong>${creatorName}</strong></p>
                <p>Show your appreciation for their content!</p>
            `;
            tipModal.style.display = 'block';
            this.setupTipForm(creatorId);
        }
    }

    setupTipForm(creatorId) {
        const tipForm = document.getElementById('tipForm');
        const tipAmounts = document.querySelectorAll('.tip-amount');
        const customAmount = document.getElementById('customTipAmount');

        if (tipForm) {
            tipForm.reset();
            tipAmounts.forEach(btn => btn.classList.remove('active'));

            tipAmounts.forEach(btn => {
                btn.addEventListener('click', () => {
                    tipAmounts.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    if (customAmount) customAmount.value = btn.dataset.amount;
                });
            });

            tipForm.onsubmit = async (e) => {
                e.preventDefault();
                await this.sendTip(creatorId);
            };
        }
    }

    async sendTip(creatorId) {
        const customAmount = document.getElementById("customTipAmount");
        if (!customAmount) return;

        const amount = parseFloat(customAmount.value);
        
        if (!amount || amount < 0.50) {
            alert("Minimum tip amount is $0.50");
            return;
        }

        try {
            // Check if Stripe is available
            if (typeof window.paymentProcessor === "undefined") {
                alert("Payment system not available. Please refresh the page.");
                return;
            }

            // Get recipient info
            const recipientDoc = await db.collection("users").doc(creatorId).get();
            const recipientName = recipientDoc.exists ? recipientDoc.data().displayName || "Creator" : "Creator";

            // Use StripeFrontendOnly sendTip method
            await window.paymentProcessor.sendTip(creatorId, recipientName);

        } catch (error) {
            console.error("Error processing tip:", error);
            alert("Failed to send tip. Please try again.");
        }
    }

    sharePost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        // Create share modal
        const shareModal = document.createElement('div');
        shareModal.className = 'modal';
        shareModal.innerHTML = `
            <div class="modal-content share-modal">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <h3>Share Post</h3>
                <div class="share-options">
                    <button onclick="feedPage.shareToSocial('${postId}', 'facebook')" class="share-btn facebook">
                        📘 Facebook
                    </button>
                    <button onclick="feedPage.shareToSocial('${postId}', 'twitter')" class="share-btn twitter">
                        🐦 Twitter
                    </button>
                    <button onclick="feedPage.shareToSocial('${postId}', 'whatsapp')" class="share-btn whatsapp">
                        💬 WhatsApp
                    </button>
                    <button onclick="feedPage.shareToSocial('${postId}', 'telegram')" class="share-btn telegram">
                        📱 Telegram
                    </button>
                    <button onclick="feedPage.copyLink('${postId}')" class="share-btn copy">
                        📋 Copy Link
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(shareModal);
        shareModal.style.display = 'block';
    }

    shareToSocial(postId, platform) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        const shareUrl = `${window.location.origin}/post.html?id=${postId}`;
        const text = `${post.title} - ${post.description}`;
        
        let url;
        switch (platform) {
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                break;
            case 'twitter':
                url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
                break;
            case 'whatsapp':
                url = `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`;
                break;
            case 'telegram':
                url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
                break;
        }
        
        if (url) {
            window.open(url, '_blank', 'width=600,height=400');
        }
    }

    copyLink(postId) {
        const shareUrl = `${window.location.origin}/post.html?id=${postId}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('Post link copied to clipboard!');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Post link copied to clipboard!');
        });
    }

    playVideo(videoElement) {
        if (videoElement.paused) {
            videoElement.play();
        } else {
            videoElement.pause();
        }
    }

    async handleLogout() {
        console.log('handleLogout function called!');
        try {
            await auth.signOut();
            console.log('User signed out successfully');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
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

    formatDuration(seconds) {
        if (!seconds) return '';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    initializeAdMob() {
        // Initialize AdMob functionality
        console.log('AdMob initialized');
    }

    async initializeNotifications() {
        // Check if browser supports notifications
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return;
        }

        // Check if service worker is supported
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', registration);
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    async requestNotificationPermission() {
        if (!this.currentUser) return;

        if (Notification.permission === 'default') {
            // Show notification permission request
            this.showNotificationPermissionModal();
        } else if (Notification.permission === 'granted') {
            // Subscribe to push notifications
            this.subscribeToPushNotifications();
        }
    }

    showNotificationPermissionModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content notification-permission">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <h3>🔔 Stay Updated!</h3>
                <p>Get notified about new posts, likes, comments, and more from creators you follow.</p>
                <div class="notification-actions">
                    <button onclick="feedPage.enableNotifications()" class="btn btn-primary">Enable Notifications</button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="btn btn-secondary">Maybe Later</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    async enableNotifications() {
        try {
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                this.subscribeToPushNotifications();
                this.showNotificationSuccess();
            } else {
                this.showNotificationDenied();
            }
            
            // Remove the modal
            const modal = document.querySelector('.notification-permission').parentElement.parentElement;
            if (modal) modal.remove();
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        }
    }

    async subscribeToPushNotifications() {
        if (!this.currentUser || !('serviceWorker' in navigator)) return;

        try {
            const registration = await navigator.serviceWorker.ready;
            
            // For now, skip VAPID key subscription until we have a proper key
            // This prevents the error while still allowing basic notification functionality
            console.log('Push notification subscription skipped - VAPID key not configured');
            
            // Save a placeholder subscription to Firestore for future use
            await db.collection('users').doc(this.currentUser.uid)
                .collection('pushSubscriptions').add({
                    subscription: null,
                    createdAt: new Date(),
                    status: 'pending_vapid_key'
                });

            console.log('Push notification subscription placeholder saved');
        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
        }
    }

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

    showNotificationSuccess() {
        const notification = document.createElement('div');
        notification.className = 'notification-permission';
        notification.innerHTML = `
            <h4>✅ Notifications Enabled!</h4>
            <p>You'll now receive updates about new content and interactions.</p>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }, 3000);
    }

    showNotificationDenied() {
        const notification = document.createElement('div');
        notification.className = 'notification-permission';
        notification.innerHTML = `
            <h4>❌ Notifications Disabled</h4>
            <p>You can enable notifications later in your browser settings.</p>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }, 3000);
    }

    async sendNotification(title, options = {}) {
        if (Notification.permission === 'granted') {
            const notification = new Notification(title, {
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                ...options
            });

            notification.onclick = function() {
                window.focus();
                this.close();
                // Navigate to notifications page
                window.location.href = '/notifications.html';
            };
        }
    }

    initializePWAFeatures() {
        // Wait for PWA Manager to be available
        const checkPWAManager = () => {
            if (window.pwaManager) {
                this.pwaManager = window.pwaManager;
                this.setupPWAIntegration();
            } else {
                setTimeout(checkPWAManager, 100);
            }
        };
        checkPWAManager();
    }

    setupPWAIntegration() {
        // Listen for feed updates from PWA Manager
        document.addEventListener('feedUpdate', (event) => {
            this.handleFeedUpdate(event.detail);
        });

        // Listen for offline/online status
        window.addEventListener('online', () => {
            this.handleOnlineStatus();
        });

        window.addEventListener('offline', () => {
            this.handleOfflineStatus();
        });
    }

    handleFeedUpdate(data) {
        if (data.post) {
            // Add new post to the top of the feed
            this.addNewPostToFeed(data.post);
        }
    }

    addNewPostToFeed(post) {
        const feedContainer = document.getElementById('feedPosts');
        if (feedContainer) {
            const newPostElement = this.createPostElement(post);
            
            // Add smooth animation
            newPostElement.style.opacity = '0';
            newPostElement.style.transform = 'translateY(-20px)';
            
            feedContainer.insertBefore(newPostElement, feedContainer.firstChild);
            
            // Animate in
            setTimeout(() => {
                newPostElement.style.transition = 'all 0.3s ease';
                newPostElement.style.opacity = '1';
                newPostElement.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    handleOnlineStatus() {
        console.log('Back online - syncing data');
        // Refresh feed when back online
        this.loadPosts();
    }

    handleOfflineStatus() {
        console.log('Gone offline - working in offline mode');
    }

    // Enhanced post creation with PWA integration
    async createPost(postData) {
        try {
            // Create post locally first
            const post = {
                id: Date.now().toString(),
                ...postData,
                createdAt: new Date(),
                authorName: this.userProfile?.displayName || 'Anonymous',
                authorUsername: this.userProfile?.username || 'user',
                authorPic: this.userProfile?.profilePic || 'assets/images/default-avatar.svg',
                likes: 0,
                comments: 0,
                liked: false
            };

            // Add to local feed immediately
            this.posts.unshift(post);
            this.renderPosts([post]);

            // Trigger PWA event
            document.dispatchEvent(new CustomEvent('newPost', {
                detail: post
            }));

            // Store locally
            this.storePostLocally(post);

            return post;
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        }
    }

    storePostLocally(post) {
        const localPosts = JSON.parse(localStorage.getItem('amplifi_local_posts') || '[]');
        localPosts.unshift(post);
        localStorage.setItem('amplifi_local_posts', JSON.stringify(localPosts.slice(0, 50))); // Keep last 50 posts
    }



    storeLikeLocally(likeData) {
        const localLikes = JSON.parse(localStorage.getItem('amplifi_local_likes') || '[]');
        localLikes.push(likeData);
        localStorage.setItem('amplifi_local_likes', JSON.stringify(localLikes.slice(-100))); // Keep last 100 likes
    }



    addCommentLocally(postId, commentData) {
        const localComments = JSON.parse(localStorage.getItem('amplifi_local_comments') || '[]');
        localComments.push(commentData);
        localStorage.setItem('amplifi_local_comments', JSON.stringify(localComments.slice(-200))); // Keep last 200 comments
    }

    // Load local data when offline
    loadLocalData() {
        if (!navigator.onLine) {
            console.log('Loading local data (offline mode)');
            
            // Load local posts
            const localPosts = JSON.parse(localStorage.getItem('amplifi_local_posts') || '[]');
            if (localPosts.length > 0) {
                this.posts = localPosts;
                this.renderPosts(localPosts);
            }
            
            // Load local likes
            const localLikes = JSON.parse(localStorage.getItem('amplifi_local_likes') || '[]');
            this.bookmarkedPosts = new Set(localLikes.map(like => like.postId));
        }
    }

    // Professional Notification System
    setupNotificationSystem() {
        const notificationBtn = document.getElementById('notificationBtn');
        
        // Navigate to notifications page when clicked
        if (notificationBtn) {
            notificationBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                console.log('Notification bell clicked!');
                console.log('Current user:', this.currentUser);
                console.log('Auth current user:', auth.currentUser);
                console.log('Event target:', e.target);
                console.log('Event currentTarget:', e.currentTarget);
                
                // Always navigate to notifications page - let the page handle auth
                window.location.href = 'notifications.html';
                
                return false;
            });
        } else {
            console.error('Notification button not found!');
        }
    }

    toggleNotificationDropdown() {
        const dropdown = document.getElementById('notificationDropdown');
        if (dropdown) {
            const isVisible = dropdown.style.display !== 'none';
            if (isVisible) {
                this.closeNotificationDropdown();
            } else {
                this.openNotificationDropdown();
            }
        }
    }

    openNotificationDropdown() {
        const dropdown = document.getElementById('notificationDropdown');
        if (dropdown) {
            dropdown.style.display = 'block';
            this.loadNotifications();
        }
    }

    closeNotificationDropdown() {
        const dropdown = document.getElementById('notificationDropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }

    async loadNotifications() {
        if (!this.currentUser) return;

        const notificationsList = document.getElementById('notificationsList');
        if (!notificationsList) return;

        try {
            // Show loading
            notificationsList.innerHTML = '<div class="loading-notifications">Loading notifications...</div>';

            // Get notifications from Firestore
            const notificationsSnapshot = await db.collection('notifications')
                .where('recipientId', '==', this.currentUser.uid)
                .orderBy('createdAt', 'desc')
                .limit(20)
                .get();

            const notifications = [];
            notificationsSnapshot.forEach(doc => {
                notifications.push({ id: doc.id, ...doc.data() });
            });

            this.renderNotifications(notifications);
        } catch (error) {
            console.error('Error loading notifications:', error);
            
            // Check if it's an index building error
            if (error.message && error.message.includes('index is currently building')) {
                notificationsList.innerHTML = `
                    <div class="no-notifications">
                        <div class="no-notifications-icon">⏳</div>
                        <p>Notifications are being set up...</p>
                        <small>This may take a few minutes. Please try again later.</small>
                    </div>
                `;
            } else {
                notificationsList.innerHTML = `
                    <div class="no-notifications">
                        <div class="no-notifications-icon">🔔</div>
                        <p>No notifications yet</p>
                        <small>When you receive notifications, they'll appear here.</small>
                    </div>
                `;
            }
        }
    }

    renderNotifications(notifications) {
        const notificationsList = document.getElementById('notificationsList');
        if (!notificationsList) return;

        if (notifications.length === 0) {
            notificationsList.innerHTML = `
                <div class="no-notifications">
                    <div class="no-notifications-icon">🔔</div>
                    <p>No notifications yet</p>
                </div>
            `;
            return;
        }

        notificationsList.innerHTML = notifications.map(notification => 
            this.createNotificationElement(notification)
        ).join('');
    }

    createNotificationElement(notification) {
        const isUnread = !notification.read;
        const timeAgo = this.formatTimestamp(notification.createdAt);
        
        return `
            <div class="notification-item ${isUnread ? 'unread' : ''}" data-id="${notification.id}">
                <img src="${notification.senderPic || 'assets/images/default-avatar.svg'}" alt="User" class="notification-avatar">
                <div class="notification-content">
                    <div class="notification-text">${this.formatNotificationText(notification)}</div>
                    <div class="notification-time">${timeAgo}</div>
                </div>
                ${notification.postThumbnail ? `<img src="${notification.postThumbnail}" alt="Post" class="notification-thumbnail">` : ''}
            </div>
        `;
    }

    formatNotificationText(notification) {
        const senderName = notification.senderName || 'Someone';
        
        switch (notification.type) {
            case 'like':
                return `<strong>${senderName}</strong> liked your post`;
            case 'comment':
                return `<strong>${senderName}</strong> commented on your post`;
            case 'follow':
                return `<strong>${senderName}</strong> started following you`;
            case 'message':
                return `<strong>${senderName}</strong> sent you a message`;
            case 'tip':
                return `<strong>${senderName}</strong> sent you a tip`;
            default:
                return `<strong>${senderName}</strong> interacted with your content`;
        }
    }

    async markAllNotificationsAsRead() {
        if (!this.currentUser) return;

        try {
            const batch = db.batch();
            const notificationsSnapshot = await db.collection('notifications')
                .where('recipientId', '==', this.currentUser.uid)
                .where('read', '==', false)
                .get();

            notificationsSnapshot.forEach(doc => {
                batch.update(doc.ref, { read: true });
            });

            await batch.commit();
            this.updateNotificationBadge();
            this.loadNotifications(); // Refresh the list
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    }

    switchNotificationTab(tabType) {
        // Update active tab
        document.querySelectorAll('.notification-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabType}"]`)?.classList.add('active');

        // Filter notifications based on tab
        this.loadNotificationsByType(tabType);
    }

    async loadNotificationsByType(type) {
        if (!this.currentUser) return;

        const notificationsList = document.getElementById('notificationsList');
        if (!notificationsList) return;

        try {
            notificationsList.innerHTML = '<div class="loading-notifications">Loading notifications...</div>';

            let query = db.collection('notifications')
                .where('recipientId', '==', this.currentUser.uid)
                .orderBy('createdAt', 'desc')
                .limit(20);

            if (type !== 'all') {
                query = query.where('type', '==', type);
            }

            const notificationsSnapshot = await query.get();
            const notifications = [];
            notificationsSnapshot.forEach(doc => {
                notifications.push({ id: doc.id, ...doc.data() });
            });

            this.renderNotifications(notifications);
        } catch (error) {
            console.error('Error loading notifications by type:', error);
            notificationsList.innerHTML = '<div class="no-notifications">Failed to load notifications</div>';
        }
    }



    updateNotificationBadge() {
        if (!this.currentUser) return;

        // Count unread notifications
        db.collection('notifications')
            .where('recipientId', '==', this.currentUser.uid)
            .where('read', '==', false)
            .get()
            .then(snapshot => {
                const badge = document.getElementById('notificationBadge');
                const count = snapshot.size;
                
                if (badge) {
                    if (count > 0) {
                        badge.textContent = count > 99 ? '99+' : count.toString();
                        badge.style.display = 'block';
                    } else {
                        badge.style.display = 'none';
                    }
                }
            })
            .catch(error => {
                console.error('Error updating notification badge:', error);
            });
    }

    showNewPostsBanner() {
        let banner = document.getElementById('newPostsBanner');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'newPostsBanner';
            banner.className = 'new-posts-banner';
            banner.textContent = 'New posts available! Tap to refresh';
            banner.onclick = () => {
                this.reloadFeedWithNewPosts();
            };
            document.body.prepend(banner);
        }
        banner.style.display = 'flex';
    }

    hideNewPostsBanner() {
        const banner = document.getElementById('newPostsBanner');
        if (banner) banner.style.display = 'none';
    }

    async reloadFeedWithNewPosts() {
        this.hideNewPostsBanner();
        this.posts = [];
        this.lastPost = null;
        this.noMorePosts = false;
        await this.loadPosts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Simulate new posts available every 90 seconds for demo
    startNewPostsBannerSimulation() {
        setInterval(() => {
            this.showNewPostsBanner();
        }, 90000);
    }



    downloadMedia(mediaUrl, title) {
        try {
            const link = document.createElement('a');
            link.href = mediaUrl;
            link.download = `${title || 'amplifi-media'}.${mediaUrl.split('.').pop()}`;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Download error:', error);
        }
    }

    followCreator(authorId, authorName) {
        if (!this.currentUser) {
            return;
        }
        
        // Toggle follow status
        const isFollowing = this.userProfile?.following?.includes(authorId);
        
        // Update follow status in database
        this.updateFollowStatus(authorId, !isFollowing);
    }

    async updateFollowStatus(authorId, isFollowing) {
        try {
            const userRef = db.collection('users').doc(this.currentUser.uid);
            
            if (isFollowing) {
                await userRef.update({
                    following: firebase.firestore.FieldValue.arrayUnion(authorId)
                });
            } else {
                await userRef.update({
                    following: firebase.firestore.FieldValue.arrayRemove(authorId)
                });
            }
        } catch (error) {
            console.error('Error updating follow status:', error);
        }
    }

    reportPost(postId, postTitle) {
        const reportReasons = [
            'Inappropriate content',
            'Spam',
            'Harassment',
            'Copyright violation',
            'False information',
            'Other'
        ];
        
        const reason = prompt(`Report "${postTitle}"\n\nSelect reason:\n${reportReasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\nEnter reason number (1-6):`);
        
        if (reason && reason >= 1 && reason <= 6) {
            const selectedReason = reportReasons[reason - 1];
            this.submitReport(postId, selectedReason);
        }
    }

    async submitReport(postId, reason) {
        try {
            const reportData = {
                postId,
                reason,
                reporterId: this.currentUser?.uid || 'anonymous',
                reporterName: this.userProfile?.displayName || 'Anonymous',
                createdAt: new Date(),
                status: 'pending'
            };
            
            await db.collection('reports').add(reportData);
        } catch (error) {
            console.error('Error submitting report:', error);
        }
    }

    showMoreOptions(post, event) {
        // Remove any existing dropdown
        const existingDropdown = document.querySelector('.more-options-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
        }

        // Create dropdown menu
        const dropdown = document.createElement('div');
        dropdown.className = 'more-options-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            top: 100%;
            right: 0;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            min-width: 180px;
            padding: 0.5rem 0;
            margin-top: 0.5rem;
        `;

        const options = [
            {
                icon: '⬇️',
                label: 'Download',
                action: () => this.downloadMedia(post.mediaUrl, post.title),
                show: !!post.mediaUrl
            },
            {
                icon: '👥',
                label: 'Follow Creator',
                action: () => this.followCreator(post.authorId, post.authorName),
                show: true
            },
            {
                icon: '🔗',
                label: 'Copy Link',
                action: () => this.copyLink(post.id),
                show: true
            },
            {
                icon: '🚨',
                label: 'Report',
                action: () => this.reportPost(post.id, post.title),
                show: true
            }
        ];

        options.forEach(option => {
            if (option.show) {
                const optionBtn = document.createElement('button');
                optionBtn.style.cssText = `
                    display: flex;
                    align-items: center;
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 0.9rem;
                    color: #374151;
                    transition: background-color 0.2s;
                `;
                optionBtn.innerHTML = `
                    <span style="font-size: 16px; margin-right: 0.75rem;">${option.icon}</span>
                    <span>${option.label}</span>
                `;
                
                optionBtn.addEventListener('mouseenter', () => {
                    optionBtn.style.backgroundColor = '#f3f4f6';
                });
                
                optionBtn.addEventListener('mouseleave', () => {
                    optionBtn.style.backgroundColor = 'transparent';
                });
                
                optionBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    option.action();
                    dropdown.remove();
                });
                
                dropdown.appendChild(optionBtn);
            }
        });

        // Position the dropdown relative to the more button
        const moreButton = event.target.closest('.action-btn');
        moreButton.style.position = 'relative';
        moreButton.appendChild(dropdown);

        // Close dropdown when clicking outside
        const closeDropdown = (e) => {
            if (!dropdown.contains(e.target) && !moreButton.contains(e.target)) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', closeDropdown);
        }, 0);
    }

    showLoginModal(tab = 'login') {
        // Redirect to index.html for login since it has the complete modal
        window.location.href = 'index.html';
    }
}

// Initialize the feed page when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    console.log('🎯 DOMContentLoaded event fired');
    
    // Initialize payment processor
    if (typeof StripeVercelBackend !== "undefined") {
        window.paymentProcessor = new StripeVercelBackend();
        console.log('✅ Payment processor initialized');
    } else {
        console.error("❌ StripeVercelBackend not loaded");
    }

    // Initialize the feed page
    console.log('🎯 Creating FeedPage instance');
    window.feedPage = new FeedPage();
    console.log('✅ FeedPage instance created');
}); 