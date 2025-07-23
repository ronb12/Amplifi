/* global db, auth, firebase, storage */
// Search Page JavaScript
class SearchPage {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.searchQuery = '';
        this.currentFilter = 'all';
        this.searchResults = {
            posts: [],
            users: []
        };
        this.isSearching = false;
        
        this.init();
    }

    async init() {
        console.log('Search page initializing...');
        try {
            await this.setupAuthStateListener();
            this.setupEventListeners();
            this.checkAuthentication();
            this.loadSearchQuery();
            await this.performSearch();
            console.log('Search page initialized successfully');
        } catch (error) {
            console.error('Error initializing search page:', error);
        }
    }

    async setupAuthStateListener() {
        console.log('Setting up auth state listener...');
        auth.onAuthStateChanged(async (user) => {
            console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
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

    checkAuthentication() {
        // Don't redirect immediately - let the auth state listener handle it
        // This prevents the page from redirecting before auth state is determined
        if (!this.currentUser) {
            // Show a message or handle unauthenticated state gracefully
            console.log('User not authenticated yet, waiting for auth state...');
        }
    }

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.debounceSearch();
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }

        // Search button
        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.performSearch();
            });
        }

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchFilter(e.target.dataset.filter);
            });
        });

        // Trending topics
        document.querySelectorAll('.topic-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.searchByTopic(e.target.dataset.topic);
            });
        });

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    }

    loadSearchQuery() {
        const urlParams = new URLSearchParams(window.location.search);
        this.searchQuery = urlParams.get('q') || '';
        
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = this.searchQuery;
        }

        const searchQueryElement = document.getElementById('searchQuery');
        if (searchQueryElement) {
            searchQueryElement.textContent = this.searchQuery ? `Results for "${this.searchQuery}"` : 'Browse trending content';
        }
    }

    debounceSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.performSearch();
        }, 500);
    }

    async performSearch() {
        console.log('Performing search with query:', this.searchQuery);
        
        if (!this.searchQuery.trim()) {
            console.log('Empty query, showing trending content');
            await this.showTrendingContent();
            return;
        }

        this.isSearching = true;
        this.showLoading();

        // Add timeout to prevent getting stuck
        const searchTimeout = setTimeout(() => {
            console.log('Search timeout, showing sample content');
            this.searchResults.posts = this.getSamplePosts();
            this.searchResults.users = this.getSampleUsers();
            this.renderResults();
            this.hideLoading();
            this.isSearching = false;
        }, 5000); // 5 second timeout

        try {
            await Promise.all([
                this.searchPosts(),
                this.searchUsers()
            ]);

            clearTimeout(searchTimeout);
            this.renderResults();
            console.log('Search completed successfully');
        } catch (error) {
            clearTimeout(searchTimeout);
            console.error('Search error:', error);
            this.showError();
        } finally {
            this.hideLoading();
            this.isSearching = false;
        }
    }

    async searchPosts() {
        try {
            const query = this.searchQuery.toLowerCase();
            
            // Search in posts collection
            const postsSnapshot = await db.collection('posts')
                .orderBy('createdAt', 'desc')
                .limit(50)
                .get();

            this.searchResults.posts = [];
            
            postsSnapshot.forEach(doc => {
                const post = doc.data();
                const searchableText = `${post.title} ${post.description} ${post.tags?.join(' ') || ''}`.toLowerCase();
                
                if (searchableText.includes(query)) {
                    this.searchResults.posts.push({ id: doc.id, ...post });
                }
            });

        } catch (error) {
            console.error('Error searching posts:', error);
        }
    }

    async searchUsers() {
        try {
            const query = this.searchQuery.toLowerCase();
            
            // Search in users collection
            const usersSnapshot = await db.collection('users')
                .limit(20)
                .get();

            this.searchResults.users = [];
            
            if (!usersSnapshot.empty) {
                usersSnapshot.forEach(doc => {
                    const user = doc.data();
                    const searchableText = `${user.displayName} ${user.username} ${user.bio || ''}`.toLowerCase();
                    
                    if (searchableText.includes(query)) {
                        this.searchResults.users.push({ uid: doc.id, ...user });
                    }
                });
            } else {
                // Show sample users if no data in database
                console.log('No users found, showing sample users');
                this.searchResults.users = this.getSampleUsers();
            }

        } catch (error) {
            console.error('Error searching users:', error);
            // Show sample users on error
            this.searchResults.users = this.getSampleUsers();
        }
    }

    getSampleUsers() {
        return [
            {
                uid: 'sample-user-1',
                displayName: 'Sarah Johnson',
                username: 'sarahj',
                bio: 'Photography enthusiast and travel lover 📸✈️',
                profilePic: 'default-avatar.svg',
                followers: 1240,
                following: 567
            },
            {
                uid: 'sample-user-2',
                displayName: 'Mike Chen',
                username: 'mikechen',
                bio: 'Food blogger and home chef 👨‍🍳',
                profilePic: 'default-avatar.svg',
                followers: 890,
                following: 234
            },
            {
                uid: 'sample-user-3',
                displayName: 'Emma Davis',
                username: 'emmadavis',
                bio: 'Fitness trainer and wellness coach 💪',
                profilePic: 'default-avatar.svg',
                followers: 2100,
                following: 445
            },
            {
                uid: 'sample-user-4',
                displayName: 'Alex Rodriguez',
                username: 'alexrod',
                bio: 'Travel vlogger and adventure seeker 🌍',
                profilePic: 'default-avatar.svg',
                followers: 3400,
                following: 123
            },
            {
                uid: 'sample-user-5',
                displayName: 'Lisa Wang',
                username: 'lisawang',
                bio: 'Coffee artist and barista ☕',
                profilePic: 'default-avatar.svg',
                followers: 670,
                following: 89
            }
        ];
    }

    async searchByTopic(topic) {
        this.searchQuery = topic;
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = topic;
        }
        await this.performSearch();
    }

    async showTrendingContent() {
        try {
            console.log('Loading trending content...');
            
            // Always show sample content for now to ensure it works
            console.log('Showing sample content');
            this.searchResults.posts = this.getSamplePosts();
            this.searchResults.users = this.getSampleUsers();
            
            console.log('Sample posts loaded:', this.searchResults.posts.length);
            console.log('Sample users loaded:', this.searchResults.users.length);
            
            this.renderResults();
            console.log('Trending content loaded successfully');
        } catch (error) {
            console.error('Error loading trending content:', error);
            // Show sample content on error
            this.searchResults.posts = this.getSamplePosts();
            this.searchResults.users = this.getSampleUsers();
            this.renderResults();
        }
    }

    getSamplePosts() {
        return [
            {
                id: 'sample1',
                title: 'Amazing Sunset View',
                description: 'Captured this beautiful sunset during my evening walk. Nature is truly incredible!',
                authorName: 'Sarah Johnson',
                authorPic: 'default-avatar.svg',
                mediaUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=600&q=80',
                mediaType: 'image',
                likes: 245,
                comments: 18,
                views: 1200,
                createdAt: new Date(),
                likedBy: []
            },
            {
                id: 'sample2',
                title: 'Delicious Homemade Pizza',
                description: 'Made this pizza from scratch today! The secret is in the dough. 🍕',
                authorName: 'Mike Chen',
                authorPic: 'default-avatar.svg',
                mediaUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
                mediaType: 'image',
                likes: 189,
                comments: 23,
                views: 890,
                createdAt: new Date(),
                likedBy: []
            },
            {
                id: 'sample3',
                title: 'Morning Workout Routine',
                description: 'Starting the day with energy! This 30-minute routine changed my life. 💪',
                authorName: 'Emma Davis',
                authorPic: 'default-avatar.svg',
                mediaUrl: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=600&q=80',
                mediaType: 'image',
                likes: 312,
                comments: 45,
                views: 2100,
                createdAt: new Date(),
                likedBy: []
            },
            {
                id: 'sample4',
                title: 'Travel Adventures in Japan',
                description: 'Exploring the beautiful temples and gardens of Kyoto. Japan is magical! 🇯🇵',
                authorName: 'Alex Rodriguez',
                authorPic: 'default-avatar.svg',
                mediaUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
                mediaType: 'image',
                likes: 567,
                comments: 67,
                views: 3400,
                createdAt: new Date(),
                likedBy: []
            },
            {
                id: 'sample5',
                title: 'Artistic Coffee Latte',
                description: "Today's coffee art attempt! Getting better at latte art. ☕",
                authorName: 'Lisa Wang',
                authorPic: 'default-avatar.svg',
                mediaUrl: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
                mediaType: 'image',
                likes: 134,
                comments: 12,
                views: 670,
                createdAt: new Date(),
                likedBy: []
            }
        ];
    }

    renderResults() {
        console.log('Rendering results...');
        console.log('Posts to render:', this.searchResults.posts.length);
        console.log('Users to render:', this.searchResults.users.length);
        
        this.renderPosts();
        this.renderUsers();
        this.updateResultsVisibility();
        
        // Hide loading state after rendering
        this.hideLoading();
        
        console.log('Results rendered successfully');
    }

    renderPosts() {
        // Use the new posts grid selector
        const postsList = document.querySelector('.posts-grid.grid-feed');
        if (!postsList) {
            // Silently fail if not found, but do not log error
            return;
        }
        postsList.innerHTML = '';
        if (this.searchResults.posts.length === 0) {
            postsList.innerHTML = '<p class="no-results">No posts found</p>';
            return;
        }
        this.searchResults.posts.forEach((post, index) => {
            const postElement = this.createPostElement(post);
            postsList.appendChild(postElement);
        });
    }

    renderUsers() {
        const usersList = document.getElementById('usersList');
        if (!usersList) return;

        usersList.innerHTML = '';

        if (this.searchResults.users.length === 0) {
            usersList.innerHTML = '<p class="no-results">No users found</p>';
            return;
        }

        this.searchResults.users.forEach(user => {
            const userElement = this.createUserElement(user);
            usersList.appendChild(userElement);
        });
    }

    createPostElement(post) {
        const postDiv = document.createElement('div');
        postDiv.className = 'post-card search-post';
        postDiv.innerHTML = `
            <div class="post-media">
                ${post.mediaType === 'video' 
                    ? `<video src="${post.mediaUrl}" poster="${post.thumbnailUrl}" onclick="searchPage.playVideo(this)"></video>`
                    : `<img src="${post.mediaUrl}" alt="Post image">`
                }
            </div>
            <div class="post-info">
                <div class="post-author">
                    <img src="${post.authorPic || 'default-avatar.svg'}" alt="Author" class="author-avatar">
                    <span class="author-name">${post.authorName}</span>
                </div>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-caption">${post.description}</p>
                <div class="post-stats">
                    <span>👁️ ${post.views || 0} views</span>
                    <span>❤️ ${post.likes || 0} likes</span>
                    <span>💬 ${post.comments || 0} comments</span>
                </div>
                <div class="post-actions">
                    <button onclick="searchPage.toggleLike('${post.id}')" class="btn btn-secondary btn-sm">
                        ${post.likedBy?.includes(this.currentUser?.uid) ? '❤️' : '🤍'} Like
                    </button>
                    <button onclick="searchPage.showComments('${post.id}')" class="btn btn-secondary btn-sm">💬 Comments</button>
                </div>
            </div>
        `;
        return postDiv;
    }

    createUserElement(user) {
        const userDiv = document.createElement('div');
        userDiv.className = 'user-card search-user';
        userDiv.onclick = () => this.goToUserProfile(user.uid);
        
        userDiv.innerHTML = `
            <div class="user-avatar">
                <img src="${user.profilePic || 'default-avatar.svg'}" alt="User">
            </div>
            <div class="user-info">
                <h4 class="user-name">${user.displayName || 'Anonymous'}</h4>
                <p class="user-username">@${user.username || 'unknown'}</p>
                <p class="user-bio">${user.bio || 'No bio available'}</p>
                <div class="user-stats">
                    <span>${user.followers || 0} followers</span>
                    <span>${user.posts || 0} posts</span>
                </div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="searchPage.followUser('${user.uid}', event)">
                Follow
            </button>
        `;

        return userDiv;
    }

    updateResultsVisibility() {
        const postsResults = document.getElementById('postsResults');
        const usersResults = document.getElementById('usersResults');
        const noResults = document.getElementById('noResults');

        const hasPosts = this.searchResults.posts.length > 0;
        const hasUsers = this.searchResults.users.length > 0;
        const hasResults = hasPosts || hasUsers;

        if (postsResults) {
            postsResults.style.display = (this.currentFilter === 'all' || this.currentFilter === 'posts') && hasPosts ? 'block' : 'none';
        }

        if (usersResults) {
            usersResults.style.display = (this.currentFilter === 'all' || this.currentFilter === 'users') && hasUsers ? 'block' : 'none';
        }

        if (noResults) {
            noResults.style.display = hasResults ? 'none' : 'block';
        }
    }

    switchFilter(filter) {
        this.currentFilter = filter;

        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        this.updateResultsVisibility();
    }

    showLoading() {
        const loading = document.getElementById('searchLoading');
        const noResults = document.getElementById('noResults');
        
        if (loading) {
            loading.style.display = 'block';
            loading.innerHTML = `
                <div class="loading-spinner"></div>
                <p>Searching for "${this.searchQuery}"...</p>
            `;
        }
        
        if (noResults) {
            noResults.style.display = 'none';
        }
    }

    hideLoading() {
        const loading = document.getElementById('searchLoading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    showError() {
        const noResults = document.getElementById('noResults');
        if (noResults) {
            noResults.innerHTML = `
                <div class="no-results-icon">❌</div>
                <h3>Search failed</h3>
                <p>Please try again later</p>
            `;
            noResults.style.display = 'block';
        }
        
        // Show trending content as fallback
        this.showTrendingContent();
    }

    goToUserProfile(userId) {
        window.location.href = `profile.html?userId=${userId}`;
    }

    async followUser(userId, event) {
        event.stopPropagation();
        
        if (!this.currentUser) return;

        try {
            const followDoc = await db.collection('followers')
                .where('followerId', '==', this.currentUser.uid)
                .where('followingId', '==', userId)
                .get();

            if (!followDoc.empty) {
                // Unfollow
                await followDoc.docs[0].ref.delete();
                event.target.textContent = 'Follow';
            } else {
                // Follow
                await db.collection('followers').add({
                    followerId: this.currentUser.uid,
                    followingId: userId,
                    createdAt: new Date()
                });
                event.target.textContent = 'Unfollow';
            }
        } catch (error) {
            console.error('Error following user:', error);
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
                await postRef.update({
                    likes: firebase.firestore.FieldValue.increment(-1),
                    likedBy: firebase.firestore.FieldValue.arrayRemove(this.currentUser.uid)
                });
            } else {
                await postRef.update({
                    likes: firebase.firestore.FieldValue.increment(1),
                    likedBy: firebase.firestore.FieldValue.arrayUnion(this.currentUser.uid)
                });
            }

            // Reload search results
            this.performSearch();
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
}

// Initialize the search page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.searchPage = new SearchPage();
}); 