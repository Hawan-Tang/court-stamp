// 離線快取：網路 1.5 秒內有回應就用最新版，太慢或離線就先用快取（背景照樣更新）。
const VERSION = 'tws-v5-20261124';
const FILES = ['./', 'index.html', 'css/app.css', 'js/app.js', 'js/data.js', 'js/laws.js', 'js/chars.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  // force-cache：頁面剛下載過的檔案直接從瀏覽器快取拿，不重複下載
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(FILES.map(f =>
    fetch(new Request(f, { cache: 'force-cache' })).then(r => r.ok ? c.put(f, r) : c.add(f)).catch(() => c.add(f).catch(() => {}))
  ))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
const keep = res => res && res.ok && (res.type === 'basic' || res.type === 'cors');
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !/^https?:/.test(req.url)) return;
  const font = /fonts\.(googleapis|gstatic)\.com/.test(req.url);
  e.respondWith(caches.open(VERSION).then(async c => {
    const hit = await c.match(req, { ignoreSearch: !font });
    const net = fetch(req).then(res => { if (keep(res)) c.put(req, res.clone()); return res; });
    if (font && hit) { net.catch(() => {}); return hit; }           // 字型不會變，有快取就直接用
    if (!hit) return net;
    const slow = new Promise(r => setTimeout(() => r(hit), 1500));
    e.waitUntil(net.catch(() => {}));
    return Promise.race([net.catch(() => hit), slow]);
  }));
});
