# RouteMe — Product Requirements Document

## Original Problem Statement
Build **RouteMe**, a HIPAA-compliant web app for traveling home health nurses. It should let them input daily client details and automatically calculate the fastest, most fuel-efficient driving routes.

## Product Requirements
- Modern, HIPAA-compliant frontend design with a distinct, magnificent UI (terracotta/sage/stone editorial aesthetic).
- **Nurse-facing app** with HIPAA audit trails, voice-to-text visit notes, schedules, and route views.
- **Agency Admin Dashboard** for managing nurses, compliance, clients, billing.
- Interactive **"Command Center"** live map view for agency directors.
- **Super Admin / Platform Console** for platform operators sitting above all agencies + independent nurses, with full PHI-audited access, impersonation, security, billing, and system control.
- Everything strictly FRONTEND MOCKED for now (backend explicitly deferred by user).

## User Personas
1. **Home health nurse** — uses the Nurse Portal at `/app` for daily route + notes.
2. **Agency Director** — uses Agency Console at `/agency` to manage nurses/clients/billing.
3. **Platform Owner / Compliance / Support / Read-only staff** — uses Super Admin Console at `/superadmin` to oversee every agency, independent nurse, and PHI record with full HIPAA audit accountability.

## Applications
| App                    | Route             | Purpose                                                              |
|------------------------|-------------------|----------------------------------------------------------------------|
| Marketing/Landing      | `/`               | Marketing site, pricing, sign-in entrypoints                        |
| Nurse Portal           | `/app/*`          | Nurse day-of tools (dashboard, route, schedule, clients, profile)   |
| Agency Console         | `/agency/*`       | Agency admin dashboard                                              |
| **Super Admin Console**| `/superadmin/*`   | **Platform operator control plane (NEW)**                           |

## What's Been Implemented
### Session 1 (base):
- Nurse Portal (Landing, Login, Dashboard, RouteView, Clients, VoiceNoteModal, Schedule, Profile).
- Agency Console (AgencyLogin, Overview, Nurses, Activity, ClientsDir, Compliance, Billing).
- HIPAA PHI masking toggle, animated Command Center map, ReassignDialog.
- Client full profile (`ClientDetail`), Nurse full profile (`agency/NurseDetail`), external Pricing page.

### Session 2 (Feb 2026 — Super Admin Console) ✅ NEW
- **Auth**: `/superadmin/login` with 2-step MFA-look flow. Demo creds prefilled (`root@routeme.platform` / `super1234` / OTP `000000`).
- **Shell** (`SuperAdminShell.jsx`): Dark editorial (stone-950 + terracotta accents), impersonation banner, maintenance banner, live status pill, global search.
- **Overview** (`superadmin/Overview.jsx`): Platform KPIs (agencies/nurses/clients/MRR/avg HIPAA), live US map with 6 agency pins, attention feed, live audit stream, system pulse, per-agency revenue.
- **Agencies** (`superadmin/Agencies.jsx` + `AgencyDetail.jsx`): Full CRUD list, filter by status, suspend/reactivate, impersonate director, per-agency roster + audit + clients.
- **Nurses (Global)** (`superadmin/NursesGlobal.jsx` + `NurseGlobalDetail.jsx`): Union of every agency's nurses + 6 seeded **independent** unaffiliated nurses. Filter by affiliation/status. Force logout, reset MFA, suspend.
- **Clients + PHI Form** (`superadmin/ClientsGlobal.jsx` + `ClientPHI.jsx`): 10 clients with full PHI (DOB, SSN last4, insurance, meds, allergies, emergency contact). **Masked by default**; reveal requires a written reason logged immutably to the global audit trail. Watermarked view when revealed.
- **Admin Staff** (`superadmin/AdminStaff.jsx`): 5 seeded platform staff (Owner / Compliance / Support / Read-only). Invite, remove (Owner protected), permissions matrix.
- **HIPAA Audit** (`superadmin/AuditGlobal.jsx`): 14 seeded events, severity + agency filters, CSV export.
- **Security Center** (`superadmin/Security.jsx`): Active sessions with terminate action, security event feed, MFA coverage %, RBAC matrix.
- **Billing** (`superadmin/BillingPlatform.jsx`): MRR/ARR, plan mix, invoice ledger.
- **System Health** (`superadmin/SystemHealth.jsx`): Uptime/API/DB/workers, 90-day uptime chart, feature-flag toggles, **maintenance-mode kill switch** (banner shows across the console when ON).
- **Impersonation**: One-click "Impersonate director" from Agencies list or detail — opens Agency Console with a persistent red banner ("End session" to exit); action logged to audit.
- **Discreet super admin entry**: A 1.5px stone-colored dot in the landing footer next to "demo data only" (turns terracotta on hover, no visible label). testid `landing-superadmin-link`.

