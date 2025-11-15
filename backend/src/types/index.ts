// User types
export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone?: string;
}

// Order types
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
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderInput {
  pickupAddress: string;
  deliveryAddress: string;
  customerName: string;
  customerPhone: string;
  itemDescription: string;
  orderValue: number;
  vendorId: string;
}

export interface UpdateOrderInput {
  status?: OrderStatus;
  dropperId?: string;
}

// Enums
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

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

// Socket.io types
export interface ServerToClientEvents {
  'order:created': (order: Order) => void;
  'order:accepted': (order: Order) => void;
  'order:updated': (order: Order) => void;
}

export interface ClientToServerEvents {
  'join:vendor': (vendorId: string) => void;
  'join:dropper': (dropperId: string) => void;
  'order:accept': (orderId: string, callback: (success: boolean) => void) => void;
}

// JWT Payload
export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}