/* Service worker: makes the game installable and playable offline.
   Bump VERSION whenever files change so players get the update. */
const VERSION = 'c9-v21';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/engine.js',
  './js/content/codex.js',
  './js/content/prologue.js',
  './js/content/training.js',
  './js/content/union.js',
  './js/content/duties.js',
  './js/content/beats.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Network first for the game's own code (so updates arrive), falling back to cache offline.
   Cache first for images and fonts. */
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isMedia = /\.(png|jpe?g|webp|woff2?)$/.test(url.pathname) || url.hostname.includes('fonts.');
  if (isMedia) {
    e.respondWith(
      caches.match(req).then((hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok || res.type === 'opaque') {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
      )
    );
    return;
  }
  if (url.origin !== location.origin) return;
  // cache: 'no-cache' makes the browser revalidate with GitHub Pages instead of
  // reusing its own 10-minute HTTP cache, so updates show up on the next launch.
  e.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
  );
});
