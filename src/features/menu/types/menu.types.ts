// src/features/menu/types/menu.types.ts

export type MenuCategory = 'breakfast' | 'lunch' | 'dinner' | 'desserts' | 'beverages';

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: MenuCategory;
  isVeg: boolean;
  isSpicy: boolean;
  isAvailable: boolean;
  availableInAreas: string[];
  createdAt: string;
  updatedAt: string;
  featured?: boolean;
}

export interface AreaInfo {
  _id: string;
  name: string;
  city: string;
  center: { lat: number; lng: number };
}

export interface DeliveryInfo {
  fee: number;
  minOrder?: number;
  estimatedTime: string;
}

export interface MenuByLocationResponse {
  success: boolean;
  inService: boolean;
  area?: {
    _id: string;
    name: string;
    city: string;
    center: { lat: number; lng: number };
  };
  delivery?: {
    fee: number;
    estimatedTime: string;
  };
  menu: MenuItem[];
  message?: string;
}

export interface FullMenuCatalogResponse {
  success: boolean;
  message: string;
  totalItems: number;
  menu: MenuItem[];
}

export interface MenuByAreaResponse {
  success: boolean;
  message?: string; // ✅ added
  area: AreaInfo;
  totalItems: number;
  menu: MenuItem[];
}

export interface MenuFiltersResponse {
  success: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  items: MenuItem[];
}

export interface AdminMenuResponse {
  success: boolean;
  items: MenuItem[];
}

export interface SingleMenuItemResponse {
  success: boolean;
  message?: string; // ✅ added
  item: MenuItem;
}

export interface MenuMutationResponse {
  success: boolean;
  message: string;
  item: MenuItem;
}

export interface MenuDeleteResponse {
  success: boolean;
  message: string;
}

export interface CreateMenuItemPayload {
  name: string;
  description?: string;
  price: number;
  category: MenuCategory;
  isVeg?: boolean;
  isSpicy?: boolean;
  availableInAreas?: string[];
  image: File;
}

export interface UpdateMenuItemPayload {
  name?: string;
  description?: string;
  price?: number;
  category?: MenuCategory;
  isVeg?: boolean;
  isSpicy?: boolean;
  isAvailable?: boolean;
  availableInAreas?: string[];
  image?: File;
}

export interface MenuFilterParams {
  page?: number;
  limit?: number;
  category?: MenuCategory;
  isVeg?: boolean;
  isSpicy?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'category_asc';
  availableOnly?: boolean;
}

export const CATEGORY_LABELS: Record<MenuCategory, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  desserts: 'Desserts',
  beverages: 'Beverages',
};

export const CATEGORY_ICONS: Record<MenuCategory, string> = {
  breakfast: 'Coffee',    // a cup of coffee for breakfast
  lunch: 'Bowl',          // a bowl representing lunch (e.g., rice bowl)
  dinner: 'Drumstick',    // chicken drumstick for dinner
  desserts: 'Cake',       // slice of cake for desserts
  beverages: 'Glass',     // glass for beverages (or 'Coffee' if preferred)
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value: value as MenuCategory,
  label,
  icon: CATEGORY_ICONS[value as MenuCategory],
}));