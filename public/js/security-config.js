/**
 * Centralized Security Configuration
 * All API keys and security settings managed here
 */

const SECURITY_CONFIG = {
    // Stripe Configuration
    stripe: {
        publishableKey: 'pk_live_51RpT30LHe1RTUAGqJFyWQHkA5RdWVfQ4KKTupLHGT6c6YrMs0qIztwOe7PWkfcvlovbXR4FctHy58HAk50NDmnTP002TpCQ53w',
        backendUrl: 'https://vercel-stripe-backend-dxiumj53d-ronell-bradleys-projects.vercel.app/api',
        currency: 'usd',
        minimumTipAmount: 0.50
    },
    
    // Firebase Configuration
    firebase: {
        apiKey: 'AIzaSyANHtCLmNLvp9k_px0lsUHuWK5PasK_gJY',
        authDomain: 'amplifi-a54d9.firebaseapp.com',
        projectId: 'amplifi-a54d9',
        storageBucket: 'amplifi-a54d9.appspot.com',
        messagingSenderId: '542171119183',
        appId: '1:542171119183:web:cd96402d1fe4d3ef6ef43a'
    },
    
    // AdSense Configuration
    adsense: {
        publisherId: 'pub-3565666509316178',
        customerId: '4925311126'
    },
    
    // Security Settings
    security: {
        maxLoginAttempts: 5,
        sessionTimeout: 3600000, // 1 hour
        rateLimitWindow: 60000, // 1 minute
        maxRequestsPerWindow: 100,
        csrfTokenExpiry: 3600000, // 1 hour
        passwordMinLength: 8,
        requireSpecialChars: true,
        requireNumbers: true,
        requireUppercase: true
    },
    
    // Content Security Policy
    csp: {
        defaultSrc: ["'self'"],
        scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://js.stripe.com",
            "https://www.googletagmanager.com",
            "https://www.google-analytics.com",
            "https://pagead2.googlesyndication.com"
        ],
        styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com"
        ],
        imgSrc: [
            "'self'",
            "data:",
            "https:",
            "https://www.google-analytics.com",
            "https://pagead2.googlesyndication.com"
        ],
        connectSrc: [
            "'self'",
            "https://api.stripe.com",
            "https://vercel-stripe-backend-dxiumj53d-ronell-bradleys-projects.vercel.app",
            "https://www.google-analytics.com"
        ],
        frameSrc: [
            "'self'",
            "https://js.stripe.com",
            "https://hooks.stripe.com"
        ],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: true
    }
};

