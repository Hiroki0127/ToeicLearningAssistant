import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { successResponse, createdResponse, badRequestResponse, notFoundResponse, databaseErrorResponse } from '../utils/response';

const prisma = new PrismaClient();

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      badRequestResponse(res, 'Authentication required');
      return;
    }

    const { page = 1, limit = 10, unreadOnly = false } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = { userId: req.user.userId };
    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);

    const totalPages = Math.ceil(total / take);

    successResponse(res, {
      notifications,
      pagination: {
        page: Number(page),
        limit: take,
        total,
        totalPages,
      },
    }, 'Notifications retrieved successfully');
  } catch (error) {
    console.error('Get notifications error:', error);
    databaseErrorResponse(res, error as Error);
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      badRequestResponse(res, 'Authentication required');
      return;
    }

    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!notification) {
      notFoundResponse(res, 'Notification not found');
      return;
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    successResponse(res, updatedNotification, 'Notification marked as read');
  } catch (error) {
    console.error('Mark notification as read error:', error);
    databaseErrorResponse(res, error as Error);
  }
};

export const createNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      badRequestResponse(res, 'Authentication required');
      return;
    }

    const { type, title, message, actionUrl } = req.body;

    const notification = await prisma.notification.create({
      data: {
        userId: req.user.userId,
        type,
        title,
        message,
        actionUrl,
      },
    });

    createdResponse(res, notification, 'Notification created successfully');
  } catch (error) {
    console.error('Create notification error:', error);
    databaseErrorResponse(res, error as Error);
  }
};

export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      badRequestResponse(res, 'Authentication required');
      return;
    }

    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!notification) {
      notFoundResponse(res, 'Notification not found');
      return;
    }

    await prisma.notification.delete({
      where: { id },
    });

    successResponse(res, null, 'Notification deleted successfully');
  } catch (error) {
    console.error('Delete notification error:', error);
    databaseErrorResponse(res, error as Error);
  }
};

export const getNotificationPreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      badRequestResponse(res, 'Authentication required');
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { preferences: true },
    });

    if (!user) {
      notFoundResponse(res, 'User not found');
      return;
    }

    const preferences = user.preferences ? JSON.parse(user.preferences) : {
      notifications: {
        dailyReminders: true,
        streakAlerts: true,
        achievementCelebrations: true,
        reminderTime: '09:00',
        timezone: 'UTC',
      },
    };

    successResponse(res, preferences, 'Notification preferences retrieved successfully');
  } catch (error) {
    console.error('Get notification preferences error:', error);
    databaseErrorResponse(res, error as Error);
  }
};

export const updateNotificationPreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      badRequestResponse(res, 'Authentication required');
      return;
    }

    const { notifications } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { preferences: true },
    });

    if (!user) {
      notFoundResponse(res, 'User not found');
      return;
    }

    const currentPreferences = user.preferences ? JSON.parse(user.preferences) : {};
    const updatedPreferences = {
      ...currentPreferences,
      notifications,
    };

    await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        preferences: JSON.stringify(updatedPreferences),
      },
    });

    successResponse(res, updatedPreferences, 'Notification preferences updated successfully');
  } catch (error) {
    console.error('Update notification preferences error:', error);
    databaseErrorResponse(res, error as Error);
  }
};
