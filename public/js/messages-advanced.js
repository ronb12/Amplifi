/* Advanced Messages Features - Facebook Messenger Style */

// Extend the existing MessagesPage class with advanced features
class AdvancedMessagesPage extends MessagesPage {
    constructor() {
        super();
        this.replyToMessageId = null;
        this.groupChatMode = false;
        this.videoCallActive = false;
        this.stickers = [
            '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
            '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
            '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
            '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
            '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬'
        ];
    }

    // Group Chat Features
    async createGroupChat() {
        const groupName = prompt('Enter group name:');
        if (!groupName) return;

        const selectedUsers = this.getSelectedUsers();
        if (selectedUsers.length < 2) {
            alert('Please select at least 2 users for a group chat');
            return;
        }

        try {
            const participants = [this.currentUser.uid, ...selectedUsers];
            const participantsData = [
                {
                    uid: this.currentUser.uid,
                    displayName: this.userProfile?.displayName || 'Anonymous',
                    profilePic: this.userProfile?.profilePic || ''
                }
            ];

            // Get user data for selected users
            for (const userId of selectedUsers) {
                const userDoc = await db.collection('users').doc(userId).get();
                const userData = userDoc.data();
                participantsData.push({
                    uid: userId,
                    displayName: userData?.displayName || 'Unknown User',
                    profilePic: userData?.profilePic || ''
                });
            }

            const groupData = {
                participants,
                participantsData,
                groupName,
                isGroup: true,
                createdBy: this.currentUser.uid,
                createdAt: new Date(),
                lastMessageAt: new Date()
            };

            const groupRef = await db.collection('conversations').add(groupData);
            
            // Add to conversations list
            this.conversations.unshift({ id: groupRef.id, ...groupData });
            this.renderConversations();

            // Select the new group
            this.selectConversation(groupRef.id);
            this.closeModals();

        } catch (error) {
            console.error('Error creating group chat:', error);
            alert('Failed to create group chat');
        }
    }

    // Message Reply Feature
    replyToMessage(messageId) {
        this.replyToMessageId = messageId;
        const messageInput = document.getElementById('messageInput');
        messageInput.placeholder = 'Reply to message...';
        messageInput.focus();
        
        // Show reply preview
        this.showReplyPreview(messageId);
    }

    showReplyPreview(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message) return;

        let replyPreview = document.getElementById('replyPreview');
        if (!replyPreview) {
            replyPreview = document.createElement('div');
            replyPreview.id = 'replyPreview';
            replyPreview.className = 'reply-preview';
            const messageInput = document.getElementById('messageInput');
            messageInput.parentNode.insertBefore(replyPreview, messageInput);
        }

