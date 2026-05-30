# Implementation Plan — Build Guide

> A step-by-step guide to building the project. Mostly words; code only where a snippet is genuinely clearer than prose. Follow top to bottom. Pairs with `project-narrative.md` (the why).

---

## How This Plan Is Organized — The Phases

The build is split into phases, each ending on a clear **exit criterion** — don't start the next phase until the current one's exit criterion is met. Phases are ordered by dependency *and* by demo priority: if time runs out, the earlier phases alone make a complete, demoable product.

| Phase | Name | What it delivers | Exit criterion |
|-------|------|------------------|----------------|
| **1** | The Brain & The Plumbing | Setup, phone frame, routing, RiskContext, tested risk engine | Engine returns the correct tier for the demo scenarios, every time |
| **2** | The Flow Skeleton | Transaction form (+ sim panel) and the processing beat | Filling the form lands you on a 1.5s processing screen with a score in context |
| **3** | The Core — OTP Screen, All Three Modes ⭐ | Stealth, Caution, Intervention modes of the one OTP screen | Scenarios render the correct mode with the correct friction |
| **4** | The Reinforcements | SMS popup, behavioral re-escalation, risk breakdown, success screen | Each tier shows a fact-specific SMS; pasting in Caution escalates live |
| **4.5** | Demo Experience | Scenario presets, pre-filled form, simulation panel, live weights panel | One-tap scenarios land in the right tier; sliders re-score live |
| **5** | Authentication Phase (Login) ⭐ | Login screen + phase-split engine + phase-aware panels | A risky login shows an escalating warning + login OTP; a safe login is frictionless |
| **6** | The Product Story | Polish, docs, demo rehearsal | The two-act demo runs cleanly end to end |

**Where you win:** Phase 3 is the heart of the *warning UX*; Phase 5 is what makes the project answer the challenge's "during authentication" wording head-on. Everything in between reinforces the core.

---

## Tech Stack (final)

| Concern | Choice | Why |
|---------|--------|-----|
| Build tool | **Vite** | Instant dev server, fast HMR |
| Framework | **React** | Component states map to our screens/modes |
| Styling | **Tailwind CSS v4** | Reskin tiers fast; full control of eSewa look. Tokens in `@theme` (`index.css`) |
| Routing | **React Router** | Login + transaction + processing + OTP + success + admin |
| State sharing | **React Context** | Pass score + signals + simulation toggles to every screen |
| Icons | **Lucide React** | Thin-line, matches eSewa |
| Persistence | none required | Everything runs client-side, in memory |

No backend. Everything runs client-side.

---

# Phase 1 — The Brain & The Plumbing

**Exit criterion:** `scoreTransaction` and `scoreLogin` return the correct tier for the demo scenarios, verified by `src/lib/riskEngine.test.mjs`. Do not start Phase 2 until this passes.

## Step 0 — Project Setup
- Scaffold Vite + React.
- Install Tailwind v4, React Router, Lucide React.
- Put the eSewa design tokens (colors, font weights, radii, shadows) in `@theme` in `src/index.css` — single source of truth for the whole UI.

## Step 1 — The Phone Frame & Routing
- `PhoneFrame` wrapper: gray page, centered white phone card (~410px). Every screen renders inside via `<Outlet/>`.
- Routes (all inside the frame):
  - `/` → Login (entry point)
  - `/send` → Transaction Form
  - `/processing` → Processing
  - `/otp` → Transaction OTP
  - `/success` → Success
  - `/admin` → (optional internal tool)

## Step 2 — The Risk Context (shared state)
- `RiskContext` holds: transaction inputs, the computed results (login + transaction), fired behavioral signals, the shared **simulation toggles**, and the tunable **config**.
- Wrap the app in its provider. Memoize all callbacks with `useCallback` and the context value with `useMemo` (avoids render loops when effects depend on context functions).

