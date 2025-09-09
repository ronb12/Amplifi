/**
 * Enhanced Social Features System
 * Advanced social interaction and viral mechanics
 */

class SocialFeatures {
    constructor() {
        this.comments = this.loadComments();
        this.shares = this.loadShares();
        this.likes = this.loadLikes();
        this.follows = this.loadFollows();
        this.notifications = this.loadNotifications();
        this.viralEngine = new ViralEngine();
    }

    /**
     * Add Comment to Content
     */
    async addComment(contentId, userId, commentText, parentId = null) {
        const comment = {
            id: this.generateId(),
            contentId,
            userId,
            text: commentText,
            parentId,
            timestamp: Date.now(),
            likes: 0,
            replies: 0,
            isEdited: false,
            isDeleted: false
        };

        this.comments.push(comment);
        this.saveComments();

        // Update reply count for parent comment
        if (parentId) {
            const parentComment = this.comments.find(c => c.id === parentId);
            if (parentComment) {
                parentComment.replies++;
            }
        }

        // Send notification to content creator
        await this.sendNotification(contentId, 'comment', {
            commentId: comment.id,
            userId,
            text: commentText
        });

        // Trigger viral mechanics
        this.viralEngine.recordEngagement(contentId, 'comment', userId);

        return comment;
    }

    /**
     * Like Content or Comment
     */
    async likeContent(contentId, userId, type = 'content') {
        const likeKey = `${type}_${contentId}_${userId}`;
        
        // Check if already liked
        const existingLike = this.likes.find(l => l.key === likeKey);
        if (existingLike) {
            // Unlike
            this.likes = this.likes.filter(l => l.key !== likeKey);
            await this.updateLikeCount(contentId, -1, type);
        } else {
            // Like
            const like = {
                id: this.generateId(),
                key: likeKey,
                contentId,
                userId,
                type,
                timestamp: Date.now()
            };
            
            this.likes.push(like);
            await this.updateLikeCount(contentId, 1, type);
        }

        this.saveLikes();

        // Trigger viral mechanics
        this.viralEngine.recordEngagement(contentId, 'like', userId);

        return !existingLike;
    }

    /**
     * Share Content
     */
    async shareContent(contentId, userId, platform = 'internal', message = '') {
        const share = {
            id: this.generateId(),
            contentId,
            userId,
            platform,
            message,
            timestamp: Date.now(),
            clickCount: 0
        };

        this.shares.push(share);
        this.saveShares();

        // Send notification to content creator
        await this.sendNotification(contentId, 'share', {
            shareId: share.id,
            userId,
            platform
        });

        // Trigger viral mechanics
        this.viralEngine.recordEngagement(contentId, 'share', userId);

        // Track share analytics
        this.trackShareAnalytics(contentId, platform);

        return share;
    }

    /**
     * Follow User
     */
    async followUser(followerId, followingId) {
        const followKey = `${followerId}_${followingId}`;
        
        // Check if already following
        const existingFollow = this.follows.find(f => f.key === followKey);
        if (existingFollow) {
            // Unfollow
            this.follows = this.follows.filter(f => f.key !== followKey);
        } else {
            // Follow
            const follow = {
                id: this.generateId(),
                key: followKey,
                followerId,
                followingId,
                timestamp: Date.now()
            };
            
            this.follows.push(follow);
        }

        this.saveFollows();

        // Send notification
        await this.sendNotification(followingId, 'follow', {
            followerId
        });

        return !existingFollow;
    }

    /**
     * Get Comments for Content
     */
    getComments(contentId, limit = 50, offset = 0) {
        return this.comments
            .filter(c => c.contentId === contentId && !c.isDeleted)
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(offset, offset + limit);
    }

    /**
     * Get Replies for Comment
     */
    getReplies(commentId, limit = 20) {
        return this.comments
            .filter(c => c.parentId === commentId && !c.isDeleted)
            .sort((a, b) => a.timestamp - b.timestamp)
            .slice(0, limit);
    }

