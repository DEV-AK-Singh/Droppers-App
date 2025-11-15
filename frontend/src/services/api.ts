import axios, { type AxiosResponse, AxiosError } from 'axios';
import type { 
  AuthResponse, 
  LoginData, 
  RegisterData, 
  ApiResponse, 
  User,
  Order,
  CreateOrderData,
  ApiError,
  ErrorResponse
} from '../types/auth.ts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ErrorResponse>) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    
    // Convert axios error to our custom error format
    const customError: ApiError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      code: error.code,
      status: error.response?.status,
      details: error.response?.data?.errors || error.response?.data?.error,
    };
    
    return Promise.reject(customError);
  }
);

// Generic API call function
const apiCall = async <T>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  data?: any
): Promise<T> => {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await api[method](url, data);
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data.data!;
  } catch (error) {
    throw error;
  }
};

// Auth API methods
export const authAPI = {
  login: (data: LoginData): Promise<AuthResponse> => 
    apiCall<AuthResponse>('post', '/auth/login', data),

  register: (data: RegisterData): Promise<AuthResponse> => 
    apiCall<AuthResponse>('post', '/auth/register', data),

  getProfile: (): Promise<{ user: User }> => 
    apiCall<{ user: User }>('get', '/auth/profile'),

  updateProfile: (data: Partial<User>): Promise<{ user: User }> => 
    apiCall<{ user: User }>('put', '/auth/profile', data),
};

// Orders API methods (for future use)
export const ordersAPI = {
  create: (data: CreateOrderData): Promise<Order> => 
    apiCall<Order>('post', '/orders', data),

  list: (): Promise<Order[]> => 
    apiCall<Order[]>('get', '/orders'),

  getMyOrders: (): Promise<Order[]> => 
    apiCall<Order[]>('get', '/orders/my-orders'),

  getById: (id: string): Promise<Order> => 
    apiCall<Order>('get', `/orders/${id}`),

  updateStatus: (id: string, status: string): Promise<Order> => 
    apiCall<Order>('patch', `/orders/${id}/status`, { status }),

  acceptOrder: (id: string): Promise<Order> => 
    apiCall<Order>('post', `/orders/${id}/accept`),
};

// Health check
export const healthAPI = {
  check: (): Promise<{ message: string; timestamp: string }> => 
    api.get('/health').then(response => response.data),
};