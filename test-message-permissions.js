const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testMessageWrite() {
  const messageData = {
    conversationId: 'test_conversation_2way',
    senderId: 'TBSd6QLCCWNd6PHN0HTlXmXJYDC3',
    senderName: 'Admin User',
    senderPic: '',
    text: 'Test message from service account',
    createdAt: new Date()
  };
  
  try {
    console.log('Testing message write with service account...');
    console.log('Message data:', messageData);
    
    const docRef = await db.collection('messages').add(messageData);
    console.log('✅ Message written successfully! Document ID:', docRef.id);
    
    // Also test reading the conversation to verify participants
    const conversationDoc = await db.collection('conversations').doc('test_conversation_2way').get();
    if (conversationDoc.exists) {
      const data = conversationDoc.data();
      console.log('✅ Conversation participants:', data.participants);
      console.log('✅ User TBSd6QLCCWNd6PHN0HTlXmXJYDC3 is participant:', data.participants.includes('TBSd6QLCCWNd6PHN0HTlXmXJYDC3'));
    } else {
      console.log('❌ Conversation document not found');
    }
    
  } catch (error) {
    console.error('❌ Failed to write message:', error);
  }
}

testMessageWrite().then(() => process.exit()); 