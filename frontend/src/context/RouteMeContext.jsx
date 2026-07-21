import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
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

const KEY = "routeme.state.v1";

const RouteMeContext = createContext(null);

const load = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export function RouteMeProvider({ children }) {
  const initial = load();

  // Nurse app state
  const [authed, setAuthed] = useState(initial?.authed ?? false);
  const [clients, setClients] = useState(initial?.clients ?? CLIENTS_SEED);
  const [scheduleIds, setScheduleIds] = useState(
    initial?.scheduleIds ?? CLIENTS_SEED.map((c) => c.id)
  );
  const [notes, setNotes] = useState(initial?.notes ?? {});
  const [audit, setAudit] = useState(initial?.audit ?? AUDIT_LOG);
  const [optimized, setOptimized] = useState(initial?.optimized ?? true);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceTarget, setVoiceTarget] = useState(null);

  // Agency admin state
  const [agencyAuthed, setAgencyAuthed] = useState(initial?.agencyAuthed ?? false);
  const [agency] = useState(AGENCY);
  const [nurses, setNurses] = useState(initial?.nurses ?? NURSES_SEED);
  const [liveActivity, setLiveActivity] = useState(initial?.liveActivity ?? LIVE_ACTIVITY_SEED);
  const [agencyClients, setAgencyClients] = useState(initial?.agencyClients ?? AGENCY_CLIENTS);
  const [complianceLog] = useState(COMPLIANCE_LOG_SEED);

  // Super Admin (Platform) state
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

  useEffect(() => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        authed,
        clients,
        scheduleIds,
        notes,
        audit,
        optimized,
        agencyAuthed,
        nurses,
        liveActivity,
        agencyClients,
        superAdminAuthed,
        agencies,
        globalNurses,
        globalClients,
        superAdmins,
        globalAudit,
        activeSessions,
        billingLedger,
        featureFlags,
        phiRevealed,
        maintenanceMode,
        impersonation,
      })
    );
  }, [
    authed, clients, scheduleIds, notes, audit, optimized,
    agencyAuthed, nurses, liveActivity, agencyClients,
    superAdminAuthed, agencies, globalNurses, globalClients, superAdmins,
    globalAudit, activeSessions, billingLedger, featureFlags,
    phiRevealed, maintenanceMode, impersonation,
  ]);

  const schedule = useMemo(
    () => scheduleIds.map((id) => clients.find((c) => c.id === id)).filter(Boolean),
    [scheduleIds, clients]
  );

  const pushAudit = (label, type = "read") =>
    setAudit((a) => [
      { t: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), label, type },
      ...a,
    ].slice(0, 24));

  const addClient = (c) => {
    const id = "c" + Math.random().toString(36).slice(2, 8);
    const client = { id, ...c };
    setClients((cs) => [client, ...cs]);
    setScheduleIds((ids) => [id, ...ids]);
    pushAudit(`Client added — ${c.fullName}`, "write");
  };

  const updateClient = (id, patch) => {
    setClients((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    pushAudit(`Client updated — ${patch.fullName ?? id}`, "write");
  };

  const removeClient = (id) => {
    setClients((cs) => cs.filter((c) => c.id !== id));
    setScheduleIds((s) => s.filter((sid) => sid !== id));
    pushAudit(`Client removed`, "write");
  };

  const reorder = (ids) => {
    setScheduleIds(ids);
    setOptimized(false);
  };

  const optimize = () => {
    const priorityRank = { high: 0, medium: 1, low: 2 };
    const next = [...schedule]
      .sort((a, b) => {
        const p = priorityRank[a.priority] - priorityRank[b.priority];
        if (p !== 0) return p;
        return a.window.localeCompare(b.window);
      })
      .map((c) => c.id);
    setScheduleIds(next);
    setOptimized(true);
    pushAudit("Route re-optimized", "route");
  };

  const addNote = (clientId, text) => {
    setNotes((n) => ({
      ...n,
      [clientId]: [
        { id: Math.random().toString(36).slice(2, 8), text, date: new Date().toISOString() },
        ...(n[clientId] ?? []),
      ],
    }));
    pushAudit("Voice note transcribed", "note");
  };

  const openVoice = (clientId) => {
    setVoiceTarget(clientId);
    setVoiceOpen(true);
  };

  // Agency actions
  const inviteNurse = ({ name, email, zone, role }) => {
    const id = "n_" + Math.random().toString(36).slice(2, 8);
    const initials = name
      .split(" ")
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
    const nurse = {
      id,
      name,
      email,
      zone,
      role: role || "Registered Nurse",
      status: "pending",
      onboarded: null,
      lastActive: "—",
      visitsToday: 0,
      weeklySaved: 0,
      avatar: null,
      currentStop: null,
      complianceOk: false,
      inviteToken: id + "-" + Math.random().toString(36).slice(2, 10),
      initials,
    };
    setNurses((ns) => [nurse, ...ns]);
    setLiveActivity((a) =>
      [{ t: "just now", nurseId: id, label: `Invite sent — ${name}`, type: "auth" }, ...a].slice(0, 40)
    );
    return nurse;
  };

  const setNurseStatus = (id, status) => {
    setNurses((ns) => ns.map((n) => (n.id === id ? { ...n, status } : n)));
  };

  const removeNurse = (id) => {
    setNurses((ns) => ns.filter((n) => n.id !== id));
  };

  const resetAgencyDemo = () => {
    setNurses(NURSES_SEED);
    setLiveActivity(LIVE_ACTIVITY_SEED);
    setAgencyClients(AGENCY_CLIENTS);
  };

  const reassignClient = (clientId, newNurseId) => {
    setAgencyClients((cs) =>
      cs.map((c) => (c.id === clientId ? { ...c, nurseId: newNurseId } : c))
    );
    const newNurse = nurses.find((n) => n.id === newNurseId);
    const client = agencyClients.find((c) => c.id === clientId);
    setLiveActivity((a) =>
      [
        {
          t: "just now",
          nurseId: newNurseId,
          label: `Reassigned ${client?.name ?? "client"} → ${newNurse?.name.split(",")[0] ?? "nurse"}`,
          type: "route",
        },
        ...a,
      ].slice(0, 40)
    );
  };

  // Super Admin actions
  const pushGlobalAudit = (action, resource, agencyId = null, severity = "info") => {
    setGlobalAudit((a) => [
      {
        t: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actorId: superAdminMe.id,
        actorName: superAdminMe.name,
        actorRole: superAdminMe.role,
        action,
        resource,
        agencyId,
        severity,
        ip: "10.0.14.22",
      },
      ...a,
    ].slice(0, 200));
  };

  const setAgencyStatus = (id, status) => {
    setAgencies((as) => as.map((a) => (a.id === id ? { ...a, status } : a)));
    const ag = agencies.find((a) => a.id === id);
    pushGlobalAudit(status === "suspended" ? "Agency suspended" : "Agency reactivated", `Agency · ${ag?.name}`, id, status === "suspended" ? "warn" : "info");
  };

  const setGlobalNurseStatus = (id, status) => {
    setGlobalNurses((ns) => ns.map((n) => (n.id === id ? { ...n, status } : n)));
    const nurse = globalNurses.find((n) => n.id === id);
    pushGlobalAudit(status === "suspended" ? "Nurse suspended" : "Nurse reactivated", `Nurse · ${nurse?.name}`, nurse?.agencyId, status === "suspended" ? "warn" : "info");
  };

  const revealClientPHI = (clientId, reason) => {
    setPhiRevealed((r) => ({ ...r, [clientId]: { at: new Date().toISOString(), reason } }));
    const client = globalClients.find((c) => c.id === clientId);
    pushGlobalAudit(`PHI reveal · reason: "${reason}"`, `Client · ${client?.fullName}`, client?.agencyId, "warn");
  };

  const hideClientPHI = (clientId) => {
    setPhiRevealed((r) => {
      const next = { ...r };
      delete next[clientId];
      return next;
    });
    const client = globalClients.find((c) => c.id === clientId);
    pushGlobalAudit("PHI concealed", `Client · ${client?.fullName}`, client?.agencyId, "info");
  };

  const addSuperAdmin = ({ name, email, role }) => {
    const id = "sa_" + Math.random().toString(36).slice(2, 8);
    const initials = name.split(" ").map((s) => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
    const newAdmin = { id, name, email, role, initials, lastActive: "invited", mfaEnabled: false, status: "pending" };
    setSuperAdmins((s) => [newAdmin, ...s]);
    pushGlobalAudit("Staff invited", `${role} · ${name}`, null, "info");
  };

  const removeSuperAdmin = (id) => {
    const admin = superAdmins.find((s) => s.id === id);
    if (admin?.role === "Owner") return;
    setSuperAdmins((s) => s.filter((x) => x.id !== id));
    pushGlobalAudit("Staff removed", `Platform staff · ${admin?.name}`, null, "warn");
  };

  const killSession = (id) => {
    const sess = activeSessions.find((s) => s.id === id);
    setActiveSessions((s) => s.filter((x) => x.id !== id));
    pushGlobalAudit("Session terminated", `${sess?.name} · ${sess?.device}`, null, "warn");
  };

  const toggleFeatureFlag = (key) => {
    setFeatureFlags((flags) => flags.map((f) => (f.key === key ? { ...f, enabled: !f.enabled } : f)));
    const flag = featureFlags.find((f) => f.key === key);
    pushGlobalAudit("Feature flag toggled", `${key} → ${flag?.enabled ? "OFF" : "ON"}`, null, "info");
  };

  const toggleMaintenance = () => {
    setMaintenanceMode((m) => !m);
    pushGlobalAudit(maintenanceMode ? "Maintenance mode disabled" : "Maintenance mode enabled", "Platform · global", null, maintenanceMode ? "info" : "critical");
  };

  const impersonateAgency = (ag) => {
    setImpersonation({ id: ag.id, name: ag.director.name, role: `Director · ${ag.name}`, kind: "agency" });
    setAgencyAuthed(true);
    pushGlobalAudit("Impersonation started", `Director · ${ag.director.name} (${ag.name})`, ag.id, "warn");
  };

  const stopImpersonation = () => {
    if (impersonation) {
      pushGlobalAudit("Impersonation ended", `${impersonation.role}`, null, "info");
    }
    setImpersonation(null);
  };

  const value = {
    authed,
    setAuthed,
    nurse: NURSE,
    clients,
    setClients,
    schedule,
    scheduleIds,
    reorder,
    optimize,
    optimized,
    notes,
    addNote,
    audit,
    pushAudit,
    addClient,
    updateClient,
    removeClient,
    voiceOpen,
    setVoiceOpen,
    voiceTarget,
    setVoiceTarget,
    openVoice,
    // Agency
    agencyAuthed,
    setAgencyAuthed,
    agency,
    nurses,
    liveActivity,
    agencyClients,
    complianceLog,
    inviteNurse,
    setNurseStatus,
    removeNurse,
    resetAgencyDemo,
    reassignClient,
    // Super Admin
    superAdminAuthed,
    setSuperAdminAuthed,
    platform,
    superAdminMe,
    agencies,
    globalNurses,
    globalClients,
    superAdmins,
    globalAudit,
    activeSessions,
    securityEvents,
    systemMetrics,
    billingLedger,
    featureFlags,
    phiRevealed,
    maintenanceMode,
    impersonation,
    pushGlobalAudit,
    setAgencyStatus,
    setGlobalNurseStatus,
    revealClientPHI,
    hideClientPHI,
    addSuperAdmin,
    removeSuperAdmin,
    killSession,
    toggleFeatureFlag,
    toggleMaintenance,
    impersonateAgency,
    stopImpersonation,
  };

  return <RouteMeContext.Provider value={value}>{children}</RouteMeContext.Provider>;
}

export const useRouteMe = () => {
  const ctx = useContext(RouteMeContext);
  if (!ctx) throw new Error("useRouteMe must be used within RouteMeProvider");
  return ctx;
};
