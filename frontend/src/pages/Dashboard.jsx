import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Clock, Fuel, Route, ArrowUpRight, Phone, ShieldCheck, Mic, TrendingUp, Coffee, Users, FileText } from "lucide-react";
import { useRouteMe } from "@/context/RouteMeContext";
import StylizedMap from "@/components/StylizedMap";
import { MAP_STOPS } from "@/lib/mockData";

/** Haversine distance between two lat/lng pairs in miles */
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

/** Compute route analytics from the actual schedule stops */
function computeAnalytics(schedule, stopMap) {
  if (schedule.length < 2) return null;

  const ordered = schedule.map((c) => stopMap[c.id]).filter(Boolean);
  if (ordered.length < 2) return null;

  // Distance in miles between each consecutive pair of stops
  const legs = [];
  for (let i = 0; i < ordered.length - 1; i++) {
    legs.push(haversine(ordered[i].lat, ordered[i].lng, ordered[i + 1].lat, ordered[i + 1].lng));
  }

  const totalMiles = legs.reduce((s, d) => s + d, 0);
  const avgMph = 35; // conservative urban driving speed
  const driveMinutes = (totalMiles / avgMph) * 60;

  // Estimated "saved" vs naive ordering (sort by lat or lng — a rough baseline)
  const naive = [...ordered].sort((a, b) => a.lat - b.lat);
  const naiveLegs = [];
  for (let i = 0; i < naive.length - 1; i++) {
    naiveLegs.push(haversine(naive[i].lat, naive[i].lng, naive[i + 1].lat, naive[i + 1].lng));
  }
  const naiveMiles = naiveLegs.reduce((s, d) => s + d, 0);
  const savedMiles = Math.max(0, naiveMiles - totalMiles);
  const savedMinutes = Math.round((savedMiles / avgMph) * 60);

  return {
    totalMiles,
    driveMinutes,
    savedMiles: Math.round(savedMiles * 10) / 10,
    savedMinutes,
    legs, // per-leg distances
  };
}

/** Build an SVG sparkline path from a series of values */
function sparklinePath(values, width = 300, height = 80) {
  if (!values || values.length === 0) return "";
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1 || 1);
  return values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height - 12) - 6;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

/** Build an SVG fill area path under the sparkline */
function sparklineArea(values, width = 300, height = 80) {
  if (!values || values.length === 0) return "";
  const line = sparklinePath(values, width, height);
  const last = values.length - 1;
  const stepX = width / (last || 1);
  const lastX = last * stepX;
  return `${line} L ${lastX.toFixed(1)} ${height} L 0 ${height} Z`;
}

