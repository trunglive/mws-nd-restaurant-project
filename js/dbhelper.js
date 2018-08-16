/**
 * Common database helper functions
 */
class DBHelper {
  /**
   * Endpoint for geting all restaurants
   */
  static get RESTAURANT_URL() {
    const port = 1337; // current server port
    return `http://localhost:${port}/restaurants/`;
  }

  /**
   * Endpoint for getting all reviews
   */
  static get REVIEW_URL() {
    const port = 1337; // current server port
    return `http://localhost:${port}/reviews/`;
  }

  /**
   * Create IndexedDB database
   */
  static createDB() {
    return idb.open("mws", 3, upgradeDB => {
      switch (upgradeDB.oldVersion) {
        case 0:
          upgradeDB.createObjectStore("restaurants", {
            keyPath: "id"
          });
        case 1:
          upgradeDB.createObjectStore("reviews", {
            keyPath: "id",
            autoIncrement: true
          });
      }
    });
  }

  /**
   * Fetch restaurants from backend and cache them in IndexedDB
   */
  static cacheRestaurants() {
    return fetch(DBHelper.RESTAURANT_URL)
      .then(data => data.json())
      .then(restaurants => {
        return DBHelper.createDB().then(db => {
          const tx = db.transaction("restaurants", "readwrite");
          const store = tx.objectStore("restaurants");

          restaurants.map(restaurant => {
            console.log("Adding restaurant: ", restaurant, " to idb");
            return store.put(restaurant);
          });

          return tx.complete;
        });
      });
  }

  /**
   * Fetch reviews from backend and cache them in IndexedDB
   */
  static cacheReviews() {
    return fetch(DBHelper.REVIEW_URL)
      .then(data => data.json())
      .then(reviews => {
        return DBHelper.createDB().then(db => {
          const tx = db.transaction("reviews", "readwrite");
          const store = tx.objectStore("reviews");

          reviews.map(review => {
            console.log("Adding review: ", review, " to idb");
            return store.put(review);
          });

          return tx.complete;
        });
      });
  }

  /**
   * Fetch all restaurants from server
   * In case of network failure, fetch from IndexedDB
   */
  static fetchRestaurants(callback) {
    // Replace XHR approach with fetch API
    fetch(DBHelper.RESTAURANT_URL)
      .then(data => data.json())
      .then(restaurants => {
        console.log(restaurants, "ONLINE, fetched restaurants from backend");
        callback(null, restaurants);
      })
      .catch(error => {
        console.log(error, "OFFLINE, could not fetch restaurants from backend");
        callback(error, null);

        // fetch from IndexedDB database
        idb
          .open("mws", 0)
          .then(db => {
            const tx = db.transaction(["restaurants"], "readonly");
            const store = tx.objectStore("restaurants");
            return store.getAll();
          })
          .then(restaurants => {
            console.log("fetched restaurants from IndexedDB instead");
            callback(null, restaurants);
          });
      });
  }

  /**
   * Fetch a restaurant by its ID
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) {
          // Got the restaurant
          callback(null, restaurant);
        } else {
          // Restaurant does not exist in the database
          callback("Restaurant does not exist", null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling
   */
  static fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    callback
  ) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != "all") {
          // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != "all") {
          // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map(
          (v, i) => restaurants[i].neighborhood
        );
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter(
          (v, i) => neighborhoods.indexOf(v) == i
        );
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter(
          (v, i) => cuisines.indexOf(v) == i
        );
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL
   */
  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image URL
   */
  static imageUrlForRestaurant(restaurant) {
    return restaurant.photograph
      ? `/img/restaurant-photos/${restaurant.photograph}.jpg`
      : `/img/restaurant-photos/${restaurant.id}.jpg`;
  }

  /**
   * Fetch all reviews from server
   * In case of network failure, fetch from IndexedDB
   */
  static fetchReviews(callback) {
    // Replace XHR approach with fetch API
    fetch(DBHelper.REVIEW_URL)
      .then(data => data.json())
      .then(reviews => {
        console.log(reviews, "ONLINE, fetched reviews from backend");
        callback(null, reviews);
      })
      .catch(error => {
        console.log(error, "OFFLINE, could not fetch reviews from backend");
        callback(error, null);

        // fetch from IndexedDB database
        idb
          .open("mws", 1)
          .then(db => {
            const tx = db.transaction(["reviews"], "readonly");
            const store = tx.objectStore("reviews");
            return store.getAll();
          })
          .then(reviews => {
            console.log("fetched reviews from IndexedDB instead");
            callback(null, reviews);
          });
      });
  }

  /**
   * Fetch reviews by restaurant's ID
   */
  static fetchReviewsById(id, callback) {
    // fetch all reviews with proper error handling.
    DBHelper.fetchReviews((error, reviews) => {
      if (error) {
        callback(error, null);
      } else {
        const reviewsByEachRestaurant = reviews.filter(
          r => r.restaurant_id == id
        );
        if (reviewsByEachRestaurant) {
          // Got the restaurant
          callback(null, reviewsByEachRestaurant);
        } else {
          // Restaurant does not exist in the database
          callback("Restaurant does not exist", null);
        }
      }
    });
  }

  /**
   * Cache new review in IndexedDB database
   */
  static addNewReviewToCache(content) {
    return DBHelper.createDB().then(db => {
      const tx = db.transaction("reviews", "readwrite");
      const store = tx.objectStore("reviews");
      store.put(content);
      console.log("review sent to idb");
      return tx.complete;
    });
  }

  /**
   * Send new review to backend database
   */
  static addNewReviewToBackend(content) {
    console.log("review sent to backend");
    return fetch(DBHelper.REVIEW_URL, {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json"
      }),
      body: JSON.stringify(content)
    });
  }

  /**
   * Check whether the restaurant is favorite or not
   */
  static favoriteState(restaurant) {
    if (restaurant.is_favorite.toString() === "true") {
      return {
        url: "/img/icons/favorite.png",
        state: "favorite"
      };
    } else {
      return {
        url: "/img/icons/unfavorite.png",
        state: "unfavorite"
      };
    }
  }

  /**
   * Cache favorite state in IndexedDB database
   */
  static cacheFavoriteState(restaurant, state) {
    return DBHelper.createDB().then(db => {
      const tx = db.transaction("restaurants", "readwrite");
      const store = tx.objectStore("restaurants");

      return store.get(restaurant.id).then(restaurant => {
        console.log(restaurant, "current restaurant in the store");
        restaurant.is_favorite = state;
        store.put(restaurant);
        console.log("favorite state sent to idb");
        return tx.complete;
      });
    });
  }

  /**
   * Send favorite state to backend database
   */
  static addFavoriteStateToBackend(restaurant, state) {
    console.log("favorite state sent to backend");

    return fetch(
      `http://localhost:1337/restaurants/${
        restaurant.id
      }/?is_favorite=${state}`,
      {
        method: "PUT",
        headers: new Headers({
          "Content-Type": "application/json"
        })
      }
    );
  }

  /**
   * Convert unix timestamp to readable time format
   */
  static convertTimestamp(timestamp) {
    const convertedFormat = new Date(timestamp);
    const date = convertedFormat.getDate();
    const month = convertedFormat.toLocaleString("en-us", {
      month: "long"
    });
    const year = convertedFormat.getFullYear();
    const result = `${month} ${date}, ${year}`;
    return result;
  }

  /**
   * Map marker for a restaurant
   */
  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker(
      [restaurant.latlng.lat, restaurant.latlng.lng],
      {
        title: restaurant.name,
        alt: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant)
      }
    );
    marker.addTo(newMap);
    return marker;
  }
}
