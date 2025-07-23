/* global db, auth, firebase, storage */
// PWA Installation Prompt Manager
class PWAInstallPrompt {
    constructor() {
        this.deferredPrompt = null;
        this.installButton = null;
        this.installBanner = null;
        
        this.init();
    }

    init() {
        // Listen for the beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('PWA install prompt available');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallBanner();
        });

        // Listen for successful installation
        window.addEventListener('appinstalled', (evt) => {
            console.log('PWA installed successfully');
            this.hideInstallBanner();
            this.showInstallSuccess();
        });

        // Check if app is already installed
        if (this.isAppInstalled()) {
            console.log('PWA already installed');
        }
    }

    createInstallBanner() {
        const banner = document.createElement('div');
        banner.id = 'pwa-install-banner';
        banner.innerHTML = `
            <div class="pwa-install-content">
                <div class="pwa-install-icon">
                    <img src="/icons/icon-192x192.png" alt="Amplifi" width="48" height="48">
                </div>
                <div class="pwa-install-text">
                    <h4>Install Amplifi</h4>
                    <p>Get the full app experience with notifications and offline support</p>
                </div>
                <div class="pwa-install-actions">
                    <button id="pwa-install-btn" class="btn btn-primary">Install</button>
                    <button id="pwa-dismiss-btn" class="btn btn-secondary">Not Now</button>
                </div>
            </div>
        `;

        // Add styles
        banner.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: white;
            border-top: 1px solid #e5e7eb;
            padding: 16px;
            box-shadow: 0 -4px 12px rgba(0,0,0,0.1);
            z-index: 10000;
            transform: translateY(100%);
            transition: transform 0.3s ease;
        `;

        // Add content styles
        const content = banner.querySelector('.pwa-install-content');
        content.style.cssText = `
            display: flex;
            align-items: center;
            gap: 16px;
            max-width: 1200px;
            margin: 0 auto;
        `;

        const icon = banner.querySelector('.pwa-install-icon');
        icon.style.cssText = `
            flex-shrink: 0;
        `;

        const text = banner.querySelector('.pwa-install-text');
        text.style.cssText = `
            flex: 1;
        `;

        text.querySelector('h4').style.cssText = `
            margin: 0 0 4px 0;
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
        `;

        text.querySelector('p').style.cssText = `
            margin: 0;
            font-size: 14px;
            color: #6b7280;
        `;

        const actions = banner.querySelector('.pwa-install-actions');
        actions.style.cssText = `
            display: flex;
            gap: 8px;
            flex-shrink: 0;
        `;

        return banner;
    }

    showInstallBanner() {
        if (this.installBanner) return;

        this.installBanner = this.createInstallBanner();
        document.body.appendChild(this.installBanner);

        // Animate in
        setTimeout(() => {
            this.installBanner.style.transform = 'translateY(0)';
        }, 100);

        // Setup event listeners
        this.installButton = this.installBanner.querySelector('#pwa-install-btn');
        const dismissButton = this.installBanner.querySelector('#pwa-dismiss-btn');

        this.installButton.addEventListener('click', () => {
            this.installApp();
        });

        dismissButton.addEventListener('click', () => {
            this.hideInstallBanner();
            this.dismissInstallPrompt();
        });

        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (this.installBanner && this.installBanner.parentElement) {
                this.hideInstallBanner();
            }
        }, 10000);
    }

    hideInstallBanner() {
        if (this.installBanner) {
            this.installBanner.style.transform = 'translateY(100%)';
            setTimeout(() => {
                if (this.installBanner && this.installBanner.parentElement) {
                    this.installBanner.parentElement.removeChild(this.installBanner);
                }
                this.installBanner = null;
            }, 300);
        }
    }

    async installApp() {
        if (!this.deferredPrompt) {
            console.log('No install prompt available');
            return;
        }

        try {
            // Show the install prompt
            this.deferredPrompt.prompt();

            // Wait for the user to respond to the prompt
            const { outcome } = await this.deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
                this.showInstallSuccess();
            } else {
                console.log('User dismissed the install prompt');
                this.dismissInstallPrompt();
            }

            // Clear the deferredPrompt
            this.deferredPrompt = null;

        } catch (error) {
            console.error('Error during app installation:', error);
        }
    }

    dismissInstallPrompt() {
        this.deferredPrompt = null;
        // Store dismissal to avoid showing again immediately
        localStorage.setItem('pwa_install_dismissed', Date.now().toString());
    }

    showInstallSuccess() {
        const successBanner = document.createElement('div');
        successBanner.innerHTML = `
            <div class="pwa-success-content">
                <span class="pwa-success-icon">✅</span>
                <div class="pwa-success-text">
                    <h4>Amplifi Installed!</h4>
                    <p>You can now access Amplifi from your home screen</p>
                </div>
            </div>
        `;

        successBanner.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10001;
            max-width: 300px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        const content = successBanner.querySelector('.pwa-success-content');
        content.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
        `;

        const icon = successBanner.querySelector('.pwa-success-icon');
        icon.style.cssText = `
            font-size: 24px;
            flex-shrink: 0;
        `;

        const text = successBanner.querySelector('.pwa-success-text');
        text.querySelector('h4').style.cssText = `
            margin: 0 0 4px 0;
            font-size: 16px;
            font-weight: 600;
        `;

        text.querySelector('p').style.cssText = `
            margin: 0;
            font-size: 14px;
            opacity: 0.9;
        `;

        document.body.appendChild(successBanner);

        // Animate in
        setTimeout(() => {
            successBanner.style.transform = 'translateX(0)';
        }, 100);

        // Auto-remove
        setTimeout(() => {
            successBanner.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (successBanner.parentElement) {
                    successBanner.parentElement.removeChild(successBanner);
                }
            }, 300);
        }, 5000);
    }

    isAppInstalled() {
        // Check if running in standalone mode (installed PWA)
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true;
    }

    shouldShowInstallPrompt() {
        // Don't show if already installed
        if (this.isAppInstalled()) {
            return false;
        }

        // Don't show if recently dismissed
        const dismissedTime = localStorage.getItem('pwa_install_dismissed');
        if (dismissedTime) {
            const timeSinceDismissed = Date.now() - parseInt(dismissedTime);
            if (timeSinceDismissed < 24 * 60 * 60 * 1000) { // 24 hours
                return false;
            }
        }

        return true;
    }

    // Public API
    showInstallPrompt() {
        if (this.shouldShowInstallPrompt() && this.deferredPrompt) {
            this.showInstallBanner();
        }
    }

    hideInstallPrompt() {
        this.hideInstallBanner();
    }
}

// Initialize PWA Install Prompt
let pwaInstallPrompt = null;

document.addEventListener('DOMContentLoaded', () => {
    pwaInstallPrompt = new PWAInstallPrompt();
    window.pwaInstallPrompt = pwaInstallPrompt; // Make it globally accessible
});

console.log('PWA Install Prompt script loaded'); 