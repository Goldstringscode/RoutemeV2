# RouteMeContext Split — Migration Plan

## Problem
`src/context/RouteMeContext.jsx` — 1,212 lines, 62 KB — manages 6 independent domains:
- Auth (authed, supabaseReady, dataReady, loadingError, userRole)
- Nurse (nurse profile, clients, schedule, notes, notifications, navPreference)
- Route (activeRoute, visitedIds, routeGeoJson, weather)
- SOAP (soapNotes, create/update/addendum)
- Agency (agency profile, nurses, compliance, billing)
- Platform (superadmin: agencies, global audit, billing, system health)

**Impact:** 30+ consumers re-render on every state change. No `useMemo` on the value object. Every new feature makes it worse.

---

## Target Architecture

```
src/context/
├── AuthContext.jsx        # ~100 lines — auth state + session
├── NurseContext.jsx       # ~250 lines — nurse data + client mgmt
├── RouteContext.jsx       # ~200 lines — active route + visits
├── SOAPContext.jsx        # ~150 lines — SOAP notes CRUD
├── AgencyContext.jsx      # ~200 lines — agency admin
├── PlatformContext.jsx    # ~250 lines — superadmin
└── index.js               # composes providers into RouteMeProvider
```

### Dependency Graph

```
AuthContext         (no deps)
    ↑
NurseContext        (depends on AuthContext for userId)
    ↑
RouteContext        (depends on NurseContext for schedule, clients)
    ↑
SOAPContext         (depends on NurseContext for clients list)
    ↑
AgencyContext       (depends on AuthContext for agencyId)
    ↑
PlatformContext     (depends on AuthContext for superAdmin status)
```

---

## Phase 1: Extract AuthContext

### New file: `src/context/AuthContext.jsx`

**State to extract:**
- `authed`, `setAuthed`
- `supabaseReady`, `setSupabaseReady`
- `dataReady`, `setDataReady`
- `loadingError`, `setLoadingError`
- `userRole`, `setUserRole`
- `userAgencyId`, `setUserAgencyId`
- `agencyAuthed`, `setAgencyAuthed`
- `superAdminAuthed`, `setSuperAdminAuthed`
- `userIdRef` (useRef)
- `sessionCheckDone` (useRef)

**Functions to extract:**
- `loadData(userId)` — profile fetch, role detection, initial data load
- `signOut()` — clears all auth state, redirects to login

**What changes:**
- Remove these 10 state vars + 2 refs + 2 functions from RouteMeContext
- Add `<AuthProvider>` wrapper in provider tree
- `useAuth()` hook for consumers that only need auth
- `RouteMeContext` imports `useAuth()` internally for backwards compatibility

**Consumers that switch to useAuth():**
- `App.js` — Protected, AgencyProtected, SuperAdminProtected wrappers
- `Login.jsx`, `AgencyLogin.jsx`, `SuperAdminLogin.jsx`
- `AppShell.jsx`, `AgencyShell.jsx`, `SuperAdminShell.jsx` (auth checks)

---

## Phase 2: Extract NurseContext ✅ COMPLETED

### New file: `src/context/NurseContext.jsx`

**State to extract:**
- `nurse`, `setNurse`
- `clients`, `setClients`
- `schedule`, `scheduleIds`, `setScheduleIds`
- `notes`, `setNotes` (visit notes, not SOAP)
- `audit`, `pushAudit`
- `optimized`, `setOptimized`
- `onboardingComplete`, `setOnboardingComplete`
- `savedRoutes`, `setSavedRoutes`
- `notifications`, `setNotifications`
- `optimizationMode`, `setOptimizationMode`
- `navPreference`, `setNavPreference`
- `builderOpen`, `setBuilderOpen`
- `builderTab`, `setBuilderTab`
- `voiceOpen`, `setVoiceOpen`
- `voiceTarget`, `setVoiceTarget`

