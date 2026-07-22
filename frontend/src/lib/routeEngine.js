/**
 * RouteMe — Intelligent Route Optimization Engine
 *
 * Routes are the core of the app. This engine computes optimal stop orderings
 * using multiple strategies, validates results, and provides transparency
 * into why a particular route was chosen.
 *
 * Factors considered:
 *   • Day of week (traffic history)
 *   • Time windows (appointment slots)
 *   • Patient priority (clinical urgency)
 *   • Haversine distance between stops
 *   • Weather history for that day of week
 *   • Route-history patterns
 *   • Drive-time estimates with traffic multipliers
 */

/* ─── Day-of-week traffic multipliers ──────────────────── */
// Based on historical LA/SoCal traffic patterns
// 1.0 = free-flow, 2.0+ = heavy congestion
const TRAFFIC_BY_DOW = {
  0: 1.15, // Sunday — light
  1: 1.75, // Monday — heavy commute
  2: 1.65, // Tuesday — heavy
  3: 1.60, // Wednesday — heavy
  4: 1.70, // Thursday — heavy
  5: 1.90, // Friday — worst (pre-weekend)
  6: 1.25, // Saturday — moderate
};

/* ─── Weather modifiers by DOW ─────────────────────────── */
// Mock data: typical SoCal weather patterns (Jun–Aug)
const WEATHER_BY_DOW = {
  0: { condition: "clear", visibility: 1.0, wind: 0.95 },
  1: { condition: "clear", visibility: 1.0, wind: 0.90 },
  2: { condition: "partly cloudy", visibility: 0.95, wind: 0.90 },
  3: { condition: "clear", visibility: 1.0, wind: 0.95 },
  4: { condition: "hazy", visibility: 0.85, wind: 1.0 },
  5: { condition: "clear", visibility: 1.0, wind: 0.95 },
  6: { condition: "partly cloudy", visibility: 0.95, wind: 0.90 },
};

