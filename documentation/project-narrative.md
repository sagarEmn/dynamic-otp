# Context-Aware OTP Security Warnings — Full Project Narrative

> A complete, incremental walkthrough of what we are building, the problem each piece solves, and what it looks like on screen. Read top to bottom to fully understand the project.

---

## 0. The Core Problem (Why This Project Exists)

People hand over their OTPs to fraudsters. Not because they're careless, but because:

1. **Static warnings have died.** Every OTP screen says "never share your OTP." Users have seen it ten thousand times. It has become wallpaper — present but invisible. This is **habituation**, and eSewa named it explicitly as a key issue.
2. **Fraudsters exploit a predictable flow.** The scam works because the authentication experience is *always the same*. A fraudster on the phone knows exactly what the victim sees and can talk them through it smoothly: "you'll get a code, just read it to me."

So the real problem is not "users don't see warnings." It's that **the warning is the same whether you're logging in from your own couch or being talked through a Rs. 50,000 transfer while a stranger waits on the line.** A warning that never changes teaches the brain to ignore it.

**Our thesis:** A warning is only powerful if it is *rare and contextual*. Stay invisible when everything is safe, so that when we DO interrupt, the user actually notices — and the fraudster's smooth script breaks.

We solve this by making the OTP experience **adapt its intensity to real-time risk.** Three escalating modes: **Stealth → Caution → Intervention.**

---

## 1. The Key Insight — "During Authentication" Means *Every* Authentication Moment

The challenge says: warnings *during authentication*. Authentication is not a single screen — it happens at **two distinct moments**, and a fraudster can strike at either:

1. **Login** — proving it's *you* getting into the account. Account-takeover scams happen here: a fraudster with your password (or coaching you live) logs in from a strange device/city and needs the login OTP.
2. **Transaction** — proving *you* authorize a specific payment. Authorized-push-payment scams happen here: you're talked into sending money, and the transaction OTP is the last gate.

Most solutions only guard the transaction. **We guard both, with one shared brain.** The same three-tier engine scores whichever moment you're in, using the signals relevant to that moment. This is the spine of the whole project — a **two-act** experience:

- **Act 1 — Login authentication**
- **Act 2 — Transaction authentication**

Both acts reuse the same tier UI, the same SMS layer, the same behavioral detection, the same visible risk breakdown. Only the *input signals* differ by phase.

---

## 2. The Canvas — What the App Physically Is

A **React web app that looks like the eSewa mobile app.** Not React Native, no responsiveness. A single fixed phone-sized card (~410px wide) centered on a gray background, so it reads instantly as a phone app and demos cleanly on a projector.

The baseline visual language is **real eSewa**: signature green (`#60BB46`), white cards, rounded corners, thin-line icons, clean whitespace. This matters for a reason that pays off later: **the user trusts the green.** When we hijack that green with red, the brain registers *wrong* instantly. The familiar baseline is a weapon.

**Flanking the phone (clearly outside the app, for the demo):**

- **Left column** — phase-aware **demo scenario presets** (one-tap setups) and **simulation controls** (the toggles that fake the environment).
- **Right column** — the **Risk Weights panel**: live sliders for every signal weight and tier threshold. Changing a slider re-scores instantly. This is the "it's a real engine, not a script" proof for judges.

Both side panels are **phase-aware**: on the login screen they show login signals/scenarios; on the transaction screen they show transaction signals/scenarios.

---

## 3. Act 1 — The Login Screen (Authentication Moment #1)

**Problem it addresses:** The first place a fraudster authenticates is *login*. We need to detect a risky sign-in and warn before access is granted.

**What it looks like:** A faithful eSewa login — **eSewa ID + password + Log in** button. The demo password is `password`; anything else counts as a failed attempt.

**The signals scored at login:**

- **Environmental** (shared with Act 2): active phone call, new/unrecognized device, unusual location, unusual time.
- **Login-only:** **repeated failed password attempts** — 2+ wrong passwords before a success is a classic takeover fingerprint, and it's a *behavioral* signal *during authentication*, exactly as the challenge frames it.

