import React, { useState, useEffect, useCallback } from "react";
import StylizedMap from "@/components/StylizedMap";
import { useRouteMe } from "@/context/RouteMeContext";
import { MAP_STOPS } from "@/lib/mockData";
import { fetchRoute, metersToMiles, secondsToTime, googleMapsUrl, appleMapsUrl } from "@/lib/directions";
import { Sparkles, Clock, MapPin, Mic, Phone, ChevronRight, Route, Navigation, ExternalLink, ArrowLeft, ArrowRight, ArrowUp, CornerDownRight, CornerUpRight, StickyNote, Eye } from "lucide-react";

export default function RouteView() {
  const { schedule, optimize, optimized, openVoice, notes, setNoteViewMode, setVoiceOpen, setVoiceTarget } = useRouteMe();
  const [selected, setSelected] = useState(schedule[0]?.id);
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  const active = schedule.find((s) => s.id === selected) || schedule[0];
  const totalMin = schedule.reduce((s, c) => s + (c.duration || 30), 0);

  // Get ordered waypoints with lat/lng
  const stopMap = Object.fromEntries(MAP_STOPS.map((s) => [s.id, s]));
  const waypoints = schedule
    .map((c) => {
      const pos = stopMap[c.id];
      if (pos) return { lat: pos.lat, lng: pos.lng, id: c.id, name: c.fullName, address: c.address };
      return null;
    })
    .filter(Boolean);

  // Fetch directions
  const loadRoute = useCallback(async () => {
    if (waypoints.length < 2) return;
    setLoading(true);
    const data = await fetchRoute(waypoints);
    setRouteData(data);
    setLoading(false);
  }, [schedule]);

  useEffect(() => {
    loadRoute();
  }, [loadRoute]);

  // Get active stop lat/lng for navigation links
  const activeStop = active ? stopMap[active.id] : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">
            Route · Today
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">
            {schedule.length} stops, <span className="font-serif-i text-[#D95D39]">one calm ribbon</span>.
          </h1>
        </div>
        <button
          onClick={optimize}
          data-testid="optimize-btn"
          className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors ${
            optimized
              ? "bg-white border border-stone-200 text-stone-700"
              : "bg-[#D95D39] hover:bg-[#C05030] text-white"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          {optimized ? "Route optimized" : "Re-optimize route"}
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Map */}
        <div className="lg:col-span-8 space-y-4">
          <StylizedMap
            onStopClick={setSelected}
            routeGeoJson={routeData?.routeGeoJson}
            routeDistance={routeData?.distance}
            routeDuration={routeData?.duration}
          />

          {/* Route summary strip — real data from Directions API */}
          <div className="grid grid-cols-4 gap-3">
            <SumCard icon={Route} label="Distance" value={routeData ? `${metersToMiles(routeData.distance)} mi` : "34.2 mi"} tone="ink" />
            <SumCard icon={Clock} label="Drive time" value={routeData ? secondsToTime(routeData.duration) : "1h 08m"} tone="ink" />
            <SumCard icon={Navigation} label="Stops" value={`${schedule.length}`} tone="terra" />
            <SumCard icon={Sparkles} label="Trip status" value={routeData ? "Live" : "Estimated"} tone="sage" />
          </div>
        </div>

        {/* Timeline + Turn-by-turn */}
        <div className="lg:col-span-4">
          <div className="rounded-3xl border border-stone-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">
                {showSteps ? "Turn-by-turn" : "Stop timeline"}
              </p>
              {routeData?.steps && routeData.steps.length > 0 && (
                <button
                  onClick={() => setShowSteps(!showSteps)}
                  className="text-xs font-semibold text-[#D95D39] hover:underline"
                >
                  {showSteps ? "Show stops" : "Show directions"}
                </button>
              )}
            </div>

            {showSteps && routeData?.steps ? (
              /* Turn-by-turn instructions */
              <ol className="mt-4 space-y-1 max-h-[420px] overflow-y-auto pr-1">
                {routeData.steps.map((step, idx) => (
                  <li key={idx}>
                    <div className="flex items-start gap-3 px-2 py-2 rounded-xl hover:bg-stone-50 transition-colors">
                      <span className="h-8 w-8 shrink-0 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center">
                        <StepIcon type={step.icon} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-stone-800 leading-snug">{step.instruction}</p>
                        {step.distance > 0 && (
                          <p className="text-[10px] text-stone-500 mt-0.5 tabular-nums">
                            {step.distance > 1000
                              ? `${(step.distance / 1000).toFixed(1)} km`
                              : `${Math.round(step.distance)} m`}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              /* Stop timeline */
              <>
                <ol className="mt-4 relative">
                  <span className="absolute left-[19px] top-4 bottom-4 w-px bg-stone-200" />
                  {schedule.map((c, idx) => {
                    const isActive = c.id === selected;
                    return (
                      <li key={c.id} className="relative">
                        <button
                          data-testid={`timeline-stop-${idx + 1}`}
                          onClick={() => setSelected(c.id)}
                          className={`w-full text-left flex items-start gap-3 px-2 py-3 rounded-xl transition-colors ${
                            isActive ? "bg-[#F7E5DD]" : "hover:bg-stone-50"
                          }`}
                        >
                          <span
                            className={`relative z-10 h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-semibold text-sm ${
                              isActive
                                ? "bg-[#D95D39] text-white"
                                : "bg-white border border-stone-300 text-stone-800"
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm truncate">{c.fullName}</p>
                              <span className="text-[10px] uppercase tracking-widest text-stone-400">
                                · {c.duration}m
                              </span>
                            </div>
                            <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3" /> {c.window}
                            </p>
                            <p className="text-xs text-stone-500 truncate flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3" /> {c.address}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-stone-400 mt-3" />
                        </button>
                      </li>
                    );
                  })}
                </ol>
                <div className="mt-4 pt-4 border-t border-stone-200 flex items-center justify-between px-1">
                  <span className="text-xs text-stone-500">Total care time</span>
                  <span className="font-display text-lg">
                    {Math.floor(totalMin / 60)}h {totalMin % 60}m
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Selected client detail + Navigate buttons */}
      {active && (
        <div className="rounded-3xl border border-stone-200 bg-white p-6 rm-fade-up">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">
                Selected stop
              </p>
              <h3 className="font-display text-3xl mt-1">{active.fullName}</h3>
              <p className="text-sm text-stone-600 mt-1">{active.condition}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {active.flags?.map((f) => (
                  <span
                    key={f}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#E3ECE5] text-emerald-900 border border-emerald-100"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Info label="Address" value={active.address} />
              <Info label="Time window" value={active.window} />
              <Info label="Last visit" value={active.lastVisit} />
            </div>

            <div className="flex flex-col gap-3">
              <a
                href={`tel:${active.phone?.replace(/\D/g, "")}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-50 transition-colors"
              >
                <Phone className="h-4 w-4" /> {active.phone}
              </a>

              <button
                onClick={() => openVoice(active.id)}
                data-testid="route-voice-btn"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-4 py-2.5 text-sm font-semibold transition-colors"
              >
                <Mic className="h-4 w-4" /> Record visit note
              </button>

              {/* Navigate buttons */}
              {activeStop && (
                <div className="pt-2 border-t border-stone-200">
                  <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold mb-2">
                    Navigate to this stop
                  </p>
                  <div className="flex gap-2">
                    <a
                      href={googleMapsUrl(activeStop.lat, activeStop.lng, active.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Google Maps
                    </a>
                    <a
                      href={appleMapsUrl(activeStop.lat, activeStop.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Apple Maps
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Latest note */}
              {active && notes[active.id]?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-stone-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold flex items-center gap-1.5">
                      <StickyNote className="h-3 w-3" /> Latest note
                    </p>
                    <button
                      onClick={() => {
                        setVoiceTarget(active.id);
                        setNoteViewMode("history");
                        setVoiceOpen(true);
                      }}
                      className="text-[10px] font-semibold text-[#D95D39] hover:underline flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" /> View all ({notes[active.id].length})
                    </button>
                  </div>
                  <div className="rounded-xl bg-[#F9F8F6] border border-stone-200 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-stone-500">
                        {(() => {
                          const d = new Date(notes[active.id][0].date);
                          return d.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
                        })()}
                      </span>
                      {notes[active.id][0].visitType && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-stone-200 bg-white text-stone-600">
                          {notes[active.id][0].visitType}
                        </span>
                      )}
                      {notes[active.id][0].status && (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${
                          notes[active.id][0].status === "Completed" ? "bg-[#E3ECE5] text-emerald-900 border-emerald-100" :
                          notes[active.id][0].status === "Follow-up needed" ? "bg-amber-50 text-amber-800 border-amber-200" :
                          notes[active.id][0].status === "Escalated" ? "bg-[#F7E5DD] text-[#D95D39] border-[#F0D2C4]" :
                          "bg-stone-100 text-stone-600 border-stone-200"
                        }`}>
                          {notes[active.id][0].status}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed line-clamp-2">
                      {notes[active.id][0].text}
                    </p>
                  </div>
                </div>
              )}

          {/* Loading indicator */}
          {loading && (
            <div className="mt-4 flex items-center gap-2 text-xs text-stone-500">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#D95D39] animate-pulse" />
              Calculating live route...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SumCard({ icon: Icon, label, value, tone }) {
  const styles =
    tone === "terra"
      ? "bg-[#F7E5DD] border-[#F0D2C4] text-[#D95D39]"
      : tone === "sage"
        ? "bg-[#E3ECE5] border-emerald-200 text-emerald-800"
        : "bg-white border-stone-200 text-stone-900";
  return (
    <div className={`rounded-2xl border p-4 ${styles}`}>
      <Icon className="h-4 w-4" />
      <div className="mt-2 text-[10px] uppercase tracking-widest opacity-70 font-semibold">{label}</div>
      <div className="font-display text-2xl mt-1">{value}</div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-[#F9F8F6] border border-stone-200 p-3">
      <div className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">{label}</div>
      <div className="mt-1 text-sm font-medium text-stone-800">{value}</div>
    </div>
  );
}

function StepIcon({ type }) {
  const className = "h-3.5 w-3.5 text-stone-600";
  switch (type) {
    case "arrow-left": return <ArrowLeft className={className} />;
    case "arrow-right": return <ArrowRight className={className} />;
    case "straight": return <ArrowUp className={className} />;
    case "uturn": return <CornerUpRight className={className} />;
    case "ramp": return <CornerDownRight className={className} />;
    case "arrive": return <MapPin className="h-3.5 w-3.5 text-[#D95D39]" />;
    case "depart": return <Navigation className="h-3.5 w-3.5 text-emerald-600" />;
    default: return <ArrowUp className={className} />;
  }
}