import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Protected routes (authentication required)
router.use(authenticateToken);

// Get dashboard statistics
router.get('/stats', getDashboardStats);

export default router;
