// AI Content Creator Standalone Script
// Requires: firebaseConfig.js, Firebase SDKs, utils.js

let currentUser = null;
let userProfile = null;
let generatedAIContent = null;

document.addEventListener('DOMContentLoaded', () => {
  // Auth check
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = 'index.html';
      return;
    }
    currentUser = user;
    await loadUserProfile();
    setupUI();
  });
});

async function loadUserProfile() {
  try {
    const userDoc = await db.collection('users').doc(currentUser.uid).get();
    if (userDoc.exists) {
      userProfile = userDoc.data();
      // Set avatar
      const userAvatar = document.getElementById('userAvatar');
      if (userAvatar && userProfile.profilePic) {
        userAvatar.src = userProfile.profilePic;
      }
    }
  } catch (error) {
    console.error('Error loading user profile:', error);
  }
}

function setupUI() {
  // Content type change
  const contentType = document.getElementById('aiContentType');
  const customPromptGroup = document.getElementById('customPromptGroup');
  if (contentType) {
    contentType.addEventListener('change', () => {
      if (contentType.value === 'custom') {
        customPromptGroup.style.display = 'block';
      } else {
        customPromptGroup.style.display = 'none';
      }
    });
  }

  // Generate button
  const generateBtn = document.getElementById('generateAIContentBtn');
  if (generateBtn) {
    generateBtn.addEventListener('click', generateAIContent);
  }

  // Post button
  const postBtn = document.getElementById('postAIBtn');
  if (postBtn) {
    postBtn.addEventListener('click', postAIContent);
  }
}

async function generateAIContent() {
  const contentType = document.getElementById('aiContentType')?.value;
  const customPrompt = document.getElementById('customPrompt')?.value;
  const includeAIImage = document.getElementById('includeAIImage')?.checked;
  const hashtags = document.getElementById('aiHashtags')?.value;

  const generateBtn = document.getElementById('generateAIContentBtn');
  const postBtn = document.getElementById('postAIBtn');
  const preview = document.getElementById('aiPreview');
  const previewContent = document.getElementById('aiPreviewContent');

  if (generateBtn) generateBtn.textContent = '🔄 Generating...';
  if (generateBtn) generateBtn.disabled = true;

  try {
    // Generate content based on type
    let title, description, imagePrompt;
    switch (contentType) {
      case 'inspirational':
        title = 'Daily Inspiration';
        description = await generateInspirationalQuote();
        imagePrompt = 'inspiring quote on beautiful background, motivational, uplifting';
        break;
      case 'tech':
        title = 'Tech Tip of the Day';
        description = await generateTechTip();
        imagePrompt = 'modern technology, clean design, digital innovation';
        break;
      case 'lifestyle':
        title = 'Lifestyle Moment';
        description = await generateLifestyleContent();
        imagePrompt = 'lifestyle photography, beautiful, aspirational';
        break;
      case 'business':
        title = 'Business Insight';
        description = await generateBusinessContent();
        imagePrompt = 'professional business setting, modern office, success';
        break;
      case 'creative':
        title = 'Creative Inspiration';
        description = await generateCreativeContent();
        imagePrompt = 'artistic, creative, colorful, inspiring';
        break;
      case 'custom':
        title = 'Custom Content';
        description = await generateCustomContent(customPrompt);
        imagePrompt = customPrompt || 'beautiful, engaging, social media content';
        break;
      default:
        title = 'Amplifi Content';
        description = 'Welcome to Amplifi! 🎉';
        imagePrompt = 'social media, modern, engaging';
    }
    // Add hashtags
    if (hashtags) {
      description += `\n\n${hashtags}`;
    }
    // Store generated content
    generatedAIContent = {
      title,
      description,
      imagePrompt,
      includeAIImage,
      hashtags: extractHashtags(description)
    };
    // Show preview
    if (preview && previewContent) {
      let imagePreview = '';
      if (includeAIImage) {
        imagePreview = '<div style="margin-top: 1rem;"><img src="' + await generateAIImage(imagePrompt) + '" style="max-width: 100%; border-radius: 0.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" alt="Generated image"></div>';
      }
      previewContent.innerHTML = `
        <div class="ai-preview-item">
          <h5>${title}</h5>
          <p>${description}</p>
          ${imagePreview}
        </div>
      `;
      preview.style.display = 'block';
    }
    if (postBtn) postBtn.style.display = 'inline-block';
  } catch (error) {
    console.error('Error generating AI content:', error);
    alert('Failed to generate content. Please try again.');
  } finally {
    if (generateBtn) {
      generateBtn.textContent = '🎨 Generate Content';
      generateBtn.disabled = false;
    }
  }
}

