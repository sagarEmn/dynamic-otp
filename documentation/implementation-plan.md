# Implementation Plan — Build Guide

> A step-by-step guide to building the project. Mostly words; code only where a snippet is genuinely clearer than prose. Follow top to bottom. Pairs with `spec-rules.md` (the numbers), `design-system.md` (the look), and `project-narrative.md` (the why).

---

## How This Plan Is Organized — The 5 Phases

The build is split into **five phases**, each ending on a clear **exit criterion** — don't start the next phase until the current one's exit criterion is met. Phases are ordered by dependency *and* by demo priority: if time runs out, the earlier phases alone make a complete, demoable product.

| Phase | Name | Steps | What it delivers | Exit criterion |
|-------|------|-------|------------------|----------------|
| **1** | The Brain & The Plumbing | 0–3 | Setup, phone frame, routing, RiskContext, and the tested risk engine | Engine returns the correct tier for demo scenarios A/B/C, every time |
| **2** | The Flow Skeleton | 4–5 | Transaction form (+ sim panel) and the processing beat — the path *into* the OTP screen | Filling the form lands you on a 1.5s processing screen with a score in context |
| **3** | The Core — OTP Screen, All Three Modes ⭐ | 6–7 | Stealth, Caution, and Intervention modes of the one OTP screen | Scenarios A/B/C each render the correct mode with the correct friction |
| **4** | The Reinforcements | 8–11 | SMS popup, behavioral re-escalation, risk breakdown panel, success screen | Each tier shows a fact-specific SMS; pasting in Caution escalates live to Intervention |
| **5** | The Product Story | 12 | Admin / risk-policy dashboard (internal eSewa-team tool) | Changing a weight slider changes how the same transaction is scored, live |

**Where you win:** Phase 3 is the heart. Everything in Phases 1–2 is setup *for* it; everything in Phase 4 *reinforces* it. Phase 5 is genuinely optional — build it only after the core is polished and rehearsed.

**The cutline:** a fully-working Phases 1–3 plus the SMS popup (first step of Phase 4) is a complete winning demo on its own. Everything after that makes the idea *undeniable*, not *present*.

---

# Phase 1 — The Brain & The Plumbing

> **Steps 0–3.** Setup, phone frame, routing, RiskContext, and the tested risk engine. This is all foundation — no themed screens yet. The phase ends on the one non-negotiable gate: the engine must score the three demo scenarios into their correct tiers, every single time.
>
> **Exit criterion:** `scoreTransaction` returns Stealth for A (0), Caution for B (55), Intervention for C (90) — verified against the table in `spec-rules.md`. Do not start Phase 2 until this passes.

---

## Tech Stack (final)

| Concern | Choice | Why |
|---------|--------|-----|
| Build tool | **Vite** | Instant dev server, fast HMR |
| Framework | **React** | Component states map to our screens/modes |
| Styling | **Tailwind CSS** | Reskin 3 themes fast; full control of eSewa look |
| Routing | **React Router** | 4 pages + admin route |
| State sharing | **React Context** | Pass score + signals to OTP screen |
| Icons | **Lucide React** | Thin-line, matches eSewa |
| Component library | **None upfront** | Plain Tailwind for core. Add shadcn only if the admin sliders need it later (or use native range inputs) |
| Persistence | **localStorage** (optional, stretch) | Known-payee memory |

No backend. Everything runs client-side.

---

## Step 0 — Project Setup

1. Scaffold a Vite + React project in this folder (the `.md` docs stay alongside `src/`).
2. Install Tailwind CSS and configure it (content paths → `index.html` + `src/**`).
3. Add the eSewa color tokens from `design-system.md` into the Tailwind config (`theme.extend.colors`): `esewa.green`, `esewa.dark`, plus the `caution` and `danger` palettes.
4. Install React Router and Lucide React.
5. Load Poppins (or Inter) via a Google Fonts link in `index.html`; set it as the default font in Tailwind.

You should be able to run the dev server and see a blank styled page before moving on.

---

## Step 1 — The Phone Frame & Routing

**Goal:** one fixed phone-sized canvas, with all screens swapping inside it.

- Create an **app frame wrapper**: gray full-screen background, a centered white rounded card (~410px wide, min-height ~844px). Everything renders inside this card. (Exact classes are in `design-system.md`.)
- Set up **React Router** with these routes, all rendered *inside* the frame:
  - `/` → Transaction Form
  - `/processing` → Processing
  - `/otp` → OTP Screen
  - `/success` → Success
  - `/admin` → Admin Dashboard (separate, internal-looking — build last)
- Navigation between screens is just `navigate('/processing')` etc. after each step.

**Done when:** you can click through empty placeholder screens in order.

---

## Step 2 — The Risk Context (shared state)

**Goal:** one place that holds the transaction inputs, the computed score, the triggered signals, and the current tier — readable by any screen.

- Create a **RiskContext** that stores: the transaction data (amount, payee, toggles), the `score`, the list of `firedSignals`, and the derived `tier`.
- Wrap the whole app in its provider.
- The form writes into it; the OTP screen reads from it.

Keep it plain React Context + `useState` — no Redux needed at this scale.

