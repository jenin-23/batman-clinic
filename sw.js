/* Batman Clinic — offline cache + update detection. BUILD is stamped per deploy. */
const BUILD = "__BUILD__";
const CACHE = "batman-clinic-" + BUILD;
const ASSETS = ["./", "./index.html", "./css/style.css", "./js/version.js", "./js/diagrams.js", "./js/data.js", "./js/cases2.js", "./js/audio.js", "./js/decor.js", "./js/world.js", "./js/minigames.js", "./js/game.js", "./js/systems.js", "./js/phone.js", "./js/handson.js", "./js/polish.js", "./js/tutorial.js", "./js/ux.js", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png", "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {})); /* wait for the page to ask before activating, so we can show an update banner */ });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("message", e => { if (e.data === "SKIP_WAITING") self.skipWaiting(); if (e.data === "GET_BUILD" && e.source) e.source.postMessage({ build: BUILD }); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(fetch(e.request, { cache: "no-cache" }).then(r => { if (r && r.ok && (e.request.url.startsWith(self.location.origin) || e.request.url.includes("cdnjs"))) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {}); } return r; }).catch(() => caches.match(e.request).then(m => m || (e.request.mode === "navigate" ? caches.match("./index.html") : Response.error()))));
});
