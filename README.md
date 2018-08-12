# Mobile Web Specialist Certification Course - Restaurant Reviews Project

### Description

> The original code for a restaurant reviews website is provided by [Udacity](https://www.udacity.com/course/mobile-web-specialist-nanodegree--nd024). The code can be found here: https://github.com/udacity/mws-restaurant-stage-1. The code has a lot of issues. It’s barely usable on a desktop browser, much less a mobile device. It also doesn’t include any standard accessibility features, and it doesn’t work offline at all.

### Goal

The goal is to resolve the issues above and convert a static webpage to a mobile-ready web application with main focus on three areas: Progressive Web App, Performance, and Accessibility. These criteria will be evaluated based on [Lighthouse's audit](https://developers.google.com/web/tools/lighthouse/) from Google.

### Project Overview

The project will be incrementally enhanced after 3 stages:

- Stage 1:
  - Take a static design that lacks accessibility and convert it to be responsive on different sized displays and accessible for screen reader use.
  - Add a service worker to begin the process of creating a seamless offline experience for users.
- Stage 2:
  - Take the responsive, accessible design in Stage One and connect it to a provided [Node development server](https://github.com/udacity/mws-restaurant-stage-2). Use asynchronous JavaScript to request JSON data from the server.
  - Store data received from the server in an offline database using IndexedDB, which will create an app shell architecture.
  - Optimize the site to meet performance benchmarks from [Lighthouse](https://developers.google.com/web/tools/lighthouse/).
- Stage 3:
  - Take the connected application in Stage One and Stage Two and add additional functionality. Connect the app to the updated [Node development server](https://github.com/udacity/mws-restaurant-stage-3). Add a form to allow users to create their own reviews. If the app is offline, the form will defer updating to the remote database until a connection is established.
  - Optimize the site to meet even stricter performance benchmarks than the previous project, and test again using [Lighthouse](https://developers.google.com/web/tools/lighthouse/). The goal is to score above 90 in Progressive Web App, Performance, and Accessibility.

### Prerequisites

In a terminal, check the version of Python you have: `python -V`. If you don't have Python installed, navigate to Python's [website](https://www.python.org/) to download and install the software.

### Installation

**Setup local server**

Clone the provided code to create server

For stage 3

```shell
git clone https://github.com/udacity/mws-restaurant-stage-3.git
```

Install dependencies

```shell
npm install
```

Install Sails.js globally

```shell
npm i sails -g
```

Start the server

```shell
node server
```

The default port is `1337`.

**Setup project**

```shell
git clone https://github.com/trunglive/mws-nd-restaurant-project.git
```

For Python 2.x:

```shell
python -m SimpleHTTPServer 8000
```

For Python 3.x:

```shell
python3 -m http.server 8000
```

Visit the application at `http://localhost:8000`.

### Running the tests

The app was tested on Google Chrome Google Chrome Version 68.0.3440.106 (64-bit).

If you haven't installed Lighthouse plugin yet, head over to https://chrome.google.com/webstore/detail/lighthouse/blipmdconlkpinefehnmjammfjpmpbjk?hl=en and install it.

At `http://localhost:8000`, click _Generate report_ from Lighthouse to see the performance audits.

### Leaflet.js and Mapbox

This repository uses [leafletjs](https://leafletjs.com/) with [Mapbox](https://www.mapbox.com/). My Mapbox API key is included in this project. Mapbox is free to use, and does not require any payment information.

### Note about ES6

Most of the code in this project has been written to the ES6 JavaScript specification for compatibility with modern web browsers and future proofing JavaScript code.

### License

This project is licensed under the MIT License, see the [LICENSE](LICENSE) file for details.
