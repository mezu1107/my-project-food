// src/features/orders/hooks/useOrders.ts
// FINAL PRODUCTION — DECEMBER 16, 2025
// Fully synced with backend routes and order.types.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/features/auth/store/authStore';
import { toast } from 'sonner';
import type {
  Order,
  OrdersResponse,
  OrderResponse,
  CreateOrderPayload,
  CreateGuestOrderPayload,
  CreateOrderResponse,
} from '@/types/order.types';

// === CUSTOMER HOOKS ===

// Fetch user's orders (authenticated customers only)
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
    refetchOnWindowFocus: true,
  });
};

// Fetch single order by ID (customer view — requires auth)
export const useOrder = (orderId: string | undefined) => {
  return useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data } = await api.get<OrderResponse>(`/orders/${orderId}`);
      return data.order;
    },
    enabled: !!orderId,
  });
};

// src/features/orders/hooks/useOrders.ts (relevant sections only)

/**
 * Public: Track orders by phone number (guest access)
 * Matches backend: POST /api/orders/track/by-phone
 */
export const useTrackOrdersByPhone = () => {
  return useMutation<OrdersResponse, Error, { phone: string }>({
    mutationFn: async ({ phone }) => {
      // Basic client-side validation
      const cleanedPhone = phone.replace(/\s/g, '');
      if (!cleanedPhone || cleanedPhone.length < 10) {
        throw new Error('Please enter a valid phone number');
      }

      const { data } = await api.post<OrdersResponse>('/orders/track/by-phone', {
        phone: cleanedPhone,
      });

      return data;
    },
    onSuccess: (data) => {
      if (data.orders.length === 0) {
        toast.info('No orders found for this phone number');
      } else {
        toast.success(`Found ${data.orders.length} order${data.orders.length > 1 ? 's' : ''}!`);
      }
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to search orders. Please try again.';
      toast.error(message);
    },
  });
};

/**
 * Public: Track a single order by ID (accessible to guests and logged-in users)
 * Matches backend: GET /api/orders/track/:orderId
 */
export const useTrackOrder = (orderId: string | undefined) => {
  return useQuery<Order, Error>({
    queryKey: ['track-order', orderId],
    queryFn: async (): Promise<Order> => {
      if (!orderId) {
        throw new Error('Order ID is missing');
      }

      // Validate MongoDB ObjectId format
      if (!/^[0-9a-fA-F]{24}$/.test(orderId)) {
        throw new Error('Invalid order ID format');
      }

      const { data } = await api.get<OrderResponse>(`/orders/track/${orderId}`);
      return data.order;
    },
    enabled: !!orderId,
    staleTime: 30_000, // 30 seconds – real-time updates handled via socket
    gcTime: 5 * 60_000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: true,
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (order not found) or 400 (invalid ID)
      if (error.response?.status === 404 || error.response?.status === 400) {
        return false;
      }
      return failureCount < 2;
    },
  });
};


// === ORDER CREATION ===

// Create order — Authenticated user
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateOrderResponse, Error, CreateOrderPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<CreateOrderResponse>('/orders', payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.removeQueries({ queryKey: ['cart'] });
      toast.success('Order placed successfully!');
      if (data.clientSecret) {
        // Handled in checkout page
      } else if (data.bankDetails) {
        toast.info(`Please transfer PKR ${data.bankDetails.amount} to complete your order`);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to place order');
    },
  });
};

// Create order — Guest user
export const useCreateGuestOrder = () => {
  return useMutation<CreateOrderResponse, Error, CreateGuestOrderPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<CreateOrderResponse>('/orders', payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success('Order placed successfully!');
      if (data.bankDetails) {
        toast.info(`Transfer PKR ${data.bankDetails.amount} using reference: ${data.bankDetails.reference}`);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to place order');
    },
  });
};

// === ORDER ACTIONS ===

// Cancel order (customer only)
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<OrderResponse, Error, string>({
    mutationFn: async (orderId) => {
      const { data } = await api.patch<OrderResponse>(`/orders/${orderId}/cancel`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      queryClient.invalidateQueries({ queryKey: ['track-order'] });
      toast.success('Order cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Cannot cancel order at this stage');
    },
  });
};


// === UTILITIES ===

// Download receipt PDF
export const downloadReceipt = async (orderId: string) => {
  try {
    const response = await api.get(`/orders/${orderId}/receipt`, {
      responseType: 'blob',
    });

    const blob = response.data as Blob;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FoodExpress-Receipt-#${orderId.slice(-6).toUpperCase()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Receipt downloaded');
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to download receipt');
  }
};

// Confirm bank transfer (upload proof)
export const useConfirmBankPayment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { success: true; message: string },
    Error,
    { orderId: string; receipt: File }
  >({
    mutationFn: async ({ orderId, receipt }) => {
      const formData = new FormData();
      formData.append('receipt', receipt);

      const { data } = await api.post<{ success: true; message: string }>(
        `/orders/${orderId}/bank-proof`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order'] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['track-order'] });
      toast.success('Payment proof uploaded! We’ll verify soon.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Upload failed');
    },
  });
};

// === ADMIN HOOKS ===

// Admin: List all orders with filters and pagination
interface AdminOrdersResponse {
  success: true;
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}


export const useAdminOrders = (filters?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams();
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.page) queryParams.append('page', String(filters.page));
  if (filters?.limit) queryParams.append('limit', String(filters.limit));

  return useQuery<AdminOrdersResponse>({
    queryKey: ['admin-orders', filters],
    queryFn: async () => {
      const { data } = await api.get<AdminOrdersResponse>(`/orders?${queryParams.toString()}`);
      return data;
    },
    staleTime: 30_000,
  });
};


// === ORDER REJECTION (CUSTOMER) ===
export const useCustomerRejectOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<OrderResponse, Error, { orderId: string; reason?: string; note?: string }>({
    mutationFn: async ({ orderId, reason, note }) => {
      const { data } = await api.patch<OrderResponse>(`/orders/${orderId}/reject`, { reason, note });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      queryClient.invalidateQueries({ queryKey: ['track-order'] });
      toast.success('Order rejected successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Cannot reject order at this stage');
    },
  });
};

// === ORDER REJECTION (ADMIN) ===
export const useAdminRejectOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<OrderResponse, Error, { orderId: string; reason?: string; note?: string }>({
    mutationFn: async ({ orderId, reason, note }) => {
      const { data } = await api.patch<OrderResponse>(`/orders/${orderId}/admin-reject`, { reason, note });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      queryClient.invalidateQueries({ queryKey: ['track-order'] });
      toast.success('Order rejected by admin');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject order');
    },
  });
};