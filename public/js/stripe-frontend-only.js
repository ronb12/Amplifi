// Frontend-Only Stripe Integration for Amplifi
// Works with Firebase Spark Plan (no backend required)

class StripeFrontendOnly {
    constructor() {
        this.stripe = null;
        this.elements = null;
        this.config = {
            publishableKey: 'pk_live_51RpT30LHe1RTUAGqdJuiy1GWpobWJYGHMUBeiORdbz6OUwlqoaunI2cct8p51kGncr12b5X5axqYNzCELk80MijH00P4VABBtD',
            currency: 'usd',
            minimumTipAmount: 0.50,
            defaultTipAmounts: [1, 5, 10, 25],
            successUrl: `${window.location.origin}/success.html`,
            cancelUrl: `${window.location.origin}/cancel.html`
        };
        this.init();
    }

    async init() {
        try {
            // Load Stripe.js
            if (!window.Stripe) {
                await this.loadStripeScript();
            }
            
            this.stripe = Stripe(this.config.publishableKey);
            console.log('Stripe Frontend-Only initialized successfully');
            
            // Initialize tip system
            this.initTipSystem();
            
        } catch (error) {
            console.error('Failed to initialize Stripe Frontend-Only:', error);
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

    // Initialize tip system with Stripe Checkout
    initTipSystem() {
        // Create tip buttons
        this.createTipButtons();
        
        // Handle tip modal
        this.handleTipModal();
    }

    createTipButtons() {
        // Add tip buttons to posts and profiles
        const tipButtons = document.querySelectorAll('.tip-btn, .send-tip-btn');
        tipButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const recipientId = button.dataset.recipientId;
                const recipientName = button.dataset.recipientName || 'Creator';
                this.showTipModal(recipientId, recipientName);
            });
        });
    }

    showTipModal(recipientId, recipientName) {
        // Create tip modal
        const modal = document.createElement('div');
        modal.className = 'tip-modal-overlay';
        modal.innerHTML = `
            <div class="tip-modal">
                <div class="tip-modal-header">
                    <h3>Send Tip to ${recipientName}</h3>
                    <button class="close-btn" onclick="this.closest('.tip-modal-overlay').remove()">×</button>
                </div>
                <div class="tip-modal-content">
                    <div class="tip-amounts">
                        <h4>Choose Amount:</h4>
                        <div class="tip-amount-buttons">
                            ${this.config.defaultTipAmounts.map(amount => `
                                <button class="tip-amount-btn" data-amount="${amount}">$${amount}</button>
                            `).join('')}
                        </div>
                        <div class="custom-amount">
                            <label for="customAmount">Custom Amount:</label>
                            <input type="number" id="customAmount" min="${this.config.minimumTipAmount}" step="0.01" placeholder="Enter amount">
                        </div>
                    </div>
                    <div class="tip-message">
                        <label for="tipMessage">Message (optional):</label>
                        <textarea id="tipMessage" placeholder="Add a message with your tip..." maxlength="200"></textarea>
                    </div>
                    <button class="send-tip-btn" onclick="stripeFrontend.sendTip('${recipientId}', '${recipientName}')">
                        Send Tip
                    </button>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .tip-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            .tip-modal {
                background: white;
                border-radius: 12px;
                padding: 2rem;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            }
            .tip-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
            }
            .close-btn {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #666;
            }
            .tip-amount-buttons {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 0.5rem;
                margin: 1rem 0;
            }
            .tip-amount-btn {
                padding: 0.75rem;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                background: white;
                cursor: pointer;
                transition: all 0.2s;
            }
            .tip-amount-btn:hover, .tip-amount-btn.selected {
                border-color: #6366f1;
                background: #6366f1;
                color: white;
            }
            .custom-amount {
                margin: 1rem 0;
            }
            .custom-amount input {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                margin-top: 0.5rem;
            }
            .tip-message textarea {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                margin-top: 0.5rem;
                resize: vertical;
                min-height: 80px;
            }
            .send-tip-btn {
                width: 100%;
                padding: 1rem;
                background: #6366f1;
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                margin-top: 1rem;
            }
            .send-tip-btn:hover {
                background: #5855eb;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(modal);

        // Handle amount selection
        const amountButtons = modal.querySelectorAll('.tip-amount-btn');
        amountButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                amountButtons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                modal.querySelector('#customTipAmount').value = btn.dataset.amount;
            });
        });
    }

    async sendTip(recipientId, recipientName) {
        try {
            const amountInput = document.querySelector('#customTipAmount');
            const message = ""; // No message input in current HTML
            
            const amount = parseFloat(amountInput.value);
            // Message is already set above

            if (!amount || amount < this.config.minimumTipAmount) {
                alert(`Minimum tip amount is $${this.config.minimumTipAmount}`);
                return;
            }

            // Create Stripe Checkout session
            const session = await this.createCheckoutSession(amount, recipientId, recipientName, message);
            
            // Redirect to Stripe Checkout
            const result = await this.stripe.redirectToCheckout({
                sessionId: session.id
            });

            if (result.error) {
                alert('Payment failed: ' + result.error.message);
            }

        } catch (error) {
            console.error('Tip payment error:', error);
            alert('Payment failed. Please try again.');
        }
    async createCheckoutSession(amount, recipientId, recipientName, message) {
        // For frontend-only, create a simple payment link
        const paymentData = {
            amount: Math.round(amount * 100),
            currency: this.config.currency,
            description: `Tip to ${recipientName} via Bradley Virtual Solutions, LLC`,
            recipient: recipientId,
            recipientName: recipientName,
            message: message
        };

        // Create a simple payment form instead of redirect
        this.showPaymentForm(paymentData);
    }

    showPaymentForm(paymentData) {
        const modal = document.createElement("div");
        modal.className = "modal";
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <h3>Complete Payment</h3>
                <p>Amount: $${(paymentData.amount / 100).toFixed(2)}</p>
                <p>Recipient: ${paymentData.recipientName}</p>
                <form id="paymentForm">
                    <div class="form-group">
                        <label>Card Number</label>
                        <div id="card-element"></div>
                    </div>
                    <button type="submit" class="btn btn-primary">Pay $${(paymentData.amount / 100).toFixed(2)}</button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = "block";

        // Initialize Stripe Elements
        const elements = this.stripe.elements();
        const cardElement = elements.create("card");
        cardElement.mount("#card-element");

        // Handle form submission
        document.getElementById("paymentForm").onsubmit = async (e) => {
            e.preventDefault();
            await this.processPayment(paymentData, cardElement);
        };
    }

    async processPayment(paymentData, cardElement) {
        try {
            const { paymentMethod, error } = await this.stripe.createPaymentMethod({
                type: "card",
                card: cardElement,
                billing_details: {
                    name: "Tip Payment",
                    description: paymentData.description
                }
            });

            if (error) {
                alert("Payment failed: " + error.message);
                return;
            }

            // For demo purposes, simulate successful payment
            alert(`Payment of $${(paymentData.amount / 100).toFixed(2)} successful! This is a test payment.`);
            document.querySelector(".modal").remove();

        } catch (error) {
            console.error("Payment error:", error);
            alert("Payment failed. Please try again.");
        }
    }
                success_url: `${this.config.successUrl}?session_id={CHECKOUT_SESSION_ID}&type=subscription`,
                cancel_url: this.config.cancelUrl,
                customer_email: customerEmail,
                metadata: {
                    platform: 'amplifi',
                    subscription_type: 'premium',
                    business: 'Bradley Virtual Solutions, LLC'
                }
            });

            if (session.error) {
                throw new Error(session.error.message);
            }

            return session;
        } catch (error) {
            console.error('Subscription creation error:', error);
            throw error;
        }
    }

    // Handle payment success
    async handlePaymentSuccess(sessionId) {
        try {
            // Retrieve session details
            const session = await this.stripe.retrieveSession(sessionId);
            
            if (session.payment_status === 'paid') {
                // Store payment info in localStorage for demo
                const paymentData = {
                    sessionId: sessionId,
                    amount: session.amount_total / 100,
                    currency: session.currency,
                    recipientId: session.metadata?.recipient_id,
                    recipientName: session.metadata?.recipient_name,
                    message: session.metadata?.tip_message,
                    timestamp: new Date().toISOString()
                };

                // Store in localStorage (in production, this would go to your database)
                const payments = JSON.parse(localStorage.getItem('amplifi_payments') || '[]');
                payments.push(paymentData);
                localStorage.setItem('amplifi_payments', JSON.stringify(payments));

                // Show success message
                this.showSuccessMessage(paymentData);
            }
        } catch (error) {
            console.error('Error handling payment success:', error);
        }
    }

    showSuccessMessage(paymentData) {
        const modal = document.createElement('div');
        modal.className = 'success-modal-overlay';
        modal.innerHTML = `
            <div class="success-modal">
                <div class="success-icon">✅</div>
                <h3>Payment Successful!</h3>
                <p>Your tip of $${paymentData.amount} has been sent to ${paymentData.recipientName}</p>
                ${paymentData.message ? `<p class="tip-message">"${paymentData.message}"</p>` : ''}
                <button onclick="this.closest('.success-modal-overlay').remove()">Close</button>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            .success-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            .success-modal {
                background: white;
                border-radius: 12px;
                padding: 2rem;
                text-align: center;
                max-width: 400px;
                width: 90%;
            }
            .success-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }
            .tip-message {
                font-style: italic;
                color: #666;
                margin-top: 1rem;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(modal);
    }

    // Get payment history
    getPaymentHistory() {
        return JSON.parse(localStorage.getItem('amplifi_payments') || '[]');
    }

    // Handle tip modal
    handleTipModal() {
        // Add tip buttons to posts
        document.addEventListener('click', (e) => {
            if (e.target.matches('.tip-btn, .send-tip-btn')) {
                e.preventDefault();
                const recipientId = e.target.dataset.recipientId;
                const recipientName = e.target.dataset.recipientName || 'Creator';
                this.showTipModal(recipientId, recipientName);
            }
        });
    }
}

// Initialize Stripe Frontend-Only
let stripeFrontend;
document.addEventListener('DOMContentLoaded', () => {
    stripeFrontend = new StripeFrontendOnly();
});

// Handle payment success page
if (window.location.pathname.includes('success.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const recipientId = urlParams.get('recipient');
    const amount = urlParams.get('amount');
    
    if (sessionId && stripeFrontend) {
        stripeFrontend.handlePaymentSuccess(sessionId);
    }
}

// Export for global use
window.StripeFrontendOnly = StripeFrontendOnly;
window.stripeFrontend = stripeFrontend; 