#!/bin/bash

# Auto-deploy script for Amplifi Firebase Hosting
# This script watches for changes and automatically deploys to Firebase Hosting

echo "🚀 Amplifi Auto-Deploy Script Started"
echo "📁 Watching for changes in public/ directory..."
echo "🌐 Will deploy to: https://amplifi-a54d9.web.app/"
echo ""

# Function to deploy
deploy_to_firebase() {
    echo "🔄 Changes detected! Deploying to Firebase Hosting..."
    echo "⏰ $(date)"
    
    # Deploy only hosting
    firebase deploy --only hosting
    
    if [ $? -eq 0 ]; then
        echo "✅ Deployment successful!"
        echo "🌐 Your site is live at: https://amplifi-a54d9.web.app/"
        echo "📱 PWA available for installation"
        echo ""
    else
        echo "❌ Deployment failed! Please check the error above."
        echo ""
    fi
}

# Check if fswatch is installed (for macOS)
if command -v fswatch &> /dev/null; then
    echo "📡 Using fswatch for file monitoring..."
    echo "💡 Press Ctrl+C to stop auto-deployment"
    echo ""
    
    # Watch public directory and deploy on changes
    fswatch -o public/ | while read f; do
        deploy_to_firebase
    done
else
    echo "📡 fswatch not found. Installing..."
    echo "💡 This will install fswatch for file monitoring"
    
    # Install fswatch using Homebrew
    if command -v brew &> /dev/null; then
        brew install fswatch
        echo "✅ fswatch installed successfully!"
        echo "🔄 Restarting auto-deploy script..."
        echo ""
        exec "$0"
    else
        echo "❌ Homebrew not found. Please install fswatch manually:"
        echo "   brew install fswatch"
        echo ""
        echo "🔧 Alternative: Manual deployment"
        echo "   Run: firebase deploy --only hosting"
        exit 1
    fi
fi 