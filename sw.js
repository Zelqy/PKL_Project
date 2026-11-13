/* Service worker — cache shell agar aplikasi tetap terbuka saat sinyal hilang.
   Strategi:
   - navigasi: network-first, fallback ke cache index.html
   - aset statis: cache-first, lalu update di belakang
   - data tetap di localStorage (offline-first), bukan di SW. */
const VERSION = "v1.2.0";
const CACHE = "pasar-janapria-" + VERSION;
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/css/app.css",
  "./assets/js/i18n.js",
  "./assets/js/data.js",
  "./assets/js/store.js",
  "./assets/js/app.js",
  "./assets/icons/icon.svg",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-maskable-512.png",
  "./assets/products/p1.svg",
  "./assets/products/p2.svg",
  "./assets/products/p3.svg",
  "./assets/products/p4.svg",
  "./assets/products/p5.svg",
  "./assets/products/p6.svg",
  "./assets/products/p7.svg",
  "./assets/products/p8.svg",
  "./assets/products/p9.svg",
  "./assets/products/p10.svg",
  "./assets/products/p11.svg",
  "./assets/products/p12.svg",
  "./assets/products/p13.svg",
  "./assets/products/p14.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("./index.html", copy));
          return res;
        })
        .catch(() => caches.match("./index.html").then((r) => r || caches.match("./")))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
