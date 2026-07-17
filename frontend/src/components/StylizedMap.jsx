import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { MAP_STOPS } from "@/lib/mockData";
import { useRouteMe } from "@/context/RouteMeContext";

const TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

/**
 * Stylized illustrated map: real Mapbox map as background with
 * hand-drawn SVG overlays (numbered stops, dashed route, compass, legend).
 */
export default function StylizedMap({ compact = false, onStopClick }) {
  const { schedule } = useRouteMe();
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  // Get positions in schedule order
  const stopMap = Object.fromEntries(MAP_STOPS.map((s) => [s.id, s]));
  const orderedStops = schedule
    .map((c, idx) => {
      const pos = stopMap[c.id] || {
        x: 150 + ((idx * 120) % 700),
        y: 260 + ((idx * 47) % 200),
        lat: 34.05 + (idx * 0.02),
        lng: -118.3 - (idx * 0.03),
      };
      return { ...pos, id: c.id, label: String(idx + 1), name: c.fullName };
    });

  // SVG path connecting stops with smooth curves
  const pathD = orderedStops.reduce((acc, s, i, arr) => {
    if (i === 0) return `M ${s.x} ${s.y}`;
    const prev = arr[i - 1];
    const midX = (prev.x + s.x) / 2;
    const midY = (prev.y + s.y) / 2 - 30;
    return `${acc} Q ${midX} ${midY} ${s.x} ${s.y}`;
  }, "");

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current || !TOKEN) return;

    mapboxgl.accessToken = TOKEN;

    // Compute center from all stops
    const lats = orderedStops.map((s) => s.lat);
    const lngs = orderedStops.map((s) => s.lng);
    const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [centerLng, centerLat],
      zoom: compact ? 9.5 : 9,
      interactive: !compact,
      attributionControl: false,
      logoPosition: "bottom-right",
    });

    map.on("load", () => {
      // Hide labels for a cleaner stylized look
      map.setLayoutProperty("country-label", "visibility", "none");
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [compact]);

  return (
    <div
      data-testid="stylized-map"
      className={`relative overflow-hidden rounded-3xl border border-stone-200 bg-[#EFE9DF] ${
        compact ? "aspect-[16/9]" : "aspect-[16/10]"
      }`}
    >
      {/* Real Mapbox map as background */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Warm gradient overlay to match the stylized aesthetic */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F9F8F6]/30 via-transparent to-[#D95D39]/5 pointer-events-none" />

      {/* SVG overlay — identical styling, unchanged layout */}
      <svg
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        {/* subtle grid roads */}
        <g stroke="#1C1C1C" strokeOpacity="0.06" strokeWidth="1">
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={"v" + i} x1={i * 100} y1="0" x2={i * 100} y2="600" />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={"h" + i} x1="0" y1={i * 100} x2="1000" y2={i * 100} />
          ))}
        </g>

        {/* Route path */}
        {orderedStops.length > 1 && (
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

        {/* Stops */}
        {orderedStops.map((s, i) => (
          <g
            key={s.id}
            transform={`translate(${s.x} ${s.y})`}
            onClick={() => onStopClick?.(s.id)}
            style={{ cursor: onStopClick ? "pointer" : "default" }}
          >
            <circle r="22" fill="#FFFFFF" stroke="#1C1C1C" strokeWidth="2" />
            <circle r="16" fill={i === 0 ? "#7FA08B" : "#D95D39"} />
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

        {/* Start marker label */}
        {orderedStops[0] && (
          <g transform={`translate(${orderedStops[0].x - 30} ${orderedStops[0].y - 34})`}>
            <rect width="60" height="18" rx="9" fill="#1C1C1C" />
            <text
              x="30"
              y="12"
              textAnchor="middle"
              fill="#FFFFFF"
              fontFamily="Manrope, sans-serif"
              fontWeight="600"
              fontSize="9"
              letterSpacing="1"
            >
              START
            </text>
          </g>
        )}
      </svg>

      {/* Legend chip */}
      <div className="absolute left-4 bottom-4 flex items-center gap-2 rounded-full bg-white/90 backdrop-blur border border-stone-200 px-3 py-1.5 text-xs">
        <span className="inline-block h-2 w-6 rounded-full bg-[#D95D39]" />
        <span className="text-stone-700 font-medium">Optimized route</span>
        <span className="text-stone-400">·</span>
        <span className="text-stone-600 tabular-nums">
          {orderedStops.length} stops
        </span>
      </div>

      {/* Compass */}
      <div className="absolute right-4 top-4 h-11 w-11 rounded-full border border-stone-300 bg-white/90 backdrop-blur flex items-center justify-center">
        <div className="relative">
          <div className="text-[10px] font-bold text-[#D95D39] absolute -top-3 left-1/2 -translate-x-1/2">N</div>
          <div className="h-5 w-0.5 bg-stone-800" />
        </div>
      </div>
    </div>
  );
}
