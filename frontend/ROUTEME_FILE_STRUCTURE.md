# RouteMe — Complete File Structure

**Last Updated:** 2026-07-26
**Commit:** 883e270

> ⚠️ **If you build or add anything new, update this file.** It's the single source of truth for the project tree.

```
routemev2/frontend/
├── .env                          # API keys (Mapbox, Supabase, OpenWeather)
├── .env.example                  # Env template
├── .gitignore
├── components.json               # shadcn/ui config
├── craco.config.js               # CRA override config
├── jsconfig.json                 # Path aliases (@/ → src/)
├── package.json                  # Dependencies & scripts
├── postcss.config.js
├── tailwind.config.js            # Tailwind + shadcn theme
├── ROUTEME_APP_DOCS.md           # App documentation (features, state, build)
├── ROUTEME_AUDIT_2026-07-25.md   # Full code audit
├── ROUTEME_COMPETITIVE_RESEARCH_2026-07-26.md  # Competitive research & revenue features
├── token.txt
│
├── public/
│   ├── _redirects                # SPA redirect rules
│   ├── 404.html
│   ├── index.html                # CRA entry HTML
│   ├── manifest.json
│   ├── service-worker.js
│   ├── icon-192x192.png
│   └── icon-512x512.png
│
├── build/                        # Production build output (gitignored)
│
└── src/
    ├── index.js                  # React entry point
    ├── index.css                 # Tailwind directives + shadcn CSS vars + fonts
    ├── App.css                   # Global styles
    ├── App.js                    # Router: 3 portals (nurse, agency, superadmin)
    ├── serviceWorkerRegistration.js
    │
    ├── assets/
    │   └── terrain-style.json    # Mapbox terrain/DEM style config
    │
    ├── context/
    │   └── RouteMeContext.jsx    # MEGA-CONTEXT: all app state, auth, data, actions (~1063 lines)
    │
    ├── hooks/
    │   └── use-toast.js          # shadcn toast hook
    │
    ├── lib/
    │   ├── routeEngine.js        # Route optimization: 6 strategies, AI scoring, validation (~684 lines)
    │   ├── directions.js         # Mapbox Directions API wrapper (fetchRoute, metersToMiles, etc.)
    │   ├── supabase.js           # Supabase client init (placeholder)
    │   ├── mockData.js           # Nurse + clients seed data (6 clients)
    │   ├── agencyMockData.js     # Agency console seed data
    │   ├── superAdminMockData.js # Superadmin seed data (~435 lines)
    │   ├── routeDebugger.js      # Route state debugging/logging
    │   └── utils.js              # Utility functions (formatTimeWindow, etc.)
    │
    ├── constants/
    │   └── testIds/              # Test ID constants
    │       ├── index.js
    │       ├── auth.js
    │       └── home.js
    │
    ├── components/
    │   ├── AppShell.jsx          # Nurse app layout: sidebar + topbar (~276 lines)
    │   ├── AgencyShell.jsx       # Agency console layout
    │   ├── SuperAdminShell.jsx   # Superadmin console layout (~269 lines)
    │   ├── StylizedMap.jsx       # Mapbox map: 3D terrain, SVG stops, tooltips (~487 lines)
    │   ├── CommandCenterMap.jsx  # Agency oversight map (~316 lines)
    │   ├── RouteBuilderModal.jsx # Modal: add new/existing client to route
    │   ├── NewActionModal.jsx    # FAB: new client, note, route
    │   ├── RemoveFromRouteModal.jsx # Remove client with reschedule option
    │   ├── VoiceNoteModal.jsx    # Voice note recording UI
    │   ├── HipaaBadge.jsx        # HIPAA compliance badge
    │   ├── ReassignDialog.jsx    # Nurse reassignment dialog
    │   ├── ToastNotification.jsx # Toast notification system
    │   │
    │   └── ui/                   # shadcn/ui components (60+ files)
    │       ├── accordion.jsx
    │       ├── alert.jsx
    │       ├── alert-dialog.jsx
    │       ├── aspect-ratio.jsx
    │       ├── avatar.jsx
    │       ├── badge.jsx
    │       ├── breadcrumb.jsx
    │       ├── button.jsx
    │       ├── calendar.jsx
    │       ├── card.jsx
    │       ├── carousel.jsx
    │       ├── checkbox.jsx
    │       ├── collapsible.jsx
    │       ├── command.jsx
    │       ├── context-menu.jsx
    │       ├── dialog.jsx
    │       ├── drawer.jsx
    │       ├── dropdown-menu.jsx
    │       ├── form.jsx
    │       ├── hover-card.jsx
    │       ├── input.jsx
    │       ├── input-otp.jsx
    │       ├── label.jsx
    │       ├── menubar.jsx
    │       ├── navigation-menu.jsx
    │       ├── pagination.jsx
    │       ├── popover.jsx
    │       ├── progress.jsx
    │       ├── radio-group.jsx
    │       ├── resizable.jsx
    │       ├── scroll-area.jsx
    │       ├── select.jsx
    │       ├── separator.jsx
    │       ├── sheet.jsx
    │       ├── skeleton.jsx
    │       ├── slider.jsx
    │       ├── sonner.jsx
    │       ├── switch.jsx
    │       ├── table.jsx
    │       ├── tabs.jsx
    │       ├── textarea.jsx
    │       ├── toast.jsx
    │       ├── toaster.jsx
    │       ├── toggle.jsx
    │       ├── toggle-group.jsx
    │       └── tooltip.jsx
    │
    ├── pages/                    # Nurse App (/app/*)
    │   ├── Landing.jsx           # `/` — Marketing landing page (~288 lines)
    │   ├── Login.jsx             # `/login` — Nurse login
    │   ├── Signup.jsx            # `/signup` — Registration (~649 lines)
    │   ├── Pricing.jsx           # `/pricing` — Public pricing page (~390 lines)
    │   ├── Payment.jsx           # `/payment` — Stripe payment flow (~483 lines)
    │   ├── Welcome.jsx           # `/welcome` — Post-signup onboarding (~260 lines)
    │   ├── NotFound.jsx          # 404 fallback
    │   ├── EmailPreview.jsx      # Email template preview
    │   ├── AgencyLogin.jsx       # Agency portal login
    │   ├── SuperAdminLogin.jsx   # Superadmin login
    │   ├── Dashboard.jsx         # `/app/dashboard` — Today's overview (~208 lines)
    │   ├── RouteView.jsx         # `/app/route` — Map + timeline + optimizations (~770 lines)
    │   ├── Visits.jsx            # `/app/visits` — Visit history log (~104 lines)
    │   ├── Routes.jsx            # `/app/routes` — Saved routes (~143 lines)
    │   ├── Schedule.jsx          # `/app/schedule` — Calendar + schedule views (~405 lines)
    │   ├── Clients.jsx           # `/app/clients` — Client directory (~349 lines)
    │   ├── ClientDetail.jsx      # `/app/clients/:id` — Client profile (~258 lines)
    │   ├── Notifications.jsx     # `/app/notifications` — Notification center (~130 lines)
    │   ├── Profile.jsx           # `/app/profile` — Settings, home base, nav preference (~282 lines)
    │   │
    │   ├── agency/               # Agency Console (/agency/*)
    │   │   ├── Overview.jsx      # Agency overview dashboard (~300 lines)
    │   │   ├── Nurses.jsx        # Nurse management (~437 lines)
    │   │   ├── NurseDetail.jsx   # Nurse profile (~268 lines)
    │   │   ├── Activity.jsx      # Activity feed
    │   │   ├── ClientsDir.jsx    # Client directory
    │   │   ├── AgencyClientDetail.jsx  # Client profile (~284 lines)
    │   │   ├── Compliance.jsx    # Compliance tracking
    │   │   └── Billing.jsx       # Agency billing
    │   │
    │   └── superadmin/           # Superadmin Console (/superadmin/*)
    │       ├── Overview.jsx      # Platform overview (~306 lines)
    │       ├── Agencies.jsx      # Agency list
    │       ├── AgencyDetail.jsx  # Single agency view
    │       ├── NursesGlobal.jsx  # All nurses across agencies
    │       ├── NurseGlobalDetail.jsx  # Nurse detail
    │       ├── ClientsGlobal.jsx # All clients
    │       ├── ClientPHI.jsx     # PHI audit view
    │       ├── AdminStaff.jsx    # Admin staff management
    │       ├── AuditGlobal.jsx   # Platform audit log
    │       ├── Security.jsx      # Security events
    │       ├── BillingPlatform.jsx # Platform billing
    │       └── SystemHealth.jsx  # System status
    │
    └── emails/                   # Email templates (used by EmailPreview)
        ├── EmailShell.jsx        # Email layout wrapper
        ├── WelcomeEmail.jsx
        ├── PasswordResetEmail.jsx
        ├── PaymentReceiptEmail.jsx
        ├── PaymentFailedEmail.jsx
        ├── NurseInviteEmail.jsx
        ├── HipaaWeeklyEmail.jsx
        ├── LicenseExpiryEmail.jsx
        └── NewsletterEmail.jsx
```

### Key Stats

| Metric | Value |
|--------|-------|
| Total source files | ~100+ |
| Total LOC | ~26,783 |
| Context file | 1,063 lines (RouteMeContext.jsx) |
| Largest page | 770 lines (RouteView.jsx) |
| shadcn components | 46 UI components |
| Email templates | 8 |
| Nurse pages | 11 routes |
| Agency pages | 8 routes |
| Superadmin pages | 11 routes |

### Architecture Notes

- **State:** Single context (`RouteMeContext.jsx`) persisted to localStorage
- **Auth:** Supabase JWT — 3 roles (nurse, agency, superadmin)
- **Build:** CRA + CRACO + Tailwind 3 + shadcn/ui + Mapbox GL v2.15.0
- **Routing:** React Router v7 (BrowserRouter)
- **Deploy:** Render (auto-deploy from `main`), Node 20
- **Env vars:** `REACT_APP_MAPBOX_TOKEN`, `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`, `REACT_APP_OPENWEATHER_API_KEY`