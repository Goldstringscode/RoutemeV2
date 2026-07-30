/**
 * RouteContext — owns all route-session state and route-optimization logic.
 *
 * Depends on: AuthContext (for userIdRef), NurseContext (for clients, schedule, nurse, etc.)
 * Provides:  useRoute() hook
 *
 * Extracted from RouteMeContext during Phase 3 of the context split.
 * Backwards-compatible — consumers continue using useRouteMe() which merges all contexts.
 */
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/useToast";
import { optimizeRoute, computeRouteMetrics, getDrivingConditions } from "@/lib/routeEngine";
import { fetchRoute, metersToMiles, secondsToShort } from "@/lib/directions";
import {
  evvClockIn as dataEvvClockIn,
  evvClockOut as dataEvvClockOut,
  evvSetServiceCode,
  evvAddOverride,
  loadEvvVisits,
  saveVisit, updateVisitNote,
  loadLatestRouteSession, saveRouteSession,
} from "@/lib/dataService";
import { useAuth } from "./AuthContext";
import { useNurse } from "./NurseContext";
import { enqueueEvvRecord, processEvvQueue } from "@/lib/evvOfflineQueue";

const KEY = "routeme:route";
const KEY_RECENT_CODES = "routeme:evvRecentCodes";
const RouteContext = createContext(null);
const devLog = (...args) => { if (process.env.NODE_ENV !== 'production') console.log(...args); };

/* ─── helpers ─────────────────────────────────────────── */

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}

function filterStaleRescheduled(rc) {
  if (!rc || typeof rc !== 'object') return {};
  const currentWeek = getWeekStart();
  const filtered = {};
  for (const [id, entry] of Object.entries(rc)) {
    if (entry?.weekStart === currentWeek) {
      filtered[id] = entry;
    }
  }
  return filtered;
}

const loadState = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
};

/* ─── Provider ────────────────────────────────────────── */

