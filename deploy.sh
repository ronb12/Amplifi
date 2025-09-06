#!/bin/bash

# Amplifi Deployment Script with Auto Versioning

echo "🚀 Starting Amplifi deployment..."

# Get current version from version.js
CURRENT_VERSION=$(grep -o "APP_VERSION = '[^']*'" public/version.js | cut -d"'" -f2)
echo "📦 Current version: $CURRENT_VERSION"

# Parse version components
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

# Increment patch version
NEW_PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"

echo "🔄 Updating version to: $NEW_VERSION"

# Update version.js with new version
sed -i '' "s/APP_VERSION = '[^']*'/APP_VERSION = '$NEW_VERSION'/g" public/version.js

# Deploy to Firebase
echo "🌐 Deploying to Firebase..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🎉 New version $NEW_VERSION is live at: https://amplifi-a54d9.web.app"
    echo "📝 Version updated from $CURRENT_VERSION to $NEW_VERSION"
else
    echo "❌ Deployment failed!"
    # Revert version change on failure
    sed -i '' "s/APP_VERSION = '[^']*'/APP_VERSION = '$CURRENT_VERSION'/g" public/version.js
    exit 1
fi 