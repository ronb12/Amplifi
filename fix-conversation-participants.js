const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Set your current user's UID here
const myUid = 'TBSd6QLCCWNd6PHN0HTlXmXJYDC3';

async function fixParticipants() {
  const conversationsSnapshot = await db.collection('conversations').get();
  let updated = 0;
  
  console.log(`Found ${conversationsSnapshot.size} conversations total`);
  
  for (const doc of conversationsSnapshot.docs) {
    const data = doc.data();
    console.log(`Checking conversation ${doc.id}:`, data.participants);
    
    if (!Array.isArray(data.participants)) {
      console.log(`Skipping ${doc.id}: no participants array`);
      continue;
    }
    
    if (!data.participants.includes(myUid)) {
      const newParticipants = [...data.participants, myUid];
      await db.collection('conversations').doc(doc.id).update({ participants: newParticipants });
      console.log(`Updated conversation ${doc.id}: added ${myUid} to participants.`);
      updated++;
    } else {
      console.log(`Conversation ${doc.id}: already has ${myUid} in participants`);
    }
  }
  console.log(`Done. Updated ${updated} conversations.`);
}

fixParticipants().then(() => process.exit()); 