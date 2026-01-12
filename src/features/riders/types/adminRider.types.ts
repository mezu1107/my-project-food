// src/features/riders/types/adminRider.types.ts

export interface RiderDocuments {
  cnicNumber?: string;
  vehicleType?: 'bike' | 'car' | 'bicycle';
  vehicleNumber?: string;
  cnicFront?: string;
  cnicBack?: string;
  drivingLicense?: string;
  riderPhoto?: string;
}

export interface AdminRider {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  riderStatus: 'pending' | 'approved' | 'rejected';
  riderDocuments: RiderDocuments;
  isOnline: boolean;
  isAvailable: boolean;
  rating: number;
  totalDeliveries: number;
  earnings: number;
  createdAt: string;
  blockReason?: string;
  blockedAt?: string;
  banReason?: string;
  bannedAt?: string;
}

export interface RiderStats {
  total: number;
  online: number;
  available: number;
  approved: number;
  pending: number;
  rejected: number;
}
export interface AdminRidersResponse {
  success: boolean;
  riders: AdminRider[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    availableCount?: number;
  };
  message?: string;
}

export interface RiderStatsResponse {
  success: true;
  stats: RiderStats;
}

export interface SingleRiderResponse {
  success: true;
  rider: AdminRider;
}

export interface AdminActionResponse {
  success: true;
  message: string;
  rider?: { id: string; name: string; riderStatus?: string };
  forcedOnline?: boolean;
}