// src/features/orders/hooks/useOrderSocket.ts
// PRODUCTION-READY — JANUARY 12, 2026
// Enhanced: Strong support for newOrderAlert (kitchen-focused aggressive notification)
// Added: Sound distinction for new/urgent orders + acknowledge support

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket, initSocket } from '@/lib/socket';
import { useAuthStore } from '@/features/auth/store/authStore';
import { toast } from 'sonner';
import { useNotificationStore, audioManager } from '@/features/notifications/store/notificationStore';
import type { Order, OrderStatus } from '@/types/order.types';

interface RiderLocationPayload {
  riderLocation: { lat: number; lng: number };
  riderId: string;
  status?: string;
}

interface NewOrderAlertPayload {
  orderId: string;
  shortId: string;
  customerName: string;
  total: number;
  itemsCount: number;
  isUrgent: boolean;
  timestamp: string;
}

export const useOrderSocket = (orderId?: string) => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();

  const userId = user?.id;
  const role = user?.role;

  const handleOrderUpdate = useCallback(
    (payload: any) => {
      const updatedOrder: Order = payload.order || payload;
      if (!updatedOrder?._id) return;

      const shortId = payload.shortId || updatedOrder._id.toString().slice(-6).toUpperCase();

      // Update caches
      queryClient.setQueryData(['order', updatedOrder._id], { success: true, order: updatedOrder });
      queryClient.setQueryData(['track-order', updatedOrder._id], { success: true, order: updatedOrder });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });

      const statusConfig: Record<OrderStatus, { title: string; message: string; type: 'success' | 'info' | 'error'; important?: boolean; sound?: boolean }> = {
        pending: { title: 'Order Placed', message: `We received #${shortId}!`, type: 'info', sound: true },
        pending_payment: { title: 'Awaiting Payment', message: `Please complete payment for #${shortId}`, type: 'info', important: true, sound: true },
        confirmed: { title: 'Order Confirmed', message: `Kitchen started working on #${shortId} 🎉`, type: 'success', important: true, sound: true },
        preparing: { title: 'Preparing Your Food', message: `#${shortId} is being freshly prepared`, type: 'info', sound: true },
        out_for_delivery: { title: 'Rider On The Way!', message: `Your rider is heading to you with #${shortId} 🚀`, type: 'success', important: true, sound: true },
        delivered: { title: 'Order Delivered!', message: `Enjoy your meal! #${shortId} is at your door 🍽️`, type: 'success', important: true, sound: true },
        cancelled: { title: 'Order Cancelled', message: `#${shortId} has been cancelled`, type: 'error', important: true, sound: true },
        rejected: { title: 'Order Rejected', message: `Sorry, we couldn't process #${shortId}`, type: 'error', important: true, sound: true },
      };

      const config = statusConfig[updatedOrder.status as OrderStatus];
      if (config) {
        if (config.sound) audioManager.play(updatedOrder.status as OrderStatus);

        if (config.important && Notification.permission === 'granted') {
          new Notification(config.title, {
            body: config.message,
            icon: '/favicon.ico',
            badge: '/badge.png',
            tag: `order-${updatedOrder._id}`,
            data: { url: `/track/${updatedOrder._id}` },
            requireInteraction: true,
          });
        }

        toast[config.type](config.message, {
          description: config.title,
          duration: config.important ? 12000 : 8000,
          action: { label: 'Track', onClick: () => (window.location.href = `/track/${updatedOrder._id}`) },
        });

        addNotification({
          orderId: updatedOrder._id,
          shortId,
          status: updatedOrder.status as OrderStatus,
          title: config.title,
          message: config.message,
          important: config.important,
          playSound: config.sound,
        });

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

        if (updatedOrder.rider) {
          window.dispatchEvent(
            new CustomEvent('riderAssigned', { detail: { rider: updatedOrder.rider, orderId: updatedOrder._id } })
          );
        }
      }
    },
    [queryClient, addNotification]
  );

const handleNewOrderAlert = useCallback((payload: NewOrderAlertPayload) => {
  if (!['kitchen', 'admin'].includes(role || '')) return;

  const isUrgent = payload.isUrgent;
  const soundKey = isUrgent ? 'urgent-new-order' : 'new-order-bell';

  audioManager.play(soundKey, { 
    loop: true, 
    volume: isUrgent ? 0.95 : 0.8 
  });

  toast.info(`NEW ORDER #${payload.shortId}!`, {
    description: isUrgent
      ? `URGENT! ${payload.itemsCount} items • ${payload.customerName}`
      : `${payload.itemsCount} items • ${payload.customerName}`,
    duration: Infinity,
    style: {
      background: isUrgent ? '#dc2626' : '#f59e0b',
      color: 'white',
      fontSize: '1.25rem',
      padding: '1.5rem',
    },
    action: {
      label: isUrgent ? 'Acknowledge Urgent' : 'Acknowledge',
      onClick: () => {
        audioManager.stopAll();
        getSocket()?.emit('acknowledgeNewOrder', { orderId: payload.orderId });
        toast.dismiss();
      }
    },
    cancel: {   // ← optional second button (looks good)
      label: 'View',
      onClick: () => {
        window.location.href = `/admin/orders/${payload.orderId}`;
      }
    }
  });
}, [role]);

  const handleRiderLocation = useCallback((payload: RiderLocationPayload) => {
    window.dispatchEvent(new CustomEvent('riderLocationUpdate', { detail: payload }));
  }, []);

  // Preload sounds
  useEffect(() => {
    audioManager.preload();
    return () => audioManager.cleanup();
  }, []);

  useEffect(() => {
    const socket = getSocket() || initSocket();
    if (!socket.connected) socket.connect();

    let cleanup = () => {};

    // Authenticated user rooms
    if (isAuthenticated && userId) {
      socket.emit('join', `user:${userId}`);
      if (role === 'rider') socket.emit('join', `rider:${userId}`);
    }

    // Public/guest tracking
    if (orderId) {
      socket.emit('trackOrder', { orderId });
      socket.emit('join', `order:${orderId}`);

      socket.on('orderUpdate', handleOrderUpdate);
      socket.on('riderLocation', handleRiderLocation);
      socket.on('riderLiveUpdate', handleRiderLocation);

      // Only kitchen/admin care about aggressive new order alerts
      if (['kitchen', 'admin'].includes(role || '')) {
        socket.on('newOrderAlert', handleNewOrderAlert);
        socket.on('stopNewOrderAlert', ({ orderId }: { orderId: string }) => {
          audioManager.stopAll();
        });
      }

      cleanup = () => {
        socket.off('orderUpdate', handleOrderUpdate);
        socket.off('riderLocation', handleRiderLocation);
        socket.off('riderLiveUpdate', handleRiderLocation);
        socket.off('newOrderAlert', handleNewOrderAlert);
        socket.off('stopNewOrderAlert');
        socket.emit('leave', `order:${orderId}`);
      };
    }

    return () => {
      cleanup();
      if (isAuthenticated && userId) {
        socket.emit('leave', `user:${userId}`);
        if (role === 'rider') socket.emit('leave', `rider:${userId}`);
      }
    };
  }, [orderId, isAuthenticated, userId, role, queryClient, handleOrderUpdate, handleRiderLocation, handleNewOrderAlert]);

  return null;
};