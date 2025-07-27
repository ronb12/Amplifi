/* global db, auth, firebase, storage */
// Dashboard Page JavaScript
class DashboardPage {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.charts = {};
        this.currentTab = 'overview';
        this.isAdmin = false; // Add this property
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.setupAuthStateListener();
        // Don't check authentication here - let the auth state listener handle it
    }

    async setupAuthStateListener() {
        auth.onAuthStateChanged(async (user) => {
            console.log('Auth state changed:', user ? user.email : 'No user');
            
            if (user) {
                this.currentUser = user;
                console.log('Loading user profile for:', user.email);
                await this.loadUserProfile();
                this.updateUIForAuthenticatedUser();
                this.loadDashboardData();
                await this.checkAdminPostingRestrictions(); // Check admin status after user is loaded
            } else {
                console.log('No user authenticated, redirecting to login');
                this.currentUser = null;
                this.updateUIForUnauthenticatedUser();
                // Add a small delay to prevent immediate redirect
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 100);
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
        if (!this.currentUser) {
            window.location.href = 'index.html';
        }
    }

    setupEventListeners() {
        // Dashboard tabs
        document.querySelectorAll('.dashboard-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
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

        // Quick actions
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const href = btn.getAttribute('href');
                if (href) {
                    window.location.href = href;
                }
            });
        });

        // Post filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterPosts(e.target.dataset.filter);
            });
        });
    }

    switchTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.dashboard-tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Remove active class from all tab buttons
        document.querySelectorAll('.dashboard-tab').forEach(btn => {
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
        } else if (tabName === 'analytics') {
            this.loadAnalytics();
        } else if (tabName === 'earnings') {
            this.loadEarnings();
        }
    }

    async loadDashboardData() {
        await this.loadStats();
        await this.loadRecentActivity();
        await this.loadUserPosts();
        await this.loadAnalytics();
        await this.loadEarnings();
    }

    async refreshDashboard() {
        try {
            console.log('Refreshing dashboard...');
            
            // Add loading state to refresh button
            const refreshBtn = document.querySelector('.refresh-btn');
            if (refreshBtn) {
                refreshBtn.classList.add('loading');
                refreshBtn.disabled = true;
            }

            // Reload all dashboard data
            await this.loadStats();
            await this.loadRecentActivity();
            await this.loadUserPosts();
            await this.loadAnalytics();
            await this.loadEarnings();
            
            // Check for missing tips
            // await this.checkAndAddMissingTip(); // Removed as tips are automatic

            console.log('Dashboard refreshed successfully');
            
            // Show success feedback
            this.showRefreshSuccess();
            
        } catch (error) {
            console.error('Error refreshing dashboard:', error);
            alert('Error refreshing dashboard: ' + error.message);
        } finally {
            // Remove loading state
            const refreshBtn = document.querySelector('.refresh-btn');
            if (refreshBtn) {
                refreshBtn.classList.remove('loading');
                refreshBtn.disabled = false;
            }
        }
    }

    showRefreshSuccess() {
        // Create a temporary success message
        const successMsg = document.createElement('div');
        successMsg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        successMsg.textContent = '✅ Dashboard refreshed successfully!';
        document.body.appendChild(successMsg);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (successMsg.parentNode) {
                successMsg.parentNode.removeChild(successMsg);
            }
        }, 3000);
    }

    // Test function to debug tips
    async debugTips() {
        try {
            console.log('=== DEBUGGING TIPS ===');
            console.log('Current user ID:', this.currentUser.uid);
            
            // Check all tips in the collection
            const allTipsSnapshot = await db.collection('tips').get();
            console.log('Total tips in collection:', allTipsSnapshot.size);
            
            allTipsSnapshot.forEach(doc => {
                const tip = doc.data();
                console.log('Tip ID:', doc.id, 'Tip data:', tip);
            });
            
            // Check tips for current user
            const userTipsSnapshot = await db.collection('tips')
                .where('recipientId', '==', this.currentUser.uid)
                .get();
            
            console.log('Tips for current user:', userTipsSnapshot.size);
            userTipsSnapshot.forEach(doc => {
                const tip = doc.data();
                console.log('User tip ID:', doc.id, 'Tip data:', tip);
            });
            
            // Check earnings
            const earningsDoc = await db.collection('earnings').doc(this.currentUser.uid).get();
            console.log('Earnings doc exists:', earningsDoc.exists);
            if (earningsDoc.exists) {
                console.log('Current earnings:', earningsDoc.data());
            }
            
            console.log('=== END DEBUGGING ===');
        } catch (error) {
            console.error('Error debugging tips:', error);
        }
    }

    // Function to clean up manual tips and recalculate earnings
    async cleanupManualTips() {
        try {
            console.log('=== CLEANING UP MANUAL TIPS ===');
            
            // Find and remove manual tips
            const manualTipsSnapshot = await db.collection('tips')
                .where('recipientId', '==', this.currentUser.uid)
                .where('paymentIntentId', '==', 'manual-addition')
                .get();
            
            console.log('Manual tips found:', manualTipsSnapshot.size);
            
            // Delete manual tips
            const deletePromises = [];
            manualTipsSnapshot.forEach(doc => {
                console.log('Deleting manual tip:', doc.id);
                deletePromises.push(doc.ref.delete());
            });
            
            await Promise.all(deletePromises);
            console.log('Manual tips deleted');
            
            // Recalculate earnings from remaining tips
            const remainingTipsSnapshot = await db.collection('tips')
                .where('recipientId', '==', this.currentUser.uid)
                .get();
            
            let totalEarnings = 0;
            remainingTipsSnapshot.forEach(doc => {
                const tip = doc.data();
                totalEarnings += tip.amount;
                console.log('Remaining tip:', tip.amount, 'from', tip.senderName);
            });
            
            console.log('Recalculated total earnings:', totalEarnings);
            
            // Update earnings document
            const earningsRef = db.collection('earnings').doc(this.currentUser.uid);
            await earningsRef.set({
                totalEarnings: totalEarnings,
                userId: this.currentUser.uid,
                lastUpdated: firebase.firestore.Timestamp.fromDate(new Date())
            }, { merge: true });
            
            console.log('Earnings updated to:', totalEarnings);
            console.log('=== CLEANUP COMPLETE ===');
            
            alert(`Cleaned up manual tips. Total earnings now: $${totalEarnings.toFixed(2)}`);
            
            // Refresh dashboard
            await this.refreshDashboard();
            
        } catch (error) {
            console.error('Error cleaning up manual tips:', error);
            alert('Error cleaning up tips: ' + error.message);
        }
    }

    async loadStats() {
        try {
            console.log('Loading stats for user:', this.currentUser.uid);
            
            // Get user's posts
            const postsSnapshot = await db.collection('posts')
                .where('authorId', '==', this.currentUser.uid)
                .get();
            
            let totalViews = 0;
            let totalLikes = 0;
            let totalComments = 0;
            const posts = [];
            
            postsSnapshot.forEach(doc => {
                const post = doc.data();
                posts.push(post);
                totalViews += post.views || 0;
                totalLikes += post.likes || 0;
                totalComments += post.commentCount || 0;
            });
            
            console.log('Posts found:', posts.length);
            console.log('Total views:', totalViews);
            console.log('Total likes:', totalLikes);
            console.log('Total comments:', totalComments);
            
            // Get followers count
            const followersSnapshot = await db.collection('followers')
                .where('followingId', '==', this.currentUser.uid)
                .get();
            
            const followersCount = followersSnapshot.size;
            console.log('Followers count:', followersCount);
            
            // Get earnings
            const earningsDoc = await db.collection('earnings').doc(this.currentUser.uid).get();
            const totalEarnings = earningsDoc.exists ? earningsDoc.data().totalEarnings || 0 : 0;
            console.log('Total earnings:', totalEarnings);
            
            // Update stats in UI
            this.updateStatsUI({
                totalViews,
                totalLikes,
                totalComments,
                followersCount,
                totalEarnings,
                postsCount: posts.length
            });
            
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    updateStatsUI(stats) {
        console.log('Updating stats UI with:', stats);
        
        // Update total views
        const viewsElement = document.getElementById('totalViews');
        if (viewsElement) {
            viewsElement.textContent = stats.totalViews.toLocaleString();
        }
        
        // Update total likes
        const likesElement = document.getElementById('totalLikes');
        if (likesElement) {
            likesElement.textContent = stats.totalLikes.toLocaleString();
        }
        
        // Update total comments
        const commentsElement = document.getElementById('totalComments');
        if (commentsElement) {
            commentsElement.textContent = stats.totalComments.toLocaleString();
        }
        
        // Update followers
        const followersElement = document.getElementById('totalFollowers');
        if (followersElement) {
            followersElement.textContent = stats.followersCount.toLocaleString();
        }
        
        // Update earnings
        const earningsElement = document.getElementById('totalEarnings');
        if (earningsElement) {
            earningsElement.textContent = `$${stats.totalEarnings.toFixed(2)}`;
        }
        
        // Update posts count
        const postsElement = document.getElementById('totalPosts');
        if (postsElement) {
            postsElement.textContent = stats.postsCount.toLocaleString();
        }
        
        console.log('Stats UI updated successfully');
    }

    async loadRecentActivity() {
        try {
            const activityList = document.getElementById('recentActivity');
            if (!activityList) return;

            // Get recent posts
            const postsSnapshot = await db.collection('posts')
                .where('authorId', '==', this.currentUser.uid)
                .orderBy('createdAt', 'desc')
                .limit(5)
                .get();

            const activities = [];
            
            postsSnapshot.forEach(doc => {
                const post = doc.data();
                activities.push({
                    type: 'post',
                    icon: '📈',
                    text: `Your post "${post.title}" got ${post.views || 0} views`,
                    time: post.createdAt
                });
            });

            // Get recent comments
            const commentsSnapshot = await db.collection('comments')
                .where('postAuthorId', '==', this.currentUser.uid)
                .orderBy('createdAt', 'desc')
                .limit(3)
                .get();

            commentsSnapshot.forEach(doc => {
                const comment = doc.data();
                activities.push({
                    type: 'comment',
                    icon: '💬',
                    text: `New comment on "${comment.postTitle}"`,
                    time: comment.createdAt
                });
            });

            // Get recent tips
            console.log('Loading tips for user:', this.currentUser.uid);
            const tipsSnapshot = await db.collection('tips')
                .where('recipientId', '==', this.currentUser.uid)
                .orderBy('createdAt', 'desc')
                .limit(3)
                .get();

            console.log('Tips found:', tipsSnapshot.size);
            tipsSnapshot.forEach(doc => {
                const tip = doc.data();
                console.log('Tip data:', tip);
                activities.push({
                    type: 'tip',
                    icon: '💰',
                    text: `Received $${tip.amount.toFixed(2)} tip from ${tip.senderName}`,
                    time: tip.createdAt
                });
            });

            console.log('Total activities before sorting:', activities.length);
            console.log('Activities:', activities);

            // Sort activities by time
            activities.sort((a, b) => b.time.toDate() - a.time.toDate());

            console.log('Activities after sorting:', activities);
            console.log('Rendering top 5 activities:', activities.slice(0, 5));

            // Render activities
            this.renderActivities(activities.slice(0, 5));

        } catch (error) {
            console.error('Error loading recent activity:', error);
        }
    }

    renderActivities(activities) {
        const activityList = document.getElementById('recentActivity');
        if (!activityList) {
            console.error('Activity list element not found');
            return;
        }

        console.log('Rendering activities:', activities);
        console.log('Activity list element:', activityList);

        activityList.innerHTML = '';

        if (activities.length === 0) {
            console.log('No activities to render, showing no activity message');
            activityList.innerHTML = '<p class="no-activity">No recent activity</p>';
            return;
        }

        activities.forEach((activity, index) => {
            console.log(`Rendering activity ${index}:`, activity);
            const activityElement = document.createElement('div');
            activityElement.className = 'activity-item';
            activityElement.innerHTML = `
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-content">
                    <p>${activity.text}</p>
                    <span class="activity-time">${this.formatTimestamp(activity.time)}</span>
                </div>
            `;
            activityList.appendChild(activityElement);
            console.log(`Activity ${index} element created:`, activityElement);
        });

        console.log('Final activity list HTML:', activityList.innerHTML);
    }

    async loadUserPosts() {
        try {
            const postsContainer = document.getElementById('userPosts');
            if (!postsContainer) return;

            const loadingElement = document.getElementById('postsLoading');
            if (loadingElement) loadingElement.style.display = 'block';

            const postsSnapshot = await db.collection('posts')
                .where('authorId', '==', this.currentUser.uid)
                .orderBy('createdAt', 'desc')
                .get();

            const posts = [];
            postsSnapshot.forEach(doc => {
                posts.push({ id: doc.id, ...doc.data() });
            });

            this.renderUserPosts(posts);

            if (loadingElement) loadingElement.style.display = 'none';

        } catch (error) {
            console.error('Error loading user posts:', error);
        }
    }

    renderUserPosts(posts) {
        const postsContainer = document.getElementById('userPosts');
        if (!postsContainer) return;

        postsContainer.innerHTML = '';

        if (posts.length === 0) {
            postsContainer.innerHTML = '<p class="no-posts">No posts yet. Start sharing your content!</p>';
            return;
        }

        posts.forEach(post => {
            const postElement = this.createPostElement(post);
            postsContainer.appendChild(postElement);
        });
    }

    createPostElement(post) {
        const postDiv = document.createElement('div');
        postDiv.className = 'post-card dashboard-post';
        postDiv.innerHTML = `
            <div class="post-media">
                ${post.mediaType === 'video' 
                    ? `<video src="${post.mediaUrl}" poster="${post.thumbnailUrl}"></video>`
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
                    <button onclick="dashboardPage.editPost('${post.id}')" class="btn btn-secondary btn-sm">Edit</button>
                    <button onclick="dashboardPage.deletePost('${post.id}')" class="btn btn-danger btn-sm">Delete</button>
                </div>
            </div>
        `;
        return postDiv;
    }

    filterPosts(filter) {
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        // Reload posts with filter
        this.loadUserPosts();
    }

    async loadAnalytics() {
        // Initialize charts if not already done
        if (!this.charts.views) {
            this.initializeCharts();
        }
        
        // Load analytics data
        await this.loadViewsData();
        await this.loadEngagementData();
        await this.loadTopPosts();
        await this.loadDemographicsData();
    }

    initializeCharts() {
        // Views Chart
        const viewsCtx = document.getElementById('viewsCanvas');
        if (viewsCtx) {
            this.charts.views = new Chart(viewsCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Views',
                        data: [],
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Engagement Chart
        const engagementCtx = document.getElementById('engagementCanvas');
        if (engagementCtx) {
            this.charts.engagement = new Chart(engagementCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Likes', 'Comments', 'Shares'],
                    datasets: [{
                        data: [0, 0, 0],
                        backgroundColor: ['#6366f1', '#10b981', '#f59e0b']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        // Demographics Chart
        const demographicsCtx = document.getElementById('demographicsCanvas');
        if (demographicsCtx) {
            this.charts.demographics = new Chart(demographicsCtx, {
                type: 'bar',
                data: {
                    labels: ['18-24', '25-34', '35-44', '45-54', '55+'],
                    datasets: [{
                        label: 'Age Distribution',
                        data: [0, 0, 0, 0, 0],
                        backgroundColor: '#6366f1'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

    async loadViewsData() {
        try {
            const postsSnapshot = await db.collection('posts')
                .where('authorId', '==', this.currentUser.uid)
                .orderBy('createdAt', 'desc')
                .limit(7)
                .get();

            const viewsData = [];
            const labels = [];

            postsSnapshot.forEach(doc => {
                const post = doc.data();
                viewsData.push(post.views || 0);
                // Handle both Firestore timestamps and regular Date objects
                const postDate = post.createdAt && typeof post.createdAt.toDate === 'function' ? post.createdAt.toDate() : new Date(post.createdAt);
                labels.push(this.formatDate(postDate));
            });

            if (this.charts.views) {
                this.charts.views.data.labels = labels.reverse();
                this.charts.views.data.datasets[0].data = viewsData.reverse();
                this.charts.views.update();
            }
        } catch (error) {
            console.error('Error loading views data:', error);
        }
    }

    async loadEngagementData() {
        try {
            const postsSnapshot = await db.collection('posts')
                .where('authorId', '==', this.currentUser.uid)
                .get();

            let totalLikes = 0;
            let totalComments = 0;
            let totalShares = 0;

            postsSnapshot.forEach(doc => {
                const post = doc.data();
                totalLikes += post.likes || 0;
                totalComments += post.comments || 0;
                totalShares += post.shares || 0;
            });

            if (this.charts.engagement) {
                this.charts.engagement.data.datasets[0].data = [totalLikes, totalComments, totalShares];
                this.charts.engagement.update();
            }
        } catch (error) {
            console.error('Error loading engagement data:', error);
        }
    }

    async loadTopPosts() {
        try {
            // Get posts by author, then sort client-side to avoid index requirement
            const postsSnapshot = await db.collection('posts')
                .where('authorId', '==', this.currentUser.uid)
                .limit(20) // Get more posts to sort from
                .get();

            const topPostsContainer = document.getElementById('topPosts');
            if (!topPostsContainer) return;

            topPostsContainer.innerHTML = '';

            // Sort posts by views client-side
            const posts = [];
            postsSnapshot.forEach(doc => {
                posts.push({ id: doc.id, ...doc.data() });
            });
            
            // Sort by views (descending) and take top 5
            posts.sort((a, b) => (b.views || 0) - (a.views || 0));
            const topPosts = posts.slice(0, 5);

            topPosts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.className = 'top-post-item';
                postElement.innerHTML = `
                    <div class="top-post-info">
                        <h4>${post.title}</h4>
                        <p>${post.views || 0} views • ${post.likes || 0} likes</p>
                    </div>
                    <div class="top-post-thumbnail">
                        <img src="${post.thumbnailUrl || post.mediaUrl}" alt="Post thumbnail">
                    </div>
                `;
                topPostsContainer.appendChild(postElement);
            });
        } catch (error) {
            console.error('Error loading top posts:', error);
        }
    }

    async loadDemographicsData() {
        // Mock demographics data for now
        const demographicsData = [25, 35, 20, 15, 5];
        
        if (this.charts.demographics) {
            this.charts.demographics.data.datasets[0].data = demographicsData;
            this.charts.demographics.update();
        }
    }

    async loadEarnings() {
        try {
            const earningsDoc = await db.collection('earnings').doc(this.currentUser.uid).get();
            
            let monthlyEarnings = 0;
            let lifetimeEarnings = 0;
            
            if (earningsDoc.exists) {
                const earnings = earningsDoc.data();
                monthlyEarnings = earnings.monthlyEarnings || 0;
                lifetimeEarnings = earnings.totalEarnings || 0;
            }

            document.getElementById('monthlyEarnings').textContent = `$${monthlyEarnings.toFixed(2)}`;
            document.getElementById('lifetimeEarnings').textContent = `$${lifetimeEarnings.toFixed(2)}`;

            // Load earnings breakdown
            await this.loadEarningsBreakdown();

        } catch (error) {
            console.error('Error loading earnings:', error);
        }
    }

    async loadEarningsBreakdown() {
        try {
            const tipsSnapshot = await db.collection('tips')
                .where('recipientId', '==', this.currentUser.uid)
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();

            const breakdownContainer = document.getElementById('earningsBreakdown');
            if (!breakdownContainer) return;

            breakdownContainer.innerHTML = '';

            tipsSnapshot.forEach(doc => {
                const tip = doc.data();
                const tipElement = document.createElement('div');
                tipElement.className = 'breakdown-item';
                tipElement.innerHTML = `
                    <div class="breakdown-info">
                        <span class="breakdown-amount">$${tip.amount.toFixed(2)}</span>
                        <span class="breakdown-source">Tip from ${tip.senderName}</span>
                    </div>
                    <span class="breakdown-date">${this.formatTimestamp(tip.createdAt)}</span>
                `;
                breakdownContainer.appendChild(tipElement);
            });
        } catch (error) {
            console.error('Error loading earnings breakdown:', error);
        }
    }

    async editPost(postId) {
        // Redirect to upload page with post data
        window.location.href = `upload.html?edit=${postId}`;
    }

    async deletePost(postId) {
        if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            try {
                await db.collection('posts').doc(postId).delete();
                this.loadUserPosts(); // Reload posts
                alert('Post deleted successfully');
            } catch (error) {
                console.error('Error deleting post:', error);
                alert('Failed to delete post');
            }
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

    formatDate(date) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    // AI Content Creation
    async createAIContent() {
        if (!this.currentUser) return;

        const aiModal = document.createElement('div');
        aiModal.className = 'modal';
        aiModal.innerHTML = `
            <div class="modal-content ai-content-modal">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <h3>🤖 AI Content Creator</h3>
                <div class="ai-content-form">
                    <div class="form-group">
                        <label>Content Type:</label>
                        <select id="aiContentType" class="form-control">
                            <option value="inspirational">💭 Inspirational Quote</option>
                            <option value="tech">💻 Tech Tip</option>
                            <option value="lifestyle">🌟 Lifestyle</option>
                            <option value="business">💼 Business</option>
                            <option value="creative">🎨 Creative</option>
                            <option value="custom">✏️ Custom</option>
                        </select>
                    </div>
                    
                    <div class="form-group" id="customPromptGroup" style="display: none;">
                        <label>Custom Prompt:</label>
                        <textarea id="customPrompt" class="form-control" placeholder="Describe the content you want to create..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Include AI Image:</label>
                        <input type="checkbox" id="includeAIImage" checked>
                        <small>Generate matching image with AI</small>
                    </div>
                    
                    <div class="form-group">
                        <label>Hashtags:</label>
                        <input type="text" id="aiHashtags" class="form-control" placeholder="#amplifi #social #content">
                    </div>
                    
                    <div class="ai-preview" id="aiPreview" style="display: none;">
                        <h4>Preview:</h4>
                        <div id="aiPreviewContent"></div>
                    </div>
                    
                    <div class="ai-actions">
                        <button onclick="dashboardPage.generateAIContent()" class="btn btn-primary">
                            🎨 Generate Content
                        </button>
                        <button onclick="dashboardPage.postAIContent()" class="btn btn-success" id="postAIBtn" style="display: none;">
                            📤 Post to Feed
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(aiModal);
        aiModal.style.display = 'block';
        
        this.setupAIContentListeners();
    }

    setupAIContentListeners() {
        const contentType = document.getElementById('aiContentType');
        const customPromptGroup = document.getElementById('customPromptGroup');
        const includeAIImage = document.getElementById('includeAIImage');
        
        if (contentType) {
            contentType.addEventListener('change', () => {
                if (contentType.value === 'custom') {
                    customPromptGroup.style.display = 'block';
                } else {
                    customPromptGroup.style.display = 'none';
                }
            });
        }
    }

    async generateAIContent() {
        const contentType = document.getElementById('aiContentType')?.value;
        const customPrompt = document.getElementById('customPrompt')?.value;
        const includeAIImage = document.getElementById('includeAIImage')?.checked;
        const hashtags = document.getElementById('aiHashtags')?.value;
        
        const generateBtn = document.querySelector('.ai-actions .btn-primary');
        const postBtn = document.getElementById('postAIBtn');
        const preview = document.getElementById('aiPreview');
        const previewContent = document.getElementById('aiPreviewContent');
        
        if (generateBtn) generateBtn.textContent = '🔄 Generating...';
        if (generateBtn) generateBtn.disabled = true;
        
        try {
            // Generate content based on type
            let title, description, imagePrompt;
            
            switch (contentType) {
                case 'inspirational':
                    title = 'Daily Inspiration';
                    description = await this.generateInspirationalQuote();
                    imagePrompt = 'inspiring quote on beautiful background, motivational, uplifting';
                    break;
                case 'tech':
                    title = 'Tech Tip of the Day';
                    description = await this.generateTechTip();
                    imagePrompt = 'modern technology, clean design, digital innovation';
                    break;
                case 'lifestyle':
                    title = 'Lifestyle Moment';
                    description = await this.generateLifestyleContent();
                    imagePrompt = 'lifestyle photography, beautiful, aspirational';
                    break;
                case 'business':
                    title = 'Business Insight';
                    description = await this.generateBusinessContent();
                    imagePrompt = 'professional business setting, modern office, success';
                    break;
                case 'creative':
                    title = 'Creative Inspiration';
                    description = await this.generateCreativeContent();
                    imagePrompt = 'artistic, creative, colorful, inspiring';
                    break;
                case 'custom':
                    title = 'Custom Content';
                    description = await this.generateCustomContent(customPrompt);
                    imagePrompt = customPrompt || 'beautiful, engaging, social media content';
                    break;
                default:
                    title = 'Amplifi Content';
                    description = 'Welcome to Amplifi! 🎉';
                    imagePrompt = 'social media, modern, engaging';
            }
            
            // Add hashtags
            if (hashtags) {
                description += `\n\n${hashtags}`;
            }
            
            // Store generated content
            this.generatedAIContent = {
                title,
                description,
                imagePrompt,
                includeAIImage,
                hashtags: this.extractHashtags(description)
            };
            
            // Show preview
            if (preview && previewContent) {
                previewContent.innerHTML = `
                    <div class="ai-preview-item">
                        <h5>${title}</h5>
                        <p>${description}</p>
                        ${includeAIImage ? '<small>🖼️ AI image will be generated</small>' : ''}
                    </div>
                `;
                preview.style.display = 'block';
            }
            
            if (postBtn) postBtn.style.display = 'inline-block';
            
        } catch (error) {
            console.error('Error generating AI content:', error);
            alert('Failed to generate content. Please try again.');
        } finally {
            if (generateBtn) {
                generateBtn.textContent = '🎨 Generate Content';
                generateBtn.disabled = false;
            }
        }
    }

    async generateInspirationalQuote() {
        const quotes = [
            "The only way to do great work is to love what you do. - Steve Jobs",
            "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
            "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
            "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
            "The best way to predict the future is to create it. - Peter Drucker",
            "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
            "The journey of a thousand miles begins with one step. - Lao Tzu",
            "Believe you can and you're halfway there. - Theodore Roosevelt"
        ];
        
        return quotes[Math.floor(Math.random() * quotes.length)];
    }

    async generateTechTip() {
        const tips = [
            "💡 Pro tip: Use keyboard shortcuts to boost your productivity! Ctrl+C, Ctrl+V, Ctrl+Z - master these basics first.",
            "🔒 Security reminder: Always use strong, unique passwords and enable 2FA on your accounts.",
            "📱 Did you know? You can take screenshots on most devices with simple key combinations!",
            "⚡ Performance hack: Clear your browser cache regularly for faster loading times.",
            "🌐 Internet tip: Use incognito mode when shopping to avoid price tracking.",
            "📧 Email efficiency: Use filters and labels to organize your inbox automatically.",
            "💾 Backup your data regularly - you never know when you'll need it!",
            "🎯 Focus tip: Use the Pomodoro Technique - 25 minutes of focused work, then a 5-minute break."
        ];
        
        return tips[Math.floor(Math.random() * tips.length)];
    }

    async generateLifestyleContent() {
        const content = [
            "🌟 Start your day with gratitude. What are you thankful for today?",
            "☕ Morning ritual: Take 5 minutes to enjoy your coffee and set intentions for the day.",
            "🌿 Self-care isn't selfish. Take time to recharge and refresh your mind.",
            "📚 Reading tip: Keep a book by your bedside for peaceful evening reading.",
            "🏃‍♀️ Movement matters: Even 10 minutes of walking can boost your mood and energy.",
            "🧘‍♀️ Mindfulness moment: Take 3 deep breaths and center yourself.",
            "🎨 Creative expression: Try something new today - draw, write, or create!",
            "🌅 Sunset appreciation: Take a moment to enjoy the beauty around you."
        ];
        
        return content[Math.floor(Math.random() * content.length)];
    }

    async generateBusinessContent() {
        const content = [
            "💼 Business insight: Focus on solving problems, not just selling products.",
            "📈 Growth mindset: Every challenge is an opportunity to learn and improve.",
            "🤝 Networking tip: Build genuine relationships, not just connections.",
            "🎯 Goal setting: Break big goals into small, actionable steps.",
            "💡 Innovation: The best ideas often come from listening to your customers.",
            "📊 Data-driven decisions: Let the numbers guide your strategy.",
            "🌟 Leadership: Lead by example and inspire others to do their best.",
            "🚀 Success: Consistency beats perfection every time."
        ];
        
        return content[Math.floor(Math.random() * content.length)];
    }

    async generateCreativeContent() {
        const content = [
            "🎨 Creativity is intelligence having fun. What will you create today?",
            "✨ Inspiration is everywhere - you just need to look for it.",
            "🎭 Art is not what you see, but what you make others see.",
            "🎪 Life is a canvas - paint it with your dreams and passions.",
            "🌟 Every artist was first an amateur. Start creating today!",
            "🎯 Creative block? Try changing your environment or routine.",
            "🎨 The best time to create is when you don't feel like it.",
            "✨ Your unique perspective is your superpower - share it with the world!"
        ];
        
        return content[Math.floor(Math.random() * content.length)];
    }

    async generateCustomContent(prompt) {
        // For now, return a placeholder. In a real implementation, you'd call an AI API
        return `Custom content based on: "${prompt}"\n\nThis is a placeholder for AI-generated content. In a real implementation, this would call ChatGPT, Claude, or another AI service to generate content based on your prompt.`;
    }

    extractHashtags(text) {
        const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
        const hashtags = text.match(hashtagRegex);
        return hashtags ? hashtags.map(tag => tag.substring(1).toLowerCase()) : [];
    }

    async postAIContent() {
        if (!this.generatedAIContent) {
            alert('Please generate content first');
            return;
        }

        const postBtn = document.getElementById('postAIBtn');
        if (postBtn) postBtn.textContent = '📤 Posting...';
        if (postBtn) postBtn.disabled = true;

        try {
            let mediaUrl = '';
            let thumbnailUrl = '';

            // Generate AI image if requested
            if (this.generatedAIContent.includeAIImage) {
                mediaUrl = await this.generateAIImage(this.generatedAIContent.imagePrompt);
                thumbnailUrl = mediaUrl; // For images, use the same URL
            }

            // Create post data
            const postData = {
                title: this.generatedAIContent.title,
                description: this.generatedAIContent.description,
                hashtags: this.generatedAIContent.hashtags,
                mediaUrl: mediaUrl,
                thumbnailUrl: thumbnailUrl,
                mediaType: this.generatedAIContent.includeAIImage ? 'image' : 'text',
                authorId: this.currentUser.uid,
                authorName: this.userProfile?.displayName || 'Amplifi Admin',
                authorUsername: this.userProfile?.username || 'amplifi_admin',
                authorPic: this.userProfile?.profilePic || '',
                isAIGenerated: true,
                aiGeneratedAt: new Date(),
                likes: 0,
                comments: 0,
                reactions: {
                    like: 0,
                    love: 0,
                    haha: 0,
                    wow: 0,
                    sad: 0,
                    angry: 0
                },
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Save to Firestore
            await db.collection('posts').add(postData);

            // Update user's post count
            await db.collection('users').doc(this.currentUser.uid).update({
                postCount: firebase.firestore.FieldValue.increment(1),
                lastPosted: new Date()
            });

            alert('AI content posted successfully! 🎉');
            
            // Close modal
            const modal = document.querySelector('.ai-content-modal').parentElement.parentElement;
            if (modal) modal.remove();

        } catch (error) {
            console.error('Error posting AI content:', error);
            alert('Failed to post content. Please try again.');
        } finally {
            if (postBtn) {
                postBtn.textContent = '📤 Post to Feed';
                postBtn.disabled = false;
            }
        }
    }

    async generateAIImage(prompt) {
        // For now, return a placeholder image. In a real implementation, you'd call an AI image generation API
        // Examples: DALL-E, Midjourney, Stable Diffusion, etc.
        
        // Placeholder: Return a random Unsplash image based on the prompt
        const keywords = prompt.split(' ').slice(0, 3).join(',');
        // Try Unsplash, fallback to a local placeholder if 503
        const url = `https://source.unsplash.com/800x600/?${encodeURIComponent(keywords)}`;
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.status === 503) {
                throw new Error('Unsplash returned 503');
            }
            return url;
        } catch (error) {
            console.error('Error fetching image:', error);
            return 'default-placeholder.png';
        }
    }

    // Check if user is admin and restrict posting
    async checkAdminPostingRestrictions() {
        if (!this.currentUser) {
            console.log('No current user, skipping admin check');
            return false;
        }
        
        try {
            console.log('Checking admin status for:', this.currentUser.email);
            const userDoc = await db.collection('users').doc(this.currentUser.uid).get();
            const userData = userDoc.data();
            
            console.log('User data:', userData);
            
            // Check if user is admin (specific to ronellbradley@gmail.com)
            if ((userData?.role === 'admin' || userData?.isAdmin === true) && 
                (this.currentUser.email === 'ronellbradley@gmail.com' || userData?.adminEmail === 'ronellbradley@gmail.com')) {
                console.log('User is admin, applying restrictions');
                this.isAdmin = true;
                this.showAdminRestrictions();
                return true;
            } else {
                console.log('User is not admin');
                this.isAdmin = false;
                return false;
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    }

    showAdminRestrictions() {
        // Hide regular upload button for admin
        const uploadBtn = document.querySelector('a[href="upload.html"]');
        if (uploadBtn) {
            uploadBtn.style.display = 'none';
        }
        // Show AI Content Creator button for admin
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = '';
        });
        // Add admin notice
        const quickActions = document.querySelector('.quick-actions');
        if (quickActions) {
            const adminNotice = document.createElement('div');
            adminNotice.className = 'admin-notice';
            adminNotice.innerHTML = `
                <div class="admin-badge">👑 Admin Mode</div>
                <p>As an admin, you can only post AI-generated content to maintain quality standards.</p>
            `;
            quickActions.parentElement.insertBefore(adminNotice, quickActions);
        }
    }

    // Override createPost to redirect to AI content creator for admin
    async createPost() {
        if (this.isAdmin) {
            this.createAIContent();
            return;
        }
        
        // Regular post creation for non-admin users
        window.location.href = 'upload.html';
    }
}

// Initialize the dashboard page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.dashboardPage = new DashboardPage();
        console.log('Dashboard page initialized successfully');
    } catch (error) {
        console.error('Error initializing dashboard page:', error);
    }
});

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
} else {
    // DOM is already loaded, initialize immediately
    try {
        window.dashboardPage = new DashboardPage();
        console.log('Dashboard page initialized immediately');
    } catch (error) {
        console.error('Error initializing dashboard page immediately:', error);
    }
} 