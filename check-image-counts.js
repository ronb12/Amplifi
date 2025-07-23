const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkImageCounts() {
  const snapshot = await db.collection('images').get();
  const images = [];
  snapshot.forEach(doc => images.push(doc.data()));

  // Define category keywords
  const categories = {
    inspirational: ['nature', 'sunset', 'sunrise', 'mountain', 'lake', 'ocean', 'forest'],
    tech: ['city', 'urban', 'lights', 'bridge'],
    lifestyle: ['beach', 'park', 'field', 'hills', 'plains'],
    business: ['city', 'skyline', 'urban', 'bridge'],
    creative: ['autumn', 'fog', 'mystery', 'golden', 'blue']
  };

  console.log('Image counts by category:');
  console.log('========================');

  for (const [category, keywords] of Object.entries(categories)) {
    const matchingImages = images.filter(img => 
      img.tags && img.tags.some(tag => keywords.includes(tag))
    );
    console.log(`${category}: ${matchingImages.length} images`);
  }

  console.log('\nTotal images in collection:', images.length);
}

checkImageCounts().catch(console.error); 