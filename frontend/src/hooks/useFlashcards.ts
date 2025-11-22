import { useState, useCallback } from 'react';
import { flashcardService } from '@/lib/flashcards';
import type { Flashcard } from '@/types';
import type { FlashcardFilters, FlashcardResponse } from '@/lib/flashcards';

export const useFlashcards = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchFlashcards = useCallback(async (filters: FlashcardFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response: FlashcardResponse = await flashcardService.getFlashcards(filters);
      setFlashcards(response.flashcards);
      setPagination(response.pagination);
      return response;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Failed to fetch flashcards';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [setFlashcards]);

  const fetchUserFlashcards = useCallback(async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response: FlashcardResponse = await flashcardService.getUserFlashcards(page, limit);
      setFlashcards(response.flashcards);
      setPagination(response.pagination);
      return response;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Failed to fetch user flashcards';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [setFlashcards]);

  const createFlashcard = async (data: {
    word: string;
    definition: string;
    example: string;
    partOfSpeech: string;
    difficulty: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const newFlashcard = await flashcardService.createFlashcard(data);
      // Refresh flashcards list after creating
      await fetchUserFlashcards();
      return newFlashcard;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Failed to create flashcard';
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
      // Refresh flashcards list after updating
      await fetchUserFlashcards();
      return updatedFlashcard;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Failed to update flashcard';
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
      // Refresh flashcards list after deleting
      await fetchUserFlashcards();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Failed to delete flashcard';
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
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Failed to review flashcard';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const searchFlashcards = async (searchTerm: string, page: number = 1) => {
    return fetchFlashcards({ search: searchTerm, page, limit: 10 });
  };


  const getFlashcardsByDifficulty = async (difficulty: string, page: number = 1) => {
    return fetchFlashcards({ difficulty, page, limit: 10 });
  };

  const getFlashcardById = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const flashcard = await flashcardService.getFlashcardById(id);
      return flashcard;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Failed to fetch flashcard';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
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
    getFlashcardById,
    reviewFlashcard,
    searchFlashcards,
    getFlashcardsByDifficulty,
    clearError,
  };
};
