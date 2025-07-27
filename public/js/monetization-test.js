// Monetization Test Suite for Amplifi
// This script tests all monetization features

class MonetizationTester {
    constructor() {
        this.testResults = {
            stripe: { passed: false, errors: [] },
            tips: { passed: false, errors: [] },
            adsense: { passed: false, errors: [] },
            settings: { passed: false, errors: [] }
        };
    }

    async runAllTests() {
        console.log('🧪 Starting Monetization Tests...');
        
        await this.testStripeIntegration();
        await this.testTipSystem();
        await this.testAdSenseIntegration();
        await this.testMonetizationSettings();
        
        this.displayResults();
    }

    async testStripeIntegration() {
        console.log('💳 Testing Stripe Integration...');
        
        try {
            // Test 1: Check if Stripe is loaded
            if (typeof Stripe === 'undefined') {
                this.testResults.stripe.errors.push('Stripe library not loaded');
                return;
            }

            // Test 2: Check if Stripe is initialized
            if (typeof window.stripe === 'undefined') {
                this.testResults.stripe.errors.push('Stripe not initialized');
                return;
            }

            // Test 3: Check publishable key
            const publishableKey = 'pk_live_51RoYuFLozOIn8lA4eD4pmVKUh17pG4T0AjfVf33oVbMFjLpqOUWSOLqps3QDo3Bv9U7HOa8RA19VxC430ILigozi00yErrTYnw';
            if (publishableKey.startsWith('pk_live_')) {
                console.log('✅ Stripe Live Key Detected');
            } else {
                this.testResults.stripe.errors.push('Invalid Stripe key format');
                return;
            }

            // Test 4: Check payment processor
            if (typeof window.paymentProcessor === 'undefined') {
                this.testResults.stripe.errors.push('Payment processor not initialized');
                return;
            }

            this.testResults.stripe.passed = true;
            console.log('✅ Stripe Integration: PASSED');
            
        } catch (error) {
            this.testResults.stripe.errors.push(`Stripe test error: ${error.message}`);
            console.error('❌ Stripe Integration: FAILED', error);
        }
    }

    async testTipSystem() {
        console.log('💰 Testing Tip System...');
        
        try {
            // Test 1: Check tip modal exists
            const tipModal = document.getElementById('tipModal');
            if (!tipModal) {
                this.testResults.tips.errors.push('Tip modal not found');
                return;
            }

            // Test 2: Check tip form exists
            const tipForm = document.getElementById('tipForm');
            if (!tipForm) {
                this.testResults.tips.errors.push('Tip form not found');
                return;
            }

            // Test 3: Check tip amount buttons
            const tipAmounts = document.querySelectorAll('.tip-amount');
            if (tipAmounts.length === 0) {
                this.testResults.tips.errors.push('Tip amount buttons not found');
                return;
            }

            // Test 4: Check custom amount input
            const customAmount = document.getElementById('customTipAmount');
            if (!customAmount) {
                this.testResults.tips.errors.push('Custom tip amount input not found');
                return;
            }

            // Test 5: Check tip function exists
            if (typeof window.app?.showTipModal !== 'function') {
                this.testResults.tips.errors.push('showTipModal function not found');
                return;
            }

            this.testResults.tips.passed = true;
            console.log('✅ Tip System: PASSED');
            
        } catch (error) {
            this.testResults.tips.errors.push(`Tip test error: ${error.message}`);
            console.error('❌ Tip System: FAILED', error);
        }
    }

    async testAdSenseIntegration() {
        console.log('📺 Testing AdSense Integration...');
        
        try {
            // Test 1: Check AdSense script loaded
            const adsenseScript = document.querySelector('script[src*="adsbygoogle"]');
            if (!adsenseScript) {
                this.testResults.adsense.errors.push('AdSense script not loaded');
                return;
            }

            // Test 2: Check AdSense manager
            if (typeof window.adSenseManager === 'undefined') {
                this.testResults.adsense.errors.push('AdSense manager not initialized');
                return;
            }

            // Test 3: Check publisher ID
            const publisherId = 'pub-3565666509316178';
            if (window.adSenseManager.config.publisherId === publisherId) {
                console.log('✅ AdSense Publisher ID: CORRECT');
            } else {
                this.testResults.adsense.errors.push('Incorrect publisher ID');
                return;
            }

            // Test 4: Check customer ID
            const customerId = '4925311126';
            if (window.adSenseManager.config.customerId === customerId) {
                console.log('✅ AdSense Customer ID: CORRECT');
            } else {
                this.testResults.adsense.errors.push('Incorrect customer ID');
                return;
            }

            this.testResults.adsense.passed = true;
            console.log('✅ AdSense Integration: PASSED');
            
        } catch (error) {
            this.testResults.adsense.errors.push(`AdSense test error: ${error.message}`);
            console.error('❌ AdSense Integration: FAILED', error);
        }
    }

    async testMonetizationSettings() {
        console.log('⚙️ Testing Monetization Settings...');
        
        try {
            // Test 1: Check settings page exists
            const settingsPage = document.querySelector('.settings-container');
            if (!settingsPage) {
                this.testResults.settings.errors.push('Settings container not found');
                return;
            }

            // Test 2: Check monetization tab
            const monetizationTab = document.getElementById('monetizationTab');
            if (!monetizationTab) {
                this.testResults.settings.errors.push('Monetization tab not found');
                return;
            }

            // Test 3: Check tip enable checkbox
            const enableTips = document.getElementById('enableTips');
            if (!enableTips) {
                this.testResults.settings.errors.push('Enable tips checkbox not found');
                return;
            }

            // Test 4: Check ad enable checkbox
            const enableAds = document.getElementById('enableAds');
            if (!enableAds) {
                this.testResults.settings.errors.push('Enable ads checkbox not found');
                return;
            }

            // Test 5: Check payout email input
            const payoutEmail = document.getElementById('payoutEmail');
            if (!payoutEmail) {
                this.testResults.settings.errors.push('Payout email input not found');
                return;
            }

            // Test 6: Check payout threshold select
            const payoutThreshold = document.getElementById('payoutThreshold');
            if (!payoutThreshold) {
                this.testResults.settings.errors.push('Payout threshold select not found');
                return;
            }

            this.testResults.settings.passed = true;
            console.log('✅ Monetization Settings: PASSED');
            
        } catch (error) {
            this.testResults.settings.errors.push(`Settings test error: ${error.message}`);
            console.error('❌ Monetization Settings: FAILED', error);
        }
    }

    displayResults() {
        console.log('\n📊 MONETIZATION TEST RESULTS');
        console.log('============================');
        
        Object.entries(this.testResults).forEach(([test, result]) => {
            const status = result.passed ? '✅ PASSED' : '❌ FAILED';
            console.log(`${test.toUpperCase()}: ${status}`);
            
            if (result.errors.length > 0) {
                console.log('  Errors:');
                result.errors.forEach(error => console.log(`    - ${error}`));
            }
        });

        const totalTests = Object.keys(this.testResults).length;
        const passedTests = Object.values(this.testResults).filter(r => r.passed).length;
        
        console.log(`\n📈 SUMMARY: ${passedTests}/${totalTests} tests passed`);
        
        if (passedTests === totalTests) {
            console.log('🎉 All monetization features are working correctly!');
        } else {
            console.log('⚠️ Some monetization features need attention.');
        }
    }
}

// Auto-run tests when script loads
document.addEventListener('DOMContentLoaded', () => {
    const tester = new MonetizationTester();
    tester.runAllTests();
});

// Export for manual testing
window.MonetizationTester = MonetizationTester; 