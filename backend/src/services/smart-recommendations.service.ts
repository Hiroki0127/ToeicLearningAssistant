import { PrismaClient } from '@prisma/client';
import { KnowledgeGraphIntegrated } from './knowledge-graph-integrated.service';

const prisma = new PrismaClient();

export class SmartRecommendationsService {
  
  /**
   * Get personalized flashcard recommendations for a user
   */
  static async getRecommendations(userId: string, options: {
    limit?: number;
    includeReasons?: boolean;
    difficulty?: 'easy' | 'medium' | 'hard' | 'all';
  } = {}) {
    const { limit = 10, includeReasons = true, difficulty = 'all' } = options;
    
    console.log(`🎯 Getting smart recommendations for user: ${userId}`);
    
    try {
      // Get user's study history
      const userProgress = await this.getUserStudyHistory(userId);
      
      // Get user's flashcards
      const userFlashcards = await prisma.flashcard.findMany({
        where: { userId },
      });
      
      if (userFlashcards.length === 0) {
        return {
          recommendations: [],
          reasons: ['No flashcards found. Create some flashcards to get recommendations!'],
          totalFound: 0,
        };
      }
      
      // Generate different types of recommendations
      const [
        weakAreaRecommendations,
        relatedRecommendations,
        spacedRepetitionRecommendations,
        knowledgeGraphRecommendations,
      ] = await Promise.all([
        this.getWeakAreaRecommendations(userFlashcards, userProgress, limit),
        this.getRelatedRecommendations(userFlashcards, userProgress, limit),
        this.getSpacedRepetitionRecommendations(userFlashcards, userProgress, limit),
        this.getKnowledgeGraphRecommendations(userFlashcards, userProgress, limit),
      ]);
      
      // Combine and rank all recommendations
      const allRecommendations = [
        ...weakAreaRecommendations,
        ...relatedRecommendations,
        ...spacedRepetitionRecommendations,
        ...knowledgeGraphRecommendations,
      ];
      
      // Remove duplicates and rank by score
      const uniqueRecommendations = this.deduplicateAndRank(allRecommendations, limit);
      
      // Generate reasons for recommendations
      const reasons = includeReasons ? this.generateRecommendationReasons(uniqueRecommendations, userProgress) : [];
      
      console.log(`✅ Generated ${uniqueRecommendations.length} recommendations`);
      
      return {
        recommendations: uniqueRecommendations,
        reasons: reasons,
        totalFound: uniqueRecommendations.length,
        userStats: {
          totalFlashcards: userFlashcards.length,
          studiedToday: userProgress.studiedToday,
          currentStreak: userProgress.currentStreak,
          weakAreas: userProgress.weakAreas,
        },
      };
      
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return {
        recommendations: [],
        reasons: ['Unable to generate recommendations at this time.'],
        totalFound: 0,
      };
    }
  }
  
  /**
   * Get recommendations based on weak areas (low accuracy)
   */
  private static async getWeakAreaRecommendations(
    userFlashcards: any[],
    userProgress: any,
    limit: number
  ): Promise<any[]> {
    const recommendations: any[] = [];
    
    // Find flashcards with low accuracy
    for (const flashcard of userFlashcards) {
      const reviews = await prisma.flashcardReview.findMany({
        where: {
          flashcardId: flashcard.id,
        },
        orderBy: { reviewedAt: 'desc' },
        take: 5,
      });
      
      if (reviews.length > 0) {
        const accuracy = reviews.filter(r => r.isCorrect).length / reviews.length;
        
        if (accuracy < 0.6) { // Less than 60% accuracy
          recommendations.push({
            flashcard: flashcard,
            type: 'weak_area',
            score: (0.6 - accuracy) * 100, // Higher score for lower accuracy
            reason: `Low accuracy (${(accuracy * 100).toFixed(0)}%) - needs more practice`,
            priority: 'high',
          });
        }
      }
    }
    
    return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
  }
  
  /**
   * Get recommendations based on related concepts
   */
  private static async getRelatedRecommendations(
    userFlashcards: any[],
    userProgress: any,
    limit: number
  ): Promise<any[]> {
    const recommendations: any[] = [];
    
    // Find flashcards that haven't been studied recently
    const recentThreshold = new Date();
    recentThreshold.setDate(recentThreshold.getDate() - 3); // 3 days ago
    
    for (const flashcard of userFlashcards) {
      const lastReview = await prisma.flashcardReview.findFirst({
        where: { flashcardId: flashcard.id },
        orderBy: { reviewedAt: 'desc' },
      });
      
      if (!lastReview || lastReview.reviewedAt < recentThreshold) {
        recommendations.push({
          flashcard: flashcard,
          type: 'related_concept',
          score: 70, // Medium priority
          reason: 'Related to concepts you\'ve been studying',
          priority: 'medium',
        });
      }
    }
    
    return recommendations.slice(0, limit);
  }
  
