// Comprehensive Test Script for All Fixes
console.log('🧪 TESTING ALL COMPREHENSIVE FIXES');

// Test 1: Desktop Navigation
function testDesktopNavigation() {
    console.log('🔧 Testing Desktop Navigation...');
    
    const pageNav = document.querySelector('.page-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (pageNav) {
        console.log('✅ Desktop navigation found');
        
        // Check if nav links have proper flex layout
        navLinks.forEach(link => {
            const computedStyle = window.getComputedStyle(link);
            const display = computedStyle.display;
            const alignItems = computedStyle.alignItems;
            
            if (display === 'flex' && alignItems === 'center') {
                console.log('✅ Nav link has proper flex layout:', link.textContent.trim());
            } else {
                console.log('❌ Nav link missing proper flex layout:', link.textContent.trim());
            }
        });
        
        // Check for messages page specific issues
        if (window.location.pathname.includes('messages.html')) {
            console.log('🔍 Checking messages page specific navigation...');
            
            const computedStyle = window.getComputedStyle(pageNav);
            const position = computedStyle.position;
            const left = computedStyle.left;
            const right = computedStyle.right;
            const maxWidth = computedStyle.maxWidth;
            const marginLeft = computedStyle.marginLeft;
            const marginRight = computedStyle.marginRight;
            const width = computedStyle.width;
            const boxSizing = computedStyle.boxSizing;
            
            if (position === 'sticky' && left === 'auto' && right === 'auto') {
                console.log('✅ Messages page navigation has correct positioning');
            } else {
                console.log('❌ Messages page navigation has incorrect positioning');
                console.log('   Position:', position, 'Left:', left, 'Right:', right);
            }
            
            if (maxWidth === '1400px' && marginLeft === 'auto' && marginRight === 'auto') {
                console.log('✅ Messages page navigation has correct centering');
            } else {
                console.log('❌ Messages page navigation missing proper centering');
                console.log('   Max-width:', maxWidth, 'Margin-left:', marginLeft, 'Margin-right:', marginRight);
            }
            
            if (boxSizing === 'border-box') {
                console.log('✅ Messages page navigation has correct box-sizing');
            } else {
                console.log('❌ Messages page navigation has incorrect box-sizing:', boxSizing);
            }
            
            // Check navigation link sizing
            const firstNavLink = navLinks[0];
            if (firstNavLink) {
                const linkStyle = window.getComputedStyle(firstNavLink);
                const linkFontSize = linkStyle.fontSize;
                const linkPadding = linkStyle.padding;
                const linkBoxSizing = linkStyle.boxSizing;
                
                if (linkFontSize === '15.2px' || linkFontSize === '0.95rem') {
                    console.log('✅ Messages page navigation links have correct font size');
                } else {
                    console.log('❌ Messages page navigation links have incorrect font size:', linkFontSize);
                }
                
                if (linkBoxSizing === 'border-box') {
                    console.log('✅ Messages page navigation links have correct box-sizing');
                } else {
                    console.log('❌ Messages page navigation links have incorrect box-sizing:', linkBoxSizing);
                }
            }
        }
    } else {
        console.log('❌ Desktop navigation not found');
    }
}

// Test 2: Mobile Navigation
function testMobileNavigation() {
    console.log('📱 Testing Mobile Navigation...');
    
    const mobileNav = document.querySelector('.mobile-tab-nav');
    const tabItems = document.querySelectorAll('.tab-item');
    
    if (mobileNav) {
        console.log('✅ Mobile navigation found');
        console.log(`✅ Found ${tabItems.length} tab items`);
        
        // Check if all required tabs are present
        const requiredTabs = ['Home', 'Search', 'Create', 'Messages', 'Live', 'Music', 'Profile'];
        const foundTabs = Array.from(tabItems).map(item => {
            const label = item.querySelector('.tab-label');
            return label ? label.textContent : '';
        });
        
        requiredTabs.forEach(tab => {
            if (foundTabs.includes(tab)) {
                console.log(`✅ Tab "${tab}" found`);
            } else {
                console.log(`❌ Tab "${tab}" missing`);
            }
        });
    } else {
        console.log('❌ Mobile navigation not found');
    }
}

