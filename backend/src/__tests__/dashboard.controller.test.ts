import { Request, Response } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';

// Mock Prisma
const mockPrisma = {
  flashcard: {
    count: jest.fn(),
  },
  studySession: {
    findMany: jest.fn(),
  },
  quizAttempt: {
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  $disconnect: jest.fn(),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

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
    it('should return 401 if user is not authenticated', async () => {
      mockReq.user = undefined;

      await getDashboardStats(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required'
      });
    });

    it('should return dashboard stats for authenticated user', async () => {
      // Mock database responses
      mockPrisma.flashcard.count.mockResolvedValue(50);
      mockPrisma.studySession.findMany
        .mockResolvedValueOnce([ // Today's sessions
          {
            id: 'session1',
            cardsStudied: 10,
            correctAnswers: 8,
            incorrectAnswers: 2,
            startTime: new Date(),
            endTime: new Date(),
          }
        ])
        .mockResolvedValueOnce([ // All sessions for streak calculation
          {
            startTime: new Date(),
            endTime: new Date(),
          }
        ]);
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
      mockPrisma.flashcard.count.mockRejectedValue(new Error('Database connection failed'));

      await getDashboardStats(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Database connection failed'
        })
      );
    });

    it('should calculate correct accuracy when no answers', async () => {
      mockPrisma.flashcard.count.mockResolvedValue(0);
      mockPrisma.studySession.findMany
        .mockResolvedValueOnce([]) // No sessions today
        .mockResolvedValueOnce([]); // No sessions at all
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
  });
});