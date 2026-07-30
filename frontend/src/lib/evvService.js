/**
 * evvService.js — EVV (Electronic Visit Verification) utilities.
 *
 * Provides GPS capture (with convergence + adaptive fallback),
 * state configuration, permission checks, and EVV data helpers
 * for the RouteMe EVV compliance system.
 */

/* ─── GPS Capture ─────────────────────────────────────── */

/**
 * Check geolocation permission state.
 * Returns "granted" | "denied" | "prompt" (or "prompt" if Permissions API unavailable).
 */
export async function checkGpsPermission() {
  if (!navigator.permissions || !navigator.permissions.query) return "prompt";
  try {
    const result = await navigator.permissions.query({ name: "geolocation" });
    return result.state;
  } catch {
    return "prompt";
  }
}

/**
 * Pre-warm the GPS chipset with a low-accuracy, silent request.
 * Call this when the route page mounts so GPS is warm when
 * the user taps "Clock In".
 */
export function prewarmGps() {
  if (!navigator.geolocation) return;
  try {
    navigator.geolocation.getCurrentPosition(
      () => {}, // discard — we just wanted to warm the chip
      () => {}, // ignore errors
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
    );
  } catch {
    // silently ignore
  }
}

/**
 * Capture GPS coordinates with multi-sample convergence and
 * adaptive accuracy fallback.
 *
 * Phase 1 (0–5s): High-accuracy GPS (enableHighAccuracy: true).
 *   Watches position, collects up to 5 samples. Resolves early
 *   if accuracy ≤ 10m or 4+ samples collected. Best accuracy wins.
 *
 * Phase 2 (5–8s): If no good fix, falls back to WiFi/cell
 *   trilateration (enableHighAccuracy: false). Collects up to
 *   3 samples.
 *
 * Returns { lat, lng, accuracy, altitude, heading, speed,
 *           capturedAt, gpsFallbackMode } or null on total failure.
 */
export function captureGps(options = {}) {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    const maxSamplesPhase1 = options.maxSamplesPhase1 || 5;
    const settleTimeMsPhase1 = options.settleTimeMsPhase1 || 5000;
    const settleTimeMsPhase2 = options.settleTimeMsPhase2 || 3000;
    const minAccuracyEarlyResolve = options.minAccuracyEarlyResolve || 10;

    const samples = [];
    let phase = 1; // 1 = high-accuracy GPS, 2 = WiFi fallback
    let watchId = null;
    let phase2Timer = null;

    function makeReading(pos) {
      return {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: Math.round(pos.coords.accuracy * 100) / 100,
        altitude: pos.coords.altitude ?? null,
        heading: pos.coords.heading ?? null,
        speed: pos.coords.speed ?? null,
        capturedAt: new Date(pos.timestamp).toISOString(),
        gpsFallbackMode: phase === 1 ? "gps" : "wifi",
      };
    }

    function getBestReading() {
      if (samples.length === 0) return null;
      return samples.reduce((a, b) => (a.accuracy <= b.accuracy ? a : b));
    }

    function finish() {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
      if (phase2Timer !== null) {
        clearTimeout(phase2Timer);
        phase2Timer = null;
      }
      const best = getBestReading();
      resolve(best);
    }

    function onPosition(pos) {
      samples.push(makeReading(pos));

      // Early resolve: accuracy excellent or enough samples
      if (
        samples.length >= maxSamplesPhase1 &&
        phase === 1
      ) {
        finish();
        return;
      }

      if (phase === 1) {
        // Check if we can early-resolve in Phase 1
        if (samples.length >= 2 && samples.some((s) => s.accuracy <= minAccuracyEarlyResolve)) {
          finish();
          return;
        }
      } else {
        // Phase 2: resolve after 2+ samples or if accuracy is good enough
        if (samples.length >= 3 || (samples.length >= 2 && getBestReading().accuracy <= 150)) {
          finish();
          return;
        }
      }
    }

    function onError() {
      if (phase === 1) {
        // Fall through to Phase 2 (WiFi fallback) on error
        startPhase2();
      } else {
        // Phase 2 failed too — give up
        finish();
      }
    }

    function startPhase2() {
      phase = 2;
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
      phase2Timer = setTimeout(() => {
        // Phase 2 timed out — resolve with best we have
        finish();
      }, settleTimeMsPhase2);

      watchId = navigator.geolocation.watchPosition(
        onPosition,
        () => {
          // Phase 2 error — just finish with what we have
          finish();
        },
        {
          enableHighAccuracy: false,
          timeout: settleTimeMsPhase2,
          maximumAge: 0,
        }
      );
    }

    // Start Phase 1: high-accuracy GPS
    watchId = navigator.geolocation.watchPosition(
      onPosition,
      onError,
      {
        enableHighAccuracy: true,
        timeout: settleTimeMsPhase1,
        maximumAge: 0,
      }
    );

    // Phase 1 timeout: switch to Phase 2 WiFi fallback
    phase2Timer = setTimeout(() => {
      if (phase === 1) {
        const best = getBestReading();
        // If we have a decent reading, resolve with it
        if (best && best.accuracy <= 200) {
          finish();
          return;
        }
        // Otherwise try WiFi fallback
        startPhase2();
      }
    }, settleTimeMsPhase1);
  });
}

/* ─── Service Codes (HCPCS) ───────────────────────────── */

/**
 * Default EVV service codes relevant to home health.
 * Extended codes will be loaded from Supabase per agency/state.
 */
