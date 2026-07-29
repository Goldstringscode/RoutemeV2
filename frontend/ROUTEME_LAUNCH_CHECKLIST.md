# RouteMe — Pre-Launch Checklist

**Last updated:** 2026-07-28
**Commit:** a584fe9

> Everything that needs to be done before RouteMe can launch for real agencies.
> Items grouped by priority. Check off as completed.

---

## 🔴 CRITICAL — Blocks Launch

- [ ] **Real database (Supabase migration)**
  All data is client-side localStorage seed data. No persistence across devices, no real auth, no multi-nurse sharing.
  _Files: mockData.js, agencyMockData.js, superAdminMockData.js_

- [ ] **Superadmin pages — real data**
  All 11 superadmin pages render mock data from `superAdminMockData.js`.
  _Files: src/pages/superadmin/*.jsx_

- [ ] **Agency console pages — real data**
  All 8 agency pages render mock data from `agencyMockData.js`.
  _Files: src/pages/agency/*.jsx_

- [ ] **Agency/SuperAdmin login — real auth**
  Currently uses hardcoded passwords ("demo1234", "super1234"). No Supabase auth check.
  _Files: AgencyLogin.jsx, SuperAdminLogin.jsx_

- [ ] **Payment page — real Stripe integration**
  Full Stripe-looking UI but no actual payment processing.
  _File: Payment.jsx_

---

## 🟠 HIGH — Strongly Recommended Before Launch

- [ ] **Onboarding completion saved to context** ✅ DONE (a584fe9)
- [ ] **Weather uses nurse's homeBase** ✅ DONE (a584fe9)
- [ ] **Email preview page gated behind dev mode** ✅ DONE (a584fe9)
- [ ] **Notifications wired to real context** ✅ DONE (8fef7e8)
- [ ] **Auth pages wired to Supabase** ✅ DONE (8fef7e8)
- [ ] **HelpCenter broken link fixed** ✅ DONE (8fef7e8)
- [ ] **DataPrivacy wired to context** ✅ DONE (8fef7e8)

- [ ] **Error boundaries** — App crashes to white screen on any uncaught error
- [ ] **ESLint warnings cleaned up** — 6 warnings (5x nurse.homeBase deps, 1x calendarDate)
- [ ] **Console.log removed from production** — Debug logs in StylizedMap.jsx + RouteMeContext.jsx
- [ ] **ClientForm post-save navigation** — No redirect after creating/editing a client
- [ ] **Offline support** — SW configured but no offline data queue
- [ ] **Push notifications** — Bell icon is cosmetic; no real push system
- [ ] **Mapbox free-tier limit** — 100K requests/month shared across all users

---

## 🟡 MEDIUM — Should Address Before Major Users

- [ ] **Single mega-context (1,095 lines)** — RouteMeContext.jsx holds ALL app state. Split into auth, route, schedule, agency, superadmin contexts.
- [ ] **No automated tests** — Zero test files across the project
- [ ] **Bundle size** — 590 KB JS gzipped. Needs code splitting (React.lazy + Suspense)
- [ ] **Error boundaries** — Wrap at least each route section (app, agency, superadmin)
- [ ] **Onboarding skip button** — Added in a584fe9 ✅

---

## 🟢 LOW — Nice to Have

- [ ] **EVV compliance** — Geo-fencing, clock-in/out, GPS timestamps
- [ ] **Voice-to-text SOAP notes** — Whisper/Deepgram API integration
- [ ] **ICD-10 coding** — Diagnosis code picker in SOAP notes
- [ ] **Multi-language support** — English only currently
- [ ] **Patient/family portal** — Schedule viewing, communication
- [ ] **Telehealth integration** — Embedded video visits
- [ ] **Mobile app** — Web-only (PWA-ready via SW)
- [ ] **Analytics/reporting** — No exportable reports
- [ ] **Billing/claim generation** — Auto-generate claims from visit data

---

## Phase 5 — Platform Maturity (Roadmap)

- [ ] Patient/family portal
- [ ] Telehealth integration
- [ ] Advanced analytics (predictive staffing, acuity scoring)

---

## File Map (Key Sizes)

| File | Lines | Notes |
|------|-------|-------|
| `RouteMeContext.jsx` | 1,095 | Mega-context — primary refactor target |
| `RouteView.jsx` | 787 | Route timeline + map |
| `SOAPEditorPage.jsx` | ~500 | SOAP note editor |
| `routeEngine.js` | 684 | Route optimization engine |
| `Signup.jsx` | 649 | Signup flow |
| `StylizedMap.jsx` | 487 | Mapbox map component |
| `Payment.jsx` | 483 | Mock payment page |
| `Schedule.jsx` | 405 | Calendar view |
| `Pricing.jsx` | 390 | Pricing page |
| `ClientDetail.jsx` | 378 | Client profile |