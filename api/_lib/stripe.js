import Stripe from 'stripe';
import { requireEnv } from './http.js';

let stripeClient;

export const getStripe = () => {
  const secretKey = requireEnv('STRIPE_SECRET_KEY');

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: '2026-02-25.clover',
      typescript: false
    });
  }

  return stripeClient;
};

export const toCents = (amount) => Math.max(50, Math.round(Number(amount || 0) * 100));
