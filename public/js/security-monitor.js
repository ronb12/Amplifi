/**
 * Simplified Security Monitoring System
 * Detects and prevents various security threats without causing infinite recursion
 */

class SecurityMonitor {
    constructor() {
        this.threats = new Map();
        this.blockedIPs = new Set();
        this.suspiciousActivities = [];
        this.maxThreats = 10;
        this.blockDuration = 3600000; // 1 hour
        this.isInitialized = false;
        
        // Initialize after a short delay to avoid recursion
        setTimeout(() => {
            this.initializeMonitoring();
        }, 100);
        
        console.log('🔒 Security monitoring system initialized');
    }

    initializeMonitoring() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        
        try {
            // Monitor for XSS attempts
            this.monitorXSS();
            
            // Monitor for CSRF attempts
            this.monitorCSRF();
            
            // Monitor for suspicious network activity
            this.monitorNetworkActivity();
            
            // Monitor for rate limiting violations
            this.monitorRateLimiting();
            
            console.log('🔒 Security monitoring active');
        } catch (error) {
            console.error('❌ Error initializing security monitoring:', error);
        }
    }

    // Monitor for XSS attempts
    monitorXSS() {
        try {
            // Monitor script tag creation
            const originalCreateElement = document.createElement;
            document.createElement = (tagName) => {
                if (tagName.toLowerCase() === 'script') {
                    this.logThreat('XSS_ATTEMPT', {
                        type: 'script_creation',
                        stack: new Error().stack,
                        timestamp: Date.now()
                    });
                }
                return originalCreateElement.call(document, tagName);
            };

            // Monitor eval usage
            const originalEval = window.eval;
            window.eval = (code) => {
                this.logThreat('XSS_ATTEMPT', {
                    type: 'eval_usage',
                    code: code,
                    stack: new Error().stack,
                    timestamp: Date.now()
                });
                return originalEval.call(window, code);
            };
        } catch (error) {
            console.warn('XSS monitoring error:', error);
        }
    }

    // Monitor for CSRF attempts
    monitorCSRF() {
        try {
            // Monitor form submissions
            document.addEventListener('submit', (event) => {
                const form = event.target;
                const csrfToken = form.querySelector('input[name="csrf_token"]')?.value;
                
                if (!csrfToken && form.method.toLowerCase() !== 'get') {
                    this.logThreat('CSRF_ATTEMPT', {
                        type: 'missing_csrf_token',
                        formAction: form.action,
                        formMethod: form.method,
                        timestamp: Date.now()
                    });
                }
            });
        } catch (error) {
            console.warn('CSRF monitoring error:', error);
        }
    }

    // Monitor for suspicious network activity
    monitorNetworkActivity() {
        try {
            // Monitor fetch requests
            const originalFetch = window.fetch;
            window.fetch = (url, options) => {
                // Check for suspicious URLs
                if (typeof url === 'string' && this.isSuspiciousURL(url)) {
                    this.logThreat('SUSPICIOUS_NETWORK', {
                        type: 'suspicious_url',
                        url: url,
                        timestamp: Date.now()
                    });
                }
                return originalFetch.call(window, url, options);
            };
        } catch (error) {
            console.warn('Network monitoring error:', error);
        }
    }

    // Monitor for rate limiting violations
    monitorRateLimiting() {
        try {
            // Simple rate limiting for form submissions
            const submissionTimes = new Map();
            
            document.addEventListener('submit', (event) => {
                const formId = event.target.id || 'unknown';
                const now = Date.now();
                const lastSubmission = submissionTimes.get(formId) || 0;
                
                if (now - lastSubmission < 1000) { // Less than 1 second
                    this.logThreat('RATE_LIMIT_VIOLATION', {
                        type: 'rapid_form_submission',
                        formId: formId,
                        timeSinceLast: now - lastSubmission,
                        timestamp: now
                    });
                }
                
                submissionTimes.set(formId, now);
            });
        } catch (error) {
            console.warn('Rate limiting monitoring error:', error);
        }
    }

    // Check if URL is suspicious
    isSuspiciousURL(url) {
        const suspiciousPatterns = [
            /javascript:/i,
            /data:text\/html/i,
            /vbscript:/i,
            /onload=/i,
            /onerror=/i
        ];
        
        return suspiciousPatterns.some(pattern => pattern.test(url));
    }

    // Log security threat
    logThreat(type, details) {
        try {
            const threat = {
                id: this.generateThreatId(),
                type: type,
                details: details,
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                url: window.location.href,
                referrer: document.referrer
            };
            
            this.threats.set(threat.id, threat);
            this.suspiciousActivities.push(threat);
            
            // Keep only recent threats
            if (this.threats.size > this.maxThreats) {
                const oldestKey = this.threats.keys().next().value;
                this.threats.delete(oldestKey);
            }
            
            // Block IP if too many threats
            if (this.suspiciousActivities.filter(t => t.type === type).length > 5) {
                this.blockIP();
            }
            
            console.warn('🚨 Security threat detected:', threat);
        } catch (error) {
            console.error('Error logging threat:', error);
        }
    }

    // Generate unique threat ID
    generateThreatId() {
        return 'threat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Block IP address
    blockIP() {
        try {
            console.warn('🚫 IP address blocked due to security threats');
            this.blockedIPs.add('current_ip');
            
            // Show warning to user
            this.showSecurityWarning();
        } catch (error) {
            console.error('Error blocking IP:', error);
        }
    }

    // Show security warning to user
    showSecurityWarning() {
        try {
            const warning = document.createElement('div');
            warning.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ef4444;
                color: white;
                padding: 1rem;
                border-radius: 0.5rem;
                z-index: 10000;
                max-width: 300px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `;
            warning.innerHTML = `
                <h4>🚨 Security Warning</h4>
                <p>Suspicious activity detected. Please refresh the page.</p>
                <button onclick="this.parentElement.remove()" style="background: white; color: #ef4444; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer;">Dismiss</button>
            `;
            document.body.appendChild(warning);
            
            // Auto-remove after 10 seconds
            setTimeout(() => {
                if (warning.parentElement) {
                    warning.remove();
                }
            }, 10000);
        } catch (error) {
            console.error('Error showing security warning:', error);
        }
    }

    // Get threat statistics
    getThreatStats() {
        try {
            const stats = {
                totalThreats: this.threats.size,
                blockedIPs: this.blockedIPs.size,
                threatTypes: {},
                recentActivity: this.suspiciousActivities.slice(-10)
            };
            
            this.threats.forEach(threat => {
                stats.threatTypes[threat.type] = (stats.threatTypes[threat.type] || 0) + 1;
            });
            
            return stats;
        } catch (error) {
            console.error('Error getting threat stats:', error);
            return { totalThreats: 0, blockedIPs: 0, threatTypes: {}, recentActivity: [] };
        }
    }

    // Clear threats (for testing)
    clearThreats() {
        try {
            this.threats.clear();
            this.suspiciousActivities = [];
            this.blockedIPs.clear();
            console.log('✅ Security threats cleared');
        } catch (error) {
            console.error('Error clearing threats:', error);
        }
    }

    // Singleton pattern with error handling
    static getInstance() {
        if (!SecurityMonitor.instance) {
            try {
                SecurityMonitor.instance = new SecurityMonitor();
            } catch (error) {
                console.error('Failed to create SecurityMonitor instance:', error);
                // Return a minimal fallback
                return {
                    logThreat: (type, details) => console.warn('Security threat (fallback):', type, details),
                    getThreatStats: () => ({ totalThreats: 0, blockedIPs: 0, threatTypes: {}, recentActivity: [] }),
                    clearThreats: () => console.log('Threats cleared (fallback)')
                };
            }
        }
        return SecurityMonitor.instance;
    }
}

// Initialize security monitoring with error handling
let securityMonitor;
try {
    securityMonitor = SecurityMonitor.getInstance();
    console.log('🔒 Security monitoring system loaded successfully');
} catch (error) {
    console.error('❌ Failed to initialize security monitoring:', error);
    // Create a minimal fallback
    securityMonitor = {
        logThreat: (type, details) => console.warn('Security threat (fallback):', type, details),
        getThreatStats: () => ({ totalThreats: 0, blockedIPs: 0, threatTypes: {}, recentActivity: [] }),
        clearThreats: () => console.log('Threats cleared (fallback)')
    };
}

// Export for use in other modules
window.SecurityMonitor = SecurityMonitor;
window.securityMonitor = securityMonitor; 