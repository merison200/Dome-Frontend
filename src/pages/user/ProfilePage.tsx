// import React, { useState, useEffect } from 'react';
// import { 
//   User, 
//   Calendar, 
//   CreditCard, 
//   Bell, 
//   Settings, 
//   MessageCircle,
//   XCircle
// } from 'lucide-react';
// import { authAPI } from '../../services/api';
// import { userProfileAPI, type Booking, type Payment, type Notification } from '../../services/profile';
// import { useChat } from '../../services/useChat';
// import { chatAPIService, type ChatMessage } from '../../services/chatService';
// import toast from 'react-hot-toast';
// import UserProfileData from './UserProfileData';

// interface UserProfile {
//   _id: string;
//   name: string;
//   email: string;
//   role: string;
//   createdAt: string;
//   updatedAt: string;
// }

// const ProfilePage = () => {
//   // State management
//   const [activeTab, setActiveTab] = useState('overview');
//   const [user, setUser] = useState<UserProfile | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [dataLoading, setDataLoading] = useState(false);
  
//   // Real data from API
//   const [bookings, setBookings] = useState<Booking[]>([]);
//   const [payments, setPayments] = useState<Payment[]>([]);
//   const [notifications, setNotifications] = useState<Notification[]>([]);

//   // Chat integration
//   const chatReady = Boolean(user && user._id);
//   const conversationId = chatReady ? `user_${user!._id}_admin` : '';

//   const {
//     messages,
//     isConnected,
//     isTyping,
//     sendMessage: sendChatMessage,
//     clearChat,
//     setTyping,
//     error: chatError,
//     unreadCount: chatUnreadCount,
//     markAsRead,
//     connect,
//     isLoading: chatLoading,
//     sendImageMessage,
//     uploadImageMessage,
//     validateImageFile
//   } = useChat(conversationId, {
//     autoConnect: chatReady,
//     autoJoin: chatReady,
//     markAsReadOnFocus: true
//   });

//   // Chat UI state
//   const [newMessage, setNewMessage] = useState('');
//   const [historyMessages, setHistoryMessages] = useState<ChatMessage[]>([]); // ✅ history support

//   const [passwordForm, setPasswordForm] = useState({
//     currentPassword: '',
//     newPassword: '',
//     confirmPassword: ''
//   });

//   const [showPasswords, setShowPasswords] = useState({
//     current: false,
//     new: false,
//     confirm: false
//   });

//   const [passwordLoading, setPasswordLoading] = useState(false);
//   const [message, setMessage] = useState({ type: '', text: '' });

//   // Debug logs
//   useEffect(() => {
//     console.log('CHAT STATE DEBUG:', {
//       userLoaded: !!user,
//       userId: user?._id,
//       chatReady,
//       conversationId,
//       messagesCount: messages.length,
//       isConnected,
//       chatLoading
//     });
//   }, [user, chatReady, conversationId, messages.length, isConnected, chatLoading]);

//   // Fetch user profile
//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       try {
//         setLoading(true);
//         const response = await authAPI.getUserProfile();
//         if (response.success) {
//           setUser(response.data.user);
//         }
//       } catch (error: any) {
//         console.error('Error fetching user profile:', error);
//         toast.error(error?.response?.data?.message || 'Failed to load user profile');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchUserProfile();
//   }, []);

//   // Fetch profile data (bookings, payments, notifications)
//   useEffect(() => {
//     const fetchProfileData = async () => {
//       if (!user) return;
//       try {
//         setDataLoading(true);
//         const profileData = await userProfileAPI.getProfileSummary();
//         if (profileData.success) {
//           setBookings(profileData.bookings);
//           setPayments(profileData.payments);
//           setNotifications(profileData.notifications);
//         }
//       } catch (error: any) {
//         console.error('Error fetching profile data:', error);
//         toast.error(error?.response?.data?.message || 'Failed to load profile data');
//       } finally {
//         setDataLoading(false);
//       }
//     };
//     fetchProfileData();
//   }, [user]);

