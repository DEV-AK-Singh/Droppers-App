import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponse, Order, OrderStatus } from '../types';
import { AuthRequest } from '../middlewares/auth';

const prisma = new PrismaClient();

// Get available orders (PENDING orders not accepted by any dropper)
export const getAvailableOrders = async (req: AuthRequest, res: Response<ApiResponse<Order[]>>) => {
  try {
    const availableOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        dropperId: null
      },
      include: {
        vendor: {
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
      message: 'Available orders retrieved successfully',
      data: availableOrders as Order[]
    });
  } catch (error) {
    console.error('Get available orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Accept an order
export const acceptOrder = async (req: AuthRequest, res: Response<ApiResponse<Order>>) => {
  try {
    const dropperId = req.user?.id;
    const { orderId } = req.params;

    if (!dropperId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if order exists and is available
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        status: 'PENDING',
        dropperId: null
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not available or already accepted'
      });
    }

    // Accept the order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        dropperId,
        status: 'ASSIGNED'
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

    res.json({
      success: true,
      message: 'Order accepted successfully',
      data: updatedOrder as Order
    });
  } catch (error) {
    console.error('Accept order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get delivery partner's accepted orders
export const getMyDeliveries = async (req: AuthRequest, res: Response<ApiResponse<Order[]>>) => {
  try {
    const dropperId = req.user?.id;

    if (!dropperId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const deliveries = await prisma.order.findMany({
      where: {
        dropperId
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
        updatedAt: 'desc'
      }
    });

    res.json({
      success: true,
      message: 'Deliveries retrieved successfully',
      data: deliveries as Order[]
    });
  } catch (error) {
    console.error('Get deliveries error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update delivery status
export const updateDeliveryStatus = async (req: AuthRequest, res: Response<ApiResponse<Order>>) => {
  try {
    const dropperId = req.user?.id;
    const { orderId } = req.params;
    const { status }: { status: OrderStatus } = req.body;

    if (!dropperId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    // Check if order belongs to this delivery partner
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        dropperId
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or you are not assigned to this delivery'
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
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
      message: 'Delivery status updated successfully',
      data: updatedOrder as Order
    });
  } catch (error) {
    console.error('Update delivery status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get delivery partner stats
export const getDeliveryStats = async (req: AuthRequest, res: Response) => {
  try {
    const dropperId = req.user?.id;

    if (!dropperId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const totalDeliveries = await prisma.order.count({
      where: { dropperId }
    });

    const completedDeliveries = await prisma.order.count({
      where: { 
        dropperId,
        status: 'DELIVERED'
      }
    });

    const activeDeliveries = await prisma.order.count({
      where: { 
        dropperId,
        status: {
          in: ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT']
        }
      }
    });

    const totalEarnings = await prisma.order.aggregate({
      where: { 
        dropperId,
        status: 'DELIVERED'
      },
      _sum: {
        orderValue: true
      }
    });

    // Calculate earnings (assuming 20% commission for delivery)
    const earnings = (totalEarnings._sum.orderValue || 0) * 0.2;

    res.json({
      success: true,
      message: 'Delivery stats retrieved successfully',
      data: {
        totalDeliveries,
        completedDeliveries,
        activeDeliveries,
        totalEarnings: earnings,
        pendingEarnings: 0 // Could be calculated based on in-progress deliveries
      }
    });
  } catch (error) {
    console.error('Get delivery stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Complete delivery (mark as delivered)
export const completeDelivery = async (req: AuthRequest, res: Response<ApiResponse<Order>>) => {
  try {
    const dropperId = req.user?.id;
    const { orderId } = req.params;

    if (!dropperId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if order belongs to this delivery partner and is in transit
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        dropperId,
        status: 'IN_TRANSIT'
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not ready for delivery completion'
      });
    }

    const completedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'DELIVERED' },
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
      message: 'Delivery completed successfully',
      data: completedOrder as Order
    });
  } catch (error) {
    console.error('Complete delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};