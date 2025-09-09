# 🎬 Amplifi - Complete Creator Platform

[![Deploy to Firebase](https://github.com/ronb12/Amplifi/actions/workflows/deploy.yml/badge.svg)](https://github.com/ronb12/Amplifi/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-amplifi--a54d9.web.app-blue)](https://amplifi-a54d9.web.app)

> **The ultimate platform for content creators with AI-powered recommendations, live streaming, and advanced creator tools.**

**🏢 A Product of [Bradley Virtual Solutions, LLC](https://bradleyvirtualsolutions.com)**

## 🌟 Live Demo

**🌐 Visit:** [https://amplifi-a54d9.web.app](https://amplifi-a54d9.web.app)

## ✨ Features

### 📱 Core Pages (10)
- **🏠 Home:** Hero section with platform features and trending content
- **📱 Feed:** Personalized content feed with AI recommendations
- **⚡ Moments:** Short-form video content (TikTok/Shorts style)
- **📈 Trending:** Popular content discovery with category filters
- **🔴 Live:** Live streaming with monetization and chat features
- **📤 Upload:** Content creation and upload tools
- **✂️ Video Editor:** Professional built-in video editing suite
- **📅 Schedule:** Content scheduling and calendar system
- **👤 Profile:** User profile and channel management
- **📚 Library:** Personal content library and playlists
- **🔍 Search:** Advanced content search and discovery
- **🔐 Login:** Dedicated authentication page

### 🔐 Authentication System
- **Firebase Integration:** Real authentication with persistent sessions
- **Dedicated Login Page:** Professional standalone authentication
- **Form Validation:** Email and password validation with error handling
- **Loading States:** User feedback and error handling
- **Session Persistence:** Users stay logged in across page refreshes (7-day sessions)
- **Auth Guard:** Protected pages require login
- **Responsive Design:** Works on all devices
- **Social Login:** Ready for Google/Facebook integration

### 📱 Navigation
- **Mobile:** 2+1+2 tab layout (Home, Feed | Create | Live, Library)
- **Mobile Menu:** Tap the red "+" button to access all pages
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
- **Firebase Authentication:** User management with persistent sessions
- **Firebase Firestore:** Database (configured)
- **Pexels API:** Dynamic image service
- **Stripe API:** Payment processing for live monetization
- **Vercel:** Serverless functions for backend processing
- **FFmpeg.js:** High-quality video processing
- **Canvas API:** Real-time video editing

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
│   │   │   ├── auth-guard.js  # Authentication system
│   │   │   ├── stripe-payments.js  # Payment processing
│   │   │   ├── core-features.js   # Core functionality
│   │   │   ├── pexels-service.js  # Pexels API integration
│   │   │   └── image-loader.js    # Dynamic image loading
│   │   └── images/            # Static images
│   ├── api/                   # API endpoints
│   │   ├── create-customer.js # Stripe customer creation
│   │   ├── create-payment-intent.js # Payment processing
│   │   └── stripe-webhook.js  # Stripe webhook handler
│   ├── config/                # Configuration files
│   │   ├── firebaseConfig.js  # Firebase configuration
│   │   └── environment.example.js # Environment variables
│   ├── index.html             # Home page
│   ├── feed.html              # Feed page
│   ├── moments.html           # Moments page
│   ├── trending.html          # Trending page
│   ├── live.html              # Live streaming page
│   ├── upload.html            # Upload page
│   ├── video-editor.html      # Video editing suite
│   ├── schedule.html          # Content scheduling
│   ├── login.html             # Authentication page
│   ├── profile.html           # Profile page
│   ├── library.html           # Library page
│   ├── search.html            # Search page
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   ├── package.json           # Node.js dependencies
│   ├── MONETIZATION_FEATURES.md # Monetization documentation
│   ├── VERCEL_DEPLOYMENT.md   # Vercel setup guide
│   └── BACKEND_SETUP_GUIDE.md # Backend configuration
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

### 🎬 Video Editor (Professional Grade)
- **Real-time Canvas Rendering:** Live preview using HTML5 Canvas API
- **Advanced Editing Tools:**
  - **Trim:** Precise start/end point selection
  - **Crop:** Pixel-perfect area selection with live preview
  - **Rotate:** 90-degree rotation with smooth transitions
  - **Filters:** Brightness, contrast, saturation, and hue adjustment
  - **Text Overlay:** Custom text with positioning, size, and color
  - **Audio Control:** Volume adjustment and audio management
- **High-Quality Export:** VP9 codec with 30 FPS recording
- **FFmpeg.js Integration:** Ready for advanced video processing
- **Professional UI:** YouTube-style editing interface
- **Responsive Design:** Works on desktop and mobile devices

### 💰 Live Streaming & Monetization
- **Live Streaming:** Real-time video streaming with WebRTC
- **Live Chat:** Real-time chat system with moderation tools
- **Tip Button:** Accept viewer donations during live streams
- **Stripe Integration:** Secure payment processing
- **Revenue Dashboard:** Track earnings and analytics
- **Donation Goals:** Set and track funding objectives
- **Chat Settings:** Comprehensive chat configuration
- **Stream Analytics:** Real-time viewer and engagement statistics

### 🔐 Authentication System
- **Dedicated Login Page:** Professional standalone authentication
- **Form validation:** Email format and password length validation
- **Loading states:** Visual feedback during authentication
- **Error handling:** User-friendly error messages
- **Session Persistence:** 7-day persistent sessions
- **Auth Guard:** Protected pages require login
- **Responsive:** Works perfectly on all devices

### Navigation System
- **Mobile Navigation:** Bottom tab bar with 5 tabs
  - Home and Feed on the left
  - Create button in the center (red plus icon)
  - Live and Library on the right
- **Mobile Menu:** Tap the red "+" button to access all pages
  - Slides up from bottom with all available pages
  - Professional YouTube-style design
  - Easy navigation to any page
- **Desktop Navigation:** Top horizontal scrolling tabs
- **Active states:** Visual indication of current page
- **Smooth transitions:** Animated tab switching

### 🎬 Video Editor (Fully Functional)
- **Real-time Preview:** Live canvas rendering with instant feedback
- **Trim Tool:** Cut start and end points with precision
- **Crop Tool:** Select specific areas with pixel-perfect accuracy
- **Rotate Tool:** 90-degree rotation with smooth transitions
- **Filter System:** Brightness, contrast, saturation, and hue adjustment
- **Text Overlay:** Add custom text with positioning and styling
- **Audio Control:** Volume adjustment and audio management
- **High-Quality Export:** VP9 codec with 30 FPS recording
- **Canvas API:** Pixel-perfect video processing
- **FFmpeg.js Ready:** Advanced video processing capabilities
- **Professional UI:** YouTube-style editing interface

### 💰 Live Streaming & Monetization
- **Go Live Button:** Instant live streaming with authentication
- **Live Chat System:** Real-time chat with moderation tools
- **Tip Button:** Accept viewer donations during live streams
- **Stripe Integration:** Secure payment processing
- **Revenue Dashboard:** Track earnings and analytics
- **Donation Goals:** Set and track funding objectives
- **Chat Settings:** Comprehensive chat configuration (gear icon)
- **Stream Analytics:** Real-time viewer and engagement statistics
- **Professional Interface:** YouTube-style live streaming dashboard
- **Schedule Stream:** Plan future streams
- **Live Now:** Display active live streams with viewer counts
- **Upcoming Streams:** Show scheduled content with times
- **Professional Cards:** Thumbnail previews with engagement stats

### 📅 Content Scheduling
- **Interactive Calendar:** Visual content planning interface
- **Schedule Posts:** Plan content publication times
- **Bulk Scheduling:** Schedule multiple posts at once
- **Time Zone Support:** Global scheduling capabilities
- **Content Preview:** Preview scheduled content before publishing
- **Analytics Integration:** Track scheduled content performance

### Content Management
- **Upload Tools:** Video, live stream, and moments creation
- **Profile Management:** User profiles with stats and content
- **Library System:** Personal content organization
- **Search Functionality:** Advanced content discovery

### Mobile Menu System
- **Access All Pages:** Tap the red "+" button to open the mobile menu
- **Professional Design:** YouTube-style bottom sheet interface
- **Complete Navigation:** Access to all 12 pages from any page
- **Smooth Animations:** Slide-up animation with backdrop
- **Easy Access:** Quick navigation to any feature
- **Touch-Friendly:** Large tap targets and intuitive design

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

- **100% Functional:** All features working perfectly
- **Professional Video Editor:** Fully functional with Canvas API
- **High-Quality Export:** VP9 codec with 30 FPS recording
- **Live Monetization:** Stripe integration for payments
- **Content Scheduling:** Advanced calendar system
- **Responsive Design:** Perfect on all screen sizes
- **Fast Loading:** Optimized assets and caching
- **SEO Ready:** Proper meta tags and structure
- **Accessibility:** ARIA labels and keyboard navigation
- **Mobile Optimized:** Professional mobile experience
- **Authentication:** Secure Firebase integration with persistent sessions
- **Real-time Features:** Live chat, streaming, and video editing
- **PWA Ready:** Progressive Web App capabilities

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Key Features Summary

### ✨ What Makes Amplifi Special
- **🎬 Professional Video Editor:** Built-in editing suite with real-time preview
- **💰 Live Monetization:** Accept tips and donations during live streams
- **📅 Content Scheduling:** Plan and schedule content publication
- **🔐 Secure Authentication:** Firebase-powered user management
- **📱 Mobile-First Design:** Perfect experience on all devices
- **🚀 High Performance:** Optimized for speed and reliability

### 🏆 Technical Achievements
- **Canvas API Integration:** Real-time video processing
- **FFmpeg.js Ready:** Advanced video processing capabilities
- **Stripe Payment Processing:** Secure monetization system
- **Firebase Authentication:** Persistent user sessions
- **Responsive Design:** Professional UI/UX across all devices
- **PWA Capabilities:** Progressive Web App features

## 🙏 Acknowledgments

- **Pexels:** Beautiful, free stock photos and videos
- **Font Awesome:** Professional icon library
- **Google Fonts:** Inter typography
- **Firebase:** Hosting and backend services
- **Stripe:** Payment processing and monetization
- **FFmpeg.js:** High-quality video processing
- **Canvas API:** Real-time video editing
- **GitHub Actions:** Automated deployment

## 📞 Support

- **Live Demo:** [https://amplifi-a54d9.web.app](https://amplifi-a54d9.web.app)
- **Issues:** [GitHub Issues](https://github.com/ronb12/Amplifi/issues)
- **Documentation:** This README

---

**🎉 Amplifi - Where creators amplify their content!**

---

**© 2024 Bradley Virtual Solutions, LLC. All rights reserved.**