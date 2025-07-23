/* global db, auth, firebase, storage */
// Upload Page JavaScript
class UploadPage {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.selectedFile = null;
        this.uploadProgress = 0;
        
        this.init();
    }

    async init() {
        await this.setupAuthStateListener(); // Ensure currentUser is set
        await this.checkAuthentication();
        await this.checkAdminRestrictions();
        this.setupEventListeners();
        this.loadUserProfile();
    }

    async setupAuthStateListener() {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                this.currentUser = user;
                await this.loadUserProfile();
                this.updateUIForAuthenticatedUser();
            } else {
                this.currentUser = null;
                this.updateUIForUnauthenticatedUser();
            }
        });
    }

    async loadUserProfile() {
        try {
            if (!this.currentUser) return; // Prevent error if not logged in
            const userDoc = await db.collection('users').doc(this.currentUser.uid).get();
            if (userDoc.exists) {
                this.userProfile = userDoc.data();
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    updateUIForAuthenticatedUser() {
        const userMenu = document.getElementById('userMenu');
        const notificationBtn = document.getElementById('notificationBtn');
        
        if (userMenu) userMenu.style.display = 'block';
        if (notificationBtn) notificationBtn.style.display = 'block';
        
        if (this.userProfile) {
            const userAvatar = document.getElementById('userAvatar');
            if (userAvatar && this.userProfile.profilePic) {
                userAvatar.src = this.userProfile.profilePic;
            }
        }
    }

    updateUIForUnauthenticatedUser() {
        const userMenu = document.getElementById('userMenu');
        const notificationBtn = document.getElementById('notificationBtn');
        
        if (userMenu) userMenu.style.display = 'none';
        if (notificationBtn) notificationBtn.style.display = 'none';
        
        // Redirect unauthenticated users to login page
        // Only redirect if we're not already on the login page
        if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
            window.location.href = 'index.html';
        }
    }

    checkAuthentication() {
        // Authentication will be handled by the auth state listener
        // This prevents immediate redirect before auth state is loaded
    }

    async checkAdminRestrictions() {
        if (!this.currentUser) return;
        
        try {
            const userDoc = await db.collection('users').doc(this.currentUser.uid).get();
            const userData = userDoc.data();
            
            // Check if user is admin (specific to ronellbradley@gmail.com)
            if ((userData?.role === 'admin' || userData?.isAdmin === true) && 
                (this.currentUser.email === 'ronellbradley@gmail.com' || userData?.adminEmail === 'ronellbradley@gmail.com')) {
                this.showAdminRedirect();
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    }

    showAdminRedirect() {
        const uploadContainer = document.querySelector('.upload-container');
        if (uploadContainer) {
            uploadContainer.innerHTML = `
                <div class="admin-redirect">
                    <div class="admin-redirect-content">
                        <div class="admin-icon">👑</div>
                        <h2>Admin Access Restricted</h2>
                        <p>As an admin, you can only post AI-generated content to maintain quality standards.</p>
                        <div class="admin-actions">
                            <button onclick="window.location.href='dashboard.html'" class="btn btn-primary">
                                🤖 Go to AI Content Creator
                            </button>
                            <button onclick="window.location.href='feed.html'" class="btn btn-secondary">
                                📱 Back to Feed
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    setupMobileTabNavigation() {
        // Set active tab based on current page
        const currentPage = window.location.pathname.split('/').pop() || 'upload.html';
        const tabItems = document.querySelectorAll('.mobile-tab-nav .tab-item');
        
        tabItems.forEach(tab => {
            const href = tab.getAttribute('href');
            if (href === currentPage) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Add smooth transitions for tab clicks
        tabItems.forEach(tab => {
            tab.addEventListener('click', (e) => {
                // Add loading state
                tab.style.opacity = '0.7';
                tab.style.transform = 'scale(0.95)';
                
                // Reset after transition
                setTimeout(() => {
                    tab.style.opacity = '';
                    tab.style.transform = '';
                }, 150);
            });
        });
    }

    setupEventListeners() {
        // File input
        const mediaInput = document.getElementById('mediaInput');
        if (mediaInput) {
            mediaInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileSelect(e.target.files[0]);
                }
            });
        }

        // Upload area drag and drop
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            uploadArea.addEventListener('click', () => {
                if (mediaInput) mediaInput.click();
            });

            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });

            uploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFileSelect(files[0]);
                }
            });
        }

        // Remove media button
        const removeMedia = document.getElementById('removeMedia');
        if (removeMedia) {
            removeMedia.addEventListener('click', () => {
                this.removeSelectedFile();
            });
        }

        // Post button
        const postBtn = document.getElementById('postBtn');
        if (postBtn) {
            postBtn.addEventListener('click', () => {
                this.handleUpload();
            });
        }

        // Cancel button
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to cancel? Your changes will be lost.')) {
                    window.location.href = 'feed.html';
                }
            });
        }

        // Character count updates
        const postTitle = document.getElementById('postTitle');
        const postDescription = document.getElementById('postDescription');
        const titleCharCount = document.getElementById('titleCharCount');
        const descCharCount = document.getElementById('descCharCount');

        if (postTitle && titleCharCount) {
            postTitle.addEventListener('input', () => {
                const count = postTitle.value.length;
                titleCharCount.textContent = `${count}/100`;
                this.updatePostButton();
            });
        }

        if (postDescription && descCharCount) {
            postDescription.addEventListener('input', () => {
                const count = postDescription.value.length;
                descCharCount.textContent = `${count}/500`;
                this.updatePostButton();
            });
        }

        // Tag suggestions
        const tagSuggestions = document.querySelectorAll('.tag-suggestion');
        const postTags = document.getElementById('postTags');
        
        tagSuggestions.forEach(tag => {
            tag.addEventListener('click', () => {
                const tagText = tag.dataset.tag;
                if (postTags) {
                    const currentTags = postTags.value.trim();
                    const newTags = currentTags ? `${currentTags}, ${tagText}` : tagText;
                    postTags.value = newTags;
                }
            });
        });
    }

    handleFileSelect(file) {
        // Validate file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
            alert('File size must be less than 50MB');
            return;
        }

        // Validate file type
        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');

        if (!isVideo && !isImage) {
            alert('Please select a video or image file');
            return;
        }

        this.selectedFile = file;
        this.showFilePreview(file);
        this.showUploadForm();
    }

    showFilePreview(file) {
        const uploadPlaceholder = document.getElementById('uploadPlaceholder');
        const uploadPreview = document.getElementById('uploadPreview');
        const previewImage = document.getElementById('previewImage');
        const previewVideo = document.getElementById('previewVideo');

        if (uploadPlaceholder) uploadPlaceholder.style.display = 'none';
        if (uploadPreview) uploadPreview.style.display = 'block';

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (previewImage) {
                    previewImage.src = e.target.result;
                    previewImage.style.display = 'block';
                }
                if (previewVideo) previewVideo.style.display = 'none';
            };
            reader.readAsDataURL(file);
        } else if (file.type.startsWith('video/')) {
            const url = URL.createObjectURL(file);
            if (previewVideo) {
                previewVideo.src = url;
                previewVideo.style.display = 'block';
            }
            if (previewImage) previewImage.style.display = 'none';
        }

        this.updatePostButton();
    }

    removeSelectedFile() {
        this.selectedFile = null;
        
        const uploadPlaceholder = document.getElementById('uploadPlaceholder');
        const uploadPreview = document.getElementById('uploadPreview');
        const previewImage = document.getElementById('previewImage');
        const previewVideo = document.getElementById('previewVideo');

        if (uploadPlaceholder) uploadPlaceholder.style.display = 'block';
        if (uploadPreview) uploadPreview.style.display = 'none';
        if (previewImage) previewImage.style.display = 'none';
        if (previewVideo) previewVideo.style.display = 'none';

        this.updatePostButton();
    }

    async handleUpload() {
        if (!this.currentUser) {
            alert('Please login to upload content');
            return;
        }

        const postTitle = document.getElementById('postTitle');
        const postDescription = document.getElementById('postDescription');
        const postTags = document.getElementById('postTags');

        if (!postTitle || !postDescription) {
            alert('Please fill in all required fields');
            return;
        }

        const title = postTitle.value.trim();
        const description = postDescription.value.trim();
        const tags = postTags ? postTags.value.trim() : '';

        if (!title || !description) {
            alert('Please fill in title and description');
            return;
        }

        if (!this.selectedFile) {
            alert('Please select a file to upload');
            return;
        }

        try {
            this.showUploadProgress();
            
            // Extract hashtags from description
            const hashtags = this.extractHashtags(description);
            
            // Upload file first
            const mediaUrl = await this.uploadFile();
            let thumbnailUrl = '';
            
            // Generate thumbnail for videos
            if (this.selectedFile.type.startsWith('video/')) {
                thumbnailUrl = await this.generateVideoThumbnail();
            }

            // Create post data
            const postData = {
                title: title,
                description: description,
                hashtags: hashtags,
                tags: tags,
                mediaUrl: mediaUrl,
                thumbnailUrl: thumbnailUrl,
                mediaType: this.selectedFile.type.startsWith('video/') ? 'video' : 'image',
                authorId: this.currentUser.uid,
                authorName: this.userProfile?.displayName || 'Anonymous',
                authorUsername: this.userProfile?.username || 'anonymous',
                authorPic: this.userProfile?.profilePic || '',
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
            const postRef = await db.collection('posts').add(postData);

            // Update user's post count
            await db.collection('users').doc(this.currentUser.uid).update({
                postCount: firebase.firestore.FieldValue.increment(1),
                lastPosted: new Date()
            });

            this.hideUploadProgress();
            
            // Show success message
            alert('Post uploaded successfully!');
            
            // Redirect to feed
            window.location.href = 'feed.html';
            
        } catch (error) {
            console.error('Upload error:', error);
            this.hideUploadProgress();
            alert('Upload failed. Please try again.');
        }
    }

    extractHashtags(text) {
        const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
        const hashtags = text.match(hashtagRegex);
        if (hashtags) {
            return hashtags.map(tag => tag.substring(1).toLowerCase());
        }
        return [];
    }

    async uploadFile() {
        const storageRef = storage.ref();
        const fileRef = storageRef.child(`posts/${this.currentUser.uid}/${Date.now()}_${this.selectedFile.name}`);
        
        const uploadTask = fileRef.put(this.selectedFile);
        
        return new Promise((resolve, reject) => {
            uploadTask.on('state_changed', 
                (snapshot) => {
                    this.uploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    this.updateProgressBar();
                },
                (error) => {
                    reject(error);
                },
                () => {
                    uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                        resolve(downloadURL);
                    });
                }
            );
        });
    }

    async generateVideoThumbnail() {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(this.selectedFile);
            video.currentTime = 1; // Seek to 1 second
            
            video.addEventListener('loadeddata', () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                canvas.toBlob(async (blob) => {
                    try {
                        const storageRef = storage.ref();
                        const thumbnailRef = storageRef.child(`thumbnails/${this.currentUser.uid}/${Date.now()}_thumb.jpg`);
                        await thumbnailRef.put(blob);
                        const thumbnailUrl = await thumbnailRef.getDownloadURL();
                        resolve(thumbnailUrl);
                    } catch (error) {
                        console.error('Error generating thumbnail:', error);
                        resolve(''); // Return empty string if thumbnail generation fails
                    }
                }, 'image/jpeg', 0.8);
            });
        });
    }

    showUploadProgress() {
        const uploadProgress = document.getElementById('uploadProgress');
        if (uploadProgress) uploadProgress.style.display = 'block';
    }

    hideUploadProgress() {
        const uploadProgress = document.getElementById('uploadProgress');
        if (uploadProgress) uploadProgress.style.display = 'none';
    }

    updateProgressBar() {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill) progressFill.style.width = `${this.uploadProgress}%`;
        if (progressText) progressText.textContent = `Uploading... ${Math.round(this.uploadProgress)}%`;
    }

    updatePostButton() {
        const postBtn = document.getElementById('postBtn');
        const title = document.getElementById('postTitle')?.value.trim();
        
        if (postBtn) {
            const canPost = this.selectedFile && title;
            postBtn.disabled = !canPost;
        }
    }

    async saveAsDraft() {
        if (!this.selectedFile) {
            alert('Please select a file first');
            return;
        }

        const title = document.getElementById('postTitle')?.value.trim();
        const description = document.getElementById('postDescription')?.value.trim();
        const tags = document.getElementById('postTags')?.value.trim();
        const allowComments = document.getElementById('allowComments')?.checked;
        const allowTips = document.getElementById('allowTips')?.checked;

        try {
            // Save draft data to localStorage for now
            const draftData = {
                title: title,
                description: description,
                tags: tags,
                allowComments: allowComments,
                allowTips: allowTips,
                fileName: this.selectedFile.name,
                fileSize: this.selectedFile.size,
                fileType: this.selectedFile.type,
                createdAt: new Date().toISOString()
            };

            // Save draft to localStorage safely
            if (window.StorageUtils) {
                const drafts = window.StorageUtils.getItem('drafts', []);
                drafts.push(draftData);
                window.StorageUtils.setItem('drafts', drafts);
            } else {
                // Fallback to direct localStorage
                const drafts = JSON.parse(localStorage.getItem('drafts') || '[]');
                drafts.push(draftData);
                localStorage.setItem('drafts', JSON.stringify(drafts));
            }

            alert('Draft saved successfully!');
        } catch (error) {
            console.error('Error saving draft:', error);
            alert('Failed to save draft. Please try again.');
        }
    }

    async handleLogout() {
        try {
            await auth.signOut();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
}

// Initialize the upload page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.uploadPage = new UploadPage();
}); 