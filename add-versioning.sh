#!/bin/bash

# Script to add versioning to all HTML files

echo "🔧 Adding versioning to all HTML files..."

# Find all HTML files in public directory
HTML_FILES=$(find public -name "*.html" -type f)

for file in $HTML_FILES; do
    echo "📄 Processing: $file"
    
    # Check if version.js is already included
    if ! grep -q "version.js" "$file"; then
        # Add version.js script before closing head tag
        sed -i '' '/<script async src="https:\/\/pagead2.googlesyndication.com\/pagead\/js\/adsbygoogle.js/d' "$file"
        sed -i '' 's|</head>|    <!-- Version Management -->\n    <script src="version.js"></script>\n</head>|' "$file"
        echo "✅ Added versioning to $file"
    else
        echo "ℹ️  Versioning already exists in $file"
    fi
done

echo "🎉 Versioning setup complete!"
echo "📝 Run './deploy.sh' to deploy with versioning" 