// import React, { useRef, useEffect, useState } from 'react';
// import {
//   Calendar,
//   CreditCard,
//   Clock,
//   MapPin,
//   User,
//   Send,
//   Users,
//   Mail,
//   Lock,
//   Settings,
//   Save,
//   Eye,
//   EyeOff,
//   CheckCircle,
//   AlertCircle,
//   XCircle,
//   MoreVertical,
//   Trash2,
//   MessageCircle,
//   Image as ImageIcon,
//   Upload
// } from 'lucide-react';
// import { type Booking, type Payment, type Notification } from '../../services/profile';
// import { ChatMessage } from '../../services/chatService';

// interface UserProfile {
//   _id: string;
//   name: string;
//   email: string;
//   role: string;
//   createdAt: string;
//   updatedAt: string;
// }

// interface UserProfileDataProps {
//   activeTab: string;
//   user: UserProfile;
//   bookings: Booking[];
//   payments: Payment[];
//   notifications: Notification[];
//   dataLoading: boolean;
//   messages: ChatMessage[];
//   newMessage: string;
//   setNewMessage: (message: string) => void;
//   isConnected: boolean;
//   isTyping: boolean;
//   connectWebSocket: () => void;
//   sendMessage: () => void;
//   clearChat?: () => Promise<void>;
//   onImageUpload?: (imageFile: File) => Promise<void>;
//   validateImageFile?: (file: File) => { valid: boolean; error?: string };
//   passwordForm: {
//     currentPassword: string;
//     newPassword: string;
//     confirmPassword: string;
//   };
//   setPasswordForm: React.Dispatch<React.SetStateAction<{
//     currentPassword: string;
//     newPassword: string;
//     confirmPassword: string;
//   }>>;
//   showPasswords: {
//     current: boolean;
//     new: boolean;
//     confirm: boolean;
//   };
//   setShowPasswords: React.Dispatch<React.SetStateAction<{
//     current: boolean;
//     new: boolean;
//     confirm: boolean;
//   }>>;
//   passwordLoading: boolean;
//   handlePasswordChange: (e: React.FormEvent) => Promise<void>;
//   markNotificationAsRead: (notificationId: string) => void;
//   formatCurrency: (amount: number) => string;
//   formatDate: (dateString: string) => string;
//   formatTime: (date: Date | string) => string;
//   getStatusBadge: (status: string, type?: string) => string;
//   getStatusIcon: (status: string) => React.ReactNode;
// }

// const UserProfileData: React.FC<UserProfileDataProps> = ({
//   activeTab,
//   user,
//   bookings,
//   payments,
//   notifications,
//   dataLoading,
//   messages,
//   newMessage,
//   setNewMessage,
//   isConnected,
//   isTyping,
//   connectWebSocket,
//   sendMessage,
//   clearChat,
//   onImageUpload,
//   validateImageFile,
//   passwordForm,
//   setPasswordForm,
//   showPasswords,
//   setShowPasswords,
//   passwordLoading,
//   handlePasswordChange,
//   markNotificationAsRead,
//   formatCurrency,
//   formatDate,
//   formatTime,
//   getStatusBadge,
//   getStatusIcon,
// }) => {
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [showChatSettings, setShowChatSettings] = useState(false);
//   const [isUploadingImage, setIsUploadingImage] = useState(false);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   // Close chat settings when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (showChatSettings) {
//         const target = event.target as Element;
//         if (!target.closest('[data-chat-settings]')) {
//           setShowChatSettings(false);
//         }
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [showChatSettings]);

