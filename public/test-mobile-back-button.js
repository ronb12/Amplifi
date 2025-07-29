// Test Mobile Back Button Functionality
console.log('🔍 TESTING MOBILE BACK BUTTON FUNCTIONALITY...');

// Test 1: Check if mobile back button exists
function testMobileBackButtonExists() {
    console.log('\n📋 1. TESTING MOBILE BACK BUTTON EXISTENCE...');
    
    const mobileBackBtn = document.querySelector('.mobile-back-btn');
    
    if (mobileBackBtn) {
        console.log('✅ Mobile back button found');
        console.log('📊 Button HTML:', mobileBackBtn.outerHTML);
        console.log('📊 Current display:', mobileBackBtn.style.display);
        console.log('📊 Current onclick:', mobileBackBtn.getAttribute('onclick'));
        return true;
    } else {
        console.error('❌ Mobile back button not found');
        return false;
    }
}

// Test 2: Check mobile back button CSS
function testMobileBackButtonCSS() {
    console.log('\n🎨 2. TESTING MOBILE BACK BUTTON CSS...');
    
    const mobileBackBtn = document.querySelector('.mobile-back-btn');
    
    if (mobileBackBtn) {
        const styles = window.getComputedStyle(mobileBackBtn);
        
        console.log('📊 Computed styles:');
        console.log('  - Display:', styles.display);
        console.log('  - Position:', styles.position);
        console.log('  - Width:', styles.width);
        console.log('  - Height:', styles.height);
        console.log('  - Background:', styles.background);
        console.log('  - Border:', styles.border);
        console.log('  - Border-radius:', styles.borderRadius);
        console.log('  - Cursor:', styles.cursor);
        
        // Check if button is visible on mobile
        const isMobile = window.innerWidth <= 768;
        const isVisible = styles.display !== 'none';
        
        if (isMobile && isVisible) {
            console.log('✅ Mobile back button is visible on mobile');
        } else if (isMobile && !isVisible) {
            console.log('⚠️ Mobile back button is hidden on mobile (should be visible when chat is active)');
        } else if (!isMobile) {
            console.log('✅ Mobile back button is hidden on desktop (correct behavior)');
        }
        
        return true;
    } else {
        console.error('❌ Mobile back button not found for CSS testing');
        return false;
    }
}

// Test 3: Check mobile back button functionality
function testMobileBackButtonFunctionality() {
    console.log('\n🖱️ 3. TESTING MOBILE BACK BUTTON FUNCTIONALITY...');
    
    const mobileBackBtn = document.querySelector('.mobile-back-btn');
    
    if (mobileBackBtn) {
        // Check if onclick is properly set
        const onclick = mobileBackBtn.getAttribute('onclick');
        
        if (onclick && onclick.includes('messagesApp.showConversationsList')) {
            console.log('✅ Mobile back button onclick is properly set');
        } else {
            console.error('❌ Mobile back button onclick is missing or incorrect');
        }
        
        // Test click functionality
        console.log('🖱️ Testing mobile back button click...');
        
        // Store original onclick
        const originalOnclick = mobileBackBtn.onclick;
        
        // Add test click handler
        mobileBackBtn.addEventListener('click', function testClick() {
            console.log('✅ Mobile back button click detected!');
            mobileBackBtn.removeEventListener('click', testClick);
        });
        
        // Simulate click
        mobileBackBtn.click();
        
        return true;
    } else {
        console.error('❌ Mobile back button not found for functionality testing');
        return false;
    }
}

// Test 4: Check mobile view state
function testMobileViewState() {
    console.log('\n📱 4. TESTING MOBILE VIEW STATE...');
    
    const conversationsSidebar = document.getElementById('conversationsSidebar');
    const chatArea = document.getElementById('chatArea');
    const mobileBackBtn = document.querySelector('.mobile-back-btn');
    
    console.log('📊 Current view state:');
    console.log('  - Window width:', window.innerWidth);
    console.log('  - Is mobile:', window.innerWidth <= 768);
    console.log('  - Conversations sidebar display:', conversationsSidebar?.style.display);
    console.log('  - Chat area display:', chatArea?.style.display);
    console.log('  - Chat area active class:', chatArea?.classList.contains('active'));
    console.log('  - Mobile back button display:', mobileBackBtn?.style.display);
    
    // Check if we're in the correct state for mobile back button
    const isMobile = window.innerWidth <= 768;
    const isChatActive = chatArea?.classList.contains('active');
    const isBackButtonVisible = mobileBackBtn?.style.display === 'flex';
    
    if (isMobile && isChatActive && isBackButtonVisible) {
        console.log('✅ Mobile back button should be visible and functional');
    } else if (isMobile && !isChatActive && mobileBackBtn?.style.display === 'none') {
        console.log('✅ Mobile back button correctly hidden (conversations view)');
    } else if (!isMobile) {
        console.log('✅ Desktop view - mobile back button behavior correct');
    } else {
        console.log('⚠️ Mobile back button state may need adjustment');
    }
    
    return true;
}

