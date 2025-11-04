// import React, { useEffect, useState } from 'react';
// import { useSearchParams, useNavigate } from 'react-router-dom';
// import { 
//   XCircle, 
//   RefreshCw, 
//   CreditCard, 
//   Building2, 
//   Phone, 
//   Mail, 
//   Home,
//   AlertTriangle,
//   Info,
//   ArrowLeft,
//   HelpCircle
// } from 'lucide-react';

// const PaymentFailure: React.FC = () => {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const [showDetails, setShowDetails] = useState(false);

//   const transactionId = searchParams.get('transactionId');
//   const reference = searchParams.get('reference');
//   const reason = searchParams.get('reason');
//   const error = searchParams.get('error');

//   const handleRetryPayment = () => {
//     // Go back to booking page with retry flag
//     if (transactionId) {
//       navigate(`/hall-booking?retry=true&transactionId=${transactionId}`);
//     } else {
//       navigate('/hall-booking');
//     }
//   };

//   const getFailureReason = () => {
//     if (reason) {
//       const decodedReason = decodeURIComponent(reason);
      
//       // Common failure reasons and user-friendly messages
//       const reasonMap: { [key: string]: string } = {
//         'insufficient_funds': 'Insufficient funds in your account',
//         'card_declined': 'Your card was declined by the bank',
//         'expired_card': 'Your card has expired',
//         'invalid_card': 'Invalid card details provided',
//         'network_error': 'Network connection issue occurred',
//         'verification_failed': 'Payment verification failed',
//         'cancelled': 'Payment was cancelled',
//         'timeout': 'Payment session timed out',
//         'bank_error': 'Bank processing error occurred'
//       };

//       return reasonMap[decodedReason.toLowerCase()] || decodedReason;
//     }
    
//     if (error === 'missing_reference') return 'Payment reference not found';
//     if (error === 'payment_not_found') return 'Payment record not found';
//     if (error === 'verification_failed') return 'Unable to verify payment status';
//     if (error === 'callback_error') return 'Payment processing error occurred';
    
//     return 'Payment could not be completed';
//   };

//   const getFailureIcon = () => {
//     if (reason === 'cancelled') {
//       return <AlertTriangle className="w-20 h-20 text-yellow-600 dark:text-yellow-400" />;
//     }
//     return <XCircle className="w-20 h-20 text-red-600 dark:text-red-400" />;
//   };

//   const getFailureColor = () => {
//     if (reason === 'cancelled') {
//       return {
//         bg: 'from-yellow-500 to-yellow-600',
//         text: 'text-yellow-100',
//         accent: 'yellow',
//         dark: {
//           bg: 'from-yellow-600 to-yellow-700',
//           text: 'text-yellow-100'
//         }
//       };
//     }
//     return {
//       bg: 'from-red-500 to-red-600',
//       text: 'text-red-100',
//       accent: 'red',
//       dark: {
//         bg: 'from-red-600 to-red-700',
//         text: 'text-red-100'
//       }
//     };
//   };

//   const failureColors = getFailureColor();

//   const commonSolutions = [
//     {
//       icon: <CreditCard className="w-5 h-5" />,
//       title: "Check Card Details",
//       description: "Ensure your card number, expiry date, and CVV are correct"
//     },
//     {
//       icon: <Building2 className="w-5 h-5" />,
//       title: "Try Bank Transfer",
//       description: "Use our bank transfer option as an alternative payment method"
//     },
//     {
//       icon: <RefreshCw className="w-5 h-5" />,
//       title: "Retry Payment",
//       description: "Try the payment again - sometimes temporary issues resolve"
//     },
//     {
//       icon: <Phone className="w-5 h-5" />,
//       title: "Contact Your Bank",
//       description: "Your bank may have blocked the transaction for security"
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
//       <div className="max-w-4xl mx-auto">
//         {/* Failure Header */}
//         <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl mb-8 overflow-hidden">
//           <div className={`bg-gradient-to-r ${failureColors.bg} dark:${failureColors.dark.bg} p-8 text-white text-center`}>
//             <div className="flex justify-center mb-4">
//               {getFailureIcon()}
//             </div>
//             <h1 className="text-3xl font-bold mb-2">
//               {reason === 'cancelled' ? 'Payment Cancelled' : 'Payment Failed'}
//             </h1>
//             <p className={`${failureColors.text} text-lg`}>
//               {reason === 'cancelled' 
//                 ? 'You cancelled the payment process' 
//                 : 'We couldn\'t process your payment'}
//             </p>
//           </div>
          
