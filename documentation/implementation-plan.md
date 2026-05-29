# Implementation Plan — Build Guide

> A step-by-step guide to building the project. Mostly words; code only where a snippet is genuinely clearer than prose. Follow top to bottom. Pairs with `spec-rules.md` (the numbers), `design-system.md` (the look), and `project-narrative.md` (the why).

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

---

## Step 12 — Admin / Risk-Policy Dashboard (after core works)

**Goal:** the internal eSewa-team tool (enhancement #5).

- Separate `/admin` route, clearly "internal" styling (not the consumer green UX).
- **Weight sliders** per signal + **threshold inputs** per tier, editing the engine's config object. Use native `<input type="range">` (zero deps) — only reach for shadcn if you want fancier sliders.
- A **live test preview**: enter sample inputs → show the resulting score + tier instantly (just calls the same `scoreTransaction`).
- Persist tweaks in localStorage so they survive refresh (optional).

**Done when:** changing a slider changes how the same transaction is scored, live.

---

## Build Order Summary (priority)

1. Setup → frame → routing  *(plumbing)*
2. RiskContext → **risk engine (test against scenarios!)**  *(the brain)*
3. Form → Processing  *(input + beat)*
4. **OTP Stealth → Caution → Intervention**  *(the core — most hours here)*
5. SMS popup  *(second layer)*
6. Behavioral re-escalation  *(the wow)*
7. Risk breakdown panel  *(credibility)*
8. Success  *(close loop)*
9. Admin dashboard  *(product story — only after core works)*
10. Polish

**Rule of thumb:** everything before Step 7 is setup; Steps 6–7 are where you win; Steps 10–12 are reinforcement. If time runs short, a fully-working core flow (Steps 0–8) beats a half-built dashboard every time.
