// RouteMe — No-op service worker
// CRA's default SW causes infinite reload loops on every deploy.
// This no-op replaces it — never intercepts requests, never caches.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});