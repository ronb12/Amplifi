/**
 * Authentication Guard System
 * Protects pages that require login
 */

class AuthGuard {
    constructor() {
        this.isAuthenticated = false;
        this.protectedPages = [
            'feed.html',
            'moments.html', 
            'trending.html',
            'live.html',
            'search.html',
            'upload.html',
            'profile.html',
            'library.html'
        ];
        this.publicPages = [
            'index.html',
            '/'
        ];
        
        this.init();
    }

    init() {
        console.log('🔐 Initializing authentication guard...');
        
        // Check if user is authenticated
        this.checkAuthStatus();
        
        // Protect current page if needed
        this.protectCurrentPage();
        
        // Set up authentication listeners
        this.setupAuthListeners();
        
        console.log('✅ Authentication guard initialized');
    }

    checkAuthStatus() {
        console.log('🔐 Checking authentication status...');
        
        // Check Firebase auth first if available
        if (typeof auth !== 'undefined' && auth.currentUser) {
            console.log('🔐 Firebase auth: User is authenticated');
            this.isAuthenticated = true;
            this.updateAuthUI(true);
            return;
        }

        // Check localStorage for persistent auth data
        const authData = localStorage.getItem('amplifi_auth');
        if (authData) {
            try {
                const parsed = JSON.parse(authData);
                this.isAuthenticated = parsed.isAuthenticated || false;
                
                // Check if auth data is still valid (not expired)
                if (this.isAuthenticated && parsed.timestamp) {
                    const authAge = Date.now() - parsed.timestamp;
                    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
                    
                    if (authAge > maxAge) {
                        console.log('🔐 Auth data expired, clearing...');
                        localStorage.removeItem('amplifi_auth');
                        this.isAuthenticated = false;
                    } else {
                        console.log('🔐 Valid auth session found, user is authenticated');
                        this.updateAuthUI(true);
                        return;
                    }
                }
            } catch (error) {
                console.error('❌ Error parsing auth data:', error);
                this.isAuthenticated = false;
            }
        } else {
            console.log('🔐 No auth data found');
            this.isAuthenticated = false;
        }
    }

    protectCurrentPage() {
        const currentPage = this.getCurrentPageName();
        
        // Only redirect if this is a protected page AND user is not authenticated
        if (this.isProtectedPage(currentPage) && !this.isAuthenticated) {
            console.log('🚫 Access denied to protected page:', currentPage);
            console.log('🔄 Redirecting to login page...');
            this.redirectToLogin();
        } else if (this.isProtectedPage(currentPage) && this.isAuthenticated) {
            console.log('✅ Access granted to protected page:', currentPage);
        }
    }

