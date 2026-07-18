import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { NURSE as NURSE_FALLBACK, CLIENTS_SEED, AUDIT_LOG } from "@/lib/mockData";
import { supabase, signOut } from "@/lib/supabase";

const RouteMeContext = createContext(null);

export function RouteMeProvider({ children }) {
  const [authed, setAuthed] = useState(false);
  const [supabaseReady, setSupabaseReady] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [loadingError, setLoadingError] = useState(null);

  // Data state
  const [clients, setClients] = useState([]);
  const [scheduleEntries, setScheduleEntries] = useState([]); // from schedules table
  const [notes, setNotes] = useState({}); // { clientId: [note, ...] }
  const [audit, setAudit] = useState([]);
  const [nurse, setNurse] = useState(NURSE_FALLBACK);
  const [optimized, setOptimized] = useState(true);

  // UI state (no persistence needed)
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceTarget, setVoiceTarget] = useState(null);
  const [noteViewMode, setNoteViewMode] = useState("compose"); // "compose" | "history"

  // Track last loaded user to avoid duplicate loads
  const lastUserId = useRef(null);

  // --- Load all data from Supabase ---
  const loadData = useCallback(async (userId) => {
    if (!userId) return;
    setLoadingError(null);

    try {
      // Load profile
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileErr && profileErr.code !== 'PGRST116') {
        console.warn('Profile load error:', profileErr.message);
      }

      setNurse(profile ? {
        name: profile.name || NURSE_FALLBACK.name,
        title: profile.title || NURSE_FALLBACK.title,
        license: profile.license || NURSE_FALLBACK.license,
        region: profile.region || NURSE_FALLBACK.region,
        avatar: profile.avatar_url || NURSE_FALLBACK.avatar,
      } : NURSE_FALLBACK);

      // Load clients
      const { data: clientData, error: clientErr } = await supabase
        .from('clients')
        .select('*')
        .eq('nurse_id', userId)
        .order('created_at', { ascending: false });

      if (clientErr) {
        console.error('Client load error:', clientErr.message);
        setClients(CLIENTS_SEED);
      } else {
        setClients(clientData || []);
      }

      // Load today's schedule with client details
      const today = new Date().toISOString().split('T')[0];
      const { data: schedData, error: schedErr } = await supabase
        .from('schedules')
        .select('*')
        .eq('nurse_id', userId)
        .eq('visit_date', today)
        .order('sort_order', { ascending: true });

      if (schedErr) {
        console.warn('Schedule load error:', schedErr.message);
        setScheduleEntries([]);
      } else {
        setScheduleEntries(schedData || []);
        setOptimized(true);
      }

      // Load notes
      const { data: noteData, error: noteErr } = await supabase
        .from('visit_notes')
        .select('*')
        .eq('nurse_id', userId)
        .order('created_at', { ascending: false });

      if (noteErr) {
        console.warn('Notes load error:', noteErr.message);
        setNotes({});
      } else if (noteData) {
        // Group by client_id
        const grouped = {};
        for (const n of noteData) {
          if (!grouped[n.client_id]) grouped[n.client_id] = [];
          grouped[n.client_id].push({
            id: n.id,
            text: n.text,
            visitType: n.visit_type || 'Routine visit',
            status: n.status || 'Completed',
            date: n.created_at,
          });
        }
        setNotes(grouped);
      }

      // Load audit log
      const { data: auditData, error: auditErr } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('nurse_id', userId)
        .order('created_at', { ascending: false })
        .limit(24);

      if (auditErr) {
        console.warn('Audit load error:', auditErr.message);
        setAudit(AUDIT_LOG);
      } else if (auditData) {
        setAudit(auditData.map((a) => ({
          t: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          label: a.label,
          type: a.type || 'read',
        })));
      }

      setDataReady(true);
    } catch (err) {
      console.error('Data load failed:', err);
      setLoadingError(err.message);
      // Fall back to seed data on failure
      setClients(CLIENTS_SEED);
      setAudit(AUDIT_LOG);
      setNurse(NURSE_FALLBACK);
      setDataReady(true);
    }
  }, []);

  // --- Auth handling ---
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setAuthed(true);
        const uid = data.session.user.id;
        lastUserId.current = uid;
        await loadData(uid);
      }
      setSupabaseReady(true);
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setAuthed(true);
        const uid = session.user.id;
        if (uid !== lastUserId.current) {
          lastUserId.current = uid;
          await loadData(uid);
        }
      } else if (event === 'SIGNED_OUT') {
        setAuthed(false);
        setDataReady(false);
        setClients([]);
        setScheduleEntries([]);
        setNotes({});
        setAudit([]);
        lastUserId.current = null;
      }
    });

    return () => listener?.subscription?.unsubscribe();
  }, [loadData]);

  // --- Derived: schedule (full client objects in order) ---
  const schedule = useMemo(() => {
    const clientMap = {};
    for (const c of clients) clientMap[c.id] = c;
    return scheduleEntries
      .map((s) => clientMap[s.client_id])
      .filter(Boolean);
  }, [clients, scheduleEntries]);

  const scheduleIds = useMemo(() => schedule.map((c) => c.id), [schedule]);

  // --- Audit helper ---
  const pushAudit = useCallback(async (label, type = 'read') => {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return;

    const { error } = await supabase.from('audit_logs').insert({
      nurse_id: userId,
      label,
      type,
    });

    if (error) {
      console.warn('Audit insert error:', error.message);
      return;
    }

    // Optimistically add to local state
    setAudit((a) => [
      { t: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), label, type },
      ...a,
    ].slice(0, 24));
  }, []);

  // --- Client CRUD ---
  const addClient = useCallback(async (c) => {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return;

    // 1. Insert client
    const { data: newClient, error: clientErr } = await supabase
      .from('clients')
      .insert({
        nurse_id: userId,
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
        last_visit: 'New client',
        photo_url: c.photo || null,
      })
      .select()
      .single();

    if (clientErr) {
      console.error('Client insert error:', clientErr.message);
      return;
    }

    // 2. Add to today's schedule
    const today = new Date().toISOString().split('T')[0];
    const nextOrder = scheduleEntries.length;

    const { error: schedErr } = await supabase
      .from('schedules')
      .insert({
        nurse_id: userId,
        client_id: newClient.id,
        visit_date: today,
        sort_order: nextOrder,
      });

    if (schedErr) {
      console.warn('Schedule insert error:', schedErr.message);
    }

    // 3. Update local state
    setClients((cs) => [newClient, ...cs]);
    setScheduleEntries((se) => [...se, {
      id: 'tmp',
      nurse_id: userId,
      client_id: newClient.id,
      visit_date: today,
      sort_order: nextOrder,
    }]);

    pushAudit(`Client added — ${c.fullName}`, 'write');
  }, [scheduleEntries, pushAudit]);

  const updateClient = useCallback(async (id, patch) => {
    // Build Supabase column names
    const sbPatch = {};
    if (patch.fullName !== undefined) sbPatch.full_name = patch.fullName;
    if (patch.initials !== undefined) sbPatch.initials = patch.initials;
    if (patch.phone !== undefined) sbPatch.phone = patch.phone;
    if (patch.address !== undefined) sbPatch.address = patch.address;
    if (patch.window !== undefined) sbPatch.time_window = patch.window;
    if (patch.duration !== undefined) sbPatch.duration = patch.duration;
    if (patch.priority !== undefined) sbPatch.priority = patch.priority;
    if (patch.flags !== undefined) sbPatch.flags = patch.flags;
    if (patch.condition !== undefined) sbPatch.condition = patch.condition;
    if (patch.dob !== undefined) sbPatch.dob = patch.dob;
    if (patch.photo !== undefined) sbPatch.photo_url = patch.photo;
    sbPatch.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('clients')
      .update(sbPatch)
      .eq('id', id);

    if (error) {
      console.error('Client update error:', error.message);
      return;
    }

    // Map back to component prop names for local state
    const localPatch = { ...patch };
    setClients((cs) => cs.map((c) => (c.id === id ? { ...c, ...localPatch } : c)));
    pushAudit(`Client updated — ${patch.fullName ?? id}`, 'write');
  }, [pushAudit]);

  const removeClient = useCallback(async (id) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) {
      console.error('Client delete error:', error.message);
      return;
    }

    // Also clean up schedule
    await supabase.from('schedules').delete().eq('client_id', id);

    setClients((cs) => cs.filter((c) => c.id !== id));
    setScheduleEntries((se) => se.filter((s) => s.client_id !== id));
    pushAudit('Client removed', 'write');
  }, [pushAudit]);

  // --- Schedule operations ---
  const reorder = useCallback(async (ids) => {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return;

    // Update sort_order for each entry in the new order
    const today = new Date().toISOString().split('T')[0];
    for (let i = 0; i < ids.length; i++) {
      await supabase
        .from('schedules')
        .update({ sort_order: i })
        .eq('nurse_id', userId)
        .eq('client_id', ids[i])
        .eq('visit_date', today);
    }

    // Rebuild schedule entries in new order
    setScheduleEntries(ids.map((clientId, i) => ({
      client_id: clientId,
      sort_order: i,
      visit_date: today,
      nurse_id: userId,
    })));
    setOptimized(false);
  }, []);

  const optimize = useCallback(() => {
    const priorityRank = { high: 0, medium: 1, low: 2 };
    const next = [...schedule]
      .sort((a, b) => {
        const p = priorityRank[a.priority] - priorityRank[b.priority];
        if (p !== 0) return p;
        return (a.window || '').localeCompare(b.window || '');
      })
      .map((c) => c.id);
    reorder(next);
    setOptimized(true);
    pushAudit('Route re-optimized', 'route');
  }, [schedule, reorder, pushAudit]);

  // --- Notes ---
  const addNote = useCallback(async (clientId, text, visitType = 'Routine visit', status = 'Completed') => {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return;

    const { data: newNote, error } = await supabase
      .from('visit_notes')
      .insert({
        nurse_id: userId,
        client_id: clientId,
        text,
        visit_type: visitType,
        status,
      })
      .select()
      .single();

    if (error) {
      console.error('Note insert error:', error.message);
      return;
    }

    const noteObj = {
      id: newNote.id,
      text: newNote.text,
      visitType: newNote.visit_type || visitType,
      status: newNote.status || status,
      date: newNote.created_at,
    };

    setNotes((n) => ({
      ...n,
      [clientId]: [noteObj, ...(n[clientId] ?? [])],
    }));

    pushAudit('Visit note recorded', 'note');
  }, [pushAudit]);

  // --- Voice/note modal helpers ---
  const openVoice = useCallback((clientId, mode = 'compose') => {
    setVoiceTarget(clientId);
    setNoteViewMode(mode);
    setVoiceOpen(true);
  }, []);

  // --- Context value ---
  const value = {
    authed,
    setAuthed,
    supabaseReady,
    dataReady,
    loadingError,
    nurse,
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
    noteViewMode,
    setNoteViewMode,
  };

  return <RouteMeContext.Provider value={value}>{children}</RouteMeContext.Provider>;
}

export const useRouteMe = () => {
  const ctx = useContext(RouteMeContext);
  if (!ctx) throw new Error("useRouteMe must be used within RouteMeProvider");
  return ctx;
};
