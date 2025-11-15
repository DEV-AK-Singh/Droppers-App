import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { AuthLanding } from './components/AuthLanding.tsx';
import { VendorDashboard } from './components/dashboards/VendorDashboard.tsx';
import { DeliveryDashboard } from './components/dashboards/DeliveryDashboard.tsx';
import { UserRole } from './types/auth.ts';

const AppContent: React.FC = () => {
  const { isAuthenticated, user, loading, error } = useAuth();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 text-sm transition-colors duration-200 mt-4"
          >
            Reload
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gray-500 text-white ms-2 px-4 py-2 rounded-md hover:bg-gray-600 text-sm transition-colors duration-200 mt-4"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthLanding />;
  }

  // Render appropriate dashboard based on user role
  switch (user?.role) {
    case UserRole.VENDOR:
      return <VendorDashboard />;
    case UserRole.DELIVERY_PARTNER:
      return <DeliveryDashboard />;
    case UserRole.ADMIN:
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
            <p className="text-gray-600">Admin features coming soon...</p>
          </div>
        </div>
      );
    default:
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Unknown Role</h2>
            <p className="text-gray-600">Please contact support.</p>
          </div>
        </div>
      );
  }
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;