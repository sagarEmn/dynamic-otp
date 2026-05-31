# Dynamic Alert — Presentation Script

> Mapped to the eSewa **Pitch Perfect** guide (17-slide rubric). Judges score on:
> **Problem Understanding · Innovation · Technical Execution · User Experience · Feasibility & Scalability · Presentation.**
> Each slide: **[ON SLIDE]** = sparse text the audience reads · **[SAY]** = what you say.
> Target: **~13 slides, 5–6 min talk + live demo.** Keep slides sparse; your voice carries the detail.
>
> **Deck note:** the guide's "Why We Pitch" (2) and "Anatomy" (3) are *instructions about pitching*, not slides — they're the spine your talk already follows (Hook → Problem → Solution → Demo → Innovation → Impact → Next). The guide's "Why Our Team Can Execute" (4-role table) is **dropped** — this is solo-built; we turn that into a one-line strength instead. Feasibility + Go-Live + Roadmap are **merged** into one "Feasibility & What's Next" slide.

---

## Slide 1 — Title

**[ON SLIDE]**
- **Dynamic Alert**
- Context-Aware OTP Security Warnings
- Team: **Dynamic Alert** — Shiva Sagar Yadav
- **eSewa × WWF Hackathon 2026**
- *One line:* "An OTP warning that stays silent when you're safe and escalates only when the risk is real — so the warning that matters finally gets noticed."

**[SAY]**
"Hi, I'm Shiva — solo builder of **Dynamic Alert**. It's about the one security warning every eSewa user has stopped reading, and how we make it matter again — at *both* moments a fraudster can strike."

---

## Slide 2 — The Hook

**[ON SLIDE]**
- *"You'll get a code. Just read it to me."*
- That one sentence drains accounts every day.

**[SAY]**
"A scammer calls. They sound official. They say: 'you'll get a code — just read it to me.' And people do. Not because they're careless — because the warning on that screen is the *same* one they've ignored ten thousand times. The problem isn't that users don't see warnings. It's that the warning never changes."

---

## Slide 3 — The Problem (who, why, how often)

**[ON SLIDE]**
- **Who:** everyday eSewa users — especially less tech-savvy, the prime social-engineering target.
- **Habituation:** every OTP screen says the same thing → users have gone blind to it. *(eSewa named this directly.)*
- **Predictability:** the flow never changes → a scammer can narrate a victim through it smoothly.
- One warning covers *both* "logging in from my couch" and "being talked through a Rs. 50,000 transfer by a stranger."

**[SAY]**
"Two things make OTP fraud work. **Habituation** — a static warning becomes wallpaper; eSewa itself flagged this. And **predictability** — because the screen never changes, the scammer knows exactly what you see and can talk you past it. A warning that never changes literally *trains the brain to ignore it.*"

---

## Slide 4 — Our Solution & Value Proposition

**[ON SLIDE]**
- A warning is only powerful if it's **rare and contextual.**
- **Invisible when safe → un-ignorable when dangerous.**
- Three adaptive modes: **Stealth → Caution → Intervention.**
- We guard **both** authentication moments — **login** *and* **payment** — with one shared engine. *(Most solutions only guard the payment.)*
- **One-sentence solution:** *a real-time risk engine that reshapes the OTP screen — calm when you're safe, and an un-scriptable intervention when you're not.*

**[SAY]**
"Our thesis: a warning only works if it's rare. So we make safe authentication completely frictionless — and reserve all our intensity for the rare dangerous moment. One engine, three escalating modes. And critically — we guard *both* moments a fraudster strikes: the login door **and** the payment gate. That's our value proposition: maximum protection, zero friction for honest users."

---

## Slide 5 — Understanding the User

**[ON SLIDE]**
- **Primary:** everyday eSewa customer (esp. less tech-savvy — the social-engineering target).
- **Secondary:** eSewa's fraud / risk team (our weights panel is *their* tunable policy console).
- **Stakeholders:** eSewa (trust + chargeback cost), the wider digital-payments ecosystem.
- **Pain point:** the victim is *mid-scam, on a call, being coached* — exactly when a static warning fails hardest.
- **Journey today:** call → "read me the code" → static warning ignored → money gone.

**[SAY]**
"Our user is the everyday customer — and the moment that matters is when they're *on the phone with a scammer, being coached in real time.* That's precisely when today's warning is weakest. We designed for *that* moment — and for eSewa's risk team, who get a live policy console out of the same engine."

---

## Slide 6 — Solution Architecture (Input → Processing → Output)

