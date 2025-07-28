#!/bin/bash

# Post-push script to restore API keys for local development
echo "🔑 Restoring API keys for local development..."

# IMPORTANT: Replace YOUR_ACTUAL_KEY with your real Stripe secret key
STRIPE_SECRET_KEY="YOUR_ACTUAL_KEY_HERE"

# List of files that need API keys restored
FILES=(
    "public/vercel-stripe-backend/api/create-payment-intent.js"
    "public/vercel-stripe-backend/api/create-transfer.js"
    "public/vercel-stripe-backend/api/delete-account.js"
    "public/vercel-stripe-backend/api/get-account-status.js"
    "public/vercel-stripe-backend/api/list-accounts.js"
    "public/vercel-stripe-backend/api/add-payout-method.js"
    "public/vercel-stripe-backend/api/create-account-link.js"
    "public/vercel-stripe-backend/api/check-platform-balance.js"
    "public/vercel-stripe-backend/api/create-payout.js"
)

# Restore API keys for local development
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "Restoring keys in: $file"
        # Replace environment variables with hardcoded keys for local development
        sed -i '' "s/process\.env\.STRIPE_SECRET_KEY/process.env.STRIPE_SECRET_KEY || '$STRIPE_SECRET_KEY'/g" "$file"
    fi
done

echo "✅ API keys restored for local development!"
echo "🔧 You can now continue development with full functionality" 