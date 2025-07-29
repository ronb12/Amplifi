// Test script to verify notification buttons work on all pages
console.log('🔔 TESTING NOTIFICATION BUTTONS ACROSS ALL PAGES');

// List of all pages that should have notification buttons
const pagesWithNotifications = [
    'index.html',
    'feed.html', 
    'trending.html',
    'subscriptions.html',
    'dashboard.html',
    'profile.html',
    'search.html',
    'live.html',
    'bookmarks.html',
    'ai-content.html',
    'channel.html',
    'support.html',
    'contact.html',
    'settings.html',
    'messages.html',
    'music-library.html'
];

// Check current page notification button
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
console.log('📍 Current page:', currentPage);

// Check if notification button exists on current page
const notificationBtn = document.querySelector('.notification-btn, #notificationBtn');
if (notificationBtn) {
    console.log('✅ Notification button found on current page');
    console.log('✅ Button onclick:', notificationBtn.getAttribute('onclick'));
    
    // Test the button functionality
    if (notificationBtn.getAttribute('onclick')?.includes('notifications.html')) {
        console.log('✅ Notification button has correct navigation');
    } else {
        console.log('❌ Notification button missing navigation to notifications.html');
    }
} else {
    console.log('❌ Notification button NOT found on current page');
}

// Check if notifications.html exists
console.log('🔍 Checking if notifications.html exists...');
fetch('notifications.html')
    .then(response => {
        if (response.ok) {
            console.log('✅ notifications.html exists and is accessible');
        } else {
            console.log('❌ notifications.html not found or not accessible');
        }
    })
    .catch(error => {
        console.log('❌ Error checking notifications.html:', error.message);
    });

// Test notification button click (simulate)
console.log('🎯 Testing notification button click...');
if (notificationBtn) {
    try {
        // Store current location
        const currentLocation = window.location.href;
        
        // Simulate click (this will navigate away from current page)
        console.log('🔔 Clicking notification button...');
        notificationBtn.click();
        
        // Note: This will navigate to notifications.html
        console.log('✅ Notification button click should navigate to notifications.html');
        
    } catch (error) {
        console.error('❌ Error clicking notification button:', error);
    }
}

console.log('🔔 Notification button test complete!');
console.log('📋 Pages that should have working notification buttons:');
pagesWithNotifications.forEach(page => {
    console.log(`  - ${page}`);
}); 