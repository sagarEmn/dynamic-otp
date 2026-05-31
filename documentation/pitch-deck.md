# Dynamic Alert — Pitch Deck

> Slide-by-slide content + speaker notes + demo script.
> Each slide has **[ON SLIDE]** (what the audience reads) and **[SAY]** (what you say out loud). Keep slides sparse; let your voice carry the detail.
> Target length: ~14 slides, ~5–6 minutes + live demo.

---

## Slide 1 — Title

**[ON SLIDE]**
- **Dynamic Alert**
- Context-Aware OTP Security Warnings
- Team: Dynamic Alert — Shiva Sagar Yadav
- eSewa × WWF Hackathon 2026
- *"Static OTP warnings are ignored because they never change. Dynamic Alert stays silent when you're safe and escalates only when risk is real — so the warning that matters finally gets noticed."*

**[SAY]**
"Hi, I'm Shiva, and my project is Dynamic Alert. It's about the one security warning every eSewa user has stopped reading — and how we make it matter again."

---

## Slide 2 — The Hook

**[ON SLIDE]**
- "You'll get a code. Just read it to me."
- That one sentence drains accounts every day.

**[SAY]**
"A fraudster calls. They sound official. They say: 'you'll get a code, just read it to me.' And people do — not because they're careless, but because the warning on that screen is the *same* warning they've ignored ten thousand times. The problem isn't that users don't see warnings. It's that the warning never changes."

---

## Slide 3 — The Problem

**[ON SLIDE]**
- **Habituation:** every OTP screen says "never share your OTP." Users have gone blind to it.
- **Predictability:** the auth flow is always identical — so a fraudster can talk a victim through it smoothly.
- The warning is the same whether you're logging in from your couch or being talked through a Rs. 50,000 transfer by a stranger on the phone.

**[SAY]**
"Two things make OTP fraud work. First, habituation — a static warning becomes wallpaper. Second, predictability — because the screen never changes, the scammer knows exactly what you see and can narrate it. eSewa itself named habituation as a key issue. A warning that never changes *teaches the brain to ignore it.*"

---

## Slide 4 — Our Thesis & Solution

**[ON SLIDE]**
- A warning is only powerful if it's **rare and contextual.**
- Stay **invisible when safe** → so when we *do* interrupt, the user actually notices.
- Three adaptive modes: **Stealth → Caution → Intervention.**
- We guard **both** authentication moments — **login** and **payment** — with one shared engine.

**[SAY]**
"Our thesis: a warning is only powerful if it's rare. So we make safe authentication completely frictionless — and reserve all our intensity for the rare dangerous moment. One engine, three escalating modes. And critically, we guard *both* moments a fraudster can strike: the login door and the payment gate. Most solutions only guard the payment."

---

## Slide 5 — Understanding the User

**[ON SLIDE]**
- **Primary user:** everyday eSewa customer — especially less tech-savvy, the prime social-engineering target.
- **Secondary:** eSewa's fraud/risk team (the engine is their tunable policy tool).
- **Pain point:** the victim is *mid-scam, on a call, being coached* — exactly when a static warning fails hardest.
- **Journey today:** call → "read me the code" → static warning ignored → money gone.

**[SAY]**
"Our user is the everyday eSewa customer — and the moment that matters is when they're on the phone with a scammer, being coached in real time. That's precisely when today's static warning is weakest. We designed for *that* moment."

---

## Slide 6 — The Solution in Action: Three Modes

**[ON SLIDE]**
- **Stealth** (safe) — pure eSewa, zero friction. *Legitimate users never punished.*
- **Caution** (medium) — amber theme, dynamic banner naming the actual risk signals, acknowledge-to-proceed.
- **Intervention** (high) — red takeover, countdown timer, forced checkboxes, OTP locked until both clear.

**[SAY]**
"Same screen, three completely different experiences. Stealth: pure eSewa, no friction — this is the mode most teams forget, and it's our differentiator. Caution: the calm green breaks to amber, with a message built from *which signals actually fired*. Intervention: the green is gone entirely — a red takeover with a forced pause and active confirmations."

