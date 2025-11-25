import api from './api';
import type { Notification } from '@/types';

export interface NotificationFilters {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateNotificationData {
  type: 'reminder' | 'achievement' | 'streak' | 'system';
  title: string;
  message: string;
  actionUrl?: string;
}

// Notification service functions
export const notificationService = {
  // Get all notifications with pagination and filters
  async getNotifications(filters: NotificationFilters = {}): Promise<NotificationResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.unreadOnly) params.append('unreadOnly', 'true');

    const response = await api.get(`/notifications?${params.toString()}`);
    return response.data.data;
  },

  // Mark a notification as read
  async markAsRead(id: string): Promise<Notification> {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data.data;
  },

  // Mark all notifications as read
  async markAllAsRead(notificationIds: string[]): Promise<void> {
    await Promise.all(notificationIds.map(id => this.markAsRead(id)));
  },

  // Delete a notification
  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },

  // Create a notification (for testing or admin use)
  async createNotification(data: CreateNotificationData): Promise<Notification> {
    const response = await api.post('/notifications', data);
    return response.data.data;
  },

  // Get notification preferences
  async getNotificationPreferences(): Promise<any> {
    const response = await api.get('/notifications/preferences');
    return response.data.data;
  },

  // Update notification preferences
  async updateNotificationPreferences(preferences: any): Promise<any> {
    const response = await api.put('/notifications/preferences', { notifications: preferences });
    return response.data.data;
  },
};

