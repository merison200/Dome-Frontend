import React, { useState } from 'react';
import { X, CreditCard, Building2, Lock, AlertTriangle, Loader } from 'lucide-react';
import { PaymentMethod, CardDetails, TransferDetails } from '../../../services/hallPayment';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onPaymentSubmit: (method: 'card' | 'transfer', details: CardDetails | TransferDetails) => void;
  isProcessing: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  onPaymentSubmit,
  isProcessing
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'transfer'>('card');
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  
  // Updated transfer details with actual bank information
  const [transferDetails, setTransferDetails] = useState<TransferDetails>({
    accountName: 'Cavudos Nigeria Limited',
    accountNumber: '1228862083',
    bankName: 'Zenith Bank Nigeria',
    amount: amount
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardDetails(prev => ({ ...prev, cardNumber: formatted }));
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    if (formatted.length <= 5) {
      setCardDetails(prev => ({ ...prev, expiryDate: formatted }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (selectedMethod === 'card') {
        // Validate card details before submitting
        if (!isCardValid) {
          alert('Please fill in all card details correctly');
          return;
        }
        await onPaymentSubmit('card', cardDetails);
      } else {
        // For transfer payments, we need to update the amount in transferDetails
        const updatedTransferDetails = {
          ...transferDetails,
          amount: amount
        };
        console.log('Submitting transfer payment with details:', updatedTransferDetails);
        await onPaymentSubmit('transfer', updatedTransferDetails);
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      // Don't close modal on error, let parent handle it
    }
  };

  const isCardValid = cardDetails.cardNumber.replace(/\s/g, '').length === 16 &&
                     cardDetails.expiryDate.length === 5 &&
                     cardDetails.cvv.length >= 3 &&
                     cardDetails.cardholderName.length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Complete Payment</h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Display */}
        <div className="p-6 bg-gradient-to-r from-red-50 to-blue-50 dark:from-red-900/20 dark:to-blue-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Total Amount</div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white">{formatPrice(amount)}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Payment Method Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Payment Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                disabled={isProcessing}
                className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                  selectedMethod === 'card'
                    ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                } disabled:opacity-50`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedMethod === 'card' ? 'bg-red-100 dark:bg-red-800/30' : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <CreditCard className={`w-6 h-6 ${
                      selectedMethod === 'card' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
                    }`} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 dark:text-white">Card Payment</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Pay with debit/credit card</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('transfer')}
                disabled={isProcessing}
                className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                  selectedMethod === 'transfer'
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                } disabled:opacity-50`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedMethod === 'transfer' ? 'bg-blue-100 dark:bg-blue-800/30' : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <Building2 className={`w-6 h-6 ${
                      selectedMethod === 'transfer' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                    }`} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 dark:text-white">Bank Transfer</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Transfer to our account</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Card Payment Form */}
          {selectedMethod === 'card' && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 flex items-center space-x-3">
                <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  Your payment information is secured with 256-bit SSL encryption
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardDetails.cardholderName}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, cardholderName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="John Doe"
                  required
                  disabled={isProcessing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardDetails.cardNumber}
                  onChange={handleCardNumberChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="1234 5678 9012 3456"
                  required
                  disabled={isProcessing}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={cardDetails.expiryDate}
                    onChange={handleExpiryChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="MM/YY"
                    required
                    disabled={isProcessing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cvv}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 4) {
                        setCardDetails(prev => ({ ...prev, cvv: value }));
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="123"
                    required
                    disabled={isProcessing}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bank Transfer Details */}
          {selectedMethod === 'transfer' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-4 flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-300">
                  <div className="font-semibold mb-1">Bank Transfer Instructions</div>
                  <div>Click "Confirm Transfer" below to proceed. You'll then upload your transfer receipt for verification.</div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Transfer Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Account Name:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{transferDetails.accountName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Account Number:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{transferDetails.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Bank Name:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{transferDetails.bankName}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-3">
                    <span className="text-gray-600 dark:text-gray-300">Amount:</span>
                    <span className="font-bold text-lg text-red-600 dark:text-red-400">{formatPrice(amount)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4">
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  <div className="font-semibold mb-2">What happens next:</div>
                  <ol className="space-y-1 list-decimal list-inside">
                    <li>Make the transfer to the account above</li>
                    <li>Upload your transfer receipt/screenshot</li>
                    <li>We'll verify and confirm your booking within 24 hours</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={isProcessing || (selectedMethod === 'card' && !isCardValid)}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>
                    {selectedMethod === 'card' ? 'Processing Payment...' : 'Creating Transfer...'}
                  </span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>
                    {selectedMethod === 'card' ? `Pay Now - ${formatPrice(amount)}` : `Confirm Transfer - ${formatPrice(amount)}`}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Processing message for transfer */}
          {isProcessing && selectedMethod === 'transfer' && (
            <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
              <div className="text-sm text-blue-800 dark:text-blue-300">
                Creating your transfer payment record... You'll be redirected to upload your receipt.
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;