**[ON SLIDE]**
```
   INPUT (signals)            PROCESSING (the engine)         OUTPUT (the screen)
 ┌───────────────────┐      ┌────────────────────────┐      ┌──────────────────────┐
 │ Environmental      │      │  Pure-function scorer   │      │  Tiered OTP UI        │
 │  • active call     │      │  score = Σ weights      │      │  Stealth / Caution /  │
 │  • new device      │ ───▶ │  tier  = thresholds     │ ───▶ │  Intervention         │
 │  • location / time │      │  (scoreLogin /          │      │  + dynamic banner     │
 │ Login: failed pwd  │      │   scoreTransaction)     │      │  + dynamic SMS        │
 │ Txn: amount        │      │                         │      │  + risk breakdown     │
 │ Behavioral (live): │      │  applyBehavioral()      │      │                       │
 │  paste/speed/      │ ───▶ │  re-tiers in real time  │ ───▶ │  live re-escalation   │
 │  dictation         │      └────────────────────────┘      └──────────────────────┘
 └───────────────────┘        derived state (useMemo) — no snapshots, always live
```
- **One core, two phases:** `scoreLogin()` + `scoreTransaction()` share an environmental scorer.
- **Live:** the screen is *derived* from inputs + config, so changing a weight or a signal re-scores instantly.

**[SAY]**
"Architecture is simple by design: **signals in, a pure scoring function in the middle, a tiered screen out.** Login and payment share one environmental core. The key property — the output is *derived* from the inputs, not a frozen snapshot — so the moment a signal or a weight changes, the screen re-scores live. You'll see that in the demo."

---

## Slide 7 — Innovation & Differentiation

**[ON SLIDE]**
1. **Targets the *attacker*, not just the user** — the timer + forced reads break the scammer's smooth phone script.
2. **Catches the scam *in progress*** — behavioral detection: paste, superhuman speed, no-pause, and **slow dictation** (~1s gaps *while on a call* = someone reading you the code).
3. **Two channels, one checkable fact** — the app UI *and* the SMS independently name the same risk → hard to explain away.
4. **A real engine, not a script** — weights/thresholds are live-tunable; the risk math is shown on screen.

**[SAY]**
"Four things make us different. **One** — we target the *attacker*: the timer and checkboxes exist to break a scripted phone call, because a script can't survive a forced pause. **Two** — we catch the scam *in progress*: on a call, typing one digit per second is a scammer dictating the code, and we flag it live. **Three** — the app and the SMS state the *same fact* independently, so it can't be hand-waved away. **Four** — it's a real, tunable engine. Let me show you."

---

## Slide 8 — Technical Implementation (real vs. simulated — be honest)

**[ON SLIDE]**
- **Stack:** React + Vite · Tailwind CSS v4 · React Router. Client-side, deterministic, no backend.
- **Built & real (the intelligence):** the pure-function risk engine (unit-tested), two-phase scoring, three OTP modes, **live behavioral detection**, dynamic banner + dynamic SMS, visible risk breakdown, **live weights panel** (re-scores in real time).
- **Simulated on purpose (the inputs):** active call · new device · location · time · failed-passwords → **toggles.**
- **Why:** the contribution is the **approach** — *what rich context to use, and how to turn it into an effective, un-ignorable warning.* Real device/geo/call-state APIs plug into the same scoring interface unchanged.

**[SAY]**
"It's a React app styled as the eSewa mobile app, with a **unit-tested rule engine** at its core — so the demo scenarios are exact, not lucky. I want to be transparent about what's real and what's simulated. The **intelligence is real and built**: the scoring, the escalation, the live behavioral detection, the dynamic messaging. The **environmental inputs** — active call, device, location — are **simulated toggles, on purpose.** Our focus isn't re-implementing telephony APIs; it's the *approach* — which signals matter and how to turn them into a warning users actually heed. Those real signals slot straight into the same interface."

---

## Slide 9 — The Demo (Show, Don't Tell)

**[ON SLIDE]**
- **Act 1 — Login:** safe → straight in. Risky (new device + city + failed passwords) → red takeover + login OTP.
- **Act 2 — Payment:** Rs. 500 → frictionless. Rs. 50,000 on a call → red Intervention.
- **Live catch:** type the OTP one digit per second on a call → escalates to red **in front of you.**
- **The wow:** drag a weight up → the *same* screen goes Stealth → Caution → Intervention, live.

