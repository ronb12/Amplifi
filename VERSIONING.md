# Amplifi Versioning System

## Overview

The Amplifi app now uses an automatic versioning system to prevent browser caching issues and ensure users always get the latest version of the app without requiring hard refreshes.

## How It Works

### 1. Version Configuration

- **File**: `public/version.js`
- **Purpose**: Contains the current version number and functions to append version parameters to asset URLs
- **Format**: Semantic versioning (e.g., `1.0.3`)

### 2. Automatic Asset Versioning

The `version.js` script automatically:

- Appends `?v=VERSION` to all CSS files
- Appends `?v=VERSION` to all JavaScript files (except external libraries like Firebase)
- Runs when the DOM loads
- Ensures browsers fetch the latest version of assets

### 3. Deployment Scripts

#### `./deploy.sh` - Full Deployment

```bash
./deploy.sh
```

- Automatically increments the patch version
- Deploys to Firebase
- Updates version number in `version.js`

#### `./update-version.sh` - Version Only

```bash
./update-version.sh
```

- Only updates the version number
- Does not deploy
- Useful for testing or when you want to deploy manually

#### `./add-versioning.sh` - Add Versioning to HTML Files

```bash
./add-versioning.sh
```

- Adds version.js script to all HTML files
- Only needed once or when adding new HTML files

## Version Number Format

- **Major**: Breaking changes (e.g., `1.0.0` → `2.0.0`)
- **Minor**: New features (e.g., `1.0.0` → `1.1.0`)
- **Patch**: Bug fixes and updates (e.g., `1.0.0` → `1.0.1`)

## Benefits

### ✅ No More Hard Refreshes

- Users automatically get the latest version
- No need to press Ctrl+F5 or Cmd+Shift+R
- Better user experience

### ✅ Cache Busting

- Browsers always fetch the latest CSS and JS files
- Prevents stale cache issues
- Ensures consistent behavior across all users

### ✅ Automatic Version Management

- Version numbers are automatically incremented
- No manual version tracking needed
- Deployment history is clear

## Usage

### For Regular Updates

1. Make your code changes
2. Run `./deploy.sh`
3. Version is automatically incremented and deployed

### For Testing

1. Make your code changes
2. Run `./update-version.sh` to increment version
3. Test locally
4. Run `./deploy.sh` when ready to deploy

### For New HTML Files

1. Create your new HTML file
2. Run `./add-versioning.sh` to add versioning
3. Deploy normally with `./deploy.sh`

## Technical Details

### Files Modified

- `public/version.js` - Version configuration and functions
- All HTML files - Include version.js script
- `deploy.sh` - Automated deployment script
- `update-version.sh` - Version update script
- `add-versioning.sh` - HTML file versioning script

### Browser Compatibility

- Works with all modern browsers
- Graceful fallback for older browsers
- No impact on external libraries (Firebase, Stripe, etc.)

### Performance Impact

- Minimal overhead (single script tag)
- Faster loading due to proper cache management
- Better user experience overall

## Troubleshooting

### Version Not Updating

1. Check that `version.js` is included in your HTML file
2. Verify the version number in `public/version.js`
3. Clear browser cache and reload

### Deployment Issues

1. Ensure you have Firebase CLI installed
2. Check that you're logged into Firebase
3. Verify the project configuration

### Cache Issues

1. The versioning system should prevent most cache issues
2. If problems persist, check browser developer tools
3. Verify that version parameters are being added to asset URLs
