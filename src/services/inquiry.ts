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

export interface Reply {
  _id?: string;
  subject: string;
  message: string;
  repliedBy: string;
  repliedAt: string;
}

export interface Inquiry {
  _id?: string;
  name: string;
  email: string;
  message: string;
  status: 'pending' | 'replied' | 'closed';
  replies: Reply[];
  lastRepliedAt?: string;
  lastRepliedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InquiryResponse {
  success: boolean;
  message: string;
  inquiry?: Inquiry;
}

export interface InquiriesResponse {
  success: boolean;
  count: number;
  inquiries: Inquiry[];
}

export interface ReplyRequest {
  subject: string;
  message: string;
  repliedBy: string;
}

export interface ReplyResponse {
  success: boolean;
  message: string;
  inquiry?: Inquiry;
}

export const inquiryAPI = {
  async create(name: string, email: string, message: string): Promise<InquiryResponse> {
    const response = await axiosInstance.post('/api/inquiry', { name, email, message });
    return response.data;
  },

  async getAll(): Promise<Inquiry[]> {
    const response = await axiosInstance.get('/api/inquiry');
    return response.data.inquiries;
  },

  async getById(id: string): Promise<Inquiry> {
    const response = await axiosInstance.get(`/api/inquiry/${id}`);
    return response.data.inquiry;
  },

  async reply(id: string, replyData: ReplyRequest): Promise<ReplyResponse> {
    const response = await axiosInstance.post(`/api/inquiry/${id}/reply`, replyData);
    return response.data;
  },

  async updateStatus(id: string, status: 'pending' | 'replied' | 'closed'): Promise<InquiryResponse> {
    const response = await axiosInstance.put(`/api/inquiry/${id}/status`, { status });
    return response.data;
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.delete(`/api/inquiry/${id}`);
    return response.data;
  },
};