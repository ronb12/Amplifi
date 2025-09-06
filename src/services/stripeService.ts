import { loadStripe } from '@stripe/stripe-js';

// Replace with your actual Stripe publishable key
const stripePromise = loadStripe('pk_test_51OqKCYmr...'); // Replace with your publishable key

export interface TipAmount {
  id: string;
  amount: number;
  label: string;
  emoji: string;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  benefits: string[];
  color: string;
}

export const tipAmounts: TipAmount[] = [
  { id: '1', amount: 1, label: 'Coffee', emoji: '☕' },
  { id: '2', amount: 5, label: 'Lunch', emoji: '🍕' },
  { id: '3', amount: 10, label: 'Dinner', emoji: '🍽️' },
  { id: '4', amount: 25, label: 'Weekend', emoji: '🎉' },
  { id: '5', amount: 50, label: 'Vacation', emoji: '✈️' },
  { id: '6', amount: 100, label: 'Diamond', emoji: '💎' },
  { id: '7', amount: 250, label: 'Super Fan', emoji: '👑' },
  { id: '8', amount: 500, label: 'Legend', emoji: '🏆' },
  { id: '9', amount: 1000, label: 'Ultimate', emoji: '⭐' },
  { id: '10', amount: 0, label: 'Custom', emoji: '💰' },
];

export const subscriptionTiers: SubscriptionTier[] = [
  {
    id: 'basic',
    name: 'Basic Supporter',
    price: 4.99,
    benefits: ['Exclusive content', 'Early access', 'Supporter badge', 'Ad-free viewing'],
    color: 'bg-blue-500'
  },
  {
    id: 'premium',
    name: 'Premium Supporter',
    price: 14.99,
    benefits: ['All Basic benefits', 'Live Q&A access', 'Custom emojis', 'Priority support', 'Monthly creator call'],
    color: 'bg-purple-500'
  },
  {
    id: 'vip',
    name: 'VIP Supporter',
    price: 29.99,
    benefits: ['All Premium benefits', '1-on-1 calls', 'Content requests', 'VIP community access', 'Exclusive merchandise'],
    color: 'bg-yellow-500'
  },
  {
    id: 'elite',
    name: 'Elite Supporter',
    price: 49.99,
    benefits: ['All VIP benefits', 'Private Discord access', 'Creator meetups', 'Business consultation', 'Priority content requests'],
    color: 'bg-red-500'
  }
];

export const sendTip = async (amount: number, creatorId: string, message?: string) => {
  try {
    const stripe = await stripePromise;
    if (!stripe) throw new Error('Stripe failed to load');

    const response = await fetch('/api/create-tip-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        creatorId,
        message,
        type: 'tip'
      }),
    });

    const session = await response.json();

    if (session.error) {
      throw new Error(session.error);
    }

    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending tip:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const subscribeToCreator = async (tierId: string, creatorId: string) => {
  try {
    const stripe = await stripePromise;
    if (!stripe) throw new Error('Stripe failed to load');

    const tier = subscriptionTiers.find(t => t.id === tierId);
    if (!tier) throw new Error('Invalid subscription tier');

    const response = await fetch('/api/create-subscription-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tierId,
        creatorId,
        price: tier.price,
        type: 'subscription'
      }),
    });

    const session = await response.json();

    if (session.error) {
      throw new Error(session.error);
    }

    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return { success: true };
  } catch (error) {
    console.error('Error subscribing:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const createStripeAccount = async (email: string, country: string = 'US') => {
  try {
    const response = await fetch('/api/create-stripe-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, country }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating Stripe account:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const getAccountBalance = async (accountId: string) => {
  try {
    const response = await fetch(`/api/account-balance/${accountId}`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error getting account balance:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const createPayout = async (accountId: string, amount: number) => {
  try {
    const response = await fetch('/api/create-payout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accountId, amount }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating payout:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
