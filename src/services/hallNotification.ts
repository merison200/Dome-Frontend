import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('dome_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types matching your backend exactly
export type NotificationType = 
  | 'pending_booking'
  | 'transfer_verification' 
  | 'payment_failed'
  | 'payment_completed';

export type NotificationPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface NotificationDetails {
  bookingId?: string;
  paymentId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  hallName: string;
  eventDate?: string;
  amount: number;
  hoursAgo?: number;
  method?: string;
  transferProof?: string;
  accountName?: string;
  bankName?: string;
  gatewayMessage?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  details: NotificationDetails;
  createdAt: string;
  priority: NotificationPriority;
  actionRequired: boolean;
}

export interface NotificationSummary {
  total: number;
  actionRequired: number;
  urgent: number;
  high: number;
  byType: {
    pendingBookings: number;
    pendingTransfers: number;
    failedPayments: number;
    completedPayments: number;
  };
}

export interface NotificationResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    summary: NotificationSummary;
    lastUpdated: string;
  };
}

export interface NotificationCounts {
  success: boolean;
  data: {
    total: number;
    urgent: number;
    pendingBookings: number;
    pendingTransfers: number;
    failedPayments: number;
  };
}

export const notificationAPI = {
  /**
   * Get all notifications with details
   */
  async getNotifications(): Promise<NotificationResponse['data']> {
    try {
      const response = await axiosInstance.get<NotificationResponse>('/api/notifications');
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch notifications'
      );
    }
  },

  /**
   * Get notification counts only (for badge display)
   */
  async getNotificationCounts(): Promise<NotificationCounts['data']> {
    try {
      const response = await axiosInstance.get<NotificationCounts>('/api/notifications/counts');
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching notification counts:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch notification counts'
      );
    }
  },

  /**
   * Get urgent notifications only
   */
  async getUrgentNotifications(): Promise<NotificationResponse['data']> {
    try {
      const response = await axiosInstance.get<NotificationResponse>('/api/notifications/urgent');
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching urgent notifications:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch urgent notifications'
      );
    }
  },

  /**
   * Get notifications by type
   */
  async getNotificationsByType(type: NotificationType): Promise<NotificationResponse['data']> {
    try {
      const response = await axiosInstance.get<NotificationResponse>(`/api/notifications/type/${type}`);
      return response.data.data;
    } catch (error: any) {
      console.error(`Error fetching ${type} notifications:`, error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        `Failed to fetch ${type} notifications`
      );
    }
  },

  /**
   * Get unread notification count (actionable items)
   */
  async getUnreadCount(): Promise<number> {
    try {
      const counts = await this.getNotificationCounts();
      return counts.total; // Total actionable items
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  },

  /**
   * Get notification color based on priority (plain colors)
   */
  getNotificationColor(priority: NotificationPriority): string {
    const colors = {
      urgent: 'text-gray-800 bg-gray-100 border-gray-200',
      high: 'text-gray-800 bg-gray-100 border-gray-200',
      medium: 'text-gray-800 bg-gray-100 border-gray-200',
      low: 'text-gray-800 bg-gray-100 border-gray-200'
    };
    return colors[priority];
  },

  /**
   * Format notification time (relative time)
   */
  formatNotificationTime(dateString: string): string {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    
    return notificationDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  },

  /**
   * Get action button text based on notification type
   */
  getActionButtonText(type: NotificationType): string {
    const actions = {
      pending_booking: 'Review Booking',
      transfer_verification: 'Verify Payment',
      payment_failed: 'View Details',
      payment_completed: 'View Payment'
    };
    return actions[type] || 'View Details';
  },

  /**
   * Get action URL based on notification type and details
   */
  getActionUrl(notification: Notification): string {
    const { type, details } = notification;
    
    switch (type) {
      case 'pending_booking':
        return `/admin/bookings/${details.bookingId}`;
      case 'transfer_verification':
        return `/admin/payments/transfer-verification`;
      case 'payment_failed':
        return `/admin/payments/${details.paymentId}`;
      case 'payment_completed':
        return `/admin/payments/${details.paymentId}`;
      default:
        return '/admin/notifications';
    }
  },

  /**
   * Check if notification requires action
   */
  requiresAction(notification: Notification): boolean {
    return notification.actionRequired;
  },

  /**
   * Get priority order number for sorting
   */
  getPriorityOrder(priority: NotificationPriority): number {
    const order = { urgent: 4, high: 3, medium: 2, low: 1 };
    return order[priority];
  },

  /**
   * Sort notifications by priority and date (matches backend sorting)
   */
  sortNotifications(notifications: Notification[]): Notification[] {
    return [...notifications].sort((a, b) => {
      // First sort by priority
      if (this.getPriorityOrder(a.priority) !== this.getPriorityOrder(b.priority)) {
        return this.getPriorityOrder(b.priority) - this.getPriorityOrder(a.priority);
      }
      
      // Then sort by date (most recent first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  },

  /**
   * Get badge count for display (actionable items only)
   */
  getBadgeCount(counts: NotificationCounts['data']): number {
    return counts.total;
  },

  /**
   * Check if there are urgent notifications
   */
  hasUrgentNotifications(counts: NotificationCounts['data']): boolean {
    return counts.urgent > 0;
  },

  /**
   * Format currency for notification display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },

  /**
   * Format date for notification display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * Get summary text for notification types
   */
  getSummaryText(summary: NotificationSummary): string {
    if (summary.actionRequired === 0) {
      return 'All caught up! No pending actions.';
    }
    
    const parts = [];
    if (summary.byType.pendingBookings > 0) {
      parts.push(`${summary.byType.pendingBookings} pending booking${summary.byType.pendingBookings > 1 ? 's' : ''}`);
    }
    if (summary.byType.pendingTransfers > 0) {
      parts.push(`${summary.byType.pendingTransfers} transfer${summary.byType.pendingTransfers > 1 ? 's' : ''} to verify`);
    }
    if (summary.byType.failedPayments > 0) {
      parts.push(`${summary.byType.failedPayments} failed payment${summary.byType.failedPayments > 1 ? 's' : ''}`);
    }
    
    return parts.join(', ') + ' need attention.';
  },

  /**
   * Poll for new notifications (for real-time updates)
   */
  pollNotifications(
    callback: (data: NotificationCounts['data']) => void, 
    intervalMs: number = 30000
  ): () => void {
    const poll = async () => {
      try {
        const counts = await this.getNotificationCounts();
        callback(counts);
      } catch (error) {
        console.error('Error polling notifications:', error);
      }
    };

    poll(); // Initial call
    const intervalId = setInterval(poll, intervalMs);
    return () => clearInterval(intervalId);
  }
};