//   const handleClearChat = async () => {
//     if (clearChat) {
//       await clearChat();
//       setShowChatSettings(false);
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   const handleImageUploadClick = () => {
//     fileInputRef.current?.click();
//   };

//   const handleImageFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file || !onImageUpload) return;

//     // Validate image file
//     if (validateImageFile) {
//       const validation = validateImageFile(file);
//       if (!validation.valid) {
//         alert(validation.error);
//         return;
//       }
//     } else {
//       // Basic validation
//       if (!file.type.startsWith('image/')) {
//         alert('Please select an image file');
//         return;
//       }
//       if (file.size > 5 * 1024 * 1024) {
//         alert('Image size must be less than 5MB');
//         return;
//       }
//     }

//     try {
//       setIsUploadingImage(true);
//       await onImageUpload(file);
//     } catch (error) {
//       console.error('Image upload failed:', error);
//       alert('Failed to upload image');
//     } finally {
//       setIsUploadingImage(false);
//       // Reset file input
//       if (fileInputRef.current) {
//         fileInputRef.current.value = '';
//       }
//     }
//   };

//   const renderMessageContent = (msg: ChatMessage) => {
//     if (msg.isDeleted) {
//       return (
//         <div className="italic text-gray-500 dark:text-gray-400">
//           {msg.messageType === 'image' ? 'This image has been deleted' : 'This message has been deleted'}
//         </div>
//       );
//     }

//     if (msg.messageType === 'image' && msg.imageUrl) {
//       return (
//         <div className="space-y-2">
//           <img 
//             src={msg.imageUrl} 
//             alt="Shared image" 
//             className="max-w-full h-auto rounded-lg max-h-64 object-cover"
//             onError={(e) => {
//               // Fallback if image fails to load
//               const target = e.target as HTMLImageElement;
//               target.style.display = 'none';
//             }}
//           />
//           {msg.message && msg.message !== '[IMAGE]' && (
//             <p className="text-sm">{msg.message}</p>
//           )}
//         </div>
//       );
//     }

//     return <p className="text-sm">{msg.message}</p>;
//   };

//   if (dataLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="flex items-center space-x-2">
//           <div className="w-6 h-6 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
//           <span className="text-gray-600 dark:text-gray-300">Loading data...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       {/* OVERVIEW TAB */}
//       {activeTab === 'overview' && (
//         <div className="space-y-6">
//           {/* Stats Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Bookings</p>
//                   <p className="text-2xl font-semibold text-gray-900 dark:text-white">{bookings.length}</p>
//                 </div>
//                 <Calendar className="w-8 h-8 text-red-600" />
//               </div>
//             </div>

//             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Spent</p>
//                   <p className="text-2xl font-semibold text-gray-900 dark:text-white">
//                     {formatCurrency(payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0))}
//                   </p>
//                 </div>
//                 <span className="text-2xl">₦</span>
//               </div>
//             </div>

//             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending Payments</p>
//                   <p className="text-2xl font-semibold text-gray-900 dark:text-white">
//                     {payments.filter(p => p.status === 'pending').length}
//                   </p>
//                 </div>
//                 <Clock className="w-8 h-8 text-yellow-600" />
//               </div>
//             </div>
//           </div>

//           {/* Recent Activity */}
//           <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
//             <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
//               <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
//             </div>
//             <div className="p-6">
//               {bookings.length === 0 ? (
//                 <div className="text-center py-8">
//                   <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
//                   <p className="text-gray-500 dark:text-gray-400">No bookings yet</p>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {bookings.slice(0, 3).map((booking) => (
//                     <div key={booking._id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
//                       <div className="flex-shrink-0">
//                         {getStatusIcon(booking.status)}
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <p className="text-sm font-medium text-gray-900 dark:text-white">{booking.hallId.name}</p>
//                         <p className="text-sm text-gray-500 dark:text-gray-400">
//                           Event Date: {formatDate(booking.eventDates[0])}
//                         </p>
//                       </div>
//                       <div className="text-right">
//                         <div className={getStatusBadge(booking.status)}>
//                           {booking.status}
//                         </div>
//                         <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
//                           {formatCurrency(booking.totalAmount)}
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* BOOKINGS TAB */}
//       {activeTab === 'bookings' && (
//         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
//           <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Bookings</h3>
//             <p className="text-sm text-gray-600 dark:text-gray-300">View and manage your hall bookings</p>
//           </div>
          
