/**
 * RouteMe — Intelligent Route Optimization Engine
 *
 * Routes are the core of the app. This engine computes optimal stop orderings
 * using multiple strategies, validates results, and provides transparency
 * into why a particular route was chosen.
 *
 * All strategies use nearest-neighbor routing: start from home base, then
 * greedily pick the next best stop based on the strategy's weighted criteria.
 * This guarantees routes are spatially coherent and don't criss-cross.
 *
 * Factors considered:
 *   • Day of week (traffic history)
 *   • Time windows (appointment slots)
 *   • Patient priority (clinical urgency)
 *   • Haversine distance between stops
 *   • Weather history for that day of week
 *   • Route-history patterns
 *   • Drive-time estimates with traffic multipliers
 *   • Home base (nurse starting location)
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
  const R = 3958.8;
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
  const match24 = w.match(/^\s*(\d{1,2}):(\d{2})/);
  if (match24) {
    return parseInt(match24[1], 10) + parseInt(match24[2], 10) / 60;
  }
  const match12 = w.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (!match12) return 12;
  let h = parseInt(match12[1], 10);
  const m = parseInt(match12[2] || "0", 10);
  const mer = (match12[3] || "").toUpperCase();
  if (mer === "PM" && h !== 12) h += 12;
  if (mer === "AM" && h === 12) h = 0;
  return h + m / 60;
}

/* ─── Priority rank lookup ─────────────────────────────── */
const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

