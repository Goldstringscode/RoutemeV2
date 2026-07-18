/* eslint-disable no-restricted-globals */
/* A self-contained service worker for RouteMe PWA (no Workbox build-time injection) */

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `routeme-static-${CACHE_VERSION}`;
const MAPBOX_TILES_CACHE = `routeme-mapbox-tiles-${CACHE_VERSION}`;
const MAPBOX_API_CACHE = `routeme-mapbox-api-${CACHE_VERSION}`;
const SUPABASE_CACHE = `routeme-supabase-${CACHE_VERSION}`;
const IMAGE_CACHE = `routeme-images-${CACHE_VERSION}`;

// ---- Install: precache app shell and static assets ----
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      // The app shell — everything needed to bootstrap the app offline
      return cache.addAll([
        '/',
        '/index.html',
        '/static/js/',
        '/static/css/',
        '/manifest.json',
        '/icon-192x192.png',
        '/icon-512x512.png',
      ]).catch(() => {
        // Individual asset URLs are resolved at build time;
        // CRA's asset hashing means we can't know exact filenames.
        // cache.addAll for the shell only; dynamic assets are cached on fetch.
        console.log('[RouteMe SW] Precaching shell only; dynamic assets cached on-fetch.');
      });
    })
  );
  self.skipWaiting();
});

// ---- Activate: clean old caches ----
self.addEventListener('activate', (event) => {
  const expectedCaches = [
    STATIC_CACHE,
    MAPBOX_TILES_CACHE,
    MAPBOX_API_CACHE,
    SUPABASE_CACHE,
    IMAGE_CACHE,
  ];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (!expectedCaches.includes(name)) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      // Take control of all open pages
      return self.clients.claim();
    })
  );
});

// ---- Helper: is a request a navigation? ----
function isNavigation(req) {
  return req.mode === 'navigate' ||
    (req.method === 'GET' &&
      req.headers.get('accept') &&
      req.headers.get('accept').includes('text/html'));
}

// ---- Helper: is a Mapbox tile/style/font request? ----
function isMapboxTile(url) {
  return /^https:\/\/api\.mapbox\.com\/(v4|styles|fonts)\//.test(url);
}

// ---- Helper: is a Mapbox API request (directions, geocoding, etc.)? ----
function isMapboxAPI(url) {
  return /^https:\/\/api\.mapbox\.com\/(directions|geocoding|matching|optimized-trips)\//.test(url);
}

// ---- Helper: is a Supabase REST request? ----
function isSupabaseAPI(url) {
  return /^https:\/\/loqgppsgqhxkjichnril\.supabase\.co\/rest\/v1\//.test(url);
}

// ---- Helper: is a Supabase Auth request? ----
function isSupabaseAuth(url) {
  return /^https:\/\/loqgppsgqhxkjichnril\.supabase\.co\/auth\/v1\//.test(url);
}

// ---- Helper: is an image? ----
function isImage(url) {
  return /\.(png|jpg|jpeg|svg|gif|webp|ico)(\?.*)?$/.test(url);
}

// ---- Helper: is a static asset (JS, CSS, font)? ----
function isStaticAsset(url) {
  return /\.(js|css|woff2?|ttf|eot)(\?.*)?$/.test(url) ||
    url.includes('/static/');
}

// ---- Fetch: serve from cache with network-first fallback for dynamic content ----
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Supabase Auth: Network Only (never cache)
  if (isSupabaseAuth(url.href)) {
    event.respondWith(fetch(request));
    return;
  }

  // 2. Mapbox tiles: Cache First
  if (isMapboxTile(url.href)) {
    event.respondWith(
      caches.open(MAPBOX_TILES_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          });
        })
      )
    );
    return;
  }

  // 3. Mapbox API: Network First
  if (isMapboxAPI(url.href)) {
    event.respondWith(
      networkFirst(request, MAPBOX_API_CACHE, 7 * 24 * 60 * 60) // 7 days
    );
    return;
  }

  // 4. Supabase REST: Network First
  if (isSupabaseAPI(url.href)) {
    event.respondWith(
      networkFirst(request, SUPABASE_CACHE, 3 * 24 * 60 * 60) // 3 days
    );
    return;
  }

  // 5. Static assets (JS, CSS, fonts): Cache First
  if (isStaticAsset(url.href)) {
    event.respondWith(
      cacheFirst(request, STATIC_CACHE)
    );
    return;
  }

  // 6. Images: Stale-While-Revalidate
  if (isImage(url.href)) {
    event.respondWith(
      staleWhileRevalidate(request, IMAGE_CACHE, 30 * 24 * 60 * 60) // 30 days
    );
    return;
  }

  // 7. Navigation requests: serve app shell (index.html) from cache if offline
  if (isNavigation(request)) {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html').then((cached) => {
          if (cached) return cached;
          // Fallback: return a minimal offline page
          return new Response(
            '<!doctype html><html><head><title>Offline</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;background:#faf9f6;color:#2e4a3a;text-align:center;padding:2rem}div{max-width:400px}h1{font-size:1.5rem;margin-bottom:0.5rem}p{color:#6b7280;line-height:1.5}</style></head><body><div><h1>You\'re offline</h1><p>RouteMe needs a network connection to load. Please reconnect and try again.</p></div></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        });
      })
    );
    return;
  }

  // 8. Everything else: Network First, no cache fallback
  event.respondWith(fetch(request));
});

// ---- Cache Strategies ----

async function cacheFirst(request, cacheName) {
  const cached = await caches.open(cacheName).then((c) => c.match(request));
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName, maxAgeSeconds) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.open(cacheName).then((c) => c.match(request));
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function staleWhileRevalidate(request, cacheName, maxAgeSeconds) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  });

  return cached || fetchPromise;
}

// ---- Message: skip waiting on 'SKIP_WAITING' ----
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});