import { io, Socket } from 'socket.io-client';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "http://localhost:5000";

console.log('Chat Service Config:', { API_BASE_URL, WS_BASE_URL });

// Enhanced Types with Image Support
export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: {
    _id: string;
    name: string;
    role: string;
  };
  senderRole: 'customer' | 'admin' | 'staff';
  message: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  
  // Image-specific fields
  imageUrl?: string;
  imagePublicId?: string;
  imageDimensions?: {
    width: number;
    height: number;
  };
  imageSize?: number;
  
  metadata?: {
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    originalName?: string;
  };
  readBy: Array<{
    userId: string;
    readAt: string;
  }>;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  
  // Virtual field for easy image access
  imageData?: {
    url: string;
    publicId: string;
    dimensions: { width: number; height: number };
    size: number;
  };
}

export interface ConversationHistory {
  messages: ChatMessage[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasMore: boolean;
}

export interface Conversation {
  conversationId: string;
  lastMessage: {
    _id: string;
    message: string;
    messageType: string;
    createdAt: string;
    sender: {
      _id: string;
      name: string;
      role: string;
    };
    // Include image data in last message if it's an image
    imageUrl?: string;
    imageDimensions?: {
      width: number;
      height: number;
    };
  };
  unreadCount: number;
  totalMessages: number;
  participants: Array<{
    _id: string;
    name: string;
    role: string;
  }>;
}

export interface UserTyping {
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: Date;
}

export interface OnlineUser {
  userId: string;
  name: string;
  role: string;
  lastSeen: Date;
  isInConversation: boolean;
}

export interface ImageUploadResponse {
  success: boolean;
  message: string;
  data: ChatMessage;
  imageInfo?: {
    url: string;
    dimensions: { width: number; height: number };
    size: number;
  };
}

// Chat API Service
const chatAPI = axios.create({
  baseURL: `${API_BASE_URL}/api/chat`,
  headers: {
    'Content-Type': 'application/json',
  },
});

chatAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('dome_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const chatAPIService = {
  async getConversationHistory(
    conversationId: string,
    page = 1,
    limit = 50
  ): Promise<ConversationHistory> {
    const response = await chatAPI.get(`/conversation/${conversationId}`, {
      params: { page, limit }
    });
    return response.data.data;
  },

  async getUserConversations(page = 1, limit = 20): Promise<{
    conversations: Conversation[];
    currentPage: number;
    totalPages: number;
  }> {
    const response = await chatAPI.get('/conversations', {
      params: { page, limit }
    });
    return response.data.data;
  },

  async createOrGetConversation(participantId: string): Promise<{
    conversationId: string;
    isNew: boolean;
    participant: {
      _id: string;
      name: string;
      role: string;
    };
    messages: ChatMessage[];
    totalCount: number;
    hasMore: boolean;
  }> {
    const response = await chatAPI.post('/conversations', { participantId });
    return response.data.data;
  },

  async markConversationAsRead(conversationId: string): Promise<void> {
    await chatAPI.put(`/conversation/${conversationId}/read`);
  },

  async clearConversation(conversationId: string): Promise<void> {
    await chatAPI.delete(`/conversation/${conversationId}/clear`);
  },

  async getUnreadCount(): Promise<{ unreadCount: number }> {
    const response = await chatAPI.get('/unread-count');
    return response.data.data;
  },

  async deleteMessage(messageId: string): Promise<void> {
    await chatAPI.delete(`/message/${messageId}`);
  },

  // Upload image to conversation
  async uploadImageMessage(
    conversationId: string, 
    imageFile: File
  ): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('conversationId', conversationId);

    const response = await chatAPI.post('/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Convert image file to base64 for WebSocket
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  },

  // Validate image file
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only JPEG, PNG, GIF, and WebP images are allowed' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'Image size must be less than 5MB' };
    }

    return { valid: true };
  }
};

