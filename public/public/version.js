// Version management for cache busting
const APP_VERSION = '1.0.73';
const BUILD_DATE = '2025-01-28';

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APP_VERSION, BUILD_DATE };
} else {
    window.APP_VERSION = APP_VERSION;
    window.BUILD_DATE = BUILD_DATE;
} 