import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import StylizedMap from "@/components/StylizedMap";
import { useRouteMe } from "@/context/RouteMeContext";
import { Sparkles, Clock, MapPin, Stethoscope, Phone, ChevronRight, Fuel, Route, GripVertical, Lock, Unlock, Brain, Zap, Compass, SlidersHorizontal, Loader, CheckCircle, X, Info, ChevronDown, Map as MapIcon, ArrowUpDown, Plus, Trash2, Leaf, ShieldAlert, Navigation, PlayCircle, StopCircle, Flag } from "lucide-react";
import RouteBuilderModal from "@/components/RouteBuilderModal";
import RemoveFromRouteModal from "@/components/RemoveFromRouteModal";
import { formatTimeWindow } from "@/lib/utils";
import { metersToMiles, secondsToShort, googleMapsUrl, appleMapsUrl } from "@/lib/directions";
import { logRouteState, logBaselineChange } from "@/lib/routeDebugger";

const OPTIMIZATION_MODES = [
  { id: "ai", label: "AI smart route", icon: Brain, desc: "Balances priority, traffic, time windows, and distance using a weighted heuristic model. Considers day-of-week traffic patterns & weather." },
  { id: "fastest", label: "Fastest", icon: Zap, desc: "Prioritizes earliest time windows first to minimize total drive time. Best when you need to finish the route quickly." },
  { id: "mileage", label: "Least mileage", icon: Compass, desc: "Nearest-neighbor TSP solver. Finds the shortest total driving distance between stops. Best for fuel efficiency." },
  { id: "fuel-efficient", label: "Fuel efficient", icon: Leaf, desc: "Minimizes fuel consumption by heavily weighting distance over speed. Avoids unnecessary detours and long hauls between stops." },
  { id: "traffic-avoidance", label: "Traffic avoidance", icon: ShieldAlert, desc: "Routes around peak-hour congestion by penalizing arrivals during 7-9 AM and 4-7 PM commute windows." },
  { id: "custom", label: "Custom", icon: SlidersHorizontal, desc: "Priority-first ordering: high-priority patients first, then by shortest duration. Best for clinical urgency." },
  { id: "saved", label: "Load existing route", icon: Loader, desc: "Load a previously saved route order. Use when today's conditions match a known good pattern." },
];

