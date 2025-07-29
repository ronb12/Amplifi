// Simple Mobile Back Button Test
console.log('🔍 SIMPLE MOBILE BACK BUTTON TEST...');

function testBackButton() {
    console.log('📱 Testing mobile back button functionality...');
    
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
    
    // Test 1: Check initial state
    console.log('\n📊 Initial State:');
    console.log('  - Sidebar visible:', conversationsSidebar.style.display === 'flex');
    console.log('  - Chat hidden:', chatArea.style.display === 'none');
    console.log('  - Back button hidden:', mobileBackBtn.style.display === 'none');
    
    // Test 2: Simulate conversation selection
    console.log('\n📱 Simulating conversation selection...');
    if (typeof window.messagesApp !== 'undefined') {
        window.messagesApp.showChatView();
        
        setTimeout(() => {
            console.log('📊 After Conversation Selection:');
            console.log('  - Sidebar hidden:', conversationsSidebar.style.display === 'none');
            console.log('  - Chat visible:', chatArea.style.display === 'flex');
            console.log('  - Chat active:', chatArea.classList.contains('active'));
            console.log('  - Back button visible:', mobileBackBtn.style.display === 'flex');
            
            // Test 3: Click back button
            console.log('\n🖱️ Clicking back button...');
            mobileBackBtn.click();
            
            setTimeout(() => {
                console.log('📊 After Back Button Click:');
                console.log('  - Sidebar visible:', conversationsSidebar.style.display === 'flex');
                console.log('  - Chat hidden:', chatArea.style.display === 'none');
                console.log('  - Chat not active:', !chatArea.classList.contains('active'));
                console.log('  - Back button hidden:', mobileBackBtn.style.display === 'none');
                
                // Verify success
                const success = 
                    conversationsSidebar.style.display === 'flex' &&
                    chatArea.style.display === 'none' &&
                    !chatArea.classList.contains('active') &&
                    mobileBackBtn.style.display === 'none';
                
                if (success) {
                    console.log('✅ SUCCESS: Back button properly returns to conversations list!');
                    console.log('✅ CONFIRMED: Back arrow can go back to the page with users');
                    return true;
                } else {
                    console.error('❌ FAILED: Back button did not work correctly');
                    return false;
                }
            }, 100);
        }, 100);
    } else {
        console.error('❌ MessagesApp not available');
        return false;
    }
    
    return true;
}

// Auto-run test
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        testBackButton();
    }, 2000);
});

// Export for manual testing
window.testBackButton = testBackButton;

console.log('🔍 Simple mobile back button test loaded');
console.log('💡 Run window.testBackButton() to test manually'); 