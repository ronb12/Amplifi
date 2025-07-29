// Test script to verify tip functionality
console.log('🧪 TESTING TIP FUNCTIONALITY');

// Check if payment processor is available
if (typeof window.paymentProcessor !== 'undefined') {
    console.log('✅ Payment processor is available');
    console.log('✅ Payment processor type:', window.paymentProcessor.constructor.name);
} else {
    console.log('❌ Payment processor is NOT available');
}

// Check if Stripe is loaded
if (typeof Stripe !== 'undefined') {
    console.log('✅ Stripe is loaded');
} else {
    console.log('❌ Stripe is NOT loaded');
}

// Check if tip modal exists
const tipModal = document.getElementById('tipModal');
if (tipModal) {
    console.log('✅ Tip modal exists in DOM');
} else {
    console.log('❌ Tip modal NOT found in DOM');
}

// Check if tip form exists
const tipForm = document.getElementById('tipForm');
if (tipForm) {
    console.log('✅ Tip form exists in DOM');
} else {
    console.log('❌ Tip form NOT found in DOM');
}

// Test tip amount buttons
const tipAmounts = document.querySelectorAll('.tip-amount');
console.log(`✅ Found ${tipAmounts.length} tip amount buttons`);

// Test custom amount input
const customAmount = document.getElementById('customTipAmount');
if (customAmount) {
    console.log('✅ Custom tip amount input exists');
} else {
    console.log('❌ Custom tip amount input NOT found');
}

// Check if showTipModal function exists
if (typeof window.app?.showTipModal === 'function') {
    console.log('✅ showTipModal function exists in app');
} else if (typeof window.feedPage?.showTipModal === 'function') {
    console.log('✅ showTipModal function exists in feedPage');
} else if (typeof window.trendingPage?.showTipModal === 'function') {
    console.log('✅ showTipModal function exists in trendingPage');
} else if (typeof window.subscriptionsPage?.showTipModal === 'function') {
    console.log('✅ showTipModal function exists in subscriptionsPage');
} else if (typeof window.bookmarksPage?.showTipModal === 'function') {
    console.log('✅ showTipModal function exists in bookmarksPage');
} else {
    console.log('❌ showTipModal function NOT found in any page object');
}

console.log('🎯 Tip functionality test complete!'); 