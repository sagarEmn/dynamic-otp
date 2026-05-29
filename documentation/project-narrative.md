# Context-Aware OTP Security Warnings — Full Project Narrative

> A complete, incremental walkthrough of what we are building, the problem each piece solves, and what it looks like on screen. Read top to bottom to fully understand the project.

---

## 0. The Core Problem (Why This Project Exists)

People hand over their OTPs to fraudsters. Not because they're careless, but because:

1. **Static warnings have died.** Every OTP screen says "never share your OTP." Users have seen it ten thousand times. It has become wallpaper — present but invisible. This is **habituation**, and eSewa named it explicitly as a key issue.
2. **Fraudsters exploit a predictable flow.** The scam works because the authentication experience is *always the same*. A fraudster on the phone knows exactly what the victim sees and can talk them through it smoothly: "you'll get a code, just read it to me."

So the real problem is not "users don't see warnings." It's that **the warning is the same whether you're topping up Rs. 50 or sending Rs. 50,000 to a stranger while on a call.** A warning that never changes teaches the brain to ignore it.

**Our thesis:** A warning is only powerful if it is *rare and contextual*. Stay invisible when everything is safe, so that when we DO interrupt, the user actually notices — and the fraudster's smooth script breaks.

We solve this by making the OTP experience **adapt its intensity to real-time risk.** Three escalating modes: **Stealth → Caution → Intervention.**

---

## 1. The Canvas — What the App Physically Is

Before any screen: we are building a **React web app that looks like the eSewa mobile app.** Not React Native, no responsiveness. A single fixed phone-sized card (~410px wide) centered on a gray background, so it reads instantly as a phone app and demos cleanly on a projector.

The baseline visual language is **real eSewa**: signature green (`#60BB46`), white cards, rounded corners, thin-line icons, clean whitespace. This matters for a reason that pays off later: **the user trusts the green.** When we hijack that green with red, the brain registers *wrong* instantly. The familiar baseline is a weapon.

---

## 2. Screen 1 — The Transaction Form

**Problem it addresses:** Risk has to be *detected* before it can be *warned about*. We need to capture the context of the transaction.

**What it looks like:** A faithful copy of eSewa's "Send Money" screen so it's instantly recognizable:

- **eSewa ID** — the recipient (the payee)
- **Amount** — with quick-pick chips (50 / 100 / 500 / 1000 / 5000)
- **Purpose** — dropdown
- **Remarks** — optional
- **Proceed** — full-width green button

