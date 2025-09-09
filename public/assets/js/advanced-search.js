/**
 * Advanced Search System with AI-Powered Filtering
 */

class AdvancedSearch {
    constructor() {
        this.searchHistory = this.loadSearchHistory();
        this.searchFilters = this.loadSearchFilters();
        this.searchSuggestions = this.loadSearchSuggestions();
        this.aiEngine = new AIRecommendationEngine();
    }

    /**
     * Perform Advanced Search
     */
    async search(query, filters = {}, userId = null) {
        const searchId = this.generateSearchId();
        const startTime = Date.now();

        try {
            // Record search
            this.recordSearch(query, filters, userId);

            // Parse query for advanced features
            const parsedQuery = this.parseQuery(query);

            // Get search results
            let results = await this.getSearchResults(parsedQuery, filters);

            // Apply AI-powered ranking
            if (userId) {
                results = await this.applyAIRanking(results, userId);
            }

            // Apply filters
            results = this.applyFilters(results, filters);

            // Sort results
            results = this.sortResults(results, parsedQuery);

            // Record search performance
            const searchTime = Date.now() - startTime;
            this.recordSearchPerformance(searchId, searchTime, results.length);

            return {
                query,
                results,
                totalResults: results.length,
                searchTime,
                filters: this.getAppliedFilters(filters),
                suggestions: this.getSearchSuggestions(query)
            };

        } catch (error) {
            console.error('Search error:', error);
            return {
                query,
                results: [],
                totalResults: 0,
                searchTime: Date.now() - startTime,
                error: 'Search failed. Please try again.'
            };
        }
    }

    /**
     * Parse Query for Advanced Features
     */
    parseQuery(query) {
        const parsed = {
            original: query,
            terms: [],
            operators: [],
            filters: {},
            intent: 'general'
        };

        // Extract search terms
        parsed.terms = query.toLowerCase().split(/\s+/);

        // Extract operators (quotes, minus, etc.)
        if (query.includes('"')) {
            parsed.operators.push('exact_phrase');
        }
        if (query.includes('-')) {
            parsed.operators.push('exclude');
        }
        if (query.includes('OR') || query.includes('|')) {
            parsed.operators.push('or');
        }

        // Detect search intent
        parsed.intent = this.detectSearchIntent(query);

        // Extract filters from query
        parsed.filters = this.extractFiltersFromQuery(query);

        return parsed;
    }

    /**
     * Detect Search Intent
     */
    detectSearchIntent(query) {
        const intents = {
            tutorial: ['how to', 'tutorial', 'learn', 'guide', 'step by step'],
            entertainment: ['funny', 'comedy', 'entertainment', 'joke', 'meme'],
            news: ['news', 'update', 'latest', 'breaking', 'today'],
            music: ['music', 'song', 'album', 'artist', 'lyrics'],
            gaming: ['game', 'gaming', 'play', 'walkthrough', 'review']
        };

        const lowerQuery = query.toLowerCase();
        
        for (const [intent, keywords] of Object.entries(intents)) {
            if (keywords.some(keyword => lowerQuery.includes(keyword))) {
                return intent;
            }
        }

        return 'general';
    }

    /**
     * Extract Filters from Query
     */
    extractFiltersFromQuery(query) {
        const filters = {};

        // Duration filters
        if (query.includes('short') || query.includes('quick')) {
            filters.duration = 'short';
        } else if (query.includes('long') || query.includes('full')) {
            filters.duration = 'long';
        }

        // Category filters
        const categories = ['gaming', 'music', 'tech', 'education', 'entertainment'];
        categories.forEach(category => {
            if (query.toLowerCase().includes(category)) {
                filters.category = category;
            }
        });

        // Date filters
        if (query.includes('today')) {
            filters.date = 'today';
        } else if (query.includes('week')) {
            filters.date = 'week';
        } else if (query.includes('month')) {
            filters.date = 'month';
        }

        return filters;
    }

    /**
     * Get Search Results
     */
    async getSearchResults(parsedQuery, filters) {
        // This would typically query a real database
        // For now, we'll use sample data
        const allContent = this.getSampleContent();

        let results = allContent;

        // Apply text search
        if (parsedQuery.terms.length > 0) {
            results = this.applyTextSearch(results, parsedQuery);
        }

        // Apply intent-based filtering
        if (parsedQuery.intent !== 'general') {
            results = this.applyIntentFiltering(results, parsedQuery.intent);
        }

        return results;
    }

