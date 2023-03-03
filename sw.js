const cacheName = "library";
const staticAssets = [
  "./",
  "./index.html",
  "./book.html",
  "./searchNET.html",
  "./manifest.json",
  "./style.css",
];

// Cache static assets on install
self.addEventListener("install", async () => {
  const cache = await caches.open(cacheName);
  await cache.addAll(staticAssets);
  return self.skipWaiting();
});

// Activate service worker and claim clients
self.addEventListener("activate", () => {
  self.clients.claim();
});

// Serve assets from cache first, then from network
self.addEventListener("fetch", async (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkAndCache(request));
  }
});

async function cacheFirst(request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  return cached || fetch(request);
}

async function networkAndCache(request) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    await cache.put(request, response.clone());
    console.log("Fetch Successful");
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    return cached;
  }
}

// Handle push notifications
self.addEventListener("push", function (event) {
  if (event && event.data) {
    const data = event.data.json();
    if (data.method === "pushMessage") {
      console.log("Push notification sent");
      event.waitUntil(
        self.registration.showNotification(" ", {
          body: data.message,
          icon: "path/to/icon.png",
        })
      );
    }
  }
});

// Handle background sync
self.addEventListener("sync", (event) => {
  if (event && event.tag === "event1") {
    console.log("Sync successful!");
    event.waitUntil(
      self.registration.showNotification(" ", {
        body: "Message sent successfully!",
        icon: "path/to/icon.png",
      })
    );
  }
});
