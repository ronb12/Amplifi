const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function writeTestMessages() {
  const conversationId = 'test_conversation_2way';
  const messages = [
    {
      conversationId,
      senderId: 'test_user_1',
      senderName: 'Test User 1',
      senderPic: 'default-avatar.svg',
      text: 'Hello from Test User 1!',
      createdAt: new Date()
    },
    {
      conversationId,
      senderId: 'test_user_2',
      senderName: 'Test User 2',
      senderPic: 'default-avatar.svg',
      text: 'Hi! This is Test User 2 replying.',
      createdAt: new Date(Date.now() + 1000)
    }
  ];
  for (const msg of messages) {
    await db.collection('messages').add(msg);
    console.log('Test message sent:', msg.text);
  }
}

writeTestMessages().then(() => process.exit()); 