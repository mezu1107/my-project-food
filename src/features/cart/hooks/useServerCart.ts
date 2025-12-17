import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { CartResponse, ServerCartItem } from '@/types/cart.types';

const CART_QUERY_KEY = 'serverCart';

export const useServerCart = () => {
  return useQuery({
    queryKey: [CART_QUERY_KEY],
    queryFn: async () => {
      const data = await apiClient.get<CartResponse>('/cart'); // <-- apiClient handles baseURL
      return data;
    },
    select: (data) => ({
      items: data.cart.items as ServerCartItem[],
      total: data.cart.total,
      isGuest: data.isGuest,
    }),
  });
};

export const useAddToCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ menuItemId, quantity = 1 }: { menuItemId: string; quantity?: number }) => {
      return await apiClient.post('/cart', { menuItemId, quantity }); // <-- use apiClient
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [CART_QUERY_KEY] }),
  });
};

export const useUpdateCartQuantity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      return await apiClient.patch(`/cart/item/${itemId}`, { quantity });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [CART_QUERY_KEY] }),
  });
};

export const useRemoveFromCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      return await apiClient.delete(`/cart/item/${itemId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [CART_QUERY_KEY] }),
  });
};

export const useClearCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return await apiClient.delete('/cart/clear');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [CART_QUERY_KEY] }),
  });
};
