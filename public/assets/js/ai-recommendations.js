/**
 * AI-Powered Content Recommendations System
 */

class AIRecommendationEngine {
    constructor() {
        this.userPreferences = this.loadUserPreferences();
        this.contentDatabase = this.loadContentDatabase();
        this.interactionHistory = this.loadInteractionHistory();
        this.recommendationCache = new Map();
    }

    /**
     * Generate Personalized Recommendations
     */
    async generateRecommendations(userId, limit = 20) {
        const cacheKey = `rec_${userId}_${limit}`;
        
        if (this.recommendationCache.has(cacheKey)) {
            return this.recommendationCache.get(cacheKey);
        }

        try {
            const userProfile = await this.getUserProfile(userId);
            const userInteractions = await this.getUserInteractions(userId);
            
            const recommendations = {
                personalized: await this.getPersonalizedRecommendations(userProfile, userInteractions, limit),
                trending: await this.getTrendingRecommendations(limit),
                similar: await this.getSimilarContentRecommendations(userInteractions, limit),
                discovery: await this.getDiscoveryRecommendations(userProfile, limit)
            };

            const finalRecommendations = this.rankAndCombineRecommendations(recommendations, limit);
            this.recommendationCache.set(cacheKey, finalRecommendations);
            
            return finalRecommendations;
        } catch (error) {
            console.error('Error generating recommendations:', error);
            return this.getFallbackRecommendations(limit);
        }
    }

