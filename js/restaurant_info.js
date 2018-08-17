let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener("DOMContentLoaded", event => {
  DBHelper.cacheRestaurants();
  DBHelper.cacheReviews();
  initMap();
  console.log("DOM loaded!");
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      self.newMap = L.map("map", {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer(
        "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}",
        {
          mapboxToken:
            "pk.eyJ1IjoidHJ1bmdsaXZlIiwiYSI6ImNqaWRxaTJyejA1dmozcHF1NGZpbzNwbnQifQ.JoWIUSQX12xkCafTKBSW_A",
          maxZoom: 18,
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          id: "mapbox.streets"
        }
      ).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
};

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = callback => {
  if (self.restaurant) {
    // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName("id");
  if (!id) {
    // no id found in URL
    error = "No restaurant id in URL";
    callback(error, null);
  } else {
    DBHelper.fetchReviewsById(id, (error, reviews) => {
      self.reviews = reviews;
      console.log(self.reviews, "reviews for this restaurant");
      if (!reviews) {
        console.error(error);
      }

      DBHelper.fetchRestaurantById(id, (error, restaurant) => {
        self.restaurant = restaurant;

        if (!restaurant) {
          console.error(error);
          return;
        }
        fillRestaurantHTML();
        callback(null, restaurant);
      });
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById("restaurant-name");
  name.innerHTML = restaurant.name;

  const favoriteIcon = document.getElementById("favorite-toggle-icon");
  console.log(
    "current icon for favorite state",
    DBHelper.favoriteState(restaurant).url
  );

  favoriteIcon.src = DBHelper.favoriteState(restaurant).url;
  favoriteIcon.alt = `${restaurant.name} Restaurant is ${
    DBHelper.favoriteState(restaurant).state
  }`;

  favoriteIcon.addEventListener("click", function() {
    favoriteIcon.src =
      restaurant.is_favorite.toString() === "true"
        ? "/img/icons/unfavorite.png"
        : "/img/icons/favorite.png";

    if (restaurant.is_favorite.toString() === "true") {
      DBHelper.cacheFavoriteState(restaurant, "false");
      DBHelper.addFavoriteStateToBackend(restaurant, "false");
    } else {
      DBHelper.cacheFavoriteState(restaurant, "true");
      DBHelper.addFavoriteStateToBackend(restaurant, "true");
    }

    window.location.reload();
  });

  const address = document.getElementById("restaurant-address");
  address.innerHTML = restaurant.address;

  const cuisine = document.getElementById("restaurant-cuisine");
  cuisine.innerHTML = restaurant.cuisine_type;

  const image = document.getElementById("restaurant-img");
  image.className = "restaurant-img";
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = `${restaurant.name} Restaurant at ${
    restaurant.neighborhood
  }, cuisine type is ${restaurant.cuisine_type}`;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (
  operatingHours = self.restaurant.operating_hours
) => {
  const hours = document.getElementById("restaurant-hours");
  for (let key in operatingHours) {
    const row = document.createElement("tr");

    const day = document.createElement("td");
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement("td");
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (restaurant = self.restaurant, reviews = self.reviews) => {
  const review = document.getElementById("add-review");
  const submit = document.getElementById("submit-button");

  review.addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const rating = document.getElementById("rating").value;
    const comments = document.getElementById("comment").value;
    const notification = document.getElementById("submit-notification");

    const reviewContent = {
      restaurant_id: restaurant.id,
      name,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      rating: parseInt(rating),
      comments,
      reviewState: "pending"
    };

    DBHelper.addNewReviewToCache(reviewContent);

    // Check the browser support of Background Sync
    // https://jakearchibald.github.io/isserviceworkerready
    // https://caniuse.com/#search=background%20sync
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      navigator.serviceWorker.ready
        .then(sw => {
          console.log("sync event is ready in browser!");
          return sw.sync.register("send-review");
        })
        .catch(e => console.log(e, "could not register sync event"));
    } else {
      console.log("background sync is not supported by this browser yet");
    }

    // DBHelper.addNewReviewToBackend(reviewContent);

    submit.value = "SENDING...";

    if (navigator.onLine) {
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      console.log("network error!");
      notification.innerHTML =
        "Network error! Your review will be automatically updated once the connection is re-established";
    }
  });

  const container = document.getElementById("reviews-container");
  const title = document.createElement("h3");
  title.innerHTML = "Reviews";
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement("p");
    noReviews.innerHTML = "No reviews yet!";
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById("reviews-list");
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = review => {
  const li = document.createElement("li");
  const div = document.createElement("div");
  const name = document.createElement("p");
  name.innerHTML = review.name;
  li.appendChild(div);
  div.appendChild(name);

  const date = document.createElement("p");
  date.innerHTML = DBHelper.convertTimestamp(review.updatedAt);

  div.appendChild(date);

  const rating = document.createElement("p");
  rating.innerHTML = `RATING: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement("p");
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById("breadcrumb");
  const li = document.createElement("li");
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};
