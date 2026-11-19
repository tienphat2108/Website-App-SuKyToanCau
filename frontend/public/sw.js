/**
 * Service worker của Sử Ký Toàn Cầu.
 *
 * Chiến lược:
 * - Điều hướng trang: ưu tiên mạng để luôn nhận bản mới khi có kết nối; khi mất
 *   mạng thì trả bản đã lưu của chính trang đó, cuối cùng mới tới trang ngoại tuyến.
 * - Tài nguyên tĩnh có băm trong tên (JS, CSS, ảnh, phông): ưu tiên bộ nhớ đệm vì
 *   tệp không đổi nội dung.
 * - Không đụng tới POST, API hay nội dung của miền khác.
 */

const VERSION = 'sktc-v1';
const CORE_CACHE = `${VERSION}-core`;
const PAGE_CACHE = `${VERSION}-pages`;
const ASSET_CACHE = `${VERSION}-assets`;
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CORE_CACHE)
      .then((cache) =>
        cache.addAll([OFFLINE_URL, '/images/icon-192.png', '/images/icon-512.png']),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && response.type === 'basic') {
            const copy = response.clone();
            caches.open(PAGE_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match(OFFLINE_URL);
        }),
    );
    return;
  }

  const isStaticAsset =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/fonts/');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches
                .open(ASSET_CACHE)
                .then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
  }
});
