/* Minnetrening – lagrer alle filene lokalt første gang appen åpnes med nett.
   Øk versjonsnummeret når filene endres, så hentes ny versjon neste gang du har nett. */
const CACHE = "minnetrening-v1";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Lagret versjon vises med en gang; ny versjon hentes i bakgrunnen når det finnes nett. */
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  const key = e.request.mode === "navigate" ? "./index.html" : e.request;
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(key, { ignoreSearch: true }).then(hit => {
        const net = fetch(e.request).then(res => {
          if (res && res.ok) cache.put(key, res.clone());
          return res;
        }).catch(() => hit);
        return hit || net;
      })
    )
  );
});
