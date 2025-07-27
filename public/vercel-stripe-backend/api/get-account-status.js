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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { creatorId } = req.query;

    if (!creatorId) {
      return res.status(400).json({ error: 'Creator ID is required' });
    }

    // Find creator's Stripe Connect account by email
    const accounts = await stripe.accounts.list({
      limit: 100
    });

    // For now, we'll use the first account or create a new one
    // In a real implementation, you'd store the account ID in your database
    let account = accounts.data[0];

    if (!account) {
      return res.status(200).json({ 
        hasAccount: false, 
        message: 'No Stripe Connect account found' 
      });
    }

    res.status(200).json({
      hasAccount: true,
      accountId: account.id,
      status: account.details_submitted ? 'active' : 'pending',
      payoutsEnabled: account.payouts_enabled,
      chargesEnabled: account.charges_enabled,
      requirements: account.requirements
    });

  } catch (error) {
    console.error('Error getting account status:', error);
    res.status(500).json({ error: error.message });
  }
}; 