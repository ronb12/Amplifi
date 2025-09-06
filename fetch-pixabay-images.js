const fs = require('fs');

const PIXABAY_API_KEY = 'fukzfUyQBBPXqfJyNeXsFvIFOXhIjkRWFaeNVLSggxEZ9aKhqnWa3lgR';

// Define search terms for each category
const categories = {
  inspirational: ['inspiration', 'motivation', 'success', 'achievement', 'dreams'],
  tech: ['technology', 'computer', 'digital', 'innovation', 'coding'],
  lifestyle: ['lifestyle', 'wellness', 'health', 'fitness', 'mindfulness'],
  business: ['business', 'office', 'meeting', 'professional', 'corporate'],
  creative: ['art', 'creative', 'design', 'abstract', 'colorful']
};

async function fetchPixabayImages(category, searchTerm) {
  const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(searchTerm)}&image_type=photo&per_page=3&safesearch=true`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.hits && data.hits.length > 0) {
      return data.hits.map(hit => ({
        url: hit.webformatURL,
        title: hit.tags.split(',')[0].trim(),
        tags: hit.tags.split(',').map(tag => tag.trim().toLowerCase()),
        source: 'pixabay',
        category: category
      }));
    }
    return [];
  } catch (error) {
    console.error(`Error fetching ${searchTerm}:`, error);
    return [];
  }
}

async function getAllImages() {
  let allImages = [];
  
  for (const [category, searchTerms] of Object.entries(categories)) {
    console.log(`Fetching images for ${category}...`);
    
    for (const searchTerm of searchTerms) {
      const images = await fetchPixabayImages(category, searchTerm);
      allImages = allImages.concat(images);
      
      // Add a small delay to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return allImages;
}

async function main() {
  console.log('Fetching images from Pixabay...');
  
  // Read existing images
  let existingImages = [];
  try {
    existingImages = JSON.parse(fs.readFileSync('images.json', 'utf8'));
  } catch (error) {
    console.log('No existing images.json found, starting fresh');
  }
  
  // Fetch new images
  const newImages = await getAllImages();
  
  // Combine existing and new images
  const allImages = [...existingImages, ...newImages];
  
  // Save to file
  fs.writeFileSync('images.json', JSON.stringify(allImages, null, 2));
  
  console.log(`Added ${newImages.length} new images`);
  console.log(`Total images: ${allImages.length}`);
  
  // Show breakdown by category
  const categoryCounts = {};
  allImages.forEach(img => {
    const category = img.category || 'uncategorized';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });
  
  console.log('\nImages by category:');
  Object.entries(categoryCounts).forEach(([category, count]) => {
    console.log(`${category}: ${count} images`);
  });
}

main().catch(console.error); 