import React, { useState } from 'react';
import { type Order, OrderStatus } from '../../types/auth';
import { OrderCard } from '../orders/OrderCard';

interface MyDeliveriesProps {
  deliveries: Order[];
  loading?: boolean;
  onStatusUpdate: (orderId: string, status: OrderStatus) => void;
  onCompleteDelivery: (orderId: string) => void;
}

export const MyDeliveries: React.FC<MyDeliveriesProps> = ({
  deliveries,
  loading = false,
  onStatusUpdate,
  onCompleteDelivery
}) => {
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');

  const statusFilters = [
    { value: 'ALL' as const, label: 'All Deliveries', count: deliveries.length },
    { value: OrderStatus.ASSIGNED, label: 'Assigned', count: deliveries.filter(d => d.status === OrderStatus.ASSIGNED).length },
    { value: OrderStatus.PICKED_UP, label: 'Picked Up', count: deliveries.filter(d => d.status === OrderStatus.PICKED_UP).length },
    { value: OrderStatus.IN_TRANSIT, label: 'In Transit', count: deliveries.filter(d => d.status === OrderStatus.IN_TRANSIT).length },
    { value: OrderStatus.DELIVERED, label: 'Completed', count: deliveries.filter(d => d.status === OrderStatus.DELIVERED).length },
  ];

  const filteredDeliveries = filter === 'ALL' 
    ? deliveries 
    : deliveries.filter(delivery => delivery.status === filter);

  const getNextAction = (status: OrderStatus): { action: string; nextStatus: OrderStatus } | null => {
    switch (status) {
      case OrderStatus.ASSIGNED:
        return { action: 'Mark as Picked Up', nextStatus: OrderStatus.PICKED_UP };
      case OrderStatus.PICKED_UP:
        return { action: 'Start Delivery', nextStatus: OrderStatus.IN_TRANSIT };
      case OrderStatus.IN_TRANSIT:
        return { action: 'Complete Delivery', nextStatus: OrderStatus.DELIVERED };
      default:
        return null;
    }
  };

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
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {statusFilter.label}
            <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
              filter === statusFilter.value
                ? 'bg-green-100 text-green-600'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {statusFilter.count}
            </span>
          </button>
        ))}
      </div>

      {/* Deliveries List */}
      {filteredDeliveries.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚗</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'ALL' ? 'No Deliveries Yet' : `No ${filter.toLowerCase().replace('_', ' ')} deliveries`}
          </h3>
          <p className="text-gray-500">
            {filter === 'ALL' 
              ? "You haven't accepted any deliveries yet. Check the available orders to get started!"
              : `No ${filter.toLowerCase().replace('_', ' ')} deliveries found.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDeliveries.map((delivery) => {
            const nextAction = getNextAction(delivery.status);
            
            return (
              <div key={delivery.id} className="relative">
                <OrderCard
                  order={delivery}
                  showActions={false}
                />
                
                {/* Delivery Actions */}
                {nextAction && (
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => {
                        if (nextAction.nextStatus === OrderStatus.DELIVERED) {
                          onCompleteDelivery(delivery.id);
                        } else {
                          onStatusUpdate(delivery.id, nextAction.nextStatus);
                        }
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
                    >
                      {nextAction.action}
                    </button>
                  </div>
                )}
                
                {/* Earnings Badge */}
                {delivery.status === OrderStatus.DELIVERED && delivery.orderValue > 0 && (
                  <div className="absolute top-4 left-4">
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      Earned: ₹{(delivery.orderValue * 0.2).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};