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

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { accountId } = req.query;

    if (!accountId) {
      return res.status(400).json({ error: 'Account ID is required' });
    }

    // Delete the connected account
    const deletedAccount = await stripe.accounts.del(accountId);

    res.status(200).json({
      success: true,
      accountId: deletedAccount.id,
      deleted: deletedAccount.deleted,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: error.message });
  }
}; 