# 🚀 Vercel Deployment Guide for Live Monetization

## Prerequisites
- Vercel account (you already have this!)
- Stripe account with live keys
- Your project deployed at: https://vercel.com/ronell-bradleys-projects/amplifi

## Step 1: Set Up Environment Variables

### In your Vercel Dashboard:
1. Go to your project: https://vercel.com/ronell-bradleys-projects/amplifi
2. Click **Settings** → **Environment Variables**
3. Add these variables:

```
STRIPE_SECRET_KEY = sk_live_your_new_secret_key_here
STRIPE_PUBLISHABLE_KEY = pk_live_51RpT30LHe1RTUAGqpKuug4hhBIzcu1opGqPZVR2olv0Lu9NDtwwJ62T687W5gavxixfgorx4u675EIemGhhOpIsb00sjHcHFSa
STRIPE_WEBHOOK_SECRET = whsec_your_webhook_secret_here
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Option B: Deploy via Git
1. Push your changes to GitHub
2. Vercel will automatically deploy

## Step 3: Set Up Stripe Webhooks

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/stripe-webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.deleted`
4. Copy the webhook secret to your Vercel environment variables

## Step 4: Test Live Payments

### Test the API endpoints:
```bash
# Test payment intent creation
curl -X POST https://your-domain.vercel.app/api/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "metadata": {"type": "tip"}}'
```

### Test in your live app:
1. Go to your live streaming page
2. Click the tip button (heart icon)
3. Select an amount
4. Complete the payment
5. Check Stripe Dashboard for the transaction

## Step 5: Monitor and Analytics

### Vercel Analytics:
- Go to your Vercel dashboard
- Check **Analytics** tab for API usage
- Monitor **Functions** tab for serverless function performance

### Stripe Dashboard:
- Monitor payments in real-time
- Check for failed payments
- Review webhook delivery logs

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure CORS headers are set in API functions
2. **Webhook Failures**: Check webhook secret and endpoint URL
3. **Payment Failures**: Verify Stripe keys are correct
4. **Function Timeouts**: Increase maxDuration in vercel.json

### Debug Commands:
```bash
# Check Vercel logs
vercel logs

# Test locally
vercel dev
```

## Security Checklist

- ✅ Stripe secret key is in environment variables (not in code)
- ✅ Webhook secret is configured
- ✅ CORS is properly configured
- ✅ Input validation is implemented
- ✅ Error handling is in place

## Next Steps

1. **Deploy**: Push changes and deploy to Vercel
2. **Test**: Test with small amounts first
3. **Monitor**: Watch for errors in Vercel logs
4. **Scale**: Monitor performance and scale as needed

Your monetization system will be live and ready to accept real payments! 🎉
