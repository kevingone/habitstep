/* Service Worker for 微步 HabitStep PWA
 * Cache-first 策略：资源命中缓存则直接返回，未命中则走网络并更新缓存
 */
const CACHE_NAME = 'habitstep-v1.0';
const CACHE_LIST = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './icon-512.png',
  './icon-192.png',
  './apple-touch-icon.png',
  './apple-touch-icon-152.png',
  './apple-touch-icon-120.png',
  './apple-touch-icon-76.png',
  './apple-touch-icon-57.png'
];

// 安装：预缓存关键资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_LIST))
  );
  self.skipWaiting();
});

// 激活：清理旧版本缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 请求拦截：cache-first 策略
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (!req.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((resp) => {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return resp;
      }).catch(() => cached);
    })
  );
});
