import { Router } from 'express';
import { register, login, getProfile, updateProfile, changePassword } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { registerSchema, loginSchema } from '../utils/validation';

const router = Router();

// Public routes
router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);

export default router;
