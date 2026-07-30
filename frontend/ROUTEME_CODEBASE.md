# RouteMe Codebase — Agent Onboarding Guide

> **Purpose:** Get any new agent (human or AI) productive on the RouteMe codebase in under 10 minutes.
> **Location:** This file lives at the project root so every agent's first action can be `read_file path="ROUTEME_CODEBASE.md"`.
> **Last updated:** 2026-07-28

---

## 1. Project Identity

| Field | Value |
|-------|-------|
| **App name** | RouteMe |
| **Tagline** | "Home Health Routing, Reimagined" |
| **Domain** | Home health SaaS — route optimization, SOAP notes, visit tracking, agency management |
| **Stack** | React 19, CRA + Craco 7, Tailwind CSS 3, Supabase, Mapbox GL v2.15 |
| **Bundle** | ~2.3 MB JS (main chunk), ~617 KB gzipped |
| **Node** | 20.x |
| **Deploy** | Render (auto-deploy from `main`) |
| **Branch** | `main` (primary), feature branches off `main` |
| **Demo login** | `amara.okafor@nurse.demo` / `Demo1234!` (nurse) |
| **Home base** | Dos Lagos, Corona, CA (lat 33.7726, lng -117.5928) |
| **Build command** | `npx craco build` — 0 errors, 0 warnings expected |
| **Dev command** | `npm start` — runs on `localhost:3000` |

---

## 2. Directory Layout