// Test 3: Notification Bells
function testNotificationBells() {
    console.log('🔔 Testing Notification Bells...');
    
    const notificationBtns = document.querySelectorAll('.notification-btn, #notificationBtn');
    
    if (notificationBtns.length > 0) {
        console.log(`✅ Found ${notificationBtns.length} notification buttons`);
        
        notificationBtns.forEach((btn, index) => {
            const hasOnclick = btn.hasAttribute('onclick');
            const onclickValue = btn.getAttribute('onclick');
            
            if (hasOnclick && onclickValue && onclickValue.includes('notifications.html')) {
                console.log(`✅ Notification button ${index + 1} has correct onclick`);
            } else {
                console.log(`❌ Notification button ${index + 1} missing correct onclick`);
            }
        });
    } else {
        console.log('❌ No notification buttons found');
    }
}

// Test 4: Music Playback (if on music library page)
function testMusicPlayback() {
    console.log('🎵 Testing Music Playback...');
    
    if (window.location.pathname.includes('music-library.html')) {
        if (window.musicLibraryPage && window.musicLibraryPage.playMusic) {
            console.log('✅ Music library page detected');
            console.log('✅ playMusic function exists');
            
            // Test if the function has been enhanced
            const functionString = window.musicLibraryPage.playMusic.toString();
            if (functionString.includes('new Audio()') || functionString.includes('audio.play()')) {
                console.log('✅ Music playback function has been enhanced');
            } else {
                console.log('❌ Music playback function not enhanced');
            }
        } else {
            console.log('❌ Music library page not properly initialized');
        }
    } else {
        console.log('ℹ️ Not on music library page - skipping music playback test');
    }
}

// Test 5: iOS Compatibility
function testIOSCompatibility() {
    console.log('📱 Testing iOS Compatibility...');
    
    // Check viewport meta tag
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
        const content = viewportMeta.getAttribute('content');
        if (content && content.includes('user-scalable=no')) {
            console.log('✅ Viewport meta tag configured for iOS');
        } else {
            console.log('❌ Viewport meta tag not properly configured');
        }
    } else {
        console.log('❌ Viewport meta tag missing');
    }
    
    // Check for iOS-specific CSS
    const styles = document.querySelectorAll('style');
    let hasIOSStyles = false;
    
    styles.forEach(style => {
        if (style.textContent.includes('safe-area-inset') || style.textContent.includes('env(')) {
            hasIOSStyles = true;
        }
    });
    
    if (hasIOSStyles) {
        console.log('✅ iOS-specific styles found');
    } else {
        console.log('❌ iOS-specific styles not found');
    }
}

// Test 6: Responsive Design
function testResponsiveDesign() {
    console.log('📐 Testing Responsive Design...');
    
    // Check if mobile navigation is hidden on desktop
    const mobileNav = document.querySelector('.mobile-tab-nav');
    if (mobileNav) {
        const computedStyle = window.getComputedStyle(mobileNav);
        const display = computedStyle.display;
        
        if (window.innerWidth > 768) {
            if (display === 'none') {
                console.log('✅ Mobile navigation hidden on desktop');
            } else {
                console.log('❌ Mobile navigation visible on desktop');
            }
        } else {
            if (display === 'flex') {
                console.log('✅ Mobile navigation visible on mobile');
            } else {
                console.log('❌ Mobile navigation hidden on mobile');
            }
        }
    }
    
    // Check if desktop navigation is hidden on mobile
    const desktopNav = document.querySelector('.page-nav');
    if (desktopNav) {
        const computedStyle = window.getComputedStyle(desktopNav);
        const display = computedStyle.display;
        
        if (window.innerWidth <= 768) {
            if (display === 'none') {
                console.log('✅ Desktop navigation hidden on mobile');
            } else {
                console.log('❌ Desktop navigation visible on mobile');
            }
        } else {
            if (display === 'flex') {
                console.log('✅ Desktop navigation visible on desktop');
            } else {
                console.log('❌ Desktop navigation hidden on desktop');
            }
        }
    }
}

// Run all tests
function runAllTests() {
    console.log('🚀 Running all comprehensive tests...');
    console.log('📍 Current page:', window.location.pathname);
    console.log('📱 Screen size:', window.innerWidth, 'x', window.innerHeight);
    
    testDesktopNavigation();
    testMobileNavigation();
    testNotificationBells();
    testMusicPlayback();
    testIOSCompatibility();
    testResponsiveDesign();
    
    console.log('✅ All tests completed!');
    console.log('📋 Summary:');
    console.log('  - Desktop navigation icons and text should be side by side');
    console.log('  - Mobile navigation should be consistent across all pages');
    console.log('  - All notification bells should navigate to notifications.html');
    console.log('  - Music playback should work on music library page');
    console.log('  - App should work on all iOS devices and screen sizes');
}

// Run tests when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
} else {
    runAllTests();
}

// Export for manual testing
window.testAllFixes = runAllTests; 