export default function Dashboard() {
  const { nurse, schedule, audit, openVoice } = useRouteMe();
  const next = schedule[0];
  const totalMinutes = schedule.reduce((s, c) => s + (c.duration || 30), 0);
  const totalHours = Math.floor(totalMinutes / 60);

  const stopMap = useMemo(() => Object.fromEntries(MAP_STOPS.map((s) => [s.id, s])), []);
  const analytics = useMemo(() => computeAnalytics(schedule, stopMap), [schedule, stopMap]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">
            Today · Zone {nurse.region.split("Zone ")[1] ?? "3"}
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">
            Good morning, <span className="font-serif-i text-[#D95D39]">{nurse.name.split(" ")[0]}</span>.
          </h1>
          <p className="mt-2 text-stone-600">
            {schedule.length > 0
              ? `${schedule.length} visits planned · route optimized 2 min ago.`
              : "No visits scheduled for today."}
          </p>
        </div>
        {schedule.length > 0 && (
          <Link
            to="/app/route"
            data-testid="start-route-btn"
            className="inline-flex items-center gap-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white px-5 py-3 text-sm font-semibold transition-colors self-start"
          >
            Start route <ArrowUpRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
        {/* Next visit — or empty state */}
        {schedule.length > 0 ? (
          <div className="md:col-span-5 rounded-3xl border border-stone-200 bg-white p-6 rm-lift">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">
                  Next visit · in ~14 min
                </p>
                <h2 className="font-display text-3xl mt-2">{next.fullName}</h2>
                <p className="text-sm text-stone-600 mt-1">{next.condition}</p>
              </div>
              <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-1 rounded-full bg-[#F7E5DD] text-[#D95D39]">
                {next.priority} priority
              </span>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <MiniStat icon={Clock} label="Window" value={next.window} />
              <MiniStat icon={Route} label="Duration" value={`${next.duration} min`} />
              <MiniStat icon={Phone} label="Contact" value={next.phone} />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {next.flags.map((f) => (
                <span
                  key={f}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#E3ECE5] text-emerald-900 border border-emerald-100"
                >
                  {f}
                </span>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => openVoice(next.id)}
                data-testid="dashboard-voice-btn"
                className="inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-4 py-2.5 text-sm font-semibold transition-colors"
              >
                <Mic className="h-4 w-4" /> Start visit note
              </button>
              <Link
                to="/app/clients"
                className="text-sm font-semibold text-stone-700 underline underline-offset-4 decoration-stone-300 hover:decoration-stone-800"
              >
                View chart
              </Link>
            </div>
          </div>
        ) : (
          <div className="md:col-span-5 rounded-3xl border border-stone-200 bg-white p-8 rm-lift flex flex-col items-center justify-center text-center min-h-[200px]">
            <div className="h-14 w-14 rounded-2xl bg-[#F9F8F6] border border-stone-200 flex items-center justify-center mb-4">
              <Users className="h-7 w-7 text-stone-400" />
            </div>
            <h3 className="font-display text-xl">No visits today</h3>
            <p className="text-sm text-stone-500 mt-1 max-w-sm">
              Your day is clear. Add clients to your roster and schedule their visits to get started.
            </p>
            <Link
              to="/app/clients"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-5 py-2.5 text-sm font-semibold transition-colors"
            >
              <Users className="h-4 w-4" /> Add clients
            </Link>
          </div>
        )}

        {/* Weekly time saved — computed from real schedule data */}
        <div className="md:col-span-3 rounded-3xl border border-stone-200 bg-stone-900 text-white p-6 relative overflow-hidden rm-lift">
          <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-[#D95D39]/40 blur-3xl" />
          <p className="relative text-xs uppercase tracking-[0.22em] text-white/60 font-semibold">
            {analytics ? "Route distance" : "Weekly activity"}
          </p>
          <div className="relative mt-3 flex items-end gap-2">
            {analytics ? (
              <>
                <span className="font-display text-6xl leading-none">{analytics.totalMiles.toFixed(0)}</span>
                <span className="font-display text-3xl text-white/60">mi</span>
              </>
            ) : (
              <span className="font-display text-3xl text-white/60">No route</span>
            )}
          </div>
          <p className="relative text-sm text-white/70 mt-3">
            {analytics ? (
              <>
                <Clock className="inline h-4 w-4 mr-1" /> ~{Math.floor(analytics.driveMinutes / 60)}h {Math.round(analytics.driveMinutes % 60)}m drive time
              </>
            ) : (
              "Add visits to see route analytics"
            )}
          </p>
          <div className="relative mt-5 flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {analytics ? `${schedule.length} stops routed` : "0 stops"}
          </div>
        </div>

        {/* Map */}
        <div className="md:col-span-5 rounded-3xl border border-stone-200 bg-white p-4 rm-lift">
          <StylizedMap compact />
          <div className="flex items-center justify-between px-2 pt-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">
                Today&apos;s route
              </p>
              <p className="font-display text-xl mt-1">
                {schedule.length > 0
                  ? `${schedule.length} stops · ${totalHours}h ${totalMinutes % 60}m of care`
                  : "No route to plan today"}
              </p>
            </div>
            {schedule.length > 0 && (
              <Link
                to="/app/route"
                className="text-sm font-semibold text-[#D95D39] hover:underline underline-offset-4"
              >
                Open route →
              </Link>
            )}
          </div>
        </div>

        {/* Fatigue reminder */}
        <div className="md:col-span-3 rounded-3xl border border-stone-200 bg-[#EFE9DF] p-6 rm-lift relative overflow-hidden">
          <Coffee className="h-6 w-6 text-[#D95D39]" strokeWidth={1.8} />
          <p className="mt-4 text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">
            Care-for-yourself
          </p>
          <h3 className="font-display text-2xl mt-2 leading-tight">
            Break suggested after stop 3 <span className="font-serif-i text-[#7FA08B]">— 12 min.</span>
          </h3>
          <p className="mt-3 text-sm text-stone-600">
            Coffee at Sagebrush Cafe · 4 min detour. Because tired driving is unsafe driving.
          </p>
        </div>

        {/* Audit trail */}
        <div className="md:col-span-4 rounded-3xl border border-stone-200 bg-white p-6 rm-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">
                HIPAA audit trail
              </p>
              <h3 className="font-display text-2xl mt-1">Every touch, logged.</h3>
            </div>
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
          </div>
          {audit.length > 0 ? (
            <ul className="mt-5 divide-y divide-stone-200">
              {audit.slice(0, 6).map((a, i) => (
                <li key={i} className="py-2.5 flex items-center gap-3 text-sm">
                  <span className="tabular-nums text-xs text-stone-500 w-14">{a.t}</span>
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      a.type === "read"
                        ? "bg-emerald-500"
                        : a.type === "write"
                          ? "bg-[#D95D39]"
                          : a.type === "note"
                            ? "bg-stone-800"
                            : "bg-amber-500"
                    }`}
                  />
                  <span className="text-stone-700">{a.label}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-5 flex flex-col items-center text-center py-6">
              <FileText className="h-8 w-8 text-stone-300 mb-2" />
              <p className="text-sm text-stone-500">No audit events yet.</p>
              <p className="text-xs text-stone-400 mt-1">Activity will appear here as you use RouteMe.</p>
            </div>
          )}
        </div>

        {/* Fuel efficiency — with real sparkline from leg distances */}
        <div className="md:col-span-4 rounded-3xl border border-stone-200 bg-white p-6 rm-lift">
          <div className="flex items-center justify-between">
            <div>
              <Fuel className="h-6 w-6 text-[#D95D39]" strokeWidth={1.8} />
              <p className="mt-4 text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">
                Leg breakdown
              </p>
              <h3 className="font-display text-2xl mt-1">Per stop</h3>
            </div>
            {analytics && (
              <div className="text-right">
                <div className="font-display text-4xl">{analytics.totalMiles.toFixed(0)}</div>
                <div className="text-xs text-stone-500">total mi</div>
              </div>
            )}
          </div>

          {/* Sparkline from real leg distances */}
          {analytics && analytics.legs.length > 0 ? (
            <svg viewBox="0 0 300 80" className="mt-5 w-full h-20">
              <defs>
                <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#D95D39" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#D95D39" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={sparklineArea(analytics.legs)}
                fill="url(#g)"
              />
              <path
                d={sparklinePath(analytics.legs)}
                fill="none"
                stroke="#D95D39"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <div className="mt-5 flex items-center justify-center h-20 text-xs text-stone-400">
              {schedule.length > 0 ? "Not enough stops for a route" : "No visits scheduled"}
            </div>
          )}

          {/* Per-leg distance labels */}
          {analytics && analytics.legs.length > 0 && (
            <div className="mt-3 flex items-center justify-between text-[10px] text-stone-500 tabular-nums">
              {analytics.legs.map((d, i) => (
                <span key={i}>{d.toFixed(1)} mi</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold flex items-center gap-1">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <p className="mt-1 font-display text-lg">{value}</p>
    </div>
  );
}
