# SOAP Notes System — Specification v1

**Author:** Developos
**Date:** 2026-07-26
**Status:** Draft — awaiting SOAP formatting research

---

## 1. Overview

The SOAP Notes system replaces the existing free-text notes with a structured, clinically correct SOAP note workflow. It integrates with the route session, client profiles, and visits log. A new "AI Generate" feature takes template + free-form input and formats it into a legally defensible SOAP note.

---

## 2. User Stories

### Story 1 — Nurse completes a SOAP note during route
```
As a nurse on an active route,
I want to tap a client's stop in the timeline and write a SOAP note,
So that I capture the visit data immediately while it's fresh.
```

### Story 2 — Nurse writes SOAP from client profile
```
As a nurse,
I want to go to a client's profile and write a new SOAP note,
So that I can document visits even when not on an active route.
```

### Story 3 — Nurse views SOAP history
```
As a nurse,
I want to see all SOAP notes for a client in chronological order,
So that I can track their progress over time.
```

### Story 4 — Nurse uses AI Generate
```
As a nurse,
I want to fill in a template or free-form fields and tap "AI Generate",
So that the system formats my notes into a professionally correct, legally structured SOAP note.
```

---

## 3. Architecture

### 3.1 Data Model

```javascript
soapNote = {
  id: "s_n8f3k2",                    // Unique ID
  clientId: "c1",                    // Linked to client
  clientName: "Eleanor M.",          // Denormalized for display
  visitId: "v_abc123",               // Linked to visit (if from route session)
  routeId: null,                     // Route ID if created during a route session
  
  // Core SOAP sections
  subjective: "",                    // Patient's own words, symptoms reported
  objective: "",                     // Vital signs, observations, measurements
  assessment: "",                    // Clinical judgment, diagnosis status
  plan: "",                          // Treatment plan, follow-up, medications
  
  // Metadata
  templateUsed: "post-op-knee",      // Which template was used (if any)
  icd10Codes: ["M17.9"],             // Optional ICD-10 codes
  isAIGenerated: false,              // Whether AI Generate was used
  isQuickNote: false,                // Whether this is a quick note (legacy)
  
  // Timestamps
  createdAt: "2026-07-26T14:30:00Z",  // When created
  updatedAt: "2026-07-26T14:35:00Z",  // Last modified
  visitDate: "2026-07-26",           // Date of the visit
  
  // Corrections
  corrections: [],                   // Array of {timestamp, previousContent, reason}
  isLocked: false,                   // Locked after finalization
}
```

### 3.2 State Management (RouteMeContext additions)

```javascript
// New state
soapNotes: [],                       // Array of all SOAP notes
activeSoapNote: null,                // Currently being edited
soapModalOpen: false,                // SOAP note editor modal state
soapViewMode: "edit",                // "edit" | "view"
soapTemplate: null,                  // Currently selected template

// Existing state that integrates
visits: [],                          // Visits already linked to SOAP notes
clients: [],                         // Clients for auto-population
schedule: [],                        // Schedule for route-context SOAP
routeActive: true/false,              // Only show route integration when active
```

### 3.3 Component Tree

```
App
├── RouteView (route page)
│   ├── Timeline (stop cards)
│   │   └── StopCard
│   │       └── [Write SOAP Note] button (new)
│   └── SelectedClientCard
│       └── [Write SOAP Note] button (new)
│
├── ClientDetail (client profile)
│   ├── SOAP History section (new)
│   │   └── SOAPNoteCard (list of notes)
│   └── [New SOAP Note] button (new)
│
├── Visits (visits log)
│   ├── VisitCard
│   │   └── [View SOAP Note] link (new)
│   └── [New Quick Note] button (existing, renamed)
│
├── SOAPModal (new — main editor)
│   ├── SOAPHeader (client info, date, auto-populated data)
│   ├── SOAPTemplateSelector (condition templates)
│   ├── SOAPEditor (S/O/A/P sections)
│   │   ├── Subjective
│   │   ├── Objective
│   │   ├── Assessment
│   │   └── Plan
│   ├── AIGenerateButton (formats everything into proper SOAP)
│   ├── ICD10Section (optional code search/add)
│   └── SOAPActions (save, lock, cancel)
│
└── Sidebar
    └── [SOAP Notes] tab (new — dedicated SOAP page)
```

