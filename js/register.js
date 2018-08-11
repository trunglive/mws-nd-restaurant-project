// register service worker if it's available in the browser
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("../service-worker.js")
      .then(registration => {
        console.log("SW Registration worked!", registration);
      })
      .catch(error => {
        console.log("SW Registration failed!", error);
      });
  });
}
