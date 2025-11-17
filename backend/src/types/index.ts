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
  // Order events
  'order:created': (order: Order) => void;
  'order:accepted': (data: { orderId: string; timestamp: string }) => void;
  'order:cancelled': (data: { orderId: string }) => void;
  
  // Delivery events
  'delivery:status-changed': (data: { order: Order; timestamp: string }) => void;
  'delivery:completed': (data: { order: Order; timestamp: string }) => void;
}

export interface ClientToServerEvents {
  // Room joining
  'join:vendor': (vendorId: string) => void;
  'join:dropper': (dropperId: string) => void;
  'join:available-orders': () => void;
  
  // Order actions
  'order:created': (order: Order) => void;
  'order:cancelled': (data: { orderId: string; vendorId: string }) => void;
  'order:accept': (orderId: string, dropperId: string, callback: (success: boolean, message?: string) => void) => void;
  
  // Delivery actions
  'delivery:status-update': (data: { orderId: string; status: string }) => void;
  'delivery:completed': (data: { orderId: string }) => void;
}

// JWT Payload
export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}