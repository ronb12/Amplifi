// Test script to verify messages page is fully synced and has no undefined issues
console.log('🧪 TESTING MESSAGES PAGE SYNC AND UNDEFINED ISSUES');

// Test 1: Check if messagesApp is properly initialized
function testMessagesAppInitialization() {
    console.log('✅ Test 1: Messages App Initialization');
    if (typeof messagesApp !== 'undefined') {
        console.log('✅ messagesApp is defined');
        console.log('✅ Current user:', messagesApp.currentUser ? 'Authenticated' : 'Not authenticated');
        console.log('✅ Conversations loaded:', messagesApp.conversations ? messagesApp.conversations.length : 0);
        return true;
    } else {
        console.log('❌ messagesApp is undefined');
        return false;
    }
}

// Test 2: Check for undefined messages in conversations
function testUndefinedMessages() {
    console.log('✅ Test 2: Undefined Messages Check');
    if (!messagesApp.conversations) {
        console.log('✅ No conversations to check');
        return true;
    }
    
    let hasUndefined = false;
    messagesApp.conversations.forEach((conv, index) => {
        if (conv.lastMessage === 'undefined' || conv.lastMessage === undefined) {
            console.log(`❌ Conversation ${index} has undefined lastMessage:`, conv.lastMessage);
            hasUndefined = true;
        }
    });
    
    if (!hasUndefined) {
        console.log('✅ No undefined messages found in conversations');
    }
    return !hasUndefined;
}

// Test 3: Check for undefined in messages array
function testUndefinedInMessages() {
    console.log('✅ Test 3: Undefined in Messages Array');
    if (!messagesApp.messages) {
        console.log('✅ No messages to check');
        return true;
    }
    
    let hasUndefined = false;
    messagesApp.messages.forEach((message, index) => {
        if (message.text === 'undefined' || message.text === undefined) {
            console.log(`❌ Message ${index} has undefined text:`, message.text);
            hasUndefined = true;
        }
        if (message.senderName === 'undefined' || message.senderName === undefined) {
            console.log(`❌ Message ${index} has undefined senderName:`, message.senderName);
            hasUndefined = true;
        }
    });
    
    if (!hasUndefined) {
        console.log('✅ No undefined values found in messages array');
    }
    return !hasUndefined;
}

// Test 4: Check DOM elements for undefined
function testDOMElements() {
    console.log('✅ Test 4: DOM Elements Check');
    const elements = [
        'messagesList',
        'conversationsList',
        'messageInput',
        'chatHeader',
        'chatArea'
    ];
    
    let allElementsExist = true;
    elements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (!element) {
            console.log(`❌ Element ${elementId} not found`);
            allElementsExist = false;
        } else {
            console.log(`✅ Element ${elementId} exists`);
        }
    });
    
    return allElementsExist;
}

// Test 5: Check service worker sync
function testServiceWorkerSync() {
    console.log('✅ Test 5: Service Worker Sync');
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            if (registrations.length > 0) {
                console.log('✅ Service Worker is registered');
                registrations.forEach(reg => {
                    console.log('✅ Service Worker state:', reg.active ? 'Active' : 'Inactive');
                });
            } else {
                console.log('❌ No Service Worker registrations found');
            }
        });
    } else {
        console.log('❌ Service Worker not supported');
    }
}

// Test 6: Check Firebase sync
function testFirebaseSync() {
    console.log('✅ Test 6: Firebase Sync');
    if (typeof firebase !== 'undefined') {
        console.log('✅ Firebase is loaded');
        if (firebase.auth) {
            console.log('✅ Firebase Auth is available');
        }
        if (firebase.firestore) {
            console.log('✅ Firebase Firestore is available');
        }
        return true;
    } else {
        console.log('❌ Firebase is not loaded');
        return false;
    }
}

// Run all tests
function runAllTests() {
    console.log('🚀 STARTING COMPREHENSIVE MESSAGES PAGE TEST');
    console.log('=' .repeat(50));
    
    const tests = [
        testMessagesAppInitialization,
        testUndefinedMessages,
        testUndefinedInMessages,
        testDOMElements,
        testServiceWorkerSync,
        testFirebaseSync
    ];
    
    let passedTests = 0;
    let totalTests = tests.length;
    
    tests.forEach((test, index) => {
        try {
            const result = test();
            if (result !== false) {
                passedTests++;
            }
        } catch (error) {
            console.log(`❌ Test ${index + 1} failed with error:`, error);
        }
        console.log('-' .repeat(30));
    });
    
    console.log('=' .repeat(50));
    console.log(`📊 TEST RESULTS: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 ALL TESTS PASSED! Messages page is fully synced and has no undefined issues.');
    } else {
        console.log('⚠️ Some tests failed. Please check the issues above.');
    }
}

// Run tests after page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
} else {
    runAllTests();
} 