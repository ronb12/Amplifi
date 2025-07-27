/* global db, auth, firebase, storage */
// Trending Page JavaScript
class TrendingPage {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.trendingPosts = [];
        this.currentFilter = 'all'; // all, today, week, month
        
        this.init();
    }

    async init() {
        await this.setupAuthStateListener();
        this.setupEventListeners();
        this.loadTrendingPosts();
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
                // Redirect to login if not authenticated
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 100);
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
        // Filter buttons
        const filterButtons = document.querySelectorAll('.trending-filter');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.switchFilter(filter);
            });
        });

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

    async loadTrendingPosts() {
        try {
            const trendingContainer = document.getElementById('trendingPosts');
            if (!trendingContainer) return;

            // Show loading state
            trendingContainer.innerHTML = '<div class="loading">Loading trending posts...</div>';

            // Get posts from Firestore with simplified trending algorithm
            // Using only timestamp ordering to avoid composite index requirement
            const postsQuery = await db.collection('posts')
                .orderBy('timestamp', 'desc')
                .limit(20)
                .get();

            this.trendingPosts = [];
            postsQuery.forEach(doc => {
                this.trendingPosts.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Sort posts by trending score (likes + views) after fetching
            this.trendingPosts.sort((a, b) => {
                const scoreA = (a.likes || 0) + (a.views || 0);
                const scoreB = (b.likes || 0) + (b.views || 0);
                return scoreB - scoreA; // Sort by descending score
            });

            // If no posts found, create sample trending posts
            if (this.trendingPosts.length === 0) {
                console.log('No posts found, creating sample trending posts...');
                await this.createSampleTrendingPosts();
                // Try to load again after creating samples
                const samplePostsQuery = await db.collection('posts')
                    .orderBy('timestamp', 'desc')
                    .limit(20)
                    .get();

                this.trendingPosts = [];
                samplePostsQuery.forEach(doc => {
                    this.trendingPosts.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });

                // Sort sample posts by trending score
                this.trendingPosts.sort((a, b) => {
                    const scoreA = (a.likes || 0) + (a.views || 0);
                    const scoreB = (b.likes || 0) + (b.views || 0);
                    return scoreB - scoreA;
                });
            }

            this.renderTrendingPosts();
        } catch (error) {
            console.error('Error loading trending posts:', error);
            // If there's an error, show sample posts anyway
            this.trendingPosts = this.getSampleTrendingPosts();
            this.renderTrendingPosts();
        }
    }

    async createSampleTrendingPosts() {
        const samplePosts = [
            {
                title: "Amazing Sunset Photography",
                description: "Captured this breathtaking sunset at the beach today. Nature never fails to amaze me! 🌅",
                authorName: "PhotoPro",
                likes: 1247,
                views: 8900,
                commentCount: 89,
                timestamp: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)), // 2 hours ago
                mediaUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
                mediaType: "image"
            },
            {
                title: "Fitness Transformation Journey",
                description: "6 months of dedication and hard work. Never give up on your goals! 💪 #fitness #motivation",
                authorName: "FitnessGuru",
                likes: 892,
                views: 5600,
                commentCount: 67,
                timestamp: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 4 * 60 * 60 * 1000)), // 4 hours ago
                mediaUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
                mediaType: "image"
            },
            {
                title: "Delicious Homemade Pizza Recipe",
                description: "Made this authentic Italian pizza from scratch. The secret is in the dough! 🍕",
                authorName: "ChefMaria",
                likes: 756,
                views: 4200,
                commentCount: 45,
                timestamp: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 6 * 60 * 60 * 1000)), // 6 hours ago
                mediaUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop",
                mediaType: "image"
            },
            {
                title: "Travel Vlog: Tokyo Adventures",
                description: "Exploring the vibrant streets of Tokyo! This city never sleeps. 🇯🇵 #travel #tokyo",
                authorName: "TravelExplorer",
                likes: 634,
                views: 3800,
                commentCount: 38,
                timestamp: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 8 * 60 * 60 * 1000)), // 8 hours ago
                mediaUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop",
                mediaType: "image"
            },
            {
                title: "Tech Review: Latest Smartphone",
                description: "Testing the newest smartphone features. This camera is incredible! 📱 #tech #review",
                authorName: "TechReviewer",
                likes: 521,
                views: 2900,
                commentCount: 32,
                timestamp: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 10 * 60 * 60 * 1000)), // 10 hours ago
                mediaUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop",
                mediaType: "image"
            },
            {
                title: "Artistic Drawing Process",
                description: "From sketch to finished artwork. Art is therapy for the soul! 🎨 #art #drawing",
                authorName: "ArtisticSoul",
                likes: 445,
                views: 2400,
                commentCount: 28,
                timestamp: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 12 * 60 * 60 * 1000)), // 12 hours ago
                mediaUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop",
                mediaType: "image"
            },
            {
                title: "Music Production Behind the Scenes",
                description: "Creating beats in the studio. Music is life! 🎵 #music #production",
                authorName: "MusicProducer",
                likes: 398,
                views: 2100,
                commentCount: 25,
                timestamp: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 14 * 60 * 60 * 1000)), // 14 hours ago
                mediaUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
                mediaType: "image"
            },
            {
                title: "Garden Harvest Success",
                description: "Fresh vegetables from my garden! Nothing tastes better than homegrown food. 🌱",
                authorName: "GardenLover",
                likes: 367,
                views: 1800,
                commentCount: 22,
                timestamp: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 16 * 60 * 60 * 1000)), // 16 hours ago
                mediaUrl: "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=800&h=600&fit=crop",
                mediaType: "image"
            }
        ];

        try {
            // Add sample posts to Firestore
            const batch = db.batch();
            samplePosts.forEach(post => {
                const docRef = db.collection('posts').doc();
                batch.set(docRef, post);
            });
            await batch.commit();
            console.log('Sample trending posts created successfully');
        } catch (error) {
            console.error('Error creating sample posts:', error);
        }
    }

    getSampleTrendingPosts() {
        // Fallback sample posts if Firestore is not available
        return [
            {
                id: 'sample1',
                title: "Amazing Sunset Photography",
                description: "Captured this breathtaking sunset at the beach today. Nature never fails to amaze me! 🌅",
                authorName: "PhotoPro",
                likes: 1247,
                views: 8900,
                commentCount: 89,
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                mediaUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
                mediaType: "image"
            },
            {
                id: 'sample2',
                title: "Fitness Transformation Journey",
                description: "6 months of dedication and hard work. Never give up on your goals! 💪 #fitness #motivation",
                authorName: "FitnessGuru",
                likes: 892,
                views: 5600,
                commentCount: 67,
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
                mediaUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
                mediaType: "image"
            },
            {
                id: 'sample3',
                title: "Delicious Homemade Pizza Recipe",
                description: "Made this authentic Italian pizza from scratch. The secret is in the dough! 🍕",
                authorName: "ChefMaria",
                likes: 756,
                views: 4200,
                commentCount: 45,
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
                mediaUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop",
                mediaType: "image"
            }
        ];
    }

    renderTrendingPosts() {
        const trendingContainer = document.getElementById('trendingPosts');
        if (!trendingContainer) return;

        if (this.trendingPosts.length === 0) {
            trendingContainer.innerHTML = '<div class="empty-state">No trending posts found</div>';
            return;
        }

        trendingContainer.innerHTML = this.trendingPosts.map(post => this.createPostElement(post)).join('');
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
                            <span class="post-meta">${post.authorName || 'Unknown'} • ${post.views || 0} views • ${timestamp}</span>
                        </div>
                    </div>
                    <div class="post-caption">${post.description || ''}</div>
                    <div class="post-actions">
                        <button class="action-btn" title="Like" onclick="trendingPage.toggleLike('${post.id}')">
                            <div class="action-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="${post.userLiked ? '#ef4444' : 'none'}" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20.8 4.6c-1.5-1.5-4-1.5-5.5 0l-.8.8-.8-.8c-1.5-1.5-4-1.5-5.5 0-1.5 1.5-1.5 4 0 5.5l6.3 6.3 6.3-6.3c1.5-1.5 1.5-4 0-5.5z"/>
                                </svg>
                                <span class="action-count">${post.likes || 0}</span>
                            </div>
                            <span class="action-label">Like</span>
                        </button>
                        <button class="action-btn" title="Comment" onclick="trendingPage.showComments('${post.id}')">
                            <div class="action-icon">
                                <svg width="20" height="20" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                </svg>
                                <span class="action-count">${post.commentCount || 0}</span>
                            </div>
                            <span class="action-label">Comment</span>
                        </button>
                        <button class="action-btn" title="Share" onclick="trendingPage.sharePost('${post.id}')">
                            <div class="action-icon">
                                <svg width="20" height="20" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                                    <path d="M8.59 13.51l6.83 3.98"/><path d="M15.41 6.51l-6.82 3.98"/>
                                </svg>
                            </div>
                            <span class="action-label">Share</span>
                        </button>
                        <button class="action-btn" title="Tip Creator" onclick="trendingPage.showTipModal('${post.authorId}', '${post.authorName}')">
                            <div class="action-icon">
                                <span style="font-size: 18px;">💰</span>
                            </div>
                            <span class="action-label">Tip</span>
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

    switchFilter(filter) {
        this.currentFilter = filter;
        
        // Update filter button states
        document.querySelectorAll('.trending-filter').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        // Reload posts with filter
        this.loadTrendingPosts();
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
            // Search in posts
            const postsQuery = await db.collection('posts')
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
            <div class="search-result" onclick="trendingPage.goToPost('${result.id}')">
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
}

// Initialize trending page
const trendingPage = new TrendingPage(); 