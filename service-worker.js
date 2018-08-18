importScripts("js/idb.js");
importScripts("js/dbhelper.js");

const currentCache = "mws-restaurant-project-v1";
const HTMLFiles = ["/index.html", "/restaurant.html"];
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
    ...HTMLFiles,
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

// activation phase of service worker
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

// intercept network requests by using fetch event
self.addEventListener("fetch", event => {
  // for .html files, fetch update from network first, then add it to cache
  // if offline, serve data from cache
  const htmlDocument = /(\/|\.html)$/i;
  if (htmlDocument.test(event.request.url) === true) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          console.log(event.request);
          const responseToCache = response.clone();
          caches.open(currentCache).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
