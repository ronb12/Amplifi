// Payment Success Handler
// This handles successful payments and updates the database

class PaymentSuccessHandler {
    constructor() {
        this.init();
    }

    async init() {
        console.log('✅ Payment Success Handler initialized');
    }

    // Handle successful tip payment
    async handleTipSuccess(sessionId, paymentData) {
        try {
            // In a real implementation, this would:
            // 1. Verify the payment with Stripe
            // 2. Update the database
            // 3. Send notifications
            // 4. Update creator earnings

            const tipResult = {
                sessionId: sessionId,
                status: 'completed',
                amount: paymentData.amount,
                currency: paymentData.currency,
                creatorId: paymentData.creatorId,
                message: paymentData.message,
                completedAt: Date.now()
            };

            // Update creator earnings in Firestore
            if (window.db && paymentData.creatorId) {
                try {
                    const earningsRef = window.db.collection('earnings').doc(paymentData.creatorId);
                    await earningsRef.set({
                        totalTips: window.firebase.firestore.FieldValue.increment(paymentData.amount / 100),
                        lastUpdated: new Date()
                    }, { merge: true });

                    console.log('✅ Creator earnings updated');
                } catch (dbError) {
                    console.error('❌ Error updating creator earnings:', dbError);
                }
            }

            // Store tip in Firestore
            if (window.db) {
                try {
                    await window.db.collection('tips').add({
                        sessionId: sessionId,
                        amount: paymentData.amount / 100, // Convert from cents
                        currency: paymentData.currency,
                        creatorId: paymentData.creatorId,
                        message: paymentData.message,
                        status: 'completed',
                        createdAt: new Date(),
                        completedAt: new Date()
                    });

                    console.log('✅ Tip stored in database');
                } catch (dbError) {
                    console.error('❌ Error storing tip:', dbError);
                }
            }

            console.log('✅ Tip payment success handled:', tipResult);
            return { success: true, result: tipResult };

        } catch (error) {
            console.error('❌ Error handling tip success:', error);
            return { success: false, error: error.message };
        }
    }

    // Handle successful subscription payment
    async handleSubscriptionSuccess(sessionId, subscriptionData) {
        try {
            const subscriptionResult = {
                sessionId: sessionId,
                status: 'active',
                tierId: subscriptionData.tierId,
                creatorId: subscriptionData.creatorId,
                price: subscriptionData.price,
                currency: subscriptionData.currency,
                startedAt: Date.now(),
                nextBilling: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
            };

            // Store subscription in Firestore
            if (window.db) {
                try {
                    await window.db.collection('subscriptions').add({
                        sessionId: sessionId,
                        tierId: subscriptionData.tierId,
                        creatorId: subscriptionData.creatorId,
                        price: subscriptionData.price / 100, // Convert from cents
                        currency: subscriptionData.currency,
                        status: 'active',
                        createdAt: new Date(),
                        startedAt: new Date(),
                        nextBilling: new Date(subscriptionResult.nextBilling)
                    });

                    console.log('✅ Subscription stored in database');
                } catch (dbError) {
                    console.error('❌ Error storing subscription:', dbError);
                }
            }

            console.log('✅ Subscription payment success handled:', subscriptionResult);
            return { success: true, result: subscriptionResult };

        } catch (error) {
            console.error('❌ Error handling subscription success:', error);
            return { success: false, error: error.message };
        }
    }

    // Handle payment failure
    async handlePaymentFailure(sessionId, errorData) {
        try {
            const failureResult = {
                sessionId: sessionId,
                status: 'failed',
                error: errorData.error,
                failedAt: Date.now()
            };

            console.log('✅ Payment failure handled:', failureResult);
            return { success: true, result: failureResult };

        } catch (error) {
            console.error('❌ Error handling payment failure:', error);
            return { success: false, error: error.message };
        }
    }
}

// Handle API requests
if (typeof window !== 'undefined') {
    // Browser environment
    window.paymentSuccessHandler = new PaymentSuccessHandler();
}
