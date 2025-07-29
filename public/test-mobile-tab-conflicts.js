// Test Mobile Tab Navigation Conflicts for messages.html
console.log('🔍 TESTING MOBILE TAB NAVIGATION CONFLICTS');

// Test 1: Check if mobile tabs exist
function testMobileTabExistence() {
    console.log('\n📱 Test 1: Mobile Tab Existence');
    const mobileNav = document.querySelector('.mobile-tab-nav');
    if (mobileNav) {
        console.log('✅ Mobile tab navigation found');
        console.log('📊 Mobile nav structure:', mobileNav.outerHTML);
    } else {
        console.log('❌ Mobile tab navigation NOT found');
    }
}

// Test 2: Check CSS conflicts
function testCSSConflicts() {
    console.log('\n🎨 Test 2: CSS Conflicts');
    
    const mobileNav = document.querySelector('.mobile-tab-nav');
    if (!mobileNav) return;
    
    const computedStyle = window.getComputedStyle(mobileNav);
    console.log('📊 Mobile nav computed styles:');
    console.log('- display:', computedStyle.display);
    console.log('- visibility:', computedStyle.visibility);
    console.log('- opacity:', computedStyle.opacity);
    console.log('- position:', computedStyle.position);
    console.log('- z-index:', computedStyle.zIndex);
    
    // Check if it's hidden on desktop
    if (window.innerWidth >= 769) {
        if (computedStyle.display === 'none') {
            console.log('✅ Correctly hidden on desktop');
        } else {
            console.log('❌ Should be hidden on desktop but is visible');
        }
    } else {
        if (computedStyle.display === 'flex') {
            console.log('✅ Correctly shown on mobile');
        } else {
            console.log('❌ Should be shown on mobile but is hidden');
        }
    }
}

// Test 3: Check for conflicting CSS rules
function testConflictingRules() {
    console.log('\n⚡ Test 3: Conflicting CSS Rules');
    
    const styleSheets = Array.from(document.styleSheets);
    let conflictCount = 0;
    
    styleSheets.forEach((sheet, index) => {
        try {
            const rules = Array.from(sheet.cssRules || sheet.rules || []);
            rules.forEach(rule => {
                if (rule.selectorText && rule.selectorText.includes('.mobile-tab-nav')) {
                    console.log(`📄 Sheet ${index}: ${rule.selectorText} { ${rule.style.cssText} }`);
                    conflictCount++;
                }
            });
        } catch (e) {
            // Cross-origin stylesheets can't be accessed
        }
    });
    
    console.log(`📊 Found ${conflictCount} mobile-tab-nav CSS rules`);
}

// Test 4: Check responsive behavior
function testResponsiveBehavior() {
    console.log('\n📱 Test 4: Responsive Behavior');
    
    const mobileNav = document.querySelector('.mobile-tab-nav');
    if (!mobileNav) return;
    
    // Simulate mobile view
    const originalWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
    });
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
    
    setTimeout(() => {
        const mobileStyle = window.getComputedStyle(mobileNav);
        console.log('📱 Mobile view (375px):');
        console.log('- display:', mobileStyle.display);
        console.log('- visibility:', mobileStyle.visibility);
        
        // Reset to desktop
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024
        });
        
        window.dispatchEvent(new Event('resize'));
        
        setTimeout(() => {
            const desktopStyle = window.getComputedStyle(mobileNav);
            console.log('🖥️ Desktop view (1024px):');
            console.log('- display:', desktopStyle.display);
            console.log('- visibility:', desktopStyle.visibility);
            
            // Restore original width
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: originalWidth
            });
        }, 100);
    }, 100);
}

// Test 5: Check tab functionality
function testTabFunctionality() {
    console.log('\n🔗 Test 5: Tab Functionality');
    
    const tabItems = document.querySelectorAll('.mobile-tab-nav .tab-item');
    console.log(`📊 Found ${tabItems.length} tab items`);
    
    tabItems.forEach((tab, index) => {
        const href = tab.getAttribute('href');
        const isActive = tab.classList.contains('active');
        const icon = tab.querySelector('.tab-icon')?.textContent;
        const label = tab.querySelector('.tab-label')?.textContent;
        
        console.log(`Tab ${index + 1}: ${label} (${href}) - Active: ${isActive} - Icon: ${icon}`);
    });
}

// Test 6: Check for JavaScript conflicts
function testJavaScriptConflicts() {
    console.log('\n⚙️ Test 6: JavaScript Conflicts');
    
    // Check if messagesApp exists
    if (typeof messagesApp !== 'undefined') {
        console.log('✅ messagesApp is defined');
        
        // Check if it has mobile navigation methods
        if (typeof messagesApp.updateConversationUI === 'function') {
            console.log('✅ updateConversationUI method exists');
        } else {
            console.log('❌ updateConversationUI method missing');
        }
    } else {
        console.log('❌ messagesApp is not defined');
    }
    
    // Check for global mobile nav functions
    const globalFunctions = ['fixMobileNavigation', 'applyAllFixes'];
    globalFunctions.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            console.log(`✅ ${funcName} function exists`);
        } else {
            console.log(`❌ ${funcName} function missing`);
        }
    });
}

// Test 7: Check viewport and device detection
function testViewportDetection() {
    console.log('\n📐 Test 7: Viewport Detection');
    
    console.log('📊 Current viewport:');
    console.log('- innerWidth:', window.innerWidth);
    console.log('- innerHeight:', window.innerHeight);
    console.log('- devicePixelRatio:', window.devicePixelRatio);
    console.log('- userAgent:', navigator.userAgent);
    
    // Check if mobile detection is working
    const isMobile = window.innerWidth <= 768;
    console.log(`📱 Mobile detection: ${isMobile ? 'Mobile' : 'Desktop'}`);
}

// Test 8: Check for overlapping elements
function testOverlappingElements() {
    console.log('\n🔍 Test 8: Overlapping Elements');
    
    const mobileNav = document.querySelector('.mobile-tab-nav');
    if (!mobileNav) return;
    
    const navRect = mobileNav.getBoundingClientRect();
    console.log('📊 Mobile nav position:');
    console.log('- top:', navRect.top);
    console.log('- bottom:', navRect.bottom);
    console.log('- left:', navRect.left);
    console.log('- right:', navRect.right);
    
    // Check if it overlaps with other elements
    const messagesMain = document.querySelector('.messages-main');
    if (messagesMain) {
        const mainRect = messagesMain.getBoundingClientRect();
        console.log('📊 Messages main position:');
        console.log('- bottom:', mainRect.bottom);
        
        if (navRect.top < mainRect.bottom) {
            console.log('⚠️ Potential overlap detected');
        } else {
            console.log('✅ No overlap detected');
        }
    }
}

// Run all tests
function runAllTests() {
    console.log('🚀 STARTING MOBILE TAB CONFLICT TESTS');
    console.log('=' .repeat(50));
    
    testMobileTabExistence();
    testCSSConflicts();
    testConflictingRules();
    testResponsiveBehavior();
    testTabFunctionality();
    testJavaScriptConflicts();
    testViewportDetection();
    testOverlappingElements();
    
    console.log('\n✅ MOBILE TAB CONFLICT TESTS COMPLETE');
}

// Auto-run tests when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
} else {
    runAllTests();
}

// Export for manual testing
window.testMobileTabConflicts = {
    testMobileTabExistence,
    testCSSConflicts,
    testConflictingRules,
    testResponsiveBehavior,
    testTabFunctionality,
    testJavaScriptConflicts,
    testViewportDetection,
    testOverlappingElements,
    runAllTests
}; 