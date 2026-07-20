import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CLIENTS_SEED, NURSE, AUDIT_LOG } from "@/lib/mockData";
import {
  AGENCY,
  NURSES_SEED,
  LIVE_ACTIVITY_SEED,
  AGENCY_CLIENTS,
  COMPLIANCE_LOG_SEED,
} from "@/lib/agencyMockData";

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

  const [authed, setAuthed] = useState(initial?.authed ?? false);
  const [clients, setClients] = useState(initial?.clients ?? CLIENTS_SEED);
  const [scheduleIds, setScheduleIds] = useState(
    initial?.scheduleIds ?? CLIENTS_SEED.map((c) => c.id)
  );
  const [notes, setNotes] = useState(initial?.notes ?? {}); // { clientId: [{id, text, date}] }
  const [audit, setAudit] = useState(initial?.audit ?? AUDIT_LOG);
  const [optimized, setOptimized] = useState(initial?.optimized ?? true);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceTarget, setVoiceTarget] = useState(null);

  // Agency admin state
  const [agencyAuthed, setAgencyAuthed] = useState(initial?.agencyAuthed ?? false);
  const [agency] = useState(AGENCY);
  const [nurses, setNurses] = useState(initial?.nurses ?? NURSES_SEED);
  const [liveActivity, setLiveActivity] = useState(initial?.liveActivity ?? LIVE_ACTIVITY_SEED);
  const [agencyClients] = useState(AGENCY_CLIENTS);
  const [complianceLog] = useState(COMPLIANCE_LOG_SEED);

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
      })
    );
  }, [authed, clients, scheduleIds, notes, audit, optimized, agencyAuthed, nurses, liveActivity]);

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
    // Mock "optimization": place high-priority first, then sort by window
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
  };

  return <RouteMeContext.Provider value={value}>{children}</RouteMeContext.Provider>;
}

export const useRouteMe = () => {
  const ctx = useContext(RouteMeContext);
  if (!ctx) throw new Error("useRouteMe must be used within RouteMeProvider");
  return ctx;
};
