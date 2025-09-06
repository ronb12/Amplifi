/* global db, auth, firebase, storage */
// Bookmarks Page JavaScript
class BookmarksPage {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.bookmarkedPosts = [];
        this.isLoading = false;
        
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
        
        // Add fallback to show sample posts if loadBookmarks fails
        try {
            await this.loadBookmarks();
        } catch (error) {
            console.error('Failed to load bookmarks, showing sample posts:', error);
            this.showSamplePosts();
        }
        
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
                this.loadBookmarks();
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
        
        // Redirect to login page
        window.location.href = 'index.html';
    }

    setupEventListeners() {
        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }

        // Mobile tab navigation
        this.setupMobileTabNavigation();
    }

    setupMobileTabNavigation() {
        // Set active tab based on current page
        const currentPage = window.location.pathname.split('/').pop() || 'bookmarks.html';
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

    async loadBookmarks() {
        if (!this.currentUser || this.isLoading) return;
        
        this.isLoading = true;
        const loadingElement = document.getElementById('bookmarksLoading');
        const emptyElement = document.getElementById('emptyBookmarks');
        const postsContainer = document.getElementById('bookmarksPosts');
        
        if (loadingElement) loadingElement.style.display = 'block';
        if (emptyElement) emptyElement.style.display = 'none';
        if (postsContainer) postsContainer.innerHTML = '';

        try {
            // Get user's bookmarks
            const bookmarksSnapshot = await db.collection('users')
                .doc(this.currentUser.uid)
                .collection('bookmarks')
                .orderBy('createdAt', 'desc')
                .get();

            if (bookmarksSnapshot.empty) {
                this.showEmptyState();
                return;
            }

            // Get post IDs from bookmarks
            const postIds = bookmarksSnapshot.docs.map(doc => doc.id);
            
            // Fetch the actual posts
            const postsPromises = postIds.map(async (postId) => {
                try {
                    const postDoc = await db.collection('posts').doc(postId).get();
                    if (postDoc.exists) {
                        return { id: postDoc.id, ...postDoc.data() };
                    }
                    return null;
                } catch (error) {
                    console.error('Error fetching post:', postId, error);
                    return null;
                }
            });

            const posts = (await Promise.all(postsPromises)).filter(post => post !== null);
            
            if (posts.length === 0) {
                this.showEmptyState();
                return;
            }

            this.bookmarkedPosts = posts;
            this.renderBookmarks(posts);
            
        } catch (error) {
            console.error('Error loading bookmarks:', error);
            this.showEmptyState();
        } finally {
            this.isLoading = false;
            if (loadingElement) loadingElement.style.display = 'none';
        }
    }

    showEmptyState() {
        const loadingElement = document.getElementById('bookmarksLoading');
        const emptyElement = document.getElementById('emptyBookmarks');
        const postsContainer = document.getElementById('bookmarksPosts');
        
        if (loadingElement) loadingElement.style.display = 'none';
        if (emptyElement) emptyElement.style.display = 'block';
        if (postsContainer) postsContainer.innerHTML = '';
    }

    renderBookmarks(posts) {
        const postsContainer = document.getElementById('bookmarksPosts');
        if (!postsContainer) return;

        posts.forEach(post => {
            const postElement = this.createPostElement(post);
            postsContainer.appendChild(postElement);
        });
    }

    createPostElement(post) {
        const postDiv = document.createElement('div');
        postDiv.className = 'post-card';
        postDiv.innerHTML = `
            <div class="post-media">
                ${post.mediaType === 'video' 
                    ? `<video src="${post.mediaUrl}" poster="${post.thumbnailUrl}" onclick="bookmarksPage.playVideo(this)"></video>`
                    : `<img src="${post.mediaUrl}" alt="Post image">`
                }
            </div>
            <div class="post-info">
                <div class="post-header">
                    <img src="${post.authorPic || 'assets/images/default-avatar.svg'}" alt="Author" class="post-author-pic">
                    <div>
                        <a href="profile.html?username=${post.authorUsername}" class="post-author">${post.authorName}</a>
                        <span class="post-timestamp">${this.formatTimestamp(post.createdAt)}</span>
                    </div>
                </div>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-caption">${post.description}</p>
                
                <!-- Hashtags -->
                ${post.hashtags ? `
                    <div class="post-hashtags">
                        ${post.hashtags.map(tag => `<span class="hashtag" onclick="bookmarksPage.searchHashtag('${tag}')">#${tag}</span>`).join(' ')}
                    </div>
                ` : ''}
                
                <div class="post-actions">
                    <!-- Reaction Buttons -->
                    <div class="reactions-container">
                        <button onclick="bookmarksPage.toggleReaction('${post.id}', 'like')" class="reaction-btn ${post.userReaction === 'like' ? 'active' : ''}" data-reaction="like">
                            ❤️ <span>${post.reactions?.like || 0}</span>
                        </button>
                        <button onclick="bookmarksPage.toggleReaction('${post.id}', 'love')" class="reaction-btn ${post.userReaction === 'love' ? 'active' : ''}" data-reaction="love">
                            😍 <span>${post.reactions?.love || 0}</span>
                        </button>
                        <button onclick="bookmarksPage.toggleReaction('${post.id}', 'haha')" class="reaction-btn ${post.userReaction === 'haha' ? 'active' : ''}" data-reaction="haha">
                            😂 <span>${post.reactions?.haha || 0}</span>
                        </button>
                        <button onclick="bookmarksPage.toggleReaction('${post.id}', 'wow')" class="reaction-btn ${post.userReaction === 'wow' ? 'active' : ''}" data-reaction="wow">
                            😮 <span>${post.reactions?.wow || 0}</span>
                        </button>
                        <button onclick="bookmarksPage.toggleReaction('${post.id}', 'sad')" class="reaction-btn ${post.userReaction === 'sad' ? 'active' : ''}" data-reaction="sad">
                            😢 <span>${post.reactions?.sad || 0}</span>
                        </button>
                        <button onclick="bookmarksPage.toggleReaction('${post.id}', 'angry')" class="reaction-btn ${post.userReaction === 'angry' ? 'active' : ''}" data-reaction="angry">
                            😠 <span>${post.reactions?.angry || 0}</span>
                        </button>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="action-buttons">
                        <button onclick="bookmarksPage.showComments('${post.id}')" class="action-btn">
                            💬 <span>${post.comments || 0}</span>
                        </button>
                        <button onclick="bookmarksPage.sharePost('${post.id}')" class="action-btn">
                            📤 Share
                        </button>
                        <button onclick="bookmarksPage.removeBookmark('${post.id}')" class="action-btn bookmarked">
                            🔖 Remove Bookmark
                        </button>
                        <button onclick="bookmarksPage.showTipModal('${post.authorId}', '${post.authorName}')" class="action-btn">
                            💰 Tip
                        </button>
                    </div>
                </div>
            </div>
        `;
        return postDiv;
    }

    async removeBookmark(postId) {
        if (!this.currentUser) return;

        try {
            // Remove from Firestore
            await db.collection('users').doc(this.currentUser.uid)
                .collection('bookmarks').doc(postId).delete();

            // Remove from local array
            this.bookmarkedPosts = this.bookmarkedPosts.filter(post => post.id !== postId);

            // Remove from UI
            const postElement = document.querySelector(`[onclick*="removeBookmark('${postId}')"]`).closest('.post-card');
            if (postElement) {
                postElement.remove();
            }

            // Show empty state if no more bookmarks
            if (this.bookmarkedPosts.length === 0) {
                this.showEmptyState();
            }

        } catch (error) {
            console.error('Error removing bookmark:', error);
            alert('Failed to remove bookmark. Please try again.');
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
        const reactionBtn = document.querySelector(`[onclick*="toggleReaction('${postId}', '${reactionType}')"]`);
        if (reactionBtn) {
            if (isActive) {
                reactionBtn.classList.add('active');
            } else {
                reactionBtn.classList.remove('active');
            }
        }
    }

    searchHashtag(hashtag) {
        window.location.href = `search.html?q=${encodeURIComponent(hashtag)}`;
    }

    showComments(postId) {
        // Implement comments modal similar to feed page
        console.log('Show comments for post:', postId);
    }

    sharePost(postId) {
        const post = this.bookmarkedPosts.find(p => p.id === postId);
        if (!post) return;

        // Create share modal
        const shareModal = document.createElement('div');
        shareModal.className = 'modal';
        shareModal.innerHTML = `
            <div class="modal-content share-modal">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <h3>Share Post</h3>
                <div class="share-options">
                    <button onclick="bookmarksPage.shareToSocial('${postId}', 'facebook')" class="share-btn facebook">
                        📘 Facebook
                    </button>
                    <button onclick="bookmarksPage.shareToSocial('${postId}', 'twitter')" class="share-btn twitter">
                        🐦 Twitter
                    </button>
                    <button onclick="bookmarksPage.shareToSocial('${postId}', 'whatsapp')" class="share-btn whatsapp">
                        💬 WhatsApp
                    </button>
                    <button onclick="bookmarksPage.shareToSocial('${postId}', 'telegram')" class="share-btn telegram">
                        📱 Telegram
                    </button>
                    <button onclick="bookmarksPage.copyLink('${postId}')" class="share-btn copy">
                        📋 Copy Link
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(shareModal);
        shareModal.style.display = 'block';
    }

    shareToSocial(postId, platform) {
        const post = this.bookmarkedPosts.find(p => p.id === postId);
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

    showTipModal(creatorId, creatorName) {
        if (!this.currentUser) {
            alert('Please login to send tips');
            return;
        }

        const tipModal = document.createElement('div');
        tipModal.className = 'modal';
        tipModal.innerHTML = `
            <div class="modal-content tip-modal">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <div class="tip-creator-info">
                    <p>Tip <strong>${creatorName}</strong></p>
                    <p>Show your appreciation for their content!</p>
                </div>
                <form onsubmit="bookmarksPage.processTip(event, '${creatorId}')">
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
        document.body.appendChild(tipModal);
        tipModal.style.display = 'block';
        this.setupTipForm();
    }

    setupTipForm() {
        const tipAmounts = document.querySelectorAll('.tip-amount');
        const customAmount = document.getElementById('customTipAmount');

        tipAmounts.forEach(btn => {
            btn.addEventListener('click', () => {
                tipAmounts.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                if (customAmount) customAmount.value = btn.dataset.amount;
            });
        });
    }

    async processTip(event, creatorId) {
        event.preventDefault();
        
        const customAmount = document.getElementById('customTipAmount');
        if (!customAmount) return;

        const amount = parseFloat(customAmount.value);
        
        if (!amount || amount < 0.50) {
            alert('Minimum tip amount is $0.50');
            return;
        }

        try {
            const tipData = {
                senderId: this.currentUser.uid,
                senderName: this.userProfile?.displayName || 'Anonymous',
                recipientId: creatorId,
                amount: amount,
                createdAt: new Date()
            };

            await db.collection('tips').add(tipData);

            const earningsRef = db.collection('earnings').doc(creatorId);
            await earningsRef.set({
                totalTips: firebase.firestore.FieldValue.increment(amount),
                lastUpdated: new Date()
            }, { merge: true });

            // Close modal
            const modal = document.querySelector('.tip-modal').parentElement.parentElement;
            if (modal) modal.remove();
            
            alert(`Tip of $${amount.toFixed(2)} sent successfully!`);
        } catch (error) {
            console.error('Error processing tip:', error);
            alert('Failed to send tip. Please try again.');
        }
    }

    playVideo(videoElement) {
        if (videoElement.paused) {
            videoElement.play();
        } else {
            videoElement.pause();
        }
    }

    async handleLogout() {
        try {
            await auth.signOut();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    formatTimestamp(timestamp) {
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

// Initialize the bookmarks page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bookmarksPage = new BookmarksPage();
}); 