---

## Slide 7 — The Real Innovation

**[ON SLIDE]**
1. **It targets the *attacker*, not just the user** — the Intervention timer + forced reads break the fraudster's *smooth phone script*. A scripted call can't survive a forced pause.
2. **Live behavioral detection** — we watch *how* you enter the OTP: paste, superhuman speed, no-pause, and **slow dictation** (≈1-second gaps between digits *while on a call* = someone reading you the code).
3. **Two independent channels agree on a checkable fact** — the app UI *and* a dynamic SMS both name the same specific risk. Far harder to explain away.
4. **A real engine, not a script** — every weight and threshold is live-tunable; the risk math is shown on screen.

**[SAY]**
"Here's what makes us different. One — we're the only design that targets the *attacker*. The timer and checkboxes exist specifically to break the scammer's smooth script. Two — we detect the scam *in progress*: if you're on a call and typing one digit per second, that's a scammer dictating the code to you, and we catch it live. Three — the app and the SMS independently state the same fact, so the fraudster can't hand-wave it away. And four — this is a real engine: watch."
*(→ lead into the demo / weights panel)*

---

## Slide 8 — Technical Implementation

**[ON SLIDE]**
- **Stack:** React + Vite, Tailwind CSS v4, React Router. No backend — fully client-side, deterministic.
- **The brain:** pure-function risk engine — `input → { score, firedSignals, tier }`. Unit-tested; demo scenarios land in the right tier *every time*.
- **Two scorers, one core:** `scoreLogin()` and `scoreTransaction()` share an `environmentalSignals()` helper.
- **Live & reactive:** results are *derived* (React `useMemo`) from inputs + config, so weight sliders and signal toggles re-score the screen in real time.
- **Behavioral layer:** per-keystroke timing detects paste / too-fast / no-pause / slow-dictation on both OTP screens.

**[SAY]**
"It's a React app styled as the eSewa mobile app, with a pure-function rule engine at its core — input in, score and tier out. It's unit-tested, so the demo scenarios are exact, not lucky. Login and transaction share one environmental scoring core. And everything is *derived* state — when I move a weight slider, the screen re-scores instantly, which you'll see live."

---

## Slide 9 — The Demo (Show, Don't Tell)

**[ON SLIDE]**
- Act 1 — **Login:** safe login → straight in. Risky login (new device + city) → escalating warning + login OTP.
- Act 2 — **Payment:** Rs. 500 → frictionless. Rs. 50,000 on an active call → red Intervention.
- **The wow:** drag the *active-call* weight up live → watch the same screen escalate Stealth → Caution → Intervention.

**[SAY / DEMO SCRIPT]**
> **Act 1 — Login**
> - "Here's my own login — frictionless, straight in. *We don't just guard the payment; we guard the door.*"
> - Toggle new device + unusual location, log in: "A strange sign-in from a new device in Dhulikhel — now it asks me to confirm before granting access."
>
> **Act 2 — Payment**
> - "A Rs. 500 payment to family — zero friction. *Legitimate users are never punished.*"
> - Rs. 50,000 + active call → red: "Large transfer, on a call. The green is gone. A timer, a forced read, checkboxes — *this is the screen a scammer cannot talk you through.*"
> - Type the OTP slowly, one digit per second: "Watch — I'm typing like someone's reading it to me. The system catches the dictation pattern and escalates *live*."
>
> **The engine proof**
> - On the weights panel: "This isn't scripted. I raise the active-call weight — and the same login goes from silent to red in real time."

---

## Slide 10 — Impact & Benefits

