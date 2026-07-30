/**
 * Composed provider — wraps all RouteMe contexts into a single tree.
 *
 * Provider order (dependencies flow downward):
 *   AuthContext (no deps)
 *     → NurseContext (depends on AuthContext for userId)
 *       → RouteContext (depends on NurseContext for schedule, clients)
 *         → SOAPContext (depends on NurseContext for nurse, pushAudit)
 *           → AgencyContext (depends on AuthContext for userAgencyId)
 *             → PlatformContext (depends on AuthContext for auth state)
 *               → DataInitializer (loads data on mount from Supabase)
 *
 * The backwards-compatible useRouteMe() hook merges all contexts
 * so existing consumers don't need to change.
 */
import React from "react";
import { AuthProvider } from "./AuthContext";
import { NurseProvider } from "./NurseContext";
import { RouteProvider } from "./RouteContext";
import { SOAPProvider } from "./SOAPContext";
import { AgencyProvider } from "./AgencyContext";
import { PlatformProvider } from "./PlatformContext";
import { DataInitializer } from "./DataInitializer";

export function RouteMeProvider({ children }) {
  return (
    <AuthProvider>
      <NurseProvider>
        <RouteProvider>
          <SOAPProvider>
            <AgencyProvider>
              <PlatformProvider>
                <DataInitializer>
                  {children}
                </DataInitializer>
              </PlatformProvider>
            </AgencyProvider>
          </SOAPProvider>
        </RouteProvider>
      </NurseProvider>
    </AuthProvider>
  );
}