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

            // Get posts from Firestore with trending algorithm
            const postsQuery = await db.collection('posts')
                .orderBy('likes', 'desc')
                .orderBy('views', 'desc')
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

            this.renderTrendingPosts();
        } catch (error) {
            console.error('Error loading trending posts:', error);
            this.showError('Failed to load trending posts');
        }
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
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="${post.userLiked ? '#ef4444' : 'none'}" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20.8 4.6c-1.5-1.5-4-1.5-5.5 0l-.8.8-.8-.8c-1.5-1.5-4-1.5-5.5 0-1.5 1.5-1.5 4 0 5.5l6.3 6.3 6.3-6.3c1.5-1.5 1.5-4 0-5.5z"/>
                            </svg>
                            <span>${post.likes || 0}</span>
                        </button>
                        <button class="action-btn" title="Comment" onclick="trendingPage.showComments('${post.id}')">
                            <svg width="20" height="20" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            <span>${post.commentCount || 0}</span>
                        </button>
                        <button class="action-btn" title="Share" onclick="trendingPage.sharePost('${post.id}')">
                            <svg width="20" height="20" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                                <path d="M8.59 13.51l6.83 3.98"/><path d="M15.41 6.51l-6.82 3.98"/>
                            </svg>
                        </button>
                        <button class="action-btn" title="Tip Creator" onclick="trendingPage.showTipModal('${post.authorId}', '${post.authorName}')">
                            <span style="font-size: 18px;">💰</span>
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
            const countSpan = likeBtn.querySelector('span');
            
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
        // Create error toast
        const toast = document.createElement('div');
        toast.className = 'toast error';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    showSuccess(message) {
        // Create success toast
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize trending page
const trendingPage = new TrendingPage(); 