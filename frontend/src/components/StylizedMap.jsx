import React, { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { useRouteMe } from "@/context/RouteMeContext";

const TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
const ROUTE_SOURCE = "route-source";
const ROUTE_LAYER = "route-layer";
const ROUTE_GLOW = "route-glow";

/** Project a pixel point to SVG viewBox coords (1000×600, xMidYMid slice) */
function pixelToSvg(px, py, cw, ch) {
  const svgW = 1000, svgH = 600;
  const scale = Math.max(cw / svgW, ch / svgH);
  const ox = (cw - svgW * scale) / 2;
  const oy = (ch - svgH * scale) / 2;
  return { x: (px - ox) / scale, y: (py - oy) / scale };
}

/**
 * Stylized map: real Mapbox map behind real route lines + SVG stop overlays.
 * Uses streets-v12 for clear road networks and city labels.
 * 3D terrain for subtle elevation context without obscuring labels.
 */
export default function StylizedMap({ compact = false, onStopClick }) {
  const { schedule, routeGeoJson, routeDistance, routeDuration } = useRouteMe();
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [svgPositions, setSvgPositions] = useState([]);

  // Use refs so the map event listeners always call the latest version
  const scheduleRef = useRef(schedule);
  scheduleRef.current = schedule;

  const projectPositions = useCallback(() => {
    const map = mapRef.current;
    const sched = scheduleRef.current;
    if (!map || !sched.length) return;

    const rect = mapContainer.current?.getBoundingClientRect();
    if (!rect || !rect.width || !rect.height) return;

    const positions = sched.map((c, idx) => {
      if (c.lat && c.lng) {
        const pt = map.project([c.lng, c.lat]);
        const svg = pixelToSvg(pt.x, pt.y, rect.width, rect.height);
        return { x: svg.x, y: svg.y, id: c.id, label: String(idx + 1), name: c.fullName };
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
  }, []);

  // Keep a ref to projectPositions so it can be called from event listeners
  const projectRef = useRef(projectPositions);
  projectRef.current = projectPositions;

  // SVG fallback path
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
      style: "mapbox://styles/mapbox/streets-v12",
      center: [centerLng, centerLat],
      zoom: compact ? 9.5 : 9,
      interactive: !compact,
      attributionControl: false,
      logoPosition: "bottom-right",
    });

    map.on("load", () => {
          // ── 1. Route layers ──
          try {
            map.addSource(ROUTE_SOURCE, {
              type: "geojson",
              data: { type: "FeatureCollection", features: [] },
            });
            map.addLayer({
              id: ROUTE_GLOW, type: "line", source: ROUTE_SOURCE,
              layout: { "line-join": "round", "line-cap": "round" },
              paint: { "line-color": "#D95D39", "line-opacity": 0.2, "line-width": 12 },
            });
            map.addLayer({
              id: ROUTE_LAYER, type: "line", source: ROUTE_SOURCE,
              layout: { "line-join": "round", "line-cap": "round" },
              paint: { "line-color": "#D95D39", "line-width": 4, "line-opacity": 0.85 },
            });
          } catch (e) {
            console.warn("Map layers setup failed:", e);
          }

      // Project stops after map loads
      projectRef.current();
    });

    // On move/resize, project stops via ref (always latest callback)
    const onMove = () => projectRef.current();
    map.on("move", onMove);
    map.on("resize", onMove);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [compact, schedule]);

  // Re-project when schedule order/size changes (but map already exists)
  useEffect(() => {
    if (mapRef.current) {
      projectRef.current();
    }
  }, [schedule.length, schedule.map(s => s.id).join(",")]);

  // Apply routeGeoJson to the map
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    function apply() {
      if (!map.isStyleLoaded()) return false;
      const source = map.getSource(ROUTE_SOURCE);
      if (!source) return false;

      if (routeGeoJson) {
        source.setData({
          type: "FeatureCollection",
          features: [{ type: "Feature", properties: {}, geometry: routeGeoJson }],
        });
        try { map.setLayoutProperty(ROUTE_GLOW, "visibility", "visible"); } catch {}
        try { map.setLayoutProperty(ROUTE_LAYER, "visibility", "visible"); } catch {}

        if (!compact && routeGeoJson.coordinates?.length) {
          try {
            const bounds = routeGeoJson.coordinates.reduce(
              (b, coord) => b.extend(coord),
              new mapboxgl.LngLatBounds(routeGeoJson.coordinates[0], routeGeoJson.coordinates[0])
            );
            map.fitBounds(bounds, { padding: 80, maxZoom: 11 });
          } catch {}
        }
      } else {
        try { map.setLayoutProperty(ROUTE_GLOW, "visibility", "none"); } catch {}
        try { map.setLayoutProperty(ROUTE_LAYER, "visibility", "none"); } catch {}
      }
      return true;
    }

    if (!apply()) {
      const onStyle = () => { apply(); map.off("style.load", onStyle); };
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
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#F9F8F6]/30 via-transparent to-[#D95D39]/5 pointer-events-none" />

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

        {!routeGeoJson && svgPositions.length > 1 && (
          <>
            <path d={pathD} fill="none" stroke="#D95D39" strokeOpacity="0.15" strokeWidth="14" strokeLinecap="round" />
            <path d={pathD} fill="none" stroke="#D95D39" strokeWidth="3.5" strokeLinecap="round" className="rm-route-path" />
          </>
        )}

        {svgPositions.map((s, i) => (
          <g
            key={s.id}
            transform={`translate(${s.x} ${s.y})`}
            onClick={() => onStopClick?.(s.id)}
            style={{ cursor: onStopClick ? "pointer" : "default" }}
            className="pointer-events-auto"
          >
            <circle r="22" fill="#FFFFFF" stroke="#1C1C1C" strokeWidth="2" />
            <circle r="16" fill={i === 0 ? "#7FA08B" : "#D95D39"} />
            <text x="0" y="5" textAnchor="middle" fill="#FFFFFF" fontFamily="Outfit, sans-serif" fontWeight="600" fontSize="14">{s.label}</text>
          </g>
        ))}

        {svgPositions[0] && (
          <g transform={`translate(${svgPositions[0].x - 30} ${svgPositions[0].y - 34})`} className="pointer-events-auto">
            <rect width="60" height="18" rx="9" fill="#1C1C1C" />
            <text x="30" y="12" textAnchor="middle" fill="#FFFFFF" fontFamily="Manrope, sans-serif" fontWeight="600" fontSize="9" letterSpacing="1">START</text>
          </g>
        )}
      </svg>

      <div className="absolute left-4 bottom-4 flex items-center gap-2 rounded-full bg-white/90 backdrop-blur border border-stone-200 px-3 py-1.5 text-xs shadow-sm">
        <span className="inline-block h-2 w-6 rounded-full bg-[#D95D39]" />
        <span className="text-stone-700 font-medium">{routeGeoJson ? "Live route" : "Optimized route"}</span>
        <span className="text-stone-400">·</span>
        <span className="text-stone-600 tabular-nums">
          {routeGeoJson && routeDistance && routeDuration
            ? `${metersToMiles(routeDistance)} mi · ${secondsToShort(routeDuration)}`
            : `${svgPositions.length} stops`}
        </span>
      </div>

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
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}