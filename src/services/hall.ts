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

export interface HallImage {
  url: string;
  publicId: string;
  label: string;
}

export interface Hall {
  _id?: string;
  name: string;
  description: string;
  capacity: number;
  basePrice: number;
  additionalHourPrice: number;
  features: string[];
  amenities: string[];
  location: string;
  size: string;
  images: HallImage[];
  rating: number;
  reviews: number;
}

export const hallAPI = {
  async getAll(): Promise<Hall[]> {
    const response = await axiosInstance.get('/api/hall');
    return response.data;
  },

  async getById(id: string): Promise<Hall> {
    const response = await axiosInstance.get(`/api/hall/${id}`);
    return response.data;
  },

  async create(formData: FormData): Promise<Hall> {
    const response = await axiosInstance.post('/api/hall', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async update(id: string, formData: FormData): Promise<Hall> {
    const response = await axiosInstance.put(`/api/hall/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await axiosInstance.delete(`/api/hall/${id}`);
    return response.data;
  },
};
