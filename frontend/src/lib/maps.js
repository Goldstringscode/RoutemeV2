/**
 * Maps deep-link utilities for RouteMeV2.
 * Shared across StylizedMap, RouteView, and any other component that needs
 * platform-aware navigation links (Google Maps / Apple Maps).
 *
 * URL formats follow Google and Apple production recommendations:
 *   - Google: https://www.google.com/maps/dir/?api=1&destination={lat},{lng}&travelmode=driving
 *   - Apple:  https://maps.apple.com/?daddr={lat},{lng}&dirflg=d
 */

/** Auto-detect the best maps app based on the user's device platform */
export function detectMapsApp() {
  const ua = (navigator.userAgent || navigator.vendor || '').toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isMac = /macintosh|mac os x/.test(ua) && !isIOS;
  return isIOS || isMac ? 'apple' : 'google';
}

/** Build a Google Maps directions URL (universal HTTP — no API key needed) */
export function googleMapsUrl(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
}

/** Build an Apple Maps directions URL (universal HTTP — intercepted by OS on iOS/macOS) */
export function appleMapsUrl(lat, lng) {
  return `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`;
}

/**
 * Resolve the effective nav preference.
 * Priority: per-route override > profile preference.
 * If the result is "auto", resolve it to the actual device-appropriate app.
 */
export function resolveNav(routeNavOverride, profileNavPreference) {
  const pref = routeNavOverride || profileNavPreference || 'auto';
  return pref === 'auto' ? detectMapsApp() : pref;
}

/**
 * Get the raw resolved preference (before auto-detect resolution).
 * Useful for checking if the user set "both" (ask each time).
 */
export function getRawNav(routeNavOverride, profileNavPreference) {
  return routeNavOverride || profileNavPreference || 'auto';
}