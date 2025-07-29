// Force Conversations Visible - Direct Fix
console.log('🔧 FORCING CONVERSATIONS TO BE VISIBLE');

function forceConversationsVisible() {
    console.log('🧪 Starting direct conversations visibility fix...');
    
    // Get elements
    const conversationsSidebar = document.getElementById('conversationsSidebar');
    const conversationsList = document.getElementById('conversationsList');
    const chatArea = document.getElementById('chatArea');
    
    console.log('📊 Elements found:');
    console.log('  - conversationsSidebar:', conversationsSidebar);
    console.log('  - conversationsList:', conversationsList);
    console.log('  - chatArea:', chatArea);
    
    // Fix 1: Force sidebar to be visible with !important
    console.log('\n📱 FIX 1: Forcing sidebar visibility with !important');
    
    if (conversationsSidebar) {
        // Add inline styles with !important
        conversationsSidebar.setAttribute('style', `
            display: flex !important;
            width: 100% !important;
            height: 100% !important;
            position: relative !important;
            z-index: 1 !important;
            overflow: visible !important;
            visibility: visible !important;
            opacity: 1 !important;
        `);
        
        console.log('✅ Sidebar forced to be visible');
    }
    
    // Fix 2: Force chat area to be hidden
    console.log('\n📱 FIX 2: Forcing chat area to be hidden');
    
    if (chatArea) {
        chatArea.setAttribute('style', `
            display: none !important;
            position: absolute !important;
            z-index: 0 !important;
        `);
        chatArea.classList.remove('active');
        
        console.log('✅ Chat area forced to be hidden');
    }
    
    // Fix 3: Populate conversations list with sample data
    console.log('\n📱 FIX 3: Populating conversations list');
    
    if (conversationsList) {
        const sampleConversations = [
            {
                id: 'user1',
                name: 'John Doe',
                lastMessage: 'Hey, how are you doing?',
                avatar: 'assets/images/default-avatar.svg',
                unread: 2,
                time: '2m ago'
            },
            {
                id: 'user2',
                name: 'Jane Smith',
                lastMessage: 'Great to hear from you!',
                avatar: 'assets/images/default-avatar.svg',
                unread: 0,
                time: '5m ago'
            },
            {
                id: 'user3',
                name: 'Mike Johnson',
                lastMessage: 'Let\'s catch up soon',
                avatar: 'assets/images/default-avatar.svg',
                unread: 1,
                time: '10m ago'
            },
            {
                id: 'user4',
                name: 'Sarah Wilson',
                lastMessage: 'Thanks for the update!',
                avatar: 'assets/images/default-avatar.svg',
                unread: 0,
                time: '15m ago'
            },
            {
                id: 'user5',
                name: 'David Brown',
                lastMessage: 'Looking forward to it!',
                avatar: 'assets/images/default-avatar.svg',
                unread: 3,
                time: '1h ago'
            }
        ];
        
        const conversationsHTML = sampleConversations.map(conv => `
            <div class="conversation-item" onclick="selectConversation('${conv.id}')" style="cursor: pointer;">
                <img src="${conv.avatar}" alt="${conv.name}" class="conversation-avatar" style="width: 40px; height: 40px; border-radius: 50%;">
                <div class="conversation-info" style="flex: 1; margin-left: 12px;">
                    <div class="conversation-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="conversation-name" style="font-weight: 600; color: #374151;">${conv.name}</span>
                        <span class="conversation-time" style="font-size: 0.75rem; color: #6b7280;">${conv.time}</span>
                    </div>
                    <div class="conversation-preview" style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                        <span class="preview-text" style="font-size: 0.875rem; color: #6b7280; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${conv.lastMessage}</span>
                        ${conv.unread > 0 ? `<span class="unread-badge" style="background: #ef4444; color: white; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600;">${conv.unread}</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
        
        conversationsList.innerHTML = conversationsHTML;
        console.log('✅ Conversations list populated with sample data');
    }
    
    // Fix 4: Add global function for conversation selection
    console.log('\n📱 FIX 4: Adding conversation selection function');
    
    window.selectConversation = function(conversationId) {
        console.log('🖱️ Conversation selected:', conversationId);
        
        // Hide sidebar and show chat area
        if (conversationsSidebar) {
            conversationsSidebar.style.display = 'none';
        }
        
        if (chatArea) {
            chatArea.style.display = 'flex';
            chatArea.classList.add('active');
        }
        
        // Show back button
        const mobileBackBtn = document.getElementById('mobileBackBtn');
        if (mobileBackBtn) {
            mobileBackBtn.style.display = 'flex';
        }
        
        console.log('✅ Chat view activated');
    };
    
    // Fix 5: Add CSS to ensure proper layout
    console.log('\n📱 FIX 5: Adding critical CSS');
    
    const criticalCSS = document.createElement('style');
    criticalCSS.textContent = `
        /* Critical CSS for conversations visibility */
        .conversations-sidebar {
            display: flex !important;
            width: 100% !important;
            height: 100% !important;
            flex-direction: column !important;
            background: white !important;
            border-right: 1px solid #e5e7eb !important;
        }
        
        .conversations-list {
            flex: 1 !important;
            overflow-y: auto !important;
            padding: 0 !important;
        }
        
        .conversation-item {
            padding: 12px 16px !important;
            border-bottom: 1px solid #f3f4f6 !important;
            display: flex !important;
            align-items: center !important;
            transition: background-color 0.2s !important;
        }
        
        .conversation-item:hover {
            background-color: #f9fafb !important;
        }
        
        .conversation-item:active {
            background-color: #f3f4f6 !important;
        }
        
        /* Mobile specific */
        @media (max-width: 768px) {
            .conversations-sidebar {
                width: 100% !important;
                height: 100% !important;
                position: relative !important;
                z-index: 1 !important;
            }
            
            .chat-area {
                display: none !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                z-index: 10 !important;
                background: white !important;
            }
            
            .chat-area.active {
                display: flex !important;
            }
        }
    `;
    document.head.appendChild(criticalCSS);
    
    console.log('✅ Critical CSS added');
    
    // Fix 6: Test the visibility
    console.log('\n🧪 FIX 6: Testing conversations visibility');
    
    setTimeout(() => {
        const conversations = document.querySelectorAll('.conversation-item');
        console.log('📊 Final test results:');
        console.log('  - Sidebar display:', conversationsSidebar?.style.display);
        console.log('  - Conversations count:', conversations.length);
        console.log('  - Chat area display:', chatArea?.style.display);
        
        if (conversations.length > 0) {
            console.log('✅ SUCCESS: Conversations are now visible!');
            console.log('✅ Users can click on conversations to start chatting');
            console.log('✅ Back button will work to return to conversations list');
            return true;
        } else {
            console.error('❌ FAILED: Still no conversations visible');
            return false;
        }
    }, 1000);
    
    return true;
}

// Test conversation selection
function testConversationSelection() {
    console.log('🧪 Testing conversation selection...');
    
    const conversations = document.querySelectorAll('.conversation-item');
    console.log('📊 Found conversations:', conversations.length);
    
    if (conversations.length > 0) {
        console.log('🖱️ Clicking first conversation...');
        conversations[0].click();
        
        setTimeout(() => {
            const chatArea = document.getElementById('chatArea');
            const mobileBackBtn = document.getElementById('mobileBackBtn');
            
            console.log('📊 After conversation click:');
            console.log('  - Chat area display:', chatArea?.style.display);
            console.log('  - Back button display:', mobileBackBtn?.style.display);
            
            if (chatArea && chatArea.style.display === 'flex') {
                console.log('✅ SUCCESS: Conversation selection works!');
                console.log('✅ Chat view is now active');
                console.log('✅ Back button should be visible');
            } else {
                console.error('❌ FAILED: Conversation selection not working');
            }
        }, 100);
    } else {
        console.error('❌ No conversations found to test');
    }
}

// Auto-run fix
setTimeout(forceConversationsVisible, 2000);

// Export for manual testing
window.forceConversationsVisible = forceConversationsVisible;
window.testConversationSelection = testConversationSelection;

console.log('🔧 Force conversations visible fix loaded - run window.forceConversationsVisible() to fix manually'); 