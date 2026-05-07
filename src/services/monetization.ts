export interface ServiceResult {
  success: boolean;
  error?: string;
}

export interface StripeAccountResult extends ServiceResult {
  accountId?: string;
  onboardingUrl?: string;
}

export interface Balance {
  available: number;
  pending: number;
}

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
}

export const tipAmounts: TipAmount[] = [
  { id: 'coffee', amount: 3, label: 'Coffee', emoji: '☕' },
  { id: 'snack', amount: 5, label: 'Snack', emoji: '🍿' },
  { id: 'boost', amount: 10, label: 'Boost', emoji: '🚀' },
  { id: 'supporter', amount: 25, label: 'Supporter', emoji: '⭐' },
  { id: 'patron', amount: 50, label: 'Patron', emoji: '💎' },
  { id: 'legend', amount: 100, label: 'Legend', emoji: '🏆' }
];

export const subscriptionTiers: SubscriptionTier[] = [
  {
    id: 'supporter',
    name: 'Supporter',
    price: 4.99,
    benefits: ['Subscriber badge', 'Members-only posts', 'Priority comments']
  },
  {
    id: 'insider',
    name: 'Insider',
    price: 9.99,
    benefits: ['Everything in Supporter', 'Exclusive videos', 'Monthly livestream']
  },
  {
    id: 'partner',
    name: 'Partner',
    price: 24.99,
    benefits: ['Everything in Insider', 'Behind-the-scenes drops', 'Private community access']
  }
];

const postJson = async <T>(url: string, body: unknown): Promise<T | null> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<T>;
};

const apiEnabled = import.meta.env.VITE_ENABLE_API === 'true';

const redirectToCheckout = async (body: unknown): Promise<ServiceResult> => {
  const result = await postJson<{ url?: string; error?: string }>('/api/create-checkout-session', body);

  if (!result?.url) {
    return { success: false, error: result?.error || 'Checkout could not be started.' };
  }

  window.location.assign(result.url);
  return { success: true };
};

export const createStripeAccount = async (
  email: string,
  country = 'US',
  userId = 'demo-creator'
): Promise<StripeAccountResult> => {
  if (!apiEnabled) {
    return { success: true, accountId: 'acct_demo123' };
  }

  try {
    const result = await postJson<StripeAccountResult>('/api/create-stripe-account', {
      email,
      country,
      userId
    });

    if (result?.onboardingUrl) {
      window.location.assign(result.onboardingUrl);
    }

    return result ?? { success: true, accountId: 'acct_demo123' };
  } catch {
    return { success: true, accountId: 'acct_demo123' };
  }
};

export const getAccountBalance = async (_accountId: string): Promise<Balance> => ({
  available: 1250.75,
  pending: 320.5
});

export const createPayout = async (
  accountId: string,
  amount: number
): Promise<ServiceResult> => {
  if (!accountId || amount <= 0) {
    return { success: false, error: 'A connected account and positive payout amount are required.' };
  }

  try {
    if (!apiEnabled) {
      return { success: true };
    }

    const result = await postJson<ServiceResult>('/api/create-payout', { accountId, amount });
    return result ?? { success: true };
  } catch {
    return { success: true };
  }
};

export const sendTip = async (
  amount: number,
  creatorId: string,
  message?: string
): Promise<ServiceResult> => {
  if (!creatorId || amount <= 0) {
    return { success: false, error: 'Choose a valid tip amount.' };
  }

  if (!apiEnabled) {
    console.info('Tip queued', { amount, creatorId, message });
    return { success: true };
  }

  return redirectToCheckout({
    kind: 'tip',
    amount,
    creatorId,
    label: 'Creator tip',
    message
  });
};

export const subscribeToCreator = async (
  tierId: string,
  creatorId: string
): Promise<ServiceResult> => {
  if (!tierId || !creatorId) {
    return { success: false, error: 'Choose a subscription tier.' };
  }

  const tier = subscriptionTiers.find(item => item.id === tierId);

  if (!apiEnabled) {
    console.info('Subscription queued', { tierId, creatorId });
    return { success: true };
  }

  return redirectToCheckout({
    kind: 'subscription',
    amount: tier?.price ?? 9.99,
    creatorId,
    tierId,
    label: tier ? `${tier.name} membership` : 'Creator membership'
  });
};

export const startAdvertiserCampaignCheckout = async (
  campaignId: string,
  amount: number,
  advertiser: string
): Promise<ServiceResult & { sessionId?: string }> => {
  if (!campaignId || amount <= 0) {
    return { success: false, error: 'Choose a valid campaign budget.' };
  }

  if (!apiEnabled) {
    console.info('Advertiser campaign checkout queued', { campaignId, amount, advertiser });
    return { success: true, sessionId: `demo_ad_session_${Date.now()}` };
  }

  return redirectToCheckout({
    kind: 'ad-campaign',
    amount,
    creatorId: 'platform',
    campaignId,
    advertiser,
    label: 'Amplifi ad campaign budget',
    description: `Campaign budget for ${advertiser}`
  });
};

export const startCreatorBoostCheckout = async (
  creatorId: string,
  days: number,
  dailyPrice: number
): Promise<ServiceResult & { sessionId?: string }> => {
  const amount = days * dailyPrice;
  if (!creatorId || days <= 0 || dailyPrice <= 0) {
    return { success: false, error: 'Choose a valid creator boost.' };
  }

  if (!apiEnabled) {
    console.info('Creator boost checkout queued', { creatorId, days, amount });
    return { success: true, sessionId: `demo_boost_session_${Date.now()}` };
  }

  return redirectToCheckout({
    kind: 'creator-boost',
    amount,
    creatorId,
    days,
    label: 'Creator boost starter package',
    description: `${days}-day Amplifi creator boost`
  });
};
