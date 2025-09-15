import { Router } from 'express';
import {
  getQuizzes,
  getQuizById,
  submitQuizResult,
  getQuizHistory,
  getQuizStats,
} from '../controllers/quiz.controller';
import { authenticateToken } from '../middleware/auth';
import { validateRequest, validateBody } from '../middleware/validation';
import { quizValidationSchemas } from '../utils/validation';

const router = Router();

// Public routes (no authentication required)
router.get('/', getQuizzes);

// Protected routes (authentication required)
router.use(authenticateToken);

router.post('/submit', validateBody(quizValidationSchemas.submitQuizResult), submitQuizResult);
router.get('/history', getQuizHistory);
router.get('/stats', getQuizStats);

// This must be last to avoid catching /history and /stats
router.get('/:id', getQuizById);

export default router;
