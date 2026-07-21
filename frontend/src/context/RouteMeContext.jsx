import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { CLIENTS_SEED, NURSE, AUDIT_LOG } from "@/lib/mockData";
import {
  AGENCY,
  NURSES_SEED,
  LIVE_ACTIVITY_SEED,
  AGENCY_CLIENTS,
  COMPLIANCE_LOG_SEED,
} from "@/lib/agencyMockData";
import {
  PLATFORM,
  SUPER_ADMIN_ME,
  AGENCIES_SEED,
  GLOBAL_NURSES_SEED,
  GLOBAL_CLIENTS_SEED,
  SUPER_ADMINS_SEED,
  GLOBAL_AUDIT_SEED,
  ACTIVE_SESSIONS_SEED,
  SECURITY_EVENTS_SEED,
  SYSTEM_METRICS,
  BILLING_LEDGER_SEED,
} from "@/lib/superAdminMockData";
import { supabase, signOut } from "@/lib/supabase";
import { optimizeRoute, computeRouteSummary, getDrivingConditions } from "@/lib/routeEngine";

const KEY = "routeme.state.v1";
const RouteMeContext = createContext(null);

/* ─── helpers ─────────────────────────────────────────── */

function haversine(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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

/* ─── localStorage helpers ────────────────────────────── */

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

export function RouteMeProvider({ children }) {
  const initial = loadState();
  const lastUserId = useRef(null);
  const userIdRef = useRef(null);

  /* ─── Auth / loading state ─────────────────────────── */
  const [supabaseReady, setSupabaseReady] = useState(false);
    const [dataReady, setDataReady] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userAgencyId, setUserAgencyId] = useState(null);

  /* ─── Nurse-app state ──────────────────────────────── */
  const [authed, setAuthed] = useState(initial?.authed ?? false);
  const [clients, setClients] = useState(initial?.clients ?? CLIENTS_SEED);
  const [scheduleIds, setScheduleIds] = useState(initial?.scheduleIds ?? CLIENTS_SEED.map((c) => c.id));
  const [notes, setNotes] = useState(initial?.notes ?? {});
  const [audit, setAudit] = useState(initial?.audit ?? AUDIT_LOG);
  const [optimized, setOptimized] = useState(initial?.optimized ?? true);
  const [nurse, setNurse] = useState(NURSE);
  const [savedRoutes, setSavedRoutes] = useState(initial?.savedRoutes ?? []);
  const [optimizationMode, setOptimizationMode] = useState("ai");
    const [routeResult, setRouteResult] = useState(null);
    const [rescheduledClients, setRescheduledClients] = useState(initial ? filterStaleRescheduled(initial?.rescheduledClients) : {});

  /* ─── Voice note UI state ──────────────────────────── */
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceTarget, setVoiceTarget] = useState(null);
  const [noteViewMode, setNoteViewMode] = useState("compose");

  /* ─── Agency-admin state ───────────────────────────── */
  const [agencyAuthed, setAgencyAuthed] = useState(initial?.agencyAuthed ?? false);
  const [agency, setAgency] = useState(initial?.agency ?? AGENCY);
  const [nurses, setNurses] = useState(initial?.nurses ?? NURSES_SEED);
  const [liveActivity, setLiveActivity] = useState(initial?.liveActivity ?? LIVE_ACTIVITY_SEED);
  const [agencyClients, setAgencyClients] = useState(initial?.agencyClients ?? AGENCY_CLIENTS);
  const [complianceLog, setComplianceLog] = useState(initial?.complianceLog ?? COMPLIANCE_LOG_SEED);

  /* ─── Super-admin (platform) state ─────────────────── */
  const [superAdminAuthed, setSuperAdminAuthed] = useState(initial?.superAdminAuthed ?? false);
  const [platform] = useState(PLATFORM);
  const [superAdminMe] = useState(SUPER_ADMIN_ME);
  const [agencies, setAgencies] = useState(initial?.agencies ?? AGENCIES_SEED);
  const [globalNurses, setGlobalNurses] = useState(initial?.globalNurses ?? GLOBAL_NURSES_SEED);
  const [globalClients, setGlobalClients] = useState(initial?.globalClients ?? GLOBAL_CLIENTS_SEED);
  const [superAdmins, setSuperAdmins] = useState(initial?.superAdmins ?? SUPER_ADMINS_SEED);
  const [globalAudit, setGlobalAudit] = useState(initial?.globalAudit ?? GLOBAL_AUDIT_SEED);
  const [activeSessions, setActiveSessions] = useState(initial?.activeSessions ?? ACTIVE_SESSIONS_SEED);
  const [securityEvents] = useState(SECURITY_EVENTS_SEED);
  const [systemMetrics] = useState(SYSTEM_METRICS);
  const [billingLedger, setBillingLedger] = useState(initial?.billingLedger ?? BILLING_LEDGER_SEED);
  const [featureFlags, setFeatureFlags] = useState(initial?.featureFlags ?? SYSTEM_METRICS.featureFlags);
  const [phiRevealed, setPhiRevealed] = useState(initial?.phiRevealed ?? {});
  const [maintenanceMode, setMaintenanceMode] = useState(initial?.maintenanceMode ?? false);
  const [impersonation, setImpersonation] = useState(initial?.impersonation ?? null);

  /* ─── Role-aware data loading ──────────────────────── */
  const loadData = useCallback(async (userId) => {
    if (!userId) return;
    if (lastUserId.current === userId && dataReady) return;
    lastUserId.current = userId;
    userIdRef.current = userId;
    setLoadingError(null);

    try {
      // 1. Load profile → get role + agency_id
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const role = profile?.role ?? 'nurse';
      const agencyId = profile?.agency_id ?? null;
      setUserRole(role);
      setUserAgencyId(agencyId);

      // 2. Set nurse profile (always)
      setNurse(profile ? {
        name: profile.name || NURSE.name,
        title: profile.title || NURSE.title,
        license: profile.license || NURSE.license,
        region: profile.region || NURSE.region,
        avatar: profile.avatar_url || NURSE.avatar,
      } : NURSE);

      // 3. Role-appropriate data loading
      if (role === 'nurse') {
        // ── Nurse: load own data ──
        const { data: clientData } = await supabase
          .from('clients').select('*').eq('nurse_id', userId).order('created_at', { ascending: false });
        setClients(clientData?.length ? clientData.map(mapClientFromDB) : CLIENTS_SEED);

        const today = new Date().toISOString().split('T')[0];
        const { data: schedData } = await supabase
          .from('schedules').select('*').eq('nurse_id', userId).eq('visit_date', today).order('sort_order', { ascending: true });
        if (schedData?.length) {
          setScheduleIds(schedData.map(s => s.client_id));
          setOptimized(true);
        }

        const { data: noteData } = await supabase
          .from('visit_notes').select('*').eq('nurse_id', userId).order('created_at', { ascending: false });
        if (noteData?.length) {
          const grouped = {};
          for (const n of noteData) {
            if (!grouped[n.client_id]) grouped[n.client_id] = [];
            grouped[n.client_id].push({ id: n.id, text: n.text, visitType: n.visit_type || 'Routine visit', status: n.status || 'Completed', date: n.created_at });
          }
          setNotes(grouped);
        }

        const { data: auditData } = await supabase
          .from('audit_logs').select('*').eq('nurse_id', userId).order('created_at', { ascending: false }).limit(24);
        if (auditData?.length) {
          setAudit(auditData.map(a => ({ t: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), label: a.label, type: a.type || 'read' })));
        }

        const { data: routeData } = await supabase
          .from('saved_routes').select('*').eq('nurse_id', userId).order('updated_at', { ascending: false });
        if (routeData?.length) {
          setSavedRoutes(routeData.map(r => ({ id: r.id, name: r.name, stops: r.stop_order, createdAt: r.created_at, updatedAt: r.updated_at })));
        }
      }

      if (role === 'agency_admin' && agencyId) {
        // ── Agency Admin: load agency, nurses, clients, audit ──
        const { data: agencyData } = await supabase
          .from('agencies').select('*').eq('id', agencyId).single();
        if (agencyData) {
          setAgency({
            id: agencyData.id,
            name: agencyData.name,
            logo: (agencyData.name || '').split(' ').map(s => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase(),
            plan: agencyData.subscription_tier === 'starter' ? 'Growth' : agencyData.subscription_tier === 'pro' ? 'Scale' : 'Enterprise',
            seatsUsed: 0, // computed below
            seatsTotal: agencyData.subscription_tier === 'starter' ? 20 : agencyData.subscription_tier === 'pro' ? 100 : 999,
            monthlyCost: 0, // computed from seats
            hipaaScore: 98,
            admin: { name: profile?.name || 'Admin', title: 'Agency Director', email: profile?.name || '', avatar: profile?.avatar_url || '' },
          });
        }

        const { data: nurseData } = await supabase
          .from('profiles').select('*').eq('agency_id', agencyId).order('created_at', { ascending: false });
        if (nurseData?.length) {
          setNurses(nurseData.map(n => ({
            id: n.id,
            name: n.name || 'Unknown',
            email: n.email || '',
            zone: n.region || 'Unassigned',
            status: 'active',
            lastActive: '—',
            visitsToday: 0,
            weeklySaved: 0,
            role: n.title || 'Registered Nurse',
            avatar: n.avatar_url || null,
            currentStop: null,
            complianceOk: true,
          })));
        }

        const { data: clientData } = await supabase
          .from('clients').select('*').eq('agency_id', agencyId).order('created_at', { ascending: false });
        if (clientData?.length) {
          setAgencyClients(clientData.map((c, i) => ({
                      id: c.id,
                      name: c.full_name || 'Unknown',
                      fullName: c.full_name || 'Unknown',
                      nurseId: c.nurse_id || '',
                      city: (c.address || '').split(',').slice(-2).join(', ').trim() || 'Unknown',
                      address: c.address || '',
                      phone: c.phone || '',
                      dob: c.dob || '',
                      condition: c.condition || '—',
                      window: c.time_window || '',
                      duration: c.duration || 30,
                      priority: c.priority || 'medium',
                      flags: c.flags || [],
                      lastVisit: c.last_visit || 'New client',
                      visitsWeek: Math.ceil((c.duration || 30) / 30) || 1,
                      caregiverName: c.caregiver_name || '',
                      caregiverPhone: c.caregiver_phone || '',
                      initials: c.initials || '',
                      lat: c.lat,
                      lng: c.lng,
                    })));
        }

        const { data: auditData } = await supabase
          .from('audit_logs').select('*').eq('agency_id', agencyId).order('created_at', { ascending: false }).limit(24);
        if (auditData?.length) {
          setComplianceLog(auditData.map(a => ({
            t: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            nurseId: a.nurse_id || '',
            event: a.label || 'Event',
            severity: a.type === 'critical' || a.type === 'warn' ? a.type : 'info',
          })));
          setLiveActivity(auditData.slice(0, 12).map(a => ({
            t: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            nurseId: a.nurse_id || '',
            label: a.label || 'Activity',
            type: a.type || 'auth',
          })));
        }

        // Update seats used
        setAgency(prev => ({ ...prev, seatsUsed: nurseData?.length ?? 0, monthlyCost: (nurseData?.length ?? 0) * 65 }));
      }

      if (role === 'super_admin') {
        // ── Super Admin: load everything ──
        const { data: agencyData } = await supabase.from('agencies').select('*').order('created_at', { ascending: false });
        if (agencyData?.length) {
          setAgencies(agencyData.map(a => ({
            id: a.id,
            name: a.name,
            logo: (a.name || '').split(' ').map(s => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase(),
            city: '—',
            plan: a.subscription_tier === 'starter' ? 'Growth' : a.subscription_tier === 'pro' ? 'Scale' : 'Enterprise',
            seatsUsed: 0,
            seatsTotal: a.subscription_tier === 'starter' ? 20 : a.subscription_tier === 'pro' ? 100 : 999,
            mrr: 0,
            hipaaScore: 98,
            status: a.subscription_status === 'active' ? 'active' : a.subscription_status === 'trialing' ? 'trial' : 'suspended',
            director: { name: '—', email: '—' },
            nurses: 0,
            clients: 0,
            createdAt: a.created_at ? new Date(a.created_at).toISOString().split('T')[0] : '—',
          })));
        }

        const { data: nurseData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (nurseData?.length) {
          setGlobalNurses(nurseData.map(n => ({
            id: n.id,
            name: n.name || 'Unknown',
            email: n.email || '',
            zone: n.region || '—',
            status: 'active',
            role: n.title || 'Nurse',
            agencyId: n.agency_id,
            avatar: n.avatar_url || null,
            visitsToday: 0,
            weeklySaved: 0,
          })));
        }

        const { data: clientData } = await supabase.from('clients').select('*').order('created_at', { ascending: false }).limit(100);
        if (clientData?.length) {
          setGlobalClients(clientData.map(c => ({
            id: c.id,
            fullName: c.full_name || 'Unknown',
            mrn: `MRN-${(c.id || '').slice(0, 8).toUpperCase()}`,
            dob: c.dob || '—',
            conditions: [c.condition || '—'],
            phone: c.phone || '—',
            address: c.address || '—',
            nurseId: c.nurse_id,
            agencyId: c.agency_id,
          })));
        }

        const { data: auditData } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50);
        if (auditData?.length) {
          setGlobalAudit(auditData.map(a => ({
            t: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actorId: a.nurse_id || '',
            actorName: '—',
            actorRole: 'Nurse',
            action: a.label || 'Action',
            resource: a.type || '—',
            agencyId: a.agency_id,
            severity: a.type === 'critical' ? 'critical' : a.type === 'warn' ? 'warn' : 'info',
            ip: '—',
          })));
        }
      }

      setDataReady(true);
    } catch (err) {
      console.warn('RouteMe: Data load error:', err);
      setLoadingError(err.message || 'Unknown error');
      setDataReady(true);
    }
  }, [dataReady]);

  /* ─── Supabase session check ──────────────────────────── */
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await loadData(session.user.id);
          setAuthed(true);
        }
        setSupabaseReady(true);
      } catch {
        setSupabaseReady(true);
      }
    };
    init();
  }, [loadData]);

  /* ─── localStorage persistence ─────────────────────────── */
    useEffect(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify({
          authed, clients, scheduleIds, notes, audit, optimized, savedRoutes,
          agencyAuthed, nurses, liveActivity, agencyClients, complianceLog,
          superAdminAuthed, agencies, globalNurses, globalClients, superAdmins,
          globalAudit, activeSessions, billingLedger, featureFlags,
          phiRevealed, maintenanceMode, impersonation, routeResult, rescheduledClients,
        }));
      } catch { /* quota exceeded — ignore */ }
    }, [
      authed, clients, scheduleIds, notes, audit, optimized, savedRoutes,
      agencyAuthed, nurses, liveActivity, agencyClients, complianceLog,
      superAdminAuthed, agencies, globalNurses, globalClients, superAdmins,
      globalAudit, activeSessions, billingLedger, featureFlags,
      phiRevealed, maintenanceMode, impersonation, routeResult, rescheduledClients,
    ]);

  const schedule = useMemo(
    () => scheduleIds.map((id) => clients.find((c) => c.id === id)).filter(Boolean),
    [scheduleIds, clients]
  );

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
      });
    }
  }, [pushAudit]);

  const updateClient = useCallback((id, patch) => {
    setClients(cs => cs.map(c => c.id === id ? { ...c, ...patch } : c));
    pushAudit(`Client updated — ${patch.fullName ?? id}`, "write");
    supabase.from('clients').update(mapClientToDB(patch)).eq('id', id).then().catch(err => {
      console.error("supabase error [updateClient]:", err.message);
      pushAudit(`DB sync failed — update ${patch.fullName ?? id}`, "error");
    });
  }, [pushAudit]);

  const removeClient = useCallback((id) => {
    setClients(cs => cs.filter(c => c.id !== id));
    setScheduleIds(s => s.filter(sid => sid !== id));
    pushAudit(`Client removed`, "write");
    supabase.from('clients').delete().eq('id', id).then().catch(err => {
      console.error("supabase error [removeClient]:", err.message);
      pushAudit(`DB sync failed — remove client`, "error");
    });
  }, [pushAudit]);

  const reorder = useCallback((ids) => {
    setScheduleIds(ids);
    setOptimized(false);
  }, []);

  const optimize = useCallback((mode) => {
      const optMode = mode || optimizationMode;
      const result = optimizeRoute(schedule, optMode, savedRoutes);
      if (result.order?.length) {
        setScheduleIds(result.order);
        setOptimized(true);
        setRouteResult(result);
        pushAudit(`Route re-optimized (${optMode})`, "route");
      }
    }, [schedule, optimizationMode, savedRoutes, pushAudit]);

  const addNote = useCallback((clientId, text) => {
    setNotes(n => ({
      ...n,
      [clientId]: [{ id: Math.random().toString(36).slice(2, 8), text, date: new Date().toISOString() }, ...(n[clientId] ?? [])],
    }));
    pushAudit("Voice note transcribed", "note");
    if (userIdRef.current) {
      supabase.from('visit_notes').insert({ nurse_id: userIdRef.current, client_id: clientId, text, visit_type: 'Routine visit', status: 'Completed' }).then().catch(err => {
        console.error("supabase error [addNote]:", err.message);
        pushAudit(`DB sync failed — save note`, "error");
      });
    }
  }, [pushAudit]);

  const openVoice = useCallback((clientId) => {
    setVoiceTarget(clientId);
    setVoiceOpen(true);
  }, []);

  /* ─── Saved routes ────────────────────────────────── */
  const saveRoute = useCallback(async (name, stopOrder) => {
    if (!userIdRef.current) return;
    const { data, error } = await supabase.from('saved_routes').insert({
      nurse_id: userIdRef.current,
      name,
      stop_order: stopOrder,
    }).select().single();
    if (!error && data) {
      setSavedRoutes(rs => [{ id: data.id, name: data.name, stops: data.stop_order, createdAt: data.created_at, updatedAt: data.updated_at }, ...rs]);
    }
  }, []);

  const loadRoute = useCallback((routeId) => {
    const route = savedRoutes.find(r => r.id === routeId);
    if (route?.stops?.length) setScheduleIds(route.stops);
  }, [savedRoutes]);

  const deleteSavedRoute = useCallback(async (routeId) => {
      setSavedRoutes(rs => rs.filter(r => r.id !== routeId));
      await supabase.from('saved_routes').delete().eq('id', routeId);
    }, []);

    /* ─── Route management ────────────────────────────── */

        const getWeekStart = useCallback(getWeekStart, []);

    const removeFromRoute = useCallback((id) => {
      setScheduleIds(ids => ids.filter(sid => sid !== id));
      pushAudit(`Client removed from route`, "write");
    }, [pushAudit]);

    const rescheduleClient = useCallback((id, day) => {
      const weekStart = getWeekStart();
      setScheduleIds(ids => ids.filter(sid => sid !== id));
      setRescheduledClients(rc => ({
        ...rc,
        [id]: { day, weekStart, clientId: id },
      }));
      pushAudit(`Client rescheduled to ${day}`, "write");
    }, [getWeekStart, pushAudit]);

    const createRoute = useCallback((clientIds) => {
      setScheduleIds(clientIds);
      setOptimized(false);
      setRouteResult(null);
      pushAudit(`Route created — ${clientIds.length} stops`, "route");
    }, [pushAudit]);

    const clearRescheduled = useCallback(() => {
      setRescheduledClients({});
      pushAudit("Rescheduled clients cleared", "write");
    }, [pushAudit]);

  /* ─── Agency actions ──────────────────────────────── */

  const inviteNurse = useCallback(({ name, email, zone, role }) => {
    const id = "n_" + Math.random().toString(36).slice(2, 8);
    const nurse = {
      id, name, email, zone: zone || 'Unassigned',
      role: role || "Registered Nurse", status: "pending",
      onboarded: null, lastActive: "—", visitsToday: 0, weeklySaved: 0,
      avatar: null, currentStop: null, complianceOk: false,
      inviteToken: id + "-" + Math.random().toString(36).slice(2, 10),
    };
    setNurses(ns => [nurse, ...ns]);
    setLiveActivity(a => [{ t: "just now", nurseId: id, label: `Invite sent — ${name}`, type: "auth" }, ...a].slice(0, 40));
    if (userAgencyId) {
      supabase.from('profiles').insert({ id, name, email, role: 'nurse', agency_id: userAgencyId }).then().catch(err => {
        console.error("supabase error [inviteNurse]:", err.message);
      });
    }
    return nurse;
  }, [userAgencyId]);

  const setNurseStatus = useCallback((id, status) => {
    setNurses(ns => ns.map(n => n.id === id ? { ...n, status } : n));
  }, []);

  const removeNurse = useCallback((id) => {
    setNurses(ns => ns.filter(n => n.id !== id));
  }, []);

  const resetAgencyDemo = useCallback(() => {
    setNurses(NURSES_SEED);
    setLiveActivity(LIVE_ACTIVITY_SEED);
    setAgencyClients(AGENCY_CLIENTS);
  }, []);

  const reassignClient = useCallback((clientId, newNurseId) => {
    setAgencyClients(cs => cs.map(c => c.id === clientId ? { ...c, nurseId: newNurseId } : c));
    const newNurse = nurses.find(n => n.id === newNurseId);
    const client = agencyClients.find(c => c.id === clientId);
    setLiveActivity(a => [{ t: "just now", nurseId: newNurseId, label: `Reassigned ${client?.name ?? "client"} → ${newNurse?.name?.split(",")[0] ?? "nurse"}`, type: "route" }, ...a].slice(0, 40));
    if (clientId && newNurseId) {
      supabase.from('clients').update({ nurse_id: newNurseId }).eq('id', clientId).then().catch(err => {
        console.error("supabase error [reassignClient]:", err.message);
      });
    }
  }, [nurses, agencyClients]);

  /* ─── Super Admin actions ─────────────────────────── */

  const pushGlobalAudit = useCallback((action, resource, agencyId = null, severity = "info") => {
    setGlobalAudit(a => [{
      t: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      actorId: superAdminMe.id, actorName: superAdminMe.name, actorRole: superAdminMe.role,
      action, resource, agencyId, severity, ip: "10.0.14.22",
    }, ...a].slice(0, 200));
  }, [superAdminMe]);

  const setAgencyStatus = useCallback((id, status) => {
    setAgencies(as => as.map(a => a.id === id ? { ...a, status } : a));
    const ag = agencies.find(a => a.id === id);
    pushGlobalAudit(status === "suspended" ? "Agency suspended" : "Agency reactivated", `Agency · ${ag?.name}`, id, status === "suspended" ? "warn" : "info");
    supabase.from('agencies').update({ subscription_status: status === 'suspended' ? 'past_due' : 'active' }).eq('id', id).then().catch(err => {
      console.error("supabase error [setAgencyStatus]:", err.message);
    });
  }, [agencies, pushGlobalAudit]);

  const setGlobalNurseStatus = useCallback((id, status) => {
    setGlobalNurses(ns => ns.map(n => n.id === id ? { ...n, status } : n));
    const nurse = globalNurses.find(n => n.id === id);
    pushGlobalAudit(status === "suspended" ? "Nurse suspended" : "Nurse reactivated", `Nurse · ${nurse?.name}`, nurse?.agencyId, status === "suspended" ? "warn" : "info");
  }, [globalNurses, pushGlobalAudit]);

  const revealClientPHI = useCallback((clientId, reason) => {
    setPhiRevealed(r => ({ ...r, [clientId]: { at: new Date().toISOString(), reason } }));
    const client = globalClients.find(c => c.id === clientId);
    pushGlobalAudit(`PHI reveal · reason: \"${reason}\"`, `Client · ${client?.fullName}`, client?.agencyId, "warn");
  }, [globalClients, pushGlobalAudit]);

  const hideClientPHI = useCallback((clientId) => {
    setPhiRevealed(r => { const n = { ...r }; delete n[clientId]; return n; });
    const client = globalClients.find(c => c.id === clientId);
    pushGlobalAudit("PHI concealed", `Client · ${client?.fullName}`, client?.agencyId, "info");
  }, [globalClients, pushGlobalAudit]);

  const addSuperAdmin = useCallback(({ name, email, role }) => {
    const id = "sa_" + Math.random().toString(36).slice(2, 8);
    const initials = name.split(" ").map(s => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
    setSuperAdmins(s => [{ id, name, email, role, initials, lastActive: "invited", mfaEnabled: false, status: "pending" }, ...s]);
    pushGlobalAudit("Staff invited", `${role} · ${name}`, null, "info");
  }, [pushGlobalAudit]);

  const removeSuperAdmin = useCallback((id) => {
    const admin = superAdmins.find(s => s.id === id);
    if (admin?.role === "Owner") return;
    setSuperAdmins(s => s.filter(x => x.id !== id));
    pushGlobalAudit("Staff removed", `Platform staff · ${admin?.name}`, null, "warn");
  }, [superAdmins, pushGlobalAudit]);

  const killSession = useCallback((id) => {
    const sess = activeSessions.find(s => s.id === id);
    setActiveSessions(s => s.filter(x => x.id !== id));
    pushGlobalAudit("Session terminated", `${sess?.name} · ${sess?.device}`, null, "warn");
  }, [activeSessions, pushGlobalAudit]);

  const toggleFeatureFlag = useCallback((key) => {
    setFeatureFlags(flags => flags.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f));
    const flag = featureFlags.find(f => f.key === key);
    pushGlobalAudit("Feature flag toggled", `${key} → ${flag?.enabled ? "OFF" : "ON"}`, null, "info");
  }, [featureFlags, pushGlobalAudit]);

  const toggleMaintenance = useCallback(() => {
    setMaintenanceMode(m => !m);
    pushGlobalAudit(maintenanceMode ? "Maintenance mode disabled" : "Maintenance mode enabled", "Platform · global", null, maintenanceMode ? "info" : "critical");
  }, [maintenanceMode, pushGlobalAudit]);

  const impersonateAgency = useCallback((ag) => {
    setImpersonation({ id: ag.id, name: ag.director?.name || ag.name, role: `Director · ${ag.name}`, kind: "agency" });
    setAgencyAuthed(true);
    pushGlobalAudit("Impersonation started", `Director · ${ag.director?.name || ag.name} (${ag.name})`, ag.id, "warn");
  }, [pushGlobalAudit]);

  const stopImpersonation = useCallback(() => {
    if (impersonation) pushGlobalAudit("Impersonation ended", `${impersonation.role}`, null, "info");
    setImpersonation(null);
  }, [impersonation, pushGlobalAudit]);

  /* ─── Context value ───────────────────────────────── */

  const value = {
    // General
    authed, setAuthed, supabaseReady, dataReady, loadingError, userRole, userAgencyId,
    // Nurse app
    nurse, clients, setClients, schedule, scheduleIds, reorder, optimize, optimized,
    notes, addNote, audit, pushAudit, addClient, updateClient, removeClient,
    voiceOpen, setVoiceOpen, voiceTarget, setVoiceTarget, openVoice, noteViewMode, setNoteViewMode,
    optimizationMode, setOptimizationMode,
        savedRoutes, saveRoute, loadRoute, deleteSavedRoute, routeResult,
    // Route management
    removeFromRoute, rescheduleClient, createRoute, clearRescheduled,
    rescheduledClients, getWeekStart,
    // Agency admin
    agencyAuthed, setAgencyAuthed, agency, nurses, liveActivity, agencyClients, complianceLog,
    inviteNurse, setNurseStatus, removeNurse, resetAgencyDemo, reassignClient,
    // Super admin
    superAdminAuthed, setSuperAdminAuthed, platform, superAdminMe,
    agencies, globalNurses, globalClients, superAdmins, globalAudit,
    activeSessions, securityEvents, systemMetrics, billingLedger, featureFlags,
    phiRevealed, maintenanceMode, impersonation,
    pushGlobalAudit, setAgencyStatus, setGlobalNurseStatus,
    revealClientPHI, hideClientPHI, addSuperAdmin, removeSuperAdmin,
    killSession, toggleFeatureFlag, toggleMaintenance, impersonateAgency, stopImpersonation,
    // Utility
    signOut: () => { signOut(); setAuthed(false); setAgencyAuthed(false); setSuperAdminAuthed(false); },
  };

  return <RouteMeContext.Provider value={value}>{children}</RouteMeContext.Provider>;
}

export const useRouteMe = () => {
  const ctx = useContext(RouteMeContext);
  if (!ctx) throw new Error("useRouteMe must be used within RouteMeProvider");
  return ctx;
};