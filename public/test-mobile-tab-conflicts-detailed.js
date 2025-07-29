// Comprehensive Mobile Tab Navigation Conflict Detection
// Tests for conflicts between messages.html, messages-new.css, and messages-new.js

console.log('🔍 STARTING COMPREHENSIVE MOBILE TAB CONFLICT DETECTION...');

// 1. Check HTML Structure
function checkHTMLStructure() {
    console.log('\n📋 1. CHECKING HTML STRUCTURE...');
    
    const mobileNav = document.querySelector('.mobile-tab-nav');
    if (!mobileNav) {
        console.error('❌ No mobile-tab-nav found in HTML');
        return false;
    }
    
    console.log('✅ Mobile tab navigation found in HTML');
    
    // Check for duplicate mobile navs
    const mobileNavs = document.querySelectorAll('.mobile-tab-nav');
    if (mobileNavs.length > 1) {
        console.error(`❌ Found ${mobileNavs.length} mobile tab navigations - DUPLICATE DETECTED!`);
        return false;
    }
    
    console.log('✅ Only one mobile tab navigation found');
    
    // Check tab structure
    const tabItems = mobileNav.querySelectorAll('.tab-item');
    console.log(`📊 Found ${tabItems.length} tab items`);
    
    if (tabItems.length !== 8) {
        console.error(`❌ Expected 8 tabs, found ${tabItems.length} - STRUCTURE MISMATCH!`);
        return false;
    }
    
    console.log('✅ Correct number of tabs (8) found');
    
    // Check for active state
    const activeTab = mobileNav.querySelector('.tab-item.active');
    if (!activeTab) {
        console.warn('⚠️ No active tab found');
    } else {
        console.log('✅ Active tab found:', activeTab.getAttribute('href'));
    }
    
    return true;
}

// 2. Check CSS Conflicts
function checkCSSConflicts() {
    console.log('\n🎨 2. CHECKING CSS CONFLICTS...');
    
    const styles = document.styleSheets;
    let mobileTabRules = [];
    let conflictCount = 0;
    
    // Collect all mobile-tab-nav rules
    for (let sheet of styles) {
        try {
            const rules = sheet.cssRules || sheet.rules;
            for (let rule of rules) {
                if (rule.selectorText && rule.selectorText.includes('.mobile-tab-nav')) {
                    mobileTabRules.push({
                        source: sheet.href || 'inline',
                        selector: rule.selectorText,
                        cssText: rule.cssText
                    });
                }
            }
        } catch (e) {
            // Cross-origin stylesheets will throw errors
        }
    }
    
    console.log(`📊 Found ${mobileTabRules.length} mobile-tab-nav CSS rules`);
    
    // Check for conflicting display properties
    const displayRules = mobileTabRules.filter(rule => 
        rule.cssText.includes('display:') || rule.cssText.includes('display :')
    );
    
    console.log(`📊 Found ${displayRules.length} display rules`);
    
    // Check for conflicting visibility properties
    const visibilityRules = mobileTabRules.filter(rule => 
        rule.cssText.includes('visibility:') || rule.cssText.includes('visibility :')
    );
    
    console.log(`📊 Found ${visibilityRules.length} visibility rules`);
    
    // Check for conflicting z-index properties
    const zIndexRules = mobileTabRules.filter(rule => 
        rule.cssText.includes('z-index:') || rule.cssText.includes('z-index :')
    );
    
    console.log(`📊 Found ${zIndexRules.length} z-index rules`);
    
    // Check for media query conflicts
    const mediaQueryRules = mobileTabRules.filter(rule => 
        rule.cssText.includes('@media')
    );
    
    console.log(`📊 Found ${mediaQueryRules.length} media query rules`);
    
    // Check for !important conflicts
    const importantRules = mobileTabRules.filter(rule => 
        rule.cssText.includes('!important')
    );
    
    console.log(`📊 Found ${importantRules.length} !important rules`);
    
    if (importantRules.length > 0) {
        console.warn('⚠️ Found !important rules - potential conflicts detected');
        importantRules.forEach(rule => {
            console.log(`   - ${rule.selector} from ${rule.source}`);
        });
    }
    
    return mobileTabRules.length;
}

// 3. Check JavaScript Conflicts
function checkJavaScriptConflicts() {
    console.log('\n⚙️ 3. CHECKING JAVASCRIPT CONFLICTS...');
    
    // Check if comprehensive-fixes.js is loaded
    const comprehensiveFixesLoaded = typeof window.fixesApplied !== 'undefined';
    console.log(`📊 Comprehensive fixes loaded: ${comprehensiveFixesLoaded}`);
    
    // Check if mobileNavFixed flag exists
    const mobileNavFixed = typeof window.mobileNavFixed !== 'undefined';
    console.log(`📊 Mobile nav fixed flag: ${mobileNavFixed}`);
    
    // Check for multiple event listeners
    const resizeListeners = [];
    const clickListeners = [];
    
    // Check if messagesApp exists
    const messagesAppExists = typeof window.messagesApp !== 'undefined';
    console.log(`📊 MessagesApp exists: ${messagesAppExists}`);
    
    if (messagesAppExists) {
        console.log('✅ MessagesApp is properly initialized');
    } else {
        console.error('❌ MessagesApp not found - potential initialization issue');
    }
    
    return {
        comprehensiveFixesLoaded,
        mobileNavFixed,
        messagesAppExists
    };
}

