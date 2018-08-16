// register service worker if it's available in the browser
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("../service-worker.js")
      .then(registration => {
        console.log("Service Worker registered", registration);
      })
      .catch(error => {
        console.log("Service Worker failed to register", error);
      });

    // navigator.serviceWorker.ready.then(registration => {
    //   registration.sync.register("toggle-restaurant-favorite");
    //   registration.sync.register("send-restaurant-review");
    // });
  });
} else {
  console.log("Browser has not supported Service Worker");
}
