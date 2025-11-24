import { Request, Response } from 'express';
import { register, login } from '../controllers/auth.controller';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    userProgress: {
      create: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-token'),
}));

describe('Auth Controller - Simple Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockPrisma: any;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockReq = {
      body: {}
    };
    
    mockRes = {
      status: mockStatus,
      json: mockJson,
    };

    // Get the mock instance
    const mockInstance = (PrismaClient as jest.Mock).mock.results[0]?.value;
    if (mockInstance) {
      mockPrisma = mockInstance;
    } else {
      mockPrisma = new PrismaClient();
    }

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      mockReq.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      mockPrisma.user.findUnique.mockResolvedValue(null); // User doesn't exist
      const bcrypt = require('bcryptjs');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed-password',
        preferences: JSON.stringify({ dailyGoal: 20 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockPrisma.userProgress.create.mockResolvedValue({
        id: 'progress-id',
        userId: 'user-id',
        totalCardsStudied: 0,
        totalCorrectAnswers: 0,
        totalIncorrectAnswers: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalStudyTime: 0,
        level: 'beginner',
        experience: 0,
      });

      await register(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'User registered successfully',
          data: expect.objectContaining({
            user: expect.objectContaining({
              id: 'user-id',
              name: 'Test User',
              email: 'test@example.com',
            }),
            token: expect.any(String),
          }),
        })
      );
    });

    it('should return error if user already exists', async () => {
      mockReq.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'existing-user-id',
        email: 'test@example.com',
      });

      await register(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(409);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('User already exists')
        })
      );
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed-password',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      const bcrypt = require('bcryptjs');
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await login(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Login successful',
          data: expect.objectContaining({
            user: expect.objectContaining({
              id: 'user-id',
              name: 'Test User',
              email: 'test@example.com',
            }),
            token: expect.any(String),
          }),
        })
      );
    });

    it('should return error for invalid credentials', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'wrong-password'
      };

      const mockUser = {
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed-password',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      const bcrypt = require('bcryptjs');
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await login(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Invalid credentials'
        })
      );
    });
  });
});
