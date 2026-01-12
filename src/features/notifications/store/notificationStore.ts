// src/features/notifications/store/notificationStore.ts
// IMPROVED — JANUARY 12, 2026
// Modern audio manager, deduplication, persistence, better UX

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { OrderStatus } from '@/types/order.types';

export interface OrderNotification {
  id: string;
  orderId: string;
  shortId: string;
  status: OrderStatus;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  important?: boolean;
}

// Sound mapping (adjust paths to your actual assets)
// src/features/notifications/store/notificationStore.ts

// Add these two special alert sounds
const SOUND_MAP: Record<
  OrderStatus | 'new-order-alert' | 'urgent-new-order' | 'new-order-bell' | 'ready',
  string
> = {
  pending: '/sounds/notification-light.mp3',
  pending_payment: '/sounds/notification-light.mp3',
  confirmed: '/sounds/confirmation.mp3',
  preparing: '/sounds/preparing.mp3',
  out_for_delivery: '/sounds/rider-onway.mp3',
  delivered: '/sounds/delivery-success.mp3',
  cancelled: '/sounds/cancel-warning.mp3',
  rejected: '/sounds/cancel-warning.mp3',
  'new-order-alert': '/sounds/new-order-bell-loud.mp3',
  'urgent-new-order': '/sounds/urgent-new-order-alarm.mp3',
  'new-order-bell': '/sounds/new-order-bell-normal.mp3',
  ready: '/sounds/order-ready.mp3', // ← add this
};


// ──────────────────────────────────────────────────────────────



class AudioManager {
  private audioCache = new Map<string, HTMLAudioElement>();
  private muted = localStorage.getItem('notifications-muted') === 'true';

  preload() {
    Object.values(SOUND_MAP).forEach((src) => {
      if (!this.audioCache.has(src)) {
        const audio = new Audio(src);
        audio.preload = 'auto';
        audio.volume = 0.75;
        this.audioCache.set(src, audio);
      }
    });
  }

 play(
  soundKey: OrderStatus | 'new-order-alert' | 'urgent-new-order' | 'new-order-bell' | 'ready',
  options: { loop?: boolean; volume?: number } = {}
)
 {
    if (this.muted) return;

    const src = SOUND_MAP[soundKey];
    if (!src) return; // ← safety

    const audio = this.audioCache.get(src);
    if (audio) {
      audio.currentTime = 0;
      audio.volume = options.volume ?? 0.75;
      audio.loop = options.loop ?? false;
      audio.play().catch(() => {});
    }
  }

  stopAll() {
    this.audioCache.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
      audio.loop = false;
    });
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('notifications-muted', String(this.muted));
  }

  getMuted() {
    return this.muted;
  }

  cleanup() {
    this.stopAll();
    this.audioCache.clear();
  }
}

export const audioManager = new AudioManager();

interface NotificationState {
  notifications: OrderNotification[];
  addNotification: (
    data: Omit<OrderNotification, 'id' | 'timestamp' | 'read'> & { playSound?: boolean }
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  removeNotification: (id: string) => void;
  unreadCount: () => number;
  getRecentNotifications: (limit?: number) => OrderNotification[];
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    immer((set, get) => ({
      notifications: [],

      addNotification: (data) =>
        set((state) => {
          const newNotif: OrderNotification = {
            ...data,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            read: false,
          };

          // Prevent duplicates within 5 minutes
          const isDuplicate = state.notifications.some(
            (n) =>
              n.orderId === newNotif.orderId &&
              n.status === newNotif.status &&
              Date.now() - new Date(n.timestamp).getTime() < 1000 * 60 * 5
          );

          if (!isDuplicate) {
            state.notifications.unshift(newNotif);

            // Keep only last 60 notifications
            if (state.notifications.length > 60) {
              state.notifications.length = 60;
            }

            // Optional auto-play sound
            if (data.playSound !== false) {
              audioManager.play(newNotif.status);
            }
          }
        }),

      markAsRead: (id) =>
        set((state) => {
          const notif = state.notifications.find((n) => n.id === id);
          if (notif) notif.read = true;
        }),

      markAllAsRead: () =>
        set((state) => {
          state.notifications.forEach((n) => (n.read = true));
        }),

      clearAll: () => set({ notifications: [] }),

      removeNotification: (id) =>
        set((state) => {
          state.notifications = state.notifications.filter((n) => n.id !== id);
        }),

      unreadCount: () => get().notifications.filter((n) => !n.read).length,

      getRecentNotifications: (limit = 10) => get().notifications.slice(0, limit),
    })),
    {
      name: 'altawakkalfoods-notifications-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ notifications: state.notifications }),
      version: 2,
      migrate: (persistedState: any, version) => {
        if (version === 1) {
          // Migration from v1 if needed
          return { ...persistedState, version: 2 };
        }
        return persistedState;
      },
    }
  )
);

// Preload sounds on app load (you can call this in root component)
audioManager.preload();