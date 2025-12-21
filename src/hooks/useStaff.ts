// src/hooks/useStaff.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { staffApi } from '@/api/admin/staff';
import { toast } from 'sonner';

export const useStaff = (search = '', page = 1, limit = 50) => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, ...query } = useQuery({
    queryKey: ['admin-staff', search, page, limit],
    queryFn: () => staffApi.getAll({ search, page, limit }).then(res => res.data),
  });

  const promoteMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => staffApi.promote(id, role as any),
    onSuccess: () => {
      toast.success('User promoted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to promote'),
  });

  const demoteMutation = useMutation({
    mutationFn: (id: string) => staffApi.demote(id),
    onSuccess: () => {
      toast.success('Staff demoted to customer');
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to demote'),
  });

  return {
    users: data?.users ?? [],
  pagination: data?.pagination,
    isLoading,
    isError,
    promoteUser: (id: string, role: string) => promoteMutation.mutate({ id, role }),
    demoteUser: (id: string) => demoteMutation.mutate(id),
    isPromoting: promoteMutation.isPending,
    isDemoting: demoteMutation.isPending,
    ...query,
  };
};