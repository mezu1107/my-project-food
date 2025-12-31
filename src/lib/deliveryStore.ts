// src/lib/deliveryStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ==================== CORE TYPES ====================

export interface LatLng {
  lat: number;
  lng: number;
}

export interface DeliveryArea {
  _id: string;
  name: string;
  city: string;
  centerLatLng?: LatLng;
}

export interface DeliveryInfo {
  deliveryFee: number;
  minOrderAmount: number;
  estimatedTime: string;
  feeStructure?: 'flat' | 'distance';  // Make optional
  baseFee?: number;
  distanceFeePerKm?: number;
  maxDistanceKm?: number;
}

export interface DeliveryCheckResult {
  inService: boolean;
  deliverable: boolean;
  area: string;
  city: string;
  distanceKm: string;
  deliveryFee: number;
  reason: string;
  minOrderAmount: number;
  estimatedTime: string;
  freeDeliveryAbove?: number; // NEW FIELD
}


export interface DeliveryState {
  // Current delivery status
  selectedArea: DeliveryArea | null;
  deliveryInfo: DeliveryInfo | null;
  checkResult: DeliveryCheckResult | null;
  isInService: boolean;
  isDeliverable: boolean;

  // User location
  userLocation: LatLng | null;
  locationPermission: 'granted' | 'denied' | 'prompt' | null;

  // UI state
  isChecking: boolean;
  hasChecked: boolean;
  showModal: boolean;
  errorMessage: string | null;

  // Actions
  setDeliveryArea: (area: DeliveryArea | null, delivery: DeliveryInfo | null) => void;
  setCheckResult: (result: DeliveryCheckResult | null) => void;
  setUserLocation: (lat: number, lng: number) => void;
  setLocationPermission: (status: 'granted' | 'denied' | 'prompt') => void;
  setIsChecking: (checking: boolean) => void;
  setShowModal: (show: boolean) => void;
  setError: (msg: string | null) => void;
  clearDelivery: () => void;
  reset: () => void;
}

export const useDeliveryStore = create<DeliveryState>()(
  persist(
    (set) => ({
      // Initial state
      selectedArea: null,
      deliveryInfo: null,
      checkResult: null,
      isInService: false,
      isDeliverable: false,
      userLocation: null,
      locationPermission: null,
      isChecking: false,
      hasChecked: false,
      showModal: false,
      errorMessage: null,

      // Actions
      setDeliveryArea: (area, delivery) =>
        set({
          selectedArea: area,
          deliveryInfo: delivery,
          isInService: !!area,
          hasChecked: true,
        }),

      setCheckResult: (result) =>
        set({
          checkResult: result,
          isInService: result ? result.inService : false,
          isDeliverable: result ? result.deliverable : false,
          selectedArea: result
            ? { _id: '', name: result.area, city: result.city }
            : null,
          deliveryInfo: result
            ? {
                deliveryFee: result.deliveryFee,
                minOrderAmount: result.minOrderAmount,
                estimatedTime: result.estimatedTime,
                feeStructure: result.reason.includes('Distance-based') ? 'distance' : 'flat',
              }
            : null,
          hasChecked: true,
        }),

      setUserLocation: (lat, lng) =>
        set({ userLocation: { lat, lng } }),

      setLocationPermission: (status) =>
        set({ locationPermission: status }),

      setIsChecking: (checking) =>
        set({ isChecking: checking }),

      setShowModal: (show) =>
        set({ showModal: show }),

      setError: (msg) =>
        set({ errorMessage: msg }),

      clearDelivery: () =>
        set({
          selectedArea: null,
          deliveryInfo: null,
          checkResult: null,
          isInService: false,
          isDeliverable: false,
          hasChecked: false,
          errorMessage: null,
        }),

      reset: () =>
        set({
          selectedArea: null,
          deliveryInfo: null,
          checkResult: null,
          isInService: false,
          isDeliverable: false,
          userLocation: null,
          locationPermission: null,
          isChecking: false,
          hasChecked: false,
          showModal: false,
          errorMessage: null,
        }),
    }),
    {
      name: 'zaika-delivery-storage',
      partialize: (state) => ({
        selectedArea: state.selectedArea,
        deliveryInfo: state.deliveryInfo,
        checkResult: state.checkResult,
        isInService: state.isInService,
        userLocation: state.userLocation,
        hasChecked: state.hasChecked,
      }),
    }
  )
);