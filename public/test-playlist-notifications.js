// Test script to verify playlist creation and notification button functionality
console.log('🎵 TESTING PLAYLIST & NOTIFICATION FUNCTIONALITY');

// Check if createNewPlaylist function exists
if (typeof window.musicLibraryPage?.createNewPlaylist === 'function') {
    console.log('✅ createNewPlaylist function exists');
} else {
    console.log('❌ createNewPlaylist function NOT found');
}

// Check if handleCreatePlaylist function exists
if (typeof window.musicLibraryPage?.handleCreatePlaylist === 'function') {
    console.log('✅ handleCreatePlaylist function exists');
} else {
    console.log('❌ handleCreatePlaylist function NOT found');
}

// Check if closePlaylistModal function exists
if (typeof window.musicLibraryPage?.closePlaylistModal === 'function') {
    console.log('✅ closePlaylistModal function exists');
} else {
    console.log('❌ closePlaylistModal function NOT found');
}

// Check if notification button exists
const notificationBtn = document.querySelector('.notification-btn');
if (notificationBtn) {
    console.log('✅ Notification button found');
    console.log('✅ Button text:', notificationBtn.textContent);
} else {
    console.log('❌ Notification button NOT found');
}

// Check if create playlist button exists
const createPlaylistBtn = document.querySelector('button[onclick*="createNewPlaylist"]');
if (createPlaylistBtn) {
    console.log('✅ Create playlist button found');
    console.log('✅ Button text:', createPlaylistBtn.textContent);
} else {
    console.log('❌ Create playlist button NOT found');
}

// Test the create playlist functionality
console.log('🎯 Testing create playlist functionality...');
if (window.musicLibraryPage && typeof window.musicLibraryPage.createNewPlaylist === 'function') {
    try {
        window.musicLibraryPage.createNewPlaylist();
        console.log('✅ Create playlist modal should be displayed');
    } catch (error) {
        console.error('❌ Error creating playlist modal:', error);
    }
}

// Test the notification button functionality
console.log('🎯 Testing notification button functionality...');
if (notificationBtn) {
    try {
        // Simulate click
        notificationBtn.click();
        console.log('✅ Notification button click should navigate to notifications.html');
    } catch (error) {
        console.error('❌ Error clicking notification button:', error);
    }
}

console.log('🎵 Playlist & notification functionality test complete!'); 