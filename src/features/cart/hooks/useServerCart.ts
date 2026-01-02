// src/features/cart/hooks/useServerCart.ts
// PRODUCTION-READY — JANUARY 02, 2026
// FINAL FIX: Cart no longer appears empty after adding items (guest or auth)
// Key changes:
// - useAddToCart: setQueryData + syncWithServer immediately
// - NO invalidateQueries in onSuccess → eliminates race conditions
// - Other mutations keep invalidate for safety (background refetch ok)
// - Guest carts preserved correctly

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
      const response = await apiClient.get<CartResponse>('/cart');
      return response;
    },
    staleTime: 30_000,
    retry: 2,
    refetchOnWindowFocus: true,
    // Optional: reduce unnecessary refetches on mount if we trust mutations
    // refetchOnMount: false,
  });

  // Sync server → Zustand only for authenticated users
  // Guest carts live purely in localStorage/Zustand — don't overwrite them
  useEffect(() => {
    if (
      query.isSuccess &&
      query.data?.success &&
      query.data.isGuest === false // ← Important: only sync when logged in
    ) {
      syncWithServer({
        items: query.data.cart.items as CartItem[],
        orderNote: query.data.cart.orderNote || '',
      });
    }
  }, [query.isSuccess, query.data, syncWithServer]);

  return {
    ...query,
    data: query.data?.success
      ? {
          items: query.data.cart.items as CartItem[],
          total: query.data.cart.total ?? 0,
          orderNote: query.data.cart.orderNote ?? '',
          isGuest: query.data.isGuest ?? true,
          message: query.data.message,
        }
      : undefined,
  };
};

// ==================== MUTATIONS ====================

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const { syncWithServer } = useCartStore();

  return useMutation({
    mutationFn: async (payload: {
      menuItemId: string;
      quantity?: number;
      sides?: string[];
      drinks?: string[];
      addOns?: string[];
      specialInstructions?: string;
    }) => {
      const response = await apiClient.post<CartResponse>('/cart', payload);
      return response;
    },
    onSuccess: (response) => {
      if (response.success && response.cart) {
        // IMMEDIATE cache update — prevents empty flash
        queryClient.setQueryData(CART_QUERY_KEY, response);

        // IMMEDIATE Zustand sync — critical for guest users
        syncWithServer({
          items: response.cart.items as CartItem[],
          orderNote: response.cart.orderNote || '',
        });
      }
      // REMOVED: invalidateQueries → was causing race/overwrites
      // Background refetch will happen naturally via staleTime or focus
    },
    onError: () => {
      // Only invalidate on error to recover consistency
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
      const response = await apiClient.patch<CartResponse>(`/cart/item/${itemId}`, updates);
      return response;
    },
    onSuccess: (response) => {
      if (response?.success && response.cart) {
        queryClient.setQueryData(CART_QUERY_KEY, response);
      } else {
        queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      }
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const response = await apiClient.delete<CartResponse>(`/cart/item/${itemId}`);
      return response;
    },
    onSuccess: (response) => {
      if (response?.success && response.cart) {
        queryClient.setQueryData(CART_QUERY_KEY, response);
      } else {
        queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      }
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete<CartResponse>('/cart/clear');
      return response;
    },
    onSuccess: (response) => {
      if (response?.success) {
        queryClient.setQueryData(CART_QUERY_KEY, response);
      } else {
        queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      }
    },
  });
};