/* global db, auth, firebase, storage */
// Utility functions for Amplifi platform

// Security utilities
const SecurityUtils = {
    // Sanitize HTML to prevent XSS attacks
    sanitizeHTML(text) {
        if (!text || typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Validate and sanitize user input
    validateInput(input, maxLength = 1000) {
        if (!input || typeof input !== 'string') return '';
        const sanitized = input.trim().substring(0, maxLength);
        return this.sanitizeHTML(sanitized);
    },

    // Validate email format
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validate username format
    validateUsername(username) {
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        return usernameRegex.test(username);
    }
};

// DOM utilities
const DOMUtils = {
    // Safe DOM element creation
    createElement(tag, className = '', content = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.textContent = content;
        return element;
    },

    // Safe innerHTML setting
    setInnerHTML(element, content) {
        if (element && content) {
            element.innerHTML = SecurityUtils.sanitizeHTML(content);
        }
    },

    // Safe textContent setting
    setTextContent(element, content) {
        if (element && content !== undefined) {
            element.textContent = content;
        }
    },

    // Get element with null check
    getElement(id) {
        return document.getElementById(id) || null;
    },

    // Add event listener with error handling
    addEventListener(element, event, handler) {
        if (element && typeof handler === 'function') {
            try {
                element.addEventListener(event, handler);
            } catch (error) {
                console.error('Error adding event listener:', error);
            }
        }
    }
};

// User utilities
const UserUtils = {
    // Get the appropriate display name based on privacy settings
    getDisplayName(userProfile) {
        if (!userProfile) return 'Anonymous';
        
        // If user has chosen to use alias or doesn't want to show real name
        if (userProfile.useAlias || !userProfile.privacySettings?.showRealName) {
            return userProfile.displayName || userProfile.username || 'Anonymous';
        }
        
        // If user has provided a real name and wants to show it
        if (userProfile.realName) {
            return userProfile.realName;
        }
        
        // Fallback to display name
        return userProfile.displayName || userProfile.username || 'Anonymous';
    },

    // Get username with @ symbol
    getUsername(userProfile) {
        if (!userProfile) return '@anonymous';
        return `@${userProfile.username || 'anonymous'}`;
    },

    // Check if user is using an alias
    isUsingAlias(userProfile) {
        if (!userProfile) return true;
        return userProfile.useAlias || !userProfile.privacySettings?.showRealName;
    },

    // Get user's privacy status
    getPrivacyStatus(userProfile) {
        if (!userProfile) return 'private';
        return userProfile.privacySettings?.profileVisibility || 'public';
    },

    // Format user info for display
    formatUserInfo(userProfile) {
        return {
            displayName: this.getDisplayName(userProfile),
            username: this.getUsername(userProfile),
            isUsingAlias: this.isUsingAlias(userProfile),
            privacyStatus: this.getPrivacyStatus(userProfile)
        };
    }
};

// Storage utilities
const StorageUtils = {
    // Safe localStorage operations
    setItem(key, value, maxSize = 1024 * 1024) { // 1MB default limit
        try {
            const serialized = JSON.stringify(value);
            if (serialized.length > maxSize) {
                console.warn(`Storage item ${key} exceeds size limit`);
                return false;
            }
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },

    getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    },

    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },

    // Clean up old items
    cleanup(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days default
        const now = Date.now();
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            try {
                const item = this.getItem(key);
                if (item && item.timestamp && (now - item.timestamp) > maxAge) {
                    this.removeItem(key);
                }
            } catch (error) {
                // Remove corrupted items
                this.removeItem(key);
            }
        });
    }
};

// Error handling utilities
const ErrorUtils = {
    // Global error handler
    setupGlobalErrorHandler() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.showUserFriendlyError('Something went wrong. Please try again.');
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.showUserFriendlyError('A network error occurred. Please check your connection.');
        });
    },

    // Show user-friendly error messages
    showUserFriendlyError(message, duration = 5000) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-toast';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 300);
        }, duration);
    },

    // Handle async operations with error catching
    async safeAsync(operation, fallback = null) {
        try {
            return await operation();
        } catch (error) {
            console.error('Async operation failed:', error);
            return fallback;
        }
    }
};

// Performance utilities
const PerformanceUtils = {
    // Debounce function calls
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function calls
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Measure performance
    measureTime(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`${name} took ${end - start}ms`);
        return result;
    }
};

// Notification utilities
const NotificationUtils = {
    // Create a notification in Firestore
    async createNotification(recipientId, type, senderId, senderName, senderPic, postId = null, postThumbnail = null) {
        try {
            const notificationData = {
                recipientId: recipientId,
                type: type,
                senderId: senderId,
                senderName: senderName,
                senderPic: senderPic,
                postId: postId,
                postThumbnail: postThumbnail,
                read: false,
                createdAt: new Date()
            };

            await db.collection('notifications').add(notificationData);
            return true;
        } catch (error) {
            console.error('Error creating notification:', error);
            return false;
        }
    },

    // Mark notification as read
    async markAsRead(notificationId) {
        try {
            await db.collection('notifications').doc(notificationId).update({
                read: true
            });
            return true;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return false;
        }
    },

    // Get unread notification count
    async getUnreadCount(userId) {
        try {
            const snapshot = await db.collection('notifications')
                .where('recipientId', '==', userId)
                .where('read', '==', false)
                .get();
            return snapshot.size;
        } catch (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
    }
};

// Export utilities for use in other files
window.SecurityUtils = SecurityUtils;
window.DOMUtils = DOMUtils;
window.StorageUtils = StorageUtils;
window.ErrorUtils = ErrorUtils;
window.PerformanceUtils = PerformanceUtils;
window.NotificationUtils = NotificationUtils; 