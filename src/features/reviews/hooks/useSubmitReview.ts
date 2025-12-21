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
    onSuccess: (data) => {
      toast({
        title: 'Review Submitted!',
        description: data.message,
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['order'] }); // if you track review status per order
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