export const DEFAULT_SERVICE_CODES = [
  { code: "G0154", description: "Skilled nursing services (RN/LPN)", category: "nursing" },
  { code: "G0156", description: "Home health aide (skilled)", category: "aide" },
  { code: "T2010", description: "Home health aide services (15 min)", category: "aide" },
  { code: "T2011", description: "Home health aide services (30 min)", category: "aide" },
  { code: "T2012", description: "Home health aide services (60 min)", category: "aide" },
  { code: "S5110", description: "Home care training (15 min)", category: "training" },
  { code: "S5115", description: "Home care training (30 min)", category: "training" },
  { code: "S5120", description: "Chore services (15 min)", category: "chore" },
  { code: "S5125", description: "Attendant care (15 min)", category: "attendant" },
  { code: "S5130", description: "Homemaker service (15 min)", category: "homemaker" },
  { code: "G0151", description: "Physical therapy evaluation", category: "therapy" },
  { code: "G0152", description: "Occupational therapy evaluation", category: "therapy" },
  { code: "G0153", description: "Speech-language pathology", category: "therapy" },
  { code: "G0157", description: "Medical social services", category: "social" },
  { code: "99512", description: "Telehealth visit (home health)", category: "telehealth" },
  { code: "99600", description: "Unlisted home visit service", category: "other" },
];

export function getServiceCodes() {
  return DEFAULT_SERVICE_CODES;
}

/* ─── Override Reasons ────────────────────────────────── */

export const OVERRIDE_REASONS = [
  { value: "gps_unavailable", label: "GPS unavailable (indoor/basement)" },
  { value: "gps_denied", label: "Client declined GPS permission" },
  { value: "phone_dead", label: "Phone battery died during visit" },
  { value: "network_error", label: "No cellular data coverage" },
  { value: "late_clockin", label: "Forgot to clock in on arrival" },
  { value: "early_clockout", label: "Left early (emergency)" },
  { value: "location_mismatch", label: "Client location differs from address" },
  { value: "other", label: "Other (explain below)" },
];

/* ─── EVV State Helpers ───────────────────────────────── */

export function getGpsAccuracyLabel(accuracyMeters) {
  if (accuracyMeters === null) return "No GPS";
  if (accuracyMeters <= 10) return "Excellent";
  if (accuracyMeters <= 50) return "Good";
  if (accuracyMeters <= 100) return "Fair";
  if (accuracyMeters <= 200) return "Poor";
  return "Very poor";
}

/**
 * Check if a GPS reading is within acceptable accuracy for a given state.
 * Default threshold: 100 meters (California standard).
 */
export function isGpsAccurate(accuracyMeters, threshold = 100) {
  if (accuracyMeters === null) return false;
  return accuracyMeters <= threshold;
}

/**
 * Calculate distance between GPS reading and known client location.
 * Uses Haversine formula. Returns distance in meters.
 */
export function distanceFromClient(lat1, lng1, lat2, lng2) {
  if (!lat1 || !lng1 || !lat2 || !lng2) return null;
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ─── Continuous GPS During Visit ────────────────────── */

/**
 * Start continuous GPS tracking during an active EVV visit.
 * Captures a GPS reading every `intervalMs` (default 5 minutes).
 * Readings are stored in the provided `readings` array reference.
 *
 * Also handles visibilitychange to capture a reading when the user
 * navigates away, and beforeunload for a final reading.
 *
 * @param {number} intervalMs - Interval between readings (default 300000 = 5 min)
 * @returns {{ stop: Function, readings: Array }} Control object
 */
export function startContinuousGps({ intervalMs = 300000 } = {}) {
  const readings = [];

  function captureReading() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        readings.push({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy * 100) / 100,
          altitude: pos.coords.altitude ?? null,
          heading: pos.coords.heading ?? null,
          speed: pos.coords.speed ?? null,
          capturedAt: new Date(pos.timestamp).toISOString(),
        });
      },
      () => {}, // ignore errors during continuous tracking
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 30000 }
    );
  }

  // Initial capture
  captureReading();

  // Periodic interval
  const intervalId = setInterval(captureReading, intervalMs);

  // Capture on visibility change (user switches tabs)
  const onVisibilityChange = () => {
    if (document.visibilityState === "hidden") captureReading();
  };
  document.addEventListener("visibilitychange", onVisibilityChange);

  // Capture on beforeunload
  const onBeforeUnload = () => captureReading();
  window.addEventListener("beforeunload", onBeforeUnload);

  return {
    stop() {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("beforeunload", onBeforeUnload);
      // Capture one final reading before stopping
      captureReading();
    },
    readings,
  };
}

/**
 * Check if current position is within geofence distance of a target.
 * Uses one-shot GPS. Returns { matched: boolean, lat, lng, accuracy, distance }
 * or null on failure.
 *
 * @param {number} targetLat
 * @param {number} targetLng
 * @param {number} thresholdMeters - Geofence radius (default 50)
 */
export async function checkGeofence(targetLat, targetLng, thresholdMeters = 50) {
  if (!navigator.geolocation || !targetLat || !targetLng) return null;
  try {
    const pos = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 30000,
      });
    });
    const dist = distanceFromClient(
      pos.coords.latitude,
      pos.coords.longitude,
      targetLat,
      targetLng
    );
    return {
      matched: dist !== null && dist <= thresholdMeters,
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: Math.round(pos.coords.accuracy * 100) / 100,
      distance: dist,
    };
  } catch {
    return null;
  }
}