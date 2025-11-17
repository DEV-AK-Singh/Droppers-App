import React from 'react';
import { type Order } from '../../types/auth';
import { OrderCard } from '../orders/OrderCard';

interface AvailableOrdersProps {
  orders: Order[];
  loading?: boolean;
  onAcceptOrder: (orderId: string) => void;
  acceptingOrderId?: string | null;
}

export const AvailableOrders: React.FC<AvailableOrdersProps> = ({
  orders,
  loading = false,
  onAcceptOrder,
  acceptingOrderId
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex justify-between mb-4">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/6"></div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">😴</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Orders</h3>
        <p className="text-gray-500">
          There are no orders available for delivery at the moment. Check back later!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="relative">
          <OrderCard
            order={order}
            showActions={false}
          />
          <div className="absolute top-4 right-4">
            <button
              onClick={() => onAcceptOrder(order.id)}
              disabled={acceptingOrderId === order.id}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {acceptingOrderId === order.id ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Accepting...
                </div>
              ) : (
                'Accept Delivery'
              )}
            </button>
          </div>
          
          {/* Delivery Info Badge */}
          <div className="absolute top-4 left-4">
            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              {order.calculatedDistance ? `${order.calculatedDistance.toFixed(1)} km` : 'Distance N/A'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};