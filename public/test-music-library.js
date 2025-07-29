// Test script to verify music library functionality
console.log('🎵 TESTING MUSIC LIBRARY FUNCTIONALITY');

// Check if music library page object exists
if (typeof window.musicLibraryPage !== 'undefined') {
    console.log('✅ Music library page object exists');
    console.log('✅ Music library page type:', window.musicLibraryPage.constructor.name);
} else {
    console.log('❌ Music library page object NOT found');
}

// Check if music data is loaded
if (window.musicLibraryPage && window.musicLibraryPage.musicData) {
    console.log('✅ Music data loaded:', window.musicLibraryPage.musicData.length, 'tracks');
} else {
    console.log('❌ Music data NOT loaded');
}

// Check if handleMusicAction function exists
if (typeof window.musicLibraryPage?.handleMusicAction === 'function') {
    console.log('✅ handleMusicAction function exists');
} else {
    console.log('❌ handleMusicAction function NOT found');
}

// Check if navigateToSection function exists
if (typeof window.musicLibraryPage?.navigateToSection === 'function') {
    console.log('✅ navigateToSection function exists');
} else {
    console.log('❌ navigateToSection function NOT found');
}

// Check if showBrowseSection function exists
if (typeof window.musicLibraryPage?.showBrowseSection === 'function') {
    console.log('✅ showBrowseSection function exists');
} else {
    console.log('❌ showBrowseSection function NOT found');
}

// Check if browse music button exists
const browseButton = document.querySelector('button[onclick*="handleMusicAction(\'browse\')"]');
if (browseButton) {
    console.log('✅ Browse music button found');
    console.log('✅ Button text:', browseButton.textContent);
} else {
    console.log('❌ Browse music button NOT found');
}

// Check if main content area exists
const mainContent = document.getElementById('mainContent');
if (mainContent) {
    console.log('✅ Main content area exists');
} else {
    console.log('❌ Main content area NOT found');
}

// Test the browse functionality
console.log('🎯 Testing browse functionality...');
if (window.musicLibraryPage && typeof window.musicLibraryPage.handleMusicAction === 'function') {
    try {
        window.musicLibraryPage.handleMusicAction('browse');
        console.log('✅ Browse action executed successfully');
    } catch (error) {
        console.error('❌ Error executing browse action:', error);
    }
}

console.log('🎵 Music library functionality test complete!'); 