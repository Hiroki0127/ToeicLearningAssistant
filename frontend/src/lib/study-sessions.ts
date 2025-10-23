import api from './api';

export interface StudySession {
  id: string;
  userId: string;
  sessionType: 'flashcards' | 'quiz' | 'mixed';
  startTime: string;
  endTime: string;
  cardsStudied: number;
  correctAnswers: number;
  incorrectAnswers: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudySessionData {
  sessionType: 'flashcards' | 'quiz' | 'mixed';
  startTime: string;
  endTime: string;
  cardsStudied: number;
  correctAnswers: number;
  incorrectAnswers: number;
}

export interface StudySessionResponse {
  sessions: StudySession[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Study session service functions
export const studySessionService = {
  // Create a new study session
  async createStudySession(data: CreateStudySessionData): Promise<StudySession> {
    const response = await api.post('/study-sessions', data);
    return response.data.data;
  },

  // Get study sessions with pagination and filtering
  async getStudySessions(page: number = 1, limit: number = 10, type?: string): Promise<StudySessionResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (type) params.append('type', type);

    const response = await api.get(`/study-sessions?${params.toString()}`);
    return response.data.data;
  },

  // Get a specific study session by ID
  async getStudySessionById(id: string): Promise<StudySession> {
    const response = await api.get(`/study-sessions/${id}`);
    return response.data.data;
  },
};
