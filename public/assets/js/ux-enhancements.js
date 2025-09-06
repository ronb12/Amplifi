// UX Enhancement Functions for Amplifi
// This file contains JavaScript functions to support enhanced user experience features

// Video card keyboard navigation
function handleVideoCardKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        // Simulate click on video card
        event.currentTarget.click();
    }
}

// Search focus management
function handleSearchFocus() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.parentElement.classList.add('search-focused');
    }
}

function handleSearchBlur() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.parentElement.classList.remove('search-focused');
    }
}

// Clear search functionality
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResultsIndicator = document.getElementById('searchResultsIndicator');
    
    if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
    }
    
    if (searchResultsIndicator) {
        searchResultsIndicator.style.display = 'none';
    }
    
    // Clear search results and show all videos
    const videoCards = document.querySelectorAll('.yt-video-card');
    videoCards.forEach(card => {
        card.style.display = 'block';
    });
    
    // Hide categories if they were hidden
    const categoriesRow = document.querySelector('.yt-categories-row');
    if (categoriesRow) {
        categoriesRow.style.display = 'flex';
    }
}

// Enhanced search functionality
function performEnhancedSearch(query) {
    if (!query || query.trim() === '') {
        clearSearch();
        return;
    }
    
    const searchResultsIndicator = document.getElementById('searchResultsIndicator');
    const searchQueryElement = document.getElementById('searchQuery');
    const videoCards = document.querySelectorAll('.yt-video-card');
    const categoriesRow = document.querySelector('.yt-categories-row');
    
    // Show search results indicator
    if (searchResultsIndicator) {
        searchResultsIndicator.style.display = 'block';
    }
    
    if (searchQueryElement) {
        searchQueryElement.textContent = query;
    }
    
    // Hide categories during search
    if (categoriesRow) {
        categoriesRow.style.display = 'none';
    }
    
    // Filter video cards based on search query
    let visibleCount = 0;
    videoCards.forEach(card => {
        const title = card.querySelector('.yt-video-title');
        const author = card.querySelector('.yt-video-author');
        const channel = card.querySelector('.yt-video-channel');
        
        const searchText = query.toLowerCase();
        const titleText = title ? title.textContent.toLowerCase() : '';
        const authorText = author ? author.textContent.toLowerCase() : '';
        const channelText = channel ? channel.textContent.toLowerCase() : '';
        
        const isMatch = titleText.includes(searchText) || 
                       authorText.includes(searchText) || 
                       channelText.includes(searchText);
        
        if (isMatch) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Update search results text
    const searchResultsText = document.querySelector('.search-results-text');
    if (searchResultsText) {
        searchResultsText.innerHTML = `Search results for: <strong>${query}</strong> (${visibleCount} videos found)`;
    }
}

// Category filter functionality
function filterByCategory(category) {
    const categoryButtons = document.querySelectorAll('.yt-category-btn');
    const videoCards = document.querySelectorAll('.yt-video-card');
    
    // Update active category button
    categoryButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.trim() === category) {
            btn.classList.add('active');
        }
    });
    
    // Filter videos (this is a simplified version - in a real app, you'd have category data)
    videoCards.forEach(card => {
        if (category === 'All') {
            card.style.display = 'block';
        } else {
            // For demo purposes, show/hide based on some logic
            // In a real app, you'd filter based on actual category data
            card.style.display = 'block';
        }
    });
}

// Initialize enhanced features
function initializeUXEnhancements() {
    // Add search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.trim();
            if (query.length > 2) {
                performEnhancedSearch(query);
            } else if (query.length === 0) {
                clearSearch();
            }
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = e.target.value.trim();
                performEnhancedSearch(query);
            }
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const query = searchInput ? searchInput.value.trim() : '';
            performEnhancedSearch(query);
        });
    }
    
    // Add category filter functionality
    const categoryButtons = document.querySelectorAll('.yt-category-btn');
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.textContent.trim();
            filterByCategory(category);
        });
    });
    
    // Add video card click handlers
    const videoCards = document.querySelectorAll('.yt-video-card');
    videoCards.forEach(card => {
        card.addEventListener('click', function() {
            // In a real app, this would navigate to the video page
            console.log('Video card clicked:', this);
        });
    });
    
    // Add keyboard navigation for video cards
    videoCards.forEach(card => {
        card.addEventListener('keydown', handleVideoCardKeydown);
    });
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUXEnhancements);
} else {
    initializeUXEnhancements();
}

// Export functions for global use
window.handleVideoCardKeydown = handleVideoCardKeydown;
window.handleSearchFocus = handleSearchFocus;
window.handleSearchBlur = handleSearchBlur;
window.clearSearch = clearSearch;
window.performEnhancedSearch = performEnhancedSearch;
window.filterByCategory = filterByCategory;
