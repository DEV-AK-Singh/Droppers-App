import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import type { LoginData } from '../types/auth.ts';

interface LoginFormProps {
  onSwitchToRegister?: () => void;
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSwitchToRegister, 
  onSuccess 
}) => {
  const { login, error, clearError, loading } = useAuth();
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });
  const [localError, setLocalError] = useState<string>('');
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  // Clear errors when component mounts or when auth error changes
  useEffect(() => {
    clearError();
    setLocalError('');
  }, [clearError]);

  // Handle form validation
  const validateForm = (): boolean => {
    const { email, password } = formData;

    if (!email.trim()) {
      setLocalError('Email is required');
      return false;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setLocalError('Please enter a valid email address');
      return false;
    }

    if (!password) {
      setLocalError('Password is required');
      return false;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return false;
    }

    setLocalError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      // Error is already handled in the auth context
      console.error('Login error:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (localError || error) {
      setLocalError('');
      clearError();
    }
  };

  const handleBlur = (field: keyof LoginData) => {
    setTouched(prev => ({
      ...prev,
      [field]: true,
    }));
  };

  const handleDemoLogin = (role: 'vendor' | 'delivery') => {
    const demoCredentials = {
      vendor: {
        email: 'demo@vendor.com',
        password: 'demo123'
      },
      delivery: {
        email: 'demo@delivery.com', 
        password: 'demo123'
      }
    };

    setFormData(demoCredentials[role]);
  };

  // Field-specific validation
  const getFieldError = (field: keyof LoginData): string => {
    if (!touched[field]) return '';

    const value = formData[field];

    switch (field) {
      case 'email':
        if (!value) return 'Email is required';
        if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return 'Please enter a valid email';
        return '';
      
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      
      default:
        return '';
    }
  };

  const displayError = localError || error;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-blue-700 px-6 py-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-blue-100 text-lg">Sign in to your Droppers account</p>
        </div>

        {/* Form */}
        <div className="px-6 py-8">
          {displayError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <div className="shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {displayError}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  required
                  className={`block w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                    getFieldError('email') 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Enter your email address"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className={`h-5 w-5 ${
                    getFieldError('email') ? 'text-red-400' : 'text-gray-400'
                  }`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
              </div>
              {getFieldError('email') && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {getFieldError('email')}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                  onClick={() => {/* TODO: Implement forgot password */}}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  required
                  className={`block w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                    getFieldError('password') 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className={`h-5 w-5 ${
                    getFieldError('password') ? 'text-red-400' : 'text-gray-400'
                  }`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {getFieldError('password') && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {getFieldError('password')}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Login Buttons */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Accounts</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDemoLogin('vendor')}
                className="inline-flex justify-center items-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <span className="mr-2">🏪</span>
                Vendor Demo
              </button>
              
              <button
                type="button"
                onClick={() => handleDemoLogin('delivery')}
                className="inline-flex justify-center items-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <span className="mr-2">🚗</span>
                Delivery Demo
              </button>
            </div>
          </div>

          {/* Switch to Register */}
          {onSwitchToRegister && (
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="font-semibold text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition-colors duration-200"
                >
                  Sign up now
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            By signing in, you agree to our{' '}
            <button className="text-blue-600 hover:text-blue-500">Terms of Service</button>
            {' '}and{' '}
            <button className="text-blue-600 hover:text-blue-500">Privacy Policy</button>
          </p>
        </div>
      </div>
    </div>
  );
};