import React from 'react';
import { type Order, OrderStatus, UserRole } from '../../types/auth';
import { useAuth } from '../../contexts/AuthContext';

interface OrderCardProps {
  order: Order;
  onStatusUpdate?: (orderId: string, status: OrderStatus) => void;
  onCancel?: (orderId: string) => void;
  showActions?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onStatusUpdate,
  onCancel,
  showActions = true
}) => {
  const { user } = useAuth();
  
  const getStatusColor = (status: OrderStatus): string => {
    const colors = {
      [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      [OrderStatus.ASSIGNED]: 'bg-blue-100 text-blue-800 border-blue-200',
      [OrderStatus.PICKED_UP]: 'bg-purple-100 text-purple-800 border-purple-200',
      [OrderStatus.IN_TRANSIT]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800 border-green-200',
      [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status];
  };

  const getStatusIcon = (status: OrderStatus): string => {
    const icons = {
      [OrderStatus.PENDING]: '⏳',
      [OrderStatus.ASSIGNED]: '👤',
      [OrderStatus.PICKED_UP]: '📦',
      [OrderStatus.IN_TRANSIT]: '🚗',
      [OrderStatus.DELIVERED]: '✅',
      [OrderStatus.CANCELLED]: '❌',
    };
    return icons[status];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Vendor can only cancel pending orders
  const canCancel = user?.role === UserRole.VENDOR && order.status === OrderStatus.PENDING;
  
  // Delivery partners can update status through workflow
  const canUpdateStatus = user?.role === UserRole.DELIVERY_PARTNER && 
    order.status !== OrderStatus.DELIVERED && 
    order.status !== OrderStatus.CANCELLED;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Order #{order.id.slice(-8).toUpperCase()}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Created {formatDate(order.createdAt)}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
          <span className="mr-1">{getStatusIcon(order.status)}</span>
          {order.status.replace('_', ' ')}
        </div>
      </div>

      {/* Customer Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Customer Details</h4>
          <div className="space-y-1">
            <p className="text-sm text-gray-900">
              <span className="font-medium">Name:</span> {order.customerName}
            </p>
            <p className="text-sm text-gray-900">
              <span className="font-medium">Phone:</span> {order.customerPhone}
            </p>
            {order.orderValue > 0 && (
              <p className="text-sm text-gray-900">
                <span className="font-medium">Order Value:</span> ₹{order.orderValue}
              </p>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Delivery Info</h4>
          <div className="space-y-1">
            {order.calculatedDistance && (
              <p className="text-sm text-gray-900">
                <span className="font-medium">Distance:</span> {order.calculatedDistance.toFixed(1)} km
              </p>
            )}
            {order.dropper && (
              <p className="text-sm text-gray-900">
                <span className="font-medium">Delivery Partner:</span> {order.dropper.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Pickup Address</h4>
          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
            {order.pickupAddress}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Delivery Address</h4>
          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
            {order.deliveryAddress}
          </p>
        </div>
      </div>

      {/* Item Description */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Items</h4>
        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
          {order.itemDescription}
        </p>
      </div>

      {/* Delivery Partner Info */}
      {order.dropper && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Delivery Partner</h4>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <span className="text-blue-600">🚗</span>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">{order.dropper.name}</p>
                <p className="text-xs text-blue-700">{order.dropper.phone}</p>
                {order.dropper.email && (
                  <p className="text-xs text-blue-600">{order.dropper.email}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
 
      {/* Actions */}
      {showActions && (canCancel || canUpdateStatus) && (
        <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
          {/* Vendor Actions - Only Cancel */}
          {canCancel && onCancel && (
            <button
              onClick={() => onCancel(order.id)}
              className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
            >
              Cancel Order
            </button>
          )}
          
          {/* Delivery Partner Actions - Status Updates */}
          {canUpdateStatus && onStatusUpdate && (
            <div className="flex space-x-2">
              {order.status === OrderStatus.ASSIGNED && (
                <button
                  onClick={() => onStatusUpdate(order.id, OrderStatus.PICKED_UP)}
                  className="px-3 py-1 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200"
                >
                  Mark Picked Up
                </button>
              )}
              {order.status === OrderStatus.PICKED_UP && (
                <button
                  onClick={() => onStatusUpdate(order.id, OrderStatus.IN_TRANSIT)}
                  className="px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  Start Delivery
                </button>
              )}
              {order.status === OrderStatus.IN_TRANSIT && (
                <button
                  onClick={() => onStatusUpdate(order.id, OrderStatus.DELIVERED)}
                  className="px-3 py-1 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
                >
                  Complete Delivery
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};