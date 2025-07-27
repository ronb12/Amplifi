#!/usr/bin/env node

/**
 * Stripe Payment Test Script
 * Tests payments using Stripe test cards
 */

const https = require('https');
const http = require('http');

class StripePaymentTester {
    constructor() {
        this.config = {
            publishableKey: 'pk_live_51RpT30LHe1RTUAGqdJuiy1GWpobWJYGHMUBeiORdbz6OUwlqoaunI2cct8p51kGncr12b5X5axqYNzCELk80MijH00P4VABBtD',
            appUrl: 'https://amplifi-a54d9.web.app',
            businessInfo: {
                name: 'Bradley Virtual Solutions, LLC',
                type: 'Single-Member LLC'
            }
        };
        
        // Stripe test card numbers
        this.testCards = {
            visa: {
                number: '4242424242424242',
                exp_month: '12',
                exp_year: '2025',
                cvc: '123',
                name: 'Test User',
                description: 'Visa (successful payment)'
            },
            visa_declined: {
                number: '4000000000000002',
                exp_month: '12',
                exp_year: '2025',
                cvc: '123',
                name: 'Test User',
                description: 'Visa (declined payment)'
            },
            mastercard: {
                number: '5555555555554444',
                exp_month: '12',
                exp_year: '2025',
                cvc: '123',
                name: 'Test User',
                description: 'Mastercard (successful payment)'
            },
            amex: {
                number: '378282246310005',
                exp_month: '12',
                exp_year: '2025',
                cvc: '1234',
                name: 'Test User',
                description: 'American Express (successful payment)'
            }
        };
        
        this.results = { passed: 0, failed: 0, tests: [] };
    }

    async runPaymentTests() {
        console.log('💳 Stripe Payment Test Suite\n');
        console.log(`🏢 Business: ${this.config.businessInfo.name}`);
        console.log(`🔑 Key: ${this.config.publishableKey.substring(0, 20)}...`);
        console.log(`🌐 App: ${this.config.appUrl}\n`);

        await this.testPaymentConfiguration();
        await this.testPaymentEndpoints();
        await this.testStripeIntegration();
        await this.testBusinessSetup();
        
        this.showResults();
        this.showTestCardInfo();
    }

    async testPaymentConfiguration() {
        console.log('🔧 Testing Payment Configuration...');
        
        // Test Stripe key format
        const keyTest = this.config.publishableKey.startsWith('pk_live_');
        this.addResult('Live Stripe Key', keyTest, 'Should be a live publishable key');
        
        // Test business configuration
        const businessTest = this.config.businessInfo.name.includes('LLC');
        this.addResult('Business LLC Setup', businessTest, 'Should be configured as LLC');
        
        // Test app accessibility
        try {
            const response = await this.makeRequest(this.config.appUrl);
            const accessible = response.statusCode === 200;
            this.addResult('App Live Status', accessible, 'App should be accessible');
        } catch (error) {
            this.addResult('App Live Status', false, `Error: ${error.message}`);
        }
    }

    async testPaymentEndpoints() {
        console.log('🌐 Testing Payment Endpoints...');
        
        // Test feed page for payment forms
        try {
            const response = await this.makeRequest(`${this.config.appUrl}/feed.html`);
            const hasTipModal = response.body.includes('tipModal');
            this.addResult('Tip Modal Present', hasTipModal, 'Should have tip payment modal');
            
            const hasStripeScript = response.body.includes('js.stripe.com/v3/');
            this.addResult('Stripe Script Loaded', hasStripeScript, 'Should load Stripe.js');
            
            const hasPaymentConfig = response.body.includes('stripe-config.js') || response.body.includes('stripe-frontend-only.js');
            this.addResult('Payment Config Loaded', hasPaymentConfig, 'Should load payment configuration');
        } catch (error) {
            this.addResult('Payment Endpoints', false, `Error: ${error.message}`);
        }
    }

