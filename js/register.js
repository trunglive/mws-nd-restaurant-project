// register service worker if it's available in the browser
// if service worker is already registered
// the browser will return the promise for existing registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("../service-worker.js")
      .then(registration => {
        console.log("service worker registered", registration);
      })
      .catch(error => {
        console.log("service worker failed to register", error);
      });

    // navigator.serviceWorker.ready.then(registration => {
    //   registration.sync.register("toggle-restaurant-favorite");
    //   registration.sync.register("send-restaurant-review");
    // });
  });
} else {
  console.log("browser has not yet supported service worker");
}
