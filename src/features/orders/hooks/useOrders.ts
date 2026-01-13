// src/features/orders/hooks/useOrders.ts
// PRODUCTION-READY — JANUARY 2026
// Features:
// - Full real-time support via optimistic updates & cache invalidation
// - Proper typing & error handling
// - Consistent cache updates for both authenticated & public tracking pages
// - Better toast feedback & UX

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useCartStore } from '@/features/cart/hooks/useCartStore';
import { toast } from 'sonner';
import type {
  Order,
  OrdersResponse,
  OrderResponse,
  CreateOrderPayload,
  CreateGuestOrderPayload,
  CreateOrderResponse,
  ReorderResponse,
  TrackOrderResponse,
  OrderStatus,
} from '@/types/order.types';

// ============================================================
// SHARED RESPONSE TYPES
// ============================================================

interface OrderTimelineResponse {
  success: true;
  timeline: Array<{
    event: string;
    timestamp: string;
    status: string;
    cancelledBy?: string;
  }>;
  currentStatus: string;
  shortId: string;
}

interface AdminOrdersResponse {
  success: true;
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// ============================================================
// CUSTOMER / AUTHENTICATED USER HOOKS
// ============================================================

export const useMyOrders = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery<Order[]>({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const { data } = await api.get<OrdersResponse>('/orders/my');
      return data.orders;
    },
    enabled: isAuthenticated,
    staleTime: 45_000, // slightly longer than before
    gcTime: 10 * 60_000,
  });
};

export const useOrder = (orderId: string | undefined) => {
  return useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) throw new Error('Order ID is required');
      const { data } = await api.get<OrderResponse>(`/orders/${orderId}`);
      return data.order;
    },
    enabled: !!orderId,
    staleTime: 60_000,
    gcTime: 15 * 60_000,
  });
};

export const useOrderTimeline = (orderId: string | undefined) => {
  return useQuery<OrderTimelineResponse>({
    queryKey: ['order-timeline', orderId],
    queryFn: async () => {
      if (!orderId) throw new Error('Order ID is required');
      const { data } = await api.get<OrderTimelineResponse>(`/orders/${orderId}/timeline`);
      return data;
    },
    enabled: !!orderId,
    staleTime: 60_000,
  });
};

// ============================================================
// PUBLIC / GUEST TRACKING HOOKS
// ============================================================

export const useTrackOrder = (orderId: string | undefined) => {
  return useQuery<TrackOrderResponse>({
    queryKey: ['track-order', orderId],
    queryFn: async () => {
      if (!orderId) throw new Error('Order ID is required');
      const { data } = await api.get<TrackOrderResponse>(`/orders/track/${orderId}`);
      return data;
    },
    enabled: !!orderId,
    // No staleTime → frequent background refetch (socket is primary source anyway)
    refetchOnWindowFocus: true,
    refetchInterval: 45_000, // gentle background refresh
  });
};

export const useTrackOrdersByPhone = () => {
  const queryClient = useQueryClient();

  return useMutation<OrdersResponse, Error, { phone: string }>({
    mutationFn: async ({ phone }) => {
      const cleaned = phone.replace(/\D/g, '');
      if (!/^03[0-9]{9}$/.test(cleaned)) {
        throw new Error('Please enter a valid Pakistani mobile number (e.g. 03123456789)');
      }
      const { data } = await api.post<OrdersResponse>('/orders/track/by-phone', { phone: cleaned });
      return data;
    },
    onSuccess: (data) => {
      if (data.orders.length === 0) {
        toast.info('No orders found for this phone number');
      } else {
        toast.success(`Found ${data.orders.length} order${data.orders.length > 1 ? 's' : ''}`);
        // Optional: prefetch single orders for faster navigation
        data.orders.forEach((order) => {
          queryClient.setQueryData(['track-order', order._id], { success: true, order });
        });
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to search orders');
    },
  });
};

// ============================================================
// ORDER CREATION HOOKS
// ============================================================

const CART_STORAGE_KEY = 'altawakkalfoods-cart-v5';

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const { clearCart } = useCartStore();

  return useMutation<CreateOrderResponse, Error, CreateOrderPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<CreateOrderResponse>('/orders', payload);
      return data;
    },
    onSuccess: (data) => {
      // Clear cart & local storage
      clearCart();
      localStorage.removeItem(CART_STORAGE_KEY);

      // Optimistically add to my-orders list if authenticated
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });

      toast.success('Order placed successfully! 🎉', {
        description: `Order #${data.order.shortId} received`,
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to place order');
    },
  });
};

export const useCreateGuestOrder = () => {
  const { clearCart } = useCartStore();

  return useMutation<CreateOrderResponse, Error, CreateGuestOrderPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<CreateOrderResponse>('/orders', payload);
      return data;
    },
    onSuccess: () => {
      clearCart();
      localStorage.removeItem(CART_STORAGE_KEY);
      toast.success('Order placed successfully! 🎉', {
        description: 'Check your email or track with phone number',
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to place order');
    },
  });
};

