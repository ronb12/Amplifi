/**
 * Firebase Loader - Prevents duplicate Firebase loading
 */

class FirebaseLoader {
    constructor() {
        this.loaded = false;
        this.loading = false;
    }

    /**
     * Load Firebase only once
     */
    async loadFirebase() {
        // Check if already loaded
        if (this.loaded) {
            console.log('⏭️  Firebase already loaded');
            return;
        }

        // Check if currently loading
        if (this.loading) {
            console.log('⏳ Firebase already loading');
            return;
        }

        // Check if Firebase is already available from HTML scripts
        if (typeof firebase !== 'undefined' && firebase.apps) {
            console.log('⏭️ Firebase already available from HTML, skipping load');
            this.loaded = true;
            this.loading = false;
            return;
        }

        this.loading = true;
        console.log('🚀 Loading Firebase...');

        try {
            // Load Firebase SDKs in sequence only if not already loaded
            if (typeof firebase === 'undefined') {
                await this.loadScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
                await this.loadScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js');
                await this.loadScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js');
                await this.loadScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-storage-compat.js');
            }

            // Wait for Firebase to be available
            await this.waitForFirebase();

            // Firebase config is now handled inline to prevent duplicates

            this.loaded = true;
            this.loading = false;
            console.log('✅ Firebase loaded successfully');
        } catch (error) {
            this.loading = false;
            console.error('❌ Error loading Firebase:', error);
        }
    }

    /**
     * Load a script
     */
    async loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                console.log(`✅ Loaded: ${src}`);
                resolve();
            };
            script.onerror = (error) => {
                console.error(`❌ Failed to load: ${src}`, error);
                reject(error);
            };
            document.head.appendChild(script);
        });
    }

    /**
     * Wait for Firebase to be available
     */
    async waitForFirebase() {
        let attempts = 0;
        const maxAttempts = 50;

        while (attempts < maxAttempts) {
            if (typeof firebase !== 'undefined' && firebase.apps) {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        throw new Error('Firebase not available after timeout');
    }

    /**
     * Wait for Firebase services to be available
     */
    async waitForFirebaseServices() {
        let attempts = 0;
        const maxAttempts = 100; // 10 seconds max

        while (attempts < maxAttempts) {
            if (typeof firebase !== 'undefined' && 
                firebase.auth && 
                firebase.firestore && 
                typeof firebase.auth === 'function' && 
                typeof firebase.firestore === 'function') {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        throw new Error('Firebase services not available after timeout');
    }

    /**
     * Check if Firebase is loaded
     */
    isLoaded() {
        return this.loaded;
    }
}

// Create global instance
window.FirebaseLoader = new FirebaseLoader();

// Auto-load Firebase if not already loaded
if (!window.FirebaseLoader.isLoaded()) {
    window.FirebaseLoader.loadFirebase();
} 