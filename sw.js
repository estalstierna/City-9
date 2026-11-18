/* Service worker: makes the game installable and playable offline.
   VERSION is a hash of the cached files: run python3 tools/bump-sw.py after changing code (the tests check it). */
const VERSION = 'c9-f9736119e7';
const MEDIA = 'c9-media-3'; /* images and fonts, for offline play only (bumped: older caches held replaced art) */
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/engine.js',
  './js/audio.js',
  './js/content/codex.js',
  './js/content/prologue.js',
  './js/content/training.js',
  './js/content/union.js',
  './js/content/duties.js',
  './js/content/beats.js',
  './js/content/search.js',
  './js/content/docs-game.js',
  './js/content/chapter2.js',
  './js/content/chapter3.js',
  './js/content/systems.js',
  './js/content/raids.js',
  './js/content/airwatch.js',
  './js/content/squad.js',
  './js/content/world.js',
  './js/content/routines.js',
  './js/content/crowd.js',
  './js/content/minigames2.js',
  './js/content/minigames3.js',
  './js/content/chapter4.js',
  './js/content/divisions.js',
  './js/content/duties2.js',
  './js/content/chapter5.js',
  './js/content/chapter6.js',
  './js/content/transfer.js',
  './js/content/chapter7.js',
  './js/content/qol.js',
  './js/content/lantern.js',
  './js/content/echoes.js',
  './js/content/jfile.js',
  './js/content/dmap.js',
  './js/content/desk.js',
  './js/content/citymap.js',
  './js/content/command.js',
  './js/content/chapter8.js',
  './js/content/chapter9.js',
  './js/content/districts.js',
  './js/content/chapter10.js',
  './js/content/chapter11.js',
  './js/content/scan.js',
  './js/content/terminal.js',
  './js/content/chapter12.js',
  './js/content/patrol.js',
  './js/content/onboarding.js',
  './js/content/arcs.js',
  './js/content/lore.js',
  './js/content/career.js',
  './js/fx.js',
  './js/live.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== MEDIA).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Network first for everything of our own — code AND images — so a replaced picture shows on the
   very next load. Images are revalidated with the server (a cheap 304 when unchanged) and the copy
   in the cache is only used offline. Fonts from other hosts: cache first. */
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isMedia = /\.(png|jpe?g|webp|woff2?)$/.test(url.pathname) || url.hostname.includes('fonts.');
  if (isMedia && url.origin !== location.origin) {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok || res.type === 'opaque') {
              const copy = res.clone();
              caches.open(MEDIA).then((c) => c.put(req, copy));
            }
            return res;
          })
      )
    );
    return;
  }
  if (isMedia) {
    e.respondWith(
      fetch(req, { cache: 'no-cache' })
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(MEDIA).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req))
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
