// src/features/address/hooks/useAddresses.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { Address, AddressFormData } from '../types/address.types';
import { AreaListResponse, AreaListItem } from '@/types/area';

const API_BASE = '/address';

export const useAddresses = () => {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: async (): Promise<Address[]> => {
      const res = await apiClient.get<{ success: true; addresses: Address[] }>(API_BASE);
      return res.addresses;
    },
  });
};

export const useCreateAddress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: AddressFormData) => {
      const res = await apiClient.post<{ success: true; address: Address }>(API_BASE, data);
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address saved');
    },
  });
};

export const useUpdateAddress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AddressFormData> }) => {
      const res = await apiClient.put<{ success: true; address: Address }>(`${API_BASE}/${id}`, data);
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address updated');
    },
  });
};

export const useDeleteAddress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`${API_BASE}/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address removed');
    },
  });
};

export const useSetDefaultAddress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`${API_BASE}/${id}/default`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Default updated');
    },
  });
};

export const useAreasByCity = (city: string) => {
  return useQuery<AreaListItem[]>({
    queryKey: ['areas', city],
    queryFn: async () => {
      const res = await apiClient.get<AreaListResponse>('/areas');
      return res.areas.filter(
        (a) => a.city?.toLowerCase() === city.toLowerCase()
      );
    },
    enabled: !!city,
    staleTime: 10 * 60 * 1000,
  });
};