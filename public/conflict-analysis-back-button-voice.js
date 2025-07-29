// Conflict Analysis: Back Button and Voice Features
console.log('🔍 ANALYZING CONFLICTS: Back Button and Voice Features');

function analyzeConflicts() {
    console.log('🧪 Starting conflict analysis...');
    
    // Check 1: Back Button Conflicts
    console.log('\n📱 CHECK 1: Back Button Conflicts');
    
    const mobileBackBtn = document.getElementById('mobileBackBtn');
    const backBtnByClass = document.querySelector('.mobile-back-btn');
    
    console.log('📊 Back button elements:');
    console.log('  - By ID (mobileBackBtn):', mobileBackBtn);
    console.log('  - By class (.mobile-back-btn):', backBtnByClass);
    console.log('  - Same element:', mobileBackBtn === backBtnByClass);
    
    if (mobileBackBtn) {
        console.log('📊 Back button properties:');
        console.log('  - onclick attribute:', mobileBackBtn.getAttribute('onclick'));
        console.log('  - Event listeners:', mobileBackBtn.onclick);
        console.log('  - Display:', mobileBackBtn.style.display);
        console.log('  - Z-index:', mobileBackBtn.style.zIndex);
        console.log('  - Position:', mobileBackBtn.style.position);
        
        // Check for conflicting event listeners
        const hasOnclick = mobileBackBtn.hasAttribute('onclick');
        const hasEventListener = mobileBackBtn.onclick !== null;
        
        console.log('📊 Event listener conflicts:');
        console.log('  - Has onclick attribute:', hasOnclick);
        console.log('  - Has onclick handler:', hasEventListener);
        
        if (hasOnclick && hasEventListener) {
            console.log('⚠️ POTENTIAL CONFLICT: Both onclick attribute and event listener present');
        } else {
            console.log('✅ No onclick conflicts detected');
        }
    }
    
    // Check 2: Voice Feature Conflicts
    console.log('\n🎤 CHECK 2: Voice Feature Conflicts');
    
    const voiceBtn = document.querySelector('.voice-btn');
    const voiceCallBtn = document.querySelector('.action-btn[onclick*="startVoiceCall"]');
    const videoCallBtn = document.querySelector('.action-btn[onclick*="startVideoCall"]');
    
    console.log('📊 Voice-related elements:');
    console.log('  - Voice recording button:', voiceBtn);
    console.log('  - Voice call button:', voiceCallBtn);
    console.log('  - Video call button:', videoCallBtn);
    
    if (voiceBtn) {
        console.log('📊 Voice recording button properties:');
        console.log('  - onclick attribute:', voiceBtn.getAttribute('onclick'));
        console.log('  - Recording class:', voiceBtn.classList.contains('recording'));
        console.log('  - Display:', voiceBtn.style.display);
        console.log('  - Z-index:', voiceBtn.style.zIndex);
    }
    
    // Check 3: Media Device Conflicts
    console.log('\n🎵 CHECK 3: Media Device Conflicts');
    
    const hasMediaDevices = !!navigator.mediaDevices;
    const hasGetUserMedia = !!navigator.mediaDevices?.getUserMedia;
    const hasMediaRecorder = typeof MediaRecorder !== 'undefined';
    
    console.log('📊 Media device support:');
    console.log('  - navigator.mediaDevices:', hasMediaDevices);
    console.log('  - getUserMedia support:', hasGetUserMedia);
    console.log('  - MediaRecorder support:', hasMediaRecorder);
    
    // Check 4: Audio Stream Conflicts
    console.log('\n🔊 CHECK 4: Audio Stream Conflicts');
    
    if (window.messagesApp) {
        console.log('📊 MessagesApp audio properties:');
        console.log('  - isRecording:', window.messagesApp.isRecording);
        console.log('  - mediaRecorder:', !!window.messagesApp.mediaRecorder);
        console.log('  - audioChunks:', window.messagesApp.audioChunks?.length || 0);
        
        // Check if there are active audio streams
        if (window.messagesApp.mediaRecorder) {
            console.log('⚠️ POTENTIAL CONFLICT: MediaRecorder instance exists');
        }
    }
    
    // Check 5: Z-index and Positioning Conflicts
    console.log('\n📍 CHECK 5: Z-index and Positioning Conflicts');
    
    const chatArea = document.getElementById('chatArea');
    const conversationsSidebar = document.getElementById('conversationsSidebar');
    
    if (chatArea && conversationsSidebar) {
        console.log('📊 Layout elements:');
        console.log('  - Chat area z-index:', chatArea.style.zIndex);
        console.log('  - Chat area position:', chatArea.style.position);
        console.log('  - Chat area display:', chatArea.style.display);
        console.log('  - Sidebar z-index:', conversationsSidebar.style.zIndex);
        console.log('  - Sidebar position:', conversationsSidebar.style.position);
        console.log('  - Sidebar display:', conversationsSidebar.style.display);
        
        const chatZIndex = parseInt(chatArea.style.zIndex) || 0;
        const sidebarZIndex = parseInt(conversationsSidebar.style.zIndex) || 0;
        
        if (chatZIndex > sidebarZIndex) {
            console.log('⚠️ POTENTIAL CONFLICT: Chat area has higher z-index than sidebar');
        } else {
            console.log('✅ Z-index hierarchy is correct');
        }
    }
    
    // Check 6: Event Handler Conflicts
    console.log('\n🎯 CHECK 6: Event Handler Conflicts');
    
    const allButtons = document.querySelectorAll('button');
    const buttonsWithOnclick = Array.from(allButtons).filter(btn => btn.hasAttribute('onclick'));
    
    console.log('📊 Buttons with onclick attributes:', buttonsWithOnclick.length);
    
    buttonsWithOnclick.forEach((btn, index) => {
        const onclick = btn.getAttribute('onclick');
        const className = btn.className;
        const id = btn.id;
        
        console.log(`  ${index + 1}. ${className} (${id}): ${onclick}`);
        
        // Check for specific conflicts
        if (onclick.includes('showConversationsList') && className.includes('mobile-back')) {
            console.log('⚠️ POTENTIAL CONFLICT: Back button has onclick for showConversationsList');
        }
        
        if (onclick.includes('toggleVoiceRecording') && className.includes('voice')) {
            console.log('⚠️ POTENTIAL CONFLICT: Voice button has onclick for toggleVoiceRecording');
        }
    });
    
    // Check 7: CSS Conflicts
    console.log('\n🎨 CHECK 7: CSS Conflicts');
    
    const mobileBackBtnStyles = window.getComputedStyle(mobileBackBtn);
    const voiceBtnStyles = window.getComputedStyle(voiceBtn);
    
    if (mobileBackBtn) {
        console.log('📊 Mobile back button computed styles:');
        console.log('  - Display:', mobileBackBtnStyles.display);
        console.log('  - Position:', mobileBackBtnStyles.position);
        console.log('  - Z-index:', mobileBackBtnStyles.zIndex);
        console.log('  - Visibility:', mobileBackBtnStyles.visibility);
    }
    
    if (voiceBtn) {
        console.log('📊 Voice button computed styles:');
        console.log('  - Display:', voiceBtnStyles.display);
        console.log('  - Position:', voiceBtnStyles.position);
        console.log('  - Z-index:', voiceBtnStyles.zIndex);
        console.log('  - Visibility:', voiceBtnStyles.visibility);
    }
    
    // Summary
    console.log('\n📋 CONFLICT ANALYSIS SUMMARY:');
    
    const conflicts = [];
    
    // Check for onclick conflicts
    if (mobileBackBtn && mobileBackBtn.hasAttribute('onclick')) {
        conflicts.push('Back button has onclick attribute (should use event listener)');
    }
    
    // Check for voice recording conflicts
    if (window.messagesApp && window.messagesApp.isRecording) {
        conflicts.push('Voice recording is active (may interfere with other audio features)');
    }
    
    // Check for z-index conflicts
    if (chatArea && conversationsSidebar) {
        const chatZ = parseInt(chatArea.style.zIndex) || 0;
        const sidebarZ = parseInt(conversationsSidebar.style.zIndex) || 0;
        if (chatZ > sidebarZ) {
            conflicts.push('Chat area z-index higher than sidebar');
        }
    }
    
    if (conflicts.length === 0) {
        console.log('✅ NO CONFLICTS DETECTED');
        console.log('✅ Back button and voice features should work correctly');
    } else {
        console.log('⚠️ POTENTIAL CONFLICTS FOUND:');
        conflicts.forEach((conflict, index) => {
            console.log(`  ${index + 1}. ${conflict}`);
        });
    }
    
    return conflicts.length === 0;
}

// Auto-run analysis
setTimeout(analyzeConflicts, 2000);

// Export for manual testing
window.analyzeConflicts = analyzeConflicts;

console.log('🔍 Conflict analysis script loaded - run window.analyzeConflicts() to test manually'); 