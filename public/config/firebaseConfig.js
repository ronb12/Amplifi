// Firebase Configuration for Amplifi
// Project ID: amplifi-a54d9
// Live Site: https://amplifi-a54d9.web.app

const firebaseConfig = {
  apiKey: "AIzaSyANHtCLmNLvp9k_px0lsUHuWK5PasK_gJY",
  authDomain: "amplifi-a54d9.firebaseapp.com",
  projectId: "amplifi-a54d9",
  storageBucket: "amplifi-a54d9.appspot.com",
  messagingSenderId: "542171119183",
  appId: "1:542171119183:web:cd96402d1fe4d3ef6ef43a",
  measurementId: "G-X845LM0VSM"
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
  try {
    // Initialize Firebase app
    const app = firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase app initialized:', app.name);
    
    // Initialize Firebase services
    const auth = firebase.auth(app);
    const db = firebase.firestore(app);
    const storage = firebase.storage(app);
    
    // Make services globally available
    window.auth = auth;
    window.db = db;
    window.storage = storage;
    
    // Set up auth state listener
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('✅ User signed in:', user.email);
        // Update UI if app is available
        if (window.app && window.app.updateUIForSignedInUser) {
          window.app.currentUser = user;
          window.app.updateUIForSignedInUser();
        }
      } else {
        console.log('✅ User signed out');
        // Update UI if app is available
        if (window.app && window.app.updateUIForSignedOutUser) {
          window.app.currentUser = null;
          window.app.updateUIForSignedOutUser();
        }
      }
    });
    
    console.log('✅ Firebase services initialized successfully');
    console.log('✅ Auth domain:', firebaseConfig.authDomain);
    console.log('✅ Project ID:', firebaseConfig.projectId);
    
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error);
  }
} else {
  console.error('❌ Firebase SDK not loaded');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { firebaseConfig };
}
