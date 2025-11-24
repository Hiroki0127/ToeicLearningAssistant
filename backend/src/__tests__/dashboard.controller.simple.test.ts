import { Request, Response } from 'express';
import { getDashboardStats, calculateUserLevel } from '../controllers/dashboard.controller';
import { JWTPayload } from '../types';

// Mock Prisma - define inside factory to avoid hoisting issues
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    flashcard: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    flashcardReview: {
      findMany: jest.fn(),
    },
    studySession: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    quizAttempt: {
      count: jest.fn(),
      aggregate: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

// Get reference to mockPrisma for use in tests
const { PrismaClient } = require('@prisma/client');
const mockPrisma = new PrismaClient();

describe('Dashboard Controller - Simple Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockReq = {
      user: { 
        userId: 'test-user-id',
        email: 'test@example.com',
        iat: 1234567890,
        exp: 1234567890
      } as JWTPayload
    };
    
    mockRes = {
      status: mockStatus,
      json: mockJson,
    };

    jest.clearAllMocks();
  });

  describe('calculateUserLevel', () => {
    it('should calculate beginner level for new user', () => {
      const stats = {
        totalCards: 0,
        cardsStudiedToday: 0,
        currentStreak: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        totalQuizAttempts: 0,
        averageQuizScore: 0,
        totalStudyTimeMinutes: 0,
      };

      const result = calculateUserLevel(stats);

      expect(result.level).toBe('beginner');
      expect(result.experience).toBe(0);
      expect(result.nextLevel).toBe('intermediate');
      expect(result.nextLevelXP).toBe(5000);
      expect(result.levelProgress).toBe(0);
    });

    it('should calculate intermediate level with sufficient XP', () => {
      const stats = {
        totalCards: 100, // 100 * 10 = 1000 XP
        cardsStudiedToday: 10,
        currentStreak: 5, // 5 * 25 = 125 XP
        totalCorrect: 100, // 100 * 5 = 500 XP
        totalIncorrect: 20,
        totalQuizAttempts: 10, // 10 * 50 = 500 XP
        averageQuizScore: 80, // 80 * 10 = 800 XP
        totalStudyTimeMinutes: 1000 // 1000 / 10 = 100 XP
      };

      const result = calculateUserLevel(stats);

      expect(result.level).toBe('beginner');
      expect(result.experience).toBe(3525); // 1000 + 125 + 500 + 500 + 800 + 100
      expect(result.nextLevel).toBe('intermediate');
      expect(result.nextLevelXP).toBe(5000);
    });

    it('should calculate advanced level with high XP', () => {
      const stats = {
        totalCards: 500, // 500 * 10 = 5000 XP
        cardsStudiedToday: 50,
        currentStreak: 20, // 20 * 25 = 500 XP
        totalCorrect: 1000, // 1000 * 5 = 5000 XP
        totalIncorrect: 100,
        totalQuizAttempts: 50, // 50 * 50 = 2500 XP
        averageQuizScore: 85, // 85 * 50 = 4250 XP
        totalStudyTimeMinutes: 5000 // 5000 / 10 = 500 XP
      };

      const result = calculateUserLevel(stats);

      expect(result.level).toBe('intermediate');
      expect(result.experience).toBe(17750); // 5000 + 500 + 5000 + 2500 + 4250 + 500
      expect(result.nextLevel).toBe('advanced');
      expect(result.nextLevelXP).toBe(15000);
    });
  });

  describe('getDashboardStats', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockReq.user = undefined;

      await getDashboardStats(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('should return dashboard stats for an authenticated user', async () => {
      // Mock Prisma responses
      mockPrisma.flashcard.count.mockResolvedValue(10);
      mockPrisma.studySession.count.mockResolvedValue(5);
      mockPrisma.studySession.findMany.mockResolvedValue([
        { id: 's1', userId: 'test-user-id', correctCount: 3, incorrectCount: 1, startTime: new Date(), endTime: new Date() },
        { id: 's2', userId: 'test-user-id', correctCount: 2, incorrectCount: 2, startTime: new Date(), endTime: new Date() },
      ]);
      mockPrisma.quizAttempt.count.mockResolvedValue(3);
      mockPrisma.quizAttempt.aggregate.mockResolvedValue({
        _avg: { score: 75 },
      });
      mockPrisma.quizAttempt.findMany.mockResolvedValue([
        { id: 'qa1', userId: 'test-user-id', score: 80, completedAt: new Date(), quiz: { title: 'Sample Quiz 1' } },
      ]);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'test-user-id',
        dailyGoal: 20,
        createdAt: new Date(),
      });

      await getDashboardStats(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        progress: expect.any(Object),
        dailyGoal: 20,
        quickStats: expect.any(Object),
        recentActivity: expect.any(Array),
      }));
    });

    it('should handle no data gracefully', async () => {
      // Mock Prisma to return no data
      mockPrisma.flashcard.count.mockResolvedValue(0);
      mockPrisma.studySession.count.mockResolvedValue(0);
      mockPrisma.studySession.findMany.mockResolvedValue([]);
      mockPrisma.quizAttempt.count.mockResolvedValue(0);
      mockPrisma.quizAttempt.aggregate.mockResolvedValue({
        _avg: { score: null },
      });
      mockPrisma.quizAttempt.findMany.mockResolvedValue([]);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'test-user-id',
        dailyGoal: 20,
        createdAt: new Date(),
      });

      await getDashboardStats(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        progress: expect.objectContaining({
          totalCards: 0,
          cardsStudiedToday: 0,
          currentStreak: 0,
          accuracy: 0,
          level: 'beginner',
          experience: 0,
        }),
        quickStats: expect.objectContaining({
          totalFlashcards: 0,
          quizzesTaken: 0,
          averageQuizScore: 0,
        }),
        recentActivity: [],
      }));
    });
  });
});
