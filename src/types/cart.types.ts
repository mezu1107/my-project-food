// src/types/cart.types.ts


export interface MenuItemInCart {
  _id: string;
  name: string;
  price: number;
  image?: string;
  isAvailable?: boolean;
  isVeg?: boolean;
  isSpicy?: boolean;
}

// Used for logged-in users (items from MongoDB Cart document)
export interface ServerCartItem {
  _id: string;                    // subdocument _id from MongoDB
  menuItem: MenuItemInCart;
  quantity: number;
  priceAtAdd: number;
  addedAt?: string;
}

// Used for guest users (items stored in session / local Zustand store)
export interface GuestCartItem {
  _id: string;                    // client-generated UUID
  menuItem: MenuItemInCart;
  quantity: number;
  priceAtAdd: number;
  addedAt?: string;               // optional, for consistency
}

export type CartItem = ServerCartItem | GuestCartItem;

// Exact shape returned by all cart endpoints
export interface CartResponse {
  success: boolean;
  message: string;
  cart: {
    items: ServerCartItem[];      // backend always returns populated ServerCartItem shape
    total: number;
  };
  isGuest: boolean;
}

// For empty cart responses (items: [], total: 0)
export interface EmptyCartResponse {
  success: boolean;
  message: string;
  cart: {
    items: [];
    total: 0;
  };
  isGuest: boolean;
}

// Union of possible cart responses
export type AnyCartResponse = CartResponse | EmptyCartResponse;