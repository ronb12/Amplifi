# Amplifi Production Setup

Amplifi can run in demo mode locally, or in production mode with Vercel, Neon, Stripe, and Agora.

## Vercel

Deploy the Vite app and serverless API functions on Vercel.

Required project env vars:

- `VITE_ENABLE_API=true`
- `PUBLIC_APP_URL=https://your-domain.com`
- `DATABASE_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `AGORA_APP_ID`
- `AGORA_APP_CERTIFICATE`
- `ADMIN_MIGRATION_SECRET`

## Neon

Create a Neon Postgres database from the Vercel Marketplace, then set `DATABASE_URL`.

After deploy, run the migration endpoint once:

```bash
curl -X POST https://your-domain.com/api/db/migrate \
  -H "Authorization: Bearer $ADMIN_MIGRATION_SECRET"
```

The migration creates durable tables for creator Stripe accounts, payments, Stripe webhook events, and live stream sessions.

## Stripe

Use Stripe Checkout for tips, subscriptions, event tickets, pay-per-view, and store purchases. Use Stripe Connect Express for creator onboarding and payouts.

Set the webhook endpoint in Stripe:

```text
https://your-domain.com/api/stripe-webhook
```

Listen for:

- `checkout.session.completed`
- `checkout.session.expired`
- `account.updated`
- `payout.paid`
- `payout.failed`

## Agora

Create an Agora project and set:

- `AGORA_APP_ID`
- `AGORA_APP_CERTIFICATE`

The app creates live stream sessions through `/api/live-streams`, mints RTC publisher tokens through `/api/agora-token`, and publishes camera/mic tracks from the creator live modal when production API mode is enabled.

## Local Demo Mode

Leave `VITE_ENABLE_API` unset or set it to `false` to keep the local demo flows working without provider secrets.
