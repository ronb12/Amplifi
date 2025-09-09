/**
 * Backend API Examples for Stripe Integration
 * These are example endpoints that would be implemented on your server
 * Replace with your actual backend implementation
 */

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(express.json());

// Create Payment Intent for Tips
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency = 'usd', metadata = {} } = req.body;
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // Amount in cents
            currency: currency,
            metadata: metadata,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create Checkout Session for Subscriptions
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { priceId, customerEmail, successUrl, cancelUrl } = req.body;
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            customer_email: customerEmail,
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                type: 'subscription',
                timestamp: new Date().toISOString()
            }
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create Customer
app.post('/api/create-customer', async (req, res) => {
    try {
        const { email, name } = req.body;
        
        const customer = await stripe.customers.create({
            email: email,
            name: name,
            metadata: {
                platform: 'amplifi',
                created_at: new Date().toISOString()
            }
        });

        res.json(customer);
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get Payment Methods
app.get('/api/payment-methods/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        
        const paymentMethods = await stripe.paymentMethods.list({
            customer: customerId,
            type: 'card',
        });

        res.json(paymentMethods.data);
    } catch (error) {
        console.error('Error getting payment methods:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get Payment History
app.get('/api/payment-history/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        const { limit = 10 } = req.query;
        
        const charges = await stripe.charges.list({
            customer: customerId,
            limit: parseInt(limit),
        });

        res.json(charges.data);
    } catch (error) {
        console.error('Error getting payment history:', error);
        res.status(500).json({ error: error.message });
    }
});

// Refund Payment
app.post('/api/refund-payment', async (req, res) => {
    try {
        const { paymentIntentId, amount } = req.body;
        
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents if amount specified
        });

        res.json(refund);
    } catch (error) {
        console.error('Error processing refund:', error);
        res.status(500).json({ error: error.message });
    }
});

// Webhook for handling Stripe events
app.post('/api/stripe-webhook', express.raw({type: 'application/json'}), (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('Payment succeeded:', paymentIntent.id);
            // Update your database, send confirmation email, etc.
            break;
        case 'customer.subscription.created':
            const subscription = event.data.object;
            console.log('Subscription created:', subscription.id);
            // Update your database, send welcome email, etc.
            break;
        case 'customer.subscription.deleted':
            const deletedSubscription = event.data.object;
            console.log('Subscription cancelled:', deletedSubscription.id);
            // Update your database, send cancellation email, etc.
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
});

// Revenue Analytics Endpoint
app.get('/api/revenue-analytics/:streamerId', async (req, res) => {
    try {
        const { streamerId } = req.params;
        const { startDate, endDate } = req.query;
        
        // Query your database for revenue data
        // This is a simplified example
        const analytics = {
            totalRevenue: 0,
            totalTips: 0,
            totalSubscriptions: 0,
            averageTip: 0,
            topTippers: [],
            revenueByDay: [],
            goals: []
        };

        res.json(analytics);
    } catch (error) {
        console.error('Error getting revenue analytics:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
