/* global db, auth, firebase, storage */
// Amplifi - Channel Page JavaScript

class ChannelPage {
    constructor() {
        this.currentUser = null;
        this.channelUser = null;
        this.channelPosts = [];
        this.isFollowing = false;
        this.channelUsername = this.getChannelUsernameFromURL();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAuthStateListener();
        this.loadChannelData();
    }

    getChannelUsernameFromURL() {
        const path = window.location.pathname;
        const match = path.match(/\/channel\/(.+)/);
        return match ? match[1] : null;
    }

    setupEventListeners() {
        // Auth modal
        const authModal = document.getElementById('authModal');
        const loginBtn = document.getElementById('loginBtn');
        const closeBtns = document.querySelectorAll('.close');

        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            authModal.style.display = 'block';
        });

        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                authModal.style.display = 'none';
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target === authModal) {
                authModal.style.display = 'none';
            }
        });

        // Auth tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchAuthTab(e.target.dataset.tab);
            });
        });

        // Auth forms
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(e.target);
        });

        document.getElementById('signupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup(e.target);
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleLogout();
        });

        // Channel tabs
        document.querySelectorAll('.channel-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchChannelTab(e.target.dataset.tab);
            });
        });

        // Follow/Unfollow buttons
        document.getElementById('followBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleFollow();
        });

        document.getElementById('unfollowBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleUnfollow();
        });

        // Tip button
        document.getElementById('tipBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showTipModal();
        });

        // Tip modal
        this.setupTipModal();
    }

    setupTipModal() {
        const tipModal = document.getElementById('tipModal');
        const closeBtns = tipModal.querySelectorAll('.close');

        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tipModal.style.display = 'none';
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target === tipModal) {
                tipModal.style.display = 'none';
            }
        });
    }

    async setupAuthStateListener() {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                this.currentUser = user;
                await this.loadUserProfile();
                this.updateUIForAuthenticatedUser();
                this.checkFollowStatus();
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
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'block';
    }

    updateUIForUnauthenticatedUser() {
        document.getElementById('loginBtn').style.display = 'block';
        document.getElementById('logoutBtn').style.display = 'none';
        
        // Hide follow buttons for unauthenticated users
        document.getElementById('followBtn').style.display = 'none';
        document.getElementById('unfollowBtn').style.display = 'none';
    }

    async loadChannelData() {
        if (!this.channelUsername) {
            this.showError('Channel not found');
            return;
        }

        try {
            // Load channel user data
            const userSnapshot = await db.collection('users')
                .where('username', '==', this.channelUsername)
                .get();

            if (userSnapshot.empty) {
                this.showError('Channel not found');
                return;
            }

            this.channelUser = { id: userSnapshot.docs[0].id, ...userSnapshot.docs[0].data() };
            this.renderChannelInfo();
            this.loadChannelPosts();
            this.loadChannelStats();

            if (this.currentUser) {
                this.checkFollowStatus();
            }
        } catch (error) {
            console.error('Error loading channel data:', error);
            this.showError('Failed to load channel');
        }
    }

    renderChannelInfo() {
        document.title = `${this.channelUser.displayName} - Amplifi`;
        
        document.getElementById('displayName').textContent = this.channelUser.displayName;
        document.getElementById('username').textContent = `@${this.channelUser.username}`;
        document.getElementById('aboutBio').textContent = this.channelUser.bio || 'No bio available';
        
        if (this.channelUser.profilePic) {
            document.getElementById('profilePic').src = this.channelUser.profilePic;
        }

        if (this.channelUser.banner) {
            document.getElementById('channelBanner').style.backgroundImage = `url(${this.channelUser.banner})`;
        }

        // Show/hide follow buttons based on if it's the current user's channel
        if (this.currentUser && this.currentUser.uid === this.channelUser.id) {
            document.getElementById('followBtn').style.display = 'none';
            document.getElementById('unfollowBtn').style.display = 'none';
            document.getElementById('tipBtn').style.display = 'none';
        } else {
            document.getElementById('followBtn').style.display = 'block';
            document.getElementById('unfollowBtn').style.display = 'none';
            document.getElementById('tipBtn').style.display = 'block';
        }
    }

    async loadChannelPosts() {
        try {
            const postsSnapshot = await db.collection('posts')
                .where('authorId', '==', this.channelUser.id)
                .where('status', '==', 'active')
                .orderBy('createdAt', 'desc')
                .get();

            this.channelPosts = [];
            postsSnapshot.forEach(doc => {
                this.channelPosts.push({ id: doc.id, ...doc.data() });
            });

            this.renderChannelPosts();
        } catch (error) {
            console.error('Error loading channel posts:', error);
        }
    }

    renderChannelPosts() {
        const postsContainer = document.getElementById('channelPosts');
        postsContainer.innerHTML = '';

        if (this.channelPosts.length === 0) {
            postsContainer.innerHTML = '<p>No posts yet.</p>';
            return;
        }

        this.channelPosts.forEach(post => {
            const postElement = this.createPostElement(post);
            postsContainer.appendChild(postElement);
        });
    }

    createPostElement(post) {
        const postDiv = document.createElement('div');
        postDiv.className = 'post-card';
        postDiv.id = `post-${post.id}`;

        const mediaElement = post.mediaType === 'video' 
            ? `<video src="${post.mediaUrl}" poster="${post.thumbnailUrl}" onclick="channelPage.playVideo(this)"></video>`
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
                        <button class="btn btn-sm" onclick="channelPage.toggleLike('${post.id}')" id="like-${post.id}">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="btn btn-sm" onclick="channelPage.showComments('${post.id}')">
                            <i class="fas fa-comment"></i>
                        </button>
                        <button class="btn btn-sm" onclick="channelPage.showTipModal('${post.authorId}', '${post.authorName}')">
                            <i class="fas fa-gift"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        return postDiv;
    }

    async loadChannelStats() {
        try {
            // Load posts count
            const postsCount = this.channelPosts.length;
            document.getElementById('postCount').textContent = `${postsCount} posts`;

            // Load followers count
            const followersSnapshot = await db.collection('follows')
                .where('followingId', '==', this.channelUser.id)
                .get();
            
            const followersCount = followersSnapshot.size;
            document.getElementById('followerCount').textContent = `${followersCount} followers`;

            // Load total views and likes
            let totalViews = 0;
            let totalLikes = 0;
            this.channelPosts.forEach(post => {
                totalViews += post.views || 0;
                totalLikes += post.likes || 0;
            });

            document.getElementById('totalViews').textContent = totalViews;
            document.getElementById('totalLikes').textContent = totalLikes;

            // Load join date
            const joinDate = this.channelUser.createdAt.toDate();
            document.getElementById('joinDate').textContent = joinDate.toLocaleDateString();

        } catch (error) {
            console.error('Error loading channel stats:', error);
        }
    }

    async checkFollowStatus() {
        if (!this.currentUser || !this.channelUser) return;

        try {
            const followDoc = await db.collection('follows')
                .doc(`${this.currentUser.uid}_${this.channelUser.id}`)
                .get();

            this.isFollowing = followDoc.exists;
            this.updateFollowButton();
        } catch (error) {
            console.error('Error checking follow status:', error);
        }
    }

    updateFollowButton() {
        const followBtn = document.getElementById('followBtn');
        const unfollowBtn = document.getElementById('unfollowBtn');

        if (this.isFollowing) {
            followBtn.style.display = 'none';
            unfollowBtn.style.display = 'block';
        } else {
            followBtn.style.display = 'block';
            unfollowBtn.style.display = 'none';
        }
    }

    async handleFollow() {
        if (!this.currentUser) {
            alert('Please login to follow creators');
            return;
        }

        try {
            await db.collection('follows').doc(`${this.currentUser.uid}_${this.channelUser.id}`).set({
                followerId: this.currentUser.uid,
                followingId: this.channelUser.id,
                createdAt: new Date()
            });

            this.isFollowing = true;
            this.updateFollowButton();
            this.loadChannelStats(); // Refresh follower count
        } catch (error) {
            console.error('Error following user:', error);
            alert('Failed to follow user');
        }
    }

    async handleUnfollow() {
        if (!this.currentUser) return;

        try {
            await db.collection('follows').doc(`${this.currentUser.uid}_${this.channelUser.id}`).delete();

            this.isFollowing = false;
            this.updateFollowButton();
            this.loadChannelStats(); // Refresh follower count
        } catch (error) {
            console.error('Error unfollowing user:', error);
            alert('Failed to unfollow user');
        }
    }

    showTipModal() {
        if (!this.currentUser) {
            alert('Please login to tip creators');
            return;
        }

        if (this.currentUser.uid === this.channelUser.id) {
            alert('You cannot tip yourself');
            return;
        }

        const tipModal = document.getElementById('tipModal');
        const creatorInfo = document.getElementById('tipCreatorInfo');
        
        creatorInfo.innerHTML = `
            <p>Tip <strong>${this.channelUser.displayName}</strong></p>
            <p>Show your appreciation for their content!</p>
        `;

        tipModal.style.display = 'block';

        // Setup tip form
        this.setupTipForm();
    }

    setupTipForm() {
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
            await this.processTip();
        };
    }

    async processTip() {
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
                recipientId: this.channelUser.id,
                amount: amount,
                createdAt: new Date()
            };

            await db.collection('tips').add(tipData);

            // Update creator's earnings
            const earningsRef = db.collection('earnings').doc(this.channelUser.id);
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

    switchChannelTab(tabName) {
        document.querySelectorAll('.channel-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.channel-tab-content').forEach(content => {
            content.classList.remove('active');
        });

        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}Tab`).classList.add('active');
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
            const postIndex = this.channelPosts.findIndex(p => p.id === postId);
            if (postIndex !== -1) {
                this.channelPosts[postIndex].likes += likeDoc.exists ? -1 : 1;
                this.renderChannelPosts();
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    }

    async showComments(postId) {
    }

    showTipModal(creatorId, creatorName) {
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

    playVideo(videoElement) {
        if (videoElement.paused) {
            videoElement.play();
        } else {
            videoElement.pause();
        }
    }

    formatTimestamp(timestamp) {
        const now = new Date();
        const postDate = timestamp.toDate();
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
        const mainContent = document.querySelector('.channel-content');
        mainContent.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <h2>${message}</h2>
                <p><a href="/">Return to home</a></p>
            </div>
        `;
    }
}

// Initialize the channel page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.channelPage = new ChannelPage();
}); 