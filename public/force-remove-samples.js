// Force Remove All Sample Conversations - Aggressive Cleanup
console.log('💥 FORCE REMOVING ALL SAMPLE CONVERSATIONS');

function forceRemoveAllSamples() {
    console.log('💥 Starting aggressive sample removal...');
    
    // Force 1: Direct DOM manipulation to remove all conversation items
    console.log('\n💥 FORCE 1: Direct DOM removal of all conversation items');
    
    const conversationItems = document.querySelectorAll('.conversation-item');
    console.log('💥 Found conversation items:', conversationItems.length);
    
    conversationItems.forEach((item, index) => {
        console.log(`💥 Removing conversation item ${index}:`, item.textContent.trim());
        item.remove();
    });
    
    // Force 2: Clear conversations list completely
    console.log('\n💥 FORCE 2: Clearing conversations list completely');
    
    const conversationsList = document.getElementById('conversationsList');
    if (conversationsList) {
        conversationsList.innerHTML = '';
        conversationsList.style.display = 'flex';
        conversationsList.style.visibility = 'visible';
        conversationsList.style.opacity = '1';
        console.log('✅ Conversations list cleared and forced visible');
    }
    
    // Force 3: Override any sample loading functions
    console.log('\n💥 FORCE 3: Overriding sample loading functions');
    
    if (window.messagesApp) {
        // Override loadSampleConversations to do nothing
        window.messagesApp.loadSampleConversations = function() {
            console.log('💥 Blocked loadSampleConversations call');
            return;
        };
        
        // Override createSampleConversation to do nothing
        window.messagesApp.createSampleConversation = function() {
            console.log('💥 Blocked createSampleConversation call');
            return;
        };
        
        // Clear all arrays
        window.messagesApp.messages = [];
        window.messagesApp.conversations = [];
        window.messagesApp.allUsers = [];
        window.messagesApp.currentConversation = null;
        
        console.log('✅ Sample loading functions blocked');
    }
    
    // Force 4: Remove any injected sample HTML
    console.log('\n💥 FORCE 4: Removing any injected sample HTML');
    
    // Remove any elements with sample data
    const sampleElements = document.querySelectorAll('[onclick*="selectConversation"], [onclick*="messagesApp.selectConversation"]');
    sampleElements.forEach(element => {
        console.log('💥 Removing sample element:', element);
        element.remove();
    });
    
    // Force 5: Clear any global selectConversation function
    console.log('\n💥 FORCE 5: Clearing global selectConversation function');
    
    if (window.selectConversation) {
        delete window.selectConversation;
        console.log('✅ Global selectConversation function removed');
    }
    
    // Force 6: Show empty state with !important styles
    console.log('\n💥 FORCE 6: Showing empty state with !important styles');
    
    if (conversationsList) {
        conversationsList.setAttribute('style', `
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            width: 100% !important;
            height: 100% !important;
            overflow: visible !important;
        `);
        
        conversationsList.innerHTML = `
            <div class="empty-state" style="
                text-align: center; 
                padding: 40px 20px; 
                color: #6b7280;
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 200px;
            ">
                <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;">💬</div>
                <h3 style="margin: 0 0 8px 0; color: #374151; font-size: 18px;">No Conversations</h3>
                <p style="margin: 0; font-size: 14px; color: #6b7280;">Start a new conversation to begin messaging</p>
            </div>
        `;
    }
    
    // Force 7: Disable message input completely
    console.log('\n💥 FORCE 7: Disabling message input completely');
    
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.querySelector('.send-btn');
    
    if (messageInput) {
        messageInput.value = '';
        messageInput.disabled = true;
        messageInput.placeholder = 'Select a conversation to start messaging';
        messageInput.style.opacity = '0.5';
        messageInput.style.pointerEvents = 'none';
    }
    
    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.style.opacity = '0.5';
        sendBtn.style.pointerEvents = 'none';
    }
    
    // Force 8: Show conversations sidebar and hide chat
    console.log('\n💥 FORCE 8: Forcing conversations sidebar visible');
    
    const conversationsSidebar = document.getElementById('conversationsSidebar');
    const chatArea = document.getElementById('chatArea');
    const mobileBackBtn = document.getElementById('mobileBackBtn');
    
    if (conversationsSidebar) {
        conversationsSidebar.setAttribute('style', `
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            width: 100% !important;
            height: 100% !important;
            position: relative !important;
            z-index: 1 !important;
        `);
    }
    
    if (chatArea) {
        chatArea.setAttribute('style', `
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            position: absolute !important;
            z-index: 0 !important;
        `);
        chatArea.classList.remove('active');
    }
    
    if (mobileBackBtn) {
        mobileBackBtn.style.display = 'none';
    }
    
    // Force 9: Clear any remaining sample data
    console.log('\n💥 FORCE 9: Clearing any remaining sample data');
    
    // Remove any elements with sample names
    const sampleNames = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown'];
    sampleNames.forEach(name => {
        const elements = document.querySelectorAll(`*:contains("${name}")`);
        elements.forEach(element => {
            if (element.textContent.includes(name)) {
                console.log('💥 Removing element with sample name:', name);
                element.remove();
            }
        });
    });
    
    // Force 10: Block any future sample creation
    console.log('\n💥 FORCE 10: Blocking future sample creation');
    
    // Override any functions that might create samples
    if (window.messagesApp) {
        const originalRenderConversations = window.messagesApp.renderConversations;
        window.messagesApp.renderConversations = function() {
            console.log('💥 Blocked renderConversations call');
            return;
        };
        
        const originalLoadConversations = window.messagesApp.loadConversations;
        window.messagesApp.loadConversations = function() {
            console.log('💥 Blocked loadConversations call');
            return;
        };
    }
    
    console.log('✅ All sample conversations force removed');
    return true;
}

