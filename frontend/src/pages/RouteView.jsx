import React, { useState, useCallback, useRef } from "react";
import StylizedMap from "@/components/StylizedMap";
import { useRouteMe } from "@/context/RouteMeContext";
import { Sparkles, Clock, MapPin, Stethoscope, Phone, ChevronRight, Fuel, Route, GripVertical, Lock, Unlock, Brain, Zap, Compass, SlidersHorizontal, Loader, CheckCircle, X, Info, ChevronDown, Map as MapIcon, ArrowUpDown, Plus, Trash2 } from "lucide-react";
import RouteBuilderModal from "@/components/RouteBuilderModal";
import RemoveFromRouteModal from "@/components/RemoveFromRouteModal";
import { formatTimeWindow } from "@/lib/utils";
import { metersToMiles, secondsToShort } from "@/lib/directions";

const OPTIMIZATION_MODES = [
  { id: "ai", label: "AI smart route", icon: Brain, desc: "Balances priority, traffic, time windows, and distance using a weighted heuristic model. Considers day-of-week traffic patterns & weather." },
  { id: "fastest", label: "Fastest", icon: Zap, desc: "Prioritizes earliest time windows first to minimize total drive time. Best when you need to finish the route quickly." },
  { id: "mileage", label: "Least mileage", icon: Compass, desc: "Nearest-neighbor TSP solver. Finds the shortest total driving distance between stops. Best for fuel efficiency." },
  { id: "custom", label: "Custom", icon: SlidersHorizontal, desc: "Priority-first ordering: high-priority patients first, then by shortest duration. Best for clinical urgency." },
  { id: "saved", label: "Load existing route", icon: Loader, desc: "Load a previously saved route order. Use when today's conditions match a known good pattern." },
];

