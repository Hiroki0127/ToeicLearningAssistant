import { render, screen, waitFor } from '@testing-library/react'
import DashboardPage from '@/app/dashboard/page'

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
const mockUseAuth = jest.fn();
const mockUseDashboard = jest.fn();

jest.mock('@/hooks/useAuth', () => ({
  useAuth: mockUseAuth,
}));

jest.mock('@/hooks/useDashboard', () => ({
  useDashboard: mockUseDashboard,
}));

// Mock useFlashcards
jest.mock('@/hooks/useFlashcards', () => ({
  useFlashcards: () => ({
    fetchUserFlashcards: jest.fn(),
    flashcards: [],
    loading: false,
  }),
}));

describe('Dashboard Page', () => {
  const mockUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
  }

  const mockDashboardData = {
    progress: {
      totalCards: 50,
      studiedToday: 10,
      currentStreak: 5,
      accuracy: 85,
      level: 'intermediate',
      experience: 2500,
      nextLevel: 'advanced',
      nextLevelXP: 15000,
      currentLevelXP: 2000,
      levelProgress: 33,
    },
    dailyGoal: {
      studied: 10,
      goal: 20,
      progress: 50,
    },
    recentActivity: [
      {
        id: 'activity-1',
        type: 'flashcard' as const,
        title: 'Flashcard Study (5 cards)',
        result: 'Good',
        score: '4/5',
        time: '2024-01-15T10:30:00Z',
      },
    ],
    quickStats: {
      totalStudyTime: 120,
      cardsMastered: 45,
      quizzesTaken: 8,
      averageScore: 82,
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render loading state', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      updateProfile: jest.fn(),
    })

    mockUseDashboard.mockReturnValue({
      dashboardData: null,
      loading: true,
      error: null,
      refetch: jest.fn(),
    })

    render(<DashboardPage />)

    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument()
  })

  it('should render dashboard with user data', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      updateProfile: jest.fn(),
    })

    mockUseDashboard.mockReturnValue({
      dashboardData: mockDashboardData,
      loading: false,
      error: null,
      refetch: jest.fn(),
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument()
      expect(screen.getByText(/Level intermediate/i)).toBeInTheDocument()
    })
  })

  it('should display progress overview correctly', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      updateProfile: jest.fn(),
    })

    mockUseDashboard.mockReturnValue({
      dashboardData: mockDashboardData,
      loading: false,
      error: null,
      refetch: jest.fn(),
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getAllByText('50').length).toBeGreaterThan(0) // Total Cards
      expect(screen.getAllByText('10').length).toBeGreaterThan(0) // Studied Today
      expect(screen.getAllByText('5').length).toBeGreaterThan(0) // Current Streak
      expect(screen.getByText('85%')).toBeInTheDocument() // Accuracy
    })
  })

  it('should display daily goal progress', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      updateProfile: jest.fn(),
    })

    mockUseDashboard.mockReturnValue({
      dashboardData: mockDashboardData,
      loading: false,
      error: null,
      refetch: jest.fn(),
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Daily Goal')).toBeInTheDocument()
      expect(screen.getByText('10/20')).toBeInTheDocument()
      expect(screen.getByText('cards studied today')).toBeInTheDocument()
    })
  })

  it('should display recent activity', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      updateProfile: jest.fn(),
    })

    mockUseDashboard.mockReturnValue({
      dashboardData: mockDashboardData,
      loading: false,
      error: null,
      refetch: jest.fn(),
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
      expect(screen.getByText(/Flashcard Study/i)).toBeInTheDocument()
      expect(screen.getByText('Good')).toBeInTheDocument()
      expect(screen.getByText('4/5')).toBeInTheDocument()
    })
  })

  it('should display quick stats', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      updateProfile: jest.fn(),
    })

    mockUseDashboard.mockReturnValue({
      dashboardData: mockDashboardData,
      loading: false,
      error: null,
      refetch: jest.fn(),
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Quick Stats')).toBeInTheDocument()
      expect(screen.getByText('Total Study Time')).toBeInTheDocument()
      expect(screen.getByText('Cards Mastered')).toBeInTheDocument()
      expect(screen.getAllByText('45').length).toBeGreaterThan(0) // Cards Mastered
      expect(screen.getByText('Quizzes Taken')).toBeInTheDocument()
      expect(screen.getAllByText('8').length).toBeGreaterThan(0) // Quizzes Taken
      expect(screen.getByText('Average Score')).toBeInTheDocument()
      expect(screen.getByText('82%')).toBeInTheDocument() // Average Score
    })
  })

  it('should handle error state', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      updateProfile: jest.fn(),
    })

    mockUseDashboard.mockReturnValue({
      dashboardData: null,
      loading: false,
      error: 'Failed to load dashboard data',
      refetch: jest.fn(),
    })

    render(<DashboardPage />)

    expect(screen.getByText(/Error loading dashboard/i)).toBeInTheDocument()
    expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument()
  })
})
