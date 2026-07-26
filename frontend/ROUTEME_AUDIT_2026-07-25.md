# RouteMe v2 — Full App Audit

**Date:** 2026-07-25
**Commit:** cb6fc13
**Build:** Production (Render — routemev2.onrender.com)
**Stack:** React 19 + CRA/Craco, Tailwind CSS 3, Mapbox GL JS v2.15.0, Supabase (placeholder), shadcn/ui (Radix + Tailwind)

---

## 1. FILE MAP

### Core (app entry, routes, context)
| File | Lines | Purpose |
|------|-------|---------|
| `src/App.js` | 186 | Router: nurse app, agency console, superadmin console |
| `src/index.js` | — | CRA entry point |
| `src/context/RouteMeContext.jsx` | **1,063** | All app state, auth, data, actions — single mega-context |

### Pages — Nurse App (`/app/*`)
| File | Lines | Route |
|------|-------|-------|
| `Dashboard.jsx` | 208 | `/app/dashboard` — Today's overview, next visit, weekly stats, mini map |
| `RouteView.jsx` | **770** | `/app/route` — Main route: map, timeline, optimization, route session |
| `Visits.jsx` | 104 | `/app/visits` — Visit history log |
| `Routes.jsx` | 143 | `/app/routes` — Saved routes list |
| `Schedule.jsx` | 405 | `/app/schedule` — Calendar + today/week/all schedule view |
| `Clients.jsx` | 349 | `/app/clients` — Client directory |
| `ClientDetail.jsx` | 258 | `/app/clients/:id` — Client profile |
| `Notifications.jsx` | 130 | `/app/notifications` — Notification center |
| `Profile.jsx` | 282 | `/app/profile` — User settings, home base, nav preference |
| `Pricing.jsx` | 390 | `/pricing` — Public pricing page |
| `Signup.jsx` | 649 | `/signup` — Registration flow |
| `Payment.jsx` | 483 | `/payment` — Payment/stripe flow |
| `Welcome.jsx` | 260 | `/welcome` — Post-signup onboarding |
| `Landing.jsx` | 288 | `/` — Public marketing page |
| `Login.jsx` | — | `/login` — Nurse login |
| `NotFound.jsx` | — | 404 fallback |

### Pages — Agency Console (`/agency/*`)
| File | Lines | Route |
|------|-------|-------|
| `agency/Overview.jsx` | 300 | `/agency/overview` |
| `agency/Nurses.jsx` | 437 | `/agency/nurses` |
| `agency/NurseDetail.jsx` | 268 | `/agency/nurses/:id` |
| `agency/Activity.jsx` | — | `/agency/activity` |
| `agency/ClientsDir.jsx` | — | `/agency/clients` |
| `agency/AgencyClientDetail.jsx` | 284 | `/agency/clients/:id` |
| `agency/Compliance.jsx` | — | `/agency/compliance` |
| `agency/Billing.jsx` | — | `/agency/billing` |

### Pages — Superadmin Console (`/superadmin/*`)
| File | Lines | Route |
|------|-------|-------|
| `superadmin/Overview.jsx` | 306 | `/superadmin/overview` |
| `superadmin/Agencies.jsx` | — | `/superadmin/agencies` |
| `superadmin/AgencyDetail.jsx` | — | `/superadmin/agencies/:id` |
| `superadmin/NursesGlobal.jsx` | — | `/superadmin/nurses` |
| `superadmin/NurseGlobalDetail.jsx` | — | `/superadmin/nurses/:id` |
| `superadmin/ClientsGlobal.jsx` | — | `/superadmin/clients` |
| `superadmin/ClientPHI.jsx` | — | `/superadmin/clients/:id` |
| `superadmin/AdminStaff.jsx` | — | `/superadmin/staff` |
| `superadmin/AuditGlobal.jsx` | — | `/superadmin/audit` |
| `superadmin/Security.jsx` | — | `/superadmin/security` |
| `superadmin/BillingPlatform.jsx` | — | `/superadmin/billing` |
| `superadmin/SystemHealth.jsx` | — | `/superadmin/system` |