### 3.4 Routes

```
/app/soap              → Dedicated SOAP notes page (list all notes)
/app/soap/new          → New SOAP note (with client selector)
/app/soap/new/:id      → New SOAP note for specific client
/app/soap/:id          → View/edit single SOAP note
```

---

## 4. UI/UX Design

### 4.1 SOAP Modal Layout

```
┌─────────────────────────────────────────────────┐
│  New SOAP Note — Eleanor M.                 [X] │
│  74 years · Post-op knee replacement            │
│  Last visit: Yesterday · 08:20                  │
│  Conditions: Fall risk, Gate code #4821         │
│  Medications: [loaded from patient data]        │
├─────────────────────────────────────────────────┤
│  Template: [Select condition ▼]  [None]         │
│  ┌───────────────────────────────────────────┐  │
│  │ 📋 Subjective (patient's own words)        │  │
│  │ [textarea — "Patient reports..."]           │  │
│  │                                             │  │
│  │ 🔬 Objective (vitals, observations)         │  │
│  │ [textarea]                                  │  │
│  │                                             │  │
│  │ 🧠 Assessment (clinical judgment)           │  │
│  │ [textarea]                                  │  │
│  │                                             │  │
│  │ 📝 Plan (treatment, follow-up)              │  │
│  │ [textarea]                                  │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │ ICD-10 Codes: [M17.9 ✕]  [+ Add Code]     │  │
│  │ [code search input...]                     │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  [🤖 AI Generate]  [Save as Quick Note]  [Save] │
└─────────────────────────────────────────────────┘
```

### 4.2 Auto-Population Panel

When the SOAP note opens, the top section shows auto-populated data:

| Field | Source |
|-------|--------|
| Full name | Client profile |
| Age/DOB | Client profile |
| Primary condition | Client profile |
| Last visit date | Most recent visit or SOAP note |
| Medications | Client profile (future) |
| Care flags | Client profile (fall risk, etc.) |
| Recent vitals | Last SOAP note's Objective section (future) |

### 4.3 SOAP History View (on Client Profile)

