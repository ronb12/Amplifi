// Clear All Sample Messages and Conversations
console.log('🗑️ CLEARING ALL SAMPLE MESSAGES');

function clearAllSampleMessages() {
    console.log('🧹 Starting cleanup of all sample messages...');
    
    // Clear 1: Remove all conversations from the list
    console.log('\n📱 CLEAR 1: Removing all conversations from the list');
    
    const conversationsList = document.getElementById('conversationsList');
    if (conversationsList) {
        conversationsList.innerHTML = '';
        console.log('✅ Conversations list cleared');
    } else {
        console.error('❌ Conversations list not found');
    }
    
    // Clear 2: Clear all messages in the chat area
    console.log('\n📱 CLEAR 2: Clearing all messages in chat area');
    
    const messagesList = document.getElementById('messagesList');
    if (messagesList) {
        messagesList.innerHTML = '';
        console.log('✅ Messages list cleared');
    } else {
        console.error('❌ Messages list not found');
    }
    
    // Clear 3: Reset messagesApp data
    console.log('\n📱 CLEAR 3: Resetting messagesApp data');
    
    if (window.messagesApp) {
        // Clear local arrays
        window.messagesApp.messages = [];
        window.messagesApp.conversations = [];
        window.messagesApp.allUsers = [];
        
        // Reset current conversation
        window.messagesApp.currentConversation = null;
        
        console.log('✅ messagesApp data cleared');
    }
    
    // Clear 4: Show empty state
    console.log('\n📱 CLEAR 4: Showing empty state');
    
    if (conversationsList) {
        conversationsList.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 40px 20px; color: #6b7280;">
                <div style="font-size: 48px; margin-bottom: 16px;">💬</div>
                <h3 style="margin: 0 0 8px 0; color: #374151;">No Conversations</h3>
                <p style="margin: 0; font-size: 14px;">Start a new conversation to begin messaging</p>
            </div>
        `;
    }
    
    if (messagesList) {
        messagesList.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 40px 20px; color: #6b7280;">
                <div style="font-size: 48px; margin-bottom: 16px;">💬</div>
                <h3 style="margin: 0 0 8px 0; color: #374151;">No Messages</h3>
                <p style="margin: 0; font-size: 14px;">Select a conversation to start messaging</p>
            </div>
        `;
    }
    
    // Clear 5: Disable message input
    console.log('\n📱 CLEAR 5: Disabling message input');
    
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.querySelector('.send-btn');
    
    if (messageInput) {
        messageInput.value = '';
        messageInput.disabled = true;
        messageInput.placeholder = 'Select a conversation to start messaging';
    }
    
    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.style.opacity = '0.5';
    }
    
    // Clear 6: Show conversations list by default
    console.log('\n📱 CLEAR 6: Showing conversations list');
    
    if (window.messagesApp && typeof window.messagesApp.showConversationsList === 'function') {
        window.messagesApp.showConversationsList();
    } else {
        // Manual fallback
        const conversationsSidebar = document.getElementById('conversationsSidebar');
        const chatArea = document.getElementById('chatArea');
        const mobileBackBtn = document.getElementById('mobileBackBtn');
        
        if (conversationsSidebar && chatArea) {
            conversationsSidebar.style.display = 'flex';
            chatArea.style.display = 'none';
            if (mobileBackBtn) mobileBackBtn.style.display = 'none';
        }
    }
    
    console.log('✅ All sample messages cleared successfully');
    return true;
}

// Clear 7: Remove from Firebase (optional)
function clearFirebaseData() {
    console.log('\n🔥 CLEAR 7: Clearing Firebase data (optional)');
    
    if (window.messagesApp && window.messagesApp.currentUser) {
        console.log('⚠️  This will delete all conversations and messages from Firebase');
        console.log('⚠️  This action cannot be undone');
        
        // Only clear if user confirms
        if (confirm('Are you sure you want to delete ALL conversations and messages? This cannot be undone.')) {
            clearAllFirebaseData();
        } else {
            console.log('❌ Firebase clear cancelled by user');
        }
    } else {
        console.log('❌ User not authenticated, cannot clear Firebase data');
    }
}

async function clearAllFirebaseData() {
    try {
        console.log('🔥 Starting Firebase data clear...');
        
        // Clear all conversations
        const conversationsSnapshot = await firebase.firestore()
            .collection('conversations')
            .get();
        
        const batch = firebase.firestore().batch();
        
        conversationsSnapshot.forEach(doc => {
            console.log('🔥 Deleting conversation:', doc.id);
            batch.delete(doc.ref);
        });
        
        await batch.commit();
        console.log('✅ All conversations deleted from Firebase');
        
        // Clear all messages (if they exist in a separate collection)
        try {
            const messagesSnapshot = await firebase.firestore()
                .collection('messages')
                .get();
            
            const messageBatch = firebase.firestore().batch();
            
            messagesSnapshot.forEach(doc => {
                console.log('🔥 Deleting message:', doc.id);
                messageBatch.delete(doc.ref);
            });
            
            await messageBatch.commit();
            console.log('✅ All messages deleted from Firebase');
        } catch (error) {
            console.log('ℹ️  No separate messages collection found (messages are stored in conversations)');
        }
        
        console.log('✅ Firebase data cleared successfully');
        
    } catch (error) {
        console.error('❌ Error clearing Firebase data:', error);
    }
}

// Clear 8: Reset page completely
function resetPageCompletely() {
    console.log('\n🔄 CLEAR 8: Resetting page completely');
    
    // Clear all data
    clearAllSampleMessages();
    
    // Reset any cached data
    if (window.messagesApp) {
        // Reset any cached data
        localStorage.removeItem('messagesApp_cache');
        sessionStorage.removeItem('messagesApp_cache');
        
        // Reinitialize if possible
        if (typeof window.messagesApp.init === 'function') {
            window.messagesApp.init();
        }
    }
    
    console.log('✅ Page reset completely');
}

// Test the clear functions
function testClearFunctions() {
    console.log('🧪 Testing clear functions...');
    
    const conversationsList = document.getElementById('conversationsList');
    const messagesList = document.getElementById('messagesList');
    const messageInput = document.getElementById('messageInput');
    
    console.log('📊 Elements found:');
    console.log('  - conversationsList:', conversationsList);
    console.log('  - messagesList:', messagesList);
    console.log('  - messageInput:', messageInput);
    console.log('  - messagesApp:', !!window.messagesApp);
    
    if (conversationsList && messagesList && messageInput) {
        console.log('✅ All elements found for clearing');
        console.log('✅ Clear functions should work');
    } else {
        console.error('❌ Missing elements for clearing');
    }
}

// Auto-run clear
setTimeout(clearAllSampleMessages, 1000);

// Export for manual use
window.clearAllSampleMessages = clearAllSampleMessages;
window.clearFirebaseData = clearFirebaseData;
window.resetPageCompletely = resetPageCompletely;
window.testClearFunctions = testClearFunctions;

console.log('🗑️ Sample message clear script loaded');
console.log('📝 Available functions:');
console.log('  - window.clearAllSampleMessages() - Clear all sample messages');
console.log('  - window.clearFirebaseData() - Clear Firebase data (with confirmation)');
console.log('  - window.resetPageCompletely() - Reset page completely');
console.log('  - window.testClearFunctions() - Test clear functions'); 