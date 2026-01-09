// src/features/orders/hooks/useOrders.ts
// PRODUCTION-READY — JANUARY 09, 2026
// FULL REAL-TIME SUPPORT: Admin actions instantly reflect on public tracking page
// Fixed: track-order cache shape alignment + rider assignment updates

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
} from '@/types/order.types';

// ============================================================
// TIMELINE RESPONSE TYPE
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

// ============================================================
// CUSTOMER HOOKS (Authenticated)
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
    staleTime: 30_000,
  });
};

export const useOrder = (orderId: string | undefined) => {
  return useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) throw new Error('Order ID required');
      const { data } = await api.get<OrderResponse>(`/orders/${orderId}`);
      return data.order;
    },
    enabled: !!orderId,
    staleTime: 30_000,
    gcTime: 10 * 60_000,
  });
};

export const useOrderTimeline = (orderId: string | undefined) => {
  return useQuery<OrderTimelineResponse>({
    queryKey: ['order-timeline', orderId],
    queryFn: async () => {
      if (!orderId) throw new Error('Order ID required');
      const { data } = await api.get<OrderTimelineResponse>(`/orders/${orderId}/timeline`);
      return data;
    },
    enabled: !!orderId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
};

// ============================================================
// PUBLIC TRACKING HOOKS
// ============================================================

export const useTrackOrder = (orderId: string | undefined) => {
  return useQuery<TrackOrderResponse>({
    queryKey: ['track-order', orderId],
    queryFn: async () => {
      if (!orderId) throw new Error('Order ID required');
      const { data } = await api.get<TrackOrderResponse>(`/orders/track/${orderId}`);
      return data;
    },
    enabled: !!orderId,
    // Important: No staleTime → defaults to 0 → allows frequent background refetch
    // But primary updates come from socket + optimistic setQueryData
  });
};

export const useTrackOrdersByPhone = () => {
  return useMutation<OrdersResponse, Error, { phone: string }>({
    mutationFn: async ({ phone }) => {
      const cleaned = phone.replace(/\D/g, '');
      if (!/^03[0-9]{9}$/.test(cleaned)) {
        throw new Error('Please enter a valid Pakistani phone number (e.g. 03123456789)');
      }
      const { data } = await api.post<OrdersResponse>('/orders/track/by-phone', { phone: cleaned });
      return data;
    },
    onSuccess: (data) => {
      if (data.orders.length === 0) {
        toast.info('No orders found for this phone number');
      } else {
        toast.success(`Found ${data.orders.length} order${data.orders.length > 1 ? 's' : ''}`);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to search orders');
    },
  });
};

// ============================================================
// ORDER CREATION
// ============================================================

const CART_STORAGE_KEY = 'altawakkalfoods-cart-v5';

export const useCreateOrder = () => {
  const qc = useQueryClient();
  const { clearCart } = useCartStore();
  return useMutation<CreateOrderResponse, Error, CreateOrderPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<CreateOrderResponse>('/orders', payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-orders'] });
      clearCart();
      localStorage.removeItem(CART_STORAGE_KEY);
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
    },
  });
};

// ============================================================
// ORDER ACTIONS (Customer)
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
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      queryClient.invalidateQueries({ queryKey: ['order-timeline'] });
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
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      queryClient.invalidateQueries({ queryKey: ['order-timeline'] });
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
      toast.success('Refund request submitted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit refund request');
    },
  });
};

export const useReorder = () => {
  const qc = useQueryClient();
  const { clearCart, addMultipleItems } = useCartStore();
  return useMutation<ReorderResponse, Error, string>({
    mutationFn: async (orderId) => {
      const { data } = await api.post<ReorderResponse>(`/orders/${orderId}/reorder`);
      return data;
    },
    onSuccess: (data) => {
      clearCart();
      if (data.cart.items.length > 0) {
        addMultipleItems(data.cart.items);
      }
      qc.invalidateQueries({ queryKey: ['cart'] });
      toast.success(data.message);
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
    link.download = `altawakkalfoods-Receipt-#${orderId.slice(-6).toUpperCase()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Receipt downloaded successfully');
  } catch (error: any) {
    console.error('Receipt download failed:', error);
    toast.error(error.response?.data?.message || 'Failed to download receipt');
  }
};

// ============================================================
// ADMIN / KITCHEN / RIDER HOOKS
// ============================================================

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<
    OrderResponse,
    Error,
    { orderId: string; status: 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'rejected' }
  >({
    mutationFn: async ({ orderId, status }) => {
      const { data } = await api.patch<OrderResponse>(`/orders/${orderId}/status`, { status });
      return data;
    },
    onSuccess: (data, variables) => {
      const orderId = variables.orderId;
      const updatedOrder = data.order;

      // Update authenticated single order view
      queryClient.setQueryData(['order', orderId], data);

      // Critical: Update public tracking page cache with exact expected shape
      queryClient.setQueryData(['track-order', orderId], {
        success: true,
        order: updatedOrder,
      });

      // Invalidate lists to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-timeline', orderId] });

      toast.success(`Order status updated to ${updatedOrder.status.replace(/_/g, ' ')}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update order status');
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
    onSuccess: (data, variables) => {
      const orderId = variables.orderId;
      const updatedOrder = data.order;

      queryClient.setQueryData(['order', orderId], data);

      // Critical: Public tracking page sees rider assignment instantly
      queryClient.setQueryData(['track-order', orderId], {
        success: true,
        order: updatedOrder,
      });

      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });

      toast.success('Rider assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign rider');
    },
  });
};

// ============================================================
// ADMIN HOOKS
// ============================================================

interface AdminOrdersResponse {
  success: true;
  orders: Order[];
  pagination: { page: number; limit: number; total: number };
}

export const useAdminOrders = (filters?: {
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.page) params.append('page', String(filters.page));
  if (filters?.limit) params.append('limit', String(filters.limit));
  if (filters?.search) params.append('search', filters.search);

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

  return useMutation<OrderResponse, Error, { orderId: string; reason?: string; note?: string }>({
    mutationFn: async ({ orderId, reason, note }) => {
      const { data } = await api.patch<OrderResponse>(`/orders/${orderId}/admin-reject`, { reason, note });
      return data;
    },
    onSuccess: (data) => {
      const updatedOrder = data.order;

      queryClient.setQueryData(['track-order', updatedOrder._id], {
        success: true,
        order: updatedOrder,
      });

      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order rejected by admin');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject order');
    },
  });
};