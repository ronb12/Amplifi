// Check Firebase for Sample Conversations
console.log('🔍 CHECKING FIREBASE FOR SAMPLE CONVERSATIONS');

function checkFirebaseSamples() {
    console.log('🔍 Starting Firebase sample check...');
    
    if (!window.messagesApp || !window.messagesApp.currentUser) {
        console.log('❌ User not authenticated, cannot check Firebase');
        return;
    }
    
    console.log('✅ User authenticated, checking Firebase...');
    
    // Check 1: List all conversations in Firebase
    console.log('\n🔍 CHECK 1: Listing all conversations in Firebase');
    
    firebase.firestore()
        .collection('conversations')
        .get()
        .then(snapshot => {
            console.log('📊 Found conversations in Firebase:', snapshot.size);
            
            if (snapshot.empty) {
                console.log('✅ No conversations found in Firebase');
                return;
            }
            
            const sampleConversations = [];
            const realConversations = [];
            
            snapshot.forEach(doc => {
                const data = doc.data();
                console.log('📊 Conversation:', {
                    id: doc.id,
                    participants: data.participants,
                    lastMessage: data.lastMessage,
                    createdAt: data.createdAt
                });
                
                // Check if this looks like a sample conversation
                const isSample = checkIfSample(data);
                if (isSample) {
                    sampleConversations.push({ id: doc.id, data: data });
                } else {
                    realConversations.push({ id: doc.id, data: data });
                }
            });
            
            console.log('\n📊 ANALYSIS RESULTS:');
            console.log('  - Total conversations:', snapshot.size);
            console.log('  - Sample conversations:', sampleConversations.length);
            console.log('  - Real conversations:', realConversations.length);
            
            if (sampleConversations.length > 0) {
                console.log('\n🗑️ SAMPLE CONVERSATIONS FOUND:');
                sampleConversations.forEach((conv, index) => {
                    console.log(`  ${index + 1}. ID: ${conv.id}`);
                    console.log(`     Participants: ${conv.data.participants?.join(', ') || 'None'}`);
                    console.log(`     Last Message: ${conv.data.lastMessage || 'None'}`);
                });
                
                // Offer to delete samples
                offerDeleteSamples(sampleConversations);
            } else {
                console.log('✅ No sample conversations found in Firebase');
            }
            
            if (realConversations.length > 0) {
                console.log('\n✅ REAL CONVERSATIONS FOUND:');
                realConversations.forEach((conv, index) => {
                    console.log(`  ${index + 1}. ID: ${conv.id}`);
                    console.log(`     Participants: ${conv.data.participants?.join(', ') || 'None'}`);
                    console.log(`     Last Message: ${conv.data.lastMessage || 'None'}`);
                });
            }
            
        })
        .catch(error => {
            console.error('❌ Error checking Firebase conversations:', error);
        });
}

function checkIfSample(conversationData) {
    // Check for common sample indicators
    const sampleIndicators = [
        'John Doe',
        'Jane Smith', 
        'Mike Johnson',
        'Sarah Wilson',
        'David Brown',
        'sample',
        'test',
        'demo'
    ];
    
    // Check last message for sample content
    if (conversationData.lastMessage) {
        const lastMessage = conversationData.lastMessage.toLowerCase();
        if (sampleIndicators.some(indicator => lastMessage.includes(indicator.toLowerCase()))) {
            return true;
        }
    }
    
    // Check if conversation has sample-like structure
    if (conversationData.participants && conversationData.participants.length === 2) {
        // Check if one participant is the current user and the other is a sample user
        const currentUserId = window.messagesApp.currentUser.uid;
        const otherParticipant = conversationData.participants.find(id => id !== currentUserId);
        
        // If we can't identify the other participant, it might be a sample
        if (!otherParticipant || otherParticipant.includes('sample') || otherParticipant.includes('test')) {
            return true;
        }
    }
    
    // Check creation time - if very recent, might be sample
    if (conversationData.createdAt) {
        const createdAt = conversationData.createdAt.toDate();
        const now = new Date();
        const diffHours = (now - createdAt) / (1000 * 60 * 60);
        
        // If created within last hour, might be sample
        if (diffHours < 1) {
            return true;
        }
    }
    
    return false;
}

