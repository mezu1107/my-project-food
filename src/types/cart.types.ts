// src/types/cart.types.ts
export const ALLOWED_UNITS = [
  'pc',
  'bottle',
  'kg',
  'g',
  'slice',
  'cup',
  'ml',
  'liter',
  'pack',
  'dozen',
  'tray',
] as const;

export type Unit = typeof ALLOWED_UNITS[number];

export const UNIT_LABELS: Record<Unit, string> = {
  pc: 'per piece',
  bottle: 'per bottle',
  kg: 'per kg',
  g: 'g',
  slice: 'per slice',
  cup: 'per cup',
  ml: 'ml',
  liter: 'liter',
  pack: 'per pack',
  dozen: 'per dozen',
  tray: 'per tray',
};

export interface PricedOption {
  name: string;
  price: number;
  unit?: Unit; // ← per-option unit
}

export interface SelectedOptions {
  sides: PricedOption[];
  drinks: PricedOption[];
  addOns: PricedOption[];
}

export interface MenuItemInCart {
  _id: string;
  name: string;
  price: number;
  unit: Unit; // ← main unit
  image?: string;
  isAvailable: boolean;
}

export interface CartItem {
  _id: string;
  menuItem: MenuItemInCart;
  quantity: number;
  priceAtAdd: number;
  sides?: string[];
  drinks?: string[];
  addOns?: string[];
  specialInstructions?: string;
  addedAt?: string;
  selectedOptions?: SelectedOptions; // enriched from backend
}

export interface CartData {
  items: CartItem[];
  total: number;
  orderNote: string;
}

export interface CartResponse {
  success: boolean;
  message?: string;
  cart: CartData;
  isGuest: boolean;
}