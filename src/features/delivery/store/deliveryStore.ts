// src/features/delivery/store/deliveryStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface DeliveryArea {
  _id: string;
  name: string;
  city: string;
  center?: LatLng;
}

export interface DeliveryInfo {
  fee: number;
  minOrder: number;
  estimatedTime: string;
}

interface DeliveryState {
  // Current selected area + delivery details
  selectedArea: DeliveryArea | null;
  deliveryInfo: DeliveryInfo | null;
  isInService: boolean;

  // User geolocation
  userLocation: LatLng | null;
  locationPermission: 'granted' | 'denied' | 'prompt' | null;

  // UI state
  isChecking: boolean;
  hasChecked: boolean;
  showModal: boolean;

  // === ACTIONS ===
  setDeliveryArea: (area: DeliveryArea | null, info: DeliveryInfo | null) => void;
  setUserLocation: (location: LatLng | null) => void;
  setLocationPermission: (status: 'granted' | 'denied' | 'prompt') => void;
  setIsChecking: (value: boolean) => void;
  setShowModal: (value: boolean) => void;
  clearDelivery: () => void;
  reset: () => void;

  // Convenience: set everything at once (used by AreaChecker)
  setDeliveryInfo: (payload: {
    areaId: string;
    areaName: string;
    city: string;
    deliveryFee: number;
    minOrderAmount: number;
    estimatedTime: string;
    center: LatLng;
  }) => void;
}

export const useDeliveryStore = create<DeliveryState>()(
  persist(
    (set) => ({
      selectedArea: null,
      deliveryInfo: null,
      isInService: false,

      userLocation: null,
      locationPermission: null,

      isChecking: false,
      hasChecked: false,
      showModal: false,

      // Set both area + delivery info together
      setDeliveryArea: (area, info) =>
        set({
          selectedArea: area,
          deliveryInfo: info,
          isInService: !!area && !!info,
          hasChecked: true,
        }),

      // New: matches what AreaChecker expects
      setDeliveryInfo: (payload) =>
        set({
          selectedArea: {
            _id: payload.areaId,
            name: payload.areaName,
            city: payload.city,
            center: payload.center,
          },
          deliveryInfo: {
            fee: payload.deliveryFee,
            minOrder: payload.minOrderAmount,
            estimatedTime: payload.estimatedTime,
          },
          isInService: true,
          hasChecked: true,
        }),

      setUserLocation: (location) => set({ userLocation: location }),

      setLocationPermission: (status) => set({ locationPermission: status }),

      setIsChecking: (value) => set({ isChecking: value }),

      setShowModal: (value) => set({ showModal: value }),

      clearDelivery: () =>
        set({
          selectedArea: null,
          deliveryInfo: null,
          isInService: false,
          hasChecked: false,
        }),

      reset: () =>
        set({
          selectedArea: null,
          deliveryInfo: null,
          isInService: false,
          userLocation: null,
          locationPermission: null,
          isChecking: false,
          hasChecked: false,
          showModal: false,
        }),
    }),
    {
      name: 'zaika-delivery-storage',
      partialize: (state) => ({
        selectedArea: state.selectedArea,
        deliveryInfo: state.deliveryInfo,
        isInService: state.isInService,
        userLocation: state.userLocation,
        hasChecked: state.hasChecked,
      }),
    }
  )
);