// Enhanced WebSocket Chat Service with Image Support
class ChatService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;
  private isConnecting = false;
  private connectionState = false;
  private connectionId: string | null = null;

  // Event callbacks
  private messageCallbacks: ((message: ChatMessage) => void)[] = [];
  private imageMessageCallbacks: ((message: ChatMessage) => void)[] = [];
  private typingCallbacks: ((data: UserTyping) => void)[] = [];
  private userJoinedCallbacks: ((data: any) => void)[] = [];
  private userLeftCallbacks: ((data: any) => void)[] = [];
  private connectionCallbacks: ((connected: boolean) => void)[] = [];
  private errorCallbacks: ((error: string) => void)[] = [];
  private uploadProgressCallbacks: ((progress: number) => void)[] = [];

  async connect(token: string): Promise<void> {
    console.log('🚀 ChatService.connect() called');
    
    // Generate unique connection ID for this connection attempt
    this.connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const currentConnectionId = this.connectionId;

    // Prevent multiple connection attempts
    if (this.isConnecting) {
      console.log('⚠️ Connection already in progress, waiting...');
      return new Promise((resolve, reject) => {
        const checkConnection = setInterval(() => {
          if (!this.isConnecting || this.connectionId !== currentConnectionId) {
            clearInterval(checkConnection);
            if (this.connectionState) {
              resolve();
            } else {
              reject(new Error('Connection failed or superseded'));
            }
          }
        }, 100);
        
        setTimeout(() => {
          clearInterval(checkConnection);
          if (this.isConnecting && this.connectionId === currentConnectionId) {
            reject(new Error('Connection timeout'));
          }
        }, 15000);
      });
    }

    // If already connected with same token, return
    if (this.connectionState && this.socket?.connected && this.token === token) {
      console.log('✅ Already connected with same token');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // Check if this connection attempt is still current
      if (this.connectionId !== currentConnectionId) {
        reject(new Error('Connection attempt superseded'));
        return;
      }

      this.isConnecting = true;
      this.token = token;
      
      console.log('🔌 Starting connection process...');
      
      // Clean up existing socket
      if (this.socket) {
        console.log('🧹 Cleaning up existing socket');
        this.socket.removeAllListeners();
        this.socket.disconnect();
        this.socket = null;
      }
      
      console.log('🌐 Creating socket connection to:', WS_BASE_URL);
      
      this.socket = io(WS_BASE_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: false,
        timeout: 15000,
        forceNew: true,
        autoConnect: true
      });

      // Connection success handler
      const onConnect = () => {
        // Verify this is still the current connection attempt
        if (this.connectionId !== currentConnectionId) {
          console.log('🚫 Connection succeeded but was superseded');
          if (this.socket) {
            this.socket.disconnect();
          }
          reject(new Error('Connection superseded'));
          return;
        }

        console.log('🎉 Socket connected! ID:', this.socket?.id);
        this.connectionState = true;
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        
        this.notifyConnectionCallbacks(true);
        resolve();
      };

      const onConnectError = (error: any) => {
        if (this.connectionId !== currentConnectionId) {
          return; // Ignore if superseded
        }

        console.log('💥 Connection error:', error);
        this.connectionState = false;
        this.isConnecting = false;
        this.notifyConnectionCallbacks(false);
        this.notifyErrorCallbacks(`Connection failed: ${error.message}`);
        reject(error);
      };

      const onDisconnect = (reason: string) => {
        if (this.connectionId !== currentConnectionId) {
          return; // Ignore if superseded
        }

        console.log('🔵 Socket disconnected:', reason);
        this.connectionState = false;
        this.isConnecting = false;
        this.notifyConnectionCallbacks(false);
      };

      // Set up event listeners
      this.socket.once('connect', onConnect);
      this.socket.once('connect_error', onConnectError);
      this.socket.on('disconnect', onDisconnect);

      // Set up all other event listeners
      this.setupEventListeners();

      // Cleanup timeout
      setTimeout(() => {
        if (this.isConnecting && this.connectionId === currentConnectionId) {
          console.log('⏰ Connection timeout');
          this.isConnecting = false;
          if (this.socket) {
            this.socket.disconnect();
          }
          reject(new Error('Connection timeout'));
        }
      }, 15000);
    });
  }

  private setupEventListeners() {
    if (!this.socket) {
      console.log('⚠️ No socket to setup listeners');
      return;
    }

    console.log('📡 Setting up socket event listeners');

    // Text messages with better error handling
    this.socket.on('message-received', (message: ChatMessage) => {
      try {
        console.log('📨 Text message received via WebSocket:', message._id);
        
        // Ensure senderId is properly structured
        if (message.senderId && typeof message.senderId === 'string') {
          // Handle case where senderId might be just an ID string
          console.warn('⚠️ Received message with senderId as string, converting to object');
        }

        this.messageCallbacks.forEach(callback => {
          try {
            callback(message);
          } catch (err) {
            console.error('Error in message callback:', err);
          }
        });
      } catch (error) {
        console.error('Error processing received message:', error);
      }
    });

    // Image messages
    this.socket.on('image-message-received', (message: ChatMessage) => {
      try {
        console.log('🖼️ Image message received via WebSocket:', message._id);
        this.imageMessageCallbacks.forEach(callback => {
          try {
            callback(message);
          } catch (err) {
            console.error('Error in image message callback:', err);
          }
        });
      } catch (error) {
        console.error('Error processing received image message:', error);
      }
    });

    // Image message sent confirmation
    this.socket.on('image-message-sent', (data: { success: boolean; message: ChatMessage }) => {
      try {
        console.log('✅ Image message sent confirmation:', data.success);
        if (data.success && data.message) {
          this.imageMessageCallbacks.forEach(callback => {
            try {
              callback(data.message);
            } catch (err) {
              console.error('Error in image sent callback:', err);
            }
          });
        }
      } catch (error) {
        console.error('Error processing image sent confirmation:', error);
      }
    });

    this.socket.on('user-typing', (data: UserTyping) => {
      console.log('⌨️ Typing event received:', data);
      this.typingCallbacks.forEach(callback => callback(data));
    });

    this.socket.on('user-joined', (data: any) => {
      console.log('👋 User joined:', data);
      this.userJoinedCallbacks.forEach(callback => callback(data));
    });

    this.socket.on('user-left', (data: any) => {
      console.log('👋 User left:', data);
      this.userLeftCallbacks.forEach(callback => callback(data));
    });

    this.socket.on('error', (error: any) => {
      console.error('🚫 Socket error:', error);
      this.notifyErrorCallbacks(error.message || 'Socket error occurred');
    });

    this.socket.on('conversation-joined', (data: any) => {
      console.log('🏠 Successfully joined conversation:', data);
    });

    this.socket.on('new-message-notification', (data: any) => {
      console.log('🔔 New message notification:', data);
    });
  }

  joinConversation(conversationId: string) {
    console.log('🏠 Attempting to join conversation:', conversationId);
    
    if (this.socket?.connected) {
      console.log('📤 Emitting join-conversation event');
      this.socket.emit('join-conversation', { conversationId });
    } else {
      console.warn('⚠️ Cannot join conversation: not connected to socket');
    }
  }

  sendMessage(conversationId: string, message: string, messageType: 'text' | 'file' = 'text', metadata?: any) {
    console.log('📤 Attempting to send message:', { conversationId, message: message.substring(0, 50) + '...' });
    
    if (this.socket?.connected) {
      console.log('📤 Emitting send-message event');
      this.socket.emit('send-message', {
        conversationId,
        message,
        messageType,
        metadata
      });
    } else {
      const error = 'Not connected to chat server';
      console.error('❌', error);
      throw new Error(error);
    }
  }

  // Enhanced image message sending with better error handling
  async sendImageMessage(conversationId: string, imageFile: File): Promise<void> {
    console.log('🖼️ Attempting to send image message:', { conversationId, fileName: imageFile.name });
    
    if (!this.socket?.connected) {
      throw new Error('Not connected to chat server');
    }

    // Validate image file
    const validation = chatAPIService.validateImageFile(imageFile);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    try {
      // Convert image to base64
      const imageData = await chatAPIService.fileToBase64(imageFile);
      
      console.log('📤 Emitting send-image-message event');
      
      // Send with additional metadata
      this.socket.emit('send-image-message', {
        conversationId,
        imageData,
        fileName: imageFile.name,
        fileSize: imageFile.size,
        fileType: imageFile.type
      });
      
    } catch (error) {
      console.error('❌ Failed to process image file:', error);
      throw new Error('Failed to process image file');
    }
  }

  // Upload image via HTTP API (fallback method)
  async uploadImageMessage(conversationId: string, imageFile: File): Promise<ImageUploadResponse> {
    console.log('📤 Uploading image via HTTP API:', { conversationId, fileName: imageFile.name });
    
    const validation = chatAPIService.validateImageFile(imageFile);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    return await chatAPIService.uploadImageMessage(conversationId, imageFile);
  }

  setTyping(conversationId: string, isTyping: boolean) {
    if (this.socket?.connected) {
      this.socket.emit('typing', { conversationId, isTyping });
    }
  }

  markAsRead(conversationId: string, messageId?: string) {
    if (this.socket?.connected) {
      this.socket.emit('mark-as-read', { conversationId, messageId });
    }
  }

  // Event subscription methods with better memory management
  onConnectionChange(callback: (connected: boolean) => void) {
    console.log('🔗 Adding connection change callback');
    this.connectionCallbacks.push(callback);
    
    // Immediately call with current state
    if (this.connectionState) {
      console.log('📢 Immediately calling new callback with current state:', this.connectionState);
      callback(this.connectionState);
    }
    
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback);
    };
  }

  onMessageReceived(callback: (message: ChatMessage) => void) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  onImageMessageReceived(callback: (message: ChatMessage) => void) {
    this.imageMessageCallbacks.push(callback);
    return () => {
      this.imageMessageCallbacks = this.imageMessageCallbacks.filter(cb => cb !== callback);
    };
  }

  // Combined message callback (handles both text and images)
  onAnyMessageReceived(callback: (message: ChatMessage) => void) {
    const textUnsubscribe = this.onMessageReceived(callback);
    const imageUnsubscribe = this.onImageMessageReceived(callback);
    
    return () => {
      textUnsubscribe();
      imageUnsubscribe();
    };
  }

  onUserTyping(callback: (data: UserTyping) => void) {
    this.typingCallbacks.push(callback);
    return () => {
      this.typingCallbacks = this.typingCallbacks.filter(cb => cb !== callback);
    };
  }

  onUserJoined(callback: (data: any) => void) {
    this.userJoinedCallbacks.push(callback);
    return () => {
      this.userJoinedCallbacks = this.userJoinedCallbacks.filter(cb => cb !== callback);
    };
  }

  onUserLeft(callback: (data: any) => void) {
    this.userLeftCallbacks.push(callback);
    return () => {
      this.userLeftCallbacks = this.userLeftCallbacks.filter(cb => cb !== callback);
    };
  }

  onError(callback: (error: string) => void) {
    this.errorCallbacks.push(callback);
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
    };
  }

  onUploadProgress(callback: (progress: number) => void) {
    this.uploadProgressCallbacks.push(callback);
    return () => {
      this.uploadProgressCallbacks = this.uploadProgressCallbacks.filter(cb => cb !== callback);
    };
  }

  private notifyConnectionCallbacks(connected: boolean) {
    console.log('📢 Notifying', this.connectionCallbacks.length, 'connection callbacks:', connected);
    this.connectionCallbacks.forEach((callback, index) => {
      try {
        console.log(`📞 Calling callback ${index + 1}`);
        callback(connected);
      } catch (err) {
        console.error('Error in connection callback:', err);
      }
    });
  }

  private notifyErrorCallbacks(error: string) {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (err) {
        console.error('Error in error callback:', err);
      }
    });
  }

  isConnected(): boolean {
    const connected = this.connectionState && (this.socket?.connected ?? false);
    return connected;
  }

  disconnect() {
    console.log('🔌 Manually disconnecting from chat service');
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.connectionState = false;
    this.token = null;
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this.connectionId = null;
    
    // Clear all callbacks
    this.messageCallbacks = [];
    this.imageMessageCallbacks = [];
    this.typingCallbacks = [];
    this.userJoinedCallbacks = [];
    this.userLeftCallbacks = [];
    this.connectionCallbacks = [];
    this.errorCallbacks = [];
    this.uploadProgressCallbacks = [];
  }
}

// Export singleton instance
export const chatService = new ChatService();
export default chatService;