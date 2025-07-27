const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors')();

export default async function handler(req, res) {
  // Enable CORS
  await new Promise((resolve) => cors(req, res, resolve));

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerEmail, priceId, customerId } = req.body;

    let customer;

    if (customerId) {
      customer = await stripe.customers.retrieve(customerId);
    } else {
      // Create new customer
      customer = await stripe.customers.create({
        email: customerEmail,
        metadata: {
          platform: 'amplifi',
          business: 'Bradley Virtual Solutions, LLC'
        }
      });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        platform: 'amplifi',
        business: 'Bradley Virtual Solutions, LLC'
      }
    });

    res.status(200).json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      customerId: customer.id
    });

  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Subscription failed' });
  }
} 