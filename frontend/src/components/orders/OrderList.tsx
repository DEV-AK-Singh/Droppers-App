import React, { useState } from 'react';
import { type Order, OrderStatus } from '../../types/auth';
import { OrderCard } from './OrderCard';

interface OrderListProps {
  orders: Order[];
  loading?: boolean;
  onStatusUpdate?: (orderId: string, status: OrderStatus) => void;
  onCancel?: (orderId: string) => void;
  emptyMessage?: string;
}

export const OrderList: React.FC<OrderListProps> = ({
  orders,
  loading = false,
  onStatusUpdate,
  onCancel,
  emptyMessage = "No orders found"
}) => {
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');

  const statusFilters = [
    { value: 'ALL' as const, label: 'All Orders', count: orders.length },
    { value: OrderStatus.PENDING, label: 'Pending', count: orders.filter(o => o.status === OrderStatus.PENDING).length },
    { value: OrderStatus.ASSIGNED, label: 'Assigned', count: orders.filter(o => o.status === OrderStatus.ASSIGNED).length },
    { value: OrderStatus.PICKED_UP, label: 'Picked Up', count: orders.filter(o => o.status === OrderStatus.PICKED_UP).length },
    { value: OrderStatus.IN_TRANSIT, label: 'In Transit', count: orders.filter(o => o.status === OrderStatus.IN_TRANSIT).length },
    { value: OrderStatus.DELIVERED, label: 'Delivered', count: orders.filter(o => o.status === OrderStatus.DELIVERED).length },
    { value: OrderStatus.CANCELLED, label: 'Cancelled', count: orders.filter(o => o.status === OrderStatus.CANCELLED).length },
  ];

  const filteredOrders = filter === 'ALL' 
    ? orders 
    : orders.filter(order => order.status === filter);

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

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {statusFilters.map((statusFilter) => (
          <button
            key={statusFilter.value}
            onClick={() => setFilter(statusFilter.value)}
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors duration-200 ${
              filter === statusFilter.value
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {statusFilter.label}
            <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
              filter === statusFilter.value
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {statusFilter.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyMessage}</h3>
          <p className="text-gray-500">
            {filter === 'ALL' 
              ? "You haven't created any orders yet. Create your first order to get started!"
              : `No ${filter.toLowerCase().replace('_', ' ')} orders found.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusUpdate={onStatusUpdate}
              onCancel={onCancel}
              showActions={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};