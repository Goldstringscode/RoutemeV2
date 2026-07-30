/**
 * PlatformContext — owns all super admin / platform state and actions.
 *
 * Depends on: AuthContext (for auth state)
 * Provides:  usePlatform() hook
 *
 * Extracted from RouteMeContext during Phase 6 of the context split.
 * Backwards-compatible — consumers continue using useRouteMe() which merges all contexts.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
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
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/useToast";
import { useAuth } from "./AuthContext";

const KEY = "routeme:platform";
const PlatformContext = createContext(null);

const loadState = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
};

export function PlatformProvider({ children }) {
  const { userIdRef, setAgencyAuthed } = useAuth();

  const initial = loadState();

  /* ─── State ──────────────────────────────────────────── */
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
  const [loadedOnce, setLoadedOnce] = useState(false);

  /* ─── Persist to localStorage ──────────────────────── */
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        agencies, globalNurses, globalClients, superAdmins,
        globalAudit, activeSessions, billingLedger, featureFlags,
        phiRevealed, maintenanceMode, impersonation,
      }));
    } catch { /* quota exceeded — ignore */ }
  }, [agencies, globalNurses, globalClients, superAdmins,
      globalAudit, activeSessions, billingLedger, featureFlags,
      phiRevealed, maintenanceMode, impersonation]);

  /* ─── Load from Supabase (called from RouteMeContext loadData) ─── */
  const loadSuperAdminData = useCallback(async () => {
    if (loadedOnce) return;
    setLoadedOnce(true);

    const { data: agencyData } = await supabase.from('agencies').select('*').order('created_at', { ascending: false });
    if (agencyData?.length) {
      setAgencies(agencyData.map(a => ({
        id: a.id,
        name: a.name,
        logo: (a.name || '').split(' ').map(s => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase(),
        director: { name: a.director_name || 'Unknown', email: a.email || '—' },
        plan: a.subscription_tier === 'starter' ? 'Growth' : a.subscription_tier === 'pro' ? 'Scale' : 'Enterprise',
        seatsUsed: a.seats_used || 0,
        seatsTotal: a.subscription_tier === 'starter' ? 20 : a.subscription_tier === 'pro' ? 100 : 999,
        monthlyCost: (a.seats_used || 0) * 65,
        status: a.subscription_status || 'active',
        hipaaScore: a.hipaa_score || 92,
        mfaEnabled: a.mfa_enabled || false,
        timezone: a.timezone || 'America/New_York',
        lastBilled: a.last_billed || '—',
        createdAt: a.created_at || '—',
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
  }, [loadedOnce]);

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
          toast.error("Failed to update agency status");
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
    pushGlobalAudit(`PHI reveal · reason: "${reason}"`, `Client · ${client?.fullName}`, client?.agencyId, "warn");
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
    pushGlobalAudit("Session killed", `Session · ${sess?.nurseName ?? 'Unknown'}`, sess?.agencyId, "warn");
  }, [activeSessions, pushGlobalAudit]);

  const toggleFeatureFlag = useCallback((key) => {
    setFeatureFlags(f => ({ ...f, [key]: !f[key] }));
  }, []);

  const toggleMaintenance = useCallback(() => {
    setMaintenanceMode(m => !m);
    pushGlobalAudit(maintenanceMode ? "Maintenance mode disabled" : "Maintenance mode enabled", "System", null, maintenanceMode ? "info" : "warn");
  }, [maintenanceMode, pushGlobalAudit]);

  const impersonateAgency = useCallback((agencyId) => {
    const ag = agencies.find(a => a.id === agencyId);
    if (!ag) return;
    setImpersonation({ agencyId, name: ag.name, role: 'agency_director' });
    setAgencyAuthed(true);
    pushGlobalAudit("Impersonation started", `Director · ${ag.director?.name || ag.name} (${ag.name})`, ag.id, "warn");
  }, [agencies, pushGlobalAudit]);

  const stopImpersonation = useCallback(() => {
    if (impersonation) pushGlobalAudit("Impersonation ended", `${impersonation.role}`, null, "info");
    setImpersonation(null);
  }, [impersonation, pushGlobalAudit]);

  /* ─── Context value ────────────────────────────────── */
  const value = {
    platform, superAdminMe,
    agencies, setAgencies,
    globalNurses, setGlobalNurses,
    globalClients, setGlobalClients,
    superAdmins, setSuperAdmins,
    globalAudit, setGlobalAudit,
    activeSessions, setActiveSessions,
    securityEvents, systemMetrics,
    billingLedger, setBillingLedger,
    featureFlags, setFeatureFlags,
    phiRevealed, setPhiRevealed,
    maintenanceMode, setMaintenanceMode,
    impersonation, setImpersonation,
    loadSuperAdminData,
    pushGlobalAudit, setAgencyStatus, setGlobalNurseStatus,
    revealClientPHI, hideClientPHI,
    addSuperAdmin, removeSuperAdmin,
    killSession, toggleFeatureFlag, toggleMaintenance,
    impersonateAgency, stopImpersonation,
  };

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export const usePlatform = () => {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error("usePlatform must be used within PlatformProvider");
  return ctx;
};