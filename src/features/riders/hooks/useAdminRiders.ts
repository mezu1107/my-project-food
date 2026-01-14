// src/features/riders/hooks/useAdminRiders.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import type {
  AdminRidersResponse,
  RiderStatsResponse,
  SingleRiderResponse,
  AdminActionResponse,
  AdminRider,
  RiderStats,
} from '../types/adminRider.types';
import type { RiderDocuments } from '../types/rider.types';

// =============================
// QUERIES
// =============================

/**
 * Fetch paginated list of riders with optional search & status filter
 */
export function useAdminRiders(params?: {
  search?: string;
  status?: 'all' | 'pending' | 'approved' | 'rejected';
  page?: number;
  limit?: number;
}) {
  return useQuery<AdminRidersResponse, Error>({
    queryKey: ['admin', 'riders', 'list', params],
    queryFn: () =>
      apiClient.get<AdminRidersResponse>('/admin/rider', {
        params: {
          search: params?.search?.trim() || undefined,
          status: params?.status === 'all' ? undefined : params?.status,
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
        },
      }),
    staleTime: 2 * 60 * 1000, // 2 minutes - good balance for list view
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Get aggregated rider statistics for dashboard
 */
export function useRiderStats() {
  return useQuery<RiderStats, Error>({
    queryKey: ['admin', 'riders', 'stats'],
    queryFn: async () => {
      const { stats } = await apiClient.get<RiderStatsResponse>('/admin/rider/stats');
      return stats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - stats don't change very frequently
    gcTime: 15 * 60 * 1000,
  });
}

/**
 * Get detailed information about a single rider
 */
export function useAdminRider(id: string | undefined) {
  return useQuery<AdminRider, Error>({
    queryKey: ['admin', 'rider', id],
    enabled: !!id,
    queryFn: async () => {
      const { rider } = await apiClient.get<SingleRiderResponse>(`/admin/rider/${id}`);
      return rider;
    },
    staleTime: 4 * 60 * 1000, // Slightly longer cache - detailed view changes less often
  });
}

/**
 * Get list of currently blocked riders
 */
export function useBlockedRiders(page = 1, limit = 20) {
  return useQuery<AdminRidersResponse, Error>({
    queryKey: ['admin', 'riders', 'blocked', { page, limit }],
    queryFn: () =>
      apiClient.get<AdminRidersResponse>('/admin/rider/blocked', {
        params: { page, limit },
      }),
    staleTime: 90 * 1000, // Blocked list changes infrequently
  });
}

/**
 * Get list of permanently banned riders
 */
export function usePermanentlyBannedRiders(page = 1, limit = 20) {
  return useQuery<AdminRidersResponse, Error>({
    queryKey: ['admin', 'riders', 'permanently-banned', { page, limit }],
    queryFn: () =>
      apiClient.get<AdminRidersResponse>('/admin/rider/permanently-banned', {
        params: { page, limit },
      }),
    staleTime: 120 * 1000, // Banned list almost never changes
  });
}

/**
 * Get currently available riders — critical for manual order assignment
 * Very frequent refetching because availability changes constantly
 */
export function useAvailableRidersForAssignment(params: {
  area?: string;
  page?: number;
  limit?: number;
} = {}) {
  return useQuery<AdminRider[], Error>({
    queryKey: ['admin', 'riders', 'available', params],
    queryFn: async () => {
      const response = await apiClient.get<AdminRidersResponse>('/admin/rider/available', {
        params: {
          area: params.area || undefined,
          page: params.page ?? 1,
          limit: params.limit ?? 50,
        },
      });
      return response.riders;
    },
    staleTime: 45 * 1000,           // 45 seconds - freshness vs server load balance
    gcTime: 5 * 60 * 1000,
    refetchInterval: 25 * 1000,     // Every 25 seconds - good for assignment screen
    refetchOnWindowFocus: true,     // Very useful in admin panel
    placeholderData: () => [],      // Prevents layout shift / flicker
  });
}

// =============================
// MUTATIONS
// =============================

export function useUpdateRiderStatus() {
  const queryClient = useQueryClient();

  return useMutation<
    AdminActionResponse,
    Error,
    { id: string; riderStatus: 'pending' | 'approved' | 'rejected' }
  >({
    mutationFn: ({ id, riderStatus }) =>
      apiClient.patch<AdminActionResponse>(`/admin/rider/${id}/status`, { riderStatus }),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'riders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'rider'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'riders', 'stats'] });
      toast.success(data.message);
    },
    onError: () => toast.error('Failed to update rider status'),
  });
}

export function useApproveRider() {
  const queryClient = useQueryClient();

  return useMutation<AdminActionResponse, Error, string>({
    mutationFn: (id) => apiClient.patch<AdminActionResponse>(`/admin/rider/${id}/approve`),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'riders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'riders', 'stats'] });
      toast.success(data.message || 'Rider approved successfully');
    },
    onError: () => toast.error('Failed to approve rider'),
  });
}

export function useRejectRider() {
  const queryClient = useQueryClient();

  return useMutation<AdminActionResponse, Error, { id: string; reason: string }>({
    mutationFn: ({ id, reason }) =>
      apiClient.patch<AdminActionResponse>(`/admin/rider/${id}/reject`, { reason }),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'riders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'riders', 'stats'] });
      toast.success(data.message || 'Application rejected successfully');
    },
    onError: () => toast.error('Failed to reject application'),
  });
}

export function usePromoteToRider() {
  const queryClient = useQueryClient();

  return useMutation<
    AdminActionResponse,
    Error,
    { id: string; riderDocuments?: Partial<RiderDocuments> }
  >({
    mutationFn: ({ id, riderDocuments }) =>
      apiClient.post<AdminActionResponse>(`/admin/rider/${id}/promote-to-rider`, riderDocuments ?? {}),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'riders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'riders', 'stats'] });
      toast.success(data.message || 'User successfully promoted to rider');
    },
    onError: () => toast.error('Failed to promote user to rider'),
  });
}

