// iMessage Features - Complete Implementation
class iMessageFeatures {
    constructor() {
        this.reactions = ['❤️', '👍', '👎', '😂', '😮', '😢', '😡'];
        this.typingUsers = new Map();
        this.readReceipts = new Map();
        this.replyToMessage = null;
        this.messageReactions = new Map();
        this.typingTimeout = null;
        this.lastTypingTime = 0;
        
        this.init();
    }

    init() {
        console.log('🎨 Initializing iMessage Features...');
        this.setupReactionSystem();
        this.setupReplySystem();
        this.setupTypingIndicators();
        this.setupReadReceipts();
        this.setupMessageActions();
        this.setupContextMenus();
        this.setupMessageAnimations();
        console.log('✅ iMessage Features initialized');
    }

    // ===== REACTION SYSTEM =====
    setupReactionSystem() {
        // Add reaction buttons to messages
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('message-bubble')) {
                this.showReactionMenu(e);
            }
        });

        // Handle reaction selection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('reaction-option')) {
                this.addReaction(e.target.dataset.messageId, e.target.textContent);
            }
        });
    }

    showReactionMenu(event) {
        const messageId = event.target.closest('.message').dataset.messageId;
        const rect = event.target.getBoundingClientRect();
        
        const menu = document.createElement('div');
        menu.className = 'reaction-menu';
        menu.innerHTML = `
            <div class="reaction-options">
                ${this.reactions.map(reaction => `
                    <button class="reaction-option" data-message-id="${messageId}">
                        ${reaction}
                    </button>
                `).join('')}
            </div>
        `;
        
        menu.style.position = 'fixed';
        menu.style.left = `${rect.left}px`;
        menu.style.top = `${rect.top - 60}px`;
        menu.style.zIndex = '1000';
        
        document.body.appendChild(menu);
        
        // Auto-remove after selection
        setTimeout(() => {
            if (menu.parentNode) {
                menu.parentNode.removeChild(menu);
            }
        }, 3000);
    }

    addReaction(messageId, reaction) {
        if (!this.messageReactions.has(messageId)) {
            this.messageReactions.set(messageId, new Map());
        }
        
        const reactions = this.messageReactions.get(messageId);
        const currentCount = reactions.get(reaction) || 0;
        reactions.set(reaction, currentCount + 1);
        
        this.updateMessageReactions(messageId);
        this.saveReactionToFirestore(messageId, reaction);
    }

    updateMessageReactions(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (!messageElement) return;
        
        let reactionsContainer = messageElement.querySelector('.message-reactions');
        if (!reactionsContainer) {
            reactionsContainer = document.createElement('div');
            reactionsContainer.className = 'message-reactions';
            messageElement.appendChild(reactionsContainer);
        }
        
        const reactions = this.messageReactions.get(messageId);
        if (!reactions) return;
        
        reactionsContainer.innerHTML = Array.from(reactions.entries())
            .map(([reaction, count]) => `
                <div class="reaction" onclick="imessageFeatures.removeReaction('${messageId}', '${reaction}')">
                    <span class="reaction-emoji">${reaction}</span>
                    <span class="reaction-count">${count}</span>
                </div>
            `).join('');
    }

    removeReaction(messageId, reaction) {
        const reactions = this.messageReactions.get(messageId);
        if (!reactions) return;
        
        const currentCount = reactions.get(reaction) || 0;
        if (currentCount > 1) {
            reactions.set(reaction, currentCount - 1);
        } else {
            reactions.delete(reaction);
        }
        
        this.updateMessageReactions(messageId);
        this.saveReactionToFirestore(messageId, reaction, true);
    }

    async saveReactionToFirestore(messageId, reaction, isRemoval = false) {
        try {
            const reactionData = {
                reaction,
                userId: messagesApp.currentUser.uid,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                isRemoval
            };
            
            await firebase.firestore()
                .collection('messageReactions')
                .doc(messageId)
                .collection('reactions')
                .add(reactionData);
        } catch (error) {
            console.error('Error saving reaction:', error);
        }
    }

    // ===== REPLY SYSTEM =====
    setupReplySystem() {
        // Add reply functionality to messages
        document.addEventListener('contextmenu', (e) => {
            if (e.target.classList.contains('message-bubble')) {
                e.preventDefault();
                this.showReplyOptions(e);
            }
        });
    }

    showReplyOptions(event) {
        const messageElement = event.target.closest('.message');
        const messageId = messageElement.dataset.messageId;
        const messageText = messageElement.querySelector('.message-text').textContent;
        const messageAuthor = messageElement.querySelector('.message-author').textContent;
        
        this.replyToMessage = {
            id: messageId,
            text: messageText,
            author: messageAuthor
        };
        
        this.showReplyPreview();
    }

    showReplyPreview() {
        const replyPreview = document.getElementById('replyPreview');
        const replyAuthor = document.getElementById('replyAuthor');
        const replyText = document.getElementById('replyText');
        
        if (this.replyToMessage) {
            replyAuthor.textContent = this.replyToMessage.author;
            replyText.textContent = this.replyToMessage.text;
            replyPreview.style.display = 'block';
        }
    }

    cancelReply() {
        this.replyToMessage = null;
        document.getElementById('replyPreview').style.display = 'none';
    }

    // ===== TYPING INDICATORS =====
    setupTypingIndicators() {
        const messageInput = document.getElementById('messageInput');
        
        messageInput.addEventListener('input', () => {
            this.handleTyping();
        });
        
        messageInput.addEventListener('keydown', () => {
            this.handleTyping();
        });
    }

    handleTyping() {
        const now = Date.now();
        if (now - this.lastTypingTime > 1000) {
            this.sendTypingIndicator(true);
        }
        this.lastTypingTime = now;
        
        // Clear existing timeout
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
        
        // Set new timeout to stop typing indicator
        this.typingTimeout = setTimeout(() => {
            this.sendTypingIndicator(false);
        }, 3000);
    }

    sendTypingIndicator(isTyping) {
        if (!messagesApp.currentConversation) return;
        
        try {
            firebase.firestore()
                .collection('conversations')
                .doc(messagesApp.currentConversation.id)
                .collection('typing')
                .doc(messagesApp.currentUser.uid)
                .set({
                    isTyping,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    userId: messagesApp.currentUser.uid,
                    userName: messagesApp.currentUser.displayName || 'Anonymous'
                });
        } catch (error) {
            console.error('Error sending typing indicator:', error);
        }
    }

    listenForTyping() {
        if (!messagesApp.currentConversation) return;
        
        firebase.firestore()
            .collection('conversations')
            .doc(messagesApp.currentConversation.id)
            .collection('typing')
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    const data = change.doc.data();
                    if (data.userId !== messagesApp.currentUser.uid) {
                        if (data.isTyping) {
                            this.showTypingIndicator(data.userName);
                        } else {
                            this.hideTypingIndicator(data.userId);
                        }
                    }
                });
            });
    }

    showTypingIndicator(userName) {
        const typingIndicator = document.getElementById('typingIndicator');
        const typingAvatar = document.getElementById('typingAvatar');
        
        typingAvatar.textContent = userName.charAt(0).toUpperCase();
        typingIndicator.style.display = 'flex';
    }

    hideTypingIndicator(userId) {
        const typingIndicator = document.getElementById('typingIndicator');
        typingIndicator.style.display = 'none';
    }

    // ===== READ RECEIPTS =====
    setupReadReceipts() {
        // Mark messages as read when they come into view
        const messagesContainer = document.getElementById('messagesContainer');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const messageId = entry.target.dataset.messageId;
                    if (messageId) {
                        this.markMessageAsRead(messageId);
                    }
                }
            });
        }, { threshold: 0.5 });
        
        // Observe all messages
        document.querySelectorAll('.message').forEach(message => {
            observer.observe(message);
        });
    }

    async markMessageAsRead(messageId) {
        try {
            await firebase.firestore()
                .collection('messages')
                .doc(messageId)
                .update({
                    readBy: firebase.firestore.FieldValue.arrayUnion(messagesApp.currentUser.uid),
                    readAt: firebase.firestore.FieldValue.serverTimestamp()
                });
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    }

    updateReadReceipts(messageId, readBy) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (!messageElement) return;
        
        const statusElement = messageElement.querySelector('.message-status');
        if (statusElement && readBy.includes(messagesApp.currentUser.uid)) {
            statusElement.innerHTML = `
                <svg class="status-icon read" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
            `;
        }
    }

    // ===== MESSAGE ACTIONS =====
    setupMessageActions() {
        // Add long press for mobile
        let pressTimer;
        
        document.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('message-bubble')) {
                pressTimer = setTimeout(() => {
                    this.showMessageActions(e);
                }, 500);
            }
        });
        
        document.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        });
        
        // Add right-click for desktop
        document.addEventListener('contextmenu', (e) => {
            if (e.target.classList.contains('message-bubble')) {
                e.preventDefault();
                this.showMessageActions(e);
            }
        });
    }

    showMessageActions(event) {
        const messageElement = event.target.closest('.message');
        const messageId = messageElement.dataset.messageId;
        const isOwnMessage = messageElement.classList.contains('own-message');
        
        const actions = document.createElement('div');
        actions.className = 'message-actions';
        actions.innerHTML = `
            <button class="action-btn" onclick="imessageFeatures.replyToMessage('${messageId}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9,11 12,14 22,4"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
                Reply
            </button>
            <button class="action-btn" onclick="imessageFeatures.copyMessage('${messageId}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy
            </button>
            ${isOwnMessage ? `
                <button class="action-btn" onclick="imessageFeatures.editMessage('${messageId}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                </button>
                <button class="action-btn delete" onclick="imessageFeatures.deleteMessage('${messageId}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                    </svg>
                    Delete
                </button>
            ` : ''}
        `;
        
        // Position the actions menu
        const rect = event.target.getBoundingClientRect();
        actions.style.position = 'fixed';
        actions.style.left = `${rect.left}px`;
        actions.style.top = `${rect.top - 100}px`;
        actions.style.zIndex = '1000';
        
        document.body.appendChild(actions);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (actions.parentNode) {
                actions.parentNode.removeChild(actions);
            }
        }, 3000);
    }

    replyToMessage(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        const messageText = messageElement.querySelector('.message-text').textContent;
        const messageAuthor = messageElement.querySelector('.message-author').textContent;
        
        this.replyToMessage = {
            id: messageId,
            text: messageText,
            author: messageAuthor
        };
        
        this.showReplyPreview();
        document.getElementById('messageInput').focus();
    }

    copyMessage(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        const messageText = messageElement.querySelector('.message-text').textContent;
        
        navigator.clipboard.writeText(messageText).then(() => {
            messagesApp.showToast('Message copied to clipboard', 'success');
        });
    }

    editMessage(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        const messageText = messageElement.querySelector('.message-text');
        const originalText = messageText.textContent;
        
        // Create edit input
        const editInput = document.createElement('textarea');
        editInput.className = 'edit-input';
        editInput.value = originalText;
        editInput.style.width = '100%';
        editInput.style.minHeight = '60px';
        editInput.style.padding = '8px';
        editInput.style.border = '1px solid #007AFF';
        editInput.style.borderRadius = '8px';
        editInput.style.fontSize = '17px';
        editInput.style.fontFamily = 'inherit';
        
        // Replace text with input
        messageText.style.display = 'none';
        messageText.parentNode.insertBefore(editInput, messageText);
        editInput.focus();
        
        // Add save/cancel buttons
        const editActions = document.createElement('div');
        editActions.className = 'edit-actions';
        editActions.innerHTML = `
            <button class="save-btn" onclick="imessageFeatures.saveEdit('${messageId}')">Save</button>
            <button class="cancel-btn" onclick="imessageFeatures.cancelEdit('${messageId}')">Cancel</button>
        `;
        editInput.parentNode.appendChild(editActions);
        
        // Handle Enter key
        editInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.saveEdit(messageId);
            }
        });
    }

    async saveEdit(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        const editInput = messageElement.querySelector('.edit-input');
        const newText = editInput.value.trim();
        
        if (newText === '') return;
        
        try {
            await firebase.firestore()
                .collection('messages')
                .doc(messageId)
                .update({
                    text: newText,
                    edited: true,
                    editedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            
            // Update UI
            const messageText = messageElement.querySelector('.message-text');
            messageText.textContent = newText;
            messageText.style.display = 'block';
            editInput.remove();
            messageElement.querySelector('.edit-actions').remove();
            
            messagesApp.showToast('Message edited', 'success');
        } catch (error) {
            console.error('Error editing message:', error);
            messagesApp.showToast('Failed to edit message', 'error');
        }
    }

    cancelEdit(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        const messageText = messageElement.querySelector('.message-text');
        
        messageText.style.display = 'block';
        messageElement.querySelector('.edit-input').remove();
        messageElement.querySelector('.edit-actions').remove();
    }

    async deleteMessage(messageId) {
        if (!confirm('Are you sure you want to delete this message?')) return;
        
        try {
            await firebase.firestore()
                .collection('messages')
                .doc(messageId)
                .delete();
            
            const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
            if (messageElement) {
                messageElement.remove();
            }
            
            messagesApp.showToast('Message deleted', 'success');
        } catch (error) {
            console.error('Error deleting message:', error);
            messagesApp.showToast('Failed to delete message', 'error');
        }
    }

    // ===== CONTEXT MENUS =====
    setupContextMenus() {
        // Add context menu for conversations
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.conversation-item')) {
                e.preventDefault();
                this.showConversationContextMenu(e);
            }
        });
    }

    showConversationContextMenu(event) {
        const conversationElement = event.target.closest('.conversation-item');
        const conversationId = conversationElement.dataset.conversationId;
        
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.innerHTML = `
            <button class="menu-item" onclick="imessageFeatures.pinConversation('${conversationId}')">
                📌 Pin Conversation
            </button>
            <button class="menu-item" onclick="imessageFeatures.muteConversation('${conversationId}')">
                🔇 Mute
            </button>
            <button class="menu-item" onclick="imessageFeatures.archiveConversation('${conversationId}')">
                📁 Archive
            </button>
            <button class="menu-item delete" onclick="imessageFeatures.deleteConversation('${conversationId}')">
                🗑️ Delete
            </button>
        `;
        
        menu.style.position = 'fixed';
        menu.style.left = `${event.clientX}px`;
        menu.style.top = `${event.clientY}px`;
        menu.style.zIndex = '1000';
        
        document.body.appendChild(menu);
        
        // Remove on click outside
        document.addEventListener('click', () => {
            if (menu.parentNode) {
                menu.parentNode.removeChild(menu);
            }
        }, { once: true });
    }

    // ===== MESSAGE ANIMATIONS =====
    setupMessageAnimations() {
        // Add entrance animations for new messages
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.classList && node.classList.contains('message')) {
                        this.animateMessageIn(node);
                    }
                });
            });
        });
        
        const messagesList = document.getElementById('messagesList');
        if (messagesList) {
            observer.observe(messagesList, { childList: true });
        }
    }

    animateMessageIn(messageElement) {
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(20px)';
        
        requestAnimationFrame(() => {
            messageElement.style.transition = 'all 0.3s ease-out';
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
        });
    }

    // ===== CONVERSATION MANAGEMENT =====
    async pinConversation(conversationId) {
        try {
            await firebase.firestore()
                .collection('conversations')
                .doc(conversationId)
                .update({
                    pinned: true,
                    pinnedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            
            messagesApp.showToast('Conversation pinned', 'success');
        } catch (error) {
            console.error('Error pinning conversation:', error);
        }
    }

    async muteConversation(conversationId) {
        try {
            await firebase.firestore()
                .collection('conversations')
                .doc(conversationId)
                .update({
                    muted: true,
                    mutedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            
            messagesApp.showToast('Conversation muted', 'success');
        } catch (error) {
            console.error('Error muting conversation:', error);
        }
    }

    async archiveConversation(conversationId) {
        try {
            await firebase.firestore()
                .collection('conversations')
                .doc(conversationId)
                .update({
                    archived: true,
                    archivedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            
            messagesApp.showToast('Conversation archived', 'success');
        } catch (error) {
            console.error('Error archiving conversation:', error);
        }
    }

    async deleteConversation(conversationId) {
        if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) return;
        
        try {
            await firebase.firestore()
                .collection('conversations')
                .doc(conversationId)
                .delete();
            
            messagesApp.showToast('Conversation deleted', 'success');
            messagesApp.loadConversations();
        } catch (error) {
            console.error('Error deleting conversation:', error);
        }
    }

    // ===== UTILITY FUNCTIONS =====
    formatTimestamp(timestamp) {
        if (!timestamp) return '';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // Less than 1 minute
            return 'Just now';
        } else if (diff < 3600000) { // Less than 1 hour
            const minutes = Math.floor(diff / 60000);
            return `${minutes}m`;
        } else if (diff < 86400000) { // Less than 1 day
            const hours = Math.floor(diff / 3600000);
            return `${hours}h`;
        } else if (diff < 604800000) { // Less than 1 week
            const days = Math.floor(diff / 86400000);
            return `${days}d`;
        } else {
            return date.toLocaleDateString();
        }
    }

    // ===== PUBLIC API =====
    getReplyToMessage() {
        return this.replyToMessage;
    }

    clearReplyToMessage() {
        this.replyToMessage = null;
        this.cancelReply();
    }

    startTypingListener() {
        this.listenForTyping();
    }

    stopTypingListener() {
        // Clean up typing listeners when conversation changes
        this.typingUsers.clear();
        this.hideTypingIndicator();
    }
}

// Initialize iMessage Features
const imessageFeatures = new iMessageFeatures();

// Export for use in other files
window.imessageFeatures = imessageFeatures; 