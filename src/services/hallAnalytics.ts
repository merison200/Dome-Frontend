import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Added for cookie-based auth support
});

// Enhanced interceptor with better error handling
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dome_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('dome_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface DashboardOverview {
  totalBookings: number;
  monthlyBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  bookingTypes: Array<{
    _id: 'online' | 'offline';
    count: number;
  }>;
  paymentMethods: Array<{
    _id: 'card' | 'transfer';
    count: number;
    revenue: number;
  }>;
}

export interface RevenueAnalytics {
  _id: {
    year: number;
    month?: number;
  };
  revenue: number;
  transactions: number;
  onlineRevenue: number;
  offlineRevenue: number;
}

export interface BookingAnalytics {
  _id: {
    year: number;
    month?: number;
  };
  totalBookings: number;
  onlineBookings: number;
  offlineBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
}

export interface HallUtilization {
  _id: string;
  hallName: string;
  hallType: string;
  hallCapacity: number;
  hallLocation: string;
  totalDays: number;
  bookings: number;
  revenue: number;
  averageBookingValue: number;
  utilizationRate: number;
}

export interface HallPerformance {
  _id: string;
  name: string;
  type: string;
  capacity: number;
  basePrice: number;
  location: string;
  rating: number;
  totalBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
}

export interface EventTypeAnalytics {
  _id: string;
  count: number;
  revenue: number;
}

export interface AnalyticsParams {
  period?: 'monthly' | 'yearly';
  year?: number;
  startDate?: string;
  endDate?: string;
}

// Enhanced API response interface for better type safety
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const analyticsAPI = {
  /**
   * Get dashboard overview with key metrics
   */
  async getDashboardOverview(): Promise<DashboardOverview> {
    try {
      const response = await axiosInstance.get<ApiResponse<DashboardOverview>>('/api/analytics/dashboard');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Request failed');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching dashboard overview:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch dashboard overview'
      );
    }
  },

  /**
   * Get revenue analytics with time periods
   */
  async getRevenueAnalytics(params: AnalyticsParams = {}): Promise<RevenueAnalytics[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.period) queryParams.append('period', params.period);
      if (params.year) queryParams.append('year', params.year.toString());

      const url = queryParams.toString() 
        ? `/api/analytics/revenue?${queryParams.toString()}`
        : '/api/analytics/revenue';

      const response = await axiosInstance.get<ApiResponse<RevenueAnalytics[]>>(url);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Request failed');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching revenue analytics:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch revenue analytics'
      );
    }
  },

  /**
   * Get booking analytics and trends
   */
  async getBookingAnalytics(params: AnalyticsParams = {}): Promise<BookingAnalytics[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.period) queryParams.append('period', params.period);
      if (params.year) queryParams.append('year', params.year.toString());

      const url = queryParams.toString() 
        ? `/api/analytics/bookings?${queryParams.toString()}`
        : '/api/analytics/bookings';

      const response = await axiosInstance.get<ApiResponse<BookingAnalytics[]>>(url);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Request failed');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching booking analytics:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch booking analytics'
      );
    }
  },

  /**
   * Get hall utilization data
   */
  async getHallUtilization(params: AnalyticsParams = {}): Promise<HallUtilization[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const url = queryParams.toString() 
        ? `/api/analytics/halls/utilization?${queryParams.toString()}`
        : '/api/analytics/halls/utilization';

      const response = await axiosInstance.get<ApiResponse<HallUtilization[]>>(url);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Request failed');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching hall utilization:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch hall utilization'
      );
    }
  },

  /**
   * Get hall performance comparison
   */
  async getHallPerformance(): Promise<HallPerformance[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<HallPerformance[]>>('/api/analytics/halls/performance');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Request failed');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching hall performance:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch hall performance'
      );
    }
  },

  /**
   * Get event type popularity analytics
   */
  async getEventTypeAnalytics(): Promise<EventTypeAnalytics[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<EventTypeAnalytics[]>>('/api/analytics/events');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Request failed');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching event type analytics:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch event type analytics'
      );
    }
  },

  /**
   * Format currency for display (Nigerian Naira)
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
   * Format percentage for display
   */
  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  },

  /**
   * Calculate percentage change
   */
  calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  },

  /**
   * Get month name from number
   */
  getMonthName(monthNumber: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1] || '';
  },

  /**
   * Get formatted date range for analytics
   */
  getDateRange(period: 'monthly' | 'yearly', year?: number): { startDate: string; endDate: string } {
    const targetYear = year || new Date().getFullYear();
    
    if (period === 'yearly') {
      return {
        startDate: `${targetYear - 4}-01-01`,
        endDate: `${targetYear}-12-31`
      };
    } else {
      return {
        startDate: `${targetYear}-01-01`,
        endDate: `${targetYear}-12-31`
      };
    }
  },

  /**
   * Validate date range
   */
  validateDateRange(startDate: string, endDate: string): boolean {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end && !isNaN(start.getTime()) && !isNaN(end.getTime());
  }
};