// src/features/cart/hooks/useCartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MenuItemInCart, GuestCartItem } from '@/types/cart.types';

// Unified cart item type (both guest and server now have _id)
type CartItem = GuestCartItem;

interface CartState {
  items: CartItem[];
  addItem: (menuItem: MenuItemInCart, quantity?: number) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  syncWithServer: (serverItems: CartItem[]) => void;
}

const calculateTotal = (items: CartItem[]): number =>
  items.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0);

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (menuItem, quantity = 1) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.menuItem._id === menuItem._id
          );

          if (existingIndex > -1) {
            const updated = [...state.items];
            updated[existingIndex].quantity = Math.min(
              updated[existingIndex].quantity + quantity,
              50
            );
            return { items: updated };
          }

          const newItem: CartItem = {
            _id: crypto.randomUUID(), // Still generate locally for optimistic UI
            menuItem,
            quantity,
            priceAtAdd: menuItem.price,
            addedAt: new Date().toISOString(),
          };

          return { items: [...state.items, newItem] };
        }),

      updateQuantity: (cartItemId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((i) => i._id !== cartItemId),
            };
          }

          return {
            items: state.items.map((i) =>
              i._id === cartItemId
                ? { ...i, quantity: Math.min(quantity, 50) }
                : i
            ),
          };
        }),

      removeItem: (cartItemId) =>
        set((state) => ({
          items: state.items.filter((i) => i._id !== cartItemId),
        })),

      clearCart: () => set({ items: [] }),

      getTotal: () => calculateTotal(get().items),

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      // Fully replace local state with server-synced items (with proper _id)
      syncWithServer: (serverItems: CartItem[]) => {
        set({ items: serverItems });
      },
    }),
    {
      name: 'amfood-cart-v3', // Bump version to force migration
      version: 3,
      migrate: (persistedState: any, version) => {
        if (version < 3) {
          console.log('Migrating cart: clearing outdated local cart data');
          return { items: [] } as CartState;
        }
        return persistedState as CartState;
      },
    }
  )
);