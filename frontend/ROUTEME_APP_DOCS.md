# RouteMe v2 — App Documentation

## Overview
RouteMe is a home-health nurse routing app that optimizes daily visit schedules, provides turn-by-turn navigation, and tracks completed visits.

## Tech Stack
- **Frontend:** React (CRA + Craco), Tailwind CSS, Mapbox GL JS v2.15.0
- **Backend (planned):** Supabase
- **Deployment:** Render (auto-deploys from `main` branch)
- **Location:** `C:\Users\Justin\sites\routemev2\frontend`

## Pages
| Route | Component | Description |
|-------|-----------|-------------|
| `/app/dashboard` | `Dashboard.jsx` | Today's overview, next visit, weekly stats |
| `/app/route` | `RouteView.jsx` | Main route page with map, timeline, optimization |
| `/app/visits` | `Visits.jsx` | Historical visit log with timestamps |
| `/app/routes` | `RoutesPage.jsx` | Saved routes list |
| `/app/notifications` | `Notifications.jsx` | Notification center |
| `/app/schedule` | `Schedule.jsx` | Schedule with filters (today, all-week, etc.) |
| `/app/clients` | `Clients.jsx` | Client directory |
| `/app/clients/:id` | `ClientDetail.jsx` | Individual client profile |
| `/app/profile` | `Profile.jsx` | User settings, home base, nav preference |

## Key Features

### Route Optimization (routeEngine.js)
6 strategies, all using nearest-neighbor from home base:
- **AI smart route** — multi-factor: traffic, weather, priority, time windows, proximity
- **Fastest** — minimizes drive time with traffic weighting
- **Least mileage** — tries each stop as first, picks shortest total distance
- **Fuel efficient** — distance-weighted (heavy on proximity)
- **Traffic avoidance** — penalizes peak commute hours (7-9 AM, 4-7 PM)
- **Custom** — priority-first, then by time window

### Route Session (mark visited flow)
1. Click **Start Route** → activates route session
2. Each timeline stop shows a **Mark as visited** button (green checkmark)
3. Clicking it:
   - Logs a visit record (client, time, date) to the Visits tab
   - **Re-fetches the Mapbox route** excluding that stop (route line updates)
   - The map shows a **green checkmark** circle instead of the numbered orange marker
   - The card moves to the bottom of the timeline with green "Seen" label
   - Header updates: "X remaining · Y visited"
   - Progress bar updates
4. Click **End Route** to stop the session
5. Re-optimizing while route is active only reorders **unvisited** stops

### Map Features (StylizedMap.jsx)
- Real Mapbox map (light-v10 style)
- 3D terrain via DEM source + hillshade
- SVG overlay with numbered stop markers (orange circles)
- Visited stops show green checkmark circles
- Route line skips visited stops (re-fetched via Mapbox Directions API)
- Home base marker (indigo)
- Fallback SVG path when no real route data

### Visit Tracking
- Every "Mark as visited" creates a visit record
- Records: clientId, clientName, time, date, notes
- Persisted to localStorage
- Visits tab shows full history with clickable client names
- Stats: today's count, all-time count, on-schedule count

### Navigation Preference
- Profile → Preferences → Default navigation app
- Options: Google Maps, Apple Maps, Both
- RouteView selected stop card shows nav buttons based on preference

### FAB (New Action Modal)
- **New Client** — opens RouteBuilderModal (new client form tab)
- **Add Existing Client** — opens RouteBuilderModal (search existing tab)
- **New Note** — opens voice note modal
- **New Route** — navigates to route page
- New Client / Add Existing Client only appear when route is active

### Home Base
- Set in Profile settings
- All routes start from home base
- Stored on nurse profile in context

## State Management
All app state lives in `RouteMeContext.jsx`:
- `scheduleIds` — ordered array of client IDs for the current route
- `schedule` — derived from scheduleIds + clients (useMemo)
- `clients` — all known clients
- `routeActive` — whether a route session is running
- `visitedIds` — array of visited client IDs during active session
- `visits` — array of completed visit records
- `routeGeoJson` — current Mapbox route geometry
- `routeDistance`, `routeDuration` — current route metrics
- `navPreference` — "google" | "apple" | "both"
- `optimizationMode` — current mode ("ai", "fastest", etc.)
- `builderOpen`, `builderTab` — RouteBuilderModal state

## Build & Run
```bash
cd /c/Users/Justin/sites/routemev2/frontend
npx craco start          # Dev server (port 3000)
npx craco build          # Production build
npx serve -s build -l 3000  # Serve production build
```

## Deployment
- GitHub: `https://github.com/Goldstringscode/RoutemeV2`
- Render: auto-deploys from `main` branch
- Mapbox token + OpenWeather key in `.env`

## Known Issues / Future Work
- Schedule.jsx: `calendarDate` unnecessary dependency in useMemo
- RouteMeContext.jsx: several `nurse.homeBase` missing from dependency arrays (eslint warnings, not bugs)
- No real Supabase persistence for visit tracking (localStorage only for now)
- Route optimization uses nearest-neighbor — may not find globally optimal TSP solution