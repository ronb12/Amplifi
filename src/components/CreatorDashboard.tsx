import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiTrendingUp, FiUsers, FiGift, FiStar, FiSettings } from 'react-icons/fi';
import { 
  createStripeAccount, 
  getAccountBalance, 
  createPayout,
  subscriptionTiers,
  tipAmounts

interface CreatorStats {
  totalEarnings: number;
  monthlyEarnings: number;
  totalTips: number;
  totalSubscriptions: number;
  activeSubscribers: number;
}

const CreatorDashboard: React.FC = () => {
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
      // This would typically check from your backend
      // For demo purposes, we'll simulate it
      setStripeAccountId('acct_demo123');
    };

  }, []);

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

      {}
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
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Creating...' : 'Connect Stripe Account'}
            </button>
          </div>
        )}
      </div>

      {}
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
