import { useState, useEffect } from 'react';

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

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard stats: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch dashboard stats');
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return {
    dashboardData,
    loading,
    error,
    refetch: fetchDashboardStats,
  };
};
