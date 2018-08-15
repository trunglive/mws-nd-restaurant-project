importScripts("js/idb.js");
importScripts("js/dbhelper.js");

const cacheName = "mws-restaurant-project";
const offlineUrl = ["index.html"];

// add files to cache when installing service worker
self.addEventListener("install", event => {
  const urlsToCache = [
    ...offlineUrl,
    "/css/styles.css",
    "/img/icons",
    "/img/restaurant-photos",
    "/js/dbhelper.js",
    "/js/idb.js",
    "/js/index.js",
    "/js/register.js",
    "/js/restaurant_info.js",
    "./magic-ball.png",
    "/manifest.json"
  ];

  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(urlsToCache))
  );
});

// create function to store data in IndexedDB database for offline usage
// const createDB = () => {
//   const dbPromise = idb.open("mws", 2, upgradeDB => {
//     switch (upgradeDB.oldVersion) {
//       case 0:
//         upgradeDB.createObjectStore("restaurants", {
//           keyPath: "id"
//         });
//       case 1:
//         upgradeDB.createObjectStore("reviews", {
//           keyPath: "id"
//         });
//     }
//   });

//   fetch("http://localhost:1337/restaurants")
//     .then(data => data.json())
//     .then(restaurants => {
//       dbPromise.then(db => {
//         const tx = db.transaction("restaurants", "readwrite");
//         const store = tx.objectStore("restaurants");

//         restaurants.map(restaurant => {
//           console.log("Adding restaurant: ", restaurant);
//           return store.put(restaurant);
//         });

//         return tx.complete;
//       });
//     });
// };

// calling createDB to create IndexedDB database when service worker is activated
self.addEventListener("activate", event => {
  event.waitUntil(DBHelper.cacheRestaurants(), DBHelper.cacheReviews());
});

// Source: https://github.com/deanhume/progressive-web-apps-book/blob/master/chapter-4/WebP-Images/service-worker.js
// Listen to fetch events
// self.addEventListener('fetch', function(event) {

//   // Check if the image is a jpeg or png
//   if (/\.jpe?g$|.png$/.test(event.request.url)) {

//     // Inspect the accept header for WebP support
//     let supportsWebp = false;
//     if (event.request.headers.has('accept')) {
//       supportsWebp = event.request.headers
//         .get('accept')
//         .includes('webp');
//     }

//     // If the browser supports WebP
//     if (supportsWebp) {
//       // Clone the request
//       const req = event.request.clone();

//       // Build the return URL
//       const returnUrl = req.url.substr(0, req.url.lastIndexOf(".")) + ".webp";

//       event.respondWith(
//         fetch(returnUrl, {
//           mode: 'no-cors'
//         })
//       );
//     }
//   }
// });

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
            cache.put(event.request.url, responseToCache);
          });

          return response;
        })
        .catch(error => {
          if (
            event.request.method === 'GET' &&
            event.request.headers.get("accept").includes("text/html")
          ) {
            return caches.match(offlineUrl);
          }
        });
    })
  );
});

// synchronize data to database when connection is back
// self.addEventListener("sync", event => {
//   if (event.tag === "send-restaurant-review") {
//     event.waitUntil(
//       idb
//         .open("mws", 1)
//         .then(db => {
//           const tx = db.transaction(["restaurants"], "readonly");
//           const store = tx.objectStore("restaurants");
//           const index = store.index("name");
//           return index.get(key);
//         })
//         .then(restaurant => {
//           console.log(restaurant, "yayyyy");
//           console.log("the comment is being saved to the server...");
//           fetch("http://localhost:1337/reviews/", {
//             method: "POST",
//             headers: new Headers({
//               "content-type": "application/json"
//             }),
//             body: JSON.stringify({
//               restaurant_id: restaurant.id,
//               name: restaurant.name,
//               rating: "find a way to retrieve rating",
//               comments: "find a way to retrieve comments"
//             })
//           });
//         })
//     );
//   }
// });