async function postAIContent() {
  if (!generatedAIContent) {
    alert('Please generate content first');
    return;
  }
  const postBtn = document.getElementById('postAIBtn');
  if (postBtn) postBtn.textContent = '📤 Posting...';
  if (postBtn) postBtn.disabled = true;
  try {
    let mediaUrl = '';
    let thumbnailUrl = '';
    // Generate AI image if requested
    if (generatedAIContent.includeAIImage) {
      mediaUrl = await generateAIImage(generatedAIContent.imagePrompt);
      thumbnailUrl = mediaUrl;
    }
    // Create post data
    const postData = {
      title: generatedAIContent.title,
      description: generatedAIContent.description,
      hashtags: generatedAIContent.hashtags,
      mediaUrl: mediaUrl,
      thumbnailUrl: thumbnailUrl,
      mediaType: generatedAIContent.includeAIImage ? 'image' : 'text',
      authorId: currentUser.uid,
      authorName: userProfile?.displayName || 'Amplifi Admin',
      authorUsername: userProfile?.username || 'amplifi_admin',
      authorPic: userProfile?.profilePic || '',
      isAIGenerated: true,
      aiGeneratedAt: new Date(),
      likes: 0,
      comments: 0,
      reactions: {
        like: 0,
        love: 0,
        haha: 0,
        wow: 0,
        sad: 0,
        angry: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    // Save to Firestore
    await db.collection('posts').add(postData);
    // Update user's post count
    await db.collection('users').doc(currentUser.uid).update({
      postCount: firebase.firestore.FieldValue.increment(1),
      lastPosted: new Date()
    });
    alert('AI content posted successfully! 🎉');
    window.location.href = 'feed.html';
  } catch (error) {
    console.error('Error posting AI content:', error);
    alert('Failed to post content. Please try again.');
  } finally {
    if (postBtn) {
      postBtn.textContent = '📤 Post to Feed';
      postBtn.disabled = false;
    }
  }
}

// --- AI Content Generators (copied from dashboard.js) ---
async function generateInspirationalQuote() {
  // Fetch all quotes from Firestore and pick a random one
  const snapshot = await db.collection('quotes').get();
  const quotes = [];
  snapshot.forEach(doc => quotes.push(doc.data()));
  if (quotes.length === 0) return 'No quotes available.';
  const random = Math.floor(Math.random() * quotes.length);
  const quote = quotes[random];
  return quote.author ? `${quote.text} - ${quote.author}` : quote.text;
}
async function generateTechTip() {
  // Fetch all tech tips from Firestore and pick a random one
  const snapshot = await db.collection('techTips').get();
  const tips = [];
  snapshot.forEach(doc => tips.push(doc.data().tip));
  if (tips.length === 0) return 'No tech tips available.';
  const random = Math.floor(Math.random() * tips.length);
  return tips[random];
}
async function generateLifestyleContent() {
  // Fetch all lifestyle tips from Firestore and pick a random one
  const snapshot = await db.collection('lifestyleTips').get();
  const tips = [];
  snapshot.forEach(doc => tips.push(doc.data().tip));
  if (tips.length === 0) return 'No lifestyle tips available.';
  const random = Math.floor(Math.random() * tips.length);
  return tips[random];
}
async function generateBusinessContent() {
  // Fetch all business tips from Firestore and pick a random one
  const snapshot = await db.collection('businessTips').get();
  const tips = [];
  snapshot.forEach(doc => tips.push(doc.data().tip));
  if (tips.length === 0) return 'No business tips available.';
  const random = Math.floor(Math.random() * tips.length);
  return tips[random];
}
async function generateCreativeContent() {
  // Fetch all creative ideas from Firestore and pick a random one
  const snapshot = await db.collection('creativeIdeas').get();
  const ideas = [];
  snapshot.forEach(doc => ideas.push(doc.data().idea));
  if (ideas.length === 0) return 'No creative ideas available.';
  const random = Math.floor(Math.random() * ideas.length);
  return ideas[random];
}
async function generateCustomContent(prompt) {
  return `Custom content based on: "${prompt}"\n\nThis is a placeholder for AI-generated content. In a real implementation, this would call ChatGPT, Claude, or another AI service to generate content based on your prompt.`;
}
function extractHashtags(text) {
  const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
  const hashtags = text.match(hashtagRegex);
  return hashtags ? hashtags.map(tag => tag.substring(1).toLowerCase()) : [];
}
async function generateAIImage(prompt) {
    // Fetch images from Firestore and pick a random one
    // Fallback to Unsplash if no images in Firestore
    const keywords = prompt.split(' ').slice(0, 3).join(',');
    const url = `https://source.unsplash.com/800x600/?${encodeURIComponent(keywords)}`;
    try {
        // Try to fetch the image to check for 503
        const response = await fetch(url, { method: 'HEAD' });
        if (response.status === 503) {
            throw new Error('Unsplash returned 503');
        }
        return url;
    } catch (error) {
        console.error('Error fetching image:', error);
        // Fallback to a local placeholder image
        return 'default-placeholder.png';
    }
} 