**The simulation controls** (kept in a small demo panel, visually separate so it's clearly the "fake environment"):

- Toggle: *Simulate active phone call*
- Toggle: *Simulate new device*
- Toggle/dropdown: *Location — Usual (Kathmandu) / Unusual (Unknown)*
- *Unusual time* is auto-detected from the system clock (no toggle needed)

**What happens on Proceed:** the app gathers all these signals and hands them to the Risk Engine, then moves to the Processing screen.

---

## 3. The Risk Engine — The Brain (Invisible, But Central)

**Problem it addresses:** We need to decide *how alarmed to be* — fast, consistently, and in a way we can explain.

**How it works:** A simple, synchronous, rule-based scorer. Each detected signal adds weighted points:

| Signal | Source | Adds |
|--------|--------|------|
| High value (> Rs. 10,000) | amount field | weighted points |
| New payee (first-time recipient) | recipient check | weighted points |
| Unusual time (odd hours) | system clock | weighted points |
| Active call | toggle | weighted points |
| New / unrecognized device | toggle | weighted points |
| Unusual location | toggle | weighted points |

The total maps to a tier:

- **0–30 → Stealth** (low risk)
- **31–60 → Caution** (medium risk)
- **61+ → Intervention** (high risk)

The score **and the list of which signals fired** are stored in React Context, so the OTP screen knows exactly why it's escalating. The engine is fast and runs *before* the OTP screen renders — no spinners waiting on it.

> **Demo credibility note:** weights must be tuned so the three demo scenarios reliably land in their intended tier every single time. A demo that misfires looks like a guess; one that's exact looks like an engine.

---

## 4. Screen 2 — The Processing Screen

**Problem it addresses:** Two things. (1) The scoring needs a moment to feel real and deliberate. (2) It mirrors how a genuine fraud engine works — a brief security check before proceeding.

**What it looks like:** A 1.5-second loading animation: *"Verifying transaction security..."* On the eSewa green, clean and calm. The risk engine computes the score during this beat, so the OTP screen is ready the instant this finishes.

It's small, but it sells the idea that something intelligent is happening behind the scenes.

---

## 5. Screen 3 — The OTP Screen (The Core)

This is where the project wins or loses. **The same screen renders in three completely different ways depending on the tier.** This is the heart of the solution to the habituation problem.

### 5a. Stealth Mode (low risk) — "Don't overwhelm safe users"

**Problem it solves:** Question 3 of the challenge — *effective without overwhelming users.* This is the mode most teams forget, and it's our differentiator.

**What it looks like:** Pure, normal eSewa. Clean green/white. A standard OTP input. A small, subtle banner: *"Never share your OTP with anyone."* Zero friction. The user types and proceeds.

**Why it matters:** Because safe users sail through untouched, the rare time we *do* interrupt carries real weight. We are protecting the user's attention as a scarce resource.

*Demo line:* "Legitimate users face zero friction."

### 5b. Caution Mode (medium risk) — "Raise awareness"

**Problem it solves:** Something is mildly unusual (e.g. large amount to a new payee). We want the user to *notice and think*, without slamming the brakes.

**What it looks like:** The calm green is broken by an **amber/yellow theme**. A warning banner with a **dynamic message built from which signals actually fired** — e.g. *"This is a large payment to someone you haven't paid before."* The user **must acknowledge** (tap a confirm) before the OTP field becomes active.

**Why it matters:** The yellow is jarring *because* the baseline was green. The friction is light but real — one deliberate action.

*Demo line:* "The system detects unusual patterns and asks the user to slow down."

### 5c. Intervention Mode (high risk) — "Break the fraudster's script"

**Problem it solves:** This is the active-scam scenario — large transfer, new payee, on a call. The fraudster is *right now* talking the victim through it. Our job is to **stop the flow and shatter the predictable script.**

**What it looks like:** The familiar green is gone entirely — a **red/dark, full-attention takeover.** It contains:

- A **long, verbose, dynamic warning** explaining exactly what's wrong, in plain language.
- A **countdown timer** — a forced pause (framed as "a moment to break the caller's pressure").
- **Confirmation checkboxes** the user must actively tick (e.g. "I am not being guided by a phone call to make this payment").
- The **OTP input stays hidden/locked** until the timer ends AND the checkboxes are confirmed.

**Why it matters:** A fraudster's script relies on speed and predictability. A forced read + timer + active confirmations cannot be smoothly talked through. The scam stalls. This is the one screen that targets the *attacker*, not just the user.

*Demo line:* "High-risk context triggers maximum friction and breaks the fraudster's script."

### 5d. Behavioral Re-escalation (live, on this screen)

**Problem it solves:** Risk isn't only in the transaction data — it's in *how the user behaves*. A victim being coached on a call behaves differently: they paste blindly, type at impossible speed, never pause to read.

**What it looks like:** While on the OTP screen, we watch:

- **Paste vs manual entry** in the OTP field
- **Typing speed** — superhuman speed flagged
- **Pause-to-read** — did they read the warning or start typing instantly?
- **Too many incorrect attempts**

If a user in **Caution** mode pastes the OTP and types impossibly fast without reading, the UI **escalates to Intervention live, in front of them.** This proves the system reacts to *the act of being scammed in progress* — not just metadata gathered earlier.

---

## 6. The SMS Popup — The Second Layer (Overlay, not a page)

**Problem it solves:** A large share of OTP fraud happens *in the message itself.* The warning has to live where the attack happens. And in real life, the SMS and the app screen exist *at the same moment.*

**What it looks like:** An Android-style heads-up notification that slides in from the top, **on top of the OTP screen** (not a separate route — both layers visible at once). Sender: "eSewa".

**The SMS must be dynamic, not generic.** A static high-risk SMS would fail for the exact same reason the whole project exists — a warning that never changes becomes wallpaper. So the message is **assembled from the signals that actually fired**, filling a template with real values:

- Amount → "Rs. 50,000"
- Payee → "to a NEW number / first-time recipient"
- Location → "from Pokhara / an unusual location"
- Time → "at 2:14 AM"

This makes every transaction's SMS genuinely different — dynamism with *meaning*, not random variation. **Context scales with the tier**, exactly like the app UI does:

- **Stealth:** *"eSewa code: 482913. Never share it with anyone."*
  → Low risk carries no context — stays clean, consistent with the zero-friction goal.
- **Caution:** *"eSewa code: 482913 for Rs. 25,000 to a first-time recipient. Share with no one."*
  → Adds the single anomaly that made it unusual.
- **Intervention:** *"eSewa code: 482913 — Rs. 50,000 to a NEW number, from an unusual location, 2:14 AM. eSewa will NEVER call or ask for this code. If someone is guiding you, STOP."*
  → Stacks every fired fact + the anti-coercion script-breaker line.

**Two layers, two jobs — not redundant.** The app UI is the *detailed, interactive* channel (full explanation, checkboxes, timer — verbose, teaching). The SMS is a *short, sharp, independent* channel that bluntly states the facts. When two independent channels agree on a *specific, checkable fact* ("Rs. 50,000 to a number you've never paid, from Pokhara"), it becomes far harder for a fraudster on the phone to explain away. The app says it richly; the SMS states it bluntly. Same truth, different voices.

**Sequencing constraint (important):** Only **pre-OTP** context can appear in the SMS — transaction signals (amount, payee, time) and environmental signals (location, device, call) are all known *before* the code is sent, so they belong in the message. **Behavioral signals (paste, typing speed, pause-to-read) happen *after* the OTP is sent**, while the user is on the screen — so they drive the live app-UI re-escalation only, and can never appear in the SMS.

**Why it matters:** It reinforces the same escalation in a second channel and mirrors how real defense works — Indian/UPI banks now embed transaction context directly in OTP SMS for exactly this reason. The two layers agreeing on specific facts is what makes the warning credible and hard to talk past.

---

## 7. Screen 4 — The Success Screen

**Problem it addresses:** Close the loop cleanly.

**What it looks like:** A simple eSewa-green confirmation: transaction complete. Calm, done.

*(Stretch: if a user backs out of an Intervention, a "You may have avoided a scam" outcome screen closes the narrative — ties directly to the "reduced OTP sharing" impact.)*

---

## 8. Supporting Touches That Make It Believable

These reuse work already scoped and make the intelligence *visible*:

- **Risk Breakdown panel** — show the math on the OTP screen: `New payee +25 · High value +30 · Active call +20 = 75 → HIGH`. Turns the engine from "trust me" into "look."
- **Live demo control** — flip signals and watch the tier change in real time. This *is* the pitch moment for non-technical judges: "watch — I turn on the call, and the screen goes red."
- **"Why am I seeing this?"** explainer line on Intervention — plain-language education, hitting the "user awareness" impact.

---

## 9. What's Real vs. Simulated (Honest Scope)

**Genuinely built:** the full React app, the risk-scoring engine, all three OTP modes, the live behavioral detection and re-escalation, the dynamic SMS popup, the visible risk breakdown.

**Simulated (clearly, on purpose):** active call (toggle), new device (toggle), unusual location (toggle), SMS delivery (mock popup), OTP verification (any 6 digits pass). These are environment conditions we can't produce in a hackathon demo — so we expose them as controls. The *intelligence* is real; only the *inputs* are faked.

---

## 10. The Three Demo Scenarios (The Story Arc)

The demo walks one transaction through, escalating each time:

| Scenario | Inputs | Result | The line we say |
|----------|--------|--------|-----------------|
| **A** | Rs. 500, known payee, no call | **Stealth** | "Legitimate users face zero friction." |
| **B** | Rs. 25,000, new payee, no call | **Caution** | "The system detects unusual patterns." |
| **C** | Rs. 50,000, new payee, active call ON | **Intervention** | "High-risk context triggers maximum friction and breaks the fraudster's script." |

Three runs, same app, three completely different experiences. That contrast — seen live — is the entire argument.

---

## 11. The One-Sentence Pitch

> "Static OTP warnings are dead because everyone ignores them. We make safe payments completely frictionless — so the one dangerous payment actually gets noticed, and the fraudster's script breaks."

---

## 12. How We Build It (Order of Work)

1. **Scaffold** — Vite + React + Tailwind, phone-frame wrapper, eSewa theme tokens, 4-page routing, RiskContext.
2. **Risk engine** — scoring rules + tuned weights so the 3 scenarios land correctly.
3. **Transaction form** — eSewa "Send Money" clone + simulation controls.
4. **Processing screen** — the 1.5s security-check beat.
5. **OTP screen, Stealth first** — get the clean baseline right.
6. **Caution + Intervention modes** — the escalation themes and friction mechanics.
7. **SMS popup overlay** — dynamic per-tier text.
8. **Behavioral re-escalation** — paste/speed/pause detection + live tier upgrade.
9. **Risk breakdown panel + demo control** — make the intelligence visible.
10. **Success screen + polish.**

Core target (most hours): the OTP screen and its three modes. Everything before it is setup; everything after is reinforcement.
