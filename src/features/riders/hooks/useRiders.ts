// src/features/riders/hooks/useRiderApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import type {
  RiderProfileResponse,
  RiderOrdersResponse,
  CurrentOrderResponse,
  ApplicationStatusResponse,
  RiderActionResponse,
  ApplyAsRiderPayload,
  RiderProfile,
  RiderOrder,
  CurrentOrder,
} from '../types/rider.types';

// ==================== RIDER QUERIES ====================

/** Get rider profile (name, earnings, rating, status, etc.) */
export function useRiderProfile() {
  return useQuery({
    queryKey: ['rider', 'profile'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    queryFn: async () => {
      const response = await apiClient.get<RiderProfileResponse>('/rider/profile');
      return response;
    },
    select: (data) => (data.success ? data.rider : null),
  });
}

/** Get current active order (for live tracking & actions) */
export function useCurrentOrder() {
  return useQuery({
    queryKey: ['rider', 'current-order'],
    staleTime: 30 * 1000, // Refresh frequently
    refetchInterval: 30 * 1000,
    queryFn: async () => {
      const response = await apiClient.get<CurrentOrderResponse>('/rider/current-order');
      return response;
    },
    select: (data) => (data.success && data.currentOrder ? data.currentOrder : null),
  });
}

/** Get rider's order history */
export function useRiderOrders() {
  return useQuery({
    queryKey: ['rider', 'orders'],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const response = await apiClient.get<RiderOrdersResponse>('/rider/orders');
      return response;
    },
    select: (data) => (data.success ? data.orders : []),
  });
}

/** Check rider application status (for non-riders applying) */
export function useRiderApplicationStatus(enabled: boolean = true) {
  return useQuery({
    queryKey: ['rider', 'application-status'],
    enabled,
    staleTime: Infinity,
    queryFn: async () => {
      const response = await apiClient.get<ApplicationStatusResponse>('/rider/application-status');
      return response;
    },
  });
}

// ==================== RIDER MUTATIONS ====================

/** Update rider location (background + live tracking) */
export function useUpdateLocation() {
  return useMutation({
    mutationFn: async ({ lat, lng }: { lat: number; lng: number }) => {
      const response = await apiClient.patch<RiderActionResponse>('/rider/location', { lat, lng });
      return response;
    },
    onSuccess: () => {
      toast.success('Location updated');
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || 'Failed to update location';
      toast.error(message);
    },
  });
}

/** Toggle online / availability status */
export function useToggleAvailability() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return apiClient.patch<RiderActionResponse>('/rider/availability');
    },

    onSuccess: (data) => {
      qc.setQueryData<RiderProfile | null>(
        ['rider', 'profile'],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            isOnline: data.isOnline ?? old.isOnline,
            isAvailable: data.isAvailable ?? old.isAvailable,
          };
        }
      );

      toast.success(
        data.isAvailable
          ? 'You are now available for orders'
          : 'You are temporarily unavailable'
      );
    },

    onError: () => {
      toast.error('Failed to update availability');
    },
  });
}

/** Accept an assigned order */
// src/features/riders/hooks/useRiderApi.ts (or useRiders.ts)

export function useAcceptOrder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason?: string }) => {
      const response = await apiClient.patch<RiderActionResponse>(
        `/rider/orders/${orderId}/accept`,
        reason ? { reason } : {} // only send reason if provided
      );
      return response;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rider', 'current-order'] });
      toast.success('Order accepted — heading out!');
    },
    onError: () => toast.error('Failed to accept order'),
  });
}

/** Reject an assigned order */
export function useRejectOrder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason?: string }) => {
      const response = await apiClient.patch<RiderActionResponse>(`/rider/orders/${orderId}/reject`, {
        reason,
      });
      return response;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rider', 'current-order'] });
      toast.success('Order rejected');
    },
    onError: () => toast.error('Failed to reject order'),
  });
}

/** Mark order as picked up */
export function usePickupOrder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await apiClient.patch<RiderActionResponse>(`/rider/orders/${orderId}/pickup`);
      return response;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rider', 'current-order'] });
      toast.success('Order picked up!');
    },
  });
}

/** Mark order as delivered + add earnings */
export function useDeliverOrder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await apiClient.patch<RiderActionResponse>(`/rider/orders/${orderId}/deliver`);
      return response;
    },
    onSuccess: (data) => {
      qc.setQueryData(['rider', 'current-order'], { currentOrder: null });
      qc.invalidateQueries({ queryKey: ['rider', 'profile'] }); // Update earnings
      qc.invalidateQueries({ queryKey: ['rider', 'orders'] });
      toast.success(
        `Order delivered! +PKR ${data.earningsAdded} earned (Total deliveries: ${data.totalDeliveries})`
      );
    },
    onError: () => toast.error('Failed to mark as delivered'),
  });
}

/** Collect cash for COD order */
export function useCollectCash() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, amount }: { orderId: string; amount: number }) => {
      const response = await apiClient.patch<RiderActionResponse>(`/rider/orders/${orderId}/collect-cash`, {
        collectedAmount: amount,
      });
      return response;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['rider', 'current-order'] });
      toast.success(`PKR ${data.collectedAmount} collected`);
    },
  });
}

/** Apply to become a rider */
export function useApplyAsRider() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ApplyAsRiderPayload) => {
      const fd = new FormData();
      fd.append('cnicNumber', payload.cnicNumber);
      fd.append('vehicleType', payload.vehicleType || 'bike');
      fd.append('vehicleNumber', payload.vehicleNumber);
      fd.append('cnicFront', payload.cnicFront);
      fd.append('cnicBack', payload.cnicBack);
      fd.append('drivingLicense', payload.drivingLicense);
      fd.append('riderPhoto', payload.riderPhoto);

      const response = await apiClient.post<ApplicationStatusResponse>('/rider/apply', fd);
      return response;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['rider', 'application-status'] });
      qc.invalidateQueries({ queryKey: ['rider', 'profile'] });
      toast.success('Application submitted! Under review.');
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || 'Failed to submit application';
      toast.error(message);
    },
  });
}