// Service Worker for TPB2 PWA
var CACHE_NAME = 'tpb2-cache-v1';
var urlsToCache = [
  './',
  './index.html',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png',
  './manifest.json'
];

// インストール時にキャッシュ
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// 古いキャッシュの削除
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

// ネットワーク優先、失敗時はキャッシュ
self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request).then(function(response) {
      // 成功したらキャッシュを更新
      if (response && response.status === 200) {
        var responseClone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseClone);
        });
      }
      return response;
    }).catch(function() {
      // オフライン時はキャッシュから返す
      return caches.match(event.request);
    })
  );
});
