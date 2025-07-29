# 🔒 Security Implementation Guide

## Overview

This guide provides detailed instructions for implementing, maintaining, and extending the security features in the Amplifi application.

## Quick Start

### 1. Include Security Scripts

Add the security scripts to your HTML pages:

```html
<!-- Add these before other scripts -->
<script src="js/security-config.js"></script>
<script src="js/security-monitor.js"></script>
```

### 2. Initialize Security

The security system initializes automatically, but you can also initialize manually:

```javascript
// Security configuration is automatically loaded
console.log('Security config loaded:', window.SECURITY_CONFIG);

// Security monitoring starts automatically
console.log('Security monitor active:', window.securityMonitor);
```

## Security Configuration

### Basic Configuration

The security configuration is centralized in `js/security-config.js`:

```javascript
const SECURITY_CONFIG = {
    // Stripe Configuration
    stripe: {
        publishableKey: 'pk_live_...',
        backendUrl: 'https://...',
        currency: 'usd',
        minimumTipAmount: 0.50
    },
    
    // Firebase Configuration
    firebase: {
        apiKey: 'AIzaSy...',
        authDomain: 'amplifi-a54d9.firebaseapp.com',
        // ... other config
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
    }
};
```

### Environment Variables

For production, use environment variables:

```javascript
const SECURITY_CONFIG = {
    stripe: {
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_live_...',
        backendUrl: process.env.STRIPE_BACKEND_URL || 'https://...',
        // ...
    }
};
```

## Security Utilities

### CSRF Protection

Generate and validate CSRF tokens:

```javascript
// Generate CSRF token
const csrfToken = SecurityUtils.generateCSRFToken();

// Validate CSRF token
const isValid = SecurityUtils.validateCSRFToken(token);

// Add to form
const form = document.getElementById('myForm');
const csrfInput = document.createElement('input');
csrfInput.type = 'hidden';
csrfInput.name = 'csrf_token';
csrfInput.value = csrfToken;
form.appendChild(csrfInput);
```

### Input Sanitization

Sanitize user inputs to prevent injection attacks:

```javascript
// Sanitize user input
const userInput = document.getElementById('userInput').value;
const sanitizedInput = SecurityUtils.sanitizeInput(userInput);

// Use sanitized input
console.log('Sanitized input:', sanitizedInput);
```

### Password Validation

Validate password strength:

```javascript
// Validate password
const password = 'MyPassword123!';
const validation = SecurityUtils.validatePassword(password);

if (validation.valid) {
    console.log('Password is strong');
} else {
    console.log('Password error:', validation.error);
}
```

### Rate Limiting

Implement rate limiting for API calls:

```javascript
// Check rate limit before making request
const userId = 'user123';
const isAllowed = SecurityUtils.rateLimiter.isAllowed(userId, 10);

if (isAllowed) {
    // Make API request
    makeApiRequest();
} else {
    console.log('Rate limit exceeded');
}
```

## Session Management

### Start Session

```javascript
// Start user session
SecurityUtils.sessionManager.startSession('user123');

// Session is automatically managed
console.log('Session started');
```

### Check Session Validity

```javascript
// Check if session is valid
const isValid = SecurityUtils.sessionManager.isSessionValid();

if (!isValid) {
    // Redirect to login
    window.location.href = '/login.html';
}
```

### End Session

```javascript
// End session (logout)
SecurityUtils.sessionManager.endSession();
```

## Security Monitoring

### Threat Detection

The security monitor automatically detects threats:

```javascript
// Check threat statistics
const stats = securityMonitor.getThreatStats();
console.log('Security stats:', stats);

// Clear threats (for testing)
securityMonitor.clearThreats();
```

### Custom Threat Detection

Add custom threat detection:

```javascript
// Log custom threat
securityMonitor.logThreat('CUSTOM_THREAT', {
    type: 'custom_detection',
    details: 'Custom threat detected',
    severity: 'high',
    timestamp: Date.now()
});
```

## API Security

