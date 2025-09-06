// Stripe Integration for Amplifi
// This file provides full Stripe Checkout and Stripe Connect functionality

class StripeIntegration {
    constructor() {
        this.stripe = null;
        this.config = {
            publishableKey: 'pk_test_51OqKCYmr...', // Replace with your actual test key
            apiBaseUrl: '/api',
            supportedCurrencies: ['usd', 'eur', 'gbp', 'cad', 'aud'],
            defaultCurrency: 'usd'
        };
        
        this.init();
    }

    async init() {
        try {
            await this.loadStripeSDK();
            this.setupEventListeners();
            console.log('✅ Stripe integration initialized');
        } catch (error) {
            console.error('❌ Stripe integration failed:', error);
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

    // Set up event listeners
    setupEventListeners() {
        // Tip processing
        const tipForm = document.getElementById('tipForm');
        if (tipForm) {
            tipForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processTip();
            });
        }

        // Subscription processing
        const subscriptionButtons = document.querySelectorAll('[data-subscription-tier]');
        subscriptionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const tierId = button.getAttribute('data-subscription-tier');
                this.processSubscription(tierId);
            });
        });

        // Payout requests
        const payoutButton = document.getElementById('requestPayoutBtn');
        if (payoutButton) {
            payoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.requestPayout();
            });
        }

        // Stripe Connect account creation
        const connectButton = document.getElementById('connectStripeBtn');
        if (connectButton) {
            connectButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.createStripeConnectAccount();
            });
        }
    }

    // Process tip payment
    async processTip() {
        try {
            const amount = parseFloat(document.getElementById('customTipAmount').value);
            const message = document.getElementById('tipMessage')?.value || '';
            const creatorId = document.getElementById('tipCreatorId')?.value || 'demo_creator';

            if (!amount || amount < 0.50) {
                alert('Minimum tip amount is $0.50');
                return;
            }

            // Show loading state
            this.showLoadingState('tip');

            // Create Stripe Checkout session
            const response = await fetch(`${this.config.apiBaseUrl}/create-tip-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: Math.round(amount * 100), // Convert to cents
                    creatorId: creatorId,
                    message: message,
                    currency: this.config.defaultCurrency
                })
            });

            const session = await response.json();

            if (session.error) {
                throw new Error(session.error);
            }

            // Redirect to Stripe Checkout
            const result = await this.stripe.redirectToCheckout({
                sessionId: session.id
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

        } catch (error) {
            console.error('Tip processing error:', error);
            alert('Failed to process tip: ' + error.message);
        } finally {
            this.hideLoadingState('tip');
        }
    }

    // Process subscription
    async processSubscription(tierId) {
        try {
            const creatorId = document.getElementById('subscriptionCreatorId')?.value || 'demo_creator';
            
            // Show loading state
            this.showLoadingState('subscription');

            // Create Stripe Checkout session
            const response = await fetch(`${this.config.apiBaseUrl}/create-subscription-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tierId: tierId,
                    creatorId: creatorId,
                    currency: this.config.defaultCurrency
                })
            });

            const session = await response.json();

            if (session.error) {
                throw new Error(session.error);
            }

            // Redirect to Stripe Checkout
            const result = await this.stripe.redirectToCheckout({
                sessionId: session.id
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

        } catch (error) {
            console.error('Subscription processing error:', error);
            alert('Failed to process subscription: ' + error.message);
        } finally {
            this.hideLoadingState('subscription');
        }
    }

    // Create Stripe Connect account
    async createStripeConnectAccount() {
        try {
            // Show loading state
            this.showLoadingState('connect');

            const response = await fetch(`${this.config.apiBaseUrl}/create-stripe-account`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: window.app?.currentUser?.email || 'creator@example.com',
                    country: 'US',
                    type: 'express'
                })
            });

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error);
            }

            if (result.success && result.accountLink) {
                // Redirect to Stripe Connect onboarding
                window.open(result.accountLink, '_blank');
                alert('Stripe account creation initiated! Please complete the onboarding process.');
            } else {
                throw new Error('Failed to create Stripe account');
            }

        } catch (error) {
            console.error('Stripe Connect error:', error);
            alert('Failed to create Stripe account: ' + error.message);
        } finally {
            this.hideLoadingState('connect');
        }
    }

    // Request payout
    async requestPayout() {
        try {
            const earnings = await this.getUserEarnings();
            
            if (earnings.totalEarnings < 25) {
                alert('You need at least $25.00 in earnings to request a payout');
                return;
            }

            // Show loading state
            this.showLoadingState('payout');

            const response = await fetch(`${this.config.apiBaseUrl}/create-payout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: Math.round(earnings.totalEarnings * 100),
                    currency: this.config.defaultCurrency
                })
            });

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error);
            }

            if (result.success) {
                alert('Payout initiated successfully! You will receive payment within 3-5 business days.');
                // Refresh earnings display
                if (window.app?.showEarningsDashboard) {
                    window.app.showEarningsDashboard();
                }
            } else {
                throw new Error('Payout failed');
            }

        } catch (error) {
            console.error('Payout error:', error);
            alert('Failed to request payout: ' + error.message);
        } finally {
            this.hideLoadingState('payout');
        }
    }

    // Get user earnings
    async getUserEarnings() {
        try {
            if (window.app?.currentUser) {
                const earningsRef = window.db.collection('earnings').doc(window.app.currentUser.uid);
                const earningsDoc = await earningsRef.get();
                
                if (earningsDoc.exists) {
                    return earningsDoc.data();
                }
            }
            return { totalEarnings: 0, monthlyEarnings: 0 };
        } catch (error) {
            console.error('Error getting earnings:', error);
            return { totalEarnings: 0, monthlyEarnings: 0 };
        }
    }

    // Show loading state
    showLoadingState(type) {
        const button = document.querySelector(`[data-loading="${type}"]`);
        if (button) {
            button.disabled = true;
            button.textContent = 'Processing...';
        }
    }

    // Hide loading state
    hideLoadingState(type) {
        const button = document.querySelector(`[data-loading="${type}"]`);
        if (button) {
            button.disabled = false;
            button.textContent = button.getAttribute('data-original-text') || 'Submit';
        }
    }

    // Handle successful payment
    async handlePaymentSuccess(sessionId) {
        try {
            const response = await fetch(`${this.config.apiBaseUrl}/payment-success`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: sessionId })
            });

            const result = await response.json();

            if (result.success) {
                console.log('Payment processed successfully');
                // Update UI or redirect as needed
            }
        } catch (error) {
            console.error('Error handling payment success:', error);
        }
    }
}

// Initialize Stripe integration when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.stripeIntegration = new StripeIntegration();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StripeIntegration;
}
