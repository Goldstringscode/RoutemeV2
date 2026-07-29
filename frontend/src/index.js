import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "mapbox-gl/dist/mapbox-gl.css";
import "@/index.css";
import App from "@/App";
import * as serviceWorkerRegistration from "@/serviceWorkerRegistration";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);

// Register service worker with safe update flow
// The React tree uses window.__ROUTEME_SW_CALLBACKS__ to receive notifications
serviceWorkerRegistration.register({
  onUpdate: ({ skipWaiting }) => {
    setTimeout(() => {
      if (window.__ROUTEME_SW_CALLBACKS__?.onUpdate) {
        window.__ROUTEME_SW_CALLBACKS__.onUpdate({ skipWaiting });
      } else {
        window.__ROUTEME_SW_PENDING_UPDATE__ = { skipWaiting };
      }
    }, 100);
  },
  onSuccess: (registration) => {
    console.log('RouteMe: App is ready for offline use.');
  },
});

// Check for a pending update that arrived before the hook mounted
window.addEventListener('load', () => {
  setTimeout(() => {
    if (window.__ROUTEME_SW_PENDING_UPDATE__ && window.__ROUTEME_SW_CALLBACKS__?.onUpdate) {
      window.__ROUTEME_SW_CALLBACKS__.onUpdate(window.__ROUTEME_SW_PENDING_UPDATE__);
      delete window.__ROUTEME_SW_PENDING_UPDATE__;
    }
  }, 2000);
});
