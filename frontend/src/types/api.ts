import type { AxiosRequestConfig } from 'axios';

export interface ApiConfig extends AxiosRequestConfig {
  requireAuth?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ListQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  status?: string;
  vendorId?: string;
  dropperId?: string;
}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  errors?: ValidationError[];
}