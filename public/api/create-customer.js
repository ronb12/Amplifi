// Vercel Serverless Function for Stripe Customer Creation
// Handles customer management for subscriptions and payments

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name, metadata = {} } = req.body;

    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    const customer = await stripe.customers.create({
      email: email,
      name: name || 'Anonymous',
      metadata: {
        platform: 'amplifi',
        created_at: new Date().toISOString(),
        ...metadata
      }
    });

    console.log('✅ Customer created:', customer.id);
    res.json({
      customerId: customer.id,
      email: customer.email,
      name: customer.name
    });

  } catch (error) {
    console.error('❌ Error creating customer:', error);
    res.status(500).json({ error: error.message });
  }
}