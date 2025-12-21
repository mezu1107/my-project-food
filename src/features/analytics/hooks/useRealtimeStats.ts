// src/features/analytics/hooks/useRealtimeStats.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { RealtimeData, RealtimeResponse } from '../types/analytics.types';

export const useRealtimeStats = () => {
  return useQuery<RealtimeData>({
    queryKey: ['realtime-stats'],
    queryFn: async () => {
      const { data } = await api.get<RealtimeResponse>('/orders/analytics/orders/realtime');

      if (!data.success) {
        throw new Error('Failed to fetch realtime stats');
      }

      return data.realtime;
    },
    refetchInterval: 30_000, // Refetch every 30 seconds
    staleTime: 10_000,       // Consider data fresh for 10s
  });
};