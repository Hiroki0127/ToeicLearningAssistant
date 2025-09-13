import express from 'express';
import { SmartRecommendationsController } from '../controllers/smart-recommendations.controller';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * GET /api/recommendations
 * Get personalized flashcard recommendations for the authenticated user
 * Query params: limit, includeReasons, difficulty
 */
router.get('/', SmartRecommendationsController.getRecommendations);

/**
 * GET /api/recommendations/daily
 * Get daily study recommendations (focused set for daily study)
 */
router.get('/daily', SmartRecommendationsController.getDailyRecommendations);

/**
 * GET /api/recommendations/weak-areas
 * Get recommendations focused on weak areas and spaced repetition
 */
router.get('/weak-areas', SmartRecommendationsController.getWeakAreaRecommendations);

/**
 * GET /api/recommendations/related
 * Get recommendations based on knowledge graph relationships
 */
router.get('/related', SmartRecommendationsController.getRelatedRecommendations);

export default router;
