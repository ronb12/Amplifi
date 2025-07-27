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
    const { creatorId, email, returnUrl, linkType = 'onboarding' } = req.body;

    if (!creatorId || !email) {
      return res.status(400).json({ error: 'Creator ID and email are required' });
    }

    // Find existing account or create new one
    let account;
    const accounts = await stripe.accounts.list({
      limit: 100
    });

    account = accounts.data.find(acc => acc.email === email);

    if (!account) {
      // Create new Express account
      account = await stripe.accounts.create({
        type: 'express',
        email: email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true }
        }
      });
    }

    // Create account link based on type
    let accountLinkParams = {
      account: account.id,
      refresh_url: returnUrl || `${req.headers.origin}/dashboard?success=true`,
      return_url: returnUrl || `${req.headers.origin}/dashboard?success=true`,
      type: 'account_onboarding'
    };

    // Add specific configuration based on link type
    if (linkType === 'payouts') {
      accountLinkParams.type = 'account_update';
      accountLinkParams.collect = 'eventually_due';
    } else if (linkType === 'bank_account') {
      accountLinkParams.type = 'account_update';
      accountLinkParams.collect = 'eventually_due';
    } else if (linkType === 'instant_payouts') {
      accountLinkParams.type = 'account_update';
      accountLinkParams.collect = 'eventually_due';
    }

    const accountLink = await stripe.accountLinks.create(accountLinkParams);

    res.status(200).json({
      success: true,
      accountId: account.id,
      accountLink: accountLink.url,
      linkType: linkType
    });

  } catch (error) {
    console.error('Error creating account link:', error);
    res.status(500).json({ error: error.message });
  }
}; 