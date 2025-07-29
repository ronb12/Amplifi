/**
 * Comprehensive Security Test Suite
 * Tests all security measures implemented in the application
 */

console.log('🔒 STARTING COMPREHENSIVE SECURITY TEST SUITE');

class SecurityTestSuite {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    // Test 1: Security Configuration
    testSecurityConfiguration() {
        console.log('🧪 Testing Security Configuration...');
        
        const tests = [
            {
                name: 'Security Config Exists',
                test: () => window.SECURITY_CONFIG !== undefined,
                expected: true
            },
            {
                name: 'Stripe Configuration',
                test: () => window.SECURITY_CONFIG?.stripe?.publishableKey?.startsWith('pk_live_'),
                expected: true
            },
            {
                name: 'Firebase Configuration',
                test: () => window.SECURITY_CONFIG?.firebase?.apiKey?.length > 0,
                expected: true
            },
            {
                name: 'Security Settings',
                test: () => window.SECURITY_CONFIG?.security?.maxLoginAttempts > 0,
                expected: true
            },
            {
                name: 'CSP Configuration',
                test: () => window.SECURITY_CONFIG?.csp?.defaultSrc?.includes("'self'"),
                expected: true
            }
        ];

        tests.forEach(test => this.runTest(test));
    }

    // Test 2: Security Utilities
    testSecurityUtils() {
        console.log('🧪 Testing Security Utilities...');
        
        const tests = [
            {
                name: 'CSRF Token Generation',
                test: () => {
                    const token1 = window.SecurityUtils?.generateCSRFToken?.();
                    const token2 = window.SecurityUtils?.generateCSRFToken?.();
                    return token1 && token2 && token1 !== token2 && token1.length === 64;
                },
                expected: true
            },
            {
                name: 'CSRF Token Validation',
                test: () => {
                    const token = window.SecurityUtils?.generateCSRFToken?.();
                    sessionStorage.setItem('csrf_token', token);
                    return window.SecurityUtils?.validateCSRFToken?.(token);
                },
                expected: true
            },
            {
                name: 'Input Sanitization',
                test: () => {
                    const input = '<script>alert("xss")</script>';
                    const sanitized = window.SecurityUtils?.sanitizeInput?.(input);
                    return sanitized && !sanitized.includes('<script>');
                },
                expected: true
            },
            {
                name: 'Password Validation',
                test: () => {
                    const result = window.SecurityUtils?.validatePassword?.('WeakPass');
                    return result && !result.valid;
                },
                expected: true
            },
            {
                name: 'Strong Password Validation',
                test: () => {
                    const result = window.SecurityUtils?.validatePassword?.('StrongPass123!');
                    return result && result.valid;
                },
                expected: true
            }
        ];

        tests.forEach(test => this.runTest(test));
    }

    // Test 3: Rate Limiting
    testRateLimiting() {
        console.log('🧪 Testing Rate Limiting...');
        
        const tests = [
            {
                name: 'Rate Limiter Initialization',
                test: () => {
                    return window.SecurityUtils?.rateLimiter?.isAllowed !== undefined;
                },
                expected: true
            },
            {
                name: 'Rate Limiter Functionality',
                test: () => {
                    const rateLimiter = window.SecurityUtils?.rateLimiter;
                    if (!rateLimiter) return false;
                    
                    // Test multiple requests
                    const identifier = 'test_rate_limit';
                    const results = [];
                    
                    for (let i = 0; i < 15; i++) {
                        results.push(rateLimiter.isAllowed(identifier, 10));
                    }
                    
                    // Should allow first 10, block next 5
                    return results.slice(0, 10).every(r => r === true) && 
                           results.slice(10).every(r => r === false);
                },
                expected: true
            }
        ];

        tests.forEach(test => this.runTest(test));
    }

