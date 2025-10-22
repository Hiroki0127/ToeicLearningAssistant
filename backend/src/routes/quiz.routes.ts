import { Router } from 'express';
import {
  getQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  deleteTestQuizzes,
  getQuizById,
  submitQuizResult,
  getQuizHistory,
  getQuizStats,
} from '../controllers/quiz.controller';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { quizValidationSchemas } from '../utils/validation';

const router = Router();

// Public routes (optional authentication for user-specific data)
router.get('/', optionalAuth, getQuizzes);

// Admin route to delete test quizzes (no auth required for cleanup)
router.get('/admin/cleanup-test-quizzes', deleteTestQuizzes);

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