### Library / Logic
| File | Lines | Purpose |
|------|-------|---------|
| `lib/routeEngine.js` | **684** | 6 optimization strategies, AI scoring, route validation |
| `lib/directions.js` | 200 | Mapbox Directions API wrapper (fetch route, metersToMiles, secondsToShort, googleMapsUrl, appleMapsUrl) |
| `lib/mockData.js` | 143 | Seed data: 6 clients, nurse profile |
| `lib/supabase.js` | 30 | Supabase client init |
| `lib/agencyMockData.js` | — | Agency console seed data |
| `lib/superAdminMockData.js` | 435 | Superadmin seed data |
| `lib/routeDebugger.js` | — | Route state debugging/logging |
| `lib/utils.js` | — | Utilities (formatTimeWindow, etc.) |

### Components
| File | Lines | Purpose |
|------|-------|---------|
| `StylizedMap.jsx` | **487** | Mapbox map: 3D terrain, SVG overlays, hover tooltips, green checkmarks |
| `AppShell.jsx` | 276 | Nurse app layout: sidebar, topbar |
| `AgencyShell.jsx` | — | Agency console layout |
| `SuperAdminShell.jsx` | 269 | Superadmin console layout |
| `CommandCenterMap.jsx` | 316 | Agency oversight map |
| `RouteBuilderModal.jsx` | — | Add new/existing client modal |
| `NewActionModal.jsx` | — | FAB: new client, note, route |
| `RemoveFromRouteModal.jsx` | — | Remove client with reschedule option |
| `VoiceNoteModal.jsx` | — | Voice note recording |
| `ToastNotification.jsx` | — | Toast system |
| `HipaaBadge.jsx` | — | HIPAA compliance badge |
| `ReassignDialog.jsx` | — | Nurse reassignment dialog |

### UI Library (shadcn)
60+ component files under `src/components/ui/` — standard shadcn components (button, card, dialog, tabs, sheet, dropdown-menu, etc.)

### Emails
8 email templates under `src/emails/` (Welcome, PasswordReset, PaymentReceipt, PaymentFailed, NurseInvite, HipaaWeekly, LicenseExpiry, Newsletter)

### Assets & Config
| File | Purpose |
|------|---------|
| `tailwind.config.js` | Tailwind config with shadcn variables + custom brand colors |
| `src/index.css` | Tailwind directives + shadcn CSS variables + custom fonts (Playfair Display, Inter) |
| `src/assets/terrain-style.json` | Mapbox terrain/DEM style config |
| `public/` | CRA public assets (favicon, manifest, service worker) |
| `.env` | REACT_APP_MAPBOX_TOKEN, REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY, REACT_APP_OPENWEATHER_API_KEY |

---

## 2. ARCHITECTURE

### State Management
- **Single context** (`RouteMeContext.jsx`, 1,063 lines) — holds ALL app state
- **Persisted to localStorage** under key `routeme.state.v1`
- State shape:
  - `scheduleIds` — ordered array of client IDs for current route
  - `clients` — all clients (seed + saved)
  - `schedule` — derived from `scheduleIds` + `clients` (useMemo)
  - `nurse` — current nurse profile (home base, name, etc.)
  - `authed`, `agencyAuthed`, `superAdminAuthed` — auth flags
  - `routeActive`, `visitedIds`, `visits` — route session state
  - `navPreference` — "google" | "apple" | "both"
  - `optimizationMode` — current mode ("ai", "fastest", etc.)
  - `routeGeoJson`, `routeDistance`, `routeDuration` — Mapbox route data
  - `weatherData`, `weatherLoading` — OpenWeather data
  - `rescheduledClients` — clients removed/rescheduled
  - `savedRoutes` — saved route orders
  - `builderOpen`, `builderTab` — RouteBuilderModal state

### Auth
- Supabase Auth (JWT-based)
- 3 roles: **nurse**, **agency**, **superadmin**
- Protected routes via `<Protected>`, `<AgencyProtected>`, `<SuperAdminProtected>` wrappers
- Data loading gate: `supabaseReady → authed → dataReady`

