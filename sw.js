// 離線快取：先用手機裡存的版本秒開，背景再跟伺服器確認；首頁有新版就通知頁面重新整理。
const VERSION = 'tws-v8-20261124';
const FILES = ['./', 'index.html', 'css/app.css', 'js/app.js', 'js/data.js', 'js/laws.js', 'js/chars.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  // force-cache：頁面剛下載過的檔案直接從瀏覽器快取拿，不重複下載（只當離線備用）
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(FILES.map(f =>
    fetch(new Request(f, { cache: 'force-cache' })).then(r => r.ok ? c.put(f, r) : c.add(f)).catch(() => c.add(f).catch(() => {}))
  ))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
const keep = res => res && res.ok && (res.type === 'basic' || res.type === 'cors');
const notify = () => self.clients.matchAll({ type: 'window' }).then(cs => cs.forEach(c => c.postMessage('updated')));
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !/^https?:/.test(req.url)) return;
  const same = new URL(req.url).origin === location.origin;
  e.respondWith((async () => {
    const c = await caches.open(VERSION);
    const hit = await c.match(req);   // 網址要完全一樣（含 ?v=），換版本就會抓新的
    const old = hit && req.mode === 'navigate' ? hit.clone() : null;   // 先複製一份，原本那份要直接回給頁面
    const net = fetch(same ? new Request(req.url, { cache: 'no-cache', credentials: 'same-origin' }) : req).then(res => {
      if (keep(res)) {
        const toCache = res.clone(), toCmp = old ? res.clone() : null;
        const job = (async () => {
          if (toCmp) { const [a, b] = await Promise.all([old.text(), toCmp.text()]); if (a !== b) { await c.put(req, toCache); notify(); return; } }
          await c.put(req, toCache);
        })();
        e.waitUntil(job.catch(() => {}));
      }
      return res;
    });
    if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
    return net.catch(async () => (await c.match(req, { ignoreSearch: true })) || Response.error());
  })());
});
