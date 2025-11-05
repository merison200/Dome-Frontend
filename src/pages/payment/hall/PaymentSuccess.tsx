import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Download, 
  Mail, 
  Calendar, 
  User, 
  MapPin, 
  CreditCard, 
  BookOpen,
  Loader,
  ExternalLink,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { paymentAPI, Receipt } from '../../../services/hallPayment';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [initialEmailSent, setInitialEmailSent] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const transactionId = searchParams.get('transactionId');
  const reference = searchParams.get('reference');

  useEffect(() => {
    const fetchReceiptAndSendEmail = async () => {
      if (!transactionId) {
        setError('Transaction ID not found');
        setLoading(false);
        return;
      }

      try {
        // Fetch receipt data
        const receiptData = await paymentAPI.getReceipt(transactionId);
        setReceipt(receiptData);

        // Automatically send email after receipt is loaded
        try {
          setEmailSending(true);
          await paymentAPI.sendReceiptEmail(transactionId, receiptData.customerEmail);
          setInitialEmailSent(true);
          setEmailSent(true);
        } catch (emailErr) {
          console.error('Error sending initial email:', emailErr);
          // Don't show error to user for automatic email, they can use resend
        } finally {
          setEmailSending(false);
        }

      } catch (err: any) {
        console.error('Error fetching receipt:', err);
        setError('Failed to load payment details');
      } finally {
        setLoading(false);
      }
    };

    fetchReceiptAndSendEmail();
  }, [transactionId]);

  const handleResendEmail = async () => {
    if (!receipt || !transactionId) return;

    setEmailSending(true);
    setEmailSent(false); // Reset the sent status
    
    try {
      await paymentAPI.sendReceiptEmail(transactionId, receipt.customerEmail);
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000); // Reset after 3 seconds
    } catch (err) {
      console.error('Error resending email:', err);
      alert('Failed to resend email. Please try again.');
    } finally {
      setEmailSending(false);
    }
  };

  const handleDownload = async () => {
    if (!transactionId) return;

    setDownloading(true);
    setDownloadError(null);
    
    try {
      const blob = await paymentAPI.downloadReceipt(transactionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `receipt-${transactionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Error downloading receipt:', err);
      setDownloadError('PDF generation is currently unavailable. Please use the email option to receive your receipt.');
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-8 text-center border border-gray-200 dark:border-gray-700">
          <Loader className="w-16 h-16 text-red-600 dark:text-red-400 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {emailSending ? 'Sending Receipt Email...' : 'Loading Payment Details'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {emailSending ? 'We are sending your receipt to your email' : 'Please wait while we fetch your receipt...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-8 text-center border border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExternalLink className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Unable to Load Receipt</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'Receipt not found'}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 dark:bg-red-700 text-white py-3 rounded-lg font-semibold hover:bg-red-700 dark:hover:bg-red-800 transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Retry</span>
            </button>

            <button
              onClick={() => navigate('/halls')}
              className="w-full bg-gray-600 dark:bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors"
            >
              Browse Halls
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-8 overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="bg-red-600 dark:bg-red-700 p-8 text-white text-center">
            <CheckCircle className="w-20 h-20 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-red-100 text-lg">Your booking has been confirmed</p>
            <p className="text-red-100 text-sm mt-2">
              {initialEmailSent 
                ? `Confirmation email has been sent to ${receipt.customerEmail}` 
                : `A confirmation email will be sent to ${receipt.customerEmail}`
              }
            </p>
          </div>
          
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Amount Paid</div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white">
                {paymentAPI.formatCurrency(receipt.amount)}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleResendEmail}
                disabled={emailSending}
                className={`p-4 rounded-lg border-2 transition-all duration-300 flex items-center justify-center space-x-2 ${
                  emailSent 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                    : 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                }`}
              >
                {emailSending ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : emailSent ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Mail className="w-5 h-5" />
                )}
                <span className="font-semibold">
                  {emailSending 
                    ? 'Sending...' 
                    : emailSent 
                    ? 'Email Sent!' 
                    : 'Resend Email'
                  }
                </span>
              </button>

              <div className="relative">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full p-4 rounded-lg border-2 border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  {downloading ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                  <span className="font-semibold">
                    {downloading ? 'Preparing...' : 'Download PDF'}
                  </span>
                </button>
                
                {downloadError && (
                  <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg text-sm text-yellow-800 dark:text-yellow-300 flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>{downloadError}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Receipt Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Receipt</h2>
            <p className="text-gray-600 dark:text-gray-400">Keep this for your records</p>
          </div>

          {/* Transaction Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Transaction Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Transaction ID</div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm break-all">{receipt.transactionId}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Reference Number</div>
                <div className="font-semibold text-gray-900 dark:text-white">{receipt.referenceNumber}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Payment Date</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {paymentAPI.formatDate(receipt.paymentDate)}
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
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 mb-8">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <User className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span>Customer Information</span>
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white font-medium">{receipt.customerName}</span>
              </div>
               <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white">{receipt.customerEmail}</span>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 mb-8">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span>Event Details</span>
            </h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white font-medium">{receipt.hallName}</span>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Event Dates:</div>
                <div className="space-y-2">
                  {receipt.eventDates.map((date, index) => (
                    <div key={index} className="bg-white dark:bg-gray-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span className="text-gray-900 dark:text-white">{formatDate(date)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Payment Breakdown</h4>
            <div className="space-y-4">
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">Base Price</span>
                <span className="font-semibold text-gray-900 dark:text-white">{paymentAPI.formatCurrency(receipt.breakdown.basePrice)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">Caution Fee (Refundable)</span>
                <span className="font-semibold text-gray-900 dark:text-white">{paymentAPI.formatCurrency(receipt.breakdown.cautionFee)}</span>
              </div>
              {receipt.breakdown.additionalHours > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 dark:text-gray-400">Additional Hours</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{paymentAPI.formatCurrency(receipt.breakdown.additionalHours)}</span>
                </div>
              )}
              {receipt.breakdown.banquetChairs > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 dark:text-gray-400">Banquet Chairs</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{paymentAPI.formatCurrency(receipt.breakdown.banquetChairs)}</span>
                </div>
              )}
              <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">Total Paid</span>
                  <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {paymentAPI.formatCurrency(receipt.breakdown.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6 mb-8">
            <h4 className="text-lg font-bold text-yellow-900 dark:text-yellow-200 mb-4">Important Information</h4>
            <div className="space-y-3 text-sm text-yellow-800 dark:text-yellow-300">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <span>Your booking is confirmed and you have received a confirmation email</span>
              </div>
              <div className="flex items-start space-x-3">
                <RefreshCw className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <span>Caution fee will be refunded 2-5 business days after your event</span>
              </div>
              <div className="flex items-start space-x-3">
                <Calendar className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <span>Cancellation allowed up to 7 days before the event (10% processing fee applies)</span>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <span>Contact us at officialdomeakure@gmail.com for any questions</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6 mb-8">
            <h4 className="text-lg font-bold text-red-900 dark:text-red-200 mb-4">What's Next?</h4>
            <div className="space-y-3 text-sm text-red-800 dark:text-red-300">
              <div className="flex items-start space-x-3">
                <span className="w-6 h-6 bg-red-200 dark:bg-red-700 text-red-800 dark:text-red-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <span>You have received a confirmation email with event details</span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="w-6 h-6 bg-red-200 dark:bg-red-700 text-red-800 dark:text-red-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <span>Our team will contact you 48 hours before your event</span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="w-6 h-6 bg-red-200 dark:bg-red-700 text-red-800 dark:text-red-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <span>Arrive 30 minutes early for setup on your event day</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/halls')}
              className="bg-red-600 dark:bg-red-700 text-white py-4 rounded-lg font-semibold hover:bg-red-700 dark:hover:bg-red-800 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <BookOpen className="w-5 h-5" />
              <span>Book Another Hall</span>
            </button>

            <button
              onClick={() => navigate('/')}
              className="bg-gray-600 dark:bg-gray-700 text-white py-4 rounded-lg font-semibold hover:bg-gray-700 dark:hover:bg-gray-800 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <ExternalLink className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;