// Security utility functions
const SecurityUtils = {
    // Generate CSRF token
    generateCSRFToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    },
    
    // Validate CSRF token
    validateCSRFToken(token) {
        const storedToken = sessionStorage.getItem('csrf_token');
        return token === storedToken;
    },
    
    // Rate limiting
    rateLimiter: {
        requests: new Map(),
        
        isAllowed(identifier, maxRequests = SECURITY_CONFIG.security.maxRequestsPerWindow) {
            const now = Date.now();
            const windowStart = now - SECURITY_CONFIG.security.rateLimitWindow;
            
            if (!this.requests.has(identifier)) {
                this.requests.set(identifier, []);
            }
            
            const requests = this.requests.get(identifier);
            const recentRequests = requests.filter(time => time > windowStart);
            
            if (recentRequests.length >= maxRequests) {
                return false;
            }
            
            recentRequests.push(now);
            this.requests.set(identifier, recentRequests);
            return true;
        },
        
        clear() {
            this.requests.clear();
        }
    },
    
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
    },
    
    // Input sanitization
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        // Remove potentially dangerous characters
        return input
            .replace(/[<>]/g, '') // Remove < and >
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .trim();
    },
    
    // Password validation
    validatePassword(password) {
        const config = SECURITY_CONFIG.security;
        
        if (password.length < config.passwordMinLength) {
            return { valid: false, error: `Password must be at least ${config.passwordMinLength} characters` };
        }
        
        if (config.requireUppercase && !/[A-Z]/.test(password)) {
            return { valid: false, error: 'Password must contain at least one uppercase letter' };
        }
        
        if (config.requireNumbers && !/\d/.test(password)) {
            return { valid: false, error: 'Password must contain at least one number' };
        }
        
        if (config.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return { valid: false, error: 'Password must contain at least one special character' };
        }
        
        return { valid: true };
    },
    
    // Session management
    sessionManager: {
        startSession(userId) {
            const sessionData = {
                userId,
                startTime: Date.now(),
                csrfToken: SecurityUtils.generateCSRFToken(),
                lastActivity: Date.now()
            };
            
            sessionStorage.setItem('session_data', JSON.stringify(sessionData));
            sessionStorage.setItem('csrf_token', sessionData.csrfToken);
            
            // Set session timeout
            setTimeout(() => {
                this.endSession();
            }, SECURITY_CONFIG.security.sessionTimeout);
        },
        
        endSession() {
            sessionStorage.removeItem('session_data');
            sessionStorage.removeItem('csrf_token');
            window.location.href = '/index.html';
        },
        
        updateActivity() {
            const sessionData = sessionStorage.getItem('session_data');
            if (sessionData) {
                const data = JSON.parse(sessionData);
                data.lastActivity = Date.now();
                sessionStorage.setItem('session_data', JSON.stringify(data));
            }
        },
        
        isSessionValid() {
            const sessionData = sessionStorage.getItem('session_data');
            if (!sessionData) return false;
            
            const data = JSON.parse(sessionData);
            const now = Date.now();
            const timeSinceActivity = now - data.lastActivity;
            
            if (timeSinceActivity > SECURITY_CONFIG.security.sessionTimeout) {
                this.endSession();
                return false;
            }
            
            return true;
        }
    },
    
    // Encryption utilities (for sensitive data)
    encryption: {
        async encrypt(data) {
            const encoder = new TextEncoder();
            const key = await crypto.subtle.generateKey(
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt', 'decrypt']
            );
            
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encoded = encoder.encode(JSON.stringify(data));
            
            const encrypted = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv },
                key,
                encoded
            );
            
            return {
                encrypted: Array.from(new Uint8Array(encrypted)),
                iv: Array.from(iv),
                key: await crypto.subtle.exportKey('raw', key)
            };
        },
        
        async decrypt(encryptedData, key, iv) {
            const decoder = new TextDecoder();
            const importedKey = await crypto.subtle.importKey(
                'raw',
                new Uint8Array(key),
                { name: 'AES-GCM', length: 256 },
                false,
                ['decrypt']
            );
            
            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: new Uint8Array(iv) },
                importedKey,
                new Uint8Array(encryptedData)
            );
            
            return JSON.parse(decoder.decode(decrypted));
        }
    }
};

// Initialize security measures
document.addEventListener('DOMContentLoaded', () => {
    // Set Content Security Policy with proper directive names
    const csp = SECURITY_CONFIG.csp;
    const cspString = Object.entries(csp)
        .map(([key, values]) => {
            // Convert camelCase to kebab-case for CSP directives
            const directive = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            
            if (Array.isArray(values)) {
                return `${directive} ${values.join(' ')}`;
            } else if (typeof values === 'boolean') {
                return values ? directive : '';
            } else {
                return `${directive} ${values}`;
            }
        })
        .filter(entry => entry !== '') // Remove empty entries
        .join('; ');
    
    // Add CSP meta tag if not already present
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
        const cspMeta = document.createElement('meta');
        cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
        cspMeta.setAttribute('content', cspString);
        document.head.appendChild(cspMeta);
    }
    
    // Add security headers
    const securityHeaders = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    };
    
    // Monitor for suspicious activity
    SecurityUtils.sessionManager.updateActivity();
    
    // Set up activity monitoring
    ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
        document.addEventListener(event, () => {
            SecurityUtils.sessionManager.updateActivity();
        }, { passive: true });
    });
    
    // Check session validity every minute
    setInterval(() => {
        if (!SecurityUtils.sessionManager.isSessionValid()) {
            console.warn('Session expired due to inactivity');
        }
    }, 60000);
    
    console.log('🔒 Security configuration initialized');
});

// Export for use in other modules
window.SECURITY_CONFIG = SECURITY_CONFIG;
window.SecurityUtils = SecurityUtils; 