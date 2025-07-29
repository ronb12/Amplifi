# 🎵 Amplifi - Social Media Platform

[![Security](https://img.shields.io/badge/Security-Maximum%20Protection-brightgreen)](https://github.com/ronb12/Amplifi/tree/main/docs/security)
[![Firebase](https://img.shields.io/badge/Firebase-Hosted-blue)](https://amplifi-a54d9.web.app)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)](https://amplifi-a54d9.web.app)

## 🌟 Overview

Amplifi is a modern, secure social media platform built with cutting-edge web technologies. It features real-time messaging, music sharing, live streaming, monetization tools, and comprehensive security measures.

## ✨ Features

### 🎵 **Music & Entertainment**
- **Music Library**: Browse and share music tracks
- **Playlist Creation**: Create and manage playlists
- **Live Streaming**: Real-time audio/video streaming
- **Music Discovery**: Find new artists and tracks

### 💬 **Social Features**
- **Real-time Messaging**: Instant messaging with users
- **Post Sharing**: Share text, images, videos, and music
- **Comments & Likes**: Interactive social engagement
- **User Profiles**: Customizable user profiles
- **Follow System**: Follow other users and creators

### 💰 **Monetization**
- **Tip System**: Send tips to creators
- **Subscription Plans**: Monthly/yearly creator subscriptions
- **Stripe Integration**: Secure payment processing
- **Creator Dashboard**: Manage earnings and analytics

### 🔒 **Security & Privacy**
- **Maximum Security**: Multi-layer security architecture
- **Real-time Monitoring**: Threat detection and response
- **Data Protection**: Encryption and secure storage
- **Privacy Controls**: Granular privacy settings
- **Authentication**: Secure user authentication

### 📱 **Modern UI/UX**
- **Responsive Design**: Works on all devices
- **PWA Support**: Progressive Web App capabilities
- **Dark/Light Mode**: Theme customization
- **Mobile-First**: Optimized for mobile devices

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

3. **Configure environment variables**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Edit environment variables
   nano .env.local
   ```

4. **Deploy to Firebase**
   ```bash
   # Deploy security rules
   firebase deploy --only firestore:rules
   
   # Deploy application
   firebase deploy --only hosting
   ```

5. **Access the application**
   ```
   https://amplifi-a54d9.web.app
   ```

## 📁 Project Structure

```
📁 Amplifi/
├── 📁 docs/                          # Documentation
│   ├── 📁 security/                  # Security documentation
│   │   ├── SECURITY_DOCUMENTATION.md
│   │   ├── SECURITY_IMPLEMENTATION_GUIDE.md
│   │   ├── SECURITY_THREAT_MODEL.md
│   │   └── README_SECURITY.md
│   ├── 📁 development/               # Development docs
│   └── 📁 deployment/                # Deployment docs
├── 📁 config/                        # Configuration files
│   ├── firebase-security-rules.json
│   ├── firebaseConfig.js
│   └── manifest.json
├── 📁 js/                            # JavaScript files
│   ├── security-config.js           # Security configuration
│   ├── security-monitor.js          # Security monitoring
│   ├── stripe-vercel-backend.js     # Payment processing
│   ├── music-library.js             # Music features
│   ├── feed.js                      # Social feed
│   ├── messages.js                  # Messaging system
│   └── ...                          # Other modules
├── 📁 tests/                         # Test files
│   ├── 📁 security/                 # Security tests
│   └── 📁 functionality/            # Functionality tests
├── 📁 assets/                        # Static assets
│   ├── 📁 images/                   # Images and SVGs
│   ├── 📁 icons/                    # Icons and favicons
│   └── 📁 fonts/                    # Font files
├── 📁 scripts/                       # Utility scripts
│   ├── 📁 deployment/               # Deployment scripts
│   └── 📁 backup/                   # Backup scripts
├── 📁 vercel-stripe-backend/         # Backend API
├── 📁 functions/                     # Firebase Functions
├── 📄 index.html                     # Main application
├── 📄 styles.css                     # Main stylesheet
├── 📄 comprehensive-fixes.js         # Global fixes
├── 📄 .gitignore                     # Git ignore rules
└── 📄 README.md                      # This file
```

## 🔧 Configuration

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

### Security Configuration

The application uses centralized security configuration in `js/security-config.js`:

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

## 🧪 Testing

### Run Security Tests

```bash
# Run comprehensive security test suite
node tests/security/test-security.js

# Or open in browser
open tests/security/test-security.html
```

### Run Functionality Tests

```bash
# Run functionality tests
node tests/functionality/test-all-fixes.js

# Test specific features
node tests/functionality/test-music-library.js
node tests/functionality/test-tip-payment.js
```

## 🔒 Security

### Security Features

- **Multi-Layer Security**: Network, application, database, monitoring, and access layers
- **Real-Time Monitoring**: Threat detection and response
- **Input Validation**: All inputs validated and sanitized
- **CSRF Protection**: Token-based request validation
- **XSS Prevention**: Script injection detection and blocking
- **Rate Limiting**: Abuse prevention and DoS protection
- **Session Management**: Secure session handling
- **Data Encryption**: Encryption in transit and at rest

### Security Documentation

- [Security Documentation](docs/security/SECURITY_DOCUMENTATION.md)
- [Implementation Guide](docs/security/SECURITY_IMPLEMENTATION_GUIDE.md)
- [Threat Model](docs/security/SECURITY_THREAT_MODEL.md)
- [Security Overview](docs/security/README_SECURITY.md)

## 🚀 Deployment

### Firebase Deployment

```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy hosting
firebase deploy --only hosting

# Deploy functions (if any)
firebase deploy --only functions
```

### Vercel Backend Deployment

```bash
# Deploy Stripe backend
cd vercel-stripe-backend
vercel deploy
```

## 📊 Features Overview

### User Features
- ✅ User registration and authentication
- ✅ Profile creation and customization
- ✅ Post creation and sharing
- ✅ Real-time messaging
- ✅ Music library access
- ✅ Live streaming capabilities
- ✅ Tip creators
- ✅ Subscribe to creators

### Creator Features
- ✅ Creator dashboard
- ✅ Earnings management
- ✅ Subscription plan creation
- ✅ Content monetization
- ✅ Analytics and insights

### Admin Features
- ✅ Admin dashboard
- ✅ User management
- ✅ Content moderation
- ✅ System monitoring
- ✅ Security oversight

## 🔗 Links

- **Live Application**: https://amplifi-a54d9.web.app
- **GitHub Repository**: https://github.com/ronb12/Amplifi
- **Firebase Console**: https://console.firebase.google.com/project/amplifi-a54d9
- **Security Documentation**: [docs/security/](docs/security/)

## 🤝 Contributing

### Development Guidelines

1. **Follow Security Best Practices**: Always validate inputs, sanitize data, and use secure coding practices
2. **Run Tests**: Ensure all tests pass before submitting changes
3. **Update Documentation**: Keep documentation current with code changes
4. **Code Review**: Participate in code reviews and security reviews
5. **Security Testing**: Run security tests before deployment

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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Firebase](https://firebase.google.com/) for backend infrastructure
- [Stripe](https://stripe.com/) for payment processing
- [OWASP](https://owasp.org/) for security guidelines
- [Vercel](https://vercel.com/) for backend hosting
- Security community for best practices and guidance

## 📞 Support

- **General Support**: support@amplifi.com
- **Security Issues**: security@amplifi.com
- **Bug Reports**: bugs@amplifi.com
- **Feature Requests**: features@amplifi.com

---

**🔒 Security is our top priority. We are committed to protecting our users and their data.**

**🎵 Amplifi - Where Music Meets Social Media** 