## Data (all mocked in `/app/frontend/src/lib/superAdminMockData.js`)
- 6 agencies (Sunrise, Bayside, Northstar, Evergreen, Atlas, Pinewood) with varied plans/HIPAA scores/statuses.
- 16 global nurses (10 agency-affiliated + 6 independent).
- 10 clients with full PHI (agency + independent).
- 5 super admins across 4 roles.
- 14 global audit events, 5 security events, 5 active sessions.
- 6 feature flags, system health metrics, 6 invoices.

## Code Architecture
```
/app/frontend/src/
├── components/
│   ├── AppShell.jsx
│   ├── AgencyShell.jsx
│   ├── SuperAdminShell.jsx        ← NEW
│   ├── CommandCenterMap.jsx
│   ├── ReassignDialog.jsx
│   ├── VoiceNoteModal.jsx
│   └── ui/ (shadcn)
├── context/
│   └── RouteMeContext.jsx         ← extended: superAdmin state + actions
├── lib/
│   ├── mockData.js
│   ├── agencyMockData.js
│   └── superAdminMockData.js      ← NEW
├── pages/
│   ├── (nurse pages)
│   ├── agency/*
│   ├── SuperAdminLogin.jsx        ← NEW
│   └── superadmin/                ← NEW
│       ├── Overview.jsx
│       ├── Agencies.jsx
│       ├── AgencyDetail.jsx
│       ├── NursesGlobal.jsx
│       ├── NurseGlobalDetail.jsx
│       ├── ClientsGlobal.jsx
│       ├── ClientPHI.jsx
│       ├── AdminStaff.jsx
│       ├── AuditGlobal.jsx
│       ├── Security.jsx
│       ├── BillingPlatform.jsx
│       └── SystemHealth.jsx
└── App.js                          ← extended routes
```

## Test Credentials
- Nurse: any email/password (mocked)
- Agency: code `SUNRISE-2026`, email `priya@sunrisehh.demo`, pw `demo1234`
- **Super Admin**: email `root@routeme.platform`, pw `super1234`, OTP `000000`
- Discreet entry: 1.5px dot in Landing footer

## Prioritized Backlog
### P0 (Complete — pending user manual verification)
- Super Admin Console full build ✅

### P1 — Future
- Backend implementation (FastAPI + MongoDB) with real HIPAA audit persistence, RBAC enforcement, PHI encryption.
- Impersonation on nurse-side (currently only agency).
- Real IP geolocation on sessions.

### P2 — Future
- 3rd-party integrations: Google Maps/Mapbox multi-stop optimizer, OpenAI Whisper voice, Twilio SMS.
- CSV/PDF export of PHI forms with print-ready watermark.
- Real-time WebSocket audit stream.

## Health Check
- Broken: None
- Mocked: All auth, storage, routing, voice-to-text, SMS. Super Admin data + audit log entirely `localStorage`.

## Recent Changelog
- **2026-02-14** — Session 2. Built full Super Admin / Platform Console (12 pages + shell + login + mock data + context extensions). All flows selector-verified via scripted smoke test. User elected to manually verify vs testing agent.
- **2026-02-14** — Added **Signup** (`/signup?plan=<id>`) + **Payment** (`/payment?...`) pages. Pricing CTAs now route to signup. Two-column layout with sticky plan-summary card (seats stepper + monthly/annual toggle + live "Due today" total) and validated account form (progressive password strength, HIPAA/BAA agreement, differentiated agency vs solo fields). Payment page mimics Stripe checkout (card / ACH toggle, brand detection, billing address, 3-step progress, success overlay). Solo tier bypasses payment → nurse app; Enterprise submits mailto quote; Growth/Scale flow through mock payment → agency console. All 3 branch paths selector-verified via scripted smoke test.
- **2026-02-14** — Added **Welcome** (`/welcome?plan=<id>&name=<name>`) thank-you page shown post-signup/post-payment. Auto-authenticates based on plan audience (solo → nurse, others → agency), displays tier badge ("You're now on RouteMe **<Tier>** tier"), personalized heading, prominent "Go to your dashboard now" CTA, and tier-specific "Newest features · unlocked" grid. Added stylized **404 Not Found** page (`NotFound.jsx`) with off-route messaging, animated stray map card, and 4 suggested destination shortcuts (Home/Pricing/Nurse sign-in/Agency console). `App.js` catch-all route now renders 404 instead of redirecting home. Signup/Payment flows rewired to route through Welcome. All flows selector-verified.