**What happens on Log in:** the app scores the login context.

- **Stealth (safe):** logs straight through to the transaction app — zero friction.
- **Caution / Intervention (risky):** shows an escalating warning + a **login OTP** step (with the same tier theming, banner, risk breakdown, and SMS popup) that must be cleared before access is granted.

*Demo line:* "We don't just guard the payment — we guard the door."

---

## 4. The Risk Engine — The Brain (Invisible, But Central)

**Problem it addresses:** We need to decide *how alarmed to be* — fast, consistently, and in a way we can explain.

**How it works:** A simple, synchronous, rule-based scorer. Each detected signal adds weighted points. Signals are split by **phase**:

| Signal | Phase | Source | Weight |
|--------|-------|--------|-------:|
| High value (> Rs. 10,000) | Transaction | amount field | 30 |
| Very high value (> Rs. 40,000) | Transaction | amount field | 15 |
| Active phone call | Both (environmental) | toggle | 30 |
| New / unrecognized device | Both (environmental) | toggle | 25 |
| Unusual location | Both (environmental) | toggle | 25 |
| Unusual time (odd hours) | Both (environmental) | toggle or system clock | 15 |
| Repeated failed passwords | Login | failed-attempt count | 30 |

The total maps to a tier:

- **0–30 → Stealth** (low risk)
- **31–60 → Caution** (medium risk)
- **61+ → Intervention** (high risk)

Two scoring entry points share one environmental core:

- `scoreLogin()` = environmental + failed attempts
- `scoreTransaction()` = environmental + amount

The score **and the list of which signals fired** are stored in React Context, so the OTP screen knows exactly why it's escalating. The engine runs *before* the OTP screen renders — no spinners waiting on it.

> **Note:** we deliberately **dropped "new payee"** as a signal. It added little for this challenge (and complicated the story); amount plus the environmental signals carry the risk far more honestly.

> **Demo credibility note:** weights are tuned so the demo scenarios land in their intended tier every single time. A demo that misfires looks like a guess; one that's exact looks like an engine.

---

## 5. Act 2 — The Transaction Form (Authentication Moment #2)

**Problem it addresses:** Risk has to be *detected* before it can be *warned about*. We capture the context of the payment.

**What it looks like:** A faithful copy of eSewa's "Send Money" screen:

- **eSewa ID** — the recipient (pre-filled so the field is never empty)
- **Amount** — with quick-pick chips (50 / 100 / 1000 / 5000 / 40,000)
- **Purpose** — dropdown
- **Remarks** — optional
- **Proceed** — full-width green button

The environmental **simulation controls** live in the left panel (shared with login). Unusual time can be forced by a toggle OR auto-detected from the system clock.

**What happens on Proceed:** the app gathers transaction + environmental signals, hands them to the Risk Engine, and moves to the Processing screen.

---

## 6. The Processing Screen

**Problem it addresses:** (1) The scoring needs a moment to feel real and deliberate. (2) It mirrors how a genuine fraud engine works — a brief security check before proceeding.

**What it looks like:** A 1.5-second loading animation: *"Verifying transaction security..."* On the eSewa green, clean and calm. The risk engine computes the score during this beat, so the OTP screen is ready the instant this finishes.

---

## 7. The OTP Screen — The Core (Shared by Both Acts)

This is where the project wins or loses. **The same screen renders in three completely different ways depending on the tier.** This is the heart of the solution to the habituation problem — and it's reused for *both* the login OTP and the transaction OTP.

### 7a. Stealth Mode (low risk) — "Don't overwhelm safe users"

**Problem it solves:** Question 3 of the challenge — *effective without overwhelming users.* This is the mode most teams forget, and it's our differentiator.

**What it looks like:** Pure, normal eSewa. Clean green/white. A standard OTP input. A small, subtle banner: *"Never share your OTP with anyone."* Zero friction.

*Demo line:* "Legitimate users face zero friction."

### 7b. Caution Mode (medium risk) — "Raise awareness"

