const CACHE_NAME = "university2k26-shell-v0.9.0";
const APP_SHELL = [
  "/",
  "/manifest.webmanifest",
  "/assets/campus-arena-background-v1.png",
  "/icons/university2k26-192.png",
  "/icons/university2k26-512.png",
];

async function cacheAppShell() {
  const cache = await caches.open(CACHE_NAME);
  const indexResponse = await fetch("/");
  const indexCopy = indexResponse.clone();
  const html = await indexResponse.text();
  const discoveredAssets = Array.from(
    html.matchAll(/(?:src|href)="(\/[^"]+)"/g),
    (match) => match[1],
  ).filter((path) => !path.startsWith("/api/"));

  await cache.put("/", indexCopy);
  await cache.addAll(Array.from(new Set([...APP_SHELL.slice(1), ...discoveredAssets])));
}

self.addEventListener("install", (event) => {
  event.waitUntil(cacheAppShell());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(
            JSON.stringify({
              schema_version: "1.0.0",
              status: "unavailable",
              data_mode: "fixture",
            }),
            {
              status: 503,
              headers: { "content-type": "application/json; charset=utf-8" },
            },
          ),
      ),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          void caches.open(CACHE_NAME).then((cache) => cache.put("/", copy));
          return response;
        })
        .catch(() => caches.match("/")),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ??
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