        replyPreview.innerHTML = `
            <div class="reply-content">
                <span class="reply-label">Replying to ${message.senderName}</span>
                <span class="reply-text">${message.text}</span>
                <button class="cancel-reply" onclick="messagesPage.cancelReply()">×</button>
            </div>
        `;
        replyPreview.style.display = 'block';
    }

    cancelReply() {
        this.replyToMessageId = null;
        const messageInput = document.getElementById('messageInput');
        messageInput.placeholder = 'Type a message...';
        
        const replyPreview = document.getElementById('replyPreview');
        if (replyPreview) {
            replyPreview.style.display = 'none';
        }
    }

    // Message Editing Feature
    async editMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message) return;

        const newText = prompt('Edit message:', message.text);
        if (newText === null || newText === message.text) return;

        try {
            await db.collection('messages').doc(messageId).update({
                text: newText,
                editedAt: new Date(),
                isEdited: true
            });
        } catch (error) {
            console.error('Error editing message:', error);
            alert('Failed to edit message');
        }
    }

    // Message Deletion Feature
    async deleteMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message) return;

        const confirmDelete = confirm('Delete this message? This action cannot be undone.');
        if (!confirmDelete) return;

        try {
            await db.collection('messages').doc(messageId).delete();
        } catch (error) {
            console.error('Error deleting message:', error);
            alert('Failed to delete message');
        }
    }

    // Video Call Feature
    async startVideoCall() {
        if (!this.currentConversation) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            
            this.videoCallActive = true;
            this.showVideoCallInterface(stream);
            
            // Notify other participants
            await this.notifyVideoCall('started');
            
        } catch (error) {
            console.error('Error starting video call:', error);
            alert('Failed to start video call');
        }
    }

    showVideoCallInterface(stream) {
        const videoCall = document.createElement('div');
        videoCall.id = 'videoCall';
        videoCall.className = 'video-call-overlay';
        videoCall.innerHTML = `
            <div class="video-call-container">
                <video id="localVideo" autoplay muted></video>
                <video id="remoteVideo" autoplay></video>
                <div class="video-controls">
                    <button onclick="messagesPage.endVideoCall()">End Call</button>
                    <button onclick="messagesPage.toggleMute()">Mute</button>
                    <button onclick="messagesPage.toggleVideo()">Video</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(videoCall);
        
        const localVideo = document.getElementById('localVideo');
        localVideo.srcObject = stream;
    }

    async endVideoCall() {
        this.videoCallActive = false;
        const videoCall = document.getElementById('videoCall');
        if (videoCall) {
            videoCall.remove();
        }
        
        await this.notifyVideoCall('ended');
    }

    async notifyVideoCall(action) {
        if (!this.currentConversation) return;

        try {
            await db.collection('conversations')
                .doc(this.currentConversation)
                .collection('calls')
                .add({
                    action,
                    userId: this.currentUser.uid,
                    timestamp: new Date()
                });
        } catch (error) {
            console.error('Error notifying video call:', error);
        }
    }

    // Stickers Feature
    showStickerPicker() {
        const stickerPicker = document.createElement('div');
        stickerPicker.id = 'stickerPicker';
        stickerPicker.className = 'sticker-picker';
        
        const stickersHtml = this.stickers.map(sticker => 
            `<span class="sticker" onclick="messagesPage.sendSticker('${sticker}')">${sticker}</span>`
        ).join('');
        
        stickerPicker.innerHTML = `
            <div class="sticker-grid">
                ${stickersHtml}
            </div>
        `;
        
        document.body.appendChild(stickerPicker);
        
        // Position near input
        const messageInput = document.getElementById('messageInput');
        const rect = messageInput.getBoundingClientRect();
        stickerPicker.style.left = rect.left + 'px';
        stickerPicker.style.top = (rect.top - 200) + 'px';
        stickerPicker.style.display = 'block';
        
        // Close on outside click
        document.addEventListener('click', function closeStickers(e) {
            if (!stickerPicker.contains(e.target)) {
                stickerPicker.remove();
                document.removeEventListener('click', closeStickers);
            }
        });
    }

    async sendSticker(sticker) {
        if (!this.currentConversation) return;
        
        await this.sendMessage(this.currentConversation, '', {
            type: 'sticker',
            content: sticker
        });
        
        document.getElementById('stickerPicker')?.remove();
    }

    // Message Search Feature
    async searchMessages(query) {
        if (!query.trim() || !this.currentConversation) return;

        try {
            const messagesSnapshot = await db.collection('messages')
                .where('conversationId', '==', this.currentConversation)
                .where('text', '>=', query)
                .where('text', '<=', query + '\uf8ff')
                .get();

            const searchResults = [];
            messagesSnapshot.forEach(doc => {
                searchResults.push({ id: doc.id, ...doc.data() });
            });

            this.showSearchResults(searchResults, query);
        } catch (error) {
            console.error('Error searching messages:', error);
        }
    }

    showSearchResults(results, query) {
        const searchResults = document.createElement('div');
        searchResults.id = 'searchResults';
        searchResults.className = 'search-results';
        
        if (results.length === 0) {
            searchResults.innerHTML = '<p>No messages found for "' + query + '"</p>';
        } else {
            const resultsHtml = results.map(result => `
                <div class="search-result" onclick="messagesPage.scrollToMessage('${result.id}')">
                    <span class="search-author">${result.senderName}</span>
                    <span class="search-text">${result.text}</span>
                    <span class="search-time">${this.formatTimestamp(result.createdAt)}</span>
                </div>
            `).join('');
            
            searchResults.innerHTML = `
                <div class="search-header">
                    <h4>Search Results for "${query}"</h4>
                    <button onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="search-list">
                    ${resultsHtml}
                </div>
            `;
        }
        
        document.body.appendChild(searchResults);
    }

    scrollToMessage(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            messageElement.classList.add('highlight');
            setTimeout(() => messageElement.classList.remove('highlight'), 2000);
        }
        
        document.getElementById('searchResults')?.remove();
    }

    // Location Sharing Feature
    async shareLocation() {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by this browser');
            return;
        }

        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            const { latitude, longitude } = position.coords;
            const locationData = {
                type: 'location',
                latitude,
                longitude,
                url: `https://maps.google.com/?q=${latitude},${longitude}`
            };

            await this.sendMessage(this.currentConversation, '', locationData);
        } catch (error) {
            console.error('Error getting location:', error);
            alert('Failed to get location');
        }
    }

    // Enhanced Message Sending with Reply Support
    async sendMessage(conversationId, text, media = null) {
        if (!this.currentUser || !conversationId) {
            console.error('Cannot send message: missing user or conversation');
            return;
        }

        try {
            const messageData = {
                conversationId: conversationId,
                senderId: this.currentUser.uid,
                senderName: this.userProfile?.displayName || 'Anonymous',
                senderPic: this.userProfile?.profilePic || '',
                text: text.trim(),
                createdAt: new Date(),
                readBy: []
            };
            
            if (media) {
                messageData.media = media;
            }

            if (this.replyToMessageId) {
                messageData.replyTo = this.replyToMessageId;
                this.cancelReply();
            }

            console.log('Message data:', messageData);

            // Add message to Firestore
            await db.collection('messages').add(messageData);

            // Update conversation's last message
            const lastMessageText = media ? `Sent ${media.type}` : text.trim();
            await db.collection('conversations').doc(conversationId).update({
                lastMessage: lastMessageText,
                lastMessageAt: new Date()
            });

            console.log('Message sent successfully!');

        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        }
    }

    // Enhanced Message Rendering with Reply Support
    createMessageElement(message) {
        const isOwn = message.senderId === this.currentUser.uid;
        const div = document.createElement('div');
        div.className = `message ${isOwn ? 'own-message' : 'other-message'}`;
        div.setAttribute('data-message-id', message.id);
        
        let messageContent = '';
        
        // Handle reply
        if (message.replyTo) {
            const replyMessage = this.messages.find(m => m.id === message.replyTo);
            if (replyMessage) {
                messageContent += `
                    <div class="reply-message">
                        <span class="reply-label">Replying to ${replyMessage.senderName}</span>
                        <span class="reply-text">${replyMessage.text}</span>
                    </div>
                `;
            }
        }
        
        // Handle different message types
        if (message.media) {
            switch (message.media.type) {
                case 'photo':
                    messageContent += `<img src="${message.media.url}" alt="Photo" class="message-media">`;
                    break;
                case 'video':
                    messageContent += `<video src="${message.media.url}" controls class="message-media"></video>`;
                    break;
                case 'voice':
                    messageContent += `
                        <div class="voice-message">
                            <audio src="${message.media.url}" controls></audio>
                            <span class="voice-duration">${message.media.duration}s</span>
                        </div>
                    `;
                    break;
                case 'file':
                    messageContent += `
                        <div class="file-message">
                            <span class="file-icon">📎</span>
                            <span class="file-name">${message.media.fileName}</span>
                            <a href="${message.media.url}" download class="file-download">Download</a>
                        </div>
                    `;
                    break;
                case 'sticker':
                    messageContent += `<div class="sticker-message">${message.media.content}</div>`;
                    break;
                case 'location':
                    messageContent += `
                        <div class="location-message">
                            <span class="location-icon">📍</span>
                            <a href="${message.media.url}" target="_blank" class="location-link">View Location</a>
                        </div>
                    `;
                    break;
            }
        } else {
            messageContent += `<p>${message.text}</p>`;
        }
        
        // Add edited indicator
        if (message.isEdited) {
            messageContent += '<span class="edited-indicator">(edited)</span>';
        }
        
        // Add reactions
        const reactionsHtml = this.createReactionsHtml(message.reactions);
        
        // Add read receipts
        const readReceiptsHtml = this.createReadReceiptsHtml(message.readBy);
        
        // Add message actions
        const messageActionsHtml = this.createMessageActionsHtml(message, isOwn);
        
        div.innerHTML = `
            <div class="message-header">
                <span class="message-author">${isOwn ? 'You' : message.senderName}</span>
                <span class="message-time">${this.formatTimestamp(message.createdAt)}</span>
            </div>
            <div class="message-content">
                ${messageContent}
                ${reactionsHtml}
                ${readReceiptsHtml}
            </div>
            ${messageActionsHtml}
        `;
        
        return div;
    }

    // Enhanced Message Actions with Reply
    createMessageActionsHtml(message, isOwn) {
        return `
            <div class="message-actions">
                <button class="action-btn" onclick="messagesPage.showReactionPicker('${message.id}', event)">😊</button>
                <button class="action-btn" onclick="messagesPage.replyToMessage('${message.id}')">↩️</button>
                ${isOwn ? `
                    <button class="action-btn" onclick="messagesPage.editMessage('${message.id}')">✏️</button>
                    <button class="action-btn" onclick="messagesPage.deleteMessage('${message.id}')">🗑️</button>
                ` : ''}
            </div>
        `;
    }
}

// Initialize advanced features
document.addEventListener('DOMContentLoaded', () => {
    window.messagesPage = new AdvancedMessagesPage();
}); 