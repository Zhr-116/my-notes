const CACHE_NAME = 'notes-v1';
const ASSETS = [
  './',
  './index.html',
  './styles/main.css',
  './js/state.js',
  './js/utils.js',
  './js/entry.js',
  './js/detail.js',
  './js/milestone.js',
  './js/timeline.js',
  './js/render.js',
  './js/export.js',
  './js/app.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});