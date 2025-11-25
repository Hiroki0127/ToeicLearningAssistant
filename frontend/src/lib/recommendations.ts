import api from './api';
import type { Flashcard } from '@/types';

export interface Recommendation {
  flashcard: Flashcard;
  type: 'weak_area' | 'spaced_repetition' | 'knowledge_graph' | 'related_concept';
  score: number;
  priority: 'high' | 'medium' | 'low';
  reason?: string;
}

export interface RecommendationsResponse {
  recommendations: Recommendation[];
  reasons: string[];
  totalFound: number;
  userStats?: {
    totalFlashcards: number;
    studiedToday: number;
    currentStreak: number;
    weakAreas: number;
  };
  dailyMessage?: string;
  focus?: string;
}

export interface RecommendationsFilters {
  limit?: number;
  includeReasons?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard' | 'all';
}

// Recommendations service functions
export const recommendationsService = {
  // Get personalized recommendations
  async getRecommendations(filters: RecommendationsFilters = {}): Promise<RecommendationsResponse> {
    const params = new URLSearchParams();
    
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.includeReasons !== undefined) params.append('includeReasons', filters.includeReasons.toString());
    if (filters.difficulty) params.append('difficulty', filters.difficulty);

    const response = await api.get(`/recommendations?${params.toString()}`);
    return response.data.data;
  },

  // Get daily study recommendations
  async getDailyRecommendations(): Promise<RecommendationsResponse> {
    const response = await api.get('/recommendations/daily');
    return response.data.data;
  },

  // Get weak area recommendations
  async getWeakAreaRecommendations(): Promise<RecommendationsResponse> {
    const response = await api.get('/recommendations/weak-areas');
    return response.data.data;
  },

  // Get related concept recommendations
  async getRelatedRecommendations(): Promise<RecommendationsResponse> {
    const response = await api.get('/recommendations/related');
    return response.data.data;
  },
};

