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
        await this.setupAuthStateListener();
        this.setupEventListeners();
        this.loadActiveStreams();
        this.loadHistoryStreams(true);
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
            // Only check authentication after auth state is known
            this.checkAuthentication();
        });
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
            modal.style.display = 'block';
        }
    }

    closeLiveSetupModal() {
        const modal = document.getElementById('liveSetupModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    closeModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
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
        streamDiv.innerHTML = `
            <div class="stream-thumbnail">
                <img src="${stream.thumbnailUrl || stream.streamerPic || 'default-avatar.svg'}" alt="Stream thumbnail">
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
                    <img src="${stream.streamerPic || 'default-avatar.svg'}" alt="Streamer">
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
                        <img src='${v.profilePic || 'default-avatar.svg'}' alt='${v.displayName || 'User'}' style='width:28px;height:28px;border-radius:50%;border:1.5px solid #e5e7eb;'>
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
                                    <img src="${stream.streamerPic || 'default-avatar.svg'}" alt="Streamer" style="width:36px;height:36px;border-radius:50%;border:2px solid #e5e7eb;">
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
                            <img class="chat-avatar" src="${message.authorPic || 'default-avatar.svg'}" alt="User">
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
                <img src="${stream.thumbnailUrl || stream.streamerPic || 'default-avatar.svg'}" alt="Stream thumbnail">
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
                    <img src="${stream.streamerPic || 'default-avatar.svg'}" alt="Streamer">
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