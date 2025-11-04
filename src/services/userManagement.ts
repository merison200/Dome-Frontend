import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Create axios instance with interceptors
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('dome_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token expiration handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token is expired or invalid
      localStorage.removeItem('dome_user');
      localStorage.removeItem('dome_token');
      
      // Clear cookies if they exist
      document.cookie = 'dome_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Dispatch a custom event that the AuthContext can listen to
      window.dispatchEvent(new CustomEvent('auth:logout', {
        detail: { reason: 'token_expired' }
      }));
      
      console.log('Token expired, user will be logged out');
    }
    
    return Promise.reject(error);
  }
);

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'customer';
  createdAt: string;
  updatedAt?: string;
  status: 'active' | 'inactive';
  adminNotes?: string;
  lastReviewed?: string | null;
  totalBookings: number;
  totalRevenue: number;
  lastBooking: string | null;
}

export interface UserDetails {
  user: User;
  stats: {
    _id: null;
    totalBookings: number;
    totalRevenue: number;
    lastBooking: string | null;
  };
  recentBookings: Array<{
    _id: string;
    date: string;
    hall: string;
    amount: number;
    status: string;
  }>;
}

export interface Analytics {
  totalStats: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    averageRevenue: number;
  };
  newRegistrations: Array<{
    _id: {
      year: number;
      month: number;
    };
    count: number;
    month: string;
  }>;
  roleDistribution: Array<{
    _id: string;
    count: number;
    role: string;
    percentage: number;
  }>;
  topCustomers: Array<{
    _id: string;
    bookings: number;
    revenue: number;
    name: string;
    email: string;
  }>;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    hasNext: boolean;
    hasPrev: boolean;
    limit: number;
  };
}

export interface Filters {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface RoleChangeData {
  newRole: string;
}

export interface StatusChangeData {
  status: 'active' | 'inactive';
}

export interface BulkStatusChangeData {
  userIds: string[];
  status: 'active' | 'inactive';
}

export interface EmailData {
  subject: string;
  message: string;
}

export interface NotesData {
  adminNotes: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

class UserManagementAPI {
  // GET /api/admin/users/analytics
  async getAnalytics(): Promise<Analytics> {
    const response = await axiosInstance.get<ApiResponse<Analytics>>('/api/admin/users/analytics');
    return response.data.data;
  }

  // GET /api/admin/users
  async getUsers(filters: Filters = {}): Promise<UsersResponse> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.role && filters.role !== 'all') params.append('role', filters.role);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await axiosInstance.get<ApiResponse<UsersResponse>>(`/api/admin/users?${params.toString()}`);
    return response.data.data;
  }

  // GET /api/admin/users/:userId
  async getUserDetails(userId: string): Promise<UserDetails> {
    const response = await axiosInstance.get<ApiResponse<UserDetails>>(`/api/admin/users/${userId}`);
    return response.data.data;
  }

  // PUT /api/admin/users/:userId/role
  async updateUserRole(userId: string, roleData: RoleChangeData): Promise<any> {
    const response = await axiosInstance.put(`/api/admin/users/${userId}/role`, roleData);
    return response.data;
  }

  // PUT /api/admin/users/:userId/status
  async updateUserStatus(userId: string, statusData: StatusChangeData): Promise<any> {
    const response = await axiosInstance.put(`/api/admin/users/${userId}/status`, statusData);
    return response.data;
  }

  // PUT /api/admin/users/bulk-status
  async updateBulkUserStatus(bulkData: BulkStatusChangeData): Promise<any> {
    const response = await axiosInstance.put('/api/admin/users/bulk-status', bulkData);
    return response.data;
  }

  // PUT /api/admin/users/:userId/notes
  async updateUserNotes(userId: string, notesData: NotesData): Promise<any> {
    const response = await axiosInstance.put(`/api/admin/users/${userId}/notes`, notesData);
    return response.data;
  }

  // POST /api/admin/users/:userId/send-email
  async sendUserEmail(userId: string, emailData: EmailData): Promise<any> {
    const response = await axiosInstance.post(`/api/admin/users/${userId}/send-email`, emailData);
    return response.data;
  }
}

export const userManagementAPI = new UserManagementAPI();