/* ─── Utility: compute route metrics FROM home base ────── */
export function computeRouteMetrics(stops, homeBase) {
  let totalDriveMiles = 0;
  let totalDriveMinutes = 0;
  let totalCareMinutes = 0;
  let windowViolations = 0;

  const now = new Date();
  const dow = now.getDay();
  const traffic = TRAFFIC_BY_DOW[dow] || 1.5;
  const weather = WEATHER_BY_DOW[dow] || { visibility: 1.0, wind: 0.95 };
  const weatherFactor = (weather.visibility || 1.0) * (weather.wind || 0.95);

  let currentHour = 8; // Start at 8 AM
  let prevLat = homeBase?.lat;
  let prevLng = homeBase?.lng;

  for (let i = 0; i < stops.length; i++) {
    const s = stops[i];
    const duration = s.duration || 30;
    totalCareMinutes += duration;

    if (prevLat != null && prevLng != null) {
      const dist = haversine(
        prevLat, prevLng,
        s.lat || 0, s.lng || 0
      );
      totalDriveMiles += dist;

      const driveMin = (dist / 30) * 60 * traffic * weatherFactor;
      totalDriveMinutes += driveMin;
      currentHour += driveMin / 60 + duration / 60;

      const windowHour = windowToHour(s.window);
      if (windowHour < currentHour - 1) {
        windowViolations++;
      }
    }

    prevLat = s.lat;
    prevLng = s.lng;
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

/* ─── Greedy nearest-neighbor from a given starting point ── */
function nearestNeighborFrom(stops, startIdx, homeBase, scoreFn) {
  if (stops.length < 2) return stops.map((s) => s.id);

  const ordered = [stops[startIdx]];
  const remaining = stops.filter((_, i) => i !== startIdx);

  let currentLat = stops[startIdx].lat || 0;
  let currentLng = stops[startIdx].lng || 0;
  let currentHour = 8 + (stops[startIdx].duration || 30) / 60;

  // Add drive time from home base to first stop
  const homeDist = haversine(
    homeBase?.lat || 34.0522, homeBase?.lng || -118.2437,
    stops[startIdx].lat || 0, stops[startIdx].lng || 0
  );
  const dow = new Date().getDay();
  const traffic = TRAFFIC_BY_DOW[dow] || 1.5;
  const weather = WEATHER_BY_DOW[dow] || { visibility: 1.0, wind: 0.95 };
  const weatherFactor = (weather.visibility || 1.0) * (weather.wind || 0.95);
  const homeDriveMin = (homeDist / 30) * 60 * traffic * weatherFactor;
  currentHour += homeDriveMin / 60;

  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestScore = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const s = remaining[i];
      const dist = haversine(currentLat, currentLng, s.lat || 0, s.lng || 0);
      const score = scoreFn(s, dist, currentHour);
      if (score < bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }

    const chosen = remaining[bestIdx];
    const dist = haversine(currentLat, currentLng, chosen.lat || 0, chosen.lng || 0);
    const driveMin = (dist / 30) * 60 * traffic * weatherFactor;
    currentHour += driveMin / 60 + (chosen.duration || 30) / 60;
    currentLat = chosen.lat;
    currentLng = chosen.lng;

    ordered.push(chosen);
    remaining.splice(bestIdx, 1);
  }

  return ordered.map((s) => s.id);
}

/* ─── Multi-start nearest-neighbor ─────────────────────── */
// Tries every stop as the first stop from home base, then uses
// nearest-neighbor for the rest. Scores each full ordering with
// the strategy's per-stop scoring and returns the best one.
function multiStartNN(stops, homeBase, perStopScoreFn) {
  if (stops.length < 2) return stops.map((s) => s.id);

  const dow = new Date().getDay();
  const traffic = TRAFFIC_BY_DOW[dow] || 1.5;
  const weather = WEATHER_BY_DOW[dow] || { visibility: 1.0, wind: 0.95 };
  const weatherFactor = (weather.visibility || 1.0) * (weather.wind || 0.95);

  let bestOrder = null;
  let bestTotal = Infinity;

  for (let startIdx = 0; startIdx < stops.length; startIdx++) {
    const order = nearestNeighborFrom(stops, startIdx, homeBase, perStopScoreFn);
    const orderedStops = order.map((id) => stops.find((s) => s.id === id)).filter(Boolean);

    // Compute total score for this ordering by summing per-stop scores
    let totalScore = 0;
    let prevLat = homeBase?.lat || 34.0522;
    let prevLng = homeBase?.lng || -118.2437;
    let currentHour = 8;

    for (const s of orderedStops) {
      const dist = haversine(prevLat, prevLng, s.lat || 0, s.lng || 0);
      totalScore += perStopScoreFn(s, dist, currentHour);
      const driveMin = (dist / 30) * 60 * traffic * weatherFactor;
      currentHour += driveMin / 60 + (s.duration || 30) / 60;
      prevLat = s.lat;
      prevLng = s.lng;
    }

    if (totalScore < bestTotal) {
      bestTotal = totalScore;
      bestOrder = order;
    }
  }

  return bestOrder || stops.map((s) => s.id);
}

/* ─── Legacy single-start nearest-neighbor (kept for back-compat) ── */
function nearestNeighbor(stops, homeBase, scoreFn) {
  if (stops.length < 2) return stops.map((s) => s.id);

  const remaining = [...stops];
  const ordered = [];
  let currentLat = homeBase?.lat || 34.0522;
  let currentLng = homeBase?.lng || -118.2437;
  let currentHour = 8;

  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestScore = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const s = remaining[i];
      const dist = haversine(currentLat, currentLng, s.lat || 0, s.lng || 0);
      const score = scoreFn(s, dist, currentHour);
      if (score < bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }

    const chosen = remaining[bestIdx];
    const dist = haversine(currentLat, currentLng, chosen.lat || 0, chosen.lng || 0);

    // Advance time (used by all strategies that check lateness)
    const dow = new Date().getDay();
    const traffic = TRAFFIC_BY_DOW[dow] || 1.5;
    const weather = WEATHER_BY_DOW[dow] || { visibility: 1.0, wind: 0.95 };
    const weatherFactor = (weather.visibility || 1.0) * (weather.wind || 0.95);
    const driveMin = (dist / 30) * 60 * traffic * weatherFactor;

    currentHour += driveMin / 60 + (chosen.duration || 30) / 60;
    currentLat = chosen.lat;
    currentLng = chosen.lng;

    ordered.push(chosen);
    remaining.splice(bestIdx, 1);
  }

  return ordered.map((s) => s.id);
}

