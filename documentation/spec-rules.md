# Spec Rules — Concrete Numbers & Logic

> The exact values the risk engine, behavioral detection, and OTP flow use. These are **defaults** — all tunable later (and via the Admin Dashboard, enhancement #5). The non-negotiable constraint: the three demo scenarios must land in their intended tiers every time.

---

## 1. Tier Thresholds

| Tier | Score range |
|------|-------------|
| **Stealth** | 0 – 30 |
| **Caution** | 31 – 60 |
| **Intervention** | 61+ |

---

## 2. Risk Signal Weights (pre-OTP)

| Signal | Points | Source |
|--------|--------|--------|
| High value (> Rs. 10,000) | 30 | amount field |
| Very high value (> Rs. 40,000) | +10 bonus | amount field |
| New payee (first-time recipient) | 25 | known-payee check |
| Active call | 25 | sim toggle |
| New / unrecognized device | 20 | sim toggle |
| Unusual location | 20 | sim toggle/dropdown |
| Unusual time (odd hours) | 10 | system clock |

### Verification against demo scenarios

| Scenario | Inputs | Math | Score | Tier |
|----------|--------|------|-------|------|
| **A** | Rs. 500, known payee, no call | 0 | **0** | Stealth ✅ |
| **B** | Rs. 25,000, new payee, no call | 30 + 25 | **55** | Caution ✅ |
| **C** | Rs. 50,000, new payee, active call | 30 + 10 + 25 + 25 | **90** | Intervention ✅ |

All three land cleanly. **If any weight changes, re-run this table.**

---

## 3. Supporting Definitions

### "Unusual time" (odd hours)
Transaction between **11:00 PM and 5:00 AM** (local system clock) → fires.

### "Known payee" data
A hardcoded list of known eSewa IDs (mirrors the "Recent" payee avatars in the real UI). Anything **not** on the list = new payee.

```js
// lib/knownPayees.js — example
export const KNOWN_PAYEES = [
  '9801000001', // Noice Void
  '9802000002', // Sabrie Ryel
  '9803000003', // Alberto Karl
  '9804000004', // Sujit Thapa
  // ...add the demo's "known" recipients
];
```

*(Stretch: persist this in localStorage — enhancement #9 — so payees become "known" after first payment.)*

---

## 4. Behavioral Signals (detected on OTP screen, AFTER code is sent)

These run while the user types on the OTP screen and can **re-escalate the UI live**. They never appear in the SMS (sequencing constraint).

| Signal | Trigger | Points |
|--------|---------|--------|
| Paste into OTP field | clipboard paste detected | +20 |
| No pause to read | typing starts < 2s after screen load | +15 |
| Too-fast entry | full code entered faster than humanly typical (see below) | +15 |
| Too many incorrect attempts | 3+ wrong OTP submissions | +20 |

### Too-fast threshold
Flag if the 6 digits are entered in **under ~1.5 seconds** of manual typing (i.e. avg < ~250ms/digit). Paste is the **primary, reliable** signal; raw typing-speed is secondary/noisier — weight decisions on paste + no-pause first.

### Re-escalation logic — DEFAULT: add to score, re-tier
Behavioral points **add to the existing pre-OTP score**, and the tier is **recomputed live.** Smooth and consistent with the engine. Example: a Caution transaction (55) where the user pastes (+20) → 75 → **escalates to Intervention** in front of them.

> **Alternative (not chosen, easy to switch):** any single strong behavioral flag (e.g. paste) forces an immediate one-tier jump regardless of score. More dramatic, less nuanced. Decision deferred — start with add-to-score.

---

## 5. OTP Verification Rule

**DEFAULT: Fixed demo OTP.**

- One correct code (e.g. **482913**), shown in the SMS popup.
- Wrong entry = incorrect attempt. **3 wrong attempts** triggers the "too many incorrect attempts" behavioral signal (+20).
- This resolves the old contradiction ("any 6 digits pass" vs "too many incorrect attempts" — the latter is impossible if everything passes).

> **Alternative (not chosen):** any 6 digits pass (fully frictionless) — but then drop the "too many incorrect attempts" signal since it can't fire. Decision: use the fixed OTP so the signal is real.

---

## 6. Other Constants

| Thing | Value |
|-------|-------|
| Processing screen duration | 1.5 s |
| High-value threshold | Rs. 10,000 |
| Very-high-value threshold | Rs. 40,000 |
| Intervention countdown timer | ~10 s (the "forced pause") |
| Demo OTP code | 482913 |

---

## Open decisions (deferred, with working defaults in place)

1. **Re-escalation style** — defaulting to *add-to-score & re-tier*. Switchable to *force tier jump*.
2. **OTP rule** — defaulting to *fixed OTP + incorrect-attempt tracking*. Switchable to *any-6-digits*.

Both have working defaults so building is unblocked; revisit only if the demo feel calls for it.
