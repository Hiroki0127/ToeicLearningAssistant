import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { successResponse, badRequestResponse, databaseErrorResponse } from '../utils/response';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      badRequestResponse(res, 'Authentication required');
      return;
    }

    const userId = req.user.userId;

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Get user's flashcards count
    const totalCards = await prisma.flashcard.count({
      where: { userId }
    });

    // Get today's study sessions
    const todaySessions = await prisma.studySession.findMany({
      where: {
        userId,
        startTime: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    });

    // Calculate today's stats
    const cardsStudiedToday = todaySessions.reduce((total, session) => 
      total + (session.cardsStudied || 0), 0
    );

    const totalCorrect = todaySessions.reduce((total, session) => 
      total + (session.correctAnswers || 0), 0
    );

    const totalIncorrect = todaySessions.reduce((total, session) => 
      total + (session.incorrectAnswers || 0), 0
    );

    const accuracy = (totalCorrect + totalIncorrect) > 0 
      ? Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100) 
      : 0;

    // Get recent activity (last 10 items from both study sessions and quiz attempts)
    const [recentSessions, recentQuizAttempts] = await Promise.all([
      prisma.studySession.findMany({
        where: { userId },
        orderBy: { startTime: 'desc' },
        take: 10
      }),
      prisma.quizAttempt.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' },
        take: 10,
        include: {
          quiz: {
            select: {
              title: true,
              type: true
            }
          }
        }
      })
    ]);

    // Combine and format activities
    const sessionActivities = recentSessions.map(session => ({
      id: session.id,
      type: 'flashcard' as const,
      title: `Flashcard Study (${session.cardsStudied} cards)`,
      result: session.correctAnswers > session.incorrectAnswers ? 'Good' : 'Needs Work',
      score: `${session.correctAnswers}/${session.cardsStudied}`,
      time: session.startTime.toISOString(), // Send as ISO string for frontend to handle timezone
    }));

    const quizActivities = recentQuizAttempts.map(attempt => ({
      id: attempt.id,
      type: 'quiz' as const,
      title: attempt.quiz.title,
      result: attempt.score >= (attempt.totalQuestions * 0.7) ? 'Good' : 'Needs Work',
      score: `${attempt.correctAnswers}/${attempt.totalQuestions}`,
      time: attempt.completedAt.toISOString(), // Send as ISO string for frontend to handle timezone
    }));

    // Combine and sort by time, take most recent 10
    const allActivities = [...sessionActivities, ...quizActivities]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10);

    const recentActivity = allActivities;

    // Calculate streak (consecutive days with study sessions)
    const allSessions = await prisma.studySession.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
      select: { startTime: true }
    });

    let currentStreak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const session of allSessions) {
      const sessionDate = new Date(session.startTime);
      sessionDate.setHours(0, 0, 0, 0);
      
      if (sessionDate.getTime() === currentDate.getTime()) {
        currentStreak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (sessionDate.getTime() < currentDate.getTime()) {
        break;
      }
    }

    // Calculate additional stats
    const totalQuizAttempts = await prisma.quizAttempt.count({
      where: { userId }
    });

    console.log(`Dashboard stats for user ${userId}:`, {
      totalQuizAttempts,
      userId
    });

    const averageQuizScoreResult = await prisma.quizAttempt.aggregate({
      _avg: { score: true },
      where: { userId }
    });
    const averageQuizScore = averageQuizScoreResult._avg.score ? Math.round(averageQuizScoreResult._avg.score) : 0;

    // Calculate total study time from sessions
    const totalStudyTimeMinutes = allSessions.reduce((total, session) => {
      if (session.endTime) {
        const duration = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (1000 * 60);
        return total + duration;
      }
      return total;
    }, 0);

    const dashboardData = {
      progress: {
        totalCards,
        studiedToday: cardsStudiedToday,
        currentStreak,
        accuracy,
        level: 'beginner', // TODO: Implement level system
        experience: 0,
        nextLevel: 'intermediate',
        nextLevelXP: 500,
        currentLevelXP: 0,
      },
      dailyGoal: {
        studied: cardsStudiedToday,
        goal: 20,
        progress: Math.min((cardsStudiedToday / 20) * 100, 100),
      },
      recentActivity,
      quickStats: {
        totalStudyTime: Math.round(totalStudyTimeMinutes),
        cardsMastered: totalCorrect,
        quizzesTaken: totalQuizAttempts,
        averageScore: averageQuizScore,
      }
    };

    successResponse(res, dashboardData, 'Dashboard stats retrieved successfully');
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    databaseErrorResponse(res, error as Error);
  }
};