    /**
     * Apply Text Search
     */
    applyTextSearch(content, parsedQuery) {
        return content.filter(item => {
            const searchableText = [
                item.title,
                item.description,
                item.tags?.join(' '),
                item.category
            ].join(' ').toLowerCase();

            // Check for exact phrase
            if (parsedQuery.operators.includes('exact_phrase')) {
                const phrase = parsedQuery.original.match(/"([^"]+)"/);
                if (phrase) {
                    return searchableText.includes(phrase[1].toLowerCase());
                }
            }

            // Check for all terms
            return parsedQuery.terms.every(term => {
                if (term.startsWith('-')) {
                    return !searchableText.includes(term.substring(1));
                }
                return searchableText.includes(term);
            });
        });
    }

    /**
     * Apply Intent Filtering
     */
    applyIntentFiltering(content, intent) {
        const intentFilters = {
            tutorial: item => item.category === 'education' || item.tags?.includes('tutorial'),
            entertainment: item => item.category === 'entertainment' || item.tags?.includes('funny'),
            news: item => item.category === 'news' || item.tags?.includes('news'),
            music: item => item.category === 'music' || item.tags?.includes('music'),
            gaming: item => item.category === 'gaming' || item.tags?.includes('gaming')
        };

        const filter = intentFilters[intent];
        return filter ? content.filter(filter) : content;
    }

    /**
     * Apply AI Ranking
     */
    async applyAIRanking(results, userId) {
        try {
            // Get user preferences
            const userProfile = await this.aiEngine.getUserProfile(userId);
            const userInteractions = await this.aiEngine.getUserInteractions(userId);

            // Calculate relevance scores
            const rankedResults = results.map(item => ({
                ...item,
                relevanceScore: this.calculateRelevanceScore(item, userProfile, userInteractions)
            }));

            return rankedResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
        } catch (error) {
            console.error('AI ranking error:', error);
            return results;
        }
    }

    /**
     * Calculate Relevance Score
     */
    calculateRelevanceScore(item, userProfile, userInteractions) {
        let score = 0;

        // Base score from engagement
        score += (item.views || 0) * 0.1;
        score += (item.likes || 0) * 0.3;
        score += (item.comments || 0) * 0.5;
        score += (item.shares || 0) * 1.0;

        // User preference matching
        if (userProfile.preferences.categories.includes(item.category)) {
            score += 50;
        }

        // Recent interaction with similar content
        const similarInteractions = userInteractions.filter(interaction => {
            const content = this.getContentById(interaction.contentId);
            return content && content.category === item.category;
        });

        if (similarInteractions.length > 0) {
            score += 30;
        }

        // Creator following
        if (userProfile.following?.includes(item.creatorId)) {
            score += 20;
        }

        return score;
    }

    /**
     * Apply Filters
     */
    applyFilters(results, filters) {
        let filtered = results;

        // Duration filter
        if (filters.duration) {
            filtered = filtered.filter(item => {
                const duration = item.duration || 0;
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

        // Category filter
        if (filters.category) {
            filtered = filtered.filter(item => item.category === filters.category);
        }

        // Date filter
        if (filters.date) {
            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;
            const oneWeek = 7 * oneDay;
            const oneMonth = 30 * oneDay;

            filtered = filtered.filter(item => {
                const itemDate = item.timestamp || 0;
                switch (filters.date) {
                    case 'today':
                        return (now - itemDate) < oneDay;
                    case 'week':
                        return (now - itemDate) < oneWeek;
                    case 'month':
                        return (now - itemDate) < oneMonth;
                    default:
                        return true;
                }
            });
        }

        // Quality filter
        if (filters.quality) {
            filtered = filtered.filter(item => {
                const quality = this.calculateQualityScore(item);
                switch (filters.quality) {
                    case 'high':
                        return quality >= 0.8;
                    case 'medium':
                        return quality >= 0.5;
                    case 'low':
                        return quality >= 0.2;
                    default:
                        return true;
                }
            });
        }

        return filtered;
    }

    /**
     * Calculate Quality Score
     */
    calculateQualityScore(item) {
        const views = item.views || 0;
        const likes = item.likes || 0;
        const comments = item.comments || 0;
        const shares = item.shares || 0;

        // Engagement rate
        const engagementRate = (likes + comments + shares) / Math.max(views, 1);

        // Quality score based on engagement and views
        const qualityScore = Math.min(engagementRate * 100 + (views / 10000), 1);

        return qualityScore;
    }

    /**
     * Sort Results
     */
    sortResults(results, parsedQuery) {
        return results.sort((a, b) => {
            // Primary sort by relevance score
            if (a.relevanceScore !== b.relevanceScore) {
                return (b.relevanceScore || 0) - (a.relevanceScore || 0);
            }

            // Secondary sort by engagement
            const engagementA = (a.likes || 0) + (a.comments || 0) + (a.shares || 0);
            const engagementB = (b.likes || 0) + (b.comments || 0) + (b.shares || 0);

            if (engagementA !== engagementB) {
                return engagementB - engagementA;
            }

            // Tertiary sort by recency
            return (b.timestamp || 0) - (a.timestamp || 0);
        });
    }

    /**
     * Get Search Suggestions
     */
    getSearchSuggestions(query) {
        const suggestions = [];

        // Add popular searches
        const popularSearches = this.getPopularSearches();
        suggestions.push(...popularSearches.filter(search => 
            search.toLowerCase().includes(query.toLowerCase())
        ));

        // Add trending topics
        const trendingTopics = this.getTrendingTopics();
        suggestions.push(...trendingTopics.filter(topic => 
            topic.toLowerCase().includes(query.toLowerCase())
        ));

        // Add category suggestions
        const categories = ['gaming', 'music', 'tech', 'education', 'entertainment'];
        suggestions.push(...categories.filter(category => 
            category.toLowerCase().includes(query.toLowerCase())
        ));

        return [...new Set(suggestions)].slice(0, 10);
    }

    /**
     * Get Popular Searches
     */
    getPopularSearches() {
        return [
            'gaming tutorials',
            'music production',
            'tech reviews',
            'cooking tips',
            'fitness workouts',
            'travel vlogs',
            'comedy sketches',
            'educational content'
        ];
    }

    /**
     * Get Trending Topics
     */
    getTrendingTopics() {
        return [
            'AI technology',
            'sustainable living',
            'cryptocurrency',
            'mental health',
            'climate change',
            'remote work',
            'digital art',
            'space exploration'
        ];
    }

    /**
     * Record Search
     */
    recordSearch(query, filters, userId) {
        const search = {
            id: this.generateSearchId(),
            query,
            filters,
            userId,
            timestamp: Date.now()
        };

        this.searchHistory.push(search);
        this.saveSearchHistory();

        // Update search suggestions
        this.updateSearchSuggestions(query);
    }

    /**
     * Update Search Suggestions
     */
    updateSearchSuggestions(query) {
        if (!this.searchSuggestions.includes(query)) {
            this.searchSuggestions.unshift(query);
            this.searchSuggestions = this.searchSuggestions.slice(0, 100);
            this.saveSearchSuggestions();
        }
    }

    /**
     * Record Search Performance
     */
    recordSearchPerformance(searchId, searchTime, resultCount) {
        const performance = {
            searchId,
            searchTime,
            resultCount,
            timestamp: Date.now()
        };

        const saved = this.loadSearchPerformance();
        saved.push(performance);
        this.saveSearchPerformance(saved);
    }

    /**
     * Get Applied Filters
     */
    getAppliedFilters(filters) {
        const applied = [];
        
        if (filters.duration) applied.push(`Duration: ${filters.duration}`);
        if (filters.category) applied.push(`Category: ${filters.category}`);
        if (filters.date) applied.push(`Date: ${filters.date}`);
        if (filters.quality) applied.push(`Quality: ${filters.quality}`);

        return applied;
    }

    /**
     * Get Sample Content
     */
    getSampleContent() {
        return [
            {
                id: '1',
                title: 'Advanced Gaming Tutorial',
                description: 'Learn advanced gaming techniques and strategies',
                category: 'gaming',
                duration: 1200,
                views: 50000,
                likes: 2500,
                comments: 150,
                shares: 200,
                tags: ['gaming', 'tutorial', 'advanced'],
                creatorId: 'creator1',
                timestamp: Date.now() - 3600000
            },
            {
                id: '2',
                title: 'Music Production Masterclass',
                description: 'Complete guide to music production',
                category: 'music',
                duration: 2400,
                views: 75000,
                likes: 4200,
                comments: 300,
                shares: 450,
                tags: ['music', 'production', 'tutorial'],
                creatorId: 'creator2',
                timestamp: Date.now() - 7200000
            },
            {
                id: '3',
                title: 'Tech News Update',
                description: 'Latest technology news and updates',
                category: 'tech',
                duration: 600,
                views: 30000,
                likes: 1800,
                comments: 80,
                shares: 120,
                tags: ['tech', 'news', 'update'],
                creatorId: 'creator3',
                timestamp: Date.now() - 1800000
            }
        ];
    }

    /**
     * Get Content by ID
     */
    getContentById(contentId) {
        const allContent = this.getSampleContent();
        return allContent.find(item => item.id === contentId);
    }

    /**
     * Load Data Methods
     */
    loadSearchHistory() {
        const saved = localStorage.getItem('amplifi_search_history');
        return saved ? JSON.parse(saved) : [];
    }

    loadSearchFilters() {
        const saved = localStorage.getItem('amplifi_search_filters');
        return saved ? JSON.parse(saved) : {};
    }

    loadSearchSuggestions() {
        const saved = localStorage.getItem('amplifi_search_suggestions');
        return saved ? JSON.parse(saved) : [];
    }

    loadSearchPerformance() {
        const saved = localStorage.getItem('amplifi_search_performance');
        return saved ? JSON.parse(saved) : [];
    }

    /**
     * Save Data Methods
     */
    saveSearchHistory() {
        localStorage.setItem('amplifi_search_history', JSON.stringify(this.searchHistory));
    }

    saveSearchFilters() {
        localStorage.setItem('amplifi_search_filters', JSON.stringify(this.searchFilters));
    }

    saveSearchSuggestions() {
        localStorage.setItem('amplifi_search_suggestions', JSON.stringify(this.searchSuggestions));
    }

    saveSearchPerformance(performance) {
        localStorage.setItem('amplifi_search_performance', JSON.stringify(performance));
    }

    /**
     * Generate Search ID
     */
    generateSearchId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// Initialize Advanced Search
window.AdvancedSearch = AdvancedSearch;
