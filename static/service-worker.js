const CACHE_NAME = 'cumapp-v1';
const urlsToCache = [
  '/',
  '/static/css/enhanced-chat.css',
  '/static/js/enhanced-chat.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});