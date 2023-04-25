const CACHE_NAME = `demo-v1`;
    
// Use the install event to pre-cache all initial resources.
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    cache.addAll([
      './',
      './assets/icons/128x128.png',
      './assets/icons/144x144.png',
      './assets/icons/152x152.png',
      './assets/icons/192x192.png',
      './assets/icons/256x256.png',
      './assets/icons/512x512.png',
      './assets/icons/apple-touch-icon.png',
      './assets/icons/favicon.png',
      './css/app.css',
      './css/icons.css',
      './fonts/filled.css',
      './fonts/Framework7Icons-Regular.ttf',
      './fonts/Framework7Icons-Regular.woff',
      './fonts/material-icons-outlined.woff',
      './fonts/material-icons-round.woff',
      './fonts/material-icons-sharp.woff',
      './fonts/material-icons-two-tone.woff',
      './fonts/material-icons.css',
      './fonts/material-icons.woff',
      './fonts/outlined.css',
      './fonts/round.css',
      './fonts/sharp.css',
      './fonts/two-tone.css',
      './framework7/framework7-bundle.min.css',
      './framework7/framework7-bundle.min.js',
      './js/app.js',
      './js/routes.js',
      './js/store.js',
      './pages/404.html',
      './pages/about.html',
      './pages/catalog.html',
      './pages/dynamic-route.html',
      './pages/form.html',
      './pages/product.html',
      './pages/request-and-load.html',
      './pages/settings.html'
    ]);
  })());
});

self.addEventListener('fetch', event => {
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    // Get the resource from the cache.
    const cachedResponse = await cache.match(event.request);
    if (cachedResponse) {
      return cachedResponse;
    } else {
        try {
          // If the resource was not in the cache, try the network.
          const fetchResponse = await fetch(event.request);
    
          // Save the resource in the cache and return it.
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        } catch (e) {
          // The network failed
        }
    }
  })());
});