### Routing
- React Router v7 (BrowserRouter)
- Flat routes: `/app/*` (nurse), `/agency/*` (agency admin), `/superadmin/*` (platform admin)
- Public: `/`, `/pricing`, `/signup`, `/login`, `/payment`, `/welcome`

---

## 3. FEATURE AUDIT

### ✅ Complete & Working

| Feature | Details |
|---------|---------|
| **Route Optimization** | 6 modes (AI, Fastest, Mileage, Fuel-efficient, Traffic-avoidance, Custom). All use multi-start nearest-neighbor. Engine in `routeEngine.js` (684 lines) |
| **Timeline** | Draggable stop cards, renumbering, visited stops move to bottom |
| **Map** | Mapbox GL with 3D terrain, SVG stop overlays, fallback curved path, home marker |
| **Route Session** | Start/End route, mark visited, progress bar, visited cards green at bottom |
| **Visit Tracking** | Every mark creates visit record, logged in Visits tab with timestamps |
| **Navigation Pref** | Google Maps / Apple Maps / Both — set in Profile, used on route cards and map tooltips |
| **Client Profile** | Full profile page, clickable from route stops and map tooltips |
| **Route Builder** | Add new client (form) or existing client (search + select) via FAB modal |
| **Remove from Route** | Remove button on timeline cards, optional reschedule to different day |
| **Dark Mode** | Via `next-themes` (ThemeProvider) |
| **Schedule** | Day/week/all view, calendar date picker |
| **Dashboard** | Next visit, weekly stats, quick stats map summary |
| **Saved Routes** | Save current order, load saved order |
| **Drag to Reorder** | Manual reorder with grip handle on timeline |
| **Optimization Modal** | Strategy selector with descriptions, "Use this route" apply button |
| **Agency Console** | Nurse management, client directory, compliance, billing pages |
| **Superadmin Console** | Multi-agency oversight, audit, security, platform billing, system health |
| **Email Templates** | 8 transaction email templates |
| **Marketing Site** | Landing page, pricing page, signup flow |
| **Map Hover Tooltips** | Client info, address (clickable → nav), full profile link, remove button |

### ⚠️ Partial / Mock

| Feature | Status | Notes |
|---------|--------|-------|
| **Supabase Backend** | Mock/placeholder | Seed data loaded client-side. Supabase client exists but no real persistence |
| **Payment/Stripe** | Mock UI | Payment page exists, stripe flow mocked |
| **Weather Data** | Mock | OpenWeather key stored but uses DOW-based static data, not real API |
| **Agency Data** | Mock | Agency seed data in `agencyMockData.js` |
| **Superadmin Data** | Mock | All superadmin pages render seed/mock data |
| **Visit Notes** | Exists on visits | Empty by default, editable in visits log |
| **Service Worker** | Configured | Workbox-based PWA SW. Interferes with local testing. Use Render for reliable testing |

### ❌ Missing / Incomplete

| Gap | Impact | Priority |
|-----|--------|----------|
| **Real database (Supabase)** | All data is mock/seed, lost on refresh if no localStorage | 🔴 Critical |
| **SOAP Notes** | No visit note capture beyond free-text field | 🟠 High |
| **Offline Support** | SW configured but no offline data sync | 🟠 High |
| **Voice-to-Text** | VoiceNoteModal UI exists but no transcription | 🟡 Medium |
| **Real-time Mapbox Directions** | Fetches real route but no live traffic overlay | 🟡 Medium |
| **Push Notifications** | No real push notification system | 🟡 Medium |
| **Billing/Revenue System** | Payment UI exists but no real billing or subscription management | 🟡 Medium |
| **ICD-10/Coding** | No diagnosis coding support | 🟡 Medium |
| **Multi-language** | English only | 🟢 Low |
| **Analytics/Reporting** | No exportable reports or analytics dashboards | 🟡 Medium |
| **Patient/Family Portal** | No family-facing interface | 🟢 Low |
| **EHR Integration** | No API integration with EHR systems | 🟠 High |
| **Nurse Scheduling** | No auto-scheduling of nurses to clients | 🟡 Medium |
| **Compliance Automation** | HIPAA audit logs exist but no automated compliance reporting | 🟡 Medium |
| **Mobile App** | Web-only, no native mobile wrapper | 🟠 High |

