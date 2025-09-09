/**
 * Creator Network Management System
 * YouTube-style creator community and discovery
 */

class CreatorNetwork {
    constructor() {
        this.creators = this.loadCreators();
        this.subscriptions = this.loadSubscriptions();
        this.creatorStats = this.loadCreatorStats();
        this.creatorContent = this.loadCreatorContent();
        this.creatorAnalytics = this.loadCreatorAnalytics();
    }

    /**
     * Get All Creators
     */
    getAllCreators(limit = 50, offset = 0) {
        return this.creators
            .sort((a, b) => b.subscriberCount - a.subscriberCount)
            .slice(offset, offset + limit);
    }

    /**
     * Get Trending Creators
     */
    getTrendingCreators(limit = 20) {
        const now = Date.now();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        
        return this.creators
            .filter(creator => {
                const stats = this.creatorStats[creator.id];
                if (!stats) return false;
                
                // Check if creator has recent activity
                const recentVideos = this.creatorContent[creator.id] || [];
                const hasRecentContent = recentVideos.some(content => 
                    (now - content.timestamp) < oneWeek
                );
                
                return hasRecentContent;
            })
            .map(creator => ({
                ...creator,
                trendingScore: this.calculateTrendingScore(creator)
            }))
            .sort((a, b) => b.trendingScore - a.trendingScore)
            .slice(0, limit);
    }

    /**
     * Get New Creators
     */
    getNewCreators(limit = 20) {
        const now = Date.now();
        const oneMonth = 30 * 24 * 60 * 60 * 1000;
        
        return this.creators
            .filter(creator => (now - creator.joinDate) < oneMonth)
            .sort((a, b) => b.subscriberCount - a.subscriberCount)
            .slice(0, limit);
    }

    /**
     * Get Verified Creators
     */
    getVerifiedCreators(limit = 20) {
        return this.creators
            .filter(creator => creator.verified)
            .sort((a, b) => b.subscriberCount - a.subscriberCount)
            .slice(0, limit);
    }

    /**
     * Search Creators
     */
    searchCreators(query, filters = {}) {
        let results = this.creators;

        // Text search
        if (query) {
            const searchTerms = query.toLowerCase().split(' ');
            results = results.filter(creator => {
                const searchableText = [
                    creator.name,
                    creator.username,
                    creator.description,
                    creator.categories?.join(' ')
                ].join(' ').toLowerCase();

                return searchTerms.every(term => searchableText.includes(term));
            });
        }

        // Apply filters
        if (filters.category) {
            results = results.filter(creator => 
                creator.categories?.includes(filters.category)
            );
        }

        if (filters.verified) {
            results = results.filter(creator => creator.verified);
        }

        if (filters.subscriberRange) {
            const { min, max } = filters.subscriberRange;
            results = results.filter(creator => 
                creator.subscriberCount >= min && creator.subscriberCount <= max
            );
        }

        // Sort by subscriber count
        return results.sort((a, b) => b.subscriberCount - a.subscriberCount);
    }

    /**
     * Get Creator Profile
     */
    getCreatorProfile(creatorId) {
        const creator = this.creators.find(c => c.id === creatorId);
        if (!creator) return null;

        const stats = this.creatorStats[creatorId] || {};
        const content = this.creatorContent[creatorId] || [];
        const analytics = this.creatorAnalytics[creatorId] || {};

        return {
            ...creator,
            stats,
            recentContent: content.slice(0, 10),
            analytics
        };
    }

    /**
     * Subscribe to Creator
     */
    subscribeToCreator(creatorId) {
        if (!this.subscriptions.includes(creatorId)) {
            this.subscriptions.push(creatorId);
            this.saveSubscriptions();
            
            // Update creator subscriber count
            const creator = this.creators.find(c => c.id === creatorId);
            if (creator) {
                creator.subscriberCount++;
                this.saveCreators();
            }
            
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
            
            // Update creator subscriber count
            const creator = this.creators.find(c => c.id === creatorId);
            if (creator) {
                creator.subscriberCount = Math.max(0, creator.subscriberCount - 1);
                this.saveCreators();
            }
            
            return true;
        }
        return false;
    }

