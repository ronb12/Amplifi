const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const tips = JSON.parse(fs.readFileSync('lifestyleTips.json', 'utf8'));

async function uploadLifestyleTips() {
  const batch = db.batch();
  tips.forEach((tip) => {
    const docRef = db.collection('lifestyleTips').doc();
    batch.set(docRef, tip);
  });
  await batch.commit();
  console.log('Lifestyle tips uploaded!');
}

uploadLifestyleTips().catch(console.error); 