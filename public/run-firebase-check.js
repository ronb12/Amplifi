// Manually Run Firebase Sample Check
console.log('🔍 MANUALLY RUNNING FIREBASE SAMPLE CHECK');

function runFirebaseCheck() {
    console.log('🔍 Starting manual Firebase check...');
    
    // Check if user is authenticated
    if (!window.messagesApp || !window.messagesApp.currentUser) {
        console.log('❌ User not authenticated, cannot check Firebase');
        console.log('📊 messagesApp:', !!window.messagesApp);
        console.log('📊 currentUser:', window.messagesApp?.currentUser);
        return;
    }
    
    console.log('✅ User authenticated:', window.messagesApp.currentUser.uid);
    
    // Check if Firebase is available
    if (!firebase || !firebase.firestore) {
        console.log('❌ Firebase not available');
        return;
    }
    
    console.log('✅ Firebase available, checking conversations...');
    
    // Check conversations
    firebase.firestore()
        .collection('conversations')
        .get()
        .then(snapshot => {
            console.log('📊 FIREBASE CHECK RESULTS:');
            console.log('📊 Total conversations found:', snapshot.size);
            
            if (snapshot.empty) {
                console.log('✅ No conversations found in Firebase');
                return;
            }
            
            const conversations = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                conversations.push({
                    id: doc.id,
                    data: data
                });
                
                console.log('📊 Conversation:', {
                    id: doc.id,
                    participants: data.participants || [],
                    lastMessage: data.lastMessage || 'No message',
                    createdAt: data.createdAt || 'Unknown',
                    unreadCount: data.unreadCount || 0
                });
            });
            
            // Analyze for samples
            const sampleConversations = conversations.filter(conv => {
                const data = conv.data;
                
                // Check for sample indicators
                const sampleIndicators = [
                    'John Doe', 'Jane Smith', 'Mike Johnson', 
                    'Sarah Wilson', 'David Brown', 'sample', 
                    'test', 'demo', 'Hey, how are you doing?',
                    'Great to hear from you!', 'Let\'s catch up soon'
                ];
                
                // Check last message
                if (data.lastMessage) {
                    const lastMessage = data.lastMessage.toLowerCase();
                    if (sampleIndicators.some(indicator => 
                        lastMessage.includes(indicator.toLowerCase()))) {
                        return true;
                    }
                }
                
                // Check participants
                if (data.participants && data.participants.length === 2) {
                    const currentUserId = window.messagesApp.currentUser.uid;
                    const otherParticipant = data.participants.find(id => id !== currentUserId);
                    
                    // If other participant is not found or looks like sample
                    if (!otherParticipant || otherParticipant.includes('sample') || otherParticipant.includes('test')) {
                        return true;
                    }
                }
                
                return false;
            });
            
            console.log('\n📊 ANALYSIS:');
            console.log('  - Total conversations:', conversations.length);
            console.log('  - Sample conversations:', sampleConversations.length);
            console.log('  - Real conversations:', conversations.length - sampleConversations.length);
            
            if (sampleConversations.length > 0) {
                console.log('\n🗑️ SAMPLE CONVERSATIONS FOUND:');
                sampleConversations.forEach((conv, index) => {
                    console.log(`  ${index + 1}. ID: ${conv.id}`);
                    console.log(`     Last Message: ${conv.data.lastMessage || 'None'}`);
                    console.log(`     Participants: ${conv.data.participants?.join(', ') || 'None'}`);
                });
                
                console.log('\n🗑️ DELETE OPTIONS:');
                console.log('  - Run: window.deleteAllSamples() - Delete all sample conversations');
                console.log('  - Run: window.deleteSpecificSample(id) - Delete specific conversation');
                
                // Make delete functions available
                window.deleteAllSamples = function() {
                    deleteSamples(sampleConversations.map(conv => conv.id));
                };
                
                window.deleteSpecificSample = function(conversationId) {
                    deleteSamples([conversationId]);
                };
                
            } else {
                console.log('✅ No sample conversations found in Firebase');
            }
            
        })
        .catch(error => {
            console.error('❌ Error checking Firebase:', error);
        });
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

// Check messages in conversations
function checkMessages() {
    console.log('\n🔍 Checking messages in conversations...');
    
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

// Auto-run the check
setTimeout(runFirebaseCheck, 1000);

// Export functions
window.runFirebaseCheck = runFirebaseCheck;
window.checkMessages = checkMessages;

console.log('🔍 Firebase check script loaded');
console.log('📝 Available functions:');
console.log('  - window.runFirebaseCheck() - Run Firebase sample check');
console.log('  - window.checkMessages() - Check messages in conversations');
console.log('  - window.deleteAllSamples() - Delete all samples (after check)');
console.log('  - window.deleteSpecificSample(id) - Delete specific sample (after check)'); 