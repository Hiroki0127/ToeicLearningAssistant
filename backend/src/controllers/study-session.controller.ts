import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { successResponse, createdResponse, badRequestResponse, databaseErrorResponse } from '../utils/response';
import type { StudySessionInput } from '../utils/validation';

const prisma = new PrismaClient();

export const createStudySession = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      badRequestResponse(res, 'Authentication required');
      return;
    }

    const sessionData: StudySessionInput = req.body;
    const userId = req.user.userId;

    const studySession = await prisma.studySession.create({
      data: {
        ...sessionData,
        userId,
        startTime: new Date(sessionData.startTime),
        endTime: new Date(sessionData.endTime),
      },
    });

    createdResponse(res, studySession, 'Study session created successfully');
  } catch (error) {
    console.error('Create study session error:', error);
    databaseErrorResponse(res, error as Error);
  }
};

export const getStudySessions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      badRequestResponse(res, 'Authentication required');
      return;
    }

    const userId = req.user.userId;
    const { page = 1, limit = 10, type } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = { userId };
    if (type) {
      where.sessionType = type;
    }

    const [sessions, total] = await Promise.all([
      prisma.studySession.findMany({
        where,
        skip,
        take,
        orderBy: { startTime: 'desc' },
        include: {
          flashcards: {
            select: {
              id: true,
              word: true,
              definition: true,
              difficulty: true,
              partOfSpeech: true
            }
          }
        }
      }),
      prisma.studySession.count({ where })
    ]);

    const response = {
      sessions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    };

    successResponse(res, response, 'Study sessions retrieved successfully');
  } catch (error) {
    console.error('Get study sessions error:', error);
    databaseErrorResponse(res, error as Error);
  }
};

export const getStudySessionById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      badRequestResponse(res, 'Authentication required');
      return;
    }

    const { id } = req.params;
    const userId = req.user.userId;

    const session = await prisma.studySession.findFirst({
      where: { 
        id,
        userId 
      },
      include: {
        flashcards: {
          select: {
            id: true,
            word: true,
            definition: true,
            difficulty: true,
            partOfSpeech: true
          }
        }
      }
    });

    if (!session) {
      badRequestResponse(res, 'Study session not found');
      return;
    }

    successResponse(res, session, 'Study session retrieved successfully');
  } catch (error) {
    console.error('Get study session error:', error);
    databaseErrorResponse(res, error as Error);
  }
};
