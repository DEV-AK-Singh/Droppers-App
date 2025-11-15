import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Vite default port
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({
    message: 'Droppers API is running!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Socket.io connection handling with types
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // Handle vendor joining their room
  socket.on('join:vendor', (vendorId: string) => {
    socket.join(`vendor:${vendorId}`);
    console.log(`Vendor ${vendorId} joined room: vendor:${vendorId}`);
  });

  // Handle delivery partner joining their room
  socket.on('join:dropper', (dropperId: string) => {
    socket.join(`dropper:${dropperId}`);
    console.log(`Dropper ${dropperId} joined room: dropper:${dropperId}`);
  });

  // Handle order acceptance
  socket.on('order:accept', async (orderId: string, callback: (success: boolean) => void) => {
    try {
      console.log(`Order ${orderId} acceptance attempted by ${socket.id}`);

      // TODO: Implement order acceptance logic
      // This will be implemented in Phase 4

      // For now, simulate success
      callback(true);

      // Notify all delivery partners that order was accepted
      socket.broadcast.emit('order:accepted', {
        orderId,
        acceptedBy: socket.id
      } as any); // Temporary any until we implement proper order types

    } catch (error) {
      console.error('Order acceptance error:', error);
      callback(false);
    }
  });

  socket.on('disconnect', (reason: string) => {
    console.log('❌ User disconnected:', socket.id, 'Reason:', reason);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});