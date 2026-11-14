// Service Worker: Scanner startet auch ohne Internet (Seite wird zwischengespeichert).
const V = "scanner-1.0";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", (e) => e.waitUntil(caches.open(V).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener("activate", (e) => e.waitUntil(
  caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;     // Microsoft/OneDrive geht direkt
  if (r.mode === "navigate") {
    e.respondWith(fetch(r).then((res) => { if (res.ok && !u.search) caches.open(V).then((c) => c.put("./index.html", res.clone())); return res; })
      .catch(() => caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(r).then((hit) => hit || fetch(r)));
});