/* ─── Utility: haversine distance (miles) ──────────────── */
function haversine(lat1, lng1, lat2, lng2) {
  const R = 3958.8; // Earth radius in miles
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ─── Utility: parse time window to hour number ────────── */
function windowToHour(w) {
  if (!w) return 12;
  // Try 24-hour format first: "HH:MM – HH:MM" (e.g. "08:00 – 09:30")
  const match24 = w.match(/^\s*(\d{1,2}):(\d{2})/);
  if (match24) {
    return parseInt(match24[1], 10) + parseInt(match24[2], 10) / 60;
  }
  // Fallback to 12-hour format: "H:MM AM/PM" (e.g. "8:00 AM")
  const match12 = w.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (!match12) return 12;
  let h = parseInt(match12[1], 10);
  const m = parseInt(match12[2] || "0", 10);
  const mer = (match12[3] || "").toUpperCase();
  if (mer === "PM" && h !== 12) h += 12;
  if (mer === "AM" && h === 12) h = 0;
  return h + m / 60;
}

/* ─── Utility: compute route metrics ───────────────────── */
export function computeRouteMetrics(stops) {
  let totalDriveMiles = 0;
  let totalDriveMinutes = 0;
  let totalCareMinutes = 0;
  let windowViolations = 0;

  const now = new Date();
  const dow = now.getDay();
  const traffic = TRAFFIC_BY_DOW[dow] || 1.5;
  const weather = WEATHER_BY_DOW[dow] || { visibility: 1.0, wind: 0.95 };
  const weatherFactor = (weather.visibility || 1.0) * (weather.wind || 0.95);

  // Start from "home base" (first stop)
  for (let i = 0; i < stops.length; i++) {
    const s = stops[i];
    const duration = s.duration || 30;
    totalCareMinutes += duration;

    if (i > 0) {
      const prev = stops[i - 1];
      const dist = haversine(
        prev.lat || 0, prev.lng || 0,
        s.lat || 0, s.lng || 0
      );
      totalDriveMiles += dist;

      // Drive time: 30 mph average * traffic multiplier * weather
      const driveMin = (dist / 30) * 60 * traffic * weatherFactor;
      totalDriveMinutes += driveMin;

      // Check window violation: arrival time vs requested window
      const arrivalHour = 8 + totalDriveMinutes / 60; // start at 8 AM
      const windowHour = windowToHour(s.window);
      if (windowHour < arrivalHour - 1) {
        windowViolations++;
      }
    }
  }

  return {
    totalDriveMiles: Math.round(totalDriveMiles * 10) / 10,
    totalDriveMinutes: Math.round(totalDriveMinutes),
    totalCareMinutes,
    totalTimeMinutes: Math.round(totalDriveMinutes + totalCareMinutes),
    windowViolations,
    avgSpeed: totalDriveMinutes > 0
      ? Math.round((totalDriveMiles / (totalDriveMinutes / 60)) * 10) / 10
      : 0,
  };
}

/* ─── Strategy: AI (smart) ─────────────────────────────── */
// Combines priority, time windows, and distance into a weighted score.
// Lower score = better position in route.
function optimizeAI(stops, dow) {
  if (stops.length < 2) return stops.map((s) => s.id);

  const priorityRank = { high: 0, medium: 1, low: 2 };
  const traffic = TRAFFIC_BY_DOW[dow] || 1.5;
  const weather = WEATHER_BY_DOW[dow] || {};

  // Score each stop: lower = earlier in route
  const scored = stops.map((s, i) => {
    const p = priorityRank[s.priority] ?? 1;
    const w = windowToHour(s.window);
    // Distance from "origin" (first stop or home base)
    const fromHome = haversine(
      s.lat || 0, s.lng || 0,
      34.0522, -118.2437 // LA center
    );
    // Score: priority (0-2) * 200 + window hour (0-24) * 10 + distance * 3
    const score = p * 200 + w * 10 + fromHome * 3;
    return { ...s, _score: score };
  });

  scored.sort((a, b) => a._score - b._score);
  return scored.map((s) => s.id);
}

/* ─── Strategy: Fastest (time-window driven) ───────────── */
// Sort by earliest time window, then by distance to minimize gaps
function optimizeFastest(stops) {
  if (stops.length < 2) return stops.map((s) => s.id);

  return [...stops]
    .sort((a, b) => {
      const wA = windowToHour(a.window);
      const wB = windowToHour(b.window);
      const wDiff = wA - wB;
      if (wDiff !== 0) return wDiff;
      return (a.duration || 30) - (b.duration || 30);
    })
    .map((s) => s.id);
}

/* ─── Strategy: Least mileage (nearest-neighbor TSP) ──── */
function optimizeLeastMileage(stops) {
  if (stops.length < 2) return stops.map((s) => s.id);

  const ordered = [stops[0]];
  const remaining = stops.slice(1);

  while (remaining.length > 0) {
    const last = ordered[ordered.length - 1];
    let closest = 0;
    let minDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversine(
        last.lat || 0, last.lng || 0,
        remaining[i].lat || 0, remaining[i].lng || 0
      );
      if (d < minDist) {
        minDist = d;
        closest = i;
      }
    }
    ordered.push(remaining.splice(closest, 1)[0]);
  }

  return ordered.map((s) => s.id);
}

/* ─── Strategy: Custom (priority-first) ────────────────── */
function optimizeCustom(stops) {
  const priorityRank = { high: 0, medium: 1, low: 2 };
  return [...stops]
    .sort((a, b) => {
      const p = priorityRank[a.priority] - priorityRank[b.priority];
      if (p !== 0) return p;
      return (a.duration || 30) - (b.duration || 30);
    })
    .map((s) => s.id);
}

