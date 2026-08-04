/**
 * DataInitializer — orchestrates initial data loading across all contexts.
 *
 * Sits inside the provider tree so it can use all context hooks.
 * Runs the Supabase session check and dispatches role-appropriate data loading
 * to each domain context (NurseContext, SOAPContext, AgencyContext, PlatformContext).
 */
import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { CLIENTS_SEED, NURSE } from "@/lib/mockData";
import { toast } from "@/hooks/useToast";
import {
  loadVisits,
  loadSavedRoutes,
} from "@/lib/dataService";
import { useAuth } from "./AuthContext";
import { useNurse } from "./NurseContext";
import { useSOAP } from "./SOAPContext";
import { useAgency } from "./AgencyContext";
import { usePlatform } from "./PlatformContext";

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

const devLog = (...args) => {
  if (process.env.NODE_ENV !== 'production') console.log(...args);
};

export function DataInitializer({ children }) {
  const {
    supabaseReady, setSupabaseReady,
    authed, setAuthed,
    dataReady, setDataReady,
    loadingError, setLoadingError,
    userRole, setUserRole,
    userAgencyId, setUserAgencyId,
    userIdRef,
  } = useAuth();

  const {
    nurse, setNurse,
    clients, setClients,
    setScheduleIds, originalOrderRef,
    setNotes,
    setAudit,
    setOptimized,
    savedRoutes, setSavedRoutes,
  } = useNurse();

  const { loadSOAPData } = useSOAP();
  const { loadAgencyData } = useAgency();
  const { loadSuperAdminData } = usePlatform();

  const lastUserId = useRef(null);

  /* ─── Role-aware data loading ──────────────────────── */
  const loadData = async (userId) => {
    if (!userId) return;
    if (lastUserId.current === userId && dataReady) return;
    lastUserId.current = userId;
    userIdRef.current = userId;
    setLoadingError(null);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const role = profile?.role ?? 'nurse';
      const agencyId = profile?.agency_id ?? null;
      setUserRole(role);
      setUserAgencyId(agencyId);

      // Set nurse profile (always)
      setNurse(profile ? {
        name: profile.name || NURSE.name,
        title: profile.title || NURSE.title,
        license: profile.license || NURSE.license,
        region: profile.region || NURSE.region,
        avatar: profile.avatar_url || NURSE.avatar,
        homeBase: profile.home_base || NURSE.homeBase,
        weeklySavedMinutes: profile.weekly_saved_minutes || NURSE.weeklySavedMinutes,
        weeklySavedMiles: profile.weekly_saved_miles || NURSE.weeklySavedMiles,
      } : NURSE);

      // Role-appropriate data loading
      if (role === 'nurse') {
        const { data: clientData } = await supabase
          .from('clients').select('*').eq('nurse_id', userId).order('created_at', { ascending: false });
        setClients(clientData?.length ? clientData.map(mapClientFromDB) : CLIENTS_SEED);

        const today = new Date().toISOString().split('T')[0];

        loadSOAPData();

        const visitsResult = await loadVisits(userId);
        // visits are handled by RouteContext — no setter here

        const routesResult = await loadSavedRoutes(userId);
        if (routesResult.data) {
          setSavedRoutes(routesResult.data);
        } else if (routesResult.fallback) {
          setSavedRoutes(routesResult.fallback);
        }

        const { data: schedData } = await supabase
          .from('schedules').select('*').eq('nurse_id', userId).eq('visit_date', today).order('sort_order', { ascending: true });
        if (schedData?.length) {
          setScheduleIds(schedData.map(s => s.client_id));
          originalOrderRef.current = schedData.map(s => s.client_id);
          setOptimized(true);
        } else if (clientData?.length) {
          // Fallback: no schedule rows for today (seed is date-specific and stale),
          // but real clients DID load. Use the actual client UUIDs as the schedule —
          // otherwise scheduleIds stays as mock "c1".."c6" and the derived schedule
          // array is empty (UUIDs never match "c1"), breaking all summary cards.
          const uuids = clientData.map(c => c.id);
          setScheduleIds(uuids);
          originalOrderRef.current = uuids;
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
        loadAgencyData();
      }

      if (role === 'super_admin') {
        loadSuperAdminData();
      }

      setDataReady(true);
    } catch (err) {
      console.warn('RouteMe: Data load error:', err);
      toast.error("Failed to load your data. Some features may be limited.");
      setLoadingError(err.message || 'Unknown error');
      setDataReady(true);
    }
  };

  const lastUserIdRef = lastUserId;

  /* ─── Supabase session check ──────────────────────── */
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;
        if (session?.user) {
          if (lastUserId.current !== session.user.id) {
            userIdRef.current = session.user.id;
            await loadData(session.user.id);
          }
          setAuthed(true);
        } else {
          setDataReady(true);
        }
        setSupabaseReady(true);
      } catch {
        if (!cancelled) {
          setDataReady(true);
          setSupabaseReady(true);
        }
      }
    };
    init();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  return children;
}