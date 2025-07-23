const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const tips = JSON.parse(fs.readFileSync('techTips.json', 'utf8'));

async function uploadTechTips() {
  const batch = db.batch();
  tips.forEach((tip) => {
    const docRef = db.collection('techTips').doc();
    batch.set(docRef, tip);
  });
  await batch.commit();
  console.log('Tech tips uploaded!');
}

uploadTechTips().catch(console.error); 