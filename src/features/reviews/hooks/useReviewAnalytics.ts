// src/features/reviews/hooks/useReviewAnalytics.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ReviewAnalytics } from '../types/review.types';

interface UseReviewAnalyticsParams {
  days?: number;
}

export const useReviewAnalytics = ({ days = 30 }: UseReviewAnalyticsParams = {}) => {
  return useQuery<ReviewAnalytics>({
    queryKey: ['review-analytics', days],
    queryFn: async () => {
      const { data } = await api.get<{ success: true; data: ReviewAnalytics }>(
        `/reviews/analytics?days=${days}`
      );
      return data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};