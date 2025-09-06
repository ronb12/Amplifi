// AI-Powered Recommendation System for Amplifi - Complete Creator Platform
// Includes: Personalized recommendations, trending algorithm, watch history analysis

class AIRecommendationEngine {
    constructor() {
        this.userPreferences = {};
        this.watchHistory = [];
        this.videoEmbeddings = {};
        this.recommendationCache = {};
        this.trendingAlgorithm = new TrendingAlgorithm();
        this.collaborativeFiltering = new CollaborativeFiltering();
        this.contentBasedFiltering = new ContentBasedFiltering();
        
        this.init();
    }

    init() {
        this.loadUserPreferences();
        this.loadWatchHistory();
        this.setupEventListeners();
        console.log('🤖 AI Recommendation Engine initialized');
    }

    setupEventListeners() {
        // Listen for video views
        document.addEventListener('videoViewed', (e) => {
            this.recordVideoView(e.detail.videoId, e.detail.watchTime, e.detail.completionRate);
        });

        // Listen for user interactions
        document.addEventListener('userInteraction', (e) => {
            this.recordUserInteraction(e.detail.type, e.detail.videoId, e.detail.data);
        });
    }

    // Core recommendation methods
    async getPersonalizedRecommendations(userId, limit = 20) {
        try {
            const userProfile = await this.getUserProfile(userId);
            const watchHistory = await this.getWatchHistory(userId);
            
            // Get recommendations from multiple algorithms
            const collaborativeRecs = await this.collaborativeFiltering.getRecommendations(userId, limit);
            const contentRecs = await this.contentBasedFiltering.getRecommendations(userProfile, limit);
            const trendingRecs = await this.trendingAlgorithm.getTrendingVideos(limit);
            
            // Combine and rank recommendations
            const combinedRecs = this.combineRecommendations([
                { recommendations: collaborativeRecs, weight: 0.4 },
                { recommendations: contentRecs, weight: 0.4 },
                { recommendations: trendingRecs, weight: 0.2 }
            ]);
            
            // Apply diversity and freshness filters
            const finalRecs = this.applyDiversityFilters(combinedRecs, limit);
            
            return finalRecs;
        } catch (error) {
            console.error('Error getting personalized recommendations:', error);
            return this.getFallbackRecommendations(limit);
        }
    }

    async getHomePageRecommendations(userId) {
        const recommendations = await this.getPersonalizedRecommendations(userId, 50);
        
        // Organize into sections like professional platforms
        return {
            trending: recommendations.slice(0, 8),
            recommended: recommendations.slice(8, 20),
            continueWatching: await this.getContinueWatching(userId),
            subscriptions: await this.getSubscriptionVideos(userId),
            trendingInCategory: await this.getTrendingInCategory(userId)
        };
    }

    async getRelatedVideos(videoId, limit = 20) {
        try {
            const currentVideo = await this.getVideo(videoId);
            const userProfile = await this.getCurrentUserProfile();
            
            // Get videos with similar tags, categories, and creators
            const similarVideos = await this.findSimilarVideos(currentVideo, limit);
            
            // Personalize based on user preferences
            const personalizedSimilar = this.personalizeRecommendations(similarVideos, userProfile);
            
            return personalizedSimilar;
        } catch (error) {
            console.error('Error getting related videos:', error);
            return this.getFallbackRecommendations(limit);
        }
    }

    async getTrendingVideos(category = null, region = null, limit = 50) {
        return await this.trendingAlgorithm.getTrendingVideos(limit, category, region);
    }

    // User behavior tracking
    recordVideoView(videoId, watchTime, completionRate) {
        const viewData = {
            videoId,
            watchTime,
            completionRate,
            timestamp: Date.now(),
            sessionId: this.getSessionId()
        };
        
        this.watchHistory.push(viewData);
        this.updateUserPreferences(videoId, completionRate);
        this.saveWatchHistory();
        
        // Emit event for other components
        document.dispatchEvent(new CustomEvent('recommendationsUpdated', {
            detail: { videoId, watchTime, completionRate }
        }));
    }

