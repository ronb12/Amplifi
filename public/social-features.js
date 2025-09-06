// Social Features System for Amplifi
// Combines the best social features from across the web

class SocialFeaturesSystem {
    constructor() {
        this.features = {
            duets: new DuetSystem(),
            stories: new StorySystem(),
            groups: new GroupSystem(),
            spaces: new SpaceSystem(),
            challenges: new ChallengeSystem(),
            collaborations: new CollaborationSystem(),
            events: new EventSystem(),
            marketplace: new MarketplaceSystem()
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadUserPreferences();
        console.log('Social Features System initialized');
    }
    
    setupEventListeners() {
        // Global event listeners for social features
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('duet-btn')) {
                this.features.duets.createDuet(e.target.dataset.videoId);
            }
            if (e.target.classList.contains('story-btn')) {
                this.features.stories.createStory();
            }
            if (e.target.classList.contains('challenge-btn')) {
                this.features.challenges.joinChallenge(e.target.dataset.challengeId);
            }
        });
    }
    
    loadUserPreferences() {
        const prefs = JSON.parse(localStorage.getItem('socialPreferences') || '{}');
        Object.assign(this.features, prefs);
    }
}

// Viral Duet System
class DuetSystem {
    constructor() {
        this.duets = new Map();
        this.activeDuets = new Set();
    }
    
    createDuet(originalVideoId) {
        const duet = {
            id: this.generateId(),
            originalVideoId,
            creatorId: this.getCurrentUserId(),
            status: 'recording',
            createdAt: Date.now(),
            participants: [originalVideoId, this.getCurrentUserId()],
            layout: 'side-by-side' // or 'picture-in-picture'
        };
        
        this.duets.set(duet.id, duet);
        this.activeDuets.add(duet.id);
        
        this.showDuetInterface(duet);
        return duet;
    }
    
