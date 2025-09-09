/**
 * Environment Configuration Example
 * Copy this file to environment.js and fill in your actual values
 * NEVER commit environment.js to version control!
 */

// Environment Configuration
const config = {
    // Stripe Configuration
    stripe: {
        publishableKey: 'pk_live_your_publishable_key_here',
        secretKey: 'sk_live_your_secret_key_here', // ⚠️ KEEP THIS SECRET!
        webhookSecret: 'whsec_your_webhook_secret_here'
    },
    
    // Firebase Configuration
    firebase: {
        apiKey: 'your_firebase_api_key',
        authDomain: 'your_project.firebaseapp.com',
        projectId: 'your_project_id',
        storageBucket: 'your_project.appspot.com',
        messagingSenderId: '123456789',
        appId: '1:123456789:web:abcdef'
    },
    
    // Database Configuration
    database: {
        url: 'your_database_url',
        redisUrl: 'your_redis_url'
    },
    
    // Security
    security: {
        jwtSecret: 'your_jwt_secret_key',
        encryptionKey: 'your_encryption_key'
    },
    
    // API Configuration
    api: {
        baseUrl: 'https://your-api-domain.com',
        port: 3000,
        environment: 'production'
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
} else {
    window.ENV_CONFIG = config;
}
