/* Aria's Summer Tracker — service worker.
   Intentionally minimal: it ONLY handles page navigation (so the app shell works offline).
   Everything else — cover images, icons, Firebase, fonts — is left to the browser to fetch
   natively. (An earlier version intercepted all GETs and could return index.html in place of a
   failed image, which broke cover thumbnails. This avoids that entirely.) */
const CACHE = "aria-tracker-v3";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.add("./index.html")).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || req.mode !== "navigate") return;   // only the app shell
  e.respondWith(
    fetch(req)
      .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put("./index.html", copy)); return res; })
      .catch(() => caches.match("./index.html"))
  );
});
