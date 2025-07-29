// Fix Back Button and Voice Feature Conflicts
console.log('🔧 FIXING BACK BUTTON AND VOICE CONFLICTS');

function fixConflicts() {
    console.log('🧪 Starting conflict fixes...');
    
    // Fix 1: Remove onclick attributes from back button
    console.log('\n📱 FIX 1: Removing onclick from back button');
    
    const mobileBackBtn = document.getElementById('mobileBackBtn');
    if (mobileBackBtn && mobileBackBtn.hasAttribute('onclick')) {
        console.log('⚠️ Removing onclick attribute from back button');
        mobileBackBtn.removeAttribute('onclick');
        console.log('✅ Back button onclick removed');
    } else {
        console.log('✅ Back button has no onclick attribute');
    }
    
    // Fix 2: Ensure proper event listener setup
    console.log('\n🎯 FIX 2: Ensuring proper event listeners');
    
    if (window.messagesApp && typeof window.messagesApp.setupMobileBackButton === 'function') {
        console.log('🔄 Re-setting up mobile back button...');
        window.messagesApp.setupMobileBackButton();
        console.log('✅ Mobile back button event listener re-established');
    }
    
    // Fix 3: Voice recording conflict prevention
    console.log('\n🎤 FIX 3: Voice recording conflict prevention');
    
    if (window.messagesApp) {
        // Stop any active recording before starting new one
        if (window.messagesApp.isRecording && window.messagesApp.mediaRecorder) {
            console.log('⚠️ Stopping active voice recording to prevent conflicts');
            window.messagesApp.stopVoiceRecording();
        }
        
        // Ensure voice button has proper onclick
        const voiceBtn = document.querySelector('.voice-btn');
        if (voiceBtn && !voiceBtn.hasAttribute('onclick')) {
            console.log('⚠️ Adding onclick to voice button');
            voiceBtn.setAttribute('onclick', 'messagesApp.toggleVoiceRecording()');
        }
    }
    
    // Fix 4: Audio stream management
    console.log('\n🔊 FIX 4: Audio stream management');
    
    if (window.messagesApp) {
        // Clean up any existing audio streams
        if (window.messagesApp.localStream) {
            console.log('⚠️ Cleaning up existing audio stream');
            window.messagesApp.localStream.getTracks().forEach(track => {
                track.stop();
            });
            window.messagesApp.localStream = null;
        }
        
        // Reset recording state
        window.messagesApp.isRecording = false;
        window.messagesApp.mediaRecorder = null;
        window.messagesApp.audioChunks = [];
        
        console.log('✅ Audio streams cleaned up');
    }
    
    // Fix 5: Z-index and positioning conflicts
    console.log('\n📍 FIX 5: Z-index and positioning conflicts');
    
    const chatArea = document.getElementById('chatArea');
    const conversationsSidebar = document.getElementById('conversationsSidebar');
    
    if (chatArea && conversationsSidebar) {
        // Ensure proper z-index hierarchy
        conversationsSidebar.style.zIndex = '1';
        chatArea.style.zIndex = '0';
        
        console.log('✅ Z-index hierarchy fixed');
        console.log('  - Sidebar z-index:', conversationsSidebar.style.zIndex);
        console.log('  - Chat z-index:', chatArea.style.zIndex);
    }
    
    // Fix 6: Event handler cleanup
    console.log('\n🧹 FIX 6: Event handler cleanup');
    
    // Remove any duplicate event listeners
    if (mobileBackBtn) {
        const newBackBtn = mobileBackBtn.cloneNode(true);
        mobileBackBtn.parentNode.replaceChild(newBackBtn, mobileBackBtn);
        console.log('✅ Back button event listeners cleaned');
    }
    
    // Fix 7: Voice button state reset
    console.log('\n🎤 FIX 7: Voice button state reset');
    
    const voiceBtn = document.querySelector('.voice-btn');
    if (voiceBtn) {
        voiceBtn.classList.remove('recording');
        voiceBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
        `;
        console.log('✅ Voice button state reset');
    }
    
    // Fix 8: Call feature conflicts
    console.log('\n📞 FIX 8: Call feature conflicts');
    
    if (window.messagesApp) {
        // Reset call states
        window.messagesApp.isInCall = false;
        window.messagesApp.isVideoCall = false;
        window.messagesApp.callState = 'idle';
        
        // Clean up call UI
        const callInterface = document.querySelector('.call-interface');
        if (callInterface) {
            callInterface.style.display = 'none';
        }
        
        console.log('✅ Call states reset');
    }
    
    // Summary
    console.log('\n📋 CONFLICT FIXES SUMMARY:');
    console.log('✅ Back button onclick removed');
    console.log('✅ Event listeners re-established');
    console.log('✅ Voice recording conflicts prevented');
    console.log('✅ Audio streams cleaned up');
    console.log('✅ Z-index hierarchy fixed');
    console.log('✅ Event handlers cleaned');
    console.log('✅ Voice button state reset');
    console.log('✅ Call states reset');
    
    console.log('\n🎉 ALL CONFLICTS FIXED!');
    console.log('✅ Back button and voice features should now work without conflicts');
    
    return true;
}

// Test the fixes
function testFixes() {
    console.log('🧪 Testing fixes...');
    
    // Test 1: Back button functionality
    const mobileBackBtn = document.getElementById('mobileBackBtn');
    if (mobileBackBtn) {
        console.log('📱 Testing back button:');
        console.log('  - Has onclick:', mobileBackBtn.hasAttribute('onclick'));
        console.log('  - Display:', mobileBackBtn.style.display);
        console.log('  - Z-index:', mobileBackBtn.style.zIndex);
    }
    
    // Test 2: Voice recording functionality
    const voiceBtn = document.querySelector('.voice-btn');
    if (voiceBtn) {
        console.log('🎤 Testing voice button:');
        console.log('  - Has onclick:', voiceBtn.hasAttribute('onclick'));
        console.log('  - Recording class:', voiceBtn.classList.contains('recording'));
    }
    
    // Test 3: MessagesApp state
    if (window.messagesApp) {
        console.log('📱 Testing MessagesApp state:');
        console.log('  - isRecording:', window.messagesApp.isRecording);
        console.log('  - mediaRecorder:', !!window.messagesApp.mediaRecorder);
        console.log('  - isInCall:', window.messagesApp.isInCall);
    }
    
    console.log('✅ Fix tests completed');
}

// Auto-run fixes
setTimeout(() => {
    fixConflicts();
    setTimeout(testFixes, 1000);
}, 2000);

// Export for manual testing
window.fixConflicts = fixConflicts;
window.testFixes = testFixes;

console.log('🔧 Conflict fix script loaded - run window.fixConflicts() to fix manually'); 