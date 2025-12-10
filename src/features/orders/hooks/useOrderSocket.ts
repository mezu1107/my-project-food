// src/features/orders/hooks/useOrderSocket.ts
import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { initSocket, getSocket } from '@/lib/socket';
import { useAuthStore } from '@/features/auth/store/authStore';
import { toast } from 'sonner';
import type { Order } from '@/types/order.types';

// Payload for rider location updates
interface RiderLocationPayload {
  riderLocation: { lat: number; lng: number };
  riderId: string;
  status?: Order['status'];
}

// Events sent from backend
interface OrderSocketEvents {
  orderUpdate: Order; // Full order object
  orderInit: { orderId: string; status: Order['status']; riderLocation?: { lat: number; lng: number } };
  riderLocation: RiderLocationPayload;
  riderLiveUpdate: RiderLocationPayload & { orderId: string };
  riderOnline: { riderId: string; name: string; phone: string };
  riderOffline: { riderId: string };
  error: { message: string };
}

export const useOrderSocket = (orderId?: string) => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated, token } = useAuthStore(); // token from auth store

  // Handle full order updates
  const handleOrderUpdate = useCallback(
    (order: Order) => {
      // Update single order cache
      queryClient.setQueryData(['order', order._id], { success: true, order });
      // Refresh my-orders list
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });

      // Toast for order status
      switch (order.status) {
        case 'pending':
          toast.info('Order pending confirmation');
          break;
        case 'pending_payment':
          toast.info('Awaiting payment');
          break;
        case 'confirmed':
          toast.success('Order confirmed!');
          break;
        case 'preparing':
          toast.info('Order is being prepared');
          break;
        case 'out_for_delivery':
          toast.success('Your food is on the way!');
          break;
        case 'delivered':
          toast.success('Order delivered! Enjoy your meal');
          break;
        case 'cancelled':
        case 'rejected':
          toast.error(`Order ${order.status}`);
          break;
      }
    },
    [queryClient]
  );

  // Handle rider location updates
  const handleRiderLocation = useCallback(
    ({ riderLocation, riderId, status }: RiderLocationPayload) => {
      // Optional: update live map or local state
      console.log(`Rider ${riderId} location:`, riderLocation, 'status:', status);
    },
    []
  );

  // Handle initial order payload
  const handleOrderInit = useCallback(
    (payload: OrderSocketEvents['orderInit']) => {
      queryClient.setQueryData(['order', payload.orderId], {
        success: true,
        order: { _id: payload.orderId, status: payload.status } as Order,
      });

      if (payload.riderLocation) {
        handleRiderLocation({ riderId: '', riderLocation: payload.riderLocation });
      }
    },
    [queryClient, handleRiderLocation]
  );

  useEffect(() => {
    if (!isAuthenticated) return;

    // Initialize or get existing socket
    const socket = getSocket() || initSocket(token);

    // Join personal room for the user
    if (user?._id) socket.emit('join', `user:${user._id}`);

    // Join specific order room for live tracking
    if (orderId) {
      socket.emit('trackOrder', { orderId });
    }

    // Listen to socket events
    socket.on('orderUpdate', handleOrderUpdate);
    socket.on('orderInit', handleOrderInit);
    socket.on('riderLocation', handleRiderLocation);
    socket.on('riderLiveUpdate', handleRiderLocation); // Admin can use separate handler
    socket.on('riderOnline', (payload: OrderSocketEvents['riderOnline']) =>
      toast.success(`Rider ${payload.name} is online`)
    );
    socket.on('riderOffline', (payload: OrderSocketEvents['riderOffline']) =>
      toast.info(`Rider went offline`)
    );
    socket.on('error', (payload: OrderSocketEvents['error']) => toast.error(payload.message));

    // Cleanup on unmount
    return () => {
      socket.off('orderUpdate', handleOrderUpdate);
      socket.off('orderInit', handleOrderInit);
      socket.off('riderLocation', handleRiderLocation);
      socket.off('riderLiveUpdate', handleRiderLocation);
      socket.off('riderOnline');
      socket.off('riderOffline');
      socket.off('error');

      // Leave rooms
      if (user?._id) socket.emit('leave', `user:${user._id}`);
      if (orderId) socket.emit('leave', `order:${orderId}`);
    };
  }, [
    isAuthenticated,
    user?._id,
    token,
    orderId,
    handleOrderUpdate,
    handleOrderInit,
    handleRiderLocation,
  ]);
};
