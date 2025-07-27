/* global db, auth, firebase */
// Notifications Page JavaScript
class NotificationsPage {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.notifications = [];
        this.currentTab = 'all';
        
        this.init();
    }

    async init() {
        await this.setupAuthStateListener();
        this.setupEventListeners();
        this.loadNotifications();
    }

    async setupAuthStateListener() {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                this.currentUser = user;
                await this.loadUserProfile();
                this.updateUIForAuthenticatedUser();
                this.loadNotifications();
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
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar && this.userProfile && this.userProfile.profilePic) {
            userAvatar.src = this.userProfile.profilePic;
        }
    }

    updateUIForUnauthenticatedUser() {
        // Redirect to login if not authenticated
        window.location.href = 'index.html';
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Mark all as read
        const markAllReadBtn = document.getElementById('markAllReadBtn');
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', () => {
                this.markAllAsRead();
            });
        }

        // Notification item clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.notification-item')) {
                this.handleNotificationClick(e.target.closest('.notification-item'));
            }
        });
    }

    switchTab(tabType) {
        this.currentTab = tabType;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.style.background = 'none';
            btn.style.color = '#64748b';
            btn.style.border = '1px solid #e5e7eb';
        });
        
        const activeBtn = document.querySelector(`[data-tab="${tabType}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            activeBtn.style.background = '#6366f1';
            activeBtn.style.color = 'white';
            activeBtn.style.border = 'none';
        }
        
        this.filterNotifications(tabType);
    }

    async loadNotifications() {
        if (!this.currentUser) return;

        const loadingState = document.getElementById('loadingState');
        const emptyState = document.getElementById('emptyState');
        const notificationsList = document.getElementById('notificationsList');

        try {
            loadingState.style.display = 'block';
            emptyState.style.display = 'none';
            notificationsList.style.display = 'none';

            // First, try to load from user's notifications subcollection
            let notificationsRef = db.collection('users').doc(this.currentUser.uid)
                .collection('notifications')
                .orderBy('createdAt', 'desc')
                .limit(50);

            const snapshot = await notificationsRef.get();
            
            this.notifications = [];
            snapshot.forEach(doc => {
                this.notifications.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // If no notifications found, create some sample ones for testing
            if (this.notifications.length === 0) {
                await this.createSampleNotifications();
                // Reload after creating samples
                const newSnapshot = await notificationsRef.get();
                newSnapshot.forEach(doc => {
                    this.notifications.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
            }

            if (this.notifications.length === 0) {
                this.showEmptyState();
            } else {
                this.renderNotifications();
            }

        } catch (error) {
            console.error('Error loading notifications:', error);
            // Show sample notifications on error for testing
            this.showSampleNotifications();
        } finally {
            loadingState.style.display = 'none';
        }
    }

    async createSampleNotifications() {
        if (!this.currentUser) return;

        const sampleNotifications = [
            {
                type: 'like',
                senderId: 'sample_user_1',
                senderName: 'John Doe',
                senderPic: 'default-avatar.svg',
                content: 'Great content! Keep it up!',
                postId: 'sample_post_1',
                createdAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)), // 2 hours ago
                read: false
            },
            {
                type: 'follow',
                senderId: 'sample_user_2',
                senderName: 'Jane Smith',
                senderPic: 'default-avatar.svg',
                content: 'You have a new follower!',
                createdAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 5 * 60 * 60 * 1000)), // 5 hours ago
                read: false
            },
            {
                type: 'tip',
                senderId: 'sample_user_3',
                senderName: 'Mike Johnson',
                senderPic: 'default-avatar.svg',
                content: '💰 $5.00 - "Amazing work!"',
                amount: 5.00,
                createdAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)), // 1 day ago
                read: false
            },
            {
                type: 'comment',
                senderId: 'sample_user_4',
                senderName: 'Sarah Wilson',
                senderPic: 'default-avatar.svg',
                content: 'This is exactly what I needed! Thank you!',
                postId: 'sample_post_2',
                createdAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)), // 2 days ago
                read: true
            }
        ];

        try {
            const batch = db.batch();
            sampleNotifications.forEach(notification => {
                const notificationRef = db.collection('users').doc(this.currentUser.uid)
                    .collection('notifications').doc();
                batch.set(notificationRef, notification);
            });
            await batch.commit();
        } catch (error) {
            console.error('Error creating sample notifications:', error);
        }
    }

    showSampleNotifications() {
        // Fallback sample notifications if Firestore fails
        this.notifications = [
            {
                id: 'sample_1',
                type: 'like',
                senderName: 'John Doe',
                senderPic: 'default-avatar.svg',
                content: 'Great content! Keep it up!',
                createdAt: { toDate: () => new Date(Date.now() - 2 * 60 * 60 * 1000) },
                read: false
            },
            {
                id: 'sample_2',
                type: 'follow',
                senderName: 'Jane Smith',
                senderPic: 'default-avatar.svg',
                content: 'You have a new follower!',
                createdAt: { toDate: () => new Date(Date.now() - 5 * 60 * 60 * 1000) },
                read: false
            },
            {
                id: 'sample_3',
                type: 'tip',
                senderName: 'Mike Johnson',
                senderPic: 'default-avatar.svg',
                content: '💰 $5.00 - "Amazing work!"',
                createdAt: { toDate: () => new Date(Date.now() - 24 * 60 * 60 * 1000) },
                read: false
            },
            {
                id: 'sample_4',
                type: 'comment',
                senderName: 'Sarah Wilson',
                senderPic: 'default-avatar.svg',
                content: 'This is exactly what I needed! Thank you!',
                createdAt: { toDate: () => new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
                read: true
            }
        ];
        this.renderNotifications();
    }

    renderNotifications() {
        const notificationsList = document.getElementById('notificationsList');
        const filteredNotifications = this.filterNotificationsByType(this.currentTab);
        
        if (filteredNotifications.length === 0) {
            this.showEmptyState();
            return;
        }

        notificationsList.innerHTML = filteredNotifications.map(notification => 
            this.createNotificationHTML(notification)
        ).join('');

        notificationsList.style.display = 'block';
        document.getElementById('emptyState').style.display = 'none';
    }

    filterNotificationsByType(type) {
        if (type === 'all') {
            return this.notifications;
        }
        
        // Map tab names to notification types
        const typeMapping = {
            'likes': 'like',
            'comments': 'comment', 
            'followers': 'follow',
            'tips': 'tip'
        };
        
        const actualType = typeMapping[type] || type;
        return this.notifications.filter(notification => notification.type === actualType);
    }

    filterNotifications(tabType) {
        const filteredNotifications = this.filterNotificationsByType(tabType);
        const notificationsList = document.getElementById('notificationsList');
        const emptyState = document.getElementById('emptyState');

        if (filteredNotifications.length === 0) {
            notificationsList.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            notificationsList.innerHTML = filteredNotifications.map(notification => 
                this.createNotificationHTML(notification)
            ).join('');
            notificationsList.style.display = 'block';
            emptyState.style.display = 'none';
        }
    }

    createNotificationHTML(notification) {
        const timeAgo = this.formatTimeAgo(notification.createdAt);
        const icon = this.getNotificationIcon(notification.type);
        const message = this.getNotificationMessage(notification.type);
        
        return `
            <div class="notification-item" data-notification-id="${notification.id}" style="display: flex; align-items: start; gap: 1rem; padding: 1rem; border-bottom: 1px solid #f3f4f6; transition: background 0.2s; cursor: pointer;">
                <img src="${notification.senderPic || 'default-avatar.svg'}" alt="User" style="width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                        <span style="font-weight: 600; color: #374151;">${notification.senderName || 'Unknown User'}</span>
                        <span style="color: #64748b; font-size: 0.9rem;">${message}</span>
                        <span style="color: #9ca3af; font-size: 0.8rem;">${timeAgo}</span>
                    </div>
                    ${notification.content ? `<p style="color: #6b7280; font-size: 0.9rem; margin: 0;">${notification.content}</p>` : ''}
                </div>
                ${!notification.read ? '<div class="notification-dot" style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%; flex-shrink: 0; margin-top: 0.5rem;"></div>' : ''}
            </div>
        `;
    }

    getNotificationIcon(type) {
        const icons = {
            'like': '❤️',
            'comment': '💬',
            'follow': '👥',
            'tip': '💰',
            'mention': '📢'
        };
        return icons[type] || '🔔';
    }

    getNotificationMessage(type) {
        const messages = {
            'like': 'liked your post',
            'comment': 'commented on your post',
            'follow': 'started following you',
            'tip': 'tipped you',
            'mention': 'mentioned you in a comment'
        };
        return messages[type] || 'interacted with your content';
    }

    formatTimeAgo(timestamp) {
        if (!timestamp) return 'Just now';
        
        const now = new Date();
        const time = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return time.toLocaleDateString();
    }

    async markAllAsRead() {
        if (!this.currentUser) return;

        try {
            const batch = db.batch();
            this.notifications.forEach(notification => {
                if (!notification.read) {
                    const notificationRef = db.collection('users').doc(this.currentUser.uid)
                        .collection('notifications').doc(notification.id);
                    batch.update(notificationRef, { read: true });
                    notification.read = true;
                }
            });
            
            await batch.commit();
            this.renderNotifications();
            
            
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    }

    async handleNotificationClick(notificationElement) {
        const notificationId = notificationElement.dataset.notificationId;
        const notification = this.notifications.find(n => n.id === notificationId);
        
        if (!notification) return;

        // Mark as read
        if (!notification.read) {
            try {
                await db.collection('users').doc(this.currentUser.uid)
                    .collection('notifications').doc(notificationId)
                    .update({ read: true });
                
                notification.read = true;
                notificationElement.querySelector('.notification-dot')?.remove();
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        }

        // Navigate based on notification type
        if (notification.postId) {
            window.location.href = `feed.html?post=${notification.postId}`;
        } else if (notification.type === 'follow') {
            window.location.href = `profile.html?user=${notification.senderId}`;
        }
    }

    showEmptyState() {
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('notificationsList').style.display = 'none';
        document.getElementById('emptyState').style.display = 'block';
    }


}

// Initialize the page
const notificationsPage = new NotificationsPage(); 