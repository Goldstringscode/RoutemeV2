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
