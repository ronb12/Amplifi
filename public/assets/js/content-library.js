/**
 * Content Library Management System
 * YouTube-style content organization and discovery
 */

class ContentLibrary {
    constructor() {
        this.contentDatabase = this.loadContentDatabase();
        this.creatorNetwork = this.loadCreatorNetwork();
        this.categories = this.loadCategories();
        this.playlists = this.loadPlaylists();
        this.watchHistory = this.loadWatchHistory();
        this.watchLater = this.loadWatchLater();
        this.likedContent = this.loadLikedContent();
        this.subscriptions = this.loadSubscriptions();
    }

    /**
     * Get Content by Category
     */
    getContentByCategory(category, limit = 20, offset = 0) {
        return this.contentDatabase
            .filter(content => content.category === category)
            .sort((a, b) => b.views - a.views)
            .slice(offset, offset + limit);
    }

    /**
     * Get Trending Content
     */
    getTrendingContent(limit = 20) {
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        
        return this.contentDatabase
            .filter(content => (now - content.timestamp) < oneDay)
            .sort((a, b) => this.calculateTrendingScore(b) - this.calculateTrendingScore(a))
            .slice(0, limit);
    }

    /**
     * Get Popular Content
     */
    getPopularContent(limit = 20) {
        return this.contentDatabase
            .sort((a, b) => b.views - a.views)
            .slice(0, limit);
    }

    /**
     * Get Content by Creator
     */
    getContentByCreator(creatorId, limit = 20) {
        return this.contentDatabase
            .filter(content => content.creatorId === creatorId)
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    /**
     * Search Content
     */
    searchContent(query, filters = {}) {
        let results = this.contentDatabase;

        // Text search
        if (query) {
            const searchTerms = query.toLowerCase().split(' ');
            results = results.filter(content => {
                const searchableText = [
                    content.title,
                    content.description,
                    content.tags?.join(' '),
                    content.category
                ].join(' ').toLowerCase();

                return searchTerms.every(term => searchableText.includes(term));
            });
        }

        // Apply filters
        if (filters.category) {
            results = results.filter(content => content.category === filters.category);
        }

        if (filters.duration) {
            results = results.filter(content => {
                const duration = content.duration || 0;
                switch (filters.duration) {
                    case 'short':
                        return duration < 300; // Less than 5 minutes
                    case 'medium':
                        return duration >= 300 && duration < 1200; // 5-20 minutes
                    case 'long':
                        return duration >= 1200; // More than 20 minutes
                    default:
                        return true;
                }
            });
        }

        if (filters.date) {
            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;
            const oneWeek = 7 * oneDay;
            const oneMonth = 30 * oneDay;

            results = results.filter(content => {
                const contentDate = content.timestamp || 0;
                switch (filters.date) {
                    case 'today':
                        return (now - contentDate) < oneDay;
                    case 'week':
                        return (now - contentDate) < oneWeek;
                    case 'month':
                        return (now - contentDate) < oneMonth;
                    default:
                        return true;
                }
            });
        }

        // Sort by relevance
        return results.sort((a, b) => {
            // Primary sort by views
            if (a.views !== b.views) {
                return b.views - a.views;
            }
            // Secondary sort by recency
            return (b.timestamp || 0) - (a.timestamp || 0);
        });
    }

    /**
     * Get Related Content
     */
    getRelatedContent(contentId, limit = 10) {
        const content = this.contentDatabase.find(c => c.id === contentId);
        if (!content) return [];

        return this.contentDatabase
            .filter(c => c.id !== contentId)
            .map(c => ({
                ...c,
                similarity: this.calculateSimilarity(content, c)
            }))
            .filter(c => c.similarity > 0.3)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);
    }

    /**
     * Calculate Content Similarity
     */
    calculateSimilarity(content1, content2) {
        let similarity = 0;

        // Category similarity
        if (content1.category === content2.category) {
            similarity += 0.4;
        }

        // Tag similarity
        const tags1 = content1.tags || [];
        const tags2 = content2.tags || [];
        const commonTags = tags1.filter(tag => tags2.includes(tag));
        const tagSimilarity = commonTags.length / Math.max(tags1.length, tags2.length);
        similarity += tagSimilarity * 0.3;

        // Creator similarity
        if (content1.creatorId === content2.creatorId) {
            similarity += 0.2;
        }

        // Duration similarity
        const duration1 = content1.duration || 0;
        const duration2 = content2.duration || 0;
        const durationDiff = Math.abs(duration1 - duration2) / Math.max(duration1, duration2);
        similarity += (1 - durationDiff) * 0.1;

        return Math.min(similarity, 1);
    }

