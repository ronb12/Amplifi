const admin = require('firebase-admin');
const fs = require('fs');

// Path to your service account key
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Load your dataset
const quotes = JSON.parse(fs.readFileSync('quotes.json', 'utf8'));

async function uploadQuotes() {
  const batch = db.batch();
  quotes.forEach((quote) => {
    const docRef = db.collection('quotes').doc(); // auto-ID
    batch.set(docRef, quote);
  });
  await batch.commit();
  console.log('Quotes uploaded!');
}

uploadQuotes().catch(console.error); 