// ============================================================
// CUSTOMER ORDER ACTIONS
// ============================================================

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<OrderResponse, Error, string>({
    mutationFn: async (orderId) => {
      const { data } = await api.patch<OrderResponse>(`/orders/${orderId}/cancel`);
      return data;
    },
    onSuccess: (data) => {
      const order = data.order;
      queryClient.setQueryData(['track-order', order._id], { success: true, order });
      queryClient.setQueryData(['order', order._id], order);
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-timeline', order._id] });

      toast.success('Order cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Cannot cancel order at this stage');
    },
  });
};

export const useCustomerRejectOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<OrderResponse, Error, { orderId: string; reason?: string; note?: string }>({
    mutationFn: async ({ orderId, reason, note }) => {
      const { data } = await api.patch<OrderResponse>(`/orders/${orderId}/reject`, { reason, note });
      return data;
    },
    onSuccess: (data) => {
      const order = data.order;
      queryClient.setQueryData(['track-order', order._id], { success: true, order });
      queryClient.setQueryData(['order', order._id], order);
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-timeline', order._id] });

      toast.success('Order rejected successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Cannot reject order at this stage');
    },
  });
};

export const useRequestRefund = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { success: true; message: string },
    Error,
    { orderId: string; amount: number; reason: string }
  >({
    mutationFn: async ({ orderId, amount, reason }) => {
      const { data } = await api.post<{ success: true; message: string }>(
        `/orders/${orderId}/request-refund`,
        { amount, reason }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order'] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      toast.success('Refund request submitted. We will review it shortly.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit refund request');
    },
  });
};

export const useReorder = () => {
  const queryClient = useQueryClient();
  const { clearCart, addMultipleItems } = useCartStore();

  return useMutation<ReorderResponse, Error, string>({
    mutationFn: async (orderId) => {
      const { data } = await api.post<ReorderResponse>(`/orders/${orderId}/reorder`);
      return data;
    },
    onSuccess: (data) => {
      clearCart();
      if (data.cart?.items?.length > 0) {
        addMultipleItems(data.cart.items);
      }
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success(data.message || 'Items added back to cart!');
    },
    onError: () => {
      toast.error('Failed to reorder items');
    },
  });
};

// ============================================================
// UTILITIES
// ============================================================

export const downloadReceipt = async (orderId: string) => {
  try {
    const response = await api.get(`/orders/${orderId}/receipt`, {
      responseType: 'blob',
    });

    const blob = response.data as Blob;
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${orderId.slice(-6).toUpperCase()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Receipt downloaded');
  } catch (error: any) {
    console.error('Receipt download failed:', error);
    toast.error(error.response?.data?.message || 'Failed to download receipt');
  }
};

// ============================================================
// ADMIN / KITCHEN / RIDER OPERATIONS
// ============================================================



export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<
    OrderResponse,
    Error,
    { orderId: string; status: OrderStatus }
  >({
    mutationFn: async ({ orderId, status }) => {
      const { data } = await api.patch<OrderResponse>(
        `/orders/${orderId}/status`,
        { status }
      );
      return data;
    },
    onSuccess: (data, { orderId }) => {
      const updatedOrder = data.order;

      queryClient.setQueryData(['order', orderId], updatedOrder);
      queryClient.setQueryData(['track-order', orderId], {
        success: true,
        order: updatedOrder,
      });

      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-timeline', orderId] });

      toast.success(
        `Status updated → ${updatedOrder.status.replace(/_/g, ' ')}`
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });
};

export const useAssignRider = () => {
  const queryClient = useQueryClient();

  return useMutation<
    OrderResponse,
    Error,
    { orderId: string; riderId: string }
  >({
    mutationFn: async ({ orderId, riderId }) => {
      const { data } = await api.patch<OrderResponse>(`/orders/${orderId}/assign`, { riderId });
      return data;
    },
    onSuccess: (data, { orderId }) => {
      const updatedOrder = data.order;

      queryClient.setQueryData(['order', orderId], updatedOrder);
      queryClient.setQueryData(['track-order', orderId], { success: true, order: updatedOrder });

      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });

      toast.success('Rider assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign rider');
    },
  });
};

export const useAdminOrders = (filters: {
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
} = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));
  if (filters.search) params.append('search', filters.search);

  const url = `/orders${params.toString() ? `?${params.toString()}` : ''}`;

  return useQuery<AdminOrdersResponse>({
    queryKey: ['admin-orders', filters],
    queryFn: async () => {
      const { data } = await api.get<AdminOrdersResponse>(url);
      return data;
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
};

export const useAdminRejectOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<
    OrderResponse,
    Error,
    { orderId: string; reason?: string; note?: string }
  >({
    mutationFn: async ({ orderId, reason, note }) => {
      const { data } = await api.patch<OrderResponse>(`/orders/${orderId}/admin-reject`, {
        reason,
        note,
      });
      return data;
    },
    onSuccess: (data) => {
      const updatedOrder = data.order;
      queryClient.setQueryData(['track-order', updatedOrder._id], {
        success: true,
        order: updatedOrder,
      });
      queryClient.setQueryData(['order', updatedOrder._id], updatedOrder);
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });

      toast.success('Order rejected by admin');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject order');
    },
  });
};