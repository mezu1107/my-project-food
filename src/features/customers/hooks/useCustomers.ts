// src/hooks/useCustomers.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminCustomerApi } from '@/api/admin/customers';
import { toast } from 'sonner';
import type { CustomersApiResponse } from '@/types/user';

export const useCustomers = (search = '', page = 1, limit = 50) => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, ...restQuery } = useQuery({
    queryKey: ['admin-customers', search, page, limit],
    queryFn: async () => {
      const response = await adminCustomerApi.getAll({ search, page, limit });
      return response.data; // Returns { users, pagination }
    },
  });

const blockMutation = useMutation({
  mutationFn: (id: string) => adminCustomerApi.block(id),
  onSuccess: () => {
    toast.success('Customer blocked');
    queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
  },
  onError: () => toast.error('Failed to block customer'),
});

const unblockMutation = useMutation({
  mutationFn: (id: string) => adminCustomerApi.unblock(id),
  onSuccess: () => {
    toast.success('Customer unblocked');
    queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
  },
  onError: () => toast.error('Failed to unblock customer'),
});


  return {
    customers: data?.users || [],
    pagination: data?.pagination,
    isLoading,
    isError,
    blockCustomer: (id: string) => blockMutation.mutate(id),
    unblockCustomer: (id: string) => unblockMutation.mutate(id),
    isBlocking: blockMutation.isPending,
    isUnblocking: unblockMutation.isPending,
    ...restQuery,
  };
};