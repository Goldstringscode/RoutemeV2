/**
 * NurseContext — owns all nurse-specific state and actions.
 *
 * Depends on: AuthContext (for userIdRef, userRole)
 * Provides:  useNurse() hook
 *
 * Extracted from RouteMeContext during Phase 2 of the context split.
 * Backwards-compatible — consumers continue using useRouteMe() which merges all contexts.
 */
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { CLIENTS_SEED, NURSE, AUDIT_LOG } from "@/lib/mockData";
import { supabase, signOut as supabaseSignOut } from "@/lib/supabase";
import { toast } from "@/hooks/useToast";
import { useAuth } from "./AuthContext";
import {
  loadSavedRoutes, deleteSavedRoute as deleteSavedRouteDB,
} from "@/lib/dataService";

const KEY = "routeme:nurse";
const NurseContext = createContext(null);
const devLog = (...args) => { if (process.env.NODE_ENV !== 'production') console.log(...args); };

/* ─── helpers ─────────────────────────────────────────── */

function mapClientFromDB(c) {
  return {
    id: c.id,
    initials: c.initials || '',
    fullName: c.full_name,
    dob: c.dob,
    phone: c.phone || '',
    address: c.address || '',
    window: c.time_window || '',
    duration: c.duration || 30,
    priority: c.priority || 'medium',
    flags: c.flags || [],
    condition: c.condition || '',
    lastVisit: c.last_visit || 'New client',
    photo: c.photo_url || null,
    lat: c.lat,
    lng: c.lng,
  };
}

function mapClientToDB(c) {
  return {
    full_name: c.fullName,
    initials: c.initials || '',
    dob: c.dob || null,
    phone: c.phone || '',
    address: c.address || '',
    time_window: c.window || '',
    duration: c.duration || 30,
    priority: c.priority || 'medium',
    flags: c.flags || [],
    condition: c.condition || '',
    last_visit: c.lastVisit || 'New client',
    photo_url: c.photo || null,
  };
}

const loadState = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
};

/* ─── Provider ────────────────────────────────────────── */

