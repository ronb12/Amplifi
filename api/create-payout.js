import { handleApiError, parseJson, requireMethod, sendJson } from './_lib/http.js';
import { getStripe, toCents } from './_lib/stripe.js';

export default async function handler(req, res) {
  if (!requireMethod(req, res, 'POST')) return;

  try {
    const stripe = getStripe();
    const body = await parseJson(req);
    const accountId = String(body.accountId || '');
    const amountCents = toCents(body.amount);

    if (!accountId) {
      return sendJson(res, 400, { success: false, error: 'accountId is required' });
    }

    const payout = await stripe.payouts.create(
      {
        amount: amountCents,
        currency: body.currency || 'usd',
        metadata: {
          source: 'amplifi_creator_dashboard'
        }
      },
      { stripeAccount: accountId }
    );

    sendJson(res, 200, { success: true, payoutId: payout.id, status: payout.status });
  } catch (error) {
    handleApiError(res, error);
  }
}
