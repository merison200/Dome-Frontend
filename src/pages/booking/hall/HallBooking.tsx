import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  X, 
  Loader,
  MapPin,
  Star,
  Users,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { hallAPI, Hall } from '../../../services/hall';
import { bookingAPI, BookingFormData } from '../../../services/hallBooking';
import { paymentAPI, PaymentResponse, Receipt, CardDetails, TransferDetails, PaymentData } from '../../../services/hallPayment';
import AuthModal from '../../../components/ui/AuthModal';
import BookingProgress from '../../booking/hall/BookingProgress';
import AvailabilityChecker from '../../booking/hall/AvailabilityChecker';
import ChairSelection from '../../booking/hall/ChairSelection';
import BookingForm from '../../booking/hall/BookingForm';
import PricingCalculator from '../../booking/hall/PricingCalculator';
import RefundPolicies from '../../booking/hall/RefundPolicies';
import PaymentModal from '../../payment/hall/PaymentModal';
import ReceiptModal from '../../payment/hall/ReceiptModal';
import TransferProofUpload from '../../payment/hall/TransferProofUpload';

interface CustomerFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventType: string;
  specialRequests: string;
  additionalHours: number;
}

const BookHallPage: React.FC = () => {
  const { hallId } = useParams<{ hallId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // State management
  const [hall, setHall] = useState<Hall | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentStep, setCurrentStep] = useState(1);
  
  // Booking form state
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [banquetChairs, setBanquetChairs] = useState(0);
  const [customerForm, setCustomerForm] = useState<CustomerFormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    eventType: '',
    specialRequests: '',
    additionalHours: 0
  });
  
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showTransferUpload, setShowTransferUpload] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null);
  const [transferDetails, setTransferDetails] = useState<any>(null);

  // Fetch hall data
  useEffect(() => {
    const fetchHall = async () => {
      if (!hallId) {
        setError('Hall ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const hallData = await hallAPI.getById(hallId);
        setHall(hallData);
      } catch (err) {
        console.error('Error fetching hall:', err);
        setError('Failed to load hall details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchHall();
  }, [hallId]);

  // Auto-fill user data when authenticated
  useEffect(() => {
    if (user && isAuthenticated) {
      setCustomerForm(prev => ({
        ...prev,
        customerName: user.name || '',
        customerEmail: user.email || ''
      }));
    }
  }, [user, isAuthenticated]);

  // Pricing calculations
  const calculatePricing = () => {
    if (!hall) return { basePrice: 0, cautionFee: 0, additionalHoursPrice: 0, banquetChairsPrice: 0, totalAmount: 0 };

    const basePrice = hall.basePrice * selectedDates.length;
    const cautionFee = Math.round(basePrice * 0.1);
    const additionalHoursPrice = customerForm.additionalHours * hall.additionalHourPrice * selectedDates.length;
    const banquetChairsPrice = banquetChairs * 1000 * selectedDates.length;
    const totalAmount = basePrice + cautionFee + additionalHoursPrice + banquetChairsPrice;

    return {
      basePrice,
      cautionFee,
      additionalHoursPrice,
      banquetChairsPrice,
      totalAmount
    };
  };

  const handleCustomerFormChange = (data: Partial<CustomerFormData>) => {
    setCustomerForm(prev => ({ ...prev, ...data }));
  };

  const handleProceedToPayment = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (!hall || selectedDates.length === 0) {
      setError('Please select at least one event date');
      return;
    }

    if (!customerForm.customerName || !customerForm.customerEmail || !customerForm.customerPhone || !customerForm.eventType) {
      setError('Please fill in all required customer information');
      return;
    }

    try {
      setBookingInProgress(true);
      setError(null);
      const pricing = calculatePricing();
      
      const bookingData: BookingFormData = {
        hallId: hall._id!,
        customerName: customerForm.customerName,
        customerEmail: customerForm.customerEmail,
        customerPhone: customerForm.customerPhone,
        eventDates: selectedDates,
        additionalHours: customerForm.additionalHours,
        banquetChairs,
        eventType: customerForm.eventType,
        specialRequests: customerForm.specialRequests,
        ...pricing
      };

      const booking = await bookingAPI.createBooking(bookingData);
      setCurrentBookingId(booking._id!);
      setShowPaymentModal(true);
    } catch (err: any) {
      console.error('Booking failed:', err);
      setError(err?.response?.data?.message || err?.message || 'Booking failed. Please try again.');
    } finally {
      setBookingInProgress(false);
    }
  };

  const handlePaymentSubmit = async (method: 'card' | 'transfer', details: CardDetails | TransferDetails) => {
    if (!currentBookingId || !hall) return;

    console.log('Payment submission started:', { method, bookingId: currentBookingId });

    try {
      setPaymentProcessing(true);
      setError(null);

      const paymentData: PaymentData = {
        bookingId: currentBookingId,
        method,
        cardDetails: method === 'card' ? details as CardDetails : undefined,
        transferDetails: method === 'transfer' ? details as TransferDetails : undefined,
      };

      console.log('Calling payment API with:', paymentData);

      // Process payment using real API
      const paymentResponse = await paymentAPI.processPayment(paymentData);

      console.log('Payment API response:', paymentResponse);

      if (paymentResponse.success) {
        setCurrentTransactionId(paymentResponse.transactionId);

        if (method === 'card' && paymentResponse.paymentUrl) {
          // For card payments, redirect to Paystack
          console.log('Redirecting to Paystack:', paymentResponse.paymentUrl);
          paymentAPI.redirectToPaystack(paymentResponse.paymentUrl);
          return;
        }

        if (method === 'transfer') {
          console.log('Processing transfer payment...');
          
          // Close payment modal and show transfer upload
          setShowPaymentModal(false);
          
          // Store transfer details for the upload modal
          setTransferDetails({
            transactionId: paymentResponse.transactionId,
            accountName: paymentResponse.transferDetails?.accountName || 'Cavudos Nigeria Limited',
            accountNumber: paymentResponse.transferDetails?.accountNumber || '1228862083',
            bankName: paymentResponse.transferDetails?.bankName || 'Zenith Bank Nigeria',
            amount: calculatePricing().totalAmount
          });
          
          // Show transfer upload modal
          setShowTransferUpload(true);
          
          // Show success message
          setError(null);
          console.log('Transfer payment record created successfully');
          return;
        }
      } else {
        console.error('Payment API returned failure:', paymentResponse);
        setError(paymentResponse.message || 'Payment failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Payment submission error:', err);
      setError(err?.response?.data?.message || err?.message || 'Payment processing failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleTransferUploadSuccess = async () => {
    console.log('Transfer proof uploaded successfully');
    
    try {
      // Show success message
      setError(null);
      
      // Close transfer upload modal
      setShowTransferUpload(false);
      
      // Show success notification
      //alert('Transfer proof uploaded successfully! Your booking will be confirmed within 24 hours. You will receive an email confirmation once verified.');
      
      // Navigate to bookings page or dashboard
      navigate('/halls');
      
    } catch (err: any) {
      console.error('Error handling transfer upload success:', err);
      setError('Upload successful but there was an issue processing. Please contact support if needed.');
    }
  };

  // Handle return from Paystack (for card payments)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const transactionId = urlParams.get('transaction_id');
    const reference = urlParams.get('reference');

    if (transactionId || reference) {
      handlePaymentVerification(transactionId, reference);
    }
  }, []);

  const handlePaymentVerification = async (transactionId: string | null, reference: string | null) => {
    try {
      setPaymentProcessing(true);
      let paymentResponse: PaymentResponse;

      if (transactionId) {
        paymentResponse = await paymentAPI.verifyPayment(transactionId);
      } else if (reference) {
        paymentResponse = await paymentAPI.getPaymentByReference(reference);
      } else {
        throw new Error('No transaction ID or reference provided');
      }

      if (paymentResponse.success && paymentResponse.status === 'completed') {
        // Payment successful, get receipt
        const receiptData = await paymentAPI.getReceipt(paymentResponse.transactionId);
        setReceipt(receiptData);
        setShowReceiptModal(true);

        // Update booking payment status
        if (currentBookingId) {
          await bookingAPI.confirmPayment(currentBookingId, paymentResponse.referenceNumber);
        }
      } else if (paymentResponse.status === 'failed') {
        setError('Payment failed. Please try again or contact support.');
      } else {
        // Payment still processing
        setError('Payment is being processed. Please wait...');
        
        // Continue polling for final status
        try {
          const finalStatus = await paymentAPI.pollPaymentStatus(paymentResponse.transactionId);
          if (finalStatus.success && finalStatus.status === 'completed') {
            const receiptData = await paymentAPI.getReceipt(finalStatus.transactionId);
            setReceipt(receiptData);
            setShowReceiptModal(true);
          }
        } catch (pollError) {
          console.error('Error polling payment status:', pollError);
        }
      }
    } catch (err: any) {
      console.error('Payment verification failed:', err);
      setError('Failed to verify payment. Please contact support if payment was deducted.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!currentTransactionId) return;

    try {
      const blob = await paymentAPI.downloadReceipt(currentTransactionId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${receipt?.referenceNumber || currentTransactionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading receipt:', err);
      // Fallback to manual receipt creation if API fails
      handleManualReceiptDownload();
    }
  };

  const handleManualReceiptDownload = () => {
    if (receipt) {
      const receiptText = `
THE DOME EVENT CENTER
PAYMENT RECEIPT

Transaction ID: ${receipt.transactionId}
Reference Number: ${receipt.referenceNumber}
Date: ${paymentAPI.formatDate(receipt.paymentDate)}

Customer: ${receipt.customerName}
Email: ${receipt.customerEmail}
Hall: ${receipt.hallName}

Event Dates:
${receipt.eventDates.map(date => `- ${paymentAPI.formatDate(date)}`).join('\n')}

Payment Breakdown:
Base Price: ${paymentAPI.formatCurrency(receipt.breakdown.basePrice)}
Caution Fee: ${paymentAPI.formatCurrency(receipt.breakdown.cautionFee)}
Additional Hours: ${paymentAPI.formatCurrency(receipt.breakdown.additionalHours)}
Banquet Chairs: ${paymentAPI.formatCurrency(receipt.breakdown.banquetChairs)}

Total Paid: ${paymentAPI.formatCurrency(receipt.breakdown.total)}
Payment Method: ${receipt.paymentMethod}
Status: ${receipt.status.toUpperCase()}

Thank you for choosing The Dome Event Center!
      `;

      const blob = new Blob([receiptText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${receipt.referenceNumber}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleSendReceiptEmail = async () => {
    if (!currentTransactionId || !customerForm.customerEmail) return;

    try {
      await paymentAPI.sendReceiptEmail(currentTransactionId, customerForm.customerEmail);
      setError(null);
      // You might want to show a success toast here
      console.log('Receipt sent successfully');
    } catch (err: any) {
      console.error('Error sending receipt email:', err);
      setError('Failed to send receipt email. You can download it instead.');
    }
  };

  // Determine current step based on form completion
  useEffect(() => {
    if (selectedDates.length === 0) {
      setCurrentStep(1);
    } else if (customerForm.customerName === '' || customerForm.customerEmail === '' || customerForm.eventType === '') {
      setCurrentStep(3);
    } else {
      setCurrentStep(4);
    }
  }, [selectedDates, customerForm]);

  const pricing = calculatePricing();
  
  const canProceed: boolean = Boolean(
    isAuthenticated && 
    selectedDates.length > 0 && 
    customerForm.customerName.trim() && 
    customerForm.customerEmail.trim() && 
    customerForm.customerPhone.trim() &&
    customerForm.eventType.trim()
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading hall details...</p>
        </div>
      </div>
    );
  }

  if (error && !hall) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-8 h-8 text-red-600 dark:text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Unable to Load Hall</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <Link
            to="/halls"
            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Back to Halls
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header - Modified section */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 dark:from-red-700 dark:to-red-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Book Your Event</h1>
          {hall && (
            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6 text-red-100">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>{hall.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>{hall.capacity} guests</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 fill-current" />
                <span>{hall.rating} ({hall.reviews} reviews)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Indicator */}
        <BookingProgress currentStep={currentStep} />

        {/* Authentication Check */}
        {!isAuthenticated && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-6 rounded-2xl mb-8">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">Login Required</h3>
                <p className="text-yellow-700 dark:text-yellow-300 mt-1">You need to be logged in to book a hall.</p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors"
                >
                  Login to Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Processing Indicator */}
        {paymentProcessing && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-600 p-6 rounded-2xl mb-8">
            <div className="flex items-center space-x-3">
              <Loader className="w-6 h-6 text-blue-600 dark:text-blue-500 animate-spin" />
              <div>
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Processing Payment</h3>
                <p className="text-blue-700 dark:text-blue-300 mt-1">Please wait while we process your payment...</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hall Overview */}
            {hall && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{hall.name}</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{hall.description}</p>
                  </div>
                  {hall.images.length > 0 && (
                    <img
                      src={hall.images[0].url}
                      alt={hall.name}
                      className="w-24 h-24 rounded-2xl object-cover ml-6"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Step 1: Date Selection */}
            <AvailabilityChecker
              selectedDates={selectedDates}
              onDateChange={setSelectedDates}
              hallId={hallId || ''}
              isAuthenticated={isAuthenticated}
            />

            {/* Step 2: Chair Selection */}
            {selectedDates.length > 0 && (
              <ChairSelection
                banquetChairs={banquetChairs}
                onBanquetChairsChange={setBanquetChairs}
                selectedDates={selectedDates}
              />
            )}

            {/* Step 3: Customer Information */}
            {selectedDates.length > 0 && (
              <BookingForm
                formData={customerForm}
                onFormDataChange={handleCustomerFormChange}
                selectedDates={selectedDates}
                additionalHourPrice={hall?.additionalHourPrice || 0}
              />
            )}

            {/* Policies */}
            <RefundPolicies />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <PricingCalculator
              pricing={pricing}
              selectedDates={selectedDates}
              additionalHours={customerForm.additionalHours}
              banquetChairs={banquetChairs}
              onProceedToPayment={handleProceedToPayment}
              canProceed={canProceed}
              isProcessing={bookingInProgress}
            />

            {error && (
              <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-start space-x-2 text-red-800 dark:text-red-300">
                  <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
        skipRedirect={true}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPaymentProcessing(false);
        }}
        amount={pricing.totalAmount}
        onPaymentSubmit={handlePaymentSubmit}
        isProcessing={paymentProcessing}
      />

      {/* Transfer Upload Modal */}
      <TransferProofUpload
        isOpen={showTransferUpload}
        onClose={() => {
          setShowTransferUpload(false);
          setTransferDetails(null);
        }}
        transactionId={transferDetails?.transactionId || ''}
        transferDetails={{
          accountName: transferDetails?.accountName || 'Cavudos Nigeria Limited',
          accountNumber: transferDetails?.accountNumber || '1228862083',
          bankName: transferDetails?.bankName || 'Zenith Bank Nigeria'
        }}
        amount={transferDetails?.amount || pricing.totalAmount}
        onSuccess={handleTransferUploadSuccess}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => {
          setShowReceiptModal(false);
          //navigate('/payment/success');
        }}
        receipt={receipt}
        onDownload={handleDownloadReceipt}
      />
    </div>
  );
};

export default BookHallPage;