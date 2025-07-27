/* global db, auth, firebase, storage */
// Feed Page JavaScript
class FeedPage {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.posts = [];
        this.lastPost = null;
        this.isLoading = false;
        this.noMorePosts = false;
        this.currentFilter = 'all';
        this.bookmarkedPosts = new Set();
        
        this.init();
    }

    async init() {
        // Setup global error handling
        if (window.ErrorUtils) {
            window.ErrorUtils.setupGlobalErrorHandler();
        }
        
        await this.setupAuthStateListener();
        this.setupEventListeners();
        this.initializeAdMob();
        
        // Initialize PWA features
        this.initializePWAFeatures();
        
        // Add fallback to show sample posts if loadPosts fails
        try {
            await this.loadPosts();
        } catch (error) {
            console.error('Failed to load posts, showing sample posts:', error);
            this.showSamplePosts();
        }
        
        this.loadBookmarks();
        this.initializeNotifications();
        this.startNewPostsBannerSimulation(); // Start banner simulation
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
        const userMenu = document.getElementById('userMenu');
        const notificationBtn = document.getElementById('notificationBtn');
        
        if (userMenu) userMenu.style.display = 'none';
        // Keep notification button visible even when not authenticated
        if (notificationBtn) {
            notificationBtn.style.display = 'block';
        }
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
        console.log('loadPosts called');
        if (this.isLoading) {
            console.log('Already loading, returning');
            return;
        }
        
        this.isLoading = true;
        const loadingElement = document.getElementById('feedLoading');
        if (loadingElement) loadingElement.style.display = 'block';

        console.log('Starting to load posts from Firestore...');

        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Load posts timeout')), 3000); // Reduced timeout to 3 seconds
        });

        try {
            let query = db.collection('posts').orderBy('createdAt', 'desc').limit(10);
            
            if (this.lastPost) {
                query = query.startAfter(this.lastPost);
            }

            console.log('Executing Firestore query...');

            // Race between the query and timeout
            const snapshot = await Promise.race([
                query.get(),
                timeoutPromise
            ]);
            
            console.log('Query completed, snapshot empty:', snapshot.empty);
            
            if (snapshot.empty && this.posts.length === 0) {
                console.log('No posts found, showing sample posts');
                // Show sample posts if no real posts exist
                this.showSamplePosts();
                if (loadingElement) loadingElement.style.display = 'none';
                this.isLoading = false;
                return;
            }

            if (snapshot.empty) {
                console.log('No more posts to load');
                this.noMorePosts = true;
                if (loadingElement) loadingElement.style.display = 'none';
                this.isLoading = false;
                return;
            }

            const newPosts = [];
            snapshot.forEach(doc => {
                newPosts.push({ id: doc.id, ...doc.data() });
            });

            console.log('Loaded', newPosts.length, 'new posts');

            this.posts = [...this.posts, ...newPosts];
            this.lastPost = snapshot.docs[snapshot.docs.length - 1];
            
            this.renderPosts(newPosts);
            
        } catch (error) {
            console.error('Error loading posts:', error);
            // Show sample posts on error
            this.showSamplePosts();
        } finally {
            this.isLoading = false;
            if (loadingElement) loadingElement.style.display = 'none';
        }
    }

    showSamplePosts() {
        console.log('showSamplePosts called');
        const samplePosts = [
            {
                id: 'sample1',
                title: 'Welcome to Amplifi! 🎉',
                description: 'This is your first post on Amplifi. Start sharing your amazing content with the world! #Welcome #Amplifi #NewBeginnings',
                mediaUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop',
                mediaType: 'image',
                authorName: 'Amplifi Team',
                authorUsername: 'amplifi',
                authorPic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
                likes: 42,
                comments: 8,
                createdAt: new Date(Date.now() - 3600000), // 1 hour ago
                liked: false
            },
            {
                id: 'sample2',
                title: '🌟 Daily Inspiration',
                description: '"The only way to do great work is to love what you do." - Steve Jobs\n\nRemember, passion is the fuel that drives innovation. What are you passionate about today? #Inspiration #Motivation #Success',
                mediaUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
                mediaType: 'image',
                authorName: 'Creative Soul', // Using alias instead of real name
                authorUsername: 'sarahj',
                authorPic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face',
                likes: 156,
                comments: 23,
                createdAt: new Date(Date.now() - 7200000), // 2 hours ago
                liked: false
            },
            {
                id: 'sample3',
                title: '💻 Tech Tip Tuesday',
                description: 'Did you know? Keyboard shortcuts can save you hours every week! Here are my favorites:\n\n⌘+C/V: Copy/Paste\n⌘+Z: Undo\n⌘+Shift+4: Screenshot\n⌘+Space: Spotlight Search\n\nWhat\'s your favorite shortcut? #TechTips #Productivity #KeyboardShortcuts',
                mediaUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
                mediaType: 'image',
                authorName: 'Tech Guru', // Using alias
                authorUsername: 'mikechen',
                authorPic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
                likes: 89,
                comments: 15,
                createdAt: new Date(Date.now() - 10800000), // 3 hours ago
                liked: false
            },
            {
                id: 'sample4',
                title: '🍳 Cooking Adventure',
                description: 'Tried making homemade pasta today! It was a messy but fun experience. The result was absolutely delicious! 🍝\n\nPro tip: Fresh pasta cooks in just 2-3 minutes vs 8-10 for dried pasta. Worth the effort! #Cooking #Homemade #Pasta #Foodie',
                mediaUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop',
                mediaType: 'image',
                authorName: 'Kitchen Explorer', // Using alias
                authorUsername: 'emilycooks',
                authorPic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
                likes: 203,
                comments: 31,
                createdAt: new Date(Date.now() - 14400000), // 4 hours ago
                liked: false
            },
            {
                id: 'sample5',
                title: '🌍 Travel Diaries',
                description: 'Just arrived in Tokyo! The energy here is incredible. First stop: Shibuya crossing at night. The neon lights and crowds are absolutely mesmerizing! 🇯🇵\n\nCan\'t wait to explore more of this amazing city. Any recommendations for must-visit spots? #Tokyo #Travel #Japan #Shibuya',
                mediaUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
                mediaType: 'image',
                authorName: 'Wanderlust', // Using alias
                authorUsername: 'alexwander',
                authorPic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face',
                likes: 312,
                comments: 45,
                createdAt: new Date(Date.now() - 18000000), // 5 hours ago
                liked: false
            },
            {
                id: 'sample6',
                title: '💪 Fitness Journey',
                description: 'Week 8 of my fitness journey! Today\'s workout was intense but so rewarding. Remember, progress isn\'t always linear, but consistency is key! 💪\n\nWhat\'s your favorite workout routine? #Fitness #Motivation #Health #Workout',
                mediaUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
                mediaType: 'image',
                authorName: 'Fitness Enthusiast', // Using alias
                authorUsername: 'jamesfit',
                authorPic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
                likes: 178,
                comments: 28,
                createdAt: new Date(Date.now() - 21600000), // 6 hours ago
                liked: false
            }
        ];

        console.log('Rendering', samplePosts.length, 'sample posts');
        this.renderPosts(samplePosts);
        
        // Hide loading indicator
        const loadingElement = document.getElementById('feedLoading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    renderPosts(posts) {
        const postsContainer = document.getElementById('feedPosts');
        if (!postsContainer) return;

        posts.forEach(post => {
            const postElement = this.createPostElement(post);
            postsContainer.appendChild(postElement);
        });
    }

    createPostElement(post) {
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
                const img = document.createElement('img');
                img.src = post.mediaUrl;
                img.alt = 'Post image';
                img.onerror = () => img.style.display = 'none';
                mediaDiv.appendChild(img);
            }
            postDiv.appendChild(mediaDiv);
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
        channelDiv.innerHTML = `<img src='${post.authorPic || 'default-avatar.svg'}' alt='Channel' class='post-author-pic' style='width:22px;height:22px;margin-right:0.4em;'> <span class='post-channel-name'>${post.authorName || 'Anonymous'}</span>`;
        metaDiv.appendChild(channelDiv);
        infoDiv.appendChild(metaDiv);

        // Caption (short description)
        if (post.description) {
            const caption = document.createElement('p');
            caption.className = 'post-caption';
            caption.textContent = post.description;
            infoDiv.appendChild(caption);
        }

        // Actions row (like, comment, share, bookmark, tip)
        const actionRow = document.createElement('div');
        actionRow.className = 'post-actions';
        actionRow.style.display = 'flex';
        actionRow.style.alignItems = 'center';
        actionRow.style.gap = '1.5rem';
        actionRow.style.marginTop = '1rem';
        actionRow.style.padding = '0.5rem 0';

        // Helper to create action button with icon only
        function createActionBtn({className, title, innerHTML, onClick, isPrimary = false, accentColor = '#64748b', iconSize = 24}) {
            const btn = document.createElement('button');
            btn.className = `action-btn ${className || ''} ${isPrimary ? 'primary-action' : ''}`;
            btn.setAttribute('title', title);
            btn.setAttribute('aria-label', title);
            btn.innerHTML = innerHTML;
            btn.onclick = onClick;
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';
            btn.style.background = 'none';
            btn.style.border = 'none';
            btn.style.cursor = 'pointer';
            btn.style.padding = '0.5rem';
            btn.style.fontSize = '0.98rem';
            btn.style.color = accentColor;
            btn.style.borderRadius = '50%';
            btn.style.transition = 'all 0.2s ease';
            btn.style.minWidth = '40px';
            btn.style.height = '40px';
            btn.style.position = 'relative';
            return btn;
        }

        // Like - Primary action
        const likeBtn = createActionBtn({
            className: post.userReaction === 'like' ? 'active' : '',
            title: 'Like',
            isPrimary: true,
            accentColor: '#ef4444',
            iconSize: 24,
            innerHTML: `<svg width='24' height='24' viewBox='0 0 24 24' fill='${post.userReaction === 'like' ? '#ef4444' : 'none'}' stroke='#ef4444' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M20.8 4.6c-1.5-1.5-4-1.5-5.5 0l-.8.8-.8-.8c-1.5-1.5-4-1.5-5.5 0-1.5 1.5-1.5 4 0 5.5l6.3 6.3 6.3-6.3c1.5-1.5 1.5-4 0-5.5z'/></svg>`,
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
            iconSize: 24,
            innerHTML: `<svg width='24' height='24' fill='none' stroke='#64748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24'><path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'/></svg>`,
            onClick: (e) => {
                e.stopPropagation();
                this.showComments(post.id);
            }
        });
        actionRow.appendChild(commentsBtn);

        // Share - Standard action
        const shareBtn = createActionBtn({
            title: 'Share',
            accentColor: '#64748b',
            iconSize: 24,
            innerHTML: `<svg width='24' height='24' fill='none' stroke='#64748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24'><circle cx='18' cy='5' r='3'/><circle cx='6' cy='12' r='3'/><circle cx='18' cy='19' r='3'/><path d='M8.59 13.51l6.83 3.98'/><path d='M15.41 6.51l-6.82 3.98'/></svg>`,
            onClick: (e) => {
                e.stopPropagation();
                this.sharePost(post.id);
            }
        });
        actionRow.appendChild(shareBtn);

        // Bookmark - Utility action
        const bookmarkBtn = createActionBtn({
            className: this.bookmarkedPosts.has(post.id) ? 'bookmarked' : '',
            title: 'Save',
            accentColor: '#f59e42',
            iconSize: 24,
            innerHTML: `<svg width='24' height='24' fill='${this.bookmarkedPosts.has(post.id) ? '#f59e42' : 'none'}' stroke='#f59e42' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24'><path d='M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z'/></svg>`,
            onClick: (e) => {
                e.stopPropagation();
                this.toggleBookmark(post.id);
            }
        });
        actionRow.appendChild(bookmarkBtn);

        // Tip - Special action
        const tipBtn = createActionBtn({
            title: 'Tip',
            accentColor: '#10b981',
            iconSize: 24,
            innerHTML: `<span style="font-size: 24px; line-height: 1;">💰</span>`,
            onClick: (e) => {
                e.stopPropagation();
                this.showTipModal(post.authorId, post.authorName);
            }
        });
        actionRow.appendChild(tipBtn);

        infoDiv.appendChild(actionRow);

        postDiv.appendChild(infoDiv);
        return postDiv;
    }

    showPostDetails(post) {
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
            <img src="${post.authorPic || 'default-avatar.svg'}" alt="Author" style="width:40px;height:40px;border-radius:50%;margin-right:10px;">
            <div>
                <div style="font-weight:bold;">${post.authorName || 'Anonymous'}</div>
                <div style="color:#666;font-size:14px;">${this.formatTimestamp(post.createdAt)}</div>
            </div>
        `;

        // Title
        const title = document.createElement('h2');
        title.textContent = post.title || '';
        title.style.marginBottom = '15px';

        // Media
        let mediaElement = null;
        if (post.mediaUrl && post.mediaUrl.trim() !== '') {
            if (post.mediaType === 'video') {
                mediaElement = document.createElement('video');
                mediaElement.src = post.mediaUrl;
                mediaElement.controls = true;
                mediaElement.style.width = '100%';
                mediaElement.style.borderRadius = '8px';
                mediaElement.style.marginBottom = '15px';
            } else {
                mediaElement = document.createElement('img');
                mediaElement.src = post.mediaUrl;
                mediaElement.alt = 'Post image';
                mediaElement.style.width = '100%';
                mediaElement.style.borderRadius = '8px';
                mediaElement.style.marginBottom = '15px';
            }
        }

        // Description
        const description = document.createElement('p');
        description.textContent = post.description || '';
        description.style.lineHeight = '1.6';
        description.style.marginBottom = '15px';

        // Stats
        const statsDiv = document.createElement('div');
        statsDiv.style.display = 'flex';
        statsDiv.style.gap = '20px';
        statsDiv.style.color = '#666';
        statsDiv.style.fontSize = '14px';
        statsDiv.innerHTML = `
            <span>👁️ ${post.views || Math.floor(Math.random()*10000+100)} views</span>
            <span>❤️ ${post.reactions?.like || post.likes || 0} likes</span>
            <span>💬 ${post.comments || 0} comments</span>
        `;

        // AI Generated badge
        if (post.isAIGenerated) {
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
            }
        } catch (error) {
            console.error('Error toggling reaction:', error);
        }
    }

    updateReactionUI(postId, reactionType, isActive) {
        const reactionBtn = document.querySelector(`[onclick="feedPage.toggleReaction('${postId}', '${reactionType}')"]`);
        if (reactionBtn) {
            if (isActive) {
                reactionBtn.classList.add('active');
            } else {
                reactionBtn.classList.remove('active');
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
        
        if (modal && postInfo) {
            modal.style.display = 'block';
            postInfo.textContent = 'Loading comments...';
            
            await this.loadComments(postId);
        }
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    updatePostCommentCount(postId) {
        // Find the post element and update its comment count
        const postElement = document.querySelector(`[data-post-id="${postId}"]`);
        if (postElement) {
            const commentBtn = postElement.querySelector('.action-btn');
            if (commentBtn) {
                const currentCount = parseInt(commentBtn.querySelector('span').textContent) || 0;
                commentBtn.querySelector('span').textContent = currentCount + 1;
            }
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
                        img.src = comment.authorPic || 'default-avatar.svg';
                        img.alt = 'User';
                        img.className = 'comment-user-pic';
                        
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
            this.setupCommentForm(postId);
        }
    }

    setupCommentForm(postId) {
        const commentForm = document.getElementById('commentForm');
        const commentText = document.getElementById('commentText');
        
        if (commentForm) {
            commentForm.onsubmit = async (e) => {
                e.preventDefault();
                await this.postComment(postId, commentText.value);
                commentText.value = '';
            };
        }
    }

    async postComment(postId, text) {
        if (!this.currentUser || !text.trim()) return;

        const submitBtn = document.getElementById('commentSubmitBtn');
        const originalText = submitBtn ? submitBtn.textContent : 'Post Comment';
        
        try {
            // Show loading state
            if (submitBtn) {
                submitBtn.textContent = 'Posting...';
                submitBtn.disabled = true;
            }

            const commentData = {
                postId: postId,
                authorId: this.currentUser.uid,
                authorName: this.userProfile?.displayName || 'Anonymous',
                authorPic: this.userProfile?.profilePic || '',
                text: text.trim(),
                createdAt: new Date()
            };

            await db.collection('comments').add(commentData);
            
            // Update post comment count
            await db.collection('posts').doc(postId).update({
                comments: firebase.firestore.FieldValue.increment(1)
            });

            // Reload comments
            await this.loadComments(postId);
            
            // Update the post's comment count in the UI
            this.updatePostCommentCount(postId);
            
        } catch (error) {
            console.error('Error posting comment:', error);
            alert('Failed to post comment. Please try again.');
        } finally {
            // Reset button state
            if (submitBtn) {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
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
            tipAmounts.forEach(btn => btn.classList.remove('selected'));

            tipAmounts.forEach(btn => {
                btn.addEventListener('click', () => {
                    tipAmounts.forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
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
                authorPic: this.userProfile?.profilePic || 'default-avatar.svg',
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

    // Enhanced like functionality with PWA integration
    async toggleReaction(postId, reactionType) {
        try {
            const post = this.posts.find(p => p.id === postId);
            if (!post) return;

            const likeData = {
                postId: postId,
                likerName: this.userProfile?.displayName || 'Anonymous',
                likerId: this.currentUser?.uid,
                timestamp: new Date()
            };

            // Update UI immediately
            this.updateReactionUI(postId, reactionType, !post.liked);

            // Trigger PWA event
            document.dispatchEvent(new CustomEvent('newLike', {
                detail: likeData
            }));

            // Store locally
            this.storeLikeLocally(likeData);

        } catch (error) {
            console.error('Error toggling reaction:', error);
        }
    }

    storeLikeLocally(likeData) {
        const localLikes = JSON.parse(localStorage.getItem('amplifi_local_likes') || '[]');
        localLikes.push(likeData);
        localStorage.setItem('amplifi_local_likes', JSON.stringify(localLikes.slice(-100))); // Keep last 100 likes
    }

    // Enhanced comment functionality with PWA integration
    async postComment(postId, text) {
        try {
            const commentData = {
                postId: postId,
                commenterName: this.userProfile?.displayName || 'Anonymous',
                commenterId: this.currentUser?.uid,
                text: text,
                timestamp: new Date()
            };

            // Add comment locally
            this.addCommentLocally(postId, commentData);

            // Trigger PWA event
            document.dispatchEvent(new CustomEvent('newComment', {
                detail: commentData
            }));

            // Update comment count
            this.updatePostCommentCount(postId);

            return commentData;
        } catch (error) {
            console.error('Error posting comment:', error);
            throw error;
        }
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

    // YouTube-like Notification System
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
                <img src="${notification.senderPic || 'default-avatar.svg'}" alt="User" class="notification-avatar">
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
}

// Initialize payment processor
window.paymentProcessor = new StripeFrontendOnly();

// Initialize the feed page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.feedPage = new FeedPage();
}); 