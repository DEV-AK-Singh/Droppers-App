import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { OrderStatus, PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import { ServerToClientEvents, ClientToServerEvents, Order } from './types/index.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT;
const prisma = new PrismaClient();

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL_PROD
    : process.env.FRONTEND_URL_DEV,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Create HTTP server for Socket.io
const httpServer = createServer(app);

// Socket.io configuration with typed events
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: corsOptions
});

// Make io available in controllers
app.set('io', io);

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`, {
      body: req.body,
      query: req.query,
      params: req.params,
    });
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// Basic health check route
app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    message: 'Droppers API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// 404 handler
app.use('/', (req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🚨 Unhandled error:', error);

  const errorMessage = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : error.message;

  res.status(error.status || 500).json({
    success: false,
    message: errorMessage,
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // Handle vendor joining their room
  socket.on('join:vendor', (vendorId: string) => {
    socket.join(`vendor:${vendorId}`);
    console.log(`Vendor ${vendorId} joined -> Room: vendor:${vendorId}`);
  });

  // Handle delivery partner joining their room
  socket.on('join:dropper', (dropperId: string) => {
    socket.join(`dropper:${dropperId}`);
    console.log(`Dropper ${dropperId} joined -> Room: dropper:${dropperId}`);
  });

  // Handle delivery partner joining available orders room
  socket.on('join:available-orders', () => {
    socket.join('available-orders');
    console.log(`Dropper ${socket.id} joined -> Room: available-orders`);
  });

  // Handle order creation from vendor
  socket.on('order:created', (order: Order) => {
    console.log(`New order created: ${order.id}`);
    // Notify all delivery partners about new available order
    socket.to('available-orders').emit('order:created', order);
  });

  // Handle order cancellation from vendor
  socket.on('order:cancelled', (data: { orderId: string; vendorId: string }) => {
    console.log(`Order cancelled: ${data.orderId}`);
    // Notify delivery partners to remove from available orders
    socket.to('available-orders').emit('order:cancelled', { orderId: data.orderId });
  });

  // Handle order acceptance
  socket.on('order:accept', async (orderId: string, dropperId: string, callback: (success: boolean, message?: string) => void) => {
    try {
      console.log(`Order ${orderId} acceptance attempted by ${socket.id}`);

      // Get complete order details
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          vendor: {
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
        callback(false, 'Order not found');
        return;
      }

      if (order.status !== 'PENDING' || order.dropperId) {
        callback(false, 'Order already accepted');
        return;
      }

      // Get delivery partner details (using socket.id as temporary user ID)
      const dropper = await prisma.user.findUnique({
        where: { id: dropperId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      });

      if (!dropper) {
        callback(false, 'Delivery partner not found');
        return;
      }

      // Update order in database
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          dropperId: dropper.id,
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

      console.log('🔄 Emitting socket events for order acceptance...');

      // Notify all delivery partners that order was accepted (remove from their available orders)
      socket.to('available-orders').emit('order:accepted', {
        orderId,
        timestamp: new Date().toISOString()
      });
      console.log(`📢 Notified available-orders about order ${orderId} acceptance`);

      // Notify vendor about order acceptance with complete order data
      socket.to(`vendor:${order.vendorId}`).emit('delivery:status-changed', {
        order: updatedOrder as Order,
        timestamp: new Date().toISOString()
      });
      console.log(`📢 Notified vendor ${order.vendorId} about order ${orderId} acceptance`);

      console.log(`✅ Order ${orderId} accepted by ${socket.id}`);

      callback(true, 'Order accepted successfully');
    } catch (error) {
      console.error('Order acceptance error:', error);
      callback(false, 'Failed to accept order');
    }
  });

  // Handle delivery status updates
  socket.on('delivery:status-update', async (data: { orderId: string; status: string }) => {
    try {
      const { orderId, status } = data;
      console.log(`Delivery status update: Order ${orderId} -> ${status}`);

      // Get order details from database
      const order = await prisma.order.findUnique({
        where: { id: orderId },
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
        console.error('Order not found for status update:', orderId);
        return;
      }

      // Update order status in database
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: status as OrderStatus },
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

      // Notify vendor about status change with complete order data
      socket.to(`vendor:${order.vendorId}`).emit('delivery:status-changed', {
        order: updatedOrder as Order,
        timestamp: new Date().toISOString()
      });

      console.log(`✅ Order ${orderId} status updated to ${status}`);
    } catch (error) {
      console.error('Error handling delivery status update:', error);
    }
  });

  // Handle delivery completion
  socket.on('delivery:completed', async (data: { orderId: string }) => {
    try {
      const { orderId } = data;
      console.log(`Delivery completed: ${orderId}`);

      // Get order details from database
      const order = await prisma.order.findUnique({
        where: { id: orderId },
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
        console.error('Order not found for completion:', orderId);
        return;
      }

      // Update order as delivered in database
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

      // Notify vendor about delivery completion with complete order data
      socket.to(`vendor:${order.vendorId}`).emit('delivery:completed', {
        order: completedOrder as Order,
        timestamp: new Date().toISOString()
      });

      console.log(`✅ Order ${orderId} marked as delivered`);
    } catch (error) {
      console.error('Error handling delivery completion:', error);
    }
  });

  socket.on('disconnect', (reason: string) => {
    console.log('❌ User disconnected:', socket.id, 'Reason:', reason);
  });
});

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  console.log(`\n📢 Received ${signal}. Starting graceful shutdown...`);

  httpServer.close((err) => {
    if (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }

    console.log('✅ HTTP server closed.');
    process.exit(0);
  });
};

// Handle different shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`
🚀 Droppers Server Started!
📊 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV}
🔗 Frontend URL: ${process.env.NODE_ENV === 'production' ? process.env.BACKEND_URL_PROD : process.env.BACKEND_URL_DEV}
📡 Health Check: ${process.env.NODE_ENV === 'production' ? `${process.env.BACKEND_URL_PROD}/api/health` : `${process.env.BACKEND_URL_PROD}/api/health`}
🔐 API Base: ${process.env.NODE_ENV === 'production' ? `${process.env.BACKEND_URL_PROD}/api` : `${process.env.BACKEND_URL_PROD}/api`}
🔌 Socket.io: Ready for connections
  `);
}); 