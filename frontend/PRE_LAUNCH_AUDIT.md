# RouteMe — Pre-Launch Comprehensive Audit

> **Audit Date:** 2026-07-28  
> **Codebase:** 22,919 lines across 100+ files  
> **Build Status:** ✅ 0 errors, 0 ESLint warnings, 598 KB JS gzipped  
> **Auditor:** Developos (Full Stack)

---

## 🔴 CRITICAL (Ship-Blocking — 10 items)

### C1. No Real Authentication — Hardcoded Credentials
**Files:** `Login.jsx`, `AgencyLogin.jsx`, `SuperAdminLogin.jsx`  
**Issue:** All three login pages validate against hardcoded strings, not Supabase Auth.  
```js
// Login.jsx line 19-20
const validEmail = "amara.okafor@nurse.demo";
const validPassword = "demo1234";
```
**Impact:** Anyone can read the source and log in. Zero security.  
**Fix:** Wire to Supabase `signInWithPassword()`. Remove hardcoded creds.

### C2. All Data is Mock — No Database Persistence
**Files:** `RouteMeContext.jsx`, `mockData.js`, `agencyMockData.js`, `superAdminMockData.js`  
**Issue:** Every single data point (clients, nurses, visits, SOAP notes, routes, agencies, billing, audit logs) comes from seed arrays. Supabase `from()` calls exist but are fire-and-forget with no error handling — the app works entirely off in-memory state.  
**Impact:** Refresh the page and all data is lost. The app is a demo, not a product.  
**Fix:** Full Supabase migration with real CRUD operations (Phase 6).

### C3. Payment Page is Completely Mocked
**File:** `Payment.jsx` (483 lines)  
**Issue:** Card form collects data but never sends it anywhere. No Stripe Elements, no payment intent, no receipt. Credit card data is stored in React state as plain text.  
**Impact:** Cannot charge users. PCI compliance violation if this ever shipped.  
**Fix:** Integrate Stripe Payment Elements + Stripe API backend.

### C4. Service Worker Force-Reloads on Update
**File:** `serviceWorkerRegistration.js` lines 49-52  
**Issue:** When a new SW activates, the page immediately reloads:  
```js
navigator.serviceWorker.addEventListener('controllerchange', () => {
  window.location.reload(); // NURSE COULD BE IN THE MIDDLE OF A SOAP NOTE
});
```
**Impact:** A nurse typing a SOAP note or entering vitals could lose all unsaved work.  
**Fix:** Show "Update available" toast instead of auto-reloading. Let user choose when to refresh.

### C5. Mapbox Token & API Keys Exposed in .env
**File:** `.env`  
**Issue:** `REACT_APP_MAPBOX_TOKEN`, `REACT_APP_SUPABASE_ANON_KEY`, `REACT_APP_OPENWEATHER_KEY` are all in plaintext in the repo.  
**Impact:** Anyone with repo access can use these keys. Mapbox rate limits can be exhausted.  
**Fix:** Move to server-side proxy or environment variables set at deploy level only.

### C6. No Supabase Error Handling — Silent Failures
**File:** `RouteMeContext.jsx` (multiple locations)  
**Issue:** All Supabase calls use `.then().catch(err => console.error(...))` with no user-facing error.  
```js
supabase.from('clients').delete().eq('id', id).then().catch(err => {
  console.error("supabase error [removeClient]:", err.message);
});
```
**Impact:** Users think data saved when it actually failed.  
**Fix:** Toast notifications + revert local state on DB failure.

### C7. OpenWeather API Key Exposed + No Server Proxy
**File:** `RouteMeContext.jsx` and `.env`  
**Issue:** Weather fetch goes directly from browser to OpenWeather with the API key in the request.  
**Impact:** Anyone can steal the key from browser DevTools.  
**Fix:** Proxy through a serverless function or backend.

### C8. No Content Security Policy (CSP)
**Issue:** No CSP headers are set. The app loads external images from Unsplash, fonts from Google, Mapbox from CDN — all without restrictions.  
**Impact:** XSS vulnerability. If any dependency is compromised, attacker can inject scripts.  
**Fix:** Add CSP headers via Render or server config.

### C9. No Rate Limiting on Auth Pages
**Issue:** Login, AgencyLogin, and SuperAdminLogin have no rate limiting, no CAPTCHA, no account lockout.  
**Impact:** Brute-force attacks are trivial.  
**Fix:** Implement Supabase rate limiting, add CAPTCHA for production.

### C10. VisitSignature Page is a Shell
**File:** `VisitSignature.jsx`  
**Issue:** Page exists at `/app/clients/:id/sign` but has no actual signature capture implementation.  
**Impact:** Broken user flow — nurse clicks "Signature" and gets an empty page.  
**Fix:** Implement signature pad (react-signature-canvas or similar).

---

## 🟠 HIGH PRIORITY (Launch-Impacting — 14 items)

