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

    // Get recent activity (last 10 sessions)
    const recentSessions = await prisma.studySession.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
      take: 10
    });

    const recentActivity = recentSessions.map(session => ({
      id: session.id,
      type: session.sessionType,
      word: session.sessionType === 'flashcards' ? 
        `Study Session (${session.cardsStudied} cards)` : 
        session.sessionType,
      result: session.correctAnswers > session.incorrectAnswers ? 'Correct' : 'Incorrect',
      score: `${session.correctAnswers}/${session.cardsStudied}`,
      time: session.startTime.toLocaleTimeString(),
    }));

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
        totalStudyTime: 0, // TODO: Calculate from session durations
        cardsMastered: totalCorrect,
        quizzesTaken: 0, // TODO: Implement quiz tracking
        averageScore: accuracy,
      }
    };

    successResponse(res, dashboardData, 'Dashboard stats retrieved successfully');
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    databaseErrorResponse(res, error as Error);
  }
};