import React from 'react';
import { Calculator, CreditCard, Shield, Info } from 'lucide-react';

interface PricingData {
  basePrice: number;
  cautionFee: number;
  additionalHoursPrice: number;
  banquetChairsPrice: number;
  totalAmount: number;
}

interface PricingCalculatorProps {
  pricing: PricingData;
  selectedDates: string[];
  additionalHours: number;
  banquetChairs: number;
  onProceedToPayment: () => void;
  canProceed: boolean;
  isProcessing: boolean;
}

const PricingCalculator: React.FC<PricingCalculatorProps> = ({
  pricing,
  selectedDates,
  additionalHours,
  banquetChairs,
  onProceedToPayment,
  canProceed,
  isProcessing
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="sticky top-8 space-y-6">
      {/* Pricing Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-3">
          <Calculator className="w-6 h-6 text-green-600 dark:text-green-400" />
          <span>Pricing Summary</span>
        </h3>
        
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center py-2">
            <div>
              <span className="text-gray-600 dark:text-gray-300">Base Price</span>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {selectedDates.length} day{selectedDates.length !== 1 ? 's' : ''}
              </div>
            </div>
            <span className="font-semibold text-lg text-gray-900 dark:text-white">{formatPrice(pricing.basePrice)}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-t border-gray-100 dark:border-gray-700">
            <div>
              <span className="text-gray-600 dark:text-gray-300">Caution Fee</span>
              <div className="text-sm text-gray-500 dark:text-gray-400">10% (Refundable)</div>
            </div>
            <span className="font-semibold text-lg text-gray-900 dark:text-white">{formatPrice(pricing.cautionFee)}</span>
          </div>
          
          {additionalHours > 0 && (
            <div className="flex justify-between items-center py-2 border-t border-gray-100 dark:border-gray-700">
              <div>
                <span className="text-gray-600 dark:text-gray-300">Additional Hours</span>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {additionalHours}h × {selectedDates.length} day{selectedDates.length !== 1 ? 's' : ''}
                </div>
              </div>
              <span className="font-semibold text-lg text-gray-900 dark:text-white">{formatPrice(pricing.additionalHoursPrice)}</span>
            </div>
          )}
          
          {banquetChairs > 0 && (
            <div className="flex justify-between items-center py-2 border-t border-gray-100 dark:border-gray-700">
              <div>
                <span className="text-gray-600 dark:text-gray-300">Banquet Chairs</span>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {banquetChairs} chairs × {selectedDates.length} day{selectedDates.length !== 1 ? 's' : ''}
                </div>
              </div>
              <span className="font-semibold text-lg text-gray-900 dark:text-white">{formatPrice(pricing.banquetChairsPrice)}</span>
            </div>
          )}
          
          <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-4 mt-6">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900 dark:text-white">Total Amount</span>
              <span className="text-3xl font-bold text-red-600 dark:text-red-400">{formatPrice(pricing.totalAmount)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onProceedToPayment}
          disabled={!canProceed || isProcessing}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              <span>Proceed to Payment</span>
            </>
          )}
        </button>
      </div>

      {/* Payment Security */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 text-center">
        <Shield className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
        <h4 className="font-bold text-green-900 dark:text-green-100 mb-2">Secure Payment</h4>
        <p className="text-sm text-green-800 dark:text-green-300">
          Your payment information is protected with bank-level security
        </p>
      </div>

      {/* Caution Fee Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Caution Fee Details</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• Refunded within 2-5 business days after event</li>
              <li>• Only if no damages occur to the facility</li>
              <li>• Automatic refund process</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;