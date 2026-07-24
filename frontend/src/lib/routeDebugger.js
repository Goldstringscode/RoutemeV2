/**
 * RouteMe Debug Logger
 * Logs route metrics, baseline comparisons, and state changes to console.
 * Prefix: [RouteDebug]
 */

const ENABLED = true;

export function debugLog(...args) {
  if (!ENABLED) return;
  console.log("[RouteDebug]", ...args);
}

export function debugWarn(...args) {
  if (!ENABLED) return;
  console.warn("[RouteDebug]", ...args);
}

/**
 * Log full route state snapshot
 */
export function logRouteState({ routeDistance, routeDuration, baseline, optimized, mode, routeGeoJson }) {
  debugLog("╔═══════════════════════ ROUTE STATE SNAPSHOT ═══════════════════");
  debugLog("║  Mode:", mode);
  debugLog("║  Optimized:", optimized);
  debugLog("║  Route has GeoJSON:", !!routeGeoJson);
  debugLog("║");
  debugLog("║  Current distance:", routeDistance ? `${(routeDistance * 0.000621371).toFixed(1)} mi (${routeDistance} m)` : "—");
  debugLog("║  Current duration:", routeDuration ? `${Math.round(routeDuration / 60)} min (${routeDuration} sec)` : "—");
  debugLog("║");
  if (baseline) {
    const blMi = (baseline.distance * 0.000621371).toFixed(1);
    const curMi = routeDistance ? (routeDistance * 0.000621371).toFixed(1) : "—";
    const blDur = Math.round(baseline.duration / 60);
    const curDur = routeDuration ? Math.round(routeDuration / 60) : "—";
    debugLog("║  Baseline distance:", `${blMi} mi`);
    debugLog("║  Baseline duration:", `${blDur} min`);
    debugLog("║");
    if (routeDistance) {
      const pct = ((baseline.distance - routeDistance) / baseline.distance * 100);
      debugLog("║  Fuel saved (dist%):", `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`);
    }
    if (routeDuration) {
      const savedMin = Math.round((baseline.duration - routeDuration) / 60);
      debugLog("║  Time saved:", savedMin >= 0 ? `${savedMin} min` : `${Math.abs(savedMin)} min slower`);
    }
  } else {
    debugLog("║  Baseline: NOT SET (will be set on first route data)");
  }
  debugLog("╚═══════════════════════════════════════════════════════════════");
}

/**
 * Log when baseline is set or changed
 */
export function logBaselineChange(type, oldBaseline, newBaseline) {
  debugLog(`Baseline ${type}:`, {
    old: oldBaseline ? `${(oldBaseline.distance * 0.000621371).toFixed(1)} mi / ${Math.round(oldBaseline.duration / 60)} min` : "null",
    new: `${(newBaseline.distance * 0.000621371).toFixed(1)} mi / ${Math.round(newBaseline.duration / 60)} min`,
  });
}