//           <div className="p-6">
//             {bookings.length === 0 ? (
//               <div className="text-center py-12">
//                 <Calendar className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
//                 <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No bookings found</h3>
//                 <p className="text-gray-500 dark:text-gray-400">You haven't made any bookings yet.</p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {bookings.map((booking) => (
//                   <div key={booking._id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
//                     <div className="flex justify-between items-start">
//                       <div className="flex-1">
//                         <div className="flex items-center space-x-3 mb-2">
//                           <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
//                             {booking.hallId.name}
//                           </h4>
//                           <div className={getStatusBadge(booking.status)}>
//                             {booking.status}
//                           </div>
//                           <div className={getStatusBadge(booking.paymentStatus, 'payment')}>
//                             {booking.paymentStatus}
//                           </div>
//                         </div>
                        
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
//                           <div className="flex items-center space-x-2">
//                             <MapPin className="w-4 h-4" />
//                             <span>{booking.hallId.location || 'Location not specified'}</span>
//                           </div>
//                           <div className="flex items-center space-x-2">
//                             <Calendar className="w-4 h-4" />
//                             <span>{formatDate(booking.eventDates[0])}</span>
//                           </div>
//                           <div className="flex items-center space-x-2">
//                             <User className="w-4 h-4" />
//                             <span>Event: {booking.eventType}</span>
//                           </div>
//                           <div className="flex items-center space-x-2">
//                             <span className="w-4 h-4 text-center">₦</span>
//                             <span>{formatCurrency(booking.totalAmount)}</span>
//                           </div>
//                           {booking.additionalHours > 0 && (
//                             <div className="flex items-center space-x-2">
//                               <Clock className="w-4 h-4" />
//                               <span>Extra Hours: {booking.additionalHours}</span>
//                             </div>
//                           )}
//                           {booking.banquetChairs > 0 && (
//                             <div className="flex items-center space-x-2">
//                               <Users className="w-4 h-4" />
//                               <span>Extra Chairs: {booking.banquetChairs}</span>
//                             </div>
//                           )}
//                         </div>

//                         {/* Additional booking details */}
//                         <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400">
//                             <div>Base Price: {formatCurrency(booking.basePrice)}</div>
//                             {booking.additionalHoursPrice > 0 && (
//                               <div>Additional Hours: {formatCurrency(booking.additionalHoursPrice)}</div>
//                             )}
//                             {booking.banquetChairsPrice > 0 && (
//                               <div>Extra Chairs: {formatCurrency(booking.banquetChairsPrice)}</div>
//                             )}
//                             <div>Caution Fee: {formatCurrency(booking.cautionFee)}</div>
//                           </div>
                          
//                           {booking.specialRequests && (
//                             <div className="mt-2">
//                               <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Special Requests: </span>
//                               <span className="text-xs text-gray-600 dark:text-gray-400">{booking.specialRequests}</span>
//                             </div>
//                           )}
//                         </div>
                        
//                         {booking.paymentReference && (
//                           <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
//                             Reference: {booking.paymentReference}
//                           </p>
//                         )}
//                       </div>
                      
//                       <div className="ml-4 text-right">
//                         <p className="text-sm text-gray-500 dark:text-gray-400">
//                           Booked: {formatDate(booking.createdAt)}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* PAYMENTS TAB */}
//       {activeTab === 'payments' && (
//         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
//           <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment History</h3>
//             <p className="text-sm text-gray-600 dark:text-gray-300">View all your payment transactions</p>
//           </div>
          
//           {payments.length === 0 ? (
//             <div className="text-center py-12">
//               <CreditCard className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
//               <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No payments found</h3>
//               <p className="text-gray-500 dark:text-gray-400">You haven't made any payments yet.</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50 dark:bg-gray-700">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                       Transaction
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                       Hall
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                       Amount
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                       Method
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                       Status
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                       Date
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
//                   {payments.map((payment) => (
//                     <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div>
//                           <div className="text-sm font-medium text-gray-900 dark:text-white">
//                             {payment.transactionId}
//                           </div>
//                           <div className="text-sm text-gray-500 dark:text-gray-400">
//                             {payment.referenceNumber}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
//                         {typeof payment.bookingId === 'object' && payment.bookingId.hallId ? 
//                           payment.bookingId.hallId.name : 
//                           'Hall not available'
//                         }
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
//                         {formatCurrency(payment.amount)}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white capitalize">
//                         {payment.method}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className={getStatusBadge(payment.status, 'payment')}>
//                           {payment.status}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
//                         {formatDate(payment.createdAt)}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       )}

