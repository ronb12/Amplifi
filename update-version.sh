#!/bin/bash

# Amplifi Version Update Script

echo "🔄 Updating Amplifi version..."

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

echo "✅ Version updated from $CURRENT_VERSION to $NEW_VERSION"
echo "📝 Run './deploy.sh' to deploy with the new version" 