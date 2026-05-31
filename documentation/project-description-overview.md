# Dynamic Alert — Project Description & Overview

**Project / Team:** Dynamic Alert · Shiva Sagar Yadav · eSewa × WWF Hackathon 2026

**One line:** A React web app, styled as the eSewa mobile app, where OTP-warning intensity **dynamically escalates** (Stealth → Caution → Intervention) based on real-time risk signals — guarding **both** authentication moments: **login** and **transaction**. A live risk engine re-scores on the fly, and behavioral signals caught *during* OTP entry can escalate the warning in real time.

> **Why it matters:** a warning everyone ignores is useless. We keep the OTP warning **rare, contextual, and hard to script through** — so the one moment that actually matters finally gets noticed. This directly answers the challenge's "during authentication" wording by guarding *both* auth events with one shared engine.

---

## The Two Authentication Phases

Authentication happens twice, and we guard both with one shared engine:

1. **Login phase** — environmental signals + new-device / unusual-location + repeated failed passwords. A safe login is frictionless; a risky one shows an escalating warning + a login OTP, and a brute-forced one locks the password entirely.
2. **Transaction phase** — environmental signals + amount (high / very-high value). A normal payment is silent; a risky one escalates the OTP screen.

---

## Screens & Routes

All screens render inside a phone frame. Routes: `/` (Login), `/send` (Transaction Form), `/processing`, `/otp` (Transaction OTP), `/success`, `/admin`.

### Login Screen (`/`) — Act 1
- **eSewa ID + password** (demo password `jjjj`).
- **Stealth login** → straight to `/send`, no OTP, zero friction.
- **Risky login** → in-screen **login OTP** stage (reuses Banner, OTP input, SMS popup, risk breakdown) with tier-appropriate friction.
- **Password lock + trusted-device approval (step-up):** after **2 wrong passwords** — OR by clicking the **"Repeated failed passwords"** simulation toggle — the password field is **disabled** ("Password login disabled" notice) and the flow routes to a **trusted-device approval** screen ("Approve on your trusted device — *Pixel 7 · Kathmandu*"). The user taps **Approve this sign-in** (or "use the code instead") to reach the login OTP. Rationale: an attacker holding a stolen password can't tap Approve on a phone they don't have.
- Back navigation returns to the credentials stage.

### Transaction Form (`/send`)
- eSewa "Send Money" clone: **eSewa ID** (pre-filled `9801000001`), **Amount** with quick-pick chips (50 / 100 / 1,000 / 5,000 / 40,000 — slot-in animation on tap), **Purpose**, **Remarks**, full-width green **Proceed**.
- On Proceed: captures inputs + live simulation toggles, scores, navigates to `/processing`.

### Processing (`/processing`)
- 1.5s eSewa-green spinner — "Verifying transaction security…" — then auto-advances to `/otp`.

### OTP Screen (`/otp`) — Core Feature
Three completely different UI states driven by tier:
- **Stealth (low risk):** clean minimal UI, subtle "Never share your OTP" banner, zero friction.
- **Caution (medium risk):** amber theme, dynamic message from the signals that fired, acknowledge checkbox before the OTP unlocks.
- **Intervention (high risk):** red/dark takeover, verbose dynamic message, ~10s countdown, confirmation checkbox(es), OTP locked until the timer ends **and** boxes are ticked.
- **Behavioral re-escalation (live):** typing behavior during OTP entry can lift the tier in real time (see below).

### Success (`/success`)
- eSewa-green confirmation with amount + recipient. "Done" resets the flow.

### Admin (`/admin`)
- Internal-styled risk-policy view (optional).

### SMS Popup — Overlay (not a routed page)
- Renders *on top of* the OTP screen — an Android-style heads-up notification sliding from the top, sender "eSewa", swipe to dismiss. Both layers visible at once (the two-layer design point). On message change it swipes the old one out and pops the new one in.
- Text is **dynamic and fact-driven**, scaling with tier, with **separate builders for login vs transaction**.
  - **Transaction SMS** leads with amount + recipient + an origin clause (new device / unusual location / unusual hour, with a detected city), and a call-aware closing warning.
  - **Login SMS** leads with concrete **device · location · time** so the owner can spot an attempt that isn't theirs at a glance — e.g. *"eSewa: unusual sign-in blocked. Attempt from Samsung Galaxy A14 · Dhulikhel · 2:14 AM. Your code is 123456. …"*
- Only **pre-OTP** context appears in the SMS (transaction + environment). Behavioral signals happen after the OTP is sent, so they affect the app-UI re-escalation only — never the SMS.

---

## Risk Engine (the brain)

