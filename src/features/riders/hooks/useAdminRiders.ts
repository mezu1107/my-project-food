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
import type { RiderDocuments } from '../types/rider.types'; // If used in promote mutation

// =============================
// QUERIES
// =============================

export function useAdminRiders(params?: {
  search?: string;
  status?: 'all' | 'pending' | 'approved' | 'rejected';
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['admin', 'riders', 'list', params],
    queryFn: async () => {
      return await apiClient.get<AdminRidersResponse>('/admin/rider', {
        params: {
          search: params?.search?.trim() || undefined,
          status: params?.status === 'all' ? undefined : params?.status,
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
        },
      });
      // ← No .data needed — apiClient already returns res.data
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useRiderStats() {
  return useQuery({
    queryKey: ['admin', 'riders', 'stats'],
    queryFn: async () => {
      const response = await apiClient.get<RiderStatsResponse>('/admin/rider/stats');
      return response.stats;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminRider(id: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'rider', id],
    enabled: !!id,
    queryFn: async () => {
      const response = await apiClient.get<SingleRiderResponse>(`/admin/rider/${id}`);
      return response.rider;
    },
  });
}

export function useBlockedRiders(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['admin', 'riders', 'blocked', { page, limit }],
    queryFn: async () => {
      return await apiClient.get<AdminRidersResponse>('/admin/rider/blocked', {
        params: { page, limit },
      });
    },
  });
}

export function usePermanentlyBannedRiders(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['admin', 'riders', 'banned', { page, limit }],
    queryFn: async () => {
      return await apiClient.get<AdminRidersResponse>('/admin/rider/permanently-banned', {
        params: { page, limit },
      });
    },
  });
}

export function useAvailableRidersForAssignment(params: { area?: string; page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ['admin', 'riders', 'available', params],
    queryFn: async () => {
      const response = await apiClient.get<AdminRidersResponse>('/admin/rider/available', {
        params: {
          area: params.area || undefined,
          page: params.page ?? 1,
          limit: params.limit ?? 50, // Higher limit for assignment dropdown
        },
      });
      return response.riders; // Return just riders array
    },
    staleTime: 60 * 1000, // 1min - real-time critical
    refetchInterval: 30 * 1000, // Auto-refresh every 30s
    placeholderData: [],
  });
}
// =============================
// MUTATIONS
// =============================

export function useUpdateRiderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, riderStatus }: { id: string; riderStatus: 'pending' | 'approved' | 'rejected' }) => {
      return await apiClient.patch<AdminActionResponse>(`/admin/rider/${id}/status`, { riderStatus });
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['admin', 'riders'] });
      qc.invalidateQueries({ queryKey: ['admin', 'rider'] });
      toast.success(data.message);
    },
    onError: () => toast.error('Failed to update rider status'),
  });
}

export function useApproveRider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.patch<AdminActionResponse>(`/admin/rider/${id}/approve`);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['admin', 'riders'] });
      toast.success(data.message);
    },
  });
}

export function useRejectRider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return await apiClient.patch<AdminActionResponse>(`/admin/rider/${id}/reject`, { reason });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'riders'] });
      toast.success('Application rejected');
    },
    onError: () => toast.error('Failed to reject application'),
  });
}

export function usePromoteToRider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, riderDocuments }: { id: string; riderDocuments?: Partial<RiderDocuments> }) => {
      return await apiClient.post<AdminActionResponse>(`/admin/rider/${id}/promote-to-rider`, riderDocuments || {});
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'riders'] });
      toast.success('User promoted to rider');
    },
  });
}

export function useBlockRider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return await apiClient.patch<AdminActionResponse>(`/admin/rider/${id}/block`, { reason });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'riders'] });
      toast.success('Rider blocked');
    },
  });
}

export function useUnblockRider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.patch<AdminActionResponse>(`/admin/rider/${id}/unblock`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'riders'] });
      qc.invalidateQueries({ queryKey: ['admin', 'riders', 'blocked'] });
      toast.success('Rider unblocked');
    },
  });
}

export function useSoftDeleteRider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete<AdminActionResponse>(`/admin/rider/${id}/soft-delete`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'riders'] });
      toast.success('Rider soft-deleted');
    },
  });
}

export function useRestoreRider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.patch<AdminActionResponse>(`/admin/rider/${id}/restore`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'riders'] });
      toast.success('Rider restored');
    },
  });
}

export function usePermanentlyBanRider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return await apiClient.post<AdminActionResponse>(`/admin/rider/${id}/permanent-ban`, { reason });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'riders'] });
      qc.invalidateQueries({ queryKey: ['admin', 'riders', 'banned'] });
      toast.success('Rider permanently banned');
    },
  });
}

export function useAdminAssignRider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, riderId }: { orderId: string; riderId: string }) => {
      return await apiClient.patch<AdminActionResponse>(`/admin/rider/${orderId}/assign-rider`, { riderId });
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast.success(data.forcedOnline ? 'Rider assigned (forced online)' : 'Rider assigned');
    },
    onError: () => toast.error('Failed to assign rider'),
  });
}