//           <div className="p-8">
//             {/* Failure Reason */}
//             <div className={`bg-${failureColors.accent}-50 dark:bg-${failureColors.accent}-900/20 border border-${failureColors.accent}-200 dark:border-${failureColors.accent}-800 rounded-2xl p-6 mb-6`}>
//               <div className="flex items-start space-x-3">
//                 <Info className={`w-5 h-5 text-${failureColors.accent}-600 dark:text-${failureColors.accent}-400 mt-0.5 flex-shrink-0`} />
//                 <div>
//                   <h3 className={`font-semibold text-${failureColors.accent}-900 dark:text-${failureColors.accent}-100 mb-2`}>
//                     What happened?
//                   </h3>
//                   <p className={`text-${failureColors.accent}-800 dark:text-${failureColors.accent}-300`}>
//                     {getFailureReason()}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Transaction Details (if available) */}
//             {(transactionId || reference) && (
//               <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 mb-6">
//                 <button
//                   onClick={() => setShowDetails(!showDetails)}
//                   className="w-full flex items-center justify-between text-left"
//                 >
//                   <h4 className="text-lg font-bold text-gray-900 dark:text-white">Transaction Details</h4>
//                   <HelpCircle className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
//                 </button>
                
//                 {showDetails && (
//                   <div className="mt-4 space-y-3 text-sm">
//                     {transactionId && (
//                       <div className="flex justify-between">
//                         <span className="text-gray-600 dark:text-gray-300">Transaction ID:</span>
//                         <span className="font-medium text-xs break-all text-gray-900 dark:text-white">{transactionId}</span>
//                       </div>
//                     )}
//                     {reference && (
//                       <div className="flex justify-between">
//                         <span className="text-gray-600 dark:text-gray-300">Reference:</span>
//                         <span className="font-medium text-gray-900 dark:text-white">{reference}</span>
//                       </div>
//                     )}
//                     <div className="flex justify-between">
//                       <span className="text-gray-600 dark:text-gray-300">Time:</span>
//                       <span className="font-medium text-gray-900 dark:text-white">
//                         {new Date().toLocaleString('en-US', {
//                           year: 'numeric',
//                           month: 'short',
//                           day: 'numeric',
//                           hour: '2-digit',
//                           minute: '2-digit'
//                         })}
//                       </span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Quick Action Buttons */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
//               <button
//                 onClick={handleRetryPayment}
//                 className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
//               >
//                 <RefreshCw className="w-5 h-5" />
//                 <span>Try Again</span>
//               </button>
//               <button
//                 onClick={() => navigate('/contact')}
//                 className="bg-gray-600 dark:bg-gray-700 text-white py-4 rounded-xl font-semibold hover:bg-gray-700 dark:hover:bg-gray-800 transition-all duration-300 flex items-center justify-center space-x-2"
//               >
//                 <Phone className="w-5 h-5" />
//                 <span>Get Help</span>
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Solutions and Help */}
//         <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 mb-8">
//           <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">How to Fix This</h2>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//             {commonSolutions.map((solution, index) => (
//               <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
//                 <div className="flex items-start space-x-4">
//                   <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
//                     {React.cloneElement(solution.icon, { className: "w-5 h-5 text-blue-600 dark:text-blue-400" })}
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{solution.title}</h3>
//                     <p className="text-sm text-gray-600 dark:text-gray-300">{solution.description}</p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Alternative Payment Methods */}
//           <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6 mb-6">
//             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Alternative Payment Options</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
//                 <div className="flex items-center space-x-3 mb-3">
//                   <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
//                     <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//                   </div>
//                   <div>
//                     <h4 className="font-semibold text-gray-900 dark:text-white">Bank Transfer</h4>
//                     <p className="text-sm text-gray-600 dark:text-gray-300">More reliable option</p>
//                   </div>
//                 </div>
//                 <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
//                   <div><strong>Account:</strong> Cavudos Nigeria Limited</div>
//                   <div><strong>Number:</strong> 1228862083</div>
//                   <div><strong>Bank:</strong> Zenith Bank Nigeria</div>
//                 </div>
//               </div>
              
