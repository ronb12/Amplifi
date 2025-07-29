// Test Call Functionality
console.log('🔍 TESTING CALL FUNCTIONALITY...');

// Test 1: Check if MessagesApp is loaded
function testMessagesApp() {
    console.log('\n📋 1. TESTING MESSAGES APP LOADING...');
    
    if (typeof window.messagesApp !== 'undefined') {
        console.log('✅ MessagesApp is loaded');
        console.log('📊 Current user:', window.messagesApp.currentUser);
        console.log('📊 Current conversation:', window.messagesApp.currentConversation);
        return true;
    } else {
        console.error('❌ MessagesApp not found');
        return false;
    }
}

// Test 2: Check call methods exist
function testCallMethods() {
    console.log('\n📞 2. TESTING CALL METHODS...');
    
    const methods = ['startVoiceCall', 'startVideoCall', 'initializeCall', 'showCallInterface'];
    let allMethodsExist = true;
    
    methods.forEach(method => {
        if (typeof window.messagesApp[method] === 'function') {
            console.log(`✅ ${method} method exists`);
        } else {
            console.error(`❌ ${method} method missing`);
            allMethodsExist = false;
        }
    });
    
    return allMethodsExist;
}

// Test 3: Check WebRTC support
function testWebRTCSupport() {
    console.log('\n🌐 3. TESTING WEBRTC SUPPORT...');
    
    const webRTCFeatures = {
        'getUserMedia': !!navigator.mediaDevices?.getUserMedia,
        'RTCPeerConnection': !!window.RTCPeerConnection,
        'MediaDevices': !!navigator.mediaDevices
    };
    
    let allSupported = true;
    
    Object.entries(webRTCFeatures).forEach(([feature, supported]) => {
        if (supported) {
            console.log(`✅ ${feature} supported`);
        } else {
            console.error(`❌ ${feature} not supported`);
            allSupported = false;
        }
    });
    
    return allSupported;
}

// Test 4: Check call buttons exist
function testCallButtons() {
    console.log('\n🔘 4. TESTING CALL BUTTONS...');
    
    const voiceCallBtn = document.querySelector('button[onclick*="startVoiceCall"]');
    const videoCallBtn = document.querySelector('button[onclick*="startVideoCall"]');
    
    if (voiceCallBtn) {
        console.log('✅ Voice call button found');
        console.log('📊 Button text:', voiceCallBtn.textContent);
        console.log('📊 Button onclick:', voiceCallBtn.getAttribute('onclick'));
    } else {
        console.error('❌ Voice call button not found');
    }
    
    if (videoCallBtn) {
        console.log('✅ Video call button found');
        console.log('📊 Button text:', videoCallBtn.textContent);
        console.log('📊 Button onclick:', videoCallBtn.getAttribute('onclick'));
    } else {
        console.error('❌ Video call button not found');
    }
    
    return !!(voiceCallBtn && videoCallBtn);
}

// Test 5: Check conversation selection
function testConversationSelection() {
    console.log('\n💬 5. TESTING CONVERSATION SELECTION...');
    
    const conversations = document.querySelectorAll('.conversation-item');
    console.log(`📊 Found ${conversations.length} conversations`);
    
    if (conversations.length > 0) {
        console.log('✅ Conversations exist');
        
        // Try to select the first conversation
        const firstConversation = conversations[0];
        const conversationId = firstConversation.getAttribute('data-conversation-id');
        
        if (conversationId) {
            console.log('📊 First conversation ID:', conversationId);
            console.log('💡 Click on a conversation to test call functionality');
        }
    } else {
        console.warn('⚠️ No conversations found');
    }
    
    return conversations.length > 0;
}

// Test 6: Simulate call button click
function testCallButtonClick() {
    console.log('\n🖱️ 6. TESTING CALL BUTTON CLICKS...');
    
    const voiceCallBtn = document.querySelector('button[onclick*="startVoiceCall"]');
    const videoCallBtn = document.querySelector('button[onclick*="startVideoCall"]');
    
    if (voiceCallBtn) {
        console.log('🖱️ Clicking voice call button...');
        voiceCallBtn.click();
    }
    
    if (videoCallBtn) {
        console.log('🖱️ Clicking video call button...');
        videoCallBtn.click();
    }
}

// Test 7: Check call interface CSS
function testCallInterfaceCSS() {
    console.log('\n🎨 7. TESTING CALL INTERFACE CSS...');
    
    const styles = document.styleSheets;
    let callInterfaceRules = 0;
    
    for (let sheet of styles) {
        try {
            const rules = sheet.cssRules || sheet.rules;
            for (let rule of rules) {
                if (rule.selectorText && rule.selectorText.includes('.call-interface')) {
                    callInterfaceRules++;
                }
            }
        } catch (e) {
            // Cross-origin stylesheets will throw errors
        }
    }
    
    console.log(`📊 Found ${callInterfaceRules} call interface CSS rules`);
    
    if (callInterfaceRules > 0) {
        console.log('✅ Call interface CSS exists');
        return true;
    } else {
        console.error('❌ Call interface CSS missing');
        return false;
    }
}

// Run all tests
function runAllTests() {
    console.log('🚀 STARTING COMPREHENSIVE CALL FUNCTIONALITY TESTS...');
    
    const tests = [
        testMessagesApp,
        testCallMethods,
        testWebRTCSupport,
        testCallButtons,
        testConversationSelection,
        testCallInterfaceCSS
    ];
    
    const results = tests.map(test => test());
    
    console.log('\n📊 TEST RESULTS SUMMARY:');
    console.log('========================');
    
    results.forEach((result, index) => {
        const testName = tests[index].name.replace('test', '').replace(/([A-Z])/g, ' $1').trim();
        console.log(`${result ? '✅' : '❌'} ${testName}: ${result ? 'PASS' : 'FAIL'}`);
    });
    
    const passedTests = results.filter(Boolean).length;
    const totalTests = results.length;
    
    console.log(`\n📈 OVERALL: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 ALL TESTS PASSED - CALL FUNCTIONALITY SHOULD WORK!');
        console.log('\n💡 TO TEST CALLS:');
        console.log('1. Select a conversation from the sidebar');
        console.log('2. Click the voice or video call button');
        console.log('3. Allow microphone/camera permissions when prompted');
        console.log('4. Check browser console for detailed logs');
    } else {
        console.log('⚠️ SOME TESTS FAILED - CHECK CONSOLE FOR DETAILS');
    }
    
    return passedTests === totalTests;
}

// Export for manual testing
window.testCallFunctionality = {
    testMessagesApp,
    testCallMethods,
    testWebRTCSupport,
    testCallButtons,
    testConversationSelection,
    testCallButtonClick,
    testCallInterfaceCSS,
    runAllTests
};

// Auto-run tests after page load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        runAllTests();
    }, 2000);
});

console.log('🔍 Call functionality test script loaded');
console.log('💡 Run window.testCallFunctionality.runAllTests() to test manually'); 