//   // ✅ Fetch chat history
//   useEffect(() => {
//     const fetchChatHistory = async () => {
//       if (!conversationId || !chatReady) return;
//       try {
//         const res = await chatAPIService.getConversationHistory(conversationId);
//         if (res?.messages) {
//           setHistoryMessages(res.messages);
//         }
//       } catch (err) {
//         console.error('Error fetching chat history:', err);
//       }
//     };
//     fetchChatHistory();
//   }, [conversationId, chatReady]);

//   // Handle chat tab activation
//   useEffect(() => {
//     if (activeTab === 'chat' && user && conversationId && isConnected) {
//       markAsRead();
//     }
//   }, [activeTab, user, conversationId, markAsRead, isConnected]);

//   // Show chat error
//   useEffect(() => {
//     if (chatError && !chatError.includes('Failed to connect')) {
//       toast.error(chatError);
//     }
//   }, [chatError]);

//   // Password validation
//   const validatePassword = (password: string): boolean =>
//     password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && 
//     /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

//   // Chat functions
//   const sendMessage = async () => {
//     if (!newMessage.trim()) return;
//     try {
//       await sendChatMessage(newMessage.trim());
//       setNewMessage('');
//     } catch (error) {
//       console.error('Failed to send message:', error);
//       toast.error('Failed to send message. Please try again.');
//     }
//   };

//   const handleImageUpload = async (imageFile: File) => {
//     try {
//       await sendImageMessage(imageFile);
//       toast.success('Image sent successfully');
//     } catch (error) {
//       console.error('WebSocket image send failed, trying HTTP:', error);
//       try {
//         await uploadImageMessage(imageFile);
//         toast.success('Image uploaded successfully');
//       } catch (httpError) {
//         console.error('HTTP image upload failed:', httpError);
//         toast.error('Failed to send image');
//       }
//     }
//   };

//   const handleClearChat = async () => {
//     if (!window.confirm('Are you sure you want to clear this chat?')) return;
//     try {
//       await clearChat();
//       setHistoryMessages([]); // ✅ clear local
//       toast.success('Chat cleared successfully');
//     } catch (error) {
//       console.error('Failed to clear chat:', error);
//       toast.error('Failed to clear chat');
//     }
//   };

//   const handleReconnect = async () => {
//     try {
//       await connect();
//       toast.success('Reconnecting to chat...');
//     } catch (error) {
//       console.error('Manual reconnect failed:', error);
//       toast.error('Failed to reconnect');
//     }
//   };

//   // Helpers
//   const formatCurrency = (amount: number) =>
//     new Intl.NumberFormat('en-NG', {
//       style: 'currency',
//       currency: 'NGN',
//       minimumFractionDigits: 0
//     }).format(amount);

//   const formatDate = (dateString: string) =>
//     new Date(dateString).toLocaleDateString('en-NG', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });

//   const formatTime = (date: Date | string) => {
//     const dateObj = typeof date === 'string' ? new Date(date) : date;
//     return dateObj.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
//   };

//   const getStatusBadge = (status: string, type = 'booking'): string => {
//     const base = "px-2 py-1 text-xs font-semibold rounded-full";
//     if (type === 'booking') {
//       switch (status) {
//         case 'confirmed': return `${base} bg-green-100 text-green-800`;
//         case 'pending': return `${base} bg-yellow-100 text-yellow-800`;
//         case 'cancelled': return `${base} bg-red-100 text-red-800`;
//         case 'completed': return `${base} bg-blue-100 text-blue-800`;
//         default: return `${base} bg-gray-100 text-gray-800`;
//       }
//     } else {
//       switch (status) {
//         case 'completed':
//         case 'paid': return `${base} bg-green-100 text-green-800`;
//         case 'pending':
//         case 'processing': return `${base} bg-yellow-100 text-yellow-800`;
//         case 'failed': return `${base} bg-red-100 text-red-800`;
//         default: return `${base} bg-gray-100 text-gray-800`;
//       }
//     }
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'confirmed':
//       case 'completed':
//       case 'paid': return <div className="w-4 h-4 bg-green-600 rounded-full"></div>;
//       case 'pending':
//       case 'processing': return <div className="w-4 h-4 bg-yellow-600 rounded-full"></div>;
//       case 'cancelled':
//       case 'failed': return <div className="w-4 h-4 bg-red-600 rounded-full"></div>;
//       default: return <div className="w-4 h-4 bg-gray-600 rounded-full"></div>;
//     }
//   };

