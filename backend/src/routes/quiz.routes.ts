import { Router } from 'express';
import {
  getQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
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

// Parameterized routes
router.put('/:id', validateBody(quizValidationSchemas.createQuiz), updateQuiz);
router.delete('/:id', deleteQuiz);
router.get('/:id', getQuizById);

export default router;
