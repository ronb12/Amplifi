const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors')();

export default async function handler(req, res) {
  // Enable CORS
  await new Promise((resolve) => cors(req, res, resolve));

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'usd', description, recipientId, recipientName } = req.body;

    // Validate amount
    if (!amount || amount < 50) { // Minimum $0.50
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      description: description || `Tip to ${recipientName} via Bradley Virtual Solutions, LLC`,
      metadata: {
        recipientId,
        recipientName,
        platform: 'amplifi',
        business: 'Bradley Virtual Solutions, LLC'
      }
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ error: 'Payment failed' });
  }
} 