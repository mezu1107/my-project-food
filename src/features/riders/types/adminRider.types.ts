// src/features/riders/types/adminRider.types.ts
// Last updated: January 2026 – Full admin rider management types
// Aligned with riderAdminController.js and User model

/**
 * Documents required/submitted by riders during registration/verification
 */
export interface RiderDocuments {
  cnicNumber?: string;
  vehicleType?: 'bike' | 'car' | 'bicycle';
  vehicleNumber?: string;
  cnicFront?: string;
  cnicBack?: string;
  drivingLicense?: string;
  riderPhoto?: string;
}

/**
 * Main rider shape used across admin panel views and lists
 */
export interface AdminRider {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'rider';

  riderStatus: 'pending' | 'approved' | 'rejected';
  riderDocuments: RiderDocuments;

  // Availability & Activity
  isAvailable: boolean;
  isOnline?: boolean;           // rarely included – depends on endpoint
  isActive: boolean;

  // Moderation flags
  isBlocked?: boolean;
  isDeleted?: boolean;          // normally filtered out by backend

  // Performance & stats
  rating: number;
  totalDeliveries: number;
  earnings: number;

  // Timestamps
  createdAt: string;
  locationUpdatedAt?: string;

  // Current location (when rider is online/available)
  currentLocation?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };

  // Moderation history – mostly visible in detailed view or special lists
  blockReason?: string;
  blockedAt?: string;
  banReason?: string;
  bannedAt?: string;
  rejectionReason?: string;     // only when riderStatus === 'rejected'
}

/**
 * Aggregated statistics for rider dashboard
 * Matches exactly what /admin/rider/stats returns
 */
export interface RiderStats {
  total: number;
  available: number;
  approved: number;
  pending: number;
  rejected: number;
}

/**
 * Response shape from GET /admin/rider/stats
 */
export interface RiderStatsResponse {
  success: true;
  stats: RiderStats;
}

/**
 * Paginated list response (GET /admin/rider, /blocked, /permanently-banned, etc.)
 */
export interface AdminRidersResponse {
  success: boolean;
  riders: AdminRider[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  // availableCount?: number;   // not returned by current endpoints – removed
}

/**
 * Single rider detailed response (GET /admin/rider/:id)
 */
export interface SingleRiderResponse {
  success: boolean;
  rider: AdminRider;
}

/**
 * Common shape for most admin rider mutation/action responses
 * (status update, block, unblock, approve, reject, promote, ban, etc.)
 */
export interface AdminActionResponse {
  success: boolean;
  message: string;

  // Returned in many actions (especially status & moderation)
  rider?: {
    id: string;
    name: string;
    riderStatus?: string;
    isAvailable?: boolean;
  };

  // Special field only returned by force-assign-order endpoint
  forcedAvailable?: boolean;
}