importScripts("js/idb.js");

const cacheName = "mws-restaurant-project";
const offlineUrl = "index.html";

// add files to cache when installing service worker
self.addEventListener("install", event => {
  const urlsToCache = [
    offlineUrl,
    "restaurant.html",
    "/css/styles.css",
    // "/data/restaurants.json",
    "/js/dbhelper.js",
    "/js/main.js",
    "/js/register.js",
    "/js/restaurant_info.js",
    "/img/",
    "/manifest.json"
  ];

  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(urlsToCache))
  );
});

const createDB = () => {
  const dbPromise = idb.open("mws", 1, upgradeDB => {
    const store = upgradeDB.createObjectStore("restaurants", {
      keyPath: "id"
    });

    fetch("http://localhost:1337/restaurants")
      .then(data => data.json())
      .then(restaurants => {
        dbPromise.then(db => {
          const tx = db.transaction("restaurants", "readwrite");
          const store = tx.objectStore("restaurants");

          restaurants.map(restaurant => {
            console.log("Adding restaurant: ", restaurant);
            return store.put(restaurant);
          });
        });
      });
  });
};

self.addEventListener("activate", event => {
  event.waitUntil(createDB());
});

// fetch data from service worker in offline mode
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

// synchronize data to database when connection is back
// self.addEventListener('sync', (event) => {
//   event.waitUntil(
//     idbKeyval.get('cache-v1').then(value => {
//       fetch('http://localhost:1337/restaurants/', {
//         method: 'POST',
//         headers: new Headers({
//           'content-type': 'application/json'
//         }),
//         body: JSON.stringify(value)
//       });
//       // idbKeyval.delete('cache-v1')
//     })
//   )
// });