//               <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
//                 <div className="flex items-center space-x-3 mb-3">
//                   <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
//                     <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
//                   </div>
//                   <div>
//                     <h4 className="font-semibold text-gray-900 dark:text-white">Different Card</h4>
//                     <p className="text-sm text-gray-600 dark:text-gray-300">Try another card</p>
//                   </div>
//                 </div>
//                 <p className="text-xs text-gray-600 dark:text-gray-300">
//                   Use a different debit/credit card if available
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Contact Support */}
//           <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-6">
//             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">Still Need Help?</h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div className="text-center">
//                 <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
//                   <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
//                 </div>
//                 <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Call Us</h4>
//                 <p className="text-sm text-gray-600 dark:text-gray-300">+234 810 198 8988</p>
//               </div>
              
//               <div className="text-center">
//                 <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
//                   <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
//                 </div>
//                 <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Email Us</h4>
//                 <p className="text-sm text-gray-600 dark:text-gray-300">officialdomeakure@gmail.com</p>
//               </div>
              
//               <div className="text-center">
//                 <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
//                   <HelpCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
//                 </div>
//                 <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Help Center</h4>
//                 <p className="text-sm text-gray-600 dark:text-gray-300">Browse FAQs</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Navigation Actions */}
//         <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <button
//               onClick={() => navigate(-1)}
//               className="bg-gray-600 dark:bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 dark:hover:bg-gray-800 transition-all duration-300 flex items-center justify-center space-x-2"
//             >
//               <ArrowLeft className="w-5 h-5" />
//               <span>Go Back</span>
//             </button>
            
//             <button
//               onClick={handleRetryPayment}
//               className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
//             >
//               <RefreshCw className="w-5 h-5" />
//               <span>Retry Payment</span>
//             </button>
            
//             <button
//               onClick={() => navigate('/')}
//               className="bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center justify-center space-x-2"
//             >
//               <Home className="w-5 h-5" />
//               <span>Back to Home </span>
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentFailure;


import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  XCircle, 
  RefreshCw, 
  CreditCard, 
  Building2, 
  Phone, 
  Mail, 
  Home,
  AlertTriangle,
  Info,
  ArrowLeft,
  HelpCircle
} from 'lucide-react';