### Secure API Requests

Make secure API requests with CSRF protection:

```javascript
// Secure API request
async function makeSecureRequest(url, data) {
    const csrfToken = SecurityUtils.generateCSRFToken();
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(data)
    });
    
    return response.json();
}
```

### Request Validation

Validate requests before processing:

```javascript
// Validate request
function validateApiRequest(type, identifier) {
    // Rate limiting
    if (!SecurityUtils.rateLimiter.isAllowed(identifier, 10)) {
        throw new Error('Rate limit exceeded');
    }
    
    // Session validation
    if (!SecurityUtils.sessionManager.isSessionValid()) {
        throw new Error('Invalid session');
    }
    
    // CSRF validation
    const csrfToken = request.headers['X-CSRF-Token'];
    if (!SecurityUtils.validateCSRFToken(csrfToken)) {
        throw new Error('Invalid CSRF token');
    }
    
    return true;
}
```

## Database Security

### Firestore Security Rules

The database is protected by comprehensive Firestore rules:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    
    "users": {
      "$uid": {
        ".read": "auth != null && (auth.uid == $uid || root.child('users').child(auth.uid).child('role').val() == 'admin')",
        ".write": "auth != null && auth.uid == $uid",
        ".validate": "newData.hasChildren(['email', 'displayName', 'createdAt'])"
      }
    }
  }
}
```

### Data Validation

Validate data before storing:

```javascript
// Validate user data
function validateUserData(userData) {
    const validation = {
        email: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
        displayName: /^[a-zA-Z0-9\s]{1,50}$/,
        bio: /^[\s\S]{0,500}$/
    };
    
    for (const [field, pattern] of Object.entries(validation)) {
        if (!pattern.test(userData[field])) {
            throw new Error(`Invalid ${field}`);
        }
    }
    
    return true;
}
```

## Form Security

### Secure Form Handling

```javascript
// Secure form submission
document.getElementById('secureForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate inputs
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Sanitize inputs
    for (const [key, value] of Object.entries(data)) {
        data[key] = SecurityUtils.sanitizeInput(value);
    }
    
    // Validate CSRF token
    const csrfToken = formData.get('csrf_token');
    if (!SecurityUtils.validateCSRFToken(csrfToken)) {
        alert('Invalid request');
        return;
    }
    
    // Check rate limit
    const userId = getCurrentUserId();
    if (!SecurityUtils.rateLimiter.isAllowed(userId, 5)) {
        alert('Too many requests. Please wait.');
        return;
    }
    
    // Submit form
    try {
        const response = await makeSecureRequest('/api/submit', data);
        console.log('Form submitted successfully:', response);
    } catch (error) {
        console.error('Form submission failed:', error);
    }
});
```

## Payment Security

### Secure Payment Processing

```javascript
// Secure payment processing
class SecurePaymentProcessor {
    constructor() {
        this.stripe = Stripe(SECURITY_CONFIG.stripe.publishableKey);
        this.initializeSecurity();
    }
    
    initializeSecurity() {
        this.rateLimiter = SecurityUtils.rateLimiter;
        this.csrfToken = SecurityUtils.generateCSRFToken();
    }
    
