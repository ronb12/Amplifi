# Amplifi - Social Media Platform

A full-featured social media platform built with Firebase and JavaScript, designed for content creators to share videos and photos while earning through views and tips.

## 🚀 Features

### Core Functionality

- **User Authentication** - Email-based login/signup with Firebase Auth
- **Content Upload** - Support for videos (max 50MB) and images
- **Public Feed** - Global feed with newest-first ordering
- **User Channels** - Individual profile pages with bio, profile pics, and content
- **Social Features** - Like, comment, and follow functionality
- **Comments System** - Full comment functionality with real-time updates
- **Direct Messaging** - User-to-user messaging with conversation management
- **Live Streaming** - Real-time video streaming with live chat
- **Content Safety** - Report system for inappropriate content

### Monetization

- **View-based Earnings** - $0.005 per view ($5 per 1000 views)
- **Creator Dashboard** - Track views, earnings, and tips
- **Tip System** - Users can tip creators using Stripe (test mode)
- **AdMob Integration** - Banner and interstitial ads for monetization
- **Payout Tracking** - Monitor earnings against $25 payout threshold

### Technical Features

- **Firebase SDK v9** - Modular Firebase implementation
- **Real-time Updates** - Live feed and statistics
- **Mobile-first Design** - Responsive UI for all devices
- **PWA Support** - Progressive Web App with offline functionality
- **Push Notifications** - Real-time notifications for user engagement
- **Firebase Hosting Ready** - Optimized for deployment

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Firebase Firestore (NoSQL database)
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage (for media files)
- **Payments**: Stripe (test mode)
- **Ads**: AdMob (Google AdSense)
- **Hosting**: Firebase Hosting
- **Security**: Firebase Security Rules

## 📦 Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- Firebase CLI
- Stripe account (for test payments)
- AdMob account (for monetization)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Amplifi.git
cd Amplifi
```

### 2. Firebase Setup

#### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project with ID: `amplifi-a54d9`
3. Enable the following services:
   - Authentication (Email/Password)
   - Firestore Database
   - Storage
   - Hosting

#### Configure Firebase

1. Get your Firebase config from Project Settings
2. Update `public/firebaseConfig.js` with your actual config:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyANHtCLmNLvp9k_px0lsUHuWK5PasK_gJY", // Replace with your actual API key
  authDomain: "amplifi-a54d9.firebaseapp.com",
  projectId: "amplifi-a54d9",
  storageBucket: "amplifi-a54d9.firebasestorage.app",
  messagingSenderId: "542171119183",
  appId: "1:542171119183:web:cd96402d1fe4d3ef6ef43a",
  measurementId: "G-X845LM0VSM"
};
```

**🔑 Important Note**: The Firebase API key is a **public client-side key** and is safe to expose in your repository. It's designed to be included in web applications and cannot be used to access your Firebase project without proper authentication.

#### Deploy Firebase Rules

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

### 3. Stripe Setup

#### Get Stripe Keys