**Functions to extract:**
- `addClient`, `updateClient`, `removeClient`
- `reorder`, `optimize`, `resetRouteOrder`
- `addNote`
- `saveRoute`, `loadRoute`
- `openVoice`

**What changes:**
- Remove ~20 state vars + 10 functions from RouteMeContext
- Add `<NurseProvider>` in provider tree
- `useNurse()` hook for consumers

**Consumers that switch to useNurse():**
- `Dashboard.jsx`, `Clients.jsx`, `ClientDetail.jsx`, `ClientForm.jsx`
- `Schedule.jsx`, `Notifications.jsx`
- `Profile.jsx`, `NurseSettings.jsx`
- `Onboarding.jsx`

---

## Phase 3: Extract RouteContext ✅ COMPLETED

### New file: `src/context/RouteContext.jsx`

**State to extract:**
- `routeActive`, `setRouteActive`
- `visitedIds`, `setVisitedIds`
- `visits`, `setVisits`
- `routeResult`, `setRouteResult`
- `routeGeoJson`, `setRouteGeoJson`
- `routeDistance`, `setRouteDistance`
- `routeDuration`, `setRouteDuration`
- `routeKey`, `setRouteKey`
- `weatherData`, `setWeatherData`
- `weatherLoading`, `setWeatherLoading`
- `rescheduledClients`, `setRescheduledClients`

**Functions to extract:**
- `startRoute`, `endRoute`
- `markVisited`, `unmarkVisited`
- `fetchWeather`
- `createRoute`, `removeFromRoute`
- `rescheduleClient`

**What changes:**
- Remove ~11 state vars + 6 functions from RouteMeContext
- Add `<RouteProvider>` in provider tree
- `useRoute()` hook for consumers

**Consumers that switch to useRoute():**
- `RouteView.jsx`, `StylizedMap.jsx`
- `RouteBuilderModal.jsx`, `RemoveFromRouteModal.jsx`
- `CommandCenterMap.jsx`

---

## Phase 4: Extract SOAPContext ✅ COMPLETED

### New file: `src/context/SOAPContext.jsx`

**State to extract:**
- `soapNotes`, `setSoapNotes`

**Functions to extract:**
- `addSOAPNote`
- `updateSOAPNote`
- `addSOAPAddendum`
- `generateSOAPMock`

**What changes:**
- Remove ~1 state var + 4 functions from RouteMeContext
- Add `<SOAPProvider>` in provider tree
- `useSOAP()` hook for consumers

**Consumers that switch to useSOAP():**
- `SOAPHub.jsx`, `SOAPEditorPage.jsx`
- `ClientDetail.jsx` (SOAP history section)

---

## Phase 5: Extract AgencyContext ✅ COMPLETED

### New file: `src/context/AgencyContext.jsx`

**State to extract:**
- `agency`, `setAgency`
- `nurses`, `setNurses`
- `liveActivity`, `setLiveActivity`
- `agencyClients`, `setAgencyClients`
- `complianceLog`, `setComplianceLog`

**Functions to extract:**
- `inviteNurse`
- `setNurseStatus`
- `removeNurse`
- `reassignClient`

**What changes:**
- Remove ~5 state vars + 4 functions from RouteMeContext
- Add `<AgencyProvider>` in provider tree
- `useAgency()` hook for consumers

**Consumers that switch to useAgency():**
- All pages under `src/pages/agency/`

---

## Phase 6: Extract PlatformContext ✅ COMPLETED

### New file: `src/context/PlatformContext.jsx`

**State to extract:**
- `platform`, `setPlatform`
- `superAdminMe`, `setSuperAdminMe`
- `agencies`, `setAgencies`
- `globalNurses`, `setGlobalNurses`
- `globalClients`, `setGlobalClients`
- `superAdmins`, `setSuperAdmins`
- `globalAudit`, `setGlobalAudit`
- `activeSessions`, `setActiveSessions`
- `securityEvents`, `setSecurityEvents`
- `systemMetrics`, `setSystemMetrics`
- `billingLedger`, `setBillingLedger`
- `featureFlags`, `setFeatureFlags`
- `maintenanceMode`, `setMaintenanceMode`
- `impersonation`, `setImpersonation`
- `phiRevealed`, `setPhiRevealed`

