/* Pile-Poil · service worker : le jeu marche hors ligne une fois ouvert.
   Change VERSION à chaque mise à jour du jeu pour forcer le rafraîchissement. */
const VERSION = 'pilepoil-v2';
const SHELL = ['./', 'index.html', 'ads.js', 'manifest.webmanifest', 'privacy.html',
  'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png', 'favicon-32.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // jamais de cache pour les pubs et la mesure d'audience
  if (/googlesyndication|doubleclick|googleadservices|fundingchoices|google\.com|gstatic\.com\/(?!s\/)/.test(url.href)) return;
  if (url.origin === location.origin) {
    // réseau d'abord pour la page (mises à jour), cache en secours
    if (e.request.mode === 'navigate') {
      e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(VERSION).then(c => c.put('index.html', cp)); return r; }).catch(() => caches.match('index.html')));
      return;
    }
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => { const cp = r.clone(); caches.open(VERSION).then(c => c.put(e.request, cp)); return r; })));
    return;
  }
  // polices Google : cache au passage
  if (/fonts\.(googleapis|gstatic)\.com/.test(url.host)) {
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => { const cp = r.clone(); caches.open(VERSION).then(c => c.put(e.request, cp)); return r; })));
  }
});
