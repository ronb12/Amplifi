/* global db, auth, firebase, storage */
// Live Streaming Page JavaScript
class LivePage {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.currentStream = null;
        this.mediaStream = null;
        this.streamTimer = null;
        this.viewerCount = 0;
        this.isStreaming = false;
        this.selectedThumbnailFile = null;
        
        this.init();
    }

    async init() {
        try {
            console.log('LivePage: Initializing...');
            await this.setupAuthStateListener();
            this.setupEventListeners();
            this.loadActiveStreams();
            this.loadHistoryStreams(true);
            console.log('LivePage: Initialization complete');
        } catch (error) {
            console.error('LivePage: Initialization error:', error);
        }
    }

    async setupAuthStateListener() {
        try {
            auth.onAuthStateChanged(async (user) => {
                try {
                    if (user) {
                        console.log('LivePage: User authenticated:', user.uid);
                        this.currentUser = user;
                        await this.loadUserProfile();
                        this.updateUIForAuthenticatedUser();
                    } else {
                        console.log('LivePage: User not authenticated');
                        this.currentUser = null;
                        this.updateUIForUnauthenticatedUser();
                    }
                    // Only check authentication after auth state is known
                    this.checkAuthentication();
                } catch (error) {
                    console.error('LivePage: Auth state change error:', error);
                }
            });
        } catch (error) {
            console.error('LivePage: Auth state listener setup error:', error);
        }
    }

    async loadUserProfile() {
        try {
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
    }

    checkAuthentication() {
        if (!this.currentUser) {
            window.location.href = 'index.html';
        }
    }

    setupEventListeners() {
        // Start live stream button
        const startLiveBtn = document.getElementById('startLiveBtn');
        if (startLiveBtn) {
            startLiveBtn.addEventListener('click', () => {
                this.showLiveSetupModal();
            });
        }

        // Setup AI Features
        this.setupAIFeatures();

        // Schedule stream button
        const scheduleStreamBtn = document.getElementById('scheduleStreamBtn');
        if (scheduleStreamBtn) {
            scheduleStreamBtn.addEventListener('click', () => {
                this.showScheduleStreamModal();
            });
        }

        // Start 24/7 stream button
        const start247Btn = document.getElementById('start247Btn');
        if (start247Btn) {
            start247Btn.addEventListener('click', () => {
                this.start247Stream();
            });
        }

        // 24/7 status button
        const status247Btn = document.getElementById('status247Btn');
        if (status247Btn) {
            status247Btn.addEventListener('click', () => {
                this.show247Status();
            });
        }

        // Live setup form
        const liveSetupForm = document.getElementById('liveSetupForm');
        if (liveSetupForm) {
            liveSetupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.startLiveStream();
            });
        }

        // Cancel live setup
        const cancelLiveSetup = document.getElementById('cancelLiveSetup');
        if (cancelLiveSetup) {
            cancelLiveSetup.addEventListener('click', () => {
                this.closeLiveSetupModal();
            });
        }

        // End stream button
        const endStreamBtn = document.getElementById('endStreamBtn');
        if (endStreamBtn) {
            endStreamBtn.addEventListener('click', () => {
                this.endLiveStream();
            });
        }

        // Toggle chat button
        const toggleChatBtn = document.getElementById('toggleChatBtn');
        if (toggleChatBtn) {
            toggleChatBtn.addEventListener('click', () => {
                this.toggleChat();
            });
        }

        // Live chat form
        const liveChatForm = document.getElementById('liveChatForm');
        if (liveChatForm) {
            liveChatForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sendLiveChatMessage();
            });
        }

        // Modal close buttons
        const closeBtns = document.querySelectorAll('.close');
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModals();
            });
        });

        // Modal background clicks
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModals();
            }
        });

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }

        const thumbnailInput = document.getElementById('streamThumbnail');
        const thumbnailPreview = document.getElementById('thumbnailPreview');
        if (thumbnailInput && thumbnailPreview) {
            thumbnailInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                this.selectedThumbnailFile = file;
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        thumbnailPreview.innerHTML = `<img src="${ev.target.result}" alt="Thumbnail Preview" style="max-width:220px;max-height:120px;border-radius:0.7rem;box-shadow:0 2px 8px rgba(0,0,0,0.08);">`;
                    };
                    reader.readAsDataURL(file);
                } else {
                    thumbnailPreview.innerHTML = '';
                }
            });
        }

        const tabLiveNow = document.getElementById('tabLiveNow');
        const tabPastStreams = document.getElementById('tabPastStreams');
        const liveNowSection = document.getElementById('liveNowSection');
        const pastStreamsSection = document.getElementById('pastStreamsSection');
        if (tabLiveNow && tabPastStreams && liveNowSection && pastStreamsSection) {
            tabLiveNow.addEventListener('click', () => {
                tabLiveNow.classList.add('active');
                tabPastStreams.classList.remove('active');
                liveNowSection.style.display = '';
                pastStreamsSection.style.display = 'none';
            });
            tabPastStreams.addEventListener('click', () => {
                tabPastStreams.classList.add('active');
                tabLiveNow.classList.remove('active');
                pastStreamsSection.style.display = '';
                liveNowSection.style.display = 'none';
            });
        }

        // Emoji picker logic
        const emojiBtn = document.getElementById('emojiPickerBtn');
        const emojiPicker = document.getElementById('emojiPicker');
        const chatInput = document.getElementById('liveChatInput');
        if (emojiBtn && emojiPicker && chatInput) {
            const emojis = ['😊','😂','😍','👍','🔥','🎉','😢','😮','😡','❤️','🙏','��','😎','🤔','🙌'];
            emojiPicker.innerHTML = emojis.map(e => `<span class='emoji' style='font-size:1.5rem;cursor:pointer;padding:0 4px;'>${e}</span>`).join('');
            emojiBtn.addEventListener('click', (e) => {
                emojiPicker.style.display = emojiPicker.style.display === 'block' ? 'none' : 'block';
                e.stopPropagation();
            });
            emojiPicker.addEventListener('click', (e) => {
                if (e.target.classList.contains('emoji')) {
                    chatInput.value += e.target.textContent;
                    emojiPicker.style.display = 'none';
                    chatInput.focus();
                }
            });
            document.addEventListener('click', (e) => {
                if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
                    emojiPicker.style.display = 'none';
                }
            });
        }

        // Infinite scroll for history
        const historyContainer = document.getElementById('historyStreams');
        if (historyContainer) {
            historyContainer.addEventListener('scroll', () => {
                if (historyContainer.scrollTop + historyContainer.clientHeight >= historyContainer.scrollHeight - 50) {
                    this.loadHistoryStreams(false);
                }
            });
        }
    }

    showLiveSetupModal() {
        const modal = document.getElementById('liveSetupModal');
        if (modal) {
            modal.classList.add('active');
            this.setupThumbnailUpload();
            // Also setup AI features when modal is shown (in case they weren't found earlier)
            setTimeout(() => {
                this.setupAIFeatures();
            }, 100);
            
            // Additional fallback for AI features
            setTimeout(() => {
                this.setupAIFeatures();
            }, 500);
        }
    }

    closeLiveSetupModal() {
        const modal = document.getElementById('liveSetupModal');
        if (modal) {
            modal.classList.remove('active');
            this.resetForm();
        }
    }

    setupThumbnailUpload() {
        const uploadArea = document.getElementById('thumbnailUploadArea');
        const fileInput = document.getElementById('streamThumbnail');
        const preview = document.getElementById('thumbnailPreview');

        if (uploadArea && fileInput) {
            // Click to upload
            uploadArea.addEventListener('click', () => {
                fileInput.click();
            });

            // Drag and drop
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = '#6366f1';
                uploadArea.style.background = '#f0f4ff';
            });

            uploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = '#d1d5db';
                uploadArea.style.background = '#fff';
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = '#d1d5db';
                uploadArea.style.background = '#fff';
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleThumbnailFile(files[0]);
                }
            });

            // File input change
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleThumbnailFile(e.target.files[0]);
                }
            });
        }
    }

    setupAIFeatures() {
        // AI Title Generator
        const generateTitleBtn = document.getElementById('generateTitleBtn');
        if (generateTitleBtn) {
            // Remove existing listeners to avoid duplicates
            generateTitleBtn.replaceWith(generateTitleBtn.cloneNode(true));
            const newGenerateTitleBtn = document.getElementById('generateTitleBtn');
            newGenerateTitleBtn.addEventListener('click', () => this.generateAITitle());
        }

        // AI Description Generator
        const generateDescBtn = document.getElementById('generateDescBtn');
        if (generateDescBtn) {
            generateDescBtn.replaceWith(generateDescBtn.cloneNode(true));
            const newGenerateDescBtn = document.getElementById('generateDescBtn');
            newGenerateDescBtn.addEventListener('click', () => this.generateAIDescription());
        }

        // AI Music Selection
        const selectMusicBtn = document.getElementById('selectMusicBtn');
        if (selectMusicBtn) {
            selectMusicBtn.replaceWith(selectMusicBtn.cloneNode(true));
            const newSelectMusicBtn = document.getElementById('selectMusicBtn');
            newSelectMusicBtn.addEventListener('click', () => this.selectAIMusic());
        }

        // AI Thumbnail Generator
        const generateThumbnailBtn = document.getElementById('generateThumbnailBtn');
        if (generateThumbnailBtn) {
            generateThumbnailBtn.replaceWith(generateThumbnailBtn.cloneNode(true));
            const newGenerateThumbnailBtn = document.getElementById('generateThumbnailBtn');
            newGenerateThumbnailBtn.addEventListener('click', () => this.generateAIThumbnail());
        }

        // AI Analytics Insights
        const showInsightsBtn = document.getElementById('showInsightsBtn');
        if (showInsightsBtn) {
            showInsightsBtn.replaceWith(showInsightsBtn.cloneNode(true));
            const newShowInsightsBtn = document.getElementById('showInsightsBtn');
            newShowInsightsBtn.addEventListener('click', () => this.showAIAnalytics());
        }

        // AI Overlay Generator
        const generateOverlayBtn = document.getElementById('generateOverlayBtn');
        if (generateOverlayBtn) {
            generateOverlayBtn.replaceWith(generateOverlayBtn.cloneNode(true));
            const newGenerateOverlayBtn = document.getElementById('generateOverlayBtn');
            newGenerateOverlayBtn.addEventListener('click', () => this.generateAIOverlay());
        }
    }

    async generateAITitle() {
        const btn = document.getElementById('generateTitleBtn');
        const container = document.getElementById('generatedTitles');
        const category = document.getElementById('streamCategory').value;
        
        if (!btn || !container) {
            return;
        }
        
        btn.classList.add('loading');
        btn.textContent = 'Generating...';
        
        try {
            // Simulate AI processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const titles = this.getAITitleSuggestions(category);
            container.innerHTML = titles.map(title => `
                <div class="suggestion-item" onclick="livePage.selectTitle('${title.replace(/'/g, "\\'")}')">
                    <div class="suggestion-text">${title}</div>
                    <button class="suggestion-action" onclick="event.stopPropagation(); livePage.selectTitle('${title.replace(/'/g, "\\'")}')">
                        Use
                    </button>
                </div>
            `).join('');
            
            container.style.display = 'block';
        } catch (error) {
            console.error('Failed to generate titles:', error);
        } finally {
            btn.classList.remove('loading');
            btn.textContent = 'Generate';
        }
    }

    async generateAIDescription() {
        const btn = document.getElementById('generateDescBtn');
        const container = document.getElementById('generatedDescriptions');
        const title = document.getElementById('streamTitle').value;
        const category = document.getElementById('streamCategory').value;
        
        btn.classList.add('loading');
        btn.textContent = 'Generating...';
        
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const descriptions = this.getAIDescriptionSuggestions(title, category);
            container.innerHTML = descriptions.map(desc => `
                <div class="suggestion-item" onclick="livePage.selectDescription('${desc.replace(/'/g, "\\'")}')">
                    <div class="suggestion-text">${desc}</div>
                    <button class="suggestion-action" onclick="event.stopPropagation(); livePage.selectDescription('${desc.replace(/'/g, "\\'")}')">
                        Use
                    </button>
                </div>
            `).join('');
            
            container.style.display = 'block';
        } catch (error) {
            console.error('Failed to generate descriptions:', error);
        } finally {
            btn.classList.remove('loading');
            btn.textContent = 'Generate';
        }
    }

    async selectAIMusic() {
        const btn = document.getElementById('selectMusicBtn');
        const container = document.getElementById('selectedMusic');
        
        btn.classList.add('loading');
        btn.textContent = 'Selecting...';
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const musicTracks = this.getAIMusicSuggestions();
            
            // Group by genre
            const musicByGenre = {};
            musicTracks.forEach(track => {
                if (!musicByGenre[track.genre]) {
                    musicByGenre[track.genre] = [];
                }
                musicByGenre[track.genre].push(track);
            });
            
            container.innerHTML = `
                <div class="copyright-notice">
                    <div class="copyright-icon">🎵</div>
                    <div class="copyright-text">
                        <strong>All tracks are Copyright-Free!</strong>
                        <span>Licensed under Creative Commons or Public Domain - Safe for streaming and commercial use</span>
                    </div>
                </div>
                ${Object.entries(musicByGenre).map(([genre, tracks]) => `
                    <div class="music-genre-section">
                        <div class="genre-header">${genre}</div>
                        ${tracks.map(track => `
                            <div class="suggestion-item">
                                <div class="music-item">
                                    <div class="music-icon">🎵</div>
                                    <div class="music-info">
                                        <div class="music-title">${track.title}</div>
                                        <div class="music-artist">${track.artist}</div>
                                        <div class="music-genre">${track.genre}</div>
                                        <div class="music-source">${track.source || 'Free Music Archive'}</div>
                                    </div>
                                </div>
                                <button class="suggestion-action" onclick="livePage.selectMusic('${track.title}', '${track.artist}')">
                                    Add
                                </button>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            `;
            
            container.style.display = 'block';
        } catch (error) {
            console.error('Failed to load music suggestions:', error);
        } finally {
            btn.classList.remove('loading');
            btn.textContent = 'Select';
        }
    }

    async generateAIThumbnail() {
        const btn = document.getElementById('generateThumbnailBtn');
        const container = document.getElementById('generatedThumbnails');
        const title = document.getElementById('streamTitle').value || 'Live Stream';
        
        btn.classList.add('loading');
        btn.textContent = 'Generating...';
        
        try {
            // Get thumbnails from Pexels API
            const thumbnails = await this.getAIThumbnailSuggestions(title);
            
            container.innerHTML = thumbnails.map((thumb, index) => `
                <div class="suggestion-item">
                    <div class="thumbnail-option">
                        <img src="${thumb.url}" alt="AI Generated Thumbnail ${index + 1}">
                        <div class="suggestion-text">
                            <div class="thumbnail-style">${thumb.style}</div>
                            <div class="thumbnail-photographer">by ${thumb.photographer}</div>
                        </div>
                    </div>
                    <button class="suggestion-action" onclick="livePage.selectThumbnail('${thumb.url}', '${thumb.style}')">
                        Use
                    </button>
                </div>
            `).join('');
            
            container.style.display = 'block';
        } catch (error) {
            console.error('Error generating thumbnails:', error);
            
            // Try fallback
            try {
                const fallbackThumbnails = this.getFallbackThumbnails('default', ['Professional', 'Modern', 'Clean', 'Dynamic']);
                container.innerHTML = fallbackThumbnails.map((thumb, index) => `
                    <div class="suggestion-item">
                        <div class="thumbnail-option">
                            <img src="${thumb.url}" alt="AI Generated Thumbnail ${index + 1}">
                            <div class="suggestion-text">
                                <div class="thumbnail-style">${thumb.style}</div>
                                <div class="thumbnail-photographer">by ${thumb.photographer}</div>
                            </div>
                        </div>
                        <button class="suggestion-action" onclick="livePage.selectThumbnail('${thumb.url}', '${thumb.style}')">
                            Use
                        </button>
                    </div>
                `).join('');
                container.style.display = 'block';
            } catch (fallbackError) {
                console.error('Thumbnail generation failed completely:', fallbackError);
            }
        } finally {
            btn.classList.remove('loading');
            btn.textContent = 'Generate';
        }
    }

    async showAIAnalytics() {
        const btn = document.getElementById('showInsightsBtn');
        const container = document.getElementById('aiInsights');
        
        btn.classList.add('loading');
        btn.textContent = 'Loading...';
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const insights = this.getAIAnalyticsInsights();
            container.innerHTML = insights.map(insight => `
                <div class="insight-item">
                    <div class="insight-icon">${insight.icon}</div>
                    <div class="insight-text">${insight.text}</div>
                </div>
            `).join('');
            
            container.style.display = 'block';
        } catch (error) {
            console.error('Failed to load insights:', error);
        } finally {
            btn.classList.remove('loading');
            btn.textContent = 'View';
        }
    }

    async generateAIOverlay() {
        const btn = document.getElementById('generateOverlayBtn');
        const container = document.getElementById('generatedOverlays');
        
        btn.classList.add('loading');
        btn.textContent = 'Creating...';
        
        try {
            await new Promise(resolve => setTimeout(resolve, 2500));
            
            const overlays = this.getAIOverlaySuggestions();
            container.innerHTML = overlays.map(overlay => `
                <div class="suggestion-item">
                    <div class="suggestion-text">
                        <strong>${overlay.name}</strong><br>
                        <small>${overlay.description}</small>
                    </div>
                    <button class="suggestion-action" onclick="livePage.selectOverlay('${overlay.name}', '${overlay.description}')">
                        Create
                    </button>
                </div>
            `).join('');
            
            container.style.display = 'block';
        } catch (error) {
            console.error('Failed to create overlays:', error);
        } finally {
            btn.classList.remove('loading');
            btn.textContent = 'Create';
        }
    }

    // AI Suggestion Data Methods
    getAITitleSuggestions(category) {
        const titles = {
            gaming: [
                "🎮 Epic Gaming Session - Come Join the Fun!",
                "🔥 Competitive Gaming Live - Watch Me Dominate!",
                "🎯 Pro Gaming Tips & Tricks - Learn From the Best",
                "🏆 Tournament Practice - Road to Victory!",
                "🎲 Casual Gaming Vibes - Relax and Play Together",
                "⚔️ Battle Royale - Last Stream Standing!",
                "🎪 Gaming Marathon - 24 Hours of Pure Fun!",
                "🏅 Ranked Matches - Climbing the Leaderboard!",
                "🎭 Roleplay Adventure - Immersive Gaming Experience!",
                "🎪 Retro Gaming Night - Classic Games Live!",
                "🏆 Esports Training - Pro Strategies Revealed!",
                "🎮 New Game Release - First Impressions Live!",
                "🎪 Speedrun Challenge - Beat the Clock!",
                "🏅 Team Battle - Squad vs Squad Showdown!",
                "🎭 Horror Gaming - Spooky Stream Tonight!",
                "🎮 Strategy Gaming - Master the Meta!",
                "🔥 FPS Action - Precision & Speed!",
                "🎪 MOBA Madness - Team Coordination!",
                "🏆 Fighting Games - Combo Mastery!",
                "🎲 Puzzle Games - Brain Teasers Live!",
                "⚔️ RPG Adventure - Epic Quest Time!",
                "🎪 Racing Games - Speed Demons!",
                "🏅 Sports Gaming - Virtual Athletics!",
                "🎭 Simulation Games - Realistic Experience!",
                "🎮 Indie Games - Hidden Gems!",
                "🔥 Battle Royale - Last One Standing!",
                "🎪 Co-op Gaming - Team Up & Play!",
                "🏆 Competitive Scene - Pro Level Play!",
                "🎲 Casual Fun - Relaxing Game Time!",
                "⚔️ Hardcore Gaming - Extreme Challenge!"
            ],
            music: [
                "🎵 Live Music Performance - Original Songs Tonight!",
                "🎤 Acoustic Session - Intimate Music Experience",
                "🎹 Piano Covers - Your Favorite Songs Live",
                "🎸 Guitar Lessons - Learn to Play Popular Songs",
                "🎧 Music Production - Behind the Scenes",
                "🎪 Concert Vibes - Live Performance Energy!",
                "🎤 Karaoke Night - Sing Along With Me!",
                "🎹 Classical Piano - Beautiful Melodies Live!",
                "🎸 Rock & Roll - Electric Guitar Riffs!",
                "🎧 Electronic Beats - EDM Production Live!",
                "🎪 Jazz Session - Smooth Jazz Improvisation!",
                "🎤 Pop Hits - Chart-Topping Covers!",
                "🎹 Lo-Fi Beats - Chill Study Music!",
                "🎸 Country Music - Heartfelt Stories in Song!",
                "🎧 Hip-Hop Freestyle - Rhymes & Beats Live!",
                "🎵 Music Theory - Understanding Harmony!",
                "🎤 Vocal Training - Improve Your Voice!",
                "🎹 Songwriting Workshop - Create Your Own!",
                "🎸 Bass Guitar - Groove & Rhythm!",
                "🎧 Drum Session - Beat Making Live!",
                "🎪 Orchestra Performance - Symphonic Beauty!",
                "🎤 Choir Practice - Harmonious Voices!",
                "🎹 Jazz Piano - Improvisation Skills!",
                "🎸 Blues Guitar - Soulful Playing!",
                "🎧 Ambient Music - Atmospheric Sounds!",
                "🎵 Music History - Stories Behind Songs!",
                "🎤 Opera Performance - Classical Drama!",
                "🎹 Music Composition - Creating Melodies!",
                "🎸 Folk Music - Traditional Tunes!",
                "🎧 Experimental Music - Pushing Boundaries!"
            ],
            fitness: [
                "💪 Intense Workout Session - Let's Get Strong Together!",
                "🔥 High-Energy Fitness Live - Transform Your Body!",
                "🏃‍♀️ Cardio Blast - Burn Calories With Me!",
                "🏋️‍♂️ Strength Training - Build Muscle & Power!",
                "🧘‍♀️ Yoga & Wellness - Mind & Body Balance!",
                "🥗 Fitness & Nutrition Tips - Healthy Living Guide!",
                "⚡ HIIT Workout - Maximum Results in Minimum Time!",
                "🎯 Fitness Goals - Let's Crush Them Together!",
                "🏃‍♂️ Running Club - Let's Hit the Pavement!",
                "🏋️‍♀️ Powerlifting - Building Raw Strength!",
                "🧘‍♂️ Meditation & Mindfulness - Inner Peace Journey!",
                "🥊 Boxing Workout - Punch Your Way to Fitness!",
                "🏊‍♀️ Swimming Fitness - Low Impact, High Results!",
                "🚴‍♂️ Cycling Session - Pedal to the Metal!",
                "🏃‍♀️ Marathon Training - Building Endurance!",
                "💪 CrossFit WOD - Workout of the Day!",
                "🧘‍♀️ Pilates Flow - Core Strength & Flexibility!",
                "🥗 Meal Prep Sunday - Healthy Eating Made Easy!",
                "⚡ Tabata Training - 4-Minute Fitness Blasts!",
                "🎯 Weight Loss Journey - Transform Together!",
                "🏋️‍♂️ Bodybuilding - Sculpt Your Physique!",
                "🏃‍♂️ Sprint Training - Speed & Agility!",
                "🧘‍♀️ Vinyasa Flow - Dynamic Yoga Practice!",
                "🥊 Kickboxing - Cardio & Self-Defense!",
                "🏊‍♂️ Water Aerobics - Pool Fitness Fun!",
                "🚴‍♀️ Indoor Cycling - Spin Class Energy!",
                "🏃‍♀️ Trail Running - Nature's Gym!",
                "💪 Functional Training - Real-Life Strength!",
                "🧘‍♂️ Breathwork - Breathing Techniques!",
                "🥊 Muay Thai - Thai Boxing Skills!",
                "🏊‍♀️ Synchronized Swimming - Graceful Movement!",
                "🚴‍♂️ Mountain Biking - Adventure Fitness!",
                "🏃‍♂️ Ultra Running - Extreme Endurance!",
                "💪 Calisthenics - Bodyweight Mastery!",
                "🧘‍♀️ Restorative Yoga - Healing Practice!",
                "🥊 MMA Training - Mixed Martial Arts!",
                "🏊‍♂️ Triathlon Training - Three-Sport Challenge!",
                "🚴‍♀️ Road Cycling - Speed & Distance!",
                "🏃‍♀️ Obstacle Course - Tough Mudder Prep!",
                "💪 Strongman Training - Ultimate Strength!"
            ],
            cooking: [
                "👨‍🍳 Live Cooking Show - Delicious Recipes Tonight!",
                "🍳 Breakfast Masterclass - Start Your Day Right!",
                "🍕 Pizza Making - From Dough to Delicious!",
                "🍰 Baking Masterclass - Sweet Treats Live!",
                "🥘 Dinner Time - Restaurant-Quality Meals!",
                "🍣 Sushi Making - Japanese Culinary Art!",
                "🍝 Pasta Perfection - Italian Cuisine Live!",
                "🍖 BBQ Masterclass - Grilling Like a Pro!",
                "🥗 Healthy Cooking - Nutritious & Delicious!",
                "🍰 Dessert Workshop - Sweet Creations!",
                "🍳 Quick & Easy - 30-Minute Meals!",
                "🍕 Homemade Pizza - Perfect Crust Every Time!",
                "🍣 Asian Fusion - Modern Asian Cuisine!",
                "🍝 Comfort Food - Hearty & Homestyle!",
                "🥘 One-Pot Wonders - Simple & Satisfying!",
                "🍳 French Cuisine - Classic Techniques!",
                "🍕 Artisan Bread - From Scratch Baking!",
                "🍣 Thai Cooking - Spicy & Aromatic!",
                "🍝 Mexican Fiesta - Authentic Flavors!",
                "🥘 Indian Spices - Curry & Rice Delights!",
                "🍳 Mediterranean Diet - Healthy & Fresh!",
                "🍕 Wood-Fired Pizza - Traditional Methods!",
                "🍣 Korean BBQ - Bold & Spicy!",
                "🍝 Greek Cuisine - Mediterranean Magic!",
                "🥘 Moroccan Tagine - Exotic Spices!",
                "🍳 Vegan Cooking - Plant-Based Delights!",
                "🍕 Gluten-Free Baking - Allergy-Friendly!",
                "🍣 Vietnamese Pho - Noodle Soup Mastery!",
                "🍝 Lebanese Mezze - Small Plate Feast!",
                "🥘 Brazilian Churrasco - Meat Lover's Paradise!",
                "🍳 Molecular Gastronomy - Science in the Kitchen!",
                "🍕 Sourdough Bread - Natural Fermentation!",
                "🍣 Peruvian Ceviche - Fresh Seafood!",
                "🍝 Turkish Kebabs - Middle Eastern Flavors!",
                "🥘 Ethiopian Injera - Traditional Bread!",
                "🍳 Fermentation Workshop - Probiotic Foods!",
                "🍕 Neapolitan Pizza - Authentic Italian!",
                "🍣 Dim Sum Making - Chinese Dumplings!",
                "🍝 Spanish Paella - Seafood & Rice!"
            ],
            tech: [
                "💻 Coding Live - Programming Tutorials!",
                "🤖 AI & Machine Learning - Future Tech Today!",
                "📱 App Development - Building the Next Big Thing!",
                "🌐 Web Development - Modern Websites Live!",
                "🎮 Game Development - Creating Digital Worlds!",
                "📊 Data Science - Insights from Big Data!",
                "🔧 Tech Reviews - Latest Gadgets & Gear!",
                "☁️ Cloud Computing - Scalable Solutions!",
                "🔒 Cybersecurity - Protecting Digital Assets!",
                "📱 Mobile Development - Apps for Everyone!",
                "🌐 Full-Stack Development - End-to-End Solutions!",
                "🤖 Robotics & Automation - Future of Work!",
                "📊 Business Intelligence - Data-Driven Decisions!",
                "🔧 DevOps Practices - Streamlining Development!",
                "☁️ Serverless Architecture - Modern Cloud Solutions!",
                "💻 Python Programming - Learn Python Live!",
                "🤖 Deep Learning - Neural Networks Explained!",
                "📱 iOS Development - iPhone Apps!",
                "🌐 React Development - Modern Web Apps!",
                "🎮 Unity Game Dev - 3D Game Creation!",
                "📊 SQL Database - Data Management!",
                "🔧 Hardware Reviews - PC Building Guide!",
                "☁️ AWS Cloud - Amazon Web Services!",
                "🔒 Ethical Hacking - Security Testing!",
                "📱 Android Development - Google Play Apps!",
                "🌐 Node.js Backend - Server-Side JavaScript!",
                "🤖 Computer Vision - Image Recognition!",
                "📊 Tableau Analytics - Data Visualization!",
                "🔧 Linux Administration - Server Management!",
                "☁️ Docker Containers - Containerization!",
                "💻 JavaScript Mastery - Frontend Development!",
                "🤖 Natural Language Processing - AI Text Analysis!",
                "📱 Flutter Development - Cross-Platform Apps!",
                "🌐 Vue.js Framework - Progressive Web Apps!",
                "🎮 Unreal Engine - AAA Game Development!",
                "📊 Power BI - Business Analytics!",
                "🔧 Network Security - Firewall Configuration!",
                "☁️ Kubernetes - Container Orchestration!",
                "💻 C++ Programming - System Development!"
            ],
            art: [
                "🎨 Live Art Session - Creative Expression!",
                "🖼️ Digital Art - Digital Painting Live!",
                "✏️ Sketching Workshop - Drawing Fundamentals!",
                "🎭 Portrait Drawing - Capturing Expressions!",
                "🌅 Landscape Painting - Nature's Beauty!",
                "🎪 Abstract Art - Creative Freedom!",
                "🖼️ Watercolor Magic - Flowing Colors!",
                "✏️ Character Design - Bringing Ideas to Life!",
                "🎭 Figure Drawing - Human Form Studies!",
                "🌅 Urban Sketching - City Life in Art!",
                "🎪 Comic Art - Storytelling Through Images!",
                "🖼️ Oil Painting - Traditional Techniques!",
                "✏️ Calligraphy - Beautiful Handwriting!",
                "🎭 Concept Art - Visual Development!",
                "🌅 Plein Air Painting - Outdoor Art Adventure!",
                "🎨 Acrylic Painting - Bold & Vibrant!",
                "🖼️ Digital Illustration - Modern Art Creation!",
                "✏️ Anatomy Drawing - Human Body Studies!",
                "🎭 Caricature Drawing - Exaggerated Portraits!",
                "🌅 Seascape Painting - Ocean Beauty!",
                "🎪 Surreal Art - Dreamlike Imagery!",
                "🖼️ Mixed Media - Combining Techniques!",
                "✏️ Perspective Drawing - 3D Space!",
                "🎭 Fashion Illustration - Style & Design!",
                "🌅 Wildlife Art - Animal Portraits!",
                "🎪 Street Art - Urban Expression!",
                "🖼️ Printmaking - Traditional Print Techniques!",
                "✏️ Cartoon Drawing - Fun & Whimsical!",
                "🎭 Manga Art - Japanese Comic Style!",
                "🌅 Botanical Art - Plant Illustrations!",
                "🎪 Graffiti Art - Street Culture!",
                "🖼️ Collage Art - Mixed Materials!",
                "✏️ Architectural Drawing - Building Design!",
                "🎭 Fantasy Art - Mythical Creatures!",
                "🌅 Impressionist Style - Light & Color!",
                "🎪 Pop Art - Popular Culture!",
                "🖼️ Sculpture - 3D Art Creation!",
                "✏️ Typography - Letter Design!",
                "🎭 Animation - Moving Art!"
            ],
            business: [
                "💼 Business Tips - Entrepreneurial Wisdom!",
                "📈 Marketing Strategies - Grow Your Brand!",
                "💰 Financial Planning - Smart Money Moves!",
                "🤝 Networking Skills - Building Connections!",
                "📊 Business Analytics - Data-Driven Decisions!",
                "💡 Startup Advice - From Idea to Success!",
                "📱 Social Media Marketing - Digital Growth!",
                "💰 Investment Tips - Building Wealth!",
                "🤝 Leadership Skills - Leading with Purpose!",
                "📊 Sales Techniques - Closing More Deals!",
                "💡 Innovation Workshop - Creative Problem Solving!",
                "📱 E-commerce Success - Online Business Tips!",
                "💰 Passive Income - Multiple Revenue Streams!",
                "🤝 Team Building - Creating Strong Teams!",
                "📊 Business Strategy - Long-term Success!",
                "💼 Entrepreneurship - Building Your Empire!",
                "📈 Brand Building - Creating Your Identity!",
                "💰 Cryptocurrency - Digital Assets!",
                "🤝 Business Networking - Professional Connections!",
                "📊 Market Research - Understanding Your Audience!",
                "💡 Product Development - From Concept to Market!",
                "📱 Digital Marketing - Online Growth!",
                "💰 Real Estate Investment - Property Wealth!",
                "🤝 Negotiation Skills - Win-Win Deals!",
                "📊 Customer Service - Building Relationships!",
                "💼 Small Business - Local Success!",
                "📈 Content Marketing - Storytelling for Business!",
                "💰 Stock Market - Investment Strategies!",
                "🤝 Public Speaking - Business Communication!",
                "📊 Supply Chain - Business Operations!",
                "💡 Patent Law - Protecting Your Ideas!",
                "📱 Influencer Marketing - Social Media Growth!",
                "💰 Tax Planning - Financial Optimization!",
                "🤝 International Business - Global Expansion!",
                "📊 Business Intelligence - Competitive Analysis!",
                "💼 Franchise Opportunities - Business Ownership!",
                "📈 Growth Hacking - Rapid Business Scaling!",
                "💰 Venture Capital - Startup Funding!",
                "🤝 Business Ethics - Responsible Leadership!"
            ],
            education: [
                "📚 Study Session - Learning Together!",
                "🧮 Math Tutorial - Making Numbers Fun!",
                "🔬 Science Experiments - Hands-on Learning!",
                "📖 Language Learning - New Languages Made Easy!",
                "🌍 History Lesson - Stories from the Past!",
                "🎨 Art History - Masterpieces Through Time!",
                "🌱 Biology Basics - Life Science Live!",
                "⚡ Physics Fun - Understanding the Universe!",
                "🧪 Chemistry Lab - Chemical Reactions!",
                "🌍 Geography Journey - Exploring Our World!",
                "📚 Literature Discussion - Great Books Live!",
                "🎵 Music Theory - Understanding Harmony!",
                "🌱 Environmental Science - Planet Earth!",
                "⚡ Engineering Basics - Building the Future!",
                "🧪 Psychology Insights - Understanding Minds!",
                "📚 Philosophy Discussion - Deep Thinking!",
                "🧮 Calculus Made Easy - Advanced Math!",
                "🔬 Astronomy - Exploring the Cosmos!",
                "📖 Spanish Lessons - Learn Español!",
                "🌍 World History - Global Perspectives!",
                "🎨 Modern Art - Contemporary Masterpieces!",
                "🌱 Genetics - DNA & Inheritance!",
                "⚡ Electronics - Circuit Design!",
                "🧪 Organic Chemistry - Carbon Compounds!",
                "🌍 Political Science - Government & Society!",
                "📚 Creative Writing - Storytelling Skills!",
                "🎵 Music Composition - Creating Melodies!",
                "🌱 Ecology - Environmental Systems!",
                "⚡ Computer Science - Programming Logic!",
                "🧪 Neuroscience - Brain & Behavior!",
                "📚 Shakespeare - Classic Literature!",
                "🧮 Statistics - Data Analysis!",
                "🔬 Microbiology - Tiny Life Forms!",
                "📖 French Lessons - Learn Français!",
                "🌍 Economics - Money & Markets!",
                "🎨 Photography - Visual Storytelling!",
                "🌱 Botany - Plant Science!",
                "⚡ Renewable Energy - Sustainable Power!",
                "🧪 Biochemistry - Life's Chemistry!",
                "📚 Poetry Workshop - Creative Expression!"
            ],
            travel: [
                "✈️ Travel Adventures - Explore the World!",
                "🏖️ Beach Destinations - Tropical Paradise!",
                "🏔️ Mountain Expeditions - Peak Adventures!",
                "🏛️ Cultural Tours - Heritage & History!",
                "🍜 Food Travel - Culinary Journeys!",
                "🏕️ Camping Trips - Outdoor Adventures!",
                "🏙️ City Exploration - Urban Discovery!",
                "🌅 Sunset Views - Beautiful Moments!",
                "🏞️ National Parks - Natural Wonders!",
                "🏰 Castle Tours - Medieval History!",
                "🌊 Ocean Adventures - Marine Life!",
                "🏔️ Skiing Trips - Winter Sports!",
                "🏛️ Museum Tours - Art & Culture!",
                "🍜 Street Food - Local Cuisine!",
                "🏕️ Hiking Trails - Nature Walks!",
                "🏙️ Architecture Tours - Building Beauty!",
                "🌅 Photography Travel - Capture Memories!",
                "🏞️ Wildlife Safaris - Animal Encounters!",
                "🏰 Historical Sites - Ancient Wonders!",
                "🌊 Island Hopping - Tropical Islands!",
                "🏔️ Rock Climbing - Vertical Adventures!",
                "🏛️ Religious Sites - Spiritual Journeys!",
                "🍜 Wine Tours - Vineyard Visits!",
                "🏕️ RV Travel - Road Trip Adventures!",
                "🏙️ Nightlife Tours - City After Dark!",
                "🌅 Sunrise Hikes - Early Morning Beauty!",
                "🏞️ Desert Expeditions - Arid Landscapes!",
                "🏰 Palace Tours - Royal Residences!",
                "🌊 Scuba Diving - Underwater Exploration!",
                "🏔️ Mountaineering - Peak Climbing!",
                "🏛️ Archaeological Sites - Ancient Ruins!",
                "🍜 Cooking Classes - Local Cuisine!",
                "🏕️ Glamping - Luxury Camping!",
                "🏙️ Shopping Tours - Retail Therapy!",
                "🌅 Photography Workshops - Travel Photography!",
                "🏞️ Bird Watching - Avian Adventures!",
                "🏰 Fort Tours - Military History!",
                "🌊 Surfing Trips - Wave Riding!",
                "🏔️ Ice Climbing - Frozen Adventures!"
            ],
            lifestyle: [
                "🌟 Lifestyle Tips - Living Your Best Life!",
                "💄 Beauty & Makeup - Glamorous Looks!",
                "👗 Fashion & Style - Trendy Outfits!",
                "🏠 Home Decor - Interior Design!",
                "🌿 Wellness & Self-Care - Mind & Body!",
                "🍳 Healthy Recipes - Nutritious Meals!",
                "🧘‍♀️ Meditation & Mindfulness - Inner Peace!",
                "💪 Personal Development - Growth Mindset!",
                "🎯 Goal Setting - Achieve Your Dreams!",
                "📚 Book Reviews - Literary Discussions!",
                "🎬 Movie Reviews - Film Analysis!",
                "🎵 Music Discovery - New Artists!",
                "🏃‍♀️ Morning Routines - Start Your Day Right!",
                "🌙 Evening Rituals - Wind Down & Relax!",
                "💼 Work-Life Balance - Harmony & Success!",
                "👶 Parenting Tips - Raising Kids!",
                "🐕 Pet Care - Animal Companions!",
                "🌱 Plant Care - Indoor Gardening!",
                "🎨 DIY Projects - Creative Crafts!",
                "📱 Tech Reviews - Latest Gadgets!",
                "🏠 Organization Tips - Declutter & Simplify!",
                "💄 Skincare Routine - Healthy Skin!",
                "👗 Wardrobe Organization - Fashion Management!",
                "🏠 Minimalism - Simple Living!",
                "🌿 Natural Remedies - Holistic Health!",
                "🍳 Meal Planning - Organized Eating!",
                "🧘‍♀️ Yoga Practice - Mindful Movement!",
                "💪 Confidence Building - Self-Esteem!",
                "📚 Learning New Skills - Personal Growth!",
                "🎬 TV Show Reviews - Entertainment!",
                "🎵 Podcast Recommendations - Audio Content!",
                "🏃‍♀️ Fitness Motivation - Stay Active!",
                "🌙 Sleep Optimization - Better Rest!",
                "💼 Career Development - Professional Growth!",
                "👶 Family Activities - Quality Time!",
                "🐕 Pet Training - Well-Behaved Animals!",
                "🌱 Sustainable Living - Eco-Friendly!",
                "🎨 Creative Hobbies - Artistic Expression!",
                "📱 Digital Wellness - Healthy Tech Use!"
            ],
            default: [
                "🚀 Live Stream - Join Me for an Amazing Time!",
                "✨ Special Broadcast - You Don't Want to Miss This!",
                "🎉 Interactive Live Session - Let's Have Fun Together!",
                "🌟 Behind the Scenes - Exclusive Content Live!",
                "💫 Live Q&A - Ask Me Anything!",
                "🎪 Variety Show - Something for Everyone!",
                "🌟 Community Hangout - Let's Connect!",
                "🎉 Celebration Stream - Special Occasion!",
                "💫 Inspiration Hour - Motivational Content!",
                "🎪 Creative Workshop - Unleash Your Creativity!",
                "🌟 Lifestyle Tips - Living Your Best Life!",
                "🎉 Entertainment Tonight - Fun & Games!",
                "💫 Wellness Wednesday - Health & Happiness!",
                "🎪 Weekend Vibes - Relaxing & Fun!",
                "🌟 Success Stories - Real People, Real Results!",
                "🚀 Innovation Showcase - Future Technology!",
                "✨ Creative Corner - Artistic Expression!",
                "🎉 Community Spotlight - Featured Members!",
                "🌟 Expert Interview - Industry Insights!",
                "💫 Product Launch - New Releases!",
                "🎪 Event Coverage - Live Reporting!",
                "🌟 Tutorial Time - Learn Something New!",
                "🎉 Challenge Accepted - Fun Competitions!",
                "💫 Story Time - Personal Experiences!",
                "🎪 Game Night - Interactive Entertainment!",
                "🌟 Motivation Monday - Start Your Week Right!",
                "💫 Transformation Tuesday - Personal Growth!",
                "🎪 Wellness Wednesday - Health & Fitness!",
                "🌟 Thankful Thursday - Gratitude Practice!",
                "💫 Fun Friday - Weekend Kickoff!",
                "🎪 Social Saturday - Community Connection!",
                "🌟 Self-Care Sunday - Rest & Recharge!",
                "🚀 Launch Party - New Beginnings!",
                "✨ Milestone Celebration - Achievements!",
                "🎉 Holiday Special - Seasonal Fun!",
                "🌟 Anniversary Stream - Special Memories!",
                "💫 Birthday Bash - Personal Celebration!",
                "🎪 Fan Appreciation - Thank You Stream!",
                "🌟 Charity Stream - Giving Back!"
            ]
        };
        
        return titles[category] || titles.default;
    }

    getAIDescriptionSuggestions(title, category) {
        if (category === 'fitness') {
            return [
                `Join me for an intense fitness session where we'll push our limits together! Whether you're a beginner or advanced, I'll guide you through effective workouts that will transform your body and mind.`,
                `Get ready to sweat! This live fitness stream will feature high-energy workouts, proper form demonstrations, and motivation to help you reach your fitness goals.`,
                `Welcome to your daily dose of fitness motivation! I'll be leading workouts, sharing nutrition tips, and answering all your fitness questions live.`,
                `Transform your body with me! This fitness stream will include strength training, cardio bursts, and wellness tips to help you build a healthier lifestyle.`,
                `Ready to crush your fitness goals? Join me for an empowering workout session filled with energy, motivation, and results-driven exercises!`
            ];
        }
        
        return [
            `Join me for an exciting live stream where we'll explore ${category} content together. Whether you're a beginner or expert, there's something for everyone!`,
            `Get ready for an interactive session filled with ${category} goodness. I'll be sharing tips, tricks, and insights that you won't find anywhere else.`,
            `Welcome to my live ${category} stream! I'll be answering your questions, taking requests, and creating an amazing community experience.`,
            `Tune in for a special ${category} broadcast where we'll dive deep into topics that matter. Your participation makes this stream unique!`,
            `Live ${category} content coming your way! Expect surprises, giveaways, and lots of fun. Don't miss out on this exclusive experience!`
        ];
    }

    getAIMusicSuggestions() {
        // Connect to the music library database
        const musicLibrary = this.getMusicLibraryTracks();
        
        // Return a curated selection from the music library
        return musicLibrary.slice(0, 50); // Show top 50 tracks
    }
    
    getMusicLibraryTracks() {
        // This would normally connect to the music library database
        // For now, return a comprehensive selection from our copyright-free database
        return [
            // Lo-Fi & Chill (20 tracks)
            { title: "Chill Vibes", artist: "Lo-Fi Beats", genre: "Lo-Fi", copyrightFree: true, source: "Free Music Archive" },
            { title: "Study Session", artist: "Ambient Lo-Fi", genre: "Lo-Fi", copyrightFree: true, source: "Free Music Archive" },
            { title: "Coffee Shop", artist: "Jazz Lo-Fi", genre: "Lo-Fi", copyrightFree: true, source: "Free Music Archive" },
            { title: "Night Drive", artist: "Synthwave Lo-Fi", genre: "Lo-Fi", copyrightFree: true, source: "Free Music Archive" },
            { title: "Rainy Day", artist: "Piano Lo-Fi", genre: "Lo-Fi", copyrightFree: true, source: "Free Music Archive" },
            { title: "Lo-Fi Dreams", artist: "Chill Beats", genre: "Lo-Fi", copyrightFree: true, source: "Free Music Archive" },
            { title: "Study Vibes", artist: "Ambient Lo-Fi", genre: "Lo-Fi", copyrightFree: true, source: "Free Music Archive" },
            { title: "Jazz Lo-Fi", artist: "Coffee Shop", genre: "Lo-Fi", copyrightFree: true, source: "Free Music Archive" },
            { title: "Synthwave Lo-Fi", artist: "Night Drive", genre: "Lo-Fi", copyrightFree: true, source: "Free Music Archive" },
            { title: "Ambient Lo-Fi", artist: "Rainy Day", genre: "Lo-Fi", copyrightFree: true, source: "Free Music Archive" },
            { title: "Lo-Fi Collective", artist: "Chill Studio", genre: "Lo-Fi", copyrightFree: true, source: "Free Music Archive" },
            { title: "Study Beats", artist: "Coffee Vibes", genre: "Lo-Fi", copyrightFree: true, source: "Free Music Archive" },
            { title: "Night Lo-Fi", artist: "Rain Lo-Fi", genre: "Lo-Fi", copyrightFree: true, source: "Free Music Archive" },
            { title: "Piano Dreams", artist: "Jazz Chill", genre: "Lo-Fi", copyrightFree: true, source: "Free Music Archive" },
            { title: "Synth Lo-Fi", artist: "Ambient Dreams", genre: "Lo-Fi", copyrightFree: true, source: "Free Music Archive" },
            { title: "Chill Studio", artist: "Lo-Fi Collective", genre: "Lo-Fi", copyrightFree: true, source: "Free Music Archive" },
            { title: "Coffee Vibes", artist: "Study Beats", genre: "Lo-Fi", copyrightFree: true, source: "Free Music Archive" },
            { title: "Rain Lo-Fi", artist: "Night Lo-Fi", genre: "Lo-Fi", copyrightFree: true, source: "Free Music Archive" },
            { title: "Jazz Chill", artist: "Piano Dreams", genre: "Lo-Fi", copyrightFree: true, source: "Free Music Archive" },
            { title: "Ambient Dreams", artist: "Synth Lo-Fi", genre: "Lo-Fi", copyrightFree: true, source: "Free Music Archive" },
            
            // Electronic & EDM (20 tracks)
            { title: "Energy Boost", artist: "Electronic Mix", genre: "Electronic", copyrightFree: true, source: "CCMixter" },
            { title: "Dance Floor", artist: "EDM Beats", genre: "Electronic", copyrightFree: true, source: "CCMixter" },
            { title: "Synthwave", artist: "Retro Electronic", genre: "Electronic", copyrightFree: true, source: "CCMixter" },
            { title: "Dubstep", artist: "Bass Drops", genre: "Electronic", copyrightFree: true, source: "CCMixter" },
            { title: "House Music", artist: "Deep House", genre: "Electronic", copyrightFree: true, source: "CCMixter" },
            { title: "Electronic Dreams", artist: "EDM Beats", genre: "Electronic", copyrightFree: true, source: "CCMixter" },
            { title: "Tech House", artist: "Progressive", genre: "Electronic", copyrightFree: true, source: "CCMixter" },
            { title: "Trance", artist: "Dubstep", genre: "Electronic", copyrightFree: true, source: "CCMixter" },
            { title: "Drum & Bass", artist: "Bass Drops", genre: "Electronic", copyrightFree: true, source: "CCMixter" },
            { title: "Deep House", artist: "Tech House", genre: "Electronic", copyrightFree: true, source: "CCMixter" },
            { title: "Electronic Collective", artist: "EDM Studio", genre: "Electronic", copyrightFree: true, source: "CCMixter" },
            { title: "Synth Dreams", artist: "Bass Studio", genre: "Electronic", copyrightFree: true, source: "CCMixter" },
            { title: "Deep Vibes", artist: "Tech Dreams", genre: "Electronic", copyrightFree: true, source: "CCMixter" },
            { title: "Progressive Beats", artist: "Trance Collective", genre: "Electronic", copyrightFree: true, source: "CCMixter" },
            { title: "Dub Studio", artist: "Drum Dreams", genre: "Electronic", copyrightFree: true, source: "CCMixter" },
            { title: "EDM Studio", artist: "Electronic Collective", genre: "Electronic", copyrightFree: true, source: "CCMixter" },
            { title: "Bass Studio", artist: "Synth Dreams", genre: "Electronic", copyrightFree: true, source: "CCMixter" },
            { title: "Tech Dreams", artist: "Deep Vibes", genre: "Electronic", copyrightFree: true, source: "CCMixter" },
            { title: "Trance Collective", artist: "Progressive Beats", genre: "Electronic", copyrightFree: true, source: "CCMixter" },
            { title: "Drum Dreams", artist: "Dub Studio", genre: "Electronic", copyrightFree: true, source: "CCMixter" },
            
            // Classical & Instrumental (20 tracks)
            { title: "Classical Hour", artist: "Symphony Orchestra", genre: "Classical", copyrightFree: true, source: "Musopen" },
            { title: "Piano Dreams", artist: "Classical Piano", genre: "Classical", copyrightFree: true, source: "Musopen" },
            { title: "String Quartet", artist: "Chamber Music", genre: "Classical", copyrightFree: true, source: "Musopen" },
            { title: "Opera Highlights", artist: "Opera Classics", genre: "Classical", copyrightFree: true, source: "Musopen" },
            { title: "Baroque Era", artist: "Historical Classical", genre: "Classical", copyrightFree: true, source: "Musopen" },
            { title: "Symphony Orchestra", artist: "Classical Piano", genre: "Classical", copyrightFree: true, source: "Musopen" },
            { title: "Chamber Music", artist: "String Quartet", genre: "Classical", copyrightFree: true, source: "Musopen" },
            { title: "Opera Classics", artist: "Historical Classical", genre: "Classical", copyrightFree: true, source: "Musopen" },
            { title: "Modern Classical", artist: "Solo Violin", genre: "Classical", copyrightFree: true, source: "Musopen" },
            { title: "Piano Sonata", artist: "Orchestral Suite", genre: "Classical", copyrightFree: true, source: "Musopen" },
            { title: "Classical Collective", artist: "Piano Studio", genre: "Classical", copyrightFree: true, source: "Musopen" },
            { title: "Chamber Dreams", artist: "Opera Studio", genre: "Classical", copyrightFree: true, source: "Musopen" },
            { title: "Historical Dreams", artist: "Modern Studio", genre: "Classical", copyrightFree: true, source: "Musopen" },
            { title: "String Dreams", artist: "Violin Studio", genre: "Classical", copyrightFree: true, source: "Musopen" },
            { title: "Sonata Dreams", artist: "Suite Studio", genre: "Classical", copyrightFree: true, source: "Musopen" },
            { title: "Piano Studio", artist: "Classical Collective", genre: "Classical", copyrightFree: true, source: "Musopen" },
            { title: "Opera Studio", artist: "Chamber Dreams", genre: "Classical", copyrightFree: true, source: "Musopen" },
            { title: "Modern Studio", artist: "Historical Dreams", genre: "Classical", copyrightFree: true, source: "Musopen" },
            { title: "Violin Studio", artist: "String Dreams", genre: "Classical", copyrightFree: true, source: "Musopen" },
            { title: "Suite Studio", artist: "Sonata Dreams", genre: "Classical", copyrightFree: true, source: "Musopen" },
            
            // Jazz & Blues (20 tracks)
            { title: "Jazz Lounge", artist: "Smooth Jazz", genre: "Jazz", copyrightFree: true, source: "Free Music Archive" },
            { title: "Blues Night", artist: "Delta Blues", genre: "Jazz", copyrightFree: true, source: "Free Music Archive" },
            { title: "Saxophone", artist: "Jazz Sax", genre: "Jazz", copyrightFree: true, source: "Free Music Archive" },
            { title: "Piano Jazz", artist: "Jazz Piano", genre: "Jazz", copyrightFree: true, source: "Free Music Archive" },
            { title: "Big Band", artist: "Swing Jazz", genre: "Jazz", copyrightFree: true, source: "Free Music Archive" },
            { title: "Smooth Jazz", artist: "Delta Blues", genre: "Jazz", copyrightFree: true, source: "Free Music Archive" },
            { title: "Jazz Sax", artist: "Jazz Piano", genre: "Jazz", copyrightFree: true, source: "Free Music Archive" },
            { title: "Swing Jazz", artist: "Bebop", genre: "Jazz", copyrightFree: true, source: "Free Music Archive" },
            { title: "Cool Jazz", artist: "Fusion", genre: "Jazz", copyrightFree: true, source: "Free Music Archive" },
            { title: "Latin Jazz", artist: "Acid Jazz", genre: "Jazz", copyrightFree: true, source: "Free Music Archive" },
            { title: "Jazz Collective", artist: "Blues Studio", genre: "Jazz", copyrightFree: true, source: "Free Music Archive" },
            { title: "Sax Dreams", artist: "Piano Jazz", genre: "Jazz", copyrightFree: true, source: "Free Music Archive" },
            { title: "Swing Studio", artist: "Bebop Dreams", genre: "Jazz", copyrightFree: true, source: "Free Music Archive" },
            { title: "Cool Studio", artist: "Fusion Dreams", genre: "Jazz", copyrightFree: true, source: "Free Music Archive" },
            { title: "Latin Studio", artist: "Acid Dreams", genre: "Jazz", copyrightFree: true, source: "Free Music Archive" },
            { title: "Blues Studio", artist: "Jazz Collective", genre: "Jazz", copyrightFree: true, source: "Free Music Archive" },
            { title: "Piano Jazz", artist: "Sax Dreams", genre: "Jazz", copyrightFree: true, source: "Free Music Archive" },
            { title: "Bebop Dreams", artist: "Swing Studio", genre: "Jazz", copyrightFree: true, source: "Free Music Archive" },
            { title: "Fusion Dreams", artist: "Cool Studio", genre: "Jazz", copyrightFree: true, source: "Free Music Archive" },
            { title: "Acid Dreams", artist: "Latin Studio", genre: "Jazz", copyrightFree: true, source: "Free Music Archive" },
            
            // Rock & Alternative (20 tracks)
            { title: "Rock Anthems", artist: "Classic Rock", genre: "Rock", copyrightFree: true, source: "CCMixter" },
            { title: "Alternative", artist: "Indie Rock", genre: "Rock", copyrightFree: true, source: "CCMixter" },
            { title: "Guitar Solos", artist: "Rock Guitar", genre: "Rock", copyrightFree: true, source: "CCMixter" },
            { title: "Punk Rock", artist: "Punk Energy", genre: "Rock", copyrightFree: true, source: "CCMixter" },
            { title: "Progressive", artist: "Prog Rock", genre: "Rock", copyrightFree: true, source: "CCMixter" },
            { title: "Classic Rock", artist: "Indie Rock", genre: "Rock", copyrightFree: true, source: "CCMixter" },
            { title: "Rock Guitar", artist: "Punk Energy", genre: "Rock", copyrightFree: true, source: "CCMixter" },
            { title: "Prog Rock", artist: "Alternative", genre: "Rock", copyrightFree: true, source: "CCMixter" },
            { title: "Hard Rock", artist: "Soft Rock", genre: "Rock", copyrightFree: true, source: "CCMixter" },
            { title: "Rock Ballad", artist: "Rock Anthem", genre: "Rock", copyrightFree: true, source: "CCMixter" },
            { title: "Rock Collective", artist: "Indie Studio", genre: "Rock", copyrightFree: true, source: "CCMixter" },
            { title: "Guitar Dreams", artist: "Punk Studio", genre: "Rock", copyrightFree: true, source: "CCMixter" },
            { title: "Prog Dreams", artist: "Alternative Studio", genre: "Rock", copyrightFree: true, source: "CCMixter" },
            { title: "Hard Dreams", artist: "Soft Studio", genre: "Rock", copyrightFree: true, source: "CCMixter" },
            { title: "Ballad Dreams", artist: "Anthem Studio", genre: "Rock", copyrightFree: true, source: "CCMixter" },
            { title: "Indie Studio", artist: "Rock Collective", genre: "Rock", copyrightFree: true, source: "CCMixter" },
            { title: "Punk Studio", artist: "Guitar Dreams", genre: "Rock", copyrightFree: true, source: "CCMixter" },
            { title: "Alternative Studio", artist: "Prog Dreams", genre: "Rock", copyrightFree: true, source: "CCMixter" },
            { title: "Soft Studio", artist: "Hard Dreams", genre: "Rock", copyrightFree: true, source: "CCMixter" },
            { title: "Anthem Studio", artist: "Ballad Dreams", genre: "Rock", copyrightFree: true, source: "CCMixter" }
        ];
    }

    async getAIThumbnailSuggestions(title) {
        const PEXELS_API_KEY = 'fukzfUyQBBPXqfJyNeXsFvIFOXhIjkRWFaeNVLSggxEZ9aKhqnWa3lgR';
        
        // Determine search query based on title keywords
        let searchQuery = 'professional';
        let styleNames = ['Professional', 'Modern', 'Clean', 'Dynamic'];
        
        const fitnessKeywords = ['fitness', 'workout', 'exercise', 'training', 'gym', 'health', 'muscle', 'strength', 'cardio', 'yoga', 'pilates', 'running', 'cycling', 'weight', 'diet', 'nutrition'];
        const gamingKeywords = ['gaming', 'game', 'play', 'stream', 'esports', 'competitive', 'tournament', 'victory', 'win', 'battle', 'arena'];
        const musicKeywords = ['music', 'song', 'concert', 'performance', 'live', 'acoustic', 'piano', 'guitar', 'singing', 'band', 'dj', 'electronic'];
        const cookingKeywords = ['cooking', 'food', 'recipe', 'chef', 'kitchen', 'bake', 'cook', 'meal', 'cuisine', 'baking', 'culinary'];
        const techKeywords = ['tech', 'technology', 'coding', 'programming', 'software', 'computer', 'digital', 'ai', 'artificial intelligence', 'development', 'app', 'web'];
        const artKeywords = ['art', 'design', 'creative', 'painting', 'drawing', 'illustration', 'graphic', 'visual', 'sketch', 'canvas'];
        const businessKeywords = ['business', 'entrepreneur', 'startup', 'marketing', 'finance', 'investment', 'strategy', 'leadership', 'management'];
        const educationKeywords = ['education', 'learning', 'study', 'tutorial', 'course', 'teaching', 'academic', 'school', 'university'];
        const travelKeywords = ['travel', 'adventure', 'exploration', 'vacation', 'tourism', 'destination', 'journey', 'trip'];
        const lifestyleKeywords = ['lifestyle', 'wellness', 'health', 'beauty', 'fashion', 'style', 'life', 'daily'];
        
        if (fitnessKeywords.some(keyword => title.toLowerCase().includes(keyword))) {
            searchQuery = 'fitness workout';
            styleNames = ['Fitness Motivation', 'Gym Workout', 'High Energy', 'Strength Training'];
        } else if (gamingKeywords.some(keyword => title.toLowerCase().includes(keyword))) {
            searchQuery = 'gaming setup';
            styleNames = ['Gaming Setup', 'Dark Gaming', 'Vibrant Gaming', 'Atmospheric'];
        } else if (musicKeywords.some(keyword => title.toLowerCase().includes(keyword))) {
            searchQuery = 'music performance';
            styleNames = ['Music Performance', 'Concert Vibes', 'Energetic Music', 'Artistic Music'];
        } else if (cookingKeywords.some(keyword => title.toLowerCase().includes(keyword))) {
            searchQuery = 'cooking food';
            styleNames = ['Culinary Art', 'Kitchen Master', 'Food Presentation', 'Chef Skills'];
        } else if (techKeywords.some(keyword => title.toLowerCase().includes(keyword))) {
            searchQuery = 'technology digital';
            styleNames = ['Tech Innovation', 'Digital Future', 'Modern Tech', 'Smart Solutions'];
        } else if (artKeywords.some(keyword => title.toLowerCase().includes(keyword))) {
            searchQuery = 'art creative';
            styleNames = ['Creative Art', 'Visual Design', 'Artistic Expression', 'Modern Art'];
        } else if (businessKeywords.some(keyword => title.toLowerCase().includes(keyword))) {
            searchQuery = 'business professional';
            styleNames = ['Business Professional', 'Corporate Success', 'Entrepreneurial', 'Modern Business'];
        } else if (educationKeywords.some(keyword => title.toLowerCase().includes(keyword))) {
            searchQuery = 'education learning';
            styleNames = ['Educational', 'Learning Environment', 'Academic Excellence', 'Knowledge Sharing'];
        } else if (travelKeywords.some(keyword => title.toLowerCase().includes(keyword))) {
            searchQuery = 'travel adventure';
            styleNames = ['Travel Adventure', 'Exploration', 'Destination', 'Journey'];
        } else if (lifestyleKeywords.some(keyword => title.toLowerCase().includes(keyword))) {
            searchQuery = 'lifestyle wellness';
            styleNames = ['Lifestyle', 'Wellness', 'Modern Living', 'Healthy Lifestyle'];
        }
        
        try {
            // Fetch images from Pexels API
            const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=8&orientation=landscape`, {
                headers: {
                    'Authorization': PEXELS_API_KEY
                }
            });
            
            if (!response.ok) {
                throw new Error(`Pexels API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.photos && data.photos.length > 0) {
                return data.photos.slice(0, 4).map((photo, index) => ({
                    url: photo.src.medium,
                    style: styleNames[index] || `Style ${index + 1}`,
                    photographer: photo.photographer,
                    originalUrl: photo.url
                }));
            } else {
                // Fallback to static images if API fails
                return this.getFallbackThumbnails(searchQuery, styleNames);
            }
        } catch (error) {
            console.error('Error fetching Pexels images:', error);
            // Fallback to static images
            return this.getFallbackThumbnails(searchQuery, styleNames);
        }
    }
    
    getFallbackThumbnails(searchQuery, styleNames) {
        // Fallback images for when API is unavailable
        const fallbackImages = {
            'fitness workout': [
                'https://images.pexels.com/photos/4056530/pexels-photo-4056530.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop',
                'https://images.pexels.com/photos/4056530/pexels-photo-4056530.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&brightness=0.8',
                'https://images.pexels.com/photos/4056530/pexels-photo-4056530.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&saturation=1.3',
                'https://images.pexels.com/photos/4056530/pexels-photo-4056530.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&contrast=1.2'
            ],
            'gaming setup': [
                'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop',
                'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&brightness=0.9',
                'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&saturation=1.4',
                'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&blur=1'
            ],
            'music performance': [
                'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop',
                'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&brightness=0.8',
                'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&saturation=1.2',
                'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&blur=0.5'
            ],
            'cooking food': [
                'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop',
                'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&brightness=0.9',
                'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&saturation=1.3',
                'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&contrast=1.1'
            ],
            'technology digital': [
                'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop',
                'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&brightness=0.8',
                'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&saturation=1.2',
                'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&contrast=1.3'
            ],
            'art creative': [
                'https://images.pexels.com/photos/1029243/pexels-photo-1029243.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop',
                'https://images.pexels.com/photos/1029243/pexels-photo-1029243.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&brightness=1.1',
                'https://images.pexels.com/photos/1029243/pexels-photo-1029243.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&saturation=1.4',
                'https://images.pexels.com/photos/1029243/pexels-photo-1029243.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&blur=0.3'
            ],
            'business professional': [
                'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop',
                'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&brightness=1.2',
                'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&saturation=1.1',
                'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&contrast=1.2'
            ],
            'education learning': [
                'https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop',
                'https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&brightness=1.1',
                'https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&saturation=1.2',
                'https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&contrast=1.1'
            ],
            'travel adventure': [
                'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop',
                'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&brightness=1.1',
                'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&saturation=1.3',
                'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&contrast=1.1'
            ],
            'lifestyle wellness': [
                'https://images.pexels.com/photos/4056530/pexels-photo-4056530.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop',
                'https://images.pexels.com/photos/4056530/pexels-photo-4056530.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&brightness=1.2',
                'https://images.pexels.com/photos/4056530/pexels-photo-4056530.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&saturation=1.1',
                'https://images.pexels.com/photos/4056530/pexels-photo-4056530.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&contrast=1.1'
            ],
            'default': [
                'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop',
                'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&brightness=1.2',
                'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&saturation=1.1',
                'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop&contrast=1.2'
            ]
        };
        
        const images = fallbackImages[searchQuery] || fallbackImages['default'];
        
        return images.map((url, index) => ({
            url: url,
            style: styleNames[index] || `Style ${index + 1}`,
            photographer: 'Pexels',
            originalUrl: url
        }));
    }

    getAIAnalyticsInsights() {
        return [
            { icon: "📈", text: "Best streaming time: 7-9 PM (your timezone)" },
            { icon: "👥", text: "Peak viewer engagement: Weekends" },
            { icon: "🎯", text: "Recommended stream duration: 2-3 hours" },
            { icon: "💬", text: "High chat activity during Q&A segments" },
            { icon: "💰", text: "Tips peak during gaming streams" }
        ];
    }

    getAIOverlaySuggestions() {
        return [
            { name: "Gaming Overlay", description: "Professional gaming stream layout with alerts" },
            { name: "Music Overlay", description: "Elegant music stream design with song info" },
            { name: "Talk Show Overlay", description: "Clean interview-style layout" },
            { name: "Minimal Overlay", description: "Simple, distraction-free design" }
        ];
    }

    // Selection methods
    selectTitle(title) {
        document.getElementById('streamTitle').value = title;
    }

    selectDescription(description) {
        document.getElementById('streamDescription').value = description;
    }

    selectMusic(title, artist) {
        // Add music to the stream
        this.selectedMusic = { title, artist };
        
        // Get attribution info automatically
        const attributionInfo = this.getMusicAttribution(title, artist);
        
        // Update the music display with attribution
        const musicDisplay = document.getElementById('selectedMusic');
        if (musicDisplay) {
            musicDisplay.innerHTML = `
                <div class="selected-music-item">
                    <div class="music-info">
                        <div class="music-title">${title}</div>
                        <div class="music-artist">${artist}</div>
                    </div>
                    <div class="music-attribution">
                        <small>${attributionInfo}</small>
                    </div>
                </div>
            `;
        }
        
        // Close the modal
        this.closeModal();
    }

    getMusicAttribution(title, artist) {
        // Determine source based on artist or genre patterns
        const source = this.determineMusicSource(title, artist);
        
        const attributionTemplates = {
            'Free Music Archive': `Music: "${title}" by ${artist} (CC BY 4.0) - Source: Free Music Archive`,
            'CCMixter': `Music: "${title}" by ${artist} (CC BY 4.0) - Source: CCMixter`,
            'Musopen': `Music: "${title}" by ${artist} (Public Domain) - Source: Musopen`,
            'Public Domain': `Music: "${title}" by ${artist} (Public Domain)`
        };
        
        return attributionTemplates[source] || `Music: "${title}" by ${artist} (Copyright-Free)`;
    }

    determineMusicSource(title, artist) {
        // Simple logic to determine source based on artist patterns
        const artistLower = artist.toLowerCase();
        const titleLower = title.toLowerCase();
        
        if (artistLower.includes('lo-fi') || artistLower.includes('ambient') || titleLower.includes('chill')) {
            return 'Free Music Archive';
        } else if (artistLower.includes('electronic') || artistLower.includes('edm') || titleLower.includes('beat')) {
            return 'CCMixter';
        } else if (artistLower.includes('symphony') || artistLower.includes('orchestra') || titleLower.includes('classical')) {
            return 'Musopen';
        } else if (artistLower.includes('traditional') || artistLower.includes('folk')) {
            return 'Public Domain';
        }
        
        // Default to Free Music Archive
        return 'Free Music Archive';
    }

    selectThumbnail(url, style) {
        const preview = document.getElementById('thumbnailPreview');
        const uploadArea = document.getElementById('thumbnailUploadArea');
        
        if (preview && uploadArea) {
            preview.innerHTML = `<img src="${url}" alt="AI Generated Thumbnail">`;
            preview.style.display = 'block';
            uploadArea.style.display = 'none';
        }
    }

    selectOverlay(name, description) {
        // Here you would typically apply the overlay to the stream
        // For now, we'll just show a success message
    }

    handleThumbnailFile(file) {
        const preview = document.getElementById('thumbnailPreview');
        const uploadArea = document.getElementById('thumbnailUploadArea');

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `<img src="${e.target.result}" alt="Thumbnail preview">`;
            preview.style.display = 'block';
            uploadArea.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    resetForm() {
        const form = document.getElementById('liveSetupForm');
        const preview = document.getElementById('thumbnailPreview');
        const uploadArea = document.getElementById('thumbnailUploadArea');
        
        if (form) {
            form.reset();
        }
        
        if (preview) {
            preview.innerHTML = '';
            preview.style.display = 'none';
        }
        
        if (uploadArea) {
            uploadArea.style.display = 'block';
        }
    }

    closeModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.remove('active');
        });
    }

    showScheduleStreamModal() {
        // Show schedule stream modal
        const modal = document.getElementById('scheduleStreamModal');
        if (modal) {
            modal.style.display = 'block';
        } else {
            // Create modal if it doesn't exist
            this.createScheduleStreamModal();
        }
    }

    createScheduleStreamModal() {
        const modalHTML = `
            <div id="scheduleStreamModal" class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>📅 Schedule Live Stream</h2>
                    <form id="scheduleStreamForm">
                        <div class="form-group">
                            <label for="scheduledTitle">Stream Title</label>
                            <input type="text" id="scheduledTitle" placeholder="Enter your stream title" required>
                        </div>
                        <div class="form-group">
                            <label for="scheduledDate">Date & Time</label>
                            <input type="datetime-local" id="scheduledDate" required>
                        </div>
                        <div class="form-group">
                            <label for="scheduledDescription">Description</label>
                            <textarea id="scheduledDescription" placeholder="Tell viewers what your stream is about"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="scheduledCategory">Category</label>
                            <select id="scheduledCategory">
                                <option value="">Select a category</option>
                                <option value="gaming">Gaming</option>
                                <option value="music">Music</option>
                                <option value="talk">Talk Show</option>
                                <option value="cooking">Cooking</option>
                                <option value="fitness">Fitness</option>
                                <option value="education">Education</option>
                                <option value="entertainment">Entertainment</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="scheduledPrivacy">Privacy</label>
                            <select id="scheduledPrivacy">
                                <option value="public">Public</option>
                                <option value="private">Private (Followers Only)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="scheduledEnableChat">
                                <span class="checkmark"></span>
                                Enable live chat
                            </label>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="scheduledEnableTips">
                                <span class="checkmark"></span>
                                Allow tips during stream
                            </label>
                        </div>
                        <div class="stream-setup-actions">
                            <button type="submit" class="btn btn-primary">Schedule Stream</button>
                            <button type="button" id="cancelSchedule" class="btn btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add event listeners for the new modal
        const modal = document.getElementById('scheduleStreamModal');
        const closeBtn = modal.querySelector('.close');
        const cancelBtn = document.getElementById('cancelSchedule');
        const form = document.getElementById('scheduleStreamForm');
        
        if (closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');
        if (cancelBtn) cancelBtn.addEventListener('click', () => modal.style.display = 'none');
        if (form) form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.scheduleStream();
        });
        
        modal.style.display = 'block';
    }

    async scheduleStream() {
        try {
            const title = document.getElementById('scheduledTitle').value.trim();
            const scheduledDate = document.getElementById('scheduledDate').value;
            const description = document.getElementById('scheduledDescription').value.trim();
            const category = document.getElementById('scheduledCategory').value;
            const privacy = document.getElementById('scheduledPrivacy').value;
            const enableChat = document.getElementById('scheduledEnableChat').checked;
            const enableTips = document.getElementById('scheduledEnableTips').checked;

            if (!title || !scheduledDate) {
                alert('Please enter a title and scheduled date');
                return;
            }

            const scheduledTime = new Date(scheduledDate);
            if (scheduledTime <= new Date()) {
                alert('Scheduled time must be in the future');
                return;
            }

            const streamData = {
                title: title,
                description: description,
                category: category,
                privacy: privacy,
                enableChat: enableChat,
                enableTips: enableTips,
                streamerId: this.currentUser.uid,
                streamerName: this.userProfile?.displayName || 'Anonymous',
                streamerPic: this.userProfile?.profilePic || '',
                status: 'scheduled',
                scheduledTime: scheduledTime,
                createdAt: new Date()
            };

            await db.collection('scheduledStreams').add(streamData);
            
            // Close modal
            const modal = document.getElementById('scheduleStreamModal');
            if (modal) modal.style.display = 'none';
            
        } catch (error) {
            console.error('Error scheduling stream:', error);
        }
    }

    async start247Stream() {
        try {
            // Check if 24/7 stream is already running
            const existingStream = await db.collection('liveStreams')
                .where('streamerId', '==', this.currentUser.uid)
                .where('status', '==', '247')
                .get();
            
            if (!existingStream.empty) {
                return;
            }

            // Start 24/7 stream
            const streamData = {
                title: '24/7 Live Stream',
                description: 'Continuous live stream',
                streamerId: this.currentUser.uid,
                streamerName: this.userProfile?.displayName || 'Anonymous',
                streamerPic: this.userProfile?.profilePic || '',
                status: '247',
                startedAt: new Date(),
                createdAt: new Date()
            };

            const streamRef = await db.collection('liveStreams').add(streamData);
            this.currentStream = streamRef.id;
            
            this.showLivePlayer();
            
        } catch (error) {
            console.error('Error starting 24/7 stream:', error);
        }
    }

    async show247Status() {
        try {
            const streams = await db.collection('liveStreams')
                .where('status', '==', '247')
                .get();
            
            let statusMessage = 'No 24/7 streams currently running.';
            
            if (!streams.empty) {
                const stream = streams.docs[0].data();
                const duration = this.formatDuration(stream.startedAt.toDate());
                statusMessage = `24/7 stream running for ${duration}`;
            }
            
            
        } catch (error) {
            console.error('Error checking 24/7 status:', error);
        }
    }



    // --- Analytics tracking ---
    analytics = {
        viewerSamples: [],
        chatCount: 0,
        startTime: null,
        endTime: null,
        totalViewers: new Set(),
    };

    async startLiveStream() {
        this.analytics = { viewerSamples: [], chatCount: 0, startTime: new Date(), endTime: null, totalViewers: new Set() };
        try {
            const title = document.getElementById('streamTitle').value.trim();
            const description = document.getElementById('streamDescription').value.trim();
            const category = document.getElementById('streamCategory').value;
            const privacy = document.getElementById('streamPrivacy').value;
            const enableChat = document.getElementById('enableChat').checked;
            const enableTips = document.getElementById('enableTips').checked;

            if (!title) {
                alert('Please enter a stream title');
                return;
            }

            // Handle thumbnail upload if present
            let thumbnailUrl = '';
            if (this.selectedThumbnailFile) {
                const storageRef = storage.ref();
                const fileRef = storageRef.child(`stream_thumbnails/${Date.now()}_${this.selectedThumbnailFile.name}`);
                const snapshot = await fileRef.put(this.selectedThumbnailFile);
                thumbnailUrl = await snapshot.ref.getDownloadURL();
            }

            // Request camera and microphone access
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            // Create stream document
            const streamData = {
                title: title,
                description: description,
                category: category,
                privacy: privacy,
                enableChat: enableChat,
                enableTips: enableTips,
                streamerId: this.currentUser.uid,
                streamerName: this.userProfile?.displayName || 'Anonymous',
                streamerPic: this.userProfile?.profilePic || '',
                thumbnailUrl: thumbnailUrl,
                status: 'live',
                viewerCount: 0,
                startedAt: new Date(),
                createdAt: new Date()
            };

            const streamRef = await db.collection('liveStreams').add(streamData);
            this.currentStream = streamRef.id;
            // Notify followers
            await this.notifyFollowersOfLive(streamData, streamRef.id);

            // Start streaming
            await this.startStreaming(this.mediaStream, this.currentStream);

            // Close modal and show live player
            this.closeLiveSetupModal();
            this.showLivePlayer();

            // Start viewer count listener
            this.listenForViewers(this.currentStream);
            // Start analytics sampling
            this.startAnalyticsSampling(this.currentStream);

            // Start chat if enabled
            if (enableChat) {
                this.setupLiveChat(this.currentStream);
            }

        } catch (error) {
            console.error('Error starting live stream:', error);
            if (error.name === 'NotAllowedError') {
                alert('Camera and microphone access is required to start a live stream.');
            } else {
                alert('Failed to start live stream. Please try again.');
            }
        }
    }

    async startStreaming(mediaStream, streamId) {
        const videoElement = document.getElementById('liveVideo');
        if (videoElement) {
            videoElement.srcObject = mediaStream;
            videoElement.play();
        }

        this.isStreaming = true;
        this.startStreamTimer();
    }

    startStreamTimer() {
        const startTime = new Date();
        this.streamTimer = setInterval(() => {
            const elapsed = new Date() - startTime;
            const hours = Math.floor(elapsed / 3600000);
            const minutes = Math.floor((elapsed % 3600000) / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            // Update stream duration in database
            if (this.currentStream) {
                db.collection('liveStreams').doc(this.currentStream).update({
                    duration: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                });
            }
        }, 1000);
    }

    showLivePlayer() {
        const livePlayer = document.getElementById('livePlayer');
        const startLiveBtn = document.getElementById('startLiveBtn');
        
        if (livePlayer) livePlayer.style.display = 'block';
        if (startLiveBtn) startLiveBtn.style.display = 'none';
    }

    async endLiveStream() {
        if (confirm('Are you sure you want to end the live stream?')) {
            try {
                // Stop media stream
                if (this.mediaStream) {
                    this.mediaStream.getTracks().forEach(track => track.stop());
                }

                // Stop timer
                if (this.streamTimer) {
                    clearInterval(this.streamTimer);
                }

                // Update stream status and analytics
                if (this.currentStream) {
                    this.analytics.endTime = new Date();
                    const avgViewers = this.analytics.viewerSamples.length > 0 ?
                        Math.round(this.analytics.viewerSamples.reduce((a, b) => a + b, 0) / this.analytics.viewerSamples.length) : 0;
                    // Sum all tips for this stream
                    let totalTips = 0;
                    const tipsSnapshot = await db.collection('tips')
                        .where('streamId', '==', this.currentStream)
                        .get();
                    tipsSnapshot.forEach(doc => {
                        const tip = doc.data();
                        totalTips += typeof tip.amount === 'number' ? tip.amount : 0;
                    });
                    await db.collection('liveStreams').doc(this.currentStream).update({
                        status: 'ended',
                        endedAt: this.analytics.endTime,
                        analytics: {
                            avgViewers,
                            totalViewers: Array.from(this.analytics.totalViewers).length,
                            chatCount: this.analytics.chatCount,
                            duration: this.getStreamDurationString(),
                            totalTips: totalTips.toFixed(2)
                        }
                    });
                }

                // Hide live player and show start button
                const livePlayer = document.getElementById('livePlayer');
                const startLiveBtn = document.getElementById('startLiveBtn');
                
                if (livePlayer) livePlayer.style.display = 'none';
                if (startLiveBtn) startLiveBtn.style.display = 'block';

                this.isStreaming = false;
                this.currentStream = null;
                this.mediaStream = null;

                alert('Live stream ended successfully');

            } catch (error) {
                console.error('Error ending live stream:', error);
                alert('Failed to end live stream');
            }
        }
    }

    async loadActiveStreams() {
        try {
            const streamsSnapshot = await db.collection('liveStreams')
                .where('status', '==', 'live')
                .orderBy('startedAt', 'desc')
                .get();

            const activeStreams = [];
            streamsSnapshot.forEach(doc => {
                activeStreams.push({ id: doc.id, ...doc.data() });
            });

            this.renderActiveStreams(activeStreams);
        } catch (error) {
            console.error('Error loading active streams:', error);
        }
    }

    renderActiveStreams(streams) {
        const activeStreamsContainer = document.getElementById('activeStreams');
        const noStreamsElement = document.getElementById('noLiveStreams');
        
        if (!activeStreamsContainer) return;

        activeStreamsContainer.innerHTML = '';

        if (streams.length === 0) {
            if (noStreamsElement) noStreamsElement.style.display = 'block';
            return;
        }

        if (noStreamsElement) noStreamsElement.style.display = 'none';

        streams.forEach(stream => {
            const streamElement = this.createStreamElement(stream);
            activeStreamsContainer.appendChild(streamElement);
        });
    }

    createStreamElement(stream) {
        const streamDiv = document.createElement('div');
        streamDiv.className = 'stream-card';
        streamDiv.onclick = () => this.joinLiveStream(stream.id);
        
        // Use different fallback images to avoid duplicate avatars
        const thumbnailSrc = stream.thumbnailUrl || 'hero-image.svg';
        const streamerSrc = stream.streamerPic || 'assets/images/default-avatar.svg';
        
        streamDiv.innerHTML = `
            <div class="stream-thumbnail">
                <img src="${thumbnailSrc}" alt="Stream thumbnail">
                <div class="live-badge">LIVE</div>
                <div class="viewer-count">${stream.viewerCount || 0} viewers</div>
            </div>
            <div class="stream-info">
                <h3 class="stream-title">${stream.title}</h3>
                <div class="stream-meta">
                    <span class="stream-category">${stream.category || 'General'}</span>
                    <span class="stream-duration">${this.formatDuration(stream.startedAt)}</span>
                </div>
                <div class="stream-author">
                    <img src="${streamerSrc}" alt="Streamer">
                    <span>${stream.streamerName}</span>
                </div>
            </div>
        `;

        return streamDiv;
    }

    async getViewerList(streamId) {
        // Get all viewer docs for this stream
        const snapshot = await db.collection('liveStreams').doc(streamId).collection('viewers').get();
        const viewers = [];
        snapshot.forEach(doc => viewers.push(doc.data()));
        return viewers;
    }

    listenForViewerList(streamId, container) {
        db.collection('liveStreams').doc(streamId).collection('viewers')
            .onSnapshot(snapshot => {
                const viewers = [];
                snapshot.forEach(doc => viewers.push(doc.data()));
                container.innerHTML = viewers.map(v => `
                    <div class='viewer-item' style='display:inline-flex;align-items:center;gap:0.3rem;margin-right:0.7rem;margin-bottom:0.5rem;'>
                        <img src='${v.profilePic || 'assets/images/default-avatar.svg'}' alt='${v.displayName || 'User'}' style='width:28px;height:28px;border-radius:50%;border:1.5px solid #e5e7eb;'>
                        <span style='font-size:0.97rem;color:#444;'>${v.displayName || 'User'}</span>
                    </div>
                `).join('');
            });
    }

    async joinLiveStream(streamId) {
        // For analytics: add user to totalViewers set
        if (this.analytics && this.currentUser) this.analytics.totalViewers.add(this.currentUser.uid);
        try {
            // Get stream data
            const streamDoc = await db.collection('liveStreams').doc(streamId).get();
            if (!streamDoc.exists) {
                alert('Stream not found');
                return;
            }

            const stream = streamDoc.data();

            // Increment viewer count
            await db.collection('liveStreams').doc(streamId).update({
                viewerCount: firebase.firestore.FieldValue.increment(1)
            });

            // Add current user to viewers list
            await this.addCurrentUserToViewers(streamId);

            // Show stream in modal or redirect to stream page
            this.showStreamModal(stream, streamId);

        } catch (error) {
            console.error('Error joining live stream:', error);
            alert('Failed to join live stream');
        }
    }

    showStreamModal(stream, streamId) {
        // Create modal for viewing stream
        const modal = document.createElement('div');
        modal.className = 'modal stream-view-modal';
        // Analytics display for ended streams
        let analyticsHtml = '';
        if (stream.status === 'ended' && stream.analytics) {
            analyticsHtml = `
                <div class='stream-analytics' style='margin-top:1.2rem;padding:0.7rem 0 0.2rem 0;border-top:1px solid #e5e7eb;'>
                    <div style='font-weight:600;color:#6366f1;margin-bottom:0.3rem;'>Stream Analytics</div>
                    <div style='display:flex;flex-wrap:wrap;gap:1.2rem;font-size:0.98rem;'>
                        <div><strong>Avg. Viewers:</strong> ${stream.analytics.avgViewers || 0}</div>
                        <div><strong>Total Viewers:</strong> ${stream.analytics.totalViewers || 0}</div>
                        <div><strong>Chat Messages:</strong> ${stream.analytics.chatCount || 0}</div>
                        <div><strong>Duration:</strong> ${stream.analytics.duration || ''}</div>
                        <div><strong>Total Tips:</strong> $${stream.analytics.totalTips || '0.00'}</div>
                    </div>
                </div>
            `;
        }
        modal.innerHTML = `
            <div class="modal-content large">
                <span class="close">&times;</span>
                <div class="stream-view-container" style="display:flex;gap:2rem;flex-wrap:wrap;align-items:flex-start;">
                    <div class="stream-video" style="flex:2;min-width:320px;">
                        <video id="streamVideo" controls autoplay style="width:100%;border-radius:1rem;"></video>
                        <div class="stream-overlay" style="display:flex;align-items:center;gap:1rem;margin-top:0.7rem;">
                            <div class="live-indicator">
                                <span class="live-dot"></span>
                                <span>${stream.status === 'ended' ? 'ENDED' : 'LIVE'}</span>
                            </div>
                            <div class="stream-info-overlay" style="flex:1;">
                                <h3 style="margin-bottom:0.3rem;">${stream.title}</h3>
                                <div style="color:#6366f1;font-size:0.98rem;margin-bottom:0.2rem;">${stream.category || 'General'}</div>
                                <p style="color:#444;font-size:1rem;margin-bottom:0.5rem;">${stream.description || ''}</p>
                                <div style="display:flex;align-items:center;gap:0.7rem;">
                                    <img src="${stream.streamerPic || 'assets/images/default-avatar.svg'}" alt="Streamer" style="width:36px;height:36px;border-radius:50%;border:2px solid #e5e7eb;">
                                    <span style="font-weight:600;">${stream.streamerName}</span>
                                    <button class="btn btn-secondary" id="followStreamerBtn" style="margin-left:1rem;">Follow</button>
                                </div>
                            </div>
                        </div>
                        <div class="viewer-list" id="viewerListContainer" style="margin-top:1.2rem;padding:0.7rem 0 0.2rem 0;border-top:1px solid #e5e7eb;">
                            <div style="font-weight:600;color:#6366f1;margin-bottom:0.3rem;">Current Viewers</div>
                            <div id="viewerList" style="display:flex;flex-wrap:wrap;align-items:center;"></div>
                        </div>
                        ${analyticsHtml}
                    </div>
                    <div class="stream-chat" style="flex:1;min-width:260px;">
                        <div class="chat-header">
                            <h3>Live Chat</h3>
                            <span id="streamViewerCount">${stream.viewerCount || 0} viewers</span>
                        </div>
                        <div id="streamChatMessages" class="chat-messages"></div>
                        <form id="streamChatForm" class="chat-form">
                            <input type="text" id="streamChatInput" placeholder="Type a message...">
                            <button type="submit" class="btn btn-primary">Send</button>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'block';

        // Setup chat
        this.setupStreamChat(streamId);

        // Setup viewer list
        const viewerList = modal.querySelector('#viewerList');
        if (viewerList) {
            this.listenForViewerList(streamId, viewerList);
        }

        // Follow button logic (demo)
        const followBtn = modal.querySelector('#followStreamerBtn');
        if (followBtn) {
            followBtn.addEventListener('click', () => {
                alert('Followed streamer: ' + stream.streamerName);
            });
        }

        // Close modal
        modal.querySelector('.close').onclick = () => {
            document.body.removeChild(modal);
        };

        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        };
    }

    setupStreamChat(streamId) {
        // Listen for chat messages
        db.collection('liveChat')
            .where('streamId', '==', streamId)
            .orderBy('createdAt', 'asc')
            .onSnapshot((snapshot) => {
                const chatMessages = document.getElementById('streamChatMessages');
                if (!chatMessages) return;

                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const message = change.doc.data();
                        const messageElement = document.createElement('div');
                        messageElement.className = 'chat-message';
                        messageElement.innerHTML = `
                            <span class="author">${message.authorName}:</span>
                            <span class="text">${message.text}</span>
                        `;
                        chatMessages.appendChild(messageElement);
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }
                });
            });

        // Setup chat form
        const chatForm = document.getElementById('streamChatForm');
        const chatInput = document.getElementById('streamChatInput');
        
        if (chatForm) {
            chatForm.onsubmit = async (e) => {
                e.preventDefault();
                await this.sendStreamChatMessage(streamId, chatInput.value);
                chatInput.value = '';
            };
        }
    }

    async isUserTimedOut(userId, streamId) {
        // Check Firestore for a timeout record
        const doc = await db.collection('liveChatTimeouts').doc(`${streamId}_${userId}`).get();
        if (!doc.exists) return false;
        const data = doc.data();
        if (!data || !data.timeoutUntil) return false;
        return new Date() < data.timeoutUntil.toDate();
    }

    async timeoutUser(userId, streamId, minutes = 5) {
        const timeoutUntil = new Date(Date.now() + minutes * 60000);
        await db.collection('liveChatTimeouts').doc(`${streamId}_${userId}`).set({
            userId,
            streamId,
            timeoutUntil
        });
    }

    async sendStreamChatMessage(streamId, text) {
        // Increment chat count for analytics
        if (this.analytics) this.analytics.chatCount++;
        if (!text.trim()) return;

        // Check if user is timed out
        if (await this.isUserTimedOut(this.currentUser.uid, streamId)) {
            alert('You are timed out and cannot send messages for a few minutes.');
            return;
        }

        try {
            const messageData = {
                streamId: streamId,
                authorId: this.currentUser.uid,
                authorName: this.userProfile?.displayName || 'Anonymous',
                authorPic: this.userProfile?.profilePic || '',
                text: text.trim(),
                createdAt: new Date()
            };

            await db.collection('liveChat').add(messageData);
        } catch (error) {
            console.error('Error sending chat message:', error);
        }
    }

    async listenForViewers(streamId) {
        // Listen for viewer count changes
        db.collection('liveStreams').doc(streamId)
            .onSnapshot((doc) => {
                const data = doc.data();
                if (data) {
                    this.viewerCount = data.viewerCount || 0;
                    const viewerCountElement = document.getElementById('viewerCount');
                    if (viewerCountElement) {
                        viewerCountElement.textContent = `${this.viewerCount} viewers`;
                    }
                }
            });
    }

    setupLiveChat(streamId) {
        // Listen for chat messages
        db.collection('liveChat')
            .where('streamId', '==', streamId)
            .orderBy('createdAt', 'asc')
            .onSnapshot((snapshot) => {
                const chatMessages = document.getElementById('liveChatMessages');
                if (!chatMessages) return;

                // Track if user is at bottom before rendering
                const isAtBottom = chatMessages.scrollTop + chatMessages.clientHeight >= chatMessages.scrollHeight - 10;

                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const message = change.doc.data();
                        const messageElement = document.createElement('div');
                        messageElement.className = 'chat-message';
                        // Moderator controls (delete/timeout)
                        let modControls = '';
                        if (this.currentUser && (this.currentUser.isModerator || this.currentUser.uid === message.authorId)) {
                            modControls = `<span class='mod-action' style='color:#ef4444;cursor:pointer;margin-left:8px;' data-action='delete' title='Delete'>🗑️</span>`;
                            if (this.currentUser.isModerator && this.currentUser.uid !== message.authorId) {
                                modControls += `<span class='mod-action' style='color:#f59e0b;cursor:pointer;margin-left:8px;' data-action='timeout' title='Timeout'>⏰</span>`;
                            }
                        }
                        messageElement.innerHTML = `
                            <img class="chat-avatar" src="${message.authorPic || 'assets/images/default-avatar.svg'}" alt="User">
                            <div class="chat-message-content">
                                <div class="chat-message-header">
                                    <a href="#" class="chat-author" data-uid="${message.authorId}" style="color:#6366f1;text-decoration:underline;">${message.authorName}</a>
                                    <span class="chat-timestamp">${this.formatChatTimestamp(message.createdAt)}</span>
                                    ${modControls}
                                </div>
                                <div class="chat-text">${message.text}</div>
                            </div>
                        `;
                        // Moderator delete action
                        messageElement.querySelectorAll('.mod-action[data-action="delete"]').forEach(btn => {
                            btn.addEventListener('click', async (e) => {
                                e.stopPropagation();
                                if (confirm('Delete this message?')) {
                                    await db.collection('liveChat').doc(change.doc.id).delete();
                                }
                            });
                        });
                        // Moderator timeout action
                        messageElement.querySelectorAll('.mod-action[data-action="timeout"]').forEach(btn => {
                            btn.addEventListener('click', async (e) => {
                                e.stopPropagation();
                                if (confirm('Timeout this user for 5 minutes?')) {
                                    await this.timeoutUser(message.authorId, streamId, 5);
                                    alert('User has been timed out for 5 minutes.');
                                }
                            });
                        });
                        // Clickable username
                        messageElement.querySelectorAll('.chat-author').forEach(link => {
                            link.addEventListener('click', (e) => {
                                e.preventDefault();
                                alert('Show user profile for UID: ' + message.authorId);
                            });
                        });
                        chatMessages.appendChild(messageElement);
                    }
                });
                // Auto-scroll only if user was at bottom
                if (isAtBottom) {
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
            });
    }

    formatChatTimestamp(ts) {
        if (!ts) return '';
        const date = ts.toDate ? ts.toDate() : new Date(ts);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    sendLiveChatMessage() {
        const chatInput = document.getElementById('liveChatInput');
        if (!chatInput || !this.currentStream) return;

        const text = chatInput.value.trim();
        if (!text) return;

        this.sendStreamChatMessage(this.currentStream, text);
        chatInput.value = '';
    }

    toggleChat() {
        const liveChat = document.getElementById('liveChat');
        if (liveChat) {
            liveChat.style.display = liveChat.style.display === 'none' ? 'block' : 'none';
        }
    }

    formatDuration(startTime) {
        const now = new Date();
        // Handle both Firestore timestamps and regular Date objects
        const start = startTime && typeof startTime.toDate === 'function' ? startTime.toDate() : new Date(startTime);
        const diffInSeconds = Math.floor((now - start) / 1000);
        
        const hours = Math.floor(diffInSeconds / 3600);
        const minutes = Math.floor((diffInSeconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }

    async handleLogout() {
        try {
            // End stream if currently streaming
            if (this.isStreaming) {
                await this.endLiveStream();
            }
            
            await auth.signOut();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    async loadHistoryStreams(initial = false) {
        if (this.isLoadingHistory || this.allHistoryLoaded) return;
        this.isLoadingHistory = true;
        try {
            let query = db.collection('liveStreams')
                .where('status', '==', 'ended')
                .orderBy('startedAt', 'desc')
                .limit(this.historyPageSize);
            if (this.lastHistoryDoc && !initial) {
                query = query.startAfter(this.lastHistoryDoc);
            }
            const streamsSnapshot = await query.get();
            if (streamsSnapshot.empty) {
                this.allHistoryLoaded = true;
                this.isLoadingHistory = false;
                return;
            }
            const historyStreams = [];
            streamsSnapshot.forEach(doc => {
                historyStreams.push({ id: doc.id, ...doc.data() });
            });
            this.lastHistoryDoc = streamsSnapshot.docs[streamsSnapshot.docs.length - 1];
            this.renderHistoryStreams(historyStreams, !initial);
        } catch (error) {
            console.error('Error loading history streams:', error);
        }
        this.isLoadingHistory = false;
    }

    renderHistoryStreams(streams, append = false) {
        const historyStreamsContainer = document.getElementById('historyStreams');
        const noHistoryElement = document.getElementById('noHistoryStreams');
        if (!historyStreamsContainer) return;

        if (!append) historyStreamsContainer.innerHTML = '';

        if (streams.length === 0 && !append) {
            if (noHistoryElement) noHistoryElement.style.display = 'block';
            return;
        }
        if (noHistoryElement) noHistoryElement.style.display = 'none';

        streams.forEach(stream => {
            const streamElement = this.createHistoryStreamElement(stream);
            historyStreamsContainer.appendChild(streamElement);
        });
    }

    createHistoryStreamElement(stream) {
        const streamDiv = document.createElement('div');
        streamDiv.className = 'stream-card';
        streamDiv.onclick = () => this.joinLiveStream(stream.id);
        const isEnded = stream.status === 'ended';
        streamDiv.innerHTML = `
            <div class="stream-thumbnail" style="position:relative;">
                <img src="${stream.thumbnailUrl || stream.streamerPic || 'assets/images/default-avatar.svg'}" alt="Stream thumbnail">
                <div class="live-badge" style="background:${isEnded ? '#aaa' : '#ef4444'};color:#fff;position:absolute;top:10px;left:10px;padding:2px 10px;border-radius:8px;font-size:0.95rem;">${isEnded ? 'ENDED' : 'LIVE'}</div>
                <div class="viewer-count">${stream.viewerCount || 0} viewers</div>
            </div>
            <div class="stream-info">
                <h3 class="stream-title">${stream.title}</h3>
                <div class="stream-meta">
                    <span class="stream-category">${stream.category || 'General'}</span>
                    <span class="stream-duration">${this.formatDuration(stream.startedAt)}</span>
                </div>
                <div class="stream-author">
                    <img src="${stream.streamerPic || 'assets/images/default-avatar.svg'}" alt="Streamer">
                    <span>${stream.streamerName}</span>
                </div>
            </div>
        `;
        return streamDiv;
    }

    // When a user joins a stream, add them to the viewers subcollection
    async addCurrentUserToViewers(streamId) {
        if (!this.currentUser) return;
        await db.collection('liveStreams').doc(streamId).collection('viewers').doc(this.currentUser.uid).set({
            uid: this.currentUser.uid,
            displayName: this.userProfile?.displayName || 'Anonymous',
            profilePic: this.userProfile?.profilePic || ''
        }, { merge: true });
    }

    startAnalyticsSampling(streamId) {
        // Sample viewer count every 10 seconds
        this.analyticsSamplingInterval = setInterval(async () => {
            const doc = await db.collection('liveStreams').doc(streamId).get();
            if (doc.exists) {
                const data = doc.data();
                this.analytics.viewerSamples.push(data.viewerCount || 0);
            }
        }, 10000);
    }

    getStreamDurationString() {
        if (!this.analytics.startTime || !this.analytics.endTime) return '';
        const diff = this.analytics.endTime - this.analytics.startTime;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    async notifyFollowersOfLive(streamData, streamId) {
        // Fetch followers from users/{streamerId}/followers subcollection
        const followersSnapshot = await db.collection('users').doc(streamData.streamerId).collection('followers').get();
        const batch = db.batch();
        followersSnapshot.forEach(doc => {
            const followerId = doc.id;
            const notifRef = db.collection('notifications').doc();
            batch.set(notifRef, {
                userId: followerId,
                type: 'live',
                streamerId: streamData.streamerId,
                streamerName: streamData.streamerName,
                streamId: streamId,
                title: `${streamData.streamerName} is live!`,
                message: `${streamData.streamerName} just started a live stream: "${streamData.title}"`,
                createdAt: new Date(),
                read: false
            });
        });
        if (!followersSnapshot.empty) await batch.commit();
    }
}

// Initialize the live page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.livePage = new LivePage();
}); 