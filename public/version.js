// Version information for cache busting
const APP_VERSION = '1.1.0';
const BUILD_DATE = new Date().toISOString();

// Export version info
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APP_VERSION, BUILD_DATE };
}

// Make version available globally
window.APP_VERSION = APP_VERSION;
window.BUILD_DATE = BUILD_DATE;

console.log(`🚀 Amplifi Store v${APP_VERSION} loaded at ${BUILD_DATE}`);

// Cache busting function
function getVersionedUrl(url) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${APP_VERSION}`;
}

// Update asset versions to force cache refresh
function updateAssetVersions() {
    // Update CSS files
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    cssLinks.forEach(link => {
        if (link.href && !link.href.includes('v=')) {
            link.href = getVersionedUrl(link.href);
        }
    });

    // Update JS files
    const jsScripts = document.querySelectorAll('script[src]');
    jsScripts.forEach(script => {
        if (script.src && !script.src.includes('v=') && !script.src.includes('firebase') && !script.src.includes('stripe')) {
            script.src = getVersionedUrl(script.src);
        }
    });
}

// Auto-update versions when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateAssetVersions);
} else {
    updateAssetVersions();
} 