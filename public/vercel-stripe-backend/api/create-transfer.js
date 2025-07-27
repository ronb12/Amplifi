const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { creatorId, amount, currency = 'usd', description } = req.body;

    if (!creatorId || !amount) {
      return res.status(400).json({ error: 'Creator ID and amount are required' });
    }

    // Find creator's Stripe Connect account
    const accounts = await stripe.accounts.list({
      limit: 100
    });

    // For now, we'll use the first account
    // In a real implementation, you'd store the account ID in your database
    const account = accounts.data[0];

    if (!account) {
      return res.status(404).json({ error: 'No Stripe Connect account found for creator' });
    }

    if (!account.details_submitted) {
      return res.status(400).json({ error: 'Creator account not fully set up' });
    }

    // Create transfer to the creator's account
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency,
      destination: account.id,
      description: description || 'Tip payment transfer'
    });

    res.status(200).json({
      transferId: transfer.id,
      amount: transfer.amount / 100,
      currency: transfer.currency,
      status: transfer.status,
      destination: transfer.destination
    });

  } catch (error) {
    console.error('Error creating transfer:', error);
    res.status(500).json({ error: error.message });
  }
}; 