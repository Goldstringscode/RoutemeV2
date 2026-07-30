# RouteMe Agent Workflow Blueprint
## Multi-Tier Build → Research → Review → Verify Pipeline

### Purpose
Ensure every change to RouteMe is not just *correct*, but *optimal* — using best-in-class patterns, competitive with the current landscape, and making the codebase stronger with each iteration.

---

## ⚡ Step 0: Onboarding (First action for every new agent)

**Before any work begins, every agent MUST read the codebase onboarding doc:**

```
read_file path="ROUTEME_CODEBASE.md"
```

This 19 KB document contains:
- Complete directory layout (every file, every directory)
- Architecture overview (state management, auth flow, data layer)
- Key technical decisions and why they were made
- Audit findings with severity, file paths, and fix recommendations
- Design tokens, env vars, build commands, agent workflow
- Current phase, known issues, and critical paths

Without reading this document first, agents waste time rediscovering the monolithic context, the 45 shadcn/ui components, the fire-and-forget Supabase patterns, and all other architectural decisions documented there.

---

## 🧠 Agent Roles

| Role | Identity | Responsibility |
|------|----------|---------------|
| **Developos** | Me (current agent) | Build the code, dispatch subagents, reconcile feedback, deliver to user |
| **Researcher** | Subagent 1 | Research best practices, competitive patterns, optimization techniques for the specific task |
| **Architect** | Subagent 2 | Review Developos's code against Researcher's findings, assess approach, suggest stronger patterns |
| **Verifier** | Subagent 3 | Run the build, test functionality, check edge cases, confirm zero regressions |

---

## 🔄 Full Pipeline (per task)

```
┌─────────────────────────────────────────────────────────────┐
│                     PHASE 1: DISPATCH                         │
│                                                               │
│  Developos dispatches all 3 subagents in one batch            │
│  (parallel) with targeted context for each:                   │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │  Researcher   │  │  Architect    │  │   Verifier        │   │
│  │               │  │              │  │                   │   │
│  │ Task: Study   │  │ Task: Review │  │ Task: Build &     │   │
│  │ best-in-class │  │ Developos's  │  │ test the actual   │   │
│  │ patterns for  │  │ code against │  │ implementation,   │   │
│  │ this feature  │  │ Researcher's │  │ confirm 0 errors, │   │
│  │               │  │ findings     │  │ check edge cases  │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘    │
│         │                  │                  │                │
│         ▼                  ▼                  ▼                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │ Returns:     │  │ Returns:     │  │ Returns:          │   │
│  │ • Best       │  │ • Approval   │  │ • Build status    │   │
│  │   patterns   │  │   or changes │  │ • Test results    │   │
│  │ • Examples   │  │   needed     │  │ • Edge cases      │   │
│  │ • Pitfalls   │  │ • Why        │  │ • Regressions     │   │
│  │ • Perf tips  │  │ • Citations  │  │ • Suggestions     │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     PHASE 2: RECONCILE                        │
│                                                               │
│  Developos collects all 3 reports and:                        │
│   1. Accepts Architect's changes (if any)                     │
│   2. Incorporates Researcher's pattern improvements           │
│   3. Fixes any issues Verifier found                          │
│   4. Rebuilds                                                 │
│                                                               │
│  If any subagent rejected or requested changes → loop back    │
│  to PHASE 1 with updated code.                                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   PHASE 3: FINAL VERIFICATION                  │
│                                                               │
│  Developos re-dispatches Verifier only:                       │
│   • Build check (0 errors, 0 warnings)                       │
│   • All verification points pass                              │
│   • No regressions in existing features                       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   PHASE 4: DELIVER                             │
│                                                               │
│  Developos reports to user:                                   │
│   • What was built                                            │
│   • Verification results                                      │
│   • Subagent findings summary                                 │
│   • Performance/quality improvements made                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔬 Subagent Instructions Detail

### Researcher Subagent Prompt
```
You are a senior software architecture researcher. Your task is to research 
the best possible patterns, libraries, and approaches for [TASK].

