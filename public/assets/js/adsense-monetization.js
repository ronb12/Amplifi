/**
 * Google AdSense Monetization System
 * YouTube-style advertising integration for creators
 */

class AdSenseMonetization {
    constructor() {
        this.adsenseConfig = {
            publisherId: 'ca-pub-1234567890123456', // Replace with actual publisher ID
            adSlots: {
                banner: '1234567890',
                video: '0987654321',
                sidebar: '1122334455',
                inContent: '5566778899'
            },
            adFormats: {
                banner: 'auto',
                video: 'video',
                display: 'display',
                native: 'native'
            }
        };
        this.adBlocks = new Map();
        this.creatorEarnings = this.loadCreatorEarnings();
        this.adPerformance = this.loadAdPerformance();
        this.isAdSenseLoaded = false;
        this.init();
    }

    /**
     * Initialize AdSense
     */
    async init() {
        try {
            await this.loadAdSenseScript();
            this.setupAdSlots();
            this.trackAdPerformance();
            console.log('✅ AdSense monetization initialized');
        } catch (error) {
            console.error('❌ AdSense initialization failed:', error);
        }
    }

    /**
     * Load Google AdSense Script
     */
    async loadAdSenseScript() {
        return new Promise((resolve, reject) => {
            if (this.isAdSenseLoaded) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.adsenseConfig.publisherId}`;
            script.async = true;
            script.crossOrigin = 'anonymous';
            
            script.onload = () => {
                this.isAdSenseLoaded = true;
                console.log('✅ AdSense script loaded');
                resolve();
            };
            
            script.onerror = () => {
                console.error('❌ Failed to load AdSense script');
                reject(new Error('AdSense script failed to load'));
            };

            document.head.appendChild(script);
        });
    }

    /**
     * Setup Ad Slots
     */
    setupAdSlots() {
        // Banner Ad Slot
        this.createAdSlot('banner-ad', {
            slot: this.adsenseConfig.adSlots.banner,
            format: this.adsenseConfig.adFormats.banner,
            responsive: true,
            style: { display: 'block' }
        });

        // Video Ad Slot
        this.createAdSlot('video-ad', {
            slot: this.adsenseConfig.adSlots.video,
            format: this.adsenseConfig.adFormats.video,
            responsive: true
        });

        // Sidebar Ad Slot
        this.createAdSlot('sidebar-ad', {
            slot: this.adsenseConfig.adSlots.sidebar,
            format: this.adsenseConfig.adFormats.display,
            responsive: true
        });

        // In-Content Ad Slot
        this.createAdSlot('in-content-ad', {
            slot: this.adsenseConfig.adSlots.inContent,
            format: this.adsenseConfig.adFormats.native,
            responsive: true
        });
    }

    /**
     * Create Ad Slot
     */
    createAdSlot(containerId, config) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const adSlot = document.createElement('ins');
        adSlot.className = 'adsbygoogle';
        adSlot.style.display = 'block';
        adSlot.setAttribute('data-ad-client', this.adsenseConfig.publisherId);
        adSlot.setAttribute('data-ad-slot', config.slot);
        adSlot.setAttribute('data-ad-format', config.format);
        adSlot.setAttribute('data-full-width-responsive', config.responsive ? 'true' : 'false');

        // Apply custom styles
        if (config.style) {
            Object.assign(adSlot.style, config.style);
        }

        container.appendChild(adSlot);

        // Store ad block reference
        this.adBlocks.set(containerId, adSlot);

        // Push to AdSense
        try {
            (adsbygoogle = window.adsbygoogle || []).push({});
            console.log(`✅ Ad slot created: ${containerId}`);
        } catch (error) {
            console.error(`❌ Failed to create ad slot ${containerId}:`, error);
        }
    }

    /**
     * Display Banner Ad
     */
    displayBannerAd(containerId = 'banner-ad') {
        const adSlot = this.adBlocks.get(containerId);
        if (adSlot) {
            adSlot.style.display = 'block';
            this.trackAdView(containerId, 'banner');
        }
    }

    /**
     * Display Video Ad
     */
    displayVideoAd(containerId = 'video-ad') {
        const adSlot = this.adBlocks.get(containerId);
        if (adSlot) {
            adSlot.style.display = 'block';
            this.trackAdView(containerId, 'video');
        }
    }

    /**
     * Display Sidebar Ad
     */
    displaySidebarAd(containerId = 'sidebar-ad') {
        const adSlot = this.adBlocks.get(containerId);
        if (adSlot) {
            adSlot.style.display = 'block';
            this.trackAdView(containerId, 'sidebar');
        }
    }

    /**
     * Display In-Content Ad
     */
    displayInContentAd(containerId = 'in-content-ad') {
        const adSlot = this.adBlocks.get(containerId);
        if (adSlot) {
            adSlot.style.display = 'block';
            this.trackAdView(containerId, 'in-content');
        }
    }

    /**
     * Hide Ad
     */
    hideAd(containerId) {
        const adSlot = this.adBlocks.get(containerId);
        if (adSlot) {
            adSlot.style.display = 'none';
        }
    }

    /**
     * Track Ad Performance
     */
    trackAdPerformance() {
        // Track ad views
        this.adBlocks.forEach((adSlot, containerId) => {
            adSlot.addEventListener('load', () => {
                this.trackAdView(containerId, 'loaded');
            });

            adSlot.addEventListener('error', () => {
                this.trackAdError(containerId);
            });
        });
    }

    /**
     * Track Ad View
     */
    trackAdView(containerId, adType) {
        const view = {
            containerId,
            adType,
            timestamp: Date.now(),
            userId: this.getCurrentUserId(),
            pageUrl: window.location.href
        };

        this.adPerformance.views.push(view);
        this.saveAdPerformance();

        // Update creator earnings
        this.updateCreatorEarnings(adType, 'view');

        console.log(`📊 Ad view tracked: ${containerId} (${adType})`);
    }

    /**
     * Track Ad Click
     */
    trackAdClick(containerId, adType) {
        const click = {
            containerId,
            adType,
            timestamp: Date.now(),
            userId: this.getCurrentUserId(),
            pageUrl: window.location.href
        };

        this.adPerformance.clicks.push(click);
        this.saveAdPerformance();

        // Update creator earnings
        this.updateCreatorEarnings(adType, 'click');

        console.log(`💰 Ad click tracked: ${containerId} (${adType})`);
    }

    /**
     * Track Ad Error
     */
    trackAdError(containerId) {
        const error = {
            containerId,
            timestamp: Date.now(),
            userId: this.getCurrentUserId(),
            pageUrl: window.location.href
        };

        this.adPerformance.errors.push(error);
        this.saveAdPerformance();

        console.log(`❌ Ad error tracked: ${containerId}`);
    }

    /**
     * Update Creator Earnings
     */
    updateCreatorEarnings(adType, action) {
        const userId = this.getCurrentUserId();
        if (!userId) return;

        const earnings = this.creatorEarnings[userId] || {
            totalEarnings: 0,
            views: 0,
            clicks: 0,
            cpm: 0,
            cpc: 0,
            dailyEarnings: {},
            monthlyEarnings: {}
        };

        const today = new Date().toISOString().split('T')[0];
        const month = new Date().toISOString().substring(0, 7);

        // Calculate earnings based on ad type and action
        let earningsAmount = 0;
        if (action === 'view') {
            earningsAmount = this.calculateViewEarnings(adType);
            earnings.views++;
        } else if (action === 'click') {
            earningsAmount = this.calculateClickEarnings(adType);
            earnings.clicks++;
        }

        earnings.totalEarnings += earningsAmount;
        earnings.dailyEarnings[today] = (earnings.dailyEarnings[today] || 0) + earningsAmount;
        earnings.monthlyEarnings[month] = (earnings.monthlyEarnings[month] || 0) + earningsAmount;

        // Update CPM and CPC
        earnings.cpm = earnings.views > 0 ? (earnings.totalEarnings / earnings.views) * 1000 : 0;
        earnings.cpc = earnings.clicks > 0 ? earnings.totalEarnings / earnings.clicks : 0;

        this.creatorEarnings[userId] = earnings;
        this.saveCreatorEarnings();

        console.log(`💰 Creator earnings updated: $${earningsAmount.toFixed(4)}`);
    }

    /**
     * Calculate View Earnings
     */
    calculateViewEarnings(adType) {
        const baseRates = {
            banner: 0.001, // $0.001 per view
            video: 0.005,  // $0.005 per view
            sidebar: 0.0005, // $0.0005 per view
            'in-content': 0.002 // $0.002 per view
        };

        const baseRate = baseRates[adType] || 0.001;
        
        // Add some randomness to simulate real AdSense behavior
        const variation = 0.8 + Math.random() * 0.4; // 80% to 120% of base rate
        
        return baseRate * variation;
    }

    /**
     * Calculate Click Earnings
     */
    calculateClickEarnings(adType) {
        const baseRates = {
            banner: 0.05, // $0.05 per click
            video: 0.10,  // $0.10 per click
            sidebar: 0.03, // $0.03 per click
            'in-content': 0.08 // $0.08 per click
        };

        const baseRate = baseRates[adType] || 0.05;
        
        // Add some randomness to simulate real AdSense behavior
        const variation = 0.7 + Math.random() * 0.6; // 70% to 130% of base rate
        
        return baseRate * variation;
    }

    /**
     * Get Creator Earnings
     */
    getCreatorEarnings(userId) {
        return this.creatorEarnings[userId] || {
            totalEarnings: 0,
            views: 0,
            clicks: 0,
            cpm: 0,
            cpc: 0,
            dailyEarnings: {},
            monthlyEarnings: {}
        };
    }

    /**
     * Get Ad Performance Summary
     */
    getAdPerformanceSummary() {
        const summary = {
            totalViews: this.adPerformance.views.length,
            totalClicks: this.adPerformance.clicks.length,
            totalErrors: this.adPerformance.errors.length,
            ctr: 0, // Click-through rate
            errorRate: 0
        };

        if (summary.totalViews > 0) {
            summary.ctr = (summary.totalClicks / summary.totalViews) * 100;
            summary.errorRate = (summary.totalErrors / summary.totalViews) * 100;
        }

        return summary;
    }

    /**
     * Get Current User ID
     */
    getCurrentUserId() {
        const auth = localStorage.getItem('amplifi_auth');
        return auth ? JSON.parse(auth).userId : null;
    }

    /**
     * Load Creator Earnings
     */
    loadCreatorEarnings() {
        const saved = localStorage.getItem('amplifi_creator_earnings');
        return saved ? JSON.parse(saved) : {};
    }

    /**
     * Save Creator Earnings
     */
    saveCreatorEarnings() {
        localStorage.setItem('amplifi_creator_earnings', JSON.stringify(this.creatorEarnings));
    }

    /**
     * Load Ad Performance
     */
    loadAdPerformance() {
        const saved = localStorage.getItem('amplifi_ad_performance');
        return saved ? JSON.parse(saved) : {
            views: [],
            clicks: [],
            errors: []
        };
    }

    /**
     * Save Ad Performance
     */
    saveAdPerformance() {
        localStorage.setItem('amplifi_ad_performance', JSON.stringify(this.adPerformance));
    }

    /**
     * Enable Ad Blocking Detection
     */
    detectAdBlocking() {
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox';
        testAd.style.cssText = 'position:absolute;left:-10000px;';
        
        document.body.appendChild(testAd);
        
        setTimeout(() => {
            if (testAd.offsetHeight === 0) {
                console.log('🚫 Ad blocker detected');
                this.showAdBlockerMessage();
            }
            document.body.removeChild(testAd);
        }, 100);
    }

    /**
     * Show Ad Blocker Message
     */
    showAdBlockerMessage() {
        const message = document.createElement('div');
        message.className = 'ad-blocker-message';
        message.innerHTML = `
            <div class="ad-blocker-content">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Ad Blocker Detected</h3>
                <p>Please disable your ad blocker to support creators and enjoy the full experience.</p>
                <button onclick="this.parentElement.parentElement.remove()">Got it</button>
            </div>
        `;
        
        document.body.appendChild(message);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (message.parentElement) {
                message.remove();
            }
        }, 10000);
    }

    /**
     * Refresh Ad Slots
     */
    refreshAdSlots() {
        this.adBlocks.forEach((adSlot, containerId) => {
            try {
                (adsbygoogle = window.adsbygoogle || []).push({});
                console.log(`🔄 Ad slot refreshed: ${containerId}`);
            } catch (error) {
                console.error(`❌ Failed to refresh ad slot ${containerId}:`, error);
            }
        });
    }

    /**
     * Get Ad Revenue Dashboard Data
     */
    getRevenueDashboardData(userId) {
        const earnings = this.getCreatorEarnings(userId);
        const performance = this.getAdPerformanceSummary();
        
        return {
            earnings: {
                total: earnings.totalEarnings,
                daily: earnings.dailyEarnings,
                monthly: earnings.monthlyEarnings,
                cpm: earnings.cpm,
                cpc: earnings.cpc
            },
            performance: {
                views: earnings.views,
                clicks: earnings.clicks,
                ctr: performance.ctr,
                errorRate: performance.errorRate
            },
            charts: this.generateRevenueCharts(earnings)
        };
    }

    /**
     * Generate Revenue Charts Data
     */
    generateRevenueCharts(earnings) {
        const dailyData = Object.entries(earnings.dailyEarnings)
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .slice(-30); // Last 30 days

        const monthlyData = Object.entries(earnings.monthlyEarnings)
            .sort(([a], [b]) => new Date(a) - new Date(b));

        return {
            daily: {
                labels: dailyData.map(([date]) => date),
                data: dailyData.map(([, amount]) => amount)
            },
            monthly: {
                labels: monthlyData.map(([month]) => month),
                data: monthlyData.map(([, amount]) => amount)
            }
        };
    }
}

// Initialize AdSense Monetization
window.AdSenseMonetization = AdSenseMonetization;
