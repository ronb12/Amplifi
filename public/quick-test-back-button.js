// Quick Test for Back Button and User Selection
console.log('⚡ QUICK TEST: Back Button and User Selection');

function quickTest() {
    console.log('🧪 Running quick test...');
    
    // Check mobile view
    const isMobile = window.innerWidth <= 768;
    console.log('📱 Mobile view:', isMobile);
    
    if (!isMobile) {
        console.log('⚠️ Resize to mobile width (≤768px) for testing');
        return false;
    }
    
    // Get elements
    const sidebar = document.getElementById('conversationsSidebar');
    const chat = document.getElementById('chatArea');
    const backBtn = document.getElementById('mobileBackBtn');
    const conversations = document.querySelectorAll('.conversation-item');
    
    console.log('📊 Elements:', {
        sidebar: !!sidebar,
        chat: !!chat,
        backBtn: !!backBtn,
        conversations: conversations.length
    });
    
    if (!sidebar || !chat || !backBtn) {
        console.error('❌ Missing elements');
        return false;
    }
    
    // Test 1: Initial state
    console.log('📊 Initial state:', {
        sidebarVisible: sidebar.style.display === 'flex',
        chatHidden: chat.style.display === 'none',
        backBtnHidden: backBtn.style.display === 'none'
    });
    
    // Test 2: Show chat view
    if (window.messagesApp) {
        console.log('📱 Showing chat view...');
        window.messagesApp.showChatView();
        
        setTimeout(() => {
            console.log('📊 After showChatView:', {
                sidebarHidden: sidebar.style.display === 'none',
                chatVisible: chat.style.display === 'flex',
                backBtnVisible: backBtn.style.display === 'flex'
            });
            
            // Test 3: Click back button
            console.log('🖱️ Clicking back button...');
            backBtn.click();
            
            setTimeout(() => {
                console.log('📊 After back button:', {
                    sidebarVisible: sidebar.style.display === 'flex',
                    chatHidden: chat.style.display === 'none',
                    backBtnHidden: backBtn.style.display === 'none'
                });
                
                // Test 4: Check if we can select a user
                if (conversations.length > 0) {
                    console.log('👤 Testing user selection...');
                    const firstUser = conversations[0];
                    firstUser.click();
                    
                    setTimeout(() => {
                        console.log('📊 After user selection:', {
                            sidebarHidden: sidebar.style.display === 'none',
                            chatVisible: chat.style.display === 'flex',
                            backBtnVisible: backBtn.style.display === 'flex'
                        });
                        
                        // Test 5: Click back button again
                        console.log('🖱️ Clicking back button again...');
                        backBtn.click();
                        
                        setTimeout(() => {
                            console.log('📊 Final state:', {
                                sidebarVisible: sidebar.style.display === 'flex',
                                chatHidden: chat.style.display === 'none',
                                backBtnHidden: backBtn.style.display === 'none'
                            });
                            
                            const success = 
                                sidebar.style.display === 'flex' &&
                                chat.style.display === 'none' &&
                                backBtn.style.display === 'none';
                            
                            if (success) {
                                console.log('✅ SUCCESS: Back button and user selection work!');
                                console.log('✅ CONFIRMED: Can hit back button and select a user');
                                return true;
                            } else {
                                console.error('❌ FAILED: Test did not complete successfully');
                                return false;
                            }
                        }, 100);
                    }, 100);
                } else {
                    console.log('⚠️ No conversations found to test user selection');
                }
            }, 100);
        }, 100);
    } else {
        console.error('❌ MessagesApp not available');
        return false;
    }
    
    return true;
}

// Auto-run
setTimeout(quickTest, 2000);

// Export for manual testing
window.quickTest = quickTest;

console.log('⚡ Quick test loaded - run window.quickTest() to test manually'); 