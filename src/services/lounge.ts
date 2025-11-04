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

export interface Lounge {
  _id?: string;
  name: string;
  description: string;
  date: string;
  time: string;
  images: string[];
  labels: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LoungeResponse {
  success: boolean;
  message: string;
  data: Lounge | Lounge[];
}

export interface CreateLoungeData {
  name: string;
  description: string;
  date: string;
  time: string;
  labels: string[];
  images?: FileList | File[];
}

export interface UpdateLoungeData {
  name?: string;
  description?: string;
  date?: string;
  time?: string;
  labels?: string[];
  images?: FileList | File[];
  keepExistingImages?: boolean;
}

export const loungeAPI = {
  async getAll(params?: { 
    sortBy?: string; 
    sortOrder?: 'asc' | 'desc' 
  }): Promise<LoungeResponse> {
    const queryParams = new URLSearchParams();
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const url = queryString ? `/api/lounge?${queryString}` : '/api/lounge';
    
    const response = await axiosInstance.get(url);
    return response.data;
  },

  async getById(id: string): Promise<LoungeResponse> {
    const response = await axiosInstance.get(`/api/lounge/${id}`);
    return response.data;
  },

  async create(loungeData: CreateLoungeData): Promise<LoungeResponse> {
    const formData = new FormData();
    
    formData.append('name', loungeData.name);
    formData.append('description', loungeData.description);
    formData.append('date', loungeData.date);
    formData.append('time', loungeData.time);
    formData.append('labels', JSON.stringify(loungeData.labels));
    
    if (loungeData.images) {
      const imageFiles = Array.from(loungeData.images);
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });
    }

    const response = await axiosInstance.post('/api/lounge', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async update(id: string, loungeData: UpdateLoungeData): Promise<LoungeResponse> {
    const formData = new FormData();
    
    if (loungeData.name) formData.append('name', loungeData.name);
    if (loungeData.description) formData.append('description', loungeData.description);
    if (loungeData.date) formData.append('date', loungeData.date);
    if (loungeData.time) formData.append('time', loungeData.time);
    if (loungeData.labels) formData.append('labels', JSON.stringify(loungeData.labels));

    if (loungeData.keepExistingImages !== undefined) {
      formData.append('keepExistingImages', loungeData.keepExistingImages.toString());
    }
    
    if (loungeData.images) {
      const imageFiles = Array.from(loungeData.images);
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });
    }

    const response = await axiosInstance.put(`/api/lounge/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async delete(id: string): Promise<LoungeResponse> {
    const response = await axiosInstance.delete(`/api/lounge/${id}`);
    return response.data;
  },
};