```
┌─────────────────────────────────────────────────┐
│  SOAP Notes — Eleanor M.   [New Note]           │
├─────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────┐  │
│  │ Jul 26, 2026 · 2:30 PM · Route visit     │  │
│  │ ─────────────────────────────────────     │  │
│  │ S: "Pain decreased from 7/10 to 3/10..."  │  │
│  │ O: Incision clean, dry, intact.            │  │
│  │ A: Healing as expected.                    │  │
│  │ P: Continue current plan, follow up in     │  │
│  │    3 days.                                 │  │
│  │ 📋 ICD-10: M17.9                     [→]  │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │ Jul 23, 2026 · 10:15 AM · Route visit     │  │
│  │ ...                                        │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │ Jul 20, 2026 · 9:00 AM · Quick Note        │  │
│  │ ...                                        │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### 4.4 Templates

Pre-defined templates for common home health conditions. Each template pre-fills the 4 sections with starter text:

| Template | Conditions | Pre-fill |
|----------|-----------|----------|
| Post-op / Wound Care | Post-surgical, wound vac, incision care | S: "Patient reports pain level of ___/10" O: "Incision site is ___ (clean/dry/intact/red/swollen/draining)" |
| Diabetes Management | Type II, insulin-dependent, wound care | S: "Patient reports blood sugar readings of ___" O: "BS ___ mg/dL at ___" |
| COPD / Respiratory | COPD, oxygen-dependent, asthma | S: "Patient reports shortness of breath ___" O: "O2 sat ___% on ___ L/min" |
| Cardiac Follow-up | CHF, hypertension, post-MI | S: "Patient reports ___ (chest pain/SOB/edema)" O: "BP ___/___, HR ___, weight ___ lbs" |
| Chemo Aftercare | Post-chemo, fatigue, nausea | S: "Patient reports ___ (nausea/fatigue/appetite)" O: "VS within normal limits" |
| General Visit | Catch-all | All sections blank |

### 4.5 AI Generate Feature

The AI Generate button:
1. Takes all content from S/O/A/P sections (template + free-form)
2. Takes auto-populated patient data (name, age, conditions, medications)
3. Sends to an LLM API with a structured prompt to format into a proper SOAP note
4. Returns professionally formatted, legally defensible SOAP note
5. Replaces the content in the editor (or shows a diff)
6. Marks the note as `isAIGenerated: true`

**The prompt must include:**
- Current SOAP note formatting standards (2026)
- Home health context
- Legal defensibility requirements
- Patient data for context
- Any ICD-10 codes the nurse entered

---

## 5. Integration Points

### 5.1 Route Session Integration

| Action | Behavior |
|--------|----------|
| Mark as visited | Opens option to write SOAP note immediately |
| Timeline stop card | Shows [Write SOAP Note] button alongside [Mark as visited] |
| Selected client card | Shows [Write SOAP Note] button |
| After writing SOAP | Auto-links to the visit record |

### 5.2 Client Profile Integration

| Section | Behavior |
|---------|----------|
| New "SOAP Notes" tab | Shows all SOAP notes for this client in chronological order |
| [New SOAP Note] button | Opens SOAP modal pre-populated with this client's data |
| Existing notes | Expandable cards showing S/O/A/P summary |

### 5.3 Visits Page Integration

| Action | Behavior |
|--------|----------|
| Visit record | Shows [View SOAP Note] if a SOAP note is linked |
| Quick notes | Existing notes remain, labeled "Quick Note" |
| New note button | Dropdown: "Quick Note" or "SOAP Note" |

### 5.4 Sidebar Integration

- New "SOAP Notes" tab in the sidebar
- Shows count of today's SOAP notes
- Clicking opens the dedicated SOAP page

---

## 6. Data Flow

```
Nurse opens SOAP modal
  ↓
Auto-populate patient data from clients[]
  ↓
Nurse selects template (or free-form)
  ↓
Template pre-fills S/O/A/P sections
  ↓
Nurse edits/expands content
  ↓
Optional: Add ICD-10 codes
  ↓
Optional: Tap "AI Generate" → content reformatted
  ↓
Nurse reviews, makes final edits
  ↓
Tap "Save" → SOAP note saved to soapNotes[]
  ↓
If route active → linked to visit record
  ↓
State persisted to localStorage
  ↓
UI updates: client profile, visits log, SOAP page
```

---

## 7. Quick Notes Transition

The existing free-text notes system becomes "Quick Notes":
- Quick Notes live alongside SOAP notes
- Quick Notes are simple text, no structure
- SOAP Notes are structured S/O/A/P
- Both appear in the client's note history
- Quick Notes can be "upgraded" to SOAP notes (opens in SOAP editor with text in Subjective)

---

## 8. Implementation Phases

### Phase 1 (This build)
- SOAP data model and state management
- SOAP editor modal with S/O/A/P sections
- Template selector (5 condition templates)
- Auto-population of patient data
- Client profile SOAP history view
- Save/lock SOAP notes
- ICD-10 code search/assign
- Quick Notes → SOAP Notes transition
- Sidebar SOAP tab
- Persistence to localStorage

### Phase 2 (Next)
- AI Generate integration (LLM API)
- Route session integration (write during route)
- Corrections/amendment system
- Note locking and finalization

### Phase 3 (Future)
- EHR export (PDF, FHIR)
- Offline sync
- Billing integration (ICD-10 → claim codes)