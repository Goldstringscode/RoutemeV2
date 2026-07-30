# Accessibility Audit Report — RouteMe (WCAG 2.2 Level AA)

**Audited:** July 28, 2026
**Scope:** `src/` (90+ pages and components, shadcn/ui + Radix UI, Tailwind CSS)
**App:** RouteMe home health route planning app (React 19)

---

## Severity Legend

| Severity | Meaning |
|----------|---------|
| **CRITICAL** | Blocks use of core functionality for assistive technology users |
| **HIGH** | Significant barrier; violates WCAG AA success criteria |
| **MEDIUM** | Creates friction; may violate WCAG AA depending on context |
| **LOW** | Minor polish; ideal but not blocking |

---

## CRITICAL Issues

### C1. Custom Modals Have No Focus Trap

**Files:**
- `src/components/RouteBuilderModal.jsx` (lines 60–242)
- `src/components/NewActionModal.jsx` (lines 85–146)
- `src/components/RemoveFromRouteModal.jsx` (lines 15–46)

**Problem:** All three modals render as `<div className="fixed inset-0 z-50...">` with no focus trapping, focus restoration, or ARIA dialog semantics. Tab focus can escape behind the backdrop. No `role="dialog"`, `aria-modal="true"`, or `aria-labelledby` referencing the heading. Focus is not returned to the trigger element when closed.

**WCAG Violations:** 2.4.3 Focus Order, 4.1.2 Name/Role/Value