    showDuetInterface(duet) {
        const modal = document.createElement('div');
        modal.className = 'duet-modal';
        modal.innerHTML = `
            <div class="duet-content">
                <div class="duet-header">
                    <h3>Create Duet</h3>
                    <button class="close-btn" onclick="this.closest('.duet-modal').remove()">×</button>
                </div>
                <div class="duet-layout">
                    <div class="original-video">
                        <video src="/api/videos/${duet.originalVideoId}" controls></video>
                        <p>Original Video</p>
                    </div>
                    <div class="duet-video">
                        <div class="recording-placeholder">
                            <i class="fas fa-video"></i>
                            <p>Your Video</p>
                        </div>
                    </div>
                </div>
                <div class="duet-controls">
                    <button class="btn btn-primary" onclick="duetSystem.startRecording('${duet.id}')">
                        <i class="fas fa-record-vinyl"></i>
                        Start Recording
                    </button>
                    <button class="btn btn-secondary" onclick="duetSystem.changeLayout('${duet.id}')">
                        <i class="fas fa-th-large"></i>
                        Change Layout
                    </button>
                    <button class="btn btn-success" onclick="duetSystem.finishDuet('${duet.id}')">
                        <i class="fas fa-check"></i>
                        Finish Duet
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    startRecording(duetId) {
        const duet = this.duets.get(duetId);
        if (!duet) return;
        
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                duet.status = 'recording';
                duet.stream = stream;
                this.updateDuetStatus(duetId, 'Recording...');
            })
            .catch(error => {
                console.error('Error accessing media devices:', error);
                this.showNotification('Unable to access camera/microphone', 'error');
            });
    }
    
    changeLayout(duetId) {
        const duet = this.duets.get(duetId);
        if (!duet) return;
        
        duet.layout = duet.layout === 'side-by-side' ? 'picture-in-picture' : 'side-by-side';
        this.updateDuetLayout(duetId);
    }
    
    finishDuet(duetId) {
        const duet = this.duets.get(duetId);
        if (!duet) return;
        
        duet.status = 'completed';
        duet.completedAt = Date.now();
        
        this.showNotification('Duet created successfully!', 'success');
        this.uploadDuet(duet);
    }
    
    updateDuetStatus(duetId, status) {
        const statusElement = document.querySelector(`[data-duet-id="${duetId}"] .status`);
        if (statusElement) {
            statusElement.textContent = status;
        }
    }
    
    updateDuetLayout(duetId) {
        const layoutElement = document.querySelector(`[data-duet-id="${duetId}"] .duet-layout`);
        if (layoutElement) {
            layoutElement.className = `duet-layout ${this.duets.get(duetId).layout}`;
        }
    }
    
    uploadDuet(duet) {
        // Simulate duet upload
        console.log('Uploading duet:', duet);
        this.showNotification('Duet uploaded and shared!', 'success');
    }
    
    generateId() {
        return 'duet_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    getCurrentUserId() {
        return localStorage.getItem('userId') || 'user_' + Math.random().toString(36).substr(2, 9);
    }
    
    showNotification(message, type) {
        // Implementation for showing notifications
        console.log(`${type}: ${message}`);
    }
}

// Visual Story System
class StorySystem {
    constructor() {
        this.stories = new Map();
        this.activeStories = new Set();
        this.storyDuration = 5000; // 5 seconds per story
    }
    
    createStory() {
        const story = {
            id: this.generateId(),
            creatorId: this.getCurrentUserId(),
            media: [],
            filters: [],
            stickers: [],
            text: [],
            music: null,
            createdAt: Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };
        
        this.stories.set(story.id, story);
        this.activeStories.add(story.id);
        
        this.showStoryCreator(story);
        return story;
    }
    
    showStoryCreator(story) {
        const modal = document.createElement('div');
        modal.className = 'story-modal';
        modal.innerHTML = `
            <div class="story-content">
                <div class="story-header">
                    <h3>Create Story</h3>
                    <button class="close-btn" onclick="this.closest('.story-modal').remove()">×</button>
                </div>
                <div class="story-canvas">
                    <div class="story-preview">
                        <div class="story-placeholder">
                            <i class="fas fa-image"></i>
                            <p>Add photos/videos</p>
                        </div>
                    </div>
                </div>
                <div class="story-tools">
                    <button class="tool-btn" onclick="storySystem.addMedia('${story.id}')">
                        <i class="fas fa-camera"></i>
                        Media
                    </button>
                    <button class="tool-btn" onclick="storySystem.addFilter('${story.id}')">
                        <i class="fas fa-magic"></i>
                        Filters
                    </button>
                    <button class="tool-btn" onclick="storySystem.addSticker('${story.id}')">
                        <i class="fas fa-smile"></i>
                        Stickers
                    </button>
                    <button class="tool-btn" onclick="storySystem.addText('${story.id}')">
                        <i class="fas fa-font"></i>
                        Text
                    </button>
                    <button class="tool-btn" onclick="storySystem.addMusic('${story.id}')">
                        <i class="fas fa-music"></i>
                        Music
                    </button>
                </div>
                <div class="story-actions">
                    <button class="btn btn-primary" onclick="storySystem.previewStory('${story.id}')">
                        <i class="fas fa-eye"></i>
                        Preview
                    </button>
                    <button class="btn btn-success" onclick="storySystem.publishStory('${story.id}')">
                        <i class="fas fa-share"></i>
                        Share Story
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    addMedia(storyId) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/*';
        input.multiple = true;
        
        input.onchange = (e) => {
            const files = Array.from(e.target.files);
            const story = this.stories.get(storyId);
            
            files.forEach(file => {
                const media = {
                    id: this.generateId(),
                    type: file.type.startsWith('image/') ? 'image' : 'video',
                    file: file,
                    url: URL.createObjectURL(file),
                    duration: file.type.startsWith('video/') ? 5000 : 3000
                };
                
                story.media.push(media);
            });
            
            this.updateStoryPreview(storyId);
        };
        
        input.click();
    }
    
    addFilter(storyId) {
        const filters = ['Normal', 'Vintage', 'Black & White', 'Sepia', 'Vivid', 'Cool', 'Warm'];
        const filter = prompt('Choose filter:\n' + filters.join('\n'));
        
        if (filter && filters.includes(filter)) {
            const story = this.stories.get(storyId);
            story.filters.push(filter);
            this.showNotification(`Filter "${filter}" applied`, 'success');
        }
    }
    
    addSticker(storyId) {
        const stickers = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🔥', '🎉', '👏'];
        const sticker = prompt('Choose sticker:\n' + stickers.join(' '));
        
        if (sticker && stickers.includes(sticker)) {
            const story = this.stories.get(storyId);
            story.stickers.push({
                id: this.generateId(),
                emoji: sticker,
                position: { x: 50, y: 50 }
            });
            this.showNotification('Sticker added', 'success');
        }
    }
    
    addText(storyId) {
        const text = prompt('Enter text for your story:');
        if (text) {
            const story = this.stories.get(storyId);
            story.text.push({
                id: this.generateId(),
                content: text,
                position: { x: 50, y: 50 },
                color: '#ffffff',
                fontSize: 24
            });
            this.showNotification('Text added', 'success');
        }
    }
    
    addMusic(storyId) {
        const music = prompt('Enter music track name:');
        if (music) {
            const story = this.stories.get(storyId);
            story.music = {
                name: music,
                artist: 'Unknown Artist',
                duration: 30000
            };
            this.showNotification(`Music "${music}" added`, 'success');
        }
    }
    
    previewStory(storyId) {
        const story = this.stories.get(storyId);
        if (!story || story.media.length === 0) {
            this.showNotification('Add media to preview your story', 'warning');
            return;
        }
        
        this.showStoryPreview(story);
    }
    
    publishStory(storyId) {
        const story = this.stories.get(storyId);
        if (!story || story.media.length === 0) {
            this.showNotification('Add media to publish your story', 'warning');
            return;
        }
        
        story.status = 'published';
        story.publishedAt = Date.now();
        
        this.showNotification('Story published successfully!', 'success');
        this.uploadStory(story);
    }
    
    updateStoryPreview(storyId) {
        const preview = document.querySelector(`[data-story-id="${storyId}"] .story-preview`);
        if (!preview) return;
        
        const story = this.stories.get(storyId);
        if (story.media.length > 0) {
            const media = story.media[0];
            preview.innerHTML = `
                <${media.type === 'image' ? 'img' : 'video'} 
                    src="${media.url}" 
                    ${media.type === 'video' ? 'controls' : ''}
                    style="width: 100%; height: 100%; object-fit: cover;">
                </${media.type === 'image' ? 'img' : 'video'}>
            `;
        }
    }
    
    showStoryPreview(story) {
        // Implementation for story preview
        this.showNotification('Story preview mode', 'info');
    }
    
    uploadStory(story) {
        // Simulate story upload
        console.log('Uploading story:', story);
        this.showNotification('Story uploaded and shared!', 'success');
    }
    
    generateId() {
        return 'story_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    getCurrentUserId() {
        return localStorage.getItem('userId') || 'user_' + Math.random().toString(36).substr(2, 9);
    }
    
    showNotification(message, type) {
        console.log(`${type}: ${message}`);
    }
}

// Community Group System
class GroupSystem {
    constructor() {
        this.groups = new Map();
        this.userGroups = new Map();
        this.groupPosts = new Map();
    }
    
    createGroup(name, description, privacy = 'public') {
        const group = {
            id: this.generateId(),
            name,
            description,
            privacy,
            creatorId: this.getCurrentUserId(),
            members: [this.getCurrentUserId()],
            admins: [this.getCurrentUserId()],
            posts: [],
            events: [],
            createdAt: Date.now(),
            rules: [],
            categories: []
        };
        
        this.groups.set(group.id, group);
        
        if (!this.userGroups.has(this.getCurrentUserId())) {
            this.userGroups.set(this.getCurrentUserId(), []);
        }
        this.userGroups.get(this.getCurrentUserId()).push(group.id);
        
        this.showGroupInterface(group);
        return group;
    }
    
    joinGroup(groupId) {
        const group = this.groups.get(groupId);
        if (!group) return;
        
        if (group.members.includes(this.getCurrentUserId())) {
            this.showNotification('You are already a member of this group', 'info');
            return;
        }
        
        group.members.push(this.getCurrentUserId());
        
        if (!this.userGroups.has(this.getCurrentUserId())) {
            this.userGroups.set(this.getCurrentUserId(), []);
        }
        this.userGroups.get(this.getCurrentUserId()).push(groupId);
        
        this.showNotification(`Joined group: ${group.name}`, 'success');
    }
    
    createGroupPost(groupId, content, media = null) {
        const group = this.groups.get(groupId);
        if (!group) return;
        
        if (!group.members.includes(this.getCurrentUserId())) {
            this.showNotification('You must be a member to post in this group', 'warning');
            return;
        }
        
        const post = {
            id: this.generateId(),
            groupId,
            creatorId: this.getCurrentUserId(),
            content,
            media,
            likes: [],
            comments: [],
            createdAt: Date.now()
        };
        
        group.posts.push(post.id);
        
        if (!this.groupPosts.has(groupId)) {
            this.groupPosts.set(groupId, []);
        }
        this.groupPosts.get(groupId).push(post);
        
        this.showNotification('Post created in group', 'success');
        return post;
    }
    
    showGroupInterface(group) {
        const modal = document.createElement('div');
        modal.className = 'group-modal';
        modal.innerHTML = `
            <div class="group-content">
                <div class="group-header">
                    <h3>${group.name}</h3>
                    <button class="close-btn" onclick="this.closest('.group-modal').remove()">×</button>
                </div>
                <div class="group-info">
                    <p>${group.description}</p>
                    <p><strong>Members:</strong> ${group.members.length}</p>
                    <p><strong>Privacy:</strong> ${group.privacy}</p>
                </div>
                <div class="group-actions">
                    <button class="btn btn-primary" onclick="groupSystem.createGroupPost('${group.id}')">
                        <i class="fas fa-plus"></i>
                        Create Post
                    </button>
                    <button class="btn btn-secondary" onclick="groupSystem.manageGroup('${group.id}')">
                        <i class="fas fa-cog"></i>
                        Manage Group
                    </button>
                </div>
                <div class="group-posts">
                    <h4>Recent Posts</h4>
                    <div class="posts-list">
                        ${this.renderGroupPosts(group.id)}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    renderGroupPosts(groupId) {
        const posts = this.groupPosts.get(groupId) || [];
        if (posts.length === 0) {
            return '<p>No posts yet. Be the first to post!</p>';
        }
        
        return posts.slice(-5).map(post => `
            <div class="group-post">
                <div class="post-header">
                    <strong>User ${post.creatorId}</strong>
                    <span>${new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="post-content">${post.content}</div>
                <div class="post-actions">
                    <button onclick="groupSystem.likePost('${post.id}')">
                        <i class="fas fa-heart"></i> ${post.likes.length}
                    </button>
                    <button onclick="groupSystem.commentOnPost('${post.id}')">
                        <i class="fas fa-comment"></i> ${post.comments.length}
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    createGroupPost(groupId) {
        const content = prompt('What would you like to post in the group?');
        if (content) {
            this.createGroupPost(groupId, content);
        }
    }
    
    manageGroup(groupId) {
    }
    
    likePost(postId) {
        // Implementation for liking posts
        this.showNotification('Post liked', 'success');
    }
    
    commentOnPost(postId) {
        const comment = prompt('Add a comment:');
        if (comment) {
            this.showNotification('Comment added', 'success');
        }
    }
    
    generateId() {
        return 'group_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    getCurrentUserId() {
        return localStorage.getItem('userId') || 'user_' + Math.random().toString(36).substr(2, 9);
    }
    
    showNotification(message, type) {
        console.log(`${type}: ${message}`);
    }
}

// Voice Space System
class SpaceSystem {
    constructor() {
        this.spaces = new Map();
        this.activeSpaces = new Set();
        this.spaceParticipants = new Map();
    }
    
    createSpace(title, description, isPublic = true) {
        const space = {
            id: this.generateId(),
            title,
            description,
            isPublic,
            creatorId: this.getCurrentUserId(),
            status: 'scheduled', // scheduled, live, ended
            scheduledFor: Date.now() + (5 * 60 * 1000), // 5 minutes from now
            startedAt: null,
            endedAt: null,
            participants: [this.getCurrentUserId()],
            speakers: [this.getCurrentUserId()],
            listeners: [],
            topics: [],
            recording: null
        };
        
        this.spaces.set(space.id, space);
        this.activeSpaces.add(space.id);
        
        this.showSpaceInterface(space);
        return space;
    }
    
    joinSpace(spaceId, asSpeaker = false) {
        const space = this.spaces.get(spaceId);
        if (!space) return;
        
        if (space.status === 'ended') {
            this.showNotification('This space has ended', 'warning');
            return;
        }
        
        if (asSpeaker && space.speakers.includes(this.getCurrentUserId())) {
            this.showNotification('You are already a speaker', 'info');
            return;
        }
        
        if (asSpeaker) {
            space.speakers.push(this.getCurrentUserId());
        } else {
            space.listeners.push(this.getCurrentUserId());
        }
        
        if (!space.participants.includes(this.getCurrentUserId())) {
            space.participants.push(this.getCurrentUserId());
        }
        
        this.showNotification(`Joined space: ${space.title}`, 'success');
    }
    
    startSpace(spaceId) {
        const space = this.spaces.get(spaceId);
        if (!space) return;
        
        if (space.creatorId !== this.getCurrentUserId()) {
            this.showNotification('Only the creator can start the space', 'warning');
            return;
        }
        
        space.status = 'live';
        space.startedAt = Date.now();
        
        // Request microphone access for audio
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                space.recording = stream;
                this.showNotification('Space started! You are now live.', 'success');
                this.updateSpaceStatus(spaceId);
            })
            .catch(error => {
                console.error('Error accessing microphone:', error);
                this.showNotification('Unable to access microphone', 'error');
            });
    }
    
    endSpace(spaceId) {
        const space = this.spaces.get(spaceId);
        if (!space) return;
        
        if (space.creatorId !== this.getCurrentUserId()) {
            this.showNotification('Only the creator can end the space', 'warning');
            return;
        }
        
        space.status = 'ended';
        space.endedAt = Date.now();
        
        if (space.recording) {
            space.recording.getTracks().forEach(track => track.stop());
            space.recording = null;
        }
        
        this.showNotification('Space ended', 'info');
        this.updateSpaceStatus(spaceId);
    }
    
    showSpaceInterface(space) {
        const modal = document.createElement('div');
        modal.className = 'space-modal';
        modal.innerHTML = `
            <div class="space-content">
                <div class="space-header">
                    <h3>${space.title}</h3>
                    <button class="close-btn" onclick="this.closest('.space-modal').remove()">×</button>
                </div>
                <div class="space-info">
                    <p>${space.description}</p>
                    <p><strong>Status:</strong> <span class="space-status">${space.status}</span></p>
                    <p><strong>Participants:</strong> ${space.participants.length}</p>
                    <p><strong>Speakers:</strong> ${space.speakers.length}</p>
                </div>
                <div class="space-actions">
                    ${space.creatorId === this.getCurrentUserId() ? `
                        <button class="btn btn-primary" onclick="spaceSystem.startSpace('${space.id}')" ${space.status === 'live' ? 'disabled' : ''}>
                            <i class="fas fa-play"></i>
                            Start Space
                        </button>
                        <button class="btn btn-danger" onclick="spaceSystem.endSpace('${space.id}')" ${space.status !== 'live' ? 'disabled' : ''}>
                            <i class="fas fa-stop"></i>
                            End Space
                        </button>
                    ` : `
                        <button class="btn btn-primary" onclick="spaceSystem.joinSpace('${space.id}', true)">
                            <i class="fas fa-microphone"></i>
                            Join as Speaker
                        </button>
                        <button class="btn btn-secondary" onclick="spaceSystem.joinSpace('${space.id}', false)">
                            <i class="fas fa-headphones"></i>
                            Join as Listener
                        </button>
                    `}
                </div>
                <div class="space-participants">
                    <h4>Participants</h4>
                    <div class="speakers-list">
                        <h5>Speakers</h5>
                        ${space.speakers.map(speakerId => `
                            <div class="participant speaker">
                                <i class="fas fa-microphone"></i>
                                <span>User ${speakerId}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="listeners-list">
                        <h5>Listeners</h5>
                        ${space.listeners.map(listenerId => `
                            <div class="participant listener">
                                <i class="fas fa-headphones"></i>
                                <span>User ${listenerId}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    updateSpaceStatus(spaceId) {
        const statusElement = document.querySelector(`[data-space-id="${spaceId}"] .space-status`);
        if (statusElement) {
            const space = this.spaces.get(spaceId);
            statusElement.textContent = space.status;
        }
    }
    
    generateId() {
        return 'space_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    getCurrentUserId() {
        return localStorage.getItem('userId') || 'user_' + Math.random().toString(36).substr(2, 9);
    }
    
    showNotification(message, type) {
        console.log(`${type}: ${message}`);
    }
}

// Challenge System
class ChallengeSystem {
    constructor() {
        this.challenges = new Map();
        this.userChallenges = new Map();
    }
    
    createChallenge(name, description, hashtag, duration = 7) {
        const challenge = {
            id: this.generateId(),
            name,
            description,
            hashtag,
            duration,
            creatorId: this.getCurrentUserId(),
            participants: [],
            submissions: [],
            startDate: Date.now(),
            endDate: Date.now() + (duration * 24 * 60 * 60 * 1000),
            prizes: [],
            rules: []
        };
        
        this.challenges.set(challenge.id, challenge);
        this.showNotification(`Challenge "${name}" created!`, 'success');
        
        return challenge;
    }
    
    joinChallenge(challengeId) {
        const challenge = this.challenges.get(challengeId);
        if (!challenge) return;
        
        if (challenge.participants.includes(this.getCurrentUserId())) {
            this.showNotification('You are already participating in this challenge', 'info');
            return;
        }
        
        challenge.participants.push(this.getCurrentUserId());
        
        if (!this.userChallenges.has(this.getCurrentUserId())) {
            this.userChallenges.set(this.getCurrentUserId(), []);
        }
        this.userChallenges.get(this.getCurrentUserId()).push(challengeId);
        
        this.showNotification(`Joined challenge: ${challenge.name}`, 'success');
    }
    
    submitToChallenge(challengeId, mediaUrl, caption) {
        const challenge = this.challenges.get(challengeId);
        if (!challenge) return;
        
        if (!challenge.participants.includes(this.getCurrentUserId())) {
            this.showNotification('You must join the challenge to submit', 'warning');
            return;
        }
        
        const submission = {
            id: this.generateId(),
            challengeId,
            participantId: this.getCurrentUserId(),
            mediaUrl,
            caption,
            likes: [],
            shares: [],
            createdAt: Date.now()
        };
        
        challenge.submissions.push(submission);
        this.showNotification('Submission added to challenge!', 'success');
        
        return submission;
    }
    
    generateId() {
        return 'challenge_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    getCurrentUserId() {
        return localStorage.getItem('userId') || 'user_' + Math.random().toString(36).substr(2, 9);
    }
    
    showNotification(message, type) {
        console.log(`${type}: ${message}`);
    }
}

// Collaboration System
class CollaborationSystem {
    constructor() {
        this.collaborations = new Map();
        this.collaborationRequests = new Map();
    }
    
    requestCollaboration(creatorId, projectType, description) {
        const request = {
            id: this.generateId(),
            requesterId: this.getCurrentUserId(),
            creatorId,
            projectType,
            description,
            status: 'pending',
            createdAt: Date.now()
        };
        
        if (!this.collaborationRequests.has(creatorId)) {
            this.collaborationRequests.set(creatorId, []);
        }
        this.collaborationRequests.get(creatorId).push(request);
        
        this.showNotification('Collaboration request sent!', 'success');
        return request;
    }
    
    acceptCollaboration(requestId) {
        const request = this.findCollaborationRequest(requestId);
        if (!request) return;
        
        request.status = 'accepted';
        
        const collaboration = {
            id: this.generateId(),
            participants: [request.requesterId, request.creatorId],
            projectType: request.projectType,
            description: request.description,
            status: 'active',
            createdAt: Date.now(),
            tasks: [],
            timeline: []
        };
        
        this.collaborations.set(collaboration.id, collaboration);
        this.showNotification('Collaboration accepted!', 'success');
        
        return collaboration;
    }
    
    findCollaborationRequest(requestId) {
        for (const requests of this.collaborationRequests.values()) {
            const request = requests.find(r => r.id === requestId);
            if (request) return request;
        }
        return null;
    }
    
    generateId() {
        return 'collab_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    getCurrentUserId() {
        return localStorage.getItem('userId') || 'user_' + Math.random().toString(36).substr(2, 9);
    }
    
    showNotification(message, type) {
        console.log(`${type}: ${message}`);
    }
}

// Event System
class EventSystem {
    constructor() {
        this.events = new Map();
        this.userEvents = new Map();
    }
    
    createEvent(title, description, date, location, isVirtual = false) {
        const event = {
            id: this.generateId(),
            title,
            description,
            date,
            location,
            isVirtual,
            creatorId: this.getCurrentUserId(),
            attendees: [this.getCurrentUserId()],
            maybe: [],
            declined: [],
            createdAt: Date.now(),
            status: 'upcoming'
        };
        
        this.events.set(event.id, event);
        this.showNotification(`Event "${title}" created!`, 'success');
        
        return event;
    }
    
    rsvpToEvent(eventId, response) {
        const event = this.events.get(eventId);
        if (!event) return;
        
        // Remove from all lists first
        event.attendees = event.attendees.filter(id => id !== this.getCurrentUserId());
        event.maybe = event.maybe.filter(id => id !== this.getCurrentUserId());
        event.declined = event.declined.filter(id => id !== this.getCurrentUserId());
        
        // Add to appropriate list
        switch (response) {
            case 'yes':
                event.attendees.push(this.getCurrentUserId());
                break;
            case 'maybe':
                event.maybe.push(this.getCurrentUserId());
                break;
            case 'no':
                event.declined.push(this.getCurrentUserId());
                break;
        }
        
        this.showNotification(`RSVP updated: ${response}`, 'success');
    }
    
    generateId() {
        return 'event_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    getCurrentUserId() {
        return localStorage.getItem('userId') || 'user_' + Math.random().toString(36).substr(2, 9);
    }
    
    showNotification(message, type) {
        console.log(`${type}: ${message}`);
    }
}

// Marketplace System
class MarketplaceSystem {
    constructor() {
        this.listings = new Map();
        this.userListings = new Map();
        this.categories = ['Digital Products', 'Physical Products', 'Services', 'Courses', 'Consulting'];
    }
    
    createListing(title, description, price, category, type = 'sale') {
        const listing = {
            id: this.generateId(),
            title,
            description,
            price,
            category,
            type, // sale, auction, free
            creatorId: this.getCurrentUserId(),
            status: 'active',
            images: [],
            tags: [],
            createdAt: Date.now(),
            views: 0,
            likes: [],
            inquiries: []
        };
        
        this.listings.set(listing.id, listing);
        
        if (!this.userListings.has(this.getCurrentUserId())) {
            this.userListings.set(this.getCurrentUserId(), []);
        }
        this.userListings.get(this.getCurrentUserId()).push(listing.id);
        
        this.showNotification(`Listing "${title}" created!`, 'success');
        return listing;
    }
    
    searchListings(query, category = null, priceRange = null) {
        let results = Array.from(this.listings.values());
        
        if (query) {
            results = results.filter(listing => 
                listing.title.toLowerCase().includes(query.toLowerCase()) ||
                listing.description.toLowerCase().includes(query.toLowerCase()) ||
                listing.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
            );
        }
        
        if (category) {
            results = results.filter(listing => listing.category === category);
        }
        
        if (priceRange) {
            results = results.filter(listing => 
                listing.price >= priceRange.min && listing.price <= priceRange.max
            );
        }
        
        return results;
    }
    
    contactSeller(listingId, message) {
        const listing = this.listings.get(listingId);
        if (!listing) return;
        
        const inquiry = {
            id: this.generateId(),
            listingId,
            buyerId: this.getCurrentUserId(),
            message,
            createdAt: Date.now(),
            status: 'unread'
        };
        
        listing.inquiries.push(inquiry);
        this.showNotification('Message sent to seller!', 'success');
        
        return inquiry;
    }
    
    generateId() {
        return 'listing_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    getCurrentUserId() {
        return localStorage.getItem('userId') || 'user_' + Math.random().toString(36).substr(2, 9);
    }
    
    showNotification(message, type) {
        console.log(`${type}: ${message}`);
    }
}

// Global instances
let socialFeatures = null;
let duetSystem = null;
let storySystem = null;
let groupSystem = null;
let spaceSystem = null;
let challengeSystem = null;
let collaborationSystem = null;
let eventSystem = null;
let marketplaceSystem = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    socialFeatures = new SocialFeaturesSystem();
    duetSystem = socialFeatures.features.duets;
    storySystem = socialFeatures.features.stories;
    groupSystem = socialFeatures.features.groups;
    spaceSystem = socialFeatures.features.spaces;
    challengeSystem = socialFeatures.features.challenges;
    collaborationSystem = socialFeatures.features.collaborations;
    eventSystem = socialFeatures.features.events;
    marketplaceSystem = socialFeatures.features.marketplace;
    
    console.log('All social features initialized');
});

// Export for use in other scripts
window.SocialFeaturesSystem = SocialFeaturesSystem;
window.socialFeatures = socialFeatures;
