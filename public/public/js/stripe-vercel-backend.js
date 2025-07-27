class StripeVercelBackend {
    constructor() {
        this.stripe = Stripe('pk_live_51RpT30LHe1RTUAGqdJuiy1GWpobWJYGHMUBeiORdbz6OUwlqoaunI2cct8p51kGncr12b5X5axqYNzCELk80MijH00P4VABBtD');
        this.backendUrl = 'https://vercel-stripe-backend-fk9tra2v7-ronell-bradleys-projects.vercel.app/api';
        
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
        modal.className = 'payment-modal-overlay';
        modal.innerHTML = `
            <div class="payment-modal">
                <div class="payment-header">
                    <div class="payment-logo">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                        <span>Amplifi</span>
                    </div>
                    <button class="close-payment" aria-label="Close payment modal">×</button>
                </div>
                
                <div class="payment-body">
                    <div class="payment-summary">
                        <div class="recipient-info">
                            <div class="recipient-avatar">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                            </div>
                            <div class="recipient-details">
                                <h3>Tip to ${recipientName}</h3>
                                <p>Support this creator</p>
                            </div>
                        </div>
                        
                        <div class="payment-amount">
                            <span class="amount-label">Amount</span>
                            <span class="amount-value">$${amount.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="payment-form">
                        <div class="form-section">
                            <label for="card-element">Payment Information</label>
                            <div id="card-element" class="card-input"></div>
                            <div id="card-errors" class="error-message"></div>
                        </div>
                        
                        <div class="security-info">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                            <span>Your payment is secure and encrypted</span>
                        </div>
                    </div>
                </div>
                
                <div class="payment-footer">
                    <button id="cancel-payment" class="btn-secondary">Cancel</button>
                    <button id="submit-payment" class="btn-primary">
                        <span class="btn-text">Pay $${amount.toFixed(2)}</span>
                        <span class="btn-loading" style="display: none;">
                            <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 12a9 9 0 11-6.219-8.56"/>
                            </svg>
                            Processing...
                        </span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add CSS for the new modal
        const style = document.createElement('style');
        style.textContent = `
            .payment-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(8px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease-out;
            }
            
            .payment-modal {
                background: white;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                width: 90%;
                max-width: 480px;
                max-height: 90vh;
                overflow: hidden;
                animation: slideUp 0.3s ease-out;
            }
            
            .payment-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 24px 24px 0;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .payment-logo {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 600;
                color: #1a1a1a;
            }
            
            .close-payment {
                background: none;
                border: none;
                font-size: 24px;
                color: #666;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.2s;
            }
            
            .close-payment:hover {
                background: #f5f5f5;
                color: #333;
            }
            
            .payment-body {
                padding: 24px;
            }
            
            .payment-summary {
                margin-bottom: 32px;
            }
            
            .recipient-info {
                display: flex;
                align-items: center;
                gap: 16px;
                margin-bottom: 24px;
                padding: 16px;
                background: #f8f9fa;
                border-radius: 12px;
            }
            
            .recipient-avatar {
                color: #6b7280;
            }
            
            .recipient-details h3 {
                margin: 0 0 4px 0;
                font-size: 18px;
                font-weight: 600;
                color: #1a1a1a;
            }
            
            .recipient-details p {
                margin: 0;
                color: #6b7280;
                font-size: 14px;
            }
            
            .payment-amount {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px;
                background: #f0f9ff;
                border: 1px solid #bae6fd;
                border-radius: 12px;
            }
            
            .amount-label {
                font-size: 14px;
                color: #0369a1;
                font-weight: 500;
            }
            
            .amount-value {
                font-size: 24px;
                font-weight: 700;
                color: #0369a1;
            }
            
            .payment-form {
                margin-bottom: 24px;
            }
            
            .form-section {
                margin-bottom: 20px;
            }
            
            .form-section label {
                display: block;
                margin-bottom: 8px;
                font-weight: 500;
                color: #374151;
                font-size: 14px;
            }
            
            .card-input {
                padding: 12px 16px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                background: white;
                transition: border-color 0.2s;
            }
            
            .card-input:focus-within {
                border-color: #3b82f6;
            }
            
            .error-message {
                color: #dc2626;
                font-size: 14px;
                margin-top: 8px;
                min-height: 20px;
            }
            
            .security-info {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #6b7280;
                font-size: 12px;
                padding: 12px;
                background: #f9fafb;
                border-radius: 8px;
            }
            
            .payment-footer {
                display: flex;
                gap: 12px;
                padding: 24px;
                border-top: 1px solid #f0f0f0;
                background: #fafafa;
            }
            
            .btn-primary, .btn-secondary {
                flex: 1;
                padding: 14px 24px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            
            .btn-primary {
                background: #3b82f6;
                color: white;
            }
            
            .btn-primary:hover:not(:disabled) {
                background: #2563eb;
                transform: translateY(-1px);
            }
            
            .btn-primary:disabled {
                background: #9ca3af;
                cursor: not-allowed;
                transform: none;
            }
            
            .btn-secondary {
                background: white;
                color: #374151;
                border: 1px solid #d1d5db;
            }
            
            .btn-secondary:hover {
                background: #f9fafb;
                border-color: #9ca3af;
            }
            
            .spinner {
                animation: spin 1s linear infinite;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from { 
                    opacity: 0;
                    transform: translateY(20px) scale(0.95);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            .payment-success {
                text-align: center;
                padding: 40px 24px;
            }
            
            .success-icon {
                width: 64px;
                height: 64px;
                background: #10b981;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 24px;
                animation: successPulse 0.6s ease-out;
            }
            
            @keyframes successPulse {
                0% { transform: scale(0); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);

        // Create Stripe Elements
        const elements = this.stripe.elements({
            appearance: {
                theme: 'stripe',
                variables: {
                    colorPrimary: '#3b82f6',
                    colorBackground: '#ffffff',
                    colorText: '#1a1a1a',
                    colorDanger: '#dc2626',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    spacingUnit: '4px',
                    borderRadius: '8px'
                }
            }
        });
        
        const cardElement = elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#1a1a1a',
                    '::placeholder': {
                        color: '#9ca3af'
                    }
                }
            }
        });
        cardElement.mount('#card-element');

        // Handle form submission
        const submitButton = document.getElementById('submit-payment');
        const cancelButton = document.getElementById('cancel-payment');
        const closeButton = document.querySelector('.close-payment');

        submitButton.addEventListener('click', async () => {
            const btnText = submitButton.querySelector('.btn-text');
            const btnLoading = submitButton.querySelector('.btn-loading');
            
            submitButton.disabled = true;
            btnText.style.display = 'none';
            btnLoading.style.display = 'flex';

            const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                }
            });

            if (error) {
                document.getElementById('card-errors').textContent = error.message;
                submitButton.disabled = false;
                btnText.style.display = 'flex';
                btnLoading.style.display = 'none';
            } else {
                // Payment successful - show success state
                const paymentBody = document.querySelector('.payment-body');
                const paymentFooter = document.querySelector('.payment-footer');
                
                paymentBody.innerHTML = `
                    <div class="payment-success">
                        <div class="success-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" color="white">
                                <polyline points="20,6 9,17 4,12"/>
                            </svg>
                        </div>
                        <h3>Payment Successful!</h3>
                        <p>Thank you for your tip of $${amount.toFixed(2)} to ${recipientName}</p>
                        <p style="color: #6b7280; font-size: 14px;">Your payment has been processed securely</p>
                    </div>
                `;
                
                paymentFooter.innerHTML = `
                    <button id="close-success" class="btn-primary" style="flex: 1;">
                        Close
                    </button>
                `;
                
                document.getElementById('close-success').addEventListener('click', () => {
                    document.body.removeChild(modal);
                    // Close tip modal
                    const tipModal = document.querySelector('.modal');
                    if (tipModal) {
                        tipModal.remove();
                    }
                });
            }
        });

        cancelButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
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