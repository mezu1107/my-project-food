import { apiClient } from '@/lib/api';
import type { CustomersApiResponse, ActionApiResponse } from '@/types/user';

const BASE = '/admin/customers';

export const adminCustomerApi = {
  getAll: async (params: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<CustomersApiResponse> => {
    const res = await apiClient.get<CustomersApiResponse>(BASE, { params });
    return res;
  },

  block: async (id: string): Promise<ActionApiResponse> => {
    const res = await apiClient.patch<ActionApiResponse>(
      `${BASE}/${id}/block`
    );
    return res;
  },

  unblock: async (id: string): Promise<ActionApiResponse> => {
    const res = await apiClient.patch<ActionApiResponse>(
      `${BASE}/${id}/unblock`
    );
    return res;
  },
};
