/**
 * Stripe Payment Integration for Amplifi Live Streaming
 * Handles tip payments, donations, and subscription processing
 */

class StripePaymentManager {
    constructor() {
        this.stripe = null;
        this.elements = null;
        this.paymentElement = null;
        this.isInitialized = false;
        this.publishableKey = 'pk_live_51RpT30LHe1RTUAGqpKuug4hhBIzcu1opGqPZVR2olv0Lu9NDtwwJ62T687W5gavxixfgorx4u675EIemGhhOpIsb00sjHcHFSa'; // Your live publishable key
        
        this.init();
    }

    async init() {
        try {
            console.log('💳 Initializing Stripe payment system...');
            
            // Load Stripe.js
            if (!window.Stripe) {
                await this.loadStripeScript();
            }
            
            this.stripe = Stripe(this.publishableKey);
            this.isInitialized = true;
            
            console.log('✅ Stripe payment system initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Stripe:', error);
            this.isInitialized = false;
        }
    }

    async loadStripeScript() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
        try {
            console.log(`💳 Creating payment intent for $${amount}...`);
            
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: Math.round(amount * 100), // Convert to cents
                    currency: currency,
                    metadata: metadata
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const { clientSecret } = await response.json();
            return clientSecret;
        } catch (error) {
            console.error('❌ Failed to create payment intent:', error);
            throw error;
        }
    }

    async processTipPayment(amount, message = '', streamerId = 'default') {
        try {
            if (!this.isInitialized) {
                throw new Error('Stripe not initialized');
            }

            console.log(`💰 Processing tip payment: $${amount}`);

            // Create payment intent
            const clientSecret = await this.createPaymentIntent(amount, 'usd', {
                type: 'tip',
                message: message,
                streamerId: streamerId,
                timestamp: new Date().toISOString()
            });

            // Confirm payment
            const { error, paymentIntent } = await this.stripe.confirmPayment({
                elements: this.elements,
                confirmParams: {
                    return_url: window.location.href,
                },
            });

            if (error) {
                throw new Error(error.message);
            }

            console.log('✅ Payment successful:', paymentIntent.id);
            return {
                success: true,
                paymentIntentId: paymentIntent.id,
                amount: amount,
                message: message
            };

        } catch (error) {
            console.error('❌ Payment failed:', error);
            throw error;
        }
    }

    async processSubscriptionPayment(priceId, customerEmail) {
        try {
            if (!this.isInitialized) {
                throw new Error('Stripe not initialized');
            }

            console.log(`💳 Processing subscription payment for price: ${priceId}`);

            // Create checkout session
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId: priceId,
                    customerEmail: customerEmail,
                    successUrl: `${window.location.origin}/subscription-success`,
                    cancelUrl: `${window.location.origin}/subscription-cancel`
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const { sessionId } = await response.json();

            // Redirect to Stripe Checkout
            const { error } = await this.stripe.redirectToCheckout({
                sessionId: sessionId
            });

            if (error) {
                throw new Error(error.message);
            }

        } catch (error) {
            console.error('❌ Subscription payment failed:', error);
            throw error;
        }
    }

    async createCustomer(email, name) {
        try {
            console.log(`👤 Creating Stripe customer: ${email}`);

            const response = await fetch('/api/create-customer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    name: name
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const customer = await response.json();
            console.log('✅ Customer created:', customer.id);
            return customer;

        } catch (error) {
            console.error('❌ Failed to create customer:', error);
            throw error;
        }
    }

    async getPaymentMethods(customerId) {
        try {
            const response = await fetch(`/api/payment-methods/${customerId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const paymentMethods = await response.json();
            return paymentMethods;

        } catch (error) {
            console.error('❌ Failed to get payment methods:', error);
            throw error;
        }
    }

    // Fallback payment simulation for development
    async simulatePayment(amount, message = '') {
        console.log(`💰 Simulating payment: $${amount} - "${message}"`);
        
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 95% success rate
                if (Math.random() > 0.05) {
                    resolve({
                        success: true,
                        paymentIntentId: 'pi_sim_' + Date.now(),
                        amount: amount,
                        message: message,
                        timestamp: new Date().toISOString()
                    });
                } else {
                    reject(new Error('Payment simulation failed'));
                }
            }, 2000);
        });
    }

    // Get payment history
    async getPaymentHistory(customerId, limit = 10) {
        try {
            const response = await fetch(`/api/payment-history/${customerId}?limit=${limit}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const history = await response.json();
            return history;

        } catch (error) {
            console.error('❌ Failed to get payment history:', error);
            throw error;
        }
    }

    // Refund payment
    async refundPayment(paymentIntentId, amount = null) {
        try {
            console.log(`💸 Processing refund for payment: ${paymentIntentId}`);

            const response = await fetch('/api/refund-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paymentIntentId: paymentIntentId,
                    amount: amount
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const refund = await response.json();
            console.log('✅ Refund successful:', refund.id);
            return refund;

        } catch (error) {
            console.error('❌ Refund failed:', error);
            throw error;
        }
    }
}

// Global instance
let stripePaymentManager;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    stripePaymentManager = new StripePaymentManager();
});

// Export for use in other scripts
window.StripePaymentManager = StripePaymentManager;
window.stripePaymentManager = stripePaymentManager;
