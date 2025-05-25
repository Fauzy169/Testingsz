import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { precacheAndRoute } from 'workbox-precaching';
import { ExpirationPlugin } from 'workbox-expiration';

// Precaching
precacheAndRoute(self.__WB_MANIFEST);

// Cache API responses
registerRoute(
  ({url}) => url.pathname.startsWith('/v1/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 1 day
      })
    ]
  })
);

// Cache images
registerRoute(
  ({request}) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      })
    ]
  })
);

// Cache static assets
registerRoute(
  ({request}) => request.destination === 'script' || 
                 request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'static-assets'
  })
);

// Push notifications
self.addEventListener('push', (event) => {
  const payload = event.data?.json() || {};
  const title = payload.title || 'New Story Available';
  const options = {
    body: payload.body || 'Check out the latest story!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge.png'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/stories')
  );
});