---

## Step 3 — The Risk Engine (the brain)

**Goal:** a pure function that takes the signals and returns `{ score, firedSignals, tier }`. Build and test this BEFORE any pretty screens — it's the core logic.

- Put it in `src/lib/riskEngine.js` as a **pure function** (input → output, no side effects). Pure = trivial to test against the demo scenarios.
- It applies the **weights from `spec-rules.md`**, sums the points, collects which signals fired (for the breakdown panel + dynamic messages), and maps the total to a tier via the thresholds.
- Keep the **weights and thresholds in a separate config object** at the top of the file (or its own module) so the Admin Dashboard can later read/override them.
- A small `knownPayees.js` list decides "new payee" (anything not in the list).

A snippet, since the shape matters and is short:

```js
// the only structure worth showing — the return shape every screen depends on
function scoreTransaction(input, config) {
  // ...sum weighted points, collect fired signals...
  return { score, firedSignals, tier }; // tier: 'stealth' | 'caution' | 'intervention'
}
```

**Test it first:** run the three demo scenarios through it and confirm 0 → stealth, 55 → caution, 90 → intervention (the verification table in `spec-rules.md`). Do not proceed until this passes.

> ✅ **Phase 1 exit criterion met** when this test passes. The brain works and is proven. Now build the screens around it.

---

# Phase 2 — The Flow Skeleton

> **Steps 4–5.** The transaction form (with the simulation panel) and the 1.5s processing beat — the path that carries the user *into* the OTP screen. These are the supporting screens around the core; keep them faithful to eSewa but don't over-polish — the OTP screen in Phase 3 is where the hours belong.
>
> **Exit criterion:** filling the form and pressing Proceed lands you on the processing screen for 1.5s, with the score and fired signals already computed in RiskContext, then auto-advances to `/otp`.

---

## Step 4 — Screen 1: Transaction Form

**Goal:** the eSewa "Send Money" clone that captures inputs.

- Build the fields with plain Tailwind, matching `design-system.md`: **eSewa ID**, **Amount** (with quick-pick chips 50/100/500/1000/5000), **Purpose** (dropdown), **Remarks**, and a full-width green **Proceed** button.
- Add a **clearly-separate simulation panel** (visually distinct, e.g. a bordered "Demo controls" box) with toggles: active call, new device, location (usual/unusual). Unusual time is auto-read from the clock — no toggle.
- On **Proceed**: write all inputs into RiskContext, call the risk engine, store the result, then navigate to `/processing`.

**Done when:** filling the form and pressing Proceed lands you on processing with a score computed in context.

---

## Step 5 — Screen 2: Processing

**Goal:** the deliberate 1.5s beat.

- A centered eSewa-green spinner + text: *"Verifying transaction security..."*
- Use a `setTimeout` (1.5s, per `spec-rules.md`) then `navigate('/otp')`.
- The score is already computed (Step 4), so this is purely for feel.

**Done when:** it shows for 1.5s then auto-advances to the OTP screen.

> ✅ **Phase 2 exit criterion met** when the form → processing → OTP path works end to end with a real score in context.

---

# Phase 3 — The Core: OTP Screen, All Three Modes ⭐

> **Steps 6–7. This is where the project wins or loses.** The same screen renders in three completely different ways depending on tier — the direct answer to the habituation problem. Stealth first (get the clean baseline perfect), then Caution and Intervention. Spend most of your hours here.
>
> **Exit criterion:** demo scenarios A/B/C each render the correct mode — Stealth (clean), Caution (amber, acknowledge-to-proceed), Intervention (red takeover, timer + checkboxes + locked OTP) — with the correct friction in each.

---

## Step 6 — Screen 3: OTP Screen — Stealth first

**Goal:** get the clean baseline perfect before adding escalation.

- Read `tier` from RiskContext. For now, render the **Stealth** version: normal eSewa green/white, a 6-digit OTP input, a small subtle banner *"Never share your OTP with anyone."*
- Build the OTP input as 6 boxes (or one masked input — boxes look better).
- On submit, validate against the demo OTP (`spec-rules.md`), then navigate to `/success`.

**Done when:** a low-risk transaction shows a clean OTP screen and completes.

---

## Step 7 — OTP Screen — Caution & Intervention modes

**Goal:** the same screen, two more themed states. This is the core feature.

- Branch the OTP screen's rendering on `tier`. Three sub-components (StealthOtp / CautionOtp / InterventionOtp) keep it clean.
- **Caution:** amber theme; a warning banner whose **text is built from `firedSignals`** (e.g. "large payment to a first-time recipient"); the OTP input is disabled until the user ticks an **acknowledge** action.
- **Intervention:** red/dark takeover; a verbose dynamic message; a **countdown timer** (~10s); **confirmation checkboxes**; the **OTP input stays hidden/locked** until the timer hits zero AND all checkboxes are ticked.
- Build the **dynamic message** as a helper that turns `firedSignals` into readable sentences — one source of truth, reused by the banner and (later) the SMS.

**Done when:** scenarios A/B/C each render the correct mode with the correct friction.

