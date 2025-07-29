// Test for Duplicate Mobile Navigation Elements
console.log('🔍 TESTING FOR DUPLICATE MOBILE NAVIGATION');

// Test 1: Count mobile navigation elements
function testDuplicateMobileNav() {
    console.log('\n📱 Test 1: Duplicate Mobile Navigation Detection');
    
    const mobileNavs = document.querySelectorAll('.mobile-tab-nav');
    console.log(`📊 Found ${mobileNavs.length} mobile navigation elements`);
    
    if (mobileNavs.length > 1) {
        console.log('❌ DUPLICATE MOBILE NAVIGATION DETECTED!');
        console.log('🔍 Analyzing duplicates...');
        
        mobileNavs.forEach((nav, index) => {
            console.log(`\n📄 Mobile Nav ${index + 1}:`);
            console.log('- HTML:', nav.outerHTML);
            console.log('- Parent:', nav.parentElement.tagName);
            console.log('- Position:', nav.getBoundingClientRect());
        });
        
        // Check if they're identical
        const nav1 = mobileNavs[0];
        const nav2 = mobileNavs[1];
        
        if (nav1.innerHTML === nav2.innerHTML) {
            console.log('⚠️ Duplicate navigation elements have identical content');
        } else {
            console.log('⚠️ Duplicate navigation elements have different content');
        }
        
        return true; // Duplicates found
    } else if (mobileNavs.length === 1) {
        console.log('✅ Only one mobile navigation element found');
        return false; // No duplicates
    } else {
        console.log('❌ No mobile navigation elements found');
        return false; // No navigation
    }
}

// Test 2: Check for dynamic creation
function testDynamicCreation() {
    console.log('\n⚡ Test 2: Dynamic Creation Detection');
    
    // Check if any scripts are creating mobile navigation
    const scripts = document.querySelectorAll('script[src*="comprehensive-fixes.js"], script[src*="app.js"], script[src*="messages-new.js"]');
    console.log(`📊 Found ${scripts.length} relevant scripts loaded`);
    
    scripts.forEach((script, index) => {
        console.log(`Script ${index + 1}: ${script.src}`);
    });
    
    // Check for any functions that might create mobile nav
    const globalFunctions = ['fixMobileNavigation', 'applyAllFixes', 'updateConversationUI'];
    globalFunctions.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            console.log(`✅ ${funcName} function exists`);
        } else {
            console.log(`❌ ${funcName} function missing`);
        }
    });
}

// Test 3: Check for conflicting CSS
function testConflictingCSS() {
    console.log('\n🎨 Test 3: Conflicting CSS Detection');
    
    const mobileNavs = document.querySelectorAll('.mobile-tab-nav');
    
    mobileNavs.forEach((nav, index) => {
        const computedStyle = window.getComputedStyle(nav);
        console.log(`\n📊 Mobile Nav ${index + 1} computed styles:`);
        console.log('- display:', computedStyle.display);
        console.log('- visibility:', computedStyle.visibility);
        console.log('- opacity:', computedStyle.opacity);
        console.log('- position:', computedStyle.position);
        console.log('- z-index:', computedStyle.zIndex);
    });
}

// Test 4: Check for JavaScript conflicts
function testJavaScriptConflicts() {
    console.log('\n⚙️ Test 4: JavaScript Conflicts Detection');
    
    // Check if multiple event listeners are attached
    const mobileNavs = document.querySelectorAll('.mobile-tab-nav');
    
    mobileNavs.forEach((nav, index) => {
        console.log(`\n📊 Mobile Nav ${index + 1} event listeners:`);
        
        // Check for onclick attributes
        const tabItems = nav.querySelectorAll('.tab-item');
        tabItems.forEach((tab, tabIndex) => {
            if (tab.onclick) {
                console.log(`- Tab ${tabIndex + 1} has onclick handler`);
            }
        });
    });
}

// Test 5: Check for timing issues
function testTimingIssues() {
    console.log('\n⏰ Test 5: Timing Issues Detection');
    
    console.log('📊 Current page load state:', document.readyState);
    console.log('📊 DOM Content Loaded fired:', document.readyState !== 'loading');
    
    // Check if scripts are loaded in correct order
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const relevantScripts = scripts.filter(script => 
        script.src.includes('comprehensive-fixes.js') || 
        script.src.includes('messages-new.js') || 
        script.src.includes('app.js')
    );
    
    console.log('📊 Script loading order:');
    relevantScripts.forEach((script, index) => {
        console.log(`${index + 1}. ${script.src.split('/').pop()}`);
    });
}

// Test 6: Check for DOM manipulation
function testDOMManipulation() {
    console.log('\n🔧 Test 6: DOM Manipulation Detection');
    
    // Check if any elements are being manipulated
    const mobileNavs = document.querySelectorAll('.mobile-tab-nav');
    
    mobileNavs.forEach((nav, index) => {
        console.log(`\n📊 Mobile Nav ${index + 1} DOM state:`);
        console.log('- outerHTML length:', nav.outerHTML.length);
        console.log('- childNodes count:', nav.childNodes.length);
        console.log('- children count:', nav.children.length);
        
        // Check for any data attributes that might indicate manipulation
        const dataAttrs = Array.from(nav.attributes).filter(attr => attr.name.startsWith('data-'));
        if (dataAttrs.length > 0) {
            console.log('- Data attributes:', dataAttrs.map(attr => `${attr.name}="${attr.value}"`));
        }
    });
}

// Run all tests
function runDuplicateTests() {
    console.log('🚀 STARTING DUPLICATE MOBILE NAVIGATION TESTS');
    console.log('=' .repeat(50));
    
    const hasDuplicates = testDuplicateMobileNav();
    testDynamicCreation();
    testConflictingCSS();
    testJavaScriptConflicts();
    testTimingIssues();
    testDOMManipulation();
    
    if (hasDuplicates) {
        console.log('\n❌ DUPLICATE MOBILE NAVIGATION CONFIRMED!');
        console.log('🔧 RECOMMENDATION: Remove duplicate elements or fix script conflicts');
    } else {
        console.log('\n✅ NO DUPLICATE MOBILE NAVIGATION DETECTED');
    }
    
    console.log('\n✅ DUPLICATE MOBILE NAVIGATION TESTS COMPLETE');
}

// Auto-run tests when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runDuplicateTests);
} else {
    runDuplicateTests();
}

// Export for manual testing
window.testDuplicateMobileNav = {
    testDuplicateMobileNav,
    testDynamicCreation,
    testConflictingCSS,
    testJavaScriptConflicts,
    testTimingIssues,
    testDOMManipulation,
    runDuplicateTests
}; 