export function RouteProvider({ children }) {
  const { userIdRef } = useAuth();
  const {
    nurse, setNurse,
    clients, setClients,
    schedule, scheduleIds, setScheduleIds, originalOrderRef,
    optimized, setOptimized,
    pushAudit,
    optimizationMode,
    savedRoutes, setSavedRoutes,
    addNotification,
  } = useNurse();

  const initial = loadState();

  /* ─── Route session state ──────────────────────────── */
  const [routeActive, setRouteActive] = useState(initial?.routeActive ?? false);
  const [visitedIds, setVisitedIds] = useState(initial?.visitedIds ?? []);
  const [visits, setVisits] = useState(initial?.visits ?? []);
  const [routeResult, setRouteResult] = useState(initial?.routeResult ?? null);
  const [routeGeoJson, setRouteGeoJson] = useState(initial?.routeGeoJson ?? null);
  const [routeDistance, setRouteDistance] = useState(initial?.routeDistance ?? null);
  const [routeDuration, setRouteDuration] = useState(initial?.routeDuration ?? null);
  const [routeKey, setRouteKey] = useState(0);
  const [weatherData, setWeatherData] = useState(initial?.weatherData ?? null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [evvVisits, setEvvVisits] = useState({}); // clientId -> { status, visitStartedAt, visitEndedAt, serviceCode, etc }
  const [evvOverrideOpen, setEvvOverrideOpen] = useState(null); // clientId when override dialog open
  const [evvRecentCodes, setEvvRecentCodes] = useState(() => {
    try {
      const stored = localStorage.getItem(KEY_RECENT_CODES);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [rescheduledClients, setRescheduledClients] = useState(
    initial ? filterStaleRescheduled(initial?.rescheduledClients) : {}
  );

  /* ─── LocalStorage persistence ─────────────────────── */
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        routeActive, visitedIds, visits, routeResult, routeGeoJson,
        routeDistance, routeDuration, rescheduledClients, weatherData,
      }));
    } catch { /* quota exceeded — ignore */ }
  }, [routeActive, visitedIds, visits, routeResult, routeGeoJson,
      routeDistance, routeDuration, rescheduledClients, weatherData]);

  /* ─── Route management (hybrid — touches nurse+route) ─ */

  const reorder = useCallback((ids) => {
    setScheduleIds(ids);
    setOptimized(false);
    const orderedStops = ids.map((id) => clients.find((c) => c.id === id)).filter(Boolean);
    if (orderedStops.length >= 2) {
      const metrics = computeRouteMetrics(orderedStops, nurse.homeBase);
      setRouteResult(prev => {
        if (prev) return { ...prev, metrics };
        const now = new Date();
        const dow = now.getDay();
        const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        return { order: ids, metrics, validation: null, label: "Manual reorder", dayOfWeek: dayNames[dow], trafficMultiplier: 1.5, weather: "clear" };
      });
      setRouteKey(k => k + 1);
      fetchRoute(orderedStops, nurse.homeBase).then((route) => {
        if (route) {
          setRouteGeoJson(route.routeGeoJson);
          setRouteDistance(route.distance);
          setRouteDuration(route.duration);
        }
      }).catch((err) => {
        console.error("[RouteMe] fetchRoute error:", err);
        toast.error("Failed to load route directions");
      });
    }
  }, [clients, nurse.homeBase, setOptimized, setScheduleIds]);

  const optimize = useCallback((mode) => {
    const optMode = mode || optimizationMode;
    const stopsToOptimize = routeActive && visitedIds.length > 0
      ? schedule.filter(s => !visitedIds.includes(s.id))
      : schedule;
    const result = optimizeRoute(stopsToOptimize, optMode, savedRoutes, nurse.homeBase);
    if (result.order?.length) {
      const finalOrder = routeActive && visitedIds.length > 0
        ? [...result.order, ...visitedIds.filter(id => scheduleIds.includes(id))]
        : result.order;
      setScheduleIds(finalOrder);
      setOptimized(true);
      setRouteResult(result);
      pushAudit(`Route re-optimized (${optMode})`, "route");
      const orderedStops = result.order.map((id) => stopsToOptimize.find((s) => s.id === id)).filter(Boolean);
      if (orderedStops.length >= 2) {
        const badStops = orderedStops.filter(s => s.lat == null || s.lng == null);
        if (badStops.length > 0) {
          console.warn("[RouteMe] Stops missing coordinates:", badStops.map(s => s.id).join(","));
        }
        const validStops = orderedStops.filter(s => s.lat != null && s.lng != null);
        if (validStops.length < 2) {
          console.warn("[RouteMe] Not enough valid stops to fetch route");
          return;
        }
        devLog("[RouteMe] Optimize: fetching Mapbox route for", validStops.length, "stops");
        fetchRoute(validStops, nurse.homeBase).then((route) => {
          if (route) {
            devLog("[RouteMe] Route fetched:", metersToMiles(route.distance), "mi,", secondsToShort(route.duration));
            setRouteGeoJson(route.routeGeoJson);
            setRouteDistance(route.distance);
            setRouteDuration(route.duration);
          } else {
            console.warn("[RouteMe] fetchRoute returned null");
          }
        }).catch((err) => {
          console.error("[RouteMe] fetchRoute error:", err);
          toast.error("Failed to load route directions");
        });
      }
    }
  }, [schedule, optimizationMode, savedRoutes, pushAudit, routeActive, visitedIds,
      scheduleIds, nurse.homeBase, setOptimized, setScheduleIds]);

  const resetRouteOrder = useCallback(() => {
    setScheduleIds([...originalOrderRef.current]);
    setOptimized(false);
    setRouteResult(null);
    setRouteGeoJson(null);
    setRouteDistance(null);
    setRouteDuration(null);
    pushAudit("Route reset to original order", "route");
  }, [pushAudit, setOptimized, setScheduleIds, originalOrderRef]);

  const loadRoute = useCallback((routeId) => {
    const route = savedRoutes.find(r => r.id === routeId);
    if (route?.stops?.length) {
      setScheduleIds(route.stops);
      setOptimized(true);
      const orderedStops = route.stops.map(id => clients.find(c => c.id === id)).filter(Boolean);
      if (orderedStops.length >= 2) {
        const metrics = computeRouteMetrics(orderedStops, nurse.homeBase);
        setRouteResult(prev => {
          if (prev) return { ...prev, metrics };
          const now = new Date();
          const dow = now.getDay();
          const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
          return { order: route.stops, metrics, validation: null, label: "Loaded route", dayOfWeek: dayNames[dow], trafficMultiplier: 1.5, weather: "clear" };
        });
        fetchRoute(orderedStops).then(r => {
          if (r) { setRouteGeoJson(r.routeGeoJson); setRouteDistance(r.distance); setRouteDuration(r.duration); }
        }).catch(() => {
          toast.error("Failed to load route directions");
        });
      }
    }
  }, [savedRoutes, clients, nurse.homeBase, setOptimized, setScheduleIds]);

  const removeFromRoute = useCallback((id) => {
    setScheduleIds(ids => {
      const newIds = ids.filter(sid => sid !== id);
      const remaining = newIds.map(sid => clients.find(c => c.id === sid)).filter(Boolean);
      if (remaining.length >= 2) {
        const metrics = computeRouteMetrics(remaining, nurse.homeBase);
        setRouteResult(prev => {
          if (prev) return { ...prev, metrics };
          const now = new Date(); const dow = now.getDay(); const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
          return { order: newIds, metrics, validation: null, label: "Manual edit", dayOfWeek: dayNames[dow], trafficMultiplier: 1.5, weather: "clear" };
        });
        fetchRoute(remaining).then(route => {
          if (route) { setRouteGeoJson(route.routeGeoJson); setRouteDistance(route.distance); setRouteDuration(route.duration); }
        }).catch(() => toast.error("Failed to load route directions"));
      } else {
        setRouteResult(null);
        setRouteGeoJson(null);
        setRouteDistance(null);
        setRouteDuration(null);
      }
      return newIds;
    });
    pushAudit(`Client removed from route`, "write");
  }, [pushAudit, clients, nurse.homeBase, setScheduleIds]);

  const createRoute = useCallback((clientIds) => {
    setScheduleIds(clientIds);
    setOptimized(false);
    setRouteResult(null);
    const orderedStops = clientIds.map(id => clients.find(c => c.id === id)).filter(Boolean);
    if (orderedStops.length >= 2) {
      fetchRoute(orderedStops).then(route => {
        if (route) {
          setRouteGeoJson(route.routeGeoJson);
          setRouteDistance(route.distance);
          setRouteDuration(route.duration);
        }
      }).catch(() => toast.error("Failed to load route directions"));
    }
    pushAudit(`Route created — ${clientIds.length} stops`, "route");
  }, [pushAudit, clients, setOptimized, setScheduleIds]);

  const rescheduleClient = useCallback((id, day) => {
    const weekStart = getWeekStart();
    setScheduleIds(ids => ids.filter(sid => sid !== id));
    setRescheduledClients(rc => ({
      ...rc,
      [id]: { day, weekStart, clientId: id },
    }));
    pushAudit(`Client rescheduled to ${day}`, "write");
  }, [pushAudit, setScheduleIds]);

  const clearRescheduled = useCallback(() => {
    setRescheduledClients({});
    pushAudit("Rescheduled clients cleared", "write");
  }, [pushAudit]);

  /* ─── Initial Mapbox route fetch ───────────────────── */
  const routeFetchedRef = useRef(false);
  useEffect(() => {
    if (schedule.length >= 2 && !routeGeoJson && !routeFetchedRef.current) {
      routeFetchedRef.current = true;
      devLog("[RouteMe] Initial fetch for", schedule.length, "stops");
      const initialMetrics = computeRouteMetrics(schedule, nurse.homeBase);
      setRouteResult({
        order: schedule.map(s => s.id),
        metrics: initialMetrics,
        validation: null,
        label: "Initial route",
        dayOfWeek: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()],
        trafficMultiplier: 1.5,
        weather: "clear",
      });
      fetchRoute(schedule, nurse.homeBase).then((route) => {
        if (route) {
          devLog("[RouteMe] Initial route:", metersToMiles(route.distance), "mi,", secondsToShort(route.duration));
          setRouteGeoJson(route.routeGeoJson);
          setRouteDistance(route.distance);
          setRouteDuration(route.duration);
        } else {
          console.warn("[RouteMe] Initial fetchRoute returned null");
        }
      }).catch((err) => {
        console.error("[RouteMe] Initial fetchRoute error:", err);
        toast.error("Failed to load initial route directions");
      });
    }
  }, [schedule, routeGeoJson, nurse.homeBase]);

  /* ─── Weather fetch ────────────────────────────────── */
  const fetchWeather = useCallback(async () => {
    if (weatherLoading || weatherData) return;
    const lat = nurse?.homeBase?.lat || 33.7726;
    const lng = nurse?.homeBase?.lng || -117.5928;
    const city = nurse?.homeBase?.address?.split(",")[0] || "Corona";
    setWeatherLoading(true);
    try {
      const resp = await fetch(`/api/weather?lat=${lat}&lon=${lng}`);
      if (!resp.ok) throw new Error(`Weather proxy returned ${resp.status}`);
      const data = await resp.json();
      setWeatherData({
        temp: Math.round(data.main?.temp ?? 72),
        feelsLike: Math.round(data.main?.feels_like ?? 70),
        humidity: data.main?.humidity ?? 50,
        condition: data.weather?.[0]?.main || "Clear",
        description: data.weather?.[0]?.description || "clear sky",
        icon: data.weather?.[0]?.icon || "01d",
        windSpeed: data.wind?.speed || 0,
        visibility: data.visibility || 10000,
        city: data.name || city,
      });
    } catch {
      const dows = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
      const dow = dows[new Date().getDay()];
      const mock = getDrivingConditions(dow);
      setWeatherData({
        temp: Math.round(68 + Math.random() * 20),
        feelsLike: Math.round(66 + Math.random() * 18),
        humidity: Math.round(40 + Math.random() * 30),
        condition: "Clear", description: "clear sky",
        icon: "01d", windSpeed: 6, visibility: 10000,
        city,
      });
    } finally {
      setWeatherLoading(false);
    }
  }, [weatherLoading, weatherData, nurse.homeBase]);

  // Fetch weather on mount
  useEffect(() => { fetchWeather(); }, [fetchWeather]);

  /* ─── Route session (start/end, visits) ────────────── */
  const startRoute = useCallback(() => {
    setRouteActive(true);
    setVisitedIds([]);
    // Sync to localStorage
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const state = JSON.parse(raw);
        state.routeActive = true;
        state.visitedIds = [];
        localStorage.setItem(KEY, JSON.stringify(state));
      }
    } catch { /* localStorage unavailable */ }
    pushAudit("Route started", "route");
    saveRouteSession({ active: true, visitedIds: [], startedAt: new Date().toISOString() }, userIdRef.current).catch(() => {
      toast.error("Failed to save route session");
    });
  }, [pushAudit, userIdRef]);

  const endRoute = useCallback(() => {
    setRouteActive(false);
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const state = JSON.parse(raw);
        state.routeActive = false;
        localStorage.setItem(KEY, JSON.stringify(state));
      }
    } catch { /* localStorage unavailable */ }
    pushAudit(`Route ended — ${visitedIds.length} visits completed`, "route");
    saveRouteSession({ active: false, visitedIds, endedAt: new Date().toISOString() }, userIdRef.current).catch(() => {
      toast.error("Failed to save route session end");
    });
  }, [pushAudit, userIdRef, visitedIds]);

  const markVisited = useCallback((clientId, clientName) => {
    setVisitedIds(prev => [...prev, clientId]);
    const visit = {
      id: "v_" + Math.random().toString(36).slice(2, 10),
      clientId,
      clientName,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString(),
      notes: '',
    };
    setVisits(prev => [visit, ...prev]);
    pushAudit(`Visit completed — ${clientName}`, "write");
    // Persist to Supabase
    saveVisit(visit, userIdRef.current).then(result => {
      if (result.error) {
        console.error("Failed to save visit:", result.error);
        pushAudit(`DB sync failed — record visit`, "error");
        toast.error("Failed to save visit record");
      }
    });
    // Re-fetch route for remaining unvisited stops
    const remainingStops = schedule.filter(s => s.id !== clientId);
    const validRemaining = remainingStops.filter(s => s.lat != null && s.lng != null);
    if (validRemaining.length >= 2) {
      fetchRoute(validRemaining, nurse.homeBase).then((route) => {
        if (route) {
          setRouteGeoJson(route.routeGeoJson);
          setRouteDistance(route.distance);
          setRouteDuration(route.duration);
        }
      }).catch(() => {
        toast.error("Failed to load route directions");
      });
    } else if (validRemaining.length === 0) {
      setRouteGeoJson(null);
      setRouteDistance(null);
      setRouteDuration(null);
    }
  }, [pushAudit, schedule, nurse, userIdRef]);

  const unmarkVisited = useCallback((clientId) => {
    setVisitedIds(prev => prev.filter(id => id !== clientId));
  }, []);

  /* ─── EVV (Electronic Visit Verification) ──────────── */
  const evvClockIn = useCallback(async (clientId, gpsData) => {
    const id = userIdRef.current;
    if (!id || !clientId) return;

    const entry = {
      status: gpsData ? "clocked_in" : "clocked_in_no_gps",
      visitStartedAt: gpsData?.capturedAt || new Date().toISOString(),
      gps: gpsData,
      serviceCode: null,
      serviceDescription: null,
    };

    setEvvVisits(prev => ({ ...prev, [clientId]: entry }));

    const { data, error } = await dataEvvClockIn(id, clientId, gpsData || {});
    if (data) {
      setEvvVisits(prev => ({
        ...prev,
        [clientId]: { ...entry, evvVisitId: data.id },
      }));
    }
    if (error || !gpsData) {
      // Queue offline if network error, otherwise show override dialog
      if (error && error.message?.includes("Failed to fetch")) {
        await enqueueEvvRecord({
          type: "clockIn",
          nurseId: id,
          clientId,
          gpsData: gpsData || null,
        });
        toast.info("Network unavailable — EVV clock-in queued for sync");
      } else {
        setEvvOverrideOpen(clientId);
      }
    }
  }, []);

  const evvClockOut = useCallback(async (clientId, gpsData) => {
    const current = evvVisits[clientId];
    if (!current?.evvVisitId) return;

    setEvvVisits(prev => ({
      ...prev,
      [clientId]: { ...prev[clientId], status: "clocked_out", visitEndedAt: gpsData?.capturedAt || new Date().toISOString(), endGps: gpsData },
    }));

    const { error } = await dataEvvClockOut(current.evvVisitId, gpsData || {});
    if (error || !gpsData) {
      // Queue offline if network error, otherwise show override dialog
      if (error && error.message?.includes("Failed to fetch")) {
        await enqueueEvvRecord({
          type: "clockOut",
          evvVisitId: current.evvVisitId,
          clientId,
          gpsData: gpsData || null,
        });
        toast.info("Network unavailable — EVV clock-out queued for sync");
      } else {
        setEvvOverrideOpen(clientId);
      }
    }
  }, [evvVisits]);

  const evvSetCode = useCallback(async (clientId, code, description) => {
    const current = evvVisits[clientId];
    setEvvVisits(prev => ({ ...prev, [clientId]: { ...prev[clientId], serviceCode: code, serviceDescription: description } }));
    if (current?.evvVisitId) {
      await evvSetServiceCode(current.evvVisitId, code, description);
    }
    // Track MRU codes (max 5, keep newest first, avoid duplicates)
    setEvvRecentCodes(prev => {
      const filtered = prev.filter(c => c !== code);
      const updated = [code, ...filtered].slice(0, 5);
      try { localStorage.setItem(KEY_RECENT_CODES, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, [evvVisits]);

  const evvAddOverrideReason = useCallback(async (clientId, overrideData) => {
    const current = evvVisits[clientId];
    setEvvVisits(prev => ({ ...prev, [clientId]: { ...prev[clientId], override: overrideData } }));
    if (current?.evvVisitId) {
      await evvAddOverride(current.evvVisitId, overrideData);
    }
    setEvvOverrideOpen(null);
  }, [evvVisits]);

  const addVisitNote = useCallback((visitId, notes) => {
    setVisits(prev => prev.map(v => v.id === visitId ? { ...v, notes } : v));
    updateVisitNote(visitId, notes).then(result => {
      if (result.error) {
        console.error("Failed to update visit note:", result.error);
        toast.error("Failed to update visit note");
      }
    });
  }, []);

  /* ─── Context value ───────────────────────────────── */
  const value = {
    // Route session
    routeActive, setRouteActive,
    visitedIds, setVisitedIds,
    visits, setVisits,
    startRoute, endRoute,
    markVisited, unmarkVisited, addVisitNote,
    // Route data
    routeResult, setRouteResult,
    routeGeoJson, setRouteGeoJson,
    routeDistance, setRouteDistance,
    routeDuration, setRouteDuration,
    routeKey, setRouteKey,
    // Route management
    reorder, optimize, resetRouteOrder,
    loadRoute, removeFromRoute, createRoute,
    rescheduleClient, clearRescheduled,
    rescheduledClients, setRescheduledClients,
    // Weather
    weatherData, setWeatherData,
    weatherLoading, setWeatherLoading,
    fetchWeather,
    // EVV
    evvVisits, setEvvVisits,
    evvOverrideOpen, setEvvOverrideOpen,
    evvClockIn, evvClockOut,
    evvSetCode, evvAddOverrideReason,
    evvRecentCodes, setEvvRecentCodes,
  };

  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
}

export const useRoute = () => {
  const ctx = useContext(RouteContext);
  if (!ctx) throw new Error("useRoute must be used within RouteProvider");
  return ctx;
};