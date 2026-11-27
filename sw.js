const CACHE = "res-norm-offline-v1";
const countries = ["sverige", "ukraina", "japan"];
const pages = countries.flatMap(country => [
  country + ".html",
  ...[1, 2, 3, 4].map(number => country + "-" + number + ".html")
]);
const assets = ["./", "index.html", "lander.html", "sparat.html", "style.css", "app.js", "hero.png", ...pages];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(assets)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).catch(async () => {
    const cache = await caches.open(CACHE);
    return (await cache.match(event.request, { ignoreSearch: true })) || Response.error();
  }));
});