---

## 4. KEY METRICS

| Metric | Value |
|--------|-------|
| **Total lines of code (source)** | ~26,783 |
| **Context file** | 1,063 lines |
| **Largest page** | RouteView.jsx (770 lines) |
| **NPM dependencies** | ~70 packages |
| **Optimization strategies** | 6 |
| **Pages (nurse app)** | 11 |
| **Agency pages** | 8 |
| **Superadmin pages** | 11 |
| **shadcn UI components** | 60+ |
| **Email templates** | 8 |
| **Git commits** | 20+ on main |
| **Build size** | ~560 KB JS + 20 KB CSS |

---

## 5. KNOWN ISSUES / TECHNICAL DEBT

1. **`nurse.homeBase` missing from dependency arrays** — 5 locations in RouteMeContext.jsx (lines 536, 581, 622, 768, 804). ESLint warnings, not bugs — but could cause stale closure bugs if homeBase changes
2. **`calendarDate` unnecessary dependency** — Schedule.jsx useMemo has `calendarDate` in deps (line 169) triggering eslint warning
3. **No real database** — All data is seed/mock. App will not persist across devices
4. **Mapbox free-tier limits** — 100K requests/month free. Production usage with many nurses will exceed this
5. **No real-time updates** — No WebSocket/SSE for live route changes
6. **No automated tests** — Zero test files found
7. **Single mega-context** — 1,063 line context file is a maintainability risk. Should be split into smaller contexts (auth, route, schedule, etc.)
8. **No error boundaries** — Uncaught errors will crash the app silently
9. **No type checking** — No TypeScript, plain JSX with PropTypes only via eslint
10. **No input sanitization** — Client name/address fields accept raw input

---

## 6. DEPENDENCIES

### Critical Runtime
- `react` 19.0.0
- `react-router-dom` 7.15.0
- `mapbox-gl` ~2.15.0 (downgraded from v3 for stable terrain)
- `@supabase/supabase-js` ^2.110.7 (for future backend)
- `lucide-react` 0.516.0 (icons)
- `framer-motion` 11.18.0 (animations)
- `recharts` 3.6.0 (charts)
- `date-fns` 4.1.0 / `dayjs` 1.11.13 (date handling)
- `zod` 3.24.4 (validation)
- `react-hook-form` 7.56.2 (forms)
- `tailwindcss` 3.4.17
- `@tanstack/react-query` 5.56.2 (API queries/future use)
- `swr` 2.3.8 (data fetching)

### Build Tooling
- `@craco/craco` 7.1.0 (CRA override)
- `react-scripts` 5.0.1
- `postcss` 8.5.10 + `autoprefixer` 10.4.20
- Workbox SW plugins (PWA support)

### Security Resolutions
40+ dependency overrides for CVE fixes (node-forge, fast-uri, flatted, qs, diff, follow-redirects, path-to-regexp, rollup, underscore, nth-check, serialize-javascript, etc.)

---

## 7. BUILD & DEPLOY

### Commands
```bash
npx craco start          # Dev server (hot reload)
npx craco build          # Production build → build/
npx serve -s build -l 3000  # Serve production build
```

### Environment Variables
- `REACT_APP_MAPBOX_TOKEN` — Mapbox access token (free tier, streets-v11)
- `REACT_APP_SUPABASE_URL` — Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY` — Supabase anonymous key
- `REACT_APP_OPENWEATHER_API_KEY` — OpenWeather API key

### Deployment
- **Render** — auto-deploys from `main` branch
- URL: `https://routemev2.onrender.com`
- Node engine: 20
- Auto-deploy: on git push

### Deploy Pitfalls
1. Old server processes serve stale builds — always kill before serving locally
2. CRA service worker caches old assets — hard refresh needed after deploy
3. Mapbox DEM tiles may fail silently on slow networks (terrain disabled gracefully)
4. Static site (no server-side routing) — 404s handled client-side via `<NotFound />`