//   const handlePasswordChange = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (passwordForm.newPassword !== passwordForm.confirmPassword) {
//       setMessage({ type: 'error', text: 'New passwords do not match' });
//       toast.error('New passwords do not match');
//       return;
//     }
//     if (!validatePassword(passwordForm.newPassword)) {
//       setMessage({ type: 'error', text: 'Password must be at least 8 characters with a capital letter, number, and special character' });
//       toast.error('Password must be at least 8 characters with a capital letter, number, and special character');
//       return;
//     }
//     if (!window.confirm('Are you sure you want to change your password?')) return;
//     setPasswordLoading(true);
//     try {
//       await authAPI.changePassword(passwordForm);
//       setMessage({ type: 'success', text: 'Password updated successfully' });
//       setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
//       toast.success('Password updated successfully!');
//     } catch (error: any) {
//       const errorMessage = error?.response?.data?.message || 'Failed to update password';
//       setMessage({ type: 'error', text: errorMessage });
//       toast.error(errorMessage);
//     } finally {
//       setPasswordLoading(false);
//     }
//   };

//   const markNotificationAsRead = async (id: string) => {
//     try {
//       await userProfileAPI.markNotificationRead(id);
//       setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
//     } catch (error) {
//       console.error('Error marking notification as read:', error);
//     }
//   };

//   useEffect(() => {
//     if (message.text) {
//       const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [message]);

//   const unreadNotifications = notifications.filter(n => !n.read).length;

//   // ✅ Merge history + live
//   const allMessages = [...historyMessages, ...messages];

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
//         <div className="flex items-center space-x-2">
//           <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
//           <span className="text-gray-600 dark:text-gray-300">Loading profile...</span>
//         </div>
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
//         <div className="text-center">
//           <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
//           <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Failed to load profile</h2>
//           <p className="text-gray-600 dark:text-gray-300">Please try refreshing the page</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
//       {/* Header */}
//       <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-6">
//             <div className="flex items-center space-x-4">
//               <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
//                 <User className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Profile</h1>
//                 <p className="text-sm text-gray-600 dark:text-gray-300">Manage your account and bookings</p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-4">
//               <div className="relative">
//                 <button 
//                   onClick={() => setActiveTab('notifications')}
//                   className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 relative transition-colors"
//                 >
//                   <Bell className="w-6 h-6" />
//                   {unreadNotifications > 0 && (
//                     <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
//                       {unreadNotifications}
//                     </span>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Message Display */}
//       {message.text && (
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
//           <div className={`p-4 rounded-md ${
//             message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800' :
//             message.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800' :
//             'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
//           }`}>
//             {message.text}
//           </div>
//         </div>
//       )}

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="flex flex-col lg:flex-row gap-8">
//           {/* Sidebar */}
//           <div className="lg:w-1/4">
//             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
//               {/* User Info */}
//               <div className="p-6 bg-red-50 dark:bg-red-900/20 border-b border-gray-200 dark:border-gray-700">
//                 <div className="text-center">
//                   <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
//                     <User className="w-8 h-8 text-white" />
//                   </div>
//                   <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{user.name}</h3>
//                   <p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
//                   <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                     Member since {formatDate(user.createdAt)}
//                   </p>
//                 </div>
//               </div>

