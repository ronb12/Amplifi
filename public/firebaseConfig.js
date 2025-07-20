// Firebase configuration for Amplifi
// IMPORTANT: Replace these placeholder values with your actual Firebase configuration
// Get your config from: https://console.firebase.google.com/project/YOUR_PROJECT_ID/settings/general
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
const storage = firebase.storage();

// Stripe configuration (test mode)
// Get your publishable key from: https://dashboard.stripe.com/apikeys
const stripe = Stripe('YOUR_STRIPE_PUBLISHABLE_KEY'); 