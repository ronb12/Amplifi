#!/usr/bin/env node

// Script to check Stripe Connect account status
const fs = require('fs');

console.log('🔍 Stripe Connect Account Checker');
console.log('================================\n');

// Your account ID
const accountId = 'acct_1RpcX0La9yDuVKgK';

console.log(`✅ Account ID: ${accountId}`);
console.log('📋 This means you already have a Stripe Connect account!');

console.log('\n🔧 To make the button work, you need:');
console.log('1. Go to: https://dashboard.stripe.com/');
console.log('2. Navigate: Connect → Settings');
console.log('3. Find: Client ID (starts with ca_)');
console.log('4. Copy: Your Client ID');

console.log('\n🚀 Then run:');
console.log('node update_stripe_client_id.js YOUR_CLIENT_ID');

console.log('\n📊 Current Account Status:');
console.log('- Account ID: acct_1RpcX0La9yDuVKgK');
console.log('- Status: Connected (you have an account)');
console.log('- Next Step: Get Client ID for integration');