//               {/* Navigation */}
//               <div className="p-4 space-y-1">
//                 <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-3 py-2 rounded-md flex items-center space-x-3 transition-colors ${activeTab === 'overview' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
//                   <User className="w-4 h-4" />
//                   <span>Overview</span>
//                 </button>
//                 <button onClick={() => setActiveTab('bookings')} className={`w-full text-left px-3 py-2 rounded-md flex items-center space-x-3 transition-colors ${activeTab === 'bookings' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
//                   <Calendar className="w-4 h-4" />
//                   <span>My Bookings</span>
//                 </button>
//                 <button onClick={() => setActiveTab('payments')} className={`w-full text-left px-3 py-2 rounded-md flex items-center space-x-3 transition-colors ${activeTab === 'payments' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
//                   <CreditCard className="w-4 h-4" />
//                   <span>Payment History</span>
//                 </button>
//                 <button onClick={() => setActiveTab('chat')} className={`w-full text-left px-3 py-2 rounded-md flex items-center space-x-3 transition-colors ${activeTab === 'chat' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
//                   <MessageCircle className="w-4 h-4" />
//                   <span>Chat with Admin</span>
//                   <div className="flex items-center space-x-1">
//                     {chatLoading && <div className="w-2 h-2 bg-yellow-400 dark:bg-yellow-500 rounded-full animate-pulse"></div>}
//                     {!chatLoading && !isConnected && <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>}
//                     {!chatLoading && isConnected && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
//                     {chatUnreadCount > 0 && (
//                       <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
//                         {chatUnreadCount}
//                       </span>
//                     )}
//                   </div>
//                 </button>
//                 <button onClick={() => setActiveTab('notifications')} className={`w-full text-left px-3 py-2 rounded-md flex items-center space-x-3 transition-colors ${activeTab === 'notifications' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
//                   <Bell className="w-4 h-4" />
//                   <span className="flex items-center justify-between flex-1">
//                     Notifications
//                     {unreadNotifications > 0 && (
//                       <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
//                         {unreadNotifications}
//                       </span>
//                     )}
//                   </span>
//                 </button>
//                 <button onClick={() => setActiveTab('settings')} className={`w-full text-left px-3 py-2 rounded-md flex items-center space-x-3 transition-colors ${activeTab === 'settings' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
//                   <Settings className="w-4 h-4" />
//                   <span>Settings</span>
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Main Content */}
//           <div className="lg:w-3/4">
//             <UserProfileData
//               activeTab={activeTab}
//               user={user}
//               bookings={bookings}
//               payments={payments}
//               notifications={notifications}
//               dataLoading={dataLoading}
//               messages={allMessages}   // ✅ merged history + live
//               newMessage={newMessage}
//               setNewMessage={setNewMessage}
//               isConnected={isConnected}
//               isTyping={isTyping}
//               connectWebSocket={handleReconnect}
//               clearChat={handleClearChat}
//               sendMessage={sendMessage}
//               onImageUpload={handleImageUpload}
//               validateImageFile={validateImageFile}
//               passwordForm={passwordForm}
//               setPasswordForm={setPasswordForm}
//               showPasswords={showPasswords}
//               setShowPasswords={setShowPasswords}
//               passwordLoading={passwordLoading}
//               handlePasswordChange={handlePasswordChange}
//               markNotificationAsRead={markNotificationAsRead}
//               formatCurrency={formatCurrency}
//               formatDate={formatDate}
//               formatTime={formatTime}
//               getStatusBadge={getStatusBadge}
//               getStatusIcon={getStatusIcon}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;







import React, { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  CreditCard, 
  Bell, 
  Settings, 
  MessageCircle,
  XCircle
} from 'lucide-react';
import { authAPI } from '../../services/api';
import { userProfileAPI, type Booking, type Payment, type Notification } from '../../services/profile';
import { useChat } from '../../services/useChat';
import { chatAPIService, type ChatMessage } from '../../services/chatService';
import toast from 'react-hot-toast';
import UserProfileData from './UserProfileData';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