1. Create a [Stripe account](https://stripe.com/)
2. Get your test publishable key from the Dashboard
3. Update the Stripe key in `public/firebaseConfig.js`:

```javascript
const stripe = Stripe('pk_test_your_stripe_key_here');
```

### 4. AdMob Setup

#### Get AdMob Keys

1. Create an [AdMob account](https://admob.google.com/)
2. Create ad units for banner and interstitial ads
3. Update the AdMob configuration in `public/app.js`:

```javascript
this.adMobConfig = {
    bannerAdUnitId: 'ca-pub-YOUR_ADMOB_BANNER_ID',
    interstitialAdUnitId: 'ca-pub-YOUR_ADMOB_INTERSTITIAL_ID',
    rewardedAdUnitId: 'ca-pub-YOUR_ADMOB_REWARDED_ID'
};
```

4. Update the AdMob publisher ID in `public/index.html`:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ADMOB_PUBLISHER_ID" crossorigin="anonymous"></script>
```

### 5. Push Notifications Setup

#### Get VAPID Key

1. In Firebase Console, go to Project Settings > Cloud Messaging
2. Generate a new Web Push certificate (VAPID key)
3. Update the VAPID key in `public/app.js`:

```javascript
this.notificationConfig = {
    vapidKey: 'YOUR_VAPID_KEY',
    supported: 'serviceWorker' in navigator && 'PushManager' in window
};
```

### 6. Local Development

#### Install Firebase CLI (if not already installed)

```bash
npm install -g firebase-tools
```

#### Login to Firebase

```bash
firebase login
```

#### Initialize Firebase (if needed)

```bash
firebase init
```

#### Serve Locally

```bash
firebase serve
```

The app will be available at `http://localhost:5000`

### 7. Deploy to Production

#### Deploy to Firebase Hosting

```bash
firebase deploy
```

Your app will be live at `https://amplifi-a54d9.web.app`

## 🏗️ Project Structure

```
Amplifi/
├── public/
│   ├── index.html          # Main app page
│   ├── app.js             # Main application logic
│   ├── firebaseConfig.js  # Firebase configuration
│   ├── styles.css         # Main stylesheet
│   ├── manifest.json      # PWA manifest
│   └── sw.js             # Service worker
├── firebase.json          # Firebase hosting config
├── firestore.rules        # Firestore security rules
├── firestore.indexes.json # Firestore indexes
└── README.md             # This file
```

## 🔐 Security Rules

The platform includes comprehensive security rules for:

- **Firestore**: User data, posts, comments, likes, follows, earnings, tips, reports, push subscriptions
- **Storage**: Profile pictures, post media, thumbnails (50MB max for videos)

### 🔒 **GitHub Secrets Configuration**

For server-side operations and secure deployment, see [GitHub Secrets Setup](docs/GITHUB_SECRETS.md).

**Important**: Client-side keys (Firebase API key, Stripe publishable keys) are safe to expose and are included in the repository. Server-side secrets should be stored in GitHub Secrets.

## 💰 Monetization Logic

### Earnings Calculation

- **View Rate**: $0.005 per view
- **Example**: 1000 views = $5.00 earnings
- **Payout Threshold**: $25.00 minimum

### Tip System

- **Minimum Tip**: $0.50
- **Preset Amounts**: $1, $5, $10, $25
- **Custom Amounts**: Any amount above $0.50
- **Test Mode**: Uses Stripe test keys (no real charges)

### AdMob Integration

- **Banner Ads**: Sticky banner ads at the top of the app
- **Interstitial Ads**: Full-screen ads triggered at appropriate moments
- **Revenue Sharing**: Ad revenue contributes to creator earnings

## 🎨 UI/UX Features

### Design Principles

- **Mobile-first** responsive design
- **Clean, modern** interface
- **Amplifi branding** with purple primary color (#6366f1)
- **Intuitive navigation** with tab-based interface

### Key Components

- **Feed**: Grid layout for content discovery
- **Upload**: Drag-and-drop file upload with progress
- **Dashboard**: Creator analytics and earnings
- **Live Streaming**: Real-time video streaming with chat
- **Direct Messaging**: User-to-user conversations

## 🔧 Configuration

### Environment Variables

All configuration is stored in `public/firebaseConfig.js`:

- Firebase project settings
- Stripe publishable key
- App-specific constants

### Customization

- **Brand Colors**: Update CSS variables in `styles.css`
- **Upload Limits**: Modify storage rules and validation
- **Earnings Rate**: Update calculation logic in `app.js`

## 🚀 Deployment

### Firebase Hosting

The app is optimized for Firebase Hosting with:

- **SPA Routing**: Handles `/channel/*` routes
- **Caching**: Optimized for static assets
- **CDN**: Global content delivery
- **HTTPS**: Automatic SSL certificates

### Custom Domain (Optional)

1. Add custom domain in Firebase Console
2. Update DNS records
3. Deploy with `firebase deploy`

## 📱 PWA Features

The platform includes full PWA support:

- **Service Worker**: Offline functionality and background sync
- **App Manifest**: Installable on mobile devices
- **Push Notifications**: Real-time notifications
- **Offline Support**: Cached content and offline actions

## 🔮 Future Enhancements

### Planned Features

- **Cloud Functions** - Automated earnings updates and notification sending
- **Admin Panel** - Content moderation tools
- **Video Editing** - Built-in video editing tools
- **Analytics Dashboard** - Detailed user behavior tracking

### Technical Improvements

- **Performance**: Lazy loading and optimization
- **SEO**: Meta tags and structured data
- **Accessibility**: WCAG compliance improvements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Check Firebase documentation
- Review Stripe integration docs

## 🔗 Links

- [Firebase Documentation](https://firebase.google.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [AdMob Documentation](https://developers.google.com/admob)
- [Amplifi Live Demo](https://amplifi-a54d9.web.app)

---

**Built with ❤️ for content creators everywhere**
