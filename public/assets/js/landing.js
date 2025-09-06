// Enhanced Landing Page JavaScript
if (typeof LandingPage === 'undefined') {
class LandingPage {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        // Setup global error handling
        if (window.ErrorUtils) {
            window.ErrorUtils.setupGlobalErrorHandler();
        }
        
        this.setupEventListeners();
        await this.setupAuthStateListener();
        this.initializeAnimations();
    }

    setupEventListeners() {
        // Modal and form elements (these are always present)
        const modal = document.getElementById('loginModal');
        const closeBtn = modal?.querySelector('.close');
        const authTabs = modal?.querySelectorAll('.auth-tab');
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const resetForm = document.getElementById('resetForm');
        const forgotPasswordLink = document.getElementById('forgotPasswordLink');
        const backToLoginLink = document.getElementById('backToLoginLink');

        // Header auth buttons
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');

        // Hero section buttons (these are always present)
        const getStartedBtn = document.getElementById('getStartedBtn');
        const learnMoreBtn = document.getElementById('learnMoreBtn');

        // Set up header auth button listeners
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showModal('login'));
        }
        if (signupBtn) {
            signupBtn.addEventListener('click', () => this.showModal('signup'));
        }

        // Set up hero button listeners
        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', () => this.showModal('signup'));
        }
        if (learnMoreBtn) {
            learnMoreBtn.addEventListener('click', () => this.scrollToFeatures());
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
        if (authTabs) {
            authTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const tabName = tab.getAttribute('data-tab');
                    this.switchAuthTab(tabName);
                });
            });
        }
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }
        if (forgotPasswordLink && loginForm && resetForm) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                loginForm.style.display = 'none';
                resetForm.style.display = 'block';
            });
        }
        if (backToLoginLink && loginForm && resetForm) {
            backToLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                resetForm.style.display = 'none';
                loginForm.style.display = 'block';
            });
        }
        if (resetForm) {
            resetForm.addEventListener('submit', (e) => this.handlePasswordReset(e));
        }
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    async setupAuthStateListener() {
        try {
            // Wait for Firebase to be fully initialized
            let attempts = 0;
            const maxAttempts = 100;
            
            while (attempts < maxAttempts) {
                if (typeof firebase !== 'undefined' && 
                    firebase.apps && 
                    firebase.apps.length > 0 &&
                    firebase.auth && 
                    typeof firebase.auth === 'function') {
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (typeof firebase !== 'undefined' && 
                firebase.apps && 
                firebase.apps.length > 0 &&
                firebase.auth && 
                typeof firebase.auth === 'function') {
                
                firebase.auth().onAuthStateChanged(async (user) => {
                    this.currentUser = user;
                    
                    if (user) {
                        // Fetch additional user data from Firestore
                        try {
                            if (firebase.firestore && typeof firebase.firestore === 'function') {
                                const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
                                if (userDoc.exists) {
                                    const userData = userDoc.data();
                                    // Update user object with additional data
                                    this.currentUser = { ...user, ...userData };
                                }
                            }
                        } catch (error) {
                            console.warn('Error fetching user data:', error);
                        }
                    }
                    
                    this.updateUI();
                });
                console.log('✅ Firebase Auth listener set up successfully');
            } else {
                console.warn('Firebase not fully initialized after waiting');
                // Fallback: show buttons for non-authenticated users
                this.updateUI();
            }
        } catch (error) {
            console.error('Error setting up auth state listener:', error);
            // Fallback: show buttons for non-authenticated users
            this.updateUI();
        }
        
        // Fallback timeout: if auth state doesn't change within 3 seconds, show buttons for non-authenticated users
        setTimeout(() => {
            if (!this.currentUser) {
                console.log('🕐 Auth state timeout - showing buttons for non-authenticated users');
                this.updateUI();
            }
        }, 3000);
    }

    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const userMenu = document.querySelector('.user-menu');
        
        if (this.currentUser) {
            // User is authenticated
            if (loginBtn) loginBtn.style.display = 'none';
            if (signupBtn) signupBtn.style.display = 'none';
            if (userMenu) userMenu.style.display = 'flex';
            
            this.updateHeroForAuthenticatedUser();
        } else {
            // User is not authenticated
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (signupBtn) signupBtn.style.display = 'inline-block';
            if (userMenu) userMenu.style.display = 'none';
            
            this.updateHeroForNonAuthenticatedUser();
        }
    }

    updateHeroForAuthenticatedUser() {
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const heroActions = document.querySelector('.hero-actions');
        
        if (heroTitle) {
            heroTitle.textContent = `Welcome back, ${this.getUserDisplayName()}!`;
        }
        if (heroSubtitle) {
            heroSubtitle.textContent = 'Ready to create and share your content?';
        }
        if (heroActions) {
            heroActions.innerHTML = `
                <a href="feed.html" class="btn btn-primary">Go to Feed</a>
                <a href="upload.html" class="btn btn-secondary">Create Post</a>
                <button class="btn btn-outline" onclick="landingPage.signOut()">Sign Out</button>
            `;
        }
        
        // Attach new button listeners
        this.attachAuthButtonListeners();
    }

    updateHeroForNonAuthenticatedUser() {
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const heroActions = document.querySelector('.hero-actions');
        
        if (heroTitle) {
            heroTitle.textContent = 'Welcome to Amplifi';
        }
        if (heroSubtitle) {
            heroSubtitle.textContent = 'The ultimate platform for creators to share, connect, and grow their audience.';
        }
        if (heroActions) {
            heroActions.innerHTML = `
                <button id="getStartedBtn" class="btn btn-primary">Get Started</button>
                <button id="learnMoreBtn" class="btn btn-secondary">Learn More</button>
            `;
        }
        
        // Attach hero button listeners
        this.attachHeroButtonListeners();
    }

    attachAuthButtonListeners() {
        const goToFeedBtn = document.querySelector('a[href="feed.html"]');
        const createPostBtn = document.querySelector('a[href="upload.html"]');
        const signOutBtn = document.querySelector('button[onclick="landingPage.signOut()"]');
        
        if (goToFeedBtn) {
            goToFeedBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'feed.html';
            });
        }
        if (createPostBtn) {
            createPostBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'upload.html';
            });
        }
    }

    attachHeroButtonListeners() {
        const getStartedBtn = document.getElementById('getStartedBtn');
        const learnMoreBtn = document.getElementById('learnMoreBtn');
        
        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', () => this.showModal('signup'));
        }
        if (learnMoreBtn) {
            learnMoreBtn.addEventListener('click', () => this.scrollToFeatures());
        }
    }

    showModal(tab = 'login') {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'block';
            this.switchAuthTab(tab);
        }
    }

    closeModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    switchAuthTab(tabName) {
        const tabs = document.querySelectorAll('.auth-tab');
        const forms = document.querySelectorAll('.auth-form');
        
        // Update tab states
        tabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Update form visibility
        forms.forEach(form => {
            if (form.id === `${tabName}Form`) {
                form.style.display = 'block';
            } else {
                form.style.display = 'none';
            }
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            if (typeof firebase !== 'undefined' && firebase.auth) {
                await firebase.auth().signInWithEmailAndPassword(email, password);
                this.showSuccess('Login successful!');
                this.closeModal();
            } else {
                this.showError('Firebase Auth not available');
            }
        } catch (error) {
            this.showError(this.getErrorMessage(error.code));
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const username = document.getElementById('signupUsername').value;
        const realName = document.getElementById('signupRealName').value;
        const displayName = document.getElementById('signupDisplayName').value;
        const useAlias = document.getElementById('signupUseAlias').checked;
        
        try {
            if (typeof firebase !== 'undefined' && firebase.auth) {
                const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;
                
                // Create user profile in Firestore
                if (firebase.firestore) {
                    await firebase.firestore().collection('users').doc(user.uid).set({
                        username: username,
                        realName: realName,
                        displayName: displayName,
                        useAlias: useAlias,
                        email: email,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        profileComplete: true
                    });
                }
                
                this.showSuccess('Account created successfully!');
                this.closeModal();
            } else {
                this.showError('Firebase Auth not available');
            }
        } catch (error) {
            this.showError(this.getErrorMessage(error.code));
        }
    }

    async handlePasswordReset(e) {
        e.preventDefault();
        
        const email = document.getElementById('resetEmail').value;
        
        try {
            if (typeof firebase !== 'undefined' && firebase.auth) {
                await firebase.auth().sendPasswordResetEmail(email);
                this.showSuccess('Password reset email sent!');
                this.closeModal();
            } else {
                this.showError('Firebase Auth not available');
            }
        } catch (error) {
            this.showError(this.getErrorMessage(error.code));
        }
    }

    async signOut() {
        try {
            if (typeof firebase !== 'undefined' && firebase.auth) {
                await firebase.auth().signOut();
                this.showSuccess('Signed out successfully!');
            } else {
                this.showError('Firebase Auth not available');
            }
        } catch (error) {
            this.showError('Error signing out');
        }
    }

    scrollToFeatures() {
        const featuresSection = document.querySelector('.features-section');
        if (featuresSection) {
            featuresSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    initializeAnimations() {
        // Add smooth animations to hero section
        const heroElements = document.querySelectorAll('.hero-content-wrapper > *');
        heroElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }

    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/user-not-found': 'No account found with this email address.',
            'auth/wrong-password': 'Incorrect password.',
            'auth/email-already-in-use': 'An account with this email already exists.',
            'auth/weak-password': 'Password should be at least 6 characters.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Please check your connection.',
            'auth/user-disabled': 'This account has been disabled.',
            'auth/operation-not-allowed': 'This operation is not allowed.',
            'auth/invalid-credential': 'Invalid credentials.',
            'auth/account-exists-with-different-credential': 'An account already exists with the same email address but different sign-in credentials.',
            'auth/requires-recent-login': 'Please log in again to complete this action.',
            'auth/too-many-requests': 'Too many requests. Please try again later.',
            'auth/network-request-failed': 'Network error. Please check your connection.'
        };
        
        return errorMessages[errorCode] || 'An error occurred. Please try again.';
    }

    showError(message) {
        this.showNotification({
            type: 'error',
            message: message,
            icon: '❌'
        });
    }

    showSuccess(message) {
        this.showNotification({
            type: 'success',
            message: message,
            icon: '✅'
        });
    }

    showNotification(notification) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        // Create notification element
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification ${notification.type}`;
        notificationElement.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${notification.icon}</span>
                <span class="notification-message">${notification.message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Add notification styles if not already present
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 3000;
                    max-width: 400px;
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                }
                
                .notification.error {
                    background: #fee2e2;
                    border: 1px solid #fecaca;
                    color: #dc2626;
                }
                
                .notification.success {
                    background: #dcfce7;
                    border: 1px solid #bbf7d0;
                    color: #16a34a;
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    padding: 1rem;
                    gap: 0.75rem;
                }
                
                .notification-icon {
                    font-size: 1.25rem;
                }
                
                .notification-message {
                    flex: 1;
                    font-weight: 500;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    font-size: 1.25rem;
                    cursor: pointer;
                    color: inherit;
                    opacity: 0.7;
                    transition: opacity 0.2s;
                }
                
                .notification-close:hover {
                    opacity: 1;
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notificationElement);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notificationElement.parentNode) {
                notificationElement.remove();
            }
        }, 5000);
        
        // Close button functionality
        const closeBtn = notificationElement.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notificationElement.remove();
            });
        }
    }

    getUserDisplayName() {
        if (!this.currentUser) return 'User';
        
        // Try different sources for the display name
        if (this.currentUser.displayName && this.currentUser.displayName.trim()) {
            return this.currentUser.displayName;
        }
        
        if (this.currentUser.email) {
            const emailName = this.currentUser.email.split('@')[0];
            // Capitalize first letter and replace dots/underscores with spaces
            return emailName.charAt(0).toUpperCase() + emailName.slice(1).replace(/[._]/g, ' ');
        }
        
        if (this.currentUser.username && this.currentUser.username.trim()) {
            return this.currentUser.username;
        }
        
        return 'User';
    }
}

// Initialize landing page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOMContentLoaded event fired for landing page');
    window.landingPage = new LandingPage();
    console.log('✅ LandingPage instance created');
});
} 