// Lightweight Stripe service bridge used by the public dashboard scripts
(function () {
    async function postJson(url, payload) {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload || {})
        });

        const contentType = response.headers.get('content-type') || '';
        const data = contentType.includes('application/json')
            ? await response.json()
            : { error: await response.text() };

        if (!response.ok) {
            throw new Error(data.error || `Request failed with status ${response.status}`);
        }

        return data;
    }

    async function createStripeConnectAccount(payload) {
        try {
            const data = await postJson('/api/create-stripe-connect-account', payload);
            return {
                success: true,
                accountLink: data.accountLink || data.url || null,
                accountId: data.accountId || null
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Stripe Connect is not available right now.'
            };
        }
    }

    async function requestStripePayout(amount, connectedAccountId) {
        try {
            const data = await postJson('/api/request-payout', {
                amount,
                connectedAccountId
            });
            return {
                success: true,
                message: data.message || 'Payout request submitted successfully.'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Payout service is not available right now.'
            };
        }
    }

    window.createStripeConnectAccount = createStripeConnectAccount;
    window.requestStripePayout = requestStripePayout;
})();
