import { useState, useEffect, useCallback, useRef } from 'react';
import { chatService, chatAPIService, ChatMessage, UserTyping, ImageUploadResponse } from './chatService';

interface UseChatOptions {
  autoConnect?: boolean;
  autoJoin?: boolean;
  markAsReadOnFocus?: boolean;
}

interface UseChatReturn {
  // Connection state
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Messages and conversation
  messages: ChatMessage[];
  hasMoreMessages: boolean;
  loadingMessages: boolean;
  
  // Typing indicators
  isTyping: boolean;
  usersTyping: UserTyping[];
  
  // Unread count
  unreadCount: number;
  
  // Image upload state
  isUploading: boolean;
  uploadProgress: number;
  
  // Actions
  sendMessage: (message: string) => Promise<void>;
  sendImageMessage: (imageFile: File) => Promise<void>;
  uploadImageMessage: (imageFile: File) => Promise<ImageUploadResponse>;
  loadMoreMessages: () => Promise<void>;
  clearChat: () => Promise<void>;
  markAsRead: () => Promise<void>;
  setTyping: (isTyping: boolean) => void;
  deleteMessage: (messageId: string) => Promise<void>;
  
  // Connection control
  connect: () => Promise<void>;
  disconnect: () => void;
  joinConversation: () => void;
  
  // Image validation
  validateImageFile: (file: File) => { valid: boolean; error?: string };
}

