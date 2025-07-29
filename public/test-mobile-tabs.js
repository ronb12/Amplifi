// Test script to verify mobile tab navigation in messages.html
console.log('🧪 TESTING MOBILE TAB NAVIGATION IN MESSAGES.HTML');

// Test 1: Check if mobile tab navigation exists
function testMobileTabNavigationExists() {
    console.log('✅ Test 1: Mobile Tab Navigation Existence');
    const mobileNav = document.querySelector('.mobile-tab-nav');
    if (mobileNav) {
        console.log('✅ Mobile tab navigation found');
        console.log('✅ Mobile nav classes:', mobileNav.className);
        return true;
    } else {
        console.log('❌ Mobile tab navigation not found');
        return false;
    }
}

// Test 2: Check mobile tab navigation structure
function testMobileTabStructure() {
    console.log('✅ Test 2: Mobile Tab Structure');
    const mobileNav = document.querySelector('.mobile-tab-nav');
    if (!mobileNav) return false;
    
    const tabItems = mobileNav.querySelectorAll('.tab-item');
    console.log(`✅ Found ${tabItems.length} tab items`);
    
    const expectedTabs = ['Home', 'Search', 'Create', 'Messages', 'Dashboard', 'Live', 'Music'];
    let allTabsPresent = true;
    
    tabItems.forEach((tab, index) => {
        const label = tab.querySelector('.tab-label');
        const icon = tab.querySelector('.tab-icon');
        
        if (label && icon) {
            console.log(`✅ Tab ${index + 1}: ${label.textContent} ${icon.textContent}`);
        } else {
            console.log(`❌ Tab ${index + 1}: Missing label or icon`);
            allTabsPresent = false;
        }
    });
    
    return allTabsPresent;
}

// Test 3: Check if Messages tab is active
function testMessagesTabActive() {
    console.log('✅ Test 3: Messages Tab Active State');
    const messagesTab = document.querySelector('.mobile-tab-nav .tab-item[href="messages.html"]');
    if (messagesTab) {
        const isActive = messagesTab.classList.contains('active');
        console.log(`✅ Messages tab found, active: ${isActive}`);
        return isActive;
    } else {
        console.log('❌ Messages tab not found');
        return false;
    }
}

// Test 4: Check responsive behavior
function testResponsiveBehavior() {
    console.log('✅ Test 4: Responsive Behavior');
    const mobileNav = document.querySelector('.mobile-tab-nav');
    if (!mobileNav) return false;
    
    const computedStyle = window.getComputedStyle(mobileNav);
    const display = computedStyle.display;
    const visibility = computedStyle.visibility;
    const position = computedStyle.position;
    
    console.log(`✅ Mobile nav display: ${display}`);
    console.log(`✅ Mobile nav visibility: ${visibility}`);
    console.log(`✅ Mobile nav position: ${position}`);
    
    // Check if it's properly hidden on desktop
    const isDesktop = window.innerWidth >= 769;
    if (isDesktop) {
        const shouldBeHidden = display === 'none' || visibility === 'hidden';
        console.log(`✅ Desktop view (${window.innerWidth}px): Should be hidden - ${shouldBeHidden}`);
        return shouldBeHidden;
    } else {
        const shouldBeVisible = display === 'flex' && visibility === 'visible';
        console.log(`✅ Mobile view (${window.innerWidth}px): Should be visible - ${shouldBeVisible}`);
        return shouldBeVisible;
    }
}

// Test 5: Check tab functionality
function testTabFunctionality() {
    console.log('✅ Test 5: Tab Functionality');
    const tabItems = document.querySelectorAll('.mobile-tab-nav .tab-item');
    let allTabsFunctional = true;
    
    tabItems.forEach((tab, index) => {
        const href = tab.getAttribute('href');
        if (href) {
            console.log(`✅ Tab ${index + 1}: ${href} - Functional`);
        } else {
            console.log(`❌ Tab ${index + 1}: Missing href`);
            allTabsFunctional = false;
        }
    });
    
    return allTabsFunctional;
}

// Test 6: Check CSS positioning
function testCSSPositioning() {
    console.log('✅ Test 6: CSS Positioning');
    const mobileNav = document.querySelector('.mobile-tab-nav');
    if (!mobileNav) return false;
    
    const computedStyle = window.getComputedStyle(mobileNav);
    const bottom = computedStyle.bottom;
    const left = computedStyle.left;
    const right = computedStyle.right;
    const zIndex = computedStyle.zIndex;
    
    console.log(`✅ Bottom: ${bottom}`);
    console.log(`✅ Left: ${left}`);
    console.log(`✅ Right: ${right}`);
    console.log(`✅ Z-index: ${zIndex}`);
    
    // Check if positioned correctly for mobile
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        const isFixed = position === 'fixed' && bottom === '0px';
        console.log(`✅ Mobile positioning correct: ${isFixed}`);
        return isFixed;
    }
    
    return true;
}

// Run all tests
function runMobileTabTests() {
    console.log('🚀 STARTING MOBILE TAB NAVIGATION TESTS');
    console.log('=' .repeat(50));
    
    const tests = [
        testMobileTabNavigationExists,
        testMobileTabStructure,
        testMessagesTabActive,
        testResponsiveBehavior,
        testTabFunctionality,
        testCSSPositioning
    ];
    
    let passedTests = 0;
    let totalTests = tests.length;
    
    tests.forEach((test, index) => {
        try {
            const result = test();
            if (result !== false) {
                passedTests++;
            }
        } catch (error) {
            console.log(`❌ Test ${index + 1} failed with error:`, error);
        }
        console.log('-' .repeat(30));
    });
    
    console.log('=' .repeat(50));
    console.log(`📊 TEST RESULTS: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 ALL MOBILE TAB TESTS PASSED! Mobile tab navigation is working correctly.');
    } else {
        console.log('⚠️ Some mobile tab tests failed. Please check the issues above.');
    }
}

// Run tests after page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runMobileTabTests);
} else {
    runMobileTabTests();
} 