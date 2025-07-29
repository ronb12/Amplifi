# �� Amplifi Security

**A Product of Bradley Virtual Solutions, LLC**

## Security Overview

Amplifi is a secure social media application with comprehensive security measures implemented to protect users, data, and the application from various threats.

## 🛡️ Security Features

### Multi-Layer Security Architecture

- **Network Security**: HTTPS enforcement, CORS protection, security headers
- **Application Security**: Input validation, output encoding, session management
- **Database Security**: Firestore security rules, authentication required
- **Monitoring Security**: Real-time threat detection and response
- **Access Security**: Role-based permissions, authentication required

### Key Security Components

1. **Centralized Security Configuration** (`js/security-config.js`)
2. **Security Monitoring System** (`js/security-monitor.js`)
3. **Firebase Security Rules** (`firebase-security-rules.json`)
4. **Comprehensive Test Suite** (`test-security.js`)

## 🚀 Quick Start

### Prerequisites

- Node.js 14+ (for development)
- Firebase CLI (for deployment)
- Git (for version control)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ronb12/Amplifi.git
   cd Amplifi/public
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure security settings**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Edit environment variables
   nano .env.local
   ```

4. **Deploy security rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

5. **Deploy application**
   ```bash
   firebase deploy --only hosting
   ```

6. **Access the application**
   ```
   https://amplifi-a54d9.web.app
   ```

## 🔐 Security Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Firebase Configuration
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=your_publishable_key
STRIPE_SECRET_KEY=your_secret_key
STRIPE_BACKEND_URL=your_backend_url

# Security Configuration
SECURITY_SESSION_TIMEOUT=3600000
SECURITY_MAX_LOGIN_ATTEMPTS=5
SECURITY_RATE_LIMIT_WINDOW=60000
SECURITY_MAX_REQUESTS_PER_WINDOW=100
```

### Security Settings

The application uses centralized security configuration:

```javascript
const SECURITY_CONFIG = {
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

## 🧪 Security Testing

### Run Security Tests

```bash
# Run comprehensive security test suite
node tests/security/test-security.js