    /**
     * Get User's Feed
     */
    async getUserFeed(userId, limit = 20) {
        // Get users that the current user follows
        const following = this.follows
            .filter(f => f.followerId === userId)
            .map(f => f.followingId);

        // Get content from followed users
        const feedContent = await this.getContentFromUsers(following, limit);
        
        // Add trending content
        const trendingContent = await this.getTrendingContent(limit / 2);
        
        // Combine and sort by engagement
        const combinedFeed = [...feedContent, ...trendingContent];
        return this.sortFeedByEngagement(combinedFeed, userId);
    }

    /**
     * Get Trending Content
     */
    async getTrendingContent(limit = 10) {
        // This would integrate with the AI recommendation engine
        const aiEngine = new AIRecommendationEngine();
        return await aiEngine.getTrendingRecommendations(limit);
    }

    /**
     * Send Notification
     */
    async sendNotification(userId, type, data) {
        const notification = {
            id: this.generateId(),
            userId,
            type,
            data,
            timestamp: Date.now(),
            isRead: false
        };

        this.notifications.push(notification);
        this.saveNotifications();

        // Show real-time notification
        this.showNotification(notification);
    }

    /**
     * Show Real-time Notification
     */
    showNotification(notification) {
        // Create notification element
        const notificationEl = document.createElement('div');
        notificationEl.className = 'notification-toast';
        notificationEl.innerHTML = this.formatNotification(notification);
        
        // Add to page
        document.body.appendChild(notificationEl);
        
        // Animate in
        setTimeout(() => notificationEl.classList.add('show'), 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notificationEl.classList.remove('show');
            setTimeout(() => notificationEl.remove(), 300);
        }, 5000);
    }

    /**
     * Format Notification
     */
    formatNotification(notification) {
        const messages = {
            comment: 'Someone commented on your content',
            like: 'Someone liked your content',
            share: 'Someone shared your content',
            follow: 'Someone started following you'
        };

        return `
            <div class="notification-content">
                <i class="fas fa-bell"></i>
                <span>${messages[notification.type] || 'New notification'}</span>
            </div>
        `;
    }

    /**
     * Update Like Count
     */
    async updateLikeCount(contentId, change, type) {
        // This would typically update the database
        // For now, we'll update localStorage
        const content = this.getContentById(contentId);
        if (content) {
            if (type === 'content') {
                content.likes = (content.likes || 0) + change;
            } else if (type === 'comment') {
                const comment = this.comments.find(c => c.id === contentId);
                if (comment) {
                    comment.likes += change;
                }
            }
        }
    }

    /**
     * Track Share Analytics
     */
    trackShareAnalytics(contentId, platform) {
        // Track share analytics for content creators
        const analytics = this.loadAnalytics();
        const key = `shares_${contentId}`;
        
        if (!analytics[key]) {
            analytics[key] = { total: 0, platforms: {} };
        }
        
        analytics[key].total++;
        analytics[key].platforms[platform] = (analytics[key].platforms[platform] || 0) + 1;
        
        this.saveAnalytics(analytics);
    }

    /**
     * Get Content from Users
     */
    async getContentFromUsers(userIds, limit) {
        // This would typically query a database
        // For now, return sample data
        return [];
    }

    /**
     * Sort Feed by Engagement
     */
    sortFeedByEngagement(content, userId) {
        return content.sort((a, b) => {
            const scoreA = this.calculateEngagementScore(a, userId);
            const scoreB = this.calculateEngagementScore(b, userId);
            return scoreB - scoreA;
        });
    }

    /**
     * Calculate Engagement Score
     */
    calculateEngagementScore(content, userId) {
        const views = content.views || 0;
        const likes = content.likes || 0;
        const comments = content.comments || 0;
        const shares = content.shares || 0;
        
        // Weighted engagement score
        return (views * 1) + (likes * 3) + (comments * 5) + (shares * 10);
    }

    /**
     * Get Content by ID
     */
    getContentById(contentId) {
        // This would typically query a database
        // For now, return sample data
        return {
            id: contentId,
            title: 'Sample Content',
            views: 1000,
            likes: 50,
            comments: 10,
            shares: 5
        };
    }

    /**
     * Load Data Methods
     */
    loadComments() {
        const saved = localStorage.getItem('amplifi_comments');
        return saved ? JSON.parse(saved) : [];
    }

    loadShares() {
        const saved = localStorage.getItem('amplifi_shares');
        return saved ? JSON.parse(saved) : [];
    }

    loadLikes() {
        const saved = localStorage.getItem('amplifi_likes');
        return saved ? JSON.parse(saved) : [];
    }

    loadFollows() {
        const saved = localStorage.getItem('amplifi_follows');
        return saved ? JSON.parse(saved) : [];
    }

    loadNotifications() {
        const saved = localStorage.getItem('amplifi_notifications');
        return saved ? JSON.parse(saved) : [];
    }

    loadAnalytics() {
        const saved = localStorage.getItem('amplifi_analytics');
        return saved ? JSON.parse(saved) : {};
    }

    /**
     * Save Data Methods
     */
    saveComments() {
        localStorage.setItem('amplifi_comments', JSON.stringify(this.comments));
    }

    saveShares() {
        localStorage.setItem('amplifi_shares', JSON.stringify(this.shares));
    }

    saveLikes() {
        localStorage.setItem('amplifi_likes', JSON.stringify(this.likes));
    }

    saveFollows() {
        localStorage.setItem('amplifi_follows', JSON.stringify(this.follows));
    }

    saveNotifications() {
        localStorage.setItem('amplifi_notifications', JSON.stringify(this.notifications));
    }

    saveAnalytics(analytics) {
        localStorage.setItem('amplifi_analytics', JSON.stringify(analytics));
    }

    /**
     * Generate ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

/**
 * Viral Engine for Content Promotion
 */
