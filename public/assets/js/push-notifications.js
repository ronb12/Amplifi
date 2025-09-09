/**
 * Push Notification System
 */

class PushNotificationManager {
    constructor() {
        this.isSupported = 'Notification' in window;
        this.permission = Notification.permission;
        this.notifications = [];
        this.init();
    }

    async init() {
        if (this.isSupported) {
            await this.requestPermission();
            this.setupServiceWorker();
        }
    }

    async requestPermission() {
        if (this.permission === 'default') {
            this.permission = await Notification.requestPermission();
        }
        return this.permission === 'granted';
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }

    async sendNotification(title, options = {}) {
        if (!this.isSupported || this.permission !== 'granted') {
            return false;
        }

        const notification = new Notification(title, {
            icon: '/assets/icons/amplifi-icon.svg',
            badge: '/assets/icons/amplifi-icon.svg',
            ...options
        });

        this.notifications.push({
            id: Date.now(),
            title,
            options,
            timestamp: Date.now()
        });

        return notification;
    }

    async sendRealtimeNotification(type, data) {
        const notifications = {
            comment: {
                title: 'New Comment',
                body: `${data.username} commented on your video`,
                icon: '/assets/icons/comment.svg'
            },
            like: {
                title: 'New Like',
                body: `${data.username} liked your video`,
                icon: '/assets/icons/like.svg'
            },
            share: {
                title: 'Video Shared',
                body: `${data.username} shared your video`,
                icon: '/assets/icons/share.svg'
            },
            follow: {
                title: 'New Follower',
                body: `${data.username} started following you`,
                icon: '/assets/icons/follow.svg'
            }
        };

        const config = notifications[type];
        if (config) {
            return await this.sendNotification(config.title, config);
        }
    }
}

window.PushNotificationManager = PushNotificationManager;
