// Free Live Streaming System for Amplifi
// Professional live streaming - creators stream from their devices

class FreeLiveStreaming {
    constructor() {
        this.currentStream = null;
        this.streamViewers = new Map();
        this.isStreaming = false;
        this.streamStartTime = null;
        this.viewerCount = 0;
        this.chatMessages = [];
        
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing Free Live Streaming System...');
            this.setupEventListeners();
            this.loadActiveStreams();
            console.log('✅ Free Live Streaming System initialized');
        } catch (error) {
            console.error('❌ Error initializing Free Live Streaming:', error);
        }
    }

    setupEventListeners() {
        // Start streaming button
        const startStreamBtn = document.getElementById('startStreamBtn');
        if (startStreamBtn) {
            startStreamBtn.addEventListener('click', () => this.showStreamSetup());
        }

        // Join stream button
        const joinStreamBtn = document.getElementById('joinStreamBtn');
        if (joinStreamBtn) {
            joinStreamBtn.addEventListener('click', () => this.joinRandomStream());
        }

        // Stream setup form
        const streamForm = document.getElementById('streamSetupForm');
        if (streamForm) {
            streamForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.startStream();
            });
        }
    }

    // Show stream setup modal
    showStreamSetup() {
        if (!window.app || !window.app.currentUser) {
            alert('Please sign in to start streaming');
            return;
        }

        const modal = document.getElementById('streamSetupModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    // Start a live stream
    async startStream() {
        try {
            const title = document.getElementById('streamTitle').value;
            const description = document.getElementById('streamDescription').value;
            const category = document.getElementById('streamCategory').value;
            const privacy = document.getElementById('streamPrivacy').value;

            if (!title.trim()) {
                alert('Please enter a stream title');
                return;
            }

            // Get user media (camera and microphone)
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            // Create stream container
            const streamContainer = this.createStreamContainer(title, description, category);
            
            // Start streaming
            this.currentStream = {
                id: 'stream_' + Date.now(),
                title: title,
                description: description,
                category: category,
                privacy: privacy,
                creatorId: window.app.currentUser.uid,
                creatorName: window.app.currentUser.displayName || 'Anonymous',
                creatorPic: window.app.currentUser.photoURL || '',
                startTime: new Date(),
                viewerCount: 0,
                status: 'live',
                mediaStream: mediaStream,
                totalViewers: 0,
                peakViewers: 0,
                chatMessageCount: 0
            };

            // Display stream
            this.displayStream(this.currentStream, streamContainer);
            
            // Close setup modal
            document.getElementById('streamSetupModal').style.display = 'none';
            
            // Reset form
            document.getElementById('streamSetupForm').reset();
            
            // Update UI
            this.updateStreamingUI(true);
            
            // Start stream monitoring
            this.startStreamMonitoring();
            
            console.log('🎥 Live stream started:', title);
            
        } catch (error) {
            console.error('❌ Error starting stream:', error);
            if (error.name === 'NotAllowedError') {
                alert('Camera and microphone access is required to start streaming');
            } else {
                alert('Failed to start stream: ' + error.message);
            }
        }
    }

    // Start stream monitoring for long streams
    startStreamMonitoring() {
        if (!this.currentStream) return;

        // Update stream duration every second
        this.durationInterval = setInterval(() => {
            this.updateStreamDuration();
        }, 1000);

        // Check stream health every 30 seconds
        this.healthInterval = setInterval(() => {
            this.checkStreamHealth();
        }, 30000);

        // Show stream tips every hour
        this.tipsInterval = setInterval(() => {
            this.showStreamTips();
        }, 3600000); // 1 hour
    }

    // Update stream duration display
    updateStreamDuration() {
        if (!this.currentStream) return;

        const duration = new Date() - this.currentStream.startTime;
        const hours = Math.floor(duration / 3600000);
        const minutes = Math.floor((duration % 3600000) / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);

        const durationElement = document.getElementById('streamDuration');
        if (durationElement) {
            durationElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        // Update total viewers (simulate new viewers joining)
        if (Math.random() > 0.8) {
            this.currentStream.totalViewers++;
        }
    }

    // Check stream health
    checkStreamHealth() {
        if (!this.currentStream || !this.currentStream.mediaStream) return;

        const tracks = this.currentStream.mediaStream.getTracks();
        let hasVideo = false;
        let hasAudio = false;

        tracks.forEach(track => {
            if (track.kind === 'video' && track.readyState === 'live') {
                hasVideo = true;
            }
            if (track.kind === 'audio' && track.readyState === 'live') {
                hasAudio = true;
            }
        });

        // Show health status
        if (!hasVideo || !hasAudio) {
            this.showStreamHealthWarning(hasVideo, hasAudio);
        }
    }

    // Show stream health warning
    showStreamHealthWarning(hasVideo, hasAudio) {
        const warning = document.createElement('div');
        warning.className = 'stream-health-warning';
        warning.innerHTML = `
            <div class="warning-content">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Stream Health Warning:</span>
                ${!hasVideo ? 'Video stream interrupted' : ''}
                ${!hasAudio ? 'Audio stream interrupted' : ''}
                <button onclick="this.parentElement.parentElement.remove()">Dismiss</button>
            </div>
        `;

        const streamContainer = document.querySelector('.live-stream-container');
        if (streamContainer) {
            streamContainer.appendChild(warning);
        }
    }

    // Show stream tips for long streams
    showStreamTips() {
        const tips = [
            '💡 Take a short break every 2-3 hours to stay fresh',
            '💡 Stay hydrated and take care of yourself',
            '💡 Engage with your chat to keep viewers interested',
            '💡 Consider scheduling breaks for longer streams',
            '💡 Monitor your stream health and viewer engagement'
        ];

        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        
        // Show tip as a toast notification
        this.showToast(randomTip, 'info');
    }

    // Show toast notification
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;

        document.body.appendChild(toast);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    // Create stream container
    createStreamContainer(title, description, category) {
        const container = document.createElement('div');
        container.className = 'live-stream-container';
        container.innerHTML = `
            <div class="stream-header">
                <div class="stream-info">
                    <h3>${title}</h3>
                    <p>${description}</p>
                    <span class="category">${category}</span>
                </div>
                <div class="stream-controls">
                    <div class="stream-stats">
                        <div class="stat-item">
                            <i class="fas fa-clock"></i>
                            <span id="streamDuration">00:00:00</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-users"></i>
                            <span id="totalViewers">0</span> total
                        </div>
                    </div>
                    <button class="btn btn-danger" onclick="freeLiveStreaming.stopStream()">
                        <i class="fas fa-stop"></i> End Stream
                    </button>
                </div>
            </div>
            
            <div class="stream-video">
                <video id="streamVideo" autoplay muted></video>
                <div class="live-indicator">
                    <span class="live-dot"></span> LIVE
                </div>
                <div class="viewer-count">
                    <i class="fas fa-eye"></i> <span id="viewerCount">0</span> watching
                </div>
            </div>
            
            <div class="stream-chat">
                <div class="chat-header">
                    <h4>Live Chat</h4>
                    <span class="chat-stats">
                        <i class="fas fa-comment"></i> 
                        <span id="chatMessageCount">0</span> messages
                    </span>
                </div>
                <div class="chat-messages" id="chatMessages"></div>
                <div class="chat-input">
                    <input type="text" id="chatInput" placeholder="Type a message...">
                    <button onclick="freeLiveStreaming.sendChatMessage()">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;

        // Add to live streams section
        const liveSection = document.getElementById('liveStreamSection');
        if (liveSection) {
            liveSection.appendChild(container);
        }

        return container;
    }

    // Display the stream
    displayStream(stream, container) {
        const video = container.querySelector('#streamVideo');
        if (video && stream.mediaStream) {
            video.srcObject = stream.mediaStream;
        }

        // Start viewer simulation
        this.simulateViewers(stream.id);
        
        // Start chat simulation
        this.simulateChat(stream.id);
    }

    // Simulate viewers joining
    simulateViewers(streamId) {
        let count = 0;
        const interval = setInterval(() => {
            if (!this.currentStream || this.currentStream.id !== streamId) {
                clearInterval(interval);
                return;
            }

            // Random viewer changes
            const change = Math.random() > 0.5 ? 1 : -1;
            count = Math.max(0, count + change);
            
            // Update viewer count
            const viewerElement = document.getElementById('viewerCount');
            if (viewerElement) {
                viewerElement.textContent = count;
            }
            
            this.currentStream.viewerCount = count;
        }, 3000); // Update every 3 seconds
    }

    // Simulate chat activity
    simulateChat(streamId) {
        const messages = [
            'Great stream!',
            'Hello everyone!',
            'Thanks for streaming',
            'This is awesome!',
            'Keep it up!',
            'Love the content',
            'How long will you stream?',
            'What are you working on?'
        ];

        const interval = setInterval(() => {
            if (!this.currentStream || this.currentStream.id !== streamId) {
                clearInterval(interval);
                return;
            }

            // Random chat message
            if (Math.random() > 0.7) {
                const message = messages[Math.floor(Math.random() * messages.length)];
                const username = 'Viewer' + Math.floor(Math.random() * 1000);
                this.addChatMessage(username, message);
            }
        }, 5000); // Message every 5 seconds
    }

    // Add chat message
    addChatMessage(username, message) {
        const chatContainer = document.getElementById('chatMessages');
        if (!chatContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        messageElement.innerHTML = `
            <span class="username">${username}:</span>
            <span class="message">${message}</span>
            <span class="timestamp">${new Date().toLocaleTimeString()}</span>
        `;

        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // Keep only last 50 messages
        if (chatContainer.children.length > 50) {
            chatContainer.removeChild(chatContainer.firstChild);
        }
    }

    // Send chat message
    sendChatMessage() {
        const input = document.getElementById('chatInput');
        if (!input || !input.value.trim()) return;

        const message = input.value.trim();
        const username = window.app?.currentUser?.displayName || 'Anonymous';
        
        this.addChatMessage(username, message);
        input.value = '';
    }

    // Stop the current stream
    stopStream() {
        if (!this.currentStream) return;

        try {
            // Stop media stream
            if (this.currentStream.mediaStream) {
                this.currentStream.mediaStream.getTracks().forEach(track => track.stop());
            }

            // Update status
            this.currentStream.status = 'ended';
            this.currentStream.endTime = new Date();

            // Remove stream container
            const streamContainer = document.querySelector('.live-stream-container');
            if (streamContainer) {
                streamContainer.remove();
            }

            // Reset current stream
            this.currentStream = null;

            // Update UI
            this.updateStreamingUI(false);

            // Stop monitoring
            if (this.durationInterval) {
                clearInterval(this.durationInterval);
            }
            if (this.healthInterval) {
                clearInterval(this.healthInterval);
            }
            if (this.tipsInterval) {
                clearInterval(this.tipsInterval);
            }

            console.log('🛑 Live stream ended');
            alert('Stream ended successfully');

        } catch (error) {
            console.error('❌ Error stopping stream:', error);
        }
    }

    // Update streaming UI
    updateStreamingUI(isStreaming) {
        const startBtn = document.getElementById('startStreamBtn');
        const joinBtn = document.getElementById('joinStreamBtn');

        if (startBtn) {
            startBtn.style.display = isStreaming ? 'none' : 'inline-block';
            startBtn.textContent = isStreaming ? 'Streaming...' : 'Go Live';
        }

        if (joinBtn) {
            joinBtn.style.display = isStreaming ? 'none' : 'inline-block';
        }
    }

    // Join a random active stream
    joinRandomStream() {
        // For demo purposes, show a message
        alert('No active streams available. Start your own stream to go live!');
    }

    // Load active streams
    async loadActiveStreams() {
        try {
            // In a real app, this would load from Firestore
            // For now, we'll just show the placeholder
            console.log('📺 No active streams found');
        } catch (error) {
            console.error('❌ Error loading active streams:', error);
        }
    }

    // Get stream statistics
    getStreamStats() {
        if (!this.currentStream) return null;

        const duration = new Date() - this.currentStream.startTime;
        const minutes = Math.floor(duration / 60000);

        return {
            duration: minutes,
            viewerCount: this.currentStream.viewerCount,
            chatMessages: this.chatMessages.length
        };
    }
}

// Initialize free live streaming system
const freeLiveStreaming = new FreeLiveStreaming();

// Export for global use
window.freeLiveStreaming = freeLiveStreaming;
