// src/types/cart.types.ts

export interface PricedOption {
  name: string;
  price: number;
}

export interface PricedOptions {
  sides: PricedOption[];
  drinks: PricedOption[];
  addOns: PricedOption[];
}

// The menu item as received from API (e.g. getSingleMenuItem)
export interface MenuItem {
  _id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  isVeg?: boolean;
  isSpicy?: boolean;
  isAvailable: boolean;
  pricedOptions?: PricedOptions; // Optional — defaults to empty arrays
}

// Populated menu item inside cart items
export interface MenuItemInCart {
  _id: string;
  name: string;
  price: number;
  image?: string;
  isAvailable?: boolean;
}

// Extended cart item with full customization support
export interface CartItem {
  _id: string;
  menuItem: MenuItemInCart;
  quantity: number;
  priceAtAdd: number;           // Includes base price + paid extras
  sides?: string[];             // e.g. ["Raita", "Custom: extra garlic"]
  drinks?: string[];
  addOns?: string[];
  specialInstructions?: string;
  addedAt?: string;
}

export interface CartData {
  items: CartItem[];
  total: number;
  orderNote: string;
}

// Full response from all cart endpoints
export interface CartResponse {
  success: boolean;
  message?: string;
  cart: CartData;
  isGuest: boolean;
}