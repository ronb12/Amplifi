# Amplifi Project Structure

## 📁 Organized Project Structure

### **🎯 Core Files**
```
public/
├── index.html                 # Main landing page
├── store.html                 # Store page
├── feed.html                  # Feed page
├── profile.html               # User profile page
├── settings.html              # Settings page
├── dashboard.html             # Dashboard page
├── live.html                  # Live streaming page
├── music-library.html         # Music library page
├── subscriptions.html         # Subscriptions page
├── trending.html              # Trending page
├── upload.html                # Upload page
├── messages.html              # Messages page
├── search.html                # Search page
├── notifications.html         # Notifications page
├── privacy-settings.html      # Privacy settings page
├── admin-dashboard.html       # Admin dashboard
├── admin-messages.html        # Admin messages
├── ai-content.html           # AI content page
├── bookmarks.html            # Bookmarks page
├── channel.html              # Channel page
├── chatview.html             # Chat view page
├── paid-messages.html        # Paid messages page
├── set-admin.html            # Set admin page
├── success.html              # Success page
├── contact.html              # Contact page
├── support.html              # Support page
├── terms.html                # Terms of service
├── privacy.html              # Privacy policy
├── cancel.html               # Cancel page
├── clear-cache.html          # Clear cache page
├── generate-favicons.html    # Generate favicons
├── generate-icons.html       # Generate icons
└── version.js                # Version management
```

### **📦 Assets Directory**
```
public/assets/
├── css/                      # All CSS files
│   ├── base.css              # Base styles
│   ├── styles.css            # Main styles
│   ├── enhanced-buttons.css  # Button styles
│   ├── modal-overlays.css    # Modal styles
│   ├── store-style.css       # Store-specific styles
│   ├── proper-dropdown.css   # Dropdown styles
│   ├── standardized-navigation.css # Navigation styles
│   ├── feed.css              # Feed styles
│   ├── dashboard.css         # Dashboard styles
│   ├── paid-messages.css     # Paid messages styles
│   ├── imessage-style.css    # iMessage styles
│   ├── messages-new.css      # New messages styles
│   ├── chatview.css          # Chat view styles
│   ├── profile.css           # Profile styles
│   ├── settings.css          # Settings styles
│   └── upload.css            # Upload styles
├── js/                       # All JavaScript files
│   ├── landing.js            # Landing page logic
│   ├── feed.js               # Feed page logic
│   ├── profile.js            # Profile page logic
│   ├── settings.js           # Settings page logic
│   ├── dashboard.js          # Dashboard logic
│   ├── live.js               # Live streaming logic
│   ├── music-library.js      # Music library logic
│   ├── subscriptions.js      # Subscriptions logic
│   ├── trending.js           # Trending logic
│   ├── upload.js             # Upload logic
│   ├── messages-new.js       # Messages logic
│   ├── search.js             # Search logic
│   ├── notifications.js      # Notifications logic
│   ├── admin-dashboard.js    # Admin dashboard logic
│   ├── ai-content.js         # AI content logic
│   ├── bookmarks.js          # Bookmarks logic
│   ├── paid-messages.js      # Paid messages logic
│   ├── chatview.js           # Chat view logic
│   ├── store.js              # Store logic
│   ├── utils.js              # Utility functions
│   ├── firebase-loader.js    # Firebase loader
│   ├── proper-dropdown.js    # Dropdown functionality
│   ├── pwa-manager.js        # PWA management
│   ├── pwa-install.js        # PWA installation
│   ├── security-config.js    # Security configuration
│   ├── security-monitor.js   # Security monitoring
│   ├── stripe-config.js      # Stripe configuration
│   ├── stripe-connect.js     # Stripe connect
│   ├── stripe-frontend-only.js # Frontend Stripe
│   ├── stripe-vercel-backend.js # Vercel Stripe backend
│   ├── adsense-config.js     # AdSense configuration
│   ├── imessage-features.js  # iMessage features
│   ├── monetization-test.js  # Monetization testing
│   ├── comprehensive-fixes.js # Comprehensive fixes
│   ├── run-firebase-check.js # Firebase check
│   ├── channel.js            # Channel logic
│   ├── app.js                # Main app logic
│   ├── sw.js                 # Service worker
│   └── version.js            # Version management
├── icons/                    # Icon files
│   ├── favicon.ico           # Favicon
│   ├── icon.svg              # SVG icon
│   ├── icon-192x192.png      # 192x192 icon
│   └── icon-512x512.png      # 512x512 icon
└── images/                   # Image files
    ├── default-avatar.svg     # Default avatar
    ├── default-banner.svg     # Default banner
    └── hero-image.svg         # Hero image
```

