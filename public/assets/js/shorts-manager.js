// Shorts Manager for Amplifi
// Handles short video content (under 60 seconds) like professional short-form videos

class ShortsManager {
    constructor() {
        this.config = {
            maxDuration: 60, // Maximum duration for shorts (seconds)
            autoPlay: true,
            loop: false,
            muted: true,
            preload: 'metadata'
        };
        
        this.currentShorts = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.currentVideo = null;
        this.shortsPlayer = null;
        
        this.init();
    }

    init() {
        console.log('⚡ Shorts Manager: Initializing...');
        this.setupEventListeners();
        this.loadShorts();
        this.setupNavigation();
        console.log('✅ Shorts Manager: Initialized successfully');
    }

    // Setup event listeners
    setupEventListeners() {
        // Filter buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.filter-btn')) {
                this.handleFilterClick(e.target);
            }
            
            if (e.target.matches('.short-video-card')) {
                this.playShort(e.target.dataset.shortId);
            }
            
            if (e.target.closest('.short-video-card')) {
                const card = e.target.closest('.short-video-card');
                this.playShort(card.dataset.shortId);
            }
        });

        // Navigation buttons
        const prevBtn = document.getElementById('prevShorts');
        const nextBtn = document.getElementById('nextShorts');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigateShorts('prev'));
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateShorts('next'));
        }

        // Close shorts player
        const closeBtn = document.getElementById('closeShorts');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeShortsPlayer());
        }

        // Action buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.action-btn')) {
                this.handleActionClick(e.target);
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.isPlaying) {
                switch (e.key) {
                    case 'ArrowUp':
                        e.preventDefault();
                        this.navigateShorts('prev');
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        this.navigateShorts('next');
                        break;
                    case 'Escape':
                        e.preventDefault();
                        this.closeShortsPlayer();
                        break;
                    case ' ':
                        e.preventDefault();
                        this.togglePlayPause();
                        break;
                }
            }
        });
    }

    // Handle filter button clicks
    handleFilterClick(filterBtn) {
        // Remove active class from all filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        filterBtn.classList.add('active');
        
        // Get filter value
        const filter = filterBtn.dataset.filter;
        
        // Apply filter
        this.filterShorts(filter);
    }

    // Filter shorts by category
    filterShorts(category) {
        console.log('🔍 Filtering shorts by:', category);
        
        if (category === 'all') {
            this.displayShorts(this.currentShorts);
        } else {
            const filteredShorts = this.currentShorts.filter(short => 
                short.category === category || short.tags.includes(category)
            );
            this.displayShorts(filteredShorts);
        }
    }

    // Load shorts from Firebase
    async loadShorts() {
        try {
            console.log('📱 Loading shorts...');
            
            // Show loading state
            this.showLoadingState();
            
            if (typeof db !== 'undefined') {
                // Load from Firestore
                const shortsSnapshot = await db.collection('videos')
                    .where('isShort', '==', true)
                    .where('isPublic', '==', true)
                    .orderBy('views', 'desc')
                    .limit(50)
                    .get();
                
                this.currentShorts = shortsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } else {
                // Load sample data if Firebase not available
                this.currentShorts = this.getSampleShorts();
            }
            
            // Display shorts
            this.displayShorts(this.currentShorts);
            
            console.log(`✅ Loaded ${this.currentShorts.length} shorts`);
            
        } catch (error) {
            console.error('❌ Error loading shorts:', error);
            this.showErrorState();
        }
    }

    // Get sample shorts data
    getSampleShorts() {
        return [
            {
                id: '1',
                title: 'Amazing Sunset View',
                description: 'Beautiful sunset captured in 30 seconds',
                duration: 30,
                thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
                videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
                creator: 'Nature Lover',
                creatorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
                views: 1250,
                likes: 89,
                comments: 23,
                category: 'nature',
                tags: ['sunset', 'nature', 'beautiful'],
                isShort: true
            },
            {
                id: '2',
                title: 'Quick Cooking Tip',
                description: 'Learn this cooking hack in 45 seconds',
                duration: 45,
                thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
                videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
                creator: 'Chef Pro',
                creatorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
                views: 890,
                likes: 67,
                comments: 15,
                category: 'cooking',
                tags: ['cooking', 'tip', 'hack'],
                isShort: true
            },
            {
                id: '3',
                title: 'Gaming Moment',
                description: 'Epic gaming clip in 55 seconds',
                duration: 55,
                thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400',
                videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
                creator: 'Gamer Pro',
                creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
                views: 2100,
                likes: 156,
                comments: 42,
                category: 'gaming',
                tags: ['gaming', 'epic', 'moment'],
                isShort: true
            },
            {
                id: '4',
                title: 'Music Cover',
                description: 'Beautiful acoustic cover in 40 seconds',
                duration: 40,
                thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
                videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
                creator: 'Music Artist',
                creatorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
                views: 980,
                likes: 78,
                comments: 19,
                category: 'music',
                tags: ['music', 'cover', 'acoustic'],
                isShort: true
            },
            {
                id: '5',
                title: 'Fitness Quick Workout',
                description: 'Quick 50-second workout routine',
                duration: 50,
                thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
                videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
                creator: 'Fitness Coach',
                creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
                views: 1560,
                likes: 112,
                comments: 28,
                category: 'fitness',
                tags: ['fitness', 'workout', 'quick'],
                isShort: true
            },
            {
                id: '6',
                title: 'Travel Moment',
                description: 'Amazing travel destination in 35 seconds',
                duration: 35,
                thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
                videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
                creator: 'Traveler',
                creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
                views: 720,
                likes: 45,
                comments: 12,
                category: 'travel',
                tags: ['travel', 'destination', 'amazing'],
                isShort: true
            }
        ];
    }

    // Display shorts in grid
    displayShorts(shorts) {
        const shortsGrid = document.getElementById('shortsGrid');
        if (!shortsGrid) return;
        
        if (shorts.length === 0) {
            this.showEmptyState();
            return;
        }
        
        shortsGrid.innerHTML = '';
        
        shorts.forEach(short => {
            const shortCard = this.createShortCard(short);
            shortsGrid.appendChild(shortCard);
        });
    }

    // Create short video card
    createShortCard(short) {
        const card = document.createElement('div');
        card.className = 'short-video-card';
        card.dataset.shortId = short.id;
        
        card.innerHTML = `
            <div class="short-video-thumbnail">
                <img src="${short.thumbnail}" alt="${short.title}" loading="lazy">
                <div class="short-video-duration">${this.formatDuration(short.duration)}</div>
                <div class="shorts-category-badge">${short.category}</div>
                ${short.views > 1000 ? '<div class="trending-indicator">🔥 Trending</div>' : ''}
            </div>
            
            <div class="short-video-info">
                <h3 class="short-video-title">${short.title}</h3>
                
                <div class="short-video-creator">
                    <img src="${short.creatorAvatar}" alt="${short.creator}">
                    <span>${short.creator}</span>
                </div>
                
                <div class="short-video-stats">
                    <span><i class="fas fa-eye"></i> ${this.formatNumber(short.views)}</span>
                    <span><i class="fas fa-heart"></i> ${this.formatNumber(short.likes)}</span>
                    <span><i class="fas fa-comment"></i> ${this.formatNumber(short.comments)}</span>
                </div>
            </div>
        `;
        
        return card;
    }

    // Play short video
    playShort(shortId) {
        const short = this.currentShorts.find(s => s.id === shortId);
        if (!short) return;
        
        console.log('▶️ Playing short:', short.title);
        
        this.currentIndex = this.currentShorts.findIndex(s => s.id === shortId);
        this.currentVideo = short;
        
        this.showShortsPlayer(short);
        this.loadVideo(short);
    }

    // Show shorts player modal
    showShortsPlayer(short) {
        const modal = document.getElementById('shortsPlayerModal');
        if (!modal) return;
        
        // Update modal content
        modal.querySelector('.shorts-title').textContent = short.title;
        modal.querySelector('.shorts-creator').textContent = short.creator;
        modal.querySelector('.shorts-description p').textContent = short.description;
        
        // Update engagement stats
        modal.querySelector('.like-btn .count').textContent = this.formatNumber(short.likes);
        modal.querySelector('.comment-btn .count').textContent = this.formatNumber(short.comments);
        
        // Update tags
        const tagsContainer = modal.querySelector('.shorts-tags');
        tagsContainer.innerHTML = short.tags.map(tag => 
            `<span class="tag">#${tag}</span>`
        ).join('');
        
        // Update engagement stats
        const statsContainer = modal.querySelector('.engagement-stats');
        statsContainer.innerHTML = `
            <span class="stat">
                <i class="fas fa-eye"></i> ${this.formatNumber(short.views)} views
            </span>
            <span class="stat">
                <i class="fas fa-clock"></i> ${this.formatDuration(short.duration)}
            </span>
        `;
        
        // Show modal
        modal.classList.add('show');
        this.isPlaying = true;
        
        // Focus on video for keyboard navigation
        setTimeout(() => {
            const video = document.getElementById('shortsVideo');
            if (video) video.focus();
        }, 100);
    }

    // Load video in player
    loadVideo(short) {
        const video = document.getElementById('shortsVideo');
        if (!video) return;
        
        video.src = short.videoUrl;
        video.poster = short.thumbnail;
        video.duration = short.duration;
        
        // Setup video event listeners
        this.setupVideoEvents(video);
        
        // Auto-play if enabled
        if (this.config.autoPlay) {
            video.play().catch(error => {
                console.log('Auto-play prevented:', error);
            });
        }
    }

    // Setup video event listeners
    setupVideoEvents(video) {
        // Time update for progress bar
        video.addEventListener('timeupdate', () => {
            this.updateProgressBar(video);
        });
        
        // Video ended
        video.addEventListener('ended', () => {
            this.onVideoEnded();
        });
        
        // Video loaded
        video.addEventListener('loadedmetadata', () => {
            console.log('✅ Video loaded:', video.duration);
        });
        
        // Video error
        video.addEventListener('error', (error) => {
            console.error('❌ Video error:', error);
        });
    }

    // Update progress bar
    updateProgressBar(video) {
        const progressFill = document.querySelector('.shorts-progress .progress-fill');
        if (progressFill && video.duration) {
            const progress = (video.currentTime / video.duration) * 100;
            progressFill.style.width = `${progress}%`;
        }
    }

    // Handle video ended
    onVideoEnded() {
        console.log('🎬 Video ended, auto-advancing...');
        
        // Auto-advance to next short
        setTimeout(() => {
            this.navigateShorts('next');
        }, 1000);
    }

    // Navigate between shorts
    navigateShorts(direction) {
        if (this.currentShorts.length === 0) return;
        
        if (direction === 'prev') {
            this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.currentShorts.length - 1;
        } else {
            this.currentIndex = this.currentIndex < this.currentShorts.length - 1 ? this.currentIndex + 1 : 0;
        }
        
        const nextShort = this.currentShorts[this.currentIndex];
        this.playShort(nextShort.id);
        
        console.log(`🔄 Navigated to short ${this.currentIndex + 1}/${this.currentShorts.length}`);
    }

    // Close shorts player
    closeShortsPlayer() {
        const modal = document.getElementById('shortsPlayerModal');
        if (!modal) return;
        
        // Stop video
        const video = document.getElementById('shortsVideo');
        if (video) {
            video.pause();
            video.src = '';
        }
        
        // Hide modal
        modal.classList.remove('show');
        this.isPlaying = false;
        this.currentVideo = null;
        
        console.log('❌ Shorts player closed');
    }

    // Toggle play/pause
    togglePlayPause() {
        const video = document.getElementById('shortsVideo');
        if (!video) return;
        
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    }

    // Handle action button clicks
    handleActionClick(actionBtn) {
        const action = actionBtn.dataset.action;
        const shortId = this.currentVideo?.id;
        
        if (!shortId) return;
        
        switch (action) {
            case 'like':
                this.toggleLike(shortId, actionBtn);
                break;
            case 'comment':
                this.showComments(shortId);
                break;
            case 'share':
                this.shareShort(shortId);
                break;
            case 'save':
                this.saveShort(shortId, actionBtn);
                break;
        }
    }

    // Toggle like
    async toggleLike(shortId, actionBtn) {
        try {
            // Update UI immediately
            actionBtn.classList.toggle('liked');
            
            if (actionBtn.classList.contains('liked')) {
                actionBtn.style.color = '#ff4444';
                const count = actionBtn.querySelector('.count');
                count.textContent = parseInt(count.textContent) + 1;
            } else {
                actionBtn.style.color = 'white';
                const count = actionBtn.querySelector('.count');
                count.textContent = parseInt(count.textContent) - 1;
            }
            
            // Save to Firebase if available
            if (typeof db !== 'undefined') {
                await this.saveLikeToFirebase(shortId, actionBtn.classList.contains('liked'));
            }
            
        } catch (error) {
            console.error('❌ Error toggling like:', error);
        }
    }

    // Save like to Firebase
    async saveLikeToFirebase(shortId, isLiked) {
        try {
            const likeRef = db.collection('likes').doc(`${shortId}_${this.getCurrentUserId()}`);
            
            if (isLiked) {
                await likeRef.set({
                    shortId: shortId,
                    userId: this.getCurrentUserId(),
                    timestamp: new Date()
                });
            } else {
                await likeRef.delete();
            }
        } catch (error) {
            console.error('❌ Error saving like to Firebase:', error);
        }
    }

    // Show comments
    showComments(shortId) {
        console.log('💬 Showing comments for short:', shortId);
        // This would open a comments modal
    }

    // Share short
    shareShort(shortId) {
        const short = this.currentShorts.find(s => s.id === shortId);
        if (!short) return;
        
        if (navigator.share) {
            navigator.share({
                title: short.title,
                text: short.description,
                url: `${window.location.origin}/shorts.html?id=${shortId}`
            });
        } else {
            // Fallback: copy to clipboard
            const url = `${window.location.origin}/shorts.html?id=${shortId}`;
            navigator.clipboard.writeText(url).then(() => {
                alert('Link copied to clipboard!');
            });
        }
    }

    // Save short
    async saveShort(shortId, actionBtn) {
        try {
            // Toggle saved state
            actionBtn.classList.toggle('saved');
            
            if (actionBtn.classList.contains('saved')) {
                actionBtn.style.color = '#ffd700';
                actionBtn.innerHTML = '<i class="fas fa-bookmark"></i>';
            } else {
                actionBtn.style.color = 'white';
                actionBtn.innerHTML = '<i class="fas fa-bookmark"></i>';
            }
            
            // Save to Firebase if available
            if (typeof db !== 'undefined') {
                await this.saveShortToFirebase(shortId, actionBtn.classList.contains('saved'));
            }
            
        } catch (error) {
            console.error('❌ Error saving short:', error);
        }
    }

    // Save short to Firebase
    async saveShortToFirebase(shortId, isSaved) {
        try {
            const saveRef = db.collection('savedShorts').doc(`${shortId}_${this.getCurrentUserId()}`);
            
            if (isSaved) {
                await saveRef.set({
                    shortId: shortId,
                    userId: this.getCurrentUserId(),
                    timestamp: new Date()
                });
            } else {
                await saveRef.delete();
            }
        } catch (error) {
            console.error('❌ Error saving short to Firebase:', error);
        }
    }

    // Setup navigation
    setupNavigation() {
        // Update navigation button states
        this.updateNavigationButtons();
    }

    // Update navigation buttons
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevShorts');
        const nextBtn = document.getElementById('nextShorts');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentShorts.length === 0;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentShorts.length === 0;
        }
    }

    // Show loading state
    showLoadingState() {
        const shortsGrid = document.getElementById('shortsGrid');
        if (!shortsGrid) return;
        
        shortsGrid.innerHTML = `
            <div class="shorts-loading">
                <div class="spinner"></div>
                <p>Loading amazing shorts...</p>
            </div>
        `;
    }

    // Show empty state
    showEmptyState() {
        const shortsGrid = document.getElementById('shortsGrid');
        if (!shortsGrid) return;
        
        shortsGrid.innerHTML = `
            <div class="shorts-empty">
                <i class="fas fa-video"></i>
                <h3>No Shorts Found</h3>
                <p>Be the first to create amazing short content!</p>
                <button class="btn btn-primary" onclick="window.location.href='upload.html'">
                    <i class="fas fa-plus"></i> Create Short
                </button>
            </div>
        `;
    }

    // Show error state
    showErrorState() {
        const shortsGrid = document.getElementById('shortsGrid');
        if (!shortsGrid) return;
        
        shortsGrid.innerHTML = `
            <div class="shorts-empty">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error Loading Shorts</h3>
                <p>Something went wrong. Please try again later.</p>
                <button class="btn btn-primary" onclick="shortsManager.loadShorts()">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }

    // Utility functions
    formatDuration(seconds) {
        if (!seconds || isNaN(seconds)) return '0s';
        
        if (seconds < 60) {
            return `${seconds}s`;
        } else {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        } else {
            return num.toString();
        }
    }

    getCurrentUserId() {
        // This would get the current user ID from Firebase Auth
        // For now, return a placeholder
        return 'current-user';
    }
}

// Initialize Shorts Manager
const shortsManager = new ShortsManager();

// Export for global use
window.shortsManager = shortsManager;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        shortsManager.init();
    });
} else {
    shortsManager.init();
}



