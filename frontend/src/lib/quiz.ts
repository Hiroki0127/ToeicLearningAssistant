import api from './api';

export interface Quiz {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  timeLimit: number;
  questions: Question[];
}

export interface Question {
  id: string;
  type: 'multiple-choice';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

export interface QuizResult {
  quizId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  answers: Record<string, string>;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  answers: string;
  completedAt: string;
  quiz: {
    id: string;
    title: string;
    type: string;
    difficulty: string;
  };
}

export interface QuizStats {
  totalQuizzes: number;
  averageScore: number;
  bestScore: number;
  quizTypesCount: number;
  totalExperience?: number;
  quizzesByDifficulty?: {
    easy: number;
    medium: number;
    hard: number;
  };
  quizzesByCategory?: {
    vocabulary: number;
    grammar: number;
    reading: number;
    listening: number;
  };
  recentPerformance?: Array<{
    quizTitle: string;
    score: number;
    completedAt: string;
  }>;
}

// Get all quizzes
export const getQuizzes = async (params?: {
  type?: string;
  difficulty?: string;
  limit?: number;
  offset?: number;
}): Promise<Quiz[]> => {
  const response = await api.get('/quiz', { params });
  return response.data.data;
};

// Get quiz by ID
export const getQuizById = async (id: string): Promise<Quiz> => {
  const response = await api.get(`/quiz/${id}`);
  return response.data.data;
};

// Create a new quiz
export const createQuiz = async (quizData: {
  title: string;
  description: string;
  type: string;
  difficulty: string;
  timeLimit?: number;
  questions: Question[];
}): Promise<Quiz> => {
  const response = await api.post('/quiz', quizData);
  return response.data.data;
};

// Update an existing quiz
export const updateQuiz = async (id: string, quizData: {
  title: string;
  description: string;
  type: string;
  difficulty: string;
  timeLimit?: number;
  questions: Question[];
}): Promise<Quiz> => {
  const response = await api.put(`/quiz/${id}`, quizData);
  return response.data.data;
};

// Delete a quiz
export const deleteQuiz = async (id: string): Promise<void> => {
  await api.delete(`/quiz/${id}`);
};

// Submit quiz result
export const submitQuizResult = async (result: QuizResult): Promise<{
  quizAttempt: QuizAttempt;
  experienceGained: number;
}> => {
  const response = await api.post('/quiz/submit', result);
  return response.data.data;
};

// Get quiz history
export const getQuizHistory = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<QuizAttempt[]> => {
  const response = await api.get('/quiz/history', { params });
  return response.data.data;
};

// Get quiz statistics
export const getQuizStats = async (): Promise<QuizStats> => {
  const response = await api.get('/quiz/stats');
  return response.data.data;
};
