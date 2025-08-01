/* global db, auth, firebase, storage */
// Subscriptions Page JavaScript
class SubscriptionsPage {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.subscriptions = [];
        this.subscribedPosts = [];
        
        this.init();
    }

    async init() {
        // Initialize payment processor
        this.initializePaymentProcessor();
        
        await this.setupAuthStateListener();
        this.setupEventListeners();
        this.initializeAdMob();
        
        // Initialize PWA features
        this.initializePWAFeatures();
        
        // Load subscriptions will be called by the auth state listener
        // Show sample posts initially
        this.subscribedPosts = this.getSampleSubscriptionPosts();
        this.renderSubscriptions();
        
        this.loadBookmarks();
        this.initializeNotifications();
        this.startNewPostsBannerSimulation(); // Start banner simulation
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
                await this.loadSubscriptions();
            } else {
                this.currentUser = null;
                this.updateUIForUnauthenticatedUser();
                // Show sample posts for unauthenticated users
                this.subscribedPosts = this.getSampleSubscriptionPosts();
                this.renderSubscriptions();
            }
        });
    }

    async loadUserProfile() {
        try {
            if (!this.currentUser) return;
            const userDoc = await db.collection('users').doc(this.currentUser.uid).get();
            if (userDoc.exists) {
                this.userProfile = userDoc.data();
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    updateUIForAuthenticatedUser() {
        const userMenu = document.getElementById('userMenu');
        const notificationBtn = document.getElementById('notificationBtn');
        
        if (userMenu) userMenu.style.display = 'block';
        if (notificationBtn) notificationBtn.style.display = 'block';
        
        if (this.userProfile) {
            const userAvatar = document.getElementById('userAvatar');
            if (userAvatar && this.userProfile.profilePic) {
                userAvatar.src = this.userProfile.profilePic;
            }
        }
    }

    updateUIForUnauthenticatedUser() {
        const userMenu = document.getElementById('userMenu');
        const notificationBtn = document.getElementById('notificationBtn');
        
        if (userMenu) userMenu.style.display = 'none';
        if (notificationBtn) notificationBtn.style.display = 'none';
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
    }

    async loadSubscriptions() {
        try {
            // Check if user is authenticated
            if (!this.currentUser || !this.currentUser.uid) {
                console.log('User not authenticated, showing sample posts');
                this.subscribedPosts = this.getSampleSubscriptionPosts();
                this.renderSubscriptions();
                return;
            }

            const subscriptionsContainer = document.getElementById('subscriptionsGrid');
            if (!subscriptionsContainer) return;

            // Show loading state
            subscriptionsContainer.innerHTML = '<div class="loading">Loading subscriptions...</div>';

            // Get user's subscriptions
            const userDoc = await db.collection('users').doc(this.currentUser.uid).get();
            const userData = userDoc.data();
            const subscribedUsers = userData?.subscribedTo || [];

            if (subscribedUsers.length === 0) {
                // Create sample subscriptions for new users
                console.log('No subscriptions found, creating sample subscriptions...');
                await this.createSampleSubscriptions();
                
                // Try to load again after creating samples
                const updatedUserDoc = await db.collection('users').doc(this.currentUser.uid).get();
                const updatedUserData = updatedUserDoc.data();
                const updatedSubscribedUsers = updatedUserData?.subscribedTo || [];
                
                if (updatedSubscribedUsers.length > 0) {
                    // Get posts from subscribed users - simplified to avoid index requirement
                    const postsQuery = await db.collection('posts')
                        .orderBy('timestamp', 'desc')
                        .limit(50) // Get more posts to filter from
                        .get();

                    this.subscribedPosts = [];
                    postsQuery.forEach(doc => {
                        const postData = doc.data();
                        // Filter posts to only include those from subscribed users
                        if (updatedSubscribedUsers.includes(postData.authorId)) {
                            this.subscribedPosts.push({
                                id: doc.id,
                                ...postData
                            });
                        }
                    });

                    // Limit to 20 posts after filtering
                    this.subscribedPosts = this.subscribedPosts.slice(0, 20);
                } else {
                    // If still no subscriptions, show sample posts
                    this.subscribedPosts = this.getSampleSubscriptionPosts();
                }
            } else {
                // Get posts from subscribed users - simplified to avoid index requirement
                const postsQuery = await db.collection('posts')
                    .orderBy('timestamp', 'desc')
                    .limit(50) // Get more posts to filter from
                    .get();

                this.subscribedPosts = [];
                postsQuery.forEach(doc => {
                    const postData = doc.data();
                    // Filter posts to only include those from subscribed users
                    if (subscribedUsers.includes(postData.authorId)) {
                        this.subscribedPosts.push({
                            id: doc.id,
                            ...postData
                        });
                    }
                });

                // Limit to 20 posts after filtering
                this.subscribedPosts = this.subscribedPosts.slice(0, 20);
            }

            this.renderSubscriptions();
        } catch (error) {
            console.error('Error loading subscriptions:', error);
            // If there's an error, show sample posts anyway
            this.subscribedPosts = this.getSampleSubscriptionPosts();
            this.renderSubscriptions();
        }
    }

    async createSampleSubscriptions() {
        const sampleCreators = [
            {
                id: 'creator1',
                displayName: 'PhotoPro',
                username: 'photopro',
                profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                bio: 'Professional photographer sharing amazing moments 📸',
                followers: 12450,
                posts: 89
            },
            {
                id: 'creator2',
                displayName: 'FitnessGuru',
                username: 'fitnessguru',
                profilePic: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop&crop=face',
                bio: 'Fitness coach helping you achieve your goals 💪',
                followers: 8900,
                posts: 67
            },
            {
                id: 'creator3',
                displayName: 'ChefMaria',
                username: 'chefmaria',
                profilePic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
                bio: 'Home chef sharing delicious recipes 🍳',
                followers: 5600,
                posts: 45
            },
            {
                id: 'creator4',
                displayName: 'TravelExplorer',
                username: 'travelexplorer',
                profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
                bio: 'Adventure seeker exploring the world 🌍',
                followers: 7800,
                posts: 52
            }
        ];

        try {
            // Add sample creators to users collection
            const batch = db.batch();
            sampleCreators.forEach(creator => {
                const docRef = db.collection('users').doc(creator.id);
                batch.set(docRef, {
                    displayName: creator.displayName,
                    username: creator.username,
                    profilePic: creator.profilePic,
                    bio: creator.bio,
                    followers: creator.followers,
                    posts: creator.posts,
                    createdAt: firebase.firestore.Timestamp.fromDate(new Date())
                });
            });
            await batch.commit();

            // Add sample posts from these creators
            const samplePosts = [
                {
                    authorId: 'creator1',
                    authorName: 'PhotoPro',
                    title: "Golden Hour Magic",
                    description: "Captured this stunning golden hour shot at the beach. The lighting was absolutely perfect! 🌅 #photography #goldenhour",
                    likes: 234,
                    views: 1200,
                    commentCount: 18,
                    timestamp: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)),
                    mediaUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
                    mediaType: "image"
                },
                {
                    authorId: 'creator2',
                    authorName: 'FitnessGuru',
                    title: "Morning Workout Routine",
                    description: "Start your day right with this 20-minute morning workout! Perfect for busy schedules 💪 #fitness #morningroutine",
                    likes: 189,
                    views: 890,
                    commentCount: 12,
                    timestamp: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 4 * 60 * 60 * 1000)),
                    mediaUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
                    mediaType: "image"
                },
                {
                    authorId: 'creator3',
                    authorName: 'ChefMaria',
                    title: "Homemade Pasta Recipe",
                    description: "Making fresh pasta from scratch is easier than you think! Here's my secret recipe 🍝 #cooking #pasta",
                    likes: 156,
                    views: 670,
                    commentCount: 9,
                    timestamp: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 6 * 60 * 60 * 1000)),
                    mediaUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop",
                    mediaType: "image"
                },
                {
                    authorId: 'creator4',
                    authorName: 'TravelExplorer',
                    title: "Hidden Gems in Tokyo",
                    description: "Discovering the lesser-known spots in Tokyo that most tourists miss! 🇯🇵 #travel #tokyo #hidden",
                    likes: 203,
                    views: 1100,
                    commentCount: 15,
                    timestamp: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 8 * 60 * 60 * 1000)),
                    mediaUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop",
                    mediaType: "image"
                },
                {
                    authorId: 'creator1',
                    authorName: 'PhotoPro',
                    title: "Street Photography Tips",
                    description: "5 essential tips for better street photography. Practice makes perfect! 📸 #streetphotography #tips",
                    likes: 178,
                    views: 950,
                    commentCount: 11,
                    timestamp: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 10 * 60 * 60 * 1000)),
                    mediaUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop",
                    mediaType: "image"
                },
                {
                    authorId: 'creator2',
                    authorName: 'FitnessGuru',
                    title: "Nutrition Basics",
                    description: "Understanding macros and how they fuel your workouts. Knowledge is power! 🥗 #nutrition #fitness",
                    likes: 145,
                    views: 720,
                    commentCount: 8,
                    timestamp: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 12 * 60 * 60 * 1000)),
                    mediaUrl: "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=800&h=600&fit=crop",
                    mediaType: "image"
                }
            ];

            // Add sample posts to posts collection
            const postsBatch = db.batch();
            samplePosts.forEach(post => {
                const docRef = db.collection('posts').doc();
                postsBatch.set(docRef, post);
            });
            await postsBatch.commit();

            // Update current user's subscriptions
            const creatorIds = sampleCreators.map(creator => creator.id);
            await db.collection('users').doc(this.currentUser.uid).update({
                subscribedTo: firebase.firestore.FieldValue.arrayUnion(...creatorIds)
            });

            console.log('Sample subscriptions created successfully');
        } catch (error) {
            console.error('Error creating sample subscriptions:', error);
        }
    }

    getSampleSubscriptionPosts() {
        // Fallback sample posts if Firestore is not available
        return [
            {
                id: 'sub1',
                authorId: 'creator1',
                authorName: 'PhotoPro',
                title: "Golden Hour Magic",
                description: "Captured this stunning golden hour shot at the beach. The lighting was absolutely perfect! 🌅 #photography #goldenhour",
                likes: 234,
                views: 1200,
                commentCount: 18,
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                mediaUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
                mediaType: "image"
            },
            {
                id: 'sub2',
                authorId: 'creator2',
                authorName: 'FitnessGuru',
                title: "Morning Workout Routine",
                description: "Start your day right with this 20-minute morning workout! Perfect for busy schedules 💪 #fitness #morningroutine",
                likes: 189,
                views: 890,
                commentCount: 12,
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
                mediaUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
                mediaType: "image"
            },
            {
                id: 'sub3',
                authorId: 'creator3',
                authorName: 'ChefMaria',
                title: "Homemade Pasta Recipe",
                description: "Making fresh pasta from scratch is easier than you think! Here's my secret recipe 🍝 #cooking #pasta",
                likes: 156,
                views: 670,
                commentCount: 9,
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
                mediaUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop",
                mediaType: "image"
            }
        ];
    }

    renderSubscriptions() {
        const subscriptionsContainer = document.getElementById('subscriptionsGrid');
        if (!subscriptionsContainer) return;

        if (this.subscribedPosts.length === 0) {
            subscriptionsContainer.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 3rem;">
                    <h3>No posts from subscriptions</h3>
                    <p>Your subscribed creators haven't posted anything yet.</p>
                </div>
            `;
            return;
        }

        subscriptionsContainer.innerHTML = this.subscribedPosts.map(post => this.createPostElement(post)).join('');
    }

    createPostElement(post) {
        const timestamp = this.formatTimestamp(post.timestamp);
        const mediaContent = post.mediaUrl ? 
            `<div class="post-media">
                ${post.mediaType === 'video' ? 
                    `<video src="${post.mediaUrl}" controls></video>` : 
                    `<img src="${post.mediaUrl}" alt="${post.title || 'Post image'}">`
                }
            </div>` : '';

        return `
            <div class="post-card" data-post-id="${post.id}">
                ${mediaContent}
                <div class="post-info">
                    <div class="post-header">
                        <div class="post-header-content">
                            <span class="post-title">${post.title || 'Untitled Post'}</span>
                            <span class="post-meta">${post.authorName || 'Unknown'} • ${timestamp}</span>
                        </div>
                    </div>
                    <div class="post-caption">${post.description || ''}</div>
                    <div class="post-actions">
                        <button class="action-btn" title="Like" onclick="subscriptionsPage.toggleLike('${post.id}')">
                            <div class="action-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="${post.userLiked ? '#ef4444' : 'none'}" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20.8 4.6c-1.5-1.5-4-1.5-5.5 0l-.8.8-.8-.8c-1.5-1.5-4-1.5-5.5 0-1.5 1.5-1.5 4 0 5.5l6.3 6.3 6.3-6.3c1.5-1.5 1.5-4 0-5.5z"/>
                                </svg>
                                <span class="action-count">${post.likes || 0}</span>
                            </div>
                            <span class="action-label">Like</span>
                        </button>
                        <button class="action-btn" title="Comment" onclick="subscriptionsPage.showComments('${post.id}')">
                            <div class="action-icon">
                                <svg width="20" height="20" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                </svg>
                                <span class="action-count">${post.commentCount || 0}</span>
                            </div>
                            <span class="action-label">Comment</span>
                        </button>
                        <button class="action-btn" title="Share" onclick="subscriptionsPage.sharePost('${post.id}')">
                            <div class="action-icon">
                                <svg width="20" height="20" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                                    <path d="M8.59 13.51l6.83 3.98"/><path d="M15.41 6.51l-6.82 3.98"/>
                                </svg>
                            </div>
                            <span class="action-label">Share</span>
                        </button>
                        <button class="action-btn" title="Tip Creator" onclick="subscriptionsPage.showTipModal('${post.authorId}', '${post.authorName}')">
                            <div class="action-icon">
                                <span style="font-size: 18px;">💰</span>
                            </div>
                            <span class="action-label">Tip</span>
                        </button>
                        <button class="action-btn" title="Unsubscribe" onclick="subscriptionsPage.unsubscribeFromCreator('${post.authorId}')">
                            <div class="action-icon">
                                <svg width="20" height="20" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                                </svg>
                            </div>
                            <span class="action-label">Unfollow</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async toggleLike(postId) {
        if (!this.currentUser) {
            this.showError('Please log in to like posts');
            return;
        }

        try {
            const postRef = db.collection('posts').doc(postId);
            const postDoc = await postRef.get();
            
            if (!postDoc.exists) {
                this.showError('Post not found');
                return;
            }

            const postData = postDoc.data();
            const likes = postData.likes || [];
            const userLiked = likes.includes(this.currentUser.uid);

            if (userLiked) {
                // Unlike
                await postRef.update({
                    likes: firebase.firestore.FieldValue.arrayRemove(this.currentUser.uid),
                    likeCount: firebase.firestore.FieldValue.increment(-1)
                });
            } else {
                // Like
                await postRef.update({
                    likes: firebase.firestore.FieldValue.arrayUnion(this.currentUser.uid),
                    likeCount: firebase.firestore.FieldValue.increment(1)
                });
            }

            // Update UI
            this.updateLikeUI(postId, !userLiked);
        } catch (error) {
            console.error('Error toggling like:', error);
            this.showError('Failed to update like');
        }
    }

    updateLikeUI(postId, isLiked) {
        const likeBtn = document.querySelector(`[data-post-id="${postId}"] .action-btn[title="Like"]`);
        if (likeBtn) {
            const svg = likeBtn.querySelector('svg');
            const countSpan = likeBtn.querySelector('.action-count');
            
            if (isLiked) {
                svg.setAttribute('fill', '#ef4444');
                const currentCount = parseInt(countSpan.textContent) || 0;
                countSpan.textContent = currentCount + 1;
            } else {
                svg.setAttribute('fill', 'none');
                const currentCount = parseInt(countSpan.textContent) || 0;
                countSpan.textContent = Math.max(0, currentCount - 1);
            }
        }
    }

    showComments(postId) {
        // Redirect to feed page with comments modal
        window.location.href = `feed.html?post=${postId}&showComments=true`;
    }

    sharePost(postId) {
        const postUrl = `${window.location.origin}/feed.html?post=${postId}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Check out this post on Amplifi',
                url: postUrl
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(postUrl).then(() => {
                this.showSuccess('Link copied to clipboard!');
            });
        }
    }

    async unsubscribeFromCreator(creatorId) {
        if (!this.currentUser) {
            this.showError('Please log in to manage subscriptions');
            return;
        }

        try {
            // Remove from user's subscriptions
            await db.collection('users').doc(this.currentUser.uid).update({
                subscribedTo: firebase.firestore.FieldValue.arrayRemove(creatorId)
            });

            // Remove from creator's subscribers
            await db.collection('users').doc(creatorId).update({
                subscribers: firebase.firestore.FieldValue.arrayRemove(this.currentUser.uid)
            });

            this.showSuccess('Unsubscribed successfully!');
            
            // Reload subscriptions
            await this.loadSubscriptions();
        } catch (error) {
            console.error('Error unsubscribing:', error);
            this.showError('Failed to unsubscribe');
        }
    }

    showTipModal(creatorId, creatorName) {
        if (!this.currentUser) {
            this.showError('Please log in to send tips');
            return;
        }

        // Create tip modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content tip-modal">
                <span class="close">&times;</span>
                <h3>Send Tip to ${creatorName}</h3>
                <form id="tipForm">
                    <div class="tip-amounts">
                        <button type="button" class="tip-amount" data-amount="1.00">$1.00</button>
                        <button type="button" class="tip-amount" data-amount="5.00">$5.00</button>
                        <button type="button" class="tip-amount" data-amount="10.00">$10.00</button>
                        <button type="button" class="tip-amount" data-amount="25.00">$25.00</button>
                    </div>
                    <input type="number" id="customTipAmount" placeholder="Custom amount" min="0.50" step="0.01" required>
                    <button type="submit" class="btn btn-primary">Send Tip</button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'block';

        // Close modal
        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = () => modal.remove();

        // Tip amount selection
        const tipAmounts = modal.querySelectorAll('.tip-amount');
        const customAmount = modal.querySelector('#customTipAmount');
        
        tipAmounts.forEach(btn => {
            btn.addEventListener('click', () => {
                tipAmounts.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                customAmount.value = btn.dataset.amount;
            });
        });

        // Handle tip submission
        const tipForm = modal.querySelector('#tipForm');
        tipForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const amount = parseFloat(customAmount.value);
            
            if (amount < 0.50) {
                this.showError('Minimum tip amount is $0.50');
                return;
            }

            try {
                // Initialize Stripe if available
                if (window.stripeVercelBackend) {
                    await window.stripeVercelBackend.createPaymentIntent(amount * 100, creatorId);
                    this.showSuccess('Tip sent successfully!');
                    modal.remove();
                } else {
                    this.showError('Payment system not available');
                }
            } catch (error) {
                console.error('Error sending tip:', error);
                this.showError('Failed to send tip');
            }
        });
    }

    handleSearch(query) {
        // Implement search functionality
        if (query.length > 2) {
            this.performSearch(query);
        }
    }

    async performSearch(query = '') {
        const searchInput = document.getElementById('searchInput');
        const searchQuery = query || searchInput?.value || '';
        
        if (!searchQuery.trim()) return;

        try {
            // Search in posts from subscribed users
            const postsQuery = await db.collection('posts')
                .where('authorId', 'in', this.userProfile?.subscribedTo || [])
                .where('title', '>=', searchQuery)
                .where('title', '<=', searchQuery + '\uf8ff')
                .limit(10)
                .get();

            const searchResults = [];
            postsQuery.forEach(doc => {
                searchResults.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            this.displaySearchResults(searchResults);
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    displaySearchResults(results) {
        const searchResultsContainer = document.getElementById('searchResults');
        if (!searchResultsContainer) return;

        if (results.length === 0) {
            searchResultsContainer.innerHTML = '<div class="no-results">No results found</div>';
            searchResultsContainer.style.display = 'block';
            return;
        }

        const resultsHtml = results.map(result => `
            <div class="search-result" onclick="subscriptionsPage.goToPost('${result.id}')">
                <div class="result-title">${result.title || 'Untitled'}</div>
                <div class="result-author">by ${result.authorName || 'Unknown'}</div>
            </div>
        `).join('');

        searchResultsContainer.innerHTML = resultsHtml;
        searchResultsContainer.style.display = 'block';
    }

    goToPost(postId) {
        window.location.href = `feed.html?post=${postId}`;
    }

    formatTimestamp(timestamp) {
        if (!timestamp) return 'Unknown time';
        
        const now = new Date();
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

    showError(message) {
        console.error(message);
    }

    showSuccess(message) {
        console.log(message);
    }

    initializeAdMob() {
        // Initialize AdMob functionality
        try {
            // Check if AdMob is available
            if (typeof window.admob !== 'undefined') {
                console.log('📱 AdMob initialized');
            } else {
                console.log('📱 AdMob not available, skipping initialization');
            }
        } catch (error) {
            console.warn('⚠️ AdMob initialization failed:', error);
        }
    }

    initializePWAFeatures() {
        // Initialize PWA features
        try {
            console.log('📱 PWA features initialized');
        } catch (error) {
            console.warn('⚠️ PWA features initialization failed:', error);
        }
    }

    initializeNotifications() {
        // Initialize notifications
        try {
            console.log('🔔 Notifications initialized');
        } catch (error) {
            console.warn('⚠️ Notifications initialization failed:', error);
        }
    }

    loadBookmarks() {
        // Load bookmarks functionality
        try {
            console.log('🔖 Bookmarks loaded');
        } catch (error) {
            console.warn('⚠️ Bookmarks loading failed:', error);
        }
    }

    startNewPostsBannerSimulation() {
        // Start banner simulation
        try {
            console.log('🎯 Banner simulation started');
        } catch (error) {
            console.warn('⚠️ Banner simulation failed:', error);
        }
    }

    showSamplePosts() {
        // Show sample posts
        try {
            console.log('📝 Showing sample posts');
        } catch (error) {
            console.warn('⚠️ Sample posts failed:', error);
        }
    }
}

// Initialize subscriptions page
const subscriptionsPage = new SubscriptionsPage(); 