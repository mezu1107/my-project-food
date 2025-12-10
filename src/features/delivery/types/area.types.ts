// GeoJSON Polygon format (MongoDB stores [lng, lat])
export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][]; // [[[lng, lat], [lng, lat], ...]]
}

// Frontend-friendly lat/lng point
export interface AreaCenter {
  lat: number;
  lng: number;
}

// Area model matching backend shape exactly
export interface Area {
  _id: string;
  name: string;
  city: string;
  polygon: GeoJSONPolygon;
  center: AreaCenter; // { lat, lng }
  isActive: boolean;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Delivery zone with area reference or populated object
export interface DeliveryZone {
  _id: string;
  area: string | Area;
  fee: number;           // delivery fee
  minOrder: number;      // minimum order amount
  estimatedTime: string; // estimated delivery time e.g. "30-45 min"
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Response from delivery availability check
export interface DeliveryCheckResponse {
  deliverable: boolean; // true if delivery available
  area?: {
    _id: string;
    name: string;
    city: string;
  };
  delivery?: {
    fee: number;
    minOrder: number;
    estimatedTime: string;
  };
}

// Payload sent when creating an area
export interface CreateAreaPayload {
  name: string;
  city?: string;
  center: AreaCenter;
  polygon: GeoJSONPolygon;
}

// Payload sent when updating an area (partial + extra fields)
export interface UpdateAreaPayload extends Partial<CreateAreaPayload> {
  isActive?: boolean;
  image?: string;
}

// Payload sent when updating delivery zone info
export interface UpdateDeliveryZonePayload {
  fee?: number;
  minOrder?: number;
  estimatedTime?: string;
  isActive?: boolean;
}
