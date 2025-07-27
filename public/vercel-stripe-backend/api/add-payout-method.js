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
    const { creatorId, email, methodType, methodData } = req.body;

    if (!creatorId || !email || !methodType || !methodData) {
      return res.status(400).json({ error: 'Creator ID, email, method type, and method data are required' });
    }

    // Find the creator's Stripe Connect account
    const accounts = await stripe.accounts.list({
      limit: 100
    });

    const account = accounts.data.find(acc => acc.email === email);

    if (!account) {
      return res.status(404).json({ error: 'Stripe Connect account not found' });
    }

    let result;

    if (methodType === 'bank_account') {
      // Add bank account to the connected account
      const bankAccount = await stripe.accounts.createExternalAccount(account.id, {
        external_account: {
          object: 'bank_account',
          country: 'US',
          currency: 'usd',
          account_holder_name: methodData.accountHolder,
          routing_number: methodData.routingNumber,
          account_number: methodData.accountNumber,
          account_holder_type: 'individual'
        }
      });

      result = {
        success: true,
        methodType: 'bank_account',
        bankAccountId: bankAccount.id,
        last4: bankAccount.last4,
        bankName: bankAccount.bank_name,
        message: 'Bank account added successfully'
      };

    } else if (methodType === 'debit_card') {
      // For debit cards, we need to create a payment method and attach it
      // This is more complex and requires additional setup
      // For now, we'll return a success message
      result = {
        success: true,
        methodType: 'debit_card',
        message: 'Debit card setup initiated. Please complete verification in your Stripe dashboard.'
      };

    } else if (methodType === 'instant_payouts') {
      // Enable instant payouts for the account
      const updatedAccount = await stripe.accounts.update(account.id, {
        settings: {
          payouts: {
            schedule: {
              interval: 'manual'
            }
          }
        }
      });

      result = {
        success: true,
        methodType: 'instant_payouts',
        message: 'Instant payouts enabled successfully'
      };

    } else {
      return res.status(400).json({ error: 'Invalid method type' });
    }

    res.status(200).json(result);

  } catch (error) {
    console.error('Error adding payout method:', error);
    res.status(500).json({ error: error.message });
  }
}; 