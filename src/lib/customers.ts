// src/api/admin/customers.ts
import { apiClient } from '@/lib/api';
import type { CustomersApiResponse, Customer } from '@/types/user';

const BASE = '/admin/customers';

export const adminCustomerApi = {
  getAll: (params: { search?: string; page?: number; limit?: number }) =>
    apiClient.get<CustomersApiResponse>(BASE, { params }),

  block: (id: string) =>
    apiClient.patch<{ success: true; message: string }>(`${BASE}/${id}/block`),

  unblock: (id: string) =>
    apiClient.patch<{ success: true; message: string }>(`${BASE}/${id}/unblock`),
};