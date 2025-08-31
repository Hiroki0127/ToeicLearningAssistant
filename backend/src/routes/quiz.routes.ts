import { Router } from 'express';
import {
  getQuizzes,
  getQuizById,
  submitQuizResult,
  getQuizHistory,
  getQuizStats,
} from '../controllers/quiz.controller';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { quizValidationSchemas } from '../utils/validation';

const router = Router();

// Public routes (no authentication required)
router.get('/', getQuizzes);
router.get('/:id', getQuizById);

// Protected routes (authentication required)
router.use(authenticateToken);

router.post('/submit', validateRequest(quizValidationSchemas.submitQuizResult), submitQuizResult);
router.get('/history', getQuizHistory);
router.get('/stats', getQuizStats);

export default router;
