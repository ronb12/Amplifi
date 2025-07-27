// AdSense Configuration for Amplifi
// Publisher ID: [ENVIRONMENT_VARIABLE]
// Customer ID: [ENVIRONMENT_VARIABLE]

class AdSenseManager {
    constructor() {
        this.config = {
            publisherId: process.env.ADSENSE_PUBLISHER_ID || 'pub-3565666509316178',
            customerId: process.env.ADSENSE_CUSTOMER_ID || '4925311126',
            isInitialized: false,
            adUnits: {
                banner: {
                    id: process.env.ADSENSE_BANNER_ID || 'ca-pub-3565666509316178/your-banner-ad-unit-id',
                    format: 'auto',
                    responsive: true
                },
                interstitial: {
                    id: process.env.ADSENSE_INTERSTITIAL_ID || 'ca-pub-3565666509316178/your-interstitial-ad-unit-id',
                    format: 'auto'
                },
                inArticle: {
                    id: process.env.ADSENSE_IN_ARTICLE_ID || 'ca-pub-3565666509316178/your-in-article-ad-unit-id',
                    format: 'auto'
                },
                inFeed: {
                    id: process.env.ADSENSE_IN_FEED_ID || 'ca-pub-3565666509316178/your-in-feed-ad-unit-id',
                    format: 'auto'
                }
            }
        };
        
        this.init();
    }

    init() {
        // Check if AdSense is loaded
        if (typeof adsbygoogle !== 'undefined') {
            this.config.isInitialized = true;
            this.loadAllAds();
        } else {
            // Wait for AdSense to load
            window.addEventListener('load', () => {
                if (typeof adsbygoogle !== 'undefined') {
                    this.config.isInitialized = true;
                    this.loadAllAds();
                }
            });
        }
    }

    loadAllAds() {
        this.loadBannerAds();
        this.loadInArticleAds();
        this.loadInFeedAds();
    }

    loadBannerAds() {
        const bannerAds = document.querySelectorAll('.adsense-banner');
        bannerAds.forEach(ad => {
            try {
                (adsbygoogle = window.adsbygoogle || []).push({});
                ad.style.display = 'block';
            } catch (error) {
                console.error('Error loading banner ad:', error);
            }
        });
    }

    loadInArticleAds() {
        const inArticleAds = document.querySelectorAll('.adsense-in-article');
        inArticleAds.forEach(ad => {
            try {
                (adsbygoogle = window.adsbygoogle || []).push({});
                ad.style.display = 'block';
            } catch (error) {
                console.error('Error loading in-article ad:', error);
            }
        });
    }

    loadInFeedAds() {
        const inFeedAds = document.querySelectorAll('.adsense-in-feed');
        inFeedAds.forEach(ad => {
            try {
                (adsbygoogle = window.adsbygoogle || []).push({});
                ad.style.display = 'block';
            } catch (error) {
                console.error('Error loading in-feed ad:', error);
            }
        });
    }

    // Create banner ad element
    createBannerAd(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            const adElement = document.createElement('ins');
            adElement.className = 'adsbygoogle adsense-banner';
            adElement.style.display = 'block';
            adElement.setAttribute('data-ad-client', this.config.publisherId);
            adElement.setAttribute('data-ad-slot', 'your-banner-ad-slot');
            adElement.setAttribute('data-ad-format', 'auto');
            adElement.setAttribute('data-full-width-responsive', 'true');
            
            container.appendChild(adElement);
            
            if (this.config.isInitialized) {
                this.loadBannerAds();
            }
        }
    }

    // Create in-article ad element
    createInArticleAd(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            const adElement = document.createElement('ins');
            adElement.className = 'adsense-in-article';
            adElement.style.display = 'block';
            adElement.setAttribute('data-ad-client', this.config.publisherId);
            adElement.setAttribute('data-ad-slot', 'your-in-article-ad-slot');
            adElement.setAttribute('data-ad-format', 'auto');
            
            container.appendChild(adElement);
            
            if (this.config.isInitialized) {
                this.loadInArticleAds();
            }
        }
    }

    // Create in-feed ad element
    createInFeedAd(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            const adElement = document.createElement('ins');
            adElement.className = 'adsense-in-feed';
            adElement.style.display = 'block';
            adElement.setAttribute('data-ad-client', this.config.publisherId);
            adElement.setAttribute('data-ad-slot', 'your-in-feed-ad-slot');
            adElement.setAttribute('data-ad-format', 'auto');
            
            container.appendChild(adElement);
            
            if (this.config.isInitialized) {
                this.loadInFeedAds();
            }
        }
    }

    // Show interstitial ad (for premium features)
    showInterstitialAd() {
        const interstitialAd = document.getElementById('interstitialAd');
        if (interstitialAd) {
            interstitialAd.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                interstitialAd.style.display = 'none';
            }, 5000);
        }
    }

    // Get ad revenue analytics
    getAdRevenue() {
        // This would integrate with Google Analytics or AdSense API
        return {
            publisherId: this.config.publisherId,
            customerId: this.config.customerId,
            totalRevenue: 0,
            monthlyRevenue: 0,
            adImpressions: 0,
            adClicks: 0
        };
    }

    // Check if ads are blocked
    isAdBlocked() {
        return new Promise((resolve) => {
            const testAd = document.createElement('div');
            testAd.innerHTML = '&nbsp;';
            testAd.className = 'adsbox';
            testAd.style.position = 'absolute';
            testAd.style.left = '-10000px';
            testAd.style.top = '-1000px';
            testAd.style.width = '1px';
            testAd.style.height = '1px';
            
            document.body.appendChild(testAd);
            
            setTimeout(() => {
                const isBlocked = testAd.offsetHeight === 0;
                document.body.removeChild(testAd);
                resolve(isBlocked);
            }, 100);
        });
    }
}

// Initialize AdSense Manager
const adSenseManager = new AdSenseManager();

// Export for use in other files
window.AdSenseManager = AdSenseManager;
window.adSenseManager = adSenseManager; 