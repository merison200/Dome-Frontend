import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('dome_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('dome_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface BookingFormData {
  hallId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDates: string[];
  additionalHours: number;
  banquetChairs: number;
  totalAmount: number;
  cautionFee: number;
  basePrice: number;
  additionalHoursPrice: number;
  banquetChairsPrice: number;
  eventType: string;
  specialRequests: string;
}

export interface Booking {
  _id?: string;
  userId: string;
  hallId: {
    _id: string;
    name: string;
    location: string;
    images?: string[];
    basePrice?: number;
    additionalHourPrice?: number;
  };
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDates: string[];
  additionalHours: number;
  banquetChairs: number;
  basePrice: number;
  additionalHoursPrice: number;
  banquetChairsPrice: number;
  cautionFee: number;
  totalAmount: number;
  eventType: string;
  specialRequests: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'partially_refunded';
  bookingType: 'online' | 'offline';
  createdAt: string;
  updatedAt: string;
  cancellationDeadline: string;
  paymentReference?: string;
  refundAmount?: number;
  refundReason?: string;
}

export interface AvailabilityCheck {
  date: string;
  available: boolean;
  reason?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  hallId?: string;
}

export interface BookingResponse {
  bookings: Booking[];
  total: number;
  page: number;
  totalPages: number;
}

export interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  pendingPayments: number;
}

