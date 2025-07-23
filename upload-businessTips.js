const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const tips = JSON.parse(fs.readFileSync('businessTips.json', 'utf8'));

async function uploadBusinessTips() {
  const batch = db.batch();
  tips.forEach((tip) => {
    const docRef = db.collection('businessTips').doc();
    batch.set(docRef, tip);
  });
  await batch.commit();
  console.log('Business tips uploaded!');
}

uploadBusinessTips().catch(console.error); 