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

// Add response interceptor for token expiration handling
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
  email: string;
  name: string;
  role: 'customer' | 'staff' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interfaces for the new endpoints
export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileData {
  name: string;
  email: string;
}

class ApiClient {

  // Auth Endpoints
  async register(email: string, password: string, name: string): Promise<{ user: User; token: string }> {
    const response = await axiosInstance.post('/api/auth/register', { email, password, name });
    const { user, token } = response.data;

    // Don't store in localStorage here - let AuthContext handle it
    // This prevents duplicate storage and allows AuthContext to validate token first
    return { user, token };
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await axiosInstance.post('/api/auth/login', { email, password });
    const { user, token } = response.data;

    // Don't store in localStorage here - let AuthContext handle it
    // This prevents duplicate storage and allows AuthContext to validate token first
    return { user, token };
  }

  logout() {
    try {
      axiosInstance.post('/api/auth/logout');
    } catch (err) {
      console.warn('Logout request failed:', err);
    }
    // Don't clear localStorage here - let AuthContext handle complete cleanup
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await axiosInstance.post('/api/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await axiosInstance.put(`/api/auth/reset-password/${token}`, { newPassword: newPassword });
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await axiosInstance.get('/api/auth/user');
    return response.data;
  }

  async validateResetToken(token: string): Promise<{ message: string }> {
    const response = await axiosInstance.get(`/api/auth/validate-reset-token/${token}`);
    return response.data;
  }

  // NEW: Get user profile
  async getUserProfile(): Promise<{ success: boolean; data: { user: UserProfile } }> {
    const response = await axiosInstance.get('/api/auth/profile');
    return response.data;
  }

  // NEW: Change password
  async changePassword(passwordData: ChangePasswordData): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.put('/api/auth/change-password', passwordData);
    return response.data;
  }

  // NEW: Update user profile
  async updateUserProfile(profileData: UpdateProfileData): Promise<{ 
    success: boolean; 
    message: string; 
    data: { user: UserProfile } 
  }> {
    const response = await axiosInstance.put('/api/auth/profile', profileData);
    return response.data;
  }
}

// Create and export API client instance
export const apiClient = new ApiClient();

// Export individual API functions
export const authAPI = {
  login: apiClient.login.bind(apiClient),
  register: apiClient.register.bind(apiClient),
  forgotPassword: apiClient.forgotPassword.bind(apiClient),
  resetPassword: apiClient.resetPassword.bind(apiClient),
  getCurrentUser: apiClient.getCurrentUser.bind(apiClient),
  logout: apiClient.logout.bind(apiClient),
  validateResetToken: apiClient.validateResetToken.bind(apiClient),
  // NEW: Add the three new endpoints
  getUserProfile: apiClient.getUserProfile.bind(apiClient),
  changePassword: apiClient.changePassword.bind(apiClient),
  updateUserProfile: apiClient.updateUserProfile.bind(apiClient),
};