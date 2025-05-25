// sw.js (Versi yang sudah diperbaiki)
import {registerRoute} from 'workbox-routing';
import {StaleWhileRevalidate, CacheFirst} from 'workbox-strategies';
import {precacheAndRoute} from 'workbox-precaching';
import {ExpirationPlugin} from 'workbox-expiration';

// 1. Precaching untuk file-file penting
precacheAndRoute(self.__WB_MANIFEST || []);

// 2. Cache strategi untuk API
registerRoute(
  ({url}) => url.pathname.startsWith('/v1/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 1 hari
      })
    ]
  })
);

// 3. Cache untuk gambar
registerRoute(
  ({request}) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
      })
    ]
  })
);

// 4. Cache untuk aset statis (CSS/JS)
registerRoute(
  ({request}) => 
    request.destination === 'script' || 
    request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'static-assets'
  })
);

// 5. Push Notification Handler (Tetap berfungsi offline)
self.addEventListener('push', (event) => {
  const payload = event.data?.json() || {
    title: 'StoryShare Update',
    body: 'Ada cerita baru yang bisa kamu baca!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png'
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      badge: payload.badge,
      vibrate: [200, 100, 200],
      data: { url: '/stories' }
    })
  );
});

// 6. Handler ketika notifikasi diklik
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({type: 'window'}).then(windowClients => {
      const targetUrl = event.notification.data?.url || '/';
      const matchingClient = windowClients.find(
        client => client.url === targetUrl
      );

      if (matchingClient) {
        return matchingClient.focus();
      }
      return clients.openWindow(targetUrl);
    })
  );
});

// 7. Fallback untuk offline
registerRoute(
  ({request}) => request.mode === 'navigate',
  new CacheFirst({
    cacheName: 'offline-fallback',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 1,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 1 minggu
      })
    ]
  })
);