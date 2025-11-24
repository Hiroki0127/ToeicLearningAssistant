import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '@/app/dashboard/page';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock the hooks
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: '1', email: 'test@example.com', name: 'Test User' },
    login: jest.fn(),
    logout: jest.fn(),
    loading: false,
    updateProfile: jest.fn(),
  }),
}));

// Mock useFlashcards
jest.mock('@/hooks/useFlashcards', () => ({
  useFlashcards: () => ({
    fetchUserFlashcards: jest.fn(),
    flashcards: [],
    loading: false,
  }),
}));

// Mock API
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@/hooks/useDashboard', () => {
  const mockUseDashboard = jest.fn(() => ({
    dashboardData: {
      progress: {
        totalCards: 100,
        studiedToday: 10,
        currentStreak: 5,
        accuracy: 85,
        level: 'intermediate',
        experience: 2500,
        nextLevel: 'advanced',
        nextLevelXP: 5000,
        levelProgress: 50,
      },
      dailyGoal: {
        studied: 10,
        goal: 20,
        progress: 50,
      },
      quickStats: {
        totalStudyTime: 100,
        cardsMastered: 100,
        quizzesTaken: 5,
        averageScore: 75,
      },
      recentActivity: [
        { 
          id: 'a1', 
          type: 'quiz', 
          title: 'Sample Quiz 1', 
          score: '80/100',
          time: '2025-10-27T10:00:00Z',
        },
        { 
          id: 'a2', 
          type: 'flashcard', 
          title: 'TOEIC Vocabulary Set', 
          score: '15/20',
          time: '2025-10-26T15:30:00Z',
        },
      ],
    },
    loading: false,
    error: null,
    refetch: jest.fn(),
  }));
  
  return {
    useDashboard: mockUseDashboard,
  };
});

// Get reference to the mock for use in tests
const { useDashboard: mockUseDashboard } = require('@/hooks/useDashboard');

describe('Dashboard - Simple Tests', () => {
  it('renders dashboard content when authenticated', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
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
    // The text is split: "10/20" in one element, "cards studied today" in another
    expect(screen.getByText('10/20')).toBeInTheDocument();
    expect(screen.getByText('cards studied today')).toBeInTheDocument();
  });

  it('displays quick stats', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Quick Stats')).toBeInTheDocument();
    // Check for the actual text format - use getAllByText for numbers that appear multiple times
    expect(screen.getByText('Total Study Time')).toBeInTheDocument();
    expect(screen.getByText('Cards Mastered')).toBeInTheDocument();
    expect(screen.getAllByText('100').length).toBeGreaterThan(0); // Appears in multiple places
    expect(screen.getByText('Quizzes Taken')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Quizzes count
    expect(screen.getByText('Average Score')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument(); // Average score
  });

  it('displays recent activity', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText(/Sample Quiz/i)).toBeInTheDocument();
    expect(screen.getByText(/TOEIC Vocabulary/i)).toBeInTheDocument();
  });

  it('renders loading state', () => {
    mockUseDashboard.mockReturnValueOnce({
      dashboardData: null,
      loading: true,
      error: null,
      refetch: jest.fn(),
    });

    render(<Dashboard />);
    
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseDashboard.mockReturnValueOnce({
      dashboardData: null,
      loading: false,
      error: 'Failed to load dashboard data',
      refetch: jest.fn(),
    });

    render(<Dashboard />);
    
    expect(screen.getByText(/Error loading dashboard/i)).toBeInTheDocument();
  });
});
