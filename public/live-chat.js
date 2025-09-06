// Live Chat System for Amplifi
// Real-time chat with moderation, reactions, and interactive features

class LiveChatSystem {
    constructor(streamId, options = {}) {
        this.streamId = streamId;
        this.options = {
            maxMessages: 1000,
            messageRateLimit: 3, // messages per second
            enableModeration: true,
            enableReactions: true,
            enablePolls: true,
            enableGifts: true,
            ...options
        };
        
        this.messages = [];
        this.users = new Map();
        this.moderators = new Set();
        this.bannedUsers = new Set();
        this.reactions = new Map();
        this.polls = [];
        this.gifts = [];
        this.messageQueue = [];
        this.lastMessageTime = new Map();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.startMessageProcessor();
        this.loadModerationSettings();
        console.log('Live Chat System initialized for stream:', this.streamId);
    }
    
    setupEventListeners() {
        // Chat input events
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-chat');
        const emojiButton = document.getElementById('emoji-button');
        
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        if (sendButton) {
            sendButton.addEventListener('click', () => this.sendMessage());
        }
        
        if (emojiButton) {
            emojiButton.addEventListener('click', () => this.toggleEmojiPicker());
        }
        
        // Reaction events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('reaction-btn')) {
                this.addReaction(e.target.dataset.messageId, e.target.dataset.reaction);
            }
        });
        
        // Poll events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('poll-option')) {
                this.voteInPoll(e.target.dataset.pollId, e.target.dataset.option);
            }
        });
    }
    
    sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Check rate limiting
        if (this.isRateLimited()) {
            this.showNotification('You are sending messages too quickly. Please slow down.', 'warning');
            return;
        }
        
        // Check if user is banned
        if (this.bannedUsers.has(this.getCurrentUserId())) {
            this.showNotification('You are banned from this chat.', 'error');
            return;
        }
        
        // Check moderation
        if (this.options.enableModeration && this.isMessageFlagged(message)) {
            this.showNotification('Message contains inappropriate content.', 'warning');
            return;
        }
        
        const messageData = {
            id: this.generateId(),
            userId: this.getCurrentUserId(),
            username: this.getCurrentUsername(),
            avatar: this.getCurrentUserAvatar(),
            message: message,
            timestamp: Date.now(),
            reactions: {},
            isModerator: this.moderators.has(this.getCurrentUserId()),
            isVerified: this.isUserVerified(this.getCurrentUserId())
        };
        
        this.addMessage(messageData);
        input.value = '';
        
        // Simulate real-time broadcast
        this.broadcastMessage(messageData);
    }
    
    addMessage(messageData) {
        this.messages.push(messageData);
        
        // Keep only recent messages
        if (this.messages.length > this.options.maxMessages) {
            this.messages.shift();
        }
        
        this.renderMessage(messageData);
        this.updateMessageCount();
    }
    
    renderMessage(messageData) {
        const chatContainer = document.getElementById('chat-messages');
        if (!chatContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        messageElement.dataset.messageId = messageData.id;
        
        const isCurrentUser = messageData.userId === this.getCurrentUserId();
        const messageClass = isCurrentUser ? 'chat-message-own' : 'chat-message-other';
        
        messageElement.innerHTML = `
            <div class="chat-message-content ${messageClass}">
                <div class="chat-message-header">
                    <img src="${messageData.avatar}" alt="${messageData.username}" class="chat-avatar">
                    <span class="chat-username ${messageData.isVerified ? 'verified' : ''}">
                        ${messageData.username}
                        ${messageData.isModerator ? '<i class="fas fa-shield-alt moderator-badge"></i>' : ''}
                    </span>
                    <span class="chat-timestamp">${this.formatTimestamp(messageData.timestamp)}</span>
                </div>
                <div class="chat-message-text">${this.escapeHtml(messageData.message)}</div>
                <div class="chat-message-actions">
                    <button class="reaction-btn" data-message-id="${messageData.id}" data-reaction="❤️">❤️</button>
                    <button class="reaction-btn" data-message-id="${messageData.id}" data-reaction="👍">👍</button>
                    <button class="reaction-btn" data-message-id="${messageData.id}" data-reaction="😂">😂</button>
                    <button class="reaction-btn" data-message-id="${messageData.id}" data-reaction="🔥">🔥</button>
                    ${this.canModerate() ? `
                        <button class="moderate-btn" onclick="liveChat.moderateMessage('${messageData.id}')">
                            <i class="fas fa-gavel"></i>
                        </button>
                    ` : ''}
                </div>
                <div class="chat-reactions" id="reactions-${messageData.id}"></div>
            </div>
        `;
        
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Add animation
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(20px)';
        setTimeout(() => {
            messageElement.style.transition = 'all 0.3s ease';
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
        }, 10);
    }
    
    addReaction(messageId, reaction) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message) return;
        
        if (!message.reactions[reaction]) {
            message.reactions[reaction] = 0;
        }
        message.reactions[reaction]++;
        
        this.updateReactionsDisplay(messageId);
        this.showNotification(`Added ${reaction} reaction!`, 'success');
    }
    
    updateReactionsDisplay(messageId) {
        const reactionsContainer = document.getElementById(`reactions-${messageId}`);
        if (!reactionsContainer) return;
        
        const message = this.messages.find(m => m.id === messageId);
        if (!message) return;
        
        reactionsContainer.innerHTML = Object.entries(message.reactions)
            .map(([reaction, count]) => `<span class="reaction-count">${reaction} ${count}</span>`)
            .join('');
    }
    
    // Moderation System
    moderateMessage(messageId) {
        if (!this.canModerate()) return;
        
        const message = this.messages.find(m => m.id === messageId);
        if (!message) return;
        
        const action = prompt(`Moderate message by ${message.username}:\n"${message.message}"\n\nActions: delete, timeout, ban, warn`);
        
        switch (action?.toLowerCase()) {
            case 'delete':
                this.deleteMessage(messageId);
                break;
            case 'timeout':
                this.timeoutUser(message.userId, 300); // 5 minutes
                break;
            case 'ban':
                this.banUser(message.userId);
                break;
            case 'warn':
                this.warnUser(message.userId);
                break;
        }
    }
    
    deleteMessage(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            messageElement.style.transition = 'all 0.3s ease';
            messageElement.style.opacity = '0';
            messageElement.style.transform = 'translateX(-100%)';
            setTimeout(() => messageElement.remove(), 300);
        }
        
        this.messages = this.messages.filter(m => m.id !== messageId);
        this.showNotification('Message deleted', 'success');
    }
    
    timeoutUser(userId, seconds) {
        this.lastMessageTime.set(userId, Date.now() + (seconds * 1000));
        this.showNotification(`User timed out for ${seconds} seconds`, 'warning');
    }
    
    banUser(userId) {
        this.bannedUsers.add(userId);
        this.showNotification('User banned from chat', 'error');
    }
    
    warnUser(userId) {
        this.showNotification(`Warning sent to user`, 'warning');
    }
    
    // Poll System
    createPoll(question, options, duration = 300) {
        const poll = {
            id: this.generateId(),
            question,
            options: options.map(opt => ({ text: opt, votes: 0 })),
            duration,
            startTime: Date.now(),
            endTime: Date.now() + (duration * 1000),
            voters: new Set()
        };
        
        this.polls.push(poll);
        this.renderPoll(poll);
        
        // Auto-end poll
        setTimeout(() => this.endPoll(poll.id), duration * 1000);
        
        this.showNotification('Poll created!', 'success');
    }
    
    renderPoll(poll) {
        const pollsContainer = document.getElementById('live-polls');
        if (!pollsContainer) return;
        
        const pollElement = document.createElement('div');
        pollElement.className = 'live-poll';
        pollElement.dataset.pollId = poll.id;
        
        pollElement.innerHTML = `
            <div class="poll-header">
                <h4>📊 ${poll.question}</h4>
                <span class="poll-timer" id="timer-${poll.id}"></span>
            </div>
            <div class="poll-options">
                ${poll.options.map((option, index) => `
                    <button class="poll-option" data-poll-id="${poll.id}" data-option="${index}">
                        ${option.text} <span class="vote-count">${option.votes}</span>
                    </button>
                `).join('')}
            </div>
        `;
        
        pollsContainer.appendChild(pollElement);
        this.startPollTimer(poll.id);
    }
    
    voteInPoll(pollId, optionIndex) {
        const poll = this.polls.find(p => p.id === pollId);
        if (!poll || poll.voters.has(this.getCurrentUserId())) return;
        
        poll.options[optionIndex].votes++;
        poll.voters.add(this.getCurrentUserId());
        
        this.updatePollDisplay(pollId);
        this.showNotification('Vote recorded!', 'success');
    }
    
    updatePollDisplay(pollId) {
        const pollElement = document.querySelector(`[data-poll-id="${pollId}"]`);
        if (!pollElement) return;
        
        const poll = this.polls.find(p => p.id === pollId);
        if (!poll) return;
        
        const voteCounts = pollElement.querySelectorAll('.vote-count');
        poll.options.forEach((option, index) => {
            if (voteCounts[index]) {
                voteCounts[index].textContent = option.votes;
            }
        });
    }
    
    startPollTimer(pollId) {
        const timerElement = document.getElementById(`timer-${pollId}`);
        if (!timerElement) return;
        
        const updateTimer = () => {
            const poll = this.polls.find(p => p.id === pollId);
            if (!poll) return;
            
            const remaining = Math.max(0, Math.floor((poll.endTime - Date.now()) / 1000));
            if (remaining > 0) {
                timerElement.textContent = `${Math.floor(remaining / 60)}:${(remaining % 60).toString().padStart(2, '0')}`;
                setTimeout(updateTimer, 1000);
            } else {
                timerElement.textContent = 'Ended';
                this.endPoll(pollId);
            }
        };
        
        updateTimer();
    }
    
    endPoll(pollId) {
        const poll = this.polls.find(p => p.id === pollId);
        if (!poll) return;
        
        const pollElement = document.querySelector(`[data-poll-id="${pollId}"]`);
        if (pollElement) {
            pollElement.classList.add('poll-ended');
            pollElement.innerHTML += `
                <div class="poll-results">
                    <h5>Final Results:</h5>
                    ${poll.options.map(option => `
                        <div class="poll-result">
                            ${option.text}: ${option.votes} votes
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        this.showNotification('Poll ended!', 'info');
    }
    
    // Gift System
    sendGift(giftType, recipientId = null) {
        const gift = {
            id: this.generateId(),
            type: giftType,
            sender: this.getCurrentUserId(),
            senderName: this.getCurrentUsername(),
            recipient: recipientId,
            timestamp: Date.now(),
            value: this.getGiftValue(giftType)
        };
        
        this.gifts.push(gift);
        this.renderGift(gift);
        this.showNotification(`Gift sent: ${giftType}!`, 'success');
    }
    
    renderGift(gift) {
        const giftsContainer = document.getElementById('live-gifts');
        if (!giftsContainer) return;
        
        const giftElement = document.createElement('div');
        giftElement.className = 'live-gift';
        giftElement.innerHTML = `
            <div class="gift-content">
                <span class="gift-icon">${this.getGiftIcon(gift.type)}</span>
                <span class="gift-text">${gift.senderName} sent ${gift.type}</span>
                <span class="gift-value">$${gift.value}</span>
            </div>
        `;
        
        giftsContainer.appendChild(giftElement);
        
        // Auto-remove gift after 5 seconds
        setTimeout(() => {
            giftElement.style.transition = 'all 0.3s ease';
            giftElement.style.opacity = '0';
            giftElement.style.transform = 'translateY(-20px)';
            setTimeout(() => giftElement.remove(), 300);
        }, 5000);
    }
    
    getGiftIcon(giftType) {
        const giftIcons = {
            'Rose': '🌹',
            'Heart': '💖',
            'Star': '⭐',
            'Crown': '👑',
            'Diamond': '💎',
            'Rocket': '🚀',
            'Fire': '🔥',
            'Rainbow': '🌈'
        };
        return giftIcons[giftType] || '🎁';
    }
    
    getGiftValue(giftType) {
        const giftValues = {
            'Rose': 1,
            'Heart': 2,
            'Star': 5,
            'Crown': 10,
            'Diamond': 25,
            'Rocket': 50,
            'Fire': 100,
            'Rainbow': '500'
        };
        return giftValues[giftType] || 1;
    }
    
    // Utility Functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    formatTimestamp(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return new Date(timestamp).toLocaleDateString();
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    isRateLimited() {
        const userId = this.getCurrentUserId();
        const now = Date.now();
        const lastMessage = this.lastMessageTime.get(userId) || 0;
        
        if (now - lastMessage < (1000 / this.options.messageRateLimit)) {
            return true;
        }
        
        this.lastMessageTime.set(userId, now);
        return false;
    }
    
    isMessageFlagged(message) {
        const flaggedWords = ['spam', 'inappropriate', 'banned'];
        return flaggedWords.some(word => message.toLowerCase().includes(word));
    }
    
    canModerate() {
        return this.moderators.has(this.getCurrentUserId()) || this.isStreamOwner();
    }
    
    isStreamOwner() {
        // Check if current user owns the stream
        return true; // Simplified for demo
    }
    
    getCurrentUserId() {
        // Get current user ID from session/localStorage
        return localStorage.getItem('userId') || 'user_' + Math.random().toString(36).substr(2, 9);
    }
    
    getCurrentUsername() {
        return localStorage.getItem('username') || 'Anonymous';
    }
    
    getCurrentUserAvatar() {
        return localStorage.getItem('userAvatar') || 'https://via.placeholder.com/40x40/667eea/ffffff?text=U';
    }
    
    isUserVerified(userId) {
        // Check if user is verified
        return Math.random() > 0.8; // Simplified for demo
    }
    
    updateMessageCount() {
        const countElement = document.getElementById('message-count');
        if (countElement) {
            countElement.textContent = this.messages.length;
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.transition = 'all 0.3s ease';
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    broadcastMessage(messageData) {
        // Simulate real-time broadcasting
        // In production, this would use WebSockets or similar
        console.log('Broadcasting message:', messageData);
    }
    
    startMessageProcessor() {
        // Process message queue
        setInterval(() => {
            if (this.messageQueue.length > 0) {
                const message = this.messageQueue.shift();
                this.addMessage(message);
            }
        }, 100);
    }
    
    loadModerationSettings() {
        // Load moderation settings from localStorage or server
        const settings = JSON.parse(localStorage.getItem('moderationSettings') || '{}');
        this.options = { ...this.options, ...settings };
    }
    
    toggleEmojiPicker() {
        // Toggle emoji picker
        const picker = document.getElementById('emoji-picker');
        if (picker) {
            picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
        }
    }
}

// Global instance
let liveChat = null;

// Initialize chat when page loads
document.addEventListener('DOMContentLoaded', () => {
    const streamId = new URLSearchParams(window.location.search).get('stream') || 'default';
    liveChat = new LiveChatSystem(streamId);
});

// Export for use in other scripts
window.LiveChatSystem = LiveChatSystem;
window.liveChat = liveChat;