    recordUserInteraction(type, videoId, data) {
        const interaction = {
            type,
            videoId,
            data,
            timestamp: Date.now(),
            userId: this.getCurrentUserId()
        };
        
        this.processUserInteraction(interaction);
    }

    // User preference learning
    updateUserPreferences(videoId, completionRate) {
        const video = this.videoEmbeddings[videoId];
        if (!video) return;
        
        // Update category preferences
        if (completionRate > 0.7) {
            this.userPreferences[video.category] = (this.userPreferences[video.category] || 0) + 1;
        }
        
        // Update creator preferences
        if (completionRate > 0.5) {
            this.userPreferences[`creator_${video.creatorId}`] = 
                (this.userPreferences[`creator_${video.creatorId}`] || 0) + 1;
        }
        
        // Update tag preferences
        video.tags.forEach(tag => {
            if (completionRate > 0.6) {
                this.userPreferences[`tag_${tag}`] = (this.userPreferences[`tag_${tag}`] || 0) + 1;
            }
        });
        
        this.saveUserPreferences();
    }

    // Algorithm implementations
    combineRecommendations(algorithmResults) {
        const combined = new Map();
        
        algorithmResults.forEach(({ recommendations, weight }) => {
            recommendations.forEach(rec => {
                const currentScore = combined.get(rec.videoId) || 0;
                combined.set(rec.videoId, currentScore + (rec.score * weight));
            });
        });
        
        // Convert to array and sort by score
        return Array.from(combined.entries())
            .map(([videoId, score]) => ({ videoId, score }))
            .sort((a, b) => b.score - a.score);
    }

    applyDiversityFilters(recommendations, limit) {
        const diverse = [];
        const categories = new Set();
        const creators = new Set();
        
        for (const rec of recommendations) {
            if (diverse.length >= limit) break;
            
            const video = this.videoEmbeddings[rec.videoId];
            if (!video) continue;
            
            // Ensure diversity in categories
            if (categories.size < 5 || !categories.has(video.category)) {
                categories.add(video.category);
                diverse.push(rec);
            }
            // Ensure diversity in creators
            else if (creators.size < 10 || !creators.has(video.creatorId)) {
                creators.add(video.creatorId);
                diverse.push(rec);
            }
        }
        
        return diverse;
    }

    personalizeRecommendations(videos, userProfile) {
        return videos.map(video => {
            let personalScore = video.score || 1;
            
            // Boost based on user preferences
            if (userProfile.preferredCategories.includes(video.category)) {
                personalScore *= 1.5;
            }
            
            if (userProfile.subscribedCreators.includes(video.creatorId)) {
                personalScore *= 1.3;
            }
            
            // Boost based on watch history patterns
            const watchTime = this.getAverageWatchTime(video.category);
            if (watchTime > 0.7) {
                personalScore *= 1.2;
            }
            
            return { ...video, personalScore };
        }).sort((a, b) => b.personalScore - a.personalScore);
    }

    // Utility methods
    async getUserProfile(userId) {
        // This would typically fetch from Firebase
        return {
            preferredCategories: ['gaming', 'technology', 'education'],
            subscribedCreators: ['creator1', 'creator2'],
            watchHistory: this.watchHistory,
            preferences: this.userPreferences
        };
    }

    async getCurrentUserProfile() {
        const userId = this.getCurrentUserId();
        return userId ? await this.getUserProfile(userId) : null;
    }

    async getVideo(videoId) {
        // This would typically fetch from Firebase
        return this.videoEmbeddings[videoId] || {
            id: videoId,
            category: 'general',
            creatorId: 'unknown',
            tags: []
        };
    }

