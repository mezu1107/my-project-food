// src/features/cart/hooks/useCartStore.ts
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
    priceAtAdd?: number // important: pass final price including extras
  ) => void;

  updateItem: (
    cartItemId: string,
    updates: Partial<Pick<CartItem, 'quantity' | 'sides' | 'drinks' | 'addOns' | 'specialInstructions'> & { orderNote?: string }>
  ) => void;

  removeItem: (cartItemId: string) => void;
  setOrderNote: (note: string) => void;
  clearCart: () => void;

  getTotal: () => number;
  getItemCount: () => number;
  syncWithServer: (serverCart: { items: CartItem[]; orderNote: string }) => void;
}

const calculateTotal = (items: CartItem[]): number =>
  items.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0);

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      orderNote: '',

      addItem: (menuItem, quantity = 1, customizations = {}, priceAtAdd = menuItem.price) =>
        set((state) => {
          // Try to find exact match including customizations
          const existingIndex = state.items.findIndex((i) => {
            if (i.menuItem._id !== menuItem._id) return false;
            if (i.specialInstructions !== (customizations.specialInstructions || '')) return false;
            return (
              arraysEqual(i.sides || [], customizations.sides || []) &&
              arraysEqual(i.drinks || [], customizations.drinks || []) &&
              arraysEqual(i.addOns || [], customizations.addOns || [])
            );
          });

          if (existingIndex > -1) {
            const updated = [...state.items];
            updated[existingIndex].quantity = Math.min(updated[existingIndex].quantity + quantity, 50);
            return { items: updated };
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
        }),

      updateItem: (cartItemId, updates) =>
        set((state) => {
          const idx = state.items.findIndex((i) => i._id === cartItemId);
          if (idx === -1) return state;

          const updatedItems = [...state.items];
          if (updates.quantity !== undefined) {
            if (updates.quantity <= 0) {
              updatedItems.splice(idx, 1);
            } else {
              updatedItems[idx].quantity = Math.min(updates.quantity, 50);
            }
          }

          if (updates.sides) updatedItems[idx].sides = updates.sides;
          if (updates.drinks) updatedItems[idx].drinks = updates.drinks;
          if (updates.addOns) updatedItems[idx].addOns = updates.addOns;
          if (updates.specialInstructions !== undefined)
            updatedItems[idx].specialInstructions = updates.specialInstructions;

          return {
            items: updatedItems,
            orderNote: updates.orderNote ?? state.orderNote,
          };
        }),

      removeItem: (cartItemId) =>
        set((state) => ({
          items: state.items.filter((i) => i._id !== cartItemId),
        })),

      setOrderNote: (note) => set({ orderNote: note }),

      clearCart: () => set({ items: [], orderNote: '' }),

      getTotal: () => calculateTotal(get().items),

      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      syncWithServer: ({ items, orderNote }) => set({ items, orderNote }),
    }),
    {
      name: 'amfood-cart-v4',
      version: 4,
      migrate: (persisted: any, version) => {
        if (version < 4) {
          console.log('Migrating cart to v4 – clearing old data');
          return { items: [], orderNote: '' };
        }
        return persisted;
      },
    }
  )
);

// Helper: order-insensitive array equality
const arraysEqual = (a: string[] = [], b: string[] = []) => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, i) => val === sortedB[i]);
};