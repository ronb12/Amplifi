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
- **Content Safety** - Report system for inappropriate content

### Monetization
- **View-based Earnings** - $0.005 per view ($5 per 1000 views)
- **Creator Dashboard** - Track views, earnings, and tips
- **Tip System** - Users can tip creators using Stripe (test mode)
- **Payout Tracking** - Monitor earnings against $25 payout threshold

### Technical Features
- **Firebase SDK v9** - Modular Firebase implementation
- **Real-time Updates** - Live feed and statistics
- **Mobile-first Design** - Responsive UI for all devices
- **Firebase Hosting Ready** - Optimized for deployment

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Firebase Firestore (NoSQL database)
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage (for media files)
- **Payments**: Stripe (test mode)
- **Hosting**: Firebase Hosting
- **Security**: Firebase Security Rules

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- Firebase CLI
- Stripe account (for test payments)

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
  apiKey: "your-api-key",
  authDomain: "amplifi-a54d9.firebaseapp.com",
  projectId: "amplifi-a54d9",
  storageBucket: "amplifi-a54d9.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

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

### 4. Local Development

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

### 5. Deploy to Production

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
│   ├── channel.html        # Channel/profile pages
│   ├── app.js             # Main application logic
│   ├── channel.js         # Channel page logic
│   ├── firebaseConfig.js  # Firebase configuration
│   └── styles.css         # Main stylesheet
├── firebase.json          # Firebase hosting config
├── firestore.rules        # Firestore security rules
├── storage.rules          # Storage security rules
├── firestore.indexes.json # Firestore indexes
└── README.md             # This file
```

## 🔐 Security Rules

The platform includes comprehensive security rules for:

- **Firestore**: User data, posts, comments, likes, follows, earnings, tips, reports
- **Storage**: Profile pictures, post media, thumbnails (50MB max for videos)

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
- **Channel Pages**: User profiles with content and tipping

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

## 📱 PWA Features (Future)

The platform is designed to be PWA-ready with:
- Service worker support
- Offline functionality
- App-like experience
- Push notifications

## 🔮 Future Enhancements

### Planned Features
- **Live Streaming** - Real-time video streaming
- **AdMob Integration** - Banner and interstitial ads
- **Cloud Functions** - Automated earnings updates
- **Admin Panel** - Content moderation tools
- **Push Notifications** - Real-time notifications for messages and interactions
- **Video Editing** - Built-in video editing tools

### Technical Improvements
- **Performance**: Lazy loading and optimization
- **Analytics**: User behavior tracking
- **SEO**: Meta tags and structured data
- **Accessibility**: WCAG compliance

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
- [Amplifi Live Demo](https://amplifi-a54d9.web.app)

---

**Built with ❤️ for content creators everywhere** 