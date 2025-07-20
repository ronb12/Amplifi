// Firebase configuration for Amplifi
// IMPORTANT: This file contains the Firebase configuration for the Amplifi app
// The API key is a public client-side key and is safe to expose in web applications

// Get configuration from environment or use default
const getFirebaseConfig = () => {
  // Check if we're in a development environment
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    return {
      apiKey: process.env.FIREBASE_API_KEY || "AIzaSyANHtCLmNLvp9k_px0lsUHuWK5PasK_gJY",
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || "amplifi-a54d9.firebaseapp.com",
      projectId: process.env.FIREBASE_PROJECT_ID || "amplifi-a54d9",
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "amplifi-a54d9.firebasestorage.app",
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "542171119183",
      appId: process.env.FIREBASE_APP_ID || "1:542171119183:web:cd96402d1fe4d3ef6ef43a",
      measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-X845LM0VSM"
    };
  }
  
  // Production configuration
  return {
    apiKey: "AIzaSyANHtCLmNLvp9k_px0lsUHuWK5PasK_gJY",
    authDomain: "amplifi-a54d9.firebaseapp.com",
    projectId: "amplifi-a54d9",
    storageBucket: "amplifi-a54d9.firebasestorage.app",
    messagingSenderId: "542171119183",
    appId: "1:542171119183:web:cd96402d1fe4d3ef6ef43a",
    measurementId: "G-X845LM0VSM"
  };
};

const firebaseConfig = getFirebaseConfig();

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Stripe configuration (test mode)
// Get your publishable key from: https://dashboard.stripe.com/apikeys
const stripe = Stripe('YOUR_STRIPE_PUBLISHABLE_KEY'); 