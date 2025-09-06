/**
 * Amplifi Sidebar Navigation System
 * Ensures consistent navigation across all pages
 */

class AmplifiSidebar {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }
    
    getCurrentPage() {
        const path = window.location.pathname;
        if (path === '/' || path === '/index.html') return 'home';
        return path.replace('.html', '').replace('/', '');
    }
    
    init() {
        this.createSidebar();
        this.setActiveState();
        this.addEventListeners();
    }
    
    createSidebar() {
        const sidebarContainer = document.querySelector('.yt-sidebar');
        if (!sidebarContainer) return;
        
        sidebarContainer.innerHTML = `
            <nav class="yt-sidebar-nav">
                <div class="yt-sidebar-section">
                    <div class="yt-sidebar-title">Main</div>
                    <a href="/" class="yt-sidebar-item" data-page="home">
                        <i class="fas fa-home"></i>
                        <span>Home</span>
                    </a>
                    <a href="/feed.html" class="yt-sidebar-item" data-page="feed">
                        <i class="fas fa-rss"></i>
                        <span>Feed</span>
                    </a>
                    <a href="/trending.html" class="yt-sidebar-item" data-page="trending">
                        <i class="fas fa-fire"></i>
                        <span>Trending</span>
                    </a>
                    <a href="/live.html" class="yt-sidebar-item" data-page="live">
                        <i class="fas fa-broadcast-tower"></i>
                        <span>Live</span>
                    </a>
                    <a href="/search.html" class="yt-sidebar-item" data-page="search">
                        <i class="fas fa-search"></i>
                        <span>Search</span>
                    </a>
                </div>
                
                <div class="yt-sidebar-section">
                    <div class="yt-sidebar-title">Creator Tools</div>
                    <a href="/upload.html" class="yt-sidebar-item" data-page="upload">
                        <i class="fas fa-upload"></i>
                        <span>Upload</span>
                    </a>
                    <a href="/creator-dashboard.html" class="yt-sidebar-item" data-page="creator-dashboard">
                        <i class="fas fa-chart-line"></i>
                        <span>Dashboard</span>
                    </a>
                    <a href="/profile.html" class="yt-sidebar-item" data-page="profile">
                        <i class="fas fa-user"></i>
                        <span>Profile</span>
                    </a>
                    <a href="/library.html" class="yt-sidebar-item" data-page="library">
                        <i class="fas fa-folder"></i>
                        <span>Library</span>
                    </a>
                    <a href="/moments.html" class="yt-sidebar-item" data-page="moments">
                        <i class="fas fa-clock"></i>
                        <span>Moments</span>
                    </a>
                    <a href="/analytics.html" class="yt-sidebar-item" data-page="analytics">
                        <i class="fas fa-analytics"></i>
                        <span>Analytics</span>
                    </a>
                </div>
                
                <div class="yt-sidebar-section">
                    <div class="yt-sidebar-title">Content</div>
                    <a href="/music-library.html" class="yt-sidebar-item" data-page="music-library">
                        <i class="fas fa-music"></i>
                        <span>Music Library</span>
                    </a>
                    <a href="/social-features.html" class="yt-sidebar-item" data-page="social-features">
                        <i class="fas fa-users"></i>
                        <span>Social Features</span>
                    </a>
                    <a href="/subscriptions.html" class="yt-sidebar-item" data-page="subscriptions">
                        <i class="fas fa-bell"></i>
                        <span>Subscriptions</span>
                    </a>
                </div>
                
                <div class="yt-sidebar-section">
                    <div class="yt-sidebar-title">Categories</div>
                    <div class="yt-sidebar-item" onclick="filterByCategory('gaming')" role="button" tabindex="0">
                        <i class="fas fa-gamepad"></i>
                        <span>Gaming</span>
                    </div>
                    <div class="yt-sidebar-item" onclick="filterByCategory('music')" role="button" tabindex="0">
                        <i class="fas fa-music"></i>
                        <span>Music</span>
                    </div>
                    <div class="yt-sidebar-item" onclick="filterByCategory('education')" role="button" tabindex="0">
                        <i class="fas fa-graduation-cap"></i>
                        <span>Education</span>
                    </div>
                    <div class="yt-sidebar-item" onclick="filterByCategory('entertainment')" role="button" tabindex="0">
                        <i class="fas fa-film"></i>
                        <span>Entertainment</span>
                    </div>
                    <div class="yt-sidebar-item" onclick="filterByCategory('technology')" role="button" tabindex="0">
                        <i class="fas fa-microchip"></i>
                        <span>Technology</span>
                    </div>
                </div>
                
                <div class="yt-sidebar-section">
                    <div class="yt-sidebar-title">Settings</div>
                    <a href="/settings.html" class="yt-sidebar-item" data-page="settings">
                        <i class="fas fa-cog"></i>
                        <span>Settings</span>
                    </a>
                    <a href="/about.html" class="yt-sidebar-item" data-page="about">
                        <i class="fas fa-info-circle"></i>
                        <span>About</span>
                    </a>
                    <a href="/contact.html" class="yt-sidebar-item" data-page="contact">
                        <i class="fas fa-envelope"></i>
                        <span>Contact</span>
                    </a>
                </div>
            </nav>
        `;
    }
    
    setActiveState() {
        const sidebarItems = document.querySelectorAll('.yt-sidebar-item[data-page]');
        sidebarItems.forEach(item => {
            const page = item.getAttribute('data-page');
            if (page === this.currentPage) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    addEventListeners() {
        // Add click handlers for category filters
        const categoryItems = document.querySelectorAll('.yt-sidebar-item[onclick*="filterByCategory"]');
        categoryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const category = e.currentTarget.querySelector('span').textContent.toLowerCase();
                this.filterByCategory(category);
            });
        });
    }
    
    filterByCategory(category) {
        console.log(`🔍 Filtering by category: ${category}`);
        // This function can be overridden by individual pages
        if (typeof window.filterByCategory === 'function') {
            window.filterByCategory(category);
        } else {
            // Default behavior - redirect to search with category
            window.location.href = `/search.html?category=${encodeURIComponent(category)}`;
        }
    }
}

// Initialize sidebar when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.amplifiSidebar = new AmplifiSidebar();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AmplifiSidebar;
}
