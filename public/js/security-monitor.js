/**
 * Comprehensive Security Monitoring System
 * Detects and prevents various security threats
 */

class SecurityMonitor {
    constructor() {
        this.threats = new Map();
        this.blockedIPs = new Set();
        this.suspiciousActivities = [];
        this.maxThreats = 10;
        this.blockDuration = 3600000; // 1 hour
        
        this.initializeMonitoring();
        console.log('🔒 Security monitoring system initialized');
    }

    initializeMonitoring() {
        // Monitor for XSS attempts
        this.monitorXSS();
        
        // Monitor for CSRF attempts
        this.monitorCSRF();
        
        // Monitor for SQL injection attempts
        this.monitorSQLInjection();
        
        // Monitor for suspicious network activity
        this.monitorNetworkActivity();
        
        // Monitor for DOM manipulation
        this.monitorDOMManipulation();
        
        // Monitor for suspicious file access
        this.monitorFileAccess();
        
        // Monitor for authentication bypass attempts
        this.monitorAuthBypass();
        
        // Monitor for rate limiting violations
        this.monitorRateLimiting();
        
        // Monitor for data exfiltration attempts
        this.monitorDataExfiltration();
        
        // Monitor for suspicious browser behavior
        this.monitorBrowserBehavior();
    }

    // Monitor for XSS attempts
    monitorXSS() {
        // Monitor script tag creation
        const originalCreateElement = document.createElement;
        document.createElement = function(tagName) {
            if (tagName.toLowerCase() === 'script') {
                SecurityMonitor.getInstance().logThreat('XSS_ATTEMPT', {
                    type: 'script_creation',
                    stack: new Error().stack,
                    timestamp: Date.now()
                });
            }
            return originalCreateElement.call(this, tagName);
        };

        // Monitor eval usage
        const originalEval = window.eval;
        window.eval = function(code) {
            SecurityMonitor.getInstance().logThreat('XSS_ATTEMPT', {
                type: 'eval_usage',
                code: code,
                stack: new Error().stack,
                timestamp: Date.now()
            });
            return originalEval.call(this, code);
        };

        // Monitor innerHTML assignments
        const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
        Object.defineProperty(Element.prototype, 'innerHTML', {
            set: function(value) {
                if (typeof value === 'string' && (value.includes('<script') || value.includes('javascript:'))) {
                    SecurityMonitor.getInstance().logThreat('XSS_ATTEMPT', {
                        type: 'innerHTML_script',
                        value: value,
                        stack: new Error().stack,
                        timestamp: Date.now()
                    });
                }
                originalInnerHTML.set.call(this, value);
            },
            get: originalInnerHTML.get
        });
    }

    // Monitor for CSRF attempts
    monitorCSRF() {
        // Monitor form submissions
        document.addEventListener('submit', (event) => {
            const form = event.target;
            const csrfToken = form.querySelector('input[name="csrf_token"]')?.value;
            
            if (!csrfToken || !window.SecurityUtils?.validateCSRFToken?.(csrfToken)) {
                SecurityMonitor.getInstance().logThreat('CSRF_ATTEMPT', {
                    type: 'form_submission',
                    formAction: form.action,
                    stack: new Error().stack,
                    timestamp: Date.now()
                });
                event.preventDefault();
            }
        });

        // Monitor fetch requests
        const originalFetch = window.fetch;
        window.fetch = function(url, options = {}) {
            if (options.method && options.method.toUpperCase() !== 'GET') {
                const csrfToken = options.headers?.['X-CSRF-Token'];
                if (!csrfToken || !window.SecurityUtils?.validateCSRFToken?.(csrfToken)) {
                    SecurityMonitor.getInstance().logThreat('CSRF_ATTEMPT', {
                        type: 'fetch_request',
                        url: url,
                        method: options.method,
                        stack: new Error().stack,
                        timestamp: Date.now()
                    });
                    return Promise.reject(new Error('CSRF protection: Invalid token'));
                }
            }
            return originalFetch.call(this, url, options);
        };
    }

