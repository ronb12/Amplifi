// Modern Chat View JavaScript
class ChatView {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.conversationId = null;
        this.conversation = null;
        this.messages = [];
        this.isTyping = false;
        this.typingTimeout = null;
        this.replyToMessage = null;
        
        this.init();
    }

    async init() {
        console.log('Initializing ChatView...');
        
        // Get conversation ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        this.conversationId = urlParams.get('conversation');
        
        if (!this.conversationId) {
            this.showToast('No conversation selected', 'error');
            setTimeout(() => this.goBack(), 2000);
            return;
        }

        // Setup Firebase auth listener
        this.setupAuthStateListener();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup emoji picker
        this.setupEmojiPicker();
        
        // Setup auto-resize for textarea
        this.setupAutoResize();
    }

    async setupAuthStateListener() {
        firebase.auth().onAuthStateChanged(async (user) => {
            console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
            
            if (user) {
                this.currentUser = user;
                await this.loadUserProfile();
                await this.loadConversation();
                await this.loadMessages();
                this.enableInput();
            } else {
                this.currentUser = null;
                this.disableInput();
                this.showLoginPrompt();
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

    async loadConversation() {
        if (!this.conversationId) return;
        
        try {
            const conversationDoc = await db.collection('conversations').doc(this.conversationId).get();
            if (conversationDoc.exists) {
                this.conversation = { id: conversationDoc.id, ...conversationDoc.data() };
                this.updateConversationHeader();
                console.log('Conversation loaded:', this.conversation);
            } else {
                this.showToast('Conversation not found', 'error');
                setTimeout(() => this.goBack(), 2000);
            }
        } catch (error) {
            console.error('Error loading conversation:', error);
            this.showToast('Error loading conversation', 'error');
        }
    }

    updateConversationHeader() {
        if (!this.conversation) return;
        
        // Get conversation name (handle different data structures)
        const name = this.conversation.name || 
                    (this.conversation.participantNames && this.conversation.participantNames.length > 0 ? 
                     this.conversation.participantNames[0] : 'Unknown User');
        
        // Get avatar
        const avatar = this.conversation.avatar || 
                      (this.conversation.participantPics && this.conversation.participantPics.length > 0 ? 
                       this.conversation.participantPics[0] : 'assets/images/default-avatar.svg');
        
        // Update header
        document.getElementById('conversationName').textContent = name;
        document.getElementById('conversationAvatar').src = avatar;
        document.getElementById('conversationStatus').textContent = 'Online';
        
        // Update typing indicator avatar
        document.getElementById('typingAvatar').src = avatar;
    }

    async loadMessages() {
        if (!this.conversationId) return;
        
        try {
            // Hide loading, show empty state if no messages
            document.getElementById('loadingMessages').style.display = 'none';
            
            const messagesSnapshot = await db.collection('messages')
                .where('conversationId', '==', this.conversationId)
                .orderBy('createdAt', 'asc')
                .get();

            this.messages = [];
            messagesSnapshot.forEach(doc => {
                this.messages.push({ id: doc.id, ...doc.data() });
            });

            console.log('Loaded messages:', this.messages.length);
            
            if (this.messages.length === 0) {
                document.getElementById('emptyChat').style.display = 'flex';
            } else {
                this.renderMessages();
            }
            
            // Mark messages as read
            this.markMessagesAsRead();
            
        } catch (error) {
            console.error('Error loading messages:', error);
            this.showToast('Error loading messages', 'error');
        }
    }

    renderMessages() {
        const messagesList = document.getElementById('messagesList');
        const emptyChat = document.getElementById('emptyChat');
        
        if (this.messages.length === 0) {
            emptyChat.style.display = 'flex';
            return;
        }
        
        emptyChat.style.display = 'none';
        
        messagesList.innerHTML = this.messages.map(message => {
            const isOwn = message.senderId === this.currentUser.uid;
            const messageClass = isOwn ? 'own-message' : 'other-message';
            const time = this.formatTimestamp(message.createdAt);
            
            return `
                <div class="message ${messageClass}" data-message-id="${message.id}">
                    <div class="message-bubble">
                        <div class="message-header">
                            <span class="message-author">${isOwn ? 'You' : (message.senderName || 'Unknown')}</span>
                            <span class="message-time">${time}</span>
                        </div>
                        <div class="message-text">${this.escapeHtml(message.text)}</div>
                        ${isOwn ? `<div class="message-status">sent</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        // Scroll to bottom
        this.scrollToBottom();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatTimestamp(timestamp) {
        if (!timestamp) return 'Just now';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        
        return date.toLocaleDateString();
    }

    async markMessagesAsRead() {
        if (!this.conversationId || !this.currentUser) return;
        
        try {
            const messagesSnapshot = await db.collection('messages')
                .where('conversationId', '==', this.conversationId)
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

    setupEventListeners() {
        // Message input
        const messageInput = document.getElementById('messageInput');
        messageInput.addEventListener('input', (e) => {
            this.handleTyping();
            this.autoResize(e.target);
        });
        
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Emoji picker close on outside click
        document.addEventListener('click', (e) => {
            const emojiPicker = document.getElementById('emoji-picker');
            const emojiBtn = document.querySelector('.emoji-btn');
            
            if (emojiPicker && !emojiPicker.contains(e.target) && !emojiBtn.contains(e.target)) {
                emojiPicker.classList.remove('show');
            }
        });
        
        // Attachment modal close on outside click
        document.addEventListener('click', (e) => {
            const attachmentModal = document.getElementById('attachmentModal');
            
            if (attachmentModal && e.target === attachmentModal) {
                this.closeAttachmentModal();
            }
        });
    }

    setupAutoResize() {
        const messageInput = document.getElementById('messageInput');
        messageInput.addEventListener('input', (e) => {
            this.autoResize(e.target);
        });
    }

    autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    handleTyping() {
        if (!this.conversationId || !this.currentUser) return;
        
        // Clear existing timeout
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
        
        // Set typing indicator
        if (!this.isTyping) {
            this.isTyping = true;
            this.updateTypingIndicator(true);
        }
        
        // Clear typing indicator after 3 seconds
        this.typingTimeout = setTimeout(() => {
            this.isTyping = false;
            this.updateTypingIndicator(false);
        }, 3000);
    }

    updateTypingIndicator(show) {
        const typingIndicator = document.getElementById('typingIndicator');
        if (show) {
            typingIndicator.style.display = 'flex';
            this.scrollToBottom();
        } else {
            typingIndicator.style.display = 'none';
        }
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const text = messageInput.value.trim();
        
        if (!text || !this.conversationId || !this.currentUser) {
            return;
        }
        
        try {
            // Clear input
            messageInput.value = '';
            messageInput.style.height = 'auto';
            
            // Clear typing indicator
            this.updateTypingIndicator(false);
            if (this.typingTimeout) {
                clearTimeout(this.typingTimeout);
            }
            
            // Create message data
            const messageData = {
                conversationId: this.conversationId,
                senderId: this.currentUser.uid,
                senderName: this.userProfile?.displayName || 'You',
                senderPic: this.userProfile?.profilePic || 'assets/images/default-avatar.svg',
                text: text,
                createdAt: new Date(),
                readBy: [this.currentUser.uid],
                replyTo: this.replyToMessage ? this.replyToMessage.id : null
            };
            
            // Add to Firestore
            const messageRef = await db.collection('messages').add(messageData);
            console.log('Message sent:', messageRef.id);
            
            // Add to local messages
            const newMessage = { id: messageRef.id, ...messageData };
            this.messages.push(newMessage);
            
            // Update UI
            this.renderMessages();
            
            // Clear reply
            this.cancelReply();
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.showToast('Error sending message', 'error');
        }
    }

    setupEmojiPicker() {
        const emojiCategories = document.querySelectorAll('.emoji-category');
        const emojiGrid = document.getElementById('emojiGrid');
        
        const emojis = {
            smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕'],
            hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
            animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🐣', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦙', '🦒', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦫', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔'],
            food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🧂'],
            activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🎯', '🪁', '🥅', '⛳', '🪃', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️‍♀️', '🏋️', '🏋️‍♂️', '🤼‍♀️', '🤼', '🤼‍♂️', '🤸‍♀️', '🤸', '🤸‍♂️', '⛹️‍♀️', '⛹️', '⛹️‍♂️', '🤺', '🤾‍♀️', '🤾', '🤾‍♂️', '🏊‍♀️', '🏊', '🏊‍♂️', '🤽‍♀️', '🤽', '🤽‍♂️', '🚣‍♀️', '🚣', '🚣‍♂️', '🧗‍♀️', '🧗', '🧗‍♂️', '🚵‍♀️', '🚵', '🚵‍♂️', '🚴‍♀️', '🚴', '🚴‍♂️', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎫', '🎟️', '🎪', '🤹‍♀️', '🤹', '🤹‍♂️', '🎭', '🩰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🪘', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩', '🎨', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀', '🧮', '🎥', '🎞️', '📽️', '🎬', '📺', '📻', '📷', '📸', '📹', '📼', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌚']
        };
        
        // Set initial category
        this.loadEmojis('smileys');
        
        // Handle category clicks
        emojiCategories.forEach(category => {
            category.addEventListener('click', () => {
                // Update active category
                emojiCategories.forEach(c => c.classList.remove('active'));
                category.classList.add('active');
                
                // Load emojis for category
                const categoryName = category.dataset.category;
                this.loadEmojis(categoryName);
            });
        });
    }

    loadEmojis(category) {
        const emojiGrid = document.getElementById('emojiGrid');
        const emojis = {
            smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕'],
            hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
            animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🐣', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦙', '🦒', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦫', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔'],
            food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🧂'],
            activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🎯', '🪁', '🥅', '⛳', '🪃', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️‍♀️', '🏋️', '🏋️‍♂️', '🤼‍♀️', '🤼', '🤼‍♂️', '🤸‍♀️', '🤸', '🤸‍♂️', '⛹️‍♀️', '⛹️', '⛹️‍♂️', '🤺', '🤾‍♀️', '🤾', '🤾‍♂️', '🏊‍♀️', '🏊', '🏊‍♂️', '🤽‍♀️', '🤽', '🤽‍♂️', '🚣‍♀️', '🚣', '🚣‍♂️', '🧗‍♀️', '🧗', '🧗‍♂️', '🚵‍♀️', '🚵', '🚵‍♂️', '🚴‍♀️', '🚴', '🚴‍♂️', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎫', '🎟️', '🎪', '🤹‍♀️', '🤹', '🤹‍♂️', '🎭', '🩰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🪘', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩', '🎨', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀', '🧮', '🎥', '🎞️', '📽️', '🎬', '📺', '📻', '📷', '📸', '📹', '📼', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌚']
        };
        
        if (emojis[category]) {
            emojiGrid.innerHTML = emojis[category].map(emoji => 
                `<button class="emoji-item" onclick="chatView.insertEmoji('${emoji}')">${emoji}</button>`
            ).join('');
        }
    }

    insertEmoji(emoji) {
        const messageInput = document.getElementById('messageInput');
        const start = messageInput.selectionStart;
        const end = messageInput.selectionEnd;
        const text = messageInput.value;
        
        messageInput.value = text.substring(0, start) + emoji + text.substring(end);
        messageInput.selectionStart = messageInput.selectionEnd = start + emoji.length;
        messageInput.focus();
        
        // Auto-resize
        this.autoResize(messageInput);
    }

    toggleEmojiPicker() {
        const picker = document.getElementById('emoji-picker');
        picker.classList.toggle('show');
    }

    showAttachmentOptions() {
        const modal = document.getElementById('attachmentModal');
        modal.style.display = 'flex';
    }

    closeAttachmentModal() {
        const modal = document.getElementById('attachmentModal');
        modal.style.display = 'none';
    }

    attachPhoto() {
        this.closeAttachmentModal();
    }

    attachVideo() {
        this.closeAttachmentModal();
    }

    attachDocument() {
        this.closeAttachmentModal();
    }

    attachLocation() {
        this.closeAttachmentModal();
    }

    startVoiceCall() {
    }

    startVideoCall() {
    }

    showConversationOptions() {
    }

    goBack() {
        window.history.back();
    }

    enableInput() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.querySelector('.send-btn');
        
        if (messageInput) messageInput.disabled = false;
        if (sendBtn) sendBtn.disabled = false;
    }

    disableInput() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.querySelector('.send-btn');
        
        if (messageInput) messageInput.disabled = true;
        if (sendBtn) sendBtn.disabled = true;
    }

    showLoginPrompt() {
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.innerHTML = `
            <div class="empty-chat">
                <div class="empty-chat-icon">🔐</div>
                <h3>Please log in</h3>
                <p>You need to be authenticated to view this conversation.</p>
            </div>
        `;
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize chat view when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatView = new ChatView();
}); 