```
routemev2/frontend/
├── public/
│   ├── index.html           # SPA shell, Google Fonts, manifest, PWA meta
│   ├── manifest.json        # PWA manifest (theme: #2e4a3a forest green)
│   ├── icon-*.png           # PWA icons (192, 512)
│   └── _redirects           # Netlify SPA redirect: /* /index.html 200
│
├── src/
│   ├── App.js               # Root: BrowserRouter + 3 role shells + 45+ routes
│   ├── App.css              # Minimal overrides
│   ├── index.js             # Entry: QueryClientProvider + SW registration
│   ├── index.css            # Tailwind directives + design tokens + animations
│   │
│   ├── context/
│   │   └── RouteMeContext.jsx   # ⚠️ 1212-line MONOLITH — 6 domains in one (AUDIT: P0)
│   │                              # Auth, Nurse, Route, SOAP, Agency, Platform
│   │
│   ├── components/
│   │   ├── AppShell.jsx         # Nurse sidebar layout (287 lines)
│   │   ├── AgencyShell.jsx      # Agency director layout (220 lines)
│   │   ├── SuperAdminShell.jsx  # Platform admin layout (269 lines)
│   │   ├── StylizedMap.jsx      # Mapbox map with SVG overlays (511 lines)
│   │   ├── CommandCenterMap.jsx # Agency live tracking map
│   │   ├── RouteBuilderModal.jsx # Route optimization picker
│   │   ├── RemoveFromRouteModal.jsx
│   │   ├── NewActionModal.jsx
│   │   ├── VoiceNoteModal.jsx
│   │   ├── ReassignDialog.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── HipaaBadge.jsx
│   │   ├── UpdateBanner.jsx     # SW update notification
│   │   ├── ToastNotification.jsx # Legacy (Sonner used instead)
│   │   ├── DocLayout.jsx        # Legal page wrapper
│   │   └── ui/                  # 45 shadcn/ui components (Radix primitives)
│   │       ├── accordion.jsx, alert.jsx, button.jsx, card.jsx, ...
│   │       ├── dialog.jsx, dropdown-menu.jsx, sheet.jsx, sonner.jsx
│   │       └── [45 files total]
│   │
│   ├── pages/
│   │   ├── Landing.jsx          # Marketing page
│   │   ├── Login.jsx            # Nurse login (with demo button)
│   │   ├── AgencyLogin.jsx      # Agency director login
│   │   ├── SuperAdminLogin.jsx  # Platform admin login
│   │   ├── Signup.jsx
│   │   ├── Pricing.jsx
│   │   ├── Payment.jsx          # Mock credit card form
│   │   ├── Welcome.jsx          # Post-signup welcome
│   │   ├── Onboarding.jsx       # 4-step tour (profile, route, SOAP, done)
│   │   ├── Dashboard.jsx        # Nurse home: weather, stats, alerts
│   │   ├── RouteView.jsx        # Route optimization + Mapbox map + SOAP
│   │   ├── Routes.jsx           # Saved routes list
│   │   ├── Visits.jsx           # Visit history
│   │   ├── Schedule.jsx         # Weekly schedule view
│   │   ├── Clients.jsx          # Client directory
│   │   ├── ClientDetail.jsx     # Single client profile + SOAP + visits
│   │   ├── ClientForm.jsx       # Add/edit client
│   │   ├── CarePlan.jsx         # Care plan view
│   │   ├── VitalsEntry.jsx      # Vital signs recording
│   │   ├── VisitSignature.jsx   # Empty shell (AUDIT: not implemented)
│   │   ├── Profile.jsx          # Nurse profile + nav preference
│   │   ├── NurseSettings.jsx    # App settings
│   │   ├── SOAPHub.jsx          # SOAP note library
│   │   ├── SOAPEditorPage.jsx   # SOAP note editor with AI generation
│   │   ├── Notifications.jsx
│   │   ├── HelpCenter.jsx
│   │   ├── NotFound.jsx
│   │   ├── EmailPreview.jsx     # Dev-only email templates
│   │   │
│   │   ├── auth/
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── SetNewPassword.jsx
│   │   │   ├── VerifyEmail.jsx
│   │   │   └── DataPrivacy.jsx  # PHI export + data retention
│   │   │
│   │   ├── legal/
│   │   │   ├── BAA.jsx, Privacy.jsx, Terms.jsx, SecurityPage.jsx, Cookies.jsx
│   │   │
│   │   ├── agency/
│   │   │   ├── Overview.jsx     # Agency dashboard (KPIs, map, activity)
│   │   │   ├── Nurses.jsx       # Nurse directory
│   │   │   ├── NurseDetail.jsx  # Single nurse profile
│   │   │   ├── ClientsDir.jsx   # Agency-wide client list (with PHI search)
│   │   │   ├── AgencyClientDetail.jsx
│   │   │   ├── Activity.jsx     # Live activity feed
│   │   │   ├── Compliance.jsx   # Compliance dashboard
│   │   │   └── Billing.jsx      # Billing overview
│   │   │
│   │   └── superadmin/
│   │       ├── Overview.jsx     # Platform KPIs
│   │       ├── Agencies.jsx     # Agency management
│   │       ├── AgencyDetail.jsx
│   │       ├── NursesGlobal.jsx
│   │       ├── NurseGlobalDetail.jsx
│   │       ├── ClientsGlobal.jsx
│   │       ├── ClientPHI.jsx    # PHI audit view
│   │       ├── AdminStaff.jsx
│   │       ├── AuditGlobal.jsx  # Global audit log
│   │       ├── Security.jsx     # Security events
│   │       ├── BillingPlatform.jsx
│   │       ├── SystemHealth.jsx
│   │       ├── DataRetention.jsx
│   │       └── GlobalSearch.jsx
│   │
│   ├── hooks/
│   │   ├── useToast.js          # Sonner wrapper (success/error/info/warning)
│   │   └── useSWUpdate.js       # Service worker update detection
│   │
│   ├── lib/
│   │   ├── supabase.js          # Supabase client + auth helpers + DEMO_ACCOUNTS
│   │   ├── dataService.js       # CRUD layer for all 6 tables (~250 lines)
│   │   ├── maps.js              # 🆕 Shared: detectMapsApp, googleMapsUrl, appleMapsUrl, resolveNav
│   │   ├── directions.js        # Mapbox Directions API + URL builders
│   │   ├── routeEngine.js       # Route optimization algorithms (7 modes)
│   │   ├── routeDebugger.js     # Debug logging (ENABLED hardcoded true! AUDIT)
│   │   ├── soapEngine.js        # AI SOAP note generation via OpenRouter
│   │   ├── soapPrint.js         # Print-formatted SOAP HTML
│   │   ├── soapMockData.js      # Seed SOAP notes
│   │   ├── mockData.js          # Seed clients, schedule, visits
│   │   ├── agencyMockData.js    # Seed agency data
│   │   ├── superAdminMockData.js # Seed superadmin data
│   │   └── utils.js             # cn(), formatTimeWindow(), etc.
│   │
│   ├── constants/
│   │   └── testIds/             # data-testid constants
│   │
│   └── emails/                  # 10 email templates (React components)
│       ├── EmailShell.jsx       # Shared email wrapper
│       ├── WelcomeEmail.jsx, NurseInviteEmail.jsx, ...
│       └── HipaaWeeklyEmail.jsx
│
├── supabase/
│   └── migrations/
│       └── 00004_agencies_and_roles.sql
│
├── supabase-seed.sql            # Full schema + seed data for local dev
├── agent-workflow-blueprint.md  # Multi-agent pipeline (4 roles, 4 phases)
├── craco.config.js              # Webpack overrides, aliases, health check
├── tailwind.config.js           # shadcn/ui theme + custom tokens
├── jsconfig.json                # @/ → src/ alias
├── .env.example                 # Required env vars template
└── package.json                 # 94 dependencies, react-scripts 5.0.1
```

