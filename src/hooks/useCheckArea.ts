// src/hooks/useCheckArea.ts
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export interface CheckAreaResponse {
  success: boolean;
  inService: boolean;
  hasDeliveryZone: boolean;
  area?: {
    _id: string;
    name: string;
    city: string;
    center: { lat: number; lng: number };
  };
  delivery?: {
    fee: number;
    minOrder: number;
    estimatedTime: string;
  };
  message?: string;
}

export interface CheckAreaState {
  loading: boolean;
  inService: boolean;
  hasDeliveryZone: boolean;
  area: { id: string; name: string; city: string } | null;
  deliveryFee: number;
  estimatedTime: string;
  message: string;
}

export const useCheckArea = (lat?: number, lng?: number): CheckAreaState => {
  const [state, setState] = useState<CheckAreaState>({
    loading: true,
    inService: false,
    hasDeliveryZone: false,
    area: null,
    deliveryFee: 149,
    estimatedTime: '35-50 min',
    message: '',
  });

  useEffect(() => {
    if (!lat || !lng) {
      setState({
        loading: false,
        inService: false,
        hasDeliveryZone: false,
        area: null,
        deliveryFee: 149,
        estimatedTime: '35-50 min',
        message: '',
      });
      return;
    }

    let canceled = false;

    const check = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));

        // apiClient.get() returns the data directly (thanks to your wrapper!)
        const data: CheckAreaResponse = await apiClient.get('/areas/check', {
          params: { lat, lng },
        });

        if (canceled) return;

        if (data.success && data.inService) {
          setState({
            loading: false,
            inService: true,
            hasDeliveryZone: data.hasDeliveryZone,
            area: data.area
              ? { id: data.area._id, name: data.area.name, city: data.area.city }
              : null,
            deliveryFee: data.delivery?.fee ?? 149,
            estimatedTime: data.delivery?.estimatedTime ?? '35-50 min',
            message: data.message ?? '',
          });
        } else {
          setState({
            loading: false,
            inService: false,
            hasDeliveryZone: false,
            area: null,
            deliveryFee: 149,
            estimatedTime: '35-50 min',
            message: data.message ?? 'Not in service area',
          });
        }
      } catch (err: any) {
        if (canceled) return;

        setState({
          loading: false,
          inService: false,
          hasDeliveryZone: false,
          area: null,
          deliveryFee: 149,
          estimatedTime: '35-50 min',
          message: err.response?.data?.message ?? 'Location check failed',
        });
      }
    };

    check();

    return () => {
      canceled = true;
    };
  }, [lat, lng]);

  return state;
};