//       {/* CHAT TAB */}
//       {activeTab === 'chat' && (
//         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-[600px]">
//           {/* Chat Header with Settings */}
//           <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
//                 <Users className="w-5 h-5 text-white" />
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Support</h3>
//                 <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center space-x-2">
//                   <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
//                   <span>{isConnected ? 'Connected' : 'Connecting...'}</span>
//                 </p>
//               </div>
//             </div>
            
//             <div className="flex items-center space-x-2">
//               {!isConnected && (
//                 <button
//                   onClick={connectWebSocket}
//                   className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 dark:hover:bg-red-500 transition-colors"
//                 >
//                   Reconnect
//                 </button>
//               )}
              
//               {/* Chat Settings Dropdown */}
//               <div className="relative" data-chat-settings>
//                 <button
//                   onClick={() => setShowChatSettings(!showChatSettings)}
//                   className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//                 >
//                   <MoreVertical className="w-5 h-5" />
//                 </button>
                
//                 {showChatSettings && (
//                   <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
//                     <div className="py-2">
//                       {clearChat && (
//                         <button
//                           onClick={handleClearChat}
//                           className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                           <span>Clear Chat History</span>
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Messages Area */}
//           <div className="flex-1 overflow-y-auto p-6 space-y-4">
//             {messages.length === 0 ? (
//               <div className="flex items-center justify-center h-full">
//                 <div className="text-center">
//                   <MessageCircle className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
//                   <p className="text-gray-500 dark:text-gray-400">No messages yet. Start a conversation!</p>
//                   {!isConnected && (
//                     <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
//                       Connecting to chat server...
//                     </p>
//                   )}
//                 </div>
//               </div>
//             ) : (
//               messages.map((msg) => (
//                 <div
//                   key={msg._id}
//                   className={`flex ${msg.senderId._id === user._id ? 'justify-end' : 'justify-start'}`}
//                 >
//                   <div
//                     className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
//                       msg.senderId._id === user._id
//                         ? 'bg-red-600 text-white'
//                         : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
//                     }`}
//                   >
//                     {renderMessageContent(msg)}
//                     <p className={`text-xs mt-1 ${
//                       msg.senderId._id === user._id ? 'text-red-200' : 'text-gray-500 dark:text-gray-400'
//                     }`}>
//                       {formatTime(msg.createdAt)}
//                     </p>
//                   </div>
//                 </div>
//               ))
//             )}
            
//             {isTyping && (
//               <div className="flex justify-start">
//                 <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg">
//                   <div className="flex space-x-1">
//                     <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"></div>
//                     <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
//                     <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
//                   </div>
//                 </div>
//               </div>
//             )}
//             <div ref={messagesEndRef} />
//           </div>

//           {/* Message Input */}
//           <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700">
//             <div className="flex space-x-2 sm:space-x-3">
//               {/* Hidden file input for image upload */}
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={handleImageFileSelect}
//                 accept="image/*"
//                 className="hidden"
//               />
              
//               {/* Image Upload Button */}
//               <button
//                 onClick={handleImageUploadClick}
//                 disabled={!isConnected || isUploadingImage}
//                 className="flex-shrink-0 flex items-center justify-center w-10 h-10 sm:px-3 sm:py-2 sm:w-auto sm:h-auto border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                 title="Upload image"
//               >
//                 {isUploadingImage ? (
//                   <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
//                 ) : (
//                   <ImageIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
//                 )}
//               </button>
              
//               <input
//                 type="text"
//                 value={newMessage}
//                 onChange={(e) => setNewMessage(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 placeholder="Type your message..."
//                 className="flex-1 min-w-0 px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
//                 disabled={!isConnected}
//               />
              
//               <button
//                 onClick={sendMessage}
//                 disabled={!newMessage.trim() || !isConnected}
//                 className="flex-shrink-0 flex items-center justify-center w-10 h-10 sm:px-4 sm:py-2 sm:w-auto sm:h-auto bg-red-600 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//               >
//                 <Send className="w-4 h-4" />
//               </button>
//             </div>
//             {!isConnected && (
//               <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
//                 {isConnected ? 'Connected to chat' : 'Connecting to chat server...'}
//               </p>
//             )}
//           </div>
//         </div>
//       )}

