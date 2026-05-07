import { insertPaymentEvent, recordCheckoutSession } from './_lib/db.js';
import { handleApiError, readRawBody, requireMethod, sendJson } from './_lib/http.js';
import { getStripe } from './_lib/stripe.js';

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (!requireMethod(req, res, 'POST')) return;

  try {
    const stripe = getStripe();
    const signature = req.headers['stripe-signature'];
    const rawBody = await readRawBody(req);
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    await insertPaymentEvent(event);

    if (event.type === 'checkout.session.completed') {
      await recordCheckoutSession(event.data.object, 'completed');
    }

    if (event.type === 'checkout.session.expired') {
      await recordCheckoutSession(event.data.object, 'expired');
    }

    sendJson(res, 200, { received: true });
  } catch (error) {
    handleApiError(res, error);
  }
}
