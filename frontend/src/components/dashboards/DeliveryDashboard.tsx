import React from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';

export const DeliveryDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">🚚 Droppers</h1>
              <span className="ml-4 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                DELIVERY PARTNER
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 text-sm transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to Your Delivery Dashboard
              </h2>
              <p className="text-gray-600 mb-4">
                Get ready to accept delivery orders and earn money!
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                <h3 className="font-semibold text-green-900 mb-2">Coming Soon Features:</h3>
                <ul className="text-sm text-green-800 text-left space-y-1">
                  <li>• View available delivery orders</li>
                  <li>• Accept orders in real-time</li>
                  <li>• Track your delivery progress</li>
                  <li>• Manage your earnings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};