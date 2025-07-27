class StripeVercelBackend {
    constructor() {
        this.stripe = Stripe('pk_live_51RpT30LHe1RTUAGqdJuiy1GWpobWJYGHMUBeiORdbz6OUwlqoaunI2cct8p51kGncr12b5X5axqYNzCELk80MijH00P4VABBtD');
        this.backendUrl = 'https://your-vercel-app.vercel.app/api'; // You'll update this after deployment
        
        this.config = {
            currency: 'usd',
            minimumTipAmount: 0.50,
            successUrl: window.location.origin + '/success.html',
            cancelUrl: window.location.origin + '/cancel.html'
        };
        
        console.log('Stripe Vercel Backend initialized successfully');
    }

    async sendTip(recipientId, recipientName) {
        try {
            const amountInput = document.querySelector('#customTipAmount');
            const message = ""; // No message input in current HTML
            
            const amount = parseFloat(amountInput.value);

            if (!amount || amount < this.config.minimumTipAmount) {
                alert(`Minimum tip amount is $${this.config.minimumTipAmount}`);
                return;
            }

            // Create payment intent via Vercel backend
            const response = await fetch(`${this.backendUrl}/create-payment-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount,
                    currency: this.config.currency,
                    description: `Tip to ${recipientName}`,
                    recipientId,
                    recipientName
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create payment intent');
            }

            const { clientSecret } = await response.json();

            // Show payment form with Stripe Elements
            this.showPaymentForm(clientSecret, amount, recipientName);

        } catch (error) {
            console.error('Tip payment error:', error);
            alert('Payment failed. Please try again.');
        }
    }

    async createSubscription(customerEmail, priceId, customerId = null) {
        try {
            const response = await fetch(`${this.backendUrl}/create-subscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerEmail,
                    priceId,
                    customerId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create subscription');
            }

            const { clientSecret, subscriptionId, customerId: newCustomerId } = await response.json();

            // Show subscription payment form
            this.showSubscriptionForm(clientSecret, subscriptionId, newCustomerId);

        } catch (error) {
            console.error('Subscription error:', error);
            alert('Subscription failed. Please try again.');
        }
    }

    showPaymentForm(clientSecret, amount, recipientName) {
        // Create modal for payment
        const modal = document.createElement('div');
        modal.className = 'payment-modal';
        modal.innerHTML = `
            <div class="payment-content">
                <h3>Complete Payment</h3>
                <p>Tip to ${recipientName}: $${amount.toFixed(2)}</p>
                <div id="card-element"></div>
                <div id="card-errors" class="error-message"></div>
                <button id="submit-payment">Pay $${amount.toFixed(2)}</button>
                <button id="cancel-payment">Cancel</button>
            </div>
        `;

        document.body.appendChild(modal);

        // Create Stripe Elements
        const elements = this.stripe.elements();
        const cardElement = elements.create('card');
        cardElement.mount('#card-element');

        // Handle form submission
        const submitButton = document.getElementById('submit-payment');
        const cancelButton = document.getElementById('cancel-payment');

        submitButton.addEventListener('click', async () => {
            submitButton.disabled = true;
            submitButton.textContent = 'Processing...';

            const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                }
            });

            if (error) {
                document.getElementById('card-errors').textContent = error.message;
                submitButton.disabled = false;
                submitButton.textContent = `Pay $${amount.toFixed(2)}`;
            } else {
                // Payment successful
                alert('Payment successful! Thank you for your tip.');
                document.body.removeChild(modal);
                
                // Close tip modal
                const tipModal = document.querySelector('.modal');
                if (tipModal) {
                    tipModal.remove();
                }
            }
        });

        cancelButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    showSubscriptionForm(clientSecret, subscriptionId, customerId) {
        // Similar to payment form but for subscriptions
        const modal = document.createElement('div');
        modal.className = 'subscription-modal';
        modal.innerHTML = `
            <div class="subscription-content">
                <h3>Complete Subscription</h3>
                <div id="card-element"></div>
                <div id="card-errors" class="error-message"></div>
                <button id="submit-subscription">Subscribe</button>
                <button id="cancel-subscription">Cancel</button>
            </div>
        `;

        document.body.appendChild(modal);

        const elements = this.stripe.elements();
        const cardElement = elements.create('card');
        cardElement.mount('#card-element');

        const submitButton = document.getElementById('submit-subscription');
        const cancelButton = document.getElementById('cancel-subscription');

        submitButton.addEventListener('click', async () => {
            submitButton.disabled = true;
            submitButton.textContent = 'Processing...';

            const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                }
            });

            if (error) {
                document.getElementById('card-errors').textContent = error.message;
                submitButton.disabled = false;
                submitButton.textContent = 'Subscribe';
            } else {
                alert('Subscription successful! Welcome to Amplifi Premium.');
                document.body.removeChild(modal);
            }
        });

        cancelButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }
}

// Add CSS for payment modal
const style = document.createElement('style');
style.textContent = `
    .payment-modal, .subscription-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    }
    
    .payment-content, .subscription-content {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        max-width: 400px;
        width: 90%;
    }
    
    #card-element {
        border: 1px solid #ccc;
        padding: 12px;
        border-radius: 4px;
        margin: 1rem 0;
    }
    
    .error-message {
        color: red;
        margin: 0.5rem 0;
    }
    
    button {
        background: #007bff;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        margin: 0.5rem;
    }
    
    button:disabled {
        background: #ccc;
        cursor: not-allowed;
    }
    
    #cancel-payment, #cancel-subscription {
        background: #6c757d;
    }
`;
document.head.appendChild(style);

// Export for global use
window.StripeVercelBackend = StripeVercelBackend; 