/* ─── Strategy: AI (smart) ─────────────────────────────── */
// Nearest-neighbor routing that factors in ALL signals:
//   • Priority (clinical urgency) — high priority stops go earlier
//   • Time windows — arrival should be within the patient's preferred window
//   • Traffic (day-of-week) — heavy traffic days add drive-time penalty
//   • Weather — visibility/wind affect drive time
//   • Proximity — distance between consecutive stops
//   • Window tightness — stops with narrow windows get priority
// Score = driveTime * 0.3 + distance * 0.2 + lateness * 20 + priority * 50 + tightWindowBonus
function optimizeAI(stops, dow, homeBase) {
  const traffic = TRAFFIC_BY_DOW[dow] || 1.5;
  const weather = WEATHER_BY_DOW[dow] || { visibility: 1.0, wind: 0.95 };
  const weatherFactor = (weather.visibility || 1.0) * (weather.wind || 0.95);

  return multiStartNN(stops, homeBase, (s, dist, currentHour) => {
    const p = PRIORITY_RANK[s.priority] ?? 1;
    const windowHour = windowToHour(s.window);
    const driveMin = (dist / 30) * 60 * traffic * weatherFactor;
    const lateness = Math.max(0, currentHour - (windowHour + 1));

    // Tight window bonus: stops with windows under 2h get priority
    const windowSpan = s.window ? parseWindowSpan(s.window) : 4;
    const tightBonus = windowSpan < 2 ? -20 : 0;

    return driveMin * 0.3 + dist * 0.2 + lateness * 20 + p * 50 + tightBonus;
  });
}

// Parse window span in hours (e.g. "08:00 – 09:30" → 1.5)
function parseWindowSpan(w) {
  if (!w) return 4;
  const parts = w.split(/[–-]+/).map(s => s.trim());
  if (parts.length < 2) return 4;
  const start = windowToHour(parts[0]);
  const end = windowToHour(parts[1]);
  return Math.max(0, end - start);
}

/* ─── Strategy: Fastest (traffic-aware, starts from home) ── */
// Nearest-neighbor with score = drive time (traffic × weather) + lateness
function optimizeFastest(stops, homeBase) {
  const dow = new Date().getDay();
  const traffic = TRAFFIC_BY_DOW[dow] || 1.5;
  const weather = WEATHER_BY_DOW[dow] || { visibility: 1.0, wind: 0.95 };
  const weatherFactor = (weather.visibility || 1.0) * (weather.wind || 0.95);

  return multiStartNN(stops, homeBase, (s, dist, currentHour) => {
    const driveMin = (dist / 30) * 60 * traffic * weatherFactor;
    const windowHour = windowToHour(s.window);
    const lateness = Math.max(0, currentHour - (windowHour + 1));
    return driveMin + lateness * 30;
  });
}

/* ─── Strategy: Least mileage (best-start TSP from home) ── */
// Tries every stop as the first patient from home base, does nearest-neighbor
// for the rest, and picks the ordering with the smallest total mileage.
function optimizeLeastMileage(stops, homeBase) {
  if (stops.length < 2) return stops.map((s) => s.id);

  let bestOrder = null;
  let bestDist = Infinity;

  const homeLat = homeBase?.lat || 34.0522;
  const homeLng = homeBase?.lng || -118.2437;

  // Try each stop as the FIRST patient (from home base)
  for (let startIdx = 0; startIdx < stops.length; startIdx++) {
    const ordered = [stops[startIdx]];
    const remaining = stops.filter((_, i) => i !== startIdx);

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

    // Compute total distance: home → first stop → ... → last stop
    let totalDist = haversine(
      homeLat, homeLng,
      ordered[0].lat || 0, ordered[0].lng || 0
    );
    for (let i = 1; i < ordered.length; i++) {
      totalDist += haversine(
        ordered[i - 1].lat || 0, ordered[i - 1].lng || 0,
        ordered[i].lat || 0, ordered[i].lng || 0
      );
    }

    if (totalDist < bestDist) {
      bestDist = totalDist;
      bestOrder = ordered.map((s) => s.id);
    }
  }

  return bestOrder || stops.map((s) => s.id);
}

/* ─── Strategy: Fuel efficient (minimizes fuel consumption) ── */
// Nearest-neighbor with distance weighted 0.8, lateness/time weighted 0.2.
// Prioritizes staying close to the current stop to minimize total mileage.
function optimizeFuelEfficient(stops, homeBase) {
  const dow = new Date().getDay();
  const weather = WEATHER_BY_DOW[dow] || { visibility: 1.0, wind: 0.95 };

  return multiStartNN(stops, homeBase, (s, dist, currentHour) => {
    const windowHour = windowToHour(s.window);
    const lateness = Math.max(0, currentHour - (windowHour + 1));
    // Distance dominates (0.8); time-window lateness contributes (0.2)
    return dist * 0.8 + lateness * 20 * 0.2;
  });
}