Research goals:
1. What are the current best-in-class patterns for this feature in 2026?
2. What production-grade libraries/examples exist?
3. What are common pitfalls and how to avoid them?
4. How do top competitors implement this? (e.g., industry leaders)
5. What patterns make this code faster, smaller, more maintainable?
6. Find 2-3 concrete code examples showing the pattern in action.

Return: prioritized recommendations with reasoning, code examples, and 
         citations to real projects/docs.
```

### Architect Subagent Prompt
```
You are a senior software architect reviewing code for production quality.

Context: [TASK + RESEARCHER FINDINGS]

Your job:
1. Review Developos's implementation against Researcher's findings
2. Identify any suboptimal patterns, anti-patterns, or missed opportunities
3. Is the approach the strongest possible? If not, propose better alternatives
4. Check: error handling, edge cases, performance, bundle size, security
5. Rate the implementation: 1-10 in each category (correctness, efficiency, 
   maintainability, competitiveness)

Return: specific changes needed with file paths, line numbers, and reasons.
```

### Verifier Subagent Prompt
```
You are a quality assurance engineer. You BUILD and TEST — never assume.

Task: Verify [TASK] implementation is 100% complete and doesn't break anything.

Verification checklist:
1. Run `npx craco build 2>&1 | tail -20` — confirm 0 errors, 0 warnings
2. Check all new files exist and export correctly
3. Check all modified files have correct imports
4. Count all required operations and confirm each has error handling
5. Check for syntax errors, duplicate definitions, bracket balance
6. Check edge cases: empty state, error state, loading state
7. Verify no existing functionality is broken

Return: PASS/FAIL per check. If any FAIL, include file path, line number, 
         and exact fix needed. Route back to Developos for fixes.
```

---

## 📦 Execution Order (Remaining Items)

| Order | Item | Type | Why Here |
|-------|------|------|----------|
| 1 | **C6: Toast Error Handling** | Infrastructure | Foundation — every other feature benefits from real error UX |
| 2 | **Map: Google/Apple Maps Deep Link** | Feature | Small, focused, high user visibility |
| 3 | **C7: OpenWeather Proxy** | Security | Protects leaked API key, moderate effort |
| 4 | **C10: VisitSignature** | Feature | Completes a shell, moderate effort |
| 5 | **C8: CSP Headers** | Security | Server config, quick win |
| 6 | **C9: Rate Limiting** | Security | Quick win, end of pipeline |
| 7 | **C3: Stripe Payment** | Feature | Largest effort, saved for last when foundation is solid |

---

## 🚦 Rules of Engagement

1. **Build phase only starts after user says "build it" or green-lights**
2. **Every build must be verified before reporting to user**
3. **If any subagent finds an issue, loop back — never deliver broken code**
4. **All 3 subagents run in parallel when possible, sequential when dependencies exist**
5. **Every subagent returns actionable items (file path + line number + fix)**
6. **Subagent reports are factual, not conversational — no fluff**
7. **Developos is the single point of reconciliation — only me reports to user**

---

## 🚨 Critical: Execution Flow Trace Required for Auth

**Do NOT trust that auth works because imports are correct.** The bug that cost us was: Login.jsx imported `setAuthed` but never called it. Multiple audits missed it because they only checked static code structure.

**For every auth-related change, trace the EXECUTION FLOW:**
1. What user action triggers the flow? (click, form submit)
2. What handler runs? (onClick, onSubmit)
3. Does the handler call the Supabase auth function? (signIn, signUp)
4. **Does the handler call the state setter?** (setAuthed, setAgencyAuthed, setSuperAdminAuthed)
5. Does the handler navigate? (navigate to protected route)
6. Does the guard component check the state? (Protected wrapper checks authed)

**This is now a mandatory verification step in every auth-related subagent dispatch.**

## 🧪 Test & Validation Standards

Every feature must pass:
- ✅ `npx craco build` — exit 0, zero ESLint warnings
- ✅ Every new function has error handling (±error check or try/catch)
- ✅ No hardcoded secrets or API keys in `src/`
- ✅ No regressions in existing features
- ✅ Bundle size impact documented (if significant)
- ✅ Works in production build (not just dev server)

---

*Blueprint v1.0 — Created 2026-07-28*