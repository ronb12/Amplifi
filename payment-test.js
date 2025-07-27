#!/usr/bin/env node

const https = require('https');
const http = require('http');

class PaymentTester {
    constructor() {
        this.config = {
            publishableKey: 'pk_live_51RpT30LHe1RTUAGqdJuiy1GWpobWJYGHMUBeiORdbz6OUwlqoaunI2cct8p51kGncr12b5X5axqYNzCELk80MijH00P4VABBtD',
            appUrl: 'https://amplifi-a54d9.web.app',
            businessInfo: {
                name: 'Bradley Virtual Solutions, LLC',
                type: 'Single-Member LLC'
            }
        };
        
        this.testCards = {
            visa_success: {
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

    async runTests() {
        console.log('�� Stripe Payment Test Suite\n');
        console.log(`🏢 Business: ${this.config.businessInfo.name}`);
        console.log(`🔑 Key: ${this.config.publishableKey.substring(0, 20)}...`);
        console.log(`🌐 App: ${this.config.appUrl}\n`);

        await this.testConfiguration();
        await this.testEndpoints();
        await this.testIntegration();
        
        this.showResults();
        this.showTestCards();
    }

    async testConfiguration() {
        console.log('🔧 Testing Configuration...');
        
        const keyTest = this.config.publishableKey.startsWith('pk_live_');
        this.addResult('Live Stripe Key', keyTest, 'Should be live key');
        
        const businessTest = this.config.businessInfo.name.includes('LLC');
        this.addResult('Business LLC Setup', businessTest, 'Should be LLC');
        
        try {
            const response = await this.makeRequest(this.config.appUrl);
            const accessible = response.statusCode === 200;
            this.addResult('App Live Status', accessible, 'App accessible');
        } catch (error) {
            this.addResult('App Live Status', false, `Error: ${error.message}`);
        }
    }

    async testEndpoints() {
        console.log('🌐 Testing Endpoints...');
        
        try {
            const response = await this.makeRequest(`${this.config.appUrl}/feed.html`);
            const hasTipModal = response.body.includes('tipModal');
            this.addResult('Tip Modal Present', hasTipModal, 'Has tip modal');
            
            const hasStripeScript = response.body.includes('js.stripe.com/v3/');
            this.addResult('Stripe Script Loaded', hasStripeScript, 'Stripe.js loaded');
            
            const hasPaymentConfig = response.body.includes('stripe-frontend-only.js');
            this.addResult('Payment Config Loaded', hasPaymentConfig, 'Payment config loaded');
        } catch (error) {
            this.addResult('Endpoints', false, `Error: ${error.message}`);
        }
    }

    async testIntegration() {
        console.log('💳 Testing Integration...');
        
        try {
            const response = await this.makeRequest('https://js.stripe.com/v3/');
            const stripeAvailable = response.statusCode === 200;
            this.addResult('Stripe.js Available', stripeAvailable, 'Stripe.js accessible');
        } catch (error) {
            this.addResult('Stripe.js Available', false, `Error: ${error.message}`);
        }
        
        const keyLength = this.config.publishableKey.length === 107;
        this.addResult('Stripe Key Length', keyLength, 'Correct key length');
        
        const keyPrefix = this.config.publishableKey.startsWith('pk_live_51');
        this.addResult('Stripe Key Prefix', keyPrefix, 'Correct key prefix');
    }

    async makeRequest(url) {
        return new Promise((resolve, reject) => {
            const protocol = url.startsWith('https:') ? https : http;
            const req = protocol.get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
            });
            req.on('error', reject);
            req.setTimeout(5000, () => {
                req.destroy();
                reject(new Error('Timeout'));
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
        console.log('\n📊 Test Results:');
        console.log('=' .repeat(40));
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`📈 Success: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);
        
        console.log('\n🔍 Details:');
        this.results.tests.forEach((test, i) => {
            const status = test.passed ? '✅' : '❌';
            console.log(`${i + 1}. ${status} ${test.name}`);
        });

        if (this.results.failed === 0) {
            console.log('\n🎉 All tests passed! Ready for payment testing.');
        } else {
            console.log('\n⚠️  Some issues found. Check failed tests above.');
        }
    }

    showTestCards() {
        console.log('\n💳 Stripe Test Cards for Manual Testing:');
        console.log('=' .repeat(50));
        
        Object.entries(this.testCards).forEach(([type, card]) => {
            console.log(`\n${card.description}:`);
            console.log(`  Card Number: ${card.number}`);
            console.log(`  Expiry: ${card.exp_month}/${card.exp_year}`);
            console.log(`  CVC: ${card.cvc}`);
            console.log(`  Name: ${card.name}`);
        });
        
        console.log('\n🧪 Manual Testing Steps:');
        console.log('=' .repeat(50));
        console.log('1. Go to: https://amplifi-a54d9.web.app/feed.html');
        console.log('2. Find a tip/payment button');
        console.log('3. Use test card: 4242424242424242');
        console.log('4. Expiry: 12/2025, CVC: 123');
        console.log('5. Check Stripe dashboard for test transaction');
        
        console.log('\n⚠️  Test Cards Info:');
        console.log('- 4242424242424242 = Successful payment');
        console.log('- 4000000000000002 = Declined payment');
        console.log('- These cards won\'t charge real money');
        console.log('- Check your Stripe dashboard for test transactions');
    }
}

new PaymentTester().runTests().catch(console.error);
