/* The Evo Diagnostic — service worker. Cache-first, offline-first. */
const CACHE = "evo-diagnostic-v25";
const ASSETS = [
  ".", "index.html", "styles.css", "manifest.json", "data.js", "vin.js", "scoring.js", "gating.js", "app.js", "sw-update.js", "pg-parts-core.js", "audio.js", "tire.js", "shop.js", "nhtsa.js", "handoff.js", "wizard.js", "report.js",
  "icon-192.png", "icon-512.png", "data/nhtsa-evo-bundle.json",
  "assets/fat-boy-1992.jpg", "assets/fat-boy-1990-museum.jpg",
  "assets/heritage-softail-classic.jpg", "assets/xlh-1200-modded.jpg",
  "assets/knucklehead-engine-room.jpg", "assets/knucklehead-bike.jpg",
  "assets/evo-engine-room.jpg", "assets/evo-sportster-engine-room.jpg",
  "assets/v-twin-valve-diagram.jpg", "assets/softail-1990-joshua.jpg"
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});
/* Update button (sw-update.js): the waiting worker takes over only
 * when the user taps — no skipWaiting on install, or the button
 * would never get a waiting worker to show for. */
self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(e.request, copy));
    return res;
  }).catch(() => caches.match("index.html"))));
});
