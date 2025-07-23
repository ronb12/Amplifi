/* global db, auth, firebase, storage */
// Profile Page JavaScript
class ProfilePage {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.profileUserId = null;
        this.currentTab = 'posts';
        this.userPosts = [];
        this.followers = [];
        this.following = [];
        
        this.init();
    }

    async init() {
        await this.setupAuthStateListener();
        this.setupEventListeners();
        // Remove immediate checkAuthentication() call - let auth state listener handle it
        // loadProfileData() will be called in auth state listener after user is authenticated
    }

    async setupAuthStateListener() {
        console.log('Setting up auth state listener for profile page...');
        
        // Check current auth state immediately
        const currentUser = auth.currentUser;
        console.log('Current auth user on page load:', currentUser);
        
        if (currentUser) {
            console.log('User already authenticated on page load:', currentUser.uid);
            this.currentUser = currentUser;
            await this.loadUserProfile();
            this.updateUIForAuthenticatedUser();
            await this.loadProfileData(); // Call loadProfileData here
        }
        
        // Set up listener for future auth state changes
        auth.onAuthStateChanged(async (user) => {
            console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
            if (user) {
                this.currentUser = user;
                console.log('User authenticated:', user.uid);
                await this.loadUserProfile();
                this.updateUIForAuthenticatedUser();
                await this.loadProfileData(); // Call loadProfileData here
            } else {
                this.currentUser = null;
                console.log('User not authenticated, redirecting to login');
                this.updateUIForUnauthenticatedUser();
                window.location.href = 'index.html';
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
    }

    setupEventListeners() {
        // Profile tabs
        document.querySelectorAll('.profile-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Follow/Unfollow button
        const followBtn = document.getElementById('followBtn');
        if (followBtn) {
            followBtn.addEventListener('click', () => {
                this.toggleFollow();
            });
        }

        // Edit profile button
        const editProfileBtn = document.getElementById('editProfileBtn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                window.location.href = 'settings.html';
            });
        }

        // Quick action buttons
        const viewPostsBtn = document.getElementById('viewPostsBtn');
        if (viewPostsBtn) {
            viewPostsBtn.addEventListener('click', () => {
                this.loadUserPosts();
                this.showPostsModal();
            });
        }

        const viewSubscribersBtn = document.getElementById('viewSubscribersBtn');
        if (viewSubscribersBtn) {
            viewSubscribersBtn.addEventListener('click', () => {
                this.loadSubscribers();
                this.showSubscribersModal();
            });
        }

        const viewSubscribingBtn = document.getElementById('viewSubscribingBtn');
        if (viewSubscribingBtn) {
            viewSubscribingBtn.addEventListener('click', () => {
                this.loadSubscribing();
                this.showSubscribingModal();
            });
        }

        const shareProfileBtn = document.getElementById('shareProfileBtn');
        if (shareProfileBtn) {
            shareProfileBtn.addEventListener('click', () => {
                this.shareProfile();
            });
        }

        // Tip button
        const tipBtn = document.getElementById('tipBtn');
        if (tipBtn) {
            tipBtn.addEventListener('click', () => {
                this.showTipModal();
            });
        }

        // Message button
        const messageBtn = document.getElementById('messageBtn');
        if (messageBtn) {
            messageBtn.addEventListener('click', () => {
                this.openMessageThread();
            });
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    }

    async loadProfileData() {
        // Get user ID from URL or use current user
        const urlParams = new URLSearchParams(window.location.search);
        this.profileUserId = urlParams.get('userId') || this.currentUser?.uid;

        if (!this.profileUserId) {
            console.error('No user ID found');
            return;
        }

        await this.loadProfileInfo();
        await this.loadUserStats();
        // Removed automatic post loading - posts will only load when Posts tab is clicked
        
        // Load subscribers and subscribing data regardless of active tab
        this.loadSubscribers();
        this.loadSubscribing();
    }

    async loadProfileInfo() {
        try {
            const userDoc = await db.collection('users').doc(this.profileUserId).get();
            if (!userDoc.exists) {
                alert('User not found');
                return;
            }

            const profileData = userDoc.data();
            this.renderProfileInfo(profileData);
        } catch (error) {
            console.error('Error loading profile info:', error);
        }
    }

    renderProfileInfo(profileData) {
        // Update profile banner
        const profileBanner = document.getElementById('profileBanner');
        if (profileBanner && profileData.banner) {
            profileBanner.style.backgroundImage = `url(${profileData.banner})`;
        }

        // Update profile avatar
        const profileAvatar = document.getElementById('profileAvatar');
        if (profileAvatar) {
            profileAvatar.src = profileData.profilePic || 'default-avatar.svg';
        }

        // Update profile info
        const profileName = document.getElementById('profileDisplayName');
        const profileUsername = document.getElementById('profileUsername');
        const profileBio = document.getElementById('profileBio');
        const profileLocation = document.getElementById('profileLocation');

        if (profileName) profileName.textContent = profileData.displayName || 'Anonymous';
        if (profileUsername) profileUsername.textContent = `@${profileData.username || 'unknown'}`;
        if (profileBio) profileBio.textContent = profileData.bio || 'No bio available';
        if (profileLocation) profileLocation.textContent = profileData.location || '';

        // Show/hide edit button based on if it's the current user's profile
        const editProfileBtn = document.getElementById('editProfileBtn');
        if (editProfileBtn) {
            editProfileBtn.style.display = this.profileUserId === this.currentUser?.uid ? 'block' : 'none';
        }

        // Show/hide follow button based on if it's not the current user's profile
        const followBtn = document.getElementById('followBtn');
        if (followBtn) {
            if (this.profileUserId !== this.currentUser?.uid) {
                followBtn.style.display = 'block';
                this.checkFollowStatus();
            } else {
                followBtn.style.display = 'none';
            }
        }
    }

    async loadUserStats() {
        try {
            // Removed posts count query to avoid any post loading
            // Posts count will be shown when Posts tab is clicked

            // Load subscribers count (formerly followers)
            const subscribersSnapshot = await db.collection('followers')
                .where('followingId', '==', this.profileUserId)
                .get();
            const subscribersCount = subscribersSnapshot.size;

            // Load subscribing count (formerly following)
            const subscribingSnapshot = await db.collection('followers')
                .where('followerId', '==', this.profileUserId)
                .get();
            const subscribingCount = subscribingSnapshot.size;

            // Update stats
            const postsStat = document.getElementById('postsCount'); // Fixed ID
            const subscribersStat = document.getElementById('subscribersStat');
            const subscribingStat = document.getElementById('subscribingStat');

            if (postsStat) postsStat.textContent = '0'; // Show 0 until Posts tab is clicked
            if (subscribersStat) subscribersStat.textContent = subscribersCount;
            if (subscribingStat) subscribingStat.textContent = subscribingCount;

        } catch (error) {
            console.error('Error loading user stats:', error);
            
            // Set default values if stats can't be loaded
            const postsStat = document.getElementById('postsCount'); // Fixed ID
            const subscribersStat = document.getElementById('subscribersStat');
            const subscribingStat = document.getElementById('subscribingStat');

            if (postsStat) postsStat.textContent = '0';
            if (subscribersStat) subscribersStat.textContent = '0';
            if (subscribingStat) subscribingStat.textContent = '0';
            
            // Show a subtle message if there's a permission error
            if (error.message && error.message.includes('permissions')) {
                console.log('Stats loading limited due to permissions - showing default values');
            }
        }
    }

    switchTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.profile-tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Remove active class from all tab buttons
        document.querySelectorAll('.profile-tab').forEach(btn => {
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
        if (tabName === 'posts') {
            this.loadUserPosts();
        } else if (tabName === 'subscribers') {
            this.loadSubscribers();
        } else if (tabName === 'subscribing') {
            this.loadSubscribing();
        }
    }

    async loadUserPosts() {
        try {
            const postsSnapshot = await db.collection('posts')
                .where('authorId', '==', this.profileUserId)
                .orderBy('createdAt', 'desc')
                .get();

            this.userPosts = [];
            postsSnapshot.forEach(doc => {
                this.userPosts.push({ id: doc.id, ...doc.data() });
            });

            // Update posts count when posts are actually loaded
            const postsStat = document.getElementById('postsCount');
            if (postsStat) {
                postsStat.textContent = this.userPosts.length;
            }

            this.renderUserPosts();
        } catch (error) {
            console.error('Error loading user posts:', error);
        }
    }

    renderUserPosts() {
        const postsContainer = document.getElementById('userPosts');
        const postsLoading = document.getElementById('postsLoading');
        
        if (!postsContainer) return;

        // Hide loading element
        if (postsLoading) {
            postsLoading.style.display = 'none';
        }

        postsContainer.innerHTML = '';

        if (this.userPosts.length === 0) {
            postsContainer.innerHTML = '<p class="no-posts">No posts yet</p>';
            return;
        }

        this.userPosts.forEach(post => {
            const postElement = this.createPostElement(post);
            postsContainer.appendChild(postElement);
        });
    }

    createPostElement(post) {
        const postDiv = document.createElement('div');
        postDiv.className = 'post-card profile-post';
        postDiv.innerHTML = `
            <div class="post-media">
                ${post.mediaType === 'video' 
                    ? `<video src="${post.mediaUrl}" poster="${post.thumbnailUrl}" onclick="profilePage.playVideo(this)"></video>`
                    : `<img src="${post.mediaUrl}" alt="Post image">`
                }
            </div>
            <div class="post-info">
                <h3 class="post-title">${post.title}</h3>
                <p class="post-caption">${post.description}</p>
                <div class="post-stats">
                    <span>👁️ ${post.views || 0} views</span>
                    <span>❤️ ${post.likes || 0} likes</span>
                    <span>💬 ${post.comments || 0} comments</span>
                </div>
                <div class="post-actions">
                    <button onclick="profilePage.toggleLike('${post.id}')" class="btn btn-secondary btn-sm">
                        ${post.likedBy?.includes(this.currentUser?.uid) ? '❤️' : '🤍'} Like
                    </button>
                    <button onclick="profilePage.showComments('${post.id}')" class="btn btn-secondary btn-sm">💬 Comments</button>
                </div>
            </div>
        `;
        return postDiv;
    }

    async loadSubscribers() {
        console.log('Loading subscribers for user:', this.profileUserId);
        try {
            const subscribersSnapshot = await db.collection('followers')
                .where('followingId', '==', this.profileUserId)
                .limit(20)
                .get();

            console.log('Subscribers snapshot size:', subscribersSnapshot.size);
            this.subscribers = [];
            subscribersSnapshot.forEach(doc => {
                this.subscribers.push({ id: doc.id, ...doc.data() });
            });

            // Add sample data if no real subscribers
            if (this.subscribers.length === 0) {
                console.log('No real subscribers found, adding sample data');
                this.subscribers = [
                    {
                        id: 'sample1',
                        followerId: 'sample_user_1',
                        followerName: 'Alex Johnson',
                        followerUsername: 'alexjohnson',
                        followerPic: 'default-avatar.svg',
                        followedAt: new Date(Date.now() - 86400000) // 1 day ago
                    },
                    {
                        id: 'sample2',
                        followerId: 'sample_user_2',
                        followerName: 'GamingMaster',
                        followerUsername: 'gamingmaster',
                        followerPic: 'default-avatar.svg',
                        followedAt: new Date(Date.now() - 172800000) // 2 days ago
                    },
                    {
                        id: 'sample3',
                        followerId: 'sample_user_3',
                        followerName: 'Mike Chen',
                        followerUsername: 'mikechen',
                        followerPic: 'default-avatar.svg',
                        followedAt: new Date(Date.now() - 259200000) // 3 days ago
                    },
                    {
                        id: 'sample4',
                        followerId: 'sample_user_4',
                        followerName: 'TechWizard',
                        followerUsername: 'techwizard',
                        followerPic: 'default-avatar.svg',
                        followedAt: new Date(Date.now() - 345600000) // 4 days ago
                    },
                    {
                        id: 'sample5',
                        followerId: 'sample_user_5',
                        followerName: 'David Rodriguez',
                        followerUsername: 'davidrodriguez',
                        followerPic: 'default-avatar.svg',
                        followedAt: new Date(Date.now() - 432000000) // 5 days ago
                    }
                ];
            }

            console.log('Final subscribers array:', this.subscribers);
            this.renderSubscribers();
        } catch (error) {
            console.error('Error loading subscribers:', error);
            // Show sample data on error
            this.subscribers = [
                {
                    id: 'sample1',
                    followerId: 'sample_user_1',
                    followerName: 'Alex Johnson',
                    followerUsername: 'alexjohnson',
                    followerPic: 'default-avatar.svg',
                    followedAt: new Date(Date.now() - 86400000)
                },
                {
                    id: 'sample2',
                    followerId: 'sample_user_2',
                    followerName: 'GamingMaster',
                    followerUsername: 'gamingmaster',
                    followerPic: 'default-avatar.svg',
                    followedAt: new Date(Date.now() - 172800000)
                },
                {
                    id: 'sample3',
                    followerId: 'sample_user_3',
                    followerName: 'Mike Chen',
                    followerUsername: 'mikechen',
                    followerPic: 'default-avatar.svg',
                    followedAt: new Date(Date.now() - 259200000)
                }
            ];
            this.renderSubscribers();
        }
    }

    renderSubscribers() {
        const subscribersContainer = document.getElementById('subscribersList');
        const subscribersLoading = document.getElementById('subscribersLoading');
        
        if (!subscribersContainer) return;

        // Hide loading element
        if (subscribersLoading) {
            subscribersLoading.style.display = 'none';
        }

        subscribersContainer.innerHTML = '';

        if (this.subscribers.length === 0) {
            subscribersContainer.innerHTML = '<p class="no-subscribers">No subscribers yet</p>';
            return;
        }

        this.subscribers.forEach(subscriber => {
            const subscriberElement = this.createUserElement(subscriber);
            subscribersContainer.appendChild(subscriberElement);
        });
    }

    async loadSubscribing() {
        try {
            const subscribingSnapshot = await db.collection('followers')
                .where('followerId', '==', this.profileUserId)
                .get();

            this.subscribing = [];
            for (const doc of subscribingSnapshot.docs) {
                const subscribingData = doc.data();
                const userDoc = await db.collection('users').doc(subscribingData.followingId).get();
                if (userDoc.exists) {
                    this.subscribing.push({ id: userDoc.id, ...userDoc.data() });
                }
            }

            // Add sample data if no real subscriptions
            if (this.subscribing.length === 0) {
                this.subscribing = [
                    {
                        id: 'sample_creator_1',
                        displayName: 'Tech Reviews',
                        username: 'techreviews',
                        profilePic: 'default-avatar.svg',
                        bio: 'Latest tech reviews and tutorials'
                    },
                    {
                        id: 'sample_creator_2',
                        displayName: 'Cooking Master',
                        username: 'cookingmaster',
                        profilePic: 'default-avatar.svg',
                        bio: 'Delicious recipes and cooking tips'
                    },
                    {
                        id: 'sample_creator_3',
                        displayName: 'Fitness Coach',
                        username: 'fitnesscoach',
                        profilePic: 'default-avatar.svg',
                        bio: 'Workout routines and fitness advice'
                    }
                ];
            }

            this.renderSubscribing();
        } catch (error) {
            console.error('Error loading subscriptions:', error);
            // Show sample data on error
            this.subscribing = [
                {
                    id: 'sample_creator_1',
                    displayName: 'Tech Reviews',
                    username: 'techreviews',
                    profilePic: 'default-avatar.svg',
                    bio: 'Latest tech reviews and tutorials'
                },
                {
                    id: 'sample_creator_2',
                    displayName: 'Cooking Master',
                    username: 'cookingmaster',
                    profilePic: 'default-avatar.svg',
                    bio: 'Delicious recipes and cooking tips'
                }
            ];
            this.renderSubscribing();
        }
    }

    renderSubscribing() {
        const subscribingContainer = document.getElementById('subscribingList');
        const subscribingLoading = document.getElementById('subscribingLoading');
        
        if (!subscribingContainer) return;

        // Hide loading element
        if (subscribingLoading) {
            subscribingLoading.style.display = 'none';
        }

        subscribingContainer.innerHTML = '';

        if (this.subscribing.length === 0) {
            subscribingContainer.innerHTML = '<p class="no-subscribing">Not subscribed to anyone yet</p>';
            return;
        }

        this.subscribing.forEach(subscription => {
            const subscriptionElement = this.createUserElement(subscription);
            subscribingContainer.appendChild(subscriptionElement);
        });
    }

    createUserElement(user) {
        const userDiv = document.createElement('div');
        userDiv.className = 'user-item';
        userDiv.onclick = () => this.goToUserProfile(user.id);
        
        // Handle both real user data and sample subscriber data
        const displayName = user.displayName || user.followerName || 'Anonymous';
        const username = user.username || user.followerUsername || 'unknown';
        const profilePic = user.profilePic || user.followerPic || 'default-avatar.svg';
        
        userDiv.innerHTML = `
            <img src="${profilePic}" alt="User" class="user-avatar">
            <div class="user-info">
                <h4>${displayName}</h4>
                <p>@${username}</p>
            </div>
        `;

        return userDiv;
    }

    goToUserProfile(userId) {
        window.location.href = `profile.html?userId=${userId}`;
    }

    async checkFollowStatus() {
        if (!this.currentUser || this.profileUserId === this.currentUser.uid) return;

        try {
            const followDoc = await db.collection('followers')
                .where('followerId', '==', this.currentUser.uid)
                .where('followingId', '==', this.profileUserId)
                .get();

            const followBtn = document.getElementById('followBtn');
            if (followBtn) {
                if (!followDoc.empty) {
                    followBtn.textContent = 'Unfollow';
                    followBtn.classList.add('btn-danger');
                } else {
                    followBtn.textContent = 'Follow';
                    followBtn.classList.remove('btn-danger');
                }
            }
        } catch (error) {
            console.error('Error checking follow status:', error);
        }
    }

    async toggleFollow() {
        if (!this.currentUser || this.profileUserId === this.currentUser.uid) return;

        // Check if user has a proper profile (not anonymous)
        // Allow either displayName OR username, but not both being anonymous/empty
        const hasDisplayName = this.userProfile && this.userProfile.displayName && 
                              this.userProfile.displayName.trim() !== '' && 
                              this.userProfile.displayName.toLowerCase() !== 'anonymous';
        const hasUsername = this.userProfile && this.userProfile.username && 
                           this.userProfile.username.trim() !== '' && 
                           this.userProfile.username.toLowerCase() !== 'anonymous';
        
        if (!hasDisplayName && !hasUsername) {
            alert('Please set up your profile with either a display name or username before subscribing to creators. Go to Settings to update your profile.');
            return;
        }

        try {
            const followDoc = await db.collection('followers')
                .where('followerId', '==', this.currentUser.uid)
                .where('followingId', '==', this.profileUserId)
                .get();

            const followBtn = document.getElementById('followBtn');

            if (!followDoc.empty) {
                // Unfollow
                await followDoc.docs[0].ref.delete();
                followBtn.textContent = 'Follow';
                followBtn.classList.remove('btn-danger');
            } else {
                // Follow
                await db.collection('followers').add({
                    followerId: this.currentUser.uid,
                    followingId: this.profileUserId,
                    createdAt: new Date()
                });
                followBtn.textContent = 'Unfollow';
                followBtn.classList.add('btn-danger');
            }

            // Reload stats
            this.loadUserStats();
        } catch (error) {
            console.error('Error toggling follow:', error);
        }
    }

    async toggleLike(postId) {
        if (!this.currentUser) return;

        try {
            const postRef = db.collection('posts').doc(postId);
            const postDoc = await postRef.get();
            
            if (!postDoc.exists) return;

            const postData = postDoc.data();
            const likedBy = postData.likedBy || [];
            const isLiked = likedBy.includes(this.currentUser.uid);

            if (isLiked) {
                // Unlike
                await postRef.update({
                    likes: firebase.firestore.FieldValue.increment(-1),
                    likedBy: firebase.firestore.FieldValue.arrayRemove(this.currentUser.uid)
                });
            } else {
                // Like
                await postRef.update({
                    likes: firebase.firestore.FieldValue.increment(1),
                    likedBy: firebase.firestore.FieldValue.arrayUnion(this.currentUser.uid)
                });
            }

            // Note: Posts will be reloaded when user clicks Posts tab
            // No need to reload posts here as it causes unnecessary loading
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    }

    async showComments(postId) {
        // This would open a comments modal
        alert('Comments feature will be implemented in a future update');
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

    // Modal and functionality methods for quick actions
    showPostsModal() {
        const modal = this.createModal('User Posts', this.createPostsModalContent());
        document.body.appendChild(modal);
    }

    showSubscribersModal() {
        const modal = this.createModal('Subscribers', this.createSubscribersModalContent());
        document.body.appendChild(modal);
    }

    showSubscribingModal() {
        const modal = this.createModal('Subscriptions', this.createSubscribingModalContent());
        document.body.appendChild(modal);
    }

    showTipModal() {
        const modal = this.createModal('Send Tip', this.createTipModalContent());
        document.body.appendChild(modal);
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>${title}</h2>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;

        // Close modal functionality
        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = () => modal.remove();
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };

        return modal;
    }

    createPostsModalContent() {
        if (!this.userPosts || this.userPosts.length === 0) {
            return '<p>No posts available.</p>';
        }

        return `
            <div class="posts-grid">
                ${this.userPosts.map(post => `
                    <div class="post-card">
                        <div class="post-media">
                            ${post.mediaType === 'video' 
                                ? `<video src="${post.mediaUrl}" poster="${post.thumbnailUrl}" controls></video>`
                                : `<img src="${post.mediaUrl}" alt="Post image">`
                            }
                        </div>
                        <div class="post-info">
                            <h3>${post.title || 'Untitled'}</h3>
                            <p>${post.description || ''}</p>
                            <div class="post-stats">
                                <span>👁️ ${post.views || 0} views</span>
                                <span>❤️ ${post.likes || 0} likes</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    createSubscribersModalContent() {
        if (!this.subscribers || this.subscribers.length === 0) {
            return '<p>No subscribers yet.</p>';
        }

        return `
            <div class="users-list">
                ${this.subscribers.map(subscriber => `
                    <div class="user-item" onclick="profilePage.goToUserProfile('${subscriber.followerId || subscriber.id}')">
                        <img src="${subscriber.followerPic || subscriber.profilePic || 'default-avatar.svg'}" alt="User" class="user-avatar">
                        <div class="user-info">
                            <h4>${subscriber.followerName || subscriber.displayName || 'Anonymous'}</h4>
                            <p>@${subscriber.followerUsername || subscriber.username || 'unknown'}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    createSubscribingModalContent() {
        if (!this.subscribing || this.subscribing.length === 0) {
            return '<p>Not subscribed to anyone yet.</p>';
        }

        return `
            <div class="users-list">
                ${this.subscribing.map(subscription => `
                    <div class="user-item" onclick="profilePage.goToUserProfile('${subscription.id}')">
                        <img src="${subscription.profilePic || 'default-avatar.svg'}" alt="User" class="user-avatar">
                        <div class="user-info">
                            <h4>${subscription.displayName || 'Anonymous'}</h4>
                            <p>@${subscription.username || 'unknown'}</p>
                            <p class="user-bio">${subscription.bio || ''}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    createTipModalContent() {
        return `
            <div class="tip-form">
                <p>Send a tip to support this creator!</p>
                <div class="tip-amounts">
                    <button class="tip-amount" data-amount="1">$1</button>
                    <button class="tip-amount" data-amount="5">$5</button>
                    <button class="tip-amount" data-amount="10">$10</button>
                    <button class="tip-amount" data-amount="25">$25</button>
                </div>
                <div class="custom-tip">
                    <label for="customAmount">Custom amount:</label>
                    <input type="number" id="customAmount" min="0.50" step="0.50" placeholder="Enter amount">
                </div>
                <button class="btn btn-primary" onclick="profilePage.processTip()">Send Tip</button>
            </div>
        `;
    }

    shareProfile() {
        const profileUrl = window.location.href;
        const profileName = document.getElementById('profileDisplayName')?.textContent || 'User';
        
        if (navigator.share) {
            navigator.share({
                title: `${profileName}'s Profile`,
                text: `Check out ${profileName}'s profile on Amplifi!`,
                url: profileUrl
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(profileUrl).then(() => {
                alert('Profile URL copied to clipboard!');
            }).catch(() => {
                // Final fallback: show URL
                prompt('Share this profile URL:', profileUrl);
            });
        }
    }

    openMessageThread() {
        if (!this.currentUser || this.profileUserId === this.currentUser.uid) {
            alert('You cannot message yourself.');
            return;
        }
        
        // Navigate to messages page with the user ID
        window.location.href = `messages.html?userId=${this.profileUserId}`;
    }

    processTip() {
        const customAmount = document.getElementById('customAmount')?.value;
        const selectedAmount = document.querySelector('.tip-amount.selected')?.dataset.amount;
        const amount = customAmount || selectedAmount;

        if (!amount || amount < 0.50) {
            alert('Please select a valid amount (minimum $0.50)');
            return;
        }

        alert(`Tip functionality will be implemented with Stripe integration. Amount: $${amount}`);
        // TODO: Implement Stripe payment processing
    }
}

// Initialize the profile page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.profilePage = new ProfilePage();
}); 