// 4. Check Responsive Behavior
function checkResponsiveBehavior() {
    console.log('\n📱 4. CHECKING RESPONSIVE BEHAVIOR...');
    
    const mobileNav = document.querySelector('.mobile-tab-nav');
    if (!mobileNav) return false;
    
    const currentWidth = window.innerWidth;
    const isMobile = currentWidth <= 768;
    const isDesktop = currentWidth > 768;
    
    console.log(`📊 Current viewport width: ${currentWidth}px`);
    console.log(`📊 Mobile view (≤768px): ${isMobile}`);
    console.log(`📊 Desktop view (>768px): ${isDesktop}`);
    
    const computedStyle = window.getComputedStyle(mobileNav);
    const display = computedStyle.display;
    const visibility = computedStyle.visibility;
    const opacity = computedStyle.opacity;
    
    console.log(`📊 Current display: ${display}`);
    console.log(`📊 Current visibility: ${visibility}`);
    console.log(`📊 Current opacity: ${opacity}`);
    
    // Check if behavior matches expectations
    if (isMobile && display === 'none') {
        console.error('❌ Mobile nav should be visible on mobile but is hidden');
        return false;
    }
    
    if (isDesktop && display !== 'none') {
        console.error('❌ Mobile nav should be hidden on desktop but is visible');
        return false;
    }
    
    console.log('✅ Responsive behavior is correct');
    return true;
}

// 5. Check for Specific Conflicts
function checkSpecificConflicts() {
    console.log('\n🔍 5. CHECKING SPECIFIC CONFLICTS...');
    
    let conflicts = [];
    
    // Check for conflicting CSS files
    const cssFiles = Array.from(document.styleSheets)
        .map(sheet => sheet.href)
        .filter(href => href && href.includes('messages-new.css'));
    
    console.log(`📊 Messages CSS files loaded: ${cssFiles.length}`);
    
    // Check for conflicting JS files
    const scripts = Array.from(document.scripts)
        .map(script => script.src)
        .filter(src => src && (src.includes('messages-new.js') || src.includes('comprehensive-fixes.js')));
    
    console.log(`📊 Messages JS files loaded: ${scripts.length}`);
    
    // Check for inline styles that might conflict
    const mobileNav = document.querySelector('.mobile-tab-nav');
    if (mobileNav && mobileNav.style.cssText) {
        console.warn('⚠️ Inline styles found on mobile nav - potential conflict');
        conflicts.push('inline-styles');
    }
    
    // Check for conflicting classes
    const conflictingClasses = ['hidden', 'invisible', 'd-none', 'visually-hidden'];
    conflictingClasses.forEach(className => {
        if (mobileNav && mobileNav.classList.contains(className)) {
            console.error(`❌ Conflicting class found: ${className}`);
            conflicts.push(`class-${className}`);
        }
    });
    
    return conflicts;
}

// 6. Check Performance Issues
function checkPerformanceIssues() {
    console.log('\n⚡ 6. CHECKING PERFORMANCE ISSUES...');
    
    // Check for multiple DOM queries
    const mobileNavQueries = performance.getEntriesByType('measure')
        .filter(entry => entry.name.includes('mobile-tab-nav'));
    
    console.log(`📊 Mobile nav performance entries: ${mobileNavQueries.length}`);
    
    // Check for excessive reflows
    const reflowTriggers = [
        'offsetHeight', 'offsetWidth', 'offsetTop', 'offsetLeft',
        'scrollTop', 'scrollLeft', 'scrollWidth', 'scrollHeight',
        'clientTop', 'clientLeft', 'clientWidth', 'clientHeight'
    ];
    
    return mobileNavQueries.length;
}

// 7. Generate Conflict Report
function generateConflictReport() {
    console.log('\n📋 7. GENERATING CONFLICT REPORT...');
    
    const report = {
        htmlStructure: checkHTMLStructure(),
        cssConflicts: checkCSSConflicts(),
        jsConflicts: checkJavaScriptConflicts(),
        responsiveBehavior: checkResponsiveBehavior(),
        specificConflicts: checkSpecificConflicts(),
        performanceIssues: checkPerformanceIssues()
    };
    
    console.log('\n📊 CONFLICT REPORT SUMMARY:');
    console.log('========================');
    console.log(`HTML Structure: ${report.htmlStructure ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`CSS Conflicts: ${report.cssConflicts} rules found`);
    console.log(`JS Conflicts: ${Object.values(report.jsConflicts).filter(Boolean).length} issues`);
    console.log(`Responsive Behavior: ${report.responsiveBehavior ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Specific Conflicts: ${report.specificConflicts.length} conflicts`);
    console.log(`Performance Issues: ${report.performanceIssues} potential issues`);
    
    const hasConflicts = !report.htmlStructure || 
                        report.cssConflicts > 10 || 
                        report.specificConflicts.length > 0;
    
    if (hasConflicts) {
        console.error('\n❌ CONFLICTS DETECTED - ACTION REQUIRED!');
        return false;
    } else {
        console.log('\n✅ NO CONFLICTS DETECTED - MOBILE TAB NAVIGATION IS CLEAN!');
        return true;
    }
}

// Run the comprehensive test
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        generateConflictReport();
    }, 1000);
});

// Export for manual testing
window.testMobileTabConflicts = {
    checkHTMLStructure,
    checkCSSConflicts,
    checkJavaScriptConflicts,
    checkResponsiveBehavior,
    checkSpecificConflicts,
    checkPerformanceIssues,
    generateConflictReport
};

console.log('🔍 Mobile tab conflict detection script loaded');
console.log('💡 Run window.testMobileTabConflicts.generateConflictReport() to test manually'); 