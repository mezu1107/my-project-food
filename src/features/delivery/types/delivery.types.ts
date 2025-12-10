// GeoJSON types matching MongoDB format (backend stores [lng, lat])
export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][]; // [[[lng, lat], [lng, lat], ...]] - MongoDB format
}

export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat] - MongoDB format
}

// Frontend-friendly center format (what we send to backend)
export interface LatLng {
  lat: number;
  lng: number;
}

// Area model matching backend exactly
export interface Area {
  _id: string;
  id?: string; // virtual
  name: string;
  city: string;
  polygon: GeoJSONPolygon;
  center: GeoJSONPoint;
  centerLatLng?: LatLng; // Virtual from backend
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Delivery Zone model matching backend exactly
export interface DeliveryZone {
  _id: string;
  area: string | Area;
  deliveryFee: number;
  minOrderAmount: number;
  estimatedTime: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Area with its delivery zone (from getAreaById)
export interface AreaWithZone {
  area: Area;
  deliveryZone: DeliveryZone | null;
}

// ==================== API PAYLOADS ====================

// Frontend sends [lat, lng] format, backend converts to MongoDB [lng, lat]
export interface CreateAreaPayload {
  name: string;
  city?: string;
  center: LatLng;
  polygon: {
    type: 'Polygon';
    coordinates: number[][][]; // Frontend sends [[lat, lng], ...] per ring
  };
}

export interface UpdateAreaPayload extends Partial<CreateAreaPayload> {}

export interface UpdateDeliveryZonePayload {
  deliveryFee?: number;
  minOrderAmount?: number;
  estimatedTime?: string;
  isActive?: boolean;
}

// ==================== API RESPONSES ====================

// GET /api/admin/areas response
export interface AdminAreasResponse {
  success: boolean;
  areas: Area[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// GET /api/admin/area/:id response
export interface AdminAreaByIdResponse {
  success: boolean;
  area: Area;
  deliveryZone: DeliveryZone | null;
}

// POST /api/admin/area response
export interface CreateAreaResponse {
  success: boolean;
  message: string;
  area: Area;
}

// PUT /api/admin/area/:id response
export interface UpdateAreaResponse {
  success: boolean;
  message: string;
  area: Area;
}

// PUT /api/admin/delivery-zone/:areaId response
export interface UpdateDeliveryZoneResponse {
  success: boolean;
  message: string;
  zone: DeliveryZone;
}

// GET /api/areas/check response (public)
export interface DeliveryCheckResponse {
  success: boolean;
  inService: boolean;
  area?: {
    _id: string;
    name: string;
    city: string;
    center: LatLng;
  };
  delivery?: {
    fee: number;
    minOrder: number;
    estimatedTime: string;
  };
  message: string;
}

// GET /api/areas response (public)
export interface PublicAreasResponse {
  success: boolean;
  areas: Array<{
    _id: string;
    name: string;
    city: string;
    center: LatLng;
  }>;
}

// ==================== FORM TYPES ====================

export interface AreaFormData {
  name: string;
  city: string;
  deliveryFee: number;
  minOrderAmount: number;
  estimatedTime: string;
  isDeliveryActive: boolean;
}
