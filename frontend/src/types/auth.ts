export enum UserRole {
  VENDOR = 'VENDOR',
  DELIVERY_PARTNER = 'DELIVERY_PARTNER',
  ADMIN = 'ADMIN'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: UserRole.VENDOR | UserRole.DELIVERY_PARTNER;
}

// Order related types
export interface Order {
  id: string;
  pickupAddress: string;
  deliveryAddress: string;
  customerName: string;
  customerPhone: string;
  itemDescription: string;
  orderValue: number;
  calculatedDistance?: number;
  status: OrderStatus;
  vendorId: string;
  dropperId?: string;
  createdAt: string;
  updatedAt: string;
  vendor?: User;
  dropper?: User;
}

export interface CreateOrderData {
  pickupAddress: string;
  deliveryAddress: string;
  customerName: string;
  customerPhone: string;
  itemDescription: string;
  orderValue: number;
}

export interface UpdateOrderData {
  status?: OrderStatus;
  dropperId?: string;
}

// Socket.io types for frontend
export interface ServerToClientEvents {
  'order:created': (order: Order) => void;
  'order:accepted': (order: Order) => void;
  'order:updated': (order: Order) => void;
  'order:status-changed': (order: Order) => void;
}

export interface ClientToServerEvents {
  'join:vendor': (vendorId: string) => void;
  'join:dropper': (dropperId: string) => void;
  'join:order': (orderId: string) => void;
  'order:accept': (orderId: string, callback: (success: boolean, message?: string) => void) => void;
  'order:update-status': (orderId: string, status: OrderStatus, callback: (success: boolean) => void) => void;
}

// Form error types
export interface FormErrors {
  [key: string]: string;
}

// Dashboard stats types
export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalEarnings?: number;
  activeDeliveries?: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}