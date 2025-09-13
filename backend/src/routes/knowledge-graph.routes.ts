import express from 'express';
import { KnowledgeGraphController } from '../controllers/knowledge-graph.controller';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const relatedConceptsSchema = z.object({
  query: z.object({
    word: z.string().min(1, 'Word is required'),
    maxDepth: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
    includeFlashcards: z.string().optional().transform(val => val === 'true'),
  }),
});

const learningPathsSchema = z.object({
  query: z.object({
    startWord: z.string().min(1, 'Start word is required'),
    endWord: z.string().optional(),
    maxLength: z.string().optional().transform(val => val ? parseInt(val) : 5),
    minStrength: z.string().optional().transform(val => val ? parseFloat(val) : 0.5),
    includeDifficulty: z.string().optional().transform(val => val === 'true'),
  }),
});

const similarConceptsSchema = z.object({
  query: z.object({
    word: z.string().min(1, 'Word is required'),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
    minSimilarity: z.string().optional().transform(val => val ? parseFloat(val) : 0.5),
    includeContext: z.string().optional().transform(val => val === 'true'),
  }),
});

const enhanceRAGSchema = z.object({
  body: z.object({
    query: z.string().min(1, 'Query is required'),
  }),
});

const conceptInfoSchema = z.object({
  params: z.object({
    word: z.string().min(1, 'Word is required'),
  }),
});

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * GET /api/knowledge-graph/related-concepts
 * Find related concepts for a given word
 * Query params: word, maxDepth, limit, includeFlashcards
 */
router.get('/related-concepts', 
  validateRequest(relatedConceptsSchema),
  KnowledgeGraphController.getRelatedConcepts
);

/**
 * GET /api/knowledge-graph/learning-paths
 * Find learning paths between concepts
 * Query params: startWord, endWord, maxLength, minStrength, includeDifficulty
 */
router.get('/learning-paths',
  validateRequest(learningPathsSchema),
  KnowledgeGraphController.getLearningPaths
);

/**
 * GET /api/knowledge-graph/similar-concepts
 * Find similar concepts based on relationship patterns
 * Query params: word, limit, minSimilarity, includeContext
 */
router.get('/similar-concepts',
  validateRequest(similarConceptsSchema),
  KnowledgeGraphController.getSimilarConcepts
);

/**
 * POST /api/knowledge-graph/enhance-rag
 * Enhance RAG with knowledge graph context
 * Body: { query: string }
 */
router.post('/enhance-rag',
  validateRequest(enhanceRAGSchema),
  KnowledgeGraphController.enhanceRAG
);

/**
 * GET /api/knowledge-graph/concept/:word
 * Get comprehensive information about a concept
 * Params: word
 */
router.get('/concept/:word',
  validateRequest(conceptInfoSchema),
  KnowledgeGraphController.getConceptInfo
);

/**
 * GET /api/knowledge-graph/stats
 * Get knowledge graph statistics
 */
router.get('/stats',
  KnowledgeGraphController.getStats
);

export default router;