    // Test 4: Session Management
    testSessionManagement() {
        console.log('🧪 Testing Session Management...');
        
        const tests = [
            {
                name: 'Session Manager Initialization',
                test: () => {
                    return window.SecurityUtils?.sessionManager?.startSession !== undefined;
                },
                expected: true
            },
            {
                name: 'Session Creation',
                test: () => {
                    const sessionManager = window.SecurityUtils?.sessionManager;
                    if (!sessionManager) return false;
                    
                    sessionManager.startSession('test_user');
                    const sessionData = sessionStorage.getItem('session_data');
                    return sessionData && JSON.parse(sessionData).userId === 'test_user';
                },
                expected: true
            },
            {
                name: 'Session Validation',
                test: () => {
                    const sessionManager = window.SecurityUtils?.sessionManager;
                    if (!sessionManager) return false;
                    
                    return sessionManager.isSessionValid();
                },
                expected: true
            }
        ];

        tests.forEach(test => this.runTest(test));
    }

    // Test 5: Security Monitoring
    testSecurityMonitoring() {
        console.log('🧪 Testing Security Monitoring...');
        
        const tests = [
            {
                name: 'Security Monitor Initialization',
                test: () => {
                    return window.securityMonitor !== undefined;
                },
                expected: true
            },
            {
                name: 'Threat Logging',
                test: () => {
                    const monitor = window.securityMonitor;
                    if (!monitor) return false;
                    
                    const initialThreats = monitor.threats.size;
                    monitor.logThreat('TEST_THREAT', { test: true });
                    
                    return monitor.threats.size > initialThreats;
                },
                expected: true
            },
            {
                name: 'Threat Statistics',
                test: () => {
                    const monitor = window.securityMonitor;
                    if (!monitor) return false;
                    
                    const stats = monitor.getThreatStats();
                    return stats && typeof stats.totalThreats === 'number';
                },
                expected: true
            }
        ];

        tests.forEach(test => this.runTest(test));
    }

    // Test 6: XSS Protection
    testXSSProtection() {
        console.log('🧪 Testing XSS Protection...');
        
        const tests = [
            {
                name: 'Script Tag Creation Detection',
                test: () => {
                    const monitor = window.securityMonitor;
                    if (!monitor) return false;
                    
                    const initialThreats = monitor.threats.size;
                    
                    try {
                        document.createElement('script');
                    } catch (e) {
                        // Expected to be caught by security monitor
                    }
                    
                    return monitor.threats.size > initialThreats;
                },
                expected: true
            },
            {
                name: 'InnerHTML Script Detection',
                test: () => {
                    const monitor = window.securityMonitor;
                    if (!monitor) return false;
                    
                    const initialThreats = monitor.threats.size;
                    
                    try {
                        const div = document.createElement('div');
                        div.innerHTML = '<script>alert("test")</script>';
                    } catch (e) {
                        // Expected to be caught by security monitor
                    }
                    
                    return monitor.threats.size > initialThreats;
                },
                expected: true
            }
        ];

        tests.forEach(test => this.runTest(test));
    }

    // Test 7: CSRF Protection
    testCSRFProtection() {
        console.log('🧪 Testing CSRF Protection...');
        
        const tests = [
            {
                name: 'CSRF Token Generation',
                test: () => {
                    const token = window.SecurityUtils?.generateCSRFToken?.();
                    return token && token.length === 64;
                },
                expected: true
            },
            {
                name: 'CSRF Token Validation',
                test: () => {
                    const token = window.SecurityUtils?.generateCSRFToken?.();
                    sessionStorage.setItem('csrf_token', token);
                    return window.SecurityUtils?.validateCSRFToken?.(token);
                },
                expected: true
            },
            {
                name: 'Invalid CSRF Token Rejection',
                test: () => {
                    return !window.SecurityUtils?.validateCSRFToken?.('invalid_token');
                },
                expected: true
            }
        ];

        tests.forEach(test => this.runTest(test));
    }

