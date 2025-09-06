/**
 * Image Loader - Loads Pexels images for video thumbnails
 * Replaces static image references with dynamic Pexels content
 */

class ImageLoader {
    constructor() {
        this.pexelsService = null;
        this.loadedImages = new Map();
        this.init();
    }

    async init() {
        // Wait for Pexels service to be available
        if (typeof PixelsService !== 'undefined') {
            this.pexelsService = new PixelsService();
        } else {
            // Fallback to direct Pexels URLs
            this.setupFallbackImages();
        }
        
        this.loadVideoThumbnails();
    }

    setupFallbackImages() {
        // Fallback Pexels URLs for video thumbnails
        this.fallbackImages = [
            'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
            'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
            'https://images.pexels.com/photos/3183156/pexels-photo-3183156.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
            'https://images.pexels.com/photos/3183159/pexels-photo-3183159.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
            'https://images.pexels.com/photos/3183162/pexels-photo-3183162.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
            'https://images.pexels.com/photos/3183165/pexels-photo-3183165.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
            'https://images.pexels.com/photos/3183168/pexels-photo-3183168.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
            'https://images.pexels.com/photos/3183171/pexels-photo-3183171.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop'
        ];
    }

    async loadVideoThumbnails() {
        console.log('🖼️ Loading Pexels video thumbnails...');
        
        // Find all video thumbnail images
        const thumbnailImages = document.querySelectorAll('.yt-video-thumbnail img');
        
        for (let i = 0; i < thumbnailImages.length; i++) {
            const img = thumbnailImages[i];
            
            // Skip if already loaded or if it's not a placeholder
            if (img.src.includes('pexels.com') || img.src.includes('video-thumbnail')) {
                continue;
            }
            
            try {
                let imageUrl;
                
                if (this.pexelsService) {
                    // Use Pexels service if available
                    const images = await this.pexelsService.getImagesForCategory('trending', 8);
                    imageUrl = images[i % images.length]?.src?.medium || this.fallbackImages[i % this.fallbackImages.length];
                } else {
                    // Use fallback images
                    imageUrl = this.fallbackImages[i % this.fallbackImages.length];
                }
                
                // Update the image source
                img.src = imageUrl;
                img.alt = `Video Thumbnail ${i + 1}`;
                
                // Add loading error handling
                img.onerror = () => {
                    console.warn(`Failed to load Pexels image: ${imageUrl}`);
                    // Fallback to a simple colored background
                    img.style.backgroundColor = this.getRandomColor();
                    img.style.display = 'flex';
                    img.style.alignItems = 'center';
                    img.style.justifyContent = 'center';
                    img.style.color = 'white';
                    img.style.fontSize = '14px';
                    img.style.fontWeight = 'bold';
                    img.alt = `Video ${i + 1}`;
                };
                
                console.log(`✅ Loaded Pexels thumbnail ${i + 1}: ${imageUrl}`);
                
            } catch (error) {
                console.error(`Error loading thumbnail ${i + 1}:`, error);
                // Set a fallback color background
                img.style.backgroundColor = this.getRandomColor();
                img.style.display = 'flex';
                img.style.alignItems = 'center';
                img.style.justifyContent = 'center';
                img.style.color = 'white';
                img.style.fontSize = '14px';
                img.style.fontWeight = 'bold';
                img.alt = `Video ${i + 1}`;
            }
        }
        
        console.log('✅ Pexels video thumbnails loaded successfully');
    }

    getRandomColor() {
        const colors = [
            '#667eea', '#f093fb', '#f5576c', '#4facfe', '#00f2fe',
            '#43e97b', '#fa709a', '#ffecd2', '#a8edea', '#d299c2'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Method to refresh images
    async refreshImages() {
        this.loadedImages.clear();
        await this.loadVideoThumbnails();
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.imageLoader = new ImageLoader();
    });
} else {
    window.imageLoader = new ImageLoader();
}
