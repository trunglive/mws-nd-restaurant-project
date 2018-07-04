const cacheName = "mws-restaurant-project";

self.addEventListener("install", event => {
  const urlsToCache = [
    "/",
    "/index.html",
    "/restaurant.html",
    "/css/styles.css",
    "/data/restaurants.json",
    "/js/dbhelper.js",
    "/js/main.js",
    "js/register.js",
    "js/restaurant_info.js"
  ];

  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});
