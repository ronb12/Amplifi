// Automated Stripe Test Runner
// This script tests all Stripe functionality

const puppeteer = require('puppeteer');

async function runStripeTests() {
    console.log('🚀 Starting automated Stripe integration tests...\n');
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        // Navigate to the test page
        console.log('📱 Loading test page...');
        await page.goto('https://amplifi-a54d9.web.app/auto-test-stripe.html', { waitUntil: 'networkidle0' });
        
        // Wait for Stripe services to load
        console.log('⏳ Waiting for Stripe services...');
        await page.waitForTimeout(3000);
        
        // Run automated test
        console.log('🧪 Executing automated tests...');
        await page.evaluate(() => {
            return new Promise((resolve) => {
                // Override logTest to capture results
                window.testResults = [];
                window.originalLogTest = window.logTest;
                window.logTest = function(message, type) {
                    window.testResults.push({ message, type, timestamp: new Date().toISOString() });
                    window.originalLogTest(message, type);
                };
                
                // Run the test
                window.runAutomatedTest();
                
                // Wait for tests to complete
                setTimeout(() => resolve(window.testResults), 10000);
            });
        });
        
        // Get test results
        const results = await page.evaluate(() => {
            return window.testResults;
        });
        
        // Analyze results
        console.log('\n📊 TEST RESULTS:');
        console.log('================');
        
        let passedTests = 0;
        let totalTests = 0;
        
        results.forEach(result => {
            if (result.message.includes('Test 1:') || result.message.includes('Test 2:') || 
                result.message.includes('Test 3:') || result.message.includes('Test 4:') || 
                result.message.includes('Test 5:')) {
                totalTests++;
                if (result.message.includes('PASS')) {
                    passedTests++;
                }
            }
            
            if (result.message.includes('FINAL RESULTS:')) {
                console.log(`\n${result.message}`);
            } else if (result.message.includes('ALL TESTS PASSED')) {
                console.log(`\n🏆 ${result.message}`);
            } else if (result.message.includes('Some tests failed')) {
                console.log(`\n⚠️  ${result.message}`);
            }
        });
        
        console.log(`\n🎯 Summary: ${passedTests}/${totalTests} tests passed`);
        
        if (passedTests === totalTests) {
            console.log('✅ SUCCESS: All Stripe transactions are working correctly!');
        } else {
            console.log('❌ FAILURE: Some Stripe functionality is not working properly.');
        }
        
    } catch (error) {
        console.error('❌ Test execution failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Run tests if this script is executed directly
if (require.main === module) {
    runStripeTests().catch(console.error);
}

module.exports = { runStripeTests };
