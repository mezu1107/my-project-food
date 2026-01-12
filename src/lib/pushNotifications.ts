// src/lib/pushNotifications.ts
// PRODUCTION-READY — JANUARY 11, 2026
// Web Push for PWA (Chrome/Edge/Firefox/Safari)

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;

  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const granted = await Notification.requestPermission();
  return granted === 'granted';
}

export function initPushNotifications() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.log('SW registered: ', registration);
      requestNotificationPermission();
    });
  }
}

// Call this in your App.tsx root effect