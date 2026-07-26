# RouteMe — Future Implementations (Not Yet Built)

**Last Updated:** 2026-07-26

This file tracks features that have been discussed/planned but not yet implemented. Each entry includes the context from the conversation so we don't have to re-discuss.

---

## 1. Patient Signature Capture (Sign-on-Glass)

**Status:** 🟡 Planned, not started
**Discussed:** 2026-07-26 (SOAP notes planning)

**Requirements:**
- After a SOAP note is complete, patient signs on the nurse's phone screen
- Signature is captured as part of the visit record
- Stored alongside the SOAP note and visit data
- Used for EVV compliance and legal defensibility

**Not yet designed:**
- UI/UX for signature pad
- Storage format (SVG path? Base64 image?)
- Whether it's required or optional per visit

---

## 2. EVV (Electronic Visit Verification) Compliance

**Status:** 🟡 Planned, not started
**Discussed:** 2026-07-26 (Competitive research review)

**Requirements:**
- Geo-fenced clock-in/out (app detects nurse at patient location)
- GPS timestamp + lat/long recorded at clock-in and clock-out
- CMS-compliant EVV data export
- State-specific format support (Sandata, HHAeXchange, etc.)
- Telephony EVV fallback

**Note:** RouteMe already has GPS/timestamps from the routing engine — this is mostly a configuration + UI effort.

---

## 3. Billing / Revenue Cycle Management (RCM)

**Status:** 🟠 Planned, long-term
**Discussed:** 2026-07-26 (Competitive research review)

**Scope:**
- Auto-generated claim data from visit records
- Real-time insurance eligibility verification
- Claim submission via clearinghouse APIs
- ERA/EFT processing
- Denial management dashboard
- Medicare/Medicaid compliance (CMS-485/487, OASIS locking)

---

## 4. OASIS Documentation

**Status:** 🟠 Planned, long-term
**Discussed:** 2026-07-26 (Competitive research review)

**Scope:**
- OASIS-E item-by-item guided documentation
- PDGM payment model auto-calculation
- LUPA alerts
- Pre-claim review automation
- OBQI quality tracking

---

## 5. EHR/EMR Integration

**Status:** 🟠 Planned, long-term
**Discussed:** 2026-07-26 (Competitive research review)

**Scope:**
- FHIR R4 API endpoints
- Bi-directional sync with EPIC, WellSky, Cerner, etc.
- CSV import/export fallback
- Webhook triggers for visit completion

---

## 6. Payroll Integration

**Status:** 🔴 Not yet planned
**Discussed:** 2026-07-26 (Competitive research review)

**Scope:**
- Auto-generated time sheets from visit data
- Mileage reimbursement calculation
- Payroll export to ADP, Gusto, Paychex, QuickBooks

---

## 7. AI Voice-to-Text SOAP Notes

**Status:** 🔴 De-prioritized
**Discussed:** 2026-07-26

**Note:** Deemed less critical since phone keyboards already have voice-to-text. The structured SOAP note system (AI Generate feature) is the priority instead.

---

## 8. Offline Mode

**Status:** 🟡 Planned, not started
**Discussed:** 2026-07-26

**Scope:**
- Record SOAP notes offline
- Cache patient data for offline access
- Sync when connectivity returns
- SW already configured via Workbox, needs data layer

---

## 9. Patient/Family Portal

**Status:** 🔴 Not yet planned
**Discussed:** 2026-07-26 (Competitive research review)

---

## 10. Telehealth Integration

**Status:** 🔴 Not yet planned
**Discussed:** 2026-07-26 (Competitive research review)

---

## 11. Advanced Analytics

**Status:** 🔴 Not yet planned
**Discussed:** 2026-07-26 (Competitive research review)

**Scope:**
- Predictive staffing
- Patient acuity scoring
- Cost-per-visit analysis
- Productivity dashboards