// public/sw.js
// PRODUCTION-READY Web Push Service Worker

self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const { title, body, icon, badge, tag, data: orderData } = data;

  event.waitUntil(
    self.registration.showNotification(title || 'FoodExpress', {
      body,
      icon: icon || '/favicon.ico',
      badge: badge || '/badge.png',
      tag,
      data: orderData || {},
      actions: [
        { action: 'view', title: 'Track Order' },
        { action: 'close', title: 'Dismiss' },
      ],
      requireInteraction: true,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/orders';
  event.waitUntil(clients.openWindow(url));
});