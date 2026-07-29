// RouteMe — Data Service Layer
// Handles all Supabase CRUD with proper error handling and mock fallback.
// Every function returns { data, error } — never throws.

import { supabase } from "./supabase";
import { SOAP_HISTORY_SEED } from "./soapMockData";

const devLog = (...args) => {
  if (process.env.NODE_ENV !== "production") console.log("[DataService]", ...args);
};

// ─── Helpers ─────────────────────────────────────────────

function generateId(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 10);
}

function nowISO() {
  return new Date().toISOString();
}

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── SOAP Notes ──────────────────────────────────────────

export async function loadSOAPNotes(userId) {
  if (!userId) return { data: null, fallback: SOAP_HISTORY_SEED };
  try {
    const { data, error } = await supabase
      .from("soap_notes")
      .select("*")
      .eq("nurse_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (data?.length) {
      return {
        data: data.map(mapSOAPFromDB),
        fallback: null,
      };
    }
    return { data: null, fallback: SOAP_HISTORY_SEED };
  } catch (err) {
    devLog("loadSOAPNotes error:", err.message);
    return { data: null, fallback: SOAP_HISTORY_SEED, error: err.message };
  }
}

export async function saveSOAPNote(note, userId) {
  try {
    const record = {
      nurse_id: userId,
      client_id: note.clientId,
      author: note.author,
      author_credentials: note.authorCredentials,
      template_id: note.templateId,
      template_label: note.templateLabel,
      service_at: note.serviceAt,
      entry_at: note.entryAt || nowISO(),
      subjective: note.subjective,
      objective: note.objective,
      assessment: note.assessment,
      plan: note.plan,
      icd10_codes: note.icd10Codes || [],
      signed: note.signed || false,
      signed_at: note.signed ? nowISO() : null,
      quick_note: note.quickNote || "",
      addendums: note.addendums || [],
      late_entry: note.lateEntry || false,
    };

    const { data, error } = await supabase
      .from("soap_notes")
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return { data: data ? { id: data.id, ...mapSOAPFromDB(data) } : null, error: null };
  } catch (err) {
    devLog("saveSOAPNote error:", err.message);
    return { data: null, error: err.message };
  }
}

export async function updateSOAPNote(id, patch, userId) {
  try {
    const update = {};
    if (patch.subjective !== undefined) update.subjective = patch.subjective;
    if (patch.objective !== undefined) update.objective = patch.objective;
    if (patch.assessment !== undefined) update.assessment = patch.assessment;
    if (patch.plan !== undefined) update.plan = patch.plan;
    if (patch.signed !== undefined) {
      update.signed = patch.signed;
      update.signed_at = patch.signed ? nowISO() : null;
    }
    if (patch.icd10Codes !== undefined) update.icd10_codes = patch.icd10Codes;
    if (patch.quickNote !== undefined) update.quick_note = patch.quickNote;
    if (patch.addendums !== undefined) update.addendums = patch.addendums;

    const { error } = await supabase.from("soap_notes").update(update).eq("id", id);
    if (error) throw error;
    return { error: null };
  } catch (err) {
    devLog("updateSOAPNote error:", err.message);
    return { error: err.message };
  }
}

export async function addSOAPAddendum(noteId, { reason, text, author }) {
  try {
    // Read current addendums, append new one
    const { data: current, error: readError } = await supabase
      .from("soap_notes")
      .select("addendums")
      .eq("id", noteId)
      .single();

    if (readError) throw readError;

    const addendum = {
      id: "add_" + Math.random().toString(36).slice(2, 8),
      author,
      addedAt: nowISO(),
      reason,
      text,
    };

    const addendums = [...(current?.addendums || []), addendum];
    const { error } = await supabase
      .from("soap_notes")
      .update({ addendums })
      .eq("id", noteId);

    if (error) throw error;
    return { data: addendum, error: null };
  } catch (err) {
    devLog("addSOAPAddendum error:", err.message);
    return { data: null, error: err.message };
  }
}

