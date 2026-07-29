// RouteMe — Service Worker Registration
// Safe update flow: notify user, let them choose when to reload.
// Critical unsaved state is preserved to localStorage before reload.

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

/**
 * Register the service worker with a safe update flow.
 *
 * @param {Object} config
 * @param {Function} config.onUpdate - Called when a new SW is waiting to activate.
 *   Receives { registration: ServiceWorkerRegistration, skipWaiting: () => void }
 * @param {Function} config.onSuccess - Called when the SW is installed and active.
 */
export function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log('RouteMe: Offline support is available (localhost).');
        });
      } else {
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      let waitingWorker = null;

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) return;

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New SW is installed and waiting — notify the app
              console.log('RouteMe: New version available — notifying user...');
              waitingWorker = registration.waiting;

              if (config && config.onUpdate) {
                config.onUpdate({
                  registration,
                  skipWaiting: () => {
                    saveCriticalStateBeforeUpdate();
                    waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
                  },
                });
              }
            } else {
              console.log('RouteMe: Content cached for offline use.');
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };

      // When the new SW takes over and claims clients, reload the page
      let updateReloadPending = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!updateReloadPending) {
          updateReloadPending = true;
          console.log('RouteMe: New service worker activated — reloading...');
          window.location.reload();
        }
      });

      // Periodic update check
      registration.update();
      setInterval(() => {
        registration.update().catch(() => {});
      }, UPDATE_CHECK_INTERVAL_MS);
    })
    .catch((error) => {
      console.error('RouteMe: Service worker registration failed:', error);
    });
}

/**
 * Save any in-progress user data to localStorage before the update reload.
 */
function saveCriticalStateBeforeUpdate() {
  try {
    const soapEditorTextareas = document.querySelectorAll(
      'textarea[data-soap-field]'
    );
    if (soapEditorTextareas.length > 0) {
      const soapDraft = {};
      soapEditorTextareas.forEach((ta) => {
        const field = ta.getAttribute('data-soap-field');
        if (field) soapDraft[field] = ta.value;
      });
      if (Object.keys(soapDraft).length > 0) {
        localStorage.setItem('routeme_sw_update_draft', JSON.stringify(soapDraft));
        console.log('RouteMe: Saved SOAP draft before update reload.');
      }
    }

    const activeForm = document.querySelector('form[data-save-before-update]');
    if (activeForm) {
      const formData = new FormData(activeForm);
      const formObj = {};
      formData.forEach((value, key) => { formObj[key] = value; });
      if (Object.keys(formObj).length > 0) {
        localStorage.setItem('routeme_sw_update_form', JSON.stringify(formObj));
      }
    }

    localStorage.setItem('routeme_sw_update_pending', 'true');
  } catch (e) {
    console.warn('RouteMe: Could not save state before update:', e.message);
  }
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
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