//       {/* NOTIFICATIONS TAB */}
//       {activeTab === 'notifications' && (
//         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
//           <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
//             <p className="text-sm text-gray-600 dark:text-gray-300">Stay updated with your booking status</p>
//           </div>
          
//           <div className="p-6">
//             {notifications.length === 0 ? (
//               <div className="text-center py-12">
//                 <AlertCircle className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
//                 <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications</h3>
//                 <p className="text-gray-500 dark:text-gray-400">You're all caught up!</p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {notifications.map((notification) => (
//                   <div 
//                     key={notification._id} 
//                     className={`p-4 rounded-lg border-l-4 cursor-pointer transition-colors ${
//                       notification.read 
//                         ? 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600' 
//                         : notification.type === 'success' 
//                           ? 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600'
//                           : notification.type === 'info'
//                             ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600'
//                             : notification.type === 'warning'
//                               ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 dark:border-yellow-600'
//                               : 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600'
//                     }`}
//                     onClick={() => markNotificationAsRead(notification._id)}
//                   >
//                     <div className="flex items-start justify-between">
//                       <div className="flex-1">
//                         <div className="flex items-center space-x-2">
//                           <h4 className={`font-medium ${
//                             notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'
//                           }`}>
//                             {notification.title}
//                           </h4>
//                           {!notification.read && (
//                             <span className="w-2 h-2 bg-red-600 rounded-full"></span>
//                           )}
//                         </div>
//                         <p className={`text-sm mt-1 ${
//                           notification.read ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-200'
//                         }`}>
//                           {notification.message}
//                         </p>
//                         <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
//                           {formatDate(notification.createdAt)}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* SETTINGS TAB */}
//       {activeTab === 'settings' && (
//         <div className="space-y-6">
//           {/* Account Information */}
//           <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Information</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   Full Name
//                 </label>
//                 <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
//                   <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
//                   <span>{user.name}</span>
//                 </div>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   Email Address
//                 </label>
//                 <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
//                   <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
//                   <span>{user.email}</span>
//                 </div>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   Member Since
//                 </label>
//                 <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
//                   <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
//                   <span>{formatDate(user.createdAt)}</span>
//                 </div>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   Account Type
//                 </label>
//                 <div className="flex items-center space-x-2 text-gray-900 dark:text-white capitalize">
//                   <Settings className="w-4 h-4 text-gray-400 dark:text-gray-500" />
//                   <span>{user.role}</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Change Password */}
//           <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Password</h3>
//             <form onSubmit={handlePasswordChange} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   Current Password
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showPasswords.current ? 'text' : 'password'}
//                     value={passwordForm.currentPassword}
//                     onChange={(e) => setPasswordForm(prev => ({
//                       ...prev,
//                       currentPassword: e.target.value
//                     }))}
//                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
//                     placeholder="Enter current password"
//                     required
//                   />
//                   <button
//                     type="button"
//                     className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                     onClick={() => setShowPasswords(prev => ({
//                       ...prev,
//                       current: !prev.current
//                     }))}
//                   >
//                     {showPasswords.current ? (
//                       <EyeOff className="w-4 h-4 text-gray-400 dark:text-gray-500" />
//                     ) : (
//                       <Eye className="w-4 h-4 text-gray-400 dark:text-gray-500" />
//                     )}
//                   </button>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   New Password
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showPasswords.new ? 'text' : 'password'}
//                     value={passwordForm.newPassword}
//                     onChange={(e) => setPasswordForm(prev => ({
//                       ...prev,
//                       newPassword: e.target.value
//                     }))}
//                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
//                     placeholder="Enter new password"
//                     minLength={8}
//                     required
//                   />
//                   <button
//                     type="button"
//                     className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                     onClick={() => setShowPasswords(prev => ({
//                       ...prev,
//                       new: !prev.new
//                     }))}
//                   >
//                     {showPasswords.new ? (
//                       <EyeOff className="w-4 h-4 text-gray-400 dark:text-gray-500" />
//                     ) : (
//                       <Eye className="w-4 h-4 text-gray-400 dark:text-gray-500" />
//                     )}
//                   </button>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   Confirm New Password
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showPasswords.confirm ? 'text' : 'password'}
//                     value={passwordForm.confirmPassword}
//                     onChange={(e) => setPasswordForm(prev => ({
//                       ...prev,
//                       confirmPassword: e.target.value
//                     }))}
//                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
//                     placeholder="Confirm new password"
//                     minLength={8}
//                     required
//                   />
//                   <button
//                     type="button"
//                     className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                     onClick={() => setShowPasswords(prev => ({
//                       ...prev,
//                       confirm: !prev.confirm
//                     }))}
//                   >
//                     {showPasswords.confirm ? (
//                       <EyeOff className="w-4 h-4 text-gray-400 dark:text-gray-500" />
//                     ) : (
//                       <Eye className="w-4 h-4 text-gray-400 dark:text-gray-500" />
//                     )}
//                   </button>
//                 </div>
//               </div>

