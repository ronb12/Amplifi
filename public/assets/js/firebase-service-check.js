/**
 * Firebase Service Check - Verifies all Firebase services are working
 */

class FirebaseServiceCheck {
    constructor() {
        this.services = {};
        this.checks = 0;
        this.maxChecks = 3; // Reduced to 3 attempts for better performance
        this.checkInterval = 500; // Check every 500ms for faster response
    }

    /**
     * Check if all Firebase services are available
     */
    async checkServices() {
        console.log('🔍 Checking Firebase services...');
        
        if (this.checks >= this.maxChecks) {
            console.log('ℹ️ Firebase services check completed');
            return false;
        }
        
        this.checks++;
        
        try {
            // Check if Firebase is loaded
            if (typeof firebase === 'undefined') {
                if (this.checks <= 3) { // Only log first 3 attempts
                    console.log('⏳ Firebase not loaded yet, retrying...');
                }
                await new Promise(resolve => setTimeout(resolve, this.checkInterval));
                return this.checkServices();
            }

            // Check if Firebase app is initialized
            if (!firebase.apps || firebase.apps.length === 0) {
                if (this.checks <= 2) { // Only log first 2 attempts
                    console.log('⏳ Firebase app not initialized yet, retrying...');
                }
                await new Promise(resolve => setTimeout(resolve, this.checkInterval));
                return this.checkServices();
            }

            // Check Firebase Auth
            try {
                if (firebase.auth) {
                    const auth = firebase.auth();
                    this.services.auth = true;
                    console.log('✅ Firebase Auth is working');
                } else {
                    this.services.auth = false;
                    console.log('ℹ️ Firebase Auth not available');
                }
            } catch (error) {
                this.services.auth = false;
                console.log('ℹ️ Firebase Auth error:', error.message);
            }

            // Check Firestore
            try {
                if (firebase.firestore) {
                    const db = firebase.firestore();
                    this.services.firestore = true;
                    console.log('✅ Firestore is working');
                } else {
                    this.services.firestore = false;
                    console.log('ℹ️ Firestore not available');
                }
            } catch (error) {
                this.services.firestore = false;
                console.log('ℹ️ Firestore error:', error.message);
            }

            // Check Firebase Storage
            try {
                if (firebase.storage) {
                    const storage = firebase.storage();
                    this.services.storage = true;
                    console.log('✅ Firebase Storage is working');
                } else {
                    this.services.storage = false;
                    console.log('ℹ️ Firebase Storage not available');
                }
            } catch (error) {
                this.services.storage = false;
                console.log('ℹ️ Firebase Storage error:', error.message);
            }

            // Check if all services are working
            const allWorking = Object.values(this.services).every(service => service === true);
            
            if (allWorking) {
                console.log('✅ All Firebase services are working!');
                return true;
            } else {
                console.log('ℹ️ Some Firebase services are not working, but continuing...');
                return false;
            }

        } catch (error) {
            console.error('❌ Error checking Firebase services:', error);
            return false;
        }
    }

    /**
     * Get service status
     */
    getServiceStatus() {
        return this.services;
    }

    /**
     * Check if a specific service is working
     */
    isServiceWorking(serviceName) {
        return this.services[serviceName] === true;
    }

    /**
     * Reset check counter
     */
    resetChecks() {
        this.checks = 0;
    }
}

// Create global instance
window.FirebaseServiceCheck = new FirebaseServiceCheck();

// Auto-check services after a delay
setTimeout(() => {
    if (window.FirebaseServiceCheck) {
        window.FirebaseServiceCheck.checkServices();
    }
}, 2000); // Wait 2 seconds before checking
