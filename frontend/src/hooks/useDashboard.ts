import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface DashboardStats {
  progress: {
    totalCards: number;
    studiedToday: number;
    currentStreak: number;
    accuracy: number;
    level: string;
    experience: number;
    nextLevel: string;
    nextLevelXP: number;
    currentLevelXP: number;
    levelProgress: number;
  };
  dailyGoal: {
    studied: number;
    goal: number;
    progress: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'flashcard' | 'quiz';
    title: string;
    result: string;
    score: string;
    time: string; // ISO string from backend
  }>;
  quickStats: {
    totalStudyTime: number;
    cardsMastered: number;
    quizzesTaken: number;
    averageScore: number;
  };
}

export const useDashboard = (isAuthenticated: boolean = false) => {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = useCallback(async () => {
    console.log('useDashboard: fetchDashboardStats called, isAuthenticated:', isAuthenticated);
    if (!isAuthenticated) {
      console.log('useDashboard: Not authenticated, skipping fetch');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('useDashboard: Fetching dashboard stats...');

      const response = await api.get('/dashboard/stats');
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch dashboard stats');
      }
    } catch (err: unknown) {
      console.error('Error fetching dashboard stats:', err);
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError(error.response?.data?.message || error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardStats();
    }
  }, [isAuthenticated, fetchDashboardStats]);

  return {
    dashboardData,
    loading,
    error,
    refetch: fetchDashboardStats,
  };
};
