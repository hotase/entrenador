// Mi Entrenador – funciona sin conexión
const CACHE = "entrenador-v4";
const CORE = ["./", "index.html", "manifest.json", "icon-180.png", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // la página: primero red (para recibir actualizaciones), si no hay conexión, la copia guardada
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put("index.html", c)); return r; })
      .catch(() => caches.match("index.html")));
    return;
  }
  // resto (iconos, fuentes): primero la copia guardada
  if (url.origin === location.origin || url.host.includes("fonts.g")) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
      const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); return r;
    })));
  }
});
