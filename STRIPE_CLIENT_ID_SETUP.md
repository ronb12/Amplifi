# Stripe Connect Client ID Setup Guide

## 🚨 Current Issue
The Stripe Connect button is showing: `{"error":{"message":"No application matches the supplied client identifier"}}`

This happens because Stripe requires a valid Client ID for Connect integration.

## 🔑 How to Get Your Stripe Connect Client ID

### Step 1: Access Stripe Dashboard
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign in to your Stripe account

### Step 2: Navigate to Connect Settings
1. In the left sidebar, click **"Connect"**
2. Click **"Settings"** (gear icon)
3. Click **"Integration"** tab

### Step 3: Find Your Client ID
1. Look for **"Client ID"** field
2. It will start with `ca_` (e.g., `ca_1234567890abcdef`)
3. **Copy the entire Client ID**

### Step 4: Update the Code
1. Open `public/assets/js/stripe-service.js`
2. Find line with: `const clientId = 'ca_1234567890';`
3. Replace `ca_1234567890` with your actual Client ID
4. Save the file

### Step 5: Deploy the Update
```bash
firebase deploy --only hosting
```

## 📋 Example of What to Look For

In your Stripe Dashboard, you should see something like:
```
Client ID: ca_1234567890abcdef
```

## 🔧 Quick Fix Command

If you know your Client ID, you can run this command to update it:

```bash
# Replace YOUR_CLIENT_ID with your actual Client ID
sed -i '' 's/ca_1234567890/YOUR_CLIENT_ID/g' public/assets/js/stripe-service.js
```

## ✅ After Updating Client ID

1. **Deploy to Firebase**: `firebase deploy --only hosting`
2. **Test the button**: Click "Connect Stripe Account"
3. **Should redirect**: To Stripe Connect onboarding page
4. **No more errors**: Client identifier error should be resolved

## 🆘 If You Don't Have a Stripe Connect Account

1. **Create Stripe Account**: [stripe.com](https://stripe.com)
2. **Enable Connect**: In Dashboard → Connect → Get Started
3. **Follow Setup**: Complete the Connect application setup
4. **Get Client ID**: From Connect → Settings → Integration

## 📞 Need Help?

- **Stripe Support**: [support.stripe.com](https://support.stripe.com)
- **Connect Documentation**: [stripe.com/docs/connect](https://stripe.com/docs/connect)
- **Developer Forums**: [stripe.com/community](https://stripe.com/community)

---

**Remember**: Never share your Client ID publicly, but it's safe to include in client-side code as it's designed to be public.