export function useBlockRider() {
  const queryClient = useQueryClient();

  return useMutation<AdminActionResponse, Error, { id: string; reason: string }>({
    mutationFn: ({ id, reason }) =>
      apiClient.patch<AdminActionResponse>(`/admin/rider/${id}/block`, { reason }),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'riders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'riders', 'blocked'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'riders', 'stats'] });
      toast.success(data.message || 'Rider blocked successfully');
    },
    onError: () => toast.error('Failed to block rider'),
  });
}

export function useUnblockRider() {
  const queryClient = useQueryClient();

  return useMutation<AdminActionResponse, Error, string>({
    mutationFn: (id) => apiClient.patch<AdminActionResponse>(`/admin/rider/${id}/unblock`),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'riders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'riders', 'blocked'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'riders', 'stats'] });
      toast.success(data.message || 'Rider unblocked successfully');
    },
    onError: () => toast.error('Failed to unblock rider'),
  });
}

export function useSoftDeleteRider() {
  const queryClient = useQueryClient();

  return useMutation<AdminActionResponse, Error, string>({
    mutationFn: (id) => apiClient.delete<AdminActionResponse>(`/admin/rider/${id}/soft-delete`),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'riders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'riders', 'stats'] });
      toast.success(data.message || 'Rider account soft-deleted');
    },
    onError: () => toast.error('Failed to soft-delete rider'),
  });
}

export function useRestoreRider() {
  const queryClient = useQueryClient();

  return useMutation<AdminActionResponse, Error, string>({
    mutationFn: (id) => apiClient.patch<AdminActionResponse>(`/admin/rider/${id}/restore`),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'riders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'riders', 'stats'] });
      toast.success(data.message || 'Rider account restored');
    },
    onError: () => toast.error('Failed to restore rider'),
  });
}

export function usePermanentlyBanRider() {
  const queryClient = useQueryClient();

  return useMutation<AdminActionResponse, Error, { id: string; reason: string }>({
    mutationFn: ({ id, reason }) =>
      apiClient.post<AdminActionResponse>(`/admin/rider/${id}/permanent-ban`, { reason }),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'riders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'riders', 'permanently-banned'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'riders', 'stats'] });
      toast.success(data.message || 'Rider has been permanently banned');
    },
    onError: () => toast.error('Failed to permanently ban rider'),
  });
}

/**
 * Admin force-assign rider to an order (with forced availability support)
 */
export function useAdminAssignRider() {
  const queryClient = useQueryClient();

  return useMutation<
    AdminActionResponse,
    Error,
    { orderId: string; riderId: string }
  >({
    mutationFn: ({ orderId, riderId }) =>
      apiClient.patch<AdminActionResponse>(`/admin/rider/${orderId}/assign-rider`, { riderId }),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'riders', 'available'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'riders', 'stats'] });

      toast.success(
        data.forcedAvailable
          ? 'Rider assigned (was forced available)'
          : 'Rider assigned successfully',
        {
          description: data.forcedAvailable
            ? 'Rider was automatically set to available for this order'
            : undefined,
          duration: data.forcedAvailable ? 6000 : 4000,
        }
      );
    },

    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || 'Failed to assign rider to order',
        { duration: 7000 }
      );
    },
  });
}