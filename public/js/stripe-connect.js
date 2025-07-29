class StripeConnect {
    constructor() {
        this.backendUrl = 'https://vercel-stripe-backend-nu9gt5h2c-ronell-bradleys-projects.vercel.app/api';
        this.currentUser = firebase.auth().currentUser;
    }

    async init() {
        // Get current user from Firebase
        this.currentUser = firebase.auth().currentUser;
        if (!this.currentUser) {
            console.error('No authenticated user found');
            return false;
        }
        return true;
    }

    // Create Stripe Connect account for creator
    async createCreatorAccount(email) {
        try {
            // Ensure we have the current user
            if (!this.currentUser) {
                this.currentUser = firebase.auth().currentUser;
                if (!this.currentUser) {
                    throw new Error('No authenticated user found');
                }
            }

            console.log('Creating creator account for:', this.currentUser.email);

            const response = await fetch(`${this.backendUrl}/create-account-link`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    creatorId: this.currentUser.uid,
                    email: email || this.currentUser.email,
                    returnUrl: `${window.location.origin}/dashboard?success=true`
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Account creation error:', errorData);
                
                // Handle specific error cases
                if (errorData.error && errorData.error.includes('Connect')) {
                    throw new Error('Stripe Connect needs to be enabled. Please contact support to set up Connect for your account.');
                }
                
                if (errorData.error && errorData.error.includes('platform-profile')) {
                    throw new Error('Stripe Connect platform profile needs to be completed. Please complete your platform profile in the Stripe Dashboard first.');
                }
                
                if (errorData.error && errorData.error.includes('responsibilities')) {
                    throw new Error('Stripe Connect platform setup needs to be completed. Please review and complete your platform profile in the Stripe Dashboard.');
                }
                
                throw new Error(`Failed to create account: ${errorData.error || response.statusText}`);
            }

            const data = await response.json();
            console.log('Account created successfully:', data);

            // Open the account link in a new window
            window.open(data.accountLink, '_blank');

            // Show success message
            alert('Stripe Connect setup initiated! Check the new window to complete your account setup.');

        } catch (error) {
            console.error('Error creating creator account:', error);
            alert(`Setup failed: ${error.message}`);
        }
    }

    // Check creator's account status
    async getAccountStatus() {
        try {
            // Ensure we have the current user
            if (!this.currentUser) {
                this.currentUser = firebase.auth().currentUser;
                if (!this.currentUser) {
                    throw new Error('No authenticated user found');
                }
            }

            const response = await fetch(`${this.backendUrl}/get-account-status?creatorId=${this.currentUser.uid}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Account status:', data);
            return data;

        } catch (error) {
            console.error('Error getting account status:', error);
            throw error;
        }
    }

    // Transfer money to creator (called by payment processor)
    async transferToCreator(amount, description = 'Tip payment') {
        try {
            // Ensure we have the current user
            if (!this.currentUser) {
                this.currentUser = firebase.auth().currentUser;
                if (!this.currentUser) {
                    throw new Error('No authenticated user found');
                }
            }

            const response = await fetch(`${this.backendUrl}/create-transfer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    creatorId: this.currentUser.uid,
                    amount: amount,
                    currency: 'usd',
                    description: description
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Transfer created:', data);
            return data;

        } catch (error) {
            console.error('Error creating transfer:', error);
            throw error;
        }
    }

    // Show creator onboarding modal
    showCreatorOnboarding() {
        const modal = document.createElement('div');
        modal.className = 'stripe-connect-modal';
        modal.innerHTML = `
            <div class="stripe-connect-content">
                <div class="stripe-connect-header">
                    <h3>💰 Set Up Creator Payments</h3>
                    <p>Connect your Stripe account to receive tips directly</p>
                </div>
                
                <div class="stripe-connect-steps">
                    <div class="step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h4>Create Stripe Account</h4>
                            <p>Set up your business information and payment methods</p>
                        </div>
                    </div>
                    
                    <div class="step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h4>Add Payment Methods</h4>
                            <p>Connect bank account or debit card for instant payouts</p>
                        </div>
                    </div>
                    
                    <div class="step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h4>Start Receiving Tips</h4>
                            <p>Money goes directly to your bank or debit card</p>
                        </div>
                    </div>
                </div>

                <div class="payout-options">
                    <h4>🎯 Payout Options Available:</h4>
                    <div class="payout-methods">
                        <div class="payout-method">
                            <span class="method-icon">🏦</span>
                            <span class="method-name">Bank Account (ACH)</span>
                            <span class="method-desc">2-3 business days</span>
                        </div>
                        <div class="payout-method">
                            <span class="method-icon">💳</span>
                            <span class="method-name">Debit Card</span>
                            <span class="method-desc">Instant or same-day</span>
                        </div>
                        <div class="payout-method">
                            <span class="method-icon">⚡</span>
                            <span class="method-name">Instant Payouts</span>
                            <span class="method-desc">Available for eligible cards</span>
                        </div>
                    </div>
                </div>
                
                <div class="stripe-connect-actions">
                    <button id="setup-stripe-connect" class="btn-primary">
                        🚀 Set Up Stripe Account
                    </button>
                    <button id="cancel-stripe-connect" class="btn-secondary">
                        Maybe Later
                    </button>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .stripe-connect-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            
            .stripe-connect-content {
                background: white;
                border-radius: 16px;
                padding: 32px;
                max-width: 600px;
                width: 90%;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                max-height: 90vh;
                overflow-y: auto;
            }
            
            .stripe-connect-header {
                text-align: center;
                margin-bottom: 32px;
            }
            
            .stripe-connect-header h3 {
                margin: 0 0 8px 0;
                color: #1a1a1a;
                font-size: 24px;
            }
            
            .stripe-connect-header p {
                margin: 0;
                color: #6b7280;
                font-size: 16px;
            }
            
            .stripe-connect-steps {
                margin-bottom: 32px;
            }
            
            .step {
                display: flex;
                align-items: flex-start;
                gap: 16px;
                margin-bottom: 20px;
            }
            
            .step-number {
                width: 32px;
                height: 32px;
                background: #3b82f6;
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                flex-shrink: 0;
            }
            
            .step-content h4 {
                margin: 0 0 4px 0;
                color: #1a1a1a;
                font-size: 16px;
            }
            
            .step-content p {
                margin: 0;
                color: #6b7280;
                font-size: 14px;
            }

            .payout-options {
                background: #f8fafc;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 32px;
            }

            .payout-options h4 {
                margin: 0 0 16px 0;
                color: #1a1a1a;
                font-size: 16px;
                font-weight: 600;
            }

            .payout-methods {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .payout-method {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                background: white;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
            }

            .method-icon {
                font-size: 20px;
                width: 24px;
                text-align: center;
            }

            .method-name {
                font-weight: 500;
                color: #1a1a1a;
                flex: 1;
            }

            .method-desc {
                font-size: 12px;
                color: #6b7280;
                background: #f3f4f6;
                padding: 2px 8px;
                border-radius: 4px;
            }
            
            .stripe-connect-actions {
                display: flex;
                gap: 12px;
            }
            
            .btn-primary {
                background: #3b82f6;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                flex: 1;
            }
            
            .btn-secondary {
                background: #f3f4f6;
                color: #374151;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(modal);

        // Event listeners
        document.getElementById('setup-stripe-connect').addEventListener('click', async () => {
            try {
                await this.createCreatorAccount();
            } catch (error) {
                alert('Error setting up Stripe account: ' + error.message);
            }
        });

        document.getElementById('cancel-stripe-connect').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    // Check if creator needs to set up Stripe Connect
    async checkCreatorSetup() {
        try {
            // Ensure we have the current user
            if (!this.currentUser) {
                this.currentUser = firebase.auth().currentUser;
                if (!this.currentUser) {
                    console.error('No authenticated user found');
                    return false;
                }
            }

            const status = await this.getAccountStatus();
            
            if (!status.hasAccount || status.status !== 'active') {
                // Show onboarding modal
                this.showCreatorOnboarding();
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Error checking creator setup:', error);
            return false;
        }
    }

    // Show payout management options
    async showPayoutManagement() {
        try {
            console.log('showPayoutManagement called');
            console.log('Current user:', this.currentUser);
            
            const status = await this.getAccountStatus();
            console.log('Account status:', status);
            
            if (!status.hasAccount) {
                console.log('No account found, showing onboarding');
                this.showCreatorOnboarding();
                return;
            }

            console.log('Creating payout management modal');
            const modal = document.createElement('div');
            modal.className = 'payout-management-modal';
            modal.innerHTML = `
                <div class="payout-management-content">
                    <div class="payout-header">
                        <h3>💳 Manage Payouts</h3>
                        <p>Configure how you receive your earnings</p>
                    </div>
                    
                    <div class="payout-status">
                        <div class="status-item">
                            <span class="status-label">Account Status:</span>
                            <span class="status-value ${status.status === 'active' ? 'active' : 'pending'}">
                                ${status.status === 'active' ? '✅ Active' : '⏳ Pending'}
                            </span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">Payouts Enabled:</span>
                            <span class="status-value ${status.payoutsEnabled ? 'active' : 'pending'}">
                                ${status.payoutsEnabled ? '✅ Enabled' : '❌ Disabled'}
                            </span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">Tax Documents:</span>
                            <span class="status-value active">
                                ✅ 1099-NEC Available
                            </span>
                        </div>
                    </div>

                    <div class="tax-info">
                        <h4>📊 Tax Information:</h4>
                        <div class="tax-details">
                            <div class="tax-item">
                                <span class="tax-icon">📋</span>
                                <div class="tax-content">
                                    <span class="tax-title">1099-NEC Forms</span>
                                    <span class="tax-desc">Automatically generated for earnings over $600/year</span>
                                </div>
                            </div>
                            <div class="tax-item">
                                <span class="tax-icon">📧</span>
                                <div class="tax-content">
                                    <span class="tax-title">Email Notifications</span>
                                    <span class="tax-desc">You'll receive alerts when tax forms are ready</span>
                                </div>
                            </div>
                            <div class="tax-item">
                                <span class="tax-icon">📁</span>
                                <div class="tax-content">
                                    <span class="tax-title">Stripe Dashboard</span>
                                    <span class="tax-desc">Download tax documents anytime</span>
                                </div>
                            </div>
                            <div class="tax-item">
                                <span class="tax-icon">⚡</span>
                                <div class="tax-content">
                                    <span class="tax-title">IRS Reporting</span>
                                    <span class="tax-desc">Stripe handles all compliance automatically</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="payout-options">
                        <h4>Available Payout Methods:</h4>
                        <div class="payout-methods">
                            <div class="payout-method">
                                <span class="method-icon">🏦</span>
                                <div class="method-info">
                                    <span class="method-name">Bank Account (ACH)</span>
                                    <span class="method-desc">Standard 2-3 business days</span>
                                </div>
                                <button class="method-action" id="add-bank-account">Add</button>
                            </div>
                            <div class="payout-method">
                                <span class="method-icon">💳</span>
                                <div class="method-info">
                                    <span class="method-name">Debit Card</span>
                                    <span class="method-desc">Instant or same-day transfers</span>
                                </div>
                                <button class="method-action" id="add-debit-card">Add</button>
                            </div>
                            <div class="payout-method">
                                <span class="method-icon">⚡</span>
                                <div class="method-info">
                                    <span class="method-name">Instant Payouts</span>
                                    <span class="method-desc">Same-day for eligible cards</span>
                                </div>
                                <button class="method-action" id="enable-instant-payouts">Enable</button>
                            </div>
                        </div>
                    </div>

                    <div class="payout-actions">
                        <button id="manage-stripe-dashboard" class="btn-primary">
                            🎛️ Manage in Stripe Dashboard
                        </button>
                        <button id="close-payout-management" class="btn-secondary">
                            Close
                        </button>
                    </div>
                </div>
            `;

            // Add styles
            const style = document.createElement('style');
            style.textContent = `
                .payout-management-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                }
                
                .payout-management-content {
                    background: white;
                    border-radius: 16px;
                    padding: 32px;
                    max-width: 600px;
                    width: 90%;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    max-height: 90vh;
                    overflow-y: auto;
                }
                
                .payout-header {
                    text-align: center;
                    margin-bottom: 32px;
                }
                
                .payout-header h3 {
                    margin: 0 0 8px 0;
                    color: #1a1a1a;
                    font-size: 24px;
                }
                
                .payout-header p {
                    margin: 0;
                    color: #6b7280;
                    font-size: 16px;
                }

                .payout-status {
                    background: #f8fafc;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 24px;
                }

                .status-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .status-item:last-child {
                    margin-bottom: 0;
                }

                .status-label {
                    font-weight: 500;
                    color: #374151;
                }

                .status-value {
                    font-weight: 600;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 14px;
                }

                .status-value.active {
                    background: #dcfce7;
                    color: #166534;
                }

                .status-value.pending {
                    background: #fef3c7;
                    color: #92400e;
                }

                .tax-info {
                    background: #f8fafc;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 24px;
                }

                .tax-info h4 {
                    margin: 0 0 16px 0;
                    color: #1a1a1a;
                    font-size: 16px;
                    font-weight: 600;
                }

                .tax-details {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .tax-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: white;
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                }

                .tax-icon {
                    font-size: 24px;
                    width: 32px;
                    text-align: center;
                }

                .tax-content {
                    flex: 1;
                }

                .tax-title {
                    display: block;
                    font-weight: 500;
                    color: #1a1a1a;
                    margin-bottom: 4px;
                }

                .tax-desc {
                    font-size: 12px;
                    color: #6b7280;
                }

                .payout-options h4 {
                    margin: 0 0 16px 0;
                    color: #1a1a1a;
                    font-size: 16px;
                    font-weight: 600;
                }

                .payout-methods {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 24px;
                }

                .payout-method {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                }

                .method-icon {
                    font-size: 24px;
                    width: 32px;
                    text-align: center;
                }

                .method-info {
                    flex: 1;
                }

                .method-name {
                    display: block;
                    font-weight: 500;
                    color: #1a1a1a;
                    margin-bottom: 4px;
                }

                .method-desc {
                    font-size: 12px;
                    color: #6b7280;
                }

                .method-action {
                    background: #3b82f6;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .method-action:hover {
                    background: #2563eb;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .method-action:active {
                    transform: translateY(0);
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                }

                .payout-actions {
                    display: flex;
                    gap: 12px;
                }
                
                .btn-primary {
                    background: #3b82f6;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    flex: 1;
                }
                
                .btn-secondary {
                    background: #f3f4f6;
                    color: #374151;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                }
            `;
            document.head.appendChild(style);

            document.body.appendChild(modal);

            // Event listeners
            console.log('Adding event listeners');
            document.getElementById('manage-stripe-dashboard').addEventListener('click', () => {
                console.log('Manage Stripe Dashboard clicked');
                // Open Stripe dashboard for the creator
                window.open('https://dashboard.stripe.com/express', '_blank');
            });

            document.getElementById('close-payout-management').addEventListener('click', () => {
                console.log('Close payout management clicked');
                document.body.removeChild(modal);
            });

            // Close on overlay click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    console.log('Overlay clicked, closing modal');
                    document.body.removeChild(modal);
                }
            });

            // Add specific listeners for payout method buttons
            document.getElementById('add-bank-account').addEventListener('click', () => {
                console.log('Add Bank Account clicked');
                this.showBankAccountForm();
            });

            document.getElementById('add-debit-card').addEventListener('click', () => {
                console.log('Add Debit Card clicked');
                this.showDebitCardForm();
            });

            document.getElementById('enable-instant-payouts').addEventListener('click', () => {
                console.log('Enable Instant Payouts clicked');
                this.showInstantPayoutsForm();
            });

            console.log('Payout management modal created successfully');

        } catch (error) {
            console.error('Error showing payout management:', error);
            alert('Error loading payout options: ' + error.message);
        }
    }

    // Show detailed tax information with secure form access
    showTaxInformation() {
        const modal = document.createElement('div');
        modal.className = 'tax-info-modal';
        modal.innerHTML = `
            <div class="tax-info-content">
                <div class="tax-header">
                    <h3>📊 Tax Information & 1099-NEC</h3>
                    <p>Access your tax documents securely</p>
                </div>
                
                <div class="tax-document-section">
                    <h4>📋 Your Tax Documents</h4>
                    <div class="tax-document-status">
                        <div class="status-card">
                            <div class="status-icon">📅</div>
                            <div class="status-content">
                                <h5>1099-NEC Forms</h5>
                                <p>Available January 31st, 2025</p>
                                <div class="status-indicator">
                                    <span class="status-badge pending">⏳ Coming Soon</span>
                                </div>
                            </div>
                        </div>
                        <button id="view-tax-documents" class="tax-docs-btn">
                            📊 View Tax Documents
                        </button>
                    </div>
                </div>
                
                <div class="tax-sections">
                    <div class="tax-section">
                        <h4>📋 1099-NEC Forms</h4>
                        <div class="tax-details">
                            <div class="tax-item">
                                <span class="tax-icon">💰</span>
                                <div class="tax-content">
                                    <span class="tax-title">Earnings Threshold</span>
                                    <span class="tax-desc">1099-NEC forms are automatically generated when you earn $600+ in a year</span>
                                </div>
                            </div>
                            <div class="tax-item">
                                <span class="tax-icon">📅</span>
                                <div class="tax-content">
                                    <span class="tax-title">Form Availability</span>
                                    <span class="tax-desc">Forms are available by January 31st of the following year</span>
                                </div>
                            </div>
                            <div class="tax-item">
                                <span class="tax-icon">🔒</span>
                                <div class="tax-content">
                                    <span class="tax-title">Secure Access</span>
                                    <span class="tax-desc">All documents are encrypted and securely stored by Stripe</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="tax-section">
                        <h4>🏢 Stripe's Tax Responsibilities</h4>
                        <div class="tax-details">
                            <div class="tax-item">
                                <span class="tax-icon">📊</span>
                                <div class="tax-content">
                                    <span class="tax-title">Automatic Reporting</span>
                                    <span class="tax-desc">Stripe reports all earnings to the IRS on your behalf</span>
                                </div>
                            </div>
                            <div class="tax-item">
                                <span class="tax-icon">🔐</span>
                                <div class="tax-content">
                                    <span class="tax-title">Secure Storage</span>
                                    <span class="tax-desc">All tax documents are encrypted and stored securely</span>
                                </div>
                            </div>
                            <div class="tax-item">
                                <span class="tax-icon">⚡</span>
                                <div class="tax-content">
                                    <span class="tax-title">Compliance</span>
                                    <span class="tax-desc">Stripe handles all IRS compliance and reporting requirements</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="tax-section">
                        <h4>👤 Your Tax Responsibilities</h4>
                        <div class="tax-details">
                            <div class="tax-item">
                                <span class="tax-icon">📝</span>
                                <div class="tax-content">
                                    <span class="tax-title">Self-Employment Tax</span>
                                    <span class="tax-desc">You're responsible for paying self-employment taxes (15.3%)</span>
                                </div>
                            </div>
                            <div class="tax-item">
                                <span class="tax-icon">💼</span>
                                <div class="tax-content">
                                    <span class="tax-title">Business Expenses</span>
                                    <span class="tax-desc">Track and deduct legitimate business expenses</span>
                                </div>
                            </div>
                            <div class="tax-item">
                                <span class="tax-icon">📊</span>
                                <div class="tax-content">
                                    <span class="tax-title">Quarterly Payments</span>
                                    <span class="tax-desc">Consider making quarterly estimated tax payments</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="tax-actions">
                    <button id="refresh-tax-docs" class="btn-secondary">
                        🔄 Refresh Documents
                    </button>
                    <button id="open-stripe-tax" class="btn-primary">
                        📊 Open Stripe Tax Dashboard
                    </button>
                    <button id="close-tax-info" class="btn-secondary">
                        Close
                    </button>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .tax-info-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            
            .tax-info-content {
                background: white;
                border-radius: 16px;
                padding: 32px;
                max-width: 800px;
                width: 90%;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                max-height: 90vh;
                overflow-y: auto;
            }
            
            .tax-header {
                text-align: center;
                margin-bottom: 32px;
            }
            
            .tax-header h3 {
                margin: 0 0 8px 0;
                color: #1a1a1a;
                font-size: 24px;
            }
            
            .tax-header p {
                margin: 0;
                color: #6b7280;
                font-size: 16px;
            }

            .tax-document-section {
                background: #f8fafc;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 24px;
            }

            .tax-document-section h4 {
                margin: 0 0 16px 0;
                color: #1a1a1a;
                font-size: 18px;
                font-weight: 600;
            }

            .tax-document-status {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .status-card {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 16px;
                background: white;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
            }

            .status-icon {
                font-size: 24px;
                width: 32px;
                text-align: center;
            }

            .status-content h5 {
                margin: 0 0 4px 0;
                color: #1a1a1a;
                font-size: 16px;
            }

            .status-content p {
                margin: 0;
                color: #6b7280;
                font-size: 14px;
            }

            .status-indicator {
                margin-top: 8px;
            }

            .status-badge {
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
            }

            .status-badge.pending {
                background: #fef3c7;
                color: #92400e;
            }

            .tax-docs-btn {
                background: #3b82f6;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: background-color 0.2s;
            }

            .tax-docs-btn:hover {
                background: #2563eb;
            }

            .tax-docs-btn:active {
                transform: translateY(0);
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            }

            .tax-documents-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .tax-document-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px;
                background: white;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
                transition: all 0.2s ease;
            }

            .tax-document-item:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }

            .document-icon {
                font-size: 24px;
                width: 32px;
                text-align: center;
            }

            .document-info {
                flex: 1;
            }

            .document-title {
                display: block;
                font-weight: 600;
                color: #1a1a1a;
                margin-bottom: 4px;
            }

            .document-desc {
                font-size: 12px;
                color: #6b7280;
            }

            .document-actions {
                display: flex;
                gap: 8px;
            }

            .btn-view-doc {
                background: #3b82f6;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .btn-view-doc:hover {
                background: #2563eb;
                transform: translateY(-1px);
            }

            .btn-download-doc {
                background: #10b981;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .btn-download-doc:hover {
                background: #059669;
                transform: translateY(-1px);
            }

            .loading-tax-docs {
                text-align: center;
                color: #6b7280;
                padding: 20px;
                font-style: italic;
            }

            .no-tax-docs {
                text-align: center;
                color: #6b7280;
                padding: 20px;
                background: #f9fafb;
                border-radius: 8px;
                border: 1px dashed #d1d5db;
            }

            .tax-sections {
                display: flex;
                flex-direction: column;
                gap: 24px;
                margin-bottom: 32px;
            }

            .tax-section {
                background: #f8fafc;
                border-radius: 12px;
                padding: 20px;
            }

            .tax-section h4 {
                margin: 0 0 16px 0;
                color: #1a1a1a;
                font-size: 18px;
                font-weight: 600;
            }

            .tax-details {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .tax-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                background: white;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
            }

            .tax-icon {
                font-size: 24px;
                width: 32px;
                text-align: center;
            }

            .tax-content {
                flex: 1;
            }

            .tax-title {
                display: block;
                font-weight: 500;
                color: #1a1a1a;
                margin-bottom: 4px;
            }

            .tax-desc {
                font-size: 12px;
                color: #6b7280;
            }

            .tax-actions {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
            }
            
            .btn-primary {
                background: #3b82f6;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                flex: 1;
            }
            
            .btn-secondary {
                background: #f3f4f6;
                color: #374151;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(modal);

        // Load tax documents
        this.loadTaxDocuments();

        // Event listeners
        document.getElementById('refresh-tax-docs').addEventListener('click', () => {
            this.loadTaxDocuments();
        });

        document.getElementById('view-tax-documents').addEventListener('click', () => {
            this.openTaxDocumentViewer();
        });

        document.getElementById('open-stripe-tax').addEventListener('click', () => {
            window.open('https://dashboard.stripe.com/express', '_blank');
        });

        document.getElementById('close-tax-info').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    // Load tax documents securely from Stripe
    async loadTaxDocuments() {
        const documentsList = document.getElementById('tax-documents-list');
        if (!documentsList) return;

        documentsList.innerHTML = '<div class="loading-tax-docs">⏳ Loading tax documents...</div>';

        try {
            // Fetch tax documents from our backend (which securely calls Stripe API)
            const response = await fetch(`${this.backendUrl}/get-tax-documents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    creatorId: this.currentUser.uid,
                    email: this.currentUser.email
                })
            });

            if (!response.ok) {
                // If the API endpoint is not available yet, show a helpful message
                if (response.status === 404 || response.status === 503) {
                    documentsList.innerHTML = `
                        <div class="no-tax-docs">
                            <div>📄 Tax documents will be available soon</div>
                            <div style="font-size: 12px; margin-top: 8px;">
                                Documents will appear here when they're ready from Stripe (typically January 31st)
                            </div>
                            <div style="font-size: 11px; margin-top: 8px; color: #9ca3af;">
                                API endpoint coming soon...
                            </div>
                        </div>
                    `;
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.documents && data.documents.length > 0) {
                documentsList.innerHTML = data.documents.map(doc => `
                    <div class="tax-document-item">
                        <div class="document-icon">📄</div>
                        <div class="document-info">
                            <span class="document-title">${doc.title}</span>
                            <span class="document-desc">${doc.description}</span>
                        </div>
                        <div class="document-actions">
                            <button class="btn-view-doc" onclick="window.stripeConnect.viewTaxDocument('${doc.id}')">
                                👁️ View
                            </button>
                            <button class="btn-download-doc" onclick="window.stripeConnect.downloadTaxDocument('${doc.id}')">
                                📥 Download
                            </button>
                        </div>
                    </div>
                `).join('');
            } else {
                documentsList.innerHTML = `
                    <div class="no-tax-docs">
                        <div>📄 No tax documents available yet</div>
                        <div style="font-size: 12px; margin-top: 8px;">
                            Documents will appear here when they're ready from Stripe
                        </div>
                    </div>
                `;
            }

        } catch (error) {
            console.error('Error loading tax documents:', error);
            
            // Show a user-friendly error message
            documentsList.innerHTML = `
                <div class="no-tax-docs">
                    <div>📄 Tax documents will be available soon</div>
                    <div style="font-size: 12px; margin-top: 8px;">
                        Documents will appear here when they're ready from Stripe (typically January 31st)
                    </div>
                    <div style="font-size: 11px; margin-top: 8px; color: #9ca3af;">
                        API endpoint coming soon...
                    </div>
                </div>
            `;
        }
    }

    // View tax document securely
    async viewTaxDocument(documentId) {
        try {
            const response = await fetch(`${this.backendUrl}/view-tax-document`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    creatorId: this.currentUser.uid,
                    documentId: documentId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Open document in a secure viewer
            this.openSecureDocumentViewer(data.documentUrl, data.documentTitle);

        } catch (error) {
            console.error('Error viewing tax document:', error);
            alert('Error viewing document: ' + error.message);
        }
    }

    // Download tax document securely
    async downloadTaxDocument(documentId) {
        try {
            const response = await fetch(`${this.backendUrl}/download-tax-document`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    creatorId: this.currentUser.uid,
                    documentId: documentId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Create secure download link
            const link = document.createElement('a');
            link.href = data.downloadUrl;
            link.download = data.filename;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error('Error downloading tax document:', error);
            alert('Error downloading document: ' + error.message);
        }
    }

    // Open secure document viewer
    openSecureDocumentViewer(documentUrl, documentTitle) {
        const modal = document.createElement('div');
        modal.className = 'document-viewer-modal';
        modal.innerHTML = `
            <div class="document-viewer-content">
                <div class="viewer-header">
                    <h3>📄 ${documentTitle}</h3>
                    <button id="close-viewer" class="close-btn">×</button>
                </div>
                <div class="viewer-body">
                    <iframe src="${documentUrl}" width="100%" height="600px" frameborder="0"></iframe>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .document-viewer-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
            }
            
            .document-viewer-content {
                background: white;
                border-radius: 12px;
                width: 90%;
                height: 90%;
                display: flex;
                flex-direction: column;
            }
            
            .viewer-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .viewer-header h3 {
                margin: 0;
                color: #1a1a1a;
                font-size: 18px;
            }
            
            .close-btn {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #6b7280;
                padding: 0;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background-color 0.2s;
            }
            
            .close-btn:hover {
                background: #f3f4f6;
            }
            
            .viewer-body {
                flex: 1;
                padding: 20px;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(modal);

        // Close button
        document.getElementById('close-viewer').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    // Show bank account setup form
    showBankAccountForm() {
        console.log('showBankAccountForm called');
        const modal = document.createElement('div');
        modal.className = 'payout-form-modal';
        modal.innerHTML = `
            <div class="payout-form-content">
                <div class="form-header">
                    <h3>🏦 Add Bank Account</h3>
                    <p>Set up ACH transfers (2-3 business days)</p>
                </div>
                
                <form id="bank-account-form">
                    <div class="form-group">
                        <label for="account-holder">Account Holder Name</label>
                        <input type="text" id="account-holder" required placeholder="John Doe">
                    </div>
                    
                    <div class="form-group">
                        <label for="routing-number">Routing Number</label>
                        <input type="text" id="routing-number" required placeholder="123456789" maxlength="9">
                        <small>9-digit routing number on your check</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="account-number">Account Number</label>
                        <input type="text" id="account-number" required placeholder="1234567890">
                        <small>Your bank account number</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="account-type">Account Type</label>
                        <select id="account-type" required>
                            <option value="">Select account type</option>
                            <option value="checking">Checking</option>
                            <option value="savings">Savings</option>
                        </select>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">✅ Add Bank Account</button>
                        <button type="button" class="btn-secondary" id="cancel-bank-form">Cancel</button>
                    </div>
                </form>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .payout-form-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
            }
            
            .payout-form-content {
                background: white;
                border-radius: 16px;
                padding: 32px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                max-height: 90vh;
                overflow-y: auto;
            }
            
            .form-header {
                text-align: center;
                margin-bottom: 24px;
            }
            
            .form-header h3 {
                margin: 0 0 8px 0;
                color: #1a1a1a;
                font-size: 24px;
            }
            
            .form-header p {
                margin: 0;
                color: #6b7280;
                font-size: 16px;
            }

            .form-group {
                margin-bottom: 20px;
            }

            .form-group label {
                display: block;
                margin-bottom: 8px;
                font-weight: 500;
                color: #374151;
            }

            .form-group input,
            .form-group select {
                width: 100%;
                padding: 12px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 16px;
                transition: border-color 0.2s;
            }

            .form-group input:focus,
            .form-group select:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .form-group small {
                display: block;
                margin-top: 4px;
                font-size: 12px;
                color: #6b7280;
            }

            .form-actions {
                display: flex;
                gap: 12px;
                margin-top: 24px;
            }
            
            .btn-primary {
                background: #3b82f6;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                flex: 1;
                transition: background-color 0.2s;
            }
            
            .btn-primary:hover {
                background: #2563eb;
            }
            
            .btn-secondary {
                background: #f3f4f6;
                color: #374151;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .btn-secondary:hover {
                background: #e5e7eb;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(modal);
        console.log('Bank account modal added to DOM');

        // Form submission
        document.getElementById('bank-account-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                accountHolder: document.getElementById('account-holder').value,
                routingNumber: document.getElementById('routing-number').value,
                accountNumber: document.getElementById('account-number').value,
                accountType: document.getElementById('account-type').value
            };

            console.log('Bank account form submitted:', formData);
            
            // Simulate processing
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '⏳ Processing...';
            submitBtn.disabled = true;

            try {
                const response = await fetch(`${this.backendUrl}/add-payout-method`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        creatorId: this.currentUser.uid,
                        email: this.currentUser.email,
                        methodType: 'bank_account',
                        methodData: formData
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('Bank account added:', result);
                
                alert('✅ Bank account added successfully! You can now receive ACH transfers.');
                document.body.removeChild(modal);
                
            } catch (error) {
                console.error('Error adding bank account:', error);
                alert('❌ Error adding bank account: ' + error.message);
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });

        // Cancel button
        document.getElementById('cancel-bank-form').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    // Show debit card setup form
    showDebitCardForm() {
        console.log('showDebitCardForm called');
        const modal = document.createElement('div');
        modal.className = 'payout-form-modal';
        modal.innerHTML = `
            <div class="payout-form-content">
                <div class="form-header">
                    <h3>💳 Add Debit Card</h3>
                    <p>Set up instant or same-day transfers</p>
                </div>
                
                <form id="debit-card-form">
                    <div class="form-group">
                        <label for="card-holder">Card Holder Name</label>
                        <input type="text" id="card-holder" required placeholder="John Doe">
                    </div>
                    
                    <div class="form-group">
                        <label for="card-number">Card Number</label>
                        <input type="text" id="card-number" required placeholder="1234 5678 9012 3456" maxlength="19">
                        <small>Your debit card number</small>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="expiry-month">Expiry Month</label>
                            <select id="expiry-month" required>
                                <option value="">MM</option>
                                ${Array.from({length: 12}, (_, i) => `<option value="${String(i + 1).padStart(2, '0')}">${String(i + 1).padStart(2, '0')}</option>`).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="expiry-year">Expiry Year</label>
                            <select id="expiry-year" required>
                                <option value="">YYYY</option>
                                ${Array.from({length: 10}, (_, i) => `<option value="${new Date().getFullYear() + i}">${new Date().getFullYear() + i}</option>`).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="cvv">CVV</label>
                            <input type="text" id="cvv" required placeholder="123" maxlength="4">
                            <small>3-4 digit security code</small>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="billing-zip">Billing ZIP Code</label>
                        <input type="text" id="billing-zip" required placeholder="12345" maxlength="10">
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">✅ Add Debit Card</button>
                        <button type="button" class="btn-secondary" id="cancel-debit-form">Cancel</button>
                    </div>
                </form>
            </div>
        `;

        // Add styles for debit card form
        const style = document.createElement('style');
        style.textContent += `
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 12px;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(modal);

        // Form submission
        document.getElementById('debit-card-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                cardHolder: document.getElementById('card-holder').value,
                cardNumber: document.getElementById('card-number').value.replace(/\s/g, ''),
                expiryMonth: document.getElementById('expiry-month').value,
                expiryYear: document.getElementById('expiry-year').value,
                cvv: document.getElementById('cvv').value,
                billingZip: document.getElementById('billing-zip').value
            };

            console.log('Debit card form submitted:', formData);
            
            // Simulate processing
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '⏳ Processing...';
            submitBtn.disabled = true;

            try {
                const response = await fetch(`${this.backendUrl}/add-payout-method`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        creatorId: this.currentUser.uid,
                        email: this.currentUser.email,
                        methodType: 'debit_card',
                        methodData: formData
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('Debit card added:', result);
                
                alert('✅ Debit card added successfully! You can now receive instant transfers.');
                document.body.removeChild(modal);
                
            } catch (error) {
                console.error('Error adding debit card:', error);
                alert('❌ Error adding debit card: ' + error.message);
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });

        // Cancel button
        document.getElementById('cancel-debit-form').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    // Show instant payouts setup form
    showInstantPayoutsForm() {
        console.log('showInstantPayoutsForm called');
        const modal = document.createElement('div');
        modal.className = 'payout-form-modal';
        modal.innerHTML = `
            <div class="payout-form-content">
                <div class="form-header">
                    <h3>⚡ Enable Instant Payouts</h3>
                    <p>Get your earnings same-day with instant transfers</p>
                </div>
                
                <div class="instant-payouts-info">
                    <div class="info-item">
                        <span class="info-icon">💰</span>
                        <div class="info-content">
                            <h4>Same-Day Transfers</h4>
                            <p>Receive your earnings within hours instead of days</p>
                        </div>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-icon">💳</span>
                        <div class="info-content">
                            <h4>Debit Card Required</h4>
                            <p>Works with most major debit cards</p>
                        </div>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-icon">⚡</span>
                        <div class="info-content">
                            <h4>Instant Access</h4>
                            <p>Access your money immediately when transferred</p>
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-primary" id="enable-instant-btn">✅ Enable Instant Payouts</button>
                    <button type="button" class="btn-secondary" id="cancel-instant-form">Cancel</button>
                </div>
            </div>
        `;

        // Add styles for instant payouts
        const style = document.createElement('style');
        style.textContent += `
            .instant-payouts-info {
                margin: 24px 0;
            }
            
            .info-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px;
                background: #f8fafc;
                border-radius: 8px;
                margin-bottom: 12px;
            }
            
            .info-icon {
                font-size: 24px;
                width: 32px;
                text-align: center;
            }
            
            .info-content h4 {
                margin: 0 0 4px 0;
                color: #1a1a1a;
                font-size: 16px;
            }
            
            .info-content p {
                margin: 0;
                color: #6b7280;
                font-size: 14px;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(modal);

        // Enable instant payouts
        document.getElementById('enable-instant-btn').addEventListener('click', async () => {
            const btn = document.getElementById('enable-instant-btn');
            const originalText = btn.textContent;
            btn.textContent = '⏳ Enabling...';
            btn.disabled = true;

            try {
                const response = await fetch(`${this.backendUrl}/add-payout-method`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        creatorId: this.currentUser.uid,
                        email: this.currentUser.email,
                        methodType: 'instant_payouts',
                        methodData: {}
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('Instant payouts enabled:', result);
                
                alert('✅ Instant payouts enabled successfully! You can now receive same-day transfers.');
                document.body.removeChild(modal);
                
            } catch (error) {
                console.error('Error enabling instant payouts:', error);
                alert('❌ Error enabling instant payouts: ' + error.message);
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });

        // Cancel button
        document.getElementById('cancel-instant-form').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    // Open tax document viewer with availability information
    openTaxDocumentViewer() {
        const modal = document.createElement('div');
        modal.className = 'tax-viewer-modal';
        modal.innerHTML = `
            <div class="tax-viewer-content">
                <div class="viewer-header">
                    <h3>📊 Tax Documents & 1099-NEC Forms</h3>
                    <button id="close-tax-viewer" class="close-btn">×</button>
                </div>
                
                <div class="viewer-body">
                    <div class="availability-section">
                        <div class="availability-card">
                            <div class="availability-icon">📅</div>
                            <div class="availability-content">
                                <h4>Document Availability</h4>
                                <p><strong>1099-NEC Forms:</strong> Available January 31st, 2025</p>
                                <p><strong>Current Status:</strong> <span class="status-badge pending">⏳ Coming Soon</span></p>
                                <p><strong>Earnings Threshold:</strong> $600+ annually</p>
                            </div>
                        </div>
                        
                        <div class="availability-card">
                            <div class="availability-icon">📧</div>
                            <div class="availability-content">
                                <h4>Notifications</h4>
                                <p>You'll receive an email when your tax forms are ready</p>
                                <p>Forms will appear here automatically when available</p>
                            </div>
                        </div>
                        
                        <div class="availability-card">
                            <div class="availability-icon">🔒</div>
                            <div class="availability-content">
                                <h4>Security</h4>
                                <p>All documents are encrypted and securely stored by Stripe</p>
                                <p>Access is restricted to authenticated creators only</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="document-preview">
                        <h4>📄 Document Preview</h4>
                        <div class="preview-placeholder">
                            <div class="preview-icon">📄</div>
                            <div class="preview-text">
                                <h5>1099-NEC Form 2024</h5>
                                <p>Your tax documents will appear here when they're ready</p>
                                <div class="preview-status">
                                    <span class="status-badge pending">⏳ Not Available Yet</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="viewer-actions">
                        <button id="check-availability" class="btn-primary">
                            🔄 Check Availability
                        </button>
                        <button id="open-stripe-dashboard" class="btn-secondary">
                            📊 Open Stripe Dashboard
                        </button>
                        <button id="close-viewer" class="btn-secondary">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .tax-viewer-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
            }
            
            .tax-viewer-content {
                background: white;
                border-radius: 16px;
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            
            .viewer-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .viewer-header h3 {
                margin: 0;
                color: #1a1a1a;
                font-size: 20px;
            }
            
            .close-btn {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #6b7280;
                padding: 0;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background-color 0.2s;
            }
            
            .close-btn:hover {
                background: #f3f4f6;
            }
            
            .viewer-body {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
            }

            .availability-section {
                display: flex;
                flex-direction: column;
                gap: 16px;
                margin-bottom: 24px;
            }

            .availability-card {
                display: flex;
                align-items: flex-start;
                gap: 16px;
                padding: 16px;
                background: #f8fafc;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
            }

            .availability-icon {
                font-size: 24px;
                width: 32px;
                text-align: center;
                margin-top: 2px;
            }

            .availability-content h4 {
                margin: 0 0 8px 0;
                color: #1a1a1a;
                font-size: 16px;
                font-weight: 600;
            }

            .availability-content p {
                margin: 0 0 4px 0;
                color: #6b7280;
                font-size: 14px;
            }

            .availability-content p:last-child {
                margin-bottom: 0;
            }

            .document-preview {
                background: #f8fafc;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 24px;
            }

            .document-preview h4 {
                margin: 0 0 16px 0;
                color: #1a1a1a;
                font-size: 16px;
                font-weight: 600;
            }

            .preview-placeholder {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 20px;
                background: white;
                border-radius: 8px;
                border: 2px dashed #d1d5db;
            }

            .preview-icon {
                font-size: 48px;
                color: #9ca3af;
            }

            .preview-text h5 {
                margin: 0 0 8px 0;
                color: #1a1a1a;
                font-size: 16px;
            }

            .preview-text p {
                margin: 0 0 12px 0;
                color: #6b7280;
                font-size: 14px;
            }

            .preview-status {
                margin-top: 8px;
            }

            .status-badge {
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
            }

            .status-badge.pending {
                background: #fef3c7;
                color: #92400e;
            }

            .viewer-actions {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
            }
            
            .btn-primary {
                background: #3b82f6;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                flex: 1;
                transition: background-color 0.2s;
            }
            
            .btn-primary:hover {
                background: #2563eb;
            }
            
            .btn-secondary {
                background: #f3f4f6;
                color: #374151;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .btn-secondary:hover {
                background: #e5e7eb;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(modal);

        // Event listeners
        document.getElementById('check-availability').addEventListener('click', () => {
            this.checkDocumentAvailability();
        });

        document.getElementById('open-stripe-dashboard').addEventListener('click', () => {
            window.open('https://dashboard.stripe.com/express', '_blank');
        });

        document.getElementById('close-viewer').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        document.getElementById('close-tax-viewer').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    // Check document availability
    async checkDocumentAvailability() {
        const checkBtn = document.getElementById('check-availability');
        const originalText = checkBtn.textContent;
        checkBtn.textContent = '⏳ Checking...';
        checkBtn.disabled = true;

        try {
            // Simulate checking availability
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Show result
            checkBtn.textContent = '✅ Up to Date';
            checkBtn.style.background = '#10b981';
            
            // Update status
            const statusBadge = document.querySelector('.preview-status .status-badge');
            if (statusBadge) {
                statusBadge.textContent = '⏳ Still Coming Soon';
                statusBadge.className = 'status-badge pending';
            }
            
        } catch (error) {
            checkBtn.textContent = '❌ Error';
            checkBtn.style.background = '#ef4444';
        }

        // Reset button after 3 seconds
        setTimeout(() => {
            checkBtn.textContent = originalText;
            checkBtn.disabled = false;
            checkBtn.style.background = '#3b82f6';
        }, 3000);
    }
}

// Initialize Stripe Connect
window.stripeConnect = new StripeConnect();

// Listen for auth state changes to keep current user updated
firebase.auth().onAuthStateChanged((user) => {
    if (window.stripeConnect) {
        window.stripeConnect.currentUser = user;
        console.log('Stripe Connect user updated:', user ? user.email : 'No user');
    }
}); 