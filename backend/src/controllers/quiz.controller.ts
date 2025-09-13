import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { successResponse, badRequestResponse, notFoundResponse } from '../utils/response';
// Remove unused import

export interface QuizResult {
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  answers: Record<string, string>;
}

export const getQuizzes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, difficulty, limit = 10, offset = 0 } = req.query;

    // Build filter conditions
    const where: any = {};
    if (type) where.type = type as string;
    if (difficulty) where.difficulty = difficulty as string;

    const quizzes = await prisma.quiz.findMany({
      where,
      take: Number(limit),
      skip: Number(offset),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        difficulty: true,
        timeLimit: true,
        questions: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Parse questions JSON string to array
    const quizzesWithParsedQuestions = quizzes.map(quiz => ({
      ...quiz,
      questions: JSON.parse(quiz.questions),
    }));

    successResponse(res, quizzesWithParsedQuestions, 'Quizzes retrieved successfully');
  } catch (error) {
    console.error('Get quizzes error:', error);
    badRequestResponse(res, 'Failed to retrieve quizzes');
  }
};

export const getQuizById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        difficulty: true,
        timeLimit: true,
        questions: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!quiz) {
      notFoundResponse(res, 'Quiz not found');
      return;
    }

    // Parse questions JSON string to array
    const quizWithParsedQuestions = {
      ...quiz,
      questions: JSON.parse(quiz.questions),
    };

    successResponse(res, quizWithParsedQuestions, 'Quiz retrieved successfully');
  } catch (error) {
    console.error('Get quiz error:', error);
    badRequestResponse(res, 'Failed to retrieve quiz');
  }
};

export const submitQuizResult = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      badRequestResponse(res, 'Authentication required');
      return;
    }

    const { quizId, score, totalQuestions, correctAnswers, timeSpent, answers }: QuizResult = req.body;

    // Validate required fields
    if (!quizId || score === undefined || !totalQuestions || correctAnswers === undefined || timeSpent === undefined) {
      badRequestResponse(res, 'Missing required fields');
      return;
    }

    // Check if quiz exists
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId as string },
    });

    if (!quiz) {
      notFoundResponse(res, 'Quiz not found');
      return;
    }

    // Save quiz attempt
    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId: req.user.userId,
        score,
        totalQuestions,
        correctAnswers,
        timeSpent,
        answers: JSON.stringify(answers),
      },
    });

    // Update user progress (add experience points)
    const experienceGained = Math.floor(score / 10) * 10; // 10 XP per 10% score
    
    // Update or create user progress
    await prisma.userProgress.upsert({
      where: { userId: req.user.userId },
      update: {
        experience: {
          increment: experienceGained,
        },
      },
      create: {
        userId: req.user.userId,
        experience: experienceGained,
        totalCardsStudied: 0,
        totalCorrectAnswers: 0,
        totalIncorrectAnswers: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalStudyTime: 0,
        level: 'beginner',
      },
    });

    // Update daily progress
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await prisma.dailyProgress.upsert({
      where: {
        userId_date: {
          userId: req.user.userId,
          date: today,
        },
      },
      update: {
        cardsStudied: {
          increment: totalQuestions,
        },
        correctAnswers: {
          increment: correctAnswers,
        },
        studyTime: {
          increment: timeSpent,
        },
      },
      create: {
        userId: req.user.userId,
        date: today,
        cardsStudied: totalQuestions,
        correctAnswers: correctAnswers,
        studyTime: timeSpent,
      },
    });

    // Create study session record
    await prisma.studySession.create({
      data: {
        userId: req.user.userId,
        startTime: new Date(Date.now() - timeSpent * 1000), // Calculate start time
        endTime: new Date(),
        sessionType: 'quiz',
        cardsStudied: totalQuestions,
        correctAnswers: correctAnswers,
        incorrectAnswers: totalQuestions - correctAnswers,
      },
    });

    successResponse(res, {
      quizAttempt,
      experienceGained,
    }, 'Quiz result submitted successfully');
  } catch (error) {
    console.error('Submit quiz result error:', error);
    badRequestResponse(res, 'Failed to submit quiz result');
  }
};

export const getQuizHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      badRequestResponse(res, 'Authentication required');
      return;
    }

    const { limit = 10, offset = 0 } = req.query;

    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { userId: req.user.userId },
      take: Number(limit),
      skip: Number(offset),
      orderBy: { completedAt: 'desc' },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            type: true,
            difficulty: true,
          },
        },
      },
    });

    successResponse(res, quizAttempts, 'Quiz history retrieved successfully');
  } catch (error) {
    console.error('Get quiz history error:', error);
    badRequestResponse(res, 'Failed to retrieve quiz history');
  }
};

export const getQuizStats = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      badRequestResponse(res, 'Authentication required');
      return;
    }

    // Get quiz statistics
    const totalQuizzes = await prisma.quizAttempt.count({
      where: { userId: req.user.userId },
    });

    const averageScore = await prisma.quizAttempt.aggregate({
      where: { userId: req.user.userId },
      _avg: { score: true },
    });

    const bestScore = await prisma.quizAttempt.aggregate({
      where: { userId: req.user.userId },
      _max: { score: true },
    });

    const quizTypes = await prisma.quizAttempt.groupBy({
      by: ['quizId'],
      where: { userId: req.user.userId },
      _count: { id: true },
    });

    successResponse(res, {
      totalQuizzes,
      averageScore: Math.round(averageScore._avg.score || 0),
      bestScore: bestScore._max.score || 0,
      quizTypesCount: quizTypes.length,
    }, 'Quiz statistics retrieved successfully');
  } catch (error) {
    console.error('Get quiz stats error:', error);
    badRequestResponse(res, 'Failed to retrieve quiz statistics');
  }
};
