// Stripe Test Runner - Run this in browser console
// Navigate to: https://amplifi-a54d9.web.app/auto-test-stripe.html

console.log('🚀 Stripe Integration Test Runner Loaded');
console.log('📋 Available test functions:');
console.log('  - runStripeServiceTest()');
console.log('  - runTipSystemTest()');
console.log('  - runSubscriptionTest()');
console.log('  - runConnectTest()');
console.log('  - runPayoutTest()');
console.log('  - runAllTests()');

// Test Stripe Service
async function runStripeServiceTest() {
    console.log('\n🧪 Testing Stripe Service...');
    try {
        let serviceAvailable = false;
        let attempts = 0;
        
        while (attempts < 10) {
            if (window.stripeService || window.stripeIntegration) {
                serviceAvailable = true;
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
        
        if (serviceAvailable) {
            console.log('✅ Stripe Service: PASS');
            return true;
        } else {
            console.log('❌ Stripe Service: FAIL - Service not available');
            return false;
        }
    } catch (error) {
        console.log('❌ Stripe Service: ERROR -', error.message);
        return false;
    }
}

// Test Tip System
async function runTipSystemTest() {
    console.log('\n🧪 Testing Tip System...');
    try {
        if (window.stripeService) {
            const result = await window.stripeService.processTip(5.00, 'demo_creator', 'Auto test tip');
            if (result && result.success) {
                console.log('✅ Tip System: PASS');
                return true;
            } else {
                console.log('❌ Tip System: FAIL -', result?.error || 'Unknown error');
                return false;
            }
        } else if (window.stripeIntegration) {
            const result = await window.stripeIntegration.processTip();
            if (result && result.success) {
                console.log('✅ Tip System: PASS');
                return true;
            } else {
                console.log('❌ Tip System: FAIL -', result?.error || 'Unknown error');
                return false;
            }
        } else {
            console.log('❌ Tip System: FAIL - No service available');
            return false;
        }
    } catch (error) {
        console.log('❌ Tip System: ERROR -', error.message);
        return false;
    }
}

// Test Subscription System
async function runSubscriptionTest() {
    console.log('\n🧪 Testing Subscription System...');
    try {
        if (window.stripeService) {
            const result = await window.stripeService.processSubscription('basic', 'demo_creator');
            if (result && result.success) {
                console.log('✅ Subscription System: PASS');
                return true;
            } else {
                console.log('❌ Subscription System: FAIL -', result?.error || 'Unknown error');
                return false;
            }
        } else if (window.stripeIntegration) {
            const result = await window.stripeIntegration.processSubscription('basic');
            if (result && result.success) {
                console.log('✅ Subscription System: PASS');
                return true;
            } else {
                console.log('❌ Subscription System: FAIL -', result?.error || 'Unknown error');
                return false;
            }
        } else {
            console.log('❌ Subscription System: FAIL - No service available');
            return false;
        }
    } catch (error) {
        console.log('❌ Subscription System: ERROR -', error.message);
        return false;
    }
}

// Test Stripe Connect
async function runConnectTest() {
    console.log('\n🧪 Testing Stripe Connect...');
    try {
        if (window.stripeService) {
            const result = await window.stripeService.createStripeConnectAccount('test@example.com', 'US');
            if (result && result.success) {
                console.log('✅ Stripe Connect: PASS');
                return true;
            } else {
                console.log('❌ Stripe Connect: FAIL -', result?.error || 'Unknown error');
                return true;
            }
        } else if (window.stripeIntegration) {
            const result = await window.stripeIntegration.createStripeConnectAccount();
            if (result && result.success) {
                console.log('✅ Stripe Connect: PASS');
                return true;
            } else {
                console.log('❌ Stripe Connect: FAIL -', result?.error || 'Unknown error');
                return false;
            }
        } else {
            console.log('❌ Stripe Connect: FAIL - No service available');
            return false;
        }
    } catch (error) {
        console.log('❌ Stripe Connect: ERROR -', error.message);
        return false;
    }
}

// Test Payout System
async function runPayoutTest() {
    console.log('\n🧪 Testing Payout System...');
    try {
        if (window.stripeService) {
            const result = await window.stripeService.requestPayout(50.00, 'demo_account');
            if (result && result.success) {
                console.log('✅ Payout System: PASS');
                return true;
            } else {
                console.log('❌ Payout System: FAIL -', result?.error || 'Unknown error');
                return false;
            }
        } else if (window.stripeIntegration) {
            const result = await window.stripeIntegration.requestPayout();
            if (result && result.success) {
                console.log('✅ Payout System: PASS');
                return true;
            } else {
                console.log('❌ Payout System: FAIL -', result?.error || 'Unknown error');
                return false;
            }
        } else {
            console.log('❌ Payout System: FAIL - No service available');
            return false;
        }
    } catch (error) {
        console.log('❌ Payout System: ERROR -', error.message);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('\n🚀 RUNNING ALL STRIPE TESTS...\n');
    
    const results = [];
    
    results.push(await runStripeServiceTest());
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    results.push(await runTipSystemTest());
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    results.push(await runSubscriptionTest());
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    results.push(await runConnectTest());
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    results.push(await runPayoutTest());
    
    // Final Results
    const passedTests = results.filter(Boolean).length;
    const totalTests = results.length;
    
    console.log('\n📊 FINAL TEST RESULTS:');
    console.log('======================');
    console.log(`🎯 Tests Passed: ${passedTests}/${totalTests}`);
    
    if (passedTests === totalTests) {
        console.log('🏆 SUCCESS: All Stripe tests passed!');
        console.log('🚀 Stripe integration is fully functional!');
    } else {
        console.log('⚠️  WARNING: Some tests failed');
        console.log('🔧 Check the individual test results above');
    }
    
    return results;
}

console.log('\n💡 To run tests, use: runAllTests()');
