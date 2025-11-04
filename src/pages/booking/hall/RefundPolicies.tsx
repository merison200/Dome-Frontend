import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Clock, XCircle, Info } from 'lucide-react';

const RefundPolicies: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-3">
        <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <span>Booking Policies & Terms</span>
      </h3>

      <div className="space-y-8">
        {/* Cancellation Policy */}
        <div className="border-l-4 border-red-500 dark:border-red-400 pl-6">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
            <span>Cancellation Policy</span>
          </h4>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
              <div>
                <p className="font-medium">Free cancellation up to 7 days before event</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cancel your booking without penalty</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-1" />
              <div>
                <p className="font-medium">10% processing fee applies to all refunds</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Administrative costs for payment processing</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <XCircle className="w-4 h-4 text-red-500 dark:text-red-400 mt-1" />
              <div>
                <p className="font-medium">No refund for cancellations within 7 days</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Late cancellations are non-refundable</p>
              </div>
            </div>
          </div>
        </div>

        {/* Caution Fee Policy */}
        <div className="border-l-4 border-green-500 dark:border-green-400 pl-6">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
            <Shield className="w-5 h-5 text-green-500 dark:text-green-400" />
            <span>Caution Fee Refund</span>
          </h4>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <div className="flex items-start space-x-3">
              <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-1" />
              <div>
                <p className="font-medium">Refunded within 2-5 business days after event</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Automatic processing after event completion</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
              <div>
                <p className="font-medium">Full refund if no damages occur</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Facility inspection after each event</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-1" />
              <div>
                <p className="font-medium">Deductions for any damages or extra cleaning</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Documented with photos and receipts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Equipment & Decoration Policy */}
        <div className="border-l-4 border-purple-500 dark:border-purple-400 pl-6">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
            <Info className="w-5 h-5 text-purple-500 dark:text-purple-400" />
            <span>Equipment & Decorations</span>
          </h4>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-1" />
              <div>
                <p className="font-medium">We are not responsible for decorations or personal equipment</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Clients assume full responsibility for their items</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-1" />
              <div>
                <p className="font-medium">All items must be removed within 24 hours after event</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Storage fees apply for items left beyond this period</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
              <div>
                <p className="font-medium">Setup and cleanup assistance available</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Professional staff to help with event preparation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chair Policy */}
        <div className="border-l-4 border-blue-500 dark:border-blue-400 pl-6">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            <span>Chair Policy</span>
          </h4>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
              <div>
                <p className="font-medium">Standard plastic chairs included at no cost</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sufficient quantity for your event capacity</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Info className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-1" />
              <div>
                <p className="font-medium">Premium banquet chairs: ₦1,000 per chair per day</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Maximum 1,200 banquet chairs available</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-1" />
              <div>
                <p className="font-medium">Chair damage fees apply for banquet chairs</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Replacement cost deducted from caution fee</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Payment Terms</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Secure online payment processing</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Multiple payment methods accepted</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Instant booking confirmation</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Email receipt and booking details</span>
            </div>
          </div>
        </div>

        {/* Agreement */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mt-1" />
            <div>
              <h4 className="font-bold text-red-900 dark:text-red-100 mb-2">Agreement</h4>
              <p className="text-red-800 dark:text-red-300 text-sm">
                By proceeding with this booking, you acknowledge that you have read, understood, 
                and agree to all the terms and conditions outlined above. These policies are 
                binding and will be enforced for all bookings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicies;