// Version configuration for cache busting
const APP_VERSION = '1.0.48';

// Function to append version to URLs
function getVersionedUrl(url) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${APP_VERSION}`;
}

// Function to update all CSS and JS links with versioning
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