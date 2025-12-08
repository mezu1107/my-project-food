import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useCartStore } from '../store/useCartStore';
import { toast } from 'sonner';
import type { CartResponse, AddToCartPayload } from '@/types/cart.types';

// Fetch cart from backend (only for authenticated users)
export const useServerCart = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['cart'],
    queryFn: async (): Promise<CartResponse> => {
      const { data } = await api.get('/cart');
      return data;
    },
    enabled: isAuthenticated,
    staleTime: 30000,
  });
};

// Add to cart (backend or local)
export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();

  return useMutation({
    mutationFn: async (payload: AddToCartPayload & { name: string; price: number; image?: string }) => {
      if (isAuthenticated) {
        const { data } = await api.post('/cart', {
          menuItemId: payload.menuItemId,
          quantity: payload.quantity || 1,
        });
        return data;
      } else {
        // Local cart for guests
        addItem({
          id: payload.menuItemId,
          name: payload.name,
          price: payload.price,
          quantity: payload.quantity || 1,
          image: payload.image,
        });
        return { success: true, message: 'Added to cart' };
      }
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Added to cart!');
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    },
  });
};

// Remove item from cart
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { removeItem } = useCartStore();

  return useMutation({
    mutationFn: async (itemId: string) => {
      if (isAuthenticated) {
        const { data } = await api.delete(`/cart/item/${itemId}`);
        return data;
      } else {
        removeItem(itemId);
        return { success: true, message: 'Removed from cart' };
      }
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Removed from cart');
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove item');
    },
  });
};

// Clear entire cart
export const useClearCart = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { clearCart } = useCartStore();

  return useMutation({
    mutationFn: async () => {
      if (isAuthenticated) {
        const { data } = await api.delete('/cart/clear');
        return data;
      } else {
        clearCart();
        return { success: true, message: 'Cart cleared' };
      }
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Cart cleared');
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      }
    },
  });
};

// Update quantity
export const useUpdateCartQuantity = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { updateQuantity } = useCartStore();

  return useMutation({
    mutationFn: async ({ itemId, menuItemId, quantity }: { itemId: string; menuItemId: string; quantity: number }) => {
      if (isAuthenticated) {
        // Backend doesn't have update endpoint, so remove and re-add
        await api.delete(`/cart/item/${itemId}`);
        if (quantity > 0) {
          const { data } = await api.post('/cart', { menuItemId, quantity });
          return data;
        }
        return { success: true };
      } else {
        updateQuantity(menuItemId, quantity);
        return { success: true };
      }
    },
    onSuccess: () => {
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      }
    },
  });
};
