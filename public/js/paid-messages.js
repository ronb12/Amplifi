// Paid Messages Application
console.log('💬 Messages: JavaScript file loaded - START');

class PaidMessagesApp {
    constructor() {
        this.currentUser = null;
        this.selectedCreator = null;
        this.selectedMessageType = null;
        this.creators = [];
        this.messageHistory = [];
        
        this.init();
    }

    // Initialize the app
    init() {
        console.log('💬 Messages: Initializing paid messages app...');
        this.initFirebase();
        this.setupAuthStateListener();
        this.setupEventListeners();
    }

    // Initialize Firebase
    initFirebase() {
        console.log('💬 Messages: Initializing Firebase...');
        firebase.initializeApp(firebaseConfig);
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        this.storage = firebase.storage();
        console.log('💬 Messages: Firebase initialized successfully');
    }

    // Setup auth state listener (like feed.js)
    setupAuthStateListener() {
        console.log('🔍 Messages: Setting up auth state listener...');
        this.auth.onAuthStateChanged(async (user) => {
            console.log('🔍 Messages: Auth state changed, user:', user);
            console.log('🔍 Messages: User UID:', user?.uid);
            console.log('🔍 Messages: User email:', user?.email);
            
            if (user) {
                this.currentUser = user;
                console.log('✅ Messages: User authenticated');
                await this.loadCreators();
                this.updateUIForAuthenticatedUser();
            } else {
                console.log('⚠️ Messages: No authenticated user, showing unauthenticated UI');
                this.updateUIForUnauthenticatedUser();
            }
        });
    }