# Or open in browser
open tests/security/test-security.html
```

### Test Categories

1. **Configuration Tests**: Verify security settings
2. **Utility Tests**: Test security functions
3. **Rate Limiting Tests**: Verify abuse prevention
4. **Session Tests**: Test session management
5. **Monitoring Tests**: Verify threat detection
6. **Protection Tests**: Test XSS and CSRF protection
7. **Validation Tests**: Test input validation
8. **Network Tests**: Verify HTTPS and headers
9. **Database Tests**: Test Firestore security

## 📊 Security Monitoring

### Real-Time Threat Detection

The application includes comprehensive security monitoring:

- **XSS Detection**: Monitors for script injection attempts
- **CSRF Detection**: Validates all form submissions and requests
- **SQL Injection Detection**: Pattern-based detection
- **Rate Limiting Violations**: Monitors for abuse
- **Suspicious Network Activity**: Blocks malicious domains
- **DOM Manipulation**: Monitors for unauthorized changes
- **File Access Monitoring**: Prevents malicious file uploads
- **Authentication Bypass**: Protects against auth bypass attempts

### Security Logs

Security events are logged for monitoring:

```javascript
// Example security log entry
{
    id: 'threat_1234567890_abc123',
    type: 'XSS_ATTEMPT',
    details: {
        type: 'script_creation',
        stack: 'Error stack trace',
        timestamp: 1234567890
    },
    timestamp: 1234567890,
    userAgent: 'Mozilla/5.0...',
    url: 'https://amplifi-a54d9.web.app/',
    referrer: 'https://google.com/'
}
```

## 🗄️ Database Security

### Firestore Security Rules

The database is protected by comprehensive security rules:

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

All data is validated before storage:

```javascript
// Example data validation
"email": {
    ".validate": "newData.isString() && newData.val().matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$/)"
},
"displayName": {
    ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 50"
},
"content": {
    ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 10000"
}
```

## 🔑 Authentication & Authorization

### User Roles

The application supports three user roles:

1. **User**: Basic access to posts, comments, messages
2. **Creator**: Additional access to monetization features
3. **Admin**: Full system access and moderation capabilities

### Session Management

- **Session Timeout**: 1 hour of inactivity
- **CSRF Protection**: Token-based request validation
- **Activity Monitoring**: Continuous session validation
- **Secure Logout**: Complete session cleanup

## 🌐 Network Security

### HTTPS Enforcement

All traffic is encrypted using HTTPS:

```javascript
// HTTPS enforcement
if (window.location.protocol !== 'https:') {
    window.location.href = 'https://' + window.location.host + window.location.pathname;
}
```

### Security Headers

Comprehensive security headers are implemented:

```javascript
const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};
```

### Content Security Policy (CSP)

CSP headers prevent XSS attacks:

```javascript
const csp = {
    defaultSrc: ["'self'"],
    scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://js.stripe.com",
        "https://www.googletagmanager.com"
    ],
    styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com"
    ],
    // ... additional directives
};
```

## 📝 Security Documentation

### Documentation Files

- **`SECURITY_DOCUMENTATION.md`**: Complete security documentation
- **`SECURITY_IMPLEMENTATION_GUIDE.md`**: Developer implementation guide
- **`SECURITY_THREAT_MODEL.md`**: Threat model and risk assessment
- **`README_SECURITY.md`**: This security overview

### Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Web Security Guidelines](https://web.dev/security/)

## 🚨 Incident Response

### Security Contacts

- **Security Team**: security@amplifi.com
- **Emergency Contact**: security-emergency@amplifi.com
- **Bug Reports**: security-bugs@amplifi.com
- **Company Website**: https://bradleyvirtualsolutions.com

### Incident Response Process

1. **Detection**: Real-time threat detection
2. **Analysis**: Threat classification and impact assessment
3. **Containment**: Immediate threat blocking
4. **Eradication**: Threat removal and system cleanup
5. **Recovery**: System restoration and verification
6. **Lessons Learned**: Process improvement and documentation

## 🔄 Security Maintenance

### Regular Tasks

- **Daily**: Monitor security logs
- **Weekly**: Review threat reports
- **Monthly**: Update security configurations
- **Quarterly**: Run comprehensive security tests
- **Annually**: Conduct security audit

### Security Updates

- Keep all dependencies updated
- Monitor security advisories
- Update security configurations as needed
- Conduct regular penetration testing
- Review and update security documentation

## 📊 Security Metrics

### Key Performance Indicators

- **Threat Detection Rate**: Percentage of threats detected
- **False Positive Rate**: Percentage of false alarms
- **Response Time**: Time to respond to security incidents
- **Resolution Time**: Time to resolve security incidents
- **User Impact**: Number of users affected by incidents

### Security Dashboard

```javascript
// Security metrics
const securityMetrics = {
    threatsDetected: securityMonitor.threats.size,
    blockedIPs: securityMonitor.blockedIPs.size,
    activeSessions: SecurityUtils.sessionManager.getActiveSessions(),
    failedLogins: getFailedLoginCount(),
    securityScore: calculateSecurityScore()
};
```

## 🤝 Contributing to Security

### Security Guidelines

1. **Follow Security Best Practices**: Always validate inputs, sanitize data, and use secure coding practices
2. **Report Security Issues**: Use the security contact information to report vulnerabilities
3. **Security Reviews**: Participate in security code reviews
4. **Security Testing**: Run security tests before submitting changes
5. **Documentation**: Update security documentation when making changes

### Security Checklist

Before submitting changes:

- [ ] Input validation implemented
- [ ] Output encoding applied
- [ ] Authentication required where needed
- [ ] Authorization checks in place
- [ ] Security tests passing
- [ ] Documentation updated
- [ ] No sensitive data exposed
- [ ] Rate limiting implemented
- [ ] Error handling secure
- [ ] Logging implemented

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🙏 Acknowledgments

- [Firebase](https://firebase.google.com/) for security infrastructure
- [Stripe](https://stripe.com/) for secure payment processing
- [OWASP](https://owasp.org/) for security guidelines
- [Vercel](https://vercel.com/) for backend hosting
- Security community for best practices and guidance

## 📞 Support

- **General Support**: support@amplifi.com
- **Security Issues**: security@amplifi.com
- **Bug Reports**: bugs@amplifi.com
- **Feature Requests**: features@amplifi.com
- **Company Website**: https://bradleyvirtualsolutions.com
- **Business Inquiries**: business@bradleyvirtualsolutions.com

---

**🔒 Security is our top priority. We are committed to protecting our users and their data.**

**🎵 Amplifi - Where Music Meets Social Media**

---

**© 2024 Bradley Virtual Solutions, LLC. All rights reserved.** 