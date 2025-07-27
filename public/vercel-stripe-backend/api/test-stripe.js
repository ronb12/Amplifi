const cors = require('cors')();

export default async function handler(req, res) {
  // Enable CORS
  await new Promise((resolve) => cors(req, res, resolve));

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Testing Stripe connection...');
    console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('STRIPE')));
    console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
    console.log('STRIPE_SECRET_KEY length:', process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.length : 0);
    console.log('STRIPE_SECRET_KEY starts with:', process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 10) + '...' : 'N/A');
    console.log('STRIPE_SECRET_KEY ends with:', process.env.STRIPE_SECRET_KEY ? '...' + process.env.STRIPE_SECRET_KEY.substring(process.env.STRIPE_SECRET_KEY.length - 4) : 'N/A');

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ 
        error: 'Stripe secret key not found',
        envVars: Object.keys(process.env).filter(key => key.includes('STRIPE'))
      });
    }

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    // Test Stripe connection by getting account info
    const account = await stripe.accounts.retrieve();
    
    res.status(200).json({
      success: true,
      account: {
        id: account.id,
        business_type: account.business_type,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled
      }
    });

  } catch (error) {
    console.error('Stripe test error:', error);
    res.status(500).json({ 
      error: 'Stripe test failed',
      message: error.message,
      type: error.type,
      envVars: Object.keys(process.env).filter(key => key.includes('STRIPE'))
    });
  }
} 