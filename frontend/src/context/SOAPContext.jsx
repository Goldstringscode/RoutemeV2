/**
 * SOAPContext — owns all SOAP notes state and CRUD operations.
 *
 * Depends on: AuthContext (for userIdRef), NurseContext (for nurse.name, pushAudit)
 * Provides:  useSOAP() hook
 *
 * Extracted from RouteMeContext during Phase 4 of the context split.
 * Backwards-compatible — consumers continue using useRouteMe() which merges all contexts.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { SOAP_HISTORY_SEED } from "@/lib/soapMockData";
import { generateSOAPFromLLM } from "@/lib/soapEngine";
import {
  loadSOAPNotes, saveSOAPNote, updateSOAPNote, addSOAPAddendum as addSOAPAddendumDB,
} from "@/lib/dataService";
import { useAuth } from "./AuthContext";
import { useNurse } from "./NurseContext";

const KEY = "routeme:soap";
const SOAPContext = createContext(null);

const loadState = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
};

export function SOAPProvider({ children }) {
  const { userIdRef } = useAuth();
  const { nurse, pushAudit } = useNurse();

  const initial = loadState();
  const [soapNotes, setSoapNotes] = useState(initial?.soapNotes ?? SOAP_HISTORY_SEED);
  const [loadedOnce, setLoadedOnce] = useState(false);

  /* ─── Persist to localStorage ──────────────────────── */
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ soapNotes }));
    } catch { /* quota exceeded — ignore */ }
  }, [soapNotes]);

  /* ─── Load from Supabase (called from RouteMeContext loadData) ─── */
  const loadSOAPData = useCallback(async () => {
    if (loadedOnce) return;
    setLoadedOnce(true);
    const soapResult = await loadSOAPNotes(userIdRef.current);
    if (soapResult.data) {
      setSoapNotes(soapResult.data);
    } else if (soapResult.fallback) {
      setSoapNotes(soapResult.fallback);
    }
  }, [userIdRef, loadedOnce]);

  /* ─── SOAP CRUD ────────────────────────────────────── */

  const addSOAPNote = useCallback(async (note) => {
    const id = "soap_" + Math.random().toString(36).slice(2, 8);
    setSoapNotes((s) => [{ id, ...note }, ...s]);
    pushAudit(`SOAP note ${note.signed ? "signed" : "saved as draft"} — ${note.templateLabel}`, note.signed ? "sign" : "draft");
    const result = await saveSOAPNote({ ...note, id }, userIdRef.current);
    if (result.error) {
      console.error("Failed to save SOAP note:", result.error);
      pushAudit(`DB sync failed — save SOAP note`, "error");
      // Don't toast here — the caller may want to handle it
      return { error: result.error };
    }
    return { data: { id } };
  }, [pushAudit, userIdRef]);

  const updateSOAPNote = useCallback(async (id, patch) => {
    setSoapNotes((s) => s.map((n) => (n.id === id ? { ...n, ...patch } : n)));
    pushAudit(`SOAP note ${patch.signed ? "signed" : "updated"}`, patch.signed ? "sign" : "update");
    const result = await updateSOAPNote(id, patch, userIdRef.current);
    if (result.error) {
      console.error("Failed to update SOAP note:", result.error);
      pushAudit(`DB sync failed — update SOAP note`, "error");
      return { error: result.error };
    }
    return { data: { id } };
  }, [pushAudit, userIdRef]);

  const addSOAPAddendum = useCallback(async (id, { reason, text }) => {
    const addendum = {
      id: "add_" + Math.random().toString(36).slice(2, 8),
      author: `${nurse.name}, ${nurse.license || "RN"}`,
      addedAt: new Date().toISOString(),
      reason, text,
    };
    setSoapNotes((s) => s.map((n) => n.id === id ? {
      ...n,
      addendums: [...(n.addendums || []), addendum],
    } : n));
    pushAudit(`Addendum appended (${reason})`, "addendum");
    const result = await addSOAPAddendumDB(id, { reason, text, author: addendum.author });
    if (result.error) {
      console.error("Failed to save addendum:", result.error);
      pushAudit(`DB sync failed — addendum`, "error");
      return { error: result.error };
    }
    return { data: { id } };
  }, [pushAudit, nurse]);

  /* ─── Context value ────────────────────────────────── */
  const value = {
    soapNotes, setSoapNotes,
    loadSOAPData,
    addSOAPNote,
    updateSOAPNote,
    addSOAPAddendum,
    generateSOAPMock: generateSOAPFromLLM,
  };

  return <SOAPContext.Provider value={value}>{children}</SOAPContext.Provider>;
}

export const useSOAP = () => {
  const ctx = useContext(SOAPContext);
  if (!ctx) throw new Error("useSOAP must be used within SOAPProvider");
  return ctx;
};