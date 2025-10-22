import { Router } from 'express';
import { deleteTestQuizzes } from '../controllers/quiz.controller';

const router = Router();

// Temporary admin route to delete test quizzes (no auth required for cleanup)
router.delete('/quiz/admin/delete-test-quizzes', deleteTestQuizzes);

export default router;
