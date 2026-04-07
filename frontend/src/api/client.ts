import axios from 'axios';
import { Event, Registration, Category, CreateEventDto, UpdateEventDto, EventFilters, ApiResponse } from './types';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for Clerk authentication
});

// Function to get auth token from Clerk (to be called from components)
let getAuthToken: (() => Promise<string | null>) | null = null;

export const setAuthTokenGetter = (tokenGetter: () => Promise<string | null>) => {
  getAuthToken = tokenGetter;
};

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  if (getAuthToken) {
    try {
      const token = await getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.error('Backend server is not running on http://localhost:8080');
    }
    return Promise.reject(error);
  }
);

// Events API
export const eventsApi = {
  // GET /api/events
  getAll: async (filters?: EventFilters): Promise<ApiResponse<Event[]>> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.organizer) params.append('organizer', filters.organizer);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get(`/events?${params.toString()}`);
    return response.data;
  },

  // GET /api/events/:id
  getById: async (id: number): Promise<ApiResponse<Event>> => {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  },

  // POST /api/events
  create: async (eventData: CreateEventDto): Promise<ApiResponse<Event>> => {
    const response = await apiClient.post('/events', eventData);
    return response.data;
  },

  // PUT /api/events/:id
  update: async (id: number, eventData: UpdateEventDto): Promise<ApiResponse<Event>> => {
    const response = await apiClient.put(`/events/${id}`, eventData);
    return response.data;
  },

  // DELETE /api/events/:id
  delete: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete(`/events/${id}`);
    return response.data;
  },
};

// Registrations API
export const registrationsApi = {
  // GET /api/registrations
  getUserRegistrations: async (): Promise<ApiResponse<Registration[]>> => {
    const response = await apiClient.get('/registrations');
    return response.data;
  },

  // POST /api/registrations
  register: async (eventId: number): Promise<ApiResponse<Registration>> => {
    const response = await apiClient.post('/registrations', { eventId });
    return response.data;
  },

  // DELETE /api/registrations/:id
  cancel: async (registrationId: number): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete(`/registrations/${registrationId}`);
    return response.data;
  },

  // GET /api/events/:eventId/registrations (organizer only)
  getEventRegistrations: async (eventId: number): Promise<ApiResponse<Registration[]>> => {
    const response = await apiClient.get(`/events/${eventId}/registrations`);
    return response.data;
  },
};

// Categories API
export const categoriesApi = {
  // GET /api/categories
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  // GET /api/categories/all
  getAllCategories: async (): Promise<ApiResponse<Category[]>> => {
    const response = await apiClient.get('/categories/all');
    return response.data;
  },
};