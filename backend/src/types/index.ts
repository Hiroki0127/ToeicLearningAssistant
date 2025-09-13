// User types
export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  dailyGoal: number;
  notificationTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focusAreas: string[];
}

// Flashcard types
export interface Flashcard {
  id: string;
  word: string;
  definition: string;
  example: string;
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'conjunction' | 'interjection';
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

export interface FlashcardReview {
  id: string;
  flashcardId: string;
  userId: string;
  isCorrect: boolean;
  responseTime: number;
  reviewedAt: Date;
}

// Quiz types
export interface Quiz {
  id: string;
  title: string;
  description: string;
  type: 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'mixed';
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
  questions: QuizQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'fill-in-blank' | 'true-false';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: Date;
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  questionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  timeSpent: number;
}

// Progress types
export interface UserProgress {
  userId: string;
  totalCardsStudied: number;
  totalCorrectAnswers: number;
  totalIncorrectAnswers: number;
  currentStreak: number;
  longestStreak: number;
  totalStudyTime: number;
  lastStudyDate: Date;
  level: 'beginner' | 'intermediate' | 'advanced';
  experience: number;
}

export interface DailyProgress {
  id: string;
  userId: string;
  date: Date;
  cardsStudied: number;
  correctAnswers: number;
  incorrectAnswers: number;
  studyTime: number;
  streak: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Study Session types
export interface StudySession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  cardsStudied: number;
  correctAnswers: number;
  incorrectAnswers: number;
  sessionType: 'flashcards' | 'quiz' | 'mixed';
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: 'reminder' | 'achievement' | 'streak' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

// Request/Response types for API endpoints
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface CreateFlashcardRequest {
  word: string;
  definition: string;
  example: string;
  partOfSpeech: string;
  difficulty: string;
}

export interface UpdateFlashcardRequest extends Partial<CreateFlashcardRequest> {
  id: string;
}

export interface CreateQuizRequest {
  title: string;
  description: string;
  type: string;
  difficulty: string;
  timeLimit?: number;
  questions: Omit<QuizQuestion, 'id'>[];
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

// Database types (for Prisma)
export interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  preferences: any;
}

export interface DatabaseFlashcard {
  id: string;
  word: string;
  definition: string;
  example: string;
  partOfSpeech: string;
  difficulty: string;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}
