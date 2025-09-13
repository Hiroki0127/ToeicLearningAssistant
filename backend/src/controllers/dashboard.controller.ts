import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { successResponse, badRequestResponse, notFoundResponse } from '@/utils/response';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      badRequestResponse(res, 'Authentication required');
      return;
    }

    const userId = req.user.userId;

    // Get user progress
    const userProgress = await prisma.userProgress.findUnique({
      where: { userId },
    });

    // Get today's progress
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayProgress = await prisma.dailyProgress.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Next day
        },
      },
    });

    // Get total flashcards count
    const totalFlashcards = await prisma.flashcard.count({
      where: { userId },
    });

    // Get recent flashcard reviews (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentReviews = await prisma.flashcardReview.findMany({
      where: {
        userId,
        reviewedAt: {
          gte: sevenDaysAgo,
        },
      },
      include: {
        flashcard: true,
      },
      orderBy: { reviewedAt: 'desc' },
      take: 5,
    });

    // Get recent quiz attempts (last 7 days)
    const recentQuizAttempts = await prisma.quizAttempt.findMany({
      where: {
        userId,
        completedAt: {
          gte: sevenDaysAgo,
        },
      },
      include: {
        quiz: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
      take: 3,
    });

    // Calculate accuracy
    const totalCorrect = userProgress?.totalCorrectAnswers || 0;
    const totalIncorrect = userProgress?.totalIncorrectAnswers || 0;
    const accuracy = totalCorrect + totalIncorrect > 0 
      ? Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100)
      : 0;

    // Calculate experience progress
    const currentLevel = userProgress?.level || 'beginner';
    const currentXP = userProgress?.experience || 0;
    
    // Simple level progression (can be made more sophisticated)
    const levelRequirements = {
      beginner: 0,
      intermediate: 500,
      advanced: 1500,
    };
    
    const nextLevel = currentLevel === 'beginner' ? 'intermediate' : 
                     currentLevel === 'intermediate' ? 'advanced' : 'advanced';
    const nextLevelXP = levelRequirements[nextLevel as keyof typeof levelRequirements];
    const currentLevelXP = levelRequirements[currentLevel as keyof typeof levelRequirements];

    // Format recent activity
    const recentActivity = [
      ...recentReviews.map(review => ({
        id: review.id,
        type: 'flashcard',
        word: review.flashcard.word,
        result: review.isCorrect ? 'correct' : 'incorrect',
        time: review.reviewedAt,
      })),
      ...recentQuizAttempts.map(attempt => ({
        id: attempt.id,
        type: 'quiz',
        title: attempt.quiz.title,
        score: `${attempt.correctAnswers}/${attempt.totalQuestions}`,
        time: attempt.completedAt,
      })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
     .slice(0, 5);

    // Calculate daily goal progress (default goal: 20 cards)
    const dailyGoal = 20;
    const studiedToday = todayProgress?.cardsStudied || 0;

    // Format time for display
    const formatTimeAgo = (date: Date) => {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    const dashboardData = {
      progress: {
        totalCards: totalFlashcards,
        studiedToday,
        currentStreak: userProgress?.currentStreak || 0,
        accuracy,
        level: currentLevel,
        experience: currentXP,
        nextLevel,
        nextLevelXP,
        currentLevelXP,
      },
      dailyGoal: {
        studied: studiedToday,
        goal: dailyGoal,
        progress: Math.min((studiedToday / dailyGoal) * 100, 100),
      },
      recentActivity: recentActivity.map(activity => ({
        ...activity,
        time: formatTimeAgo(activity.time),
      })),
      quickStats: {
        totalStudyTime: Math.round((userProgress?.totalStudyTime || 0) / 60), // Convert to minutes
        cardsMastered: totalCorrect,
        quizzesTaken: await prisma.quizAttempt.count({ where: { userId } }),
        averageScore: await calculateAverageQuizScore(userId),
      },
    };

    successResponse(res, dashboardData, 'Dashboard stats retrieved successfully');
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    badRequestResponse(res, 'Failed to retrieve dashboard stats');
  }
};

async function calculateAverageQuizScore(userId: string): Promise<number> {
  try {
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { userId },
      select: { score: true },
    });

    if (quizAttempts.length === 0) return 0;

    const totalScore = quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
    return Math.round(totalScore / quizAttempts.length);
  } catch (error) {
    console.error('Error calculating average quiz score:', error);
    return 0;
  }
}
