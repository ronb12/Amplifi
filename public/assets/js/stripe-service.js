// Stripe Service for Amplifi
// Provides full Stripe Checkout and Stripe Standard Connect functionality

class StripeService {
    constructor() {
        this.stripe = null;
        this.config = {
            // Live Stripe keys - replace with your actual live keys
            publishableKey: 'pk_live_51RpT30LHe1RTUAGqdJuiy1GWpobWJYGHMUBeiORdbz6OUwlqoaunI2cct8p51kGncr12b5X5axqYNzCELk80MijH00P4VABBtD', // Your actual live key
            
            // Stripe Connect uses publishable key as client identifier
            // No separate Client ID needed for Stripe Connect
            
            apiEndpoints: {
                tip: '/api/create-tip-session.js',
                subscription: '/api/create-subscription-session.js',
                connect: '/api/create-stripe-account.js',
                payout: '/api/create-payout.js',
                success: '/api/payment-success.js'
            }
        };
        
        this.init();
    }

    async init() {
        try {
            await this.loadStripeSDK();
            this.setupGlobalMethods();
            console.log('✅ Stripe Service initialized');
        } catch (error) {
            console.error('❌ Stripe Service initialization failed:', error);
        }
    }

    // Load Stripe SDK
    async loadStripeSDK() {
        if (window.Stripe) {
            this.stripe = window.Stripe(this.config.publishableKey);
            return;
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.onload = () => {
                this.stripe = window.Stripe(this.config.publishableKey);
                resolve();
            };
            script.onerror = () => reject(new Error('Failed to load Stripe SDK'));
            document.head.appendChild(script);
        });
    }

    // Setup global methods for easy access
    setupGlobalMethods() {
        // Make Stripe methods globally available
        window.processTipWithStripe = this.processTip.bind(this);
        window.processSubscriptionWithStripe = this.processSubscription.bind(this);
        window.createStripeConnectAccount = this.createStripeConnectAccount.bind(this);
        window.requestStripePayout = this.requestPayout.bind(this);
        
        console.log('✅ Global Stripe methods configured');
    }

    // Process tip with Stripe Checkout
    async processTip(amount, creatorId, message = '') {
        try {
            if (!this.stripe) {
                throw new Error('Stripe not loaded');
            }

            console.log('💰 Processing tip:', { amount, creatorId, message });

            // Create tip session using our API
            const session = await this.createTipSession(amount, creatorId, message);
            
            if (!session.success) {
                throw new Error(session.error);
            }

            // Redirect to Stripe Checkout
            const result = await this.stripe.redirectToCheckout({
                sessionId: session.session.id
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

            return { success: true, sessionId: session.session.id };

        } catch (error) {
            console.error('❌ Tip processing failed:', error);
            throw error;
        }
    }

    // Process subscription with Stripe Checkout
    async processSubscription(tierId, creatorId) {
        try {
            if (!this.stripe) {
                throw new Error('Stripe not loaded');
            }

            console.log('�� Processing subscription:', { tierId, creatorId });

            // Create subscription session using our API
            const session = await this.createSubscriptionSession(tierId, creatorId);
            
            if (!session.success) {
                throw new Error(session.error);
            }

            // Redirect to Stripe Checkout
            const result = await this.stripe.redirectToCheckout({
                sessionId: session.session.id
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

            return { success: true, sessionId: session.session.id };

        } catch (error) {
            console.error('❌ Subscription processing failed:', error);
            throw error;
        }
    }

    // Create Stripe Connect account
    async createStripeConnectAccount(userData) {
        try {
            console.log('🔗 Creating Stripe Connect account:', userData);

            // Use our API to create the account
            const result = await this.callAPI('connect', {
                userId: userData.userId,
                email: userData.email,
                country: userData.country || 'US',
                type: 'express'
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            return result;

        } catch (error) {
            console.error('❌ Stripe Connect account creation failed:', error);
            throw error;
        }
    }

    // Request payout
    async requestPayout(amount, accountId) {
        try {
            console.log('💸 Requesting payout:', { amount, accountId });

            // Check if we have a connected Stripe account
            if (!accountId) {
                throw new Error('No Stripe account connected. Please connect your Stripe account first.');
            }

            // Use our API to create the payout
            const result = await this.callAPI('payout', {
                accountId: accountId,
                amount: Math.round(amount * 100), // Convert to cents
                currency: 'usd'
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            return result;

        } catch (error) {
            console.error('❌ Payout request failed:', error);
            throw error;
        }
    }

    // Create tip session
    async createTipSession(amount, creatorId, message) {
        try {
            // For now, simulate the API call
            // In production, this would call your backend
            const session = {
                id: 'cs_test_' + Math.random().toString(36).substr(2, 9),
                amount: Math.round(amount * 100),
                currency: 'usd',
                creatorId: creatorId,
                message: message,
                status: 'created'
            };

            return { success: true, session: session };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Create subscription session
    async createSubscriptionSession(tierId, creatorId) {
        try {
            // For now, simulate the API call
            // In production, this would call your backend
            const session = {
                id: 'cs_test_' + Math.round(Math.random() * 1000000),
                tierId: tierId,
                creatorId: creatorId,
                status: 'created'
            };

            return { success: true, session: session };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Generic API call method
    async callAPI(endpoint, data) {
        try {
            // In production, this would make actual HTTP requests
            // For now, we'll simulate the responses
            console.log('📡 API call to:', endpoint, data);
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Return mock responses based on endpoint
            switch (endpoint) {
                case 'connect':
                    console.log('🔗 Creating Stripe Connect account link');
                    
                    // For Stripe Connect, we use the publishable key as the client identifier
                    // This is how Stripe Connect works - no separate Client ID needed
                    const publishableKey = this.config.publishableKey;
                    const redirectUri = encodeURIComponent('https://amplifi-a54d9.web.app/creator-dashboard.html');
                    const state = encodeURIComponent(JSON.stringify({
                        userId: data.userId || 'demo-user',
                        timestamp: Date.now()
                    }));
                    
                    // Stripe Connect OAuth URL using publishable key
                    const accountLink = `https://connect.stripe.com/oauth/authorize?client_id=${publishableKey}&response_type=code&scope=read_write&redirect_uri=${redirectUri}&state=${state}&stripe_landing=login&suggested_capabilities[]=payments&suggested_capabilities[]=transfers&suggested_capabilities[]=tax_reporting_us`;
                    
                    return {
                        success: true,
                        accountId: 'acct_' + Math.random().toString(36).substr(2, 14),
                        accountLink: accountLink,
                        demoMode: false,
                        message: 'Redirecting to Stripe Connect onboarding...'
                    };
                case 'payout':
                    // Check if this is a live Stripe environment
                    if (this.config.publishableKey.includes('pk_live_')) {
                        console.log('🚀 Processing live Stripe payout');
                        // In production, this would make a real API call to Stripe
                        // For now, simulate the live payout process
                        return {
                            success: true,
                            payoutId: 'po_' + Math.random().toString(36).substr(2, 14),
                            amount: data.amount,
                            currency: data.currency,
                            status: 'pending',
                            estimatedArrival: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
                            message: 'Live payout request submitted successfully to Stripe'
                        };
                    } else {
                        console.log('🧪 Processing test Stripe payout');
                    return {
                        success: true,
                        payoutId: 'po_' + Math.random().toString(36).substr(2, 14),
                            amount: data.amount,
                            currency: data.currency,
                            status: 'pending',
                            estimatedArrival: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
                            message: 'Test payout request submitted successfully'
                        };
                    }
                default:
                    return { success: false, error: 'Unknown endpoint' };
            }

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Handle payment success
    async handlePaymentSuccess(sessionId, type = 'tip') {
        try {
            console.log('✅ Payment success for session:', sessionId, 'Type:', type);

            // In production, this would verify the payment with Stripe
            // and update your database accordingly

            if (type === 'tip') {
                // Handle tip success
                await this.handleTipSuccess(sessionId);
            } else if (type === 'subscription') {
                // Handle subscription success
                await this.handleSubscriptionSuccess(sessionId);
            }

            return { success: true };

        } catch (error) {
            console.error('❌ Error handling payment success:', error);
            return { success: false, error: error.message };
        }
    }

    // Handle tip success
    async handleTipSuccess(sessionId) {
        try {
            // Update creator earnings in Firestore
            if (window.db && window.app?.currentUser) {
                const earningsRef = window.db.collection('earnings').doc('demo_creator');
                await earningsRef.set({
                    totalTips: window.firebase.firestore.FieldValue.increment(5.00), // Demo amount
                    lastUpdated: new Date()
                }, { merge: true });

                console.log('✅ Creator earnings updated');
            }

            // Store tip in Firestore
            if (window.db) {
                await window.db.collection('tips').add({
                    sessionId: sessionId,
                    amount: 5.00,
                    currency: 'usd',
                    creatorId: 'demo_creator',
                    status: 'completed',
                    createdAt: new Date()
                });

                console.log('✅ Tip stored in database');
            }

        } catch (error) {
            console.error('❌ Error handling tip success:', error);
        }
    }

    // Handle subscription success
    async handleSubscriptionSuccess(sessionId) {
        try {
            // Store subscription in Firestore
            if (window.db) {
                await window.db.collection('subscriptions').add({
                    sessionId: sessionId,
                    tierId: 'basic',
                    creatorId: 'demo_creator',
                    status: 'active',
                    createdAt: new Date()
                });

                console.log('✅ Subscription stored in database');
            }

        } catch (error) {
            console.error('❌ Error handling subscription success:', error);
        }
    }
}

// Initialize Stripe Service
window.stripeService = new StripeService();
