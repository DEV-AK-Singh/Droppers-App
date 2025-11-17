import React, { useState } from 'react';
import type { CreateOrderData } from '../../types/auth';

interface CreateOrderFormProps {
  onSubmit: (data: CreateOrderData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const CreateOrderForm: React.FC<CreateOrderFormProps> = ({
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<CreateOrderData>({
    pickupAddress: '',
    deliveryAddress: '',
    customerName: '',
    customerPhone: '',
    itemDescription: '',
    orderValue: 0
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'orderValue' ? parseFloat(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.pickupAddress.trim()) {
      newErrors.pickupAddress = 'Pickup address is required';
    } else if (formData.pickupAddress.trim().length < 10) {
      newErrors.pickupAddress = 'Pickup address must be at least 10 characters';
    }

    if (!formData.deliveryAddress.trim()) {
      newErrors.deliveryAddress = 'Delivery address is required';
    } else if (formData.deliveryAddress.trim().length < 10) {
      newErrors.deliveryAddress = 'Delivery address must be at least 10 characters';
    }

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    } else if (formData.customerName.trim().length < 2) {
      newErrors.customerName = 'Customer name must be at least 2 characters';
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Customer phone is required';
    } else if (!formData.customerPhone.match(/^\+?[\d\s-()]{10,}$/)) {
      newErrors.customerPhone = 'Please enter a valid phone number';
    }

    if (!formData.itemDescription.trim()) {
      newErrors.itemDescription = 'Item description is required';
    } else if (formData.itemDescription.trim().length < 5) {
      newErrors.itemDescription = 'Item description must be at least 5 characters';
    }

    if (formData.orderValue < 0) {
      newErrors.orderValue = 'Order value cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      // Form will be closed by parent component on success
    } catch (error) {
      // Error handling is done in parent component
      console.error('Order creation error:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-linear-to-r from-blue-600 to-blue-700 px-6 py-4 text-white rounded-t-2xl">
          <h2 className="text-xl font-bold">Create New Delivery Order</h2>
          <p className="text-blue-100 text-sm">Enter the delivery details for your customer</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Pickup Address */}
          <div>
            <label htmlFor="pickupAddress" className="block text-sm font-medium text-gray-700 mb-2">
              Pickup Address *
            </label>
            <textarea
              id="pickupAddress"
              name="pickupAddress"
              value={formData.pickupAddress}
              onChange={handleChange}
              rows={3}
              className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.pickupAddress ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter the complete pickup address including landmark..."
            />
            {errors.pickupAddress && (
              <p className="mt-1 text-sm text-red-600">{errors.pickupAddress}</p>
            )}
          </div>

          {/* Delivery Address */}
          <div>
            <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Address *
            </label>
            <textarea
              id="deliveryAddress"
              name="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={handleChange}
              rows={3}
              className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.deliveryAddress ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter the complete delivery address including landmark..."
            />
            {errors.deliveryAddress && (
              <p className="mt-1 text-sm text-red-600">{errors.deliveryAddress}</p>
            )}
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.customerName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter customer full name"
              />
              {errors.customerName && (
                <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
              )}
            </div>

            <div>
              <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-2">
                Customer Phone *
              </label>
              <input
                type="tel"
                id="customerPhone"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.customerPhone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter customer phone number"
              />
              {errors.customerPhone && (
                <p className="mt-1 text-sm text-red-600">{errors.customerPhone}</p>
              )}
            </div>
          </div>

          {/* Item Description */}
          <div>
            <label htmlFor="itemDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Item Description *
            </label>
            <textarea
              id="itemDescription"
              name="itemDescription"
              value={formData.itemDescription}
              onChange={handleChange}
              rows={3}
              className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.itemDescription ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Describe the items to be delivered (e.g., '1 cake box, 2 gift packages')"
            />
            {errors.itemDescription && (
              <p className="mt-1 text-sm text-red-600">{errors.itemDescription}</p>
            )}
          </div>

          {/* Order Value */}
          <div>
            <label htmlFor="orderValue" className="block text-sm font-medium text-gray-700 mb-2">
              Order Value (₹)
            </label>
            <input
              type="number"
              id="orderValue"
              name="orderValue"
              value={formData.orderValue}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.orderValue ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter order value in rupees"
            />
            {errors.orderValue && (
              <p className="mt-1 text-sm text-red-600">{errors.orderValue}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Optional: Enter the total value of the order for tracking purposes
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </div>
              ) : (
                'Create Order'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};