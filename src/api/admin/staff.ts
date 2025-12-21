import { apiClient } from '@/lib/api';
import type { StaffApiResponse, StaffRole } from '@/types/staff';

const BASE = '/admin/staff';

export const staffApi = {
  getAll: async (params: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<StaffApiResponse> => {
    const res = await apiClient.get<StaffApiResponse>(`${BASE}/all`, { params });
    return res;
  },

  promote: async (
    id: string,
    role: StaffRole
  ): Promise<{ success: true; message: string }> => {
    const res = await apiClient.post<{ success: true; message: string }>(
      `${BASE}/promote/${id}`,
      { role }
    );
    return res;
  },

  demote: async (
    id: string
  ): Promise<{ success: true; message: string }> => {
    const res = await apiClient.post<{ success: true; message: string }>(
      `${BASE}/demote/${id}`
    );
    return res;
  },
};