### H1. ClientDetail Shows Hardcoded Medications
**File:** `ClientDetail.jsx` lines 171-186  
**Issue:** The medications section is hardcoded, not from `client.medications`:  
```jsx
{[
  { name: "Metformin 500mg", freq: "twice daily" },
  { name: "Lisinopril 10mg", freq: "morning" },
  { name: "Vitamin D 2000IU", freq: "with meal" },
].map(...)}
```
**Fix:** Use `client.medications` from the actual data.

### H2. ClientDetail Timeline is Static
**File:** `ClientDetail.jsx` lines 44-49  
**Issue:** The visit timeline is hardcoded with fake data, not dynamic from actual visits.  
**Fix:** Build timeline from `clientVisits` and `clientSoapNotes`.

### H3. AgencyLogin Email Mismatch — Dead End
**File:** `AgencyLogin.jsx` line 20 vs `agencyMockData.js` line 16  
**Issue:** Login validates against `"marcia.brown@sunrisehomehealth.com"` but the agency admin email is `"priya@sunrisehh.demo"`.  
**Fix:** Align credentials or use real Supabase auth.

### H4. No Route Persistence
**File:** `RouteMeContext.jsx`  
**Issue:** Created routes, optimized orders, and saved routes exist only in memory.  
**Fix:** Save routes to Supabase `routes` table.

### H5. SOAP Notes Don't Persist
**File:** `RouteMeContext.jsx`  
**Issue:** SOAP notes are in-memory only. A page refresh loses all clinical documentation.  
**Fix:** Auto-save SOAP notes to Supabase as drafts.

### H6. No Real Visit Tracking
**File:** `RouteMeContext.jsx`  
**Issue:** Visits logged via `markVisited` + `addVisitNote` are in-memory.  
**Fix:** Persist visits to Supabase with timestamps.

### H7. No Offline Support Despite PWA Setup
**Files:** `serviceWorkerRegistration.js` + `index.js`  
**Issue:** Service worker is registered but no caching strategy is configured. The app works online-only.  
**Fix:** Implement Workbox precaching + runtime caching for API routes.

### H8. No Data Validation on Client Form
**File:** `RouteBuilderModal.jsx`  
**Issue:** Lat/lng fields accept any string. `parseFloat("")` becomes `NaN`. No required field enforcement beyond `fullName`.  
**Fix:** Add form validation with Zod or react-hook-form.

### H9. No Loading States on Mutations
**File:** `RouteMeContext.jsx` and all pages  
**Issue:** `addClient()`, `removeFromRoute()`, `saveRoute()`, `optimize()` — none return loading states.  
**Fix:** Return loading states from context for all async operations.

### H10. No Auto-Save for SOAP Notes
**File:** `SOAPEditorPage.jsx`  
**Issue:** Nurse must manually save. If they navigate away or close the tab, work is lost.  
**Fix:** Implement auto-save with debounce (every 30s or on field blur).

### H11. No Error Tracking / Monitoring
**Issue:** No Sentry, Datadog RUM, or any error monitoring. Silent failures in production will go undetected.  
**Fix:** Add Sentry for error tracking + performance monitoring.

### H12. No CI/CD Pipeline
**Issue:** No GitHub Actions, no automated testing, no deploy gating.  
**Fix:** Set up GitHub Actions for lint → test → build → deploy to Render.

### H13. No Integration Tests
**Issue:** Zero test files in the entire codebase.  
**Fix:** Add at least smoke tests for critical paths (auth, route creation, SOAP notes).

### H14. No Graceful Degradation for Mapbox API Limits
**File:** `StylizedMap.jsx`  
**Issue:** Mapbox free tier = 50,000 loads/month. If exceeded, maps silently fail.  
**Fix:** Add fallback UI when Mapbox fails (static SVG map, "Map unavailable" message).

---

## 🟡 MEDIUM PRIORITY (Quality-of-Life — 15 items)

### M1. Mapbox Token Validation Missing
**File:** `StylizedMap.jsx`  
**Issue:** If `REACT_APP_MAPBOX_TOKEN` is missing or invalid, the map silently renders blank.  
**Fix:** Add token validation + error state.

### M2. No Keyboard Shortcuts Despite UI Hint
**File:** `AgencyShell.jsx` line 209 shows `⌘K` but no shortcuts are wired.  
**Fix:** Implement global search shortcut and navigation shortcuts.

### M3. Orphaned `useEffect` Dependencies
**File:** `StylizedMap.jsx` line 116-139  
**Issue:** Map initialization runs only once (guarded by `mapRef.current`), but has `schedule` in the closure.  
**Fix:** Use refs for the schedule data so the map always reflects current state.

### M4. No Breadcrumb Navigation
**Issue:** Users navigating deep into ClientDetail, SOAPEditor, etc. have no breadcrumb trail.  
**Fix:** Add breadcrumb component to page layouts.

### M5. No Data Export / Import
**Issue:** No way to export client data, visit history, or SOAP notes as CSV/PDF (except print).  
**Fix:** Add bulk export in admin panels.