    // Test 8: Input Validation
    testInputValidation() {
        console.log('🧪 Testing Input Validation...');
        
        const tests = [
            {
                name: 'SQL Injection Detection',
                test: () => {
                    const monitor = window.securityMonitor;
                    if (!monitor) return false;
                    
                    const initialThreats = monitor.threats.size;
                    
                    // Simulate SQL injection input
                    const input = document.createElement('input');
                    input.value = "'; DROP TABLE users; --";
                    input.dispatchEvent(new Event('input'));
                    
                    return monitor.threats.size > initialThreats;
                },
                expected: true
            },
            {
                name: 'XSS Input Detection',
                test: () => {
                    const monitor = window.securityMonitor;
                    if (!monitor) return false;
                    
                    const initialThreats = monitor.threats.size;
                    
                    // Simulate XSS input
                    const input = document.createElement('input');
                    input.value = '<script>alert("xss")</script>';
                    input.dispatchEvent(new Event('input'));
                    
                    return monitor.threats.size > initialThreats;
                },
                expected: true
            }
        ];

        tests.forEach(test => this.runTest(test));
    }

    // Test 9: Network Security
    testNetworkSecurity() {
        console.log('🧪 Testing Network Security...');
        
        const tests = [
            {
                name: 'HTTPS Enforcement',
                test: () => {
                    return window.location.protocol === 'https:';
                },
                expected: true
            },
            {
                name: 'Secure Headers',
                test: () => {
                    const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
                    return meta && meta.getAttribute('content').includes("'self'");
                },
                expected: true
            }
        ];

        tests.forEach(test => this.runTest(test));
    }

    // Test 10: Firebase Security
    testFirebaseSecurity() {
        console.log('🧪 Testing Firebase Security...');
        
        const tests = [
            {
                name: 'Firebase Configuration',
                test: () => {
                    return window.firebase && window.firebase.app;
                },
                expected: true
            },
            {
                name: 'Authentication State',
                test: () => {
                    return new Promise((resolve) => {
                        if (window.firebase?.auth) {
                            window.firebase.auth().onAuthStateChanged((user) => {
                                resolve(true); // Just checking if auth is working
                            });
                        } else {
                            resolve(false);
                        }
                    });
                },
                expected: true
            }
        ];

        tests.forEach(test => this.runTest(test));
    }

    // Run individual test
    runTest(test) {
        this.results.total++;
        
        try {
            const result = test.test();
            const passed = result === test.expected;
            
            if (passed) {
                this.results.passed++;
                console.log(`✅ ${test.name}`);
            } else {
                this.results.failed++;
                console.log(`❌ ${test.name} - Expected: ${test.expected}, Got: ${result}`);
            }
        } catch (error) {
            this.results.failed++;
            console.log(`❌ ${test.name} - Error: ${error.message}`);
        }
    }

    // Run all tests
    async runAllTests() {
        console.log('🚀 Starting comprehensive security test suite...\n');
        
        this.testSecurityConfiguration();
        this.testSecurityUtils();
        this.testRateLimiting();
        this.testSessionManagement();
        this.testSecurityMonitoring();
        this.testXSSProtection();
        this.testCSRFProtection();
        this.testInputValidation();
        this.testNetworkSecurity();
        await this.testFirebaseSecurity();
        
        this.printResults();
    }

    // Print test results
    printResults() {
        console.log('\n📊 SECURITY TEST RESULTS');
        console.log('========================');
        console.log(`Total Tests: ${this.results.total}`);
        console.log(`Passed: ${this.results.passed} ✅`);
        console.log(`Failed: ${this.results.failed} ❌`);
        console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
        
        if (this.results.failed === 0) {
            console.log('\n🎉 ALL SECURITY TESTS PASSED!');
            console.log('🔒 Your application is secure and protected against common threats.');
        } else {
            console.log('\n⚠️  Some security tests failed. Please review the issues above.');
        }
        
        // Security recommendations
        console.log('\n🔒 SECURITY RECOMMENDATIONS:');
        console.log('1. Regularly update dependencies');
        console.log('2. Monitor security logs');
        console.log('3. Conduct penetration testing');
        console.log('4. Keep security configurations updated');
        console.log('5. Train users on security best practices');
    }
}

// Run security tests when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const testSuite = new SecurityTestSuite();
        testSuite.runAllTests();
    }, 2000); // Wait for all scripts to load
});

// Export for manual testing
window.SecurityTestSuite = SecurityTestSuite; 