// Fix Message Sending - Prevent Undefined Messages
console.log('🔧 FIXING MESSAGE SENDING');

function fixMessageSending() {
    console.log('🧪 Starting message sending fix...');
    
    // Fix 1: Override sendMessage function
    console.log('\n📱 FIX 1: Overriding sendMessage function');
    
    if (window.messagesApp) {
        const originalSendMessage = window.messagesApp.sendMessage;
        
        window.messagesApp.sendMessage = async function() {
            console.log('📱 sendMessage called...');
            
            if (!this.currentConversation || !this.currentUser) {
                this.showToast('Please select a conversation first', 'error');
                return;
            }

            const messageInput = document.getElementById('messageInput');
            if (!messageInput) {
                console.error('❌ Message input not found');
                return;
            }
            
            const messageText = messageInput.value.trim();
            console.log('📱 Message text:', messageText);
            
            if (!messageText) {
                this.showToast('Please enter a message', 'error');
                return;
            }

            try {
                console.log('📱 Creating message object...');
                
                // Create message object with proper null checks
                const message = {
                    text: messageText,
                    senderId: this.currentUser.uid,
                    senderName: this.currentUser.displayName || 'You',
                    senderPic: this.currentUser.photoURL || 'assets/images/default-avatar.svg',
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    status: 'sent',
                    type: 'text' // Explicitly set type
                };

                console.log('📱 Message object created:', message);

                // Save to Firestore
                const messageRef = await firebase.firestore()
                    .collection('conversations')
                    .doc(this.currentConversation.id)
                    .collection('messages')
                    .add(message);

                console.log('📱 Message saved to Firestore with ID:', messageRef.id);

                // Update conversation
                await firebase.firestore()
                    .collection('conversations')
                    .doc(this.currentConversation.id)
                    .update({
                        lastMessage: messageText,
                        lastMessageAt: firebase.firestore.FieldValue.serverTimestamp()
                    });

                this.currentConversation.lastMessage = messageText;
                this.currentConversation.lastMessageAt = new Date();
                this.renderConversations();

                // Clear input
                messageInput.value = '';
                this.updateSendButton();

                // Reload messages
                await this.loadMessages(this.currentConversation.id);
                
                console.log('✅ Message sent successfully');

            } catch (error) {
                console.error('❌ Error sending message:', error);
                this.showToast('Error sending message', 'error');
            }
        };
        
        console.log('✅ sendMessage function overridden');
    }
    
    // Fix 2: Override renderMessages function
    console.log('\n📱 FIX 2: Overriding renderMessages function');
    
    if (window.messagesApp) {
        window.messagesApp.renderMessages = function() {
            const messagesList = document.getElementById('messagesList');
            if (!messagesList) {
                console.error('❌ Messages list not found');
                return;
            }

            console.log('📱 Rendering messages:', this.messages.length, 'messages');
            
            // Log each message for debugging
            this.messages.forEach((message, index) => {
                console.log(`📱 Message ${index}:`, {
                    type: message.type,
                    text: message.text,
                    senderName: message.senderName,
                    senderId: message.senderId,
                    currentUser: this.currentUser?.uid
                });
            });

            messagesList.innerHTML = '';

            this.messages.forEach(message => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${message.senderId === this.currentUser?.uid ? 'own-message' : 'other-message'}`;
                messageDiv.style.animationDelay = `${Math.random() * 0.3}s`;

                let messageContent = '';

                // Handle different message types
                if (message.type === 'voice') {
                    console.log('📱 Rendering voice message:', message);
                    const audioUrl = message.audioUrl || message.firebaseStorageUrl || '';
                    
                    if (audioUrl) {
                        messageContent = `
                            <div class="voice-message">
                                <div class="voice-icon">🎤</div>
                                <audio class="voice-player" controls preload="none">
                                    <source src="${audioUrl}" type="audio/webm">
                                    <source src="${audioUrl}" type="audio/mp4">
                                    <source src="${audioUrl}" type="audio/wav">
                                    Your browser does not support the audio element.
                                </audio>
                                <div class="message-time">${this.formatTimestamp(message.timestamp)}</div>
                            </div>
                        `;
                    } else {
                        messageContent = `
                            <div class="voice-message">
                                <div class="voice-icon">🎤</div>
                                <div class="voice-placeholder">
                                    <span>Voice message</span>
                                    <small>Audio not available</small>
                                </div>
                                <div class="message-time">${this.formatTimestamp(message.timestamp)}</div>
                            </div>
                        `;
                    }
                } else if (message.type === 'money') {
                    const amount = message.amount || 0;
                    const moneyMessage = message.message || 'Money sent';
                    messageContent = `
                        <div class="money-message">
                            <div class="money-details">
                                <div class="money-icon">💰</div>
                                <div class="money-amount">$${amount.toFixed(2)}</div>
                            </div>
                            <div class="money-message-text">${moneyMessage}</div>
                            <div class="message-time">${this.formatTimestamp(message.timestamp)}</div>
                        </div>
                    `;
                } else if (message.type === 'file') {
                    const fileSize = this.formatFileSize(message.fileSize || 0);
                    const fileName = message.fileName || 'Unknown file';
                    const fileUrl = message.fileUrl || '#';
                    messageContent = `
                        <div class="file-message">
                            <div class="file-icon">📎</div>
                            <div class="file-details">
                                <div class="file-name">${fileName}</div>
                                <div class="file-size">${fileSize}</div>
                                <a href="${fileUrl}" download class="download-btn">Download</a>
                            </div>
                            <div class="message-time">${this.formatTimestamp(message.timestamp)}</div>
                        </div>
                    `;
                } else {
                    // Regular text message with proper null checks
                    const messageText = message.text || 'Empty message';
                    
                    // Skip rendering if the message text is undefined or empty
                    if (!messageText || messageText === 'undefined' || messageText.trim() === '') {
                        console.log('📱 Skipping message with empty text:', message);
                        return; // Skip this message
                    }
                    
                    // Ensure sender name is properly set
                    const senderName = message.senderName || (message.senderId === this.currentUser?.uid ? 'You' : 'Unknown User');
                    
                    messageContent = `
                        <div class="message-bubble">
                            <div class="message-text">${messageText}</div>
                            <div class="message-time">${this.formatTimestamp(message.timestamp)}</div>
                        </div>
                    `;
                }

                // Add null checks for sender information
                const senderName = message.senderName || (message.senderId === this.currentUser?.uid ? 'You' : 'Unknown User');
                const senderPic = message.senderPic || 'assets/images/default-avatar.svg';

                messageDiv.innerHTML = `
                    <div class="message-header">
                        <img src="${senderPic}" alt="${senderName}" class="message-avatar" onerror="this.src='assets/images/default-avatar.svg'">
                        <span class="message-author">${senderName}</span>
                    </div>
                    ${messageContent}
                `;

                messagesList.appendChild(messageDiv);
            });

            this.scrollToBottom();
        };
        
        console.log('✅ renderMessages function overridden');
    }
    
    // Fix 3: Test message sending
    console.log('\n🧪 FIX 3: Testing message sending');
    
    // Add a test function
    window.testMessageSending = function() {
        console.log('🧪 Testing message sending...');
        
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.querySelector('.send-btn');
        
        if (messageInput && sendBtn) {
            console.log('📱 Message input found:', messageInput);
            console.log('📱 Send button found:', sendBtn);
            
            // Test with a sample message
            messageInput.value = 'Hello, this is a test message!';
            console.log('📱 Set test message:', messageInput.value);
            
            // Trigger send
            if (window.messagesApp) {
                window.messagesApp.sendMessage();
            }
        } else {
            console.error('❌ Message input or send button not found');
        }
    };
    
    console.log('✅ Message sending fix completed');
    return true;
}

// Test the fix
function testMessageFix() {
    console.log('🧪 Testing message fix...');
    
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.querySelector('.send-btn');
    
    console.log('📊 Elements found:');
    console.log('  - messageInput:', messageInput);
    console.log('  - sendBtn:', sendBtn);
    console.log('  - messagesApp:', !!window.messagesApp);
    
    if (messageInput && sendBtn && window.messagesApp) {
        console.log('✅ All elements found for message sending');
        console.log('✅ Message sending should work now');
    } else {
        console.error('❌ Missing elements for message sending');
    }
}

// Auto-run fix
setTimeout(fixMessageSending, 2000);

// Export for manual testing
window.fixMessageSending = fixMessageSending;
window.testMessageFix = testMessageFix;

console.log('🔧 Message sending fix loaded - run window.fixMessageSending() to fix manually'); 