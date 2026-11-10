// Service Worker: laesst PDF Notizen auch ohne Internet starten (die Seite wird zwischengespeichert).
const V = "pdfnotizen-Web-1.7";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", (e) => e.waitUntil(caches.open(V).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener("activate", (e) => e.waitUntil(
  caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;          // Microsoft/OneDrive und Downloads gehen direkt
  if (r.mode === "navigate") {                                              // Seite: erst Internet (neueste Version), sonst gespeicherte
    e.respondWith(fetch(r).then((res) => { if (res.ok && !u.search) caches.open(V).then((c) => c.put("./index.html", res.clone())); return res; })
      .catch(() => caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(r).then((hit) => hit || fetch(r)));
});
