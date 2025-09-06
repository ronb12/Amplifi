const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addFakeUsers() {
  const now = new Date();
  const users = [
    {
      uid: 'test_user_1',
      displayName: 'Test User 1',
      profilePic: 'default-avatar.svg',
      username: 'testuser1',
      email: 'testuser1@example.com',
      createdAt: now
    },
    {
      uid: 'test_user_2',
      displayName: 'Test User 2',
      profilePic: 'default-avatar.svg',
      username: 'testuser2',
      email: 'testuser2@example.com',
      createdAt: new Date(now.getTime() + 1000)
    }
  ];
  for (const user of users) {
    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      displayName: user.displayName,
      profilePic: user.profilePic,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    }, { merge: true });
    console.log('Fake user added:', user.uid);
  }
}

addFakeUsers().then(() => process.exit()); 