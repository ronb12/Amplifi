import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiTrendingUp, FiUsers, FiGift, FiStar, FiSettings } from 'react-icons/fi';
import { 
  createStripeAccount, 
  getAccountBalance, 
  createPayout,
  subscriptionTiers,
  tipAmounts
} from '../services/stripeService';

interface CreatorStats {
  totalEarnings: number;
  monthlyEarnings: number;
  totalTips: number;
  totalSubscriptions: number;
  activeSubscribers: number;
}

const CreatorDashboard: React.FC = () => {
  const [stripeAccountId, setStripeAccountId] = useState<string>('');
  const [accountBalance, setAccountBalance] = useState<any>(null);
  const [creatorStats, setCreatorStats] = useState<CreatorStats>({
    totalEarnings: 1250.75,
    monthlyEarnings: 320.50,
    totalTips: 45,
    totalSubscriptions: 23,
    activeSubscribers: 18
  });
  const [isLoading, setIsLoading] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<string>('');

  useEffect(() => {
    // Check if creator has Stripe account
    const checkStripeAccount = async () => {
      // This would typically check from your backend
      // For demo purposes, we'll simulate it
      setStripeAccountId('acct_demo123');
    };

    checkStripeAccount();
  }, []);

  const handleCreateStripeAccount = async () => {
    setIsLoading(true);
    try {
      const result = await createStripeAccount('creator@example.com', 'US');
      if (result.success) {
        setStripeAccountId(result.accountId || '');
        alert('Stripe account created successfully!');
      } else {
        alert('Failed to create Stripe account: ' + result.error);
      }
    } catch (error) {
      alert('Error creating Stripe account');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayout = async () => {
    if (!payoutAmount || parseFloat(payoutAmount) <= 0) return;
    
    setIsLoading(true);
    try {
      const result = await createPayout(stripeAccountId, parseFloat(payoutAmount));
      if (result.success) {
        alert('Payout initiated successfully!');
        setPayoutAmount('');
      } else {
        alert('Failed to create payout: ' + result.error);
      }
    } catch (error) {
      alert('Error creating payout');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Creator Dashboard</h1>
        <button className="btn-primary">
          <FiSettings className="w-4 h-4 mr-2" />
          Settings
        </button>
      </div>

      {/* Stripe Account Status */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Stripe Account</h2>
        {stripeAccountId ? (
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-700 font-medium">Connected to Stripe</span>
            <span className="text-sm text-gray-500">Account: {stripeAccountId}</span>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-gray-600">Connect your Stripe account to start earning</p>
            <button
              onClick={handleCreateStripeAccount}
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Creating...' : 'Connect Stripe Account'}
            </button>
          </div>
        )}
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(creatorStats.totalEarnings)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(creatorStats.monthlyEarnings)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tips</p>
              <p className="text-2xl font-bold text-gray-900">{creatorStats.totalTips}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiGift className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Subscribers</p>
              <p className="text-2xl font-bold text-gray-900">{creatorStats.activeSubscribers}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Monetization Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tips Configuration */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tip Amounts</h3>
          <div className="grid grid-cols-3 gap-2">
            {tipAmounts.map((tip) => (
              <div key={tip.id} className="text-center p-3 border border-gray-200 rounded-lg">
                <div className="text-2xl mb-1">{tip.emoji}</div>
                <div className="text-sm font-medium">${tip.amount}</div>
                <div className="text-xs text-gray-500">{tip.label}</div>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Customize Tip Amounts
          </button>
        </div>

        {/* Subscription Tiers */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Tiers</h3>
          <div className="space-y-3">
            {subscriptionTiers.map((tier) => (
              <div key={tier.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{tier.name}</h4>
                  <p className="text-sm text-gray-500">{tier.benefits.length} benefits</p>
                </div>
                <span className="text-lg font-bold text-purple-600">${tier.price}/month</span>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Edit Subscription Tiers
          </button>
        </div>
      </div>

      {/* Payout Section */}
      {stripeAccountId && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Payout</h3>
          <div className="flex space-x-3">
            <input
              type="number"
              min="10"
              step="0.01"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              placeholder="Enter amount (min $10)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handlePayout}
              disabled={!payoutAmount || parseFloat(payoutAmount) < 10 || isLoading}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Processing...' : 'Request Payout'}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Minimum payout: $10 • Processing time: 2-3 business days
          </p>
        </div>
      )}

      {/* Analytics */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">24.5K</p>
            <p className="text-sm text-gray-600">Total Views</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">1.2K</p>
            <p className="text-sm text-gray-600">Total Likes</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">89%</p>
            <p className="text-sm text-gray-600">Engagement Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;
