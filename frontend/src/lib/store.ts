import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Flashcard, UserProgress, StudySession, Quiz } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

interface FlashcardState {
  flashcards: Flashcard[];
  currentCardIndex: number;
  isFlipped: boolean;
  setFlashcards: (cards: Flashcard[]) => void;
  addFlashcard: (card: Flashcard) => void;
  updateFlashcard: (id: string, updates: Partial<Flashcard>) => void;
  deleteFlashcard: (id: string) => void;
  nextCard: () => void;
  previousCard: () => void;
  flipCard: () => void;
  resetSession: () => void;
}

interface ProgressState {
  progress: UserProgress | null;
  dailyProgress: any[];
  studySessions: StudySession[];
  setProgress: (progress: UserProgress) => void;
  updateProgress: (updates: Partial<UserProgress>) => void;
  addStudySession: (session: StudySession) => void;
  updateDailyProgress: (progress: any) => void;
}

interface QuizState {
  currentQuiz: Quiz | null;
  quizHistory: any[];
  isQuizActive: boolean;
  currentQuestionIndex: number;
  answers: Record<string, any>;
  setCurrentQuiz: (quiz: Quiz) => void;
  startQuiz: (quiz: Quiz) => void;
  endQuiz: () => void;
  answerQuestion: (questionId: string, answer: any) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  addQuizToHistory: (attempt: any) => void;
}

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: any[];
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: any) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

type AppState = AuthState & FlashcardState & ProgressState & QuizState & UIState;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: (user: User) =>
        set({ user, isAuthenticated: true, isLoading: false }),
      logout: () =>
        set({ user: null, isAuthenticated: false, isLoading: false }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),

      // Flashcard State
      flashcards: [],
      currentCardIndex: 0,
      isFlipped: false,
      setFlashcards: (cards: Flashcard[]) => set({ flashcards: cards }),
      addFlashcard: (card: Flashcard) =>
        set((state) => ({ flashcards: [...state.flashcards, card] })),
      updateFlashcard: (id: string, updates: Partial<Flashcard>) =>
        set((state) => ({
          flashcards: state.flashcards.map((card) =>
            card.id === id ? { ...card, ...updates } : card
          ),
        })),
      deleteFlashcard: (id: string) =>
        set((state) => ({
          flashcards: state.flashcards.filter((card) => card.id !== id),
        })),
      nextCard: () =>
        set((state) => ({
          currentCardIndex: Math.min(
            state.currentCardIndex + 1,
            state.flashcards.length - 1
          ),
          isFlipped: false,
        })),
      previousCard: () =>
        set((state) => ({
          currentCardIndex: Math.max(state.currentCardIndex - 1, 0),
          isFlipped: false,
        })),
      flipCard: () => set((state) => ({ isFlipped: !state.isFlipped })),
      resetSession: () =>
        set({ currentCardIndex: 0, isFlipped: false }),

      // Progress State
      progress: null,
      dailyProgress: [],
      studySessions: [],
      setProgress: (progress: UserProgress) => set({ progress }),
      updateProgress: (updates: Partial<UserProgress>) =>
        set((state) => ({
          progress: state.progress ? { ...state.progress, ...updates } : null,
        })),
      addStudySession: (session: StudySession) =>
        set((state) => ({
          studySessions: [...state.studySessions, session],
        })),
      updateDailyProgress: (progress: any) =>
        set((state) => ({
          dailyProgress: [...state.dailyProgress, progress],
        })),

      // Quiz State
      currentQuiz: null,
      quizHistory: [],
      isQuizActive: false,
      currentQuestionIndex: 0,
      answers: {},
      setCurrentQuiz: (quiz: Quiz) => set({ currentQuiz: quiz }),
      startQuiz: (quiz: Quiz) =>
        set({
          currentQuiz: quiz,
          isQuizActive: true,
          currentQuestionIndex: 0,
          answers: {},
        }),
      endQuiz: () =>
        set({
          isQuizActive: false,
          currentQuestionIndex: 0,
          answers: {},
        }),
      answerQuestion: (questionId: string, answer: any) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: answer },
        })),
      nextQuestion: () =>
        set((state) => ({
          currentQuestionIndex: Math.min(
            state.currentQuestionIndex + 1,
            (state.currentQuiz?.questions.length || 1) - 1
          ),
        })),
      previousQuestion: () =>
        set((state) => ({
          currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
        })),
      addQuizToHistory: (attempt: any) =>
        set((state) => ({
          quizHistory: [...state.quizHistory, attempt],
        })),

      // UI State
      sidebarOpen: false,
      theme: 'light',
      notifications: [],
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme: 'light' | 'dark') => set({ theme }),
      addNotification: (notification: any) =>
        set((state) => ({
          notifications: [...state.notifications, notification],
        })),
      removeNotification: (id: string) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'toeic-app-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        progress: state.progress,
        theme: state.theme,
        quizHistory: state.quizHistory,
      }),
    }
  )
);