export const useChat = (
  conversationId: string, 
  options: UseChatOptions = {}
): UseChatReturn => {
  const {
    autoConnect = true,
    autoJoin = true,
    markAsReadOnFocus = true
  } = options;

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [usersTyping, setUsersTyping] = useState<UserTyping[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasJoinedConversation, setHasJoinedConversation] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false); // NEW: Track initial load

  // Refs
  const typingTimeoutRef = useRef<number | null>(null);
  const conversationRef = useRef(conversationId);
  const mountedRef = useRef(true);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const connectionAttempts = useRef(0);
  const maxConnectionAttempts = 5;

  // NEW: Reset state when conversation changes
  useEffect(() => {
    if (conversationRef.current !== conversationId) {
      console.log('🔄 Conversation changed from', conversationRef.current, 'to', conversationId);
      conversationRef.current = conversationId;
      
      // Reset all conversation-specific state
      setHasJoinedConversation(false);
      setMessages([]);
      setCurrentPage(1);
      setMessagesLoaded(false);
      setInitialLoadComplete(false); // Reset initial load flag
      setHasMoreMessages(false);
      setError(null);
    }
  }, [conversationId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // ENHANCED: Load conversation history with better error handling
  const loadConversationHistory = useCallback(async (page = 1, append = false) => {
    if (!conversationId) {
      console.log('❌ Cannot load history: No conversation ID');
      return;
    }

    try {
      setLoadingMessages(true);
      setError(null);

      console.log(`📚 Loading conversation history for ${conversationId} - Page: ${page}, Append: ${append}`);
      
      const history = await chatAPIService.getConversationHistory(conversationId, page, 50);
      
      if (mountedRef.current && conversationRef.current === conversationId) {
        console.log(`✅ Loaded ${history.messages.length} messages for conversation ${conversationId}`);
        
        if (append) {
          setMessages(prev => {
            // Avoid duplicates by filtering out existing messages
            const existingIds = new Set(prev.map(msg => msg._id));
            const newMessages = history.messages.filter(msg => !existingIds.has(msg._id));
            return [...newMessages, ...prev];
          });
        } else {
          setMessages(history.messages);
          setMessagesLoaded(true);
          setInitialLoadComplete(true); // Mark initial load as complete
        }
        setHasMoreMessages(history.hasMore);
        setCurrentPage(page);
        
        console.log(`📊 Message state updated: ${history.messages.length} messages, hasMore: ${history.hasMore}`);
      }
    } catch (err: any) {
      console.error('❌ Failed to load conversation history:', err);
      if (mountedRef.current && conversationRef.current === conversationId) {
        const errorMessage = 'Failed to load message history';
        setError(errorMessage);
        
        // Still mark as loaded to prevent infinite loops, but with empty state
        if (!append) {
          setMessagesLoaded(true);
          setInitialLoadComplete(true);
        }
      }
    } finally {
      if (mountedRef.current) {
        setLoadingMessages(false);
      }
    }
  }, [conversationId]);


// CRITICAL FIX: Load messages immediately when conversationId is available
// This effect should run ONCE per conversationId change
useEffect(() => {
  // Only load if we have a conversation ID and haven't loaded yet
  if (!conversationId) {
    console.log('⏭️ Skipping load: No conversation ID');
    return;
  }

  if (initialLoadComplete) {
    console.log('⏭️ Skipping load: Already loaded for', conversationId);
    return;
  }

  if (loadingMessages) {
    console.log('⏭️ Skipping load: Already loading');
    return;
  }

  console.log('🎯 LOADING MESSAGES for conversation:', conversationId);

  // Create an async function to load messages
  const loadMessages = async () => {
    try {
      setLoadingMessages(true);
      setError(null);

      console.log(`📚 Fetching conversation history for ${conversationId}`);
      
      const history = await chatAPIService.getConversationHistory(conversationId, 1, 50);
      
      // Only update if this is still the current conversation
      if (mountedRef.current && conversationRef.current === conversationId) {
        console.log(`✅ Loaded ${history.messages.length} messages`);
        setMessages(history.messages);
        setHasMoreMessages(history.hasMore);
        setCurrentPage(1);
        setMessagesLoaded(true);
        setInitialLoadComplete(true);
        
        console.log(`📊 State updated: ${history.messages.length} messages loaded`);
      }
    } catch (err) {
      console.error('❌ Failed to load messages:', err);
      if (mountedRef.current && conversationRef.current === conversationId) {
        setError('Failed to load message history');
        // Still mark as complete to prevent infinite loops
        setMessagesLoaded(true);
        setInitialLoadComplete(true);
      }
    } finally {
      if (mountedRef.current) {
        setLoadingMessages(false);
      }
    }
  };

  loadMessages();

  // NO CLEANUP - we want messages to persist
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [conversationId]); // ONLY depend on conversationId - nothing else!


  // Enhanced connection with retry logic
  const connect = useCallback(async () => {
    if (!conversationId) {
      console.log('❌ Cannot connect: No conversation ID');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('dome_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Clear any pending reconnection
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // If already connected, just return
      if (chatService.isConnected()) {
        console.log('✅ Already connected to chat service');
        setIsConnected(true);
        setIsLoading(false);
        connectionAttempts.current = 0;
        return;
      }

      console.log(`🔄 Connecting to chat service (attempt ${connectionAttempts.current + 1}/${maxConnectionAttempts})`);
      
      await chatService.connect(token);
      
      if (mountedRef.current) {
        setIsConnected(true);
        connectionAttempts.current = 0;
        console.log('✅ Successfully connected to chat service');
      }
      
    } catch (err: any) {
      console.error('❌ Failed to connect to chat:', err);
      connectionAttempts.current++;
      
      if (mountedRef.current) {
        setError(err.message || 'Failed to connect to chat');
        
        // Auto-retry with exponential backoff
        if (connectionAttempts.current < maxConnectionAttempts) {
          const retryDelay = Math.min(1000 * Math.pow(2, connectionAttempts.current), 10000);
          console.log(`🔄 Retrying connection in ${retryDelay}ms (attempt ${connectionAttempts.current + 1}/${maxConnectionAttempts})`);
          
          reconnectTimeoutRef.current = window.setTimeout(() => {
            if (mountedRef.current && !isConnected) {
              connect();
            }
          }, retryDelay);
        } else {
          console.error('🚫 Max connection attempts reached');
        }
        
        throw err;
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [conversationId, isConnected]);

  // SIMPLIFIED: Join conversation without loading messages (messages should already be loaded)
  const joinConversation = useCallback(async () => {
    if (conversationId && isConnected && chatService.isConnected() && !hasJoinedConversation) {
      console.log('🏠 Joining conversation:', conversationId);
      chatService.joinConversation(conversationId);
      setHasJoinedConversation(true);
      
      console.log(`📊 Current message state: ${messages.length} messages loaded, initialLoadComplete: ${initialLoadComplete}`);
    }
  }, [conversationId, isConnected, hasJoinedConversation, messages.length, initialLoadComplete]);

  // Load more messages
  const loadMoreMessages = useCallback(async () => {
    if (hasMoreMessages && !loadingMessages) {
      await loadConversationHistory(currentPage + 1, true);
    }
  }, [hasMoreMessages, loadingMessages, currentPage, loadConversationHistory]);

  // Enhanced send message with better error handling
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !conversationId) return;

    try {
      setError(null);
      
      // Ensure connection
      if (!chatService.isConnected()) {
        console.log('🔄 Not connected, attempting to reconnect...');
        await connect();
        
        // Wait a bit for connection to stabilize
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Ensure joined to conversation
      if (!hasJoinedConversation) {
        await joinConversation();
        
        // Wait a bit for join to complete
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      console.log('📤 Sending message:', message.substring(0, 50) + '...');
      chatService.sendMessage(conversationId, message.trim());
      
      // Clear typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      setTyping(false);
      
    } catch (err: any) {
      console.error('❌ Failed to send message:', err);
      if (mountedRef.current) {
        setError('Failed to send message. Please check your connection.');
        throw err;
      }
    }
  }, [conversationId, connect, joinConversation, hasJoinedConversation]);

  // Enhanced send image message with better error handling
  const sendImageMessage = useCallback(async (imageFile: File) => {
    if (!conversationId) {
      throw new Error('No conversation ID');
    }

    // Validate image file
    const validation = chatAPIService.validateImageFile(imageFile);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      console.log('🖼️ Starting image upload:', imageFile.name);

      // Ensure connection
      if (!chatService.isConnected()) {
        console.log('🔄 Not connected, attempting to reconnect for image upload...');
        await connect();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Ensure joined to conversation
      if (!hasJoinedConversation) {
        await joinConversation();
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 80) {
            clearInterval(progressInterval);
            return 80;
          }
          return prev + 20;
        });
      }, 200);

      try {
        await chatService.sendImageMessage(conversationId, imageFile);
        console.log('✅ Image sent via WebSocket');
        setUploadProgress(100);
      } catch (wsError) {
        console.warn('⚠️ WebSocket image send failed, trying HTTP upload:', wsError);
        clearInterval(progressInterval);
        
        // Fallback to HTTP upload
        const result = await chatAPIService.uploadImageMessage(conversationId, imageFile);
        if (result.success && result.data) {
          setMessages(prev => {
            const exists = prev.some(msg => msg._id === result.data._id);
            if (exists) return prev;
            return [...prev, result.data];
          });
        }
        setUploadProgress(100);
        console.log('✅ Image uploaded via HTTP');
      }
      
    } catch (err: any) {
      console.error('❌ Failed to send image message:', err);
      if (mountedRef.current) {
        setError(err.message || 'Failed to send image');
        throw err;
      }
    } finally {
      if (mountedRef.current) {
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 1000);
      }
    }
  }, [conversationId, connect, joinConversation, hasJoinedConversation]);

  // Upload image via HTTP
  const uploadImageMessage = useCallback(async (imageFile: File): Promise<ImageUploadResponse> => {
    if (!conversationId) {
      throw new Error('No conversation ID');
    }

    const validation = chatAPIService.validateImageFile(imageFile);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      console.log('📤 Uploading image via HTTP API:', imageFile.name);

      const result = await chatAPIService.uploadImageMessage(conversationId, imageFile);
      
      // Add message to local state
      if (result.success && result.data) {
        setMessages(prev => {
          const exists = prev.some(msg => msg._id === result.data._id);
          if (exists) return prev;
          return [...prev, result.data];
        });
      }

      setUploadProgress(100);
      console.log('✅ Image uploaded successfully via HTTP');
      return result;
      
    } catch (err: any) {
      console.error('❌ Failed to upload image:', err);
      if (mountedRef.current) {
        setError(err.message || 'Failed to upload image');
        throw err;
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 1000);
      }
    }
  }, [conversationId]);

  // Enhanced typing with connection check
  const setTyping = useCallback((typing: boolean) => {
    if (!conversationId || !chatService.isConnected()) return;

    chatService.setTyping(conversationId, typing);

    if (typing) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = window.setTimeout(() => {
        if (chatService.isConnected()) {
          chatService.setTyping(conversationId, false);
        }
      }, 3000);
    }
  }, [conversationId]);

  // Enhanced clear chat
  const clearChat = useCallback(async () => {
    if (!conversationId) return;

    try {
      setError(null);
      console.log('🗑️ Clearing chat history for:', conversationId);
      
      await chatAPIService.clearConversation(conversationId);
      
      // Clear local messages immediately
      setMessages([]);
      setCurrentPage(1);
      setHasMoreMessages(false);
      setMessagesLoaded(true);
      setInitialLoadComplete(true); // Keep this true to prevent reloading
      
      console.log('✅ Chat history cleared successfully');
    } catch (err: any) {
      console.error('❌ Failed to clear chat:', err);
      if (mountedRef.current) {
        setError('Failed to clear chat');
        throw err;
      }
    }
  }, [conversationId]);

  // Mark as read
  const markAsRead = useCallback(async () => {
    if (!conversationId) return;

    try {
      await chatAPIService.markConversationAsRead(conversationId);
      if (chatService.isConnected()) {
        chatService.markAsRead(conversationId);
      }
      setUnreadCount(0);
    } catch (err: any) {
      console.error('❌ Failed to mark as read:', err);
    }
  }, [conversationId]);

  // Enhanced delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      setError(null);
      console.log('🗑️ Deleting message:', messageId);
      
      await chatAPIService.deleteMessage(messageId);
      
      setMessages(prev => 
        prev.map(msg => {
          if (msg._id === messageId) {
            const deletedMessage = msg.messageType === 'image' 
              ? 'This image has been deleted' 
              : 'This message has been deleted';
            return { ...msg, message: deletedMessage, isDeleted: true };
          }
          return msg;
        })
      );
      
      console.log('✅ Message deleted successfully');
      
    } catch (err: any) {
      console.error('❌ Failed to delete message:', err);
      if (mountedRef.current) {
        setError('Failed to delete message');
        throw err;
      }
    }
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting from chat service');
    setIsConnected(false);
    setHasJoinedConversation(false);
    setError(null);
    connectionAttempts.current = 0;
    // DON'T reset messages or initialLoadComplete here - we want to preserve chat history
  }, []);

  // Image validation
  const validateImageFile = useCallback((file: File): { valid: boolean; error?: string } => {
    return chatAPIService.validateImageFile(file);
  }, []);

  // Enhanced WebSocket event listeners
  useEffect(() => {
    const unsubscribeConnection = chatService.onConnectionChange((connected) => {
      console.log('🔌 Connection state changed:', connected);
      if (mountedRef.current) {
        setIsConnected(connected);
        if (!connected) {
          setHasJoinedConversation(false);
          setError('Connection lost - attempting to reconnect...');
          connectionAttempts.current = 0;
          
          // Auto-reconnect after 2 seconds
          reconnectTimeoutRef.current = window.setTimeout(() => {
            if (mountedRef.current && !connected) {
              console.log('🔄 Auto-reconnecting after connection loss...');
              connect().catch(console.error);
            }
          }, 2000);
        } else {
          setError(null);
          connectionAttempts.current = 0;
        }
      }
    });

    const unsubscribeMessage = chatService.onMessageReceived((message) => {
      console.log('📨 Text message received:', message._id);
      if (message.conversationId === conversationRef.current) {
        setMessages(prev => {
          const exists = prev.some(msg => msg._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
      }
    });

    const unsubscribeImageMessage = chatService.onImageMessageReceived((message) => {
      console.log('🖼️ Image message received:', message._id);
      if (message.conversationId === conversationRef.current) {
        setMessages(prev => {
          const exists = prev.some(msg => msg._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
        
        // Complete upload progress if it's our upload
        if (isUploading) {
          setUploadProgress(100);
          setTimeout(() => {
            setUploadProgress(0);
            setIsUploading(false);
          }, 1000);
        }
      }
    });

    const unsubscribeTyping = chatService.onUserTyping((data) => {
      if (mountedRef.current) {
        setUsersTyping(prev => {
          const filtered = prev.filter(user => user.userId !== data.userId);
          return data.isTyping ? [...filtered, data] : filtered;
        });
      }
    });

    const unsubscribeError = chatService.onError((error) => {
      console.error('🚫 WebSocket error:', error);
      if (mountedRef.current) {
        setError(`Connection error: ${error}`);
      }
    });

    return () => {
      unsubscribeConnection();
      unsubscribeMessage();
      unsubscribeImageMessage();
      unsubscribeTyping();
      unsubscribeError();
    };
  }, [connect, isUploading]);

  // MODIFIED: Auto connect but don't load messages here - they should already be loaded
  useEffect(() => {
    if (autoConnect && conversationId && !chatService.isConnected() && !isLoading && connectionAttempts.current === 0) {
      console.log('🚀 Auto-connecting to chat service...');
      connect().catch(console.error);
    }
  }, [autoConnect, conversationId, connect, isLoading]);

  // MODIFIED: Auto join conversation when connected (messages should already be loaded)
  useEffect(() => {
    if (isConnected && conversationId && !hasJoinedConversation && autoJoin && initialLoadComplete) {
      const timer = setTimeout(() => {
        joinConversation().catch(console.error);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isConnected, conversationId, hasJoinedConversation, autoJoin, joinConversation, initialLoadComplete]);

  // Load unread count
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const { unreadCount } = await chatAPIService.getUnreadCount();
        setUnreadCount(unreadCount);
      } catch (err) {
        console.error('Failed to load unread count:', err);
      }
    };

    if (conversationId) {
      loadUnreadCount();
    }
  }, [conversationId]);

  // Mark as read on focus
  useEffect(() => {
    if (!markAsReadOnFocus) return;

    const handleFocus = () => {
      if (conversationId && unreadCount > 0) {
        markAsRead();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [markAsReadOnFocus, conversationId, unreadCount, markAsRead]);

  const isAnyoneTyping = usersTyping.length > 0;

  return {
    isConnected,
    isLoading,
    error,
    messages,
    hasMoreMessages,
    loadingMessages,
    isTyping: isAnyoneTyping,
    usersTyping,
    unreadCount,
    isUploading,
    uploadProgress,
    sendMessage,
    sendImageMessage,
    uploadImageMessage,
    loadMoreMessages,
    clearChat,
    markAsRead,
    setTyping,
    deleteMessage,
    connect,
    disconnect,
    joinConversation,
    validateImageFile,
  };
};