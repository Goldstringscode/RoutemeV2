import React, { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { useRouteMe } from "@/context/RouteMeContext";

const TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
const ROUTE_SOURCE = "route-source";
const ROUTE_LAYER = "route-layer";
const ROUTE_GLOW = "route-glow";

/**
 * Stylized map: real Mapbox map with real route lines and SVG stop overlays.
 * 3D terrain via DEM source + hillshade added on load.
 */
export default function StylizedMap({ compact = false, onStopClick }) {
  const { schedule, routeGeoJson, routeDistance, routeDuration, nurse } = useRouteMe();
  const homeBase = nurse?.homeBase;
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [svgPositions, setSvgPositions] = useState([]);
    const updateTimer = useRef(null);

  // Project lat/lng to SVG pixel coordinates
  const updatePositions = useCallback(() => {
    const map = mapRef.current;
    if (!map || !schedule.length) return;

    const rect = mapContainer.current?.getBoundingClientRect();
    if (!rect) return;

    const positions = schedule.map((c, idx) => {
      if (c.lat && c.lng) {
        const point = map.project([c.lng, c.lat]);
        const svgX = (point.x / rect.width) * 1000;
        const svgY = (point.y / rect.height) * 600;
        return { x: svgX, y: svgY, id: c.id, label: String(idx + 1), name: c.fullName };
      }
      return {
        x: 150 + ((idx * 120) % 700),
        y: 260 + ((idx * 47) % 200),
        id: c.id,
        label: String(idx + 1),
        name: c.fullName,
      };
    });
    setSvgPositions(positions);
  }, [schedule]);

  // Debounced position update
  const scheduleUpdate = useCallback(() => {
    if (updateTimer.current) clearTimeout(updateTimer.current);
    updateTimer.current = setTimeout(updatePositions, 50);
  }, [updatePositions]);

  // SVG path connecting stops (fallback when no real route)
  const pathD = React.useMemo(() => {
    if (svgPositions.length < 2) return "";
    return svgPositions.reduce((acc, s, i, arr) => {
      if (i === 0) return `M ${s.x} ${s.y}`;
      const prev = arr[i - 1];
      const midX = (prev.x + s.x) / 2;
      const midY = (prev.y + s.y) / 2 - 30;
      return `${acc} Q ${midX} ${midY} ${s.x} ${s.y}`;
    }, "");
  }, [svgPositions]);

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
      style: "mapbox://styles/mapbox/light-v10",
      center: [centerLng, centerLat],
      zoom: compact ? 9.5 : 9,
      pitch: compact ? 0 : 55,
      interactive: !compact,
      attributionControl: false,
      logoPosition: "bottom-right",
    });

    // ── 3D terrain + hillshade ──
    let terrainEnabled = false;
    const enableTerrain = () => {
      if (terrainEnabled) return;
      try {
        console.log("[Terrain] Attempting to enable...");
        if (typeof map.setTerrain === "function") {
          map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
          console.log("[Terrain] setTerrain() called");
        } else {
          console.log("[Terrain] setTerrain not available");
        }
        if (!map.getLayer("rm-hillshade")) {
          const firstLayerId = map.getStyle().layers?.[0]?.id;
          map.addLayer({
            id: "rm-hillshade",
            type: "hillshade",
            source: "mapbox-dem",
            paint: {
              "hillshade-exaggeration": 0.6,
              "hillshade-shadow-color": "#1a1a2e",
              "hillshade-highlight-color": "#e8dcc8",
              "hillshade-illumination-anchor": "viewport",
            },
          }, firstLayerId);
          console.log("[Terrain] Hillshade layer added");
        }
        terrainEnabled = true;
        console.log("[Terrain] ✅ Active");
      } catch (e) {
        console.warn("[Terrain] ❌ Setup failed:", e);
      }
    };

    // Add DEM source and enable terrain on load
    map.on("load", () => {
      console.log("[Terrain] Load event fired");
      if (!map.getSource("mapbox-dem")) {
        map.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
        console.log("[Terrain] DEM source added");
      }
      enableTerrain();

      // ── Route layers ──
      if (!map.getSource(ROUTE_SOURCE)) {
        try {
          map.addSource(ROUTE_SOURCE, { type: "geojson", data: { type: "FeatureCollection", features: [] } });
          map.addLayer({ id: ROUTE_GLOW, type: "line", source: ROUTE_SOURCE, layout: { "line-join": "round", "line-cap": "round" }, paint: { "line-color": "#D95D39", "line-opacity": 0.2, "line-width": 12 } });
          map.addLayer({ id: ROUTE_LAYER, type: "line", source: ROUTE_SOURCE, layout: { "line-join": "round", "line-cap": "round" }, paint: { "line-color": "#D95D39", "line-width": 4, "line-opacity": 0.85 } });
        } catch (e) {}
      }

      // ── Sky atmosphere ──
      if (!map.getLayer("sky")) {
        try { map.addLayer({ id: "sky", type: "sky", paint: { "sky-type": "atmosphere" } }); } catch (e) {}
      }

      updatePositions();
    });

    // Fallback: try enabling terrain when DEM source data arrives
    map.on("sourcedata", (e) => {
      if (e.sourceId === "mapbox-dem" && !terrainEnabled) {
        console.log("[Terrain] sourcedata event:", e.sourceDataType);
        if (e.isSourceLoaded) {
          enableTerrain();
        }
      }
    });

    // Update positions on map move/zoom
    map.on("move", scheduleUpdate);
    map.on("resize", scheduleUpdate);

    mapRef.current = map;

    return () => {
      if (updateTimer.current) clearTimeout(updateTimer.current);
      map.remove();
      mapRef.current = null;
    };
  }, [compact]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update positions when schedule changes
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(updatePositions, 100);
    }
  }, [schedule, updatePositions]);

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

        // Fit map to route bounds — preserve pitch for terrain visibility
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
      const onStyle = () => {
        applyRoute();
        map.off("style.load", onStyle);
      };
      map.on("style.load", onStyle);
    }
  }, [routeGeoJson, compact]);

  return (
    <div
      data-testid="stylized-map"
      className={`relative overflow-hidden rounded-3xl border border-stone-200 bg-[#EFE9DF] ${
        compact ? "aspect-[16/9]" : "aspect-[16/10]"
      }`}
    >
      {/* Real Mapbox map as background */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Warm gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F9F8F6]/30 via-transparent to-[#D95D39]/5 pointer-events-none" />

      {/* SVG overlay — numbered stops, compass, legend */}
      <svg
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full pointer-events-none"
      >
        {/* Subtle grid roads — only shown when no real route */}
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

        {/* Fallback SVG route path — only when no real route */}
        {!routeGeoJson && svgPositions.length > 1 && (
          <>
            <path
              d={pathD}
              fill="none"
              stroke="#D95D39"
              strokeOpacity="0.15"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <path
              d={pathD}
              fill="none"
              stroke="#D95D39"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="rm-route-path"
            />
          </>
        )}

        {/* Home base marker — always visible when homeBase is set */}
        {homeBase && (
          (() => {
            const rect = mapContainer.current?.getBoundingClientRect();
            if (!rect) return null;
            const point = mapRef.current?.project([homeBase.lng, homeBase.lat]);
            if (!point) return null;
            const svgX = (point.x / rect.width) * 1000;
            const svgY = (point.y / rect.height) * 600;
            return (
              <g transform={`translate(${svgX} ${svgY})`} className="pointer-events-auto">
                <circle r="20" fill="#D95D39" stroke="#FFFFFF" strokeWidth="3" opacity="0.9" />
                <circle r="7" fill="#FFFFFF" opacity="0.9" />
                <text
                  x="0" y="28" textAnchor="middle" fill="#D95D39"
                  fontFamily="Manrope, sans-serif" fontWeight="700" fontSize="8" letterSpacing="0.5"
                >
                  HOME
                </text>
              </g>
            );
          })()
        )}

        {/* Stops — clickable */}
        {svgPositions.map((s) => (
          <g
            key={s.id}
            transform={`translate(${s.x} ${s.y})`}
            onClick={() => onStopClick?.(s.id)}
            style={{ cursor: onStopClick ? "pointer" : "default" }}
            className="pointer-events-auto"
          >
            <circle r="22" fill="#FFFFFF" stroke="#1C1C1C" strokeWidth="2" />
            <circle r="16" fill={s.label === "1" ? "#7FA08B" : "#D95D39"} />
            <text
              x="0"
              y="5"
              textAnchor="middle"
              fill="#FFFFFF"
              fontFamily="Outfit, sans-serif"
              fontWeight="600"
              fontSize="14"
            >
              {s.label}
            </text>
          </g>
        ))}

        {/* Start marker */}
        {svgPositions[0] && (
          <g
            transform={`translate(${svgPositions[0].x - 30} ${svgPositions[0].y - 34})`}
            className="pointer-events-auto"
          >
            <rect width="60" height="18" rx="9" fill="#1C1C1C" />
            <text
              x="30" y="12" textAnchor="middle" fill="#FFFFFF"
              fontFamily="Manrope, sans-serif" fontWeight="600" fontSize="9" letterSpacing="1"
            >
              START
            </text>
          </g>
        )}
      </svg>

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
            : `${svgPositions.length} stops`}
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