  /**
   * Get recommendations based on spaced repetition
   */
  private static async getSpacedRepetitionRecommendations(
    userFlashcards: any[],
    userProgress: any,
    limit: number
  ): Promise<any[]> {
    const recommendations: any[] = [];
    
    for (const flashcard of userFlashcards) {
      const reviews = await prisma.flashcardReview.findMany({
        where: { flashcardId: flashcard.id },
        orderBy: { reviewedAt: 'desc' },
      });
      
      if (reviews.length > 0) {
        const lastReview = reviews[0];
        const daysSinceReview = Math.floor(
          (Date.now() - lastReview.reviewedAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        // Simple spaced repetition: review again after 1, 3, 7, 14 days
        const intervals = [1, 3, 7, 14];
        const reviewCount = reviews.length;
        const expectedInterval = intervals[Math.min(reviewCount - 1, intervals.length - 1)];
        
        if (daysSinceReview >= expectedInterval) {
          recommendations.push({
            flashcard: flashcard,
            type: 'spaced_repetition',
            score: 80 + (daysSinceReview - expectedInterval) * 5, // Higher score for overdue
            reason: `Due for review (${daysSinceReview} days since last study)`,
            priority: 'high',
          });
        }
      }
    }
    
    return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
  }
  
  /**
   * Get recommendations based on knowledge graph
   */
  private static async getKnowledgeGraphRecommendations(
    userFlashcards: any[],
    userProgress: any,
    limit: number
  ): Promise<any[]> {
    const recommendations: any[] = [];
    
    // Get recently studied flashcards
    const recentReviews = await prisma.flashcardReview.findMany({
      where: {
        reviewedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      include: { flashcard: true },
      orderBy: { reviewedAt: 'desc' },
      take: 10,
    });
    
    const recentWords = recentReviews.map(r => r.flashcard.word);
    
    // Find related concepts using knowledge graph
    for (const word of recentWords) {
      try {
        const relatedData = await KnowledgeGraphIntegrated.findRelatedConcepts(word, {
          maxDepth: 1,
          limit: 3,
          includeFlashcards: true,
        });
        
        for (const relatedFlashcard of relatedData.flashcards) {
          // Check if user has this flashcard
          const userHasFlashcard = userFlashcards.some(f => f.id === relatedFlashcard.id);
          
          if (userHasFlashcard) {
            recommendations.push({
              flashcard: relatedFlashcard,
              type: 'knowledge_graph',
              score: 75, // Medium-high priority
              reason: `Related to "${word}" - builds on recent learning`,
              priority: 'medium',
            });
          }
        }
      } catch (error) {
        console.log(`Error getting knowledge graph recommendations for ${word}:`, error);
      }
    }
    
    return recommendations.slice(0, limit);
  }
  
  /**
   * Get user's study history and progress
   */
  private static async getUserStudyHistory(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [studiedToday, currentStreak, weakAreas] = await Promise.all([
      // Cards studied today
      prisma.flashcardReview.count({
        where: {
          userId,
          reviewedAt: { gte: today },
        },
      }),
      
      // Current streak (simplified)
      prisma.dailyProgress.findFirst({
        where: { userId },
        orderBy: { date: 'desc' },
      }),
      
      // Weak areas (flashcards with low accuracy) - simplified for SQLite
      prisma.flashcardReview.findMany({
        where: {
          userId,
          reviewedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
        },
        select: {
          flashcardId: true,
          isCorrect: true,
        },
      }),
    ]);
    
    // Calculate weak areas manually
    const weakAreaMap = new Map<string, { correct: number; total: number }>();
    weakAreas.forEach(review => {
      const existing = weakAreaMap.get(review.flashcardId) || { correct: 0, total: 0 };
      existing.total++;
      if (review.isCorrect) existing.correct++;
      weakAreaMap.set(review.flashcardId, existing);
    });
    
    const weakAreasCount = Array.from(weakAreaMap.values()).filter(
      stats => stats.total >= 3 && stats.correct / stats.total < 0.6
    ).length;

    return {
      studiedToday,
      currentStreak: currentStreak?.streak || 0,
      weakAreas: weakAreasCount,
    };
  }
  
  /**
   * Remove duplicates and rank recommendations
   */
  private static deduplicateAndRank(recommendations: any[], limit: number): any[] {
    const seen = new Set<string>();
    const unique = [];
    
    for (const rec of recommendations) {
      if (!seen.has(rec.flashcard.id)) {
        seen.add(rec.flashcard.id);
        unique.push(rec);
      }
    }
    
    // Sort by score and priority
    return unique
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.score - a.score;
      })
      .slice(0, limit);
  }
  
  /**
   * Generate human-readable reasons for recommendations
   */
  private static generateRecommendationReasons(recommendations: any[], userProgress: any): string[] {
    const reasons = [];
    
    if (userProgress.studiedToday === 0) {
      reasons.push('Start your daily study session!');
    }
    
    if (userProgress.weakAreas > 0) {
      reasons.push(`Focus on ${userProgress.weakAreas} weak areas to improve accuracy`);
    }
    
    if (userProgress.currentStreak > 0) {
      reasons.push(`Keep your ${userProgress.currentStreak}-day streak going!`);
    }
    
    const types = recommendations.map(r => r.type);
    if (types.includes('weak_area')) {
      reasons.push('Review flashcards with low accuracy');
    }
    if (types.includes('spaced_repetition')) {
      reasons.push('Study overdue flashcards for better retention');
    }
    if (types.includes('knowledge_graph')) {
      reasons.push('Build on related concepts you\'ve been studying');
    }
    
    return reasons;
  }
}
