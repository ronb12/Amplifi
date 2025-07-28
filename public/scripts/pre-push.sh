#!/bin/bash

# Pre-push script to remove API keys before GitHub push
echo "🔒 Removing API keys for secure GitHub push..."

# List of files that might contain API keys
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

# Remove hardcoded API keys and replace with environment variables
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "Processing: $file"
        # Replace hardcoded keys with environment variables
        sed -i '' 's/process\.env\.STRIPE_SECRET_KEY || '\''sk_live_[^'\'']*'\''/process.env.STRIPE_SECRET_KEY/g' "$file"
        sed -i '' 's/process\.env\.STRIPE_SECRET_KEY || "sk_live_[^"]*"/process.env.STRIPE_SECRET_KEY/g' "$file"
    fi
done

echo "✅ API keys removed successfully!"
echo "🚀 Ready to push to GitHub" 