/**
 * Pixels Image Service
 * Handles loading high-quality stock photos from Pixels API
 */

class PixelsService {
    constructor() {
        this.apiKey = 'fukzfUyQBBPXqfJyNeXsFvIFOXhIjkRWFaeNVLSggxEZ9aKhqnWa3lgR';
        this.baseUrl = 'https://api.pexels.com/v1';
        this.cache = new Map();
        this.categories = {
            trending: ['trending', 'viral', 'popular', 'hot'],
            recommended: ['lifestyle', 'fashion', 'beauty', 'travel'],
            continue: ['fitness', 'cooking', 'gaming', 'education'],
            subscriptions: ['business', 'technology', 'entertainment', 'sports']
        };
    }

    /**
     * Get images for a specific category
     */
    async getImagesForCategory(category, count = 6) {
        const cacheKey = `${category}_${count}`;
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const searchTerms = this.categories[category] || [category];
            const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
            
            const response = await fetch(`${this.baseUrl}/search?query=${encodeURIComponent(randomTerm)}&per_page=${count}&orientation=landscape`, {
                headers: {
                    'Authorization': this.apiKey
                }
            });

            if (!response.ok) {
                throw new Error(`Pixels API error: ${response.status}`);
            }

            const data = await response.json();
            const images = data.photos || [];
            
            // Cache the results
            this.cache.set(cacheKey, images);
            
            return images;
        } catch (error) {
            console.warn(`⚠️ Failed to load Pixels images for ${category}:`, error);
            return this.getFallbackImages(count);
        }
    }

    /**
     * Get fallback images when API fails
     */
    getFallbackImages(count) {
        const fallbackImages = [
            'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=320&h=180&fit=crop',
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=320&h=180&fit=crop',
            'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=320&h=180&fit=crop',
            'https://images.unsplash.com/photo-1552664730-d307ca884978?w=320&h=180&fit=crop',
            'https://images.unsplash.com/photo-1551434678-e076c223a692?w=320&h=180&fit=crop',
            'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=320&h=180&fit=crop'
        ];
        
        return fallbackImages.slice(0, count).map((url, index) => ({
            id: `fallback_${index}`,
            src: {
                medium: url,
                landscape: url
            },
            alt: `Fallback image ${index + 1}`
        }));
    }

    /**
     * Update video card thumbnails with real images
     */
    async updateVideoThumbnails() {
        try {
            console.log('🎨 Updating video thumbnails with Pixels images...');
            
            // Update all video cards based on their data-category attribute
            const allCards = document.querySelectorAll('.video-card');
            const cardsByCategory = {};
            
            // Group cards by category
            allCards.forEach(card => {
                const img = card.querySelector('.video-thumbnail img');
                if (img && img.dataset.category) {
                    const category = img.dataset.category;
                    if (!cardsByCategory[category]) {
                        cardsByCategory[category] = [];
                    }
                    cardsByCategory[category].push(card);
                }
            });
            
            // Update each category
            for (const [category, cards] of Object.entries(cardsByCategory)) {
                await this.updateCategoryThumbnails(category, cards);
            }
            
            console.log('✅ Video thumbnails updated successfully');
        } catch (error) {
            console.error('❌ Error updating video thumbnails:', error);
        }
    }

    /**
     * Update thumbnails for a specific category
     */
    async updateCategoryThumbnails(category, cards) {
        if (!Array.isArray(cards) || cards.length === 0) return;

        const images = await this.getImagesForCategory(category, cards.length);
        
        cards.forEach((card, index) => {
            const thumbnail = card.querySelector('.video-thumbnail img');
            if (thumbnail && images[index]) {
                const image = images[index];
                thumbnail.src = image.src.landscape || image.src.medium;
                thumbnail.alt = image.alt || `Video thumbnail ${index + 1}`;
                
                // Add loading animation
                thumbnail.style.opacity = '0';
                thumbnail.style.transition = 'opacity 0.3s ease';
                
                thumbnail.onload = () => {
                    thumbnail.style.opacity = '1';
                };
                
                thumbnail.onerror = () => {
                    // Fallback to a default image if loading fails
                    thumbnail.src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=320&h=180&fit=crop';
                    thumbnail.alt = 'Default video thumbnail';
                };
            }
        });
    }

    /**
     * Preload images for better performance
     */
    async preloadImages() {
        try {
            console.log('🚀 Preloading Pixels images...');
            
            const categories = Object.keys(this.categories);
            const preloadPromises = categories.map(category => 
                this.getImagesForCategory(category, 3)
            );
            
            await Promise.all(preloadPromises);
            console.log('✅ Images preloaded successfully');
        } catch (error) {
            console.warn('⚠️ Image preloading failed:', error);
        }
    }

    /**
     * Get random image for a specific use case
     */
    async getRandomImage(query = 'creative', orientation = 'landscape') {
        try {
            const response = await fetch(`${this.baseUrl}/search?query=${encodeURIComponent(query)}&per_page=1&orientation=${orientation}`, {
                headers: {
                    'Authorization': this.apiKey
                }
            });

            if (!response.ok) {
                throw new Error(`Pixels API error: ${response.status}`);
            }

            const data = await response.json();
            return data.photos?.[0] || null;
        } catch (error) {
            console.warn(`⚠️ Failed to get random image for ${query}:`, error);
            return null;
        }
    }
}

// Initialize Pixels service
window.pixelsService = new PixelsService();

// Auto-update thumbnails when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.pixelsService) {
        // Small delay to ensure other scripts have loaded
        setTimeout(() => {
            window.pixelsService.updateVideoThumbnails();
        }, 1000);
    }
});

console.log('🎨 Pixels Image Service loaded successfully');