    // Monitor for SQL injection attempts
    monitorSQLInjection() {
        // Monitor input fields for SQL injection patterns
        document.addEventListener('input', (event) => {
            const input = event.target;
            const value = input.value;
            
            const sqlPatterns = [
                /(\b(union|select|insert|update|delete|drop|create|alter)\b)/i,
                /(\b(or|and)\b\s+\d+\s*=\s*\d+)/i,
                /(\b(union|select)\b.*\bfrom\b)/i,
                /(\b(union|select)\b.*\bwhere\b)/i,
                /(\b(union|select)\b.*\bgroup\b\s+\bby\b)/i,
                /(\b(union|select)\b.*\border\b\s+\bby\b)/i,
                /(\b(union|select)\b.*\bhaving\b)/i,
                /(\b(union|select)\b.*\blimit\b)/i,
                /(\b(union|select)\b.*\boffset\b)/i,
                /(\b(union|select)\b.*\btop\b)/i,
                /(\b(union|select)\b.*\bdistinct\b)/i,
                /(\b(union|select)\b.*\bcount\b)/i,
                /(\b(union|select)\b.*\bsum\b)/i,
                /(\b(union|select)\b.*\bavg\b)/i,
                /(\b(union|select)\b.*\bmax\b)/i,
                /(\b(union|select)\b.*\bmin\b)/i,
                /(\b(union|select)\b.*\bcase\b)/i,
                /(\b(union|select)\b.*\bwhen\b)/i,
                /(\b(union|select)\b.*\bthen\b)/i,
                /(\b(union|select)\b.*\belse\b)/i,
                /(\b(union|select)\b.*\bend\b)/i,
                /(\b(union|select)\b.*\bas\b)/i,
                /(\b(union|select)\b.*\bin\b)/i,
                /(\b(union|select)\b.*\bbetween\b)/i,
                /(\b(union|select)\b.*\blike\b)/i,
                /(\b(union|select)\b.*\bis\b\s+\bnull\b)/i,
                /(\b(union|select)\b.*\bis\b\s+\bnot\b\s+\bnull\b)/i,
                /(\b(union|select)\b.*\bexists\b)/i,
                /(\b(union|select)\b.*\bnot\b\s+\bexists\b)/i,
                /(\b(union|select)\b.*\bin\b\s*\(.*\))/i,
                /(\b(union|select)\b.*\bnot\b\s+\bin\b\s*\(.*\))/i,
                /(\b(union|select)\b.*\ball\b)/i,
                /(\b(union|select)\b.*\bany\b)/i,
                /(\b(union|select)\b.*\bsome\b)/i,
                /(\b(union|select)\b.*\bwith\b)/i,
                /(\b(union|select)\b.*\brecursive\b)/i,
                /(\b(union|select)\b.*\bcte\b)/i,
                /(\b(union|select)\b.*\bwindow\b)/i,
                /(\b(union|select)\b.*\bover\b)/i,
                /(\b(union|select)\b.*\bpartition\b\s+\bby\b)/i,
                /(\b(union|select)\b.*\border\b\s+\bby\b)/i,
                /(\b(union|select)\b.*\brows\b)/i,
                /(\b(union|select)\b.*\brange\b)/i,
                /(\b(union|select)\b.*\bpreceding\b)/i,
                /(\b(union|select)\b.*\bfollowing\b)/i,
                /(\b(union|select)\b.*\bunbounded\b)/i,
                /(\b(union|select)\b.*\bcurrent\b\s+\brow\b)/i,
                /(\b(union|select)\b.*\bcurrent\b\s+\btimestamp\b)/i,
                /(\b(union|select)\b.*\bcurrent\b\s+\bdate\b)/i,
                /(\b(union|select)\b.*\bcurrent\b\s+\btime\b)/i,
                /(\b(union|select)\b.*\bcurrent\b\s+\buser\b)/i,
                /(\b(union|select)\b.*\bcurrent\b\s+\bschema\b)/i,
                /(\b(union|select)\b.*\bcurrent\b\s+\bcatalog\b)/i,
                /(\b(union|select)\b.*\bcurrent\b\s+\bdatabase\b)/i,
                /(\b(union|select)\b.*\bcurrent\b\s+\bserver\b)/i,
                /(\b(union|select)\b.*\bcurrent\b\s+\bconnection\b)/i,
                /(\b(union|select)\b.*\bcurrent\b\s+\bsession\b)/i,
                /(\b(union|select)\b.*\bcurrent\b\s+\btransaction\b)/i,
                /(\b(union|select)\b.*\bcurrent\b\s+\bdate\b)/i,
                /(\b(union|select)\b.*\bcurrent\b\s+\btime\b)/i,
                /(\b(union|select)\b.*\bcurrent\b\s+\btimestamp\b)/i,
                /(\b(union|select)\b.*\bcurrent\b\s+\buser\b)/i,
                /(\b(union|select)\b.*\bcurrent\b\s+\bschema\b)/i,
                /(\b(union|select)\b.*\bcurrent\b\s+\bcatalog\b)/i,
                /(\b(union|select)\b.*\bcurrent\b\s+\bdatabase\b)/i,
                /(\b(union|select)\b.*\bcurrent\b\s+\bserver\b)/i,
                /(\b(union|select)\b.*\bcurrent\b\s+\bconnection\b)/i,
                /(\b(union|select)\b.*\bcurrent\b\s+\bsession\b)/i,
                /(\b(union|select)\b.*\bcurrent\b\s+\btransaction\b)/i
            ];
            
            for (const pattern of sqlPatterns) {
                if (pattern.test(value)) {
                    SecurityMonitor.getInstance().logThreat('SQL_INJECTION_ATTEMPT', {
                        type: 'input_field',
                        fieldName: input.name || input.id,
                        value: value,
                        pattern: pattern.source,
                        stack: new Error().stack,
                        timestamp: Date.now()
                    });
                    break;
                }
            }
        });
    }