---

## 3. Architecture Overview

### 3.1 Three-Tier Shell Architecture

```
public/          → Landing, Pricing, Signup, Login
/app/*           → Nurse workspace (AppShell wrapper)
/agency/*        → Agency console (AgencyShell wrapper)
/superadmin/*    → Platform admin (SuperAdminShell wrapper)
```

Each shell provides:
- **Desktop**: fixed sidebar + sticky header + scrollable content
- **Mobile**: hamburger drawer overlay
- **Auth gate**: redirects to login if unauthenticated

### 3.2 State Management (⚠️ AUDIT FINDING: P0)

**Single monolithic context** (`RouteMeContext.jsx`) manages 6 independent domains:
1. **Auth** — authed, supabaseReady, dataReady, loadingError
2. **Nurse** — nurse profile, clients, schedule, notes, notifications
3. **Route** — activeRoute, visitedIds, routeGeoJson, weather
4. **SOAP** — soapNotes, create/update/addendum
5. **Agency** — agency profile, nurses, compliance, billing
6. **Platform** — superadmin, agencies, global audit, billing, system health

**Known issues:**
- Context `value` has NO `useMemo` → all 30+ consumers re-render on every change
- No `React.memo` anywhere in the codebase
- 9 fire-and-forget Supabase calls with `.then().catch()` (no await, no retry)
- localStorage persistence serializes 30+ vars on every change (no debounce)

### 3.3 Auth Flow

1. Supabase Auth with email/password
2. Session stored in Supabase auth cookie
3. `App.js` → `<Protected>`, `<AgencyProtected>`, `<SuperAdminProtected>` wrappers
4. Demo credentials hardcoded in `src/lib/supabase.js` (AUDIT: remove before production)
5. Three roles: `nurse`, `agency_admin`, `super_admin`

### 3.4 Data Layer

| Table | Purpose | RLS? | Audit Finding |
|-------|---------|------|---------------|
| `profiles` | User profiles (nurses, admins) | ✅ Yes | ✅ |
| `clients` | Patient records (PHI) | ✅ Yes | ✅ |
| `visits` | Visit logs | ⚠️ Missing in seed | 🔴 CRITICAL |
| `soap_notes` | Clinical notes (PHI) | ⚠️ Missing in seed | 🔴 CRITICAL |
| `saved_routes` | Route presets | ⚠️ Missing in seed | 🔴 CRITICAL |
| `route_sessions` | Active route tracking | ⚠️ Missing in seed | 🔴 CRITICAL |

**Data Service Layer:** `src/lib/dataService.js` wraps all Supabase CRUD. Every function returns `{ data, error }`. Has mock fallback pattern.

**Known issues:**
- All 18 queries use `.select('*')` — no column projection
- No indexes on `nurse_id`, `client_id`, `visit_date`
- No `updated_at` triggers on any table
- No soft-delete for PHI
- No offline queue or retry logic

### 3.5 Route Optimization Engine