### M6. No Timezone Handling
**Issue:** All dates use `new Date()` which is browser-local. No timezone standardization.  
**Fix:** Store all dates in UTC, display in user's timezone.

### M7. No Audit Log Persistence
**File:** `RouteMeContext.jsx`  
**Issue:** Audit log is in-memory. Refresh loses all HIPAA audit trail data.  
**Fix:** Persist audit log to Supabase.

### M8. No Notification Persistence
**File:** `RouteMeContext.jsx`  
**Issue:** Notifications are in-memory only.  
**Fix:** Store notifications in Supabase, mark as read server-side.

### M9. No Pagination on Large Lists
**Files:** `Clients.jsx`, `Visits.jsx`, `Schedule.jsx`  
**Issue:** No pagination for client lists, visit history, or schedule.  
**Fix:** Add pagination or infinite scroll for lists > 20 items.

### M10. No Data Validation on Signup
**File:** `Signup.jsx`  
**Issue:** Signup form has no validation for email format, password strength, or required fields.  
**Fix:** Add client-side + server-side validation.

### M11. No Email Verification Flow
**File:** `VerifyEmail.jsx`  
**Issue:** VerifyEmail page exists but Supabase email verification is not wired.  
**Fix:** Wire Supabase `onAuthStateChange` for email verification.

### M12. No Password Strength Requirements
**Files:** `Signup.jsx`, `ForgotPassword.jsx`, `SetNewPassword.jsx`  
**Issue:** No minimum password length, complexity, or requirements.  
**Fix:** Enforce password policy (8+ chars, mixed case, number).

### M13. No Session Timeout / Auto-Logout
**Issue:** No idle session timeout. Nurses could leave their session open on a shared device.  
**Fix:** Implement 30-minute idle timeout with confirmation dialog.

### M14. No Cookie Consent Banner
**Issue:** Cookie page exists at `/legal/cookies` but no consent banner is shown.  
**Fix:** Add cookie consent banner (GDPR/CCPA compliance).

### M15. No Loading Skeleton for Data Tables
**Files:** `Clients.jsx`, `Visits.jsx`, `Schedule.jsx`, agency pages  
**Issue:** All list pages show empty state or full data — no loading skeleton for transitions.  
**Fix:** Add skeleton loading states.

---

## 🟢 LOW PRIORITY (Nice-to-Have — 12 items)

### L1. No Dark Mode
Despite Moon icon in UI, no dark mode toggle or implementation.

### L2. No Accessibility Audit
No aria-labels, keyboard navigation, screen reader testing, or color contrast verification.

### L3. No Analytics
No user behavior tracking (page views, feature usage, drop-off points).

### L4. No Email Delivery
10 email templates exist but no sending mechanism (SendGrid, SES, etc.).

### L5. No SMS / Push Notifications
Notifications are in-app only. No SMS, email, or push notification delivery.

### L6. No File Upload for Client Photos
Photo URL is manual text entry. No file upload, no image compression.

### L7. No Multi-Language Support
English only. No i18n framework.

### L8. No Telehealth Integration
No video visit, secure messaging, or virtual care capabilities.

### L9. No Family Portal
Caregiver info exists in data but no family-facing interface.

### L10. No EHR Integration
No HL7/FHIR integration for syncing with hospital systems.

### L11. No Lab Results Integration
No way to display or import lab results.

### L12. No EVV (Electronic Visit Verification) Compliance
No geolocation verification, no time-based visit validation required by Medicare.

---

## 📊 Audit Summary

| Severity | Count | Estimated Effort |
|----------|-------|-----------------|
| 🔴 Critical | 10 | 3-4 weeks (full team) |
| 🟠 High | 14 | 4-6 weeks (full team) |
| 🟡 Medium | 15 | 2-3 weeks |
| 🟢 Low | 12 | 1-2 weeks |
| **Total** | **51** | **10-15 weeks** |

### What to Ship First (MVP Launch Bare Minimum)

For a **viable production launch**, the minimum bar is:

1. **Fix C1-C3:** Real auth + real database persistence + real payment
2. **Fix C4:** Safe service worker (no auto-reload)
3. **Fix C6:** Proper error handling with user feedback
4. **Fix H1-H2:** Dynamic ClientDetail data
5. **Fix H4-H6:** Persist routes, SOAP notes, and visits
6. **Fix H8:** Form validation
7. **Fix H11:** Error monitoring
8. **Fix H13:** At least smoke tests

Everything else can follow in v1.1 patches.

### Security Concerns Summary

1. Hardcoded credentials in 3 login files
2. API keys committed to repo
3. No CSP headers
4. No rate limiting on auth
5. Credit card form collects plaintext (no Stripe)
6. No session timeout
7. No audit log persistence (HIPAA violation)
8. Patient data not encrypted at rest in mock data
9. SSN last 4 digits exposed in superadmin mock data
10. No role-based access control beyond state flags
