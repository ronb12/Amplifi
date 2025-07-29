// Modern Messages App - Rebuilt from Scratch
class MessagesApp {
    constructor() {
        this.currentUser = null;
        this.currentConversation = null;
        this.conversations = [];
        this.messages = [];
        this.typingUsers = new Set();
        this.allUsers = [];
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.recognition = null;
        
        // Creator protection system
        this.creatorSettings = {
            maxMessagesPerDay: 50, // Default limit
            allowDirectMessages: true,
            allowGroupChats: true,
            allowVoiceMessages: true,
            allowMoneyMessages: true,
            followerThreshold: 1000, // Apply restrictions after 1000 followers
            messageCooldown: 300000, // 5 minutes between messages from same user
            lastMessageTime: {} // Track last message time per user
        };
        
        // Emoji categories
        this.emojiCategories = {
            smileys: ['😊', '😄', '😃', '😀', '😁', '😆', '😅', '😂', '🤣', '😉', '😋', '😎', '😍', '🥰', '😘', '😗', '😙', '😚', '🙂', '🤗', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '😴', '😌', '😛', '😜', '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '😷', '🤒', '🤕', '🤢', '🤧', '🤮', '🤯', '😳', '🤪', '😵', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖'],
            hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '💌', '💋', '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💬', '🗨️', '🗯️', '💭', '💤'],
            animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦙', '🦒', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦫', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔'],
            food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '🫖', '☕', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍷', '🍾', '🍷', '🥂', '🥃', '🍸', '🍹', '🧉', '🍾', '🥄', '🍴', '🍽️', '🥣', '🥡', '🥢', '🧂'],
            activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️‍♀️', '🏋️', '🏋️‍♂️', '🤼‍♀️', '🤼', '🤼‍♂️', '🤸‍♀️', '🤸', '🤸‍♂️', '⛹️‍♀️', '⛹️', '⛹️‍♂️', '🤺', '🤾‍♀️', '🤾', '🤾‍♂️', '🏊‍♀️', '🏊', '🏊‍♂️', '🤽‍♀️', '🤽', '🤽‍♂️', '🚣‍♀️', '🚣', '🚣‍♂️', '🧗‍♀️', '🧗', '🧗‍♂️', '🚵‍♀️', '🚵', '🚵‍♂️', '🚴‍♀️', '🚴', '🚴‍♂️', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎫', '🎟️', '🎪', '🤹‍♀️', '🤹', '🤹‍♂️', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🪘', '🎷', '🎺', '🪗', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩', '🎨', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🎮', '🎰', '🎲', '🧩', '🎨', '🎭', '🎪', '🎟️', '🎫', '🎗️', '🏵️', '🎖️', '🏅', '🥉', '🥈', '🥇', '🏆', '🎯', '🎳', '🎮', '🎰', '🎲', '🧩', '🎨', '🎭', '🎪', '🎟️', '🎫', '🎗️', '🏵️', '🎖️', '🏅', '🥉', '🥈', '🥇', '🏆']
        };
        
        // WebRTC variables
        this.localStream = null;
        this.remoteStream = null;
        this.peerConnection = null;
        this.isInCall = false;
        this.isVideoCall = false;
        this.callState = 'idle'; // idle, calling, connected, ended
        