`src/lib/routeEngine.js` — 7 optimization modes using a weighted heuristic:
1. **AI smart route** — balances priority, traffic, time windows, distance
2. **Fastest** — earliest time windows first
3. **Least mileage** — nearest-neighbor TSP
4. **Fuel efficient** — weight distance over speed
5. **Traffic avoidance** — penalize 7-9 AM and 4-7 PM arrivals
6. **Custom** — priority-first ordering
7. **Load saved** — previously saved route order

---

## 4. Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Maps** | Mapbox GL v2.15.0 (free tier, `streets-v11`) | Route visualization, 3D terrain |
| **Deep links** | Universal HTTP URLs (`google.com/maps/dir/?api=1...`) | Works without app installed, OS handles fallback |
| **Nav preference** | localStorage → auto-detect with per-route override | Persists across sessions, device-aware |
| **Toast system** | Sonner v2.0.3 | Lightweight, shadcn/ui compatible, used by Vercel |
| **CSS** | Tailwind CSS 3 + shadcn/ui | Rapid development, consistent design tokens |
| **Icons** | Lucide React | Tree-shakeable, consistent style |
| **Auth** | Supabase Auth | Built-in RLS, session management, email/password |
| **AI** | OpenRouter (DeepSeek V3) | SOAP note generation, cost-effective |
| **PWA** | Workbox via react-scripts | Service worker with update notification |
| **Dates** | date-fns v4 | Tree-shakeable (dayjs is unused — remove) |

---

## 5. Styling & Design Tokens

Defined in `src/index.css`:
- `--rm-bg: #F9F8F6` — warm off-white background
- `--rm-terra: #D95D39` — brand orange/terra (primary CTA)
- `--rm-sage: #7FA08B` — sage green (secondary)
- `--rm-ink: #1C1917` — near-black text

Fonts (loaded via Google Fonts in `index.html`):
- **Inter** — body / UI text
- **Outfit** — display / headings
- **Manrope** — navigation / metrics
- **Instrument Serif** — italic accents / pullquotes

Animations (defined in `index.css`):
- `rm-fade-up` — staggered fade-in
- `rm-lift` — hover card lift
- `rm-bar` — waveform pulse
- `rm-grain` — subtle noise texture overlay

---

## 6. Environment Variables (`.env.example`)

```env
REACT_APP_MAPBOX_TOKEN=pk.your_mapbox_token        # Required — Mapbox maps
REACT_APP_SUPABASE_URL=https://project.supabase.co  # Required — Supabase API
REACT_APP_SUPABASE_ANON_KEY=your_anon_key           # Required — Supabase auth
REACT_APP_OPENWEATHER_KEY=your_owm_key              # Optional — weather overlay
REACT_APP_OPENROUTER_API_KEY=your_or_key            # Optional — AI SOAP notes
```

⚠️ API keys for OpenRouter and OpenWeather are **exposed client-side** in the JS bundle. They should be proxied through a serverless function for production.

---

## 7. PWA / Offline

- **Service worker**: Registered in `src/index.js` via Workbox
- **Update flow**: SW detects update → `UpdateBanner.jsx` shows "Update available" → user clicks to reload
- **Manifest**: `public/manifest.json` — theme color `#2e4a3a`, display `standalone`
- **Apple touch**: `apple-touch-icon`, `apple-mobile-web-app-capable`
- **Offline support**: Registering SW but current data layer has **no offline cache or queue** (AUDIT: must add)

---

## 8. Audit Findings (July 2026) — Quick Reference

### 🔴 Must Fix Before Production Launch