**Fix:**
1. Wrap each modal in Radix `<Dialog>` (already imported in the codebase) or implement:
   - `role="dialog"` and `aria-modal="true"` on the container
   - `aria-labelledby` pointing to the heading `<h2>`/`<h3>` element
   - A focus trap (e.g., `focus-trap-react` or Radix Dialog's built-in trap)
   - `onKeyDown={(e) => e.key === 'Escape' && onClose()}`
   - Return focus to trigger on close
2. Add `<span sr-only>Close</span>` inside the X buttons (already done in shadcn/ui dialog.jsx)

**Example patch for RouteBuilderModal:**
```jsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="route-builder-title"
  className="fixed inset-0 z-50 flex items-center justify-center p-4"
>
  ...
  <h2 id="route-builder-title" className="font-display text-2xl">Add to route</h2>
```

---

### C2. Map Stop Markers Are Not Keyboard Accessible

**File:** `src/components/StylizedMap.jsx` (lines 347–371, 386–475)

**Problem:** SVG `<g>` elements for map stops have `onClick`, `onMouseEnter`, and `onMouseLeave` handlers but:
- No `tabIndex="0"` on interactive stop groups
- No `role="button"` on clickable stops
- No `onFocus`/`onBlur` handlers (mouse-only tooltip)
- The tooltip buttons ("Full profile", "Remove from route", "Google Maps", "Apple Maps") are inside an absolutely positioned `<div>` that only appears on `onMouseEnter` — no keyboard way to reach them
- The Mapbox canvas (`interactive: !compact`) supports keyboard pan/zoom natively, but the SVG overlay stops have no keyboard interaction path

**WCAG Violations:** 2.1.1 Keyboard, 2.4.3 Focus Order

**Fix:**
1. Make each stop `<g>` focusable:
   ```jsx
   <g
     tabIndex={0}
     role="button"
     aria-label={`Stop ${s.label}: ${s.name}${s.isVisited ? ' (visited)' : ''}`}
     onClick={() => onStopClick?.(s.id)}
     onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStopClick?.(s.id); } }}
     onFocus={(e) => handleMouseEnter(s, e)}
     onBlur={handleMouseLeave}
   ```
2. Move tooltip to always-visible region below the map for keyboard users, or keep tooltip visible while any child button has focus
3. Add `aria-live="polite"` region on the tooltip container

---

### C3. Form Inputs Lack Programmatic Label Association

**Files (major occurrences):**
- `src/pages/Login.jsx` — lines 93–98 (Email, Password inputs)
- `src/pages/Signup.jsx` — lines 585–617 (Field/Input components)
- `src/pages/VitalsEntry.jsx` — lines 138–147 (Field component)
- `src/components/RouteBuilderModal.jsx` — lines 103–212 (all form inputs)
- `src/pages/Clients.jsx` — lines 81, 235–285
- `src/pages/ClientForm.jsx` — lines 44–77
- `src/pages/agency/Nurses.jsx` — line 106
- `src/pages/agency/ClientsDir.jsx` — line 59
- `src/pages/Profile.jsx` — lines 101–127
- `src/components/AgencyShell.jsx` — line 204
- `src/components/SuperAdminShell.jsx` — line 247
- `src/pages/auth/ForgotPassword.jsx`
- `src/pages/auth/SetNewPassword.jsx`
- `src/pages/NurseSettings.jsx`
- `src/pages/SOAPEditorPage.jsx` — lines 440, 489
- `src/pages/SOAPHub.jsx`
- `src/pages/VisitSignature.jsx` — line 107
- `src/pages/HelpCenter.jsx` — line 79
- `src/pages/auth/DataPrivacy.jsx` — lines 148, 156

**Problem:** Every custom `<label>` element wraps text but does NOT use `htmlFor` to associate with an input `id`. Similarly, the input elements lack `id` attributes. The association is purely visual/wrapping — screen readers will not reliably associate the label text with the input. Only the shadcn/ui `form.jsx` (`FormLabel` at line 67 with `htmlFor={formItemId}`) correctly associates labels.

**WCAG Violations:** 1.1.1 Non-text Content, 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value

**Fix (systemic):**
1. Add unique `id` to every `<input>`, `<select>`, `<textarea>`
2. Add `htmlFor` to matching `<label>` pointing to that `id`
3. Use `useId()` React hook for stable, unique IDs
4. For the standardized `Field` component pattern (Signup.jsx line 585, VitalsEntry.jsx line 138), add an auto-generated `id` and pass it:
   ```jsx
   function Field({ label, hint, required, children }) {
     const fieldId = useId();
     return (
       <div>
         <label htmlFor={fieldId} className="...">{label}...</label>
         <div className="mt-1.5">
           {React.Children.map(children, child =>
             React.cloneElement(child, { id: fieldId })
           )}
         </div>
       </div>
     );
   }
   ```

**QUICK WIN:** At minimum, add `aria-label` attributes to all inputs that lack a properly associated label.

---

## HIGH Issues

### H1. No `aria-live` Regions for Dynamic Content

**Files:**
- `src/components/ToastNotification.jsx` (entire component — lines 28–47)
- `src/pages/Login.jsx` — error display (lines 103–108)
- `src/pages/Clients.jsx` — modal dialogs
- `src/pages/NurseSettings.jsx` — toggle switches
- `src/pages/RouteView.jsx` — live route updates
- `src/context/RouteMeContext.jsx` — any state change toasts

**Problem:** Zero occurrences of `aria-live` in the entire codebase. Toast notifications that auto-dismiss after 4 seconds, error messages appearing after async actions, loading spinners, and dynamically updated content are completely invisible to screen reader users.

**WCAG Violations:** 4.1.3 Status Messages (WCAG 2.2), 3.2.2 On Input

**Fix:**
1. **ToastNotification:** Add `role="alert"` or `aria-live="polite"`:
   ```jsx
   <div role="alert" aria-live="assertive" className="fixed bottom-6 right-6 z-[100]...">
   ```
2. **Login.jsx error:** Wrap error div with `role="alert"`:
   ```jsx
   {error && (
     <div role="alert" className="rounded-xl bg-red-50 ...">
   ```
3. **RouteBuilderModal:** When "Add to route" succeeds, the form clearing + modal close should be announced
4. Consider implementing a global `aria-live="polite"` region in AppShell for announcements

---

### H2. Color Contrast — Brand Orange Fails AA for Normal Text

**Files (widespread):**
- `src/index.css` — defines `--rm-terra: #D95D39`
- Every `bg-[#D95D39] text-white` button (Login, Signup, RouteBuilderModal, etc.)
- Text links in `text-[#D95D39]` on light backgrounds

**Contrast Ratios (calculated):**
| Combination | Ratio | WCAG AA | Notes |
|---|---|---|---|
| `#D95D39` text on `#FFFFFF` | ~3.70:1 | **FAIL** 4.5:1 | Passes only large text (≥18px/14px bold) at 3:1 |
| `#D95D39` text on `#F9F8F6` | ~3.55:1 | **FAIL** | Even worse |
| White text on `#D95D39` bg | ~3.70:1 | **FAIL** (normal text) | Affects all "Add to route", "Save note" buttons |
| `#A8A29E` (stone-400) on white | ~2.54:1 | **FAIL** | Hint text, placeholder text |
| `#78716C` (stone-500) on white | ~4.79:1 | **PASS** | Just barely passes |
| `#1C1917` (ink) on `#F9F8F6` | ~11.5:1 | **PASS** | Body text is fine |

**WCAG Violations:** 1.4.3 Contrast (Minimum)

**Fix:**
1. Darken brand orange to `#C94D28` or darker (targeting ≥4.5:1 on white)
2. For buttons with white text on orange, either:
   - Darken the button background to `#C05030` (already used as hover state)
   - Make button text bold and large (currently 14px font-semibold — borderlines at 14px bold for large-text threshold)
   - Add a dark overlay or use the hover color as default
3. Replace `text-stone-400` placeholder/hint text with `text-stone-500` (`#78716C`)

---

### H3. Search Inputs Have No Accessible Labels

**Files:**
- `src/components/AgencyShell.jsx` — line 204: `<input placeholder="Search nurses, clients…">`
- `src/components/SuperAdminShell.jsx` — line 247: `<input placeholder="Search agencies, nurses, clients, audit…">`
- `src/components/RouteBuilderModal.jsx` — line 206: `<input placeholder="Search clients...">`
- `src/pages/Clients.jsx` — line 81: `<input placeholder="Search by name or address">`
- `src/pages/agency/Nurses.jsx` — line 106: `<input placeholder="Search by name, email, zone">`
- `src/pages/agency/ClientsDir.jsx` — line 59: `<input placeholder="Search by name, city, condition">`
- `src/pages/HelpCenter.jsx` — line 79: `<input placeholder="Search — try 'voice notes' or 'MFA'">`
- `src/pages/superadmin/GlobalSearch.jsx` — line 34: `<input placeholder="Search agencies, nurses...">`

**Problem:** All search inputs rely solely on `placeholder` for their purpose. Placeholder text disappears on input and is not a substitute for a label. No `aria-label` or associated `<label>` element.

**WCAG Violations:** 1.1.1 Non-text Content, 2.4.6 Headings and Labels, 3.3.2 Labels or Instructions

**Fix (QUICK WIN):** Add `aria-label` to every search input:
```jsx
<input
  aria-label="Search nurses and clients"
  placeholder="Search nurses, clients…"
  ...
/>
```

---

### H4. Interactive Tab Buttons Have No ARIA Roles

**Files:**
- `src/components/RouteBuilderModal.jsx` — lines 77–96 (New client / Add existing client tabs)
- `src/pages/NurseSettings.jsx` — line 110 (toggle button with `aria-pressed` — this one is correct)
- `src/pages/Notifications.jsx` — line 67 (filter tabs)

**Problem:** Tab buttons in RouteBuilderModal are `<button>` elements styled as tabs but lack `role="tab"`, `aria-selected`, or `aria-controls`. The tab panels lack `role="tabpanel"` and `aria-labelledby`. This breaks screen reader navigation between tabs.

**WCAG Violations:** 4.1.2 Name, Role, Value

**Fix:**
```jsx
// Tab buttons
<button role="tab" aria-selected={tab === "new"} aria-controls="panel-new" ...>
// Tab panels
<div role="tabpanel" id="panel-new" aria-labelledby="..." hidden={tab !== "new"}>
```

---

## MEDIUM Issues

### M1. ErrorBoundary Has No `role="alert"`

**File:** `src/components/ErrorBoundary.jsx` (lines 18–57)

**Problem:** When an error is caught, the UI renders a visual error screen but:
- No `role="alert"` on the error container
- The `<details>` / `<summary>` pattern for error details is accessible by default, but could be improved
- The SVG icon has no `aria-hidden="true"`

**WCAG Violations:** 4.1.3 Status Messages

**Fix:**
```jsx
<div role="alert" className="min-h-screen bg-[#F9F8F6]...">
  <svg aria-hidden="true" className="h-8 w-8 text-[#D95D39]" ...>
```

---

### M2. Toast Notifications Have No Dismiss Announcement

**File:** `src/components/ToastNotification.jsx` (lines 15–48)

**Problem:** The toast auto-dismisses after 4 seconds with no announcement. Even with `role="alert"`, when the toast is removed from DOM, screen readers don't announce the dismissal. The X button has no `aria-label`.

**Fix:**
```jsx
<button
  onClick={() => onDismiss?.(notification.id)}
  aria-label="Dismiss notification"
  ...
>
```

---

### M3. `focus:ring-stone-100` Is Nearly Invisible

**Files (widespread):**
- `src/pages/Clients.jsx` — line 86: `focus:ring-4 focus:ring-stone-100`
- `src/pages/VitalsEntry.jsx` — line 124: `focus:ring-4 focus:ring-stone-100`
- `src/pages/ClientForm.jsx` — line 92: `focus:ring-4 focus:ring-stone-100`
- `src/pages/Login.jsx` — lines 94, 98: `focus:ring-4 focus:ring-stone-100`
- `src/pages/agency/Nurses.jsx` — line 107
- `src/pages/agency/ClientsDir.jsx` — line 60
- `src/pages/HelpCenter.jsx` — line 80
- `src/pages/SOAPEditorPage.jsx` — lines 441, 490
- `src/pages/VisitSignature.jsx` — line 108

**Problem:** `ring-stone-100` is `#F5F5F4` — an extremely light grey that provides only ~1.15:1 contrast against white backgrounds. Keyboard focus indicators using this color are visually undetectable by sighted keyboard users.

**WCAG Violations:** 2.4.7 Focus Visible

**Fix (QUICK WIN):**
Replace all instances of `focus:ring-stone-100` with a more visible option:
```diff
- focus:ring-4 focus:ring-stone-100
+ focus:ring-4 focus:ring-stone-300
```
Or use the brand color more distinctly:
```diff
- focus:ring-2 focus:ring-[#D95D39]/30
+ focus:ring-2 focus:ring-[#D95D39]/60
```

---

### M4. Input Range Slider Missing Accessible Name and Value Text

**File:** `src/pages/VitalsEntry.jsx` — lines 87–98 (pain scale range input)

**Problem:** The `<input type="range">` has a visually adjacent `<label>` but no `htmlFor`/`id` association, and no `aria-valuetext` or `aria-label`. The numeric value shown next to the slider is visual-only.

**Fix:**
```jsx
<input
  type="range"
  aria-label="Pain level, 0 none to 10 severe"
  aria-valuetext={`${vitals.pain} out of 10`}
  ...
/>
```

---

### M5. SVG Icons on Interactive Elements Lack `aria-hidden`

**Files (widespread):** Every Lucide `<Icon>` / `<svg>` inside a `<button>` or `<a>` element.

**Problem:** Decorative icons (Search, X, Plus, etc.) inside buttons are not marked `aria-hidden="true"`. Screen readers may attempt to read the SVG path data.

**Fix (systemic):** This is typically handled by the Lucide library, but verify:
```jsx
<Search className="h-4 w-4" aria-hidden="true" focusable="false" />
```
Most instances may be fine as Lucide adds `aria-hidden` by default, but audit a sample.

---

## LOW Issues

### L1. Some Buttons Rely on Color Alone for State

**File:** `src/components/RouteBuilderModal.jsx` — lines 77–96 (tab active indicator)
**File:** `src/pages/NurseSettings.jsx` — toggle switches
**File:** `src/pages/Nurses.jsx` — role/status chips

**Problem:** Tab active state is communicated only by `border-[#D95D39] text-[#D95D39]` — no non-color indicator (underline underline already helps, but add `aria-selected`). Has `aria-pressed` — good.

**Fix:** Already partially addressed. Ensure all state indicators include non-color cues (underline, bold, icon change).

---

### L2. VoiceNoteModal textarea Missing Label

**File:** `src/components/VoiceNoteModal.jsx` — lines 58–66

**Problem:** The `<textarea>` has no `aria-label` or associated `<label>`. The `placeholder` is descriptive but not a substitute.

**Fix (QUICK WIN):**
```jsx
<textarea
  aria-label="Visit note content"
  data-testid="note-textarea"
  ...
/>
```

---

### L3. `onKeyDown` Handlers Missing on Interactive SVG Elements

**File:** The entire codebase has only 1 `onKeyDown` handler (Clients.jsx line 287, for Enter on an input) and 1 `onKeyDownCapture` (carousel). No custom interactive elements handle keyboard events.

**Problem:** SVG stop markers in StylizedMap, custom toggle buttons, and clickable cards lack keyboard event handlers.

---

## Quick Wins (Can be fixed in <30 minutes)

| # | File(s) | Fix | Severity Before | Effort |
|---|---------|-----|-----------------|--------|
| Q1 | All search inputs | Add `aria-label="Search..."` to every `<input placeholder="Search...">` | HIGH | 5 min |
| Q2 | `ToastNotification.jsx` | Add `role="alert"` and `aria-label="Dismiss"` on close button | HIGH | 3 min |
| Q3 | `Login.jsx` line 103 | Wrap error div with `role="alert"` | HIGH | 1 min |
| Q4 | `ErrorBoundary.jsx` line 23 | Add `role="alert"` to error container, `aria-hidden="true"` to SVG | MEDIUM | 2 min |
| Q5 | All files with `focus:ring-stone-100` | Replace with `focus:ring-stone-300` (globally searchable) | MEDIUM | 5 min |
| Q6 | `VoiceNoteModal.jsx` textarea | Add `aria-label="Visit note content"` | MEDIUM | 1 min |
| Q7 | `VitalsEntry.jsx` pain range | Add `aria-label` and `aria-valuetext` | MEDIUM | 2 min |
| Q8 | All `bg-[#D95D39]` buttons with white text | Darken to `#C05030` (already used as hover — make it the default) | HIGH | 5 min |
| Q9 | `ToastNotification.jsx` | Add `aria-label="Dismiss notification"` on X button | MEDIUM | 1 min |

Total Quick Win effort: ~25 minutes

---

## Summary Statistics

| Category | CRITICAL | HIGH | MEDIUM | LOW | Total |
|----------|----------|------|--------|-----|-------|
| Form label associations | 1 (C3) | – | – | – | 1 systemic issue, 30+ files affected |
| Modal focus management | 2 (C1) | – | – | – | 3 custom modals |
| Map keyboard access | 1 (C2) | – | – | – | 1 map component |
| Dynamic content/aria-live | – | 1 (H1) | – | – | 0 occurrences across codebase |
| Color contrast | – | 1 (H2) | – | – | Brand color fails WCAG AA |
| Search input labels | – | 1 (H3) | – | – | 8+ search inputs |
| Tab/button ARIA roles | – | 1 (H4) | – | – | Tab pattern missing roles |
| Focus indicator visibility | – | – | 1 (M3) | – | Widespread ring-stone-100 |
| Error boundary | – | – | 1 (M1) | – | 1 component |
| Toast accessibility | – | – | 1 (M2) | – | 1 component |
| Range slider | – | – | 1 (M4) | – | 1 instance |
| Other | – | – | – | 3 | Low-severity polish |

**Total:** 4 CRITICAL · 4 HIGH · 4 MEDIUM · 3 LOW

**Top 3 priorities:**
1. **C1** — Focus-trap all custom modals (blocks keyboard users entirely)
2. **C2** — Make map stop markers keyboard accessible (blocks keyboard map interaction)
3. **C3** — Programmatically associate form labels with inputs (systemic, affects 30+ files, but each fix is small)