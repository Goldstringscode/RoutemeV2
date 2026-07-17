// Mapbox Directions API utility for RouteMeV2
const TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

/**
 * Fetch a driving route from Mapbox Directions API.
 * @param {Array<{lat: number, lng: number}>} waypoints - Ordered list of stops
 * @returns {Promise<{routeGeoJson: object, distance: number, duration: number, legs: Array}>}
 */
export async function fetchRoute(waypoints) {
  if (!TOKEN) {
    console.warn("⚠️ REACT_APP_MAPBOX_TOKEN missing");
    return null;
  }
  if (waypoints.length < 2) return null;

  // Build coordinate string: lng,lat;lng,lat;...
  const coords = waypoints.map((p) => `${p.lng},${p.lat}`).join(";");

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?access_token=${TOKEN}&geometries=geojson&steps=true&overview=full&language=en`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error("Directions API error:", res.status, res.statusText);
      return null;
    }
    const data = await res.json();

    if (!data.routes || data.routes.length === 0) {
      console.warn("No route found");
      return null;
    }

    const route = data.routes[0];

    // Step-by-step instructions from all legs
    const steps = [];
    route.legs.forEach((leg, legIdx) => {
      leg.steps.forEach((step) => {
        steps.push({
          instruction: step.maneuver.instruction,
          modifier: step.maneuver.modifier || null,
          type: step.maneuver.type,
          distance: step.distance, // meters
          duration: step.duration, // seconds
          direction: step.maneuver.bearing_after || null,
          icon: getManeuverIcon(step.maneuver.type, step.maneuver.modifier),
          legIndex: legIdx,
        });
      });
    });

    // Add a "Arrive at destination" final step per leg
    route.legs.forEach((leg, legIdx) => {
      steps.push({
        instruction: `Arrive at ${leg.summary || "destination"}`,
        modifier: null,
        type: "arrive",
        distance: 0,
        duration: 0,
        icon: "arrive",
        legIndex: legIdx,
      });
    });

    return {
      routeGeoJson: route.geometry, // GeoJSON LineString for the map
      distance: route.distance, // meters
      duration: route.duration, // seconds
      legs: route.legs.map((leg) => ({
        summary: leg.summary,
        distance: leg.distance,
        duration: leg.duration,
      })),
      steps,
    };
  } catch (err) {
    console.error("Directions fetch failed:", err);
    return null;
  }
}

/**
 * Format meters to miles
 */
export function metersToMiles(m) {
  return (m * 0.000621371).toFixed(1);
}

/**
 * Format seconds to human-readable time
 */
export function secondsToTime(s) {
  const hours = Math.floor(s / 3600);
  const mins = Math.round((s % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins} min`;
}

/**
 * Format seconds to a short duration string (for cards)
 */
export function secondsToShort(s) {
  const hours = Math.floor(s / 3600);
  const mins = Math.round((s % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

/**
 * Get a Lucide icon name for the maneuver type
 */
function getManeuverIcon(type, modifier) {
  if (type === "arrive") return "arrive";
  if (type === "depart") return "depart";
  if (type === "roundabout" || type === "rotary") return "roundabout";
  if (type === "fork") return "fork";
  if (type === "merge") return "merge";
  if (type === "ramp") return "ramp";
  if (type === "off ramp") return "ramp";
  if (type === "end of road") return "turn";
  if (type === "continue") return "straight";
  if (type === "new name") return "straight";
  if (modifier === "straight") return "straight";
  if (modifier === "uturn") return "uturn";
  // Left/right turns
  if (modifier === "left" || modifier === "sharp left" || modifier === "slight left")
    return "arrow-left";
  if (modifier === "right" || modifier === "sharp right" || modifier === "slight right")
    return "arrow-right";
  return "straight";
}

/**
 * Build Google Maps navigation URL
 */
export function googleMapsUrl(lat, lng, address) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(address)}`;
}

/**
 * Build Apple Maps navigation URL
 */
export function appleMapsUrl(lat, lng) {
  return `https://maps.apple.com/?daddr=${lat},${lng}`;
}