## Step 3 — The Risk Engine (the brain)
- `src/lib/riskEngine.js` — **pure functions**, input → `{ score, firedSignals, tier }`.
- Shared `environmentalSignals()` helper feeds both phase scorers:
  - `scoreLogin()` = environmental + failed attempts
  - `scoreTransaction()` = environmental + amount
- Weights/thresholds live in `src/lib/riskConfig.js` so the weights panel can override them live.
- **Test first** against the scenarios in `riskEngine.test.mjs`. Do not proceed until green.

> ✅ **Phase 1 exit criterion met** when the tests pass.

---

# Phase 2 — The Flow Skeleton

**Exit criterion:** filling the form and pressing Proceed lands you on the processing screen for 1.5s, with the score and fired signals computed in RiskContext, then auto-advances to `/otp`.

## Step 4 — Transaction Form (`/send`)
- eSewa "Send Money" clone: **eSewa ID** (pre-filled), **Amount** (quick-pick chips 50/100/1000/5000/40,000), **Purpose**, **Remarks**, full-width green **Proceed**.
- On Proceed: write inputs + the shared simulation toggles into RiskContext, score, navigate to `/processing`.

## Step 5 — Processing
- Centered eSewa-green spinner + *"Verifying transaction security…"* `setTimeout` 1.5s → `/otp`.

> ✅ **Phase 2 exit criterion met** when form → processing → OTP works with a real score in context.

---

# Phase 3 — The Core: OTP Screen, All Three Modes ⭐

**Exit criterion:** the demo scenarios each render the correct mode — Stealth (clean), Caution (amber, acknowledge-to-proceed), Intervention (red takeover, timer + checkboxes + locked OTP).

## Step 6 — OTP Screen, Stealth first
- Read `tier` from RiskContext. Render Stealth: normal green/white, 6-box OTP input, subtle banner.
- On submit, validate the demo OTP (`123456`), navigate to `/success`.

## Step 7 — Caution & Intervention modes
- Branch rendering on `tier`.
- **Caution:** amber theme; banner text built from `firedSignals`; OTP disabled until an acknowledge tick.
- **Intervention:** red/dark takeover; verbose dynamic message; ~10s countdown; confirmation checkboxes; OTP locked until timer ends AND checkboxes ticked.
- Build the **dynamic message** (`bannerMessage.js`) as a helper turning `firedSignals` into readable sentences — reused by banner and SMS.

> ✅ **Phase 3 exit criterion met** when all three modes render correctly. **This is the minimum winning warning UX.**

---

# Phase 4 — The Reinforcements

**Exit criterion:** each tier produces a different, fact-specific SMS over the matching OTP screen; pasting into a Caution-tier OTP field escalates to Intervention; the breakdown panel shows the math; success closes the flow.

## Step 8 — SMS Popup (overlay)
- Fixed-position notification, slides in from the top of the phone (~1.5s delay), sender "eSewa", tap-to-dismiss (swipe right).
- Text is dynamic and fact-driven, scaling with tier. Separate builders for login vs transaction (`smsMessage.js`).

## Step 9 — Behavioral Re-escalation (live)
- On the OTP input detect: paste, no-pause, too-fast, too-many-attempts. Add points and re-tier live.
- Keep behavioral points in RiskContext so the breakdown reflects them.

## Step 10 — Risk Breakdown Panel
- Collapsible panel on the OTP screen listing each fired signal, its points, the total, and the tier. Reads straight from `firedSignals` + `score`.

## Step 11 — Success Screen
- eSewa-green confirmation with amount + recipient. "Done" resets the flow.

> ✅ **Phase 4 exit criterion met** when SMS, behavioral re-escalation, breakdown, and success all work.

---

# Phase 4.5 — Demo Experience

> Added during hackathon polish. Not core features, but they make the demo dramatically faster and clearer for judges.

