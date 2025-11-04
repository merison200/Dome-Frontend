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

export interface ClubEvent {
  _id?: string;
  name: string;
  description: string;
  date: string;
  time: string;
  dj: string[];
  hypeman: string[];
  images: string[];
  labels: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ClubEventResponse {
  success: boolean;
  message: string;
  data: ClubEvent | ClubEvent[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalEvents: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreateEventData {
  name: string;
  description: string;
  date: string;
  time: string;
  dj: string[];
  hypeman: string[];
  labels: string[];
  images?: FileList | File[];
}

export interface UpdateEventData {
  name?: string;
  description?: string;
  date?: string;
  time?: string;
  dj?: string[];
  hypeman?: string[];
  labels?: string[];
  images?: FileList | File[];
  keepExistingImages?: boolean;
}

export const clubAPI = {
  async getAll(params?: { 
    page?: number; 
    limit?: number; 
    sortBy?: string; 
    sortOrder?: 'asc' | 'desc' 
  }): Promise<ClubEventResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await axiosInstance.get(`/api/club?${queryParams.toString()}`);
    return response.data;
  },

  async getById(id: string): Promise<ClubEventResponse> {
    const response = await axiosInstance.get(`/api/club/${id}`);
    return response.data;
  },

  async create(eventData: CreateEventData): Promise<ClubEventResponse> {
    const formData = new FormData();
    
    // Append basic fields
    formData.append('name', eventData.name);
    formData.append('description', eventData.description);
    formData.append('date', eventData.date);
    formData.append('time', eventData.time);
    
    // Append arrays as JSON strings
    formData.append('dj', JSON.stringify(eventData.dj));
    formData.append('hypeman', JSON.stringify(eventData.hypeman));
    formData.append('labels', JSON.stringify(eventData.labels));
    
    // Append images
    if (eventData.images) {
      const imageFiles = Array.from(eventData.images);
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });
    }

    const response = await axiosInstance.post('/api/club', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async update(id: string, eventData: UpdateEventData): Promise<ClubEventResponse> {
    const formData = new FormData();
    
    // Append fields only if they exist
    if (eventData.name) formData.append('name', eventData.name);
    if (eventData.description) formData.append('description', eventData.description);
    if (eventData.date) formData.append('date', eventData.date);
    if (eventData.time) formData.append('time', eventData.time);
    
    // Append arrays as JSON strings if they exist
    if (eventData.dj) formData.append('dj', JSON.stringify(eventData.dj));
    if (eventData.hypeman) formData.append('hypeman', JSON.stringify(eventData.hypeman));
    if (eventData.labels) formData.append('labels', JSON.stringify(eventData.labels));
    
    // Append keepExistingImages flag
    if (eventData.keepExistingImages !== undefined) {
      formData.append('keepExistingImages', eventData.keepExistingImages.toString());
    }
    
    // Append new images if provided
    if (eventData.images) {
      const imageFiles = Array.from(eventData.images);
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });
    }

    const response = await axiosInstance.put(`/api/club/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async delete(id: string): Promise<ClubEventResponse> {
    const response = await axiosInstance.delete(`/api/club/${id}`);
    return response.data;
  },

  async search(params: {
    query: string;
    page?: number;
    limit?: number;
  }): Promise<ClubEventResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('query', params.query);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await axiosInstance.get(`/api/club/search?${queryParams.toString()}`);
    return response.data;
  },
};