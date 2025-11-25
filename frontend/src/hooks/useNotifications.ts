import { useState, useCallback, useEffect } from 'react';
import { notificationService } from '@/lib/notifications';
import type { Notification } from '@/types';
import type { NotificationFilters, NotificationResponse } from '@/lib/notifications';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Fetch notifications
  const fetchNotifications = useCallback(async (filters: NotificationFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response: NotificationResponse = await notificationService.getNotifications(filters);
      setNotifications(response.notifications);
      setPagination(response.pagination);
      
      // Update unread count
      const unread = response.notifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
      
      return response;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Failed to fetch notifications';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch unread notifications count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response: NotificationResponse = await notificationService.getNotifications({
        page: 1,
        limit: 100,
        unreadOnly: true,
      });
      setUnreadCount(response.pagination.total);
      return response.pagination.total;
    } catch (err: unknown) {
      console.error('Failed to fetch unread count:', err);
      return 0;
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      const updatedNotification = await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? updatedNotification : n)
      );
      
      // Update unread count
      if (updatedNotification.isRead && unreadCount > 0) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return updatedNotification;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Failed to mark notification as read';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [unreadCount]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
      if (unreadIds.length === 0) return;
      
      await notificationService.markAllAsRead(unreadIds);
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Failed to mark all as read';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [notifications]);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      const deletedNotification = notifications.find(n => n.id === id);
      
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      // Update unread count if deleted notification was unread
      if (deletedNotification && !deletedNotification.isRead && unreadCount > 0) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Update pagination total
      setPagination(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Failed to delete notification';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [notifications, unreadCount]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    pagination,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};

