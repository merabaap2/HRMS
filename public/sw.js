// Service Worker for HRMS PWA (Cache Buster v2.8.0)
const CACHE_NAME = 'hrms-cache-v2.8.0';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Let API requests bypass cache completely
  if (event.request.url.includes('/api/')) {
    return;
  }
  // Network first: always fetch fresh assets from server, fallback to cache only if completely offline
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
