const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addFakeConversation() {
  const user1 = 'test_user_1';
  const user2 = 'test_user_2';
  const conversationId = 'test_conversation_2way';
  const conversation = {
    participants: [user1, user2],
    participantsData: [
      { uid: user1, displayName: 'Test User 1', profilePic: 'default-avatar.svg', username: 'testuser1' },
      { uid: user2, displayName: 'Test User 2', profilePic: 'default-avatar.svg', username: 'testuser2' }
    ],
    lastMessage: '',
    lastMessageAt: new Date(),
    createdAt: new Date()
  };
  await db.collection('conversations').doc(conversationId).set(conversation, { merge: true });
  console.log('Fake conversation added:', conversationId);
}

addFakeConversation().then(() => process.exit()); 