| # | Area | Issue | File |
|---|------|-------|------|
| 1 | **State** | Monolithic context, no useMemo, 30+ consumers re-render on every change | RouteMeContext.jsx:1119 |
| 2 | **State** | 9 fire-and-forget Supabase calls — no await, no retry | RouteMeContext.jsx:538+ |
| 3 | **Security** | Hardcoded demo credentials in production bundle | supabase.js:41-58 |
| 4 | **Security** | No Content Security Policy (CSP) | index.html |
| 5 | **Security** | Missing RLS on soap_notes, visits, route_sessions in seed SQL | supabase-seed.sql:77-131 |
| 6 | **Security** | Server API keys (OpenRouter, OpenWeather) exposed client-side | soapEngine.js:4, RouteMeContext.jsx:692 |
| 7 | **Security** | PHI in unencrypted localStorage | RouteMeContext.jsx:503 |
| 8 | **Database** | All 18 queries use `.select('*')` — no column projection | dataService.js + RouteMeContext.jsx |
| 9 | **Database** | No indexes on nurse_id, client_id, visit_date | supabase-seed.sql |
| 10 | **Database** | No soft-delete for PHI records | supabase-seed.sql |
| 11 | **Database** | No offline queue or retry logic in data layer | dataService.js |

### 🟠 High Priority

| # | Area | Issue | File |
|---|------|-------|------|
| 12 | **Performance** | No code splitting — 2.3 MB single chunk, all 50+ pages eagerly imported | App.js |
| 13 | **Performance** | Unused dependencies: lodash, dayjs, framer-motion, recharts (~1.2 MB) | package.json |
| 14 | **Performance** | mapbox-gl (~986 KB) in main chunk, not lazy-loaded | StylizedMap.jsx |
| 15 | **Performance** | No React.memo on any component | Codebase-wide |
| 16 | **Performance** | localStorage persistence serializes 30+ vars on every change | RouteMeContext.jsx:501 |
| 17 | **Database** | N+1 query pattern — loadData() does 7+ sequential await calls | RouteMeContext.jsx:225-471 |
| 18 | **Security** | Missing nurse_id filter on SOAP note & visit mutations | dataService.js:102+ |
| 19 | **Security** | XSS vector in SOAP print (document.write with unsanitized PHI) | soapPrint.js:113 |
| 20 | **UX** | Missing EVV (Electronic Visit Verification) — legal requirement | Not implemented |
| 21 | **UX** | No patient/family portal | Not implemented |
| 22 | **UX** | No OASIS documentation | Not implemented |

### 🟡 Medium Priority

- 20+ additional issues documented in `ROUTEME_DEEP_AUDIT_REPORT.md`
- See: Performance (code splitting), Database (migrations, constraints), UX (loading/empty/error states)

---

## 9. Agent Workflow (from `agent-workflow-blueprint.md`)

```
Phase 1: RESEARCH ──────► Phase 2: BUILD ──────► Phase 3: REVIEW ──────► Phase 4: VERIFY
       │                       │                       │                       │
   Researcher              Developos              Architect              Verifier
   (best practices)        (implementer)          (code review)           (build test)
   Web/search              Terminal/file          Read files              npx craco build
   Industry patterns       Write patches          State/Accessibility     Syntax check
```

**Rule:** Always verify before reporting. If Verifier finds issues → route back to Developos. Only report 100% complete work.

---

## 10. Quick Commands

```bash
# Development
npm start                    # Dev server at localhost:3000
npx craco start              # Same (craco is the build tool)

# Build
npx craco build              # Production build → build/
npx craco build 2>&1 | grep -iE "error|warn" | grep -v "DeprecationWarning"

# Testing
npx craco test               # Jest test runner (no tests exist yet — AUDIT)

# Database
# Run supabase-seed.sql in Supabase SQL Editor
# Or use Supabase CLI: supabase db push

# New agent start
read_file path="ROUTEME_CODEBASE.md"    # ← Start here
skill_view name="agent-workflow-blueprint"  # ← Then load the workflow
```

---

## 11. Key Contacts & Context

| Role | Contact |
|------|---------|
| **Owner/Gold** | "Gold" — final decision maker |
| **Coordinator** | "Unlimitos" — prioritization, feature scope |
| **Frontend (you)** | "Developos" — you, the builder |
| **Research** | "Scout" — industry patterns |
| **Writing** | "Scribe" — docs, copy, emails |
| **Marketing** | "Reach" — go-to-market, messaging |

**Current phase:** Post-audit, pre-launch. All CRITICAL and HIGH audit items should be resolved before production launch.

---

*This file is auto-maintained. Update it when significant architectural changes are made.*