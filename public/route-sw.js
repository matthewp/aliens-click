
self.addEventListener('fetch', function(event) {
  if(/\/api\//.test(event.request.url)) {
    async function update(cache) {
      let response = await fetch(event.request.clone());
      cache.put(event.request, response.clone());
      let data = await response.json();
      let matched = await clients.matchAll();
      matched[0].postMessage({
        type: 'data-update',
        path: new URL(event.request.url).pathname,
        data
      });
    }

    async function loadFromCache() {
      let cache = await caches.open(cacheName);
      let k = await cache.keys();
      let response = await cache.match(event.request);
      if(response) {
        Promise.resolve().then(() => update(cache));
        return response;
      } else {
        response = await fetch(event.request);
        cache.put(event.request, response.clone());
        return response;
      }
    }

    event.respondWith(loadFromCache());
  }
});