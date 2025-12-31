import { useDeliveryStore } from '@/lib/deliveryStore';
import type { DeliveryCalculateResponse, DeliveryNotInServiceResponse } from '@/types/delivery.types';

export const checkDeliveryAvailability = async (lat: number, lng: number, orderAmount?: number) => {
  try {
    const response = await fetch('/api/delivery/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng, orderAmount }), // Pass optional orderAmount
    });

    const data: DeliveryCalculateResponse | DeliveryNotInServiceResponse = await response.json();

    if (data.success && 'inService' in data && data.inService && 'deliverable' in data && data.deliverable) {
      useDeliveryStore.getState().setCheckResult({
        inService: true,
        deliverable: true,
        area: data.area,
        city: data.city,
        distanceKm: data.distanceKm,
        deliveryFee: data.deliveryFee,
        reason: data.reason,
        minOrderAmount: data.minOrderAmount,
        estimatedTime: data.estimatedTime,
        freeDeliveryAbove: (data as any).freeDeliveryAbove ?? undefined, // <-- include freeDeliveryAbove
      });
    } else {
      useDeliveryStore.getState().setError(data.message || 'Delivery not available');
      useDeliveryStore.getState().clearDelivery();
    }

    return data;
  } catch (error) {
    useDeliveryStore.getState().setError('Failed to check delivery availability');
    useDeliveryStore.getState().clearDelivery();
    throw error;
  }
};