    /**
     * Check if Subscribed
     */
    isSubscribed(creatorId) {
        return this.subscriptions.includes(creatorId);
    }

    /**
     * Get Subscribed Creators
     */
    getSubscribedCreators() {
        return this.creators
            .filter(creator => this.subscriptions.includes(creator.id))
            .sort((a, b) => b.subscriberCount - a.subscriberCount);
    }

    /**
     * Get Creator Content
     */
    getCreatorContent(creatorId, limit = 20) {
        const content = this.creatorContent[creatorId] || [];
        return content
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    /**
     * Get Creator Analytics
     */
    getCreatorAnalytics(creatorId) {
        return this.creatorAnalytics[creatorId] || {
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0,
            totalShares: 0,
            averageViews: 0,
            engagementRate: 0,
            subscriberGrowth: 0,
            contentPerformance: []
        };
    }

    /**
     * Update Creator Stats
     */
    updateCreatorStats(creatorId, stats) {
        this.creatorStats[creatorId] = {
            ...this.creatorStats[creatorId],
            ...stats,
            lastUpdated: Date.now()
        };
        this.saveCreatorStats();
    }

    /**
     * Add Creator Content
     */
    addCreatorContent(creatorId, content) {
        if (!this.creatorContent[creatorId]) {
            this.creatorContent[creatorId] = [];
        }
        
        this.creatorContent[creatorId].push(content);
        this.saveCreatorContent();
        
        // Update creator video count
        const creator = this.creators.find(c => c.id === creatorId);
        if (creator) {
            creator.videoCount++;
            this.saveCreators();
        }
    }

    /**
     * Get Creator Categories
     */
    getCreatorCategories() {
        const categories = new Set();
        this.creators.forEach(creator => {
            if (creator.categories) {
                creator.categories.forEach(category => categories.add(category));
            }
        });
        return Array.from(categories);
    }

    /**
     * Get Creator Leaderboard
     */
    getCreatorLeaderboard(metric = 'subscribers', limit = 20) {
        return this.creators
            .map(creator => ({
                ...creator,
                metricValue: this.getCreatorMetric(creator, metric)
            }))
            .sort((a, b) => b.metricValue - a.metricValue)
            .slice(0, limit);
    }

    /**
     * Get Creator Metric
     */
    getCreatorMetric(creator, metric) {
        switch (metric) {
            case 'subscribers':
                return creator.subscriberCount;
            case 'views':
                return creator.totalViews;
            case 'videos':
                return creator.videoCount;
            case 'engagement':
                const stats = this.creatorStats[creator.id];
                return stats ? stats.engagementRate : 0;
            default:
                return 0;
        }
    }

    /**
     * Calculate Trending Score
     */
    calculateTrendingScore(creator) {
        const stats = this.creatorStats[creator.id] || {};
        const recentContent = this.creatorContent[creator.id] || [];
        
        // Recent activity score
        const now = Date.now();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        const recentVideos = recentContent.filter(content => 
            (now - content.timestamp) < oneWeek
        ).length;
        
        // Engagement score
        const engagementScore = stats.engagementRate || 0;
        
        // Subscriber growth score
        const growthScore = stats.subscriberGrowth || 0;
        
        // Combined trending score
        return (recentVideos * 0.4) + (engagementScore * 0.3) + (growthScore * 0.3);
    }

    /**
     * Get Creator Recommendations
     */
    getCreatorRecommendations(userId, limit = 10) {
        const userSubscriptions = this.subscriptions;
        const subscribedCategories = this.creators
            .filter(creator => userSubscriptions.includes(creator.id))
            .flatMap(creator => creator.categories || []);
        
        // Find creators in similar categories
        const recommendations = this.creators
            .filter(creator => !userSubscriptions.includes(creator.id))
            .map(creator => ({
                ...creator,
                relevanceScore: this.calculateCreatorRelevance(creator, subscribedCategories)
            }))
            .filter(creator => creator.relevanceScore > 0.3)
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, limit);
        
        return recommendations;
    }

