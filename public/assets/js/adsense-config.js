// Enhanced AdSense Configuration for Amplifi
// Publisher ID: pub-3565666509316178
// Customer ID: 4925311126

class AdSenseManager {
    constructor() {
        this.config = {
            publisherId: 'pub-3565666509316178',
            customerId: '4925311126',
            isInitialized: false,
            adUnits: {
                banner: {
                    id: 'ca-pub-3565666509316178/1234567890',
                    format: 'auto',
                    responsive: true,
                    position: 'top'
                },
                interstitial: {
                    id: 'ca-pub-3565666509316178/0987654321',
                    format: 'auto',
                    trigger: 'video-completion'
                },
                inArticle: {
                    id: 'ca-pub-3565666509316178/1122334455',
                    format: 'auto',
                    position: 'middle'
                },
                inFeed: {
                    id: 'ca-pub-3565666509316178/5566778899',
                    format: 'auto',
                    position: 'every-5-posts'
                },
                videoOverlay: {
                    id: 'ca-pub-3565666509316178/6677889900',
                    format: 'auto',
                    position: 'bottom-right'
                },
                sideRail: {
                    id: 'ca-pub-3565666509316178/7788990011',
                    format: 'auto',
                    position: 'right-sidebar'
                }
            },
            // 24/7 Ad Rotation Settings
            rotationSettings: {
                enabled: true,
                interval: 300000, // 5 minutes
                maxAdsPerHour: 12,
                userExperience: {
                    maxBannerAds: 3,
                    maxInterstitialAds: 2,
                    cooldownPeriod: 600000 // 10 minutes between interstitial ads
                }
            },
            // Professional Ad Features
            professionalFeatures: {
                preRollAds: true,
                midRollAds: true,
                postRollAds: true,
                skipAfterSeconds: 5,
                adBreakDuration: 15,
                adBreakFrequency: 300 // Every 5 minutes
            }
        };
        
        this.adHistory = [];
        this.lastAdTime = {};
        this.init();
    }

    init() {
        // Check if AdSense is loaded
        if (typeof adsbygoogle !== 'undefined') {
            this.config.isInitialized = true;
            this.loadAllAds();
            this.startAdRotation();
        } else {
            // Wait for AdSense to load
            window.addEventListener('load', () => {
                if (typeof adsbygoogle !== 'undefined') {
                    this.config.isInitialized = true;
                    this.loadAllAds();
                    this.startAdRotation();
                }
            });
        }
    }

    // Load all ad units
    loadAllAds() {
        if (!this.config.isInitialized) return;

        try {
            // Load banner ads
        this.loadBannerAds();
            
            // Load in-feed ads
        this.loadInFeedAds();
            
            // Load side rail ads
            this.loadSideRailAds();
            
            // Initialize video ad system
            this.initializeVideoAds();
            
            console.log('✅ All AdSense ads loaded successfully');
        } catch (error) {
            console.error('❌ Error loading AdSense ads:', error);
        }
    }

    // Load banner ads
    loadBannerAds() {
        const bannerContainers = document.querySelectorAll('.adsense-banner');
        bannerContainers.forEach(container => {
            if (container && !container.hasAttribute('data-adsense-loaded')) {
                container.setAttribute('data-adsense-loaded', 'true');
                container.innerHTML = `
                    <ins class="adsbygoogle"
                         style="display:block"
                         data-ad-client="ca-pub-3565666509316178"
                         data-ad-slot="${this.config.adUnits.banner.id.split('/')[1]}"
                         data-ad-format="auto"
                         data-full-width-responsive="true"></ins>
                `;
                (adsbygoogle = window.adsbygoogle || []).push({});
            }
        });
    }

    // Load in-feed ads
    loadInFeedAds() {
        const feedContainers = document.querySelectorAll('.adsense-infeed');
        feedContainers.forEach(container => {
            if (container && !container.hasAttribute('data-adsense-loaded')) {
                container.setAttribute('data-adsense-loaded', 'true');
                container.innerHTML = `
                    <ins class="adsbygoogle"
                         style="display:block"
                         data-ad-format="fluid"
                         data-ad-layout-key="-fb+5w+4e-db+86"
                         data-ad-client="ca-pub-3565666509316178"
                         data-ad-slot="${this.config.adUnits.inFeed.id.split('/')[1]}"></ins>
                `;
                (adsbygoogle = window.adsbygoogle || []).push({});
            }
        });
    }

