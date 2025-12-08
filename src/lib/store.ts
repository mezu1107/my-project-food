// src/lib/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// === TYPES ===
export interface UserLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface SelectedArea {
  id: string;
  name: string;
  city: string;
  fullAddress: string;
  deliveryFee?: number;
  estimatedTime?: string;
}

export interface MenuItemCart {
  _id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
  isVeg: boolean;
  isSpicy: boolean;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  menuItem: MenuItemCart;
  quantity: number;
  addOns?: AddOn[];
}

// === STORE STATE & ACTIONS ===
interface AppState {
  // State
  currentUser: any | null;
  selectedArea: SelectedArea | null;
  userLocation: UserLocation | null;
  cart: CartItem[];
  orders: any[];
  riders: any[];
  deals: any[];
  menuItems: any[];

  // Actions
  setCurrentUser: (user: any) => void;
  setSelectedArea: (area: SelectedArea | null) => void;
  setUserLocation: (location: UserLocation | null) => void;

  addToCart: (item: MenuItemCart, addOns?: AddOn[]) => void;
  removeFromCart: (itemId: string, addOnsKey?: string) => void;
  updateCartQuantity: (itemId: string, addOnsKey: string | null, quantity: number) => void;
  clearCart: () => void;

  addOrder: (order: any) => void;
  updateOrderStatus: (orderId: string, status: any) => void;
  updateRiderStatus: (riderId: string, status: any) => void;
  assignOrderToRider: (orderId: string, riderId: string) => void;

  addDeal: (deal: any) => void;
  updateDeal: (dealId: string, updates: Partial<any>) => void;
  deleteDeal: (dealId: string) => void;

  addMenuItem: (item: any) => void;
  updateMenuItem: (itemId: string, updates: Partial<any>) => void;
  deleteMenuItem: (itemId: string) => void;

  // Getters
  getItemCount: () => number;
  get subtotal(): number;
  get totalItemsInCart(): number;
}

// === STORE ===
export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      selectedArea: null,
      userLocation: null,
      cart: [],
      orders: [],
      riders: [],
      deals: [],
      menuItems: [],

      // Auth & Location
      setCurrentUser: (user) => set({ currentUser: user }),
      setSelectedArea: (area) => set({ selectedArea: area }),
      setUserLocation: (location) => set({ userLocation: location }),

      // Cart Actions
      addToCart: (item, addOns = []) => {
        const addOnsKey = JSON.stringify(addOns.map(a => a.id).sort());

        set((state) => {
          const existingIndex = state.cart.findIndex(
            (cartItem) =>
              cartItem.menuItem._id === item._id &&
              JSON.stringify((cartItem.addOns || []).map(a => a.id).sort()) === addOnsKey
          );

          if (existingIndex !== -1) {
            const updatedCart = [...state.cart];
            updatedCart[existingIndex].quantity += 1;
            return { cart: updatedCart };
          }

          return {
            cart: [
              ...state.cart,
              {
                menuItem: {
                  _id: item._id,
                  name: item.name,
                  price: item.price,
                  image: item.image,
                  category: item.category,
                  isVeg: item.isVeg,
                  isSpicy: item.isSpicy,
                },
                quantity: 1,
                addOns: addOns.map(a => ({ id: a.id, name: a.name, price: a.price })),
              },
            ],
          };
        });
      },

      removeFromCart: (itemId, addOnsKey = '[]') => {
        set((state) => ({
          cart: state.cart.filter(
            (item) =>
              !(item.menuItem._id === itemId &&
                JSON.stringify((item.addOns || []).map(a => a.id).sort()) === addOnsKey)
          ),
        }));
      },

      updateCartQuantity: (itemId, addOnsKey, quantity) => {
        if (quantity < 1) return;

        set((state) => ({
          cart: state.cart.map((item) => {
            const currentKey = JSON.stringify((item.addOns || []).map(a => a.id).sort());
            if (item.menuItem._id === itemId && currentKey === (addOnsKey || '[]')) {
              return { ...item, quantity };
            }
            return item;
          }),
        }));
      },

      clearCart: () => set({ cart: [] }),

      // Orders & Riders
      addOrder: (order) => set((state) => ({ orders: [...state.orders, order] })),
      updateOrderStatus: (orderId, status) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
        })),
      updateRiderStatus: (riderId, status) =>
        set((state) => ({
          riders: state.riders.map((r) => (r.id === riderId ? { ...r, status } : r)),
        })),
      assignOrderToRider: (orderId, riderId) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === orderId ? { ...o, riderId } : o)),
          riders: state.riders.map((r) =>
            r.id === riderId
              ? { ...r, currentOrders: [...(r.currentOrders || []), orderId] }
              : r
          ),
        })),

      // Deals
      addDeal: (deal) => set((state) => ({ deals: [...state.deals, deal] })),
      updateDeal: (dealId, updates) =>
        set((state) => ({
          deals: state.deals.map((d) => (d.id === dealId ? { ...d, ...updates } : d)),
        })),
      deleteDeal: (dealId) =>
        set((state) => ({ deals: state.deals.filter((d) => d.id !== dealId) })),

      // Menu Items (Admin)
      addMenuItem: (item) => set((state) => ({ menuItems: [...state.menuItems, item] })),
      updateMenuItem: (itemId, updates) =>
        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            item._id === itemId ? { ...item, ...updates } : item
          ),
        })),
      deleteMenuItem: (itemId) =>
        set((state) => ({
          menuItems: state.menuItems.filter((item) => item._id !== itemId),
        })),

      // Getters
      getItemCount: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),

      get totalItemsInCart() {
        return get().cart.length;
      },

      get subtotal() {
        return get().cart.reduce((sum, item) => {
          const basePrice = item.menuItem.price * item.quantity;
          const addOnsTotal = item.addOns?.reduce((a, b) => a + b.price, 0) || 0;
          return sum + basePrice + addOnsTotal;
        }, 0);
      },
    }),
    {
      name: 'amfood-storage-v2',
      version: 2,
      partialize: (state) => ({
        currentUser: state.currentUser,
        selectedArea: state.selectedArea,
        userLocation: state.userLocation,
        cart: state.cart,
      }),
      merge: (persistedState: any, currentState) => {
        return { ...currentState, ...(persistedState as object) };
      },
    }
  )
);