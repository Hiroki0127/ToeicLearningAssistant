import { render, screen, waitFor } from '@testing-library/react'
import { useAuth } from '@/hooks/useAuth'
import { useDashboard } from '@/hooks/useDashboard'
import DashboardPage from '@/app/dashboard/page'

// Mock the hooks
jest.mock('@/hooks/useAuth')
jest.mock('@/hooks/useDashboard')

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseDashboard = useDashboard as jest.MockedFunction<typeof useDashboard>

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
      loading: true,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
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
      expect(screen.getByText('Welcome back, Test User!')).toBeInTheDocument()
      expect(screen.getByText('Level intermediate')).toBeInTheDocument()
      expect(screen.getByText('2500 XP • 33% to advanced')).toBeInTheDocument()
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
    })

    mockUseDashboard.mockReturnValue({
      dashboardData: mockDashboardData,
      loading: false,
      error: null,
      refetch: jest.fn(),
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('50')).toBeInTheDocument() // Total Cards
      expect(screen.getByText('10')).toBeInTheDocument() // Studied Today
      expect(screen.getByText('5')).toBeInTheDocument() // Current Streak
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
      expect(screen.getByText('10/20 cards studied today')).toBeInTheDocument()
      expect(screen.getByText('50%')).toBeInTheDocument() // Progress percentage
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
      expect(screen.getByText('Flashcard Study (5 cards)')).toBeInTheDocument()
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
      expect(screen.getByText('120')).toBeInTheDocument() // Total Study Time
      expect(screen.getByText('45')).toBeInTheDocument() // Cards Mastered
      expect(screen.getByText('8')).toBeInTheDocument() // Quizzes Taken
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
    })

    mockUseDashboard.mockReturnValue({
      dashboardData: null,
      loading: false,
      error: 'Failed to load dashboard data',
      refetch: jest.fn(),
    })

    render(<DashboardPage />)

    expect(screen.getByText('Error loading dashboard')).toBeInTheDocument()
    expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument()
  })
})
