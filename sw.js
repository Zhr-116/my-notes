const CACHE_NAME = 'notes-v2'; // 版本号升级，浏览器一看到 v2 就会触发更新
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

// 安装时，立刻缓存所有核心文件
self.addEventListener('install', (e) => {
  self.skipWaiting(); // 强制让新的 Service Worker 立即生效
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// 激活时，清理旧版本的缓存（比如之前的 v1）
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('清理旧缓存:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // 立刻接管所有打开的页面
  );
});

// 拦截请求：网络优先（Network First）策略
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // 如果网络请求成功，顺便把最新结果更新到缓存里
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // 如果没网（断网了），才去缓存里找旧文件
        return caches.match(e.request);
      })
  );
});