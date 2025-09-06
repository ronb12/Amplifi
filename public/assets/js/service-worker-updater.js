// Service Worker Updater - Helps resolve CSS conflicts and update service worker
class ServiceWorkerUpdater {
    constructor() {
        this.registration = null;
        this.init();
    }

    async init() {
        try {
            if ('serviceWorker' in navigator) {
                console.log('🔧 Initializing Service Worker Updater...');
                await this.registerServiceWorker();
                this.checkForUpdates();
            } else {
                console.log('❌ Service Worker not supported in this browser');
            }
        } catch (error) {
            console.error('❌ Service Worker Updater initialization failed:', error);
        }
    }

    async registerServiceWorker() {
        try {
            this.registration = await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker registered:', this.registration);
            
            // Listen for updates
            this.registration.addEventListener('updatefound', () => {
                console.log('🔄 Service Worker update found');
                this.handleUpdate();
            });
            
        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
        }
    }

    async checkForUpdates() {
        if (this.registration) {
            try {
                await this.registration.update();
                console.log('✅ Service Worker update check completed');
            } catch (error) {
                console.error('❌ Service Worker update check failed:', error);
            }
        }
    }

    handleUpdate() {
        if (this.registration && this.registration.waiting) {
            console.log('🔄 New Service Worker waiting to activate');
            
            // Show update notification to user
            this.showUpdateNotification();
            
            // Auto-update after a delay
            setTimeout(() => {
                this.activateUpdate();
            }, 5000);
        }
    }

    showUpdateNotification() {
        // Create update notification
        const notification = document.createElement('div');
        notification.className = 'sw-update-notification';
        notification.innerHTML = `
            <div class="sw-update-content">
                <span>🔄 New version available</span>
                <button onclick="serviceWorkerUpdater.activateUpdate()" class="sw-update-btn">
                    Update Now
                </button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #667eea;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
        `;
        
        // Add button styles
        const button = notification.querySelector('.sw-update-btn');
        button.style.cssText = `
            margin-left: 12px;
            background: white;
            color: #667eea;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 10000);
    }

    async activateUpdate() {
        if (this.registration && this.registration.waiting) {
            try {
                // Send message to waiting service worker to skip waiting
                this.registration.waiting.postMessage({ type: 'skipWaiting' });
                console.log('✅ Update activation message sent');
                
                // Reload page after a short delay to activate new service worker
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
                
            } catch (error) {
                console.error('❌ Update activation failed:', error);
            }
        }
    }

    async clearCache() {
        try {
            if (this.registration) {
                // Send message to service worker to clear cache
                this.registration.active.postMessage({ type: 'clear-cache' });
                console.log('✅ Cache clear message sent');
                
                // Also clear browser cache
                if ('caches' in window) {
                    const cacheNames = await caches.keys();
                    await Promise.all(
                        cacheNames.map(cacheName => caches.delete(cacheName))
                    );
                    console.log('✅ Browser cache cleared');
                }
                
                // Reload page to ensure clean state
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
                
            } else {
                console.log('❌ No service worker registration found');
            }
        } catch (error) {
            console.error('❌ Cache clearing failed:', error);
        }
    }

    async forceUpdate() {
        try {
            // Unregister current service worker
            if (this.registration) {
                await this.registration.unregister();
                console.log('✅ Service Worker unregistered');
            }
            
            // Clear all caches
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
                console.log('✅ All caches cleared');
            }
            
            // Reload page to re-register service worker
            window.location.reload();
            
        } catch (error) {
            console.error('❌ Force update failed:', error);
        }
    }
}

// Initialize service worker updater
const serviceWorkerUpdater = new ServiceWorkerUpdater();

// Add global functions for manual control
window.updateServiceWorker = () => serviceWorkerUpdater.activateUpdate();
window.clearServiceWorkerCache = () => serviceWorkerUpdater.clearCache();
window.forceServiceWorkerUpdate = () => serviceWorkerUpdater.forceUpdate();

// Add CSS conflict detection
function detectCSSConflicts() {
    const stylesheets = Array.from(document.styleSheets);
    const cssFiles = stylesheets
        .filter(sheet => sheet.href && sheet.href.includes('assets/css/'))
        .map(sheet => sheet.href.split('/').pop());
    
    console.log('📋 Loaded CSS files:', cssFiles);
    
    if (cssFiles.length > 1) {
        console.warn('⚠️ Multiple CSS files detected - potential conflicts!');
        
        // Check for specific conflicts
        if (cssFiles.includes('styles.css') && cssFiles.includes('youtube-style.css')) {
            console.error('❌ CSS CONFLICT DETECTED: Both styles.css and youtube-style.css are loaded!');
            console.log('💡 Recommendation: Remove one CSS file to resolve conflicts');
        }
    } else {
        console.log('✅ Single CSS file detected - no conflicts');
    }
}

// Run conflict detection after page load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(detectCSSConflicts, 1000);
});

console.log('✅ Service Worker Updater loaded successfully');
