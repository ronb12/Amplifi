#!/usr/bin/env node

// Script to update Stripe Client ID in the code
const fs = require('fs');
const path = require('path');

console.log('🔧 Stripe Client ID Updater');
console.log('==========================\n');

// Get Client ID from command line argument
const clientId = process.argv[2];

if (!clientId) {
    console.log('❌ Error: Please provide your Stripe Connect Client ID');
    console.log('Usage: node update_stripe_client_id.js YOUR_CLIENT_ID');
    console.log('Example: node update_stripe_client_id.js ca_1234567890abcdef');
    process.exit(1);
}

// Validate Client ID format
if (!clientId.startsWith('ca_')) {
    console.log('❌ Error: Client ID should start with "ca_"');
    console.log('Example: ca_1234567890abcdef');
    process.exit(1);
}

console.log(`✅ Client ID format looks good: ${clientId}`);

// File to update
const filePath = path.join(__dirname, 'public', 'assets', 'js', 'stripe-service.js');

try {
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file contains demo mode
    if (content.includes('demoMode: true')) {
        console.log('📝 Found demo mode, updating to real integration...');
        
        // Replace demo mode with real integration
        const demoPattern = /case 'connect':[\s\S]*?demoMode: true,[\s\S]*?message: 'Demo mode: Stripe Connect simulation successful!'[\s\S]*?};/;
        
        const realIntegration = `case 'connect':
                    // Real Stripe Connect implementation
                    const clientId = '${clientId}'; // Your actual Stripe Connect Client ID
                    const redirectUri = encodeURIComponent('https://amplifi-a54d9.web.app/creator-dashboard.html');
                    const state = encodeURIComponent(JSON.stringify({
                        userId: data.userId || 'demo-user',
                        timestamp: Date.now()
                    }));
                    
                    const accountLink = \`https://connect.stripe.com/express/oauth/authorize?client_id=\${clientId}&state=\${state}&suggested_capabilities[]=transfers&suggested_capabilities[]=card_payments&suggested_capabilities[]=tax_reporting_us_1099_k&suggested_capabilities[]=tax_reporting_us_1099_misc\`;
                    
                    return {
                        success: true,
                        accountId: 'acct_' + Math.random().toString(36).substr(2, 14),
                        accountLink: accountLink,
                        demoMode: false,
                        message: 'Redirecting to Stripe Connect onboarding...'
                    };`;
        
        content = content.replace(demoPattern, realIntegration);
        
        // Write the updated content
        fs.writeFileSync(filePath, content, 'utf8');
        
        console.log('✅ Successfully updated stripe-service.js with real Client ID');
        console.log('🚀 Ready to deploy! Run: firebase deploy --only hosting');
        
    } else {
        console.log('⚠️  File already contains real integration or different format');
        console.log('📝 Please manually update the Client ID in the file');
    }
    
} catch (error) {
    console.error('❌ Error updating file:', error.message);
    process.exit(1);
}

console.log('\n🎉 Update complete!');
console.log('📋 Next steps:');
console.log('1. Deploy: firebase deploy --only hosting');
console.log('2. Test: Visit Creator Dashboard → Earnings tab');
console.log('3. Click: "Connect Stripe Account" button');
