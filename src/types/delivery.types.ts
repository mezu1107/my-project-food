export interface LatLng {
  lat: number;
  lng: number;
}

// Matches backend DeliveryZone model exactly
export interface DeliveryZone {
  _id: string;
  area: string;
  feeStructure: 'flat' | 'distance';
  deliveryFee: number;        // Used when flat
  baseFee: number;            // Used when distance
  distanceFeePerKm: number;   // Used when distance
  maxDistanceKm: number;      // Used when distance
  minOrderAmount: number;
  estimatedTime: string;
  isActive: boolean;
  freeDeliveryAbove?: number; // NEW FIELD
  createdAt?: string;
  updatedAt?: string;
}

// Matches backend Area model (minimal for frontend)
export interface Area {
  _id: string;
  name: string;
  city: string;
  center: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  centerLatLng?: LatLng;
  isActive: boolean;
}

// Response from /api/delivery/calculate
export interface DeliveryCalculateResponse {
  success: true;
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
  message?: string;
}

// Fallback response when not in service
export interface DeliveryNotInServiceResponse {
  success: true;
  inService: false;
  message: string;
}
