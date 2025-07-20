// Firebase configuration for Amplifi
// IMPORTANT: Replace these placeholder values with your actual Firebase configuration
// Get your config from: https://console.firebase.google.com/project/YOUR_PROJECT_ID/settings/general
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
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