import { z } from 'zod';

// User validation schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one lowercase letter, one uppercase letter, and one number'
  ),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  preferences: z.object({
    dailyGoal: z.number().min(1).max(100).optional(),
    notificationTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    focusAreas: z.array(z.string()).optional(),
  }).optional(),
});

// Flashcard validation schemas
export const createFlashcardSchema = z.object({
  word: z.string().min(1, 'Word is required').max(100, 'Word must be less than 100 characters'),
  definition: z.string().min(1, 'Definition is required').max(500, 'Definition must be less than 500 characters'),
  example: z.string().min(1, 'Example is required').max(300, 'Example must be less than 300 characters'),
  partOfSpeech: z.enum(['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'interjection']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

export const updateFlashcardSchema = createFlashcardSchema.partial().extend({
  id: z.string().uuid('Invalid flashcard ID'),
});

export const flashcardReviewSchema = z.object({
  flashcardId: z.string().uuid('Invalid flashcard ID'),
  isCorrect: z.boolean(),
  responseTime: z.number().min(0, 'Response time must be positive'),
});

// Quiz validation schemas
export const createQuizSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(300, 'Description must be less than 300 characters'),
  type: z.enum(['vocabulary', 'grammar', 'reading', 'listening', 'mixed']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  timeLimit: z.number().min(60).max(7200).optional(), // 1-120 minutes (in seconds)
  questions: z.array(z.object({
    type: z.enum(['multiple-choice', 'fill-in-blank', 'true-false']),
    question: z.string().min(1, 'Question is required').max(500, 'Question must be less than 500 characters'),
    options: z.array(z.string()).optional(),
    correctAnswer: z.union([z.string(), z.array(z.string())]),
    explanation: z.string().max(300).optional(),
    points: z.number().min(1).max(10, 'Points must be between 1 and 10'),
  })).min(1, 'At least one question is required').max(50, 'Maximum 50 questions allowed'),
});

export const quizAttemptSchema = z.object({
  quizId: z.string().uuid('Invalid quiz ID'),
  answers: z.array(z.object({
    questionId: z.string().uuid('Invalid question ID'),
    userAnswer: z.union([z.string(), z.array(z.string())]),
    timeSpent: z.number().min(0, 'Time spent must be positive'),
  })),
});

export const submitQuizResultSchema = z.object({
  quizId: z.string().min(1, 'Quiz ID is required'),
  score: z.number().min(0).max(100, 'Score must be between 0 and 100'),
  totalQuestions: z.number().min(1, 'Total questions must be at least 1'),
  correctAnswers: z.number().min(0, 'Correct answers must be non-negative'),
  timeSpent: z.number().min(0, 'Time spent must be non-negative'),
  answers: z.record(z.string(), z.string()),
});

// Progress validation schemas
export const updateProgressSchema = z.object({
  cardsStudied: z.number().min(0, 'Cards studied must be positive'),
  correctAnswers: z.number().min(0, 'Correct answers must be positive'),
  incorrectAnswers: z.number().min(0, 'Incorrect answers must be positive'),
  studyTime: z.number().min(0, 'Study time must be positive'),
});

// Pagination validation
export const paginationSchema = z.object({
  page: z.number().min(1, 'Page must be at least 1').default(1),
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit must be at most 100').default(10),
  search: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'word', 'difficulty']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Study session validation
export const createStudySessionSchema = z.object({
  sessionType: z.enum(['flashcards', 'quiz', 'mixed']),
  startTime: z.date(),
});

export const endStudySessionSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  endTime: z.date(),
  cardsStudied: z.number().min(0),
  correctAnswers: z.number().min(0),
  incorrectAnswers: z.number().min(0),
});

export const studySessionInputSchema = z.object({
  sessionType: z.enum(['flashcards', 'quiz', 'mixed']),
  startTime: z.string().transform((str) => new Date(str)),
  endTime: z.string().transform((str) => new Date(str)),
  cardsStudied: z.number().min(0),
  correctAnswers: z.number().min(0),
  incorrectAnswers: z.number().min(0),
});

// Notification validation
export const createNotificationSchema = z.object({
  type: z.enum(['reminder', 'achievement', 'streak', 'system']),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  message: z.string().min(1, 'Message is required').max(500, 'Message must be less than 500 characters'),
  actionUrl: z.string().url('Invalid URL').optional(),
});

// AI question validation
export const aiQuestionSchema = z.object({
  question: z.string().min(1, 'Question is required').max(500, 'Question must be less than 500 characters'),
  category: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

// Export types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateFlashcardInput = z.infer<typeof createFlashcardSchema>;
export type UpdateFlashcardInput = z.infer<typeof updateFlashcardSchema>;
export type FlashcardReviewInput = z.infer<typeof flashcardReviewSchema>;
export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type QuizAttemptInput = z.infer<typeof quizAttemptSchema>;
export type SubmitQuizResultInput = z.infer<typeof submitQuizResultSchema>;
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type CreateStudySessionInput = z.infer<typeof createStudySessionSchema>;
export type EndStudySessionInput = z.infer<typeof endStudySessionSchema>;
export type StudySessionInput = z.infer<typeof studySessionInputSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type AIQuestionInput = z.infer<typeof aiQuestionSchema>;

// Export validation schemas for use in routes
export const quizValidationSchemas = {
  createQuiz: createQuizSchema,
  submitQuizResult: submitQuizResultSchema,
};
