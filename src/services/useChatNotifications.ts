import { useState, useEffect, useCallback, useRef } from 'react';
import { chatService, chatAPIService } from '../services/chatService';

export const useChatNotifications = () => {
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { unreadCount } = await chatAPIService.getUnreadCount();
      setUnreadChatCount(unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread chat count:', error);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchUnreadCount();

    // CRITICAL: Don't connect here - let useChat handle connections
    // Just listen for connection state changes
    console.log('📊 Notifications: Setting up listeners only (no connection attempt)');

    // Listen for connection changes from other hooks
    const unsubscribeConnection = chatService.onConnectionChange((connected) => {
      console.log('🔄 Notifications: Connection state changed:', connected);
      setIsConnected(connected);
      if (connected) {
        fetchUnreadCount(); // Refresh count when connected
      }
    });

    // Set initial state if already connected by another hook
    setIsConnected(chatService.isConnected());

    // Listen for new customer messages
    const unsubscribeMessage = chatService.onMessageReceived((message) => {
      if (message.senderRole === 'customer') {
        setUnreadChatCount(prev => prev + 1);
      }
    });

    // Listen for image messages from customers
    const unsubscribeImageMessage = chatService.onImageMessageReceived((message) => {
      if (message.senderRole === 'customer') {
        setUnreadChatCount(prev => prev + 1);
      }
    });

    // Poll every 30 seconds as fallback
    const intervalId = setInterval(fetchUnreadCount, 30000);

    return () => {
      unsubscribeConnection();
      unsubscribeMessage();
      unsubscribeImageMessage();
      clearInterval(intervalId);
    };
  }, [fetchUnreadCount]);

  return { 
    unreadChatCount, 
    fetchUnreadCount,
    isConnected
  };
};