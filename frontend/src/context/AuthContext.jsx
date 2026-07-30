/**
 * AuthContext — Authentication state for RouteMe.
 *
 * Owns: supabaseReady, authed, agencyAuthed, superAdminAuthed,
 * userRole, userAgencyId, dataReady, loadingError, userIdRef.
 *
 * Setters are exposed so RouteMeContext (which orchestrates the
 * session init and data loading) can drive auth lifecycle.
 *
 * This is Phase 1 of the RouteMeContext split — see CONTEXT_SPLIT_PLAN.md.
 */

import React, { createContext, useContext, useMemo, useState, useRef } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [supabaseReady, setSupabaseReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [agencyAuthed, setAgencyAuthed] = useState(false);
  const [superAdminAuthed, setSuperAdminAuthed] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userAgencyId, setUserAgencyId] = useState(null);
  const [dataReady, setDataReady] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const userIdRef = useRef(null);

  const value = useMemo(() => ({
    supabaseReady, setSupabaseReady,
    authed, setAuthed,
    agencyAuthed, setAgencyAuthed,
    superAdminAuthed, setSuperAdminAuthed,
    userRole, setUserRole,
    userAgencyId, setUserAgencyId,
    dataReady, setDataReady,
    loadingError, setLoadingError,
    userIdRef,
  }), [
    supabaseReady, authed, agencyAuthed, superAdminAuthed,
    userRole, userAgencyId, dataReady, loadingError,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}