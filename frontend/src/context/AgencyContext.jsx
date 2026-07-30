/**
 * AgencyContext — owns all agency-admin state and actions.
 *
 * Depends on: AuthContext (for userAgencyId, userIdRef)
 * Provides:  useAgency() hook
 *
 * Extracted from RouteMeContext during Phase 5 of the context split.
 * Backwards-compatible — consumers continue using useRouteMe() which merges all contexts.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  AGENCY,
  NURSES_SEED,
  LIVE_ACTIVITY_SEED,
  AGENCY_CLIENTS,
  COMPLIANCE_LOG_SEED,
} from "@/lib/agencyMockData";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/useToast";
import { useAuth } from "./AuthContext";

const KEY = "routeme:agency";
const AgencyContext = createContext(null);

const loadState = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
};

export function AgencyProvider({ children }) {
  const { userAgencyId, userIdRef } = useAuth();

  const initial = loadState();

  /* ─── State ──────────────────────────────────────────── */
  const [agency, setAgency] = useState(initial?.agency ?? AGENCY);
  const [nurses, setNurses] = useState(initial?.nurses ?? NURSES_SEED);
  const [liveActivity, setLiveActivity] = useState(initial?.liveActivity ?? LIVE_ACTIVITY_SEED);
  const [agencyClients, setAgencyClients] = useState(initial?.agencyClients ?? AGENCY_CLIENTS);
  const [complianceLog, setComplianceLog] = useState(initial?.complianceLog ?? COMPLIANCE_LOG_SEED);
  const [loadedOnce, setLoadedOnce] = useState(false);

  /* ─── Persist to localStorage ──────────────────────── */
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        agency, nurses, liveActivity, agencyClients, complianceLog,
      }));
    } catch { /* quota exceeded — ignore */ }
  }, [agency, nurses, liveActivity, agencyClients, complianceLog]);

  /* ─── Load from Supabase (called from RouteMeContext loadData) ─── */
  const loadAgencyData = useCallback(async () => {
    if (loadedOnce) return;
    setLoadedOnce(true);
    if (!userAgencyId) return;

    const { data: nurseData } = await supabase
      .from('profiles').select('*').eq('agency_id', userAgencyId).order('created_at', { ascending: false });
    if (nurseData?.length) {
      setNurses(nurseData.map(n => ({
        id: n.id,
        name: n.name || 'Unknown',
        email: n.email || '',
        zone: n.zone || 'Unassigned',
        role: n.title || 'Registered Nurse',
        status: 'active',
        onboarded: n.onboarded_at || null,
        lastActive: n.last_active || '—',
        visitsToday: 0,
        weeklySaved: 0,
        avatar: n.avatar_url || null,
        currentStop: null,
        complianceOk: true,
      })));
    }

    const { data: clientData } = await supabase
      .from('clients').select('*').eq('agency_id', userAgencyId).order('created_at', { ascending: false });
    if (clientData?.length) {
      setAgencyClients(clientData.map((c, i) => ({
        id: c.id,
        name: c.full_name || 'Unknown',
        fullName: c.full_name || 'Unknown',
        nurseId: c.nurse_id || '',
        phone: c.phone || '',
        address: c.address || '',
        zone: c.zone || '',
        lastVisit: c.last_visit || 'New client',
        dob: c.dob || '',
        condition: c.condition || '—',
        window: c.time_window || '',
        duration: c.duration || 30,
        priority: c.priority || 'medium',
        visitsWeek: Math.ceil((c.duration || 30) / 30) || 1,
        city: (c.address || '').split(',').slice(-2).join(', ').trim() || 'Unknown',
        flags: c.flags || [],
        caregiverName: c.caregiver_name || '',
        caregiverPhone: c.caregiver_phone || '',
        initials: c.initials || '',
        lat: c.lat,
        lng: c.lng,
      })));
    }

    const { data: auditData } = await supabase
      .from('audit_logs').select('*').eq('agency_id', userAgencyId).order('created_at', { ascending: false }).limit(24);
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
  }, [userAgencyId, loadedOnce]);

  /* ─── Actions ────────────────────────────────────────── */

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
          toast.error("Failed to invite nurse");
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
          toast.error("Failed to reassign client");
        });
    }
  }, [nurses, agencyClients]);

  /* ─── Context value ────────────────────────────────── */
  const value = {
    agency, setAgency,
    nurses, setNurses,
    liveActivity, setLiveActivity,
    agencyClients, setAgencyClients,
    complianceLog, setComplianceLog,
    loadAgencyData,
    inviteNurse, setNurseStatus, removeNurse, resetAgencyDemo, reassignClient,
  };

  return <AgencyContext.Provider value={value}>{children}</AgencyContext.Provider>;
}

export const useAgency = () => {
  const ctx = useContext(AgencyContext);
  if (!ctx) throw new Error("useAgency must be used within AgencyProvider");
  return ctx;
};