### **⚙️ Configuration Directory**
```
public/config/
├── firebaseConfig.js          # Firebase configuration
├── firebase-security-rules.json # Firebase security rules
├── firestore.indexes.json     # Firestore indexes
├── firestore.rules            # Firestore rules
└── manifest.json              # PWA manifest
```

### **🧪 Tests Directory**
```
public/tests/
├── functionality/             # Functionality tests
│   ├── test-feed.html        # Feed tests
│   ├── test-navigation.html  # Navigation tests
│   ├── test-search.html      # Search tests
│   ├── test-all-fixes.js     # All fixes tests
│   ├── test-notification-buttons.js # Notification tests
│   ├── test-playlist-notifications.js # Playlist tests
│   ├── test-music-library.js # Music library tests
│   ├── test-tip-payment.js   # Tip payment tests
│   └── test-functionality.js # General functionality tests
└── security/                 # Security tests
    └── test-security.js      # Security tests
```

### **📚 Documentation Directory**
```
public/docs/
├── deployment/               # Deployment documentation
├── development/              # Development documentation
└── security/                 # Security documentation
```

### **🔧 Backend Directories**
```
public/
├── functions/                # Firebase functions
│   ├── main.py              # Main function
│   └── requirements.txt      # Python requirements
├── vercel-stripe-backend/    # Vercel Stripe backend
│   ├── api/                 # API endpoints
│   ├── package.json         # Node.js dependencies
│   └── package-lock.json    # Lock file
└── netlify-stripe-backend/   # Netlify Stripe backend
    ├── functions/           # Netlify functions
    └── netlify.toml        # Netlify configuration
```

### **📝 Scripts Directory**
```
public/scripts/
├── backup/                   # Backup scripts
│   └── add-sample-posts.js  # Add sample posts
├── deployment/               # Deployment scripts
│   ├── auto-deploy.sh       # Auto deployment
│   └── setup-free-backend.sh # Backend setup
├── post-push.sh             # Post-push script
└── pre-push.sh              # Pre-push script
```

## 🎯 Benefits of This Organization

### **📁 Clear Structure:**
- **Assets separated** by type (CSS, JS, images, icons)
- **Configuration centralized** in config directory
- **Tests organized** by category
- **Documentation structured** by topic

### **🚀 Performance Benefits:**
- **Faster loading** - Organized asset loading
- **Better caching** - Structured file organization
- **Easier maintenance** - Clear file locations
- **Reduced conflicts** - Separated concerns

### **🔧 Development Benefits:**
- **Easier navigation** - Clear file structure
- **Better collaboration** - Organized codebase
- **Simpler deployment** - Structured assets
- **Cleaner repository** - Organized files

## 📋 File Naming Conventions

### **HTML Files:**
- Use kebab-case: `user-profile.html`
- Descriptive names: `admin-dashboard.html`
- Consistent naming: `page-name.html`

### **CSS Files:**
- Feature-based: `store-style.css`
- Component-based: `proper-dropdown.css`
- Page-specific: `feed.css`

### **JavaScript Files:**
- Feature-based: `store.js`
- Utility-based: `utils.js`
- Configuration-based: `firebase-loader.js`

### **Asset Files:**
- Descriptive names: `default-avatar.svg`
- Size-specific: `icon-192x192.png`
- Type-specific: `hero-image.svg`

## 🎯 Next Steps

1. **Update documentation** - Keep this structure current
2. **Optimize assets** - Compress images and minify code
3. **Add versioning** - Implement asset versioning
4. **Monitor performance** - Track loading times
5. **Regular cleanup** - Remove unused files

This organized structure makes the project much more maintainable and professional! 🚀 