    getCurrentPageName() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        return page;
    }

    isProtectedPage(pageName) {
        return this.protectedPages.includes(pageName);
    }

    redirectToLogin() {
        console.log('🔄 Redirecting to login page...');
        
        // Get current page for redirect after login
        const currentPage = this.getCurrentPageName();
        const redirectUrl = currentPage !== 'index.html' ? `?redirect=${currentPage}` : '';
        
        // Redirect to login page
        window.location.href = `login.html${redirectUrl}`;
    }

    showLoginRequiredModal() {
        // Create login required modal
        const modal = document.createElement('div');
        modal.id = 'loginRequiredModal';
        modal.className = 'auth-modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="auth-modal-content">
                <div class="auth-modal-header">
                    <h2>🔐 Login Required</h2>
                    <button class="auth-close" onclick="this.closest('.auth-modal').remove()">&times;</button>
                </div>
                <div class="login-required-content">
                    <div class="login-required-icon">
                        <i class="fas fa-lock"></i>
                    </div>
                    <h3>Please sign in to continue</h3>
                    <p>You need to be logged in to access this page.</p>
                    <div class="login-required-actions">
                        <button class="btn-primary" onclick="authGuard.openLoginModal()">
                            <i class="fas fa-sign-in-alt"></i> Sign In
                        </button>
                        <button class="btn-secondary" onclick="authGuard.goToHome()">
                            <i class="fas fa-home"></i> Go to Home
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .login-required-content {
                text-align: center;
                padding: 20px;
            }
            .login-required-icon {
                font-size: 48px;
                color: #ff0000;
                margin-bottom: 16px;
            }
            .login-required-content h3 {
                margin: 0 0 8px 0;
                font-size: 20px;
                color: #030303;
            }
            .login-required-content p {
                margin: 0 0 24px 0;
                color: #606060;
                font-size: 14px;
            }
            .login-required-actions {
                display: flex;
                gap: 12px;
                justify-content: center;
            }
            .btn-primary, .btn-secondary {
                padding: 12px 20px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .btn-primary {
                background: #ff0000;
                color: white;
            }
            .btn-primary:hover {
                background: #cc0000;
            }
            .btn-secondary {
                background: white;
                color: #606060;
                border: 1px solid #e5e5e5;
            }
            .btn-secondary:hover {
                background: #f8f9fa;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
    }

    openLoginModal() {
        // Remove login required modal
        const loginRequiredModal = document.getElementById('loginRequiredModal');
        if (loginRequiredModal) {
            loginRequiredModal.remove();
        }
        
        // Open regular auth modal
        if (window.openAuthModal) {
            window.openAuthModal('login');
        } else {
            // Fallback: redirect to home page
            this.goToHome();
        }
    }

    goToHome() {
        window.location.href = 'index.html';
    }

    setupAuthListeners() {
        // Listen for authentication events
        window.addEventListener('auth-success', (event) => {
            this.handleAuthSuccess(event.detail);
        });
        
        window.addEventListener('auth-logout', () => {
            this.handleLogout();
        });

        // Also listen for Firebase auth state changes if available
        if (typeof auth !== 'undefined') {
            auth.onAuthStateChanged((user) => {
                if (user) {
                    console.log('🔐 Firebase auth: User signed in');
                    this.isAuthenticated = true;
                    
                    // Update localStorage with fresh auth data
                    localStorage.setItem('amplifi_auth', JSON.stringify({
                        isAuthenticated: true,
                        user: {
                            email: user.email,
                            name: user.displayName || 'User'
                        },
                        timestamp: Date.now()
                    }));
                    
                    this.updateAuthUI(true);
                } else {
                    console.log('🔐 Firebase auth: User signed out');
                    this.isAuthenticated = false;
                    
                    // Clear localStorage
                    localStorage.removeItem('amplifi_auth');
                    
                    this.updateAuthUI(false);
                }
            });
        }
    }

    handleAuthSuccess(authData) {
        console.log('✅ Authentication successful');
        this.isAuthenticated = true;
        
        // Store auth data
        localStorage.setItem('amplifi_auth', JSON.stringify({
            isAuthenticated: true,
            user: authData.user,
            timestamp: Date.now()
        }));
        
        // Remove login required modal if present
        const loginRequiredModal = document.getElementById('loginRequiredModal');
        if (loginRequiredModal) {
            loginRequiredModal.remove();
        }
        
        // Remove auth modal if present
        const authModal = document.getElementById('authModal');
        if (authModal) {
            authModal.style.display = 'none';
        }
        
        // Update UI
        this.updateAuthUI(true);
        
        console.log('🔐 User is now authenticated and can access protected pages');
    }

    handleLogout() {
        console.log('🔐 User logged out');
        this.isAuthenticated = false;
        
        // Clear auth data
        localStorage.removeItem('amplifi_auth');
        
        // Update UI
        this.updateAuthUI(false);
        
        // Redirect to home if on protected page
        if (this.isProtectedPage(this.getCurrentPageName())) {
            this.goToHome();
        }
    }

    updateAuthUI(isAuthenticated) {
        // Update multiple possible button selectors
        const signInBtn = document.querySelector('.sign-in-btn') || document.getElementById('loginBtn');
        const signUpBtn = document.querySelector('.sign-up-btn') || document.getElementById('signupBtn');
        
        if (isAuthenticated) {
            if (signInBtn) {
                signInBtn.innerHTML = '<i class="fas fa-user"></i> Profile';
                signInBtn.onclick = () => window.location.href = 'profile.html';
            }
            if (signUpBtn) {
                signUpBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sign Out';
                signUpBtn.onclick = () => this.logout();
            }
        } else {
            if (signInBtn) {
                signInBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
                signInBtn.onclick = () => window.location.href = 'login.html';
            }
            if (signUpBtn) {
                signUpBtn.innerHTML = '<i class="fas fa-user-plus"></i> Sign Up';
                signUpBtn.onclick = () => window.location.href = 'login.html';
            }
        }
    }

    logout() {
        console.log('🔐 Logging out user...');
        
        // Clear localStorage
        localStorage.removeItem('amplifi_auth');
        
        // Sign out from Firebase if available
        if (typeof auth !== 'undefined') {
            auth.signOut().then(() => {
                console.log('✅ Signed out from Firebase');
            }).catch((error) => {
                console.error('❌ Sign out error:', error);
            });
        }
        
        // Update authentication status
        this.isAuthenticated = false;
        
        // Dispatch logout event
        window.dispatchEvent(new CustomEvent('auth-logout'));
        
        // Redirect to home page
        window.location.href = 'index.html';
    }

    // Public method to check if user is authenticated
    isUserAuthenticated() {
        return this.isAuthenticated;
    }

    // Public method to require authentication for specific actions
    requireAuth(callback) {
        if (this.isAuthenticated) {
            callback();
        } else {
            this.showLoginRequiredModal();
        }
    }

    // Public method to manually set authentication status (for testing)
    setAuthenticated(isAuth, userData = null) {
        this.isAuthenticated = isAuth;
        
        if (isAuth) {
            localStorage.setItem('amplifi_auth', JSON.stringify({
                isAuthenticated: true,
                user: userData || { email: 'test@example.com', name: 'Test User' },
                timestamp: Date.now()
            }));
            this.updateAuthUI(true);
            console.log('✅ Authentication status set to: Authenticated');
        } else {
            localStorage.removeItem('amplifi_auth');
            this.updateAuthUI(false);
            console.log('✅ Authentication status set to: Not authenticated');
        }
    }
}

// Global instance
let authGuard;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    authGuard = new AuthGuard();
});

// Export for use in other scripts
window.AuthGuard = AuthGuard;
window.authGuard = authGuard;
