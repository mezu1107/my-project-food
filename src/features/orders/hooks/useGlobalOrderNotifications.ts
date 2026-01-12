// src/features/orders/hooks/useGlobalOrderNotifications.ts
// PRODUCTION-READY — JANUARY 12, 2026
// Global real-time order notifications for ALL users (logged-in + guests)
// Shows nice toasts + updates cache for key status changes
// Improved: Better status coverage, sound hints, reconnect handling

import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { audioManager } from '@/features/notifications/store/notificationStore'; // optional - if you have global sound
import type { Order, OrderStatus } from '@/types/order.types';

export const useGlobalOrderNotifications = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    // Try to ensure connection
    if (!socket?.connected) {
      socket?.connect();
    }

    const handleGlobalOrderUpdate = (payload: any) => {
      // Basic validation
      if (!payload?.order?._id || !payload?.shortId || !payload?.status) {
        return;
      }

      const { order, shortId, status } = payload;

      // Update caches globally — works for both authenticated & guest tracking pages
      queryClient.setQueryData(['track-order', order._id], { success: true, order });
      queryClient.setQueryData(['order', order._id], { success: true, order });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });

      // Status → toast configuration
      const statusConfig: Partial<
        Record<
          OrderStatus,
          {
            title: string;
            message: string;
            type?: 'success' | 'info' | 'warning' | 'error';
            duration?: number;
            sound?: boolean;
          }
        >
      > = {
        pending: {
          title: `📥 New Order #${shortId}`,
          message: 'Order just received!',
          type: 'info',
          duration: 8000,
          sound: true,
        },
        confirmed: {
          title: `✅ Order #${shortId} Confirmed`,
          message: 'Kitchen has started preparing your food',
          type: 'success',
          duration: 10000,
          sound: true,
        },
        preparing: {
          title: `👩‍🍳 Preparing #${shortId}`,
          message: 'Your food is being freshly made',
          type: 'info',
          duration: 8000,
        },
        out_for_delivery: {
          title: `🚀 Order #${shortId} On The Way!`,
          message: 'Your rider is heading to your location',
          type: 'success',
          duration: 14000,
          sound: true,
        },
        delivered: {
          title: `🎉 Order #${shortId} Delivered!`,
          message: 'Enjoy your meal! 🍽️',
          type: 'success',
          duration: 16000,
          sound: true,
        },
        cancelled: {
          title: `❌ Order #${shortId} Cancelled`,
          message: 'Your order has been cancelled',
          type: 'error',
          duration: 10000,
          sound: true,
        },
        rejected: {
          title: `⛔ Order #${shortId} Rejected`,
          message: 'Sorry, we couldn’t process your order',
          type: 'error',
          duration: 10000,
          sound: true,
        },
        // Optional: you can add more statuses if needed
      };

      const config = statusConfig[status as OrderStatus];

      if (config) {
        // Optional sound (if you have global audio manager)
        if (config.sound) {
          audioManager?.play(status as OrderStatus, { volume: 0.7 });
        }

        toast[config.type ?? 'success'](config.title, {
          description: config.message,
          duration: config.duration ?? 10000,
          action: {
            label: 'Track Order',
            onClick: () => {
              window.location.href = `/track/${order._id}`;
            },
          },
        });
      }
    };

    // Listen for order updates globally
    socket.on('orderUpdate', handleGlobalOrderUpdate);

    // Optional: handle socket reconnection (useful in bad networks)
    const onConnect = () => {
      console.log('[GlobalOrderNotifications] Socket reconnected');
    };

    socket.on('connect', onConnect);

    // Cleanup
    return () => {
      socket.off('orderUpdate', handleGlobalOrderUpdate);
      socket.off('connect', onConnect);
    };
  }, [queryClient]);

  return null;
};