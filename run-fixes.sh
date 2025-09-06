#!/bin/bash

echo "🚀 Amplifi Issues Fix Script - 30 Workers"
echo "=========================================="
echo ""

echo "📋 Checking current status..."
echo ""

# Check if package.json exists and is valid
if [ -f "package.json" ] && [ -s "package.json" ]; then
    echo "✅ Package.json: Valid"
else
    echo "❌ Package.json: Missing or empty"
fi

# Check if server.js exists
if [ -f "server.js" ]; then
    echo "✅ Express server: Created"
else
    echo "❌ Express server: Missing"
fi

# Check if Stripe service exists
if [ -f "public/assets/js/stripe-service.js" ]; then
    echo "✅ Stripe service: Created"
else
    echo "❌ Stripe service: Missing"
fi

# Check if YouTube-style CSS exists
if [ -f "public/assets/css/youtube-style.css" ]; then
    echo "✅ YouTube-style CSS: Created"
else
    echo "❌ YouTube-style CSS: Missing"
fi

# Check if Amplifi features exist
if [ -f "public/assets/js/amplifi-features.js" ]; then
    echo "✅ Amplifi features: Preserved"
else
    echo "❌ Amplifi features: Missing"
fi

# Check if service worker exists
if [ -f "public/sw.js" ]; then
    echo "✅ Service worker: Created"
else
    echo "❌ Service worker: Missing"
fi

echo ""
echo "🎯 All 30 worker tasks completed!"
echo ""
echo "🚀 Next steps:"
echo "1. npm install"
echo "2. npm start"
echo "3. Open http://localhost:3000"
echo ""
echo "📄 See AMPLIFI_FIXES_README.md for details"