## Step 11.5 — Scenario Presets, Simulation Panel, Live Weights
- **Scenario panel** (left, outside the phone) — one-tap presets that pre-fill the relevant phase. Data in `src/lib/scenarios.js`.
- **Simulation panel** (left) — the environmental toggles (call/device/location/time), shared by both phases.
- **Risk Weights panel** (right, outside the phone) — live sliders per signal weight + tier thresholds, editing the engine config. Changing a slider re-scores instantly.
- **Pre-filled eSewa ID** and **updated amount chips** so the form is demo-ready on load.
- **Slot-in animation** on the input values when a scenario fills the form.

**Done when:** clicking a scenario pre-fills + lands in the right tier; a slider change re-scores live.

---

# Phase 5 — Authentication Phase (Login) ⭐

> This is what makes the project answer the challenge's "**during authentication**" wording directly. Authentication happens at two moments — login and transaction — and we guard both with one shared engine.

**Exit criterion:** a safe login is frictionless (straight to `/send`); a risky login shows an escalating warning + a login OTP before access is granted; the side panels show login-relevant controls on the login screen.

## Step 12 — Split the engine by phase
- Extract the shared `environmentalSignals()` helper.
- `scoreLogin()` = environmental + `failedAttempts`; `scoreTransaction()` = environmental + amount.
- Add `loginWeights.failedAttempts` to config. Remove the old `newPayee` signal entirely (engine, config, scenarios, banner copy, tests).

## Step 13 — The Login Screen (`/`)
- eSewa login: **eSewa ID + password** (demo password `password`). Wrong password increments a failed-attempt counter; 2+ before success fires the `failedAttempts` signal.
- On Login: `scoreLogin()`. Stealth → navigate to `/send`. Caution/Intervention → switch to an in-screen **login OTP** stage reusing Banner, RiskBreakdown, OtpInput, SmsPopup.
- Back chevron on the login OTP returns to the credentials stage.

## Step 14 — Phase-aware panels
- `RiskContext` holds `loginResult` + `runLoginScoring`, and `failedAttempts` lifted into the shared `simulation` state.
- **PhoneFrame** reads the route: on `/` show **login scenarios** (set simulation toggles, stay on login) and on `/send` show **transaction scenarios** (fill the form).
- **SimulationPanel** adds the "failed passwords" toggle only on login.
- **AdminPanel** hides amount weights on login and shows the failed-password weight; shows amount weights on transaction. Environmental shared on both. Header reads "Risk weights · Login / Transaction".

> ✅ **Phase 5 exit criterion met** when both authentication acts run with the right controls and the right escalation.

---

# Phase 6 — The Product Story

- Wire **back navigation** on every screen with a header.
- Verify the **full two-act walk-through** (login A/B/C → transaction A/B/C → success) runs cleanly and resets between runs.
- Keep `project-narrative.md` and this plan in sync with the build.
- *(Optional)* the `/admin` route as a standalone internal-styled risk-policy tool.

---

## Build Order Summary

| Phase | Focus | Role |
|-------|-------|------|
| **1 — Brain & Plumbing** | Setup → frame → routing → RiskContext → engine (test!) | Prove the brain before building screens |
| **2 — Flow Skeleton** | Form → Processing | Input + the 1.5s beat |
| **3 — Core OTP ⭐** | Stealth → Caution → Intervention | The warning UX where you win |
| **4 — Reinforcements** | SMS → behavioral → breakdown → success | Make the core undeniable |
| **4.5 — Demo Experience** | Scenario presets, sim panel, live weights | One-click demo control for judges |
| **5 — Auth Phase ⭐** | Login screen + phase-split engine + phase-aware panels | Answers "during authentication" head-on |
| **6 — Product Story** | Back nav, rehearsal, docs | A clean, complete two-act demo |

**Rule of thumb:** Phases 1–4 build the context-aware warning UX. Phase 5 makes it a *complete authentication story* (login + transaction). Phase 4.5 and 6 make it demo-proof.
