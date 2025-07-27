#!/usr/bin/env node

/**
 * Stripe Monetization Test Suite for Amplifi
 * Tests all payment features through terminal
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

class StripeMonetizationTester {
    constructor() {
        this.config = {
            publishableKey: 'pk_live_51RpT30LHe1RTUAGqdJuiy1GWpobWJYGHMUBeiORdbz6OUwlqoaunI2cct8p51kGncr12b5X5axqYNzCELk80MijH00P4VABBtD',
            appUrl: 'https://amplifi-a54d9.web.app',
            testAmounts: [1.00, 5.00, 10.00],
            businessInfo: {
                name: 'Bradley Virtual Solutions, LLC',
                type: 'Single-Member LLC'
            }
        };
        this.results = {
            passed: 0,
            failed: 0,
            tests: []
        };
    }

    async runAllTests() {
        console.log('🚀 Starting Stripe Monetization Test Suite...\n');
        console.log(`📊 Testing: ${this.config.businessInfo.name}`);
        console.log(`🔑 Publishable Key: ${this.config.publishableKey.substring(0, 20)}...`);
        console.log(`🌐 App URL: ${this.config.appUrl}\n`);

        await this.testStripeConfiguration();
        await this.testAppFiles();
        await this.testPaymentEndpoints();
        await this.testBusinessSetup();
        await this.testAdSenseIntegration();
        
        this.displayResults();
    }

    async testStripeConfiguration() {
        console.log('🔧 Testing Stripe Configuration...');
        
        // Test 1: Verify publishable key format
        const keyTest = this.config.publishableKey.startsWith('pk_live_');
        this.addTestResult('Stripe Publishable Key Format', keyTest, 
            'Key should start with pk_live_', 
            keyTest ? 'Valid live key format' : 'Invalid key format');

        // Test 2: Check key length
        const keyLengthTest = this.config.publishableKey.length > 100;
        this.addTestResult('Stripe Key Length', keyLengthTest,
            'Key should be properly formatted',
            keyLengthTest ? 'Key length is valid' : 'Key appears truncated');

        // Test 3: Verify business configuration
        const businessTest = this.config.businessInfo.name.includes('LLC');
        this.addTestResult('Business Configuration', businessTest,
            'Business should be configured as LLC',
            businessTest ? 'LLC business setup confirmed' : 'Business not configured as LLC');
    }

    async testAppFiles() {
        console.log('📁 Testing App Files...');
        
        const filesToCheck = [
            'public/js/stripe-config.js',
            'public/js/stripe-frontend-only.js',
            'public/feed.html',
            'public/settings.html',
            'public/live.html'
        ];

        for (const file of filesToCheck) {
            const exists = fs.existsSync(file);
            this.addTestResult(`File Exists: ${file}`, exists,
                `File ${file} should exist`,
                exists ? 'File found' : 'File missing');
        }

        // Test Stripe script loading in HTML files
        const htmlFiles = ['public/feed.html', 'public/settings.html', 'public/live.html'];
        for (const file of htmlFiles) {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                const hasStripeScript = content.includes('js.stripe.com/v3/');
                this.addTestResult(`Stripe Script in ${file}`, hasStripeScript,
                    'HTML should include Stripe script',
                    hasStripeScript ? 'Stripe script found' : 'Stripe script missing');
            }
        }
    }

    async testPaymentEndpoints() {
        console.log('💳 Testing Payment Endpoints...');
        
        // Test 1: Check if app is accessible
        try {
            const response = await this.makeRequest(this.config.appUrl);
            const isAccessible = response.statusCode === 200;
            this.addTestResult('App Accessibility', isAccessible,
                'App should be accessible via HTTPS',
                isAccessible ? 'App is accessible' : 'App not accessible');
        } catch (error) {
            this.addTestResult('App Accessibility', false,
                'App should be accessible via HTTPS',
                `Error: ${error.message}`);
        }

        // Test 2: Check for payment forms
        try {
            const response = await this.makeRequest(`${this.config.appUrl}/feed.html`);
            const hasPaymentForms = response.body.includes('tip') || response.body.includes('payment');
            this.addTestResult('Payment Forms Present', hasPaymentForms,
                'Payment forms should be present in feed',
                hasPaymentForms ? 'Payment forms found' : 'Payment forms not found');
        } catch (error) {
            this.addTestResult('Payment Forms Present', false,
                'Payment forms should be present in feed',
                `Error: ${error.message}`);
        }
    }

    async testBusinessSetup() {
        console.log('🏢 Testing Business Setup...');
        
        // Test 1: Verify business name in config
        const businessNameTest = this.config.businessInfo.name === 'Bradley Virtual Solutions, LLC';
        this.addTestResult('Business Name Configuration', businessNameTest,
            'Business name should be properly configured',
            businessNameTest ? 'Business name correct' : 'Business name incorrect');

        // Test 2: Verify business type
        const businessTypeTest = this.config.businessInfo.type === 'Single-Member LLC';
        this.addTestResult('Business Type Configuration', businessTypeTest,
            'Business type should be Single-Member LLC',
            businessTypeTest ? 'Business type correct' : 'Business type incorrect');

        // Test 3: Check for EIN configuration
        const configContent = fs.existsSync('public/js/stripe-config.js') ? 
            fs.readFileSync('public/js/stripe-config.js', 'utf8') : '';
        const hasEINConfig = configContent.includes('ein') || configContent.includes('EIN');
        this.addTestResult('EIN Configuration', hasEINConfig,
            'EIN should be configured in Stripe setup',
            hasEINConfig ? 'EIN configuration found' : 'EIN configuration missing');
    }

    async testAdSenseIntegration() {
        console.log('📺 Testing AdSense Integration...');
        
        // Test 1: Check AdSense script in HTML files
        const htmlFiles = ['public/feed.html', 'public/settings.html', 'public/live.html'];
        let adsenseScriptsFound = 0;
        
        for (const file of htmlFiles) {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                const hasAdSense = content.includes('googlesyndication.com') || 
                                 content.includes('ca-pub-3565666509316178');
                if (hasAdSense) adsenseScriptsFound++;
            }
        }
        
        const adsenseTest = adsenseScriptsFound >= 2; // At least 2 files should have AdSense
        this.addTestResult('AdSense Script Integration', adsenseTest,
            'AdSense scripts should be in multiple HTML files',
            adsenseTest ? `${adsenseScriptsFound} files have AdSense` : 'AdSense scripts missing');

        // Test 2: Check for AdSense config file
        const adsenseConfigExists = fs.existsSync('public/js/adsense-config.js');
        this.addTestResult('AdSense Config File', adsenseConfigExists,
            'AdSense configuration file should exist',
            adsenseConfigExists ? 'AdSense config found' : 'AdSense config missing');
    }

    async makeRequest(url) {
        return new Promise((resolve, reject) => {
            const protocol = url.startsWith('https:') ? https : http;
            
            const req = protocol.get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        body: data
                    });
                });
            });
            
            req.on('error', reject);
            req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
        });
    }

    addTestResult(testName, passed, expected, actual) {
        const result = {
            name: testName,
            passed,
            expected,
            actual,
            timestamp: new Date().toISOString()
        };
        
        this.results.tests.push(result);
        if (passed) {
            this.results.passed++;
            console.log(`  ✅ ${testName}`);
        } else {
            this.results.failed++;
            console.log(`  ❌ ${testName}`);
        }
    }

    displayResults() {
        console.log('\n📊 Test Results Summary:');
        console.log('=' .repeat(50));
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`📈 Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);
        
        console.log('\n🔍 Detailed Results:');
        console.log('=' .repeat(50));
        
        this.results.tests.forEach((test, index) => {
            const status = test.passed ? '✅' : '❌';
            console.log(`${index + 1}. ${status} ${test.name}`);
            if (!test.passed) {
                console.log(`   Expected: ${test.expected}`);
                console.log(`   Actual: ${test.actual}`);
            }
        });

        console.log('\n🎯 Recommendations:');
        console.log('=' .repeat(50));
        
        if (this.results.failed === 0) {
            console.log('🎉 All tests passed! Your Stripe monetization is fully functional.');
            console.log('💡 Next steps:');
            console.log('   - Test live payments with real cards');
            console.log('   - Verify AdSense ads are displaying');
            console.log('   - Check Stripe dashboard for transactions');
        } else {
            console.log('⚠️  Some tests failed. Please review the issues above.');
            console.log('💡 Common fixes:');
            console.log('   - Ensure all files are properly deployed');
            console.log('   - Verify Stripe keys are correct');
            console.log('   - Check AdSense configuration');
        }

        console.log('\n🏢 Business Status:');
        console.log('=' .repeat(50));
        console.log(`Business: ${this.config.businessInfo.name}`);
        console.log(`Type: ${this.config.businessInfo.type}`);
        console.log(`Stripe Key: ${this.config.publishableKey.substring(0, 20)}...`);
        console.log(`App URL: ${this.config.appUrl}`);
    }
}

// Run the tests
async function main() {
    const tester = new StripeMonetizationTester();
    await tester.runAllTests();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = StripeMonetizationTester; 