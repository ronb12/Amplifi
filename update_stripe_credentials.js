#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔑 Stripe Credentials Updater for Amplifi');
console.log('==========================================\n');

// Function to update file content
function updateFileContent(filePath, oldValue, newValue, description) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const oldContent = content;
        
        content = content.replace(new RegExp(oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newValue);
        
        if (content !== oldContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ ${description} updated successfully`);
            return true;
        } else {
            console.log(`⚠️  ${description} not found or already updated`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Error updating ${description}:`, error.message);
        return false;
    }
}

// Function to validate Stripe keys
function validateStripeKey(key, type) {
    if (type === 'publishable') {
        return key.startsWith('pk_live_') || key.startsWith('pk_test_');
    } else if (type === 'client') {
        return key.startsWith('ca_');
    }
    return false;
}

// Main update function
async function updateStripeCredentials() {
    const stripeServicePath = path.join(__dirname, 'public', 'assets', 'js', 'stripe-service.js');
    
    console.log('📁 Updating file:', stripeServicePath);
    console.log('');
    
    // Get user input
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    const question = (query) => new Promise((resolve) => rl.question(query, resolve));
    
    try {
        // Get Publishable Key
        console.log('🔑 Step 1: Stripe Publishable Key');
        console.log('   This starts with pk_live_ or pk_test_');
        const publishableKey = await question('   Enter your Stripe Publishable Key: ');
        
        if (!validateStripeKey(publishableKey, 'publishable')) {
            console.log('❌ Invalid publishable key format. Should start with pk_live_ or pk_test_');
            rl.close();
            return;
        }
        
        // Get Client ID
        console.log('\n🔗 Step 2: Stripe Connect Client ID');
        console.log('   This starts with ca_');
        const clientId = await question('   Enter your Stripe Connect Client ID: ');
        
        if (!validateStripeKey(clientId, 'client')) {
            console.log('❌ Invalid client ID format. Should start with ca_');
            rl.close();
            return;
        }
        
        console.log('\n🔄 Updating files...\n');
        
        // Update publishable key
        updateFileContent(
            stripeServicePath,
            "publishableKey: 'pk_live_51OqKCYmr...'",
            `publishableKey: '${publishableKey}'`,
            'Publishable Key'
        );
        
        // Update client ID (both instances)
        updateFileContent(
            stripeServicePath,
            "clientId: 'ca_1234567890'",
            `clientId: '${clientId}'`,
            'Client ID (instance 1)'
        );
        
        updateFileContent(
            stripeServicePath,
            "const clientId = 'ca_1234567890'",
            `const clientId = '${clientId}'`,
            'Client ID (instance 2)'
        );
        
        console.log('\n🎉 Stripe credentials updated successfully!');
        console.log('\n📋 Next steps:');
        console.log('   1. Deploy to Firebase: firebase deploy --only hosting');
        console.log('   2. Test the Connect Stripe Account button');
        console.log('   3. Should redirect to Stripe Connect onboarding');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        rl.close();
    }
}

// Run the updater
updateStripeCredentials();