function mapSOAPFromDB(db) {
  return {
    id: db.id,
    clientId: db.client_id,
    author: db.author,
    authorCredentials: db.author_credentials,
    templateId: db.template_id,
    templateLabel: db.template_label,
    serviceAt: db.service_at,
    entryAt: db.entry_at,
    subjective: db.subjective || "",
    objective: db.objective || "",
    assessment: db.assessment || "",
    plan: db.plan || "",
    icd10Codes: db.icd10_codes || [],
    signed: db.signed || false,
    signedAt: db.signed_at,
    quickNote: db.quick_note || "",
    addendums: db.addendums || [],
    lateEntry: db.late_entry || false,
  };
}

// ─── Visits ──────────────────────────────────────────────

export async function loadVisits(nurseId) {
  if (!nurseId) return { data: null, fallback: [] };
  try {
    const { data, error } = await supabase
      .from("visits")
      .select("*")
      .eq("nurse_id", nurseId)
      .order("date", { ascending: false })
      .limit(100);
    if (error) throw error;
    if (data?.length) {
      return { data: data.map(mapVisitFromDB), fallback: null };
    }
    return { data: null, fallback: [] };
  } catch (err) {
    devLog("loadVisits error:", err.message);
    return { data: null, fallback: [], error: err.message };
  }
}

export async function saveVisit(visit, nurseId) {
  try {
    const record = {
      nurse_id: nurseId,
      client_id: visit.clientId,
      date: visit.date ? visit.date.split("T")[0] : new Date().toISOString().split("T")[0],
      time: visit.time || nowTime(),
      notes: visit.notes || "",
    };

    const { data, error } = await supabase.from("visits").insert(record).select().single();
    if (error) throw error;
    return { data: data ? mapVisitFromDB(data) : null, error: null };
  } catch (err) {
    devLog("saveVisit error:", err.message);
    return { data: null, error: err.message };
  }
}

export async function updateVisitNote(visitId, notes) {
  try {
    const { error } = await supabase.from("visits").update({ notes }).eq("id", visitId);
    if (error) throw error;
    return { error: null };
  } catch (err) {
    devLog("updateVisitNote error:", err.message);
    return { error: err.message };
  }
}

function mapVisitFromDB(db) {
  return {
    id: db.id,
    clientId: db.client_id,
    clientName: db.client_name || "",
    time: db.time || "",
    date: db.date,
    notes: db.notes || "",
  };
}

// ─── Saved Routes ────────────────────────────────────────

export async function loadSavedRoutes(nurseId) {
  if (!nurseId) return { data: null, fallback: [] };
  try {
    const { data, error } = await supabase
      .from("saved_routes")
      .select("*")
      .eq("nurse_id", nurseId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (data?.length) {
      return {
        data: data.map((r) => ({
          id: r.id,
          name: r.name,
          stops: r.stop_order || [],
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        })),
        fallback: null,
      };
    }
    return { data: null, fallback: [] };
  } catch (err) {
    devLog("loadSavedRoutes error:", err.message);
    return { data: null, fallback: [], error: err.message };
  }
}

export async function deleteSavedRoute(routeId) {
  try {
    const { error } = await supabase.from("saved_routes").delete().eq("id", routeId);
    if (error) throw error;
    return { error: null };
  } catch (err) {
    devLog("deleteSavedRoute error:", err.message);
    return { error: err.message };
  }
}

// ─── Route Sessions ──────────────────────────────────────

export async function saveRouteSession(session, nurseId) {
  try {
    const record = {
      nurse_id: nurseId,
      active: session.active,
      visited_ids: session.visitedIds || [],
      started_at: session.startedAt || nowISO(),
      ended_at: session.endedAt || null,
    };

    const { data, error } = await supabase
      .from("route_sessions")
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    devLog("saveRouteSession error:", err.message);
    return { data: null, error: err.message };
  }
}

export async function loadLatestRouteSession(nurseId) {
  if (!nurseId) return { data: null };
  try {
    const { data, error } = await supabase
      .from("route_sessions")
      .select("*")
      .eq("nurse_id", nurseId)
      .order("started_at", { ascending: false })
      .limit(1);

    if (error) throw error;
    if (data?.length) {
      const s = data[0];
      return {
        data: {
          id: s.id,
          active: s.active,
          visitedIds: s.visited_ids || [],
          startedAt: s.started_at,
          endedAt: s.ended_at,
        },
      };
    }
    return { data: null };
  } catch (err) {
    devLog("loadLatestRouteSession error:", err.message);
    return { data: null };
  }
}