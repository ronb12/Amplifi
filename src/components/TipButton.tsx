import React, { useState } from 'react';
import { FiHeart, FiGift } from 'react-icons/fi';

interface TipButtonProps {
  creatorId: string;
  creatorName: string;
}

const TipButton: React.FC<TipButtonProps> = ({ creatorId, creatorName }) => {
  const [showTipModal, setShowTipModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTip = async () => {
    if (selectedAmount <= 0) return;
    
    setIsLoading(true);
    try {
      const result = await sendTip(selectedAmount, creatorId, message);
      if (result.success) {
        setShowTipModal(false);
        setSelectedAmount(0);
        setCustomAmount('');
        setMessage('');
      } else {
        alert('Failed to send tip: ' + result.error);
      }
    } catch (error) {
      alert('Error sending tip');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const amount = parseFloat(value);
    if (!isNaN(amount) && amount > 0) {
      setSelectedAmount(amount);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowTipModal(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
      >
        <FiGift className="w-4 h-4" />
        <span>Tip Creator</span>
      </button>

      {showTipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-w-[90vw] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Send a tip to {creatorName}</h3>
              <button
                onClick={() => setShowTipModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">Choose a tip amount or enter custom:</p>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                {tipAmounts.slice(0, 6).map((tip) => (
                  <button
                    key={tip.id}
                    onClick={() => {
                      setSelectedAmount(tip.amount);
                      setCustomAmount('');
                    }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedAmount === tip.amount
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{tip.emoji}</div>
                    <div className="text-sm font-medium">${tip.amount}</div>
                    <div className="text-xs text-gray-500">{tip.label}</div>
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Amount
                </label>
                <input
                  type="number"
                  min="0.50"
                  step="0.50"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  placeholder="Enter amount (min $0.50)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Leave a message for the creator..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {selectedAmount > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tip amount:</span>
                    <span className="text-lg font-bold text-blue-600">${selectedAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-600">Processing fee:</span>
                    <span className="text-sm text-gray-500">$0.30 + 2.9%</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-200">
                    <span className="text-sm font-medium text-gray-700">Total:</span>
                    <span className="text-lg font-bold text-blue-700">
                      ${(selectedAmount * 1.029 + 0.30).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowTipModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTip}
                disabled={selectedAmount <= 0 || isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FiHeart className="w-4 h-4" />
                    <span>Send Tip</span>
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

export default TipButton;
