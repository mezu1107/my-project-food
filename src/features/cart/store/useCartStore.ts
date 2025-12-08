import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface AppliedDeal {
  code: string;
  title: string;
  description?: string;
  savings: number;
}

interface CartState {
  items: CartItem[];
  appliedDeal: AppliedDeal | null;
  discountAmount: number;
  
  // Computed values
  subtotal: number;
  finalTotal: number;
  
  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  
  applyDeal: (deal: AppliedDeal) => void;
  removeDeal: () => void;
  
  // Helpers
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedDeal: null,
      discountAmount: 0,
      subtotal: 0,
      finalTotal: 0,

      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          
          let newItems;
          if (existingItem) {
            newItems = state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
            );
          } else {
            newItems = [...state.items, item];
          }
          
          const subtotal = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
          const finalTotal = subtotal - state.discountAmount;
          
          return { items: newItems, subtotal, finalTotal };
        });
      },

      removeItem: (id) => {
        set((state) => {
          const newItems = state.items.filter((i) => i.id !== id);
          const subtotal = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
          const finalTotal = subtotal - state.discountAmount;
          
          return { items: newItems, subtotal, finalTotal };
        });
      },

      updateQuantity: (id, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return get().removeItem(id) as any;
          }
          
          const newItems = state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          );
          const subtotal = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
          const finalTotal = subtotal - state.discountAmount;
          
          return { items: newItems, subtotal, finalTotal };
        });
      },

      clearCart: () => {
        set({
          items: [],
          appliedDeal: null,
          discountAmount: 0,
          subtotal: 0,
          finalTotal: 0,
        });
      },

      applyDeal: (deal) => {
        set((state) => {
          const finalTotal = state.subtotal - deal.savings;
          return {
            appliedDeal: deal,
            discountAmount: deal.savings,
            finalTotal,
          };
        });
      },

      removeDeal: () => {
        set((state) => {
          const finalTotal = state.subtotal;
          return {
            appliedDeal: null,
            discountAmount: 0,
            finalTotal,
          };
        });
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        appliedDeal: state.appliedDeal,
        discountAmount: state.discountAmount,
      }),
    }
  )
);
