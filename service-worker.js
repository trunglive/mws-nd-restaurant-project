importScripts("lib/idb.js");

const cacheName = "mws-restaurant-project";
const offlineUrl = "index.html";

const dbPromise = idb.open("restaurant-db", 2, function(upgradeDb) {
  switch (upgradeDb.oldVersion) {
    case 0:
    //
    case 1:
      console.log("Creating the restaurants object store");
      upgradeDb.createObjectStore("restaurants", { keyPath: "id" });
  }
});

dbPromise.then(function(db) {
  const tx = db.transaction("restaurants", "readwrite");
  const store = tx.objectStore("restaurants");

  fetch("http://localhost:1337/restaurants")
    .then(data => data.json())
    .then(restaurants => {
      restaurants.map(restaurant => {
        console.log("Adding item: ", restaurant);
        return store.add(restaurant);
      });
    });

  // .catch(function(e) {
  //   tx.abort();
  //   console.log(e);
  // })
  // .then(function() {
  //   console.log("All restaurants added successfully!");
  // });
});

// install service worker by adding files to cache
// when the page is loaded for the next time
// the file in service worker will be loaded
// instead of requesting data from server
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
    "/img/"
  ];

  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(urlsToCache))
  );
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
