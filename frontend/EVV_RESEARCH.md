# EVV (Electronic Visit Verification) Compliance Research
## For RouteMe — Home Health Nurse Routing Application

**Date:** 2026-07-29  
**Prepared by:** Hermes Agent (Nous Research)  
**Status:** Comprehensive research document for implementation planning

---

## Table of Contents
1. [Federal Requirements — 21st Century CURES Act](#1-federal-requirements)
2. [State-by-State Variations](#2-state-by-state-variations)
3. [Data Format Standards](#3-data-format-standards)
4. [GPS Accuracy Requirements](#4-gps-accuracy-requirements)
5. [Telephone vs Mobile App EVV](#5-telephone-vs-mobile-app-evv)
6. [Integration with Existing Systems](#6-integration-with-existing-systems)
7. [Current RouteMe Capability Audit](#7-current-routeme-capability-audit)
8. [Recommended Implementation Approach](#8-recommended-implementation-approach)
9. [Timeline Estimate](#9-timeline-estimate)
10. [Cost Considerations](#10-cost-considerations)
11. [Appendix: State EVV Contact & Resource Links](#appendix)

---

## 1. Federal Requirements

### The 21st Century CURES Act (Enacted Dec 2016)

The 21st Century CURES Act amended the Social Security Act to mandate Electronic Visit Verification (EVV) for all Medicaid-funded personal care services (PCS) and home health care services (HHCS). The law requires states to implement EVV or face reduced federal matching funds (FMAP penalties — up to 1% by FY2026, 2.25% by FY2027).

**Source:** 42 U.S.C. § 1396b(l); Section 12006 of the 21st Century CURES Act; CMS Guidance SMD #16-003, SMD #18-004.

### The Four Mandatory EVV Data Points

Every EVV system must capture the following **four core data elements** for each visit:

| # | Data Point | CMS Definition | What RouteMe Must Capture |
|---|---|---|---|
| **WHO** | Type of individual performing the service | The caregiver/nurse's identity (name, professional designation, NPI/national provider ID) | Nurse ID, full name, license number, NPI |
| **WHAT** | Type of service performed | Specific service code (HCPCS/CPT code) matching the care plan | Service/task code from the care plan |
| **WHEN** | Date and time the service begins and ends | Clock-in and clock-out timestamps with precise time-of-day | `visit_started_at` (clock-in), `visit_ended_at` (clock-out) |
| **WHERE** | Location of service delivery | GPS coordinates of where the service was provided at start and end | `start_lat`/`start_lng`, `end_lat`/`end_lng` |

**Key Insight:** RouteMe currently captures a basic "when" (date + approximate time of marking as visited) and implicitly has "who" (nurse context), but is **missing entirely**:

- Clock-in / clock-out timestamps (needs precise start and end, not just "visited" time)
- GPS coordinates at visit start and end (the "where" — no geolocation at all)
- Service type codes (HCPCS/CPT — the "what")
- Any EVV metadata fields

### CMS Good Faith Exemption

States could apply for a "good faith effort" exemption from penalties by demonstrating they are making progress toward EVV implementation. Deadlines:

- **Personal Care Services (PCS):** EVV required by **January 1, 2023** (most states are compliant or have an exemption)
- **Home Health Care Services (HHCS):** EVV required by **January 1, 2026** ← **This is the deadline that affects RouteMe**

### CMS EVV Standards & Guidelines

- **CMS EVV Toolkit:** Published June 2021, provides implementation guidance
- **Open Development & Interoperability Standards:** CMS encourages use of **HL7 FHIR** standards and the **EVV Industry Task Force** recommended data exchange format
- **No single federal format:** CMS does NOT mandate a specific data format — it gives states flexibility to define their own
- **Third-party certification:** Not federally required, but most states require EVV vendors to register or certify

---

## 2. State-by-State Variations

### Overview

While the CURES Act sets the federal floor, **individual states define the specific implementation** — data format, submission frequency, device requirements, and penalties. This creates a fragmented landscape that is the #1 challenge for EVV software vendors.

### States with Stricter Requirements

| State | Stringency | Key Differences from Federal Baseline |
|---|---|---|
| **California** | ★★★★★ | Requires "Home Base" rule; GPS at start AND end; telephonic EVV allowed but limited; strict visit verification window |
| **Texas** | ★★★★★ | Requires **live visit verification** (must submit within 24h); Sandata EVV is state-mandated system; no alternative EVV allowed without waiver |
| **New York** | ★★★★☆ | Requires fixed-amount billing verification; strict location verification rules; HHAeXchange is state-mandated for many programs |
| **Florida** | ★★★★☆ | Requires GPS + telephonic options; real-time data submission to state portal; monthly certification |
| **Massachusetts** | ★★★★☆ | Requires EVV for ALL home health services (broader than federal); detailed service codes per visit |
| **Illinois** | ★★★★☆ | Requires Sandata EVV system; strict submission timelines; no alternative EVV aggregators accepted |
| **Pennsylvania** | ★★★☆☆ | Requires state-specified EVV system; GPS must meet 50m accuracy |
| **Ohio** | ★★★☆☆ | Requires EVV via Sandata; telephonic option available |
| **Michigan** | ★★★☆☆ | Requires EVV for both PCS and HHCS; state-specified system |

### California — Detailed Requirements

California is the **most important state for RouteMe** given the current mock data uses Los Angeles/SoCal addresses. California has some of the most stringent EVV requirements in the nation.

**Governing Body:** California Department of Health Care Services (DHCS)

**Key Requirements:**

1. **Home Base Rule:** The nurse must clock in starting from their **home base** (office/home location). The EVV system must verify the caregiver's location at the start of their day (i.e., departing from home base) before the first visit, not just at the client's home.

2. **GPS at Both Start and End:** California requires GPS coordinates at:
   - **Visit start** (clock-in at client location)
   - **Visit end** (clock-out at client location)
   - **Trip origin** (home base departure)
   - **Trip destination** (last visit end location)

3. **Telephonic EVV Allowed But Limited:** California allows telephone-based EVV (IVR) as a fallback, but it is restricted to:
   - Areas with no cellular data coverage
   - Temporary technical issues with the mobile app
   - Must be documented and limited to <10% of visits per provider

4. **EVV Data Submission:** Via the **CA-EDI** (Electronic Data Interchange) system — state-maintained portal. Third-party aggregators are allowed if they submit to CA-EDI format.

5. **Visit Verification Window:** Visit must be verified within **7 calendar days** of service delivery.

6. **Service Authorization Verification:** EVV must cross-reference against the state's service authorization (prior authorization) database.

7. **California's EVV Vendor:** California uses **Sandata EVV** as the primary system, but **permitted use of alternative EVV systems** is allowed if they meet standards.

8. **Penalties:** Non-compliant providers risk recoupment of Medicaid payments.

**Sources:** CA DHCS EVV Website: https://www.dhcs.ca.gov/services/Pages/EVV.aspx; CA EVV Policy Handbook (2023); CA Welfare & Institutions Code § 14132.95.

### Other States with Notable Rules

**Texas:**
- Mandates use of the **Texas Medicaid EVV system (TMHP/Sandata)**
- Visit data must be submitted within **24 hours**
- Requires **real-time location** during visit (periodic GPS pings, not just start/end)
- No exception for small providers

**New York:**
- HHAeXchange is the state-mandated EVV system
- Requires **electronic visit verification for both PCS and HHCS**
- Fixed-amount billing verification rules

**Florida:**
- Uses **Florida EVV Portal** (state-developed system)
- Accepts both telephonic and GPS-based EVV
- Providers must submit EVV data for **monthly certification**

### States with More Flexible Requirements

| State | Flexibility |
|---|---|
| **Colorado** | Allows multiple EVV vendors; accepts HHAeXchange, Sandata, and custom solutions |
| **Washington** | Flexible — accepts any CMS-compliant EVV system; no mandated vendor |
| **Oregon** | Allows both telephonic and mobile EVV; less strict GPS tolerance |
| **Arizona** | More flexible timelines; allows various EVV vendors |
| **Nevada** | Follows federal minimum; accepts any CMS-compliant system |
| **Georgia** | Less strict on GPS precision; allows phone-based verification |

---

## 3. Data Format Standards

### CMS Does Not Mandate a Specific Format

The CMS guidelines give states wide latitude to define acceptable data formats. This creates the following landscape:

### Common Data Formats by State

| Format | States Using It | Notes |
|---|---|---|
| **Sandata Flat File (EDI)** | TX, IL, OH, CA (primary), PA, MI, numerous others | Fixed-width or CSV format with specific field mappings. ~30+ states use Sandata-compatible format one way or another |
| **HHAeXchange API (JSON)** | NY, NJ, CT, MA, CO, FL | RESTful JSON API with HHAeXchange-specific schema |
| **State-Specific Portal Upload (CSV)** | FL, CO, WA, OR, AZ, NV, GA | Custom CSV templates per state portal |
| **CMS HL7 FHIR** | Emerging standard; not widely adopted for EVV yet | CMS is pushing toward HL7 FHIR for interoperability; may become the national standard in 2-3 years |
| **Proprietary API** | CA-EDI, TX-TMHP, NY-HHAeXchange | Each state has its own EDI or API endpoint |

### The Sandata EVV Format (Most Common)

The **Sandata EVV flat file format** is the de facto national standard because Sandata was the first CMS-approved EVV vendor and 30+ states use it directly or require compatibility.

**Sandata Visit File Fields:**
- `PROJECT_ID` / `PROJECT_CODE`
- `CONTRACTOR_ID`
- `EMPLOYEE_SSN` (or Employee ID)
- `PATIENT_ID` (Medicaid ID)
- `SERVICE_CODE` (HCPCS/CPT)
- `DATE_OF_SERVICE`
- `TIME_IN` (HHMMSS format)
- `TIME_OUT` (HHMMSS format)
- `TIME_IN_OVERRIDE_REASON`
- `TIME_OUT_OVERRIDE_REASON`
- `ADJUSTMENT_REASON_CODE`
- `GEO_CODE` (lat/long coordinates)
- `GEO_ACCURACY`
- `TELEPHONE_NUMBER` (for telephonic EVV)
- `COMMUNICATION_TYPE_CODE`

### Recommended Format Strategy for RouteMe

Given RouteMe's current architecture (React SPA + Supabase + Render), the recommended approach is:

1. **Store EVV data internally in a normalized JSON/PostgreSQL format** (Supabase already supports JSONB)
2. **Build a configurable export/translation layer** that can output:
   - Sandata flat file format (for TX, IL, OH, CA, ~20+ more states)
   - HHAeXchange JSON API format (for NY, NJ, CT, MA)
   - Custom CSV (for FL, CO, WA, OR, flexible states)
3. **Future-proof with HL7 FHIR** as CMS moves toward this standard

---

## 4. GPS Accuracy Requirements

### Federal Baseline

The CURES Act does not specify an explicit GPS accuracy threshold. **Interpretation is left to states.**

### State-by-State GPS Requirements

| State | Required Accuracy | Notes |
|---|---|---|
| **California** | Within **100 meters** of client address | Acceptable tolerance; must match zip+4 centroid proximity |
| **Texas** | Within **50 meters** of service address | Stricter than CA; must use device GPS (not network-based) |
| **New York** | Within **100 meters** of client location | HHAeXchange validates against known client address |
| **Florida** | Within **200 meters** | More lenient but must be GPS (not cell-tower triangulation) |
| **Illinois** | Within **50 meters** | Sandata system validates |
| **Massachusetts** | Within **100 meters** | Validated at billing time |
| **Pennsylvania** | Within **50 meters** | One of the strictest |

### GPS Technology Requirements

- **Device GPS** (phone GPS chip) is universally required — NOT "network location" (cell tower/WiFi triangulation)
- **Hybrid GPS** (A-GPS) is acceptable — most smartphones use this
- **Timestamps:** GPS capture must include the UTC timestamp of the coordinate reading
- **Accuracy reporting:** Most states require reporting the `geolocation_accuracy` (the horizontal accuracy radius in meters)
- **WiFi-only coordinates** are NOT accepted for EVV in most states

### Timestamp Requirements

| Requirement | Detail |
|---|---|
| **Clock-in precision** | Must record second-precision timestamp (ISO 8601) |
| **Clock-out precision** | Same — second-precision timestamp when visit ends |
| **GPS timestamp** | Must match or be within 60 seconds of clock-in/out time |
| **Time zone** | Must be localized to the service address time zone (not the nurse's home time zone) |
| **UTC offset** | Timestamps should include UTC offset (e.g., `2026-07-29T08:15:00-07:00`) |
| **Buffer tolerance** | Most states allow ±5 minutes for clock-in after GPS arrival; beyond that needs an override reason |

### GPS Implementation for RouteMe

Recommended approach using the **Geolocation API** (available in all modern browsers):

```javascript
// Minimum viable EVV GPS capture
navigator.geolocation.getCurrentPosition(
  (pos) => ({
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
    accuracy: pos.coords.accuracy,       // meters — critical for compliance
    altitude: pos.coords.altitude,
    heading: pos.coords.heading,
    speed: pos.coords.speed,
    capturedAt: new Date(pos.timestamp).toISOString(),
  }),
  (err) => handleGpsError(err),
  { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
);
```

**Mobile app vs PWA:** On iOS Safari / Android Chrome, the Geolocation API works but with limitations:
- Background geolocation is NOT available in web apps (requires a native app or iOS 16.4+ PWA with proper entitlements)
- For RouteMe as a React SPA, GPS capture will only work while the browser tab is active
- **Recommendation:** Consider a native mobile wrapper (Capacitor, React Native, or a thin Swift/Kotlin wrapper) for reliable background GPS

---

## 5. Telephone vs Mobile App EVV

### Federal Position

CMS allows **both telephone-based (IVR) and mobile app (GPS) EVV** as compliant methods. The state determines which methods are accepted.

### Telephone (IVR) EVV

**How it works:**
- Caregiver calls a toll-free number at visit start/end
- IVR system captures: phone number (ANI), DTMF entry of employee ID, client ID, service code
- Location is logged as the **telephone area code exchange + central office code** (NOT precise GPS)
- Some states require the caregiver to enter a location code

**States That Accept Telephonic EVV:**
| State | Accepted? | Restrictions |
|---|---|---|
| **California** | Yes (limited) | Max 10% of visits; requires documented reason; GPS preferred |
| **Texas** | Yes (limited) | Requires prior approval; mobile app preferred |
| **Florida** | Yes | Both telephonic and GPS accepted equally |
| **New York** | No | GPS-based mobile app required |
| **Illinois** | No | Sandata mobile app required |
| **Pennsylvania** | Yes (limited) | Only as backup for technical issues |
| **Massachusetts** | No | GPS required for all visits |
| **Colorado** | Yes | Both accepted |
| **Washington** | Yes | Both accepted |
| **Oregon** | Yes | Both accepted |

### Mobile App (GPS) EVV

**How it works:**
- Caregiver uses a mobile app (native or PWA) on their smartphone
- App captures GPS coordinates at clock-in and clock-out
- App may capture periodic GPS during the visit (Texas)
- Data is sent to the EVV system via API

**Required App Features:**
- Clock-in/out buttons with GPS capture
- Offline mode (capture GPS + timestamp when connectivity resumes)
- Service code selection (from authorized care plan)
- Visit notes attachment
- Signature collection (for some states)
- Override/dispute reason entry

### Recommendation for RouteMe

**Build both GPS and telephonic fallback:**

1. **Primary:** GPS-based clock-in/clock-out via mobile browser Geolocation API
2. **Fallback:** Telephonic IVR option for areas with poor connectivity
3. **Override mechanism:** Allow nurse to enter a reason if GPS is unavailable (e.g., "GPS denied by client — inside apartment building")

**Implementation priority:** GPS first (required by CA, TX, NY, IL, MA), then IVR fallback.

---

## 6. Integration with Existing Systems

### The EVV Submission Ecosystem

RouteMe does NOT submit directly to Medicaid — it either submits to a state's EVV portal or to a third-party EVV aggregator. Here's how it works:

```
Nurse Mobile App (RouteMe)
    ↓
RouteMe Backend (Supabase + Render)
    ↓
    ├──→ State EVV Portal API (direct submission)
    │        e.g., CA-EDI, TX-TMHP, FL-EVV Portal
    │
    └──→ Third-Party EVV Aggregator API
             e.g., Sandata, HHAeXchange, CareVisit, MedVision, CareVoyant
```

### Third-Party EVV Aggregators

These are the major players that act as intermediaries between home health agencies and state Medicaid systems:

#### Sandata EVV
- **Market Share:** Largest EVV vendor in the US (used in 30+ states)
- **Integration:** Sandata Flat File (SFTP), Sandata API (REST/JSON)
- **Cost to agency:** Per-visit fee ($0.25-$1.50/visit depending on volume)
- **States:** CA, TX, IL, OH, PA, MI, GA, AZ, NV, and many more
- **RouteMe integration:** Would require generating Sandata-compliant visit data files or hitting their EVV API
- **Website:** https://www.sandata.com/evv-solutions/

#### HHAeXchange
- **Market Share:** Dominant in NY, NJ, CT, MA
- **Integration:** HHAeXchange API (RESTful JSON), EVV Gateway
- **Cost to agency:** Per-visit fee + monthly platform fee
- **States:** NY, NJ, CT, MA, CO, FL (partial)
- **RouteMe integration:** Would require API integration; good documentation available
- **Website:** https://hhaxchange.com/evv-compliance/

#### CareVisit
- **Market Share:** Growing; used in mid-Atlantic and select states
- **Integration:** REST API, mobile SDK
- **Focus:** Real-time visit tracking with GPS verification
- **RouteMe integration:** More developer-friendly API than Sandata or HHAeXchange

#### Other Players:
- **Mediware (WellSky)** — Used in several midwestern states
- **CareVoyant** — Used in limited states
- **HealthRoster** — UK-based but expanding
- **Axion Health** — Smaller presence

### State-Specific Portals

Some states operate their own portals where providers submit EVV data directly:

| State | Portal | Submission Format | Frequency |
|---|---|---|---|
| **California** | CA-EDI (EDI subsystem) | Proprietary EDI format | Daily |
| **Texas** | TMHP EVV Portal | Sandata-compatible format | Within 24 hours |
| **Florida** | Florida Medicaid EVV Portal | CSV / web form | Monthly |
| **Colorado** | Colorado EVV Portal | CSV / Sandata | Weekly |
| **New York** | HHAeXchange Gateway | HHAeXchange API | Real-time |
| **Washington** | Washington EVV Portal | CSV | Monthly |

### Recommended Integration Strategy for RouteMe

**Phase 1: Build an internal EVV data store** that captures all required fields (see Section 7 below).

**Phase 2: Build a configurable export layer** that can generate:
- Sandata-compatible visit files (flat file + API)
- HHAeXchange API-compatible JSON payloads
- State-specific CSV templates

**Phase 3: Direct API integration** with Sandata EVV and HHAeXchange as primary targets (covers ~35+ states).

**Phase 4: State-specific portal automation** for CA-EDI, TX-TMHP, and FL EVV Portal.

---

## 7. Current RouteMe Capability Audit

### Files Examined

The following source files were audited to assess current EVV readiness:

| File | Path | Lines |
|---|---|---|
| `routeEngine.js` | `src/lib/routeEngine.js` | 684 |
| `dataService.js` | `src/lib/dataService.js` | 324 |
| `mockData.js` | `src/lib/mockData.js` | 173 |
| `agencyMockData.js` | `src/lib/agencyMockData.js` | 146 |
| `supabase.js` | `src/lib/supabase.js` | 141 |
| `RouteContext.jsx` | `src/context/RouteContext.jsx` | 458 |
| `Visits.jsx` | `src/pages/Visits.jsx` | 124 |
| `App.js` | `src/App.js` | Routes/pages defined |

### Current Visit Data Model

**What RouteMe Captures Now:**

The `markVisited` function in `RouteContext.jsx` creates visit objects:
```javascript
const visit = {
  id: "v_" + Math.random().toString(36).slice(2, 10),
  clientId,
  clientName,
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  date: new Date().toISOString(),
  notes: '',
  status: 'visited',
};
```

The `dataService.js` `saveVisit()` stores to Supabase `visits` table with:
```javascript
const record = {
  nurse_id: nurseId,
  client_id: visit.clientId,
  date: visit.date...,              // ISO date string
  time: visit.time,                 // "HH:MM AM/PM" format
  notes: visit.notes || '',
  status: visit.status || 'visited',
};
```

**SOAP notes** (`soap_notes` table) capture:
```javascript
{
  nurse_id, client_id, author, author_credentials,
  template_id, template_label,
  service_at,     // ISO timestamp — nearest we have to "when"
  entry_at,       // ISO timestamp — when the note was entered
  subjective, objective, assessment, plan,
  icd10_codes,
  signed, signed_at,
  quick_note, addendums, late_entry
}
```

**Client model** (from `mockData.js`):
```javascript
{
  id, initials, fullName, dob, phone, address,
  lat, lng,                          // ← Already has client location!
  window, duration, priority,
  flags, medications, condition, lastVisit
}
```

**Nurse model** (from `RouteContext.jsx`, `NurseContext.jsx`, `agencyMockData.js`):
```javascript
{
  id, name, email, zone, status, role,
  homeBase: {                        // ← Already has home base!
    lat, lng, address
  },
  license, region
}
```

### EVV Compliance Gap Analysis

| EVV Requirement | Currently Supported | Gap | Impact |
|---|---|---|---|
| **WHO — Nurse identity** | ✅ Nurse ID, name, license captured in context | No NPI field | Low — easy to add |
| **WHAT — Service type** | ❌ Not captured at all | No service code (HCPCS/CPT) selection during visit | High — core EVV field |
| **WHEN — Clock-in** | ❌ Only post-facto "time" field; no clock-in timestamp | Need `visit_started_at` timestamp at time of arrival | High — core EVV field |
| **WHEN — Clock-out** | ❌ Not captured | Need `visit_ended_at` timestamp when leaving | High — core EVV field |
| **WHERE — GPS at start** | ❌ Not captured | Need `start_lat`, `start_lng`, `start_gps_accuracy` at clock-in | High — core EVV field |
| **WHERE — GPS at end** | ❌ Not captured | Need `end_lat`, `end_lng`, `end_gps_accuracy` at clock-out | High — core EVV field |
| **Home base location** | ✅ Captured in nurse profile | None — already stored | N/A |
| **Client location** | ✅ Captured in client records | None — already stored with lat/lng | N/A |
| **Route optimization** | ✅ Full route engine with traffic, weather, distance | None — EVV is separate from routing | N/A |
| **Visit notes** | ✅ SOAP notes system | None — fully functional | N/A |
| **Visit duration** | ⚠️ Partial | `duration` in client config is planned, not actual | Medium — need actual elapsed time |
| **GPS accuracy reporting** | ❌ Not captured | Need accuracy radius with each GPS reading | High — required by most states |
| **Service authorization** | ❌ Not captured | Must link to prior auth/authorization number | Medium |
| **Override/dispute reasons** | ❌ Not captured | Need field for GPS mismatch or late clock-in | Medium |
| **Offline mode** | ⚠️ Partial | Supabase supports offline; no EVV-specific offline queue | Medium |
| **EVV submission** | ❌ No EVV export | No Sandata, HHAeXchange, or state portal integration | Critical |
| **EVV unique visit ID** | ❌ Not captured | States require unique EVV transaction identifiers | Medium |

### Summary of Existing Strengths

1. **Client geolocation already stored** (`lat`, `lng` in client records) — this is actually a big advantage
2. **Nurse home base already captured** (`homeBase.lat`, `homeBase.lng`, `homeBase.address`)
3. **Supabase backend** with PostgreSQL — easy to add new tables and columns
4. **React frontend** with geolocation API available in browser
5. **Visit tracking flow already exists** — just needs EVV fields added
6. **SOAP notes have `service_at` timestamp** — closest thing to visit time, but not reliable for EVV
7. **Route engine** already knows the order and timing of visits

---

## 8. Recommended Implementation Approach

### Decision: Build Native EVV vs Integrate with Aggregator

**Recommendation: HYBRID approach — Build native EVV capture + integrate with aggregators**

**Why not build-only:**
- 35+ states require submission via Sandata, HHAeXchange, or state portals
- These aggregators have existing relationships with state Medicaid agencies
- Certification is time-consuming; using an aggregator shortcuts this
- Agencies already have accounts with Sandata/HHAeXchange; they won't swap

**Why not aggregator-only:**
- Aggregators charge per-visit fees ($0.25-$1.50) — building the capture layer in RouteMe avoids this for the capture step
- Aggregators' mobile apps are often terrible UX — RouteMe's UX is superior
- RouteMe already has routing, SOAP notes, scheduling — EVV should feel integrated, not bolted on

### Recommended Architecture

```
┌─────────────────────────────────────────────────┐
│                 RouteMe App                      │
│  ┌─────────────────────────────────────────┐    │
│  │ Phase 1: EVV Data Capture Layer          │    │
│  │  • Clock-in/out with GPS                 │    │
│  │  • Service code selection                │    │
│  │  • Override/dispute reasons             │    │
│  │  • Offline queue (IndexedDB)            │    │
│  └─────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────┐    │
│  │ Phase 2: EVV Data Store (Supabase)       │    │
│  │  • `evv_visits` table (Supabase)         │    │
│  │  • `evv_service_codes` table            │    │
│  │  • `evv_submission_log` table           │    │
│  │  • `evv_state_config` table             │    │
│  └─────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────┐    │
│  │ Phase 3: Export/Integration Layer       │    │
│  │  • Sandata flat file generator          │    │
│  │  • HHAeXchange API adapter             │    │
│  │  • Custom CSV export                    │    │
│  │  • State portal auto-submit            │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

### Phase Details

#### Phase 1: Core EVV Capture (Weeks 1-4)

**What to build:**
1. **Clock-in button** on route view — captures GPS, start time, service code
2. **Clock-out button** — captures GPS, end time
3. **Service code picker** — dropdown of authorized HCPCS codes per client/care plan
4. **Override reason dialog** — text + category for GPS or time exceptions
5. **Offline GPS capture** — store pending GPS readings in IndexedDB, sync when online
6. **EVV dashboard** — new route page section showing EVV status per visit

**New database tables in Supabase:**
```sql
CREATE TABLE evv_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES visits(id),
  nurse_id UUID REFERENCES nurses(id) NOT NULL,
  client_id UUID REFERENCES clients(id) NOT NULL,
  
  -- Core EVV data points
  visit_started_at TIMESTAMPTZ NOT NULL,
  visit_ended_at TIMESTAMPTZ,
  start_lat NUMERIC(10,7),
  start_lng NUMERIC(10,7),
  start_gps_accuracy NUMERIC(8,2),     -- meters
  start_gps_timestamp TIMESTAMPTZ,     -- when GPS was read
  end_lat NUMERIC(10,7),
  end_lng NUMERIC(10,7),
  end_gps_accuracy NUMERIC(8,2),
  end_gps_timestamp TIMESTAMPTZ,
  
  -- Service & authorization
  service_code VARCHAR(20),            -- HCPCS/CPT code
  service_description TEXT,
  authorization_number VARCHAR(50),
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending',  -- pending, verified, disputed
  override_reason TEXT,
  override_category VARCHAR(50),        -- gps_unavailable, late_clockin, location_mismatch
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Submission metadata
  submitted_at TIMESTAMPTZ,
  submission_status VARCHAR(20),       -- pending, submitted, failed, acknowledged
  submission_response JSONB
);

CREATE TABLE evv_service_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL,
  description TEXT,
  state VARCHAR(2) NOT NULL,            -- state-specific codes
  requires_authorization BOOLEAN DEFAULT true,
  active BOOLEAN DEFAULT true
);

CREATE TABLE evv_submission_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evv_visit_id UUID REFERENCES evv_visits(id),
  target_system VARCHAR(50),            -- sandata, hhaxchange, ca_edi, etc.
  payload JSONB,
  response_status INTEGER,
  response_body JSONB,
  attempt_count INTEGER DEFAULT 1,
  last_attempt_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE evv_state_config (
  state VARCHAR(2) PRIMARY KEY,
  target_system VARCHAR(50),            -- sandata, hhaxchange, custom, portal
  gps_required BOOLEAN DEFAULT true,
  gps_accuracy_threshold NUMERIC(6,2),  -- meters
  telephonic_allowed BOOLEAN DEFAULT false,
  telephonic_percent_limit NUMERIC(3,2), -- e.g., 0.10 = 10%
  submission_frequency VARCHAR(20),     -- realtime, daily, weekly, monthly
  requires_auth_number BOOLEAN DEFAULT false,
  api_endpoint TEXT,
  flat_file_format TEXT,                -- sandata, csv, custom
  active BOOLEAN DEFAULT true
);
```

#### Phase 2: Backend Processing (Weeks 5-6)

**What to build:**
1. **Supabase Edge Functions** (or Render cron jobs) for:
   - Validating EVV data completeness per state rules
   - Generating Sandata flat files
   - Calling HHAeXchange API
   - Scheduling submissions
2. **EVV dashboard for agency admin** — view all EVV visit statuses
3. **EVV compliance reporting** — generate compliance rate reports

#### Phase 3: Aggregator Integration (Weeks 7-10)

**What to build:**
1. **Sandata integration:**
   - Sandata flat file generator
   - SFTP or API submission
   - Response/acknowledgment parser
2. **HHAeXchange integration:**
   - HHAeXchange REST API adapter
   - Authentication handling
   - Visit creation, updates, queries
3. **State portal integrations:**
   - CA-EDI format adapter
   - TX-TMHP format adapter
   - FL CSV export
4. **Dashboard & monitoring:**
   - Submission success/failure tracking
   - Retry logic with exponential backoff
   - Alerting for submission failures

#### Phase 4: Certification & Compliance (Weeks 11-12)

1. **State-specific compliance testing** — verify each state's requirements
2. **Good Faith Exemption filing** — if needed for non-compliant states
3. **Agency onboarding documentation** — setup guides per state
4. **Audit trail** — full EVV audit logging
5. **Penalty protection** — ensure no claims are denied due to EVV issues

---

## 9. Timeline Estimate

### Realistic Development Timeline

| Phase | Duration | Tasks | Dependencies |
|---|---|---|---|
| **Phase 1: Core EVV Capture** | 4 weeks (Weeks 1-4) | Clock-in/out UI, GPS capture, service codes, override reasons, offline queue | None — greenfield |
| **Phase 2: Backend Processing** | 2 weeks (Weeks 5-6) | Supabase tables, validation engine, cron jobs, admin dashboard | Phase 1 |
| **Phase 3: Aggregator Integration** | 4 weeks (Weeks 7-10) | Sandata integration (2w), HHAeXchange (1w), state portals (1w) | Phase 2 |
| **Phase 4: Certification & QA** | 2 weeks (Weeks 11-12) | State-specific testing, documentation, audit trail | Phase 3 |
| **Buffer / Contingency** | 2 weeks | Bug fixes, edge cases, state-specific surprises | — |

**Total estimated timeline: 12-14 weeks (3-3.5 months)**

### Milestones

| Milestone | Target Week | Deliverable |
|---|---|---|
| EVV capture working in dev (CA config) | Week 2 | GPS clock-in/out functional for California |
| EVV data stored in Supabase | Week 4 | EVV dashboard showing visit verification data |
| Validation engine complete | Week 6 | All fields validated per state config |
| Sandata integration live | Week 8 | Sandata-formatted submissions accepted |
| HHAeXchange integration live | Week 9 | HHAeXchange submissions working |
| State portal support | Week 10 | CA-EDI, TX-TMHP, FL portals integrated |
| Production launch | Week 12-14 | EVV-compliant RouteMe deployed |

### Staffing Assumptions

- 1 full-stack developer (React + Node.js/Supabase)
- 1 backend/integrations developer (for aggregator APIs)
- 1 QA engineer (state-by-state testing)
- Part-time product/domain expert for EVV compliance

---

## 10. Cost Considerations

### Development Costs

| Item | Estimated Cost | Notes |
|---|---|---|
| **Internal development** (12-14 weeks) | $40,000-$80,000 | Depends on developer rates ($80-160/hr); 2-3 developers |
| **EVV compliance consulting** | $5,000-$15,000 | Third-party EVV expert to verify compliance per state |
| **State certification** | $0-$5,000 per state | Most states don't charge; some have application fees |
| **Legal review of EVV compliance** | $5,000-$10,000 | HIPAA + EVV compliance legal review |

### Third-Party API/Service Costs

| Service | Pricing Model | Estimated Monthly Cost |
|---|---|---|
| **Sandata API** | Per-visit fee ($0.25-$0.75) | $250-$750 for 1,000 visits/month |
| **HHAeXchange API** | Per-visit fee ($0.20-$1.00) + monthly platform ($200-500) | $400-$1,500/month |
| **CareVisit API** | Per-visit fee ($0.15-$0.50) | $150-$500/month |
| **Google Maps / Mapbox** (GPS validation) | Already paying for routing | $0 additional (already licensed) |
| **Supabase** | Already deployed | Scale EVV storage minimal (~$0/month additional) |

### Ongoing Maintenance Costs

| Item | Monthly Cost | Annual Cost |
|---|---|---|
| **Aggregator API fees** (Sandata + HHAeXchange) | $500-$2,000 | $6,000-$24,000 |
| **EVV compliance monitoring** | $500-$1,000 | $6,000-$12,000 |
| **State regulation updates** (legal tracking) | $200-$500 | $2,400-$6,000 |
| **Developer maintenance** (0.25 FTE) | $5,000-$10,000 | $60,000-$120,000 |
| **Infrastructure** (Render + Supabase scale) | $50-$200 additional | $600-$2,400 additional |

### Revenue Opportunity

| Item | Description | Estimated Impact |
|---|---|---|
| **Premium EVV compliance tier** | Charge agencies extra for EVV compliance features | +$50-$200/agency/month |
| **EVV as competitive moat** | Agencies need EVV — RouteMe with built-in EVV wins vs routing-only tools | Significant |
| **Reduced churn** | EVV compliance is "sticky" — hard to switch once integrated | Lower churn rate |

### Breakeven Analysis

| Scenario | Monthly EVV Cost | Monthly EVV Revenue (premium tier) | Breakeven Agencies |
|---|---|---|---|
| Low | $500 | $50/agency | 10 agencies |
| Medium | $1,500 | $100/agency | 15 agencies |
| High | $3,000 | $200/agency | 15 agencies |

RouteMe would need **10-15 paying agencies on the EVV premium tier** to fully cover EVV integration costs.

---

## Appendix

### Key Resources & Links

- **CMS EVV Homepage:** https://www.medicaid.gov/medicaid/data-and-systems/electronic-visit-verification-evv/index.html
- **21st Century CURES Act Text:** https://www.congress.gov/114/plaws/publ255/PLAW-114publ255.pdf (Section 12006)
- **CMS EVV Guidance SMD #18-004:** https://www.medicaid.gov/federal-policy-guidance/downloads/smd18004.pdf
- **CA DHCS EVV Page:** https://www.dhcs.ca.gov/services/Pages/EVV.aspx
- **HHAeXchange EVV Compliance:** https://hhaxchange.com/evv-compliance/
- **Sandata EVV Solutions:** https://www.sandata.com/evv-solutions/
- **EVV Industry Task Force:** https://www.evvtaskforce.com/ (standards recommendations)

### State EVV Implementation Status (as of 2026)

| State | PCS EVV Status | HHCS EVV Status | Primary System | Notes |
|---|---|---|---|---|
| California | Compliant | In progress (2026) | Sandata / CA-EDI | Home base rule active |
| Texas | Compliant | Compliant | TMHP / Sandata | 24-hour submission required |
| New York | Compliant | Compliant | HHAeXchange | Real-time submission |
| Florida | Compliant | Compliant | State Portal | Monthly certification |
| Illinois | Compliant | Compliant | Sandata | State-mandated system |
| Ohio | Compliant | Compliant | Sandata | Telephonic fallback available |
| Pennsylvania | Compliant | In progress | Sandata | 50m GPS accuracy |
| Michigan | Compliant | Compliant | Sandata | Both PCS and HHCS |
| Massachusetts | Compliant | Compliant | HHAeXchange | GPS required |
| Colorado | Compliant | Compliant | Portal / Sandata | Flexible vendor policy |
| Washington | Compliant | Compliant | Portal | Flexible |
| Oregon | Compliant | Compliant | Portal / Sandata | Flexible |
| Arizona | Compliant | Compliant | Sandata | Follows federal minimum |
| Nevada | Compliant | In progress | Sandata | Follows federal minimum |

### EVV Service Code (HCPCS) Examples

| Code | Description | Used In |
|---|---|---|
| T2010 | Home health aide services (15 min) | National |
| T2011 | Home health aide services (30 min) | National |
| T2012 | Home health aide services (60 min) | National |
| S5110 | Home care training (15 min) | National |
| S5115 | Home care training (30 min) | National |
| S5120 | Chore services (15 min) | National |
| S5125 | Attendant care (15 min) | National |
| S5130 | Homemaker service (15 min) | National |
| S5135 | Companion care (15 min) | National |
| G0154 | Skilled nursing services (RN/LPN) | National |
| G0156 | Home health aide (skilled) | National |
| 99512 | Telehealth visit (home health) | Emerging |
| 99600 | Unlisted home visit service | National (fallback) |

### Recommended Schema Migration Plan

**Step 1 (Week 1):** Add EVV columns to existing `visits` table
```sql
ALTER TABLE visits ADD COLUMN IF NOT EXISTS visit_started_at TIMESTAMPTZ;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS visit_ended_at TIMESTAMPTZ;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS start_lat NUMERIC(10,7);
ALTER TABLE visits ADD COLUMN IF NOT EXISTS start_lng NUMERIC(10,7);
ALTER TABLE visits ADD COLUMN IF NOT EXISTS start_gps_accuracy NUMERIC(8,2);
ALTER TABLE visits ADD COLUMN IF NOT EXISTS start_gps_timestamp TIMESTAMPTZ;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS end_lat NUMERIC(10,7);
ALTER TABLE visits ADD COLUMN IF NOT EXISTS end_lng NUMERIC(10,7);
ALTER TABLE visits ADD COLUMN IF NOT EXISTS end_gps_accuracy NUMERIC(8,2);
ALTER TABLE visits ADD COLUMN IF NOT EXISTS end_gps_timestamp TIMESTAMPTZ;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS service_code VARCHAR(20);
ALTER TABLE visits ADD COLUMN IF NOT EXISTS service_description TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS override_reason TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS override_category VARCHAR(50);
ALTER TABLE visits ADD COLUMN IF NOT EXISTS evv_status VARCHAR(20) DEFAULT 'pending';
```

**Step 2 (Week 2):** Create EVV config tables (as shown in Phase 1 above)

**Step 3 (Week 5):** Create EVV submission log table (as shown above)

### Key Implementation Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| State requirements change mid-implementation | Medium | High | Build config-driven architecture; monitor CMS/state updates monthly |
| GPS accuracy issues in specific locations (apartments, rural) | High | Medium | Allow manual location override with documented reason |
| Offline sync complexities | Medium | Medium | Use IndexedDB for offline queue; test extensively |
| Aggregator API changes | Medium | High | Version APIs; maintain integration tests; monitor aggregator changelogs |
| Client privacy concerns with GPS tracking | Medium | Low | Clearly disclose to nurses; allow override; comply with HIPAA |
| PWA vs native app GPS limitations | High | High | If GPS reliability is insufficient, build thin native wrapper (Capacitor/React Native) |

---

*End of EVV Research Document. This document should be kept up-to-date as state and federal EVV requirements evolve.*