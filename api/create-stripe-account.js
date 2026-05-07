import { upsertCreatorAccount } from './_lib/db.js';
import { getAppUrl, handleApiError, parseJson, requireMethod, sendJson } from './_lib/http.js';
import { getStripe } from './_lib/stripe.js';

export default async function handler(req, res) {
  if (!requireMethod(req, res, 'POST')) return;

  try {
    const stripe = getStripe();
    const body = await parseJson(req);
    const email = String(body.email || '');
    const userId = String(body.userId || body.creatorId || email);
    const country = String(body.country || 'US');

    if (!email || !userId) {
      return sendJson(res, 400, { error: 'email and userId are required' });
    }

    const account = await stripe.accounts.create({
      type: 'express',
      country,
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      },
      metadata: {
        userId,
        platform: 'amplifi'
      }
    });

    const appUrl = getAppUrl(req);
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${appUrl}/creator-dashboard?stripe=refresh`,
      return_url: `${appUrl}/creator-dashboard?stripe=connected`,
      type: 'account_onboarding'
    });

    await upsertCreatorAccount({
      userId,
      email,
      accountId: account.id,
      onboardingUrl: accountLink.url
    });

    sendJson(res, 200, {
      success: true,
      accountId: account.id,
      onboardingUrl: accountLink.url
    });
  } catch (error) {
    handleApiError(res, error);
  }
}