    async findSimilarVideos(video, limit) {
        // Find videos with similar characteristics
        const similar = [];
        
        Object.values(this.videoEmbeddings).forEach(candidate => {
            if (candidate.id === video.id) return;
            
            let similarity = 0;
            
            // Category similarity
            if (candidate.category === video.category) similarity += 0.4;
            
            // Creator similarity
            if (candidate.creatorId === video.creatorId) similarity += 0.3;
            
            // Tag similarity
            const commonTags = video.tags.filter(tag => candidate.tags.includes(tag));
            similarity += (commonTags.length / Math.max(video.tags.length, candidate.tags.length)) * 0.3;
            
            if (similarity > 0.2) {
                similar.push({ ...candidate, similarity });
            }
        });
        
        return similar
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);
    }

    getAverageWatchTime(category) {
        const categoryViews = this.watchHistory.filter(view => {
            const video = this.videoEmbeddings[view.videoId];
            return video && video.category === category;
        });
        
        if (categoryViews.length === 0) return 0;
        
        const totalCompletion = categoryViews.reduce((sum, view) => sum + view.completionRate, 0);
        return totalCompletion / categoryViews.length;
    }

    async getContinueWatching(userId) {
        const userHistory = this.watchHistory.filter(h => h.userId === userId);
        const incompleteVideos = userHistory.filter(h => h.completionRate < 0.9);
        
        return incompleteVideos
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 8)
            .map(h => this.videoEmbeddings[h.videoId])
            .filter(Boolean);
    }

    async getSubscriptionVideos(userId) {
        const userProfile = await this.getUserProfile(userId);
        const subscribedCreators = userProfile.subscribedCreators;
        
        return Object.values(this.videoEmbeddings)
            .filter(video => subscribedCreators.includes(video.creatorId))
            .sort((a, b) => b.uploadDate - a.uploadDate)
            .slice(0, 12);
    }

    async getTrendingInCategory(userId) {
        const userProfile = await this.getUserProfile(userId);
        const preferredCategory = userProfile.preferredCategories[0];
        
        return await this.trendingAlgorithm.getTrendingVideos(8, preferredCategory);
    }

    getFallbackRecommendations(limit) {
        // Return popular videos when recommendations fail
        return Object.values(this.videoEmbeddings)
            .sort((a, b) => b.views - a.views)
            .slice(0, limit);
    }

    // Data persistence
    saveUserPreferences() {
        localStorage.setItem('amplifi_user_preferences', JSON.stringify(this.userPreferences));
    }

    saveWatchHistory() {
        localStorage.setItem('amplifi_watch_history', JSON.stringify(this.watchHistory));
    }

    loadUserPreferences() {
        const saved = localStorage.getItem('amplifi_user_preferences');
        this.userPreferences = saved ? JSON.parse(saved) : {};
    }

    loadWatchHistory() {
        const saved = localStorage.getItem('amplifi_watch_history');
        this.watchHistory = saved ? JSON.parse(saved) : [];
    }

    // Utility methods
    getCurrentUserId() {
        // This would typically get from Firebase Auth
        return localStorage.getItem('amplifi_user_id') || null;
    }

    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        return this.sessionId;
    }

    processUserInteraction(interaction) {
        // Process different types of interactions
        switch (interaction.type) {
            case 'like':
                this.updateUserPreferences(interaction.videoId, 0.8);
                break;
            case 'dislike':
                this.updateUserPreferences(interaction.videoId, 0.2);
                break;
            case 'share':
                this.updateUserPreferences(interaction.videoId, 0.9);
                break;
            case 'comment':
                this.updateUserPreferences(interaction.videoId, 0.7);
                break;
            case 'subscribe':
                this.updateUserPreferences(`creator_${interaction.data.creatorId}`, 1.0);
                break;
        }
    }
}

// Trending Algorithm Implementation
class TrendingAlgorithm {
    constructor() {
        this.trendingFactors = {
            views: 0.3,
            likes: 0.2,
            comments: 0.15,
            shares: 0.15,
            uploadRecency: 0.2
        };
    }

    async getTrendingVideos(limit, category = null, region = null) {
        try {
            // This would typically fetch from Firebase with real-time analytics
            const videos = await this.getVideosWithAnalytics(category, region);
            
            // Calculate trending scores
            const trendingVideos = videos.map(video => ({
                ...video,
                trendingScore: this.calculateTrendingScore(video)
            }));
            
            // Sort by trending score
            return trendingVideos
                .sort((a, b) => b.trendingScore - a.trendingScore)
                .slice(0, limit);
        } catch (error) {
            console.error('Error getting trending videos:', error);
            return [];
        }
    }