**Functions to extract:**
- `setAgencyStatus`
- `addSuperAdmin`
- `toggleMaintenance`
- `impersonate`

**What changes:**
- Remove ~15 state vars + 4 functions from RouteMeContext
- Add `<PlatformProvider>` in provider tree
- `usePlatform()` hook for consumers

**Consumers that switch to usePlatform():**
- All pages under `src/pages/superadmin/`

---

## Phase 7: Composed Provider ✅ COMPLETED

### New file: `src/context/index.jsx`

```jsx
import { AuthProvider } from "./AuthContext";
import { NurseProvider } from "./NurseContext";
import { RouteProvider } from "./RouteContext";
import { SOAPProvider } from "./SOAPContext";
import { AgencyProvider } from "./AgencyContext";
import { PlatformProvider } from "./PlatformContext";

export function RouteMeProvider({ children }) {
  return (
    <AuthProvider>
      <NurseProvider>
        <RouteProvider>
          <SOAPProvider>
            <AgencyProvider>
              <PlatformProvider>
                {children}
              </PlatformProvider>
            </AgencyProvider>
          </SOAPProvider>
        </RouteProvider>
      </NurseProvider>
    </AuthProvider>
  );
}
```

### Backwards Compatibility

During the migration, keep `RouteMeContext.jsx` as a **compatibility layer** that re-exports all contexts:

```jsx
// RouteMeContext.jsx — becomes thin re-export
export { RouteMeProvider } from "./index";
export function useRouteMe() {
  const auth = useAuth();
  const nurse = useNurse();
  const route = useRoute();
  const soap = useSOAP();
  const agency = useAgency();
  const platform = usePlatform();
  return { ...auth, ...nurse, ...route, ...soap, ...agency, ...platform };
}
```

This means **zero changes to consumers** during the migration. Every file that calls `useRouteMe()` continues to work. Then incrementally, each consumer can switch to the specific context hook it needs.

---

## Migration Order

```
Phase 1: AuthContext       → 1-2 hours (cleanest extraction)
Phase 2: NurseContext      → 2-3 hours (largest extraction)
Phase 3: RouteContext      → 1-2 hours
Phase 4: SOAPContext       → 30 min (smallest)
Phase 5: AgencyContext     → 1-2 hours
Phase 6: PlatformContext   → 1-2 hours
Phase 7: Composed provider → 30 min
                          ─────────
    Total:                 ~8-12 hours
```

**Key rule:** After each phase, run `npx craco build` and verify 0 errors. Any phase can be deployed independently — no need to do all 6 at once.

---

## Per-Phase Checklist

Each phase follows this pattern:
1. Create new context file with extracted state + functions
2. Add `useMemo` on the value object
3. Export a named hook (`useAuth`, `useNurse`, etc.)
4. Remove extracted state/functions from RouteMeContext
5. Add new provider to the composed provider tree
6. Update `useRouteMe()` compatibility layer
7. Run `npx craco build` — verify 0 errors
8. Run `npx craco build 2>&1 | grep -iE "error|warn" | grep -v "DeprecationWarning"` — verify 0 warnings

---

## Risk Mitigation

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Missing state var in extraction | Low | TypeScript-like patterns: grep for each var name after extraction |
| Broken import path | Low | Run build after each phase |
| Re-render regression | Medium | Wrap each context value in useMemo(..., [deps]) |
| Consumer still uses useRouteMe for single-domain data | Low | Non-breaking — compatibility layer works. Migration is incremental. |

---

*Plan v1.0 — Generated 2026-07-29*