**[SAY / run the demo — short version, ~3–4 min]**
> 1. **Stealth** — clean login (no OTP) + Rs.500 payment. *"Authentication happens twice — login and pay. Both frictionless when I'm safe."*
> 2. **Caution** — active call → amber login OTP + acknowledge. *"Mildly risky — green breaks to amber."*
> 3. **Intervention** — new device + location + failed passwords → red takeover, timer, locked OTP. *"Account takeover. The one screen a scammer can't talk you through."*
> 4. **Payment too** — Rs.50,000 + active call → red transaction OTP. *"Same engine, second moment."*
> 5. **Step-up (say, don't click)** — *"Repeated failed passwords disable the password entirely and ask the user's trusted device to approve — a stolen password can't tap Approve on a phone the attacker doesn't have."*
> 6. **Behavioral catch ⭐** — slow-type the OTP on a call → escalates to red live. *"We caught the scam in progress, from the act itself."*
> 7. **Engine proof ⭐** — open Risk Breakdown (the math), drag a weight up → escalates, uncheck a toggle → de-escalates. *"Not scripted — a live engine, and a fraud-policy console eSewa could tune."*

*(Full beat-by-beat + fallbacks in `demo-script.md`.)*

---

## Slide 10 — Impact & Benefits

**[ON SLIDE]**
- **Before:** one static warning, ignored, on every screen → OTP handed over.
- **After:** safe flows are silent; the *one* dangerous flow is un-ignorable *and* un-scriptable.
- **Fewer OTPs shared** (the challenge's stated impact) — at the exact moment of risk.
- **Zero friction for legitimate users** — no false-alarm fatigue.
- *Illustrative:* if intervention fires on only the ~5% of flows that are risky, 95% of users feel **no change at all** — friction lands only where it protects.

**[SAY]**
"The before-and-after is the whole argument. Today: one warning everywhere, ignored. With Dynamic Alert: silence when you're safe, and an un-ignorable, un-scriptable intervention when you're not. That means **fewer OTPs shared, with zero extra friction for honest users.** I'm not going to invent precise numbers — but directionally, the friction only ever lands on the risky minority, which is the entire point."

---

## Slide 11 — Feasibility & What's Next *(merged: feasibility + go-live + roadmap)*

**[ON SLIDE]**
- **Feasible today:** lightweight, deterministic rule engine that *wraps* the existing OTP screen — the three modes are UI states, not a re-architecture. Runs client- or server-side.
- **Scales by signal:** real device fingerprinting, geo-IP, velocity / impossible-travel, call-state APIs all plug into the same scoring interface.
- **Tunable policy:** the weights panel *is* a fraud-policy console for eSewa's risk team.
- **Go-live:** **Pilot → Validate → Improve → Scale** (not all-at-once).
- **Roadmap:** **30d** real device + geo signals, A/B thresholds · **3m** velocity detection + "you may have avoided a scam" outcome screen · **6m** ML-tuned weights from real fraud data · **12m** shared risk spine across login / payments / KYC.

**[SAY]**
"This is feasible *now* — it wraps the existing OTP flow; the modes are just UI states. As real signals come online — device, geo, velocity — they plug into the same scorer without touching the UI. I'd roll it out as a **pilot, validate, then scale.** Near-term: wire real signals and A/B the thresholds. Long-term: the engine becomes a shared risk spine across all of eSewa's authentication moments, tuned by real fraud outcomes."

---

## Slide 12 — Risks & Mitigation

**[ON SLIDE]**
- **Over-warning → new habituation.** → Stealth-first; intervention is deliberately rare.
- **False positives frustrate users.** → Tunable weights/thresholds; behavioral signals *add*, never fire alone.
- **Accessibility / genuine slow typers.** → Slow-dictation needs an *active call* + slow gaps together; it raises a check, never hard-blocks — and an honest user can still confirm and proceed.
- **Real signal quality.** → Phased rollout; weight low-confidence signals lightly.

**[SAY]**
"The biggest risk is ironic — over-warning would *recreate* the habituation we're solving. That's exactly why we lead with Stealth and keep Intervention rare. And on accessibility: a genuinely slow typer — say an older user being legitimately helped — only trips the dictation flag if they're *also* on an active call, and even then it asks them to confirm rather than locking them out. The tunable weights let eSewa dial all of this to their real population."

---

## Slide 13 — Key Takeaways & Thank You

**[ON SLIDE]**
- **The problem is real:** static warnings are dead — habituation + predictability.
- **The solution works:** rare, contextual, un-scriptable — *and it's built and demoable.*
- **The impact is significant:** fewer OTPs shared, zero friction for honest users — driven by the **active-call + live-escalation** features.
- ---
- **Dynamic Alert** · Team Dynamic Alert — Shiva Sagar Yadav · eSewa × WWF Hackathon 2026
- Contact: **[your contact]** · *Questions?*

**[SAY]**
"Three things to remember. **The problem is real** — static warnings are dead. **The solution works** — rare, contextual, impossible to script through, and you just watched it react *live*, not a mockup. And **the impact is real** — especially the active-call detection and live escalation, which catch the scam in the one moment that matters. Solo-built, end to end. Thank you — I'd love your questions."

---

## Appendix — Anticipated Q&A

- **"Isn't the timer just friction users hate?"** Only in the rare high-risk case — 95% of flows are Stealth, no friction. The friction is *aimed at the attacker's script*, not the user.
- **"How do you get real device/location/call data?"** Today they're simulated toggles — I'm upfront about that. The *intelligence* is real; production signals plug into the same interface. Our contribution is the approach, not re-building telephony.
- **"What stops false positives?"** Live-tunable weights + thresholds, and behavioral signals only *add* to risk — none fire on their own.
- **"Why guard login too, not just payment?"** Account-takeover strikes at login; payment scams strike at the transfer. "During authentication" means both — one engine guards both.
- **"What if a genuine user types slowly / is being legitimately helped?"** The dictation flag needs an active call *and* slow gaps together, and it never hard-blocks — they confirm and proceed. Weights are tunable to the real population.
- **"You're solo — can you execute?"** I architected, engineered, and designed the whole thing, and unit-tested the engine so the demo is deterministic. What you saw is the execution.
- **"What's genuinely built vs simulated?"** Built: full app, two-phase tested engine, three modes, live behavioral detection, dynamic SMS, risk breakdown, live weights. Simulated on purpose: the environmental conditions we can't produce in a demo room.