    // Monitor for suspicious network activity
    monitorNetworkActivity() {
        // Monitor for requests to suspicious domains
        const suspiciousDomains = [
            'malware.com',
            'phishing.com',
            'evil.com',
            'hack.com',
            'exploit.com'
        ];

        const originalFetch = window.fetch;
        window.fetch = function(url, options = {}) {
            const urlObj = new URL(url, window.location.origin);
            const domain = urlObj.hostname;
            
            if (suspiciousDomains.some(suspicious => domain.includes(suspicious))) {
                SecurityMonitor.getInstance().logThreat('SUSPICIOUS_NETWORK_ACTIVITY', {
                    type: 'suspicious_domain',
                    domain: domain,
                    url: url,
                    stack: new Error().stack,
                    timestamp: Date.now()
                });
                return Promise.reject(new Error('Request blocked: Suspicious domain'));
            }
            
            return originalFetch.call(this, url, options);
        };
    }

    // Monitor for DOM manipulation
    monitorDOMManipulation() {
        // Monitor for suspicious DOM modifications
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const element = node;
                            if (element.tagName === 'SCRIPT' || 
                                element.innerHTML?.includes('<script') ||
                                element.innerHTML?.includes('javascript:')) {
                                SecurityMonitor.getInstance().logThreat('DOM_MANIPULATION_ATTEMPT', {
                                    type: 'suspicious_element',
                                    tagName: element.tagName,
                                    innerHTML: element.innerHTML,
                                    stack: new Error().stack,
                                    timestamp: Date.now()
                                });
                            }
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Monitor for suspicious file access
    monitorFileAccess() {
        // Monitor for file input changes
        document.addEventListener('change', (event) => {
            if (event.target.type === 'file') {
                const files = event.target.files;
                for (let file of files) {
                    const fileName = file.name.toLowerCase();
                    const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar'];
                    
                    if (suspiciousExtensions.some(ext => fileName.endsWith(ext))) {
                        SecurityMonitor.getInstance().logThreat('SUSPICIOUS_FILE_ACCESS', {
                            type: 'suspicious_file_upload',
                            fileName: file.name,
                            fileSize: file.size,
                            fileType: file.type,
                            stack: new Error().stack,
                            timestamp: Date.now()
                        });
                    }
                }
            }
        });
    }

    // Monitor for authentication bypass attempts
    monitorAuthBypass() {
        // Monitor for attempts to access protected routes
        const protectedRoutes = ['/admin', '/dashboard', '/settings', '/profile'];
        
        window.addEventListener('popstate', () => {
            const currentPath = window.location.pathname;
            if (protectedRoutes.some(route => currentPath.includes(route))) {
                if (!window.SecurityUtils?.sessionManager?.isSessionValid?.()) {
                    SecurityMonitor.getInstance().logThreat('AUTH_BYPASS_ATTEMPT', {
                        type: 'protected_route_access',
                        route: currentPath,
                        stack: new Error().stack,
                        timestamp: Date.now()
                    });
                    window.location.href = '/index.html';
                }
            }
        });
    }

    // Monitor for rate limiting violations
    monitorRateLimiting() {
        // Monitor for rapid form submissions
        const formSubmissions = new Map();
        
        document.addEventListener('submit', (event) => {
            const formId = event.target.id || 'anonymous_form';
            const now = Date.now();
            
            if (!formSubmissions.has(formId)) {
                formSubmissions.set(formId, []);
            }
            
            const submissions = formSubmissions.get(formId);
            const recentSubmissions = submissions.filter(time => now - time < 60000); // 1 minute
            
            if (recentSubmissions.length >= 5) {
                SecurityMonitor.getInstance().logThreat('RATE_LIMITING_VIOLATION', {
                    type: 'rapid_form_submission',
                    formId: formId,
                    submissionsCount: recentSubmissions.length,
                    stack: new Error().stack,
                    timestamp: now
                });
                event.preventDefault();
                return;
            }
            
            submissions.push(now);
            formSubmissions.set(formId, submissions);
        });
    }

    // Monitor for data exfiltration attempts
    monitorDataExfiltration() {
        // Monitor for attempts to access sensitive data
        const sensitiveDataPatterns = [
            /password/i,
            /credit.?card/i,
            /ssn|social.?security/i,
            /api.?key/i,
            /secret/i,
            /token/i
        ];
        
        // Monitor clipboard access
        document.addEventListener('copy', (event) => {
            const selectedText = window.getSelection().toString();
            for (const pattern of sensitiveDataPatterns) {
                if (pattern.test(selectedText)) {
                    SecurityMonitor.getInstance().logThreat('DATA_EXFILTRATION_ATTEMPT', {
                        type: 'sensitive_data_copy',
                        data: selectedText.substring(0, 50) + '...',
                        pattern: pattern.source,
                        stack: new Error().stack,
                        timestamp: Date.now()
                    });
                }
            }
        });
    }

    // Monitor for suspicious browser behavior
    monitorBrowserBehavior() {
        // Monitor for developer tools opening
        let devtools = { open: false, orientation: null };
        
        setInterval(() => {
            const threshold = 160;
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;
            
            if (widthThreshold || heightThreshold) {
                if (!devtools.open) {
                    devtools.open = true;
                    SecurityMonitor.getInstance().logThreat('SUSPICIOUS_BROWSER_BEHAVIOR', {
                        type: 'developer_tools_opened',
                        stack: new Error().stack,
                        timestamp: Date.now()
                    });
                }
            } else {
                devtools.open = false;
            }
        }, 1000);
        
        // Monitor for console access
        const originalConsole = {
            log: console.log,
            warn: console.warn,
            error: console.error,
            info: console.info
        };
        
        Object.keys(originalConsole).forEach(method => {
            console[method] = function(...args) {
                SecurityMonitor.getInstance().logThreat('SUSPICIOUS_BROWSER_BEHAVIOR', {
                    type: 'console_access',
                    method: method,
                    args: args.map(arg => String(arg).substring(0, 100)),
                    stack: new Error().stack,
                    timestamp: Date.now()
                });
                return originalConsole[method].apply(this, args);
            };
        });
    }

    // Log security threats
    logThreat(type, details) {
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
        
        // Send threat report to server
        this.reportThreat(threat);
        
        console.warn('🚨 Security threat detected:', threat);
    }

    // Generate unique threat ID
    generateThreatId() {
        return 'threat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Block IP address
    blockIP() {
        // In a real implementation, this would block the IP at the server level
        console.warn('🚫 IP address blocked due to security threats');
        this.blockedIPs.add('current_ip');
        
        // Redirect to security page
        setTimeout(() => {
            window.location.href = '/security-blocked.html';
        }, 1000);
    }

    // Report threat to server
    async reportThreat(threat) {
        try {
            await fetch('/api/security/report-threat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': window.SecurityUtils?.generateCSRFToken?.() || ''
                },
                body: JSON.stringify(threat)
            });
        } catch (error) {
            console.error('Failed to report security threat:', error);
        }
    }

    // Get threat statistics
    getThreatStats() {
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
    }

    // Clear threats (for testing)
    clearThreats() {
        this.threats.clear();
        this.suspiciousActivities = [];
        this.blockedIPs.clear();
    }

    // Singleton pattern
    static getInstance() {
        if (!SecurityMonitor.instance) {
            SecurityMonitor.instance = new SecurityMonitor();
        }
        return SecurityMonitor.instance;
    }
}

// Initialize security monitoring
const securityMonitor = SecurityMonitor.getInstance();

// Export for use in other modules
window.SecurityMonitor = SecurityMonitor;
window.securityMonitor = securityMonitor; 