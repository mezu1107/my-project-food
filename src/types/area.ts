// src/types/area.ts
// Consolidated & cleaned version — December 31, 2025
// Removed duplicates, improved naming clarity, better separation of concerns

// ───────────────────────────────
//          Geo Types
// ───────────────────────────────

/** Human/Leaflet friendly coordinate pair */
export interface LatLng {
  lat: number;
  lng: number;
}
// Add near the other response interfaces
export interface ToggleDeliveryZoneResponse {
  success: boolean;
  message: string;
  deliveryZone: DeliveryZone;
  hasDeliveryZone: boolean;
  area: {
    _id: string;
    name: string;
    city: string;
    isActive: boolean;
  };
}
/** MongoDB GeoJSON Point (stored format) */
export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

/** MongoDB GeoJSON Polygon (stored format) */
export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: [number, number][][]; // [[[lng,lat], ...]]
}

/** Leaflet format — array of rings where each point is [lat, lng] */
export type LeafletPolygon = [number, number][][];

// ───────────────────────────────
//       Area Core Types
// ───────────────────────────────

/** Data shape when creating/updating area from frontend (admin) */
export interface AreaInput {
  name: string;
  city?: string;
  center: LatLng;
  polygon: GeoJSONPolygon;           // usually sent as-is from Leaflet
  // Optional - rarely needed since backend can convert
  mongoPolygon?: GeoJSONPolygon;
}

/** Full area shape returned by admin endpoints (with helpers) */
export interface AreaAdmin {
  _id: string;
  name: string;
  city: string;
  center: GeoJSONPoint;
  polygon: GeoJSONPolygon;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;

  // Added by backend controllers for admin convenience
  centerLatLng: LatLng | null;
  polygonLatLng: LeafletPolygon | null;

  deliveryZone: DeliveryZone | null;
  hasDeliveryZone: boolean;
}

/** Lightweight version for lists, dropdowns, map markers */
export interface AreaListItem {
  _id: string;
  name: string;
  city: string;
  centerLatLng: LatLng | null;
  isActive: boolean;
  hasDeliveryZone: boolean;
  deliveryZone?: DeliveryZone | null;
}

/** Minimal area information used in customer-facing context */
// src/types/area.ts

export interface PublicArea {
  _id: string;
  name: string;
  city: string;
  centerLatLng: LatLng;                  // required
  deliveryZone?: DeliveryZone | null;    // ← ADD THIS
}

// ───────────────────────────────
//       Delivery Zone
// ───────────────────────────────

export interface DeliveryZone {
  _id: string;
  area: string; // Area _id
  feeStructure: 'flat' | 'distance';

  // Flat fee branch
  deliveryFee?: number;

  // Distance-based branch
  baseFee?: number;
  distanceFeePerKm?: number;
  maxDistanceKm?: number;

  minOrderAmount: number;
  estimatedTime: string;
  isActive: boolean;
  freeDeliveryAbove?: number; // NEW: minimum order for free delivery
  createdAt?: string;
  updatedAt?: string;
}


// ───────────────────────────────
//         API Responses
// ───────────────────────────────

export interface AreaListResponse {
  success: boolean;
  message: string;
  areas: AreaAdmin[]; // or AreaListItem[] in list views
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface SingleAreaResponse {
  success: boolean;
  message: string;
  area: AreaAdmin;
  deliveryZone: DeliveryZone | null;
}

export interface AreaToggleResponse {
  success: boolean;
  message: string;
  area: {
    _id: string;
    name: string;
    isActive: boolean;
  };
}

/** Response from customer location check / calculateDeliveryFee */
export interface LocationCheckResponse {
  success: boolean;
  inService: boolean;
  deliverable?: boolean;
  area?: {
    _id: string;
    name: string;
    city: string;
  };
  distanceKm?: string;
  deliveryFee?: number;
  minOrderAmount?: number;
  estimatedTime?: string;
  reason?: string;
  message?: string;
}

// ───────────────────────────────
//         Menu Types
// (kept here for now — consider moving to menu.types.ts later)
// ───────────────────────────────

export type MenuCategory =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'desserts'
  | 'beverages';

export interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: MenuCategory;
  isVeg: boolean;
  isSpicy: boolean;
  isAvailable: boolean;
  availableInAreas: string[];
  image: string;
  createdAt: string;
  updatedAt: string;
  featured?: boolean;
}

export interface DeliveryInfo {
  deliveryFee: number;
  estimatedTime: string;
  isActive: boolean;
}

export interface MenuByLocationResponse {
  success: boolean;
  inService: boolean;
  area: PublicArea | null;
  delivery: DeliveryInfo | null;
  menu: MenuItem[];
  message?: string;
}

export interface FullMenuCatalogResponse {
  success: boolean;
  message: string;
  totalItems: number;
  menu: MenuItem[];
}