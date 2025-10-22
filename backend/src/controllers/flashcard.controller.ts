import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { successResponse, createdResponse, badRequestResponse, notFoundResponse, databaseErrorResponse } from '@/utils/response';
import type { CreateFlashcardInput, UpdateFlashcardInput, FlashcardReviewInput } from '@/utils/validation';

const prisma = new PrismaClient();

export const createFlashcard = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      badRequestResponse(res, 'Authentication required');
      return;
    }

    const flashcardData: CreateFlashcardInput = req.body;

    const flashcard = await prisma.flashcard.create({
      data: {
        ...flashcardData,
        userId: req.user.userId,
      },
    });

    createdResponse(res, flashcard, 'Flashcard created successfully');
  } catch (error) {
    console.error('Create flashcard error:', error);
    databaseErrorResponse(res, error as Error);
  }
};

export const getFlashcards = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search, difficulty, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { word: { contains: search as string, mode: 'insensitive' } },
        { definition: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    // Get flashcards with pagination
    const [flashcards, total] = await Promise.all([
      prisma.flashcard.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.flashcard.count({ where }),
    ]);

    const totalPages = Math.ceil(total / take);

    successResponse(res, {
      flashcards,
      pagination: {
        page: Number(page),
        limit: take,
        total,
        totalPages,
      },
    }, 'Flashcards retrieved successfully');
  } catch (error) {
    console.error('Get flashcards error:', error);
    databaseErrorResponse(res, error as Error);
  }
};

export const getFlashcardById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const flashcard = await prisma.flashcard.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        reviews: {
          take: 5,
          orderBy: { reviewedAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!flashcard) {
      notFoundResponse(res, 'Flashcard not found');
      return;
    }

    successResponse(res, flashcard, 'Flashcard retrieved successfully');
  } catch (error) {
    console.error('Get flashcard error:', error);
    databaseErrorResponse(res, error as Error);
  }
};

export const updateFlashcard = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      badRequestResponse(res, 'Authentication required');
      return;
    }

    const { id } = req.params;
    const updateData: UpdateFlashcardInput = req.body;

    // Check if flashcard exists and user owns it
    const existingFlashcard = await prisma.flashcard.findUnique({
      where: { id },
    });

    if (!existingFlashcard) {
      notFoundResponse(res, 'Flashcard not found');
      return;
    }

    if (existingFlashcard.userId !== req.user.userId) {
      badRequestResponse(res, 'You can only update your own flashcards');
      return;
    }

    const updatedFlashcard = await prisma.flashcard.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    successResponse(res, updatedFlashcard, 'Flashcard updated successfully');
  } catch (error) {
    console.error('Update flashcard error:', error);
    databaseErrorResponse(res, error as Error);
  }
};

export const deleteFlashcard = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      badRequestResponse(res, 'Authentication required');
      return;
    }

    const { id } = req.params;

    // Check if flashcard exists and user owns it
    const existingFlashcard = await prisma.flashcard.findUnique({
      where: { id },
    });

    if (!existingFlashcard) {
      notFoundResponse(res, 'Flashcard not found');
      return;
    }

    if (existingFlashcard.userId !== req.user.userId) {
      badRequestResponse(res, 'You can only delete your own flashcards');
      return;
    }

    await prisma.flashcard.delete({
      where: { id },
    });

    successResponse(res, null, 'Flashcard deleted successfully');
  } catch (error) {
    console.error('Delete flashcard error:', error);
    databaseErrorResponse(res, error as Error);
  }
};

export const reviewFlashcard = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      badRequestResponse(res, 'Authentication required');
      return;
    }

    const reviewData: FlashcardReviewInput = req.body;

    // Check if flashcard exists
    const flashcard = await prisma.flashcard.findUnique({
      where: { id: reviewData.flashcardId },
    });

    if (!flashcard) {
      notFoundResponse(res, 'Flashcard not found');
      return;
    }

    // Create review
    const review = await prisma.flashcardReview.create({
      data: {
        flashcardId: reviewData.flashcardId,
        userId: req.user.userId,
        isCorrect: reviewData.isCorrect,
        responseTime: reviewData.responseTime,
      },
    });

    // Update user progress
    await updateUserProgress(req.user.userId, reviewData.isCorrect);

    successResponse(res, review, 'Flashcard review recorded successfully');
  } catch (error) {
    console.error('Review flashcard error:', error);
    databaseErrorResponse(res, error as Error);
  }
};

export const getUserFlashcards = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      badRequestResponse(res, 'Authentication required');
      return;
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [flashcards, total] = await Promise.all([
      prisma.flashcard.findMany({
        where: { userId: req.user.userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.flashcard.count({
        where: { userId: req.user.userId },
      }),
    ]);

    const totalPages = Math.ceil(total / take);

    successResponse(res, {
      flashcards,
      pagination: {
        page: Number(page),
        limit: take,
        total,
        totalPages,
      },
    }, 'User flashcards retrieved successfully');
  } catch (error) {
    console.error('Get user flashcards error:', error);
    databaseErrorResponse(res, error as Error);
  }
};

// Helper function to update user progress
const updateUserProgress = async (userId: string, isCorrect: boolean): Promise<void> => {
  try {
    const progress = await prisma.userProgress.findUnique({
      where: { userId },
    });

    if (progress) {
      // Calculate streak based on study activity
      const newStreak = await calculateStreak(userId);
      
      await prisma.userProgress.update({
        where: { userId },
        data: {
          totalCardsStudied: progress.totalCardsStudied + 1,
          totalCorrectAnswers: progress.totalCorrectAnswers + (isCorrect ? 1 : 0),
          totalIncorrectAnswers: progress.totalIncorrectAnswers + (isCorrect ? 0 : 1),
          currentStreak: newStreak.currentStreak,
          longestStreak: Math.max(progress.longestStreak, newStreak.currentStreak),
          lastStudyDate: new Date(),
          updatedAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.error('Update user progress error:', error);
  }
};

// Calculate streak based on daily study activity
const calculateStreak = async (userId: string): Promise<{ currentStreak: number }> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all daily progress records for this user, ordered by date
    await prisma.dailyProgress.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    let currentStreak = 0;
    let checkDate = new Date(today);

    // Check each day going backwards
    for (let i = 0; i < 365; i++) { // Check up to 1 year back
      const dayStart = new Date(checkDate);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(checkDate);
      dayEnd.setHours(23, 59, 59, 999);

      // Check if user studied on this day
      const studiedToday = await prisma.dailyProgress.findFirst({
        where: {
          userId,
          date: {
            gte: dayStart,
            lte: dayEnd,
          },
          cardsStudied: { gt: 0 }, // Must have studied at least 1 card
        },
      });

      if (studiedToday) {
        currentStreak++;
        // Move to previous day
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // No study activity on this day, streak ends
        break;
      }
    }

    return { currentStreak };
  } catch (error) {
    console.error('Calculate streak error:', error);
    return { currentStreak: 0 };
  }
};
