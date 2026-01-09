// src/features/orders/hooks/useOrderSocket.ts
// PRODUCTION-READY — JANUARY 09, 2026
// FULL REAL-TIME SUPPORT: Works for public tracking + authenticated users
// Syncs perfectly with backend emitOrderUpdate (full order payload)

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket, initSocket } from '@/lib/socket';
import { useAuthStore } from '@/features/auth/store/authStore';
import { toast } from 'sonner';
import type { Order } from '@/types/order.types';

interface RiderLocationPayload {
  riderLocation: { lat: number; lng: number };
  riderId: string;
  status?: string;
}

export const useOrderSocket = (orderId?: string) => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();

  const userId = user?.id;
  const role = user?.role;

  // Handle full order update from backend (admin/kitchen/rider actions)
  const handleOrderUpdate = useCallback(
    (payload: any) => {
      // Backend now sends full enriched order object directly
      const updatedOrder: Order = payload.order || payload;

      if (!updatedOrder?._id) return;

      const shortId = payload.shortId || updatedOrder._id.toString().slice(-6).toUpperCase();

      // Update all relevant caches instantly
      queryClient.setQueryData(['order', updatedOrder._id], { success: true, order: updatedOrder });
      queryClient.setQueryData(['track-order', updatedOrder._id], { success: true, order: updatedOrder });

      // Invalidate list queries to ensure freshness on navigation
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });

      // User-friendly toast notifications
      const statusMessages: Record<string, { message: string; type: 'success' | 'info' | 'error' }> = {
        confirmed: { message: `Order #${shortId} confirmed! We're preparing your food`, type: 'success' },
        preparing: { message: `Order #${shortId} is being prepared`, type: 'info' },
        out_for_delivery: { message: `Rider is on the way with #${shortId}`, type: 'success' },
        delivered: { message: `Order #${shortId} delivered! Enjoy your meal`, type: 'success' },
        cancelled: { message: `Order #${shortId} was cancelled`, type: 'error' },
        rejected: { message: `Order #${shortId} was rejected`, type: 'error' },
      };

      const msg = statusMessages[updatedOrder.status];
      if (msg) {
        if (msg.type === 'success') toast.success(msg.message);
        else if (msg.type === 'info') toast.info(msg.message);
        else toast.error(msg.message);
      }

      // Confetti celebration on delivery
      if (updatedOrder.status === 'delivered') {
        import('canvas-confetti').then((confetti) =>
          confetti.default({
            particleCount: 200,
            spread: 120,
            origin: { y: 0.6 },
            colors: ['#ff6b6b', '#f06595', '#cc5de8', '#845ef7', '#5c7cfa'],
          })
        );
      }

      // Optional: Dispatch custom event for map components
      if (updatedOrder.rider) {
        window.dispatchEvent(
          new CustomEvent('riderAssigned', {
            detail: {
              rider: updatedOrder.rider,
              orderId: updatedOrder._id,
            },
          })
        );
      }
    },
    [queryClient]
  );

  // Handle live rider location updates
  const handleRiderLocation = useCallback((payload: RiderLocationPayload) => {
    window.dispatchEvent(
      new CustomEvent('riderLocationUpdate', { detail: payload })
    );
  }, []);

  useEffect(() => {
    // Always initialize socket (even for guests)
    const socket = getSocket() || initSocket();
    if (!socket.connected) {
      socket.connect();
    }

    let cleanup = () => {};

    // Only join user/rider rooms if authenticated
    if (isAuthenticated && userId) {
      socket.emit('join', `user:${userId}`);
      if (role === 'rider') {
        socket.emit('join', `rider:${userId}`);
      }
    }

    // Critical: Join order-specific room if orderId is provided
    // This allows BOTH public and logged-in tracking pages to receive live updates
    if (orderId) {
      socket.emit('trackOrder', { orderId });

      // Listen for full order updates (from admin status change, rider assignment, etc.)
      socket.on('orderUpdate', handleOrderUpdate);
      socket.on('riderLocation', handleRiderLocation);
      socket.on('riderLiveUpdate', handleRiderLocation);

      cleanup = () => {
        socket.off('orderUpdate', handleOrderUpdate);
        socket.off('riderLocation', handleRiderLocation);
        socket.off('riderLiveUpdate', handleRiderLocation);

        // Leave the order room when component unmounts or orderId changes
        socket.emit('leave', `order:${orderId}`);
      };
    }

    return () => {
      cleanup();

      if (isAuthenticated && userId) {
        socket.emit('leave', `user:${userId}`);
        if (role === 'rider') {
          socket.emit('leave', `rider:${userId}`);
        }
      }
    };
  }, [
    orderId,
    isAuthenticated,
    userId,
    role,
    queryClient,
    handleOrderUpdate,
    handleRiderLocation,
  ]);

  return null;
};