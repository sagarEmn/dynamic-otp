# Enhancements — Strengthening the Core

> **Guiding principle:** Adding features does NOT make a fundamental stronger — it usually hides it. The core idea (risk-adaptive OTP warnings + Stealth mode answering "don't overwhelm users") is already complete. Everything below is judged by ONE test: **does it make the core idea more visible and more believable?** If not, skip it.

---

## Tier 1 — Build These (directly strengthen the core)

### 1. Visible "Risk Breakdown" Panel
**What:** On the OTP screen, show the score *and the math*.

```
New payee      +25
High value     +30
Active call    +20
─────────────────
Total           75  →  HIGH
```

**Why:** Converts the engine from "trust me" to "look." Judges believe what they can see. A black box looks like a guess; a visible score looks like an engine.
**Effort:** Low. **Verdict: BUILD.**

---

### 2. Live Demo Control / Debug Overlay
**What:** A small panel where you (or the judge) flip signals on/off and watch the tier change in real time.

**Why:** Proves adaptivity *live* instead of relying only on 3 canned scenarios. "Watch — I turn on 'active call'... and the screen goes red." That moment IS the pitch.
**Effort:** Low. **Verdict: BUILD.**

---

### 3. Behavioral Re-escalation (the killer detail)
**What:** The UI escalates tier *live* based on in-the-moment behavior.

**Scenario:** User is in **Caution** (yellow). They immediately *paste* the OTP and type at superhuman speed without reading → UI **escalates to Intervention** in front of them.

**Why:** Proves the system reacts to the *act of being scammed in progress*, not just transaction metadata. Most "wow" moment available, and it uses behavioral signals already planned.
**Effort:** Medium. **Verdict: BUILD.**

---

### 4. Location as Signal + Message Context
**What:** Add location in two places:
1. **As a risk signal** — "unusual location" (transaction from a place different from the user's usual area) adds points to the score, alongside new device. A new device + new payee + unusual location + active call is a textbook account-takeover-plus-coercion profile.
2. **As context inside the warning/SMS message** — show the location so the user can sanity-check it:
   > "Payment from Lalitpur, 9:47 PM. eSewa will never call to ask for this code."

**Why (safe framing):** Frame it as **a concrete reality-check for the victim**, NOT as "an obstacle scammers must overcome." Specificity fights habituation (the core thesis) — a generic warning gets ignored, but "from Pokhara, 9 PM" is a checkable fact that breaks the fraudster's rushed phone script with a specific question.

> ⚠️ **Do NOT pitch this as "scammers can't scam without knowing the location."** In the classic "read me your OTP" scam, the *victim* is the one paying, so the location shown is the victim's own correct location — it adds no overhead to that attack. A technical judge will catch this. Location only defends against attacker-initiated takeover (a different threat). Sell it as: *"making the warning specific and reality-checkable for the user."*

**Implementation note:** Don't use real GPS — the browser permission prompt is awkward in a live demo and fiddly to build. **Simulate it** like the other signals: a toggle/dropdown — *"Location: Usual (Kathmandu) / Unusual (Unknown)."* Keep it consistent with how active call and new device are faked.

**Effort:** Low. **Verdict: BUILD.**

---

### 5. Admin / Risk-Policy Dashboard (internal eSewa team tool)
**What:** A **separate Admin/Settings view**, clearly marked as the internal eSewa security team's tool — NOT part of the user payment flow. It lets the team tune the risk engine for different scenarios and contexts without touching code:

- **Sliders/inputs for each signal's weight** (high value, new payee, active call, new device, unusual location, unusual time).
- **Threshold cutoffs** for the tiers (Stealth ≤ X, Caution ≤ Y, Intervention ≥ Z).
- **Live test preview:** enter a sample transaction → see the resulting score + tier instantly.

Defaults ship working (see `spec-rules.md` weights) so it's tunable, not required, on day one.

**Why this is strong (two reasons):**
1. **Practical** — solves "tweak the weights later" directly, and doubles as the **live demo control (#2)**: flip signals / change weights and watch the tier shift on stage.
2. **Strategic** — reframes the project from "a demo" into **"a configurable fraud-policy tool for the eSewa team."** The story *"the security team adjusts risk policy without a developer"* is a real product narrative judges respond to.

**Cautions:**
- Keep it a **clearly separate internal view** (own route, distinct "Admin" styling), never mixed into the payment UX.
- Don't let it bloat — weight sliders + threshold inputs + a live test preview is enough.
- **Build it AFTER the core flow works.** It's reinforcement, not the core.

**Effort:** Medium. **Verdict: BUILD (after core).**

---

## Tier 2 — Strong If Time Allows

### 6. "Why Am I Seeing This?" Explainer
**What:** On the Intervention screen, a plain-language line:
> "This payment is unusual: large amount, first time to this person, while you're on a call. eSewa will never call to ask for this code."

**Why:** Education hits the challenge's stated **Expected Impact** ("improved user awareness"). Directly addresses an outcome metric.
**Effort:** Low. **Verdict: If time.**

---

### 7. Named Reflection Delay
**What:** The Intervention countdown timer isn't arbitrary — label its purpose in the UI:
> "A forced pause to break the caller's pressure."

**Why:** Reframes existing work (the timer you already planned) to show intent. Near-zero cost.
**Effort:** ~0. **Verdict: If time.**

---

## Tier 3 — Stretch (only if everything else is polished)

### 8. "Fraud Caught" Outcome Screen
**What:** After Intervention, if the user backs out:
> "You may have avoided a scam."

**Why:** Closes the narrative loop, ties to "reduced OTP sharing incidents."
**Effort:** Low. **Verdict: Stretch.**

---

### 9. Persistent Payee Memory (localStorage)
**What:** Store known payees in localStorage so "known vs new payee" feels real across runs instead of hardcoded.

**Why:** Realism for the new-payee signal.
**Effort:** Medium. **Verdict: Stretch.**

---

## Priority Summary

| # | Feature | Strengthens core? | Effort | Verdict |
|---|---------|-------------------|--------|---------|
| 1 | Risk breakdown panel | Makes engine believable | Low | **Build** |
| 2 | Live demo control | Proves adaptivity on stage | Low | **Build** |
| 3 | Behavioral re-escalation | Proves real-time fraud detection | Med | **Build** |
| 4 | Location signal + message context | Specificity fights habituation | Low | **Build** |
| 5 | Admin / risk-policy dashboard | Configurable tool = product story + demo control | Med | **Build (after core)** |
| 6 | "Why am I seeing this" | Hits awareness impact | Low | If time |
| 7 | Named reflection delay | Reframes existing timer | ~0 | If time |
| 8 | Fraud-caught outcome | Closes narrative | Low | Stretch |
| 9 | Persistent payee memory | Realism | Med | Stretch |

**Build #1, #2, #3, #4 first.** They turn the existing design from "good idea" into "visibly intelligent system that reacts live" — and they reuse work already scoped. Everything else is garnish.

**Bottom line:** These don't fill a hole. The concept is already complete. They make the existing strength *undeniable* to a judge in a 5-minute demo. That's the actual game now.
