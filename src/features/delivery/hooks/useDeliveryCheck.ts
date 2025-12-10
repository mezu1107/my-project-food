import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useDeliveryStore } from '../store/deliveryStore';
import type { DeliveryCheckResponse } from '../types/delivery.types';
import { findAreaByCoordinates } from '../data/mockAreas';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

// Mock delivery check using our mock data
const mockDeliveryCheck = async (lat: number, lng: number): Promise<DeliveryCheckResponse> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const { area, zone } = findAreaByCoordinates(lat, lng);
  
  if (!area) {
    return {
      success: true,
      inService: false,
      message: 'Sorry, we do not deliver to this location yet'
    };
  }
  
  if (!zone) {
    return {
      success: true,
      inService: false,
      message: 'Area exists but delivery not active yet'
    };
  }
  
  return {
    success: true,
    inService: true,
    area: {
      _id: area._id,
      name: area.name,
      city: area.city,
      center: area.centerLatLng || { lat: area.center.coordinates[1], lng: area.center.coordinates[0] }
    },
    delivery: {
      fee: zone.deliveryFee,
      minOrder: zone.minOrderAmount,
      estimatedTime: zone.estimatedTime
    },
    message: 'Delivery available'
  };
};

export function useDeliveryCheck() {
  const { setDeliveryArea, setIsChecking } = useDeliveryStore();

  return useMutation({
    mutationFn: async ({ lat, lng }: { lat: number; lng: number }) => {
      // Use mock data for development
      const useMock = !import.meta.env.VITE_API_URL;
      
      if (useMock) {
        return mockDeliveryCheck(lat, lng);
      }
      
      // Real API call: GET /api/areas/check?lat=&lng=
      const { data } = await api.get<DeliveryCheckResponse>('/areas/check', {
        params: { lat, lng },
      });
      return data;
    },
    onMutate: () => {
      setIsChecking(true);
    },
    onSuccess: (data) => {
      setIsChecking(false);
      
      if (data.inService && data.area && data.delivery) {
        setDeliveryArea(data.area, data.delivery);
        
        // Celebration!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f97316', '#fb923c', '#fdba74'],
        });
        
        toast.success(`Welcome to ${data.area.name}!`, {
          description: `Delivery in ${data.delivery.estimatedTime}`,
        });
      } else {
        setDeliveryArea(null, null);
        toast.error('Coming soon to your area!', {
          description: data.message || 'We\'re expanding rapidly. Check back soon!',
        });
      }
    },
    onError: (error) => {
      setIsChecking(false);
      console.error('Delivery check failed:', error);
      toast.error('Failed to check delivery area');
    },
  });
}
