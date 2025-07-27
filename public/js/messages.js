/* global db, auth, firebase, storage */
// Messages Page JavaScript - Facebook Messenger Features
class MessagesPage {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.conversations = [];
        this.currentConversation = null;
        this.messages = [];
        this.unsubscribeMessages = null;
        this.unsubscribeTyping = null;
        this.typingUsers = new Set();
        this.selectedMessageForReaction = null;
        this.editingMessageId = null;
        this.isTyping = false;
        this.typingTimeout = null;
        this.replyToMessageId = null;
        this.replyToMessageData = null;
        
        this.init();
    }

    async init() {
        console.log('DOM loaded, initializing MessagesPage...');
        await this.setupAuthStateListener();
        this.setupEventListeners();
        this.setupAdvancedFeatures();
    }

    setupAdvancedFeatures() {
        if (!this.currentUser) return;
        
        // Setup typing indicator listener
        this.setupTypingIndicator();
        
        // Setup message reactions
        this.setupMessageReactions();
        
        // Setup read receipts
        this.setupReadReceipts();
        
        // Setup media upload
        this.setupMediaUpload();
        
        // Setup voice messages
        this.setupVoiceMessages();
    }

    setupTypingIndicator() {
        if (this.currentConversation) {
            this.unsubscribeTyping = db.collection('conversations')
                .doc(this.currentConversation)
                .collection('typing')
                .onSnapshot((snapshot) => {
                    this.typingUsers.clear();
                    snapshot.forEach(doc => {
                        if (doc.data().userId !== this.currentUser.uid) {
                            this.typingUsers.add(doc.data().userId);
                        }
                    });
                    this.updateTypingIndicator();
                });
        }
    }

    updateTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            if (this.typingUsers.size > 0) {
                const userNames = Array.from(this.typingUsers).map(uid => {
                    const user = this.getUserById(uid);
                    return user ? user.displayName : 'Someone';
                });
                typingIndicator.innerHTML = `
                    <div class="typing-indicator">
                        <span class="typing-dots">
                            <span></span><span></span><span></span>
                        </span>
                        <span class="typing-text">${userNames.join(', ')} ${userNames.length === 1 ? 'is' : 'are'} typing...</span>
                    </div>
                `;
                typingIndicator.style.display = 'block';
            } else {
                typingIndicator.style.display = 'none';
            }
        }
    }

    setupMessageReactions() {
        // Add reaction picker to DOM
        const reactionPicker = document.createElement('div');
        reactionPicker.id = 'reactionPicker';
        reactionPicker.className = 'reaction-picker';
        reactionPicker.innerHTML = `
            <div class="reaction-options">
                <span class="reaction" data-reaction="👍">👍</span>
                <span class="reaction" data-reaction="❤️">❤️</span>
                <span class="reaction" data-reaction="😂">😂</span>
                <span class="reaction" data-reaction="😮">😮</span>
                <span class="reaction" data-reaction="😢">😢</span>
                <span class="reaction" data-reaction="😡">😡</span>
            </div>
        `;
        document.body.appendChild(reactionPicker);
    }

    showReactionPicker(messageId, event) {
        this.selectedMessageForReaction = messageId;
        const picker = document.getElementById('reactionPicker');
        const rect = event.target.getBoundingClientRect();
        
        picker.style.left = rect.left + 'px';
        picker.style.top = (rect.top - 60) + 'px';
        picker.style.display = 'block';
        
        // Close picker when clicking outside
        document.addEventListener('click', function closePicker(e) {
            if (!picker.contains(e.target) && !event.target.contains(e.target)) {
                picker.style.display = 'none';
                document.removeEventListener('click', closePicker);
            }
        });
    }

    async addReaction(reaction) {
        if (!this.selectedMessageForReaction || !this.currentUser) return;
        
        try {
            const messageRef = db.collection('messages').doc(this.selectedMessageForReaction);
            const messageDoc = await messageRef.get();
            
            if (messageDoc.exists) {
                const messageData = messageDoc.data();
                const reactions = messageData.reactions || {};
                
                if (!reactions[reaction]) {
                    reactions[reaction] = [];
                }
                
                // Add user to reaction if not already there
                if (!reactions[reaction].includes(this.currentUser.uid)) {
                    reactions[reaction].push(this.currentUser.uid);
                } else {
                    // Remove user from reaction if already there (toggle)
                    reactions[reaction] = reactions[reaction].filter(uid => uid !== this.currentUser.uid);
                    if (reactions[reaction].length === 0) {
                        delete reactions[reaction];
                    }
                }
                
                await messageRef.update({ reactions });
                this.selectedMessageForReaction = null;
                document.getElementById('reactionPicker').style.display = 'none';
            }
        } catch (error) {
            console.error('Error adding reaction:', error);
        }
    }

    setupReadReceipts() {
        // Mark messages as read when conversation is active
        if (this.currentConversation) {
            this.markMessagesAsRead();
        }
    }

    async markMessagesAsRead() {
        if (!this.currentConversation || !this.currentUser) return;
        
        try {
            const messagesSnapshot = await db.collection('messages')
                .where('conversationId', '==', this.currentConversation)
                .where('senderId', '!=', this.currentUser.uid)
                .get();
            
            const batch = db.batch();
            messagesSnapshot.forEach(doc => {
                const messageData = doc.data();
                const readBy = messageData.readBy || [];
                
                if (!readBy.includes(this.currentUser.uid)) {
                    readBy.push(this.currentUser.uid);
                    batch.update(doc.ref, { readBy });
                }
            });
            
            await batch.commit();
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    }

    setupMediaUpload() {
        const mediaBtn = document.querySelector('.media-btn');
        if (mediaBtn) {
            mediaBtn.addEventListener('click', () => {
                this.showMediaOptions();
            });
        }
    }

    showMediaOptions() {
        const mediaOptions = document.createElement('div');
        mediaOptions.className = 'media-options';
        mediaOptions.innerHTML = `
            <div class="media-option" data-action="photo">
                <span>📷</span>
                <span>Photo</span>
            </div>
            <div class="media-option" data-action="video">
                <span>🎥</span>
                <span>Video</span>
            </div>
            <div class="media-option" data-action="file">
                <span>📎</span>
                <span>File</span>
            </div>
        `;
        
        document.body.appendChild(mediaOptions);
        
        mediaOptions.addEventListener('click', (e) => {
            const action = e.target.closest('.media-option')?.dataset.action;
            if (action) {
                this.executeMediaAction(action);
                mediaOptions.remove();
            }
        });
        
        // Close on outside click
        document.addEventListener('click', function closeMedia(e) {
            if (!mediaOptions.contains(e.target)) {
                mediaOptions.remove();
                document.removeEventListener('click', closeMedia);
            }
        });
    }

    async executeMediaAction(action) {
        const input = document.createElement('input');
        
        switch (action) {
            case 'photo':
                input.type = 'file';
                input.accept = 'image/*';
                break;
            case 'video':
                input.type = 'file';
                input.accept = 'video/*';
                break;
            case 'file':
                input.type = 'file';
                break;
        }
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFileUpload(file, action);
            }
        };
        
        input.click();
    }

    async handleFileUpload(file, type) {
        try {
            const storageRef = storage.ref();
            const fileRef = storageRef.child(`messages/${this.currentConversation}/${Date.now()}_${file.name}`);
            
            const snapshot = await fileRef.put(file);
            const downloadURL = await snapshot.ref.getDownloadURL();
            
            // Send message with media
            await this.sendMessage(this.currentConversation, '', {
                type: type,
                url: downloadURL,
                fileName: file.name,
                fileSize: file.size
            });
            
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    }

    setupVoiceMessages() {
        const voiceBtn = document.querySelector('.voice-btn');
        if (voiceBtn) {
            voiceBtn.addEventListener('mousedown', () => this.startVoiceRecording());
            voiceBtn.addEventListener('mouseup', () => this.stopVoiceRecording());
            voiceBtn.addEventListener('mouseleave', () => this.stopVoiceRecording());
        }
    }

    async startVoiceRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const chunks = [];
            
            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                this.uploadVoiceMessage(blob);
            };
            
            mediaRecorder.start();
            this.mediaRecorder = mediaRecorder;
            
            // Update UI to show recording
            const voiceBtn = document.querySelector('.voice-btn');
            if (voiceBtn) voiceBtn.textContent = '🔴';
            
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    }

    stopVoiceRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            
            // Reset UI
            const voiceBtn = document.querySelector('.voice-btn');
            if (voiceBtn) voiceBtn.textContent = '🎤';
        }
    }

    async uploadVoiceMessage(audioBlob) {
        try {
            const storageRef = storage.ref();
            const fileRef = storageRef.child(`voice/${this.currentConversation}/${Date.now()}.webm`);
            
            const snapshot = await fileRef.put(audioBlob);
            const downloadURL = await snapshot.ref.getDownloadURL();
            
            // Send voice message
            await this.sendMessage(this.currentConversation, '', {
                type: 'voice',
                url: downloadURL,
                duration: Math.round(audioBlob.size / 1000) // Rough duration estimate
            });
            
        } catch (error) {
            console.error('Error uploading voice message:', error);
        }
    }

    getUserById(uid) {
        // Find user in conversations or load from Firestore
        for (const conversation of this.conversations) {
            const user = conversation.participantsData?.find(u => u.uid === uid);
            if (user) return user;
        }
        return null;
    }

    async setupAuthStateListener() {
        console.log('Setting up auth state listener for messages page...');
        
        // Check current auth state
        const user = auth.currentUser;
        console.log('Current auth user on page load:', user ? user.uid : 'null');
        
        if (user) {
            this.currentUser = user;
            await this.loadUserProfile();
            await this.loadConversations();
        }

        // Set up listener for future auth state changes
        auth.onAuthStateChanged(async (user) => {
            console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
            
            if (user) {
                console.log('User authenticated:', user.uid);
                this.currentUser = user;
                await this.loadUserProfile();
                await this.loadConversations();
                this.updateUIForAuthenticatedUser();
                this.setupAdvancedFeatures();
            } else {
                console.log('User logged out');
                this.currentUser = null;
                this.userProfile = null;
                this.conversations = [];
                this.messages = [];
                this.updateUIForUnauthenticatedUser();
            }
        });
    }

    async loadUserProfile() {
        try {
            const userDoc = await db.collection('users').doc(this.currentUser.uid).get();
            if (userDoc.exists) {
                this.userProfile = userDoc.data();
                console.log('User profile loaded:', this.userProfile.displayName);
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    updateUIForAuthenticatedUser() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.querySelector('.send-btn');
        const newConversationBtn = document.querySelector('.new-conversation-btn');
        
        if (messageInput) messageInput.disabled = false;
        if (sendBtn) sendBtn.disabled = false;
        if (newConversationBtn) newConversationBtn.style.display = 'block';
    }

    updateUIForUnauthenticatedUser() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.querySelector('.send-btn');
        const newConversationBtn = document.querySelector('.new-conversation-btn');
        
        if (messageInput) messageInput.disabled = true;
        if (sendBtn) sendBtn.disabled = true;
        if (newConversationBtn) newConversationBtn.style.display = 'none';
        
        this.showLoginPrompt();
    }

    showLoginPrompt() {
        const messagesMain = document.getElementById('messagesMain');
        if (messagesMain) {
            messagesMain.innerHTML = `
                <div class="login-prompt">
                    <h3>Please log in to send messages</h3>
                    <p>You need to be authenticated to use the messaging feature.</p>
                </div>
            `;
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // New conversation button
        const newConversationBtn = document.querySelector('.new-conversation-btn');
        if (newConversationBtn) {
            newConversationBtn.addEventListener('click', () => {
                this.showNewConversationModal();
            });
        }

        // Conversation search
        const conversationSearch = document.getElementById('conversationsSearch');
        if (conversationSearch) {
            conversationSearch.addEventListener('input', (e) => {
                this.filterConversations(e.target.value);
            });
        }

        // Message form with typing indicator
        const messageForm = document.getElementById('messageForm');
        if (messageForm) {
            messageForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const messageInput = document.getElementById('messageInput');
                const text = messageInput.value.trim();
                if (text && this.currentConversation) {
                    this.sendMessage(this.currentConversation, text);
                    messageInput.value = '';
                    this.stopTyping();
                }
            });
        }

        // Message input typing indicator
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.addEventListener('input', () => {
                this.startTyping();
            });
        }

        // Send button
        const sendBtn = document.querySelector('.send-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                const messageInput = document.getElementById('messageInput');
                const text = messageInput.value.trim();
                if (text && this.currentConversation) {
                    this.sendMessage(this.currentConversation, text);
                    messageInput.value = '';
                    this.stopTyping();
                }
            });
        }

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModals();
            }
        });

        // Reaction picker events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('reaction')) {
                const reaction = e.target.dataset.reaction;
                this.addReaction(reaction);
            }
        });

        console.log('Event listeners setup complete');
    }

    startTyping() {
        if (!this.currentConversation || !this.currentUser) return;
        
        if (!this.isTyping) {
            this.isTyping = true;
            db.collection('conversations')
                .doc(this.currentConversation)
                .collection('typing')
                .doc(this.currentUser.uid)
                .set({
                    userId: this.currentUser.uid,
                    timestamp: new Date()
                });
        }
        
        // Clear existing timeout
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
        
        // Set timeout to stop typing indicator
        this.typingTimeout = setTimeout(() => {
            this.stopTyping();
        }, 3000);
    }

    stopTyping() {
        if (!this.currentConversation || !this.currentUser) return;
        
        this.isTyping = false;
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
            this.typingTimeout = null;
        }
        
        db.collection('conversations')
            .doc(this.currentConversation)
            .collection('typing')
            .doc(this.currentUser.uid)
            .delete();
    }

    async loadConversations() {
        if (!this.currentUser) return;
        
        console.log('Loading conversations for user:', this.currentUser.uid);
        try {
            const conversationsSnapshot = await db.collection('conversations')
                .where('participants', 'array-contains', this.currentUser.uid)
                .orderBy('lastMessageAt', 'desc')
                .get();

            this.conversations = [];
            conversationsSnapshot.forEach(doc => {
                this.conversations.push({ id: doc.id, ...doc.data() });
            });

            console.log('Found conversations from Firestore:', this.conversations.length);
            this.renderConversations();
        } catch (error) {
            console.error('Error loading conversations:', error);
        }
    }

    renderConversations() {
        const conversationsList = document.getElementById('conversationsList');
        if (!conversationsList) return;

        conversationsList.innerHTML = '';

        if (this.conversations.length === 0) {
            conversationsList.innerHTML = '<p class="no-conversations">No conversations yet</p>';
            return;
        }

        this.conversations.forEach(conversation => {
            const conversationElement = this.createConversationElement(conversation);
            conversationsList.appendChild(conversationElement);
        });
    }

    createConversationElement(conversation) {
        const otherUserId = conversation.participants.find(id => id !== this.currentUser.uid);
        const otherUser = conversation.participantsData?.find(user => user.uid === otherUserId);
        
        const div = document.createElement('div');
        div.className = 'conversation-item';
        div.onclick = () => this.selectConversation(conversation.id, otherUserId);
        
        div.innerHTML = `
            <img src="${otherUser?.profilePic || 'default-avatar.svg'}" alt="User" class="conversation-avatar">
            <div class="conversation-info">
                <h4>${otherUser?.displayName || 'Unknown User'}</h4>
                <p>${conversation.lastMessage || 'No messages yet'}</p>
                <span class="conversation-time">${this.formatTimestamp(conversation.lastMessageAt)}</span>
            </div>
        `;
        
        return div;
    }

    async selectConversation(conversationId, otherUserId) {
        this.currentConversation = conversationId;
        
        // Update UI to show selected conversation
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        event.currentTarget.classList.add('active');

        // Enable message input and send button
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.querySelector('.send-btn');
        if (messageInput) messageInput.disabled = false;
        if (sendBtn) sendBtn.disabled = false;

        // Show messages area on mobile
        if (window.innerWidth <= 768) {
            this.showChatMobile();
        }

        // Load and display messages
        await this.loadMessages(conversationId);
        
        // Setup typing indicator for this conversation
        this.setupTypingIndicator();
        
        // Mark messages as read
        this.markMessagesAsRead();
    }

    async loadMessages(conversationId) {
        if (!conversationId) return;

        // Unsubscribe from previous listener
        if (this.unsubscribeMessages) {
            this.unsubscribeMessages();
        }

        // Set up real-time listener for messages
        this.unsubscribeMessages = db.collection('messages')
            .where('conversationId', '==', conversationId)
            .orderBy('createdAt', 'asc')
            .onSnapshot((snapshot) => {
                this.messages = [];
                snapshot.forEach(doc => {
                    this.messages.push({ id: doc.id, ...doc.data() });
                });
                this.renderMessages();
            }, (error) => {
                console.error('Error loading messages:', error);
            });
    }

    renderMessages() {
        const messagesMain = document.getElementById('messagesMain');
        if (!messagesMain) return;

        messagesMain.innerHTML = '';

        this.messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            messagesMain.appendChild(messageElement);
        });

        // Scroll to bottom
        messagesMain.scrollTop = messagesMain.scrollHeight;
    }

    createMessageElement(message) {
        const isOwn = message.senderId === this.currentUser.uid;
        const div = document.createElement('div');
        div.className = `message ${isOwn ? 'own-message' : 'other-message'}`;
        
        let replyHtml = '';
        if (message.replyTo) {
            const replied = this.messages.find(m => m.id === message.replyTo);
            if (replied) {
                replyHtml = `<div class="reply-quoted"><strong>${replied.senderName || 'User'}:</strong> <span>${replied.text || '[media]'}</span></div>`;
            }
        }
        
        let messageContent = '';
        
        // Handle different message types
        if (message.deleted) {
            messageContent = `<em class="deleted-message">(message deleted)</em>`;
        } else if (message.media) {
            switch (message.media.type) {
                case 'photo':
                    messageContent = `<img src="${message.media.url}" alt="Photo" class="message-media">`;
                    break;
                case 'video':
                    messageContent = `<video src="${message.media.url}" controls class="message-media"></video>`;
                    break;
                case 'voice':
                    messageContent = `
                        <div class="voice-message">
                            <audio src="${message.media.url}" controls></audio>
                            <span class="voice-duration">${message.media.duration}s</span>
                        </div>
                    `;
                    break;
                case 'file':
                    messageContent = `
                        <div class="file-message">
                            <span class="file-icon">📎</span>
                            <span class="file-name">${message.media.fileName}</span>
                            <a href="${message.media.url}" download class="file-download">Download</a>
                        </div>
                    `;
                    break;
            }
        } else {
            messageContent = `<p>${message.text}${message.edited ? ' <span class="edited-tag">(edited)</span>' : ''}</p>`;
        }
        
        // Add reactions
        const reactionsHtml = this.createReactionsHtml(message.reactions);
        
        // Add read receipts
        const readReceiptsHtml = this.createReadReceiptsHtml(message.readBy);
        
        // Add message actions
        const messageActionsHtml = this.createMessageActionsHtml(message, isOwn);
        
        div.innerHTML = `
            <div class="message-header">
                <span class="message-author">${isOwn ? 'You' : message.senderName}</span>
                <span class="message-time">${this.formatTimestamp(message.createdAt)}</span>
            </div>
            ${replyHtml}
            <div class="message-content">
                ${messageContent}
                ${reactionsHtml}
                ${readReceiptsHtml}
            </div>
            ${messageActionsHtml}
        `;
        
        return div;
    }

    createReactionsHtml(reactions) {
        if (!reactions || Object.keys(reactions).length === 0) return '';
        
        const reactionElements = Object.entries(reactions).map(([reaction, users]) => {
            const count = users.length;
            return `<span class="reaction-badge" onclick="this.showReactionUsers('${reaction}', ${count})">${reaction} ${count}</span>`;
        });
        
        return `<div class="message-reactions">${reactionElements.join('')}</div>`;
    }

    createReadReceiptsHtml(readBy) {
        if (!readBy || readBy.length === 0) return '';
        
        const isOwn = this.currentUser.uid === this.senderId;
        if (!isOwn) return '';
        
        return `<div class="read-receipts">✓✓ Seen</div>`;
    }

    createMessageActionsHtml(message, isOwn) {
        return `
            <div class="message-actions">
                <button class="action-btn" onclick="this.showReactionPicker('${message.id}', event)">😊</button>
                ${isOwn ? `
                    <button class="action-btn" onclick="this.editMessage('${message.id}')">✏️</button>
                    <button class="action-btn" onclick="this.deleteMessage('${message.id}')">🗑️</button>
                ` : ''}
                <button class="action-btn" onclick="this.replyToMessage('${message.id}')">↩️</button>
            </div>
        `;
    }

    replyToMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message) return;
        this.replyToMessageId = messageId;
        this.replyToMessageData = message;
        this.showReplyPreview(message);
    }

    showReplyPreview(message) {
        let replyPreview = document.getElementById('replyPreview');
        if (!replyPreview) {
            replyPreview = document.createElement('div');
            replyPreview.id = 'replyPreview';
            replyPreview.className = 'reply-preview';
            const inputContainer = document.querySelector('.message-input-container');
            if (inputContainer) inputContainer.prepend(replyPreview);
        }
        replyPreview.innerHTML = `
            <div class="reply-preview-content">
                <strong>Replying to ${message.senderName || 'User'}:</strong>
                <span>${message.text || '[media]'}</span>
                <button class="close-reply-btn" aria-label="Cancel reply">&times;</button>
            </div>
        `;
        replyPreview.querySelector('.close-reply-btn').onclick = () => this.cancelReply();
    }

    cancelReply() {
        this.replyToMessageId = null;
        this.replyToMessageData = null;
        const replyPreview = document.getElementById('replyPreview');
        if (replyPreview) replyPreview.remove();
    }

    editMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message || message.senderId !== this.currentUser.uid) return;
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.value = message.text;
            messageInput.focus();
            this.editingMessageId = messageId;
            this.showEditPreview(message);
        }
    }

    showEditPreview(message) {
        let editPreview = document.getElementById('editPreview');
        if (!editPreview) {
            editPreview = document.createElement('div');
            editPreview.id = 'editPreview';
            editPreview.className = 'edit-preview';
            const inputContainer = document.querySelector('.message-input-container');
            if (inputContainer) inputContainer.prepend(editPreview);
        }
        editPreview.innerHTML = `
            <div class="edit-preview-content">
                <strong>Editing your message:</strong>
                <span>${message.text}</span>
                <button class="close-edit-btn" aria-label="Cancel edit">&times;</button>
            </div>
        `;
        editPreview.querySelector('.close-edit-btn').onclick = () => this.cancelEdit();
    }

    cancelEdit() {
        this.editingMessageId = null;
        const editPreview = document.getElementById('editPreview');
        if (editPreview) editPreview.remove();
        const messageInput = document.getElementById('messageInput');
        if (messageInput) messageInput.value = '';
    }

    async saveEditedMessage(messageId) {
        const messageInput = document.getElementById('messageInput');
        if (!messageInput) return;
        const newText = messageInput.value.trim();
        if (!newText) return;
        try {
            await db.collection('messages').doc(messageId).update({
                text: newText,
                edited: true
            });
            this.cancelEdit();
        } catch (error) {
            console.error('Error saving edited message:', error);
        }
    }

    async deleteMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message || message.senderId !== this.currentUser.uid) return;
        try {
            await db.collection('messages').doc(messageId).update({
                text: '',
                deleted: true
            });
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    }

    async sendMessage(conversationId, text, media = null) {
        if (this.editingMessageId) {
            await this.saveEditedMessage(this.editingMessageId);
            return;
        }
        if (!this.currentUser || !conversationId) {
            console.error('Cannot send message: missing user or conversation');
            return;
        }

        try {
            console.log('Sending message to conversation:', conversationId);
            
            const messageData = {
                conversationId: conversationId,
                senderId: this.currentUser.uid,
                senderName: this.userProfile?.displayName || 'Anonymous',
                senderPic: this.userProfile?.profilePic || '',
                text: text.trim(),
                createdAt: new Date(),
                readBy: [],
                replyTo: this.replyToMessageId || null
            };
            
            if (media) {
                messageData.media = media;
            }

            console.log('Message data:', messageData);

            // Add message to Firestore
            await db.collection('messages').add(messageData);

            // Update conversation's last message
            const lastMessageText = media ? `Sent ${media.type}` : text.trim();
            await db.collection('conversations').doc(conversationId).update({
                lastMessage: lastMessageText,
                lastMessageAt: new Date()
            });

            console.log('Message sent successfully!');
            this.cancelReply(); // Clear reply preview after sending

        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        }
    }

    showNewConversationModal() {
        // Remove any existing modal
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        // Create modal
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>Start New Conversation</h3>
                    <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <input type="text" id="userSearch" placeholder="Search users..." class="search-input">
                    <div id="usersList" class="users-list"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        this.loadUsers();
        
        // Close on outside click
        overlay.onclick = (e) => {
            if (e.target === overlay) overlay.remove();
        };
    }

    async loadUsers() {
        if (!this.currentUser) return;

        try {
            const usersSnapshot = await db.collection('users')
                .where('uid', '!=', this.currentUser.uid)
                .limit(20)
                .get();
            
            const users = [];
            usersSnapshot.forEach(doc => {
                users.push({ uid: doc.id, ...doc.data() });
            });
            
            this.renderUsers(users);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    renderUsers(users) {
        const usersList = document.getElementById('usersList');
        if (!usersList) return;

        usersList.innerHTML = '';

        if (users.length === 0) {
            usersList.innerHTML = '<p>No users found</p>';
            return;
        }

        users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'user-item';
            userElement.onclick = () => this.startConversation(user.uid);
            
            userElement.innerHTML = `
                <img src="${user.profilePic || 'default-avatar.svg'}" alt="User" class="user-avatar">
                <div class="user-info">
                    <h4>${user.displayName || 'Unknown User'}</h4>
                    <p>@${user.username || 'unknown'}</p>
                </div>
            `;

            usersList.appendChild(userElement);
        });
    }

    async startConversation(otherUserId) {
        if (!this.currentUser) return;

        try {
            // Check if conversation already exists
            const existingConversation = this.conversations.find(conv => 
                conv.participants.includes(otherUserId)
            );

            if (existingConversation) {
                this.selectConversation(existingConversation.id, otherUserId);
                this.closeModals();
                return;
            }

            // Get other user's data
            const otherUserDoc = await db.collection('users').doc(otherUserId).get();
            const otherUser = otherUserDoc.data();

            // Create new conversation
            const conversationData = {
                participants: [this.currentUser.uid, otherUserId],
                participantsData: [
                    {
                        uid: this.currentUser.uid,
                        displayName: this.userProfile?.displayName || 'Anonymous',
                        profilePic: this.userProfile?.profilePic || ''
                    },
                    {
                        uid: otherUserId,
                        displayName: otherUser?.displayName || 'Unknown User',
                        profilePic: otherUser?.profilePic || ''
                    }
                ],
                createdAt: new Date(),
                lastMessageAt: new Date()
            };

            const conversationRef = await db.collection('conversations').add(conversationData);
            
            // Add to conversations list
            this.conversations.unshift({ id: conversationRef.id, ...conversationData });
            this.renderConversations();

            // Select the new conversation
            this.selectConversation(conversationRef.id, otherUserId);
            this.closeModals();

        } catch (error) {
            console.error('Error starting conversation:', error);
            alert('Failed to start conversation. Please try again.');
        }
    }

    filterConversations(query) {
        const conversationsList = document.getElementById('conversationsList');
        if (!conversationsList) return;
        
        if (!query.trim()) {
            this.renderConversations();
            return;
        }
        
        const filteredConversations = this.conversations.filter(conversation => {
            const otherUserId = conversation.participants.find(id => id !== this.currentUser.uid);
            const otherUser = conversation.participantsData?.find(user => user.uid === otherUserId);
            
            return otherUser?.displayName?.toLowerCase().includes(query.toLowerCase()) ||
                   conversation.lastMessage?.toLowerCase().includes(query.toLowerCase());
        });
        
        this.renderFilteredConversations(filteredConversations);
    }

    renderFilteredConversations(conversations) {
        const conversationsList = document.getElementById('conversationsList');
        if (!conversationsList) return;
        
        conversationsList.innerHTML = '';
        
        if (conversations.length === 0) {
            conversationsList.innerHTML = '<p>No conversations found</p>';
            return;
        }
        
        conversations.forEach(conversation => {
            const conversationElement = this.createConversationElement(conversation);
            conversationsList.appendChild(conversationElement);
        });
    }

    closeModals() {
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.remove();
        });
    }

    formatTimestamp(timestamp) {
        if (!timestamp) return '';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return date.toLocaleDateString();
    }

    showSidebarMobile() {
        document.querySelector('.conversations-sidebar').classList.add('show-mobile');
        document.querySelector('.messages-container').classList.add('hide-mobile');
    }

    showChatMobile() {
        document.querySelector('.conversations-sidebar').classList.remove('show-mobile');
        document.querySelector('.messages-container').classList.remove('hide-mobile');
    }

        

    showGroupChatModal() {
        // Remove any existing modal
        document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
        
        // Create modal
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>New Group Chat</h3>
                    <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <input type="text" id="groupNameInput" placeholder="Group name..." class="search-input">
                    <input type="file" id="groupAvatarInput" accept="image/*" style="margin-bottom: 12px;">
                    <input type="text" id="groupUserSearch" placeholder="Search users..." class="search-input">
                    <div id="groupUsersList" class="users-list"></div>
                    <button id="createGroupBtn" class="send-btn" style="margin-top: 16px;">Create Group</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        this.loadUsersForGroup();
        
        // Close on outside click
        overlay.onclick = (e) => {
            if (e.target === overlay) overlay.remove();
        };
        
        // User search
        overlay.querySelector('#groupUserSearch').oninput = (e) => this.searchUsersForGroup(e.target.value);
        
        // Create group button
        overlay.querySelector('#createGroupBtn').onclick = () => this.createGroupChat();
    }

    async loadUsersForGroup() {
        if (!this.currentUser) return;
        try {
            const usersSnapshot = await db.collection('users')
                .where('uid', '!=', this.currentUser.uid)
                .limit(50)
                .get();
            const users = [];
            usersSnapshot.forEach(doc => {
                users.push({ uid: doc.id, ...doc.data() });
            });
            this.renderUsersForGroup(users);
        } catch (error) {
            console.error('Error loading users for group:', error);
        }
    }

    renderUsersForGroup(users) {
        const usersList = document.getElementById('groupUsersList');
        if (!usersList) return;
        usersList.innerHTML = '';
        users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'user-item';
            userElement.innerHTML = `
                <input type="checkbox" class="group-user-checkbox" value="${user.uid}">
                <img src="${user.profilePic || 'default-avatar.svg'}" alt="User" class="user-avatar">
                <div class="user-info">
                    <h4>${user.displayName || 'Unknown User'}</h4>
                    <p>@${user.username || 'unknown'}</p>
                </div>
            `;
            usersList.appendChild(userElement);
        });
    }

    async createGroupChat() {
        const groupName = document.getElementById('groupNameInput').value.trim();
        const groupAvatarInput = document.getElementById('groupAvatarInput');
        const checkboxes = document.querySelectorAll('.group-user-checkbox:checked');
        if (!groupName || checkboxes.length === 0) {
            return;
        }
        const participantIds = [this.currentUser.uid, ...Array.from(checkboxes).map(cb => cb.value)];
        let groupAvatarUrl = '';
        if (groupAvatarInput.files && groupAvatarInput.files[0]) {
            // Upload group avatar to storage
            const file = groupAvatarInput.files[0];
            const storageRef = storage.ref();
            const fileRef = storageRef.child(`group_avatars/${Date.now()}_${file.name}`);
            const snapshot = await fileRef.put(file);
            groupAvatarUrl = await snapshot.ref.getDownloadURL();
        }
        // Fetch user data for participantsData
        const participantsData = [];
        for (const uid of participantIds) {
            const userDoc = await db.collection('users').doc(uid).get();
            if (userDoc.exists) {
                const data = userDoc.data();
                participantsData.push({
                    uid,
                    displayName: data.displayName || 'Unknown User',
                    profilePic: data.profilePic || ''
                });
            }
        }
        // Create group conversation
        const conversationData = {
            participants: participantIds,
            participantsData,
            groupName,
            groupAvatar: groupAvatarUrl,
            isGroup: true,
            createdAt: new Date(),
            lastMessageAt: new Date()
        };
        const conversationRef = await db.collection('conversations').add(conversationData);
        this.conversations.unshift({ id: conversationRef.id, ...conversationData });
        this.renderConversations();
        this.selectConversation(conversationRef.id, null);
        this.closeModals();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.messagesPage = new MessagesPage();
}); 