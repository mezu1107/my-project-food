// src/features/orders/hooks/useOrderSocket.ts
// FINAL PRODUCTION — DECEMBER 26, 2025
// Fully synced with backend broadcastOrderEvent & sendNotification

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

  const role = user?.role;
  const userId = user?.id;

  const handleOrderUpdate = useCallback(
    (payload: any) => {
      const updatedOrder: Order = payload.order || payload;
      const shortId = payload.shortId || updatedOrder._id.slice(-6).toUpperCase();

      // Update single order caches
      queryClient.setQueryData(['order', updatedOrder._id], { success: true, order: updatedOrder });
      queryClient.setQueryData(['track-order', updatedOrder._id], { success: true, order: updatedOrder });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });

      // User-facing toasts based on status
      switch (updatedOrder.status) {
        case 'confirmed':
          toast.success(`Order #${shortId} confirmed! We're preparing your food 🍳`);
          break;
        case 'preparing':
          toast.info(`Order #${shortId} is being prepared`);
          break;
        case 'out_for_delivery':
          toast.success(`Rider is on the way with #${shortId} 🚀`);
          break;
        case 'delivered':
          toast.success(`Order #${shortId} delivered! Enjoy your meal ❤️`);
          import('canvas-confetti').then((confetti) =>
            confetti.default({ particleCount: 200, spread: 120, origin: { y: 0.6 } })
          );
          break;
        case 'cancelled':
          toast.error(`Order #${shortId} was cancelled`);
          break;
        case 'rejected':
          toast.error(`Order #${shortId} was rejected`);
          break;
      }
    },
    [queryClient]
  );

  const handleRiderLocation = useCallback((payload: RiderLocationPayload) => {
    window.dispatchEvent(
      new CustomEvent('riderLocationUpdate', { detail: payload })
    );
  }, []);

  const handlePaymentUpdate = useCallback(
    (payload: any) => {
      if (payload.event === 'paymentSuccess') {
        toast.success('Payment confirmed successfully! 🎉');
        queryClient.invalidateQueries({ queryKey: ['my-orders'] });
        if (orderId) {
          queryClient.invalidateQueries({ queryKey: ['order', orderId] });
          queryClient.invalidateQueries({ queryKey: ['track-order', orderId] });
        }
      }
    },
    [orderId, queryClient]
  );

  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    const socket = getSocket() || initSocket();

    socket.emit('join', `user:${userId}`);
    if (role === 'rider') {
      socket.emit('join', `rider:${userId}`);
    }
    if (orderId) {
      socket.emit('trackOrder', { orderId });
    }

    // Backend emits 'orderUpdate' with full payload
    socket.on('orderUpdate', handleOrderUpdate);
    socket.on('riderLocation', handleRiderLocation);
    socket.on('riderLiveUpdate', handleRiderLocation);
    socket.on('paymentUpdate', handlePaymentUpdate);

    return () => {
      socket.off('orderUpdate', handleOrderUpdate);
      socket.off('riderLocation', handleRiderLocation);
      socket.off('riderLiveUpdate', handleRiderLocation);
      socket.off('paymentUpdate', handlePaymentUpdate);

      socket.emit('leave', `user:${userId}`);
      if (role === 'rider') socket.emit('leave', `rider:${userId}`);
      if (orderId) socket.emit('leave', `order:${orderId}`);
    };
  }, [
    isAuthenticated,
    userId,
    role,
    orderId,
    queryClient,
    handleOrderUpdate,
    handleRiderLocation,
    handlePaymentUpdate,
  ]);

  return null;
};