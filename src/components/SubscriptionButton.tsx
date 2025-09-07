import React, { useState } from 'react';
import { FiStar, FiCheck } from 'react-icons/fi';

interface SubscriptionButtonProps {
  creatorId: string;
  creatorName: string;
}

const SubscriptionButton: React.FC<SubscriptionButtonProps> = ({ creatorId, creatorName }) => {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!selectedTier) return;
    
    setIsLoading(true);
    try {
      const result = await subscribeToCreator(selectedTier, creatorId);
      if (result.success) {
        setShowSubscriptionModal(false);
        setSelectedTier('');
      } else {
        alert('Failed to subscribe: ' + result.error);
      }
    } catch (error) {
      alert('Error subscribing');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowSubscriptionModal(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
      >
        <FiStar className="w-4 h-4" />
        <span>Subscribe</span>
      </button>

      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-w-[90vw] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Subscribe to {creatorName}</h3>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">Choose a subscription tier:</p>
              
              <div className="space-y-3">
                {subscriptionTiers.map((tier) => (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedTier === tier.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{tier.name}</h4>
                      <span className="text-lg font-bold text-purple-600">${tier.price}/month</span>
                    </div>
                    
                    <div className="space-y-1">
                      {tier.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                          <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {selectedTier && (
                <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Monthly subscription:</span>
                    <span className="text-lg font-bold text-purple-600">
                      ${subscriptionTiers.find(t => t.id === selectedTier)?.price}/month
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Cancel anytime • Recurring monthly
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubscribe}
                disabled={!selectedTier || isLoading}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FiStar className="w-4 h-4" />
                    <span>Subscribe Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SubscriptionButton;
