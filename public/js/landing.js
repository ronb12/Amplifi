// Enhanced Landing Page JavaScript
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

        // Hero section buttons (these are always present)
        const getStartedBtn = document.getElementById('getStartedBtn');
        const learnMoreBtn = document.getElementById('learnMoreBtn');

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
            firebase.auth().onAuthStateChanged(async (user) => {
                this.currentUser = user;
                
                if (user) {
                    // Fetch additional user data from Firestore
                    try {
                        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
                        if (userDoc.exists) {
                            const userData = userDoc.data();
                            // Merge Firestore data with auth data
                            this.currentUser = {
                                ...user,
                                displayName: userData.displayName || user.displayName || user.email?.split('@')[0] || 'User',
                                photoURL: userData.photoURL || user.photoURL || 'assets/images/default-avatar.svg',
                                username: userData.username || userData.displayName || user.displayName || user.email?.split('@')[0] || 'user'
                            };
                        } else {
                            // If no Firestore profile, use auth data with better fallbacks
                            this.currentUser = {
                                ...user,
                                displayName: user.displayName || user.email?.split('@')[0] || 'User',
                                photoURL: user.photoURL || 'assets/images/default-avatar.svg',
                                username: user.displayName || user.email?.split('@')[0] || 'user'
                            };
                        }
                    } catch (error) {
                        console.error('Error fetching user profile:', error);
                        // Fallback to auth data
                        this.currentUser = {
                            ...user,
                            displayName: user.displayName || user.email?.split('@')[0] || 'User',
                            photoURL: user.photoURL || 'assets/images/default-avatar.svg',
                            username: user.displayName || user.email?.split('@')[0] || 'user'
                        };
                    }
                }
                
                this.updateUI();
            });
        } catch (error) {
            console.error('Error setting up auth state listener:', error);
        }
    }

    updateUI() {
        const headerActions = document.querySelector('.header-actions');
        
        if (this.currentUser) {
            // User is logged in - show user menu with welcome message
            if (headerActions) {
                headerActions.innerHTML = `
                    <div class="user-menu" style="display: flex; align-items: center; gap: 1rem;">
                        <span style="color: #6366f1; font-weight: 500;">Welcome back, ${this.getUserDisplayName()}!</span>
                        <button id="notificationBtn" class="notification-btn" aria-label="Notifications">
                            <span class="notification-icon" aria-label="Notification bell">🔔</span>
                            <span class="notification-badge" id="notificationBadge" style="display: none;">0</span>
                        </button>
                        <a href="profile.html" id="userAvatarLink" aria-label="Profile">
                            <img src="${this.currentUser.photoURL || 'assets/images/default-avatar.svg'}" alt="User Avatar" class="user-avatar">
                        </a>
                        <div class="user-dropdown" style="position: relative; display: inline-block;">
                            <button class="btn btn-secondary" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'block' ? 'none' : 'block'">▼</button>
                            <div class="dropdown-content" style="display: none; position: absolute; right: 0; background: white; min-width: 200px; box-shadow: 0 8px 16px rgba(0,0,0,0.2); border-radius: 8px; z-index: 1000; padding: 0.5rem 0;">
                                <a href="feed.html" style="display: block; padding: 0.5rem 1rem; text-decoration: none; color: #333;">📱 Go to Feed</a>
                                <a href="dashboard.html" style="display: block; padding: 0.5rem 1rem; text-decoration: none; color: #333;">📊 Dashboard</a>
                                <a href="upload.html" style="display: block; padding: 0.5rem 1rem; text-decoration: none; color: #333;">➕ Create Post</a>
                                <a href="profile.html" style="display: block; padding: 0.5rem 1rem; text-decoration: none; color: #333;">👤 Profile</a>
                                <a href="#" onclick="landingPage.signOut()" style="display: block; padding: 0.5rem 1rem; text-decoration: none; color: #333;">🚪 Sign Out</a>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            // Update hero section for authenticated users
            this.updateHeroForAuthenticatedUser();
        } else {
            // User is not logged in - show login/signup buttons
            if (headerActions) {
                headerActions.innerHTML = `
                    <button id="loginBtn" class="btn btn-primary" style="margin-right: 0.5rem;">Login</button>
                    <button id="signupBtn" class="btn btn-secondary">Sign Up</button>
                `;
                this.attachAuthButtonListeners();
            }
            
            // Reset hero section for non-authenticated users
            this.updateHeroForNonAuthenticatedUser();
        }
    }
    
    updateHeroForAuthenticatedUser() {
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const heroActions = document.querySelector('.hero-actions');
        
        if (heroTitle) {
            heroTitle.textContent = `Welcome back to Amplifi!`;
        }
        
        if (heroSubtitle) {
            heroSubtitle.textContent = `Ready to create and share? Jump back into your creative journey or explore what's new.`;
        }
        
        if (heroActions) {
            heroActions.innerHTML = `
                <a href="feed.html" class="btn btn-primary" style="padding: 0.75rem 2rem; font-size: 1.1rem; font-weight: 600;">📱 Go to Feed</a>
                <a href="upload.html" class="btn btn-secondary" style="padding: 0.75rem 2rem; font-size: 1.1rem; font-weight: 600;">➕ Create Post</a>
                <a href="dashboard.html" class="btn btn-secondary" style="padding: 0.75rem 2rem; font-size: 1.1rem; font-weight: 600;">📊 Dashboard</a>
            `;
        }
    }
    
    updateHeroForNonAuthenticatedUser() {
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const heroActions = document.querySelector('.hero-actions');
        
        if (heroTitle) {
            heroTitle.textContent = `Share Your World with Amplifi`;
        }
        
        if (heroSubtitle) {
            heroSubtitle.textContent = `Connect, create, and share your moments with the world. Join millions of creators on Amplifi.`;
        }
        
        if (heroActions) {
            heroActions.innerHTML = `
                <button id="getStartedBtn" class="btn btn-primary" style="padding: 0.75rem 2rem; font-size: 1.1rem; font-weight: 600;">Get Started</button>
                <button id="learnMoreBtn" class="btn btn-secondary" style="padding: 0.75rem 2rem; font-size: 1.1rem; font-weight: 600;">Learn More</button>
            `;
            // Re-attach event listeners for the new buttons
            this.attachHeroButtonListeners();
        }
    }

    // Helper to always re-attach event listeners after header update
    attachAuthButtonListeners() {
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showModal('login'));
        }
        if (signupBtn) {
            signupBtn.addEventListener('click', () => this.showModal('signup'));
        }
    }

    // Helper to re-attach hero button listeners
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
            document.body.style.overflow = 'hidden';
            this.switchAuthTab(tab);
            
            // Focus on first input
            setTimeout(() => {
                const firstInput = modal.querySelector('input');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 100);
        }
    }

    closeModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Reset forms
            const forms = modal.querySelectorAll('form');
            forms.forEach(form => form.reset());
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
                form.classList.add('active');
            } else {
                form.style.display = 'none';
                form.classList.remove('active');
            }
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        if (!email || !password) {
            this.showError('Please fill in all fields');
            return;
        }
        
        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="btn-loading show">Logging in...</span>';
            
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            console.log('Login successful:', userCredential.user);
            
            this.closeModal();
            this.showSuccess('Login successful! Redirecting...');
            
            // Redirect to feed
            setTimeout(() => {
                window.location.href = 'feed.html';
            }, 1000);
            
        } catch (error) {
            console.error('Login error:', error);
            this.showError(this.getErrorMessage(error.code));
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Login';
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
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        if (!email || !password || !username || !displayName) {
            this.showError('Please fill in all required fields');
            return;
        }
        
        // Validate password strength
        if (password.length < 6) {
            this.showError('Password must be at least 6 characters long');
            return;
        }
        
        // Validate username format
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
            this.showError('Username must be 3-20 characters and contain only letters, numbers, and underscores');
            return;
        }
        
        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="btn-loading show">Creating account...</span>';
            
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            
            // Create user profile in Firestore
            await firebase.firestore().collection('users').doc(userCredential.user.uid).set({
                username: username,
                email: email,
                realName: realName || null,
                displayName: displayName,
                useAlias: useAlias,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                bio: '',
                profilePic: '',
                followers: [],
                following: [],
                posts: 0,
                likes: 0,
                privacySettings: {
                    showRealName: !useAlias,
                    showEmail: false,
                    profileVisibility: 'public'
                }
            });
            
            console.log('Signup successful:', userCredential.user);
            
            this.closeModal();
            this.showSuccess('Account created successfully! Redirecting...');
            
            // Redirect to feed
            setTimeout(() => {
                window.location.href = 'feed.html';
            }, 1000);
            
        } catch (error) {
            console.error('Signup error:', error);
            this.showError(this.getErrorMessage(error.code));
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Sign Up';
        }
    }

    async handlePasswordReset(e) {
        e.preventDefault();
        const resetEmail = document.getElementById('resetEmail').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (!resetEmail) {
            this.showError('Please enter your email address');
            return;
        }
        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="btn-loading show">Sending...</span>';
            await firebase.auth().sendPasswordResetEmail(resetEmail);
            this.showSuccess('Password reset email sent! Check your inbox.');
            // Optionally, switch back to login form
            setTimeout(() => {
                document.getElementById('resetForm').style.display = 'none';
                document.getElementById('loginForm').style.display = 'block';
            }, 1500);
        } catch (error) {
            console.error('Password reset error:', error);
            this.showError('Failed to send reset email. Please check your email address.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Send Reset Link';
        }
    }

    async signOut() {
        try {
            await firebase.auth().signOut();
            console.log('Sign out successful');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Sign out error:', error);
            this.showError('Error signing out');
        }
    }

    scrollToFeatures() {
        const featuresSection = document.querySelector('.features-section');
        if (featuresSection) {
            featuresSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    initializeAnimations() {
        // Add scroll-triggered animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        const animatedElements = document.querySelectorAll('.feature-card, .sample-post-card');
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/user-not-found': 'No account found with this email address',
            'auth/wrong-password': 'Incorrect password',
            'auth/email-already-in-use': 'An account with this email already exists',
            'auth/weak-password': 'Password is too weak',
            'auth/invalid-email': 'Invalid email address',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later',
            'auth/network-request-failed': 'Network error. Please check your connection'
        };
        
        return errorMessages[errorCode] || 'An error occurred. Please try again.';
    }

    showError(message) {
        // Create and show error notification
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">⚠️</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        this.showNotification(notification);
    }

    showSuccess(message) {
        // Create and show success notification
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">✅</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        this.showNotification(notification);
    }

    showNotification(notification) {
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
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
        
        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.remove();
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

// Initialize landing page
const landingPage = new LandingPage(); 