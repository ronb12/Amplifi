const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const images = JSON.parse(fs.readFileSync('images.json', 'utf8'));

async function uploadImages() {
  const batch = db.batch();
  images.forEach((img) => {
    const docRef = db.collection('images').doc();
    batch.set(docRef, img);
  });
  await batch.commit();
  console.log('Images uploaded!');
}

uploadImages().catch(console.error); 