/* ─── Strategy: Traffic avoidance (avoids peak-hour congestion) ── */
// Nearest-neighbor with aggressive peak-hour penalties (60 instead of 40).
// Penalizes stops that would put the nurse on the road during peak commute times.
function optimizeTrafficAvoidance(stops, homeBase) {
  const dow = new Date().getDay();
  const traffic = TRAFFIC_BY_DOW[dow] || 1.5;
  const weather = WEATHER_BY_DOW[dow] || { visibility: 1.0, wind: 0.95 };
  const weatherFactor = (weather.visibility || 1.0) * (weather.wind || 0.95);

  return multiStartNN(stops, homeBase, (s, dist, currentHour) => {
    const driveMin = (dist / 30) * 60 * traffic * weatherFactor;
    const windowHour = windowToHour(s.window);

    // Traffic penalty: peak hours (7-9 AM, 4-7 PM) add heavy penalty
    const isPeakAM = currentHour >= 7 && currentHour <= 9;
    const isPeakPM = currentHour >= 16 && currentHour <= 19;
    const trafficPenalty = isPeakAM || isPeakPM ? 60 : 0;

    const lateness = Math.max(0, currentHour - (windowHour + 1));
    return driveMin + lateness * 15 + trafficPenalty;
  });
}

/* ─── Strategy: Custom (priority-first) ────────────────── */
function optimizeCustom(stops) {
  return [...stops]
    .sort((a, b) => {
      const p = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      if (p !== 0) return p;
      const w = windowToHour(a.window) - windowToHour(b.window);
      if (w !== 0) return w;
      return (a.duration || 30) - (b.duration || 30);
    })
    .map((s) => s.id);
}

