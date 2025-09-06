const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "https://pagead2.googlesyndication.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.stripe.com", "https://firestore.googleapis.com"]
        }
    }
}));
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve static files
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));
app.use('/favicon.svg', express.static(path.join(__dirname, 'public/favicon.svg')));
app.use('/manifest.json', express.static(path.join(__dirname, 'public/manifest.json')));

// Mock Stripe integration (replace with real Stripe when API keys are available)
const mockStripeService = {
    async createConnectAccount(userData) {
        // Simulate Stripe account creation
        return {
            success: true,
            accountId: 'acct_mock_' + Date.now(),
            accountLink: 'https://dashboard.stripe.com/express/onboarding'
        };
    },
    
    async requestPayout(amount, accountId) {
        // Simulate payout processing
        return {
            success: true,
            transferId: 'tr_mock_' + Date.now(),
            message: 'Payout processed successfully'
        };
    }
};

// API Routes
app.post('/api/create-stripe-account', async (req, res) => {
    try {
        const { email, country, userId } = req.body;
        
        if (!email || !userId) {
            return res.status(400).json({
                success: false,
                error: 'Email and userId are required'
            });
        }
        
        const result = await mockStripeService.createConnectAccount({
            email,
            country: country || 'US',
            userId
        });
        
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/create-payout', async (req, res) => {
    try {
        const { amount, accountId } = req.body;
        
        if (!amount || !accountId) {
            return res.status(400).json({
                success: false,
                error: 'Amount and accountId are required'
            });
        }
        
        const result = await mockStripeService.requestPayout(amount, accountId);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Amplifi API',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Serve main app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('❌ Server error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 Amplifi server running on port', PORT);
    console.log('📱 Creator platform with AI recommendations and offline support');
    console.log('🔗 Local: http://localhost:' + PORT);
    console.log('✅ API endpoints available at /api/*');
});
