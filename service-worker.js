const CACHE_NAME = `demo-v1`;
    
// Use the install event to pre-cache all initial resources.
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    cache.addAll([
      './',
      './assets/Framework7Icons-Regular-59a82bd9.woff',
      './assets/Framework7Icons-Regular-ef97b759.ttf',
      './assets/Framework7Icons-Regular-f19b8090.woff2',
      './assets/index-685f33ee.js',
      './assets/index-b00edbbb.css',
      './assets/MaterialIcons-Regular-a87d66c9.woff2',
      './assets/MaterialIcons-Regular-b7f4a3ab.ttf',
      './assets/MaterialIcons-Regular-c4a1baec.woff',
      './autocomplete-languages.json',
      './img/beach.jpg',
      './img/f7-icon-square.png',
      './img/f7-icon.png',
      './img/lock.jpg',
      './img/monkey.jpg',
      './img/mountains.jpg',
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
