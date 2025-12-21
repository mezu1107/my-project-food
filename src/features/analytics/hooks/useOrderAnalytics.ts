// src/features/analytics/hooks/useOrderAnalytics.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AnalyticsResponse } from '../types/analytics.types';

interface AnalyticsParams {
  period?: '24h' | '7d' | '30d' | '90d' | 'today' | 'yesterday' | 'custom';
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

export const useOrderAnalytics = (params: AnalyticsParams = {}) => {
  return useQuery<AnalyticsResponse['analytics']>({
    queryKey: ['order-analytics', params],
    queryFn: async () => {
      const query = new URLSearchParams();

      if (params.period) {
        query.set('period', params.period);
      }
      if (params.startDate) {
        query.set('startDate', params.startDate);
      }
      if (params.endDate) {
        query.set('endDate', params.endDate);
      }

      const { data } = await api.get<AnalyticsResponse>(
        `/orders/analytics/orders${query.toString() ? `?${query}` : ''}`
      );

      if (!data.success) {
        throw new Error('Failed to fetch analytics');
      }

      return data.analytics;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });
};