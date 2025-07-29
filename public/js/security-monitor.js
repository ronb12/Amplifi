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
        
        console.log('🔒 Security monitoring system initialized');
    }

    // Simplified initialization without overriding browser functions
    initializeMonitoring() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        
        try {
            // Only monitor form submissions for CSRF
            this.monitorCSRF();
            
            // Monitor for rate limiting violations
            this.monitorRateLimiting();
            
            console.log('🔒 Security monitoring active');
        } catch (error) {
            console.error('❌ Error initializing security monitoring:', error);
        }
    }

    // Monitor for CSRF attempts (simplified)
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

    // Monitor for rate limiting violations
    monitorRateLimiting() {
        try {
            // Simple rate limiting for form submissions
            const submissions = new Map();
            
            document.addEventListener('submit', (event) => {
                const formId = event.target.id || 'unknown';
                const now = Date.now();
                const recentSubmissions = submissions.get(formId) || [];
                
                // Remove submissions older than 1 minute
                const recentSubmissionsFiltered = recentSubmissions.filter(time => now - time < 60000);
                
                if (recentSubmissionsFiltered.length >= 5) {
                    this.logThreat('RATE_LIMIT_VIOLATION', {
                        type: 'form_submission',
                        formId: formId,
                        submissions: recentSubmissionsFiltered.length,
                        timestamp: now
                    });
                    event.preventDefault();
                    return;
                }
                
                recentSubmissionsFiltered.push(now);
                submissions.set(formId, recentSubmissionsFiltered);
            });
        } catch (error) {
            console.warn('Rate limiting monitoring error:', error);
        }
    }

    // Log security threats
    logThreat(type, details) {
        try {
            const threatId = this.generateThreatId();
            const threat = {
                id: threatId,
                type: type,
                details: details,
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                url: window.location.href
            };
            
            this.threats.set(threatId, threat);
            this.suspiciousActivities.push(threat);
            
            // Keep only recent activities
            if (this.suspiciousActivities.length > 50) {
                this.suspiciousActivities = this.suspiciousActivities.slice(-50);
            }
            
            console.warn('🚨 Security threat detected:', type, details);
            
            // Show warning if too many threats
            if (this.threats.size > this.maxThreats) {
                this.showSecurityWarning();
            }
        } catch (error) {
            console.error('Error logging threat:', error);
        }
    }

    // Generate unique threat ID
    generateThreatId() {
        return 'threat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Show security warning
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
                // Initialize after a short delay
                setTimeout(() => {
                    SecurityMonitor.instance.initializeMonitoring();
                }, 100);
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