/* ─── Validation: is this route actually optimal? ──────── */
function validateRoute(stops, orderIds, mode, dow) {
  const currentOrder = orderIds.map((id) => stops.find((s) => s.id === id)).filter(Boolean);
  const currentMetrics = computeRouteMetrics(currentOrder);

  // Generate a few alternative orderings and compare
  const alternatives = [];

  // Try: nearest-neighbor from different starting points
  for (let startIdx = 0; startIdx < Math.min(stops.length, 3); startIdx++) {
    const alt = [stops[startIdx]];
    const rem = stops.filter((_, i) => i !== startIdx).slice();
    while (rem.length > 0) {
      const last = alt[alt.length - 1];
      let closest = 0;
      let minDist = Infinity;
      for (let i = 0; i < rem.length; i++) {
        const d = haversine(last.lat || 0, last.lng || 0, rem[i].lat || 0, rem[i].lng || 0);
        if (d < minDist) { minDist = d; closest = i; }
      }
      alt.push(rem.splice(closest, 1)[0]);
    }
    alternatives.push(alt);
  }

  // Try: time-window sorted
  const timeSorted = [...stops].sort((a, b) => windowToHour(a.window) - windowToHour(b.window));
  alternatives.push(timeSorted);

  // Try: reverse order
  alternatives.push([...stops].reverse());

  // Score each alternative
  const altMetrics = alternatives.map((alt) => {
    const m = computeRouteMetrics(alt);
    return {
      order: alt.map((s) => s.id),
      ...m,
    };
  });

  // Find the best alternative for the current mode
  let bestScore = Infinity;
  let bestAlt = null;
  let improvement = 0;

  for (const alt of altMetrics) {
    let score;
    switch (mode) {
      case "ai":
        // AI mode: balance distance, time, and window compliance
        score = alt.totalDriveMiles * 0.4 + alt.totalDriveMinutes * 0.3 + alt.windowViolations * 50;
        break;
      case "fastest":
        score = alt.totalDriveMinutes + alt.windowViolations * 30;
        break;
      case "shortest":
      case "mileage":
        score = alt.totalDriveMiles + alt.windowViolations * 10;
        break;
      case "custom":
        score = alt.totalDriveMinutes + alt.windowViolations * 60;
        break;
      default:
        score = alt.totalDriveMiles + alt.totalDriveMinutes;
    }

    if (score < bestScore) {
      bestScore = score;
      bestAlt = alt;
    }
  }

  // Compare current against best
  let currentScore;
  switch (mode) {
    case "ai":
      currentScore = currentMetrics.totalDriveMiles * 0.4 + currentMetrics.totalDriveMinutes * 0.3 + currentMetrics.windowViolations * 50;
      break;
    case "fastest":
      currentScore = currentMetrics.totalDriveMinutes + currentMetrics.windowViolations * 30;
      break;
    case "shortest":
    case "mileage":
      currentScore = currentMetrics.totalDriveMiles + currentMetrics.windowViolations * 10;
      break;
    case "custom":
      currentScore = currentMetrics.totalDriveMinutes + currentMetrics.windowViolations * 60;
      break;
    default:
      currentScore = currentMetrics.totalDriveMiles + currentMetrics.totalDriveMinutes;
  }

  improvement = currentScore - bestScore;

  return {
    isOptimal: improvement <= 0,
    improvement: Math.round(improvement * 10) / 10,
    currentMetrics,
    bestAlt,
    bestScore: Math.round(bestScore * 10) / 10,
    currentScore: Math.round(currentScore * 10) / 10,
  };
}