const ProfilePage = () => {
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  
  // Real data from API
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Chat integration
  const chatReady = Boolean(user && user._id);
  const conversationId = chatReady ? `user_${user!._id}_admin` : '';

  const {
    messages,
    isConnected,
    isTyping,
    sendMessage: sendChatMessage,
    clearChat,
    setTyping,
    error: chatError,
    unreadCount: chatUnreadCount,
    markAsRead,
    connect,
    isLoading: chatLoading,
    sendImageMessage,
    uploadImageMessage,
    validateImageFile
  } = useChat(conversationId, {
    autoConnect: chatReady,
    autoJoin: chatReady,
    markAsReadOnFocus: true
  });

  // Chat UI state
  const [newMessage, setNewMessage] = useState('');
  const [historyMessages, setHistoryMessages] = useState<ChatMessage[]>([]); // ✅ history support

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Debug logs
  useEffect(() => {
    console.log('CHAT STATE DEBUG:', {
      userLoaded: !!user,
      userId: user?._id,
      chatReady,
      conversationId,
      messagesCount: messages.length,
      isConnected,
      chatLoading
    });
  }, [user, chatReady, conversationId, messages.length, isConnected, chatLoading]);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await authAPI.getUserProfile();
        if (response.success) {
          setUser(response.data.user);
        }
      } catch (error: any) {
        console.error('Error fetching user profile:', error);
        toast.error(error?.response?.data?.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  // Fetch profile data (bookings, payments, notifications)
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      try {
        setDataLoading(true);
        const profileData = await userProfileAPI.getProfileSummary();
        if (profileData.success) {
          setBookings(profileData.bookings);
          setPayments(profileData.payments);
          setNotifications(profileData.notifications);
        }
      } catch (error: any) {
        console.error('Error fetching profile data:', error);
        toast.error(error?.response?.data?.message || 'Failed to load profile data');
      } finally {
        setDataLoading(false);
      }
    };
    fetchProfileData();
  }, [user]);

  // ✅ Fetch chat history
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!conversationId || !chatReady) return;
      try {
        const res = await chatAPIService.getConversationHistory(conversationId);
        if (res?.messages) {
          setHistoryMessages(res.messages);
        }
      } catch (err) {
        console.error('Error fetching chat history:', err);
      }
    };
    fetchChatHistory();
  }, [conversationId, chatReady]);

  // Handle chat tab activation
  useEffect(() => {
    if (activeTab === 'chat' && user && conversationId && isConnected) {
      markAsRead();
    }
  }, [activeTab, user, conversationId, markAsRead, isConnected]);

  // Show chat error
  useEffect(() => {
    if (chatError && !chatError.includes('Failed to connect')) {
      toast.error(chatError);
    }
  }, [chatError]);

  // Password validation
  const validatePassword = (password: string): boolean =>
    password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && 
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  // Chat functions
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await sendChatMessage(newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  const handleImageUpload = async (imageFile: File) => {
    try {
      await sendImageMessage(imageFile);
      toast.success('Image sent successfully');
    } catch (error) {
      console.error('WebSocket image send failed, trying HTTP:', error);
      try {
        await uploadImageMessage(imageFile);
        toast.success('Image uploaded successfully');
      } catch (httpError) {
        console.error('HTTP image upload failed:', httpError);
        toast.error('Failed to send image');
      }
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm('Are you sure you want to clear this chat?')) return;
    try {
      await clearChat();
      setHistoryMessages([]); // ✅ clear local
      toast.success('Chat cleared successfully');
    } catch (error) {
      console.error('Failed to clear chat:', error);
      toast.error('Failed to clear chat');
    }
  };

  const handleReconnect = async () => {
    try {
      await connect();
      toast.success('Reconnecting to chat...');
    } catch (error) {
      console.error('Manual reconnect failed:', error);
      toast.error('Failed to reconnect');
    }
  };

  // Helpers
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);

  // Mobile-friendly date format with full year
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status: string, type = 'booking'): string => {
    const base = "px-2 py-1 text-xs font-semibold rounded-full";
    if (type === 'booking') {
      switch (status) {
        case 'confirmed': return `${base} bg-green-100 text-green-800`;
        case 'pending': return `${base} bg-yellow-100 text-yellow-800`;
        case 'cancelled': return `${base} bg-red-100 text-red-800`;
        case 'completed': return `${base} bg-blue-100 text-blue-800`;
        default: return `${base} bg-gray-100 text-gray-800`;
      }
    } else {
      switch (status) {
        case 'completed':
        case 'paid': return `${base} bg-green-100 text-green-800`;
        case 'pending':
        case 'processing': return `${base} bg-yellow-100 text-yellow-800`;
        case 'failed': return `${base} bg-red-100 text-red-800`;
        default: return `${base} bg-gray-100 text-gray-800`;
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
      case 'paid': return <div className="w-4 h-4 bg-green-600 rounded-full"></div>;
      case 'pending':
      case 'processing': return <div className="w-4 h-4 bg-yellow-600 rounded-full"></div>;
      case 'cancelled':
      case 'failed': return <div className="w-4 h-4 bg-red-600 rounded-full"></div>;
      default: return <div className="w-4 h-4 bg-gray-600 rounded-full"></div>;
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      toast.error('New passwords do not match');
      return;
    }
    if (!validatePassword(passwordForm.newPassword)) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters with a capital letter, number, and special character' });
      toast.error('Password must be at least 8 characters with a capital letter, number, and special character');
      return;
    }
    if (!window.confirm('Are you sure you want to change your password?')) return;
    setPasswordLoading(true);
    try {
      await authAPI.changePassword(passwordForm);
      setMessage({ type: 'success', text: 'Password updated successfully' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully!');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to update password';
      setMessage({ type: 'error', text: errorMessage });
      toast.error(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await userProfileAPI.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  // ✅ Merge history + live
  const allMessages = [...historyMessages, ...messages];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 dark:text-gray-300">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Failed to load profile</h2>
          <p className="text-gray-600 dark:text-gray-300">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Profile</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Manage your account and bookings</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button 
                  onClick={() => setActiveTab('notifications')}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 relative transition-colors"
                >
                  <Bell className="w-6 h-6" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className={`p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800' :
            message.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800' :
            'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
          }`}>
            {message.text}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* User Info */}
              <div className="p-6 bg-red-50 dark:bg-red-900/20 border-b border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Member since {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <div className="p-4 space-y-1">
                <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-3 py-2 rounded-md flex items-center space-x-3 transition-colors ${activeTab === 'overview' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                  <User className="w-4 h-4" />
                  <span>Overview</span>
                </button>
                <button onClick={() => setActiveTab('bookings')} className={`w-full text-left px-3 py-2 rounded-md flex items-center space-x-3 transition-colors ${activeTab === 'bookings' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                  <Calendar className="w-4 h-4" />
                  <span>My Bookings</span>
                </button>
                <button onClick={() => setActiveTab('payments')} className={`w-full text-left px-3 py-2 rounded-md flex items-center space-x-3 transition-colors ${activeTab === 'payments' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                  <CreditCard className="w-4 h-4" />
                  <span>Payment History</span>
                </button>
                <button onClick={() => setActiveTab('chat')} className={`w-full text-left px-3 py-2 rounded-md flex items-center space-x-3 transition-colors ${activeTab === 'chat' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat with Admin</span>
                  <div className="flex items-center space-x-1">
                    {chatLoading && <div className="w-2 h-2 bg-yellow-400 dark:bg-yellow-500 rounded-full animate-pulse"></div>}
                    {!chatLoading && !isConnected && <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>}
                    {!chatLoading && isConnected && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
                    {chatUnreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                        {chatUnreadCount}
                      </span>
                    )}
                  </div>
                </button>
                <button onClick={() => setActiveTab('notifications')} className={`w-full text-left px-3 py-2 rounded-md flex items-center space-x-3 transition-colors ${activeTab === 'notifications' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                  <Bell className="w-4 h-4" />
                  <span className="flex items-center justify-between flex-1">
                    Notifications
                    {unreadNotifications > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {unreadNotifications}
                      </span>
                    )}
                  </span>
                </button>
                <button onClick={() => setActiveTab('settings')} className={`w-full text-left px-3 py-2 rounded-md flex items-center space-x-3 transition-colors ${activeTab === 'settings' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <UserProfileData
              activeTab={activeTab}
              user={user}
              bookings={bookings}
              payments={payments}
              notifications={notifications}
              dataLoading={dataLoading}
              messages={allMessages}   // ✅ merged history + live
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              isConnected={isConnected}
              isTyping={isTyping}
              connectWebSocket={handleReconnect}
              clearChat={handleClearChat}
              sendMessage={sendMessage}
              onImageUpload={handleImageUpload}
              validateImageFile={validateImageFile}
              passwordForm={passwordForm}
              setPasswordForm={setPasswordForm}
              showPasswords={showPasswords}
              setShowPasswords={setShowPasswords}
              passwordLoading={passwordLoading}
              handlePasswordChange={handlePasswordChange}
              markNotificationAsRead={markNotificationAsRead}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              formatTime={formatTime}
              getStatusBadge={getStatusBadge}
              getStatusIcon={getStatusIcon}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;