- **Pure functions:** `input → { score, firedSignals, tier }`. Phase-split: `scoreLogin()` and `scoreTransaction()` share an `environmentalSignals()` helper; `applyBehavioral()` adds live behavioral points on top and re-tiers.
- **Tiers:** 0–30 **stealth**, 31–60 **caution**, 61+ **intervention** (`cautionMin: 31`, `interventionMin: 61`).
- **Live & derived:** results are **derived** (React `useMemo`) from raw inputs + the live config + the live simulation toggles — *never frozen snapshots*. So a weight slider or a toggle re-scores the **same on-screen OTP** in real time, escalating *or* de-escalating in both directions. This is the "it's not scripted — it's a live engine" demo moment.
- Weights/thresholds live in `riskConfig.js` so the live **Risk Weights** panel can override them. Several weights are derived from the caution threshold (e.g. `activeCall`, `failedAttempts`, login `unusualTime` = `CAUTION_MIN + 5`) so they always trip caution on their own and stay correct if the threshold moves.

---

## Risk Signals

**Environmental (shared by both phases):**
- Active phone call (simulated toggle) — `CAUTION_MIN + 5`, always trips caution alone.
- Unusual time / odd hours (toggle) — weighted *more heavily at login* than at transaction (an odd-hour sign-in alone warrants a login OTP).

**Login-only:**
- New / unrecognized device (toggle) — where/what-device the sign-in came from is established at login.
- Unusual location (toggle).
- Repeated failed passwords — real 2× password fumble **or** the toggle; `CAUTION_MIN + 5`, drives the password-lock + device-approval step-up.

**Transaction-only:**
- High value (amount > Rs. 10,000) and a very-high-value bonus (> Rs. 40,000).

> Note: there is **no** "new payee" signal — it was removed. Time is **toggle-only**; the app never reads the user's live system clock.

**Behavioral (detected live during OTP entry):**
- **Paste** vs manual entry.
- **Too fast** — 6 digits under ~1.5s (superhuman speed) → amber "you're going too fast" + an extra "I've slowed down and checked" checkbox.
- **No pause** — typing starts < 2s after the screen loads.
- **Slow dictation** — ~1s gaps between digits **while on an active call** (the "someone is reading me the code" tell) → red intervention.
- **Too many attempts** — repeated wrong OTP submissions.
- Behavioral signals also lift the **banner tone** (slow-dictation → red, any other behavioral on a stealth base → amber) so colour stays in sync with the live warning text.

---

## OTP Warning Modes

| Mode | Goal | Design | Friction |
|------|------|--------|----------|
| **Stealth** | Zero friction | Clean, minimal | None — "Never share your OTP with anyone." |
| **Caution** | Awareness | Amber theme | Dynamic message from fired signals; acknowledge checkbox before proceeding |
| **Intervention** | Break the fraudster's script | Red/dark takeover | Verbose dynamic message; ~10s countdown; confirmation checkbox(es); OTP locked until timer ends + boxes ticked |

---

## Intervention Layers

1. **App UI** — the OTP screen transforms entirely based on risk (theme, message, timer, checkboxes, lock).
2. **SMS layer** — the simulated OTP message popup with dynamic, fact-driven text.
3. **Step-up (login)** — the password-lock + trusted-device approval flow for repeated failed passwords.

---

## What's Simulated vs Built

- **Built:** full React + Vite + Tailwind v4 app; phase-split risk-scoring engine (tested); login + transaction flows; all three OTP modes; behavioral detection; dynamic SMS popup (login + transaction builders); password-lock + trusted-device approval; live simulation + Risk Weights panels with real-time re-scoring; risk breakdown panel; success/reset.
- **Simulated:** active call / new device / unusual location / unusual time / failed passwords (toggles); SMS delivery (mock popup); trusted-device approval (tap to confirm); OTP verification (demo OTP `123456`).
- **No backend** — everything runs client-side, in memory.

---

## Demo Scenarios (verified scores)

**Login:**
- Clean login (no toggles) → **0**, Stealth → straight in, no OTP.
- Active call → **36**, Caution → login OTP, amber.
- Unusual time → **36**, Caution.
- Failed passwords alone → **36**, Caution → password lock + device approval.
- New device + unusual location + failed passwords → **86**, Intervention.

**Transaction:**
- Rs. 500, normal → **0**, Stealth.
- Rs. 25,000 + unusual time → **45**, Caution.
- Rs. 50,000 + active call → **81**, Intervention.

**Behavioral (on a caution base):**
- + slow-dictation → **61**, Intervention (red).
- + too-fast → **51**, Caution (amber) + "slow down" checkbox.

> Demo creds: password `jjjj` · OTP `123456`. Full beat-by-beat walkthrough in `demo-script.md`.
