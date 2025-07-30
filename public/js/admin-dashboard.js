// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.isAdmin = false;
        
        this.init();
    }

    async init() {
        // Setup global error handling
        if (window.ErrorUtils) {
            window.ErrorUtils.setupGlobalErrorHandler();
        }
        
        await this.setupAuthStateListener();
        this.updateUI();
        await this.loadAdminData();
    }

    async setupAuthStateListener() {
        auth.onAuthStateChanged(async (user) => {
            console.log('Admin Dashboard - Auth state changed:', user ? user.email : 'No user');
            
            if (user) {
                this.currentUser = user;
                console.log('Loading admin profile for:', user.email);
                await this.loadUserProfile();
                await this.verifyAdminStatus();
            } else {
                console.log('No user authenticated, redirecting to login');
                this.currentUser = null;
                window.location.href = 'index.html';
            }
        });
    }

    async loadUserProfile() {
        try {
            const userDoc = await db.collection('users').doc(this.currentUser.uid).get();
            if (userDoc.exists) {
                this.userProfile = userDoc.data();
                console.log('Admin profile loaded:', this.userProfile);
            }
        } catch (error) {
            console.error('Error loading admin profile:', error);
        }
    }

    async verifyAdminStatus() {
        if (!this.currentUser) {
            console.log('No current user, cannot verify admin status');
            return false;
        }
        
        try {
            console.log('Verifying admin status for:', this.currentUser.email);
            
            // Check if user is admin (specific to ronellbradley@gmail.com)
            if (this.currentUser.email === 'ronellbradley@gmail.com' && 
                (this.userProfile?.role === 'admin' || this.userProfile?.isAdmin === true)) {
                console.log('✅ Admin status verified');
                this.isAdmin = true;
                this.updateUI();
                this.loadAdminData();
                return true;
            } else {
                console.log('❌ User is not admin, redirecting to regular dashboard');
                window.location.href = 'dashboard.html';
                return false;
            }
        } catch (error) {
            console.error('Error verifying admin status:', error);
            window.location.href = 'dashboard.html';
            return false;
        }
    }

    updateUI() {
        // Update admin email display
        const adminEmail = document.getElementById('adminEmail');
        if (adminEmail) {
            adminEmail.textContent = this.currentUser.email;
        }
    }

    async loadAdminData() {
        await this.loadStats();
        await this.loadRecentActivity();
    }

    async loadStats() {
        try {
            // Load total posts
            const postsSnapshot = await db.collection('posts').get();
            const totalPosts = postsSnapshot.size;
            const totalPostsEl = document.getElementById('totalPosts');
            if (totalPostsEl) totalPostsEl.textContent = totalPosts;

            // Load total users
            const usersSnapshot = await db.collection('users').get();
            const totalUsers = usersSnapshot.size;
            const totalUsersEl = document.getElementById('totalUsers');
            if (totalUsersEl) totalUsersEl.textContent = totalUsers;

            // Load AI-generated posts
            const aiPostsSnapshot = await db.collection('posts').where('isAIGenerated', '==', true).get();
            const aiPosts = aiPostsSnapshot.size;
            const aiPostsEl = document.getElementById('aiPosts');
            if (aiPostsEl) aiPostsEl.textContent = aiPosts;

            // Load total views (sum of all post likes)
            let totalViews = 0;
            postsSnapshot.forEach(doc => {
                const post = doc.data();
                totalViews += post.likes || 0;
            });
            const totalViewsEl = document.getElementById('totalViews');
            if (totalViewsEl) totalViewsEl.textContent = totalViews;

        } catch (error) {
            console.error('Error loading admin stats:', error);
        }
    }

    async loadRecentActivity() {
        try {
            const recentActivity = document.getElementById('recentActivity');
            if (!recentActivity) {
                console.log('Recent activity element not found');
                return;
            }
            
            // Get recent posts
            const postsSnapshot = await db.collection('posts')
                .orderBy('createdAt', 'desc')
                .limit(5)
                .get();

            const activities = [];
            
            postsSnapshot.forEach(doc => {
                const post = doc.data();
                activities.push({
                    type: 'post',
                    icon: post.isAIGenerated ? '🤖' : '📝',
                    text: `${post.isAIGenerated ? 'AI-generated' : 'User'} post "${post.title}" created`,
                    time: post.createdAt
                });
            });

            // Get recent user registrations
            const usersSnapshot = await db.collection('users')
                .orderBy('createdAt', 'desc')
                .limit(3)
                .get();

            usersSnapshot.forEach(doc => {
                const user = doc.data();
                if (user.createdAt) {
                    activities.push({
                        type: 'user',
                        icon: '👤',
                        text: `New user ${user.email} registered`,
                        time: user.createdAt
                    });
                }
            });

            // Sort by time and display
            activities.sort((a, b) => b.time.toDate() - a.time.toDate());
            
            recentActivity.innerHTML = activities.slice(0, 5).map(activity => `
                <div class="activity-item">
                    <div class="activity-icon">${activity.icon}</div>
                    <div class="activity-content">
                        <p>${activity.text}</p>
                        <span class="activity-time">${this.formatTime(activity.time)}</span>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Error loading recent activity:', error);
        }
    }

    formatTime(timestamp) {
        if (!timestamp) return 'Unknown time';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} minutes ago`;
        if (hours < 24) return `${hours} hours ago`;
        if (days < 7) return `${days} days ago`;
        
        return date.toLocaleDateString();
    }

    setupEventListeners() {
        // Add any additional event listeners here
    }

    // Admin Actions
    async createAIContent() {
        console.log('Opening AI Content Creator');
        // Create AI content modal
        const aiModal = document.createElement('div');
        aiModal.className = 'modal';
        aiModal.innerHTML = `
            <div class="modal-content ai-content-modal">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <h3>🤖 AI Content Creator</h3>
                <div class="ai-content-form">
                    <div class="form-group">
                        <label>Content Type:</label>
                        <select id="aiContentType" class="form-control">
                            <option value="inspirational">💭 Inspirational Quote</option>
                            <option value="tech">💻 Tech Tip</option>
                            <option value="lifestyle">🌟 Lifestyle</option>
                            <option value="business">💼 Business</option>
                            <option value="creative">🎨 Creative</option>
                            <option value="custom">✏️ Custom</option>
                        </select>
                    </div>
                    
                    <div class="form-group" id="customPromptGroup" style="display: none;">
                        <label>Custom Prompt:</label>
                        <textarea id="customPrompt" class="form-control" placeholder="Describe the content you want to create..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Include AI Image:</label>
                        <input type="checkbox" id="includeAIImage" checked>
                        <small>Generate matching image with AI</small>
                    </div>
                    
                    <div class="form-group">
                        <label>Hashtags:</label>
                        <input type="text" id="aiHashtags" class="form-control" placeholder="#amplifi #social #content">
                    </div>
                    
                    <div class="ai-preview" id="aiPreview" style="display: none;">
                        <h4>Preview:</h4>
                        <div id="aiPreviewContent"></div>
                    </div>
                    
                    <div class="ai-actions">
                        <button onclick="adminDashboard.generateAIContent()" class="btn btn-primary">
                            🎨 Generate Content
                        </button>
                        <button onclick="adminDashboard.postAIContent()" class="btn btn-success" id="postAIBtn" style="display: none;">
                            📤 Post to Feed
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(aiModal);
        aiModal.style.display = 'block';
        
        this.setupAIContentListeners();
    }

    setupAIContentListeners() {
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
    }

    async generateAIContent() {
        const contentType = document.getElementById('aiContentType')?.value;
        const customPrompt = document.getElementById('customPrompt')?.value;
        const includeAIImage = document.getElementById('includeAIImage')?.checked;
        const hashtags = document.getElementById('aiHashtags')?.value;
        
        const generateBtn = document.querySelector('.ai-actions .btn-primary');
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
                    description = await this.generateInspirationalQuote();
                    imagePrompt = 'inspiring quote on beautiful background, motivational, uplifting';
                    break;
                case 'tech':
                    title = 'Tech Tip of the Day';
                    description = await this.generateTechTip();
                    imagePrompt = 'modern technology, clean design, digital innovation';
                    break;
                case 'lifestyle':
                    title = 'Lifestyle Moment';
                    description = await this.generateLifestyleContent();
                    imagePrompt = 'lifestyle photography, beautiful, aspirational';
                    break;
                case 'business':
                    title = 'Business Insight';
                    description = await this.generateBusinessContent();
                    imagePrompt = 'professional business setting, modern office, success';
                    break;
                case 'creative':
                    title = 'Creative Inspiration';
                    description = await this.generateCreativeContent();
                    imagePrompt = 'artistic, creative, colorful, inspiring';
                    break;
                case 'custom':
                    title = 'Custom Content';
                    description = await this.generateCustomContent(customPrompt);
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
            this.generatedAIContent = {
                title,
                description,
                imagePrompt,
                includeAIImage,
                hashtags: this.extractHashtags(description)
            };
            
            // Show preview
            if (preview && previewContent) {
                previewContent.innerHTML = `
                    <div class="ai-preview-item">
                        <h5>${title}</h5>
                        <p>${description}</p>
                        ${includeAIImage ? '<small>🖼️ AI image will be generated</small>' : ''}
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

    async generateInspirationalQuote() {
        const quotes = [
            "The only way to do great work is to love what you do. - Steve Jobs",
            "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
            "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
            "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
            "The best way to predict the future is to create it. - Peter Drucker",
            "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
            "The journey of a thousand miles begins with one step. - Lao Tzu",
            "Believe you can and you're halfway there. - Theodore Roosevelt"
        ];
        
        return quotes[Math.floor(Math.random() * quotes.length)];
    }

    async generateTechTip() {
        const tips = [
            "💡 Pro tip: Use keyboard shortcuts to boost your productivity! Ctrl+C, Ctrl+V, Ctrl+Z - master these basics first.",
            "🔒 Security reminder: Always use strong, unique passwords and enable 2FA on your accounts.",
            "📱 Did you know? You can take screenshots on most devices with simple key combinations!",
            "⚡ Performance hack: Clear your browser cache regularly for faster loading times.",
            "🌐 Internet tip: Use incognito mode when shopping to avoid price tracking.",
            "📧 Email efficiency: Use filters and labels to organize your inbox automatically.",
            "💾 Backup your data regularly - you never know when you'll need it!",
            "🎯 Focus tip: Use the Pomodoro Technique - 25 minutes of focused work, then a 5-minute break."
        ];
        
        return tips[Math.floor(Math.random() * tips.length)];
    }

    async generateLifestyleContent() {
        const content = [
            "🌟 Start your day with gratitude. What are you thankful for today?",
            "☕ Morning ritual: Take 5 minutes to enjoy your coffee and set intentions for the day.",
            "🌿 Self-care isn't selfish. Take time to recharge and refresh your mind.",
            "📚 Reading tip: Keep a book by your bedside for peaceful evening reading.",
            "🏃‍♀️ Movement matters: Even 10 minutes of walking can boost your mood and energy.",
            "🧘‍♀️ Mindfulness moment: Take 3 deep breaths and center yourself.",
            "🎨 Creative expression: Try something new today - draw, write, or create!",
            "🌅 Sunset appreciation: Take a moment to enjoy the beauty around you."
        ];
        
        return content[Math.floor(Math.random() * content.length)];
    }

    async generateBusinessContent() {
        const content = [
            "💼 Business insight: Focus on solving problems, not just selling products.",
            "📈 Growth mindset: Every challenge is an opportunity to learn and improve.",
            "🤝 Networking tip: Build genuine relationships, not just connections.",
            "🎯 Goal setting: Break big goals into small, actionable steps.",
            "💡 Innovation: The best ideas often come from listening to your customers.",
            "📊 Data-driven decisions: Let the numbers guide your strategy.",
            "🌟 Leadership: Lead by example and inspire others to do their best.",
            "🚀 Success: Consistency beats perfection every time."
        ];
        
        return content[Math.floor(Math.random() * content.length)];
    }

    async generateCreativeContent() {
        const content = [
            "🎨 Creativity is intelligence having fun. What will you create today?",
            "✨ Inspiration is everywhere - you just need to look for it.",
            "🎭 Art is not what you see, but what you make others see.",
            "🎪 Life is a canvas - paint it with your dreams and passions.",
            "🌟 Every artist was first an amateur. Start creating today!",
            "🎯 Creative block? Try changing your environment or routine.",
            "🎨 The best time to create is when you don't feel like it.",
            "✨ Your unique perspective is your superpower - share it with the world!"
        ];
        
        return content[Math.floor(Math.random() * content.length)];
    }

    async generateCustomContent(prompt) {
        return `Custom content based on: "${prompt}"\n\nThis is a placeholder for AI-generated content. In a real implementation, this would call ChatGPT, Claude, or another AI service to generate content based on your prompt.`;
    }

    extractHashtags(text) {
        const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
        const hashtags = text.match(hashtagRegex);
        return hashtags ? hashtags.map(tag => tag.substring(1).toLowerCase()) : [];
    }

    async postAIContent() {
        if (!this.generatedAIContent) {
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
            if (this.generatedAIContent.includeAIImage) {
                console.log('Generating AI image with prompt:', this.generatedAIContent.imagePrompt);
                mediaUrl = await this.generateAIImage(this.generatedAIContent.imagePrompt);
                thumbnailUrl = mediaUrl;
                console.log('Generated image URL:', mediaUrl);
            } else {
                console.log('No AI image requested for this post');
            }

            // Create post data
            const postData = {
                title: this.generatedAIContent.title,
                description: this.generatedAIContent.description,
                hashtags: this.generatedAIContent.hashtags,
                mediaUrl: mediaUrl || null,
                thumbnailUrl: thumbnailUrl || null,
                mediaType: this.generatedAIContent.includeAIImage && mediaUrl ? 'image' : 'text',
                authorId: this.currentUser.uid,
                authorName: this.userProfile?.displayName || 'Amplifi Admin',
                authorUsername: this.userProfile?.username || 'amplifi_admin',
                authorPic: this.userProfile?.profilePic || '',
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

            // Update user's post count (handle if postCount doesn't exist)
            try {
                await db.collection('users').doc(this.currentUser.uid).update({
                    postCount: firebase.firestore.FieldValue.increment(1),
                    lastPosted: new Date()
                });
            } catch (updateError) {
                // If postCount field doesn't exist, set it to 1
                console.log('Post count field not found, setting to 1');
                await db.collection('users').doc(this.currentUser.uid).update({
                    postCount: 1,
                    lastPosted: new Date()
                });
            }

            alert('AI content posted successfully! 🎉');
            
            // Close modal
            const modal = document.querySelector('.ai-content-modal').parentElement.parentElement;
            if (modal) modal.remove();

            // Refresh stats
            await this.loadStats();
            await this.loadRecentActivity();

        } catch (error) {
            console.error('Error posting AI content:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                stack: error.stack
            });
            alert(`Failed to post content: ${error.message}. Please try again.`);
        } finally {
            if (postBtn) {
                postBtn.textContent = '📤 Post to Feed';
                postBtn.disabled = false;
            }
        }
    }

    async generateAIImage(prompt) {
        // Use local placeholder images instead of Unsplash to avoid 503 errors
        const placeholderImages = [
            'assets/images/default-avatar.svg',
            'assets/images/default-banner.svg',
            'assets/images/hero-image.svg'
        ];
        
        // Pick a random placeholder image
        const randomIndex = Math.floor(Math.random() * placeholderImages.length);
        return placeholderImages[randomIndex];
    }

    // Other admin actions (placeholder implementations)
    async viewAnalytics() {
        alert('Analytics feature coming soon! 📊');
    }

    async manageUsers() {
        alert('User management feature coming soon! 👥');
    }

    async contentModeration() {
        alert('Content moderation feature coming soon! 🛡️');
    }

    async platformSettings() {
        alert('Platform settings feature coming soon! ⚙️');
    }

    async backupData() {
        alert('Data backup feature coming soon!');
    }

    async manageMessages() {
        window.location.href = 'admin-messages.html';
    }

    async logout() {
        try {
            await auth.signOut();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error logging out:', error);
        }
    }
}

// Initialize admin dashboard
const adminDashboard = new AdminDashboard(); 