// 離線快取：有網路時一律抓最新版，離線時用上次存下的檔案。
const VERSION = 'tws-v4-20261124';
const FILES = ['./', 'index.html', 'css/app.css', 'js/app.js', 'js/data.js', 'js/laws.js', 'js/chars.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // 有網路就拿最新版並更新快取；離線才用快取
  e.respondWith(fetch(e.request).then(res => {
    if (res.ok && (res.type === 'basic' || res.type === 'cors')) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