**Problem it solves:** Something is mildly unusual (e.g. a large payment from an unusual location). We want the user to *notice and think*, without slamming the brakes.

**What it looks like:** The calm green is broken by an **amber/yellow theme**. A warning banner with a **dynamic message built from which signals actually fired** — e.g. *"This is a large payment, while on an active phone call. Please verify the details before proceeding."* The user **must acknowledge** before the OTP field becomes active.

*Demo line:* "The system detects unusual patterns and asks the user to slow down."

### 7c. Intervention Mode (high risk) — "Break the fraudster's script"

**Problem it solves:** The active-scam scenario — large transfer, unusual location, on a call. The fraudster is *right now* talking the victim through it. Our job is to **stop the flow and shatter the predictable script.**

**What it looks like:** The familiar green is gone entirely — a **red/dark, full-attention takeover.** It contains:

- A **long, verbose, dynamic warning** explaining exactly what's wrong, in plain language.
- A **countdown timer** — a forced pause (framed as "a moment to break the caller's pressure").
- **Confirmation checkboxes** the user must actively tick.
- The **OTP input stays hidden/locked** until the timer ends AND the checkboxes are confirmed.

**Why it matters:** A fraudster's script relies on speed and predictability. A forced read + timer + active confirmations cannot be smoothly talked through. The scam stalls. This is the one screen that targets the *attacker*, not just the user.

*Demo line:* "High-risk context triggers maximum friction and breaks the fraudster's script."

### 7d. Behavioral Re-escalation (live, on this screen)

**Problem it solves:** Risk isn't only in the metadata — it's in *how the user behaves*. A victim being coached on a call behaves differently: they paste blindly, type at impossible speed, never pause to read.

**What it looks like:** While on the OTP screen, we watch:

- **Paste vs manual entry** in the OTP field
- **Typing speed** — superhuman speed flagged
- **Pause-to-read** — did they read the warning or start typing instantly?
- **Too many incorrect attempts**

If a user in **Caution** pastes the OTP and types impossibly fast without reading, the UI **escalates to Intervention live, in front of them.** This proves the system reacts to *the act of being scammed in progress* — not just signals gathered earlier.

---

## 8. The SMS Popup — The Second Layer (Overlay, not a page)

**Problem it solves:** A large share of OTP fraud happens *in the message itself.* The warning has to live where the attack happens. And in real life, the SMS and the app screen exist *at the same moment.*

**What it looks like:** An Android-style heads-up notification that slides in from the top (~1.5s after the screen loads), **on top of the OTP screen** — both layers visible at once. Sender: "eSewa". Tap it to dismiss (swipes off to the right).

**The SMS must be dynamic, not generic.** A static high-risk SMS would fail for the exact reason the whole project exists — a warning that never changes becomes wallpaper. So the message is **assembled from the signals that actually fired**. Context scales with the tier, and the copy differs by phase:

- **Transaction, Stealth:** *"eSewa code: 123456. Never share it with anyone."*
- **Transaction, Caution:** *"eSewa code: 123456 for Rs. 25,000 (unusual location). Share with no one."*
- **Transaction, Intervention:** *"eSewa code: 123456 — Rs. 50,000. Detected: active phone call, unusual location. eSewa will NEVER call or ask for this code. If someone is guiding you, STOP."*
- **Login, Caution/Intervention:** speaks to the *sign-in* — *"eSewa login code: 123456 — unusual sign-in attempt. ... If someone is guiding you, STOP."*

**Two layers, two jobs — not redundant.** The app UI is the *detailed, interactive* channel (full explanation, checkboxes, timer). The SMS is a *short, sharp, independent* channel that bluntly states the facts. When two independent channels agree on a *specific, checkable fact*, it becomes far harder for a fraudster on the phone to explain away.

**Sequencing constraint:** Only **pre-OTP** context can appear in the SMS — transaction and environmental signals are known *before* the code is sent. **Behavioral signals happen *after* the OTP is sent**, so they drive the live app-UI re-escalation only, never the SMS.

