import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DeliveryZone, UpdateDeliveryZonePayload } from '../types/area.types';
import { toast } from 'sonner';

export function useUpdateDeliveryZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ areaId, payload }: { areaId: string; payload: UpdateDeliveryZonePayload }) => {
      // Use mock for development
      const useMock = !import.meta.env.VITE_API_URL;
      
      if (useMock) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
          _id: `zone-${areaId}`,
          area: areaId,
          ...payload,
          isActive: payload.isActive ?? true,
        } as DeliveryZone;
      }
      
      const { data } = await api.put<DeliveryZone>(`/delivery-zone/${areaId}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'areas'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-zones'] });
      toast.success('Delivery zone updated!');
    },
    onError: (error: any) => {
      toast.error('Failed to update delivery zone', {
        description: error.response?.data?.message || 'Please try again',
      });
    },
  });
}
