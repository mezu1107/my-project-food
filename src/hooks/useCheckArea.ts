import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

import type { 
  DeliveryCalculateResponse, 
  DeliveryNotInServiceResponse 
} from '@/types/delivery.types';

// Hook: Check delivery availability using /api/delivery/calculate endpoint
export const useCheckArea = (lat?: number, lng?: number) => {
  return useQuery<DeliveryCalculateResponse | DeliveryNotInServiceResponse, Error>({
    queryKey: ['delivery-check', lat, lng],
    queryFn: async () => {
      if (!lat || !lng) throw new Error('Coordinates required');

      return apiClient.post<DeliveryCalculateResponse | DeliveryNotInServiceResponse>(
        '/delivery/calculate',
        { lat, lng }
      );
    },
    enabled: !!lat && !!lng,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

// Optional: List of active areas (from /api/areas)
interface SimpleArea {
  _id: string;
  name: string;
  city: string;
  center: { lat: number; lng: number };
  deliveryZone?: {
    deliveryFee: number;
    minOrderAmount: number;
    estimatedTime: string;
    isActive: boolean;
  } | null;
  hasDeliveryZone?: boolean;
}

export const useAreas = () => {
  return useQuery<SimpleArea[], Error>({
    queryKey: ['areas', 'active'],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; areas: SimpleArea[] }>('/areas');

      if (!response.success) {
        throw new Error('Failed to fetch areas');
      }

      return response.areas;
    },
    staleTime: 15 * 60 * 1000,
    retry: 1,
  });
};