    // Update UI for authenticated users
    updateUIForAuthenticatedUser() {
        console.log('💬 Messages: Updating UI for authenticated user');
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            // Show the messages content
            mainContent.style.display = 'block';
        }
    }

    // Update UI for unauthenticated users (like feed.js)
    updateUIForUnauthenticatedUser() {
        console.log('💬 Messages: Updating UI for unauthenticated user');
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="login-prompt" style="text-align: center; padding: 4rem 2rem;">
                    <h2 style="margin-bottom: 1rem; color: #1f2937;">Welcome to Paid Messages</h2>
                    <p style="margin-bottom: 2rem; color: #6b7280; font-size: 1.1rem;">
                        Please log in to send paid messages to your favorite creators.
                    </p>
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <button onclick="window.location.href='index.html'" class="btn btn-primary" style="padding: 0.75rem 2rem;">
                            Go to Login
                        </button>
                        <button onclick="window.location.href='feed.html'" class="btn btn-secondary" style="padding: 0.75rem 2rem;">
                            Browse Feed
                        </button>
                    </div>
                </div>
            `;
        }
        
        // Hide user-specific elements (like feed.js)
        const userMenu = document.getElementById('userMenu');
        if (userMenu) userMenu.style.display = 'none';
    }

    // Setup event listeners
    setupEventListeners() {
        console.log('💬 Messages: Setting up event listeners');
        
        // Creator selection
        const creatorCards = document.querySelectorAll('.creator-card');
        creatorCards.forEach(card => {
            card.addEventListener('click', () => {
                const creatorId = card.dataset.creatorId;
                this.selectCreator(creatorId);
            });
        });

        // Message type selection
        const messageTypeBtns = document.querySelectorAll('.message-type-btn');
        messageTypeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const messageType = btn.dataset.messageType;
                this.selectMessageType(messageType);
            });
        });

        // Send message
        const sendMessageBtn = document.getElementById('sendMessageBtn');
        if (sendMessageBtn) {
            sendMessageBtn.addEventListener('click', () => this.sendPaidMessage());
        }

        // Voice recording
        const recordVoiceBtn = document.getElementById('recordVoiceBtn');
        if (recordVoiceBtn) {
            recordVoiceBtn.addEventListener('click', () => this.recordVoice());
        }

        // Close modal buttons
        const closeBtns = document.querySelectorAll('.close-btn');
        closeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal-overlay');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // Modal background clicks
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                e.target.style.display = 'none';
            }
        });
    }

    // Load creators
    async loadCreators() {
        try {
            console.log('💬 Messages: Loading creators...');
            const usersSnapshot = await this.db.collection('users').get();
            
            this.creators = [];
            usersSnapshot.forEach(doc => {
                const userData = doc.data();
                if (doc.id !== this.currentUser.uid) { // Exclude current user
                    this.creators.push({
                        id: doc.id,
                        name: userData.displayName || 'Creator',
                        photoURL: userData.photoURL || 'assets/images/default-avatar.svg',
                        bio: userData.bio || 'No bio available',
                        messagePrice: userData.messagePrice || 5.00
                    });
                }
            });
            
            this.renderCreators();
        } catch (error) {
            console.error('❌ Messages: Error loading creators:', error);
        }
    }

    // Render creators
    renderCreators() {
        const creatorsGrid = document.getElementById('creatorsGrid');
        if (!creatorsGrid) return;

        if (this.creators.length === 0) {
            creatorsGrid.innerHTML = `
                <div class="empty-state">
                    <h3>No creators available</h3>
                    <p>Check back later for creators to message!</p>
                </div>
            `;
            return;
        }

        creatorsGrid.innerHTML = this.creators.map(creator => `
            <div class="creator-card" data-creator-id="${creator.id}">
                <img src="${creator.photoURL}" alt="${creator.name}" class="creator-avatar">
                <div class="creator-info">
                    <h3>${creator.name}</h3>
                    <p>${creator.bio}</p>
                    <span class="message-price">$${creator.messagePrice} per message</span>
                </div>
            </div>
        `).join('');

        // Re-attach event listeners
        const creatorCards = document.querySelectorAll('.creator-card');
        creatorCards.forEach(card => {
            card.addEventListener('click', () => {
                const creatorId = card.dataset.creatorId;
                this.selectCreator(creatorId);
            });
        });
    }

    // Select creator
    selectCreator(creatorId) {
        this.selectedCreator = this.creators.find(c => c.id === creatorId);
        if (this.selectedCreator) {
            this.showCreatorProfile();
        }
    }

    // Show creator profile
    showCreatorProfile() {
        if (!this.selectedCreator) return;

        const modal = document.getElementById('creatorProfileModal');
        const creatorName = document.getElementById('profileCreatorName');
        const creatorAvatar = document.getElementById('profileCreatorAvatar');
        const creatorBio = document.getElementById('profileCreatorBio');
        const creatorPrice = document.getElementById('profileCreatorPrice');

        if (creatorName) creatorName.textContent = this.selectedCreator.name;
        if (creatorAvatar) creatorAvatar.src = this.selectedCreator.photoURL;
        if (creatorBio) creatorBio.textContent = this.selectedCreator.bio;
        if (creatorPrice) creatorPrice.textContent = `$${this.selectedCreator.messagePrice}`;

        if (modal) {
            modal.style.display = 'flex';
        }
    }

    // Hide creator profile
    hideCreatorProfile() {
        const modal = document.getElementById('creatorProfileModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Show message types
    showMessageTypes() {
        const modal = document.getElementById('messageTypesModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    // Hide message types
    hideMessageTypes() {
        const modal = document.getElementById('messageTypesModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Select message type
    selectMessageType(messageType) {
        this.selectedMessageType = messageType;
        this.hideMessageTypes();
        this.showMessageComposer();
    }

    // Show message composer
    showMessageComposer() {
        const modal = document.getElementById('messageComposerModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    // Hide message composer
    hideMessageComposer() {
        const modal = document.getElementById('messageComposerModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Send paid message
    async sendPaidMessage() {
        if (!this.selectedCreator || !this.selectedMessageType) {
            console.error('❌ Messages: No creator or message type selected');
            return;
        }

        const messageText = document.getElementById('messageText').value;
        if (!messageText.trim()) {
            console.error('❌ Messages: No message text');
            return;
        }

        try {
            console.log('💬 Messages: Sending paid message...');
            
            // Create payment intent
            const paymentIntent = await this.createPaymentIntent();
            
            // Save message to Firestore
            await this.savePaidMessage(messageText, paymentIntent.id);
            
            // Update creator stats
            await this.updateCreatorStats();
            
            this.hideMessageComposer();
            this.showPaymentSuccess();
            
        } catch (error) {
            console.error('❌ Messages: Error sending paid message:', error);
        }
    }

    // Create payment intent
    async createPaymentIntent() {
        // This would integrate with your Stripe backend
        console.log('💬 Messages: Creating payment intent...');
        return { id: 'pi_test_' + Date.now() };
    }

    // Save paid message
    async savePaidMessage(messageText, paymentIntentId) {
        const messageData = {
            senderId: this.currentUser.uid,
            recipientId: this.selectedCreator.id,
            messageType: this.selectedMessageType,
            messageText: messageText,
            paymentIntentId: paymentIntentId,
            amount: this.selectedCreator.messagePrice,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'sent'
        };

        await this.db.collection('paidMessages').add(messageData);
        console.log('💬 Messages: Message saved to Firestore');
    }

    // Update creator stats
    async updateCreatorStats() {
        const statsRef = this.db.collection('users').doc(this.selectedCreator.id)
            .collection('stats').doc('paidMessages');
        
        await statsRef.set({
            totalEarnings: firebase.firestore.FieldValue.increment(this.selectedCreator.messagePrice),
            totalMessages: firebase.firestore.FieldValue.increment(1),
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        console.log('💬 Messages: Creator stats updated');
    }

    // Show payment success
    showPaymentSuccess() {
        const modal = document.getElementById('paymentSuccessModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    // Hide payment success
    hidePayment() {
        const modal = document.getElementById('paymentSuccessModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Record voice message
    recordVoice() {
        console.log('💬 Messages: Recording voice message...');
        // Implementation for voice recording
    }

    // Load message history
    async loadMessageHistory() {
        try {
            const messagesSnapshot = await this.db.collection('paidMessages')
                .where('senderId', '==', this.currentUser.uid)
                .orderBy('createdAt', 'desc')
                .limit(20)
                .get();
            
            this.messageHistory = [];
            messagesSnapshot.forEach(doc => {
                this.messageHistory.push({ id: doc.id, ...doc.data() });
            });
            
            this.renderMessageHistory();
        } catch (error) {
            console.error('❌ Messages: Error loading message history:', error);
        }
    }

    // Render message history
    renderMessageHistory() {
        const historyContainer = document.getElementById('messageHistory');
        if (!historyContainer) return;

        if (this.messageHistory.length === 0) {
            historyContainer.innerHTML = `
                <div class="empty-state">
                    <h3>No messages yet</h3>
                    <p>Start by sending a message to a creator!</p>
                </div>
            `;
            return;
        }

        historyContainer.innerHTML = this.messageHistory.map(message => `
            <div class="message-item">
                <div class="message-header">
                    <span class="message-type">${message.messageType}</span>
                    <span class="message-date">${this.formatDate(message.createdAt)}</span>
                </div>
                <p class="message-text">${message.messageText}</p>
                <span class="message-amount">$${message.amount}</span>
            </div>
        `).join('');
    }

    // Format date
    formatDate(timestamp) {
        if (!timestamp) return 'Unknown';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString();
    }
}

// Initialize the paid messages app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    console.log('💬 Messages: DOM loaded, initializing PaidMessagesApp');
    window.paidMessagesApp = new PaidMessagesApp();
});