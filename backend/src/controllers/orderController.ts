import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CreateOrderInput, UpdateOrderInput, ApiResponse, Order, OrderStatus } from '../types';
import { AuthRequest } from '../middlewares/auth';

const prisma = new PrismaClient();

// Create a new order
export const createOrder = async (req: AuthRequest, res: Response<ApiResponse<Order>>) => {
  try {
    const vendorId = req.user?.id;
    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { 
      pickupAddress, 
      deliveryAddress, 
      customerName, 
      customerPhone, 
      itemDescription, 
      orderValue 
    }: CreateOrderInput = req.body;

    // Validate required fields
    if (!pickupAddress || !deliveryAddress || !customerName || !customerPhone || !itemDescription) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Calculate distance (mock implementation - will integrate Google Maps later)
    const calculatedDistance = Math.random() * 20 + 1; // Random distance between 1-20 km

    // Create order
    const order = await prisma.order.create({
      data: {
        pickupAddress,
        deliveryAddress,
        customerName,
        customerPhone,
        itemDescription,
        orderValue: orderValue || 0,
        calculatedDistance,
        vendorId,
        status: OrderStatus.PENDING
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        dropper: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order as Order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get vendor's orders
export const getVendorOrders = async (req: AuthRequest, res: Response<ApiResponse<Order[]>>) => {
  try {
    const vendorId = req.user?.id;
    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const orders = await prisma.order.findMany({
      where: {
        vendorId
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        dropper: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      message: 'Orders retrieved successfully',
      data: orders as Order[]
    });
  } catch (error) {
    console.error('Get vendor orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get order by ID
export const getOrderById = async (req: AuthRequest, res: Response<ApiResponse<Order>>) => {
  try {
    const { id } = req.params; 

    const order = await prisma.order.findFirst({
      where: {
        id 
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        dropper: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order retrieved successfully',
      data: order as Order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update order status
export const updateOrderStatus = async (req: AuthRequest, res: Response<ApiResponse<Order>>) => {
  try {
    const { id } = req.params;
    const { status }: UpdateOrderInput = req.body;
    const vendorId = req.user?.id;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        id,
        vendorId
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        dropper: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder as Order
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Cancel order
export const cancelOrder = async (req: AuthRequest, res: Response<ApiResponse<Order>>) => {
  try {
    const { id } = req.params;
    const vendorId = req.user?.id;

    const order = await prisma.order.findFirst({
      where: {
        id,
        vendorId
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Only pending orders can be cancelled'
      });
    }

    const cancelledOrder = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        dropper: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: cancelledOrder as Order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get vendor dashboard stats
export const getVendorStats = async (req: AuthRequest, res: Response) => {
  try {
    const vendorId = req.user?.id;
    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const totalOrders = await prisma.order.count({
      where: { vendorId }
    });

    const pendingOrders = await prisma.order.count({
      where: { 
        vendorId,
        status: 'PENDING'
      }
    });

    const deliveredOrders = await prisma.order.count({
      where: { 
        vendorId,
        status: 'DELIVERED'
      }
    });

    const totalRevenue = await prisma.order.aggregate({
      where: { 
        vendorId,
        status: 'DELIVERED'
      },
      _sum: {
        orderValue: true
      }
    });

    res.json({
      success: true,
      message: 'Stats retrieved successfully',
      data: {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalRevenue: totalRevenue._sum.orderValue || 0
      }
    });
  } catch (error) {
    console.error('Get vendor stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};