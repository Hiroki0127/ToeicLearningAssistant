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

// Test endpoint without authentication
router.get('/test', async (req, res) => {
  try {
    res.json({ 
      success: true, 
      message: 'AI service is working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'AI service test failed',
      message: error.message 
    });
  }
});

// Temporarily disable authentication for AI endpoints in development
// TODO: Re-enable authentication in production
// router.use(authenticateToken);

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
