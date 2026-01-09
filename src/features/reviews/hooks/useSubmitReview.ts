// src/features/reviews/hooks/useSubmitReview.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { SubmitReviewData, SubmitReviewResponse } from '../types/review.types';
import { toast } from '@/components/ui/use-toast';

export const useSubmitReview = () => {
  const queryClient = useQueryClient();

  return useMutation<SubmitReviewResponse, Error, SubmitReviewData>({
    mutationFn: async (reviewData: SubmitReviewData) => {
      const { data } = await api.post<SubmitReviewResponse>('/reviews/submit', reviewData);
      return data;
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Review Submitted!',
        description: data.message,
      });

      // Invalidate public reviews
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['approved-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['top-reviews'] });

      // Invalidate ALL user orders — this is the key fix
      // Most common query key from useMyOrders hook
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });

      // Cover any possible variations used across the app
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });

      // Optional: Optimistic update for instant feedback (highly recommended)
      queryClient.setQueryData(['my-orders'], (old: any) => {
        if (!old?.orders) return old;

        return {
          ...old,
          orders: old.orders.map((order: any) =>
            order._id === variables.orderId
              ? { ...order, review: true } // Now reflects reviewed state instantly
              : order
          ),
        };
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Submit Review',
        description: error.response?.data?.message || 'Please try again later.',
        variant: 'destructive',
      });
    },
  });
};