function offerDeleteSamples(sampleConversations) {
    console.log('\n🗑️ DELETE OPTIONS:');
    console.log('  - Run: window.deleteAllSamples() - Delete all sample conversations');
    console.log('  - Run: window.deleteSpecificSample(id) - Delete specific conversation');
    console.log('  - Run: window.listSampleDetails() - See detailed sample info');
    
    // Make functions available globally
    window.deleteAllSamples = function() {
        deleteSamples(sampleConversations.map(conv => conv.id));
    };
    
    window.deleteSpecificSample = function(conversationId) {
        deleteSamples([conversationId]);
    };
    
    window.listSampleDetails = function() {
        console.log('\n📊 DETAILED SAMPLE CONVERSATIONS:');
        sampleConversations.forEach((conv, index) => {
            console.log(`\n${index + 1}. Conversation ID: ${conv.id}`);
            console.log('   Data:', conv.data);
        });
    };
}

function deleteSamples(conversationIds) {
    console.log('🗑️ Starting deletion of sample conversations...');
    console.log('🗑️ Conversations to delete:', conversationIds);
    
    if (!confirm(`Are you sure you want to delete ${conversationIds.length} sample conversation(s)? This cannot be undone.`)) {
        console.log('❌ Deletion cancelled by user');
        return;
    }
    
    const batch = firebase.firestore().batch();
    
    conversationIds.forEach(conversationId => {
        console.log('🗑️ Deleting conversation:', conversationId);
        
        // Delete the conversation document
        const conversationRef = firebase.firestore()
            .collection('conversations')
            .doc(conversationId);
        batch.delete(conversationRef);
        
        // Delete all messages in the conversation
        firebase.firestore()
            .collection('conversations')
            .doc(conversationId)
            .collection('messages')
            .get()
            .then(snapshot => {
                console.log(`🗑️ Found ${snapshot.size} messages in conversation ${conversationId}`);
                snapshot.forEach(doc => {
                    batch.delete(doc.ref);
                });
            })
            .catch(error => {
                console.error('❌ Error getting messages for deletion:', error);
            });
    });
    
    // Commit the batch
    batch.commit()
        .then(() => {
            console.log('✅ All sample conversations deleted successfully');
            console.log('🔄 Refreshing page to reflect changes...');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        })
        .catch(error => {
            console.error('❌ Error deleting sample conversations:', error);
        });
}

// Check 2: Check for sample messages in conversations
function checkSampleMessages() {
    console.log('\n🔍 CHECK 2: Checking for sample messages in conversations');
    
    firebase.firestore()
        .collection('conversations')
        .get()
        .then(snapshot => {
            snapshot.forEach(conversationDoc => {
                const conversationId = conversationDoc.id;
                
                firebase.firestore()
                    .collection('conversations')
                    .doc(conversationId)
                    .collection('messages')
                    .get()
                    .then(messagesSnapshot => {
                        console.log(`📊 Conversation ${conversationId}: ${messagesSnapshot.size} messages`);
                        
                        messagesSnapshot.forEach(messageDoc => {
                            const messageData = messageDoc.data();
                            console.log('📊 Message:', {
                                id: messageDoc.id,
                                text: messageData.text,
                                senderName: messageData.senderName,
                                timestamp: messageData.timestamp
                            });
                        });
                    })
                    .catch(error => {
                        console.error(`❌ Error getting messages for conversation ${conversationId}:`, error);
                    });
            });
        })
        .catch(error => {
            console.error('❌ Error getting conversations for message check:', error);
        });
}

// Check 3: Check for sample users
function checkSampleUsers() {
    console.log('\n🔍 CHECK 3: Checking for sample users');
    
    firebase.firestore()
        .collection('users')
        .get()
        .then(snapshot => {
            console.log('📊 Found users in Firebase:', snapshot.size);
            
            snapshot.forEach(doc => {
                const userData = doc.data();
                console.log('📊 User:', {
                    id: doc.id,
                    displayName: userData.displayName,
                    email: userData.email
                });
            });
        })
        .catch(error => {
            console.error('❌ Error checking users:', error);
        });
}

// Auto-run check
setTimeout(checkFirebaseSamples, 1000);

// Export functions for manual use
window.checkFirebaseSamples = checkFirebaseSamples;
window.checkSampleMessages = checkSampleMessages;
window.checkSampleUsers = checkSampleUsers;

console.log('🔍 Firebase sample check script loaded');
console.log('📝 Available functions:');
console.log('  - window.checkFirebaseSamples() - Check for sample conversations');
console.log('  - window.checkSampleMessages() - Check for sample messages');
console.log('  - window.checkSampleUsers() - Check for sample users');
console.log('  - window.deleteAllSamples() - Delete all sample conversations (after check)');
console.log('  - window.deleteSpecificSample(id) - Delete specific conversation (after check)');
console.log('  - window.listSampleDetails() - See detailed sample info (after check)'); 