export function NurseProvider({ children }) {
  const { userIdRef } = useAuth();

  const initial = loadState();

  // Merge saved clients with seed data to fill missing fields (lat/lng, etc.)
  const mergedClients = initial?.clients ? initial.clients.map(saved => {
    const seed = CLIENTS_SEED.find(c => c.id === saved.id);
    return seed ? { ...seed, ...saved } : saved;
  }) : null;

  /* ─── Nurse-app state ──────────────────────────────── */
  const [clients, setClients] = useState(mergedClients ?? CLIENTS_SEED);
  const initialScheduleIds = initial?.scheduleIds ?? CLIENTS_SEED.map((c) => c.id);
  const [scheduleIds, setScheduleIds] = useState(initialScheduleIds);
  const originalOrderRef = useRef(initialScheduleIds);
  const [notes, setNotes] = useState(initial?.notes ?? {});
  const [audit, setAudit] = useState(initial?.audit ?? AUDIT_LOG);
  const [optimized, setOptimized] = useState(initial?.optimized ?? true);
  const [nurse, setNurse] = useState(NURSE);
  const [onboardingComplete, setOnboardingComplete] = useState(initial?.onboardingComplete ?? false);
  const [savedRoutes, setSavedRoutes] = useState(initial?.savedRoutes ?? []);
  const [notifications, setNotifications] = useState(initial?.notifications ?? [
    { id: "n1", type: "route", title: "Route optimized for tomorrow", body: "6 stops · saves you 22 minutes", t: "5 min ago", read: false },
    { id: "n2", type: "compliance", title: "License renewal reminder", body: "Your RN #2418906 expires in 47 days", t: "2 hours ago", read: false },
    { id: "n3", type: "message", title: "Priya Nair (Sunrise HH)", body: "Please add care flag for Eleanor Mabry (gate code changed)", t: "3 hours ago", read: false },
  ]);
  const unreadNotifications = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  const [optimizationMode, setOptimizationMode] = useState("ai");
  const [navPreference, _setNavPreference] = useState(() => {
    try {
      return localStorage.getItem("routeme:navPref") || "auto";
    } catch { return "auto"; }
  });
  const setNavPreference = useCallback((val) => {
    _setNavPreference(val);
    try { localStorage.setItem("routeme:navPref", val); } catch {}
  }, []);

  /* ─── Builder modal state ──────────────────────────── */
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderTab, setBuilderTab] = useState("new"); // "new" | "existing"

  /* ─── Voice note UI state ──────────────────────────── */
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceTarget, setVoiceTarget] = useState(null);
  const [noteViewMode, setNoteViewMode] = useState("compose");

  /* ─── Derived state ────────────────────────────────── */
  const schedule = useMemo(
    () => scheduleIds.map((id) => clients.find((c) => c.id === id)).filter(Boolean),
    [scheduleIds, clients]
  );

  /* ─── Persistent nurse state to localStorage ─────────── */
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        clients, scheduleIds, notes, audit, optimized, savedRoutes, notifications,
        onboardingComplete,
      }));
    } catch { /* quota exceeded — ignore */ }
  }, [clients, scheduleIds, notes, audit, optimized, savedRoutes, notifications, onboardingComplete]);

  /* ─── Nurse actions ───────────────────────────────── */

  const pushAudit = useCallback((label, type = "read") =>
    setAudit(a => [{ t: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), label, type }, ...a].slice(0, 24)), []);

  const addClient = useCallback((c) => {
    const id = "c" + Math.random().toString(36).slice(2, 8);
    const client = { id, ...c };
    setClients(cs => [client, ...cs]);
    setScheduleIds(ids => [id, ...ids]);
    pushAudit(`Client added — ${c.fullName}`, "write");
    if (userIdRef.current) {
      supabase.from('clients').insert({ ...mapClientToDB(c), id, nurse_id: userIdRef.current }).then().catch(err => {
        console.error("supabase error [addClient]:", err.message);
        pushAudit(`DB sync failed — add ${c.fullName}`, "error");
        toast.error(`Failed to save ${c.fullName} to database`);
      });
    }
  }, [pushAudit, userIdRef]);

  const updateClient = useCallback((id, patch) => {
    setClients(cs => cs.map(c => c.id === id ? { ...c, ...patch } : c));
    pushAudit(`Client updated — ${patch.fullName ?? id}`, "write");
    supabase.from('clients').update(mapClientToDB(patch)).eq('id', id).then().catch(err => {
      console.error("supabase error [updateClient]:", err.message);
      pushAudit(`DB sync failed — update ${patch.fullName ?? id}`, "error");
      toast.error("Failed to save client update");
    });
  }, [pushAudit]);

  const removeClient = useCallback((id) => {
    setClients(cs => cs.filter(c => c.id !== id));
    setScheduleIds(s => s.filter(sid => sid !== id));
    pushAudit(`Client removed`, "write");
    supabase.from('clients').delete().eq('id', id).then().catch(err => {
      console.error("supabase error [removeClient]:", err.message);
      pushAudit(`DB sync failed — remove client`, "error");
      toast.error("Failed to remove client from database");
    });
  }, [pushAudit]);

  const addNote = useCallback((clientId, text) => {
    setNotes(n => ({
      ...n,
      [clientId]: [{ id: Math.random().toString(36).slice(2, 8), text, date: new Date().toISOString() }, ...(n[clientId] ?? [])],
    }));
    pushAudit("Visit note saved", "note");
    if (userIdRef.current) {
      supabase.from('visit_notes').insert({ nurse_id: userIdRef.current, client_id: clientId, text, visit_type: 'Routine visit', status: 'Completed' }).then().catch(err => {
        console.error("supabase error [addNote]:", err.message);
        pushAudit(`DB sync failed — save note`, "error");
        toast.error("Failed to save visit note to database");
      });
    }
  }, [pushAudit, userIdRef]);

  const openVoice = useCallback((clientId) => {
    setVoiceTarget(clientId);
    setVoiceOpen(true);
  }, []);

  const markOnboardingComplete = useCallback(() => {
    setOnboardingComplete(true);
  }, []);

  const addNotification = useCallback((title, body, type = 'route') => {
    const n = {
      id: 'notif_' + Math.random().toString(36).slice(2, 10),
      type,
      title,
      body,
      t: 'just now',
      read: false,
    };
    setNotifications(ns => [n, ...ns]);
  }, []);

  const markNotificationRead = useCallback((id) => {
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications(ns => ns.filter(n => n.id !== id));
  }, []);

  /* ─── Saved routes ────────────────────────────────── */
  const saveRoute = useCallback(async (name, stopOrder) => {
    const newRoute = {
      id: "sr_" + Math.random().toString(36).slice(2, 10),
      name,
      stops: stopOrder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (userIdRef.current) {
      const { data, error } = await supabase.from('saved_routes').insert({
        nurse_id: userIdRef.current,
        name,
        stop_order: stopOrder,
      }).select().single();
      if (!error && data) {
        setSavedRoutes(rs => [{ id: data.id, name: data.name, stops: data.stop_order, createdAt: data.created_at, updatedAt: data.updated_at }, ...rs]);
        addNotification(`Route saved: ${name}`, `${stopOrder.length} stops`, 'route');
        toast.success(`Route "${name}" saved`);
        return;
      } else if (error) {
        toast.error("Failed to save route to database");
      }
    }

    setSavedRoutes(rs => [newRoute, ...rs]);
    addNotification(`Route saved: ${name}`, `${stopOrder.length} stops`, 'route');
  }, [addNotification, userIdRef]);

  const deleteSavedRoute = useCallback(async (routeId) => {
    setSavedRoutes(rs => rs.filter(r => r.id !== routeId));
    pushAudit(`Route deleted`, "route");
    const result = await deleteSavedRouteDB(routeId);
    if (result.error) {
      console.error("Failed to delete route:", result.error);
      pushAudit(`DB sync failed — delete route`, "error");
      toast.error("Failed to delete route from database");
    }
  }, [pushAudit]);

  /* ─── Home base update ────────────────────────────── */
  const updateNurseHomeBase = useCallback((homeBase) => {
    setNurse(n => ({ ...n, homeBase }));
    pushAudit(`Home base updated — ${homeBase.address}`, "write");
    supabase.from('profiles').update({ home_base: homeBase }).eq('id', userIdRef.current).then().catch(err => {
      console.error("supabase error [updateNurseHomeBase]:", err.message);
      toast.error("Failed to save home base update");
    });
  }, [pushAudit, userIdRef]);

  /* ─── Context value ───────────────────────────────── */
  const value = {
    nurse, setNurse,
    clients, setClients,
    schedule, scheduleIds, setScheduleIds, originalOrderRef,
    notes, setNotes,
    audit, pushAudit,
    optimized, setOptimized,
    onboardingComplete, markOnboardingComplete,
    savedRoutes, setSavedRoutes,
    notifications, unreadNotifications,
    optimizationMode, setOptimizationMode,
    navPreference, setNavPreference,
    builderOpen, setBuilderOpen, builderTab, setBuilderTab,
    voiceOpen, setVoiceOpen, voiceTarget, setVoiceTarget, openVoice, noteViewMode, setNoteViewMode,
    // Client CRUD
    addClient, updateClient, removeClient,
    // Notes
    addNote,
    // Notifications
    addNotification, markNotificationRead, markAllNotificationsRead, dismissNotification,
    // Saved routes
    saveRoute, deleteSavedRoute,
    // Home base
    updateNurseHomeBase,
  };

  return <NurseContext.Provider value={value}>{children}</NurseContext.Provider>;
}

export const useNurse = () => {
  const ctx = useContext(NurseContext);
  if (!ctx) throw new Error("useNurse must be used within NurseProvider");
  return ctx;
};