export default function RouteView() {
  const { schedule, optimize, optimized, openVoice, saveRoute, savedRoutes, loadRoute, reorder, routeResult, clients, scheduleIds, createRoute, removeFromRoute, rescheduleClient, rescheduledClients, optimizationMode, setOptimizationMode, routeDistance, routeDuration, weatherData, weatherLoading, nurse } = useRouteMe();
    const [selected, setSelected] = useState(schedule[0]?.id);
    const [modalOpen, setModalOpen] = useState(false);
    const [builderOpen, setBuilderOpen] = useState(false);
    const [removeModalOpen, setRemoveModalOpen] = useState(false);
    const [clientToRemove, setClientToRemove] = useState(null);
    const [dragEnabled, setDragEnabled] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [justSaved, setJustSaved] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const dragItem = useRef(null);

  const active = schedule.find((s) => s.id === selected) || schedule[0];
  const totalMin = schedule.reduce((s, c) => s + (c.duration || 30), 0);

  /* ─── Optimize modal ─────────────────────────────────── */
  const openOptimize = () => {
    // Start in the current mode
    setModalOpen(true);
  };

  const applyOptimization = (modeId) => {
    setOptimizing(true);
    setModalOpen(false);
    // Call optimize directly — no setTimeout, no stale closures
    optimize(modeId);
    setOptimizing(false);
  };

  const handleSaveRoute = async () => {
    const name = `Route ${new Date().toLocaleDateString()}`;
    await saveRoute(name, schedule.map(s => s.id));
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  /* ─── Drag & Drop ────────────────────────────────────── */
  const handleDragStart = useCallback((e, idx) => {
    dragItem.current = idx;
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(idx));
    setTimeout(() => {
      e.target.style.opacity = "0.5";
    }, 0);
  }, []);

  const handleDragOver = useCallback((e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragItem.current !== idx) {
      setDragOverIdx(idx);
    }
  }, []);

  const handleDragEnd = useCallback((e) => {
    e.target.style.opacity = "1";
    setDragIdx(null);
    setDragOverIdx(null);
    dragItem.current = null;
  }, []);

  const handleDrop = useCallback((e, dropIdx) => {
    e.preventDefault();
    const fromIdx = dragItem.current;
    if (fromIdx === null || fromIdx === dropIdx) {
      setDragIdx(null);
      setDragOverIdx(null);
      dragItem.current = null;
      return;
    }

    const ids = schedule.map(s => s.id);
    const [moved] = ids.splice(fromIdx, 1);
    ids.splice(dropIdx, 0, moved);
    reorder(ids);
    setDragIdx(null);
    setDragOverIdx(null);
    dragItem.current = null;
  }, [schedule, reorder]);

  const modeLabel = OPTIMIZATION_MODES.find(m => m.id === optimizationMode)?.label || "AI smart route";

  /* ─── Dynamic fuel & time saved ──────────────────────────── */
  // Baseline: store the first-ever routeDistance as reference
  const baselineDistRef = useRef(null);
  if (routeDistance && !baselineDistRef.current) {
    baselineDistRef.current = routeDistance;
  }

  const computeFuelSaved = (currentDist, result) => {
    if (!currentDist || !baselineDistRef.current) return "--";
    const baselineMiles = metersToMiles(baselineDistRef.current);
    const currentMiles = metersToMiles(currentDist);
    const pct = ((baselineMiles - currentMiles) / baselineMiles) * 100;
    if (Math.abs(pct) < 0.1) return "—";
    return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
  };

  const computeTimeSaved = (currentDur) => {
    // Compare drive time vs total care time to show efficiency
    if (!currentDur) return "--";
    const totalCare = schedule.reduce((s, c) => s + (c.duration || 30), 0);
    const driveSec = currentDur;
    const driveMin = driveSec / 60;
    // "Time saved" = how much less driving vs care time
    const raw = Math.round(totalCare - driveMin);
    const val = Math.max(0, raw);
    return `${val} min`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">
            Route · Today
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">
            {schedule.length} stops, <span className="font-serif-i text-[#D95D39]">one calm ribbon</span>.
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveRoute}
            data-testid="save-route-header-btn"
            className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors ${
              justSaved
                ? "bg-[#E3ECE5] border border-emerald-200 text-emerald-800"
                : "border border-stone-300 text-stone-700 hover:bg-stone-50"
            }`}
          >
            {justSaved ? (
              <><CheckCircle className="h-4 w-4" /> Saved</>
            ) : (
              <><Loader className="h-4 w-4" /> Save route</>
            )}
          </button>
          <button
            onClick={openOptimize}
            data-testid="optimize-btn"
            className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors bg-[#D95D39] hover:bg-[#C05030] text-white shadow-sm"
          >
            <Sparkles className="h-4 w-4" />
            Optimize route
          </button>
          <button
            onClick={() => setBuilderOpen(true)}
            data-testid="route-create-btn"
            className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors bg-stone-900 hover:bg-stone-800 text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Create route
          </button>
        </div>
      </div>

      {/* ── Driving conditions + Weather chip ── */}
      {routeResult && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F9F8F6] border border-stone-200 px-3 py-1.5">
            <Info className="h-3 w-3 text-stone-400" />
            {routeResult.dayOfWeek} · traffic {routeResult.trafficMultiplier.toFixed(2)}×
          </span>
          {weatherData && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200 px-3 py-1.5 text-sky-800">
              <img
                src={`https://openweathermap.org/img/wn/${weatherData.icon}.png`}
                alt={weatherData.condition}
                className="h-4 w-4"
              />
              {weatherData.temp}°F · {weatherData.condition} · {weatherData.city}
            </span>
          )}
          {weatherLoading && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-50 border border-stone-200 px-3 py-1.5 text-stone-400">
              <Loader className="h-3 w-3 animate-spin" /> Weather...
            </span>
          )}
          {nurse?.homeBase && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-200 px-3 py-1.5 text-orange-800">
              <MapPin className="h-3 w-3" />
              From {nurse.homeBase.address?.split(",")[0] || "Home"}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E3ECE5] border border-emerald-200 px-3 py-1.5 text-emerald-800">
            <CheckCircle className="h-3 w-3" />
            {routeDistance ? `${metersToMiles(routeDistance)} mi · ${secondsToShort(routeDuration)}` : `${routeResult.metrics?.totalDriveMiles} mi · ${routeResult.metrics?.totalDriveMinutes} min drive`}
          </span>
          {routeResult.validation?.isOptimal && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E3ECE5] border border-emerald-200 px-3 py-1.5 text-emerald-800">
              <CheckCircle className="h-3 w-3" />
              Optimal route
            </span>
          )}
          {routeResult.label && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 border border-stone-200 px-3 py-1.5 text-stone-600">
              {modeLabel}
            </span>
          )}
        </div>
      )}

      {/* ── Map + Timeline ── */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Map */}
        <div className="lg:col-span-8 space-y-4">
          <StylizedMap onStopClick={setSelected} />

          {/* Route summary strip — uses Mapbox real route data */}
          <div className="grid grid-cols-4 gap-3">
            <SumCard icon={Route} label="Distance" value={routeDistance ? `${metersToMiles(routeDistance)} mi` : "--"} tone="ink" />
            <SumCard icon={Clock} label="Drive time" value={routeDuration ? secondsToShort(routeDuration) : "--"} tone="ink" />
            <SumCard icon={Fuel} label="Fuel saved" value={computeFuelSaved(routeDistance, routeResult)} tone="terra" />
            <SumCard icon={Sparkles} label="Time saved" value={computeTimeSaved(routeDuration)} tone="sage" />
          </div>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-4">
          <div className="rounded-3xl border border-stone-200 bg-white p-5">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">
                Turn-by-turn timeline
              </p>
              <button
                onClick={() => setDragEnabled(d => !d)}
                data-testid="toggle-drag-btn"
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                  dragEnabled
                    ? "bg-[#F7E5DD] text-[#D95D39] border border-[#F0D2C4]"
                    : "bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200"
                }`}
              >
                {dragEnabled ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                {dragEnabled ? "Drag to reorder" : "Change order"}
              </button>
            </div>
            <ol className="mt-4 relative">
              <span className="absolute left-[19px] top-4 bottom-4 w-px bg-stone-200" />
              {schedule.map((c, idx) => {
                const isActive = c.id === selected;
                const isDragging = dragIdx === idx;
                const isOver = dragOverIdx === idx && dragIdx !== idx;

                return (
                  <li
                    key={c.id}
                    className={`relative transition-all duration-150 ${
                      isDragging ? "opacity-40 scale-[0.97]" : ""
                    } ${isOver && dragEnabled ? "translate-y-1" : ""}`}
                    draggable={dragEnabled}
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, idx)}
                  >
                    {/* Drop indicator line */}
                    {isOver && dragEnabled && (
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#D95D39] rounded-full z-20" />
                    )}

                    <button
                      data-testid={`timeline-stop-${idx + 1}`}
                      onClick={() => setSelected(c.id)}
                      className={`w-full text-left flex items-start gap-2 px-2 py-3 rounded-xl transition-colors ${
                        isActive ? "bg-[#F7E5DD]" : "hover:bg-stone-50"
                      }`}
                    >
                      {/* Drag handle */}
                      {dragEnabled && (
                        <span className="shrink-0 mt-2.5 text-stone-300 cursor-grab active:cursor-grabbing">
                          <GripVertical className="h-4 w-4" />
                        </span>
                      )}

                      {/* Stop number */}
                      <span
                        className={`relative z-10 h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-semibold text-sm ${
                          isActive
                            ? "bg-[#D95D39] text-white"
                            : "bg-white border border-stone-300 text-stone-800"
                        }`}
                      >
                        {idx + 1}
                      </span>

                      {/* Stop details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm truncate">{c.fullName}</p>
                          <span className="text-[10px] uppercase tracking-widest text-stone-400">
                            · {c.duration}m
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" /> {formatTimeWindow(c.window)}
                        </p>
                        <p className="text-xs text-stone-500 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {c.address}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-stone-400 mt-3 shrink-0" />
                      {!dragEnabled && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setClientToRemove(c);
                            setRemoveModalOpen(true);
                          }}
                          data-testid={`remove-stop-${idx + 1}`}
                          className="h-7 w-7 rounded-full flex items-center justify-center text-stone-400 hover:text-[#D95D39] hover:bg-[#F7E5DD] transition-colors shrink-0 mt-2.5"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
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

            {/* Validation info */}
            {routeResult?.validation && !routeResult.validation.isOptimal && (
              <div className="mt-3 rounded-xl bg-[#F7E5DD] border border-[#F0D2C4] p-3">
                <p className="text-[10px] uppercase tracking-widest text-[#D95D39] font-semibold flex items-center gap-1">
                  <Info className="h-3 w-3" /> Route insight
                </p>
                <p className="text-xs text-stone-700 mt-1">
                  A better route was found that reduces {routeResult.validation.improvement > 10 ? "distance" : "drive time"} by ~{routeResult.validation.improvement} points. Try a different optimization mode.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Selected client detail ── */}
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
              <InfoRow label="Address" value={active.address} />
              <InfoRow label="Time window" value={formatTimeWindow(active.window)} />
              <InfoRow label="Last visit" value={active.lastVisit} />
            </div>

            <div className="flex md:flex-col gap-3 md:items-end justify-end">
              <a
                href={`tel:${active.phone?.replace(/\D/g, "")}`}
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-50 transition-colors"
              >
                <Phone className="h-4 w-4" /> {active.phone}
              </a>
              <button
                onClick={() => openVoice(active.id)}
                data-testid="route-voice-btn"
                className="inline-flex items-center gap-2 rounded-full bg-[#D95D39] hover:bg-[#C05030] text-white px-4 py-2.5 text-sm font-semibold transition-colors"
              >
                <Stethoscope className="h-4 w-4" /> Visit note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Optimization Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-lg rounded-3xl border border-stone-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
              <div>
                <h2 className="font-display text-2xl">Optimize route</h2>
                <p className="text-xs text-stone-500 mt-1">
                  Choose how your route is ordered today
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-stone-100 transition-colors"
              >
                <X className="h-4 w-4 text-stone-500" />
              </button>
            </div>

            {/* Mode options — auto-apply immediately on click */}
            <div className="px-6 py-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {OPTIMIZATION_MODES.map((m) => {
                  const isActive = optimizationMode === m.id;
                  const Icon = m.icon;
                  const isSaved = m.id === "saved";
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                                                if (isSaved) {
                                                  setOptimizationMode(m.id);
                                                } else {
                                                  setOptimizationMode(m.id);
                                                  applyOptimization(m.id);
                                                }
                                              }}
                      data-testid={`opt-mode-${m.id}`}
                    className={`w-full text-left flex items-start gap-4 rounded-2xl border p-4 transition-all ${
                      isActive
                        ? "bg-[#F7E5DD] border-[#D95D39] ring-1 ring-[#D95D39]/20"
                        : "bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive ? "bg-[#D95D39] text-white" : "bg-stone-100 text-stone-600"
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold text-sm ${isActive ? "text-[#D95D39]" : "text-stone-800"}`}>
                          {m.label}
                        </p>
                        {isActive && (
                          <span className="h-2 w-2 rounded-full bg-[#D95D39]" />
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{m.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer: validation + apply */}
            <div className="px-6 py-4 border-t border-stone-100 bg-[#F9F8F6] space-y-3">
              {/* Route plan preview */}
              {optimizationMode !== "saved" && (
                <div className="rounded-xl bg-white border border-stone-200 p-3">
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <MapIcon className="h-3.5 w-3.5 text-stone-400" />
                    <span>{schedule.length} stops</span>
                    <span className="text-stone-300">·</span>
                    <span>Today ({new Date().toLocaleDateString("en-US", { weekday: "long" })})</span>
                  </div>
                </div>
              )}

              {/* Saved routes picker */}
              {optimizationMode === "saved" && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-widest text-stone-500 font-semibold">Saved routes</p>
                  {savedRoutes.length === 0 ? (
                    <div className="rounded-xl bg-white border border-stone-200 p-4 text-center">
                      <p className="text-sm text-stone-500">No saved routes yet.</p>
                      <p className="text-xs text-stone-400 mt-1">Optimize a route first, then save it.</p>
                    </div>
                  ) : (
                    savedRoutes.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => { loadRoute(r.id); setModalOpen(false); }}
                        className="w-full text-left rounded-xl bg-white border border-stone-200 p-3 hover:bg-stone-50 transition-colors"
                      >
                        <p className="text-sm font-semibold text-stone-800">{r.name}</p>
                        <p className="text-xs text-stone-500 mt-0.5">{r.stops?.length || 0} stops</p>
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => applyOptimization(optimizationMode)}
                  data-testid="apply-optimization-btn"
                  disabled={optimizing}
                  className={`flex-1 inline-flex items-center justify-center gap-2 rounded-full h-11 text-sm font-semibold transition-colors ${
                    optimizing
                      ? "bg-stone-400 text-white cursor-wait"
                      : "bg-stone-900 hover:bg-stone-800 text-white"
                  }`}
                >
                  {optimizing ? (
                    <><Loader className="h-4 w-4 animate-spin" /> Optimizing…</>
                  ) : (
                    <><Sparkles className="h-4 w-4" />
                    Apply {OPTIMIZATION_MODES.find(m => m.id === optimizationMode)?.label || "optimization"}</>
                  )}
                </button>
                <button
                  onClick={handleSaveRoute}
                  data-testid="save-route-btn"
                  className={`inline-flex items-center gap-2 rounded-full border h-11 px-4 text-sm font-semibold transition-colors ${
                    justSaved
                      ? "bg-[#E3ECE5] border-emerald-200 text-emerald-800"
                      : "border-stone-300 text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  {justSaved ? (
                    <><CheckCircle className="h-4 w-4" /> Saved</>
                  ) : (
                    <><Loader className="h-4 w-4" /> Save</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Route Builder Modal */}
      <RouteBuilderModal
              open={builderOpen}
              onClose={() => setBuilderOpen(false)}
              clients={clients}
              scheduleIds={scheduleIds}
              onScheduleIds={(ids) => createRoute(ids)}
              onReschedule={(id, day) => rescheduleClient(id, day)}
              rescheduledClients={rescheduledClients}
            />

      {/* Remove from Route Modal */}
      <RemoveFromRouteModal
        open={removeModalOpen}
        onClose={() => { setRemoveModalOpen(false); setClientToRemove(null); }}
        client={clientToRemove}
        onRemoveFromRoute={removeFromRoute}
        onReschedule={rescheduleClient}
      />
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

function InfoRow({ label, value }) {
  return (
    <div className="rounded-xl bg-[#F9F8F6] border border-stone-200 p-3">
      <div className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-stone-800">{value}</div>
    </div>
  );
}