import { useState, useCallback } from 'react';
import { recommendationsService } from '@/lib/recommendations';
import type { Flashcard } from '@/types';
import type { RecommendationsResponse, RecommendationsFilters } from '@/lib/recommendations';

export const useRecommendations = () => {
  const [recommendations, setRecommendations] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch recommendations
  const fetchRecommendations = useCallback(async (filters: RecommendationsFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response: RecommendationsResponse = await recommendationsService.getRecommendations(filters);
      setRecommendations(response);
      return response;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Failed to fetch recommendations';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch daily recommendations
  const fetchDailyRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response: RecommendationsResponse = await recommendationsService.getDailyRecommendations();
      setRecommendations(response);
      return response;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Failed to fetch daily recommendations';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch weak area recommendations
  const fetchWeakAreaRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response: RecommendationsResponse = await recommendationsService.getWeakAreaRecommendations();
      setRecommendations(response);
      return response;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Failed to fetch weak area recommendations';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get flashcards from recommendations
  const getRecommendedFlashcards = useCallback((): Flashcard[] => {
    if (!recommendations || !recommendations.recommendations) {
      return [];
    }
    return recommendations.recommendations.map(rec => rec.flashcard);
  }, [recommendations]);

  return {
    recommendations,
    loading,
    error,
    fetchRecommendations,
    fetchDailyRecommendations,
    fetchWeakAreaRecommendations,
    getRecommendedFlashcards,
  };
};

