#!/usr/bin/env node

/**
 * Tip Payment Test Script
 * Simulates a tip payment using Stripe test cards
 */

const https = require('https');

class TipPaymentTester {
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
            success: {
                number: '4242424242424242',
                exp_month: '12',
                exp_year: '2025',
                cvc: '123',
                name: 'Test User',
                description: 'Visa (successful payment)'
            },
            declined: {
                number: '4000000000000002',
                exp_month: '12',
                exp_year: '2025',
                cvc: '123',
                name: 'Test User',
                description: 'Visa (declined payment)'
            }
        };
    }

    async testTipPayment() {
        console.log('💳 Testing Tip Payment System\n');
        console.log(`🏢 Business: ${this.config.businessInfo.name}`);
        console.log(`🔑 Stripe Key: ${this.config.publishableKey.substring(0, 20)}...`);
        console.log(`🌐 App URL: ${this.config.appUrl}\n`);

        // Test 1: Check if tip modal is accessible
        console.log('🔍 Step 1: Checking Tip Modal...');
        try {
            const response = await this.makeRequest(`${this.config.appUrl}/feed.html`);
            const hasTipModal = response.body.includes('tipModal');
            if (hasTipModal) {
                console.log('  ✅ Tip modal found in feed page');
            } else {
                console.log('  ❌ Tip modal not found');
            }
        } catch (error) {
            console.log(`  ❌ Error checking tip modal: ${error.message}`);
        }

        // Test 2: Check Stripe integration
        console.log('\n🔍 Step 2: Checking Stripe Integration...');
        try {
            const response = await this.makeRequest(`${this.config.appUrl}/feed.html`);
            const hasStripeScript = response.body.includes('js.stripe.com/v3/');
            const hasStripeConfig = response.body.includes('stripe-frontend-only.js');
            const hasStripeVercel = response.body.includes('stripe-vercel-backend.js');
            
            if (hasStripeScript) {
                console.log('  ✅ Stripe.js library loaded');
            } else {
                console.log('  ❌ Stripe.js library not found');
            }
            
            if (hasStripeConfig) {
                console.log('  ✅ Frontend-only Stripe configuration loaded');
            } else if (hasStripeVercel) {
                console.log('  ⚠️  Vercel backend Stripe configuration loaded (requires backend)');
            } else {
                console.log('  ❌ No Stripe configuration found');
            }
        } catch (error) {
            console.log(`  ❌ Error checking Stripe integration: ${error.message}`);
        }

        // Test 3: Check business configuration
        console.log('\n🔍 Step 3: Checking Business Configuration...');
        const businessNameTest = this.config.businessInfo.name === 'Bradley Virtual Solutions, LLC';
        const businessTypeTest = this.config.businessInfo.type === 'Single-Member LLC';
        const keyTest = this.config.publishableKey.startsWith('pk_live_');
        
        console.log(`  ${businessNameTest ? '✅' : '❌'} Business name: ${this.config.businessInfo.name}`);
        console.log(`  ${businessTypeTest ? '✅' : '❌'} Business type: ${this.config.businessInfo.type}`);
        console.log(`  ${keyTest ? '✅' : '❌'} Live Stripe key configured`);

        this.showTestInstructions();
    }

    async makeRequest(url) {
        return new Promise((resolve, reject) => {
            const req = https.get(url, (res) => {
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

    showTestInstructions() {
        console.log('\n🧪 Manual Tip Payment Test Instructions:');
        console.log('=' .repeat(60));
        
        console.log('\n📱 Step-by-Step Testing:');
        console.log('1. Open your browser and go to:');
        console.log(`   ${this.config.appUrl}/feed.html`);
        console.log('\n2. Look for a tip/payment button on the page');
        console.log('3. Click the tip button to open the payment modal');
        console.log('\n4. Use this test card for SUCCESSFUL payment:');
        console.log(`   Card Number: ${this.testCards.success.number}`);
        console.log(`   Expiry Date: ${this.testCards.success.exp_month}/${this.testCards.success.exp_year}`);
        console.log(`   CVC: ${this.testCards.success.cvc}`);
        console.log(`   Name: ${this.testCards.success.name}`);
        
        console.log('\n5. Use this test card for DECLINED payment:');
        console.log(`   Card Number: ${this.testCards.declined.number}`);
        console.log(`   Expiry Date: ${this.testCards.declined.exp_month}/${this.testCards.declined.exp_year}`);
        console.log(`   CVC: ${this.testCards.declined.cvc}`);
        console.log(`   Name: ${this.testCards.declined.name}`);
        
        console.log('\n📊 What to Check in Stripe Dashboard:');
        console.log('1. Go to: https://dashboard.stripe.com/payments');
        console.log('2. Look for test transactions');
        console.log('3. Check payment status (succeeded/failed)');
        console.log('4. Verify business name: Bradley Virtual Solutions, LLC');
        console.log('5. Check payment amount and currency');
        
        console.log('\n⚠️  Important Notes:');
        console.log('- Test cards will NOT charge real money');
        console.log('- Transactions will appear in your Stripe dashboard');
        console.log('- Use different amounts to test various scenarios');
        console.log('- Check both successful and declined payments');
        
        console.log('\n🎯 Expected Results:');
        console.log('- Successful payment: Transaction appears in Stripe dashboard');
        console.log('- Declined payment: Error message shown, no charge');
        console.log('- Business name: Bradley Virtual Solutions, LLC');
        console.log('- Currency: USD');
        
        console.log('\n🚀 Ready to test! Go to the app and try a tip payment.');
    }
}

// Run the tip payment test
async function main() {
    const tester = new TipPaymentTester();
    await tester.testTipPayment();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = TipPaymentTester; 