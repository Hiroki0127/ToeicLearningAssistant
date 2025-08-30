import api from './api';
import type { Flashcard, FlashcardReview } from '@/types';

export interface CreateFlashcardData {
  word: string;
  definition: string;
  example: string;
  partOfSpeech: string;
  difficulty: string;
  category: string;
  tags: string[];
}

export interface UpdateFlashcardData extends Partial<CreateFlashcardData> {
  id: string;
}

export interface FlashcardFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  difficulty?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FlashcardResponse {
  flashcards: Flashcard[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Flashcard service functions
export const flashcardService = {
  // Get all flashcards with pagination and filters
  async getFlashcards(filters: FlashcardFilters = {}): Promise<FlashcardResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get(`/flashcards?${params.toString()}`);
    return response.data.data;
  },

  // Get a specific flashcard by ID
  async getFlashcardById(id: string): Promise<Flashcard> {
    const response = await api.get(`/flashcards/${id}`);
    return response.data.data;
  },

  // Create a new flashcard
  async createFlashcard(data: CreateFlashcardData): Promise<Flashcard> {
    const response = await api.post('/flashcards', data);
    return response.data.data;
  },

  // Update an existing flashcard
  async updateFlashcard(id: string, data: Partial<CreateFlashcardData>): Promise<Flashcard> {
    const response = await api.put(`/flashcards/${id}`, data);
    return response.data.data;
  },

  // Delete a flashcard
  async deleteFlashcard(id: string): Promise<void> {
    await api.delete(`/flashcards/${id}`);
  },

  // Review a flashcard (mark as correct/incorrect)
  async reviewFlashcard(data: {
    flashcardId: string;
    isCorrect: boolean;
    responseTime: number;
  }): Promise<FlashcardReview> {
    const response = await api.post('/flashcards/review', data);
    return response.data.data;
  },

  // Get user's flashcards
  async getUserFlashcards(page: number = 1, limit: number = 10): Promise<FlashcardResponse> {
    const response = await api.get(`/flashcards/user/me?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  // Get flashcards by category
  async getFlashcardsByCategory(category: string, page: number = 1, limit: number = 10): Promise<FlashcardResponse> {
    return this.getFlashcards({ category, page, limit });
  },

  // Get flashcards by difficulty
  async getFlashcardsByDifficulty(difficulty: string, page: number = 1, limit: number = 10): Promise<FlashcardResponse> {
    return this.getFlashcards({ difficulty, page, limit });
  },

  // Search flashcards
  async searchFlashcards(searchTerm: string, page: number = 1, limit: number = 10): Promise<FlashcardResponse> {
    return this.getFlashcards({ search: searchTerm, page, limit });
  },
};