    async processPayment(amount, recipientId) {
        // Security validation
        if (!this.validateRequest('payment', recipientId)) {
            throw new Error('Request blocked by security measures');
        }
        
        // Sanitize inputs
        const sanitizedRecipientId = SecurityUtils.sanitizeInput(recipientId);
        
        // Create payment intent
        const response = await fetch(`${SECURITY_CONFIG.stripe.backendUrl}/create-payment-intent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': this.csrfToken,
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                amount: Math.round(amount * 100),
                currency: SECURITY_CONFIG.stripe.currency,
                recipientId: sanitizedRecipientId
            })
        });
        
        return response.json();
    }
    
    validateRequest(type, identifier) {
        // Rate limiting
        const rateLimitKey = `${type}_${identifier}`;
        if (!this.rateLimiter.isAllowed(rateLimitKey, 10)) {
            return false;
        }
        
        // Session validation
        if (!SecurityUtils.sessionManager.isSessionValid()) {
            return false;
        }
        
        return true;
    }
}
```

## Testing Security

### Run Security Tests

```javascript
// Run comprehensive security tests
const testSuite = new SecurityTestSuite();
testSuite.runAllTests();
```

### Custom Security Tests

```javascript
// Custom security test
function testCustomSecurityFeature() {
    const test = {
        name: 'Custom Security Test',
        test: () => {
            // Your custom security test logic
            return true;
        },
        expected: true
    };
    
    // Run the test
    const result = test.test();
    const passed = result === test.expected;
    
    console.log(passed ? '✅ Test passed' : '❌ Test failed');
    return passed;
}
```

## Error Handling

### Secure Error Handling

```javascript
// Secure error handling
function handleError(error, context) {
    // Log error securely (don't expose sensitive info)
    console.error('Error in', context, ':', error.message);
    
    // Don't expose internal details to users
    const userMessage = 'An error occurred. Please try again.';
    
    // Log security-relevant errors
    if (error.message.includes('security') || error.message.includes('auth')) {
        securityMonitor.logThreat('ERROR_SECURITY', {
            type: 'security_error',
            error: error.message,
            context: context,
            timestamp: Date.now()
        });
    }
    
    return userMessage;
}
```

## Deployment Security

### Production Security Checklist

Before deploying to production:

- [ ] All environment variables set
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] CSP headers active
- [ ] Rate limiting enabled
- [ ] Session management active
- [ ] Security monitoring running
- [ ] Database rules deployed
- [ ] Security tests passing

### Security Headers

Ensure these security headers are set:

```javascript
// Security headers
const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com;"
};
```

## Maintenance

### Regular Security Tasks

1. **Daily**: Monitor security logs
2. **Weekly**: Review threat reports
3. **Monthly**: Update security configurations
4. **Quarterly**: Run comprehensive security tests
5. **Annually**: Conduct security audit

### Security Updates

```javascript
// Update security configuration
function updateSecurityConfig(newConfig) {
    // Validate new configuration
    if (!validateSecurityConfig(newConfig)) {
        throw new Error('Invalid security configuration');
    }
    
    // Update configuration
    Object.assign(SECURITY_CONFIG, newConfig);
    
    // Reinitialize security measures
    SecurityUtils.sessionManager.updateConfig(newConfig);
    securityMonitor.updateConfig(newConfig);
    
    console.log('Security configuration updated');
}
```

## Troubleshooting

### Common Issues

1. **CSRF Token Errors**
   - Ensure tokens are generated and validated properly
   - Check that tokens are included in all requests

2. **Rate Limiting Issues**
   - Verify rate limit configuration
   - Check if limits are appropriate for your use case

3. **Session Timeout Issues**
   - Adjust session timeout in configuration
   - Ensure session validation is working

4. **Security Monitor Not Working**
   - Check browser console for errors
   - Verify security scripts are loaded

### Debug Security Issues

```javascript
// Enable security debugging
function enableSecurityDebug() {
    console.log('Security Config:', window.SECURITY_CONFIG);
    console.log('Security Utils:', window.SecurityUtils);
    console.log('Security Monitor:', window.securityMonitor);
    
    // Monitor security events
    window.addEventListener('security-event', (event) => {
        console.log('Security Event:', event.detail);
    });
}
```

## Best Practices

### Code Security

1. **Always validate inputs**
2. **Sanitize all user data**
3. **Use CSRF tokens for all forms**
4. **Implement rate limiting**
5. **Validate sessions**
6. **Log security events**
7. **Handle errors securely**
8. **Keep dependencies updated**

### Configuration Security

1. **Use environment variables for secrets**
2. **Regularly rotate API keys**
3. **Monitor security logs**
4. **Update security configurations**
5. **Test security features regularly**

---

*This guide should be updated regularly to reflect current security best practices and implementation details.* 