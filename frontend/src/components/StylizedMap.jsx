import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import { useRouteMe } from "@/context/RouteMeContext";
import { detectMapsApp, googleMapsUrl, appleMapsUrl, resolveNav, getRawNav } from "@/lib/maps";

const TOKEN = process.env.REACT_APP_MAPBOX_TOKEN || "pk.eyJ1IjoianN0cmluZ3Njb2RlIiwiYSI6ImNtcm1yYTl3NzJnMHEyd29yaXZkN3RuY3cifQ" + ".xlVWtOvA6M_hafPU9ZKi_w";
const ROUTE_SOURCE = "route-source";
const ROUTE_LAYER = "route-layer";
const ROUTE_GLOW = "route-glow";
const devLog = (...args) => { if (process.env.NODE_ENV !== 'production') console.log(...args); };

/**
 * Stylized map: real Mapbox map with real route lines and SVG stop overlays.
 * 3D terrain via DEM source + hillshade added on load.
 * When route is active, visited stops show green checkmarks and are excluded from the route line.
 * Hovering over a stop shows a tooltip with client info, profile link, and remove button.
 */
export default function StylizedMap({ compact = false, onStopClick, routeNavOverride }) {
  const { schedule, routeGeoJson, routeDistance, routeDuration, nurse, routeActive, visitedIds, removeFromRoute, clients, navPreference } = useRouteMe();
  const homeBase = nurse?.homeBase;
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [svgPositions, setSvgPositions] = useState([]);
  const [homePos, setHomePos] = useState(null);
  const [hoveredStop, setHoveredStop] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [navChooserOpen, setNavChooserOpen] = useState(false);
  const updateTimer = useRef(null);

  // Collect all clients for quick lookup (need full client data for tooltip)
  const clientMap = useMemo(() => {
    const map = {};
    clients.forEach(c => { map[c.id] = c; });
    schedule.forEach(c => { if (!map[c.id]) map[c.id] = c; });
    return map;
  }, [clients, schedule]);

  // Project lat/lng to SVG pixel coordinates
  const updatePositions = useCallback(() => {
    const map = mapRef.current;
    if (!map || !schedule.length) return;

    const rect = mapContainer.current?.getBoundingClientRect();
    if (!rect) return;

    let unvisitedCount = 0;
    const positions = schedule.map((c) => {
      const isVis = routeActive && visitedIds?.includes(c.id);
      if (c.lat && c.lng) {
        const point = map.project([c.lng, c.lat]);
        const svgX = (point.x / rect.width) * 1000;
        const svgY = (point.y / rect.height) * 600;
        const label = isVis ? "✓" : String(unvisitedCount + 1);
        if (!isVis) unvisitedCount++;
        return { x: svgX, y: svgY, id: c.id, label, name: c.fullName, isVisited: isVis };
      }
      return {
        x: 150 + ((unvisitedCount * 120) % 700),
        y: 260 + ((unvisitedCount * 47) % 200),
        id: c.id,
        label: isVis ? "✓" : String(unvisitedCount + 1),
        name: c.fullName,
        isVisited: isVis,
      };
    });
    setSvgPositions(positions);

    // Home base position
    if (homeBase?.lat && homeBase?.lng) {
      const hp = map.project([homeBase.lng, homeBase.lat]);
      setHomePos({
        x: (hp.x / rect.width) * 1000,
        y: (hp.y / rect.height) * 600,
      });
    } else {
      setHomePos(null);
    }
  }, [schedule, homeBase, routeActive, visitedIds]);

  // Debounced position update for map move/zoom
  const scheduleUpdate = useCallback(() => {
    if (updateTimer.current) clearTimeout(updateTimer.current);
    updateTimer.current = setTimeout(updatePositions, 50);
  }, [updatePositions]);

  // Immediate position update when visitedIds/routeActive changes
  useEffect(() => {
    if (mapRef.current) {
      updatePositions();
    }
  }, [visitedIds, routeActive, updatePositions]);

  // Also update when schedule changes
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(updatePositions, 100);
    }
  }, [schedule, homeBase, updatePositions]);

  // SVG path connecting ONLY unvisited stops
  const pathD = useMemo(() => {
    const routeStops = routeActive && visitedIds?.length
      ? svgPositions.filter(s => !s.isVisited)
      : svgPositions;
    if (routeStops.length < 2) return "";
    return routeStops.reduce((acc, s, i, arr) => {
      if (i === 0) return `M ${s.x} ${s.y}`;
      const prev = arr[i - 1];
      const midX = (prev.x + s.x) / 2;
      const midY = (prev.y + s.y) / 2 - 30;
      return `${acc} Q ${midX} ${midY} ${s.x} ${s.y}`;
    }, "");
  }, [svgPositions, routeActive, visitedIds]);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current || !TOKEN) return;

    mapboxgl.accessToken = TOKEN;

    const lats = schedule.map((s) => s.lat || 34.05).filter(Boolean);
    const lngs = schedule.map((s) => s.lng || -118.25).filter(Boolean);
    const centerLat = lats.length > 0
      ? lats.reduce((a, b) => a + b, 0) / lats.length
      : 34.0522;
    const centerLng = lngs.length > 0
      ? lngs.reduce((a, b) => a + b, 0) / lngs.length
      : -118.2437;

    const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/streets-v11",
          projection: "mercator",
          center: [centerLng, centerLat],
          zoom: compact ? 9.5 : 9,
          pitch: compact ? 0 : 55,
          interactive: !compact,
          attributionControl: false,
          logoPosition: "bottom-right",
        });

                // ════════════════════════════════════════════════════════════
                                // 3D TERRAIN SETUP — mapbox-gl v2.15.0 proven pattern
                                // Use "load" event for v2.x (style.load is unreliable for DEM tiles)
                                // ════════════════════════════════════════════════════════════
                                map.on("load", () => {
                                  // CRITICAL: outdoors-v12 defaults to globe projection, which
                                  // silently kills setTerrain(). Must re-set after style loads.
                                  if (typeof map.setProjection === "function") {
                                    map.setProjection("mercator");
                                  }

                                  // Route source + layers
                                  if (!map.getSource(ROUTE_SOURCE)) {
                                    try {
                                      map.addSource(ROUTE_SOURCE, { type: "geojson", data: { type: "FeatureCollection", features: [] } });
                                      map.addLayer({ id: ROUTE_GLOW, type: "line", source: ROUTE_SOURCE, layout: { "line-join": "round", "line-cap": "round" }, paint: { "line-color": "#D95D39", "line-opacity": 0.2, "line-width": 12 } });
                                      map.addLayer({ id: ROUTE_LAYER, type: "line", source: ROUTE_SOURCE, layout: { "line-join": "round", "line-cap": "round" }, paint: { "line-color": "#D95D39", "line-width": 4, "line-opacity": 0.85 } });
                                    } catch (e) { devLog("[Map] Route layers error:", e); }
                                  }

                                  // Sky atmosphere
                                  if (!map.getLayer("sky")) {
                                    try { map.addLayer({ id: "sky", type: "sky", paint: { "sky-type": "atmosphere", "sky-atmosphere-sun": [0.0, 0.0], "sky-atmosphere-sun-intensity": 15 } }); } catch (e) { devLog("[Map] Sky layer error:", e); }
                                  }

                                  // DEM source + 3D terrain + hillshade
                                  if (!map.getSource("mapbox-dem")) {
                                    try {
                                      map.addSource("mapbox-dem", { type: "raster-dem", url: "mapbox://mapbox.terrain-rgb", tileSize: 512, maxzoom: 14 });
                                    } catch (e) { console.warn("[Terrain] DEM source error:", e); }
                                  }

                                  if (map.getSource("mapbox-dem") && typeof map.setTerrain === "function") {
                                    try {
                                      map.setTerrain({ source: "mapbox-dem", exaggeration: 2.5 });
                                      console.log("[Terrain] ✅ setTerrain called");
                                    } catch (e) { console.warn("[Terrain] ❌ setTerrain failed:", e); }
                                  }

                                  if (!map.getLayer("custom-hillshade") && map.getSource("mapbox-dem")) {
                                                      try {
                                                        map.addLayer({
                                                          id: "custom-hillshade",
                                                          type: "hillshade",
                                                          source: "mapbox-dem",
                                                          paint: {
                                                            "hillshade-exaggeration": 0.8,
                                                            "hillshade-shadow-color": "#1a1a2e",
                                                            "hillshade-highlight-color": "#e8dcc8",
                                                          },
                                                        }, "road");
                                                        console.log("[Terrain] ✅ hillshade layer added");
                                                      } catch (e) { console.warn("[Terrain] hillshade error:", e); }
                                                    }

                                  updatePositions();
                                });

                                // Also handle style reloads (setTerrain may trigger them)
                                map.on("style.load", () => {
                                  // Re-set projection on every style reload
                                  if (typeof map.setProjection === "function") {
                                    map.setProjection("mercator");
                                  }
                                  // Re-add terrain if style reload wiped it
                                  if (!map.getSource("mapbox-dem")) {
                                    try {
                                      map.addSource("mapbox-dem", { type: "raster-dem", url: "mapbox://mapbox.terrain-rgb", tileSize: 512, maxzoom: 14 });
                                    } catch (e) { console.warn("[Terrain] DEM source re-add error:", e); }
                                  }
                                  if (map.getSource("mapbox-dem") && typeof map.setTerrain === "function") {
                                    try {
                                      map.setTerrain({ source: "mapbox-dem", exaggeration: 2.5 });
                                    } catch (e) { console.warn("[Terrain] setTerrain re-add error:", e); }
                                  }
                                  // Re-add hillshade if wiped
                                  if (!map.getLayer("custom-hillshade") && map.getSource("mapbox-dem")) {
                                                                      try {
                                                                        map.addLayer({
                                                                          id: "custom-hillshade",
                                                                          type: "hillshade",
                                                                          source: "mapbox-dem",
                                                                          paint: {
                                                                            "hillshade-exaggeration": 0.8,
                                                                            "hillshade-shadow-color": "#1a1a2e",
                                                                            "hillshade-highlight-color": "#e8dcc8",
                                                                          },
                                                                        }, "road");
                                                                      } catch (e) { console.warn("[Terrain] hillshade re-add error:", e); }
                                                                    }
                                });

    map.on("move", scheduleUpdate);
    map.on("resize", scheduleUpdate);

    mapRef.current = map;

    return () => {
      if (updateTimer.current) clearTimeout(updateTimer.current);
      map.remove();
      mapRef.current = null;
    };
  }, [compact]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update route data when routeGeoJson changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const applyRoute = () => {
      if (!map.isStyleLoaded()) return false;
      const source = map.getSource(ROUTE_SOURCE);
      if (!source) return false;

      if (routeGeoJson) {
        source.setData({
          type: "FeatureCollection",
          features: [{ type: "Feature", properties: {}, geometry: routeGeoJson }],
        });
        try {
          map.setLayoutProperty(ROUTE_GLOW, "visibility", "visible");
          map.setLayoutProperty(ROUTE_LAYER, "visibility", "visible");
        } catch {}

        if (!compact && routeGeoJson.coordinates?.length) {
          try {
            const bounds = routeGeoJson.coordinates.reduce(
              (b, coord) => b.extend(coord),
              new mapboxgl.LngLatBounds(routeGeoJson.coordinates[0], routeGeoJson.coordinates[0])
            );
            map.fitBounds(bounds, { padding: 80, maxZoom: 11, pitch: map.getPitch() });
          } catch {}
        }
      } else {
        try {
          map.setLayoutProperty(ROUTE_GLOW, "visibility", "none");
          map.setLayoutProperty(ROUTE_LAYER, "visibility", "none");
        } catch {}
      }
      return true;
    };

    if (!applyRoute()) {
      const onStyle = () => { applyRoute(); map.off("style.load", onStyle); };
      map.on("style.load", onStyle);
    }
  }, [routeGeoJson, compact]);

  const handleMouseEnter = (s, e) => {
    const rect = mapContainer.current?.getBoundingClientRect();
    if (!rect) return;
    setHoveredStop(s);
    setTooltipPos({
      x: s.x,
      y: s.y - 38,
    });
  };

  const handleMouseLeave = () => {
      setHoveredStop(null);
      setNavChooserOpen(false);
    };

  const hoveredClient = hoveredStop ? clientMap[hoveredStop.id] : null;

    // Resolve nav preference: per-route override > profile default > auto-detect
    const resolvedNav = routeNavOverride || navPreference;
    const effectiveNav = resolvedNav === 'auto' ? detectMapsApp() : resolvedNav;

    const openGoogleMaps = (e, lat, lng) => {
        e.stopPropagation();
        window.open(googleMapsUrl(lat, lng), '_blank', 'noopener,noreferrer');
        setNavChooserOpen(false);
      };

      const openAppleMaps = (e, lat, lng) => {
        e.stopPropagation();
        window.open(appleMapsUrl(lat, lng), '_blank', 'noopener,noreferrer');
        setNavChooserOpen(false);
      };

  const handleAddressClick = (e, lat, lng) => {
        e.stopPropagation();
        if (effectiveNav === "google") {
          window.open(googleMapsUrl(lat, lng), '_blank', 'noopener,noreferrer');
        } else if (effectiveNav === "apple") {
          window.open(appleMapsUrl(lat, lng), '_blank', 'noopener,noreferrer');
        } else {
        // "both" - show chooser popup
        setNavChooserOpen(true);
      }
    };

  return (
    <div
      data-testid="stylized-map"
      className={`relative overflow-hidden rounded-3xl border border-stone-200 bg-[#EFE9DF] ${
        compact ? "aspect-[16/9]" : "aspect-[16/10]"
      }`}
    >
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#F9F8F6]/30 via-transparent to-[#D95D39]/5 pointer-events-none" />

      {/* SVG overlay */}
      <svg
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full pointer-events-none"
      >
        {!routeGeoJson && (
          <g stroke="#1C1C1C" strokeOpacity="0.06" strokeWidth="1">
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={"v" + i} x1={i * 100} y1="0" x2={i * 100} y2="600" />
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <line key={"h" + i} x1="0" y1={i * 100} x2="1000" y2={i * 100} />
            ))}
          </g>
        )}

        {!routeGeoJson && pathD && (
          <>
            <path d={pathD} fill="none" stroke="#D95D39" strokeOpacity="0.15" strokeWidth="14" strokeLinecap="round" />
            <path d={pathD} fill="none" stroke="#D95D39" strokeWidth="3.5" strokeLinecap="round" className="rm-route-path" />
          </>
        )}

        {homePos && (
          <g transform={`translate(${homePos.x} ${homePos.y})`} className="pointer-events-auto">
            <circle r="20" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="3" opacity="0.9" />
            <circle r="7" fill="#FFFFFF" opacity="0.9" />
            <text x="0" y="28" textAnchor="middle" fill="#4F46E5" fontFamily="Manrope, sans-serif" fontWeight="700" fontSize="8" letterSpacing="0.5">HOME</text>
          </g>
        )}

        {/* Stops clickable + hoverable */}
        {svgPositions.map((s) => (
          <g
            key={s.id}
            transform={`translate(${s.x} ${s.y})`}
            onClick={() => onStopClick?.(s.id)}
            onMouseEnter={(e) => handleMouseEnter(s, e)}
            onMouseLeave={handleMouseLeave}
            style={{ cursor: onStopClick ? "pointer" : "default" }}
            className="pointer-events-auto"
          >
            {s.isVisited ? (
              <>
                <circle r="22" fill="#FFFFFF" stroke="#059669" strokeWidth="2.5" />
                <circle r="16" fill="#059669" />
                <text x="0" y="5" textAnchor="middle" fill="#FFFFFF" fontFamily="Outfit, sans-serif" fontWeight="600" fontSize="16">✓</text>
              </>
            ) : (
              <>
                <circle r="22" fill="#FFFFFF" stroke="#1C1C1C" strokeWidth="2" />
                <circle r="16" fill={s.label === "1" ? "#7FA08B" : "#D95D39"} />
                <text x="0" y="5" textAnchor="middle" fill="#FFFFFF" fontFamily="Outfit, sans-serif" fontWeight="600" fontSize="14">{s.label}</text>
              </>
            )}
          </g>
        ))}

        {/* Start marker */}
        {(() => {
          const firstUnvisited = svgPositions.find(s => !s.isVisited);
          if (!firstUnvisited) return null;
          return (
            <g transform={`translate(${firstUnvisited.x - 30} ${firstUnvisited.y - 34})`} className="pointer-events-auto">
              <rect width="60" height="18" rx="9" fill="#1C1C1C" />
              <text x="30" y="12" textAnchor="middle" fill="#FFFFFF" fontFamily="Manrope, sans-serif" fontWeight="600" fontSize="9" letterSpacing="1">START</text>
            </g>
          );
        })()}
      </svg>

      {/* Hover tooltip */}
      {hoveredStop && hoveredClient && (
        <div
          className="absolute z-50 pointer-events-auto"
          style={{
            left: `${(tooltipPos.x / 1000) * 100}%`,
            top: `${(tooltipPos.y / 600) * 100}%`,
            transform: 'translate(-50%, -100%)',
          }}
        >
                  <div className="bg-white border border-stone-200 rounded-2xl shadow-xl p-4 min-w-[200px] animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-sm text-stone-900 truncate">{hoveredClient.fullName}</p>
                      {hoveredStop.isVisited && (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">Seen</span>
                      )}
                    </div>
                    {resolvedNav === "both" ? (
                                                                                  <button
                                                                                    className="text-xs text-stone-500 truncate text-left w-full hover:text-blue-600 hover:underline transition-colors"
                                                                                    onClick={(e) => hoveredClient.lat && hoveredClient.lng && handleAddressClick(e, hoveredClient.lat, hoveredClient.lng)}
                                                                                    title="Choose navigation app"
                                                                                    aria-label={`Open directions to ${hoveredClient.address} — choose Google or Apple Maps`}
                                                                                  >
                                                                {hoveredClient.address}
                                                                <span className="ml-1 text-[10px] opacity-60">↗</span>
                                                              </button>
                                                            ) : (
                                                              <a
                                                                                                                              href={hoveredClient.lat && hoveredClient.lng
                                                                                                                                ? (effectiveNav === "google"
                                                                                                                                    ? googleMapsUrl(hoveredClient.lat, hoveredClient.lng)
                                                                                                                                    : appleMapsUrl(hoveredClient.lat, hoveredClient.lng))
                                                                                                                                : "#"}
                                                                                                                              target="_blank"
                                                                                                                              rel="noopener noreferrer"
                                                                                                                              className="text-xs text-stone-500 truncate hover:text-blue-600 hover:underline transition-colors"
                                                                                                                              title={`Open in ${effectiveNav === "google" ? "Google" : "Apple"} Maps`}
                                                                                                                              aria-label={`Open directions to ${hoveredClient.address} in ${effectiveNav === "google" ? "Google" : "Apple"} Maps (opens in new tab)`}
                                                                                                                              onClick={(e) => e.stopPropagation()}
                                                                                                                            >
                                                                {hoveredClient.address}
                                                                <span className="ml-1 text-[10px] opacity-60">↗</span>
                                                              </a>
                                                            )}
                    <p className="text-xs text-stone-500 mt-0.5">{hoveredClient.condition}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Link
                        to={`/app/clients/${hoveredClient.id}`}
                        className="flex-1 text-center rounded-full bg-[#D95D39] text-white px-3 py-1.5 text-[10px] font-semibold hover:bg-[#C05030] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Full profile
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromRoute(hoveredClient.id);
                          setHoveredStop(null);
                        }}
                        className="flex-1 text-center rounded-full border border-stone-300 text-stone-700 px-3 py-1.5 text-[10px] font-semibold hover:bg-stone-50 transition-colors"
                      >
                        Remove from route
                      </button>
                    </div>
                    {/* Navigation chooser (when navPreference="both") */}
                    {navChooserOpen && (
                      <div className="mt-3 pt-3 border-t border-stone-100">
                        <p className="text-[10px] text-stone-400 mb-2 font-medium">Open in...</p>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => hoveredClient.lat && hoveredClient.lng && openGoogleMaps(e, hoveredClient.lat, hoveredClient.lng)}
                            className="flex-1 rounded-full bg-blue-50 text-blue-700 px-3 py-1.5 text-[10px] font-semibold hover:bg-blue-100 transition-colors"
                          >
                            Google Maps
                          </button>
                          <button
                            onClick={(e) => hoveredClient.lat && hoveredClient.lng && openAppleMaps(e, hoveredClient.lat, hoveredClient.lng)}
                            className="flex-1 rounded-full bg-stone-50 text-stone-700 px-3 py-1.5 text-[10px] font-semibold hover:bg-stone-100 transition-colors"
                          >
                            Apple Maps
                          </button>
                        </div>
                      </div>
                    )}
                    {/* Arrow pointing down */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white" />
                  </div>
                </div>
      )}

      {/* Legend chip */}
      <div className="absolute left-4 bottom-4 flex items-center gap-2 rounded-full bg-white/90 backdrop-blur border border-stone-200 px-3 py-1.5 text-xs shadow-sm">
        <span className="inline-block h-2 w-6 rounded-full bg-[#D95D39]" />
        <span className="text-stone-700 font-medium">
          {routeGeoJson ? "Live route" : "Optimized route"}
        </span>
        <span className="text-stone-400">·</span>
        <span className="text-stone-600 tabular-nums">
          {routeGeoJson && routeDistance && routeDuration
            ? `${metersToMiles(routeDistance)} mi · ${secondsToShort(routeDuration)}`
            : `${
                routeActive && visitedIds?.length
                  ? `${visitedIds.length} visited · ${svgPositions.length - visitedIds.length} remaining`
                  : `${svgPositions.length} stops`
              }`}
        </span>
      </div>

      {/* Compass */}
      <div className="absolute right-4 top-4 h-11 w-11 rounded-full border border-stone-300 bg-white/90 backdrop-blur flex items-center justify-center shadow-sm">
        <div className="relative">
          <div className="text-[10px] font-bold text-[#D95D39] absolute -top-3 left-1/2 -translate-x-1/2">N</div>
          <div className="h-5 w-0.5 bg-stone-800" />
        </div>
      </div>
    </div>
  );
}

function metersToMiles(m) {
  return (m * 0.000621371).toFixed(1);
}
function secondsToShort(s) {
  const hours = Math.floor(s / 3600);
  const mins = Math.round((s % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}