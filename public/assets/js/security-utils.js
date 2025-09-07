
// Security Utility Functions
class SecurityUtils {
    static sanitizeHTML(str) {
        if (typeof str !== 'string') return '';
        
        // Create a temporary div element to use browser's HTML parsing
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }
    
    static escapeHTML(str) {
        if (typeof str !== 'string') return '';
        
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }
    
    static sanitizeURL(url) {
        if (typeof url !== 'string') return '';
        
        // Allow only safe URL schemes
        const allowedSchemes = ['http:', 'https:', 'data:', 'blob:'];
        try {
            const parsedUrl = new URL(url);
            if (allowedSchemes.includes(parsedUrl.protocol)) {
                return url;
            }
        } catch (e) {
            // If URL parsing fails, treat as relative URL
            if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
                return url;
            }
        }
        return '';
    }
    
    static validateInput(input, type = 'text', maxLength = 1000) {
        if (typeof input !== 'string') return '';
        
        // Remove potentially dangerous characters
        let sanitized = input.replace(/<script[^>]*>.*?<\/script>/gi, '');
        sanitized = sanitized.replace(/<iframe[^>]*>.*?<\/iframe>/gi, '');
        sanitized = sanitized.replace(/javascript:/gi, '');
        sanitized = sanitized.replace(/on\w+\s*=/gi, '');
        
        // Limit length
        if (sanitized.length > maxLength) {
            sanitized = sanitized.substring(0, maxLength);
        }
        
        return sanitized.trim();
    }
    
    static createSafeNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = document.createElement('i');
        icon.className = `fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}`;
        
        const messageSpan = document.createElement('span');
        messageSpan.textContent = this.validateInput(message, 'text', 200); // Safe text content
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'notification-close';
        closeBtn.textContent = '×';
        closeBtn.onclick = () => notification.remove();
        
        notification.appendChild(icon);
        notification.appendChild(messageSpan);
        notification.appendChild(closeBtn);
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
        
        return notification;
    }
    
    static validateFileUpload(file) {
        const allowedTypes = [
            'video/mp4', 'video/webm', 'video/mov', 'video/avi',
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'
        ];
        
        const maxSize = 500 * 1024 * 1024; // 500MB
        
        if (!allowedTypes.includes(file.type)) {
            throw new Error('File type not allowed');
        }
        
        if (file.size > maxSize) {
            throw new Error('File size too large (max 500MB)');
        }
        
        // Check file extension matches MIME type
        const extension = file.name.split('.').pop().toLowerCase();
        const expectedExtensions = {
            'video/mp4': ['mp4'],
            'video/webm': ['webm'],
            'video/mov': ['mov'],
            'video/avi': ['avi'],
            'image/jpeg': ['jpg', 'jpeg'],
            'image/png': ['png'],
            'image/gif': ['gif'],
            'image/webp': ['webp']
        };
        
        if (!expectedExtensions[file.type] || !expectedExtensions[file.type].includes(extension)) {
            throw new Error('File extension does not match file type');
        }
        
        return true;
    }
    
    static generateSecureToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    static rateLimit(key, limit = 10, windowMs = 60000) {
        const now = Date.now();
        const windowKey = `${key}_${Math.floor(now / windowMs)}`;
        
        let attempts = parseInt(localStorage.getItem(windowKey) || '0');
        
        if (attempts >= limit) {
            throw new Error('Rate limit exceeded. Please try again later.');
        }
        
        attempts++;
        localStorage.setItem(windowKey, attempts.toString());
        
        // Clean up old entries
        for (let i = 0; i < localStorage.length; i++) {
            const storageKey = localStorage.key(i);
            if (storageKey && storageKey.startsWith(key + '_')) {
                const timestamp = parseInt(storageKey.split('_')[1]);
                if (now - timestamp * windowMs > windowMs * 2) {
                    localStorage.removeItem(storageKey);
                }
            }
        }
        
        return true;
    }
}

// Make SecurityUtils available globally
window.SecurityUtils = SecurityUtils;
