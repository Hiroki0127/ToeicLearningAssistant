import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  createNotification,
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../controllers/notification.controller';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { createNotificationSchema } from '../utils/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Notification CRUD operations
router.get('/', getNotifications);
router.get('/preferences', getNotificationPreferences);
router.put('/preferences', validateBody(createNotificationSchema), updateNotificationPreferences);
router.post('/', validateBody(createNotificationSchema), createNotification);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

export default router;
