// Fully Functional Social Features System for Amplifi

class FunctionalSocialFeatures {
    constructor() {
        console.log('FunctionalSocialFeatures constructor called');
        this.init();
        console.log('FunctionalSocialFeatures constructor completed');
    }
    
    init() {
        console.log('FunctionalSocialFeatures.init() called');
        this.setupEventListeners();
        this.loadDemoData();
        console.log('✅ Functional Social Features initialized');
    }
    
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Feature buttons with data attributes (legacy support)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('feature-btn') || e.target.closest('.feature-btn')) {
                const btn = e.target.classList.contains('feature-btn') ? e.target : e.target.closest('.feature-btn');
                const action = btn.dataset.action;
                const feature = btn.dataset.feature;
                
                if (action && feature) {
                    console.log('Feature button clicked:', action, feature);
                    this[action](feature);
                }
            }
        });
        
        // Demo items (direct onclick handlers)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.demo-item')) {
                const demoItem = e.target.closest('.demo-item');
                // Demo items now use direct onclick handlers, so no need for additional event handling here
            }
        });
        
        console.log('✅ Event listeners set up');
    }
    
    loadDemoData() {
        console.log('Loading demo data...');
        
        // Load demo challenges
        this.challenges = [
            {
                id: 'challenge_1',
                title: 'Dance Challenge',
                description: 'Show us your best dance moves!',
                hashtag: '#DanceChallenge',
                participants: 1250,
                submissions: 89,
                endDate: Date.now() + (7 * 24 * 60 * 60 * 1000)
            },
            {
                id: 'challenge_2',
                title: 'Cooking Master',
                description: 'Create your signature dish!',
                hashtag: '#CookingMaster',
                participants: 890,
                submissions: 156,
                endDate: Date.now() + (14 * 24 * 60 * 60 * 1000)
            }
        ];
        
        // Load demo groups
        this.groups = [
            {
                id: 'group_1',
                name: 'Gaming Enthusiasts',
                description: 'All things gaming - from casual to competitive',
                members: 2340,
                posts: 156,
                category: 'Gaming'
            },
            {
                id: 'group_2',
                name: 'Creative Artists',
                description: 'Share your art, get inspired, collaborate',
                members: 1890,
                posts: 234,
                category: 'Art'
            }
        ];
        
        console.log('✅ Demo data loaded:', { challenges: this.challenges.length, groups: this.groups.length });
    }
    
    // Modal Actions
    showModal(feature) {
        console.log('showModal called with feature:', feature); // Debug log
        
        if (!modalManager) {
            console.error('Modal manager not available');
            this.showNotification('Modal system not available. Please refresh the page.', 'error');
            return;
        }
        
        switch (feature) {
            case 'duet':
                this.showDuetModal();
                break;
            case 'story':
                this.showStoryModal();
                break;
            case 'group':
                this.showGroupModal();
                break;
            case 'space':
                this.showSpaceModal();
                break;
            case 'challenge':
                this.showChallengeModal();
                break;
            case 'collaboration':
                this.showCollaborationModal();
                break;
            case 'event':
                this.showEventModal();
                break;
            case 'marketplace':
                this.showMarketplaceModal();
                break;
            default:
                console.error('Unknown feature:', feature);
                this.showNotification(`Feature "${feature}" not implemented yet.`, 'warning');
        }
    }
    
    // Duet Modal
    showDuetModal() {
        console.log('showDuetModal called'); // Debug log
        
        if (!modalManager) {
            console.error('Modal manager not available in showDuetModal');
            this.showNotification('Modal system not available. Please refresh the page.', 'error');
            return;
        }
        
        const content = `
            <div class="modal-section">
                <h4><i class="fas fa-users"></i> Create Duet</h4>
                <p>Create a collaborative video with another creator's content.</p>
                
                <div class="form-group">
                    <label>Original Video URL</label>
                    <input type="url" id="duetVideoUrl" placeholder="https://example.com/video" />
                </div>
                
                <div class="form-group">
                    <label>Duet Title</label>
                    <input type="text" id="duetTitle" placeholder="My Amazing Duet" />
                </div>
                
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="duetDescription" placeholder="Describe your duet..."></textarea>
                </div>
                
                <div class="form-group">
                    <label>Layout Style</label>
                    <select id="duetLayout">
                        <option value="side-by-side">Side by Side</option>
                        <option value="picture-in-picture">Picture in Picture</option>
                        <option value="split-screen">Split Screen</option>
                    </select>
                </div>
                
                <div class="duet-layout" id="duetPreview">
                    <div class="original-video">
                        <div class="recording-placeholder">
                            <i class="fas fa-video"></i>
                            <p>Original Video</p>
                        </div>
                    </div>
                    <div class="duet-video">
                        <div class="recording-placeholder">
                            <i class="fas fa-video"></i>
                            <p>Your Video</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const footer = `
            <button class="modal-btn secondary" onclick="socialFeatures.closeModal()">Cancel</button>
            <button class="modal-btn" onclick="socialFeatures.createDuet()">Create Duet</button>
        `;
        
        try {
            const modalId = modalManager.showModal(content, {
                title: 'Create Duet',
                size: 'large',
                footer: footer
            });
            console.log('✅ Duet modal created with ID:', modalId);
        } catch (error) {
            console.error('❌ Error creating duet modal:', error);
            this.showNotification('Error creating modal: ' + error.message, 'error');
        }
    }
    
    // Story Modal
    showStoryModal() {
        console.log('showStoryModal called'); // Debug log
        
        if (!modalManager) {
            console.error('Modal manager not available in showStoryModal');
            this.showNotification('Modal system not available. Please refresh the page.', 'error');
            return;
        }
        
        const content = `
            <div class="modal-section">
                <h4><i class="fas fa-circle"></i> Create Story</h4>
                <p>Share a temporary story that disappears in 24 hours.</p>
                
                <div class="story-canvas" id="storyCanvas">
                    <div class="recording-placeholder">
                        <i class="fas fa-image"></i>
                        <p>Add photos or videos to your story</p>
                    </div>
                </div>
                
                <div class="story-tools">
                    <div class="story-tool" onclick="socialFeatures.addStoryMedia()">
                        <i class="fas fa-camera"></i>
                        Media
                    </div>
                    <div class="story-tool" onclick="socialFeatures.addStoryFilter()">
                        <i class="fas fa-magic"></i>
                        Filters
                    </div>
                    <div class="story-tool" onclick="socialFeatures.addStorySticker()">
                        <i class="fas fa-smile"></i>
                        Stickers
                    </div>
                    <div class="story-tool" onclick="socialFeatures.addStoryText()">
                        <i class="fas fa-font"></i>
                        Text
                    </div>
                    <div class="story-tool" onclick="socialFeatures.addStoryMusic()">
                        <i class="fas fa-music"></i>
                        Music
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Story Caption</label>
                    <textarea id="storyCaption" placeholder="What's on your mind?"></textarea>
                </div>
                
                <div class="form-group">
                    <label>Privacy</label>
                    <select id="storyPrivacy">
                        <option value="public">Public</option>
                        <option value="friends">Friends Only</option>
                        <option value="close-friends">Close Friends</option>
                    </select>
                </div>
            </div>
        `;
        
        const footer = `
            <button class="modal-btn secondary" onclick="socialFeatures.closeModal()">Cancel</button>
            <button class="modal-btn success" onclick="socialFeatures.publishStory()">Publish Story</button>
        `;
        
        try {
            const modalId = modalManager.showModal(content, {
                title: 'Create Story',
                size: 'large',
                footer: footer
            });
            console.log('✅ Story modal created with ID:', modalId);
        } catch (error) {
            console.error('❌ Error creating story modal:', error);
            this.showNotification('Error creating modal: ' + error.message, 'error');
        }
    }
    
    // Group Modal
    showGroupModal() {
        const content = `
            <div class="modal-section">
                <h4><i class="fas fa-users"></i> Create Community Group</h4>
                <p>Build a community around shared interests and passions.</p>
                
                <div class="form-group">
                    <label>Group Name</label>
                    <input type="text" id="groupName" placeholder="Enter group name" />
                </div>
                
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="groupDescription" placeholder="Describe your group..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Category</label>
                        <select id="groupCategory">
                            <option value="gaming">Gaming</option>
                            <option value="music">Music</option>
                            <option value="art">Art</option>
                            <option value="education">Education</option>
                            <option value="technology">Technology</option>
                            <option value="lifestyle">Lifestyle</option>
                            <option value="business">Business</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Privacy</label>
                        <select id="groupPrivacy">
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                            <option value="secret">Secret</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Group Rules</label>
                    <textarea id="groupRules" placeholder="Set community guidelines..."></textarea>
                </div>
                
                <div class="form-group">
                    <label>Tags</label>
                    <input type="text" id="groupTags" placeholder="gaming, community, fun" />
                </div>
            </div>
        `;
        
        const footer = `
            <button class="modal-btn secondary" onclick="socialFeatures.closeModal()">Cancel</button>
            <button class="modal-btn success" onclick="socialFeatures.createGroup()">Create Group</button>
        `;
        
        modalManager.showModal(content, {
            title: 'Create Community Group',
            size: 'medium',
            footer: footer
        });
    }
    
    // Space Modal
    showSpaceModal() {
        const content = `
            <div class="modal-section">
                <h4><i class="fas fa-microphone"></i> Create Voice Space</h4>
                <p>Host an audio-only conversation with your community.</p>
                
                <div class="form-group">
                    <label>Space Title</label>
                    <input type="text" id="spaceTitle" placeholder="Enter space title" />
                </div>
                
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="spaceDescription" placeholder="What will you discuss?"></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Category</label>
                        <select id="spaceCategory">
                            <option value="general">General Discussion</option>
                            <option value="qanda">Q&A Session</option>
                            <option value="interview">Interview</option>
                            <option value="debate">Debate</option>
                            <option value="workshop">Workshop</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Duration</label>
                        <select id="spaceDuration">
                            <option value="30">30 minutes</option>
                            <option value="60">1 hour</option>
                            <option value="90">1.5 hours</option>
                            <option value="120">2 hours</option>
                            <option value="unlimited">Unlimited</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Start Time</label>
                    <input type="datetime-local" id="spaceStartTime" />
                </div>
                
                <div class="form-group">
                    <label>Privacy</label>
                    <select id="spacePrivacy">
                        <option value="public">Public</option>
                        <option value="unlisted">Unlisted</option>
                        <option value="private">Private</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Topics</label>
                    <input type="text" id="spaceTopics" placeholder="gaming, community, tips" />
                </div>
            </div>
        `;
        
        const footer = `
            <button class="modal-btn secondary" onclick="socialFeatures.closeModal()">Cancel</button>
            <button class="modal-btn success" onclick="socialFeatures.createSpace()">Create Space</button>
        `;
        
        modalManager.showModal(content, {
            title: 'Create Voice Space',
            size: 'medium',
            footer: footer
        });
    }
    
    // Challenge Modal
    showChallengeModal() {
        const content = `
            <div class="modal-section">
                <h4><i class="fas fa-trophy"></i> Create Viral Challenge</h4>
                <p>Start a challenge that can go viral across the platform.</p>
                
                <div class="form-group">
                    <label>Challenge Name</label>
                    <input type="text" id="challengeName" placeholder="Enter challenge name" />
                </div>
                
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="challengeDescription" placeholder="Describe the challenge..."></textarea>
                </div>
                
                <div class="form-group">
                    <label>Hashtag</label>
                    <input type="text" id="challengeHashtag" placeholder="#ChallengeName" />
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Duration</label>
                        <select id="challengeDuration">
                            <option value="7">1 week</option>
                            <option value="14">2 weeks</option>
                            <option value="30">1 month</option>
                            <option value="60">2 months</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Category</label>
                        <select id="challengeCategory">
                            <option value="dance">Dance</option>
                            <option value="comedy">Comedy</option>
                            <option value="talent">Talent</option>
                            <option value="food">Food</option>
                            <option value="fashion">Fashion</option>
                            <option value="fitness">Fitness</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Rules</label>
                    <textarea id="challengeRules" placeholder="Set challenge rules..."></textarea>
                </div>
                
                <div class="form-group">
                    <label>Prizes (Optional)</label>
                    <textarea id="challengePrizes" placeholder="What can participants win?"></textarea>
                </div>
            </div>
        `;
        
        const footer = `
            <button class="modal-btn secondary" onclick="socialFeatures.closeModal()">Cancel</button>
            <button class="modal-btn success" onclick="socialFeatures.createChallenge()">Launch Challenge</button>
        `;
        
        modalManager.showModal(content, {
            title: 'Create Viral Challenge',
            size: 'medium',
            footer: footer
        });
    }
    
    // Collaboration Modal
    showCollaborationModal() {
        const content = `
            <div class="modal-section">
                <h4><i class="fas fa-handshake"></i> Request Collaboration</h4>
                <p>Connect with other creators for collaborative projects.</p>
                
                <div class="form-group">
                    <label>Creator Username</label>
                    <input type="text" id="collabCreator" placeholder="Enter creator username" />
                </div>
                
                <div class="form-group">
                    <label>Project Type</label>
                    <select id="collabType">
                        <option value="video">Video Collaboration</option>
                        <option value="live">Live Stream</option>
                        <option value="challenge">Challenge</option>
                        <option value="series">Content Series</option>
                        <option value="event">Live Event</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Project Description</label>
                    <textarea id="collabDescription" placeholder="Describe your collaboration idea..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Timeline</label>
                        <select id="collabTimeline">
                            <option value="1">1 week</option>
                            <option value="2">2 weeks</option>
                            <option value="4">1 month</option>
                            <option value="8">2 months</option>
                            <option value="12">3 months</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Compensation</label>
                        <select id="collabCompensation">
                            <option value="none">No compensation</option>
                            <option value="revenue-share">Revenue sharing</option>
                            <option value="fixed-rate">Fixed rate</option>
                            <option value="barter">Barter/Trade</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Contact Method</label>
                    <input type="text" id="collabContact" placeholder="Email or preferred contact method" />
                </div>
            </div>
        `;
        
        const footer = `
            <button class="modal-btn secondary" onclick="socialFeatures.closeModal()">Cancel</button>
            <button class="modal-btn success" onclick="socialFeatures.requestCollaboration()">Send Request</button>
        `;
        
        modalManager.showModal(content, {
            title: 'Request Collaboration',
            size: 'medium',
            footer: footer
        });
    }
    
    // Event Modal
    showEventModal() {
        const content = `
            <div class="modal-section">
                <h4><i class="fas fa-calendar"></i> Create Live Event</h4>
                <p>Organize and host live events for your community.</p>
                
                <div class="form-group">
                    <label>Event Title</label>
                    <input type="text" id="eventTitle" placeholder="Enter event title" />
                </div>
                
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="eventDescription" placeholder="Describe your event..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Event Date</label>
                        <input type="date" id="eventDate" />
                    </div>
                    
                    <div class="form-group">
                        <label>Event Time</label>
                        <input type="time" id="eventTime" />
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Event Type</label>
                    <select id="eventType">
                        <option value="live-stream">Live Stream</option>
                        <option value="qanda">Q&A Session</option>
                        <option value="workshop">Workshop</option>
                        <option value="meetup">Community Meetup</option>
                        <option value="launch">Product Launch</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Location</label>
                    <input type="text" id="eventLocation" placeholder="Virtual or physical location" />
                </div>
                
                <div class="form-group">
                    <label>Privacy</label>
                    <select id="eventPrivacy">
                        <option value="public">Public</option>
                        <option value="unlisted">Unlisted</option>
                        <option value="private">Private</option>
                    </select>
                </div>
            </div>
        `;
        
        const footer = `
            <button class="modal-btn secondary" onclick="socialFeatures.closeModal()">Cancel</button>
            <button class="modal-btn success" onclick="socialFeatures.createEvent()">Create Event</button>
        `;
        
        modalManager.showModal(content, {
            title: 'Create Live Event',
            size: 'medium',
            footer: footer
        });
    }
    
    // Marketplace Modal
    showMarketplaceModal() {
        const content = `
            <div class="modal-section">
                <h4><i class="fas fa-store"></i> Create Marketplace Listing</h4>
                <p>Sell your products and services to the Amplifi community.</p>
                
                <div class="form-group">
                    <label>Listing Title</label>
                    <input type="text" id="listingTitle" placeholder="Enter listing title" />
                </div>
                
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="listingDescription" placeholder="Describe your product or service..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Category</label>
                        <select id="listingCategory">
                            <option value="digital">Digital Products</option>
                            <option value="physical">Physical Products</option>
                            <option value="service">Services</option>
                            <option value="course">Courses</option>
                            <option value="consulting">Consulting</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Price</label>
                        <input type="number" id="listingPrice" placeholder="0.00" step="0.01" min="0" />
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Tags</label>
                    <input type="text" id="listingTags" placeholder="gaming, tutorial, premium" />
                </div>
                
                <div class="form-group">
                    <label>Contact Information</label>
                    <input type="text" id="listingContact" placeholder="Email or contact method" />
                </div>
            </div>
        `;
        
        const footer = `
            <button class="modal-btn secondary" onclick="socialFeatures.closeModal()">Cancel</button>
            <button class="modal-btn success" onclick="socialFeatures.createListing()">Create Listing</button>
        `;
        
        modalManager.showModal(content, {
            title: 'Create Marketplace Listing',
            size: 'medium',
            footer: footer
        });
    }
    
    // Action Functions
    createDuet() {
        console.log('Creating duet...'); // Debug log
        const videoUrl = document.getElementById('duetVideoUrl')?.value;
        const title = document.getElementById('duetTitle')?.value;
        const description = document.getElementById('duetDescription')?.value;
        const layout = document.getElementById('duetLayout')?.value;
        
        if (!videoUrl || !title) {
            this.showNotification('Please fill in all required fields', 'warning');
            return;
        }
        
        // Simulate duet creation
        this.showNotification('Duet created successfully!', 'success');
        this.closeModal();
        
        // Update layout preview
        const preview = document.getElementById('duetPreview');
        if (preview) {
            preview.className = `duet-layout ${layout}`;
        }
    }
    
    publishStory() {
        const caption = document.getElementById('storyCaption').value;
        const privacy = document.getElementById('storyPrivacy').value;
        
        // Simulate story publishing
        this.showNotification('Story published successfully!', 'success');
        this.closeModal();
    }
    
    createGroup() {
        const name = document.getElementById('groupName').value;
        const description = document.getElementById('groupDescription').value;
        const category = document.getElementById('groupCategory').value;
        const privacy = document.getElementById('groupPrivacy').value;
        const rules = document.getElementById('groupRules').value;
        const tags = document.getElementById('groupTags').value;
        
        if (!name || !description) {
            this.showNotification('Please fill in all required fields', 'warning');
            return;
        }
        
        // Simulate group creation
        this.showNotification('Community group created successfully!', 'success');
        this.closeModal();
    }
    
    createSpace() {
        const title = document.getElementById('spaceTitle').value;
        const description = document.getElementById('spaceDescription').value;
        const category = document.getElementById('spaceCategory').value;
        const duration = document.getElementById('spaceDuration').value;
        const startTime = document.getElementById('spaceStartTime').value;
        const privacy = document.getElementById('spacePrivacy').value;
        const topics = document.getElementById('spaceTopics').value;
        
        if (!title || !description) {
            this.showNotification('Please fill in all required fields', 'warning');
            return;
        }
        
        // Simulate space creation
        this.showNotification('Voice space created successfully!', 'success');
        this.closeModal();
    }
    
    createChallenge() {
        const name = document.getElementById('challengeName').value;
        const description = document.getElementById('challengeDescription').value;
        const hashtag = document.getElementById('challengeHashtag').value;
        const duration = document.getElementById('challengeDuration').value;
        const category = document.getElementById('challengeCategory').value;
        const rules = document.getElementById('challengeRules').value;
        const prizes = document.getElementById('challengePrizes').value;
        
        if (!name || !description || !hashtag) {
            this.showNotification('Please fill in all required fields', 'warning');
            return;
        }
        
        // Simulate challenge creation
        this.showNotification('Viral challenge launched successfully!', 'success');
        this.closeModal();
    }
    
    requestCollaboration() {
        const creator = document.getElementById('collabCreator').value;
        const type = document.getElementById('collabType').value;
        const description = document.getElementById('collabDescription').value;
        const timeline = document.getElementById('collabTimeline').value;
        const compensation = document.getElementById('collabCompensation').value;
        const contact = document.getElementById('collabContact').value;
        
        if (!creator || !description) {
            this.showNotification('Please fill in all required fields', 'warning');
            return;
        }
        
        // Simulate collaboration request
        this.showNotification('Collaboration request sent successfully!', 'success');
        this.closeModal();
    }
    
    createEvent() {
        const title = document.getElementById('eventTitle').value;
        const description = document.getElementById('eventDescription').value;
        const date = document.getElementById('eventDate').value;
        const time = document.getElementById('eventTime').value;
        const type = document.getElementById('eventType').value;
        const location = document.getElementById('eventLocation').value;
        const privacy = document.getElementById('eventPrivacy').value;
        
        if (!title || !description || !date || !time) {
            this.showNotification('Please fill in all required fields', 'warning');
            return;
        }
        
        // Simulate event creation
        this.showNotification('Live event created successfully!', 'success');
        this.closeModal();
    }
    
    createListing() {
        const title = document.getElementById('listingTitle').value;
        const description = document.getElementById('listingDescription').value;
        const category = document.getElementById('listingCategory').value;
        const price = document.getElementById('listingPrice').value;
        const tags = document.getElementById('listingTags').value;
        const contact = document.getElementById('listingContact').value;
        
        if (!title || !description || !price) {
            this.showNotification('Please fill in all required fields', 'warning');
            return;
        }
        
        // Simulate listing creation
        this.showNotification('Marketplace listing created successfully!', 'success');
        this.closeModal();
    }
    
    // Utility Functions
    closeModal() {
        modalManager.closeTopModal();
    }
    
    showNotification(message, type = 'info') {
        console.log('Showing notification:', message, type); // Debug log
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        // Add error notification styling
        if (type === 'error') {
            notification.classList.add('notification-error');
        }
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.transition = 'all 0.3s ease';
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    // Story Tool Functions
    addStoryMedia() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/*';
        input.multiple = true;
        
        input.onchange = (e) => {
            const files = Array.from(e.target.files);
            this.showNotification(`${files.length} media files added to story`, 'success');
        };
        
        input.click();
    }
    
    addStoryFilter() {
        const filters = ['Normal', 'Vintage', 'Black & White', 'Sepia', 'Vivid', 'Cool', 'Warm'];
        const filter = prompt('Choose filter:\n' + filters.join('\n'));
        
        if (filter && filters.includes(filter)) {
            this.showNotification(`Filter "${filter}" applied`, 'success');
        }
    }
    
    addStorySticker() {
        const stickers = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🔥', '🎉', '👏'];
        const sticker = prompt('Choose sticker:\n' + stickers.join(' '));
        
        if (sticker && stickers.includes(sticker)) {
            this.showNotification('Sticker added to story', 'success');
        }
    }
    
    addStoryText() {
        const text = prompt('Enter text for your story:');
        if (text) {
            this.showNotification('Text added to story', 'success');
        }
    }
    
    addStoryMusic() {
        const music = prompt('Enter music track name:');
        if (music) {
            this.showNotification(`Music "${music}" added to story`, 'success');
        }
    }
    
    // Debug method to check status
    getStatus() {
        return {
            challenges: this.challenges?.length || 0,
            groups: this.groups?.length || 0,
            modalManager: typeof modalManager !== 'undefined',
            modalManagerStatus: modalManager ? modalManager.getStatus() : 'Not Available'
        };
    }
}

// Global instance
let socialFeatures = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing FunctionalSocialFeatures...');
    socialFeatures = new FunctionalSocialFeatures();
    
    // Wait a bit for modal manager to initialize
    setTimeout(() => {
        if (typeof modalManager !== 'undefined') {
            console.log('✅ Modal manager is available');
        } else {
            console.error('❌ Modal manager is not available');
        }
        
        if (socialFeatures) {
            console.log('✅ Social features initialized successfully');
        } else {
            console.error('❌ Social features failed to initialize');
        }
    }, 100);
});

// Export for use in other scripts
window.FunctionalSocialFeatures = FunctionalSocialFeatures;
window.socialFeatures = socialFeatures;