    /**
     * Calculate Creator Relevance
     */
    calculateCreatorRelevance(creator, subscribedCategories) {
        if (!creator.categories) return 0;
        
        const commonCategories = creator.categories.filter(category => 
            subscribedCategories.includes(category)
        );
        
        return commonCategories.length / Math.max(creator.categories.length, 1);
    }

    /**
     * Get Creator Statistics
     */
    getCreatorStatistics() {
        const totalCreators = this.creators.length;
        const verifiedCreators = this.creators.filter(c => c.verified).length;
        const totalSubscribers = this.creators.reduce((sum, c) => sum + c.subscriberCount, 0);
        const totalVideos = this.creators.reduce((sum, c) => sum + c.videoCount, 0);
        const totalViews = this.creators.reduce((sum, c) => sum + c.totalViews, 0);
        
        return {
            totalCreators,
            verifiedCreators,
            totalSubscribers,
            totalVideos,
            totalViews,
            averageSubscribers: totalCreators > 0 ? Math.round(totalSubscribers / totalCreators) : 0,
            averageVideos: totalCreators > 0 ? Math.round(totalVideos / totalCreators) : 0,
            averageViews: totalCreators > 0 ? Math.round(totalViews / totalCreators) : 0
        };
    }

    /**
     * Load Creators
     */
    loadCreators() {
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
                verified: true,
                categories: ['gaming', 'entertainment'],
                location: 'United States',
                socialLinks: {
                    twitter: 'https://twitter.com/progamer',
                    instagram: 'https://instagram.com/progamer'
                }
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
                verified: true,
                categories: ['music', 'education'],
                location: 'United Kingdom',
                socialLinks: {
                    twitter: 'https://twitter.com/musicproducer',
                    instagram: 'https://instagram.com/musicproducer'
                }
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
                verified: true,
                categories: ['tech', 'news'],
                location: 'Canada',
                socialLinks: {
                    twitter: 'https://twitter.com/technews',
                    instagram: 'https://instagram.com/technews'
                }
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
                verified: false,
                categories: ['lifestyle', 'education'],
                location: 'France',
                socialLinks: {
                    twitter: 'https://twitter.com/chefmaster',
                    instagram: 'https://instagram.com/chefmaster'
                }
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
                verified: true,
                categories: ['fitness', 'lifestyle'],
                location: 'Australia',
                socialLinks: {
                    twitter: 'https://twitter.com/fitnessguru',
                    instagram: 'https://instagram.com/fitnessguru'
                }
            }
        ];
    }

    /**
     * Load Subscriptions
     */
    loadSubscriptions() {
        const saved = localStorage.getItem('amplifi_subscriptions');
        return saved ? JSON.parse(saved) : [];
    }

    /**
     * Load Creator Stats
     */
    loadCreatorStats() {
        const saved = localStorage.getItem('amplifi_creator_stats');
        return saved ? JSON.parse(saved) : {};
    }

    /**
     * Load Creator Content
     */
    loadCreatorContent() {
        const saved = localStorage.getItem('amplifi_creator_content');
        return saved ? JSON.parse(saved) : {};
    }

    /**
     * Load Creator Analytics
     */
    loadCreatorAnalytics() {
        const saved = localStorage.getItem('amplifi_creator_analytics');
        return saved ? JSON.parse(saved) : {};
    }

    /**
     * Save Methods
     */
    saveCreators() {
        localStorage.setItem('amplifi_creators', JSON.stringify(this.creators));
    }

    saveSubscriptions() {
        localStorage.setItem('amplifi_subscriptions', JSON.stringify(this.subscriptions));
    }

    saveCreatorStats() {
        localStorage.setItem('amplifi_creator_stats', JSON.stringify(this.creatorStats));
    }

    saveCreatorContent() {
        localStorage.setItem('amplifi_creator_content', JSON.stringify(this.creatorContent));
    }

    saveCreatorAnalytics() {
        localStorage.setItem('amplifi_creator_analytics', JSON.stringify(this.creatorAnalytics));
    }
}

// Initialize Creator Network
window.CreatorNetwork = CreatorNetwork;
