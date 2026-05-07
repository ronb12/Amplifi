import { recordCheckoutSession } from './_lib/db.js';
import { getAppUrl, handleApiError, parseJson, requireMethod, sendJson } from './_lib/http.js';
import { getStripe, toCents } from './_lib/stripe.js';

const productLabels = {
  tip: 'Creator tip',
  subscription: 'Creator membership',
  ticket: 'Live event ticket',
  ppv: 'Pay-per-view unlock',
  store: 'Creator store purchase',
  'ad-campaign': 'Amplifi ad campaign budget',
  'creator-boost': 'Creator boost starter package'
};

export default async function handler(req, res) {
  if (!requireMethod(req, res, 'POST')) return;

  try {
    const stripe = getStripe();
    const body = await parseJson(req);
    const kind = body.kind || body.type || 'tip';
    const appUrl = getAppUrl(req);
    const amount = kind === 'subscription' ? body.amount || 9.99 : body.amount;
    const amountCents = toCents(amount);
    const creatorId = String(body.creatorId || '');

    if (!creatorId) {
      return sendJson(res, 400, { error: 'creatorId is required' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: kind === 'subscription' ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: body.currency || 'usd',
            recurring: kind === 'subscription' ? { interval: 'month' } : undefined,
            unit_amount: amountCents,
            product_data: {
              name: body.label || productLabels[kind] || 'Amplifi purchase',
              description: body.message || body.description || undefined,
              metadata: {
                creatorId,
                kind
              }
            }
          },
          quantity: 1
        }
      ],
      success_url: `${appUrl}/settings?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/settings?checkout=cancelled`,
      metadata: {
        kind,
        creatorId,
        buyerId: body.buyerId || '',
        tierId: body.tierId || '',
        eventId: body.eventId || '',
        campaignId: body.campaignId || '',
        advertiser: body.advertiser || '',
        days: body.days || '',
        message: body.message || ''
      }
    });

    await recordCheckoutSession(session);
    sendJson(res, 200, { url: session.url, sessionId: session.id });
  } catch (error) {
    handleApiError(res, error);
  }
}
