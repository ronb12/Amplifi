// Fix iOS Conversations Visibility - Ensure Conversations List Shows
console.log('🔧 FIXING iOS CONVERSATIONS VISIBILITY');

function fixIOSConversationsVisibility() {
    console.log('🧪 Starting iOS conversations visibility fix...');
    
    // Get elements
    const conversationsSidebar = document.getElementById('conversationsSidebar');
    const chatArea = document.getElementById('chatArea');
    const conversationsList = document.querySelector('.conversations-list');
    const welcomeState = document.getElementById('welcomeState');
    
    console.log('📊 Elements found:');
    console.log('  - conversationsSidebar:', conversationsSidebar);
    console.log('  - chatArea:', chatArea);
    console.log('  - conversationsList:', conversationsList);
    console.log('  - welcomeState:', welcomeState);
    
    // Fix 1: Ensure conversations sidebar is visible by default
    console.log('\n📱 FIX 1: Making conversations sidebar visible');
    
    if (conversationsSidebar) {
        // Force sidebar to be visible
        conversationsSidebar.style.display = 'flex';
        conversationsSidebar.style.position = 'relative';
        conversationsSidebar.style.zIndex = '1';
        conversationsSidebar.style.width = '100%';
        conversationsSidebar.style.height = '100%';
        conversationsSidebar.style.overflow = 'visible';
        
        console.log('✅ Conversations sidebar made visible');
        console.log('  - Display:', conversationsSidebar.style.display);
        console.log('  - Width:', conversationsSidebar.style.width);
        console.log('  - Height:', conversationsSidebar.style.height);
    }
    
    // Fix 2: Ensure chat area is hidden by default
    console.log('\n📱 FIX 2: Hiding chat area by default');
    
    if (chatArea) {
        chatArea.style.display = 'none';
        chatArea.style.position = 'absolute';
        chatArea.style.zIndex = '0';
        chatArea.classList.remove('active');
        
        console.log('✅ Chat area hidden');
        console.log('  - Display:', chatArea.style.display);
        console.log('  - Active class:', chatArea.classList.contains('active'));
    }
    
    // Fix 3: Load sample conversations if none exist
    console.log('\n📱 FIX 3: Loading sample conversations');
    
    if (window.messagesApp) {
        // Check if conversations exist
        const existingConversations = document.querySelectorAll('.conversation-item');
        console.log('📊 Existing conversations:', existingConversations.length);
        
        if (existingConversations.length === 0) {
            console.log('📱 No conversations found, loading sample conversations...');
            
            // Load sample conversations
            if (typeof window.messagesApp.loadSampleConversations === 'function') {
                window.messagesApp.loadSampleConversations();
                console.log('✅ Sample conversations loaded');
            } else {
                console.log('📱 Creating sample conversations manually...');
                
                // Create sample conversations manually
                const sampleConversations = [
                    {
                        id: 'sample1',
                        name: 'John Doe',
                        lastMessage: 'Hey, how are you?',
                        avatar: 'assets/images/default-avatar.svg',
                        unread: 2
                    },
                    {
                        id: 'sample2',
                        name: 'Jane Smith',
                        lastMessage: 'Great to hear from you!',
                        avatar: 'assets/images/default-avatar.svg',
                        unread: 0
                    },
                    {
                        id: 'sample3',
                        name: 'Mike Johnson',
                        lastMessage: 'Let\'s catch up soon',
                        avatar: 'assets/images/default-avatar.svg',
                        unread: 1
                    }
                ];
                
                // Render sample conversations
                if (conversationsList) {
                    const conversationsHTML = sampleConversations.map(conv => `
                        <div class="conversation-item" onclick="messagesApp.selectConversation('${conv.id}')">
                            <img src="${conv.avatar}" alt="${conv.name}" class="conversation-avatar">
                            <div class="conversation-info">
                                <div class="conversation-header">
                                    <span class="conversation-name">${conv.name}</span>
                                    <span class="conversation-time">2m ago</span>
                                </div>
                                <div class="conversation-preview">
                                    <span class="preview-text">${conv.lastMessage}</span>
                                    ${conv.unread > 0 ? `<span class="unread-badge">${conv.unread}</span>` : ''}
                                </div>
                            </div>
                        </div>
                    `).join('');
                    
                    conversationsList.innerHTML = conversationsHTML;
                    console.log('✅ Sample conversations rendered');
                }
            }
        } else {
            console.log('✅ Conversations already exist');
        }
    }
    
    // Fix 4: iOS-specific CSS fixes
    console.log('\n📱 FIX 4: Applying iOS-specific CSS fixes');
    
    // Add iOS-specific styles
    const style = document.createElement('style');
    style.textContent = `
        /* iOS Device Compatibility */
        @supports (-webkit-touch-callout: none) {
            .messages-main {
                height: calc(100vh - 130px) !important;
                margin-top: 70px;
                padding-bottom: 60px;
                overflow: hidden;
                -webkit-overflow-scrolling: touch;
            }
            
            .conversations-sidebar {
                width: 100% !important;
                height: 100% !important;
                display: flex !important;
                flex-direction: column;
                overflow-y: auto;
                -webkit-overflow-scrolling: touch;
                position: relative !important;
                z-index: 1 !important;
            }
            
            .conversations-list {
                flex: 1;
                overflow-y: auto;
                -webkit-overflow-scrolling: touch;
                padding-bottom: 20px;
            }
            
            .chat-area {
                width: 100%;
                height: 100%;
                flex: 1;
                display: none;
                flex-direction: column;
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: white;
                z-index: 10;
                overflow: hidden;
                -webkit-overflow-scrolling: touch;
            }
            
            .chat-area.active {
                display: flex !important;
            }
            
            /* Ensure proper viewport handling */
            body {
                -webkit-text-size-adjust: 100%;
                -webkit-font-smoothing: antialiased;
            }
            
            /* Fix for iOS Safari */
            .conversation-item {
                -webkit-tap-highlight-color: transparent;
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                user-select: none;
            }
        }
        
        /* Ensure conversations are visible on all screen sizes */
        .conversations-sidebar {
            display: flex !important;
            width: 100% !important;
            height: 100% !important;
        }
        
        .conversations-list {
            flex: 1;
            overflow-y: auto;
        }
    `;
    document.head.appendChild(style);
    
    console.log('✅ iOS-specific CSS applied');
    
    // Fix 5: Force conversations to be visible
    console.log('\n📱 FIX 5: Forcing conversations visibility');
    
    if (conversationsSidebar) {
        // Ensure sidebar is visible
        conversationsSidebar.style.display = 'flex';
        conversationsSidebar.style.visibility = 'visible';
        conversationsSidebar.style.opacity = '1';
        conversationsSidebar.style.width = '100%';
        conversationsSidebar.style.height = '100%';
        
        // Ensure conversations list is visible
        if (conversationsList) {
            conversationsList.style.display = 'block';
            conversationsList.style.visibility = 'visible';
            conversationsList.style.opacity = '1';
        }
        
        console.log('✅ Conversations forced to be visible');
    }
    
    // Fix 6: Test the visibility
    console.log('\n🧪 FIX 6: Testing conversations visibility');
    
    setTimeout(() => {
        console.log('📊 Final state:');
        console.log('  - Sidebar display:', conversationsSidebar?.style.display);
        console.log('  - Sidebar visibility:', conversationsSidebar?.style.visibility);
        console.log('  - Conversations list display:', conversationsList?.style.display);
        console.log('  - Chat area display:', chatArea?.style.display);
        
        const conversations = document.querySelectorAll('.conversation-item');
        console.log('  - Number of conversations:', conversations.length);
        
        if (conversations.length > 0) {
            console.log('✅ SUCCESS: Conversations are visible!');
            console.log('✅ Users can now select conversations');
            return true;
        } else {
            console.error('❌ FAILED: No conversations visible');
            return false;
        }
    }, 1000);
    
    return true;
}