    /**
     * Personalized Recommendations using Collaborative Filtering
     */
    async getPersonalizedRecommendations(userProfile, interactions, limit) {
        const userVector = this.createUserVector(userProfile, interactions);
        const contentVectors = this.createContentVectors();
        
        const similarities = contentVectors.map(content => ({
            contentId: content.id,
            similarity: this.calculateCosineSimilarity(userVector, content.vector),
            content: content
        }));

        return similarities
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit)
            .map(item => item.content);
    }

    /**
     * Trending Recommendations
     */
    async getTrendingRecommendations(limit) {
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        
        const recentContent = this.contentDatabase.filter(content => 
            (now - content.timestamp) < oneDay
        );

        const trendingContent = recentContent.map(content => ({
            ...content,
            trendingScore: this.calculateTrendingScore(content)
        }));

        return trendingContent
            .sort((a, b) => b.trendingScore - a.trendingScore)
            .slice(0, limit);
    }

    /**
     * Calculate Trending Score
     */
    calculateTrendingScore(content) {
        const now = Date.now();
        const age = (now - content.timestamp) / (1000 * 60 * 60);
        
        const views = content.views || 0;
        const likes = content.likes || 0;
        const comments = content.comments || 0;
        const shares = content.shares || 0;
        
        const engagementScore = (views * 1) + (likes * 3) + (comments * 5) + (shares * 10);
        const timeDecay = Math.exp(-age / 24);
        
        return engagementScore * timeDecay;
    }

    /**
     * Create User Vector for ML
     */
    createUserVector(userProfile, interactions) {
        const vector = new Array(50).fill(0);
        
        const categoryPrefs = this.getCategoryPreferences(interactions);
        Object.keys(categoryPrefs).forEach((category, index) => {
            if (index < 20) vector[index] = categoryPrefs[category];
        });
        
        const avgDuration = this.getAverageDuration(interactions);
        vector[20] = avgDuration / 3600;
        
        return vector;
    }

    /**
     * Create Content Vectors
     */
    createContentVectors() {
        return this.contentDatabase.map(content => ({
            id: content.id,
            vector: this.createContentVector(content),
            content: content
        }));
    }

    /**
     * Create Content Vector
     */
    createContentVector(content) {
        const vector = new Array(50).fill(0);
        
        const categories = ['gaming', 'music', 'education', 'entertainment', 'tech', 'lifestyle', 'sports', 'news'];
        const categoryIndex = categories.indexOf(content.category);
        if (categoryIndex >= 0) vector[categoryIndex] = 1;
        
        vector[20] = (content.duration || 0) / 3600;
        vector[21] = (content.views || 0) / 1000000;
        vector[22] = (content.likes || 0) / 10000;
        
        return vector;
    }

    /**
     * Calculate Cosine Similarity
     */
    calculateCosineSimilarity(vector1, vector2) {
        if (vector1.length !== vector2.length) return 0;
        
        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;
        
        for (let i = 0; i < vector1.length; i++) {
            dotProduct += vector1[i] * vector2[i];
            norm1 += vector1[i] * vector1[i];
            norm2 += vector2[i] * vector2[i];
        }
        
        if (norm1 === 0 || norm2 === 0) return 0;
        
        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }

    /**
     * Rank and Combine Recommendations
     */
    rankAndCombineRecommendations(recommendations, limit) {
        const allRecommendations = [];
        
        recommendations.personalized.forEach((content, index) => {
            allRecommendations.push({
                ...content,
                score: 0.4 * (1 - index / recommendations.personalized.length),
                type: 'personalized'
            });
        });
        
        recommendations.trending.forEach((content, index) => {
            allRecommendations.push({
                ...content,
                score: 0.3 * (1 - index / recommendations.trending.length),
                type: 'trending'
            });
        });
        
        const uniqueRecommendations = this.removeDuplicates(allRecommendations);
        return uniqueRecommendations
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    /**
     * Remove Duplicate Recommendations
     */
    removeDuplicates(recommendations) {
        const seen = new Set();
        return recommendations.filter(rec => {
            if (seen.has(rec.id)) return false;
            seen.add(rec.id);
            return true;
        });
    }

    /**
     * Get Fallback Recommendations
     */
    getFallbackRecommendations(limit) {
        return this.contentDatabase
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, limit);
    }

    /**
     * Load User Preferences
     */
    loadUserPreferences() {
        const saved = localStorage.getItem('amplifi_user_preferences');
        return saved ? JSON.parse(saved) : {
            categories: [],
            duration: 'medium',
            timeOfDay: 'any',
            language: 'en',
            quality: 'auto'
        };
    }

    /**
     * Load Content Database
     */
    loadContentDatabase() {
        return [
            {
                id: '1',
                title: 'Amazing Gaming Tutorial',
                category: 'gaming',
                duration: 1200,
                views: 50000,
                likes: 2500,
                comments: 150,
                shares: 200,
                tags: ['gaming', 'tutorial', 'tips'],
                creatorId: 'creator1',
                timestamp: Date.now() - 3600000,
                engagementScore: 0.85
            },
            {
                id: '2',
                title: 'Music Production Masterclass',
                category: 'music',
                duration: 2400,
                views: 75000,
                likes: 4200,
                comments: 300,
                shares: 450,
                tags: ['music', 'production', 'tutorial'],
                creatorId: 'creator2',
                timestamp: Date.now() - 7200000,
                engagementScore: 0.92
            },
            {
                id: '3',
                title: 'Tech News Update',
                category: 'tech',
                duration: 600,
                views: 30000,
                likes: 1800,
                comments: 80,
                shares: 120,
                tags: ['tech', 'news', 'update'],
                creatorId: 'creator3',
                timestamp: Date.now() - 1800000,
                engagementScore: 0.78
            }
        ];
    }

    /**
     * Load Interaction History
     */
    loadInteractionHistory() {
        const saved = localStorage.getItem('amplifi_interaction_history');
        return saved ? JSON.parse(saved) : [];
    }

    /**
     * Record User Interaction
     */
    recordInteraction(userId, contentId, interactionType, metadata = {}) {
        const interaction = {
            userId,
            contentId,
            type: interactionType,
            timestamp: Date.now(),
            metadata
        };
        
        this.interactionHistory.push(interaction);
        localStorage.setItem('amplifi_interaction_history', JSON.stringify(this.interactionHistory));
        this.recommendationCache.clear();
    }

    /**
     * Get User Profile
     */
    async getUserProfile(userId) {
        return {
            id: userId,
            preferences: this.userPreferences,
            joinDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
            totalWatchTime: 0,
            favoriteCategories: []
        };
    }

    /**
     * Get User Interactions
     */
    async getUserInteractions(userId) {
        return this.interactionHistory.filter(interaction => interaction.userId === userId);
    }

    /**
     * Helper Methods
     */
    getCategoryPreferences(interactions) {
        const categoryCounts = {};
        interactions.forEach(interaction => {
            const content = this.contentDatabase.find(c => c.id === interaction.contentId);
            if (content) {
                categoryCounts[content.category] = (categoryCounts[content.category] || 0) + 1;
            }
        });
        return categoryCounts;
    }

    getAverageDuration(interactions) {
        const durations = interactions.map(interaction => {
            const content = this.contentDatabase.find(c => c.id === interaction.contentId);
            return content ? content.duration : 0;
        });
        return durations.reduce((sum, duration) => sum + duration, 0) / durations.length || 0;
    }

    async getSimilarContentRecommendations(interactions, limit) {
        if (interactions.length === 0) return [];
        return this.getFallbackRecommendations(limit);
    }

    async getDiscoveryRecommendations(userProfile, limit) {
        return this.getFallbackRecommendations(limit);
    }
}

// Initialize AI Recommendation Engine
window.AIRecommendationEngine = AIRecommendationEngine;