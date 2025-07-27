#!/bin/bash

echo "🚀 Setting up FREE Stripe Backend for Amplifi"
echo "=============================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Navigate to Vercel backend directory
cd vercel-stripe-backend

echo "📋 Installing dependencies..."
npm install

echo "🌐 Deploying to Vercel..."
echo "Note: You'll need to:"
echo "1. Sign in to Vercel (if not already)"
echo "2. Set environment variable: STRIPE_SECRET_KEY"
echo "3. Update the backend URL in stripe-vercel-backend.js"
echo ""

vercel --prod

echo ""
echo "✅ Backend deployed! Now update your frontend:"
echo "1. Copy the deployment URL above"
echo "2. Update public/js/stripe-vercel-backend.js line 4"
echo "3. Replace stripe-frontend-only.js with stripe-vercel-backend.js in HTML files"
echo ""
echo "🎯 Test with: https://amplifi-a54d9.web.app/feed.html" 