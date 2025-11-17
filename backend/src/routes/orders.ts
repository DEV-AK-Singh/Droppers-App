import { Router } from 'express';
import { 
  createOrder, 
  getVendorOrders, 
  getOrderById, 
  updateOrderStatus, 
  cancelOrder,
  getVendorStats 
} from '../controllers/orderController'; 
import { 
  getAvailableOrders, 
  acceptOrder, 
  getMyDeliveries, 
  updateDeliveryStatus, 
  getDeliveryStats,
  completeDelivery 
} from '../controllers/deliveryController';
import { authenticateToken, requireRole } from '../middlewares/auth';
import { validateOrderCreation } from '../middlewares/validation';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Vendor-specific routes
router.get('/vendor/stats', requireRole([UserRole.VENDOR]), getVendorStats);
router.get('/vendor/my-orders', requireRole([UserRole.VENDOR]), getVendorOrders);
router.post('/vendor/create', requireRole([UserRole.VENDOR]), validateOrderCreation, createOrder);
router.patch('/vendor/:id/status', requireRole([UserRole.VENDOR]), updateOrderStatus);
router.delete('/vendor/:id/cancel', requireRole([UserRole.VENDOR]), cancelOrder);

// Delivery partner-specific routes
router.get('/delivery/available', requireRole([UserRole.DELIVERY_PARTNER]), getAvailableOrders);
router.get('/delivery/my-deliveries', requireRole([UserRole.DELIVERY_PARTNER]), getMyDeliveries);
router.get('/delivery/stats', requireRole([UserRole.DELIVERY_PARTNER]), getDeliveryStats);
router.post('/delivery/:orderId/accept', requireRole([UserRole.DELIVERY_PARTNER]), acceptOrder);
router.patch('/delivery/:orderId/status', requireRole([UserRole.DELIVERY_PARTNER]), updateDeliveryStatus);
router.post('/delivery/:orderId/complete', requireRole([UserRole.DELIVERY_PARTNER]), completeDelivery);

// General order routes (accessible by vendors for their orders)
router.get('/:id', getOrderById);

export default router;