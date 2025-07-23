const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const ideas = JSON.parse(fs.readFileSync('creativeIdeas.json', 'utf8'));

async function uploadCreativeIdeas() {
  const batch = db.batch();
  ideas.forEach((idea) => {
    const docRef = db.collection('creativeIdeas').doc();
    batch.set(docRef, idea);
  });
  await batch.commit();
  console.log('Creative ideas uploaded!');
}

uploadCreativeIdeas().catch(console.error); 