> ✅ **Phase 3 exit criterion met** when all three modes render correctly for A/B/C. **This is the minimum winning demo** — everything from here strengthens it but is not required for a complete story.

---

# Phase 4 — The Reinforcements

> **Steps 8–11.** Features that make the core *undeniable*: the SMS second layer, live behavioral re-escalation (the wow moment), the visible risk-breakdown math, and the success screen that closes the loop. Build in this order — the SMS popup is part of the cutline and comes first; behavioral re-escalation is the highest reward but also the riskiest to demo live (lead with paste detection, the reliable signal).
>
> **Exit criterion:** each tier produces a different, fact-specific SMS over the matching OTP screen; pasting into a Caution-tier OTP field visibly escalates the screen to Intervention; the breakdown panel shows the math; success closes the flow.

---

## Step 8 — The SMS Popup (overlay)

**Goal:** the second layer, rendered over the OTP screen.

- A fixed-position notification component that slides in from the top of the phone frame. Sender "eSewa". Not a route — it's an overlay shown on top of the OTP screen.
- Its text is **dynamic and fact-driven**, assembled from `firedSignals` + transaction values, scaling with tier (see `project-narrative.md` §6 and `spec-rules.md`). Reuse the same message helper from Step 7.
- It shows the demo OTP code — which is what the user types in (ties the two layers together).

**Done when:** each tier produces a different, fact-specific SMS over the matching OTP screen.

---

## Step 9 — Behavioral Re-escalation (live)

**Goal:** the OTP screen reacts to how the user behaves, live.

- On the OTP input, detect: **paste** (the `onPaste` event), **no-pause** (timestamp screen load vs first keystroke), **too-fast** entry, and **incorrect attempts** (count). Thresholds and points are in `spec-rules.md`.
- When a behavioral signal fires, **add its points to the score and re-run the tier check** (the default re-escalation logic). If the tier rises, the OTP screen re-renders into the higher mode — live, in front of the user.
- Keep behavioral points in RiskContext alongside the base score so the breakdown panel reflects them.

**Done when:** pasting into a Caution-tier OTP field visibly escalates the screen to Intervention.

---

## Step 10 — Risk Breakdown Panel & Demo Visibility

**Goal:** make the engine's reasoning visible (credibility).

- A small panel (on the OTP screen, or toggleable) listing each fired signal and its points, the total, and the tier — e.g. the `New payee +25 · High value +30 = 55 → CAUTION` style.
- This reads straight from `firedSignals` and `score` in context — no new logic.

**Done when:** a judge can see *why* a transaction got its tier.

---

## Step 11 — Screen 4: Success

**Goal:** close the loop.

- Simple eSewa-green confirmation: transaction complete, amount, payee. Calm and done.
- *(Stretch: if the user backs out of an Intervention, route to a "You may have avoided a scam" screen instead.)*

> ✅ **Phase 4 exit criterion met** when the SMS, behavioral re-escalation, breakdown panel, and success screen all work. At this point the demo is fully reinforced — Phase 5 is pure upside.

---

# Phase 5 — The Product Story

> **Step 12. Genuinely last, genuinely optional.** The admin dashboard reframes the project from "a demo" into "a configurable fraud-policy tool for the eSewa team." It is separate from the consumer payment flow and must look it. Build this **only after the core (Phases 1–4) is polished and rehearsed** — a buggy dashboard hurts more than a missing one.
>
> **Exit criterion:** changing a weight slider changes how the same sample transaction is scored, live in the test preview.

---

## Step 12 — Admin / Risk-Policy Dashboard (after core works)

**Goal:** the internal eSewa-team tool (enhancement #5).

- Separate `/admin` route, clearly "internal" styling (not the consumer green UX).
- **Weight sliders** per signal + **threshold inputs** per tier, editing the engine's config object. Use native `<input type="range">` (zero deps) — only reach for shadcn if you want fancier sliders.
- A **live test preview**: enter sample inputs → show the resulting score + tier instantly (just calls the same `scoreTransaction`).
- Persist tweaks in localStorage so they survive refresh (optional).

**Done when:** changing a slider changes how the same transaction is scored, live.

---

## Build Order Summary (by phase)

| Phase | Steps | Focus | Role |
|-------|-------|-------|------|
| **1 — Brain & Plumbing** | 0–3 | Setup → frame → routing → RiskContext → **risk engine (test against scenarios!)** | The brain — prove it before building screens |
| **2 — Flow Skeleton** | 4–5 | Form → Processing | Input + the 1.5s beat |
| **3 — Core OTP ⭐** | 6–7 | **Stealth → Caution → Intervention** | Where you win — most hours here |
| **4 — Reinforcements** | 8–11 | SMS popup → behavioral re-escalation → breakdown panel → success | Make the core undeniable |
| **5 — Product Story** | 12 | Admin dashboard | Configurable fraud-policy tool — only after core works |

**Rule of thumb:** Phases 1–2 are setup; **Phase 3 is where you win**; Phase 4 is reinforcement; Phase 5 is upside. If time runs short, a fully-working **Phases 1–3 + the SMS popup** beats a half-built dashboard every time. Polish the core before you reach for Phase 5.
