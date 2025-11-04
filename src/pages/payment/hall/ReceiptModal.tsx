import React from 'react';
import { X, Download, CheckCircle, Calendar, User, Mail, MapPin, CreditCard } from 'lucide-react';
import { Receipt } from '../../../services/hallPayment';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: Receipt | null;
  onDownload: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  receipt,
  onDownload
}) => {
  if (!isOpen || !receipt) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Receipt</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Transaction completed successfully</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-6">
          {/* Success Message */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-6 mb-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-900 dark:text-green-200 mb-2">Payment Successful!</h3>
            <p className="text-green-800 dark:text-green-300">Your booking has been confirmed and you will receive a confirmation email shortly.</p>
          </div>

          {/* Transaction Details */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 mb-6">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Transaction Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Transaction ID</div>
                <div className="font-semibold text-gray-900 dark:text-white">{receipt.transactionId}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Reference Number</div>
                <div className="font-semibold text-gray-900 dark:text-white">{receipt.referenceNumber}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Payment Date</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {new Date(receipt.paymentDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Payment Method</div>
                <div className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <CreditCard className="w-4 h-4" />
                  <span>{receipt.paymentMethod}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 mb-6">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Customer Information</span>
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white">{receipt.customerName}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white">{receipt.customerEmail}</span>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 mb-6">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Event Details</span>
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white">{receipt.hallName}</span>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Event Dates:</div>
                <div className="space-y-1">
                  {receipt.eventDates.map((date, index) => (
                    <div key={index} className="bg-white dark:bg-gray-700 px-3 py-2 rounded-lg text-sm font-medium">
                      <span className="text-gray-900 dark:text-white">{formatDate(date)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-6">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Payment Breakdown</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Base Price</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(receipt.breakdown.basePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Caution Fee (Refundable)</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(receipt.breakdown.cautionFee)}</span>
              </div>
              {receipt.breakdown.additionalHours > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Additional Hours</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(receipt.breakdown.additionalHours)}</span>
                </div>
              )}
              {receipt.breakdown.banquetChairs > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Banquet Chairs</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(receipt.breakdown.banquetChairs)}</span>
                </div>
              )}
              <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">Total Paid</span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">{formatPrice(receipt.breakdown.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-2xl p-6 mb-6">
            <h4 className="text-lg font-bold text-yellow-900 dark:text-yellow-200 mb-3">Important Information</h4>
            <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-2">
              <li>• Keep this receipt for your records</li>
              <li>• Caution fee will be refunded 2-5 business days after your event</li>
              <li>• Cancellation is allowed up to 7 days before the event (10% processing fee applies)</li>
              <li>• All decorations and equipment must be removed within 24 hours after the event</li>
              <li>• Contact us at officialdomeakure@gmail.com for any questions</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onDownload}
              className="flex-1 bg-blue-600 dark:bg-blue-700 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Download Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 dark:bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 dark:hover:bg-gray-600 transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;