export default function RouteView() {
  const {
    schedule, optimize, optimized, openVoice, saveRoute, savedRoutes, loadRoute, reorder, routeResult,
    clients, scheduleIds, createRoute, removeFromRoute, rescheduleClient, rescheduledClients,
    optimizationMode, setOptimizationMode, routeDistance, routeDuration, routeGeoJson,
    weatherData, weatherLoading, nurse, resetRouteOrder, navPreference,
    routeActive, startRoute, endRoute, visitedIds, markVisited,
    builderOpen, setBuilderOpen, builderTab, setBuilderTab,
  } = useRouteMe();

  const [selected, setSelected] = useState(schedule[0]?.id);
  const [modalOpen, setModalOpen] = useState(false);
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

  /* ─── Sort: visited stops to bottom when route is active ── */
  const sortedSchedule = useMemo(() => {
    if (!routeActive) return schedule;
    const visited = schedule.filter(c => visitedIds.includes(c.id));
    const unvisited = schedule.filter(c => !visitedIds.includes(c.id));
    return [...unvisited, ...visited];
  }, [schedule, routeActive, visitedIds]);

  const displayedSchedule = sortedSchedule;

  /* ─── Optimize modal ─────────────────────────────────── */
  const openOptimize = () => setModalOpen(true);

  const applyOptimization = (modeId) => {
    setOptimizing(true);
    setModalOpen(false);
    optimize(modeId);
    setOptimizing(false);
  };

  const handleSaveRoute = async () => {
    const name = `Route ${new Date().toLocaleDateString()}`;
    await saveRoute(name, schedule.map(s => s.id));
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  /* ─── Drag & Drop (mouse + touch) ──────────────────────── */
  const handleDragStart = useCallback((e, idx) => {
    dragItem.current = idx;
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(idx));
    setTimeout(() => { e.target.style.opacity = "0.5"; }, 0);
  }, []);

  const handleDragOver = useCallback((e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragItem.current !== idx) setDragOverIdx(idx);
  }, []);

  const handleDragEnd = useCallback((e) => {
    e.target.style.opacity = "1";
    setDragIdx(null);
    setDragOverIdx(null);
    dragItem.current = null;
    touchActiveRef.current = false;
  }, []);

  const handleDrop = useCallback((e, dropIdx) => {
    e.preventDefault();
    const fromIdx = dragItem.current;
    if (fromIdx === null || fromIdx === dropIdx) {
      setDragIdx(null); setDragOverIdx(null); dragItem.current = null; return;
    }
    const ids = schedule.map(s => s.id);
    const [moved] = ids.splice(fromIdx, 1);
    ids.splice(dropIdx, 0, moved);
    reorder(ids);
    setDragIdx(null); setDragOverIdx(null); dragItem.current = null;
  }, [schedule, reorder]);

  // ── Touch drag support (mobile) ──
  const touchActiveRef = useRef(false);
  const touchStartY = useRef(0);
  const touchItemIdx = useRef(null);
  const touchListRef = useRef(null);

  useEffect(() => {
    const preventScroll = (e) => { if (touchActiveRef.current) e.preventDefault(); };
    document.addEventListener('touchmove', preventScroll, { passive: false });
    return () => document.removeEventListener('touchmove', preventScroll);
  }, []);

  const handleTouchStart = useCallback((e, idx) => {
    touchActiveRef.current = true;
    touchItemIdx.current = idx;
    dragItem.current = idx;
    touchStartY.current = e.touches[0].clientY;
    setDragIdx(idx);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!touchActiveRef.current) return;
    const touchY = e.touches[0].clientY;
    const listEl = touchListRef.current;
    if (!listEl) return;
    const items = listEl.querySelectorAll('li');
    let dropIdx = touchItemIdx.current;
    for (let i = 0; i < items.length; i++) {
      const rect = items[i].getBoundingClientRect();
      if (touchY >= rect.top && touchY <= rect.bottom) { dropIdx = i; break; }
    }
    setDragOverIdx(dropIdx);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchActiveRef.current) return;
    touchActiveRef.current = false;
    const fromIdx = dragItem.current;
    const toIdx = dragOverIdx;
    setDragIdx(null); setDragOverIdx(null);
    dragItem.current = null;
    touchItemIdx.current = null;
    if (fromIdx === null || toIdx === null || fromIdx === toIdx) return;
    const ids = schedule.map(s => s.id);
    const [moved] = ids.splice(fromIdx, 1);
    ids.splice(toIdx, 0, moved);
    reorder(ids);
  }, [schedule, reorder, dragOverIdx]);

  const modeLabel = OPTIMIZATION_MODES.find(m => m.id === optimizationMode)?.label || "AI smart route";

  /* ─── Dynamic fuel & time saved ──────────────────────────── */
  const baselineRef = useRef(null);
  if (routeDistance && routeDuration && !baselineRef.current) {
    baselineRef.current = { distance: routeDistance, duration: routeDuration };
    logRouteState({ routeDistance, routeDuration, baseline: baselineRef.current, optimized, mode: optimizationMode, routeGeoJson });
  }

  const prevOptimizedRef = useRef(optimized);
  useEffect(() => {
    if (prevOptimizedRef.current === true && !optimized && routeDistance) {
      const prev = baselineRef.current;
      const next = { distance: routeDistance, duration: routeDuration };
      baselineRef.current = next;
      logBaselineChange("reset after reorder", prev, next);
    }
    prevOptimizedRef.current = optimized;
  }, [optimized, routeDistance, routeDuration]);

  useEffect(() => {
    if (routeDistance && routeDuration && baselineRef.current) {
      logRouteState({ routeDistance, routeDuration, baseline: baselineRef.current, optimized, mode: optimizationMode, routeGeoJson });
    }
  }, [routeDistance, routeDuration, optimizationMode, optimized]); // eslint-disable-line react-hooks/exhaustive-deps

  const computeFuelSaved = () => {
    const b = baselineRef.current;
    if (!b?.distance || !routeDistance) return "—";
    const diffMeters = b.distance - routeDistance;
    const diffMiles = diffMeters * 0.000621371;
    if (Math.abs(diffMiles) < 0.05) return "0 mi";
    const sign = diffMiles > 0 ? "+" : "";
    return `${sign}${diffMiles.toFixed(1)} mi`;
  };

  const computeTimeSaved = () => {
    const b = baselineRef.current;
    if (!b?.duration || !routeDuration) return "—";
    const savedSec = b.duration - routeDuration;
    const savedMin = Math.round(savedSec / 60);
    if (Math.abs(savedMin) < 1) return "< 1 min";
    return savedMin > 0 ? `${savedMin} min` : `${Math.abs(savedMin)} min`;
  };

  /* ─── Get stop number (respects visited sort) ─────────── */
  const getStopNumber = (clientId) => {
    if (!routeActive) return null;
    const unvisited = schedule.filter(c => !visitedIds.includes(c.id));
    const idx = unvisited.findIndex(c => c.id === clientId);
    if (idx >= 0) return idx + 1;
    return "✓";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold mb-2">
            Route · Today
            {routeActive && (
              <span className="ml-2 text-emerald-600 font-semibold normal-case tracking-normal">· Active</span>
            )}
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">
            {routeActive
              ? `${displayedSchedule.length - visitedIds.length} remaining`
              : `${schedule.length} stops`}
            {routeActive && (
              <span className="text-base font-sans font-normal text-stone-400 ml-2">
                · {visitedIds.length} visited
              </span>
            )}
          </h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Start / Stop Route button */}
          {schedule.length > 0 && (
            routeActive ? (
              <button
                onClick={endRoute}
                data-testid="end-route-btn"
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                <StopCircle className="h-4 w-4" />
                End route
              </button>
            ) : (
              <button
                onClick={() => startRoute()}
                data-testid="start-route-btn"
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
              >
                <PlayCircle className="h-4 w-4" />
                Start route
              </button>
            )
          )}
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
            onClick={() => { setBuilderTab("new"); setBuilderOpen(true); }}
            data-testid="route-create-btn"
            className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors bg-stone-900 hover:bg-stone-800 text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Create route
          </button>
          <button
            onClick={resetRouteOrder}
            data-testid="reset-route-btn"
            className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-colors border border-stone-300 text-stone-600 hover:bg-stone-50 shadow-sm"
            title="Reset to original order"
          >
            <ArrowUpDown className="h-4 w-4" />
            Reset
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
              <img src={`https://openweathermap.org/img/wn/${weatherData.icon}.png`} alt={weatherData.condition} className="h-4 w-4" />
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
              <CheckCircle className="h-3 w-3" /> Optimal route
            </span>
          )}
          {routeResult.label && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 border border-stone-200 px-3 py-1.5 text-stone-600">{modeLabel}</span>
          )}
        </div>
      )}

      {/* ── Active route status bar ── */}
      {routeActive && (
        <div className="flex items-center gap-4 text-sm px-1">
          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
            <Flag className="h-4 w-4" />
            {visitedIds.length} of {schedule.length} visits completed
          </span>
          <div className="flex-1 h-2 rounded-full bg-stone-200 overflow-hidden max-w-xs">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${schedule.length > 0 ? (visitedIds.length / schedule.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Map + Timeline ── */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Map */}
        <div className="lg:col-span-8 space-y-4">
          <StylizedMap onStopClick={setSelected} />

          {/* Route summary strip */}
          <div className="grid grid-cols-4 gap-3">
            <SumCard icon={Route} label="Distance" value={routeDistance ? `${metersToMiles(routeDistance)} mi` : "--"} tone="ink" />
            <SumCard icon={Clock} label="Drive time" value={routeDuration ? secondsToShort(routeDuration) : "--"} tone="ink" />
            <SumCard icon={Fuel} label="Fuel saved" value={computeFuelSaved()} tone="terra" />
            <SumCard icon={Sparkles} label="Time saved" value={computeTimeSaved()} tone="sage" />
          </div>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-4">
          <div className="rounded-3xl border border-stone-200 bg-white p-5">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500 font-semibold">
                Turn-by-turn timeline
              </p>
              {!routeActive && (
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
              )}
            </div>
            <ol ref={touchListRef} className="mt-4 relative">
              <span className="absolute left-[19px] top-4 bottom-4 w-px bg-stone-200" />
              {displayedSchedule.map((c, idx) => {
                const isVisited = visitedIds.includes(c.id);
                const isActive = c.id === selected;
                const isDragging = dragIdx === idx;
                const isOver = dragOverIdx === idx && dragIdx !== idx;
                const stopNum = getStopNumber(c.id);

                return (
                  <li
                    key={c.id}
                    className={`relative transition-all duration-150 ${
                      isDragging ? "opacity-40 scale-[0.97]" : ""
                    } ${isOver && dragEnabled ? "translate-y-1" : ""} ${
                      isVisited ? "opacity-80" : ""
                    }`}
                    draggable={dragEnabled}
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, idx)}
                    onTouchStart={(e) => dragEnabled && handleTouchStart(e, idx)}
                    onTouchMove={(e) => dragEnabled && handleTouchMove(e)}
                    onTouchEnd={(e) => dragEnabled && handleTouchEnd(e)}
                  >
                    {/* Drop indicator line */}
                    {isOver && dragEnabled && (
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#D95D39] rounded-full z-20" />
                    )}

                    <button
                      data-testid={`timeline-stop-${idx + 1}`}
                      onClick={() => setSelected(c.id)}
                      className={`w-full text-left flex items-start gap-2 px-2 py-3 rounded-xl transition-colors ${
                        isVisited
                          ? "bg-[#E3ECE5] border border-emerald-200"
                          : isActive
                            ? "bg-[#F7E5DD]"
                            : "hover:bg-stone-50"
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
                          isVisited
                            ? "bg-emerald-500 text-white"
                            : isActive
                              ? "bg-[#D95D39] text-white"
                              : "bg-white border border-stone-300 text-stone-800"
                        }`}
                      >
                        {isVisited ? <CheckCircle className="h-5 w-5" /> : (routeActive ? stopNum : idx + 1)}
                      </span>

                      {/* Stop details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`font-semibold text-sm truncate ${isVisited ? "text-emerald-800" : ""}`}>
                            {c.fullName}
                          </p>
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
                        {isVisited && (
                          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Seen
                          </p>
                        )}
                      </div>

                      {/* Action buttons: Mark visited or Remove */}
                      {routeActive && !isVisited && !dragEnabled && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markVisited(c.id, c.fullName);
                          }}
                          data-testid={`mark-visited-${idx + 1}`}
                          className="h-8 w-8 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors shrink-0 mt-2"
                          title="Mark as visited"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      {!routeActive && !dragEnabled && (
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
            {routeResult?.validation && !routeResult.validation.isOptimal && routeResult.validation.bestAlt && (
              <div className="mt-3 rounded-xl bg-[#F7E5DD] border border-[#F0D2C4] p-3">
                <p className="text-[10px] uppercase tracking-widest text-[#D95D39] font-semibold flex items-center gap-1">
                  <Info className="h-3 w-3" /> Route insight
                </p>
                <p className="text-xs text-stone-700 mt-1">
                  A better route was found that reduces {routeResult.validation.improvement > 10 ? "distance" : "drive time"} by ~{routeResult.validation.improvement} points
                  {routeResult.validation.bestAlt.totalDriveMiles && (
                    <> ({routeResult.validation.bestAlt.totalDriveMiles} mi) </>
                  )}.
                </p>
                <button
                  onClick={() => { const altOrder = routeResult.validation.bestAlt.order; if (altOrder) reorder(altOrder); }}
                  className="mt-2 w-full text-xs font-semibold rounded-full py-2 px-4 bg-[#D95D39] text-white hover:bg-[#C05030] transition-colors"
                >
                  Use this route instead
                </button>
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
              <Link
                to={`/app/clients/${active.id}`}
                className="font-display text-3xl mt-1 block hover:text-[#D95D39] transition-colors"
              >
                {active.fullName}
              </Link>
              <p className="text-sm text-stone-600 mt-1">{active.condition}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {active.flags?.map((f) => (
                  <span key={f} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#E3ECE5] text-emerald-900 border border-emerald-100">
                    {f}
                  </span>
                ))}
              </div>
              {routeActive && !visitedIds.includes(active.id) && (
                <button
                  onClick={() => markVisited(active.id, active.fullName)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-sm font-semibold transition-colors"
                >
                  <CheckCircle className="h-4 w-4" /> Mark as visited
                </button>
              )}
              {routeActive && visitedIds.includes(active.id) && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#E3ECE5] border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-700">
                  <CheckCircle className="h-4 w-4" /> Visited
                </div>
              )}
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
              {/* Navigation buttons */}
              {active.lat && active.lng && (navPreference === "google" || navPreference === "both") && (
                <a
                  href={googleMapsUrl(active.lat, active.lng, active.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-blue-300 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
                >
                  <Navigation className="h-4 w-4" /> Google Maps
                </a>
              )}
              {active.lat && active.lng && (navPreference === "apple" || navPreference === "both") && (
                <a
                  href={appleMapsUrl(active.lat, active.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-50 transition-colors"
                >
                  <Navigation className="h-4 w-4" /> Apple Maps
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Optimization Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-3xl border border-stone-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
              <div>
                <h2 className="font-display text-2xl">Optimize route</h2>
                <p className="text-xs text-stone-500 mt-1">Choose how your route is ordered today</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-stone-100"><X className="h-4 w-4 text-stone-500" /></button>
            </div>
            <div className="px-6 py-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {OPTIMIZATION_MODES.map((m) => {
                const isActive = optimizationMode === m.id;
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      if (m.id === "saved") { setOptimizationMode(m.id); }
                      else { setOptimizationMode(m.id); applyOptimization(m.id); }
                    }}
                    data-testid={`opt-mode-${m.id}`}
                    className={`w-full text-left flex items-start gap-4 rounded-2xl border p-4 transition-all ${
                      isActive ? "bg-[#F7E5DD] border-[#D95D39] ring-1 ring-[#D95D39]/20" : "bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${isActive ? "bg-[#D95D39] text-white" : "bg-stone-100 text-stone-600"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`font-semibold text-sm ${isActive ? "text-[#D95D39]" : "text-stone-800"}`}>{m.label}</p>
                      <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{m.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="px-6 py-4 border-t border-stone-100 bg-[#F9F8F6] space-y-3">
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
                      <button key={r.id} onClick={() => { loadRoute(r.id); setModalOpen(false); }} className="w-full text-left rounded-xl bg-white border border-stone-200 p-3 hover:bg-stone-50 transition-colors">
                        <p className="text-sm font-semibold text-stone-800">{r.name}</p>
                        <p className="text-xs text-stone-500 mt-0.5">{r.stops?.length || 0} stops</p>
                      </button>
                    ))
                  )}
                </div>
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => applyOptimization(optimizationMode)}
                  data-testid="apply-optimization-btn"
                  disabled={optimizing}
                  className={`flex-1 inline-flex items-center justify-center gap-2 rounded-full h-11 text-sm font-semibold transition-colors ${optimizing ? "bg-stone-400 text-white cursor-wait" : "bg-stone-900 hover:bg-stone-800 text-white"}`}
                >
                  {optimizing ? (<><Loader className="h-4 w-4 animate-spin" /> Optimizing…</>) : (<><Sparkles className="h-4 w-4" /> Apply {OPTIMIZATION_MODES.find(m => m.id === optimizationMode)?.label || "optimization"}</>)}
                </button>
                <button
                  onClick={handleSaveRoute}
                  data-testid="save-route-btn"
                  className={`inline-flex items-center gap-2 rounded-full border h-11 px-4 text-sm font-semibold transition-colors ${justSaved ? "bg-[#E3ECE5] border-emerald-200 text-emerald-800" : "border-stone-300 text-stone-700 hover:bg-stone-50"}`}
                >
                  {justSaved ? (<><CheckCircle className="h-4 w-4" /> Saved</>) : (<><Loader className="h-4 w-4" /> Save</>)}
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
        initialTab={builderTab}
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
      <div className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">{label}</div>
      <div className="mt-1 text-sm font-medium text-stone-800">{value}</div>
    </div>
  );
}