const PaymentFailure: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  const transactionId = searchParams.get('transactionId');
  const reference = searchParams.get('reference');
  const reason = searchParams.get('reason');
  const error = searchParams.get('error');

  const handleRetryPayment = () => {
    // Go back to booking page with retry flag
    if (transactionId) {
      navigate(`/hall-booking?retry=true&transactionId=${transactionId}`);
    } else {
      navigate('/hall-booking');
    }
  };

  const getFailureReason = () => {
    if (reason) {
      const decodedReason = decodeURIComponent(reason);
      
      // Common failure reasons and user-friendly messages
      const reasonMap: { [key: string]: string } = {
        'insufficient_funds': 'Insufficient funds in your account',
        'card_declined': 'Your card was declined by the bank',
        'expired_card': 'Your card has expired',
        'invalid_card': 'Invalid card details provided',
        'network_error': 'Network connection issue occurred',
        'verification_failed': 'Payment verification failed',
        'cancelled': 'Payment was cancelled',
        'timeout': 'Payment session timed out',
        'bank_error': 'Bank processing error occurred'
      };

      return reasonMap[decodedReason.toLowerCase()] || decodedReason;
    }
    
    if (error === 'missing_reference') return 'Payment reference not found';
    if (error === 'payment_not_found') return 'Payment record not found';
    if (error === 'verification_failed') return 'Unable to verify payment status';
    if (error === 'callback_error') return 'Payment processing error occurred';
    
    return 'Payment could not be completed';
  };

  const getFailureIcon = () => {
    if (reason === 'cancelled') {
      return <AlertTriangle className="w-20 h-20 text-yellow-600 dark:text-yellow-400" />;
    }
    return <XCircle className="w-20 h-20 text-red-600 dark:text-red-400" />;
  };

  const getFailureColor = () => {
    if (reason === 'cancelled') {
      return {
        bg: 'bg-yellow-600',
        text: 'text-yellow-100',
        accent: 'yellow',
        dark: {
          bg: 'bg-yellow-700',
          text: 'text-yellow-100'
        }
      };
    }
    return {
      bg: 'bg-red-600',
      text: 'text-red-100',
      accent: 'red',
      dark: {
        bg: 'bg-red-700',
        text: 'text-red-100'
      }
    };
  };

  const failureColors = getFailureColor();

  const commonSolutions = [
    {
      icon: <CreditCard className="w-5 h-5" />,
      title: "Check Card Details",
      description: "Ensure your card number, expiry date, and CVV are correct"
    },
    {
      icon: <Building2 className="w-5 h-5" />,
      title: "Try Bank Transfer",
      description: "Use our bank transfer option as an alternative payment method"
    },
    {
      icon: <RefreshCw className="w-5 h-5" />,
      title: "Retry Payment",
      description: "Try the payment again - sometimes temporary issues resolve"
    },
    {
      icon: <Phone className="w-5 h-5" />,
      title: "Contact Your Bank",
      description: "Your bank may have blocked the transaction for security"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Failure Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-8 overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className={`${failureColors.bg} dark:${failureColors.dark.bg} p-8 text-white text-center`}>
            <div className="flex justify-center mb-4">
              {getFailureIcon()}
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {reason === 'cancelled' ? 'Payment Cancelled' : 'Payment Failed'}
            </h1>
            <p className={`${failureColors.text} text-lg`}>
              {reason === 'cancelled' 
                ? 'You cancelled the payment process' 
                : 'We couldn\'t process your payment'}
            </p>
          </div>
          
          <div className="p-8">
            {/* Failure Reason */}
            <div className={`bg-${failureColors.accent}-50 dark:bg-${failureColors.accent}-900/20 border border-${failureColors.accent}-200 dark:border-${failureColors.accent}-800 rounded-xl p-6 mb-6`}>
              <div className="flex items-start space-x-3">
                <Info className={`w-5 h-5 text-${failureColors.accent}-600 dark:text-${failureColors.accent}-400 mt-0.5 flex-shrink-0`} />
                <div>
                  <h3 className={`font-semibold text-${failureColors.accent}-900 dark:text-${failureColors.accent}-100 mb-2`}>
                    What happened?
                  </h3>
                  <p className={`text-${failureColors.accent}-800 dark:text-${failureColors.accent}-300`}>
                    {getFailureReason()}
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Details (if available) */}
            {(transactionId || reference) && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-6">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">Transaction Details</h4>
                  <HelpCircle className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                </button>
                
                {showDetails && (
                  <div className="mt-4 space-y-3 text-sm">
                    {transactionId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Transaction ID:</span>
                        <span className="font-medium text-xs break-all text-gray-900 dark:text-white">{transactionId}</span>
                      </div>
                    )}
                    {reference && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Reference:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{reference}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Time:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date().toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <button
                onClick={handleRetryPayment}
                className="bg-red-600 dark:bg-red-700 text-white py-4 rounded-lg font-semibold hover:bg-red-700 dark:hover:bg-red-800 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Try Again</span>
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="bg-gray-600 dark:bg-gray-700 text-white py-4 rounded-lg font-semibold hover:bg-gray-700 dark:hover:bg-gray-800 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Phone className="w-5 h-5" />
                <span>Get Help</span>
              </button>
            </div>
          </div>
        </div>

        {/* Solutions and Help */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">How to Fix This</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {commonSolutions.map((solution, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    {React.cloneElement(solution.icon, { className: "w-5 h-5 text-red-600 dark:text-red-400" })}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{solution.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{solution.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Alternative Payment Methods */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Alternative Payment Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Bank Transfer</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">More reliable option</p>
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                  <div><strong>Account:</strong> Cavudos Nigeria Limited</div>
                  <div><strong>Number:</strong> 1228862083</div>
                  <div><strong>Bank:</strong> Zenith Bank Nigeria</div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Different Card</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Try another card</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Use a different debit/credit card if available
                </p>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">Still Need Help?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Call Us</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">+234 (0) 123 456 7890</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Email Us</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">support@thedome.com</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <HelpCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Help Center</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Browse FAQs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-600 dark:bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 dark:hover:bg-gray-800 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </button>
            
            <button
              onClick={handleRetryPayment}
              className="bg-red-600 dark:bg-red-700 text-white py-3 rounded-lg font-semibold hover:bg-red-700 dark:hover:bg-red-800 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Retry Payment</span>
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="bg-gray-600 dark:bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 dark:hover:bg-gray-800 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;