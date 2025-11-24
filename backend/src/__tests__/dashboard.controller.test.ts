import { Request, Response } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';

// Mock Prisma - define inside factory to avoid hoisting issues
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    flashcard: {
      count: jest.fn(),
    },
    flashcardReview: {
      findMany: jest.fn(),
    },
    studySession: {
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

describe('Dashboard Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockReq = {
      user: { 
        userId: 'test-user-id',
        email: 'test@example.com',
        iat: 1234567890,
        exp: 1234567890
      }
    };
    
    mockRes = {
      status: mockStatus,
      json: mockJson,
    };

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should return 400 if user is not authenticated', async () => {
      mockReq.user = undefined;

      await getDashboardStats(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Authentication')
        })
      );
    });

    it('should return dashboard stats for authenticated user', async () => {
      // Mock database responses
      const today = new Date();
      const todayEnd = new Date(today.getTime() + 60 * 60 * 1000);
      
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'test-user-id',
        preferences: JSON.stringify({ dailyGoal: 20 }),
      });
      mockPrisma.flashcard.count.mockResolvedValue(50);
      mockPrisma.flashcardReview.findMany.mockResolvedValue([
        { flashcardId: 'card1', isCorrect: true },
        { flashcardId: 'card2', isCorrect: true },
        { flashcardId: 'card3', isCorrect: true },
        { flashcardId: 'card4', isCorrect: true },
        { flashcardId: 'card5', isCorrect: true },
        { flashcardId: 'card6', isCorrect: true },
        { flashcardId: 'card7', isCorrect: true },
        { flashcardId: 'card8', isCorrect: true },
      ]);
      // First call: today's sessions (for stats)
      // Second call: all sessions (for streak calculation)
      mockPrisma.studySession.findMany
        .mockResolvedValueOnce([ // Today's sessions
          {
            id: 'session1',
            cardsStudied: 10,
            correctAnswers: 8,
            incorrectAnswers: 2,
            startTime: today,
            endTime: todayEnd,
            sessionType: 'flashcard',
          }
        ])
        .mockResolvedValueOnce([ // Recent sessions (for activity)
          {
            id: 'session1',
            cardsStudied: 10,
            correctAnswers: 8,
            incorrectAnswers: 2,
            startTime: today,
            endTime: todayEnd,
            sessionType: 'flashcard',
          }
        ])
        .mockResolvedValueOnce([ // All sessions for streak calculation
          {
            startTime: today,
            endTime: todayEnd,
          }
        ]);
      mockPrisma.quizAttempt.findMany.mockResolvedValue([]);
      mockPrisma.quizAttempt.count.mockResolvedValue(5);
      mockPrisma.quizAttempt.aggregate.mockResolvedValue({
        _avg: { score: 80 }
      });

      await getDashboardStats(mockReq as Request, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            progress: expect.objectContaining({
              totalCards: 50,
              studiedToday: 10,
              currentStreak: 1,
              accuracy: 80,
              level: 'beginner',
              experience: expect.any(Number),
            }),
            dailyGoal: expect.objectContaining({
              studied: 10,
              goal: 20,
              progress: 50,
            }),
            recentActivity: expect.any(Array),
            quickStats: expect.objectContaining({
              totalStudyTime: expect.any(Number),
              cardsMastered: 8,
              quizzesTaken: 5,
              averageScore: 80,
            }),
          })
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database connection failed'));

      await getDashboardStats(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.any(String)
        })
      );
    });

    it('should calculate correct accuracy when no answers', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'test-user-id',
        preferences: null,
      });
      mockPrisma.flashcard.count.mockResolvedValue(0);
      mockPrisma.flashcardReview.findMany.mockResolvedValue([]);
      mockPrisma.studySession.findMany
        .mockResolvedValueOnce([]) // No sessions today
        .mockResolvedValueOnce([]) // Recent sessions (for activity)
        .mockResolvedValueOnce([]); // All sessions for streak calculation
      mockPrisma.quizAttempt.findMany.mockResolvedValue([]);
      mockPrisma.quizAttempt.count.mockResolvedValue(0);
      mockPrisma.quizAttempt.aggregate.mockResolvedValue({
        _avg: { score: null }
      });

      await getDashboardStats(mockReq as Request, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            progress: expect.objectContaining({
              accuracy: 0,
            }),
          })
        })
      );
    });

    it('should keep streak when no session yet today but streak is active', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayEnd = new Date(yesterday);
      yesterdayEnd.setHours(yesterdayEnd.getHours() + 1);
      
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'test-user-id',
        preferences: null,
      });
      mockPrisma.flashcard.count.mockResolvedValue(0);
      mockPrisma.flashcardReview.findMany.mockResolvedValue([]);
      mockPrisma.studySession.findMany
        .mockResolvedValueOnce([]) // No sessions today for stats
        .mockResolvedValueOnce([]) // Recent sessions (for activity)
        .mockResolvedValueOnce([
          {
            startTime: yesterday,
            endTime: yesterdayEnd,
          }
        ]); // All sessions for streak calculation (last session yesterday)
      mockPrisma.quizAttempt.findMany.mockResolvedValue([]);
      mockPrisma.quizAttempt.count.mockResolvedValue(0);
      mockPrisma.quizAttempt.aggregate.mockResolvedValue({
        _avg: { score: null }
      });

      await getDashboardStats(mockReq as Request, mockRes as Response);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            progress: expect.objectContaining({
              currentStreak: 1,
            }),
          })
        })
      );
    });
  });
});