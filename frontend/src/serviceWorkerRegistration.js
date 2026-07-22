// This file handles registration/unregistration of the service worker.
// In production, the service worker is registered for offline support.
// In development, the service worker is not registered (CRA handles this).

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(
      /^127(?:\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

// Periodically check for SW updates (every 60 minutes)
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

export function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // Running on localhost — check if service worker exists
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'RouteMe: Offline support is available (localhost).'
          );
        });
      } else {
        // Production — register the service worker
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      // --- Auto-reload when a new SW takes over ---
      // If a new service worker activates while the page is open,
      // reload immediately so the user gets the latest content.
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('RouteMe: New service worker activated — reloading...');
        window.location.reload();
      });

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New SW is installed but waiting. Tell it to skip waiting
              // so it activates immediately (the service-worker.js handles
              // SKIP_WAITING messages and calls self.skipWaiting()).
              console.log(
                'RouteMe: New content available — activating new service worker...'
              );
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
              // Send SKIP_WAITING so the new SW takes over NOW
              registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
            } else {
              console.log('RouteMe: Content cached for offline use.');
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };

      // --- Periodic update check ---
      // The browser checks for SW updates on navigation, but we also check
      // proactively on a timer so long-running sessions get updates too.
      registration.update(); // Check immediately after registration
      setInterval(() => {
        registration.update().catch(() => {
          // Silently ignore — the browser will check on next navigation anyway
        });
      }, UPDATE_CHECK_INTERVAL_MS);
    })
    .catch((error) => {
      console.error('RouteMe: Service worker registration failed:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log(
        'RouteMe: No internet connection. App is running in offline mode.'
      );
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    }).catch((error) => {
      console.error(error.message);
    });
  }
}