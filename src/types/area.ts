// src/types/area.ts

// === GeoJSON Types ===
export interface GeoPoint {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude] — MongoDB standard
}

export interface GeoPolygon {
  type: "Polygon";
  coordinates: [number, number][][]; // [[[lng, lat], ...]]
}

// === Delivery Zone ===
export interface DeliveryZone {
  _id: string;
  deliveryFee: number;
  minOrderAmount: number;
  estimatedTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// === Area Model (with frontend virtuals) ===
export interface Area {
  _id: string;
  name: string;
  city: string;
  center: GeoPoint;
  centerLatLng: { lat: number; lng: number }; // Virtual: computed on backend
  polygon?: GeoPolygon;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deliveryZone?: DeliveryZone | null;
}

// === API Response Types ===
export interface AreasResponse {
  success: boolean;
  areas: Area[];
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

// src/types/area.ts
export interface CheckAreaResponse {
  success: boolean;
  inService: boolean;
  hasDeliveryZone: boolean;
  area?: {
    _id: string;
    name: string;
    city: string;
    center: { lat: number; lng: number }; // from centerLatLng virtual
  };
  delivery?: {
    fee: number;
    minOrder: number;
    estimatedTime: string;
  };
  message?: string;
}
// === Menu Types (keep here or move to menu.types.ts if preferred) ===
export type MenuCategory = "breakfast" | "lunch" | "dinner" | "desserts" | "beverages";

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
  area: Area | null;
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