    calculateTrendingScore(video) {
        const now = Date.now();
        const hoursSinceUpload = (now - video.uploadDate) / (1000 * 60 * 60);
        
        // Normalize metrics
        const normalizedViews = Math.log10(video.views + 1);
        const normalizedLikes = Math.log10(video.likes + 1);
        const normalizedComments = Math.log10(video.comments + 1);
        const normalizedShares = Math.log10(video.shares + 1);
        
        // Time decay factor (newer videos get boost)
        const timeDecay = Math.exp(-hoursSinceUpload / 24);
        
        // Calculate final score
        return (
            normalizedViews * this.trendingFactors.views +
            normalizedLikes * this.trendingFactors.likes +
            normalizedComments * this.trendingFactors.comments +
            normalizedShares * this.trendingFactors.shares +
            timeDecay * this.trendingFactors.uploadRecency
        );
    }

    async getVideosWithAnalytics(category, region) {
        // This would fetch from Firebase with real analytics data
        // For now, return mock data
        return [
            {
                id: 'trending1',
                title: 'Trending Video 1',
                views: 150000,
                likes: 8500,
                comments: 1200,
                shares: 450,
                uploadDate: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
                category: category || 'general',
                region: region || 'US'
            }
        ];
    }
}

// Collaborative Filtering Implementation
class CollaborativeFiltering {
    async getRecommendations(userId, limit) {
        try {
            // Find users with similar preferences
            const similarUsers = await this.findSimilarUsers(userId);
            
            // Get videos liked by similar users
            const recommendations = await this.getVideosFromSimilarUsers(similarUsers);
            
            return recommendations.slice(0, limit);
        } catch (error) {
            console.error('Error in collaborative filtering:', error);
            return [];
        }
    }

    async findSimilarUsers(userId) {
        // This would analyze user behavior patterns
        // For now, return mock similar users
        return ['user2', 'user3', 'user4'];
    }

    async getVideosFromSimilarUsers(similarUsers) {
        // This would fetch videos liked by similar users
        // For now, return mock recommendations
        return [
            { videoId: 'collab1', score: 0.85 },
            { videoId: 'collab2', score: 0.78 }
        ];
    }
}

// Content-Based Filtering Implementation
class ContentBasedFiltering {
    async getRecommendations(userProfile, limit) {
        try {
            // Analyze user's content preferences
            const preferredFeatures = this.extractPreferredFeatures(userProfile);
            
            // Find videos matching these features
            const recommendations = await this.findMatchingVideos(preferredFeatures);
            
            return recommendations.slice(0, limit);
        } catch (error) {
            console.error('Error in content-based filtering:', error);
            return [];
        }
    }

    extractPreferredFeatures(userProfile) {
        // Extract features from user preferences
        return {
            categories: userProfile.preferredCategories,
            creators: userProfile.subscribedCreators,
            tags: this.extractPreferredTags(userProfile.preferences)
        };
    }

    extractPreferredTags(preferences) {
        return Object.keys(preferences)
            .filter(key => key.startsWith('tag_'))
            .map(key => key.replace('tag_', ''))
            .sort((a, b) => preferences[`tag_${b}`] - preferences[`tag_${a}`])
            .slice(0, 10);
    }

    async findMatchingVideos(preferredFeatures) {
        // This would find videos matching user preferences
        // For now, return mock recommendations
        return [
            { videoId: 'content1', score: 0.92 },
            { videoId: 'content2', score: 0.88 }
        ];
    }
}

// Export for global use
window.AIRecommendationEngine = AIRecommendationEngine;
window.TrendingAlgorithm = TrendingAlgorithm;
window.CollaborativeFiltering = CollaborativeFiltering;
window.ContentBasedFiltering = ContentBasedFiltering;
