import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { flashcardService } from '@/lib/flashcards';
import type { Flashcard, FlashcardFilters, FlashcardResponse } from '@/lib/flashcards';

export const useFlashcards = () => {
  const { flashcards, setFlashcards, addFlashcard, updateFlashcard, deleteFlashcard } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchFlashcards = async (filters: FlashcardFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response: FlashcardResponse = await flashcardService.getFlashcards(filters);
      setFlashcards(response.flashcards);
      setPagination(response.pagination);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch flashcards';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserFlashcards = async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response: FlashcardResponse = await flashcardService.getUserFlashcards(page, limit);
      setFlashcards(response.flashcards);
      setPagination(response.pagination);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch user flashcards';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createFlashcard = async (data: {
    word: string;
    definition: string;
    example: string;
    partOfSpeech: string;
    difficulty: string;
    category: string;
    tags: string[];
  }) => {
    try {
      setLoading(true);
      setError(null);
      const newFlashcard = await flashcardService.createFlashcard(data);
      addFlashcard(newFlashcard);
      return newFlashcard;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create flashcard';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateFlashcardById = async (id: string, data: Partial<Flashcard>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedFlashcard = await flashcardService.updateFlashcard(id, data);
      updateFlashcard(id, updatedFlashcard);
      return updatedFlashcard;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update flashcard';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteFlashcardById = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await flashcardService.deleteFlashcard(id);
      deleteFlashcard(id);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete flashcard';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const reviewFlashcard = async (flashcardId: string, isCorrect: boolean, responseTime: number) => {
    try {
      setError(null);
      const review = await flashcardService.reviewFlashcard({
        flashcardId,
        isCorrect,
        responseTime,
      });
      return review;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to review flashcard';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const searchFlashcards = async (searchTerm: string, page: number = 1) => {
    return fetchFlashcards({ search: searchTerm, page, limit: 10 });
  };

  const getFlashcardsByCategory = async (category: string, page: number = 1) => {
    return fetchFlashcards({ category, page, limit: 10 });
  };

  const getFlashcardsByDifficulty = async (difficulty: string, page: number = 1) => {
    return fetchFlashcards({ difficulty, page, limit: 10 });
  };

  const clearError = () => {
    setError(null);
  };

  return {
    flashcards,
    loading,
    error,
    pagination,
    fetchFlashcards,
    fetchUserFlashcards,
    createFlashcard,
    updateFlashcard: updateFlashcardById,
    deleteFlashcard: deleteFlashcardById,
    reviewFlashcard,
    searchFlashcards,
    getFlashcardsByCategory,
    getFlashcardsByDifficulty,
    clearError,
  };
};