**[ON SLIDE]**
- **Before:** one static warning, ignored, on every screen → OTP handed over.
- **After:** safe flows are silent; the *one* dangerous flow is impossible to ignore *and* hard to script through.
- **Reduced OTP-sharing incidents** (the challenge's stated impact).
- **Zero friction for legitimate users** — no false-alarm fatigue.
- **Improved awareness** at the exact moment of risk.

**[SAY]**
"The before-and-after is the whole argument. Today: one warning everywhere, ignored. With Dynamic Alert: silence when you're safe, and an un-ignorable, un-scriptable intervention when you're not. That's fewer OTPs shared, with *zero* extra friction for honest users."

---

## Slide 11 — Feasibility & Scalability

**[ON SLIDE]**
- **Technically feasible now:** rule engine is lightweight, deterministic, runs client- or server-side.
- **Drop-in:** wraps the existing OTP flow; the three modes are UI states, not a re-architecture.
- **Scales by signal:** real device fingerprinting, IP/geo, velocity, call-state APIs slot straight into the same scoring interface.
- **Tunable policy:** the weights panel *is* a fraud-policy console for eSewa's risk team.

**[SAY]**
"This is feasible today — it's a lightweight rule engine that wraps the existing OTP screen. As real signals come online — device fingerprinting, geo-IP, velocity checks — they plug into the same scoring interface without changing the UI. And the live weights panel is genuinely a fraud-policy console the risk team would use."

---

## Slide 12 — Risks & Mitigation

**[ON SLIDE]**
- **Over-warning → new habituation.** *Mitigation:* Stealth-first design; intervention is deliberately rare.
- **False positives frustrate users.** *Mitigation:* tunable weights/thresholds; behavioral signals add, not replace.
- **Signal quality (real device/geo data).** *Mitigation:* phased rollout, weight low-confidence signals lightly.
- **Accessibility of the friction.** *Mitigation:* clear language, focus order, no reliance on color alone (roadmap).

**[SAY]**
"The biggest risk is ironic — over-warning would recreate the habituation we're solving. That's exactly why we lead with Stealth and keep Intervention rare. Everything else — false positives, signal quality — is handled by the tunable weights and a phased rollout."

---

## Slide 13 — Roadmap

**[ON SLIDE]**
- **30 days:** integrate real device + geo-IP signals; A/B the thresholds.
- **3 months:** velocity/impossible-travel signals; "you may have avoided a scam" outcome screen.
- **6 months:** ML-assisted weight tuning from real fraud outcomes; standalone risk-policy dashboard.
- **12 months:** cross-product (login, payments, KYC) shared risk spine; accessibility-complete.

**[SAY]**
"Near term, we wire in real device and location signals and A/B the thresholds. Medium term, velocity detection and outcome screens. Long term, the engine becomes a shared risk spine across all of eSewa's authentication moments, with weights tuned by real fraud data."

---

## Slide 14 — Key Takeaways

**[ON SLIDE]**
- The problem is real: **static warnings are dead.**
- The solution works: **rare, contextual, un-scriptable** — and it's **built and demoable**.
- The impact is significant: **fewer OTPs shared, zero friction for honest users.**

**[SAY]**
"Three things to remember. Static warnings are dead. Dynamic Alert makes the warning rare, contextual, and impossible to script through. And it's not a mockup — it's a working engine you just watched react live. Thank you."

---

## Slide 15 — Thank You & Q&A

**[ON SLIDE]**
- **Dynamic Alert** — Context-Aware OTP Security Warnings
- Team Dynamic Alert · Shiva Sagar Yadav
- eSewa × WWF Hackathon 2026
- *Questions?*

---

## Appendix — Anticipated Q&A

- **"Isn't a timer just friction users will hate?"** Only in the rare high-risk case. 95% of the time it's Stealth — no friction at all. The friction is *targeted at the attacker's script*, not the user.
- **"How do you get real device/location data?"** Today they're simulated toggles — we're honest about that. The intelligence (scoring, escalation, behavioral detection) is real; the inputs plug into the same interface once production signals are available.
- **"What stops false positives?"** Tunable weights + thresholds (shown live), and behavioral signals *add* to risk rather than triggering alone.
- **"Why guard login too, not just payment?"** Account-takeover scams strike at login; APP scams strike at payment. 'During authentication' means both — so we guard both with one engine.
- **"What's genuinely built vs simulated?"** Built: the full app, two-phase engine, three modes, live behavioral detection, dynamic SMS, visible risk breakdown, live weights. Simulated (on purpose): the environmental conditions we can't produce in a demo room.
