import type { ReactNode } from 'react';
import type { User, Order, UserRole, OrderStatus } from './auth.ts';

// Common component props
export interface BaseComponentProps {
  children?: ReactNode;
  className?: string;
}

// Auth component props
export interface AuthFormProps {
  onSwitchMode?: () => void;
  onSubmit?: (data: any) => void;
  loading?: boolean;
  error?: string;
}

export interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
  fallback?: ReactNode;
}

// Dashboard component props
export interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export interface OrderCardProps {
  order: Order;
  onAccept?: (orderId: string) => void;
  onStatusUpdate?: (orderId: string, status: OrderStatus) => void;
  showActions?: boolean;
}

export interface OrderListProps {
  orders: Order[];
  loading?: boolean;
  emptyMessage?: string;
  onOrderSelect?: (order: Order) => void;
}

// Form component props
export interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  placeholder?: string;
  error?: string;
  options?: { value: string; label: string }[];
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}