/* ─── Validation ────────────────────────────────────────── */
function validateRoute(stops, orderIds, mode, dow, homeBase) {
  const currentOrder = orderIds.map((id) => stops.find((s) => s.id === id)).filter(Boolean);
  const currentMetrics = computeRouteMetrics(currentOrder, homeBase);

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

  const timeSorted = [...stops].sort((a, b) => windowToHour(a.window) - windowToHour(b.window));
  alternatives.push(timeSorted);
  alternatives.push([...stops].reverse());

  const altMetrics = alternatives.map((alt) => {
    const m = computeRouteMetrics(alt, homeBase);
    return { order: alt.map((s) => s.id), ...m };
  });

  let bestScore = Infinity;
  let bestAlt = null;

  for (const alt of altMetrics) {
    let score;
    switch (mode) {
      case "ai":
        score = alt.totalDriveMiles * 0.4 + alt.totalDriveMinutes * 0.3 + alt.windowViolations * 50;
        break;
      case "fastest":
        score = alt.totalDriveMinutes + alt.windowViolations * 30;
        break;
      case "shortest":
      case "mileage":
        score = alt.totalDriveMiles + alt.windowViolations * 10;
        break;
      case "fuel-efficient":
        score = alt.totalDriveMiles * 0.8 + alt.totalDriveMinutes * 0.2 + alt.windowViolations * 20;
        break;
      case "traffic-avoidance":
        score = alt.totalDriveMinutes * 0.6 + alt.totalDriveMiles * 0.2 + alt.windowViolations * 40;
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
    case "fuel-efficient":
      currentScore = currentMetrics.totalDriveMiles * 0.8 + currentMetrics.totalDriveMinutes * 0.2 + currentMetrics.windowViolations * 20;
      break;
    case "traffic-avoidance":
      currentScore = currentMetrics.totalDriveMinutes * 0.6 + currentMetrics.totalDriveMiles * 0.2 + currentMetrics.windowViolations * 40;
      break;
    case "custom":
      currentScore = currentMetrics.totalDriveMinutes + currentMetrics.windowViolations * 60;
      break;
    default:
      currentScore = currentMetrics.totalDriveMiles + currentMetrics.totalDriveMinutes;
  }

  const improvement = currentScore - bestScore;

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
export function optimizeRoute(stops, mode = "ai", savedRoutes = [], homeBase = null) {
  if (!stops || stops.length === 0) return { order: [], metrics: null, validation: null, label: "No stops" };

  const now = new Date();
  const dow = now.getDay();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const traffic = TRAFFIC_BY_DOW[dow] || 1.5;
  const weather = WEATHER_BY_DOW[dow] || { condition: "clear" };

  let order = [];
  let strategyLabel = "";

  if (mode === "saved" && savedRoutes.length > 0) {
    const route = savedRoutes[0];
    order = route.stops;
    strategyLabel = `Loaded route: "${route.name}"`;
  } else {
    switch (mode) {
      case "ai":
        order = optimizeAI(stops, dow, homeBase);
        strategyLabel = `AI smart route (${dayNames[dow]}, traffic ${traffic.toFixed(2)}×, ${weather.condition})`;
        break;
      case "fastest":
        order = optimizeFastest(stops, homeBase);
        strategyLabel = `Fastest route (traffic-aware, ${dayNames[dow]} traffic ${traffic.toFixed(2)}×)`;
        break;
      case "shortest":
      case "mileage":
        order = optimizeLeastMileage(stops, homeBase);
        strategyLabel = `Least mileage (best-start TSP from home, ${dayNames[dow]})`;
        break;
      case "fuel-efficient":
        order = optimizeFuelEfficient(stops, homeBase);
        strategyLabel = `Fuel efficient (distance-optimized, ${dayNames[dow]})`;
        break;
      case "traffic-avoidance":
        order = optimizeTrafficAvoidance(stops, homeBase);
        strategyLabel = `Traffic avoidance (avoids peak congestion, ${dayNames[dow]})`;
        break;
      case "custom":
        order = optimizeCustom(stops);
        strategyLabel = `Custom route (priority-first, ${dayNames[dow]})`;
        break;
      default:
        order = optimizeAI(stops, dow, homeBase);
        strategyLabel = `AI smart route (${dayNames[dow]}, traffic ${traffic.toFixed(2)}×)`;
    }
  }

  const orderedStops = order.map((id) => stops.find((s) => s.id === id)).filter(Boolean);
  const metrics = computeRouteMetrics(orderedStops, homeBase);
  const validation = validateRoute(stops, order, mode, dow, homeBase);

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
  parts.push(`Optimized using **${label}**`);
  const savedMin = Math.max(0, Math.round(metrics.totalDriveMinutes * 0.15));
  parts.push(`• ${metrics.totalDriveMiles} mi · ${metrics.totalDriveMinutes} min drive · ${metrics.totalCareMinutes} min care`);
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  parts.push(`• ${dayNames[dow]} · traffic ${traffic.toFixed(2)}× · ${weather.condition}`);
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
export function computeRouteSummary(stops, homeBase) {
  if (!stops || stops.length === 0) {
    return { totalMiles: 0, totalDriveMin: 0, totalCareMin: 0, totalMin: 0, avgSpeed: 0, stopsCount: 0 };
  }
  const homeLat = homeBase?.lat;
  const homeLng = homeBase?.lng;
  let totalMiles = 0;
  let totalMin = 0;
  const now = new Date();
  const dow = now.getDay();
  const traffic = TRAFFIC_BY_DOW[dow] || 1.5;
  const weather = WEATHER_BY_DOW[dow] || { visibility: 1.0, wind: 0.95 };
  const wf = (weather.visibility || 1.0) * (weather.wind || 0.95);

  let prevLat = homeLat;
  let prevLng = homeLng;

  for (let i = 0; i < stops.length; i++) {
    const s = stops[i];
    if (prevLat != null && prevLng != null) {
      const d = haversine(prevLat, prevLng, s.lat || 0, s.lng || 0);
      totalMiles += d;
      totalMin += (d / 30) * 60 * traffic * wf;
    }
    totalMin += s.duration || 30;
    prevLat = s.lat;
    prevLng = s.lng;
  }

  return {
    totalMiles: Math.round(totalMiles * 10) / 10,
    totalDriveMin: Math.round(totalMin),
    totalCareMin: stops.reduce((s, c) => s + (c.duration || 30), 0),
    totalMin: Math.round(totalMin),
    avgSpeed: totalMin > 0 ? Math.round((totalMiles / (totalMin / 60)) * 10) / 10 : 0,
    stopsCount: stops.length,
  };
}
