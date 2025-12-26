// src/features/cart/hooks/useServerCart.ts
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { CartResponse, CartItem } from '@/types/cart.types';
import { useCartStore } from './useCartStore';

const CART_QUERY_KEY = ['cart'] as const;

export const useServerCartQuery = () => {
  const { syncWithServer } = useCartStore();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: async (): Promise<CartResponse> => {
      // apiClient.get already returns res.data
      return await apiClient.get<CartResponse>('/cart');
    },
    staleTime: 30_000,
    retry: 2,
    refetchOnWindowFocus: false, // optional: avoid refetch on tab switch
  });

  const { data, isSuccess } = query;

  // Sync server cart → local Zustand store when data is successfully loaded
  useEffect(() => {
    if (isSuccess && data?.success && data.cart.items.length > 0) {
      syncWithServer({
        items: data.cart.items as CartItem[],
        orderNote: data.cart.orderNote || '',
      });
    }
  }, [isSuccess, data, syncWithServer]);

  // Return transformed data for easy consumption
  return {
    ...query,
    data: data
      ? {
          items: (data.cart.items as CartItem[]) ?? [],
          total: data.cart.total ?? 0,
          orderNote: data.cart.orderNote ?? '',
          isGuest: data.isGuest ?? true,
          message: data.message,
        }
      : undefined,
  };
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      menuItemId: string;
      quantity?: number;
      sides?: string[];
      drinks?: string[];
      addOns?: string[];
      specialInstructions?: string;
      orderNote?: string;
    }) => {
      return await apiClient.post<CartResponse>('/cart', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      updates,
    }: {
      itemId: string;
      updates: {
        quantity?: number;
        sides?: string[];
        drinks?: string[];
        addOns?: string[];
        specialInstructions?: string;
        orderNote?: string;
      };
    }) => {
      return await apiClient.patch<CartResponse>(`/cart/item/${itemId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      return await apiClient.delete<CartResponse>(`/cart/item/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await apiClient.delete<CartResponse>('/cart/clear');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};