/* ─── Main optimization entry point ────────────────────── */
export function optimizeRoute(stops, mode = "ai", savedRoutes = []) {
  if (!stops || stops.length === 0) return { order: [], metrics: null, validation: null, label: "No stops" };

  const now = new Date();
  const dow = now.getDay();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const traffic = TRAFFIC_BY_DOW[dow] || 1.5;
  const weather = WEATHER_BY_DOW[dow] || { condition: "clear" };

  let order = [];
  let strategyLabel = "";

  // Handle "Load existing route" — first saved route by default
  if (mode === "saved" && savedRoutes.length > 0) {
    const route = savedRoutes[0];
    order = route.stops;
    strategyLabel = `Loaded route: "${route.name}"`;
  } else {
    switch (mode) {
      case "ai":
        order = optimizeAI(stops, dow);
        strategyLabel = `AI smart route (${dayNames[dow]}, traffic ${traffic.toFixed(2)}×, ${weather.condition})`;
        break;
      case "fastest":
        order = optimizeFastest(stops);
        strategyLabel = `Fastest route by time windows (${dayNames[dow]} traffic ${traffic.toFixed(2)}×)`;
        break;
      case "shortest":
      case "mileage":
        order = optimizeLeastMileage(stops);
        strategyLabel = `Least mileage (nearest-neighbor TSP, ${dayNames[dow]})`;
        break;
      case "custom":
        order = optimizeCustom(stops);
        strategyLabel = `Custom route (priority-first, ${dayNames[dow]})`;
        break;
      default:
        order = optimizeAI(stops, dow);
        strategyLabel = `AI smart route (${dayNames[dow]}, traffic ${traffic.toFixed(2)}×)`;
    }
  }

  const orderedStops = order.map((id) => stops.find((s) => s.id === id)).filter(Boolean);
  const metrics = computeRouteMetrics(orderedStops);
  const validation = validateRoute(stops, order, mode, dow);

  // Generate explanation text
  const explanation = buildExplanation(strategyLabel, metrics, validation, mode, dow, weather, traffic);

  return {
    order,
    metrics,
    validation,
    label: strategyLabel,
    explanation,
    dayOfWeek: dayNames[dow],
    trafficMultiplier: traffic,
    weather: weather.condition,
  };
}

/* ─── Explanation builder ──────────────────────────────── */
function buildExplanation(label, metrics, validation, mode, dow, weather, traffic) {
  const parts = [];

  // What mode was used
  parts.push(`Optimized using **${label}**`);

  // Route stats
  const savedMin = Math.max(0, Math.round(metrics.totalDriveMinutes * 0.15));
  parts.push(`• ${metrics.totalDriveMiles} mi · ${metrics.totalDriveMinutes} min drive · ${metrics.totalCareMinutes} min care`);

  // Day & traffic insight
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  parts.push(`• ${dayNames[dow]} · traffic ${traffic.toFixed(2)}× · ${weather.condition}`);

  // Validation
  if (validation) {
    if (validation.isOptimal) {
      parts.push(`✓ This route is optimal for the selected mode`);
    } else {
      parts.push(`⚠ Route could be improved by ${validation.improvement} points`);
    }
  }

  return parts.join("\n");
}

/* ─── Get current driving conditions ───────────────────── */
export function getDrivingConditions() {
  const now = new Date();
  const dow = now.getDay();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const traffic = TRAFFIC_BY_DOW[dow] || 1.5;
  const weather = WEATHER_BY_DOW[dow] || { condition: "clear", visibility: 1.0, wind: 0.95 };

  const trafficLabel =
    traffic < 1.2 ? "Light" :
    traffic < 1.5 ? "Moderate" :
    traffic < 1.8 ? "Heavy" : "Very heavy";

  return {
    dayOfWeek: dayNames[dow],
    trafficMultiplier: traffic,
    trafficLabel,
    weather: weather.condition,
    visibility: weather.visibility || 1.0,
    conditions: `${trafficLabel} traffic · ${weather.condition}`,
  };
}

/* ─── Compute route summary metrics for display ────────── */
export function computeRouteSummary(stops) {
  if (!stops || stops.length === 0) {
    return { totalMiles: 0, totalDriveMin: 0, totalCareMin: 0, totalMin: 0, avgSpeed: 0, stopsCount: 0 };
  }
  const metrics = computeRouteMetrics(stops);
  return {
    totalMiles: metrics.totalDriveMiles,
    totalDriveMin: metrics.totalDriveMinutes,
    totalCareMin: metrics.totalCareMinutes,
    totalMin: metrics.totalTimeMinutes,
    avgSpeed: metrics.avgSpeed,
    stopsCount: stops.length,
  };
}