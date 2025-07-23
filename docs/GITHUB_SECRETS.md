# GitHub Secrets Setup for Amplifi

This document explains how to use GitHub Secrets for secure server-side operations while keeping client-side keys public and safe.

## 🔐 **Understanding Key Types**

### **Client-Side Keys (Safe to Expose)**

These keys are designed to be public and are safe to include in your repository:

- **Firebase API Key**: `AIzaSyANHtCLmNLvp9k_px0lsUHuWK5PasK_gJY`
- **AdMob Publisher ID**: `ca-pub-XXXXXXXXXX`
- **Stripe Publishable Keys**: `pk_test_XXXXX` or `pk_live_XXXXX`

### **Server-Side Secrets (Use GitHub Secrets)**

These should be stored in GitHub Secrets and never committed to the repository:

- **Firebase Service Account Key**: JSON file for server-side operations
- **Stripe Secret Keys**: `sk_test_XXXXX` or `sk_live_XXXXX`
- **VAPID Keys**: For push notifications (server-side)
- **GitHub Tokens**: For automated deployments

## 🛠️ **Setting Up GitHub Secrets**

### **1. Access Repository Settings**

1. Go to your GitHub repository
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**

### **2. Add Required Secrets**

#### **Firebase Service Account**

```bash
# Name: FIREBASE_SERVICE_ACCOUNT
# Value: (JSON content from Firebase Console)
```

**How to get it:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Project Settings → Service Accounts
3. Click "Generate new private key"
4. Copy the entire JSON content

#### **Firebase Token**

```bash
# Name: FIREBASE_TOKEN
# Value: (Firebase CLI token)
```

**How to get it:**

```bash
firebase login:ci
```

#### **Stripe Secret Key (for server-side operations)**

```bash
# Name: STRIPE_SECRET_KEY
# Value: sk_test_XXXXX or sk_live_XXXXX
```

#### **VAPID Key (for push notifications)**

```bash
# Name: VAPID_PRIVATE_KEY
# Value: (Private VAPID key from Firebase Console)
```

## 🔄 **GitHub Actions Workflow**

The `.github/workflows/deploy.yml` file uses these secrets for:

- **Automated deployment** to Firebase Hosting
- **Deploying Firestore rules** and indexes
- **Security scanning** to ensure no actual secrets are committed
- **Validation** of client-side configuration

## 📋 **Example Secret Configuration**

```yaml
# In GitHub Actions workflow
env:
  FIREBASE_SERVICE_ACCOUNT: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
  FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
  STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
  VAPID_PRIVATE_KEY: ${{ secrets.VAPID_PRIVATE_KEY }}
```

## 🚨 **Security Best Practices**

### **✅ Do Store in GitHub Secrets:**

- Server-side API keys
- Database connection strings
- Private signing keys
- Service account credentials
- Webhook secrets

### **❌ Don't Store in GitHub Secrets:**

- Client-side API keys (Firebase, Stripe publishable)
- Public configuration values
- Frontend environment variables

### **🔍 Security Scanning**

The workflow includes security scanning that:

- Checks for actual secrets (`sk_test_`, `sk_live_`, etc.)
- Validates that safe public keys are present
- Ensures no server-side secrets are committed

## 🎯 **Benefits of This Approach**

1. **Security**: Server-side secrets are encrypted and secure
2. **Functionality**: Client-side keys remain accessible to the browser
3. **Automation**: GitHub Actions can deploy securely
4. **Compliance**: Follows security best practices
5. **Flexibility**: Easy to rotate secrets without code changes

## 📚 **Additional Resources**

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Firebase Service Accounts](https://firebase.google.com/docs/admin/setup)
- [Stripe API Keys](https://stripe.com/docs/keys)
- [VAPID Keys for Push Notifications](https://firebase.google.com/docs/cloud-messaging/js/client)

---

**Remember**: Client-side keys are safe to expose, but server-side secrets should always be stored securely in GitHub Secrets!