---

## 9. The Success Screen

**Problem it addresses:** Close the loop cleanly.

**What it looks like:** A simple eSewa-green confirmation: payment successful, with amount and recipient. "Done" resets the flow and returns to login, ready for the next demo run.

*(Stretch: if a user backs out of an Intervention, a "You may have avoided a scam" outcome screen closes the narrative — ties directly to the "reduced OTP sharing" impact.)*

---

## 10. Supporting Touches That Make It Believable

- **Risk Breakdown panel** — shows the math on the OTP screen: `High value +30 · Active call +30 · Unusual location +25 = 85 → HIGH`. Turns the engine from "trust me" into "look."
- **Live Risk Weights panel (right side)** — flip a slider and watch the tier change in real time. This *is* the pitch moment for non-technical judges: "watch — I raise the active-call weight, and the same login goes red."
- **Phase-aware panels** — login shows login signals; transaction shows transaction signals. Nothing irrelevant on screen.

---

## 11. What's Real vs. Simulated (Honest Scope)

**Genuinely built:** the full React app, the two-phase risk-scoring engine, all three OTP modes, the live behavioral detection and re-escalation, the dynamic SMS popup, the visible risk breakdown, the live-tunable weights panel.

**Simulated (clearly, on purpose):** active call (toggle), new device (toggle), unusual location (toggle), failed-password context (toggle/count), SMS delivery (mock popup), password + OTP verification (demo values pass). These are conditions we can't produce in a hackathon demo — so we expose them as controls. The *intelligence* is real; only the *inputs* are faked.

---

## 12. The Demo Scenarios (The Story Arc)

The demo is a **two-act walk-through**. Each act has its own one-tap scenarios in the left panel.

### Act 1 — Login

| Scenario | Inputs | Result | The line we say |
|----------|--------|--------|-----------------|
| **A** | Normal login | **Stealth** | "Your own login is frictionless." |
| **B** | New city + failed passwords | **Caution** | "A strange sign-in asks you to confirm." |
| **C** | New device + new city + failed passwords | **Intervention** | "An account-takeover attempt is stopped at the door." |

### Act 2 — Transaction

| Scenario | Inputs | Result | The line we say |
|----------|--------|--------|-----------------|
| **A** | Rs. 500, normal context | **Stealth** | "Legitimate payments face zero friction." |
| **B** | Rs. 25,000, unusual location | **Caution** | "The system detects unusual patterns." |
| **C** | Rs. 50,000, active call + unusual location | **Intervention** | "High-risk context triggers maximum friction and breaks the fraudster's script." |

Same app, same engine, six completely different experiences across two authentication moments. That contrast — seen live — is the entire argument.

---

## 13. The One-Sentence Pitch

> "Static OTP warnings are dead because everyone ignores them. We make safe authentication — login *and* payment — completely frictionless, so the one dangerous moment actually gets noticed, and the fraudster's script breaks."

---

## 14. How We Built It (Order of Work)

1. **Scaffold** — Vite + React + Tailwind, phone-frame wrapper, eSewa theme tokens, routing, RiskContext.
2. **Risk engine** — scoring rules + tuned weights so the demo scenarios land correctly.
3. **Transaction form** — eSewa "Send Money" clone + simulation controls.
4. **Processing screen** — the 1.5s security-check beat.
5. **OTP screen, Stealth first** — the clean baseline.
6. **Caution + Intervention modes** — the escalation themes and friction mechanics.
7. **SMS popup overlay** — dynamic per-tier, per-phase text.
8. **Behavioral re-escalation** — paste/speed/pause detection + live tier upgrade.
9. **Risk breakdown panel + live weights panel** — make the intelligence visible.
10. **Scenario presets + simulation panel** — one-tap demo control.
11. **Login authentication phase** — split the engine into login + transaction; add the login screen; make the panels phase-aware.
12. **Success screen + polish.**

Core target (most hours): the OTP screen and its three modes. The login phase makes the story *complete* — it answers the challenge's "during authentication" directly.
