// Fix Mobile Navigation - Back Button to Users List
console.log('🔧 FIXING MOBILE NAVIGATION');

function fixMobileNavigation() {
    console.log('🧪 Starting mobile navigation fix...');
    
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
    
    // Fix 1: Override showConversationsList to work in mobile
    console.log('\n📱 FIX 1: Overriding showConversationsList for mobile');
    
    if (window.messagesApp) {
        window.messagesApp.showConversationsList = function() {
            console.log('📱 Showing conversations list (FIXED)...');
            
            const conversationsSidebar = document.getElementById('conversationsSidebar');
            const chatArea = document.getElementById('chatArea');
            const mobileBackBtn = document.getElementById('mobileBackBtn');
            
            if (conversationsSidebar && chatArea) {
                // Show sidebar (users list) and hide chat
                conversationsSidebar.style.display = 'flex';
                conversationsSidebar.style.position = 'relative';
                conversationsSidebar.style.zIndex = '1';
                
                chatArea.classList.remove('active');
                chatArea.style.display = 'none';
                chatArea.style.position = 'absolute';
                chatArea.style.zIndex = '0';
                
                // Hide back button when showing users list
                if (mobileBackBtn) {
                    mobileBackBtn.style.display = 'none';
                    console.log('📱 Back button hidden - showing users list');
                }
                
                console.log('✅ Users list (conversations) now visible');
                console.log('✅ Chat area hidden');
                console.log('✅ Back button hidden');
            }
        };
        
        // Fix 2: Override showChatView to work in mobile
        console.log('\n📱 FIX 2: Overriding showChatView for mobile');
        
        window.messagesApp.showChatView = function() {
            console.log('📱 Showing chat view (FIXED)...');
            
            const conversationsSidebar = document.getElementById('conversationsSidebar');
            const chatArea = document.getElementById('chatArea');
            const mobileBackBtn = document.getElementById('mobileBackBtn');
            
            if (conversationsSidebar && chatArea) {
                // Hide sidebar (users list) and show chat
                conversationsSidebar.style.display = 'none';
                
                chatArea.classList.add('active');
                chatArea.style.display = 'flex';
                chatArea.style.position = 'absolute';
                chatArea.style.zIndex = '10';
                
                // Show back button when showing chat
                if (mobileBackBtn) {
                    mobileBackBtn.style.display = 'flex';
                    console.log('📱 Back button shown - showing chat');
                }
                
                console.log('✅ Chat area now visible');
                console.log('✅ Users list (conversations) hidden');
                console.log('✅ Back button visible');
            }
        };
        
        console.log('✅ Navigation functions overridden');
    }
    
    // Fix 3: Ensure proper mobile back button setup
    console.log('\n🎯 FIX 3: Setting up mobile back button');
    
    if (window.messagesApp && typeof window.messagesApp.setupMobileBackButton === 'function') {
        // Remove existing onclick and event listeners
        mobileBackBtn.removeAttribute('onclick');
        
        // Clear existing event listeners by cloning
        const newBackBtn = mobileBackBtn.cloneNode(true);
        mobileBackBtn.parentNode.replaceChild(newBackBtn, mobileBackBtn);
        
        // Re-setup the back button
        window.messagesApp.setupMobileBackButton();
        
        console.log('✅ Mobile back button re-setup');
    }
    
    // Fix 4: Test the navigation flow
    console.log('\n🧪 FIX 4: Testing navigation flow');
    
    // Test 1: Show users list
    console.log('📱 Test 1: Showing users list...');
    window.messagesApp.showConversationsList();
    
    setTimeout(() => {
        console.log('📊 After showConversationsList:');
        console.log('  - Sidebar display:', conversationsSidebar.style.display);
        console.log('  - Chat display:', chatArea.style.display);
        console.log('  - Back button display:', mobileBackBtn.style.display);
        
        // Test 2: Show chat view
        console.log('📱 Test 2: Showing chat view...');
        window.messagesApp.showChatView();
        
        setTimeout(() => {
            console.log('📊 After showChatView:');
            console.log('  - Sidebar display:', conversationsSidebar.style.display);
            console.log('  - Chat display:', chatArea.style.display);
            console.log('  - Back button display:', mobileBackBtn.style.display);
            
            // Test 3: Click back button
            console.log('🖱️ Test 3: Clicking back button...');
            mobileBackBtn.click();
            
            setTimeout(() => {
                console.log('📊 After back button click:');
                console.log('  - Sidebar display:', conversationsSidebar.style.display);
                console.log('  - Chat display:', chatArea.style.display);
                console.log('  - Back button display:', mobileBackBtn.style.display);
                
                const success = 
                    conversationsSidebar.style.display === 'flex' &&
                    chatArea.style.display === 'none' &&
                    mobileBackBtn.style.display === 'none';
                
                if (success) {
                    console.log('✅ SUCCESS: Mobile navigation works correctly!');
                    console.log('✅ Back button properly shows users list');
                    return true;
                } else {
                    console.error('❌ FAILED: Mobile navigation not working');
                    return false;
                }
            }, 100);
        }, 100);
    }, 100);
    
    return true;
}

// Test mobile navigation manually
function testMobileNavigation() {
    console.log('🧪 Testing mobile navigation manually...');
    
    const conversationsSidebar = document.getElementById('conversationsSidebar');
    const chatArea = document.getElementById('chatArea');
    const mobileBackBtn = document.getElementById('mobileBackBtn');
    
    console.log('📊 Current state:');
    console.log('  - Sidebar display:', conversationsSidebar.style.display);
    console.log('  - Chat display:', chatArea.style.display);
    console.log('  - Back button display:', mobileBackBtn.style.display);
    console.log('  - Window width:', window.innerWidth);
    console.log('  - Is mobile:', window.innerWidth <= 768);
    
    // Simulate mobile view
    console.log('📱 Simulating mobile view...');
    
    // Show chat view (should show back button)
    window.messagesApp.showChatView();
    
    setTimeout(() => {
        console.log('📊 After showChatView:');
        console.log('  - Sidebar display:', conversationsSidebar.style.display);
        console.log('  - Chat display:', chatArea.style.display);
        console.log('  - Back button display:', mobileBackBtn.style.display);
        
        if (mobileBackBtn.style.display === 'flex') {
            console.log('✅ Back button is visible - click it to test!');
            console.log('✅ Should return to users list when clicked');
        } else {
            console.error('❌ Back button not visible');
        }
    }, 100);
}

// Auto-run fix
setTimeout(fixMobileNavigation, 2000);

// Export for manual testing
window.fixMobileNavigation = fixMobileNavigation;
window.testMobileNavigation = testMobileNavigation;

console.log('🔧 Mobile navigation fix loaded - run window.fixMobileNavigation() to fix manually'); 