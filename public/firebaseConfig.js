// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyANHtCLmNLvp9k_px0lsUHuWK5PasK_gJY",
    authDomain: "amplifi-a54d9.firebaseapp.com",
    projectId: "amplifi-a54d9",
    storageBucket: "amplifi-a54d9.firebasestorage.app",
    messagingSenderId: "542171119183",
    appId: "1:542171119183:web:cd96402d1fe4d3ef6ef43a",
    measurementId: "G-X845LM0VSM"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Initialize storage only if the storage SDK is available
let storage = null;
try {
    if (firebase.storage) {
        storage = firebase.storage();
    }
} catch (error) {
    console.warn('Firebase Storage not available:', error);
}

// Configure Firestore settings (only set once)
if (!db._settingsConfigured) {
    db.settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
        ignoreUndefinedProperties: true
    }, { merge: true });
    db._settingsConfigured = true;
    console.log('Firestore settings configured with merge option');
}

// Enable offline persistence with multi-tab support
db.enablePersistence({
    synchronizeTabs: true
}).catch((err) => {
    // Silently handle persistence errors - they're not critical
    if (err.code !== 'failed-precondition' && err.code !== 'unimplemented') {
        console.warn('Firestore persistence error:', err);
    }
});

// Export for use in other files
window.auth = auth;
window.db = db;
window.storage = storage;