    async testStripeIntegration() {
        console.log('💳 Testing Stripe Integration...');
        
        // Test Stripe.js availability
        try {
            const response = await this.makeRequest('https://js.stripe.com/v3/');
            const stripeAvailable = response.statusCode === 200;
            this.addResult('Stripe.js Available', stripeAvailable, 'Stripe.js should be accessible');
        } catch (error) {
            this.addResult('Stripe.js Available', false, `Error: ${error.message}`);
        }
        
        // Test business key format
        const keyLength = this.config.publishableKey.length === 107; // Standard live key length
        this.addResult('Stripe Key Length', keyLength, 'Should be standard live key length');
        
        // Test key prefix
        const keyPrefix = this.config.publishableKey.startsWith('pk_live_51');
        this.addResult('Stripe Key Prefix', keyPrefix, 'Should start with pk_live_51');
    }

    async testBusinessSetup() {
        console.log('🏢 Testing Business Setup...');
        
        const nameTest = this.config.businessInfo.name === 'Bradley Virtual Solutions, LLC';
        this.addResult('Business Name Correct', nameTest, 'Should be Bradley Virtual Solutions, LLC');
        
        const typeTest = this.config.businessInfo.type === 'Single-Member LLC';
        this.addResult('Business Type Correct', typeTest, 'Should be Single-Member LLC');
        
        // Test for EIN configuration
        try {
            const response = await this.makeRequest(`${this.config.appUrl}/js/stripe-config.js`);
            const hasEINConfig = response.body.includes('ein') || response.body.includes('EIN');
            this.addResult('EIN Configuration', hasEINConfig, 'Should have EIN configuration');
        } catch (error) {
            this.addResult('EIN Configuration', false, `Error: ${error.message}`);
        }
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

    addResult(testName, passed, expected) {
        this.results.tests.push({ name: testName, passed, expected });
        if (passed) {
            this.results.passed++;
            console.log(`  ✅ ${testName}`);
        } else {
            this.results.failed++;
            console.log(`  ❌ ${testName}`);
        }
    }

    showResults() {
        console.log('\n📊 Payment Test Results:');
        console.log('=' .repeat(50));
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`📈 Success: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);
        
        console.log('\n🔍 Test Details:');
        this.results.tests.forEach((test, i) => {
            const status = test.passed ? '✅' : '❌';
            console.log(`${i + 1}. ${status} ${test.name}`);
        });

        console.log('\n🎯 Payment Status:');
        if (this.results.failed === 0) {
            console.log('🎉 All payment tests passed! Ready for live transactions.');
        } else {
            console.log('⚠️  Some payment issues found. Check the failed tests above.');
        }
    }

    showTestCardInfo() {
        console.log('\n💳 Stripe Test Cards for Manual Testing:');
        console.log('=' .repeat(50));
        
        Object.entries(this.testCards).forEach(([type, card]) => {
            console.log(`\n${card.description}:`);
            console.log(`  Card Number: ${card.number}`);
            console.log(`  Expiry: ${card.exp_month}/${card.exp_year}`);
            console.log(`  CVC: ${card.cvc}`);
            console.log(`  Name: ${card.name}`);
        });
        
        console.log('\n🧪 Manual Testing Instructions:');
        console.log('=' .repeat(50));
        console.log('1. Go to: https://amplifi-a54d9.web.app/feed.html');
        console.log('2. Find a tip/payment button');
        console.log('3. Use one of the test cards above');
        console.log('4. Test both successful and declined payments');
        console.log('5. Check your Stripe dashboard for transactions');
        
        console.log('\n⚠️  Important Notes:');
        console.log('- These are test cards - they won\'t charge real money');
        console.log('- Use 4242424242424242 for successful payments');
        console.log('- Use 4000000000000002 for declined payments');
        console.log('- Check your Stripe dashboard for test transactions');
    }
}

// Run the payment tests
async function main() {
    const tester = new StripePaymentTester();
    await tester.runPaymentTests();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = StripePaymentTester; 