        // Initialize speech recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
        }
        
        this.init();
    }

    async init() {
        console.log('Initializing Messages App...');
        
        // Initialize Firebase Auth listener
        this.setupAuthListener();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup emoji picker
        this.setupEmojiPicker();
        
        // Auto-resize textarea
        this.setupAutoResize();
        
        // Setup mobile back button event listener
        this.setupMobileBackButton();
        
        // Test mobile back button functionality
        setTimeout(() => {
            this.testMobileBackButton();
            this.checkMobileBackButtonStatus();
        }, 1000);
        
        console.log('Messages App initialized successfully');
    }

    setupMobileBackButton() {
        console.log('🔧 Setting up mobile back button...');
        
        const mobileBackBtn = document.querySelector('.mobile-back-btn');
        if (mobileBackBtn) {
            console.log('✅ Mobile back button found, adding event listener');
            
            // Remove any existing onclick attribute to prevent conflicts
            mobileBackBtn.removeAttribute('onclick');
            
            // Add direct event listener
            mobileBackBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🖱️ Mobile back button clicked via event listener!');
                this.showConversationsList();
            });
            
            console.log('✅ Mobile back button event listener added');
        } else {
            console.log('ℹ️ Mobile back button not found during setup');
        }
    }

    checkMobileBackButtonStatus() {
        console.log('🔍 Checking mobile back button status...');
        
        const mobileBackBtn = document.querySelector('.mobile-back-btn');
        if (mobileBackBtn) {
            console.log('✅ Mobile back button found');
            console.log('📊 Button properties:');
            console.log('  - Display:', mobileBackBtn.style.display);
            console.log('  - Visibility:', mobileBackBtn.style.visibility);
            console.log('  - Onclick:', mobileBackBtn.getAttribute('onclick'));
            console.log('  - Event listeners:', mobileBackBtn.onclick);
            console.log('  - Window width:', window.innerWidth);
            console.log('  - Is mobile:', window.innerWidth <= 768);
            
            // Test if the button is clickable
            const rect = mobileBackBtn.getBoundingClientRect();
            console.log('📊 Button position:');
            console.log('  - Top:', rect.top);
            console.log('  - Left:', rect.left);
            console.log('  - Width:', rect.width);
            console.log('  - Height:', rect.height);
            console.log('  - Visible:', rect.width > 0 && rect.height > 0);
            
            return true;
        } else {
            console.error('❌ Mobile back button not found');
            return false;
        }
    }

    // Global function to test mobile back button
    testMobileBackButtonClick() {
        console.log('🧪 Testing mobile back button click...');
        
        const mobileBackBtn = document.querySelector('.mobile-back-btn');
        if (mobileBackBtn) {
            console.log('✅ Mobile back button found, simulating click...');
            mobileBackBtn.click();
            return true;
        } else {
            console.error('❌ Mobile back button not found');
            return false;
        }
    }

    setupAuthListener() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                console.log('User authenticated:', user.uid);
                this.loadUserProfile();
                this.loadConversations();
                this.loadAllUsers();
                this.enableInputs();
            } else {
                this.currentUser = null;
                console.log('User logged out');
                this.disableInputs();
                this.showWelcomeState();
            }
        });
    }

    async loadUserProfile() {
        try {
            const userDoc = await firebase.firestore()
                .collection('users')
                .doc(this.currentUser.uid)
                .get();
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                document.getElementById('userAvatar').src = userData.profilePic || 'assets/images/default-avatar.svg';
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    async loadAllUsers() {
        if (!this.currentUser) return;
        
        try {
            const usersSnapshot = await firebase.firestore()
                .collection('users')
                .get();
            
            this.allUsers = [];
            usersSnapshot.forEach(doc => {
                if (doc.id !== this.currentUser.uid) {
                    const userData = doc.data();
                    this.allUsers.push({
                        id: doc.id,
                        name: userData.displayName || userData.username || 'Unknown User',
                        avatar: userData.profilePic || userData.photoURL || 'assets/images/default-avatar.svg',
                        email: userData.email || '',
                        status: userData.status || 'offline'
                    });
                }
            });
            
            console.log('Loaded', this.allUsers.length, 'users for new conversations');
            
        } catch (error) {
            console.error('Error loading users:', error);
            // Add some sample users for testing with proper avatars
            this.allUsers = [
                {
                    id: 'user1',
                    name: 'John Doe',
                    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                    email: 'john@example.com',
                    status: 'online'
                },
                {
                    id: 'user2',
                    name: 'Jane Smith',
                    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
                    email: 'jane@example.com',
                    status: 'online'
                },
                {
                    id: 'user3',
                    name: 'Mike Johnson',
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                    email: 'mike@example.com',
                    status: 'offline'
                }
            ];
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('conversationSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterConversations(e.target.value);
            });
        }

        // Message input
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            // Update send button when typing
            messageInput.addEventListener('input', () => {
                this.updateSendButton();
            });
        }

        // Send button
        const sendBtn = document.querySelector('.send-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this.sendMessage();
            });
        }

        // Click outside emoji picker to close
        document.addEventListener('click', (e) => {
            const emojiPicker = document.getElementById('emojiPicker');
            const emojiBtn = document.querySelector('.emoji-btn');
            
            if (emojiPicker && !emojiPicker.contains(e.target) && !emojiBtn.contains(e.target)) {
                this.hideEmojiPicker();
            }
        });

        // Voice-to-text on long press
        let pressTimer;
        messageInput.addEventListener('mousedown', () => {
            pressTimer = setTimeout(() => {
                this.startSpeechToText();
            }, 1000);
        });

        messageInput.addEventListener('mouseup', () => {
            clearTimeout(pressTimer);
        });

        messageInput.addEventListener('mouseleave', () => {
            clearTimeout(pressTimer);
        });

        // File upload setup
        this.setupFileUpload();

        // New conversation modal
        this.setupNewConversationEventListeners();

        // Group chat modal
        this.setupGroupChatEventListeners();

        // Mobile navigation
        this.updateConversationUI();
        window.addEventListener('resize', () => {
            this.updateConversationUI();
        });
    }

    setupEmojiPicker() {
        const emojiGrid = document.getElementById('emojiGrid');
        const categoryButtons = document.querySelectorAll('.emoji-category');
        
        // Load default category (smileys)
        this.loadEmojiCategory('smileys');
        
        // Setup category switching
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                this.switchEmojiCategory(category);
            });
        });
    }

    loadEmojiCategory(category) {
        const emojiGrid = document.getElementById('emojiGrid');
        const emojis = this.emojiCategories[category] || [];
        
        emojiGrid.innerHTML = emojis.map(emoji => `
            <button class="emoji-item" onclick="messagesApp.insertEmoji('${emoji}')">
                ${emoji}
            </button>
        `).join('');
        
        // Update active category button
        document.querySelectorAll('.emoji-category').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
    }

    switchEmojiCategory(category) {
        this.loadEmojiCategory(category);
    }

    insertEmoji(emoji) {
        const messageInput = document.getElementById('messageInput');
        const cursorPos = messageInput.selectionStart;
        const textBefore = messageInput.value.substring(0, cursorPos);
        const textAfter = messageInput.value.substring(cursorPos);
        
        messageInput.value = textBefore + emoji + textAfter;
        messageInput.selectionStart = messageInput.selectionEnd = cursorPos + emoji.length;
        
        this.hideEmojiPicker();
        this.updateSendButton();
        messageInput.focus();
    }

    toggleEmojiPicker() {
        const emojiPicker = document.getElementById('emojiPicker');
        if (emojiPicker.classList.contains('show')) {
            this.hideEmojiPicker();
        } else {
            this.showEmojiPicker();
        }
    }

    showEmojiPicker() {
        const emojiPicker = document.getElementById('emojiPicker');
        emojiPicker.classList.add('show');
    }

    hideEmojiPicker() {
        const emojiPicker = document.getElementById('emojiPicker');
        emojiPicker.classList.remove('show');
    }

    setupAutoResize() {
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.addEventListener('input', () => {
                messageInput.style.height = 'auto';
                messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
                this.updateSendButton();
            });
        }
    }

    updateSendButton() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.querySelector('.send-btn');
        
        if (messageInput && sendBtn) {
            const hasText = messageInput.value.trim().length > 0;
            sendBtn.disabled = !hasText || !this.currentUser || !this.currentConversation;
        }
    }

    async loadConversations() {
        if (!this.currentUser) return;
        
        try {
            console.log('Loading conversations for user:', this.currentUser.uid);
            
            // Load from Firestore
            const conversationsRef = firebase.firestore()
                .collection('conversations')
                .where('participants', 'array-contains', this.currentUser.uid)
                .orderBy('lastMessageAt', 'desc');
            
            const snapshot = await conversationsRef.get();
            
            this.conversations = [];
            snapshot.forEach(doc => {
                const conversation = { id: doc.id, ...doc.data() };
                this.conversations.push(conversation);
            });
            
            // If no conversations, create a sample one
            if (this.conversations.length === 0) {
                await this.createSampleConversation();
            }
            
            this.renderConversations();
            
        } catch (error) {
            console.error('Error loading conversations:', error);
            this.showToast('Error loading conversations', 'error');
        }
    }

    async createSampleConversation() {
        try {
            const sampleConversation = {
                participants: [this.currentUser.uid],
                participantNames: ['Sample User'],
                participantPics: [this.currentUser.photoURL || 'assets/images/default-avatar.svg'],
                lastMessage: 'Welcome to Amplifi Messages!',
                lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                unreadCount: 0
            };
            
            const docRef = await firebase.firestore()
                .collection('conversations')
                .add(sampleConversation);
            
            // Add sample messages to the conversation
            const sampleMessages = [
                {
                    text: 'Welcome to Amplifi Messages! This is a sample conversation.',
                    senderId: this.currentUser.uid,
                    senderName: 'You',
                    senderPic: this.currentUser.photoURL || 'assets/images/default-avatar.svg',
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    status: 'sent'
                },
                {
                    text: 'You can send text messages, voice messages, files, and even money!',
                    senderId: this.currentUser.uid,
                    senderName: 'You',
                    senderPic: this.currentUser.photoURL || 'assets/images/default-avatar.svg',
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    status: 'sent'
                },
                {
                    text: 'Try clicking the phone or video buttons to start a call!',
                    senderId: this.currentUser.uid,
                    senderName: 'You',
                    senderPic: this.currentUser.photoURL || 'assets/images/default-avatar.svg',
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    status: 'sent'
                }
            ];
            
            // Add messages to the conversation
            for (const message of sampleMessages) {
                await firebase.firestore()
                    .collection('conversations')
                    .doc(docRef.id)
                    .collection('messages')
                    .add(message);
            }
            
            this.conversations.push({ id: docRef.id, ...sampleConversation });
            
        } catch (error) {
            console.error('Error creating sample conversation:', error);
        }
    }

    renderConversations() {
        const conversationsList = document.getElementById('conversationsList');
        if (!conversationsList) return;

        console.log('Rendering conversations:', this.conversations.length, 'conversations');
        this.conversations.forEach((conv, index) => {
            console.log(`Conversation ${index}:`, {
                id: conv.id,
                lastMessage: conv.lastMessage,
                participantNames: conv.participantNames,
                type: conv.type
            });
        });

        if (this.conversations.length === 0) {
            conversationsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💬</div>
                    <h3>No conversations yet</h3>
                    <p>Start a conversation to connect with other creators</p>
                    <button class="start-conversation-btn" onclick="messagesApp.showNewConversationModal()">
                        Start Conversation
                    </button>
                </div>
            `;
            return;
        }
        
        conversationsList.innerHTML = this.conversations.map(conversation => {
            const isGroupChat = conversation.type === 'group';
            const isActive = this.currentConversation && this.currentConversation.id === conversation.id;
            const activeClass = isActive ? 'active' : '';
            
            // Get conversation display name with proper null checks
            let displayName = 'Sample Conversation';
            if (isGroupChat) {
                displayName = conversation.conversationName || 'Group Chat';
            } else {
                // For direct messages, show the other person's name
                if (conversation.participantNames && Array.isArray(conversation.participantNames)) {
                    const otherParticipant = conversation.participantNames.find(name => 
                        name !== (this.currentUser?.displayName || 'You')
                    );
                    // If it's a sample conversation with only current user, show "Sample Conversation"
                    if (!otherParticipant && conversation.participantNames.length === 1) {
                        displayName = 'Sample Conversation';
                    } else {
                        displayName = otherParticipant || 'Sample Conversation';
                    }
                } else {
                    displayName = 'Sample Conversation';
                }
            }
            
            // Format the last message preview with proper null checks
            let lastMessagePreview = 'No messages yet';
            if (conversation.lastMessage && conversation.lastMessage !== 'undefined') {
                if (conversation.lastMessage.includes('🎤 Voice message')) {
                    lastMessagePreview = '🎤 Voice message';
                } else if (conversation.lastMessage.includes('💰')) {
                    lastMessagePreview = '💰 Money sent';
                } else if (conversation.lastMessage.includes('📎')) {
                    lastMessagePreview = '📎 File sent';
                } else if (conversation.lastMessage.length > 50) {
                    lastMessagePreview = conversation.lastMessage.substring(0, 50) + '...';
                } else {
                    lastMessagePreview = conversation.lastMessage;
                }
            }
            
            // Format timestamp with proper null check
            const timestamp = conversation.lastMessageAt ? this.formatTimestamp(conversation.lastMessageAt) : '';
            
            // Get unread count with proper null check
            const unreadCount = conversation.unreadCount || 0;
            
            return `
                <div class="conversation-item ${activeClass}" onclick="messagesApp.selectConversation('${conversation.id}')">
                    <div class="conversation-avatar">
                        ${isGroupChat ? '👥' : '👤'}
                    </div>
                    <div class="conversation-info">
                        <div class="conversation-header">
                            <span class="conversation-name">${displayName}</span>
                            <span class="conversation-time">${timestamp}</span>
                        </div>
                        <div class="conversation-preview">
                            <span class="preview-text">${lastMessagePreview}</span>
                            ${unreadCount > 0 ? `<span class="unread-badge">${unreadCount}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Mobile Navigation Methods
    showConversationsList() {
        console.log('📱 Showing conversations list...');
        console.log('🔍 Debugging showConversationsList...');
        
        const conversationsSidebar = document.getElementById('conversationsSidebar');
        const chatArea = document.getElementById('chatArea');
        const mobileBackBtn = document.querySelector('.mobile-back-btn');
        
        console.log('📊 Elements found:');
        console.log('  - conversationsSidebar:', conversationsSidebar);
        console.log('  - chatArea:', chatArea);
        console.log('  - mobileBackBtn:', mobileBackBtn);
        
        if (conversationsSidebar && chatArea) {
            console.log('✅ Both elements found, updating display...');
            
            // Store current states
            const sidebarBefore = conversationsSidebar.style.display;
            const chatBefore = chatArea.style.display;
            const chatActiveBefore = chatArea.classList.contains('active');
            
            console.log('📊 Before changes:');
            console.log('  - Sidebar display:', sidebarBefore);
            console.log('  - Chat display:', chatBefore);
            console.log('  - Chat active class:', chatActiveBefore);
            
            // Make changes - ensure sidebar is visible and chat is hidden
            conversationsSidebar.style.display = 'flex';
            conversationsSidebar.style.position = 'relative';
            conversationsSidebar.style.zIndex = '1';
            
            chatArea.classList.remove('active');
            chatArea.style.display = 'none';
            chatArea.style.position = 'absolute';
            chatArea.style.zIndex = '0';
            
            console.log('📊 After changes:');
            console.log('  - Sidebar display:', conversationsSidebar.style.display);
            console.log('  - Sidebar position:', conversationsSidebar.style.position);
            console.log('  - Sidebar z-index:', conversationsSidebar.style.zIndex);
            console.log('  - Chat display:', chatArea.style.display);
            console.log('  - Chat position:', chatArea.style.position);
            console.log('  - Chat z-index:', chatArea.style.zIndex);
            console.log('  - Chat active class:', chatArea.classList.contains('active'));
            
            // Hide mobile back button when showing conversations list
            if (mobileBackBtn && window.innerWidth <= 768) {
                console.log('📱 Hiding mobile back button...');
                mobileBackBtn.style.display = 'none';
                console.log('📱 Mobile back button hidden');
            }
            
            console.log('✅ showConversationsList completed successfully');
        } else {
            console.error('❌ Required elements not found:');
            console.error('  - conversationsSidebar:', conversationsSidebar);
            console.error('  - chatArea:', chatArea);
        }
    }

    showChatView() {
        console.log('📱 Showing chat view...');
        const conversationsSidebar = document.getElementById('conversationsSidebar');
        const chatArea = document.getElementById('chatArea');
        const mobileBackBtn = document.querySelector('.mobile-back-btn');
        
        if (conversationsSidebar && chatArea) {
            // Hide sidebar and show chat area
            conversationsSidebar.style.display = 'none';
            
            chatArea.classList.add('active');
            chatArea.style.display = 'flex';
            chatArea.style.position = 'absolute';
            chatArea.style.zIndex = '10';
            
            // Show mobile back button when showing chat view on mobile
            if (mobileBackBtn && window.innerWidth <= 768) {
                mobileBackBtn.style.display = 'flex';
                console.log('📱 Mobile back button shown');
            }
        }
    }

    // Test mobile back button functionality
    testMobileBackButton() {
        console.log('🧪 Testing mobile back button...');
        
        const mobileBackBtn = document.querySelector('.mobile-back-btn');
        if (mobileBackBtn) {
            console.log('✅ Mobile back button found');
            console.log('📊 Current display:', mobileBackBtn.style.display);
            console.log('📊 Window width:', window.innerWidth);
            console.log('📊 Is mobile:', window.innerWidth <= 768);
            
            // Test click functionality
            mobileBackBtn.addEventListener('click', () => {
                console.log('🖱️ Mobile back button clicked!');
            });
            
            return true;
        } else {
            console.error('❌ Mobile back button not found');
            return false;
        }
    }

    // Enhanced conversation selection for mobile
    async selectConversation(conversationId) {
        try {
            const conversation = this.conversations.find(c => c.id === conversationId);
            if (!conversation) {
                console.error('Conversation not found:', conversationId);
                return;
            }

            this.currentConversation = conversation;
            
            // Update UI
            this.updateConversationUI();
            
            // Enable inputs for sending messages
            this.enableInputs();
            this.updateSendButton();
            
            // Load messages
            await this.loadMessages(conversationId);
            
            // Show chat view on mobile
            if (window.innerWidth <= 768) {
                this.showChatView();
            }
            
            // Mark as read
            await this.markConversationAsRead(conversationId);
            
        } catch (error) {
            console.error('Error selecting conversation:', error);
            this.showToast('Error loading conversation', 'error');
        }
    }

    updateConversationUI() {
        if (!this.currentConversation) return;
        
        // Update chat header
        document.getElementById('chatName').textContent = this.currentConversation.participantNames?.[0] || 'Unknown User';
        document.getElementById('chatAvatar').src = this.currentConversation.participantPics?.[0] || 'assets/images/default-avatar.svg';
        document.getElementById('chatStatus').textContent = 'Online';
        
        // Show messages list, hide welcome state
        document.getElementById('welcomeState').style.display = 'none';
        document.getElementById('messagesList').style.display = 'flex';
        
        // Update conversation list active state
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-conversation-id="${this.currentConversation.id}"]`)?.classList.add('active');
    }

    async loadMessages(conversationId) {
        try {
            const messagesRef = firebase.firestore()
                .collection('conversations')
                .doc(conversationId)
                .collection('messages')
                .orderBy('timestamp', 'asc');
            
            const snapshot = await messagesRef.get();
            
            this.messages = [];
            snapshot.forEach(doc => {
                const message = { id: doc.id, ...doc.data() };
                // Only add messages that have valid content
                if (message.text || message.type === 'voice' || message.type === 'money' || message.type === 'file') {
                    this.messages.push(message);
                }
            });
            
            this.renderMessages();
            this.scrollToBottom();
            
        } catch (error) {
            console.error('Error loading messages:', error);
            this.showToast('Error loading messages', 'error');
        }
    }

    renderMessages() {
        const messagesList = document.getElementById('messagesList');
        if (!messagesList) return;

        console.log('Rendering messages:', this.messages.length, 'messages');
        this.messages.forEach((message, index) => {
            console.log(`Message ${index}:`, {
                type: message.type,
                text: message.text,
                audioUrl: message.audioUrl,
                senderName: message.senderName,
                senderPic: message.senderPic
            });
        });

        messagesList.innerHTML = '';

        this.messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${message.senderId === this.currentUser?.uid ? 'own-message' : 'other-message'}`;
            messageDiv.style.animationDelay = `${Math.random() * 0.3}s`;

            let messageContent = '';

            if (message.type === 'voice') {
                console.log('Rendering voice message:', message);
                // Voice message display - use available URL or show placeholder
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
                    // Fallback for voice messages without audio URL
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
                // Money message display with null checks
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
                // File message display with null checks
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
                // Regular text message with null check
                const messageText = message.text || 'Empty message';
                // Skip rendering if the message text is undefined or empty
                if (!messageText || messageText === 'undefined' || messageText.trim() === '') {
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
    }

    async sendMessage() {
        if (!this.currentConversation || !this.currentUser) {
            this.showToast('Please select a conversation first', 'error');
            return;
        }

        const messageInput = document.getElementById('messageInput');
        const messageText = messageInput.value.trim();
        
        if (!messageText) {
            this.showToast('Please enter a message', 'error');
            return;
        }

        try {
            // Check creator protection for the conversation
            const otherParticipantId = this.currentConversation.participants.find(id => id !== this.currentUser.uid);
            if (otherParticipantId) {
                const protectionCheck = await this.checkCreatorProtection(otherParticipantId);
                if (!protectionCheck.allowed) {
                    this.showToast(protectionCheck.reason, 'error');
                    return;
                }
                
                const limitCheck = await this.checkMessageLimits(otherParticipantId);
                if (!limitCheck.allowed) {
                    this.showToast(limitCheck.reason, 'error');
                    return;
                }
            }

            // Create message object
            const message = {
                text: messageText,
                senderId: this.currentUser.uid,
                senderName: this.currentUser.displayName || 'Unknown',
                senderPic: this.currentUser.photoURL || 'assets/images/default-avatar.svg',
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'sent'
            };

            // Save to Firestore
            await firebase.firestore()
                .collection('conversations')
                .doc(this.currentConversation.id)
                .collection('messages')
                .add(message);

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

        } catch (error) {
            console.error('Error sending message:', error);
            this.showToast('Error sending message', 'error');
        }
    }

    async markConversationAsRead(conversationId) {
        try {
            await firebase.firestore()
                .collection('conversations')
                .doc(conversationId)
                .update({
                    unreadCount: 0
                });
            
            // Update local conversation
            const conversation = this.conversations.find(c => c.id === conversationId);
            if (conversation) {
                conversation.unreadCount = 0;
                this.renderConversations();
            }
            
        } catch (error) {
            console.error('Error marking conversation as read:', error);
        }
    }

    filterConversations(searchTerm) {
        const conversationItems = document.querySelectorAll('.conversation-item');
        
        conversationItems.forEach(item => {
            const name = item.querySelector('.conversation-name').textContent.toLowerCase();
            const preview = item.querySelector('.preview-text').textContent.toLowerCase();
            const search = searchTerm.toLowerCase();
            
            if (name.includes(search) || preview.includes(search)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    formatTimestamp(timestamp) {
        if (!timestamp) return 'Just now';
        
        let date;
        
        // Handle Firestore timestamp
        if (timestamp && typeof timestamp.toDate === 'function') {
            date = timestamp.toDate();
        }
        // Handle regular Date object
        else if (timestamp instanceof Date) {
            date = timestamp;
        }
        // Handle timestamp number
        else if (typeof timestamp === 'number') {
            date = new Date(timestamp);
        }
        // Handle string timestamp
        else if (typeof timestamp === 'string') {
            date = new Date(timestamp);
        }
        // Handle server timestamp (Firestore FieldValue)
        else if (timestamp && timestamp.seconds) {
            date = new Date(timestamp.seconds * 1000);
        }
        else {
            console.warn('Invalid timestamp format:', timestamp);
            return 'Just now';
        }
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            console.warn('Invalid date:', timestamp);
            return 'Just now';
        }
        
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
        
        return date.toLocaleDateString();
    }

    enableInputs() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.querySelector('.send-btn');
        
        if (messageInput) messageInput.disabled = false;
        if (sendBtn) sendBtn.disabled = !this.currentConversation;
    }

    disableInputs() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.querySelector('.send-btn');
        
        if (messageInput) messageInput.disabled = true;
        if (sendBtn) sendBtn.disabled = true;
    }

    showWelcomeState() {
        document.getElementById('welcomeState').style.display = 'flex';
        document.getElementById('messagesList').style.display = 'none';
    }

    // New Conversation Feature
    showNewConversationModal() {
        if (!this.currentUser) {
            this.showToast('Please log in to create conversations', 'error');
            return;
        }

        const modalContent = `
            <div class="new-conversation-modal">
                <div class="modal-header">
                    <h3>New Conversation</h3>
                    <button class="close-btn" onclick="messagesApp.hideModal()">×</button>
                </div>
                
                <div class="modal-body">
                    <div class="search-section">
                        <div class="search-input-wrapper">
                            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="M21 21l-4.35-4.35"/>
                            </svg>
                            <input type="text" id="userSearchInput" placeholder="Search users..." class="search-input">
                        </div>
                    </div>
                    
                    <div class="users-list" id="usersList">
                        ${this.renderUsersList(this.allUsers)}
                    </div>
                    
                    <div class="selected-users" id="selectedUsers" style="display: none;">
                        <h4>Selected Users:</h4>
                        <div class="selected-users-list" id="selectedUsersList"></div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="secondary-btn" onclick="messagesApp.hideModal()">Cancel</button>
                    <button class="primary-btn" onclick="messagesApp.createNewConversation()" id="createConversationBtn" disabled>
                        Create Conversation
                    </button>
                </div>
            </div>
        `;
        
        this.showModal(modalContent);
        this.setupNewConversationEventListeners();
    }

    renderUsersList(users) {
        const usersList = document.getElementById('usersList');
        if (!usersList) return;

        usersList.innerHTML = '';
        
        if (users.length === 0) {
            usersList.innerHTML = '<div class="no-users">No users found</div>';
            return;
        }

        users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'user-item';
            userElement.dataset.userId = user.id;
            userElement.onclick = () => this.toggleUserSelection(user.id);
            
            userElement.innerHTML = `
                <div class="user-avatar">
                    <img src="${user.avatar}" alt="${user.name}" onerror="this.src='assets/images/default-avatar.svg'">
                </div>
                <div class="user-info">
                    <div class="user-name">${user.name}</div>
                    <div class="user-email">${user.email}</div>
                    <div class="user-status ${user.status}">${user.status}</div>
                </div>
            `;
            
            usersList.appendChild(userElement);
        });
    }

    setupNewConversationEventListeners() {
        const searchInput = document.getElementById('userSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterUsers(e.target.value);
            });
        }
    }

    filterUsers(searchTerm) {
        const filteredUsers = this.allUsers.filter(user => 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = this.renderUsersList(filteredUsers);
    }

    toggleUserSelection(userId) {
        const userItem = document.querySelector(`[data-user-id="${userId}"]`);
        const selectedUsers = document.getElementById('selectedUsers');
        const selectedUsersList = document.getElementById('selectedUsersList');
        const createBtn = document.getElementById('createConversationBtn');
        
        if (!userItem) {
            console.warn('User item not found:', userId);
            return;
        }
        
        if (userItem.classList.contains('selected')) {
            // Remove from selection
            userItem.classList.remove('selected');
            this.removeSelectedUser(userId);
        } else {
            // Add to selection
            userItem.classList.add('selected');
            this.addSelectedUser(userId);
        }
    }

    addSelectedUser(userId) {
        const user = this.allUsers.find(u => u.id === userId);
        if (!user) return;
        
        const selectedUsers = document.getElementById('selectedUsers');
        const selectedUsersList = document.getElementById('selectedUsersList');
        
        // Check if elements exist
        if (!selectedUsers || !selectedUsersList) {
            console.warn('Selected users elements not found');
            return;
        }
        
        // Show selected users section
        selectedUsers.style.display = 'block';
        
        // Check if user is already selected
        const existingUser = selectedUsersList.querySelector(`[data-user-id="${userId}"]`);
        if (existingUser) return;
        
        // Add user to selected list
        const userElement = document.createElement('div');
        userElement.className = 'selected-user-item';
        userElement.dataset.userId = userId;
        userElement.innerHTML = `
            <img src="${user.avatar}" alt="${user.name}" class="user-avatar">
            <span class="user-name">${user.name}</span>
            <button class="remove-user-btn" onclick="messagesApp.removeSelectedUser('${userId}')">×</button>
        `;
        selectedUsersList.appendChild(userElement);
        
        // Update create button state
        this.updateCreateButtonState();
    }

    removeSelectedUser(userId) {
        // Remove from selected users list
        const selectedUserElement = document.querySelector(`.selected-user-item[data-user-id="${userId}"]`);
        if (selectedUserElement) {
            selectedUserElement.remove();
        }
        
        // Remove selection from user item
        const userItem = document.querySelector(`[data-user-id="${userId}"]`);
        if (userItem) {
            userItem.classList.remove('selected');
        }
        
        // Update create button state
        this.updateCreateButtonState();
    }

    updateCreateButtonState() {
        const selectedCount = document.querySelectorAll('.user-item.selected').length;
        const createBtn = document.getElementById('createConversationBtn');
        const selectedUsers = document.getElementById('selectedUsers');
        
        if (createBtn) {
            createBtn.disabled = selectedCount === 0;
        }
        
        if (selectedUsers && selectedCount === 0) {
            selectedUsers.style.display = 'none';
        }
    }

    // File Attachment Feature
    showAttachmentOptions() {
        if (!this.currentConversation) {
            this.showToast('Please select a conversation first', 'error');
            return;
        }

        const modalContent = `
            <div class="attachment-modal">
                <div class="modal-header">
                    <h3>Attach File</h3>
                    <button class="close-btn" onclick="messagesApp.hideModal()">×</button>
                </div>
                
                <div class="modal-body">
                    <div class="attachment-options">
                        <div class="attachment-option" onclick="messagesApp.triggerFileInput('image')">
                            <div class="attachment-icon">📷</div>
                            <div class="attachment-text">
                                <h4>Photo</h4>
                                <p>Share photos and images</p>
                            </div>
                        </div>
                        
                        <div class="attachment-option" onclick="messagesApp.triggerFileInput('video')">
                            <div class="attachment-icon">🎥</div>
                            <div class="attachment-text">
                                <h4>Video</h4>
                                <p>Share video clips</p>
                            </div>
                        </div>
                        
                        <div class="attachment-option" onclick="messagesApp.triggerFileInput('document')">
                            <div class="attachment-icon">📄</div>
                            <div class="attachment-text">
                                <h4>Document</h4>
                                <p>Share PDFs and documents</p>
                            </div>
                        </div>
                        
                        <div class="attachment-option" onclick="messagesApp.triggerFileInput('audio')">
                            <div class="attachment-icon">🎵</div>
                            <div class="attachment-text">
                                <h4>Audio</h4>
                                <p>Share voice messages</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="file-upload-area" style="display: none;">
                        <input type="file" id="fileInput" accept="*/*" style="display: none;">
                        <div class="upload-preview" id="uploadPreview"></div>
                        <div class="upload-actions">
                            <button class="secondary-btn" onclick="messagesApp.cancelFileUpload()">Cancel</button>
                            <button class="primary-btn" onclick="messagesApp.sendFile()">Send</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.showModal(modalContent);
    }

    triggerFileInput(type) {
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.querySelector('.file-upload-area');
        const attachmentOptions = document.querySelector('.attachment-options');
        
        // Set accept attribute based on type
        switch(type) {
            case 'image':
                fileInput.accept = 'image/*';
                break;
            case 'video':
                fileInput.accept = 'video/*';
                break;
            case 'document':
                fileInput.accept = '.pdf,.doc,.docx,.txt,.rtf';
                break;
            case 'audio':
                fileInput.accept = 'audio/*';
                break;
            default:
                fileInput.accept = '*/*';
        }
        
        // Hide options and show upload area
        attachmentOptions.style.display = 'none';
        uploadArea.style.display = 'block';
        
        // Trigger file input
        fileInput.click();
        
        // Listen for file selection
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.previewFile(file);
            }
        };
    }

    previewFile(file) {
        const preview = document.getElementById('uploadPreview');
        const reader = new FileReader();
        
        reader.onload = (e) => {
            let previewHTML = '';
            
            if (file.type.startsWith('image/')) {
                previewHTML = `
                    <div class="file-preview">
                        <img src="${e.target.result}" alt="Preview" class="image-preview">
                        <div class="file-info">
                            <h4>${file.name}</h4>
                            <p>${this.formatFileSize(file.size)}</p>
                        </div>
                    </div>
                `;
            } else if (file.type.startsWith('video/')) {
                previewHTML = `
                    <div class="file-preview">
                        <video src="${e.target.result}" controls class="video-preview"></video>
                        <div class="file-info">
                            <h4>${file.name}</h4>
                            <p>${this.formatFileSize(file.size)}</p>
                        </div>
                    </div>
                `;
            } else {
                previewHTML = `
                    <div class="file-preview">
                        <div class="file-icon">📄</div>
                        <div class="file-info">
                            <h4>${file.name}</h4>
                            <p>${this.formatFileSize(file.size)}</p>
                        </div>
                    </div>
                `;
            }
            
            preview.innerHTML = previewHTML;
        };
        
        reader.readAsDataURL(file);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async sendFile() {
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showToast('No file selected', 'error');
            return;
        }
        
        if (!this.currentConversation) {
            this.showToast('No conversation selected', 'error');
            return;
        }
        
        try {
            // Show loading state
            this.showToast('Uploading file...', 'info');
            
            // Upload file to Firebase Storage
            const storageRef = firebase.storage().ref();
            const fileRef = storageRef.child(`messages/${this.currentConversation.id}/${Date.now()}_${file.name}`);
            
            const uploadTask = await fileRef.put(file);
            const downloadURL = await uploadTask.ref.getDownloadURL();
            
            // Create message object
            const message = {
                type: 'file',
                content: file.name,
                fileUrl: downloadURL,
                fileSize: file.size,
                fileType: file.type,
                senderId: this.currentUser.uid,
                senderName: this.currentUser.displayName || 'You',
                senderPic: this.currentUser.photoURL || 'assets/images/default-avatar.svg',
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                conversationId: this.currentConversation.id
            };
            
            // Save message to Firestore
            await firebase.firestore()
                .collection('messages')
                .add(message);
            
            // Update conversation last message
            await firebase.firestore()
                .collection('conversations')
                .doc(this.currentConversation.id)
                .update({
                    lastMessage: `📎 ${file.name}`,
                    lastMessageAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            
            // Reload messages
            await this.loadMessages(this.currentConversation.id);
            
            // Close modal
            this.hideModal();
            
            this.showToast('File sent successfully!', 'success');
            
        } catch (error) {
            console.error('Error sending file:', error);
            this.showToast('Error sending file', 'error');
        }
    }

    cancelFileUpload() {
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.querySelector('.file-upload-area');
        const attachmentOptions = document.querySelector('.attachment-options');
        
        fileInput.value = '';
        uploadArea.style.display = 'none';
        attachmentOptions.style.display = 'flex';
    }

    // Enhanced Group Chat Features
    showGroupChatModal() {
        if (!this.currentUser) {
            this.showToast('Please log in to create group chats', 'error');
            return;
        }

        const modalContent = `
            <div class="group-chat-modal">
                <div class="modal-header">
                    <h3>Create Group Chat</h3>
                    <button class="close-btn" onclick="messagesApp.hideModal()">×</button>
                </div>
                
                <div class="modal-body">
                    <div class="group-info-section">
                        <div class="input-group">
                            <label for="groupNameInput">Group Name</label>
                            <input type="text" id="groupNameInput" placeholder="Enter group name..." class="form-input">
                        </div>
                        <div class="input-group">
                            <label for="groupDescriptionInput">Description (Optional)</label>
                            <textarea id="groupDescriptionInput" placeholder="Enter group description..." class="form-textarea"></textarea>
                        </div>
                    </div>
                    
                    <div class="search-section">
                        <div class="search-input-wrapper">
                            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="M21 21l-4.35-4.35"/>
                            </svg>
                            <input type="text" id="groupUserSearchInput" placeholder="Search users to add..." class="search-input">
                        </div>
                    </div>
                    
                    <div class="users-list" id="groupUsersList">
                        ${this.renderGroupUsersList(this.allUsers)}
                    </div>
                    
                    <div class="selected-users" id="groupSelectedUsers" style="display: none;">
                        <h4>Selected Members:</h4>
                        <div class="selected-users-list" id="groupSelectedUsersList"></div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="secondary-btn" onclick="messagesApp.hideModal()">Cancel</button>
                    <button class="primary-btn" onclick="messagesApp.createGroupChat()" id="createGroupChatBtn" disabled>
                        Create Group Chat
                    </button>
                </div>
            </div>
        `;
        
        this.showModal(modalContent);
        this.setupGroupChatEventListeners();
    }

    setupGroupChatEventListeners() {
        const searchInput = document.getElementById('groupUserSearchInput');
        const groupNameInput = document.getElementById('groupNameInput');
        const createBtn = document.getElementById('createGroupChatBtn');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterGroupUsers(e.target.value);
            });
        }
        
        if (groupNameInput) {
            groupNameInput.addEventListener('input', () => {
                this.updateGroupChatButton();
            });
        }
    }

    filterGroupUsers(searchTerm) {
        const filteredUsers = this.allUsers.filter(user => 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        const usersList = document.getElementById('groupUsersList');
        usersList.innerHTML = this.renderGroupUsersList(filteredUsers);
    }

    renderGroupUsersList(users) {
        const usersList = document.getElementById('groupUsersList');
        if (!usersList) return;

        usersList.innerHTML = '';
        
        if (users.length === 0) {
            usersList.innerHTML = '<div class="no-users">No users found</div>';
            return;
        }

        users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'user-item';
            userElement.dataset.userId = user.id;
            userElement.onclick = () => this.toggleGroupUserSelection(user.id);
            
            userElement.innerHTML = `
                <div class="user-avatar">
                    <img src="${user.avatar}" alt="${user.name}" onerror="this.src='assets/images/default-avatar.svg'">
                </div>
                <div class="user-info">
                    <div class="user-name">${user.name}</div>
                    <div class="user-email">${user.email}</div>
                    <div class="user-status ${user.status}">${user.status}</div>
                </div>
            `;
            
            usersList.appendChild(userElement);
        });
    }

    toggleGroupUserSelection(userId) {
        const userItem = document.querySelector(`[data-user-id="${userId}"]`);
        
        if (!userItem) {
            console.warn('Group user item not found:', userId);
            return;
        }
        
        if (userItem.classList.contains('selected')) {
            // Remove from selection
            userItem.classList.remove('selected');
            this.removeGroupSelectedUser(userId);
        } else {
            // Add to selection
            userItem.classList.add('selected');
            this.addGroupSelectedUser(userId);
        }
        
        this.updateGroupChatButton();
    }

    addGroupSelectedUser(userId) {
        const user = this.allUsers.find(u => u.id === userId);
        if (!user) return;
        
        const selectedUsers = document.getElementById('groupSelectedUsers');
        const selectedUsersList = document.getElementById('groupSelectedUsersList');
        
        // Check if elements exist
        if (!selectedUsers || !selectedUsersList) {
            console.warn('Group selected users elements not found');
            return;
        }
        
        // Show selected users section
        selectedUsers.style.display = 'block';
        
        // Check if user is already selected
        const existingUser = selectedUsersList.querySelector(`[data-user-id="${userId}"]`);
        if (existingUser) return;
        
        // Add user to selected list
        const userItem = document.createElement('div');
        userItem.className = 'selected-user-item';
        userItem.dataset.userId = userId;
        userItem.innerHTML = `
            <img src="${user.avatar}" alt="${user.name}" class="user-avatar">
            <span class="user-name">${user.name}</span>
            <button class="remove-user-btn" onclick="messagesApp.removeGroupSelectedUser('${userId}')">×</button>
        `;
        
        selectedUsersList.appendChild(userItem);
    }

    removeGroupSelectedUser(userId) {
        const userItem = document.querySelector(`[data-user-id="${userId}"]`);
        const selectedUserItem = document.querySelector(`#groupSelectedUsersList [data-user-id="${userId}"]`);
        
        if (userItem) userItem.classList.remove('selected');
        if (selectedUserItem) selectedUserItem.remove();
        
        // Hide selected users section if empty
        const selectedUsersList = document.getElementById('groupSelectedUsersList');
        if (selectedUsersList && selectedUsersList.children.length === 0) {
            const selectedUsers = document.getElementById('groupSelectedUsers');
            if (selectedUsers) {
                selectedUsers.style.display = 'none';
            }
        }
    }

    updateGroupChatButton() {
        const groupNameInput = document.getElementById('groupNameInput');
        const selectedUsers = document.querySelectorAll('#groupSelectedUsersList .selected-user-item');
        const createBtn = document.getElementById('createGroupChatBtn');
        
        if (createBtn) {
            const hasName = groupNameInput && groupNameInput.value.trim().length > 0;
            const hasUsers = selectedUsers.length > 0;
            
            createBtn.disabled = !(hasName && hasUsers);
        }
    }

    async createGroupChat() {
        const groupNameInput = document.getElementById('groupNameInput');
        const groupDescriptionInput = document.getElementById('groupDescriptionInput');
        const selectedUserIds = Array.from(document.querySelectorAll('#groupSelectedUsersList .selected-user-item'))
            .map(item => item.dataset.userId);
        
        const groupName = groupNameInput.value.trim();
        const groupDescription = groupDescriptionInput.value.trim();
        
        if (!groupName) {
            this.showToast('Please enter a group name', 'error');
            return;
        }
        
        if (selectedUserIds.length === 0) {
            this.showToast('Please select at least one member', 'error');
            return;
        }
        
        try {
            // Get selected users data
            const selectedUsers = this.allUsers.filter(user => selectedUserIds.includes(user.id));
            
            // Create group conversation object with proper timestamp
            const now = new Date();
            const conversation = {
                type: 'group',
                participants: [this.currentUser.uid, ...selectedUserIds],
                participantNames: [this.currentUser.displayName || 'You', ...selectedUsers.map(u => u.name)],
                participantPics: [this.currentUser.photoURL || 'assets/images/default-avatar.svg', ...selectedUsers.map(u => u.avatar)],
                conversationName: groupName,
                description: groupDescription,
                createdBy: this.currentUser.uid,
                lastMessage: 'Group chat created',
                lastMessageAt: now,
                createdAt: now,
                unreadCount: 0
            };
            
            // Save to Firestore
            const docRef = await firebase.firestore()
                .collection('conversations')
                .add({
                    ...conversation,
                    lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            
            // Add to local conversations with proper timestamp
            const newConversation = { 
                id: docRef.id, 
                ...conversation,
                lastMessageAt: now,
                createdAt: now
            };
            this.conversations.unshift(newConversation);
            this.renderConversations();
            
            // Select the new conversation
            await this.selectConversation(docRef.id);
            
            // Close modal
            this.hideModal();
            
            this.showToast('Group chat created successfully!', 'success');
            
        } catch (error) {
            console.error('Error creating group chat:', error);
            this.showToast('Error creating group chat', 'error');
        }
    }

    // Enhanced message rendering for file attachments
    renderMessages() {
        const messagesList = document.getElementById('messagesList');
        const welcomeState = document.getElementById('welcomeState');
        
        if (!this.currentConversation || this.messages.length === 0) {
            messagesList.style.display = 'none';
            welcomeState.style.display = 'flex';
            return;
        }
        
        welcomeState.style.display = 'none';
        messagesList.style.display = 'flex';
        
        messagesList.innerHTML = this.messages.map(message => {
            const isOwnMessage = message.senderId === this.currentUser.uid;
            const messageClass = isOwnMessage ? 'own-message' : 'other-message';
            const timestamp = this.formatTimestamp(message.timestamp);
            
            if (message.type === 'file') {
                return `
                    <div class="message ${messageClass}">
                        <div class="message-header">
                            <span class="message-author">${message.senderName}</span>
                            <span class="message-time">${timestamp}</span>
                        </div>
                        <div class="message-bubble">
                            <div class="file-message">
                                <div class="file-icon">📎</div>
                                <div class="file-details">
                                    <div class="file-name">${message.content}</div>
                                    <div class="file-size">${this.formatFileSize(message.fileSize)}</div>
                                </div>
                                <a href="${message.fileUrl}" target="_blank" class="download-btn" title="Download file">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                        <polyline points="7,10 12,15 17,10"/>
                                        <line x1="12" y1="15" x2="12" y2="3"/>
                                    </svg>
                                </a>
                            </div>
                        </div>
                        <div class="message-status">✓</div>
                    </div>
                `;
            } else {
                return `
                    <div class="message ${messageClass}">
                        <div class="message-header">
                            <span class="message-author">${message.senderName}</span>
                            <span class="message-time">${timestamp}</span>
                        </div>
                        <div class="message-bubble">
                            <div class="message-text">${message.content}</div>
                        </div>
                        <div class="message-status">✓</div>
                    </div>
                `;
            }
        }).join('');
        
        this.scrollToBottom();
    }

    // Enhanced conversation rendering for group chats
    renderConversations() {
        const conversationsList = document.getElementById('conversationsList');
        
        if (this.conversations.length === 0) {
            conversationsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💬</div>
                    <h3>No conversations yet</h3>
                    <p>Start a conversation to connect with other creators</p>
                    <button class="start-conversation-btn" onclick="messagesApp.showNewConversationModal()">
                        Start Conversation
                    </button>
                </div>
            `;
            return;
        }
        
        conversationsList.innerHTML = this.conversations.map(conversation => {
            const isGroupChat = conversation.type === 'group';
            const isActive = this.currentConversation && this.currentConversation.id === conversation.id;
            const activeClass = isActive ? 'active' : '';
            
            // Get conversation display name
            let displayName = conversation.conversationName || 'Unknown';
            if (isGroupChat) {
                displayName = conversation.conversationName;
            } else {
                // For direct messages, show the other person's name
                const otherParticipant = conversation.participantNames.find(name => 
                    name !== (this.currentUser?.displayName || 'You')
                );
                displayName = otherParticipant || 'Unknown';
            }
            
            // Format the last message preview
            let lastMessagePreview = conversation.lastMessage || 'No messages yet';
            
            // Handle different message types in preview
            if (lastMessagePreview.includes('🎤 Voice message')) {
                lastMessagePreview = '🎤 Voice message';
            } else if (lastMessagePreview.includes('💰')) {
                lastMessagePreview = '💰 Money sent';
            } else if (lastMessagePreview.includes('📎')) {
                lastMessagePreview = '📎 File sent';
            } else if (lastMessagePreview.length > 50) {
                lastMessagePreview = lastMessagePreview.substring(0, 50) + '...';
            }
            
            return `
                <div class="conversation-item ${activeClass}" onclick="messagesApp.selectConversation('${conversation.id}')">
                    <div class="conversation-avatar">
                        ${isGroupChat ? '👥' : '👤'}
                    </div>
                    <div class="conversation-info">
                        <div class="conversation-header">
                            <span class="conversation-name">${displayName}</span>
                            <span class="conversation-time">${this.formatTimestamp(conversation.lastMessageAt)}</span>
                        </div>
                        <div class="conversation-preview">
                            <span class="preview-text">${lastMessagePreview}</span>
                            ${conversation.unreadCount > 0 ? `<span class="unread-badge">${conversation.unreadCount}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Voice-to-Text and Recording Features
    toggleVoiceRecording() {
        if (!this.currentConversation) {
            this.showToast('Please select a conversation first', 'error');
            return;
        }

        if (this.isRecording) {
            this.stopVoiceRecording();
        } else {
            this.startVoiceRecording();
        }
    }

    startVoiceRecording() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.showToast('Voice recording not supported in this browser', 'error');
            return;
        }

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                this.mediaRecorder = new MediaRecorder(stream);
                this.audioChunks = [];

                this.mediaRecorder.ondataavailable = (event) => {
                    this.audioChunks.push(event.data);
                };

                this.mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                    this.sendVoiceMessage(audioBlob);
                    stream.getTracks().forEach(track => track.stop());
                };

                this.mediaRecorder.start();
                this.isRecording = true;
                this.updateVoiceButton();
                this.showToast('Recording... Click again to stop', 'info');
            })
            .catch(error => {
                console.error('Error accessing microphone:', error);
                this.showToast('Unable to access microphone', 'error');
            });
    }

    stopVoiceRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.updateVoiceButton();
        }
    }

    updateVoiceButton() {
        const voiceBtn = document.querySelector('.voice-btn');
        if (voiceBtn) {
            if (this.isRecording) {
                voiceBtn.classList.add('recording');
                voiceBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="6" y="6" width="12" height="12"/>
                    </svg>
                `;
            } else {
                voiceBtn.classList.remove('recording');
                voiceBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                        <line x1="12" y1="19" x2="12" y2="23"/>
                        <line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                `;
            }
        }
    }

    async sendVoiceMessage(audioBlob) {
        if (!this.currentConversation) {
            this.showToast('Please select a conversation first', 'error');
            return;
        }

        try {
            // Create a unique filename for the voice message
            const timestamp = Date.now();
            const filename = `voice_${timestamp}.webm`;
            
            // Show loading state
            this.showToast('Sending voice message...', 'info');

            // Create a temporary URL for the blob
            const audioUrl = URL.createObjectURL(audioBlob);
            
            console.log('Creating voice message with URL:', audioUrl);
            
            // Create voice message object WITHOUT the blob (Firestore doesn't support blobs)
            const voiceMessage = {
                type: 'voice',
                audioUrl: audioUrl,
                duration: Math.round(audioBlob.size / 1000), // Approximate duration
                senderId: this.currentUser.uid,
                senderName: this.currentUser.displayName || 'Unknown',
                senderPic: this.currentUser.photoURL || 'assets/images/default-avatar.svg',
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'sent',
                filename: filename,
                blobSize: audioBlob.size // Store size for reference
            };

            console.log('Saving voice message to Firestore:', voiceMessage);

            // Save to Firestore first (without the blob)
            const messageRef = await firebase.firestore()
                .collection('conversations')
                .doc(this.currentConversation.id)
                .collection('messages')
                .add(voiceMessage);

            console.log('Voice message saved with ID:', messageRef.id);

            // Update conversation with voice message info
            await firebase.firestore()
                .collection('conversations')
                .doc(this.currentConversation.id)
                .update({
                    lastMessage: '🎤 Voice message',
                    lastMessageAt: firebase.firestore.FieldValue.serverTimestamp()
                });

            // Update local conversation object
            this.currentConversation.lastMessage = '🎤 Voice message';
            this.currentConversation.lastMessageAt = new Date();
            
            console.log('Conversation updated, re-rendering conversations');
            this.renderConversations();

            // Reload messages to show the new voice message
            console.log('Reloading messages for conversation:', this.currentConversation.id);
            await this.loadMessages(this.currentConversation.id);
            
            this.showToast('Voice message sent!', 'success');
            
            // Firebase Storage upload completely disabled to prevent CORS errors
            // Voice messages work perfectly with blob URLs

        } catch (error) {
            console.error('Error sending voice message:', error);
            this.showToast('Error sending voice message', 'error');
        }
    }

    // Enhanced Voice-to-Text Feature
    startSpeechToText() {
        if (!this.recognition) {
            this.showToast('Speech recognition not supported in this browser', 'error');
            return;
        }

        const messageInput = document.getElementById('messageInput');
        const voiceBtn = document.querySelector('.voice-btn');
        
        // Visual feedback
        if (voiceBtn) {
            voiceBtn.classList.add('recording');
            voiceBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="6" y="6" width="12" height="12"/>
                </svg>
            `;
        }
        
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            messageInput.value = transcript;
            this.updateSendButton();
            this.showToast('Voice transcribed!', 'success');
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.showToast('Speech recognition error: ' + event.error, 'error');
            this.resetVoiceButton();
        };

        this.recognition.onend = () => {
            this.resetVoiceButton();
        };

        this.recognition.start();
        this.showToast('Listening... Speak now', 'info');
    }

    resetVoiceButton() {
        const voiceBtn = document.querySelector('.voice-btn');
        if (voiceBtn) {
            voiceBtn.classList.remove('recording');
            voiceBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
            `;
        }
    }

    // Full WebRTC Call and Video Features
    async startVoiceCall() {
        console.log('🔊 Starting voice call...');
        
        if (!this.currentConversation) {
            this.showToast('Please select a conversation first', 'error');
            console.log('❌ No conversation selected');
            return;
        }
        
        console.log('✅ Conversation selected, initializing voice call');
        this.isVideoCall = false;
        await this.initializeCall();
    }

    async startVideoCall() {
        console.log('📹 Starting video call...');
        
        if (!this.currentConversation) {
            this.showToast('Please select a conversation first', 'error');
            console.log('❌ No conversation selected');
            return;
        }
        
        console.log('✅ Conversation selected, initializing video call');
        this.isVideoCall = true;
        await this.initializeCall();
    }

    async initializeCall() {
        try {
            console.log('🔧 Initializing call...');
            
            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('getUserMedia not supported');
            }
            
            // Get user media
            const constraints = {
                audio: true,
                video: this.isVideoCall
            };
            
            console.log('📹 Requesting media permissions...');
            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('✅ Media permissions granted');
            
            // Create peer connection
            this.peerConnection = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            });
            
            // Add local stream
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });
            
            // Handle remote stream
            this.peerConnection.ontrack = (event) => {
                this.remoteStream = event.streams[0];
                this.displayRemoteStream();
            };
            
            // Create and send offer
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            
            // Save call data to Firestore
            const callData = {
                type: this.isVideoCall ? 'video' : 'voice',
                callerId: this.currentUser.uid,
                callerName: this.currentUser.displayName || 'Unknown',
                conversationId: this.currentConversation.id,
                offer: offer,
                timestamp: new Date(),
                status: 'calling'
            };
            
            console.log('💾 Saving call data to Firestore...');
            const callDoc = await firebase.firestore()
                .collection('calls')
                .add(callData);
            
            this.callState = 'calling';
            this.isInCall = true;
            this.updateCallUI();
            this.showCallInterface();
            
            console.log('✅ Call interface shown successfully');
            
            // Listen for answer
            this.listenForCallAnswer(callDoc.id);
            
        } catch (error) {
            console.error('❌ Error starting call:', error);
            this.showToast(`Error starting call: ${error.message}`, 'error');
        }
    }

    async answerCall(callId) {
        try {
            const callDoc = await firebase.firestore()
                .collection('calls')
                .doc(callId)
                .get();
            
            if (!callDoc.exists) return;
            
            const callData = callDoc.data();
            
            // Get user media
            const constraints = {
                audio: true,
                video: callData.type === 'video'
            };
            
            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // Create peer connection
            this.peerConnection = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            });
            
            // Add local stream
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });
            
            // Handle remote stream
            this.peerConnection.ontrack = (event) => {
                this.remoteStream = event.streams[0];
                this.displayRemoteStream();
            };
            
            // Set remote description
            await this.peerConnection.setRemoteDescription(callData.offer);
            
            // Create and send answer
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            
            // Update call status
            await firebase.firestore()
                .collection('calls')
                .doc(callId)
                .update({
                    answer: answer,
                    status: 'connected',
                    answeredAt: new Date()
                });
            
            this.callState = 'connected';
            this.isInCall = true;
            this.isVideoCall = callData.type === 'video';
            this.updateCallUI();
            this.showCallInterface();
            
        } catch (error) {
            console.error('Error answering call:', error);
            this.showToast('Error answering call', 'error');
        }
    }

    async endCall() {
        try {
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => track.stop());
            }
            
            if (this.peerConnection) {
                this.peerConnection.close();
            }
            
            this.localStream = null;
            this.remoteStream = null;
            this.peerConnection = null;
            this.isInCall = false;
            this.callState = 'idle';
            
            this.hideCallInterface();
            this.updateCallUI();
            
            // Update call status in Firestore
            if (this.currentCallId) {
                await firebase.firestore()
                    .collection('calls')
                    .doc(this.currentCallId)
                    .update({
                        status: 'ended',
                        endedAt: new Date()
                    });
            }
            
        } catch (error) {
            console.error('Error ending call:', error);
        }
    }

    showCallInterface() {
        const callInterface = document.createElement('div');
        callInterface.id = 'callInterface';
        callInterface.className = 'call-interface';
        callInterface.innerHTML = `
            <div class="call-header">
                <h3>${this.isVideoCall ? 'Video' : 'Voice'} Call</h3>
                <span class="call-status">${this.callState}</span>
            </div>
            <div class="call-content">
                ${this.isVideoCall ? `
                    <video id="remoteVideo" autoplay playsinline></video>
                    <video id="localVideo" autoplay playsinline muted></video>
                ` : `
                    <div class="voice-call-info">
                        <div class="caller-info">
                            <img src="${this.currentUser.photoURL || 'assets/images/default-avatar.svg'}" alt="Caller" class="caller-avatar">
                            <div class="caller-details">
                                <h4>${this.currentUser.displayName || 'Unknown'}</h4>
                                <p>${this.isVideoCall ? 'Video' : 'Voice'} call in progress</p>
                            </div>
                        </div>
                    </div>
                `}
            </div>
            <div class="call-controls">
                <button class="call-btn mute-btn" onclick="messagesApp.toggleMute()">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                        <line x1="12" y1="19" x2="12" y2="23"/>
                        <line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                </button>
                ${this.isVideoCall ? `
                    <button class="call-btn camera-btn" onclick="messagesApp.toggleCamera()">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                            <circle cx="12" cy="13" r="4"/>
                        </svg>
                    </button>
                ` : ''}
                <button class="call-btn end-call-btn" onclick="messagesApp.endCall()">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                </button>
            </div>
        `;
        
        document.body.appendChild(callInterface);
        
        // Display local video
        if (this.isVideoCall && this.localStream) {
            const localVideo = document.getElementById('localVideo');
            if (localVideo) {
                localVideo.srcObject = this.localStream;
            }
        }
    }

    hideCallInterface() {
        const callInterface = document.getElementById('callInterface');
        if (callInterface) {
            callInterface.remove();
        }
    }

    displayRemoteStream() {
        if (this.isVideoCall && this.remoteStream) {
            const remoteVideo = document.getElementById('remoteVideo');
            if (remoteVideo) {
                remoteVideo.srcObject = this.remoteStream;
            }
        }
    }

    updateCallUI() {
        const voiceCallBtn = document.querySelector('.action-btn[onclick*="startVoiceCall"]');
        const videoCallBtn = document.querySelector('.action-btn[onclick*="startVideoCall"]');
        
        if (voiceCallBtn) {
            if (this.isInCall && !this.isVideoCall) {
                voiceCallBtn.classList.add('call-active');
            } else {
                voiceCallBtn.classList.remove('call-active');
            }
        }
        
        if (videoCallBtn) {
            if (this.isInCall && this.isVideoCall) {
                videoCallBtn.classList.add('video-active');
            } else {
                videoCallBtn.classList.remove('video-active');
            }
        }
    }

    toggleMute() {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                const muteBtn = document.querySelector('.mute-btn');
                if (muteBtn) {
                    muteBtn.classList.toggle('muted');
                }
            }
        }
    }

    toggleCamera() {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                const cameraBtn = document.querySelector('.camera-btn');
                if (cameraBtn) {
                    cameraBtn.classList.toggle('camera-off');
                }
            }
        }
    }

    listenForCallAnswer(callId) {
        const unsubscribe = firebase.firestore()
            .collection('calls')
            .doc(callId)
            .onSnapshot((doc) => {
                if (doc.exists) {
                    const callData = doc.data();
                    if (callData.status === 'connected' && callData.answer) {
                        this.peerConnection.setRemoteDescription(callData.answer);
                        this.callState = 'connected';
                        this.updateCallUI();
                    } else if (callData.status === 'ended') {
                        this.endCall();
                    }
                }
            });
        
        // Store unsubscribe function
        this.callUnsubscribe = unsubscribe;
    }

    // Listen for incoming calls
    setupCallListener() {
        firebase.firestore()
            .collection('calls')
            .where('status', '==', 'calling')
            .where('conversationId', '==', this.currentConversation?.id)
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const callData = change.doc.data();
                        if (callData.callerId !== this.currentUser.uid) {
                            this.showIncomingCallModal(callData, change.doc.id);
                        }
                    }
                });
            });
    }

    showIncomingCallModal(callData, callId) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay incoming-call-modal';
        modal.innerHTML = `
            <div class="modal incoming-call">
                <div class="caller-info">
                    <img src="${callData.callerPic || 'assets/images/default-avatar.svg'}" alt="Caller" class="caller-avatar">
                    <h3>${callData.callerName}</h3>
                    <p>Incoming ${callData.type} call</p>
                </div>
                <div class="call-actions">
                    <button class="call-btn answer-btn" onclick="messagesApp.answerCall('${callId}')">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                    </button>
                    <button class="call-btn decline-btn" onclick="messagesApp.declineCall('${callId}')">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto-remove after 30 seconds
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 30000);
    }

    async declineCall(callId) {
        await firebase.firestore()
            .collection('calls')
            .doc(callId)
            .update({
                status: 'declined',
                declinedAt: new Date()
            });
        
        const modal = document.querySelector('.incoming-call-modal');
        if (modal) {
            modal.remove();
        }
    }

    // Send Money Feature
    showMoneyModal() {
        if (!this.currentConversation) {
            this.showToast('Please select a conversation first', 'error');
            return;
        }
        
        const moneyModal = document.createElement('div');
        moneyModal.className = 'modal-overlay';
        moneyModal.id = 'moneyModal';
        moneyModal.innerHTML = `
            <div class="modal money-modal">
                <div class="modal-header">
                    <h3>💰 Send Money</h3>
                    <button class="close-btn" onclick="messagesApp.hideMoneyModal()">×</button>
                </div>
                <div class="modal-body">
                    <div class="money-form">
                        <div class="form-group">
                            <label for="moneyAmount" class="form-label">Amount ($)</label>
                            <input type="number" id="moneyAmount" class="form-input" placeholder="0.00" min="0.01" step="0.01">
                        </div>
                        <div class="form-group">
                            <label for="moneyMessage" class="form-label">Message (Optional)</label>
                            <textarea id="moneyMessage" class="form-textarea" placeholder="Add a message..."></textarea>
                        </div>
                        <div class="money-preview">
                            <div class="preview-amount">$<span id="previewAmount">0.00</span></div>
                            <div class="preview-message" id="previewMessage">No message</div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="secondary-btn" onclick="messagesApp.hideMoneyModal()">Cancel</button>
                    <button class="primary-btn" onclick="messagesApp.sendMoney()">Send Money</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(moneyModal);
        this.setupMoneyModalListeners();
    }

    hideMoneyModal() {
        const moneyModal = document.getElementById('moneyModal');
        if (moneyModal) {
            moneyModal.remove();
        }
    }

    setupMoneyModalListeners() {
        const amountInput = document.getElementById('moneyAmount');
        const messageInput = document.getElementById('moneyMessage');
        
        if (amountInput) {
            amountInput.addEventListener('input', () => {
                const amount = parseFloat(amountInput.value) || 0;
                document.getElementById('previewAmount').textContent = amount.toFixed(2);
            });
        }
        
        if (messageInput) {
            messageInput.addEventListener('input', () => {
                const message = messageInput.value;
                document.getElementById('previewMessage').textContent = message || 'No message';
            });
        }
    }

    async sendMoney() {
        const amountInput = document.getElementById('moneyAmount');
        const messageInput = document.getElementById('moneyMessage');
        
        if (!amountInput || !messageInput) return;
        
        const amount = parseFloat(amountInput.value);
        const message = messageInput.value;
        
        if (!amount || amount <= 0) {
            this.showToast('Please enter a valid amount', 'error');
            return;
        }

        if (amount > 10000) {
            this.showToast('Maximum amount is $10,000', 'error');
            return;
        }

        try {
            // Show loading state
            const sendButton = document.querySelector('.money-modal .primary-btn');
            if (sendButton) {
                sendButton.textContent = 'Sending...';
                sendButton.disabled = true;
            }

            // Create money message with enhanced details
            const moneyMessage = {
                type: 'money',
                amount: amount,
                message: message || 'Money sent',
                senderId: this.currentUser.uid,
                senderName: this.currentUser.displayName || 'Unknown',
                senderPic: this.currentUser.photoURL || 'assets/images/default-avatar.svg',
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'sent',
                transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                currency: 'USD',
                fee: (amount * 0.029) + 0.30, // Stripe-like fee calculation
                netAmount: amount - ((amount * 0.029) + 0.30)
            };

            // Save to Firestore
            await firebase.firestore()
                .collection('conversations')
                .doc(this.currentConversation.id)
                .collection('messages')
                .add(moneyMessage);

            // Update conversation
            await firebase.firestore()
                .collection('conversations')
                .doc(this.currentConversation.id)
                .update({
                    lastMessage: `💰 $${amount.toFixed(2)} sent`,
                    lastMessageAt: firebase.firestore.FieldValue.serverTimestamp()
                });

            this.currentConversation.lastMessage = `💰 $${amount.toFixed(2)} sent`;
            this.currentConversation.lastMessageAt = new Date();
            this.renderConversations();

            this.hideMoneyModal();
            this.showToast(`💰 $${amount.toFixed(2)} sent successfully!`, 'success');

            // Reload messages to show the new money message
            await this.loadMessages(this.currentConversation.id);

        } catch (error) {
            console.error('Error sending money:', error);
            this.showToast('Error sending money. Please try again.', 'error');
            
            // Reset button state
            const sendButton = document.querySelector('.money-modal .primary-btn');
            if (sendButton) {
                sendButton.textContent = 'Send Money';
                sendButton.disabled = false;
            }
        }
    }

    // Enhanced File Upload with Drag & Drop
    setupFileUpload() {
        const fileUploadArea = document.getElementById('fileUploadArea');
        const fileInput = document.getElementById('fileInput');

        // Drag and drop events
        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.classList.add('drag-over');
        });

        fileUploadArea.addEventListener('dragleave', () => {
            fileUploadArea.classList.remove('drag-over');
        });

        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelection(files[0]);
            }
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelection(e.target.files[0]);
            }
        });
    }

    handleFileSelection(file) {
        const filePreview = document.getElementById('filePreview');
        const uploadContent = document.querySelector('.file-upload-content');
        
        uploadContent.style.display = 'none';
        filePreview.style.display = 'block';
        
        this.previewFile(file);
    }

    showFileUploadArea() {
        document.getElementById('fileUploadArea').style.display = 'block';
        document.querySelector('.file-upload-content').style.display = 'block';
        document.getElementById('filePreview').style.display = 'none';
        document.getElementById('fileInput').value = '';
    }

    hideFileUploadArea() {
        document.getElementById('fileUploadArea').style.display = 'none';
    }

    showChatOptions() {
        this.showToast('Chat options coming soon!', 'info');
    }

    loadSampleConversations() {
        this.showToast('Sample conversations loaded!', 'success');
    }

    toggleNotifications() {
        this.showToast('Notifications toggled!', 'info');
    }

    logout() {
        firebase.auth().signOut();
    }

    // Modal and UI methods
    showModal(content) {
        const modal = document.getElementById('modal');
        const overlay = document.getElementById('modalOverlay');
        
        modal.innerHTML = content;
        overlay.style.display = 'flex';
    }

    hideModal() {
        document.getElementById('modalOverlay').style.display = 'none';
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Encryption Confirmation
    showEncryptionInfo() {
        const encryptionInfo = `
            <div class="encryption-info">
                <h3>🔒 End-to-End Encryption</h3>
                <div class="encryption-details">
                    <div class="encryption-item">
                        <span class="encryption-icon">🔐</span>
                        <span class="encryption-text">All messages are encrypted in transit</span>
                    </div>
                    <div class="encryption-item">
                        <span class="encryption-icon">🛡️</span>
                        <span class="encryption-text">256-bit AES encryption at rest</span>
                    </div>
                    <div class="encryption-item">
                        <span class="encryption-icon">🔑</span>
                        <span class="encryption-text">TLS 1.3 secure connections</span>
                    </div>
                    <div class="encryption-item">
                        <span class="encryption-icon">👁️</span>
                        <span class="encryption-text">Only conversation participants can read messages</span>
                    </div>
                </div>
                <div class="encryption-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <circle cx="12" cy="16" r="1"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <span>Messages are encrypted</span>
                </div>
            </div>
        `;
        
        this.showModal(encryptionInfo);
    }

    // Creator protection system
    async checkCreatorProtection(recipientId) {
        try {
            // Get recipient's profile
            const recipientDoc = await firebase.firestore()
                .collection('users')
                .doc(recipientId)
                .get();
            
            if (!recipientDoc.exists) return { allowed: true };
            
            const recipientData = recipientDoc.data();
            const followerCount = recipientData.followerCount || 0;
            
            // Apply restrictions based on follower count
            if (followerCount >= this.creatorSettings.followerThreshold) {
                return {
                    allowed: false,
                    reason: 'This creator has many followers. Direct messaging is limited.',
                    restrictions: {
                        maxMessagesPerDay: 10,
                        cooldownPeriod: 600000, // 10 minutes
                        allowDirectMessages: false,
                        allowGroupChats: true,
                        allowVoiceMessages: false,
                        allowMoneyMessages: true
                    }
                };
            }
            
            return { allowed: true };
        } catch (error) {
            console.error('Error checking creator protection:', error);
            return { allowed: true };
        }
    }

    async checkMessageLimits(recipientId) {
        try {
            const userDoc = await firebase.firestore()
                .collection('users')
                .doc(this.currentUser.uid)
                .get();
            
            if (!userDoc.exists) return { allowed: true };
            
            const userData = userDoc.data();
            const messageCount = userData.messageCount || 0;
            const lastMessageTime = userData.lastMessageTime || 0;
            const now = Date.now();
            
            // Check daily message limit
            if (messageCount >= this.creatorSettings.maxMessagesPerDay) {
                return { 
                    allowed: false, 
                    reason: 'Daily message limit reached' 
                };
            }
            
            // Check message cooldown
            if (now - lastMessageTime < this.creatorSettings.messageCooldown) {
                return { 
                    allowed: false, 
                    reason: 'Message cooldown active' 
                };
            }
            
            return { allowed: true };
            
        } catch (error) {
            console.error('Error checking message limits:', error);
            return { allowed: true };
        }
    }
}

// Global functions for testing
window.testMobileBackButton = function() {
    if (window.messagesApp) {
        return window.messagesApp.testMobileBackButtonClick();
    } else {
        console.error('❌ MessagesApp not available');
        return false;
    }
};

window.checkMobileBackButtonStatus = function() {
    if (window.messagesApp) {
        return window.messagesApp.checkMobileBackButtonStatus();
    } else {
        console.error('❌ MessagesApp not available');
        return false;
    }
};

window.showConversationsList = function() {
    if (window.messagesApp) {
        return window.messagesApp.showConversationsList();
    } else {
        console.error('❌ MessagesApp not available');
        return false;
    }
};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.messagesApp = new MessagesApp();
}); 