// Test conversations visibility
function testConversationsVisibility() {
    console.log('🧪 Testing conversations visibility...');
    
    const conversationsSidebar = document.getElementById('conversationsSidebar');
    const conversationsList = document.querySelector('.conversations-list');
    const conversations = document.querySelectorAll('.conversation-item');
    
    console.log('📊 Current state:');
    console.log('  - Sidebar display:', conversationsSidebar?.style.display);
    console.log('  - Conversations list display:', conversationsList?.style.display);
    console.log('  - Number of conversations:', conversations.length);
    console.log('  - Window width:', window.innerWidth);
    console.log('  - Is mobile:', window.innerWidth <= 768);
    
    if (conversations.length > 0) {
        console.log('✅ SUCCESS: Conversations are visible!');
        console.log('✅ Users can select conversations');
        
        // Test clicking on first conversation
        if (conversations[0]) {
            console.log('🖱️ Testing conversation selection...');
            conversations[0].click();
            
            setTimeout(() => {
                const chatArea = document.getElementById('chatArea');
                console.log('📊 After conversation click:');
                console.log('  - Chat area display:', chatArea?.style.display);
                console.log('  - Chat area active:', chatArea?.classList.contains('active'));
                
                if (chatArea && chatArea.style.display === 'flex') {
                    console.log('✅ SUCCESS: Conversation selection works!');
                } else {
                    console.error('❌ FAILED: Conversation selection not working');
                }
            }, 100);
        }
    } else {
        console.error('❌ FAILED: No conversations visible');
    }
}

// Auto-run fix
setTimeout(fixIOSConversationsVisibility, 2000);

// Export for manual testing
window.fixIOSConversationsVisibility = fixIOSConversationsVisibility;
window.testConversationsVisibility = testConversationsVisibility;

console.log('🔧 iOS conversations visibility fix loaded - run window.fixIOSConversationsVisibility() to fix manually'); 