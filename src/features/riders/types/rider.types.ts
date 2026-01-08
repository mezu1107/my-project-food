// src/features/riders/types/rider.types.ts

export interface RiderDocuments {
  cnicNumber?: string;
  vehicleType?: 'bike' | 'car' | 'bicycle';
  vehicleNumber?: string;
  cnicFront?: string;
  cnicBack?: string;
  drivingLicense?: string;
  riderPhoto?: string;
}

export interface RiderProfile {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  riderStatus: 'none' | 'pending' | 'approved' | 'rejected';
  riderDocuments: RiderDocuments;
  rating: number;
  totalDeliveries: number;
  earnings: number;
  isOnline: boolean;
  isAvailable: boolean;
  currentLocation?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
}

export interface OrderItem {
  menuItem: { _id: string; name: string; image?: string; price: number };
  name: string;
  image?: string;
  priceAtOrder: number;
  quantity: number;
}

export interface DeliveryAddress {
  label: string;
  fullAddress: string;
  floor?: string;
  instructions?: string;
}

export interface RiderOrder {
  _id: string;
  status: string;
  finalAmount: number;
  placedAt: string;
  deliveredAt?: string;
  customer: { name: string; phone: string };
  address: DeliveryAddress;
  area: { name: string };
  items: OrderItem[];
}

export interface CurrentOrder extends RiderOrder {
  outForDeliveryAt?: string;
  paymentMethod: string;
}

export interface RiderProfileResponse {
  success: boolean;
  rider: RiderProfile;
}

export interface CurrentOrderResponse {
  success: boolean;
  message: string;
  currentOrder: CurrentOrder | null;
}

export interface RiderOrdersResponse {
  success: boolean;
  message: string;
  count: number;
  orders: RiderOrder[];
}

export interface ApplicationStatusResponse {
  success: boolean;
  isRider: boolean;
  riderStatus: 'none' | 'pending' | 'approved' | 'rejected';
  message: string;
  rejectionReason?: string;
}

export interface RiderActionResponse {
  success: boolean;
  message: string;
  isOnline?: boolean;
  isAvailable?: boolean;
  earningsAdded?: number;
  totalDeliveries?: number;
  collectedAmount?: number;
  paymentStatus?: string;
  status?: string;
}

export interface ApplyAsRiderPayload {
  cnicNumber: string;
  vehicleType?: 'bike' | 'car' | 'bicycle';
  vehicleNumber: string;
  cnicFront: File;
  cnicBack: File;
  drivingLicense: File;
  riderPhoto: File;
}