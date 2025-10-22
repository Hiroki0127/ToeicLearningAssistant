import { Router } from 'express';
import {
  getQuizzes,
  createQuiz,
  getQuizById,
  submitQuizResult,
  getQuizHistory,
  getQuizStats,
} from '../controllers/quiz.controller';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { quizValidationSchemas } from '../utils/validation';

const router = Router();

// Public routes (no authentication required)
router.get('/', getQuizzes);

// Protected routes (authentication required)
router.use(authenticateToken);

// Specific routes must come before parameterized routes
router.post('/', validateBody(quizValidationSchemas.createQuiz), createQuiz);
router.post('/submit', validateBody(quizValidationSchemas.submitQuizResult), submitQuizResult);
router.get('/history', getQuizHistory);
router.get('/stats', getQuizStats);

// This must be last to avoid catching other routes
router.get('/:id', getQuizById);

export default router;
