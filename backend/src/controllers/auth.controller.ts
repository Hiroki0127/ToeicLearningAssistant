import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { successResponse, createdResponse, badRequestResponse, conflictResponse, authErrorResponse } from '@/utils/response';
import type { RegisterInput, LoginInput } from '@/utils/validation';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password }: RegisterInput = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      conflictResponse(res, 'User already exists with this email');
      return;
    }

    // Hash password
    const saltRounds = parseInt(process.env['BCRYPT_ROUNDS'] || '12');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        preferences: JSON.stringify({
          dailyGoal: 20,
          notificationTime: '09:00',
          difficulty: 'beginner',
          focusAreas: ['vocabulary', 'grammar'],
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Create initial progress record
    await prisma.userProgress.create({
      data: {
        userId: user.id,
        totalCardsStudied: 0,
        totalCorrectAnswers: 0,
        totalIncorrectAnswers: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalStudyTime: 0,
        level: 'beginner',
        experience: 0,
      },
    });

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    createdResponse(res, {
      user,
      token,
    }, 'User registered successfully');
  } catch (error) {
    console.error('Registration error:', error);
    badRequestResponse(res, 'Registration failed');
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginInput = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      authErrorResponse(res, 'Invalid credentials');
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      authErrorResponse(res, 'Invalid credentials');
      return;
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    successResponse(res, {
      user: userWithoutPassword,
      token,
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    authErrorResponse(res, 'Login failed');
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      authErrorResponse(res, 'Authentication required');
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      authErrorResponse(res, 'User not found');
      return;
    }

    successResponse(res, user, 'Profile retrieved successfully');
  } catch (error) {
    console.error('Get profile error:', error);
    badRequestResponse(res, 'Failed to retrieve profile');
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      authErrorResponse(res, 'Authentication required');
      return;
    }

    const { name, preferences } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(name && { name }),
        ...(preferences && { preferences }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    successResponse(res, updatedUser, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    badRequestResponse(res, 'Failed to update profile');
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      authErrorResponse(res, 'Authentication required');
      return;
    }

    const { currentPassword, newPassword } = req.body;

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { password: true },
    });

    if (!user) {
      authErrorResponse(res, 'User not found');
      return;
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      authErrorResponse(res, 'Current password is incorrect');
      return;
    }

    // Hash new password
    const saltRounds = parseInt(process.env['BCRYPT_ROUNDS'] || '12');
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date(),
      },
    });

    successResponse(res, null, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    badRequestResponse(res, 'Failed to change password');
  }
};

// Helper function to generate JWT token
const generateToken = (userId: string, email: string): string => {
  const secret = process.env['JWT_SECRET'];
  const expiresIn = process.env['JWT_EXPIRES_IN'] || '7d';

  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.sign(
    { userId, email },
    secret,
    { expiresIn: expiresIn as any }
  );
};
