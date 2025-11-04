import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageCircle, 
  Search,
  ArrowLeft,
  Send,
  Image as ImageIcon,
  MoreVertical,
  Trash2,
  User,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { authAPI } from '../../../services/api';
import { chatAPIService, type ChatMessage, type Conversation } from '../../../services/chatService';
import { useChat } from '../../../services/useChat';
import toast from 'react-hot-toast';

interface AdminUser {
  _id: string;
  name: string;
  email?: string;
  role: string;
}

const AdminChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [historyMessages, setHistoryMessages] = useState<ChatMessage[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Chat hook - only initialize when conversation is selected
  const chatReady = Boolean(selectedConversation && currentAdmin);
  const {
    messages,
    isConnected,
    isTyping,
    sendMessage: sendChatMessage,
    clearChat,
    error: chatError,
    markAsRead,
    connect,
    isLoading: chatLoading,
    sendImageMessage,
    validateImageFile,
  } = useChat(selectedConversation || '', {
    autoConnect: chatReady,
    autoJoin: chatReady,
    markAsReadOnFocus: true
  });

  // ✅ Merge history + live messages
  const allMessages = [...historyMessages, ...messages];

  const [newMessage, setNewMessage] = useState('');
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Debug: Log conversation selection
  useEffect(() => {
    console.log('ADMIN CHAT DEBUG:', {
      selectedConversation,
      chatReady,
      isConnected,
      chatLoading,
      historyLoading,
      historyLoaded,
      messagesCount: allMessages.length,
      historyMessagesCount: historyMessages.length,
      liveMessagesCount: messages.length
    });
  }, [selectedConversation, chatReady, isConnected, chatLoading, historyLoading, historyLoaded, allMessages.length, historyMessages.length, messages.length]);

  // Fetch admin profile
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        setLoading(true);
        const response = await authAPI.getUserProfile();
        if (response.success) {
          setCurrentAdmin(response.data.user);
        }
      } catch (error: any) {
        console.error('Error fetching admin profile:', error);
        toast.error('Failed to load admin profile');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminProfile();
  }, []);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setConversationsLoading(true);
      const response = await chatAPIService.getUserConversations(1, 50);
      setConversations(response.conversations);
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setConversationsLoading(false);
    }
  };

  useEffect(() => {
    if (currentAdmin) {
      fetchConversations();
    }
  }, [currentAdmin]);

  // ✅ Clear unread count when conversation is selected
  const clearUnreadCount = (conversationId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.conversationId === conversationId 
        ? { ...conv, unreadCount: 0 }
        : conv
    ));
  };

  // ✅ Load chat history when conversation is selected
  useEffect(() => {
    const loadConversationHistory = async () => {
      if (!selectedConversation) {
        console.log('❌ No conversation selected, skipping history load');
        setHistoryMessages([]);
        setHistoryLoaded(false);
        return;
      }

      try {
        console.log('🎯 Loading conversation history for:', selectedConversation);
        setHistoryLoading(true);
        setHistoryLoaded(false);
        
        const history = await chatAPIService.getConversationHistory(selectedConversation, 1, 50);
        
        console.log(`✅ Loaded ${history.messages.length} history messages`);
        setHistoryMessages(history.messages);
        setHistoryLoaded(true);
        
        // Clear unread count when history is loaded
        clearUnreadCount(selectedConversation);
        
        // Mark as read after loading history
        if (isConnected) {
          markAsRead();
        }
      } catch (err) {
        console.error('❌ Failed to load conversation history:', err);
        toast.error('Failed to load conversation history');
        setHistoryMessages([]);
        setHistoryLoaded(true);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadConversationHistory();
  }, [selectedConversation, isConnected, markAsRead]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (allMessages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [allMessages]);

  // Mark as read when conversation is selected and connected
  useEffect(() => {
    if (selectedConversation && isConnected && allMessages.length > 0) {
      markAsRead();
      // Clear unread count when marking as read
      clearUnreadCount(selectedConversation);
    }
  }, [selectedConversation, isConnected, allMessages.length, markAsRead]);

  // Clear unread count when connection is established
  useEffect(() => {
    if (selectedConversation && isConnected) {
      clearUnreadCount(selectedConversation);
    }
  }, [selectedConversation, isConnected]);

  // Show chat error
  useEffect(() => {
    if (chatError && !chatError.includes('Failed to connect')) {
      toast.error(chatError);
    }
  }, [chatError]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
    }
  };

  const getCustomerFromConversation = (conv: Conversation) => {
    return conv.participants.find(p => p.role === 'customer') || conv.participants[0];
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await sendChatMessage(newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid image file');
      return;
    }

    try {
      setIsUploadingImage(true);
      await sendImageMessage(file);
      toast.success('Image sent successfully');
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error('Failed to send image');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearChat = async () => {
    if (!selectedConversation || !window.confirm('Are you sure you want to clear this chat?')) return;

    try {
      await clearChat();
      setHistoryMessages([]);
      setHistoryLoaded(true);
      toast.success('Chat cleared successfully');
      setShowChatSettings(false);
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

  const handleSelectConversation = async (conversationId: string) => {
    console.log('🔄 Selecting conversation:', conversationId);
    
    // Clear current selection first
    setSelectedConversation(null);
    setHistoryMessages([]);
    setHistoryLoaded(false);
    setShowMobileChat(false);
    
    // Small delay to ensure clean state
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Set new conversation and clear unread count
    setSelectedConversation(conversationId);
    clearUnreadCount(conversationId);
    setShowMobileChat(true);
    
    console.log('✅ Conversation selected:', conversationId);
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
    setSelectedConversation(null);
    setHistoryMessages([]);
    setHistoryLoaded(false);
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
            className="max-w-full h-auto rounded-lg max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(msg.imageUrl, '_blank')}
          />
          {msg.message && msg.message !== '[IMAGE]' && (
            <p className="text-sm">{msg.message}</p>
          )}
        </div>
      );
    }

    return <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>;
  };

  // ✅ Determine if we should show loading state
  const showMessagesLoading = historyLoading && !historyLoaded;
  const showEmptyState = historyLoaded && allMessages.length === 0;

  const filteredConversations = conversations.filter(conv => {
    const customer = getCustomerFromConversation(conv);
    return customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           conv.lastMessage.message.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedConvData = conversations.find(c => c.conversationId === selectedConversation);
  const selectedCustomer = selectedConvData ? getCustomerFromConversation(selectedConvData) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 dark:text-gray-300">Loading chat...</span>
        </div>
      </div>
    );
  }

  if (!currentAdmin) {
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
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-6 h-6 text-red-600" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Chat</h1>
          </div>
          <button
            onClick={fetchConversations}
            disabled={conversationsLoading}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            title="Refresh conversations"
          >
            <RefreshCw className={`w-5 h-5 ${conversationsLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className={`w-full lg:w-1/3 xl:w-1/4 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col ${showMobileChat ? 'hidden lg:flex' : 'flex'}`}>
          {/* Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {conversationsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <Users className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredConversations.map((conv) => {
                  const customer = getCustomerFromConversation(conv);
                  const isSelected = conv.conversationId === selectedConversation;
                  
                  return (
                    <button
                      key={conv.conversationId}
                      onClick={() => handleSelectConversation(conv.conversationId)}
                      className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        isSelected ? 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {customer.name}
                            </h3>
                            {conv.unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {conv.lastMessage.messageType === 'image' ? '📷 Image' : conv.lastMessage.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {formatDate(conv.lastMessage.createdAt)} • {formatTime(conv.lastMessage.createdAt)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 ${!showMobileChat ? 'hidden lg:flex' : 'flex'}`}>
          {!selectedConversation ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <MessageCircle className="w-20 h-20 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose a conversation from the list to start chatting
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleBackToList}
                      className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {selectedCustomer?.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span>{isConnected ? 'Connected' : 'Connecting...'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!isConnected && (
                      <button
                        onClick={handleReconnect}
                        className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 dark:hover:bg-red-500 transition-colors"
                      >
                        Reconnect
                      </button>
                    )}
                    
                    <div className="relative">
                      <button
                        onClick={() => setShowChatSettings(!showChatSettings)}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      
                      {showChatSettings && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                          <button
                            onClick={handleClearChat}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Clear Chat</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* ✅ Show loading only when actively loading history */}
                {showMessagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-500 dark:text-gray-400">Loading messages...</p>
                    </div>
                  </div>
                ) : 
                /* ✅ Show empty state when no messages after loading */
                showEmptyState ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageCircle className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                        Start a conversation with {selectedCustomer?.name}
                      </p>
                    </div>
                  </div>
                ) : 
                /* ✅ Show messages when we have them */
                allMessages.length > 0 ? (
                  <>
                    {allMessages.map((msg) => {
                      const isOwnMessage = msg.senderRole === 'admin' || msg.senderRole === 'staff';
                      
                      return (
                        <div
                          key={msg._id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                              isOwnMessage
                                ? 'bg-red-600 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            {renderMessageContent(msg)}
                            <p className={`text-xs mt-1 ${
                              isOwnMessage ? 'text-red-200' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                ) : null}
              </div>

              {/* Message Input */}
              <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-4">
                <div className="flex space-x-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  <button
                    onClick={handleImageUploadClick}
                    disabled={!isConnected || isUploadingImage}
                    className="flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    disabled={!isConnected}
                  />
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || !isConnected}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                {!isConnected && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Connecting to chat server...
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChatPage;