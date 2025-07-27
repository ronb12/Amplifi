// Stripe Configuration for Amplifi
// This file contains Stripe integration settings and payment processing functions

// Stripe configuration
const stripeConfig = {
    // Live Stripe publishable key (safe for client-side)
    publishableKey: 'pk_live_51RpT30LHe1RTUAGqdJuiy1GWpobWJYGHMUBeiORdbz6OUwlqoaunI2cct8p51kGncr12b5X5axqYNzCELk80MijH00P4VABBtD',
    
    // Payment settings
    currency: 'usd',
    minimumTipAmount: 0.50,
    defaultTipAmounts: [1, 5, 10, 25],
    
    // Payout settings
    payoutThresholds: [50, 100, 200],
    defaultPayoutThreshold: 50
};

// Initialize Stripe
let stripe;
try {
    stripe = Stripe(stripeConfig.publishableKey);
} catch (error) {
    console.warn('Stripe not loaded:', error);
}

// Payment processing functions
class StripePaymentProcessor {
    constructor() {
        this.stripe = stripe;
        this.config = stripeConfig;
    }

    // Process tip payment
    async processTip(amount, recipientId, recipientName) {
        if (!this.stripe) {
            throw new Error('Stripe not initialized');
        }

        try {
            // Get current user token for authentication
            const currentUser = auth.currentUser;
            if (!currentUser) {
                throw new Error('User not authenticated');
            }
            
            const idToken = await currentUser.getIdToken();

            // Create payment intent using Firebase Functions
            const response = await fetch('https://us-central1-amplifi-a54d9.cloudfunctions.net/create_payment_intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    amount: Math.round(amount * 100), // Convert to cents
                    currency: this.config.currency,
                    recipientId: recipientId,
                    recipientName: recipientName
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Payment intent creation failed');
            }

            const { clientSecret } = await response.json();

            // Confirm payment with Stripe
            const result = await this.stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement('card'),
                    billing_details: {
                        name: 'Tip Payment'
                    }
                }
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

            return result.paymentIntent;
        } catch (error) {
            console.error('Payment processing error:', error);
            throw error;
        }
    }

    // Process subscription payment
    async processSubscription(priceId, customerId) {
        if (!this.stripe) {
            throw new Error('Stripe not initialized');
        }

        try {
            // Get current user token for authentication
            const currentUser = auth.currentUser;
            if (!currentUser) {
                throw new Error('User not authenticated');
            }
            
            const idToken = await currentUser.getIdToken();

            const response = await fetch('https://us-central1-amplifi-a54d9.cloudfunctions.net/create_subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    priceId: priceId,
                    customerId: customerId
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Subscription creation failed');
            }

            const { subscriptionId } = await response.json();
            return subscriptionId;
        } catch (error) {
            console.error('Subscription processing error:', error);
            throw error;
        }
    }

    // Create customer
    async createCustomer(email, name) {
        if (!this.stripe) {
            throw new Error('Stripe not initialized');
        }

        try {
            // Get current user token for authentication
            const currentUser = auth.currentUser;
            if (!currentUser) {
                throw new Error('User not authenticated');
            }
            
            const idToken = await currentUser.getIdToken();

            const response = await fetch('https://us-central1-amplifi-a54d9.cloudfunctions.net/create_customer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    email: email,
                    name: name
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Customer creation failed');
            }

            const { customerId } = await response.json();
            return customerId;
        } catch (error) {
            console.error('Customer creation error:', error);
            throw error;
        }
    }

    // Get payment methods
    async getPaymentMethods(customerId) {
        if (!this.stripe) {
            throw new Error('Stripe not initialized');
        }

        try {
            // Get current user token for authentication
            const currentUser = auth.currentUser;
            if (!currentUser) {
                throw new Error('User not authenticated');
            }
            
            const idToken = await currentUser.getIdToken();

            const response = await fetch(`https://us-central1-amplifi-a54d9.cloudfunctions.net/get_payment_methods?customerId=${customerId}`, {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch payment methods');
            }

            const { paymentMethods } = await response.json();
            return paymentMethods;
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            throw error;
        }
    }

    // Setup payment method
    async setupPaymentMethod(customerId) {
        if (!this.stripe) {
            throw new Error('Stripe not initialized');
        }

        try {
            // Get current user token for authentication
            const currentUser = auth.currentUser;
            if (!currentUser) {
                throw new Error('User not authenticated');
            }
            
            const idToken = await currentUser.getIdToken();

            const response = await fetch('https://us-central1-amplifi-a54d9.cloudfunctions.net/create_setup_intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    customerId: customerId
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Setup intent creation failed');
            }

            const { setupIntent } = await response.json();

            const result = await this.stripe.confirmCardSetup(setupIntent.client_secret, {
                payment_method: {
                    card: elements.getElement('card'),
                    billing_details: {
                        name: 'Payment Method'
                    }
                }
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

            return result.setupIntent;
        } catch (error) {
            console.error('Payment method setup error:', error);
            throw error;
        }
    }
}

// Initialize payment processor
const paymentProcessor = new StripePaymentProcessor();

// Export for use in other files
window.StripePaymentProcessor = StripePaymentProcessor;
window.paymentProcessor = paymentProcessor;
window.stripeConfig = stripeConfig; 