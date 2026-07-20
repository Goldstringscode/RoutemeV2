# RouteMe — Product Requirements Document

## Original problem statement
Build **RouteMe**, a HIPAA-compliant web app for traveling home health nurses. Nurses input daily client details (names, preferred times, phone, addresses); the app calculates fastest, fuel-efficient multi-stop driving routes (5-10% travel time savings). This first iteration is **frontend-only** with mock data — backend deferred.

## Architecture
- **Frontend only**: React 19 + React Router 7 + Tailwind + shadcn/ui
- **State**: React Context + `localStorage` persistence (no backend)
- **Fonts**: Outfit (display), Manrope (body), Instrument Serif italic (accents)
- **Palette**: Warm organic — terracotta (#D95D39), sage (#7FA08B), cream (#F9F8F6), stone-ink

## User personas
- **Traveling Home Health Nurse** — plans daily route, records visit notes hands-free, references PHI safely.

## Core requirements (static)
- HIPAA-compliant *feel*: persistent HIPAA badge, audit trail visible, encrypted-session UX cues
- Multi-stop route visualization with time savings
- Client CRUD with care flags, priority, time windows
- Voice-to-text visit notes (mocked streaming transcription)
- Drag-drop schedule reordering + one-tap optimize

## What's implemented (2026-02)
- Landing page (editorial hero with Instrument Serif italic accents, marquee, feature cards, dark CTA panel)
- Login (split panel, mock auth → redirects to app)
- App shell (sidebar + mobile pill nav, persistent HIPAA badge, floating voice FAB)
- Dashboard (bento grid: next visit, weekly time saved, stylized map, break reminder, audit trail, fuel sparkline)
- Route view (stylized illustrated map with numbered stops + curved dashed animated route, turn-by-turn timeline, selected stop detail)
- Schedule builder (drag-drop reorder, priority chips, optimize button)
- Clients (search, cards with care flags, latest voice-note preview, add-client dialog)
- Profile (nurse info, stats, preference toggles, HIPAA compliance badges, reset data)
- Voice note modal (animated waveform, streaming transcript mock, save)

## Backlog
- **P0 backend**: FastAPI + Mongo (user auth, clients CRUD, notes, audit log)
- **P0 mapping**: Integrate real routing API (Mapbox Optimization / HERE / Google Directions)
- **P1**: Voice API integration (OpenAI Whisper), real MFA, org admin/dispatcher roles
- **P2**: Offline PWA, family ETA opt-in flow, encrypted vitals form, insurance billing export

## Feature added — Agency Admin Dashboard (2026-02)
Multi-tenant surface added on top of the nurse app. Separate `/agency/login` and `/agency/*` routes with their own auth state (`agencyAuthed` in localStorage), fully independent from the nurse app auth.

### Implemented
- `/agency/login` — split-panel director sign-in with agency code
- `/agency/overview` — bento dashboard (KPIs, on-shift team, agency-wide savings, live activity, zones coverage, compliance strip)
- `/agency/nurses` — roster table + Invite dialog (form → success screen with copy-invite link), row menu (Activate/Deactivate/Remove), status filters, search
- `/agency/activity` — live current-visit cards + chronological event stream with nurse filter
- `/agency/clients` — agency-wide clients directory with **PHI masking + Reveal toggle** (HIPAA-consistent)
- `/agency/compliance` — HIPAA score hero (98/100), MFA / BAA / audit metric cards, alerts, full audit log table
- `/agency/billing` — Growth plan card, seat utilization bar, Starter/Growth/Scale plan comparison, invoices table
- Nurse app top-bar now shows **agency branding pill** (Sunrise Home Health)
- Polish: single close X on all dialogs, VisuallyHidden DialogTitle/Description for Radix a11y

### Testing
- Testing agent: 45/45 functional checks passed
- Two LOW-priority polish items addressed post-test: duplicate X removed, PHI now masked with reveal toggle

## Backlog updates
- **P0 Backend multi-tenancy**: Agency → Nurse → Client hierarchy, role-based access (agency admin vs nurse), real invite tokens with email delivery (Resend)
- **P0 Real routing API**: Mapbox Optimization / HERE
- **P1**: SSO / SAML for Scale plan, Stripe billing integration
- **P2**: Family ETA opt-in flow, offline PWA
