import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useAuth } from '@/hooks/useAuth'
import { useFlashcards } from '@/hooks/useFlashcards'
import FlashcardsPage from '@/app/flashcards/page'

// Mock the hooks
jest.mock('@/hooks/useAuth')
jest.mock('@/hooks/useFlashcards')

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseFlashcards = useFlashcards as jest.MockedFunction<typeof useFlashcards>

describe('Flashcard Integration Tests', () => {
  const mockUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
  }

  const mockFlashcards = [
    {
      id: 'card-1',
      word: 'allocate',
      definition: 'to distribute or assign resources for a specific purpose',
      example: 'The company decided to allocate more funds to its marketing department.',
      partOfSpeech: 'verb',
      difficulty: 'medium',
    },
    {
      id: 'card-2',
      word: 'contingency',
      definition: 'a possible future event that must be prepared for',
      example: 'The team created a contingency plan in case the project was delayed.',
      partOfSpeech: 'noun',
      difficulty: 'hard',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should display flashcards and allow navigation', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    })

    mockUseFlashcards.mockReturnValue({
      flashcards: mockFlashcards,
      loading: false,
      error: null,
      fetchFlashcards: jest.fn(),
      fetchUserFlashcards: jest.fn(),
      createFlashcard: jest.fn(),
      updateFlashcard: jest.fn(),
      deleteFlashcard: jest.fn(),
      getFlashcardById: jest.fn(),
    })

    render(<FlashcardsPage />)

    await waitFor(() => {
      expect(screen.getByText('allocate')).toBeInTheDocument()
      expect(screen.getByText('to distribute or assign resources for a specific purpose')).toBeInTheDocument()
    })

    // Test navigation to next card
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('contingency')).toBeInTheDocument()
      expect(screen.getByText('a possible future event that must be prepared for')).toBeInTheDocument()
    })
  })

  it('should handle correct answer', async () => {
    const user = userEvent.setup()

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    })

    mockUseFlashcards.mockReturnValue({
      flashcards: mockFlashcards,
      loading: false,
      error: null,
      fetchFlashcards: jest.fn(),
      fetchUserFlashcards: jest.fn(),
      createFlashcard: jest.fn(),
      updateFlashcard: jest.fn(),
      deleteFlashcard: jest.fn(),
      getFlashcardById: jest.fn(),
    })

    render(<FlashcardsPage />)

    await waitFor(() => {
      expect(screen.getByText('allocate')).toBeInTheDocument()
    })

    const correctButton = screen.getByText('Correct')
    await user.click(correctButton)

    // Should move to next card or show completion
    await waitFor(() => {
      expect(screen.getByText('contingency')).toBeInTheDocument()
    })
  })

  it('should handle incorrect answer', async () => {
    const user = userEvent.setup()

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    })

    mockUseFlashcards.mockReturnValue({
      flashcards: mockFlashcards,
      loading: false,
      error: null,
      fetchFlashcards: jest.fn(),
      fetchUserFlashcards: jest.fn(),
      createFlashcard: jest.fn(),
      updateFlashcard: jest.fn(),
      deleteFlashcard: jest.fn(),
      getFlashcardById: jest.fn(),
    })

    render(<FlashcardsPage />)

    await waitFor(() => {
      expect(screen.getByText('allocate')).toBeInTheDocument()
    })

    const incorrectButton = screen.getByText('Incorrect')
    await user.click(incorrectButton)

    // Should move to next card or show completion
    await waitFor(() => {
      expect(screen.getByText('contingency')).toBeInTheDocument()
    })
  })

  it('should show completion screen after last card', async () => {
    const user = userEvent.setup()

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    })

    mockUseFlashcards.mockReturnValue({
      flashcards: [mockFlashcards[0]], // Only one card
      loading: false,
      error: null,
      fetchFlashcards: jest.fn(),
      fetchUserFlashcards: jest.fn(),
      createFlashcard: jest.fn(),
      updateFlashcard: jest.fn(),
      deleteFlashcard: jest.fn(),
      getFlashcardById: jest.fn(),
    })

    render(<FlashcardsPage />)

    await waitFor(() => {
      expect(screen.getByText('allocate')).toBeInTheDocument()
    })

    const correctButton = screen.getByText('Correct')
    await user.click(correctButton)

    // Should show completion screen
    await waitFor(() => {
      expect(screen.getByText(/study session complete/i)).toBeInTheDocument()
    })
  })

  it('should display loading state', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    })

    mockUseFlashcards.mockReturnValue({
      flashcards: [],
      loading: true,
      error: null,
      fetchFlashcards: jest.fn(),
      fetchUserFlashcards: jest.fn(),
      createFlashcard: jest.fn(),
      updateFlashcard: jest.fn(),
      deleteFlashcard: jest.fn(),
      getFlashcardById: jest.fn(),
    })

    render(<FlashcardsPage />)

    expect(screen.getByText('Loading flashcards...')).toBeInTheDocument()
  })

  it('should display error state', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    })

    mockUseFlashcards.mockReturnValue({
      flashcards: [],
      loading: false,
      error: 'Failed to load flashcards',
      fetchFlashcards: jest.fn(),
      fetchUserFlashcards: jest.fn(),
      createFlashcard: jest.fn(),
      updateFlashcard: jest.fn(),
      deleteFlashcard: jest.fn(),
      getFlashcardById: jest.fn(),
    })

    render(<FlashcardsPage />)

    expect(screen.getByText('Error loading flashcards')).toBeInTheDocument()
    expect(screen.getByText('Failed to load flashcards')).toBeInTheDocument()
  })
})
