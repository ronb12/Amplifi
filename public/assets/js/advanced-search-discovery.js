// Advanced Search & Discovery System for Amplifi - Complete Creator Platform
// Includes: Advanced filters, voice search, search suggestions, search history

class AdvancedSearchDiscovery {
    constructor() {
        this.searchHistory = [];
        this.searchSuggestions = [];
        this.voiceRecognition = null;
        this.searchFilters = {
            uploadDate: 'any',
            duration: 'any',
            quality: 'any',
            sortBy: 'relevance',
            type: 'any',
            features: [],
            category: 'any',
            language: 'any'
        };
        
        this.init();
    }

    init() {
        this.setupVoiceRecognition();
        this.loadSearchHistory();
        this.setupEventListeners();
        this.initializeSearchSuggestions();
        console.log('🔍 Advanced Search & Discovery initialized');
    }

    setupEventListeners() {
        // Search input events
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearchInput(e.target.value));
            searchInput.addEventListener('keydown', (e) => this.handleSearchKeydown(e));
            searchInput.addEventListener('focus', () => this.showSearchSuggestions());
            searchInput.addEventListener('blur', () => this.hideSearchSuggestions());
        }

        // Voice search button
        const voiceSearchBtn = document.getElementById('voiceSearchBtn');
        if (voiceSearchBtn) {
            voiceSearchBtn.addEventListener('click', () => this.startVoiceSearch());
        }

        // Search filters
        document.addEventListener('click', (e) => {
            if (e.target.matches('.search-filter')) {
                this.toggleSearchFilter(e.target.dataset.filter);
            }
        });
    }

    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.voiceRecognition = new SpeechRecognition();
            
            this.voiceRecognition.continuous = false;
            this.voiceRecognition.interimResults = false;
            this.voiceRecognition.lang = 'en-US';
            
            this.voiceRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.handleVoiceSearchResult(transcript);
            };
            
            this.voiceRecognition.onerror = (event) => {
                console.error('Voice recognition error:', event.error);
                this.showVoiceSearchError(event.error);
            };
        }
    }

    // Search functionality
    async performSearch(query, filters = {}) {
        try {
            console.log(`🔍 Performing search: "${query}" with filters:`, filters);
            
            // Record search in history
            this.recordSearch(query, filters);
            
            // Apply search filters
            const searchFilters = { ...this.searchFilters, ...filters };
            
            // Perform search with multiple strategies
            const results = await this.executeSearchStrategies(query, searchFilters);
            
            // Apply relevance scoring
            const scoredResults = this.scoreSearchResults(results, query);
            
            // Sort by relevance
            const sortedResults = this.sortSearchResults(scoredResults, searchFilters.sortBy);
            
            // Emit search results event
            document.dispatchEvent(new CustomEvent('searchResults', {
                detail: { query, results: sortedResults, filters: searchFilters }
            }));
            
            return sortedResults;
        } catch (error) {
            console.error('Search error:', error);
            return [];
        }
    }

    async executeSearchStrategies(query, filters) {
        const results = [];
        
        // Strategy 1: Title and description search
        const titleResults = await this.searchByTitleAndDescription(query);
        results.push(...titleResults);
        
        // Strategy 2: Tag-based search
        const tagResults = await this.searchByTags(query);
        results.push(...tagResults);
        
        // Strategy 3: Transcript search (if available)
        const transcriptResults = await this.searchByTranscript(query);
        results.push(...transcriptResults);
        
        // Strategy 4: Creator search
        const creatorResults = await this.searchByCreator(query);
        results.push(...creatorResults);
        
        // Remove duplicates and merge
        return this.mergeSearchResults(results);
    }

    async searchByTitleAndDescription(query) {
        // This would search Firebase for videos with matching titles/descriptions
        const searchTerms = query.toLowerCase().split(' ');
        
        try {
            if (typeof db !== 'undefined') {
                const videosRef = db.collection('videos');
                let query = videosRef;
                
                // Search in title
                searchTerms.forEach(term => {
                    query = query.where('title', '>=', term).where('title', '<=', term + '\uf8ff');
                });
                
                const snapshot = await query.limit(20).get();
                return snapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id,
                    searchScore: this.calculateTitleScore(doc.data().title, query),
                    searchType: 'title'
                }));
            }
        } catch (error) {
            console.error('Title search error:', error);
        }
        
        return [];
    }

    async searchByTags(query) {
        try {
            if (typeof db !== 'undefined') {
                const videosRef = db.collection('videos');
                const snapshot = await videosRef
                    .where('tags', 'array-contains-any', query.toLowerCase().split(' '))
                    .limit(15)
                    .get();
                
                return snapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id,
                    searchScore: this.calculateTagScore(doc.data().tags, query),
                    searchType: 'tag'
                }));
            }
        } catch (error) {
            console.error('Tag search error:', error);
        }
        
        return [];
    }

    async searchByTranscript(query) {
        // This would search video transcripts if available
        // For now, return empty array
        return [];
    }

    async searchByCreator(query) {
        try {
            if (typeof db !== 'undefined') {
                const usersRef = db.collection('users');
                const snapshot = await usersRef
                    .where('displayName', '>=', query)
                    .where('displayName', '<=', query + '\uf8ff')
                    .limit(10)
                    .get();
                
                return snapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id,
                    searchScore: this.calculateCreatorScore(doc.data().displayName, query),
                    searchType: 'creator'
                }));
            }
        } catch (error) {
            console.error('Creator search error:', error);
        }
        
        return [];
    }

    // Search result scoring and ranking
    calculateTitleScore(title, query) {
        const titleLower = title.toLowerCase();
        const queryTerms = query.toLowerCase().split(' ');
        
        let score = 0;
        queryTerms.forEach(term => {
            if (titleLower.includes(term)) {
                score += 10;
                // Bonus for exact matches
                if (titleLower === term) score += 50;
                // Bonus for beginning of title
                if (titleLower.startsWith(term)) score += 20;
            }
        });
        
        return score;
    }

    calculateTagScore(tags, query) {
        const queryTerms = query.toLowerCase().split(' ');
        let score = 0;
        
        tags.forEach(tag => {
            queryTerms.forEach(term => {
                if (tag.includes(term)) {
                    score += 5;
                    if (tag === term) score += 15;
                }
            });
        });
        
        return score;
    }

    calculateCreatorScore(creatorName, query) {
        const nameLower = creatorName.toLowerCase();
        const queryLower = query.toLowerCase();
        
        if (nameLower === queryLower) return 100;
        if (nameLower.startsWith(queryLower)) return 80;
        if (nameLower.includes(queryLower)) return 60;
        
        return 0;
    }

    scoreSearchResults(results, query) {
        return results.map(result => {
            let finalScore = result.searchScore || 0;
            
            // Boost recent content
            if (result.uploadDate) {
                const daysSinceUpload = (Date.now() - result.uploadDate) / (1000 * 60 * 60 * 24);
                if (daysSinceUpload < 7) finalScore += 10;
                else if (daysSinceUpload < 30) finalScore += 5;
            }
            
            // Boost popular content
            if (result.views) {
                const viewScore = Math.log10(result.views + 1) * 2;
                finalScore += viewScore;
            }
            
            // Boost engagement
            if (result.likes && result.views) {
                const engagementRate = result.likes / result.views;
                finalScore += engagementRate * 100;
            }
            
            return { ...result, finalScore };
        });
    }

    sortSearchResults(results, sortBy) {
        switch (sortBy) {
            case 'relevance':
                return results.sort((a, b) => b.finalScore - a.finalScore);
            case 'upload_date':
                return results.sort((a, b) => b.uploadDate - a.uploadDate);
            case 'view_count':
                return results.sort((a, b) => b.views - a.views);
            case 'rating':
                return results.sort((a, b) => b.rating - a.rating);
            default:
                return results;
        }
    }

    mergeSearchResults(results) {
        const merged = new Map();
        
        results.forEach(result => {
            if (merged.has(result.id)) {
                // Merge scores from different search strategies
                const existing = merged.get(result.id);
                existing.finalScore = Math.max(existing.finalScore, result.finalScore);
                existing.searchTypes = [...(existing.searchTypes || []), result.searchType];
            } else {
                result.searchTypes = [result.searchType];
                merged.set(result.id, result);
            }
        });
        
        return Array.from(merged.values());
    }

    // Search suggestions and autocomplete
    handleSearchInput(query) {
        if (query.length < 2) {
            this.hideSearchSuggestions();
            return;
        }
        
        this.generateSearchSuggestions(query);
        this.showSearchSuggestions();
    }

    async generateSearchSuggestions(query) {
        try {
            // Get suggestions from multiple sources
            const suggestions = [];
            
            // Popular searches
            const popularSuggestions = this.getPopularSearchSuggestions(query);
            suggestions.push(...popularSuggestions);
            
            // Recent searches
            const recentSuggestions = this.getRecentSearchSuggestions(query);
            suggestions.push(...recentSuggestions);
            
            // Auto-complete from video titles
            const titleSuggestions = await this.getTitleSuggestions(query);
            suggestions.push(...titleSuggestions);
            
            // Remove duplicates and limit
            const uniqueSuggestions = [...new Set(suggestions)].slice(0, 8);
            
            this.searchSuggestions = uniqueSuggestions;
            this.renderSearchSuggestions();
        } catch (error) {
            console.error('Error generating search suggestions:', error);
        }
    }

    getPopularSearchSuggestions(query) {
        const popularSearches = [
            'gaming', 'tutorial', 'music', 'comedy', 'news',
            'technology', 'cooking', 'fitness', 'travel', 'education'
        ];
        
        return popularSearches
            .filter(term => term.toLowerCase().includes(query.toLowerCase()))
            .map(term => ({ text: term, type: 'popular' }));
    }

    getRecentSearchSuggestions(query) {
        return this.searchHistory
            .filter(search => search.query.toLowerCase().includes(query.toLowerCase()))
            .map(search => ({ text: search.query, type: 'recent' }))
            .slice(0, 3);
    }

    async getTitleSuggestions(query) {
        try {
            if (typeof db !== 'undefined') {
                const videosRef = db.collection('videos');
                const snapshot = await videosRef
                    .where('title', '>=', query)
                    .where('title', '<=', query + '\uf8ff')
                    .limit(5)
                    .get();
                
                return snapshot.docs.map(doc => ({
                    text: doc.data().title,
                    type: 'title'
                }));
            }
        } catch (error) {
            console.error('Title suggestions error:', error);
        }
        
        return [];
    }

    renderSearchSuggestions() {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        if (!suggestionsContainer) return;
        
        suggestionsContainer.innerHTML = this.searchSuggestions.map(suggestion => `
            <div class="search-suggestion" data-query="${suggestion.text}">
                <i class="fas fa-${this.getSuggestionIcon(suggestion.type)}"></i>
                <span>${suggestion.text}</span>
            </div>
        `).join('');
        
        // Add click events
        suggestionsContainer.addEventListener('click', (e) => {
            if (e.target.closest('.search-suggestion')) {
                const query = e.target.closest('.search-suggestion').dataset.query;
                this.selectSearchSuggestion(query);
            }
        });
    }

    getSuggestionIcon(type) {
        switch (type) {
            case 'popular': return 'fire';
            case 'recent': return 'history';
            case 'title': return 'video';
            default: return 'search';
        }
    }

    selectSearchSuggestion(query) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = query;
            this.performSearch(query);
        }
        this.hideSearchSuggestions();
    }

    showSearchSuggestions() {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'block';
        }
    }

    hideSearchSuggestions() {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }
    }

    // Voice search functionality
    startVoiceSearch() {
        if (!this.voiceRecognition) {
            this.showVoiceSearchError('Voice recognition not supported');
            return;
        }
        
        try {
            this.voiceRecognition.start();
            this.showVoiceSearchStatus('Listening...');
        } catch (error) {
            console.error('Voice search error:', error);
            this.showVoiceSearchError('Failed to start voice recognition');
        }
    }

    handleVoiceSearchResult(transcript) {
        console.log('Voice search result:', transcript);
        
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = transcript;
            this.performSearch(transcript);
        }
        
        this.showVoiceSearchStatus('Search completed');
        setTimeout(() => this.hideVoiceSearchStatus(), 2000);
    }

    showVoiceSearchStatus(message) {
        // Show voice search status
        const statusElement = document.getElementById('voiceSearchStatus');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.style.display = 'block';
        }
    }

    hideVoiceSearchStatus() {
        const statusElement = document.getElementById('voiceSearchStatus');
        if (statusElement) {
            statusElement.style.display = 'none';
        }
    }

    showVoiceSearchError(error) {
        this.showVoiceSearchStatus(`Error: ${error}`);
        setTimeout(() => this.hideVoiceSearchStatus(), 3000);
    }

    // Search filters
    toggleSearchFilter(filterType) {
        const filterButton = document.querySelector(`[data-filter="${filterType}"]`);
        if (filterButton) {
            filterButton.classList.toggle('active');
        }
        
        // Show filter options
        this.showFilterOptions(filterType);
    }

    showFilterOptions(filterType) {
        const filterOptions = document.getElementById(`${filterType}FilterOptions`);
        if (filterOptions) {
            filterOptions.style.display = 
                filterOptions.style.display === 'block' ? 'none' : 'block';
        }
    }

    applySearchFilters(filters) {
        this.searchFilters = { ...this.searchFilters, ...filters };
        
        // Re-run current search with new filters
        const searchInput = document.getElementById('searchInput');
        if (searchInput && searchInput.value) {
            this.performSearch(searchInput.value, this.searchFilters);
        }
    }

    // Search history management
    recordSearch(query, filters) {
        const searchRecord = {
            query,
            filters,
            timestamp: Date.now(),
            userId: this.getCurrentUserId()
        };
        
        this.searchHistory.unshift(searchRecord);
        
        // Keep only last 50 searches
        if (this.searchHistory.length > 50) {
            this.searchHistory = this.searchHistory.slice(0, 50);
        }
        
        this.saveSearchHistory();
    }

    getSearchHistory() {
        return this.searchHistory;
    }

    clearSearchHistory() {
        this.searchHistory = [];
        this.saveSearchHistory();
    }

    saveSearchHistory() {
        localStorage.setItem('amplifi_search_history', JSON.stringify(this.searchHistory));
    }

    loadSearchHistory() {
        const saved = localStorage.getItem('amplifi_search_history');
        this.searchHistory = saved ? JSON.parse(saved) : [];
    }

    // Utility methods
    getCurrentUserId() {
        return localStorage.getItem('amplifi_user_id') || null;
    }

    handleSearchKeydown(event) {
        if (event.key === 'Enter') {
            this.performSearch(event.target.value);
        } else if (event.key === 'Escape') {
            this.hideSearchSuggestions();
        }
    }

    // Initialize search suggestions
    initializeSearchSuggestions() {
        // Create search suggestions container if it doesn't exist
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer && !document.getElementById('searchSuggestions')) {
            const suggestionsContainer = document.createElement('div');
            suggestionsContainer.id = 'searchSuggestions';
            suggestionsContainer.className = 'search-suggestions';
            searchContainer.appendChild(suggestionsContainer);
        }
    }
}

// Export for global use
window.AdvancedSearchDiscovery = AdvancedSearchDiscovery;
