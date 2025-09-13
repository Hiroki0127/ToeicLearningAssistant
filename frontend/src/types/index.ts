// User types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  dailyGoal: number; // number of cards to study per day
  notificationTime: string; // HH:MM format
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focusAreas: string[]; // ['vocabulary', 'grammar', 'reading', 'listening']
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
  userId?: string; // for user-created cards
}

export interface FlashcardReview {
  id: string;
  flashcardId: string;
  userId: string;
  isCorrect: boolean;
  responseTime: number; // in milliseconds
  reviewedAt: Date;
}

// Quiz types
export interface Quiz {
  id: string;
  title: string;
  description: string;
  type: 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'mixed';
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number; // in minutes
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
  timeSpent: number; // in seconds
  completedAt: Date;
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  questionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  timeSpent: number; // in seconds
}

// Progress types
export interface UserProgress {
  userId: string;
  totalCardsStudied: number;
  totalCorrectAnswers: number;
  totalIncorrectAnswers: number;
  currentStreak: number;
  longestStreak: number;
  totalStudyTime: number; // in minutes
  lastStudyDate: Date;
  level: 'beginner' | 'intermediate' | 'advanced';
  experience: number; // XP points
}

export interface DailyProgress {
  id: string;
  userId: string;
  date: Date;
  cardsStudied: number;
  correctAnswers: number;
  incorrectAnswers: number;
  studyTime: number; // in minutes
  streak: number;
}

// AI/Knowledge Graph types
export interface RelatedConcept {
  id: string;
  type: 'word' | 'grammar-rule' | 'topic';
  title: string;
  description: string;
  relationship: 'synonym' | 'antonym' | 'related' | 'part-of' | 'example-of';
  strength: number; // 0-1, how strong the relationship is
}

export interface AIQuestion {
  id: string;
  question: string;
  answer: string;
  explanation: string;
  relatedConcepts: RelatedConcept[];
  difficulty: 'easy' | 'medium' | 'hard';
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
  duration?: number; // in minutes
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
