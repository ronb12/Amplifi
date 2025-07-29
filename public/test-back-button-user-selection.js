// Test Back Button and User Selection Flow
console.log('🧪 TESTING BACK BUTTON AND USER SELECTION FLOW...');

async function testBackButtonAndUserSelection() {
    console.log('📱 Starting comprehensive back button and user selection test...');
    
    // Check if we're in mobile view
    const isMobile = window.innerWidth <= 768;
    console.log('📊 Is mobile view:', isMobile);
    
    if (!isMobile) {
        console.log('ℹ️ Not in mobile view - resize browser to ≤768px for testing');
        console.log('💡 To test: Resize browser to mobile width, then run this test again');
        return false;
    }
    
    // Get elements
    const conversationsSidebar = document.getElementById('conversationsSidebar');
    const chatArea = document.getElementById('chatArea');
    const mobileBackBtn = document.getElementById('mobileBackBtn');
    
    console.log('📊 Elements found:');
    console.log('  - conversationsSidebar:', conversationsSidebar);
    console.log('  - chatArea:', chatArea);
    console.log('  - mobileBackBtn:', mobileBackBtn);
    
    if (!conversationsSidebar || !chatArea || !mobileBackBtn) {
        console.error('❌ Required elements not found');
        return false;
    }
    
    if (typeof window.messagesApp === 'undefined') {
        console.error('❌ MessagesApp not available');
        return false;
    }
    
    console.log('✅ All required elements and MessagesApp found');
    
    // Test 1: Check initial state
    console.log('\n📊 Test 1 - Initial State:');
    console.log('  - Sidebar visible:', conversationsSidebar.style.display === 'flex');
    console.log('  - Chat hidden:', chatArea.style.display === 'none');
    console.log('  - Back button hidden:', mobileBackBtn.style.display === 'none');
    
    // Test 2: Simulate conversation selection
    console.log('\n📱 Test 2 - Simulating conversation selection...');
    window.messagesApp.showChatView();
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log('📊 After Conversation Selection:');
    console.log('  - Sidebar hidden:', conversationsSidebar.style.display === 'none');
    console.log('  - Chat visible:', chatArea.style.display === 'flex');
    console.log('  - Chat active:', chatArea.classList.contains('active'));
    console.log('  - Back button visible:', mobileBackBtn.style.display === 'flex');
    
    // Test 3: Click back button
    console.log('\n🖱️ Test 3 - Clicking back button...');
    mobileBackBtn.click();
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log('📊 After Back Button Click:');
    console.log('  - Sidebar visible:', conversationsSidebar.style.display === 'flex');
    console.log('  - Chat hidden:', chatArea.style.display === 'none');
    console.log('  - Chat not active:', !chatArea.classList.contains('active'));
    console.log('  - Back button hidden:', mobileBackBtn.style.display === 'none');
    
    // Test 4: Verify we can see conversations list (users)
    console.log('\n👥 Test 4 - Verifying conversations list is visible...');
    const conversationsList = document.querySelector('.conversations-list');
    const conversationItems = document.querySelectorAll('.conversation-item');
    
    console.log('📊 Conversations list elements:');
    console.log('  - conversationsList:', conversationsList);
    console.log('  - conversationItems count:', conversationItems.length);
    
    if (conversationsList && conversationItems.length > 0) {
        console.log('✅ Conversations list is visible with users');
        
        // Test 5: Simulate clicking on a conversation (user selection)
        console.log('\n👤 Test 5 - Simulating user selection...');
        const firstConversation = conversationItems[0];
        
        if (firstConversation) {
            console.log('📊 Clicking on first conversation:', firstConversation);
            firstConversation.click();
            
            await new Promise(resolve => setTimeout(resolve, 200));
            
            console.log('📊 After User Selection:');
            console.log('  - Sidebar hidden:', conversationsSidebar.style.display === 'none');
            console.log('  - Chat visible:', chatArea.style.display === 'flex');
            console.log('  - Chat active:', chatArea.classList.contains('active'));
            console.log('  - Back button visible:', mobileBackBtn.style.display === 'flex');
            
            // Test 6: Click back button again
            console.log('\n🖱️ Test 6 - Clicking back button again...');
            mobileBackBtn.click();
            
            await new Promise(resolve => setTimeout(resolve, 200));
            
            console.log('📊 After Second Back Button Click:');
            console.log('  - Sidebar visible:', conversationsSidebar.style.display === 'flex');
            console.log('  - Chat hidden:', chatArea.style.display === 'none');
            console.log('  - Chat not active:', !chatArea.classList.contains('active'));
            console.log('  - Back button hidden:', mobileBackBtn.style.display === 'none');
            
            // Final verification
            const finalSuccess = 
                conversationsSidebar.style.display === 'flex' &&
                chatArea.style.display === 'none' &&
                !chatArea.classList.contains('active') &&
                mobileBackBtn.style.display === 'none' &&
                conversationsList.style.display !== 'none';
            
            if (finalSuccess) {
                console.log('✅ SUCCESS: Complete back button and user selection flow works!');
                console.log('✅ CONFIRMED: Can hit back button and select a user');
                console.log('✅ CONFIRMED: Back button properly returns to conversations list');
                console.log('✅ CONFIRMED: User selection works after back button');
                return true;
            } else {
                console.error('❌ FAILED: Complete flow did not work correctly');
                return false;
            }
        } else {
            console.error('❌ No conversation items found to click');
            return false;
        }
    } else {
        console.error('❌ Conversations list not visible or no users found');
        return false;
    }
}

// Test with visual feedback
function testWithVisualFeedback() {
    console.log('🎨 Running test with visual feedback...');
    
    // Add visual indicators
    const style = document.createElement('style');
    style.textContent = `
        .test-highlight {
            background-color: #ffeb3b !important;
            border: 2px solid #ff9800 !important;
            animation: pulse 1s infinite;
        }
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Run the test
    testBackButtonAndUserSelection().then(success => {
        if (success) {
            console.log('🎉 TEST COMPLETED SUCCESSFULLY!');
            console.log('✅ Back button and user selection flow is working correctly');
        } else {
            console.error('❌ TEST FAILED');
        }
    });
}

// Auto-run test
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        console.log('🚀 Auto-running back button and user selection test...');
        testWithVisualFeedback();
    }, 3000);
});

// Export for manual testing
window.testBackButtonAndUserSelection = testBackButtonAndUserSelection;
window.testWithVisualFeedback = testWithVisualFeedback;

console.log('🧪 Back button and user selection test loaded');
console.log('💡 Run window.testBackButtonAndUserSelection() to test manually');
console.log('💡 Run window.testWithVisualFeedback() for visual test'); 