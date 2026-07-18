// Service Worker — ZALAVRAI SYSTÈME
// App shell offline + relais des événements de synchronisation vers l'app.

const CACHE_NAME = 'zalavrai-shell-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-32.png',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Réseau d'abord (données fraîches), repli sur le cache hors-ligne.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // laisser passer Supabase/CDN

  event.respondWith(
    fetch(event.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
  );
});

// Background Sync — déclenché par reg.sync.register('zalavrai-outbox') côté app.
self.addEventListener('sync', event => {
  if (event.tag === 'zalavrai-outbox') {
    event.waitUntil(notifyClients({ type: 'BG_SYNC' }));
  }
});

// Periodic Background Sync — pull périodique quand l'app est fermée.
self.addEventListener('periodicsync', event => {
  if (event.tag === 'zalavrai-periodic') {
    event.waitUntil(notifyClients({ type: 'PERIODIC_SYNC' }));
  }
});

async function notifyClients(message) {
  const clientsList = await self.clients.matchAll({ type: 'window' });
  clientsList.forEach(client => client.postMessage(message));
}
