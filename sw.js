const cacheName = "mws-restaurant-project";
const offlineUrl = "index.html";

self.addEventListener("install", event => {
  const urlsToCache = [
    offlineUrl,
    "/restaurant.html",
    "/css/styles.css",
    "/data/restaurants.json",
    "/js/dbhelper.js",
    "/js/main.js",
    "/js/register.js",
    "/js/restaurant_info.js",
    "/img/"
  ];

  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    // check to see whether the request exists in the cache or not
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
    
    // if it doesn't exist, add response into the cache
    // in the case of failed fetch, fall back to cached offline source
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest)
        .then(response => {
          if (!response || response.status !== 200) {
            return response;
          }

          const responseToCache = response.clone();

          caches.open(cacheName).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(error => {
          if (
            event.request.method === "GET" &&
            event.request.headers.get("accept").includes("text/html")
          ) {
            return caches.match(offlineUrl);
          }
        });
    })
  );
});

// this.addEventListener("fetch", event => {
//   if (
//     event.request.method === "GET" &&
//     event.request.headers.get("accept").includes("text/html")
//   ) {
//     event.respondWith(
//       fetch(event.request.url).catch(error => {
//         return caches.match(offlineUrl);
//       })
//     );
//   } else {
//     event.respondWith(fetch(event.request));
//   }
// });

// self.addEventListener("fetch", event => {
//   event.respondWith(
//     caches.match(event.request).then(response => {
//       if (response) {
//         return response;
//       }
//       return fetch(event.request);
//     })
//   );
// });
