// Test Mobile Tab Navigation Functionality
console.log('🔍 TESTING MOBILE TAB NAVIGATION FUNCTIONALITY');

// Test 1: Check mobile tab visibility based on screen size
function testMobileTabVisibility() {
    console.log('\n📱 Test 1: Mobile Tab Visibility');
    
    const mobileNav = document.querySelector('.mobile-tab-nav');
    if (!mobileNav) {
        console.log('❌ Mobile tab navigation not found');
        return;
    }
    
    const computedStyle = window.getComputedStyle(mobileNav);
    const currentWidth = window.innerWidth;
    
    console.log(`📊 Current screen width: ${currentWidth}px`);
    console.log(`📊 Mobile nav display: ${computedStyle.display}`);
    console.log(`📊 Mobile nav visibility: ${computedStyle.visibility}`);
    console.log(`📊 Mobile nav opacity: ${computedStyle.opacity}`);
    
    if (currentWidth >= 769) {
        // Desktop view
        if (computedStyle.display === 'none') {
            console.log('✅ Correctly hidden on desktop');
        } else {
            console.log('❌ Should be hidden on desktop but is visible');
        }
    } else {
        // Mobile view
        if (computedStyle.display === 'flex') {
            console.log('✅ Correctly shown on mobile');
        } else {
            console.log('❌ Should be shown on mobile but is hidden');
        }
    }
}

// Test 2: Check mobile tab structure
function testMobileTabStructure() {
    console.log('\n🏗️ Test 2: Mobile Tab Structure');
    
    const mobileNav = document.querySelector('.mobile-tab-nav');
    if (!mobileNav) {
        console.log('❌ Mobile tab navigation not found');
        return;
    }
    
    const tabItems = mobileNav.querySelectorAll('.tab-item');
    console.log(`📊 Found ${tabItems.length} tab items`);
    
    tabItems.forEach((tab, index) => {
        const href = tab.getAttribute('href');
        const isActive = tab.classList.contains('active');
        const icon = tab.querySelector('.tab-icon')?.textContent;
        const label = tab.querySelector('.tab-label')?.textContent;
        
        console.log(`Tab ${index + 1}: ${label} (${href}) - Active: ${isActive} - Icon: ${icon}`);
    });
}

// Test 3: Check mobile tab functionality
function testMobileTabFunctionality() {
    console.log('\n🔗 Test 3: Mobile Tab Functionality');
    
    const mobileNav = document.querySelector('.mobile-tab-nav');
    if (!mobileNav) {
        console.log('❌ Mobile tab navigation not found');
        return;
    }
    
    const tabItems = mobileNav.querySelectorAll('.tab-item');
    
    // Check if all tabs have proper href attributes
    let validTabs = 0;
    tabItems.forEach(tab => {
        const href = tab.getAttribute('href');
        if (href && href !== '#') {
            validTabs++;
        }
    });
    
    console.log(`📊 Valid tabs with href: ${validTabs}/${tabItems.length}`);
    
    // Check if current page tab is active
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const activeTab = mobileNav.querySelector('.tab-item.active');
    
    if (activeTab) {
        const activeHref = activeTab.getAttribute('href');
        console.log(`📊 Active tab: ${activeHref}`);
        console.log(`📊 Current page: ${currentPage}`);
        
        if (activeHref === currentPage) {
            console.log('✅ Active tab matches current page');
        } else {
            console.log('❌ Active tab does not match current page');
        }
    } else {
        console.log('❌ No active tab found');
    }
}

// Test 4: Check mobile tab styling
function testMobileTabStyling() {
    console.log('\n🎨 Test 4: Mobile Tab Styling');
    
    const mobileNav = document.querySelector('.mobile-tab-nav');
    if (!mobileNav) {
        console.log('❌ Mobile tab navigation not found');
        return;
    }
    
    const computedStyle = window.getComputedStyle(mobileNav);
    
    console.log('📊 Mobile nav computed styles:');
    console.log('- position:', computedStyle.position);
    console.log('- bottom:', computedStyle.bottom);
    console.log('- left:', computedStyle.left);
    console.log('- right:', computedStyle.right);
    console.log('- z-index:', computedStyle.zIndex);
    console.log('- background:', computedStyle.background);
    console.log('- border-top:', computedStyle.borderTop);
    
    // Check if it's positioned correctly for mobile
    if (window.innerWidth <= 768) {
        if (computedStyle.position === 'fixed' && computedStyle.bottom === '0px') {
            console.log('✅ Correctly positioned for mobile');
        } else {
            console.log('❌ Not correctly positioned for mobile');
        }
    }
}

// Test 5: Check for any conflicts
function testMobileTabConflicts() {
    console.log('\n⚡ Test 5: Mobile Tab Conflicts');
    
    // Check for multiple mobile nav elements
    const mobileNavs = document.querySelectorAll('.mobile-tab-nav');
    if (mobileNavs.length > 1) {
        console.log(`❌ Found ${mobileNavs.length} mobile nav elements (should be 1)`);
    } else if (mobileNavs.length === 1) {
        console.log('✅ Found exactly 1 mobile nav element');
    } else {
        console.log('❌ No mobile nav elements found');
    }
    
    // Check for conflicting CSS rules
    const styleSheets = Array.from(document.styleSheets);
    let mobileNavRules = 0;
    
    styleSheets.forEach((sheet, index) => {
        try {
            const rules = Array.from(sheet.cssRules || sheet.rules || []);
            rules.forEach(rule => {
                if (rule.selectorText && rule.selectorText.includes('.mobile-tab-nav')) {
                    mobileNavRules++;
                }
            });
        } catch (e) {
            // Cross-origin stylesheets can't be accessed
        }
    });
    
    console.log(`📊 Found ${mobileNavRules} CSS rules for mobile-tab-nav`);
}

// Run all tests
function runMobileTabTests() {
    console.log('🚀 STARTING MOBILE TAB FUNCTIONALITY TESTS');
    console.log('=' .repeat(50));
    
    testMobileTabVisibility();
    testMobileTabStructure();
    testMobileTabFunctionality();
    testMobileTabStyling();
    testMobileTabConflicts();
    
    console.log('\n✅ MOBILE TAB FUNCTIONALITY TESTS COMPLETE');
}

// Auto-run tests when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runMobileTabTests);
} else {
    runMobileTabTests();
}

// Export for manual testing
window.testMobileTabFunctionality = {
    testMobileTabVisibility,
    testMobileTabStructure,
    testMobileTabFunctionality,
    testMobileTabStyling,
    testMobileTabConflicts,
    runMobileTabTests
}; 