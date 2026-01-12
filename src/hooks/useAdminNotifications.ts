// src/hooks/useAdminNotifications.ts
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getSocket } from '@/lib/socket';
import { audioManager } from '@/features/notifications/store/notificationStore';
import { useNotificationStore } from '@/features/notifications/store/notificationStore';

export const useAdminNotifications = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('newOrder', (payload: any) => {
      console.log('🔔 ADMIN: New Order Received!', payload);

      toast.success(`New Order #${payload.shortId}`, {
        description: `Customer: ${payload.customerName} • Rs. ${payload.totalAmount}`,
        duration: 12000,
        action: {
          label: 'View Order',
          onClick: () => navigate(`/admin/orders/${payload.orderId}`),
        },
      });

      // Add to Notification Center (no timestamp needed!)
      addNotification({
        orderId: payload.orderId,
        shortId: payload.shortId,
        status: 'pending', // initial status
        title: `New Order #${payload.shortId}`,
        message: `Customer: ${payload.customerName} • ${payload.itemsCount || '?'} items • Rs. ${payload.totalAmount}`,
        important: true,
        playSound: true,
      });

      audioManager?.play('new-order-bell', { volume: 0.6 });
    });

    socket.on('newOrderAlert', (payload: any) => {
      console.log('🚨 ADMIN: New Order Alert!', payload);

      toast.info(`New Order Alert #${payload.shortId}`, {
        description: `${payload.isUrgent ? 'URGENT! ' : ''}${payload.itemsCount} items • ${payload.customerName}`,
        duration: 20000,
        style: {
          background: payload.isUrgent ? '#b91c1c' : '#c2410c',
          color: 'white',
        },
        action: {
          label: 'View',
          onClick: () => navigate(`/admin/orders/${payload.orderId}`),
        },
      });

      // Add to Notification Center (no timestamp!)
      addNotification({
        orderId: payload.orderId,
        shortId: payload.shortId,
        status: 'pending',
        title: payload.isUrgent ? `URGENT New Order #${payload.shortId}` : `New Order Alert #${payload.shortId}`,
        message: `${payload.itemsCount} items • ${payload.customerName} • Rs. ${payload.totalAmount || '?'}`,
        important: payload.isUrgent,
        playSound: true,
      });

      if (payload.isUrgent) {
        audioManager?.play('urgent-new-order', { volume: 0.75 });
      }
    });

    return () => {
      socket.off('newOrder');
      socket.off('newOrderAlert');
    };
  }, [navigate, addNotification]); // ← addNotification is stable, safe to include
};