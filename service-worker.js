importScripts("js/idb.js");
importScripts("js/dbhelper.js");

const currentCache = "mws-restaurant-project-v1";
const offlineUrls = ["/index.html", "/restaurant.html"];
const imageUrls = [
  "/img/restaurant-photos/1.jpg",
  "/img/restaurant-photos/2.jpg",
  "/img/restaurant-photos/3.jpg",
  "/img/restaurant-photos/4.jpg",
  "/img/restaurant-photos/5.jpg",
  "/img/restaurant-photos/6.jpg",
  "/img/restaurant-photos/7.jpg",
  "/img/restaurant-photos/8.jpg",
  "/img/restaurant-photos/9.jpg",
  "/img/restaurant-photos/10.jpg"
];
const iconUrls = [
  "/img/icons/favorite.png",
  "/img/icons/unfavorite.png",
  "/img/icons/icon-72x72.png",
  "/img/icons/icon-96x96.png",
  "/img/icons/icon-128x128.png",
  "/img/icons/icon-144x144.png",
  "/img/icons/icon-152x152.png",
  "/img/icons/icon-192x192.png",
  "/img/icons/icon-384x384.png",
  "/img/icons/icon-512x512.png"
];

// add files to cache when installing service worker
self.addEventListener("install", event => {
  const urlsToCache = [
    "/",
    ...offlineUrls,
    ...imageUrls,
    ...iconUrls,
    "/css/styles.css",
    "/js/dbhelper.js",
    "/js/idb.js",
    "/js/index.js",
    "/js/register.js",
    "/js/restaurant_info.js",
    "/magic-ball.png",
    "/manifest.json"
  ];

  console.log("service worker installed", event);
  event.waitUntil(
    caches.open(currentCache).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      // delete all old cache versions of the 'mws-restaurant-project'
      // and keep the current version
      return Promise.all(
        cacheNames
          .filter(cacheName => {
            return (
              cacheName.startsWith("mws-restaurant-project") &&
              currentCache != cacheName
            );
          })
          .map(cacheName => {
            return caches.delete(cacheName);
          })
      );
    })
  );

  // cache restaurants and reviews in IndexedDB database
  // during activation of service worker
  event.waitUntil(DBHelper.cacheRestaurants(), DBHelper.cacheReviews());
  console.log("service worker activated", event);
});

// look in cache first, then fall back to network to keep caching
// if network fails, fall back to cached offline pages
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.open(currentCache).then(cache => {
      // check to see whether the request exists in the cache or not
      return cache.match(event.request).then(response => {
        if (response) {
          return response;
        }

        // if the requested resource doesn't exist,
        // continue to make request
        // and add response into the cache
        // in the case of failed fetch and the next page could not be retrieved,
        // fall back to previously cached offline source
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then(response => {
            if (!response || response.status !== 200) {
              return response;
            } else {
              const responseToCache = response.clone();
              if (
                !event.request.url.includes("/restaurants/") &&
                !event.request.url.includes("/reviews/")
              ) {
                cache.put(event.request.url, responseToCache);
              } else {
                // console.log("this event request is not cached");
              }

              return response;
            }
          })
          .catch(error => {
            console.log(error);
            if (
              event.request.method === "GET" &&
              event.request.headers.get("accept").includes("text/html")
            ) {
              // return offline pages in cache from previous installation of service worker
              return caches.match(offlineUrls);
            }
          });
      });
    })
  );
});

// synchronize data to database when connection is back
// by using Background Sync feature
// self.addEventListener("sync", event => {
//   if (event.tag === "send-review") {
//     event.waitUntil(DBHelper.addPendingReviewToBackend());
//   }
// });
