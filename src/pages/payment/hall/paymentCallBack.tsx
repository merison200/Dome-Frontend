import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { paymentAPI } from '../../../services/hallPayment';

interface PaymentCallbackProps {}

const PaymentCallback: React.FC<PaymentCallbackProps> = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your payment...');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get parameters from URL (sent by Paystack)
        const reference = searchParams.get('reference') || searchParams.get('trxref');
        const paystackStatus = searchParams.get('status');
        const transactionId = searchParams.get('transactionId');

        console.log('Callback parameters:', { reference, paystackStatus, transactionId });

        if (!reference) {
          setStatus('error');
          setMessage('Payment reference not found. Please contact support.');
          return;
        }

        // Quick check - if Paystack already says it failed, don't even verify
        if (paystackStatus === 'cancelled') {
          setStatus('failed');
          setMessage('Payment was cancelled by user');
          startCountdown('/hall-booking?status=cancelled');
          return;
        }

        setMessage('Verifying payment with our servers...');

        // Get payment by reference
        let paymentResponse;
        try {
          paymentResponse = await paymentAPI.getPaymentByReference(reference);
        } catch (error: any) {
          console.error('Error getting payment by reference:', error);
          
          // If we have transactionId as fallback, try that
          if (transactionId) {
            try {
              paymentResponse = await paymentAPI.verifyPayment(transactionId);
            } catch (fallbackError) {
              throw new Error('Payment verification failed');
            }
          } else {
            throw new Error('Could not find payment record');
          }
        }

        if (paymentResponse?.success) {
          setPaymentDetails(paymentResponse);

          if (paymentResponse.status === 'completed') {
            setStatus('success');
            setMessage('Payment successful! Redirecting to receipt...');
            startCountdown(`/payment/success?transactionId=${paymentResponse.transactionId}&reference=${reference}`);
            
          } else if (paymentResponse.status === 'processing') {
            setMessage('Payment is being verified. Please wait...');
            
            // Poll for status updates every 3 seconds, max 10 times (30 seconds)
            let pollCount = 0;
            const pollInterval = setInterval(async () => {
              pollCount++;
              
              try {
                const updatedResponse = await paymentAPI.verifyPayment(paymentResponse.transactionId);
                
                if (updatedResponse?.success && updatedResponse.status === 'completed') {
                  clearInterval(pollInterval);
                  setStatus('success');
                  setMessage('Payment confirmed! Redirecting...');
                  setPaymentDetails(updatedResponse);
                  startCountdown(`/payment/success?transactionId=${updatedResponse.transactionId}&reference=${reference}`);
                } else if (updatedResponse?.success && updatedResponse.status === 'failed') {
                  clearInterval(pollInterval);
                  setStatus('failed');
                  setMessage('Payment verification failed');
                  startCountdown(`/payment/failed?transactionId=${paymentResponse.transactionId}&reason=verification_failed`);
                } else if (pollCount >= 10) {
                  // Stop polling after 30 seconds
                  clearInterval(pollInterval);
                  setStatus('error');
                  setMessage('Payment verification is taking longer than expected. Please check your email or contact support.');
                }
              } catch (pollError) {
                console.error('Polling error:', pollError);
                if (pollCount >= 10) {
                  clearInterval(pollInterval);
                  setStatus('error');
                  setMessage('Unable to verify payment status. Please contact support.');
                }
              }
            }, 3000);
            
          } else {
            setStatus('failed');
            setMessage(paymentResponse.message || 'Payment was not successful');
            startCountdown(`/payment/failed?transactionId=${paymentResponse.transactionId}&reason=${encodeURIComponent(paymentResponse.message)}`);
          }
          
        } else {
          setStatus('failed');
          setMessage(paymentResponse?.message || 'Payment verification failed');
          startCountdown('/payment/failed?reason=verification_failed');
        }

      } catch (error: any) {
        console.error('Payment callback error:', error);
        setStatus('error');
        setMessage(error.message || 'An error occurred while verifying your payment. Please contact support.');
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  const startCountdown = (redirectUrl: string) => {
    setCountdown(5);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(redirectUrl);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader className="w-16 h-16 text-red-600 dark:text-red-400 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-red-600 dark:text-red-400" />;
      case 'error':
        return <AlertTriangle className="w-16 h-16 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <Loader className="w-16 h-16 text-red-600 dark:text-red-400 animate-spin" />;
    }
  };

  const getBackgroundColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'failed':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'error':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    }
  };

  const getTextColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-900 dark:text-green-100';
      case 'failed':
        return 'text-red-900 dark:text-red-100';
      case 'error':
        return 'text-yellow-900 dark:text-yellow-100';
      default:
        return 'text-red-900 dark:text-red-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-8 text-center border border-gray-200 dark:border-gray-700">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          {getIcon()}
        </div>

        {/* Status Message */}
        <div className={`rounded-xl border p-6 mb-6 ${getBackgroundColor()}`}>
          <h2 className={`text-xl font-bold mb-2 ${getTextColor()}`}>
            {status === 'loading' && 'Verifying Payment'}
            {status === 'success' && 'Payment Successful!'}
            {status === 'failed' && 'Payment Failed'}
            {status === 'error' && 'Verification Error'}
          </h2>
          <p className={`${getTextColor()}`}>{message}</p>
          
          {/* Countdown for redirects */}
          {(status === 'success' || status === 'failed') && countdown > 0 && (
            <p className={`text-sm mt-3 ${getTextColor()}`}>
              Redirecting in {countdown} seconds...
            </p>
          )}
        </div>

        {/* Payment Details (if available) */}
        {paymentDetails && (status === 'success' || status === 'failed') && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Payment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Transaction ID:</span>
                <span className="font-medium text-xs text-gray-900 dark:text-white">{paymentDetails.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Reference:</span>
                <span className="font-medium text-xs text-gray-900 dark:text-white">{paymentDetails.referenceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Amount:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {paymentAPI.formatCurrency(paymentDetails.amount)}
                </span>
              </div>
              {paymentDetails.hallName && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Hall:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{paymentDetails.hallName}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading Animation */}
        {status === 'loading' && (
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}

        {/* Manual Actions for Error Cases */}
        {(status === 'error' || (status === 'failed' && message.includes('contact support'))) && (
          <div className="mt-6 space-y-3">
            <button
              onClick={() => navigate('/contact')}
              className="w-full bg-red-600 dark:bg-red-700 text-white py-3 rounded-lg font-semibold hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
            >
              Contact Support
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-full bg-gray-600 dark:bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors"
            >
              Go to Profile
            </button>
            {paymentDetails?.transactionId && (
              <button
                onClick={() => navigate(`/payment/success?transactionId=${paymentDetails.transactionId}`)}
                className="w-full bg-green-600 dark:bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-green-800 transition-colors"
              >
                View Payment Details
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;