// Force 11: Remove from localStorage and sessionStorage
function clearAllStorage() {
    console.log('\n💥 FORCE 11: Clearing all storage');
    
    // Clear localStorage
    Object.keys(localStorage).forEach(key => {
        if (key.includes('conversation') || key.includes('message') || key.includes('sample')) {
            localStorage.removeItem(key);
            console.log('💥 Removed from localStorage:', key);
        }
    });
    
    // Clear sessionStorage
    Object.keys(sessionStorage).forEach(key => {
        if (key.includes('conversation') || key.includes('message') || key.includes('sample')) {
            sessionStorage.removeItem(key);
            console.log('💥 Removed from sessionStorage:', key);
        }
    });
    
    console.log('✅ All storage cleared');
}

// Force 12: Remove any cached data
function clearAllCachedData() {
    console.log('\n💥 FORCE 12: Clearing all cached data');
    
    if (window.messagesApp) {
        // Clear all properties
        Object.keys(window.messagesApp).forEach(key => {
            if (Array.isArray(window.messagesApp[key])) {
                window.messagesApp[key] = [];
                console.log('💥 Cleared array:', key);
            }
        });
        
        // Force reset
        window.messagesApp.currentConversation = null;
        window.messagesApp.currentUser = null;
    }
    
    console.log('✅ All cached data cleared');
}

// Test the force removal
function testForceRemoval() {
    console.log('🧪 Testing force removal...');
    
    const conversationItems = document.querySelectorAll('.conversation-item');
    const conversationsList = document.getElementById('conversationsList');
    const messageInput = document.getElementById('messageInput');
    
    console.log('📊 Current state:');
    console.log('  - conversationItems:', conversationItems.length);
    console.log('  - conversationsList:', conversationsList);
    console.log('  - messageInput:', messageInput);
    console.log('  - messagesApp:', !!window.messagesApp);
    
    if (conversationItems.length === 0) {
        console.log('✅ No conversation items found - samples already removed');
    } else {
        console.log('❌ Found conversation items - need to force remove');
    }
}

// Auto-run force removal
setTimeout(forceRemoveAllSamples, 500);

// Export for manual use
window.forceRemoveAllSamples = forceRemoveAllSamples;
window.clearAllStorage = clearAllStorage;
window.clearAllCachedData = clearAllCachedData;
window.testForceRemoval = testForceRemoval;

console.log('💥 Force removal script loaded');
console.log('📝 Available functions:');
console.log('  - window.forceRemoveAllSamples() - Force remove all samples');
console.log('  - window.clearAllStorage() - Clear all storage');
console.log('  - window.clearAllCachedData() - Clear all cached data');
console.log('  - window.testForceRemoval() - Test force removal'); 