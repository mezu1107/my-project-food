// src/features/reviews/hooks/useReviews.ts
// FINAL PRODUCTION VERSION — React Query v5
// Pagination-safe, TS-safe, no deprecated options

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PaginatedReviewsResponse } from '../types/review.types';

interface UseReviewsParams {
  approved?: boolean;
  featured?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}

export const useReviews = ({
  approved,
  featured,
  page = 1,
  limit = 20,
  sort = '-createdAt',
}: UseReviewsParams = {}) => {
  return useQuery<PaginatedReviewsResponse>({
    queryKey: ['reviews', { approved, featured, page, limit, sort }],

    queryFn: async () => {
      const params = new URLSearchParams();

      if (approved !== undefined) params.set('approved', String(approved));
      if (featured) params.set('featured', 'true');
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (sort) params.set('sort', sort);

      const { data } = await api.get<{
        success: true;
        data: PaginatedReviewsResponse;
      }>(`/reviews?${params.toString()}`);

      return data.data;
    },

    staleTime: 5 * 60 * 1000, // 5 minutes

    // ✅ React Query v5 replacement for keepPreviousData
    placeholderData: (previousData) => previousData,
  });
};

// -----------------------------
// Convenience hooks
// -----------------------------

export const useApprovedReviews = (limit = 10) =>
  useReviews({
    approved: true,
    limit,
    sort: '-createdAt',
  });

export const useFeaturedReviews = () =>
  useReviews({
    approved: true,
    featured: true,
    limit: 6,
  });