    /**
     * Calculate Trending Score
     */
    calculateTrendingScore(content) {
        const now = Date.now();
        const age = (now - content.timestamp) / (1000 * 60 * 60); // hours
        
        const views = content.views || 0;
        const likes = content.likes || 0;
        const comments = content.comments || 0;
        const shares = content.shares || 0;
        
        const engagementScore = (views * 1) + (likes * 3) + (comments * 5) + (shares * 10);
        const timeDecay = Math.exp(-age / 24); // Decay over 24 hours
        
        return engagementScore * timeDecay;
    }

    /**
     * Add to Watch Later
     */
    addToWatchLater(contentId) {
        if (!this.watchLater.includes(contentId)) {
            this.watchLater.push(contentId);
            this.saveWatchLater();
            return true;
        }
        return false;
    }

    /**
     * Remove from Watch Later
     */
    removeFromWatchLater(contentId) {
        const index = this.watchLater.indexOf(contentId);
        if (index > -1) {
            this.watchLater.splice(index, 1);
            this.saveWatchLater();
            return true;
        }
        return false;
    }

    /**
     * Add to Liked Content
     */
    addToLiked(contentId) {
        if (!this.likedContent.includes(contentId)) {
            this.likedContent.push(contentId);
            this.saveLikedContent();
            return true;
        }
        return false;
    }

    /**
     * Remove from Liked Content
     */
    removeFromLiked(contentId) {
        const index = this.likedContent.indexOf(contentId);
        if (index > -1) {
            this.likedContent.splice(index, 1);
            this.saveLikedContent();
            return true;
        }
        return false;
    }

    /**
     * Add to Watch History
     */
    addToWatchHistory(contentId) {
        const historyItem = {
            contentId,
            timestamp: Date.now(),
            watchTime: 0
        };

        // Remove existing entry if it exists
        this.watchHistory = this.watchHistory.filter(item => item.contentId !== contentId);
        
        // Add to beginning of history
        this.watchHistory.unshift(historyItem);
        
        // Keep only last 100 items
        this.watchHistory = this.watchHistory.slice(0, 100);
        
        this.saveWatchHistory();
    }

    /**
     * Get Watch History
     */
    getWatchHistory(limit = 20) {
        return this.watchHistory
            .slice(0, limit)
            .map(item => ({
                ...this.contentDatabase.find(c => c.id === item.contentId),
                watchTime: item.watchTime,
                watchedAt: item.timestamp
            }))
            .filter(content => content.id); // Remove any missing content
    }

    /**
     * Get Watch Later
     */
    getWatchLater() {
        return this.watchLater
            .map(contentId => this.contentDatabase.find(c => c.id === contentId))
            .filter(content => content); // Remove any missing content
    }

    /**
     * Get Liked Content
     */
    getLikedContent() {
        return this.likedContent
            .map(contentId => this.contentDatabase.find(c => c.id === contentId))
            .filter(content => content); // Remove any missing content
    }

    /**
     * Create Playlist
     */
    createPlaylist(name, description = '', isPublic = true) {
        const playlist = {
            id: this.generateId(),
            name,
            description,
            isPublic,
            creatorId: this.getCurrentUserId(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            contentIds: [],
            viewCount: 0,
            likeCount: 0
        };

        this.playlists.push(playlist);
        this.savePlaylists();
        return playlist;
    }

    /**
     * Add Content to Playlist
     */
    addToPlaylist(playlistId, contentId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (playlist && !playlist.contentIds.includes(contentId)) {
            playlist.contentIds.push(contentId);
            playlist.updatedAt = Date.now();
            this.savePlaylists();
            return true;
        }
        return false;
    }

    /**
     * Remove Content from Playlist
     */
    removeFromPlaylist(playlistId, contentId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (playlist) {
            const index = playlist.contentIds.indexOf(contentId);
            if (index > -1) {
                playlist.contentIds.splice(index, 1);
                playlist.updatedAt = Date.now();
                this.savePlaylists();
                return true;
            }
        }
        return false;
    }

    /**
     * Get Playlist Content
     */
    getPlaylistContent(playlistId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist) return [];

        return playlist.contentIds
            .map(contentId => this.contentDatabase.find(c => c.id === contentId))
            .filter(content => content);
    }

    /**
     * Get User Playlists
     */
    getUserPlaylists(userId) {
        return this.playlists.filter(p => p.creatorId === userId);
    }

    /**
     * Get Public Playlists
     */
    getPublicPlaylists(limit = 20) {
        return this.playlists
            .filter(p => p.isPublic)
            .sort((a, b) => b.viewCount - a.viewCount)
            .slice(0, limit);
    }

