// Fix Back Button Visibility
console.log('🔧 FIXING BACK BUTTON VISIBILITY');

function fixBackButtonVisibility() {
    console.log('🧪 Starting back button visibility fix...');
    
    // Get the back button
    const mobileBackBtn = document.getElementById('mobileBackBtn');
    
    if (!mobileBackBtn) {
        console.error('❌ Mobile back button not found');
        return false;
    }
    
    console.log('📊 Current back button state:');
    console.log('  - Display:', mobileBackBtn.style.display);
    console.log('  - Window width:', window.innerWidth);
    console.log('  - Is mobile:', window.innerWidth <= 768);
    
    // Fix 1: Make back button visible for testing
    console.log('\n📱 FIX 1: Making back button visible for testing');
    
    // Show back button regardless of screen size for testing
    mobileBackBtn.style.display = 'flex';
    mobileBackBtn.style.visibility = 'visible';
    mobileBackBtn.style.opacity = '1';
    
    // Ensure proper styling
    mobileBackBtn.style.alignItems = 'center';
    mobileBackBtn.style.justifyContent = 'center';
    mobileBackBtn.style.background = 'rgba(255,255,255,0.9)';
    mobileBackBtn.style.border = 'none';
    mobileBackBtn.style.borderRadius = '50%';
    mobileBackBtn.style.width = '36px';
    mobileBackBtn.style.height = '36px';
    mobileBackBtn.style.cursor = 'pointer';
    mobileBackBtn.style.transition = 'all 0.2s';
    mobileBackBtn.style.marginRight = '0.5rem';
    mobileBackBtn.style.position = 'relative';
    mobileBackBtn.style.zIndex = '1000';
    
    console.log('✅ Back button made visible');
    console.log('📊 Updated display:', mobileBackBtn.style.display);
    
    // Fix 2: Update JavaScript logic to show back button in desktop
    console.log('\n🎯 FIX 2: Updating JavaScript logic');
    
    if (window.messagesApp) {
        // Override the mobile check in showChatView
        const originalShowChatView = window.messagesApp.showChatView;
        window.messagesApp.showChatView = function() {
            console.log('📱 Showing chat view (modified for testing)...');
            const conversationsSidebar = document.getElementById('conversationsSidebar');
            const chatArea = document.getElementById('chatArea');
            const mobileBackBtn = document.getElementById('mobileBackBtn');
            
            if (conversationsSidebar && chatArea) {
                // Hide sidebar and show chat area
                conversationsSidebar.style.display = 'none';
                
                chatArea.classList.add('active');
                chatArea.style.display = 'flex';
                chatArea.style.position = 'absolute';
                chatArea.style.zIndex = '10';
                
                // Show mobile back button regardless of screen size for testing
                if (mobileBackBtn) {
                    mobileBackBtn.style.display = 'flex';
                    mobileBackBtn.style.visibility = 'visible';
                    mobileBackBtn.style.opacity = '1';
                    console.log('📱 Mobile back button shown (testing mode)');
                }
            }
        };
        
        // Override the mobile check in showConversationsList
        const originalShowConversationsList = window.messagesApp.showConversationsList;
        window.messagesApp.showConversationsList = function() {
            console.log('📱 Showing conversations list (modified for testing)...');
            const conversationsSidebar = document.getElementById('conversationsSidebar');
            const chatArea = document.getElementById('chatArea');
            const mobileBackBtn = document.getElementById('mobileBackBtn');
            
            if (conversationsSidebar && chatArea) {
                conversationsSidebar.style.display = 'flex';
                conversationsSidebar.style.position = 'relative';
                conversationsSidebar.style.zIndex = '1';
                
                chatArea.classList.remove('active');
                chatArea.style.display = 'none';
                chatArea.style.position = 'absolute';
                chatArea.style.zIndex = '0';
                
                // Hide mobile back button regardless of screen size for testing
                if (mobileBackBtn) {
                    mobileBackBtn.style.display = 'none';
                    console.log('📱 Mobile back button hidden (testing mode)');
                }
            }
        };
        
        console.log('✅ JavaScript logic updated for testing');
    }
    
    // Fix 3: Add visual indicator for testing
    console.log('\n🎨 FIX 3: Adding visual indicator');
    
    // Add a test indicator to the back button
    mobileBackBtn.setAttribute('title', 'Back to conversations (TESTING MODE)');
    mobileBackBtn.style.border = '2px solid #ff6b6b';
    mobileBackBtn.style.boxShadow = '0 0 10px rgba(255, 107, 107, 0.5)';
    
    console.log('✅ Visual indicator added');
    
    // Fix 4: Test the back button functionality
    console.log('\n🧪 FIX 4: Testing back button functionality');
    
    // Simulate a conversation selection to show the back button
    if (window.messagesApp) {
        console.log('📱 Simulating conversation selection...');
        window.messagesApp.showChatView();
        
        setTimeout(() => {
            console.log('📊 After showChatView:');
            console.log('  - Back button display:', mobileBackBtn.style.display);
            console.log('  - Back button visibility:', mobileBackBtn.style.visibility);
            console.log('  - Back button opacity:', mobileBackBtn.style.opacity);
            
            if (mobileBackBtn.style.display === 'flex') {
                console.log('✅ SUCCESS: Back button is now visible!');
                console.log('✅ You should see the back button in the top-left corner');
                console.log('✅ Click it to test the functionality');
            } else {
                console.error('❌ FAILED: Back button is still not visible');
            }
        }, 100);
    }
    
    return true;
}

// Test the back button click
function testBackButtonClick() {
    console.log('🖱️ Testing back button click...');
    
    const mobileBackBtn = document.getElementById('mobileBackBtn');
    if (mobileBackBtn && mobileBackBtn.style.display === 'flex') {
        console.log('🖱️ Clicking back button...');
        mobileBackBtn.click();
        
        setTimeout(() => {
            console.log('📊 After back button click:');
            console.log('  - Back button display:', mobileBackBtn.style.display);
            
            if (mobileBackBtn.style.display === 'none') {
                console.log('✅ SUCCESS: Back button click worked!');
                console.log('✅ Should have returned to conversations list');
            } else {
                console.error('❌ FAILED: Back button click did not work');
            }
        }, 100);
    } else {
        console.error('❌ Back button not visible or not found');
    }
}

// Auto-run fix
setTimeout(fixBackButtonVisibility, 2000);

// Export for manual testing
window.fixBackButtonVisibility = fixBackButtonVisibility;
window.testBackButtonClick = testBackButtonClick;

console.log('🔧 Back button visibility fix loaded - run window.fixBackButtonVisibility() to fix manually'); 