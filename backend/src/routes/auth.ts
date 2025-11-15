import { Router } from 'express';
import { register, login, getProfile } from '../controllers/userController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

export default router;