    /**
     * Subscribe to Creator
     */
    subscribeToCreator(creatorId) {
        if (!this.subscriptions.includes(creatorId)) {
            this.subscriptions.push(creatorId);
            this.saveSubscriptions();
            return true;
        }
        return false;
    }

    /**
     * Unsubscribe from Creator
     */
    unsubscribeFromCreator(creatorId) {
        const index = this.subscriptions.indexOf(creatorId);
        if (index > -1) {
            this.subscriptions.splice(index, 1);
            this.saveSubscriptions();
            return true;
        }
        return false;
    }

    /**
     * Get Subscribed Creators Content
     */
    getSubscribedContent(limit = 20) {
        return this.contentDatabase
            .filter(content => this.subscriptions.includes(content.creatorId))
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    /**
     * Get Creator Network
     */
    getCreatorNetwork(limit = 20) {
        return this.creatorNetwork
            .sort((a, b) => b.subscriberCount - a.subscriberCount)
            .slice(0, limit);
    }

    /**
     * Get Creator Profile
     */
    getCreatorProfile(creatorId) {
        return this.creatorNetwork.find(c => c.id === creatorId);
    }

    /**
     * Get Categories
     */
    getCategories() {
        return this.categories;
    }

    /**
     * Get Content Statistics
     */
    getContentStatistics() {
        const totalContent = this.contentDatabase.length;
        const totalCreators = this.creatorNetwork.length;
        const totalViews = this.contentDatabase.reduce((sum, content) => sum + (content.views || 0), 0);
        const totalLikes = this.contentDatabase.reduce((sum, content) => sum + (content.likes || 0), 0);

        return {
            totalContent,
            totalCreators,
            totalViews,
            totalLikes,
            averageViews: totalContent > 0 ? Math.round(totalViews / totalContent) : 0,
            averageLikes: totalContent > 0 ? Math.round(totalLikes / totalContent) : 0
        };
    }

    /**
     * Load Content Database
     */
    loadContentDatabase() {
        // Sample content database - in production this would come from a real database
        return [
            {
                id: '1',
                title: 'Advanced Gaming Tutorial',
                description: 'Learn advanced gaming techniques and strategies from a pro gamer',
                category: 'gaming',
                duration: 1200,
                views: 50000,
                likes: 2500,
                comments: 150,
                shares: 200,
                tags: ['gaming', 'tutorial', 'advanced', 'strategy'],
                creatorId: 'creator1',
                timestamp: Date.now() - 3600000,
                thumbnail: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&h=200',
                videoUrl: 'https://example.com/video1.mp4'
            },
            {
                id: '2',
                title: 'Music Production Masterclass',
                description: 'Complete guide to music production and sound engineering',
                category: 'music',
                duration: 2400,
                views: 75000,
                likes: 4200,
                comments: 300,
                shares: 450,
                tags: ['music', 'production', 'tutorial', 'sound'],
                creatorId: 'creator2',
                timestamp: Date.now() - 7200000,
                thumbnail: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&h=200',
                videoUrl: 'https://example.com/video2.mp4'
            },
            {
                id: '3',
                title: 'Tech News Update',
                description: 'Latest technology news and updates from around the world',
                category: 'tech',
                duration: 600,
                views: 30000,
                likes: 1800,
                comments: 80,
                shares: 120,
                tags: ['tech', 'news', 'update', 'technology'],
                creatorId: 'creator3',
                timestamp: Date.now() - 1800000,
                thumbnail: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&h=200',
                videoUrl: 'https://example.com/video3.mp4'
            },
            {
                id: '4',
                title: 'Cooking Masterclass',
                description: 'Learn to cook like a professional chef with these amazing recipes',
                category: 'lifestyle',
                duration: 1800,
                views: 45000,
                likes: 3200,
                comments: 200,
                shares: 300,
                tags: ['cooking', 'recipes', 'food', 'lifestyle'],
                creatorId: 'creator4',
                timestamp: Date.now() - 5400000,
                thumbnail: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&h=200',
                videoUrl: 'https://example.com/video4.mp4'
            },
            {
                id: '5',
                title: 'Fitness Workout Routine',
                description: 'Get in shape with this intense 30-minute workout routine',
                category: 'fitness',
                duration: 1800,
                views: 60000,
                likes: 4500,
                comments: 250,
                shares: 400,
                tags: ['fitness', 'workout', 'exercise', 'health'],
                creatorId: 'creator5',
                timestamp: Date.now() - 9000000,
                thumbnail: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&h=200',
                videoUrl: 'https://example.com/video5.mp4'
            }
        ];
    }

    /**
     * Load Creator Network
     */
    loadCreatorNetwork() {
        return [
            {
                id: 'creator1',
                name: 'ProGamer',
                username: '@progamer',
                subscriberCount: 150000,
                videoCount: 250,
                totalViews: 5000000,
                joinDate: Date.now() - 365 * 24 * 60 * 60 * 1000,
                avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&h=100',
                description: 'Professional gamer sharing tips and strategies',
                verified: true
            },
            {
                id: 'creator2',
                name: 'Music Producer',
                username: '@musicproducer',
                subscriberCount: 200000,
                videoCount: 180,
                totalViews: 8000000,
                joinDate: Date.now() - 730 * 24 * 60 * 60 * 1000,
                avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&h=100',
                description: 'Music production tutorials and behind-the-scenes content',
                verified: true
            },
            {
                id: 'creator3',
                name: 'Tech News',
                username: '@technews',
                subscriberCount: 300000,
                videoCount: 500,
                totalViews: 12000000,
                joinDate: Date.now() - 1095 * 24 * 60 * 60 * 1000,
                avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&h=100',
                description: 'Latest technology news and reviews',
                verified: true
            },
            {
                id: 'creator4',
                name: 'Chef Master',
                username: '@chefmaster',
                subscriberCount: 120000,
                videoCount: 150,
                totalViews: 3000000,
                joinDate: Date.now() - 500 * 24 * 60 * 60 * 1000,
                avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&h=100',
                description: 'Professional chef sharing cooking secrets',
                verified: false
            },
            {
                id: 'creator5',
                name: 'Fitness Guru',
                username: '@fitnessguru',
                subscriberCount: 180000,
                videoCount: 200,
                totalViews: 4500000,
                joinDate: Date.now() - 400 * 24 * 60 * 60 * 1000,
                avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&h=100',
                description: 'Fitness trainer helping you achieve your goals',
                verified: true
            }
        ];
    }

    /**
     * Load Categories
     */
    loadCategories() {
        return [
            { id: 'gaming', name: 'Gaming', icon: 'fas fa-gamepad' },
            { id: 'music', name: 'Music', icon: 'fas fa-music' },
            { id: 'tech', name: 'Technology', icon: 'fas fa-laptop' },
            { id: 'lifestyle', name: 'Lifestyle', icon: 'fas fa-heart' },
            { id: 'fitness', name: 'Fitness', icon: 'fas fa-dumbbell' },
            { id: 'education', name: 'Education', icon: 'fas fa-graduation-cap' },
            { id: 'entertainment', name: 'Entertainment', icon: 'fas fa-film' },
            { id: 'news', name: 'News', icon: 'fas fa-newspaper' }
        ];
    }

    /**
     * Load Playlists
     */
    loadPlaylists() {
        const saved = localStorage.getItem('amplifi_playlists');
        return saved ? JSON.parse(saved) : [];
    }

    /**
     * Load Watch History
     */
    loadWatchHistory() {
        const saved = localStorage.getItem('amplifi_watch_history');
        return saved ? JSON.parse(saved) : [];
    }

    /**
     * Load Watch Later
     */
    loadWatchLater() {
        const saved = localStorage.getItem('amplifi_watch_later');
        return saved ? JSON.parse(saved) : [];
    }

    /**
     * Load Liked Content
     */
    loadLikedContent() {
        const saved = localStorage.getItem('amplifi_liked_content');
        return saved ? JSON.parse(saved) : [];
    }

    /**
     * Load Subscriptions
     */
    loadSubscriptions() {
        const saved = localStorage.getItem('amplifi_subscriptions');
        return saved ? JSON.parse(saved) : [];
    }

    /**
     * Save Methods
     */
    savePlaylists() {
        localStorage.setItem('amplifi_playlists', JSON.stringify(this.playlists));
    }

    saveWatchHistory() {
        localStorage.setItem('amplifi_watch_history', JSON.stringify(this.watchHistory));
    }

    saveWatchLater() {
        localStorage.setItem('amplifi_watch_later', JSON.stringify(this.watchLater));
    }

    saveLikedContent() {
        localStorage.setItem('amplifi_liked_content', JSON.stringify(this.likedContent));
    }

    saveSubscriptions() {
        localStorage.setItem('amplifi_subscriptions', JSON.stringify(this.subscriptions));
    }

    /**
     * Get Current User ID
     */
    getCurrentUserId() {
        const auth = localStorage.getItem('amplifi_auth');
        return auth ? JSON.parse(auth).userId : null;
    }

    /**
     * Generate ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// Initialize Content Library
window.ContentLibrary = ContentLibrary;