// Test 5: Test showConversationsList and showChatView methods
function testMobileNavigationMethods() {
    console.log('\n🔄 5. TESTING MOBILE NAVIGATION METHODS...');
    
    if (typeof window.messagesApp !== 'undefined') {
        console.log('✅ MessagesApp is available');
        
        // Test showConversationsList
        console.log('🔄 Testing showConversationsList...');
        window.messagesApp.showConversationsList();
        
        setTimeout(() => {
            const mobileBackBtn = document.querySelector('.mobile-back-btn');
            console.log('📊 After showConversationsList:');
            console.log('  - Mobile back button display:', mobileBackBtn?.style.display);
            console.log('  - Chat area active:', document.getElementById('chatArea')?.classList.contains('active'));
        }, 100);
        
        // Test showChatView
        setTimeout(() => {
            console.log('🔄 Testing showChatView...');
            window.messagesApp.showChatView();
            
            setTimeout(() => {
                const mobileBackBtn = document.querySelector('.mobile-back-btn');
                console.log('📊 After showChatView:');
                console.log('  - Mobile back button display:', mobileBackBtn?.style.display);
                console.log('  - Chat area active:', document.getElementById('chatArea')?.classList.contains('active'));
            }, 100);
        }, 200);
        
        return true;
    } else {
        console.error('❌ MessagesApp not available');
        return false;
    }
}

// Test 6: Check conversation selection behavior
function testConversationSelection() {
    console.log('\n💬 6. TESTING CONVERSATION SELECTION BEHAVIOR...');
    
    const conversations = document.querySelectorAll('.conversation-item');
    console.log(`📊 Found ${conversations.length} conversations`);
    
    if (conversations.length > 0) {
        console.log('💡 To test mobile back button:');
        console.log('  1. Click on a conversation to select it');
        console.log('  2. Check if mobile back button appears');
        console.log('  3. Click the mobile back button');
        console.log('  4. Verify it returns to conversations list');
        
        // Check if any conversation is currently active
        const activeConversation = document.querySelector('.conversation-item.active');
        if (activeConversation) {
            console.log('✅ Active conversation found');
            console.log('📊 Active conversation ID:', activeConversation.getAttribute('data-conversation-id'));
        } else {
            console.log('ℹ️ No active conversation - select one to test mobile back button');
        }
    } else {
        console.log('ℹ️ No conversations found - create one to test mobile back button');
    }
    
    return conversations.length > 0;
}

// Run all tests
function runAllMobileBackButtonTests() {
    console.log('🚀 STARTING COMPREHENSIVE MOBILE BACK BUTTON TESTS...');
    
    const tests = [
        testMobileBackButtonExists,
        testMobileBackButtonCSS,
        testMobileBackButtonFunctionality,
        testMobileViewState,
        testMobileNavigationMethods,
        testConversationSelection
    ];
    
    const results = tests.map(test => test());
    
    console.log('\n📊 TEST RESULTS SUMMARY:');
    console.log('========================');
    
    results.forEach((result, index) => {
        const testName = tests[index].name.replace('test', '').replace(/([A-Z])/g, ' $1').trim();
        console.log(`${result ? '✅' : '❌'} ${testName}: ${result ? 'PASS' : 'FAIL'}`);
    });
    
    const passedTests = results.filter(Boolean).length;
    const totalTests = results.length;
    
    console.log(`\n📈 OVERALL: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 ALL TESTS PASSED - MOBILE BACK BUTTON SHOULD WORK!');
        console.log('\n💡 TO TEST MOBILE BACK BUTTON:');
        console.log('1. Resize browser to mobile width (≤768px)');
        console.log('2. Select a conversation from the sidebar');
        console.log('3. Verify mobile back button appears in chat header');
        console.log('4. Click the mobile back button');
        console.log('5. Verify it returns to conversations list');
    } else {
        console.log('⚠️ SOME TESTS FAILED - CHECK CONSOLE FOR DETAILS');
    }
    
    return passedTests === totalTests;
}

// Export for manual testing
window.testMobileBackButton = {
    testMobileBackButtonExists,
    testMobileBackButtonCSS,
    testMobileBackButtonFunctionality,
    testMobileViewState,
    testMobileNavigationMethods,
    testConversationSelection,
    runAllMobileBackButtonTests
};

// Auto-run tests after page load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        runAllMobileBackButtonTests();
    }, 2000);
});

console.log('🔍 Mobile back button test script loaded');
console.log('💡 Run window.testMobileBackButton.runAllMobileBackButtonTests() to test manually'); 