    // Load side rail ads
    loadSideRailAds() {
        const sideRailContainers = document.querySelectorAll('.adsense-side-rail');
        sideRailContainers.forEach(container => {
            if (container && !container.hasAttribute('data-adsense-loaded')) {
                container.setAttribute('data-adsense-loaded', 'true');
                container.innerHTML = `
                    <ins class="adsbygoogle"
                         style="display:block"
                         data-ad-client="ca-pub-3565666509316178"
                         data-ad-slot="${this.config.adUnits.sideRail.id.split('/')[1]}"
                         data-ad-format="auto"></ins>
                `;
                (adsbygoogle = window.adsbygoogle || []).push({});
            }
        });
    }

    // Initialize video ad system (Professional)
    initializeVideoAds() {
        if (!this.config.professionalFeatures.preRollAds) return;

        // Create video ad overlay system
        this.createVideoAdOverlays();
        
        // Set up video ad triggers
        this.setupVideoAdTriggers();
    }

    // Create video ad overlays
    createVideoAdOverlays() {
        const videoContainers = document.querySelectorAll('.video-container, .live-stream-container');
        
        videoContainers.forEach(container => {
            // Pre-roll ad overlay
            const preRollOverlay = document.createElement('div');
            preRollOverlay.className = 'video-ad-overlay pre-roll';
            preRollOverlay.innerHTML = `
                <div class="ad-content">
                    <ins class="adsbygoogle"
                         style="display:block"
                         data-ad-client="ca-pub-3565666509316178"
                         data-ad-slot="${this.config.adUnits.videoOverlay.id.split('/')[1]}"
                         data-ad-format="auto"></ins>
                    <div class="ad-skip-timer">
                        <span class="skip-text">Skip ad in <span class="countdown">5</span>s</span>
                        <button class="skip-button" style="display: none;">Skip Ad</button>
                    </div>
                </div>
            `;
            
            container.appendChild(preRollOverlay);
            (adsbygoogle = window.adsbygoogle || []).push({});
        });
    }

    // Set up video ad triggers
    setupVideoAdTriggers() {
        const videos = document.querySelectorAll('video');
        
        videos.forEach(video => {
            // Pre-roll ad
            video.addEventListener('play', () => {
                if (this.config.professionalFeatures.preRollAds) {
                    this.showPreRollAd(video);
                }
            });

            // Mid-roll ads
            video.addEventListener('timeupdate', () => {
                if (this.config.professionalFeatures.midRollAds) {
                    this.checkMidRollAd(video);
                }
            });

            // Post-roll ad
            video.addEventListener('ended', () => {
                if (this.config.professionalFeatures.postRollAds) {
                    this.showPostRollAd(video);
                }
            });
        });
    }

    // Show pre-roll ad
    showPreRollAd(video) {
        const overlay = video.parentElement.querySelector('.pre-roll');
        if (overlay) {
            overlay.style.display = 'block';
            video.pause();
            
            // Start countdown
            let countdown = this.config.professionalFeatures.skipAfterSeconds;
            const countdownElement = overlay.querySelector('.countdown');
            const skipButton = overlay.querySelector('.skip-button');
            
            const timer = setInterval(() => {
                countdown--;
                if (countdownElement) countdownElement.textContent = countdown;
                
                if (countdown <= 0) {
                    clearInterval(timer);
                    if (skipButton) skipButton.style.display = 'block';
                }
            }, 1000);
            
            // Skip button functionality
            if (skipButton) {
                skipButton.addEventListener('click', () => {
                    overlay.style.display = 'none';
                    video.play();
                });
            }
        }
    }

    // Check for mid-roll ad
    checkMidRollAd(video) {
        const currentTime = video.currentTime;
        const duration = video.duration;
        
        if (duration > 0) {
            const adBreakTime = Math.floor(duration / 2); // Mid-point
            const timeSinceLastAd = Date.now() - (this.lastAdTime[video.id] || 0);
            
            if (Math.abs(currentTime - adBreakTime) < 2 && timeSinceLastAd > this.config.professionalFeatures.adBreakFrequency * 1000) {
                this.showMidRollAd(video);
                this.lastAdTime[video.id] = Date.now();
            }
        }
    }

    // Show mid-roll ad
    showMidRollAd(video) {
        const overlay = video.parentElement.querySelector('.mid-roll') || this.createMidRollOverlay(video);
        overlay.style.display = 'block';
        video.pause();
        
        // Auto-resume after ad duration
        setTimeout(() => {
            overlay.style.display = 'none';
            video.play();
        }, this.config.professionalFeatures.adBreakDuration * 1000);
    }