//               <div>
//                 <button
//                   type="submit"
//                   disabled={passwordLoading}
//                   className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 dark:hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                 >
//                   {passwordLoading ? (
//                     <>
//                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
//                       Updating Password...
//                     </>
//                   ) : (
//                     <>
//                       <Save className="w-4 h-4 mr-2" />
//                       Update Password
//                     </>
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default UserProfileData;







import React, { useRef, useEffect, useState } from 'react';
import {
  Calendar,
  CreditCard,
  Clock,
  MapPin,
  User,
  Send,
  Users,
  Mail,
  Lock,
  Settings,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  XCircle,
  MoreVertical,
  Trash2,
  MessageCircle,
  Image as ImageIcon,
  Upload,
  Download
} from 'lucide-react';
import { type Booking, type Payment, type Notification } from '../../services/profile';
import { ChatMessage } from '../../services/chatService';
import { paymentAPI } from '../../services/hallPayment';
import toast from 'react-hot-toast';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface UserProfileDataProps {
  activeTab: string;
  user: UserProfile;
  bookings: Booking[];
  payments: Payment[];
  notifications: Notification[];
  dataLoading: boolean;
  messages: ChatMessage[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  isConnected: boolean;
  isTyping: boolean;
  connectWebSocket: () => void;
  sendMessage: () => void;
  clearChat?: () => Promise<void>;
  onImageUpload?: (imageFile: File) => Promise<void>;
  validateImageFile?: (file: File) => { valid: boolean; error?: string };
  passwordForm: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  setPasswordForm: React.Dispatch<React.SetStateAction<{
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>>;
  showPasswords: {
    current: boolean;
    new: boolean;
    confirm: boolean;
  };
  setShowPasswords: React.Dispatch<React.SetStateAction<{
    current: boolean;
    new: boolean;
    confirm: boolean;
  }>>;
  passwordLoading: boolean;
  handlePasswordChange: (e: React.FormEvent) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  formatTime: (date: Date | string) => string;
  getStatusBadge: (status: string, type?: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}

const UserProfileData: React.FC<UserProfileDataProps> = ({
  activeTab,
  user,
  bookings,
  payments,
  notifications,
  dataLoading,
  messages,
  newMessage,
  setNewMessage,
  isConnected,
  isTyping,
  connectWebSocket,
  sendMessage,
  clearChat,
  onImageUpload,
  validateImageFile,
  passwordForm,
  setPasswordForm,
  showPasswords,
  setShowPasswords,
  passwordLoading,
  handlePasswordChange,
  markNotificationAsRead,
  formatCurrency,
  formatDate,
  formatTime,
  getStatusBadge,
  getStatusIcon,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Download receipt function
  const handleDownloadReceipt = async (transactionId: string) => {
    try {
      const blob = await paymentAPI.downloadReceipt(transactionId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `receipt-${transactionId}.pdf`;
      
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Receipt downloaded successfully!');
    } catch (error: any) {
      console.error('Error downloading receipt:', error);
      toast.error(error.message || 'Failed to download receipt');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close chat settings when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showChatSettings) {
        const target = event.target as Element;
        if (!target.closest('[data-chat-settings]')) {
          setShowChatSettings(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showChatSettings]);

  const handleClearChat = async () => {
    if (clearChat) {
      await clearChat();
      setShowChatSettings(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onImageUpload) return;

    // Validate image file
    if (validateImageFile) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }
    } else {
      // Basic validation
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
    }

    try {
      setIsUploadingImage(true);
      await onImageUpload(file);
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const renderMessageContent = (msg: ChatMessage) => {
    if (msg.isDeleted) {
      return (
        <div className="italic text-gray-500 dark:text-gray-400">
          {msg.messageType === 'image' ? 'This image has been deleted' : 'This message has been deleted'}
        </div>
      );
    }

    if (msg.messageType === 'image' && msg.imageUrl) {
      return (
        <div className="space-y-2">
          <img 
            src={msg.imageUrl} 
            alt="Shared image" 
            className="max-w-full h-auto rounded-lg max-h-64 object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          {msg.message && msg.message !== '[IMAGE]' && (
            <p className="text-sm">{msg.message}</p>
          )}
        </div>
      );
    }

    return <p className="text-sm">{msg.message}</p>;
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 dark:text-gray-300">Loading data...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Bookings</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{bookings.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Spent</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0))}
                  </p>
                </div>
                <span className="text-2xl">₦</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending Payments</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {payments.filter(p => p.status === 'pending').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            </div>
            <div className="p-6">
              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No bookings yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.slice(0, 3).map((booking) => (
                    <div key={booking._id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-shrink-0">
                        {getStatusIcon(booking.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{booking.hallId.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Event Date: {formatDate(booking.eventDates[0])}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={getStatusBadge(booking.status)}>
                          {booking.status}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {formatCurrency(booking.totalAmount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BOOKINGS TAB */}
      {activeTab === 'bookings' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Bookings</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">View and manage your hall bookings</p>
          </div>
          
          <div className="p-6">
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No bookings found</h3>
                <p className="text-gray-500 dark:text-gray-400">You haven't made any bookings yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking._id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {booking.hallId.name}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            <div className={getStatusBadge(booking.status)}>
                              {booking.status}
                            </div>
                            <div className={getStatusBadge(booking.paymentStatus, 'payment')}>
                              {booking.paymentStatus}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{booking.hallId.location || 'Location not specified'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span>{formatDate(booking.eventDates[0])}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 flex-shrink-0" />
                            <span>Event: {booking.eventType}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span>{formatCurrency(booking.totalAmount)}</span>
                          </div>
                          {booking.additionalHours > 0 && (
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 flex-shrink-0" />
                              <span>Extra Hours: {booking.additionalHours}</span>
                            </div>
                          )}
                          {booking.banquetChairs > 0 && (
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 flex-shrink-0" />
                              <span>Extra Chairs: {booking.banquetChairs}</span>
                            </div>
                          )}
                        </div>

                        {/* Additional booking details */}
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <div>Base Price: {formatCurrency(booking.basePrice)}</div>
                            {booking.additionalHoursPrice > 0 && (
                              <div>Additional Hours: {formatCurrency(booking.additionalHoursPrice)}</div>
                            )}
                            {booking.banquetChairsPrice > 0 && (
                              <div>Extra Chairs: {formatCurrency(booking.banquetChairsPrice)}</div>
                            )}
                            <div>Caution Fee: {formatCurrency(booking.cautionFee)}</div>
                          </div>
                          
                          {booking.specialRequests && (
                            <div className="mt-2">
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Special Requests: </span>
                              <span className="text-xs text-gray-600 dark:text-gray-400">{booking.specialRequests}</span>
                            </div>
                          )}
                        </div>
                        
                        {booking.paymentReference && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Reference: {booking.paymentReference}
                          </p>
                        )}
                      </div>
                      
                      <div className="sm:text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          Booked: {formatDate(booking.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PAYMENTS TAB */}
      {activeTab === 'payments' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment History</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">View all your payment transactions</p>
          </div>
          
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No payments found</h3>
              <p className="text-gray-500 dark:text-gray-400">You haven't made any payments yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Hall
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Receipt
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {payment.transactionId}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {payment.referenceNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {typeof payment.bookingId === 'object' && payment.bookingId.hallId ? 
                          payment.bookingId.hallId.name : 
                          'Hall not available'
                        }
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white capitalize">
                        {payment.method}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className={getStatusBadge(payment.status, 'payment')}>
                          {payment.status}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(payment.createdAt)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {payment.status === 'completed' && (
                          <button
                            onClick={() => handleDownloadReceipt(payment.transactionId)}
                            className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 dark:hover:bg-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            title="Download Receipt"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            PDF
                          </button>
                        )}
                        {payment.status !== 'completed' && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CHAT TAB */}
      {activeTab === 'chat' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-[600px]">
          {/* Chat Header with Settings */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Support</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span>{isConnected ? 'Connected' : 'Connecting...'}</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {!isConnected && (
                <button
                  onClick={connectWebSocket}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 dark:hover:bg-red-500 transition-colors"
                >
                  Reconnect
                </button>
              )}
              
              {/* Chat Settings Dropdown */}
              <div className="relative" data-chat-settings>
                <button
                  onClick={() => setShowChatSettings(!showChatSettings)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                
                {showChatSettings && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="py-2">
                      {clearChat && (
                        <button
                          onClick={handleClearChat}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Clear Chat History</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No messages yet. Start a conversation!</p>
                  {!isConnected && (
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                      Connecting to chat server...
                    </p>
                  )}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.senderId._id === user._id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.senderId._id === user._id
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    {renderMessageContent(msg)}
                    <p className={`text-xs mt-1 ${
                      msg.senderId._id === user._id ? 'text-red-200' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2 sm:space-x-3">
              {/* Hidden file input for image upload */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageFileSelect}
                accept="image/*"
                className="hidden"
              />
              
              {/* Image Upload Button */}
              <button
                onClick={handleImageUploadClick}
                disabled={!isConnected || isUploadingImage}
                className="flex-shrink-0 flex items-center justify-center w-10 h-10 sm:px-3 sm:py-2 sm:w-auto sm:h-auto border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Upload image"
              >
                {isUploadingImage ? (
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <ImageIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                )}
              </button>
              
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 min-w-0 px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
                disabled={!isConnected}
              />
              
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || !isConnected}
                className="flex-shrink-0 flex items-center justify-center w-10 h-10 sm:px-4 sm:py-2 sm:w-auto sm:h-auto bg-red-600 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            {!isConnected && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {isConnected ? 'Connected to chat' : 'Connecting to chat server...'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Stay updated with your booking status</p>
          </div>
          
          <div className="p-6">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications</h3>
                <p className="text-gray-500 dark:text-gray-400">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification._id} 
                    className={`p-4 rounded-lg border-l-4 cursor-pointer transition-colors ${
                      notification.read 
                        ? 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600' 
                        : notification.type === 'success' 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600'
                          : notification.type === 'info'
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600'
                            : notification.type === 'warning'
                              ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 dark:border-yellow-600'
                              : 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600'
                    }`}
                    onClick={() => markNotificationAsRead(notification._id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className={`font-medium ${
                            notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                          )}
                        </div>
                        <p className={`text-sm mt-1 ${
                          notification.read ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-200'
                        }`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Account Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
                  <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span>{user.name}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
                  <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span>{user.email}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Member Since
                </label>
                <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
                  <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span>{formatDate(user.createdAt)}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Type
                </label>
                <div className="flex items-center space-x-2 text-gray-900 dark:text-white capitalize">
                  <Settings className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span>{user.role}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({
                      ...prev,
                      currentPassword: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPasswords(prev => ({
                      ...prev,
                      current: !prev.current
                    }))}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({
                      ...prev,
                      newPassword: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter new password"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPasswords(prev => ({
                      ...prev,
                      new: !prev.new
                    }))}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({
                      ...prev,
                      confirmPassword: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Confirm new password"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPasswords(prev => ({
                      ...prev,
                      confirm: !prev.confirm
                    }))}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 dark:hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {passwordLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfileData;