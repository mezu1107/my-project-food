// src/features/cart/hooks/useServerCart.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import {
  AnyCartResponse,
  ServerCartItem,
  GuestCartItem,
} from '@/types/cart.types';

const CART_QUERY_KEY = ['cart'];

export const useServerCartQuery = () => {
  return useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: async (): Promise<AnyCartResponse> => {
      return await apiClient.get<AnyCartResponse>('/cart'); // ← returns res.data
    },
    select: (data) => ({
      items: (data.cart?.items ?? []) as (ServerCartItem | GuestCartItem)[],
      total: data.cart?.total ?? 0,
      isGuest: data.isGuest ?? true,
      message: data.message,
      success: data.success,
    }),
    staleTime: 30_000,
    retry: 1,
  });
};



export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      menuItemId,
      quantity = 1,
    }: {
      menuItemId: string;
      quantity?: number;
    }) => {
      return await apiClient.post('/cart', { menuItemId, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};

export const useUpdateCartQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: string;
      quantity: number;
    }) => {
      if (!itemId || itemId === 'undefined') {
        console.error('Attempted to update cart item with invalid ID:', itemId);
        throw new Error('Invalid cart item ID');
      }
      return await apiClient.patch(`/cart/item/${itemId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
    onError: (error) => {
      console.error('Failed to update cart quantity:', error);
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!itemId || itemId === 'undefined') {
        console.error('Attempted to remove cart item with invalid ID:', itemId);
        throw new Error('Invalid cart item ID');
      }
      return await apiClient.delete(`/cart/item/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
    onError: (error) => {
      console.error('Failed to remove cart item:', error);
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await apiClient.delete('/cart/clear');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};