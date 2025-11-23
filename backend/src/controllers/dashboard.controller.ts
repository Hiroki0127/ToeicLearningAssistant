import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { successResponse, badRequestResponse, databaseErrorResponse } from '../utils/response';

const prisma = new PrismaClient();

// Level system configuration
const LEVELS = [
  { name: 'beginner', minXP: 0, maxXP: 4999 },
  { name: 'intermediate', minXP: 5000, maxXP: 14999 },
  { name: 'advanced', minXP: 15000, maxXP: 29999 },
  { name: 'expert', minXP: 30000, maxXP: Infinity }
];

// XP calculation function
export function calculateUserLevel(stats: {
  totalCards: number;
  cardsStudiedToday: number;
  currentStreak: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalQuizAttempts: number;
  averageQuizScore: number;
  totalStudyTimeMinutes: number;
}) {
  let totalXP = 0;

  // XP from flashcards studied (10 XP per card)
  totalXP += stats.totalCards * 10;

  // XP from correct answers (5 XP per correct answer)
  totalXP += stats.totalCorrect * 5;

  // XP from quiz attempts (50 XP per quiz + score bonus)
  totalXP += stats.totalQuizAttempts * 50;
  totalXP += Math.round(stats.averageQuizScore * stats.totalQuizAttempts);

  // XP from study streaks (25 XP per day streak)
  totalXP += stats.currentStreak * 25;

  // XP from study time (1 XP per 10 minutes)
  totalXP += Math.floor(stats.totalStudyTimeMinutes / 10);

  // Determine current level
  const currentLevel = LEVELS.find(level => totalXP >= level.minXP && totalXP <= level.maxXP) || LEVELS[0];
  const nextLevel = LEVELS.find(level => level.minXP > totalXP) || LEVELS[LEVELS.length - 1];

  // Calculate progress within current level
  const currentLevelXP = totalXP - currentLevel.minXP;
  const levelProgress = currentLevel.maxXP === Infinity ? 100 : 
    Math.round((currentLevelXP / (currentLevel.maxXP - currentLevel.minXP + 1)) * 100);

  return {
    level: currentLevel.name,
    experience: totalXP,
    nextLevel: nextLevel.name,
    nextLevelXP: nextLevel.minXP,
    currentLevelXP,
    levelProgress: Math.min(levelProgress, 100)
  };
}

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      badRequestResponse(res, 'Authentication required');
      return;
    }

    const userId = req.user.userId;

    // Get user preferences to read daily goal
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true }
    });

    let dailyGoal = 20; // Default
    if (user?.preferences) {
      try {
        const preferences = JSON.parse(user.preferences);
        dailyGoal = preferences.dailyGoal || 20;
      } catch (e) {
        console.error('Error parsing user preferences:', e);
      }
    }

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
      select: { startTime: true, endTime: true }
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

    // Calculate experience points and level
    const levelSystem = calculateUserLevel({
      totalCards,
      cardsStudiedToday,
      currentStreak,
      totalCorrect,
      totalIncorrect,
      totalQuizAttempts,
      averageQuizScore,
      totalStudyTimeMinutes
    });

    const dashboardData = {
      progress: {
        totalCards,
        studiedToday: cardsStudiedToday,
        currentStreak,
        accuracy,
        level: levelSystem.level,
        experience: levelSystem.experience,
        nextLevel: levelSystem.nextLevel,
        nextLevelXP: levelSystem.nextLevelXP,
        currentLevelXP: levelSystem.currentLevelXP,
        levelProgress: levelSystem.levelProgress,
      },
      dailyGoal: {
        studied: cardsStudiedToday,
        goal: dailyGoal,
        progress: Math.min((cardsStudiedToday / dailyGoal) * 100, 100),
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