// src/features/cart/hooks/useCartStore.ts
// PRODUCTION-READY — JANUARY 09, 2026
// Final optimized version: Reliable persistence, safe bulk reorder, perfect sync
// Removed manual localStorage hacks — fully trusts Zustand persist middleware

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, MenuItemInCart } from '@/types/cart.types';

interface CartState {
  items: CartItem[];
  orderNote: string;

  addItem: (
    menuItem: MenuItemInCart,
    quantity?: number,
    customizations?: {
      sides?: string[];
      drinks?: string[];
      addOns?: string[];
      specialInstructions?: string;
    },
    priceAtAdd?: number
  ) => void;

  /** Bulk add — used for reorder (authenticated or guest). Replaces current cart. */
  addMultipleItems: (items: CartItem[]) => void;

  updateItem: (
    cartItemId: string,
    updates: Partial<
      Pick<CartItem, 'quantity' | 'sides' | 'drinks' | 'addOns' | 'specialInstructions'>
    > & { orderNote?: string }
  ) => void;

  removeItem: (cartItemId: string) => void;
  setOrderNote: (note: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;

  /** Sync server cart → local Zustand store (only called for authenticated users) */
  syncWithServer: (serverCart: { items: CartItem[]; orderNote: string }) => void;
}

// ---------------- Helpers ----------------
const arraysEqual = (a: string[] = [], b: string[] = []) => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, index) => val === sortedB[index]);
};

// ---------------- Store ----------------
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      orderNote: '',

      addItem: (
        menuItem,
        quantity = 1,
        customizations = {},
        priceAtAdd = menuItem.price
      ) => {
        set((state) => {
          const existingIndex = state.items.findIndex((item) => {
            if (item.menuItem._id !== menuItem._id) return false;
            if (item.specialInstructions !== (customizations.specialInstructions ?? '')) return false;

            return (
              arraysEqual(item.sides ?? [], customizations.sides ?? []) &&
              arraysEqual(item.drinks ?? [], customizations.drinks ?? []) &&
              arraysEqual(item.addOns ?? [], customizations.addOns ?? [])
            );
          });

          if (existingIndex !== -1) {
            const newItems = [...state.items];
            newItems[existingIndex].quantity = Math.min(
              newItems[existingIndex].quantity + quantity,
              50
            );
            return { items: newItems };
          }

          const newItem: CartItem = {
            _id: crypto.randomUUID(),
            menuItem,
            quantity,
            priceAtAdd,
            sides: customizations.sides,
            drinks: customizations.drinks,
            addOns: customizations.addOns,
            specialInstructions: customizations.specialInstructions,
            addedAt: new Date().toISOString(),
          };

          return { items: [...state.items, newItem] };
        });
      },

      addMultipleItems: (incomingItems) => {
        set(() => {
          if (!Array.isArray(incomingItems)) {
            return { items: [], orderNote: '' };
          }

          // Sanitize: only valid items with positive quantity
          const validItems = incomingItems.filter(
            (item): item is CartItem =>
              !!item &&
              !!item.menuItem &&
              typeof item.quantity === 'number' &&
              item.quantity > 0
          );

          return { items: validItems, orderNote: '' }; // Reorder clears note
        });
      },

      updateItem: (cartItemId, updates) => {
        set((state) => {
          const index = state.items.findIndex((item) => item._id === cartItemId);
          if (index === -1) return state;

          const newItems = [...state.items];

          if (updates.quantity !== undefined) {
            if (updates.quantity <= 0) {
              newItems.splice(index, 1);
            } else {
              newItems[index].quantity = Math.min(updates.quantity, 50);
            }
          }

          if (updates.sides !== undefined) newItems[index].sides = updates.sides;
          if (updates.drinks !== undefined) newItems[index].drinks = updates.drinks;
          if (updates.addOns !== undefined) newItems[index].addOns = updates.addOns;
          if (updates.specialInstructions !== undefined)
            newItems[index].specialInstructions = updates.specialInstructions;

          return {
            items: newItems,
            orderNote: updates.orderNote ?? state.orderNote,
          };
        });
      },

      removeItem: (cartItemId) =>
        set((state) => ({
          items: state.items.filter((item) => item._id !== cartItemId),
        })),

      setOrderNote: (note) => set({ orderNote: note }),

      clearCart: () => set({ items: [], orderNote: '' }),

      getTotal: () =>
        get().items.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0),

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      syncWithServer: ({ items, orderNote }) => {
        // Only for authenticated users — replaces local cart with server truth
        set({ items, orderNote });
      },
    }),
    {
      name: 'altawakkalfoods-cart-v7', // ← Updated version
      version: 7,
      partialize: (state) => ({
        items: state.items,
        orderNote: state.orderNote,
      }),
      migrate: (persistedState: any, version) => {
        // Clear old versions to prevent schema conflicts
        if (version < 7) {
          return { items: [], orderNote: '' };
        }
        return persistedState as CartState;
      },
    }
  )
);