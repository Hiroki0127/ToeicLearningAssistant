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
  };
  dailyGoal: {
    studied: number;
    goal: number;
    progress: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'flashcard' | 'quiz';
    word?: string;
    title?: string;
    result?: string;
    score?: string;
    time: string;
  }>;
  quickStats: {
    totalStudyTime: number;
    cardsMastered: number;
    quizzesTaken: number;
    averageScore: number;
  };
}

export const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

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
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  return {
    dashboardData,
    loading,
    error,
    refetch: fetchDashboardStats,
  };
};
