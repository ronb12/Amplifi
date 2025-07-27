# Stripe Configuration Guide

## Your Stripe Live Credentials

**Live Publishable Key:** `pk_live_51RpT30LHe1RTUAGqdJuiy1GWpobWJYGHMUBeiORdbz6OUwlqoaunI2cct8p51kGncr12b5X5axqYNzCELk80MijH00P4VABBtD`

**Live Secret Key:** `[SECURED - Use environment variable STRIPE_SECRET_KEY]`

## Security Configuration

### ✅ Client-Side (Safe to Expose)
- **Publishable Key:** `pk_live_51RpT30LHe1RTUAGqdJuiy1GWpobWJYGHMUBeiORdbz6OUwlqoaunI2cct8p51kGncr12b5X5axqYNzCELk80MijH00P4VABBtD`
- **Location:** `public/js/stripe-config.js`
- **Status:** ✅ **Configured and Deployed**

### 🔒 Server-Side (Keep Secret)
- **Secret Key:** `[SECURED - Use environment variable STRIPE_SECRET_KEY]`
- **Usage:** Backend API endpoints, webhook processing
- **Storage:** Environment variables or secure key management

## Setup Instructions

### 1. Client-Side Configuration ✅ Complete
The publishable key is already configured in:
- `public/js/stripe-config.js`
- All HTML pages include Stripe SDK

### 2. Server-Side Setup (Required for Full Functionality)

#### Environment Variables
```bash
STRIPE_PUBLISHABLE_KEY=pk_live_51RpT30LHe1RTUAGqdJuiy1GWpobWJYGHMUBeiORdbz6OUwlqoaunI2cct8p51kGncr12b5X5axqYNzCELk80MijH00P4VABBtD
STRIPE_SECRET_KEY=your_stripe_secret_key_here
```

#### Required API Endpoints
Create these server endpoints for full payment functionality:

1. **Create Payment Intent**
   ```
   POST /api/create-payment-intent
   ```

2. **Create Subscription**
   ```
   POST /api/create-subscription
   ```

3. **Create Customer**
   ```
   POST /api/create-customer
   ```

4. **Get Payment Methods**
   ```
   GET /api/payment-methods/:customerId
   ```

5. **Setup Payment Method**
   ```
   POST /api/create-setup-intent
   ```

### 3. Webhook Configuration

Set up Stripe webhooks for:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

**Webhook Endpoint:** `https://your-domain.com/api/stripe-webhook`

### 4. Testing

#### Test Mode (Recommended for Development)
Use test keys for development:
- **Test Publishable Key:** `pk_test_...`
- **Test Secret Key:** `sk_test_...`

#### Live Mode (Production)
Your live keys are configured and ready for production use.

## Payment Features

### ✅ Implemented
- **Tip System** - Users can tip creators
- **Subscription Management** - Recurring payments
- **Payment Method Setup** - Secure card storage
- **Customer Management** - User payment profiles

### 🔧 Configuration
- **Currency:** USD
- **Minimum Tip:** $0.50
- **Default Tips:** $1, $5, $10, $25
- **Payout Threshold:** $25

## Security Best Practices

### ✅ Implemented
- Publishable key only in client-side code
- Secret key kept secure (not in repository)
- Environment variable support
- Secure payment processing

### 🔒 Additional Recommendations
- Use HTTPS in production
- Implement webhook signature verification
- Add rate limiting to payment endpoints
- Monitor payment logs and analytics

## Support

For Stripe issues, check:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- [Stripe API Reference](https://stripe.com/docs/api)

## Important Notes

⚠️ **Security Warning:** Never commit the secret key to version control. Always use environment variables for server-side configuration.

✅ **Current Status:** Live publishable key configured and deployed. Server-side implementation required for full payment processing. 