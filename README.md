# 🎬 Amplifi - Complete Creator Platform

[![Deploy to Firebase](https://github.com/ronb12/Amplifi/actions/workflows/deploy.yml/badge.svg)](https://github.com/ronb12/Amplifi/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-amplifi--a54d9.web.app-blue)](https://amplifi-a54d9.web.app)

> **The ultimate platform for content creators with AI-powered recommendations, live streaming, and advanced creator tools.**

## 🌟 Live Demo

**🌐 Visit:** [https://amplifi-a54d9.web.app](https://amplifi-a54d9.web.app)

## ✨ Features

### 📱 Core Pages (9)
- **🏠 Home:** Hero section with platform features and trending content
- **📱 Feed:** Personalized content feed with AI recommendations
- **⚡ Moments:** Short-form video content (TikTok/Shorts style)
- **📈 Trending:** Popular content discovery with category filters
- **🔴 Live:** Live streaming with Go Live and Schedule Stream buttons
- **📤 Upload:** Content creation and upload tools
- **👤 Profile:** User profile and channel management
- **📚 Library:** Personal content library and playlists
- **🔍 Search:** Advanced content search and discovery

### 🔐 Authentication System
- **Sign In/Sign Up:** Professional modal on all pages
- **Form Validation:** Email and password validation
- **Loading States:** User feedback and error handling
- **Responsive Design:** Works on all devices

### 📱 Navigation
- **Mobile:** 2+1+2 tab layout (Home, Feed | Create | Live, Library)
- **Desktop:** Horizontal scrolling navigation
- **YouTube-Style:** Professional UI/UX design

### 🎨 Design & UX
- **Professional UI:** YouTube-inspired design
- **Responsive:** Perfect on desktop, tablet, and mobile
- **Inter Font:** Modern typography
- **Glass Morphism:** Backdrop blur effects
- **Gradient Branding:** Blue to purple gradients
- **Smooth Animations:** Hover effects and transitions

### 🖼️ Pexels Integration
- **Dynamic Images:** Real-time image loading from Pexels API
- **Beautiful Thumbnails:** High-quality video thumbnails
- **Automatic Loading:** Seamless image integration

## 🚀 Technology Stack

### Frontend
- **HTML5:** Semantic markup and accessibility
- **CSS3:** Modern styling with Flexbox and Grid
- **JavaScript (ES6+):** Interactive functionality
- **Font Awesome:** Professional icons
- **Google Fonts:** Inter typography

### Backend & Services
- **Firebase Hosting:** Fast, secure hosting
- **Firebase Authentication:** User management (ready for integration)
- **Firebase Firestore:** Database (configured)
- **Pexels API:** Dynamic image service

### Development & Deployment
- **GitHub Actions:** Automated CI/CD
- **Firebase CLI:** Deployment automation
- **Service Workers:** PWA capabilities
- **Responsive Design:** Mobile-first approach

## 📁 Project Structure

```
Amplifi/
├── public/                     # Main application files
│   ├── assets/                 # Static assets
│   │   ├── css/               # Stylesheets
│   │   │   └── youtube-style.css  # Main CSS file
│   │   ├── js/                # JavaScript files
│   │   │   ├── app.js         # Main application logic
│   │   │   ├── core-features.js   # Core functionality
│   │   │   ├── pexels-service.js  # Pexels API integration
│   │   │   └── image-loader.js    # Dynamic image loading
│   │   └── images/            # Static images
│   ├── config/                # Configuration files
│   │   └── firebaseConfig.js  # Firebase configuration
│   ├── index.html             # Home page
│   ├── feed.html              # Feed page
│   ├── moments.html           # Moments page
│   ├── trending.html          # Trending page
│   ├── live.html              # Live streaming page
│   ├── upload.html            # Upload page
│   ├── profile.html           # Profile page
│   ├── library.html           # Library page
│   ├── search.html            # Search page
│   ├── manifest.json          # PWA manifest
│   └── sw.js                  # Service worker
├── .github/                   # GitHub configuration
│   └── workflows/             # GitHub Actions
│       └── deploy.yml         # Deployment workflow
├── firebase.json              # Firebase configuration
└── README.md                  # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- Firebase CLI
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/ronb12/Amplifi.git
   cd Amplifi
   ```

2. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

3. **Login to Firebase**
   ```bash
   firebase login
   ```

4. **Serve locally**
   ```bash
   firebase serve
   ```

5. **Open in browser**
   ```
   http://localhost:5000
   ```

### Deployment

**Automatic deployment via GitHub Actions:**
- Push to `main` branch triggers automatic deployment
- Includes security scanning and build checks
- Deploys to Firebase Hosting

**Manual deployment:**
```bash
firebase deploy --only hosting
```

## 📱 Features in Detail

### Authentication System
- **Modal-based:** Professional sign-in/sign-up modals
- **Form validation:** Email format and password length validation
- **Loading states:** Visual feedback during authentication
- **Error handling:** User-friendly error messages
- **Responsive:** Works perfectly on all devices

### Navigation System
- **Mobile Navigation:** Bottom tab bar with 5 tabs
  - Home and Feed on the left
  - Create button in the center (plus icon)
  - Live and Library on the right
- **Desktop Navigation:** Top horizontal scrolling tabs
- **Active states:** Visual indication of current page
- **Smooth transitions:** Animated tab switching

### Live Streaming Features
- **Go Live Button:** Instant live streaming (opens authentication)
- **Schedule Stream:** Plan future streams
- **Live Now:** Display active live streams with viewer counts
- **Upcoming Streams:** Show scheduled content with times
- **Professional Cards:** Thumbnail previews with engagement stats

### Content Management
- **Upload Tools:** Video, live stream, and moments creation
- **Profile Management:** User profiles with stats and content
- **Library System:** Personal content organization
- **Search Functionality:** Advanced content discovery

## 🎨 Design System

### Colors
- **Primary:** #667eea (Blue)
- **Secondary:** #764ba2 (Purple)
- **Background:** #ffffff (White)
- **Text:** #1a1a1a (Dark Gray)
- **Accent:** #f9f9f9 (Light Gray)

### Typography
- **Font Family:** Inter (Google Fonts)
- **Weights:** 300, 400, 500, 600, 700, 800
- **Responsive:** Scales appropriately on all devices

### Components
- **Cards:** Rounded corners, subtle shadows
- **Buttons:** Gradient backgrounds, hover effects
- **Forms:** Clean inputs with focus states
- **Navigation:** Professional tab design
- **Modals:** Glass morphism with backdrop blur

## 🔧 Configuration

### Firebase Configuration
Located in `public/config/firebaseConfig.js`:
- API keys (public, safe for client-side)
- Project configuration
- Authentication settings
- Firestore database settings

### Service Worker
- **Caching:** Offline functionality
- **Updates:** Automatic cache refresh
- **PWA:** Progressive Web App capabilities

## 📊 Performance

- **100% Functional:** All features working
- **Responsive Design:** Perfect on all screen sizes
- **Fast Loading:** Optimized assets and caching
- **SEO Ready:** Proper meta tags and structure
- **Accessibility:** ARIA labels and keyboard navigation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Pexels:** Beautiful, free stock photos and videos
- **Font Awesome:** Professional icon library
- **Google Fonts:** Inter typography
- **Firebase:** Hosting and backend services
- **GitHub Actions:** Automated deployment

## 📞 Support

- **Live Demo:** [https://amplifi-a54d9.web.app](https://amplifi-a54d9.web.app)
- **Issues:** [GitHub Issues](https://github.com/ronb12/Amplifi/issues)
- **Documentation:** This README

---

**🎉 Amplifi - Where creators amplify their content!**