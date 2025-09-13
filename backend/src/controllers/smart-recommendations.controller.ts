import { Request, Response } from 'express';
import { SmartRecommendationsService } from '../services/smart-recommendations.service';
import { sendResponse } from '../utils/response';

export class SmartRecommendationsController {
  
  /**
   * GET /api/recommendations
   * Get personalized flashcard recommendations for the authenticated user
   */
  static async getRecommendations(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return sendResponse(res, 401, false, 'User not authenticated');
      }

      const { 
        limit = 10, 
        includeReasons = true, 
        difficulty = 'all' 
      } = req.query;

      const result = await SmartRecommendationsService.getRecommendations(userId, {
        limit: parseInt(limit as string) || 10,
        includeReasons: includeReasons === 'true',
        difficulty: difficulty as 'easy' | 'medium' | 'hard' | 'all',
      });

      sendResponse(res, 200, true, 'Recommendations generated successfully', result);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      sendResponse(res, 500, false, 'Internal server error');
    }
  }

  /**
   * GET /api/recommendations/daily
   * Get daily study recommendations
   */
  static async getDailyRecommendations(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return sendResponse(res, 401, false, 'User not authenticated');
      }

      const result = await SmartRecommendationsService.getRecommendations(userId, {
        limit: 5, // Smaller set for daily focus
        includeReasons: true,
        difficulty: 'all',
      });

      // Add daily focus message
      const dailyMessage = this.generateDailyMessage(result.userStats);
      
      sendResponse(res, 200, true, 'Daily recommendations generated', {
        ...result,
        dailyMessage,
        focus: 'daily_study',
      });
    } catch (error) {
      console.error('Error getting daily recommendations:', error);
      sendResponse(res, 500, false, 'Internal server error');
    }
  }

  /**
   * GET /api/recommendations/weak-areas
   * Get recommendations focused on weak areas
   */
  static async getWeakAreaRecommendations(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return sendResponse(res, 401, false, 'User not authenticated');
      }

      const result = await SmartRecommendationsService.getRecommendations(userId, {
        limit: 8,
        includeReasons: true,
        difficulty: 'all',
      });

      // Filter to focus on weak areas
      const weakAreaRecommendations = result.recommendations.filter(
        rec => rec.type === 'weak_area' || rec.type === 'spaced_repetition'
      );

      sendResponse(res, 200, true, 'Weak area recommendations generated', {
        ...result,
        recommendations: weakAreaRecommendations,
        focus: 'weak_areas',
      });
    } catch (error) {
      console.error('Error getting weak area recommendations:', error);
      sendResponse(res, 500, false, 'Internal server error');
    }
  }

  /**
   * GET /api/recommendations/related
   * Get recommendations based on knowledge graph relationships
   */
  static async getRelatedRecommendations(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return sendResponse(res, 401, false, 'User not authenticated');
      }

      const result = await SmartRecommendationsService.getRecommendations(userId, {
        limit: 8,
        includeReasons: true,
        difficulty: 'all',
      });

      // Filter to focus on knowledge graph recommendations
      const relatedRecommendations = result.recommendations.filter(
        rec => rec.type === 'knowledge_graph' || rec.type === 'related_concept'
      );

      sendResponse(res, 200, true, 'Related concept recommendations generated', {
        ...result,
        recommendations: relatedRecommendations,
        focus: 'related_concepts',
      });
    } catch (error) {
      console.error('Error getting related recommendations:', error);
      sendResponse(res, 500, false, 'Internal server error');
    }
  }

  /**
   * Generate daily motivational message
   */
  private static generateDailyMessage(userStats: any): string {
    const { studiedToday, currentStreak, weakAreas } = userStats;
    
    if (studiedToday === 0) {
      if (currentStreak === 0) {
        return "Start your learning journey today! Every expert was once a beginner.";
      } else {
        return `Don't break your ${currentStreak}-day streak! Let's keep the momentum going.`;
      }
    }
    
    if (weakAreas > 0) {
      return `Great job studying today! Focus on those ${weakAreas} weak areas to level up.`;
    }
    
    if (currentStreak >= 7) {
      return `Amazing ${currentStreak}-day streak! You're building a powerful learning habit.`;
    }
    
    return "Keep up the excellent work! Consistency is key to mastering TOEIC vocabulary.";
  }
}
