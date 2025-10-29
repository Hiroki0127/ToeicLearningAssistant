import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '@/app/dashboard/page';

// Mock the hooks
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: '1', email: 'test@example.com', username: 'testuser' },
    login: jest.fn(),
    logout: jest.fn(),
    loading: false,
  }),
}));

jest.mock('@/hooks/useDashboard', () => ({
  useDashboard: () => ({
    progress: {
      totalCards: 100,
      cardsStudiedToday: 10,
      currentStreak: 5,
      accuracy: 85,
      level: 'intermediate',
      experience: 2500,
      nextLevel: 'advanced',
      nextLevelXP: 5000,
      levelProgress: 50,
    },
    dailyGoal: 20,
    quickStats: {
      totalFlashcards: 100,
      quizzesTaken: 5,
      averageQuizScore: 75,
    },
    recentActivity: [
      { 
        id: 'a1', 
        type: 'quiz', 
        title: 'Sample Quiz 1', 
        score: 80, 
        completedAt: '2025-10-27T10:00:00Z',
        date: 'Oct 27, 2025',
        timeOnly: '10:00:00 AM'
      },
      { 
        id: 'a2', 
        type: 'flashcard', 
        title: 'TOEIC Vocabulary Set', 
        correctCount: 15, 
        incorrectCount: 5, 
        completedAt: '2025-10-26T15:30:00Z',
        date: 'Oct 26, 2025',
        timeOnly: '3:30:00 PM'
      },
    ],
    loading: false,
    error: null,
  }),
}));

describe('Dashboard - Simple Tests', () => {
  it('renders dashboard content when authenticated', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome back, testuser!')).toBeInTheDocument();
    expect(screen.getByText('Study Flashcards')).toBeInTheDocument();
    expect(screen.getByText('Take Quiz')).toBeInTheDocument();
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
  });

  it('displays user level and progress', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Level intermediate')).toBeInTheDocument();
    expect(screen.getByText('2500 XP • 50% to advanced')).toBeInTheDocument();
  });

  it('displays daily goal progress', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Daily Goal')).toBeInTheDocument();
    expect(screen.getByText('10/20 cards studied today')).toBeInTheDocument();
  });

  it('displays quick stats', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Quick Stats')).toBeInTheDocument();
    expect(screen.getByText('100 Total Flashcards')).toBeInTheDocument();
    expect(screen.getByText('5 Quizzes Taken')).toBeInTheDocument();
    expect(screen.getByText('75% Average Quiz Score')).toBeInTheDocument();
  });

  it('displays recent activity', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('Sample Quiz 1')).toBeInTheDocument();
    expect(screen.getByText('TOEIC Vocabulary Set')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    const { useDashboard } = require('@/hooks/useDashboard');
    useDashboard.mockReturnValue({
      progress: {},
      dailyGoal: 20,
      quickStats: {},
      recentActivity: [],
      loading: true,
      error: null,
    });

    render(<Dashboard />);
    
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    const { useDashboard } = require('@/hooks/useDashboard');
    useDashboard.mockReturnValue({
      progress: {},
      dailyGoal: 20,
      quickStats: {},
      recentActivity: [],
      loading: false,
      error: 'Failed to load dashboard data',
    });

    render(<Dashboard />);
    
    expect(screen.getByText('Error loading dashboard: Failed to load dashboard data')).toBeInTheDocument();
  });
});
