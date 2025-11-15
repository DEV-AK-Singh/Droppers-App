import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User, LoginData, RegisterData } from "../types/auth.ts";
import { UserRole } from "../types/auth.ts";
import { authAPI } from "../services/api.ts";

// Auth context type
interface AuthContextType {
  // State
  user: User | null;
  loading: boolean;
  error: string | null;

  // Auth methods
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;

  // Auth status
  isAuthenticated: boolean;
  isVendor: boolean;
  isDeliveryPartner: boolean;
  isAdmin: boolean;

  // Role checking
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Clear error message
  const clearError = () => setError(null);

  // Check if user is authenticated on app start
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<void> => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { user } = await authAPI.getProfile();
      setUser(user);
    } catch (err) {
      console.error("Auth check failed:", err);
      localStorage.removeItem("token");
      setError("Session expired. Please login again.");
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginData): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.login(data);
      localStorage.setItem("token", response.token);
      setUser(response.user);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Login failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.register(data);
      localStorage.setItem("token", response.token);
      setUser(response.user);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Registration failed";
      setError(errorMessage); 
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem("token");
    setUser(null);
    setError(null);
  };

  // Role checking utilities
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;

    if (Array.isArray(role)) {
      return role.includes(user.role);
    }

    return user.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some((role) => hasRole(role));
  };

  // Computed properties
  const isAuthenticated = !!user;
  const isVendor = hasRole(UserRole.VENDOR);
  const isDeliveryPartner = hasRole(UserRole.DELIVERY_PARTNER);
  const isAdmin = hasRole(UserRole.ADMIN);

  // Context value
  const value: AuthContextType = {
    // State
    user,
    loading,
    error,

    // Auth methods
    login,
    register,
    logout,
    clearError,

    // Auth status
    isAuthenticated,
    isVendor,
    isDeliveryPartner,
    isAdmin,

    // Role checking
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Higher Order Component for protecting routes by role
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: UserRole | UserRole[]
): React.FC<P> => {
  const AuthenticatedComponent: React.FC<P> = (props) => {
    const { isAuthenticated, hasRole, loading } = useAuth();

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600">Please log in to access this page.</p>
          </div>
        </div>
      );
    }

    if (requiredRole && !hasRole(requiredRole)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };

  return AuthenticatedComponent;
};