export const bookingAPI = {
  /**
   * Check availability for specific dates
   */
  async checkAvailability(hallId: string, dates: string[]): Promise<AvailabilityCheck[]> {
    try {
      const response = await axiosInstance.post('/api/hallbooking/check-availability', {
        hallId,
        dates,
      });
      return response.data.availability || response.data;
    } catch (error: any) {
      console.error('Error checking availability:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to check availability'
      );
    }
  },

  /**
   * Create a new booking (online)
   */
  async createBooking(bookingData: BookingFormData): Promise<Booking> {
    try {
      const response = await axiosInstance.post('/api/hallbooking', bookingData);
      return response.data.booking || response.data;
    } catch (error: any) {
      console.error('Error creating booking:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to create booking'
      );
    }
  },

  /**
   * Create offline booking (Admin only)
   */
  async createOfflineBooking(bookingData: BookingFormData): Promise<{ booking: Booking; message: string }> {
    try {
      const response = await axiosInstance.post('/api/hallbooking/offline', bookingData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating offline booking:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to create offline booking'
      );
    }
  },

  /**
   * Get current user's bookings with pagination
   */
  async getUserBookings(params: PaginationParams = {}): Promise<BookingResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status) queryParams.append('status', params.status);
      if (params.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus);

      const response = await axiosInstance.get(
        `/api/hallbooking/user?${queryParams.toString()}`
      );
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user bookings:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch bookings'
      );
    }
  },

  /**
   * Get all bookings with advanced filtering (Admin only)
   */
  async getAllBookings(params: PaginationParams = {}): Promise<BookingResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status) queryParams.append('status', params.status);
      if (params.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.hallId) queryParams.append('hallId', params.hallId);

      const response = await axiosInstance.get(
        `/api/hallbooking?${queryParams.toString()}`
      );
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching all bookings:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch bookings'
      );
    }
  },

  /**
   * Get a specific booking by ID
   */
  async getBookingById(id: string): Promise<Booking> {
    try {
      const response = await axiosInstance.get(`/api/hallbooking/${id}`);
      return response.data.booking || response.data;
    } catch (error: any) {
      console.error('Error fetching booking:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch booking details'
      );
    }
  },

  /**
   * Cancel a booking
   */
  async cancelBooking(id: string): Promise<{ message: string; refundAmount?: number }> {
    try {
      const response = await axiosInstance.put(`/api/hallbooking/${id}/cancel`);
      return response.data;
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to cancel booking'
      );
    }
  },

  /**
   * Admin: Cancel booking with custom refund
   */
  async adminCancelBooking(id: string, refundAmount?: number, reason?: string): Promise<{ message: string; refundAmount?: number }> {
    try {
      const response = await axiosInstance.put(`/api/hallbooking/${id}/admin-cancel`, {
        refundAmount,
        reason
      });
      return response.data;
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to cancel booking'
      );
    }
  },

  /**
   * Confirm payment for a booking
   */
  async confirmPayment(id: string, paymentReference?: string): Promise<{ message: string; booking?: Booking }> {
    try {
      const response = await axiosInstance.put(`/api/hallbooking/${id}/confirm-payment`, {
        paymentReference
      });
      return response.data;
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to confirm payment'
      );
    }
  },

  /**
   * Update booking status (Admin only)
   */
  async updateBookingStatus(id: string, status: string): Promise<{ message: string; booking: Booking }> {
    try {
      const response = await axiosInstance.put(`/api/hallbooking/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to update booking status'
      );
    }
  },

  /**
   * Get booking statistics (Admin only)
   */
  async getBookingStats(params: { startDate?: string; endDate?: string } = {}): Promise<BookingStats> {
    try {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response = await axiosInstance.get(`/api/hallbooking/stats?${queryParams.toString()}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching booking stats:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch booking statistics'
      );
    }
  },

  /**
   * Export bookings to CSV (Admin only)
   */
  async exportBookings(params: PaginationParams = {}): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.status) queryParams.append('status', params.status);
      if (params.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.hallId) queryParams.append('hallId', params.hallId);

      const response = await axiosInstance.get(
        `/api/hallbooking/export?${queryParams.toString()}`,
        { responseType: 'blob' }
      );
      
      return response.data;
    } catch (error: any) {
      console.error('Error exporting bookings:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to export bookings'
      );
    }
  },

  /**
   * Search bookings by customer name or booking reference
   */
  async searchBookings(query: string, limit: number = 10): Promise<Booking[]> {
    try {
      const response = await axiosInstance.get(`/api/hallbooking/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      return response.data.bookings || response.data;
    } catch (error: any) {
      console.error('Error searching bookings:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to search bookings'
      );
    }
  },

  /**
   * Get upcoming bookings (next 7 days)
   */
  async getUpcomingBookings(limit: number = 10): Promise<Booking[]> {
    try {
      const response = await axiosInstance.get(`/api/hallbooking/upcoming?limit=${limit}`);
      return response.data.bookings || response.data;
    } catch (error: any) {
      console.error('Error fetching upcoming bookings:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch upcoming bookings'
      );
    }
  },

  /**
   * Bulk update booking statuses (Admin only)
   */
  async bulkUpdateBookings(bookingIds: string[], updates: { status?: string; paymentStatus?: string }): Promise<{ message: string; updatedCount: number }> {
    try {
      const response = await axiosInstance.put('/api/hallbooking/bulk-update', {
        bookingIds,
        updates
      });
      return response.data;
    } catch (error: any) {
      console.error('Error bulk updating bookings:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to bulk update bookings'
      );
    }
  },

  /**
   * Helper functions
   */
  
  // Format currency for display
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },

  // Format date for display
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Format booking status for display
  getStatusColor(status: string): string {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  },

  // Format payment status for display
  getPaymentStatusColor(status: string): string {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      refunded: 'bg-blue-100 text-blue-800',
      partially_refunded: 'bg-orange-100 text-orange-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  },

  // Check if booking can be cancelled
  canCancelBooking(booking: Booking): boolean {
    return booking.status !== 'cancelled' && 
           booking.status !== 'completed' && 
           new Date() < new Date(booking.cancellationDeadline);
  },

  // Calculate days until event
  getDaysUntilEvent(eventDates: string[]): number {
    if (!eventDates || eventDates.length === 0) return 0;
    
    const firstEventDate = new Date(eventDates[0]);
    const today = new Date();
    const diffTime = firstEventDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  // Get booking type badge
  getBookingTypeBadge(type: string): string {
    return type === 'online' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-purple-100 text-purple-800';
  }
};