import React from 'react';
import type { DashboardStats } from '../../types/auth';

interface VendorStatsProps {
  stats: DashboardStats;
  loading?: boolean;
}

export const VendorStats: React.FC<VendorStatsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      color: 'blue',
      icon: '📦',
      description: 'All time orders'
    },
    {
      title: 'Pending Delivery',
      value: stats.pendingOrders,
      color: 'yellow',
      icon: '⏳',
      description: 'Awaiting delivery'
    },
    {
      title: 'Delivered',
      value: stats.deliveredOrders,
      color: 'green',
      icon: '✅',
      description: 'Successfully delivered'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue?.toLocaleString() || 0}`,
      color: 'purple',
      icon: '💰',
      description: 'Total earnings'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <div
          key={stat.title + index}
          className={`bg-white rounded-xl shadow-sm border-2 p-6 transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${colorClasses[stat.color as keyof typeof colorClasses]}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-75">{stat.title}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
              <p className="text-xs opacity-60 mt-1">{stat.description}</p>
            </div>
            <div className="text-3xl opacity-80">
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};