    // Create mid-roll overlay
    createMidRollOverlay(video) {
        const overlay = document.createElement('div');
        overlay.className = 'video-ad-overlay mid-roll';
        overlay.innerHTML = `
            <div class="ad-content">
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-client="ca-pub-3565666509316178"
                     data-ad-slot="${this.config.adUnits.videoOverlay.id.split('/')[1]}"
                     data-ad-format="auto"></ins>
                <div class="ad-info">
                    <span class="ad-label">Advertisement</span>
                    <span class="ad-duration">${this.config.professionalFeatures.adBreakDuration}s</span>
                </div>
            </div>
        `;
        
        video.parentElement.appendChild(overlay);
        (adsbygoogle = window.adsbygoogle || []).push({});
        return overlay;
    }

    // Show post-roll ad
    showPostRollAd(video) {
        const overlay = video.parentElement.querySelector('.post-roll') || this.createPostRollOverlay(video);
        overlay.style.display = 'block';
        
        // Auto-hide after ad duration
        setTimeout(() => {
            overlay.style.display = 'none';
        }, this.config.professionalFeatures.adBreakDuration * 1000);
    }

    // Create post-roll overlay
    createPostRollOverlay(video) {
        const overlay = document.createElement('div');
        overlay.className = 'video-ad-overlay post-roll';
        overlay.innerHTML = `
            <div class="ad-content">
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-client="ca-pub-3565666509316178"
                     data-ad-slot="${this.config.adUnits.videoOverlay.id.split('/')[1]}"
                     data-ad-format="auto"></ins>
                <div class="ad-info">
                    <span class="ad-label">Advertisement</span>
                    <span class="ad-duration">${this.config.professionalFeatures.adBreakDuration}s</span>
                </div>
            </div>
        `;
        
        video.parentElement.appendChild(overlay);
        (adsbygoogle = window.adsbygoogle || []).push({});
        return overlay;
    }

    // Start 24/7 ad rotation
    startAdRotation() {
        if (!this.config.rotationSettings.enabled) return;

        setInterval(() => {
            this.rotateAds();
        }, this.config.rotationSettings.interval);
    }

    // Rotate ads for fresh content
    rotateAds() {
        // Refresh banner ads
        this.refreshBannerAds();
        
        // Refresh in-feed ads
        this.refreshInFeedAds();
        
        // Log rotation
        console.log('🔄 AdSense ads rotated at:', new Date().toLocaleTimeString());
    }

    // Refresh banner ads
    refreshBannerAds() {
        const bannerContainers = document.querySelectorAll('.adsense-banner[data-adsense-loaded="true"]');
        bannerContainers.forEach(container => {
            // Remove old ad
            container.innerHTML = '';
            container.removeAttribute('data-adsense-loaded');
            
            // Load new ad
            setTimeout(() => {
                this.loadBannerAds();
            }, 1000);
        });
    }

    // Refresh in-feed ads
    refreshInFeedAds() {
        const inFeedContainers = document.querySelectorAll('.adsense-infeed[data-adsense-loaded="true"]');
        inFeedContainers.forEach(container => {
            // Remove old ad
            container.innerHTML = '';
            container.removeAttribute('data-adsense-loaded');
            
            // Load new ad
            setTimeout(() => {
                this.loadInFeedAds();
            }, 1000);
        });
    }

    // Show interstitial ad (with user experience controls)
    showInterstitialAd() {
        const lastInterstitial = this.lastAdTime['interstitial'] || 0;
        const timeSinceLastAd = Date.now() - lastInterstitial;
        
        if (timeSinceLastAd < this.config.rotationSettings.userExperience.cooldownPeriod) {
            console.log('⏳ Interstitial ad on cooldown');
            return;
        }

        const interstitialAd = document.getElementById('interstitialAd');
        if (interstitialAd) {
            interstitialAd.style.display = 'block';
            this.lastAdTime['interstitial'] = Date.now();
            
            // Auto-hide after duration
            setTimeout(() => {
                interstitialAd.style.display = 'none';
            }, 5000);
        }
    }

    // Get ad performance metrics
    getAdMetrics() {
        return {
            totalAdsLoaded: this.adHistory.length,
            lastRotation: new Date().toLocaleTimeString(),
            rotationEnabled: this.config.rotationSettings.enabled,
            professionalFeatures: this.config.professionalFeatures
        };
    }

    // Update configuration
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('✅ AdSense configuration updated');
    }
}

// Initialize AdSense Manager
const adSenseManager = new AdSenseManager();

// Export for global use
window.adSenseManager = adSenseManager; 

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        adSenseManager.init();
    });
} else {
    adSenseManager.init();
} 