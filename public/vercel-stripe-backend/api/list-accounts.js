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
    // List all connected accounts
    const accounts = await stripe.accounts.list({
      limit: 100
    });

    const accountList = accounts.data.map(account => ({
      id: account.id,
      business_profile: account.business_profile,
      charges_enabled: account.charges_enabled,
      country: account.country,
      created: account.created,
      default_currency: account.details_submitted,
      details_submitted: account.details_submitted,
      email: account.email,
      payouts_enabled: account.payouts_enabled,
      requirements: account.requirements,
      settings: account.settings,
      type: account.type,
      status: account.status
    }));

    res.status(200).json({
      success: true,
      total: accounts.data.length,
      accounts: accountList
    });

  } catch (error) {
    console.error('Error listing accounts:', error);
    res.status(500).json({ error: error.message });
  }
}; 