class ViralEngine {
    constructor() {
        this.viralThresholds = {
            views: 10000,
            likes: 500,
            comments: 100,
            shares: 50
        };
        this.viralContent = new Set();
    }

    /**
     * Record Engagement
     */
    recordEngagement(contentId, type, userId) {
        // Track engagement metrics
        const metrics = this.getContentMetrics(contentId);
        metrics[type] = (metrics[type] || 0) + 1;
        this.saveContentMetrics(contentId, metrics);

        // Check if content should go viral
        if (this.shouldGoViral(metrics)) {
            this.promoteContent(contentId);
        }
    }

    /**
     * Check if Content Should Go Viral
     */
    shouldGoViral(metrics) {
        return (
            metrics.views >= this.viralThresholds.views ||
            metrics.likes >= this.viralThresholds.likes ||
            metrics.comments >= this.viralThresholds.comments ||
            metrics.shares >= this.viralThresholds.shares
        );
    }

    /**
     * Promote Content
     */
    promoteContent(contentId) {
        if (!this.viralContent.has(contentId)) {
            this.viralContent.add(contentId);
            
            // Add to trending
            this.addToTrending(contentId);
            
            // Send notifications to followers
            this.notifyFollowers(contentId);
            
            // Boost in algorithm
            this.boostInAlgorithm(contentId);
        }
    }

    /**
     * Add to Trending
     */
    addToTrending(contentId) {
        // Implementation for adding to trending
        console.log(`Content ${contentId} is now trending!`);
    }

    /**
     * Notify Followers
     */
    notifyFollowers(contentId) {
        // Implementation for notifying followers
        console.log(`Notifying followers about trending content ${contentId}`);
    }

    /**
     * Boost in Algorithm
     */
    boostInAlgorithm(contentId) {
        // Implementation for boosting in recommendation algorithm
        console.log(`Boosting content ${contentId} in algorithm`);
    }

    /**
     * Get Content Metrics
     */
    getContentMetrics(contentId) {
        const saved = localStorage.getItem(`amplifi_metrics_${contentId}`);
        return saved ? JSON.parse(saved) : {};
    }

    /**
     * Save Content Metrics
     */
    saveContentMetrics(contentId, metrics) {
        localStorage.setItem(`amplifi_metrics_${contentId}`, JSON.stringify(metrics));
    }
}

// Initialize Social Features
window.SocialFeatures = SocialFeatures;
