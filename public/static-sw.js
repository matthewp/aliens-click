let precacheConfig = [
  ["/app/article-controller.js", 2],
  ["/app/article-view.js", 2],
  ["/app/index-controller.js", 2],
  ["/app/index-view.js", 2],
  ["/app/keyboard-nav", 2],
  ["/app/list-item-view.js", 2],
  ["/app/main.js", 2],
  ["/app/section-view.js", 2],
  ["/manifest.json", 2],
  ["/styles/main.css", 2],
  ["/styles/article.css", 2],
  ["/styles/index.css", 2]
];

let cacheName = 'sw-v3--' + (self.registration ? self.registration.scope : '');
let ignoreUrlParametersMatching = [/^utm_/];


function addDirectoryIndex(originalUrl, index) {
  var url = new URL(originalUrl);
  if (url.pathname.slice(-1) === '/') {
    url.pathname += index;
  }
  return url.toString();
}

function createCacheKey(originalUrl, paramName, paramValue,
                          dontCacheBustUrlsMatching) {
  // Create a new URL object to avoid modifying originalUrl.
  var url = new URL(originalUrl);

  // If dontCacheBustUrlsMatching is not set, or if we don't have a match,
  // then add in the extra cache-busting URL parameter.
  if (!dontCacheBustUrlsMatching ||
      !(url.toString().match(dontCacheBustUrlsMatching))) {
    url.search += (url.search ? '&' : '') +
      encodeURIComponent(paramName) + '=' + encodeURIComponent(paramValue);
  }

  return url.toString();
}

function isPathWhitelisted(whitelist, absoluteUrlString) {
  // If the whitelist is empty, then consider all URLs to be whitelisted.
  if (whitelist.length === 0) {
    return true;
  }

  // Otherwise compare each path regex to the path of the URL passed in.
  var path = (new URL(absoluteUrlString)).pathname;
  return whitelist.some(function(whitelistedPathRegex) {
    return path.match(whitelistedPathRegex);
  });
}

function stripIgnoredUrlParameters(originalUrl, ignoreUrlParametersMatching) {
  var url = new URL(originalUrl);

  url.search = url.search.slice(1) // Exclude initial '?'
    .split('&') // Split into an array of 'key=value' strings
    .map(function(kv) {
      return kv.split('='); // Split each 'key=value' string into a [key, value] array
    })
    .filter(function(kv) {
      return ignoreUrlParametersMatching.every(function(ignoredRegex) {
        return !ignoredRegex.test(kv[0]); // Return true iff the key doesn't match any of the regexes.
      });
    })
    .map(function(kv) {
      return kv.join('='); // Join each [key, value] array into a 'key=value' string
    })
    .join('&'); // Join the array of 'key=value' strings into a string with '&' in between each

  return url.toString();
}

var hashParamName = '_sw-precache';
var urlsToCacheKeys = new Map(
  precacheConfig.map(function(item) {
    var relativeUrl = item[0];
    var hash = item[1];
    var absoluteUrl = new URL(relativeUrl, self.location);
    var cacheKey = createCacheKey(absoluteUrl, hashParamName, hash, false);
    return [absoluteUrl.toString(), cacheKey];
  })
);

function setOfCachedUrls(cache) {
  return cache.keys().then(function(requests) {
    return requests.map(function(request) {
      return request.url;
    });
  }).then(function(urls) {
    return new Set(urls);
  });
}

self.addEventListener('install', function(event) {
  async function installCaches() {
    let cache = await caches.open(cacheName);
    let cacheUrls = await setOfCachedUrls(cache);

    let cacheAdds = Array.from(urlsToCacheKeys.values()).map(cacheKey => {
      // If we don't have a key matching url in the cache already, add it.
      if (!cacheUrls.has(cacheKey)) {
        return cache.add(new Request(cacheKey, {credentials: 'same-origin'}));
      }
    });

    await Promise.all(cacheAdds);

    // Force the SW to transition from installing -> active state
    return self.skipWaiting();
  }

  event.waitUntil(installCaches());
});

self.addEventListener('activate', function(event) {
  var setOfExpectedUrls = new Set(urlsToCacheKeys.values());

  async function activateCaches() {
    let cache = await caches.open(cacheName);
    let existingRequests = await cache.keys();
    let cacheDeletes = existingRequests.map(existingRequest => {
      if (!setOfExpectedUrls.has(existingRequest.url) &&
        !/\/api\//.test(existingRequest.url)) {
        return cache.delete(existingRequest);
      }
    });
    await Promise.all(cacheDeletes);

    return self.clients.claim();
  }

  event.waitUntil(activateCaches());
});


self.addEventListener('fetch', function(event) {
  if (event.request.method === 'GET') {
    // Should we call event.respondWith() inside this fetch event handler?
    // This needs to be determined synchronously, which will give other fetch
    // handlers a chance to handle the request if need be.
    let shouldRespond;

    // First, remove all the ignored parameter and see if we have that URL
    // in our cache. If so, great! shouldRespond will be true.
    let url = stripIgnoredUrlParameters(event.request.url, ignoreUrlParametersMatching);
    shouldRespond = urlsToCacheKeys.has(url);

    // If shouldRespond is false, check again, this time with 'index.html'
    // (or whatever the directoryIndex option is set to) at the end.
    let directoryIndex = 'index.html';
    if (!shouldRespond && directoryIndex) {
      url = addDirectoryIndex(url, directoryIndex);
      shouldRespond = urlsToCacheKeys.has(url);
    }

    // If shouldRespond is still false, check to see if this is a navigation
    // request, and if so, whether the URL matches navigateFallbackWhitelist.
    let navigateFallback = '';
    if (!shouldRespond &&
        navigateFallback &&
        (event.request.mode === 'navigate') &&
        isPathWhitelisted([], event.request.url)) {
      url = new URL(navigateFallback, self.location).toString();
      shouldRespond = urlsToCacheKeys.has(url);
    }

    // If shouldRespond was set to true at any point, then call
    // event.respondWith(), using the appropriate cache key.
    if (shouldRespond) {
      async function respondFromCache() {
        let cache = await caches.open(cacheName);

        let response = await cache.match(urlsToCacheKeys.get(url));
        if(response) {
          return response;
        } else {
          // Fall back to just fetch()ing the request if some unexpected error
          // prevented the cached response from being valid.
          console.warn('Couldn\'t serve response for "%s" from cache: %O', event.request.url, e);
          return fetch(event.request);
        }
      }

      event.respondWith(respondFromCache());
    }
  }
});