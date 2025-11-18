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
  ErrorResponse,
  DashboardStats,
  DeliveryStats
} from '../types/auth.ts';

const { VITE_API_BASE_URL } = import.meta.env; 

// Create axios instance with default config
export const api = axios.create({
  baseURL: VITE_API_BASE_URL,
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

// Orders API methods 
export const ordersAPI = {
  // Vendor orders
  createOrder: (data: CreateOrderData): Promise<Order> =>
    apiCall<Order>('post', '/orders/vendor/create', data),

  getVendorOrders: (): Promise<Order[]> =>
    apiCall<Order[]>('get', '/orders/vendor/my-orders'),

  getVendorStats: (): Promise<DashboardStats> =>
    apiCall<DashboardStats>('get', '/orders/vendor/stats'),

  updateOrderStatus: (id: string, status: string): Promise<Order> =>
    apiCall<Order>('patch', `/orders/vendor/${id}/status`, { status }),

  cancelOrder: (id: string): Promise<Order> =>
    apiCall<Order>('delete', `/orders/vendor/${id}/cancel`),

  // Delivery partner methods
  getAvailableOrders: (): Promise<Order[]> =>
    apiCall<Order[]>('get', '/orders/delivery/available'),

  getMyDeliveries: (): Promise<Order[]> =>
    apiCall<Order[]>('get', '/orders/delivery/my-deliveries'),

  getDeliveryStats: (): Promise<DeliveryStats> =>
    apiCall<DeliveryStats>('get', '/orders/delivery/stats'),

  acceptOrder: (orderId: string): Promise<Order> =>
    apiCall<Order>('post', `/orders/delivery/${orderId}/accept`),

  updateDeliveryStatus: (orderId: string, status: string): Promise<Order> =>
    apiCall<Order>('patch', `/orders/delivery/${orderId}/status`, { status }),

  completeDelivery: (orderId: string): Promise<Order> =>
    apiCall<Order>('post', `/orders/delivery/${orderId}/complete`),

  // General orders
  getOrderById: (id: string): Promise<Order> =>
    apiCall<Order>('get', `/orders/${id}`),
};

// Health check
export const healthAPI = {
  check: (): Promise<{ message: string; timestamp: string }> =>
    api.get('/health').then(response => response.data),
};