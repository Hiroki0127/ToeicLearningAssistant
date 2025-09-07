import { Router } from 'express';
import {
  generateQuestion,
  explainGrammar,
  explainVocabulary,
} from '../controllers/ai.controller';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Validation schemas
const generateQuestionSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

const explainGrammarSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  userAnswer: z.string().min(1, 'User answer is required'),
});

const explainVocabularySchema = z.object({
  word: z.string().min(1, 'Word is required'),
});

// AI endpoints
router.post('/generate-question', validateBody(generateQuestionSchema), generateQuestion);
router.post('/explain-grammar', validateBody(explainGrammarSchema), explainGrammar);
router.post('/explain-vocabulary', validateBody(explainVocabularySchema), explainVocabulary);

export default router;
