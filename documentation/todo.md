# TODO & Demo Checklist

> Status as of last session: the two-act authentication system (login + transaction) is **built, tested, and building clean**. All 9 engine tests pass; the navigation graph is complete and loops back to login. What remains is **visual verification** (things only your eyes can confirm) and **optional future features**.

---

## ✅ Already Verified (by code + tests, not eyes)

- Risk engine: all 9 tests pass (`node src/lib/riskEngine.test.mjs`)
- `npx vite build` is clean
- Navigation graph connects with no dead ends; `Success → resetFlow → /` (login) closes the loop
- Back buttons wired on login-OTP, Send Money, and transaction-OTP
- Docs (`project-narrative.md`, `implementation-plan.md`) match the code

---

## 🔍 PART 1 — Live Click-Through (DO THIS FIRST, needs your eyes)

Run `npm run dev`, open the app, and walk every path. Tick each as you confirm it.

### Act 1 — Login (`/`)
- [x] **Login Scenario A (Stealth):** click it → log in with password `password` → goes **straight to Send Money** (no OTP, no friction).
- [x] **Login Scenario B (Caution):** click it → log in → shows **amber** login-OTP screen with acknowledge checkbox → enter `123456` → reaches Send Money.
- [ ] **Login Scenario C (Intervention):** click it → log in → shows **red/dark** takeover with countdown timer + checkbox, OTP locked until both done → verify → reaches Send Money.
- [ ] **Manual failed-password path:** type a wrong password twice, then `password` → confirm the failed-attempts signal pushes the tier up.
- [ ] **Wrong password message** shows and is clear.
- [ ] **Back button** on the login-OTP returns to the credentials stage (fields intact, OTP cleared).

### Act 2 — Transaction (`/send`)
- [ ] **Transaction Scenario A (Stealth):** clean OTP screen, subtle banner, no friction → verify `123456` → Success.
- [ ] **Transaction Scenario B (Caution):** amber theme, dynamic banner naming the fired signals, acknowledge-to-proceed.
- [ ] **Transaction Scenario C (Intervention):** red takeover, timer, checkboxes, locked OTP.
- [ ] **Scenario fills form instantly** (no refresh needed) and the **slot-in animation** plays on amount/eSewa ID.
- [ ] **Behavioral re-escalation:** in a Caution transaction, **paste** into the OTP field → confirm it escalates to Intervention live.
- [ ] **Back button** on the OTP returns to Send Money.

### SMS popup (both acts)
- [ ] Slides in ~1.5s after the OTP screen loads, from the top.
- [ ] Text is **different per tier** and **per phase** (login SMS talks about sign-in; transaction SMS names amount + signals).
- [ ] **Tap to dismiss** swipes it off to the right smoothly.
- [ ] It does **not** block clicking the OTP boxes.

### Risk Breakdown panel (on OTP screens)
- [ ] Collapsed by default; expands to show each fired signal + points + total + tier.
- [ ] Numbers match the scenario (e.g. transaction C = 100 → HIGH).

### Live Risk Weights panel (right side)
- [ ] On the **login** screen it shows environmental + failed-password weights (NO amount weights).
- [ ] On the **transaction** screen it shows amount + environmental weights.
- [ ] Dragging a slider **re-scores live** — e.g. raise a weight and watch a Caution become Intervention on the next run.
- [ ] Header reads "Risk weights · Login" / "· Transaction" correctly.

### Simulation panel (left side)
- [ ] Shows the 4 environmental toggles always; shows **"Repeated failed passwords"** only on login.
- [ ] Toggling a control affects the next scored run.

### Layout / polish (eyes only)
- [ ] Phone stays centered; left and right panels at the screen edges, equal feel.
- [ ] Login screen looks like real eSewa (logo block, spacing, weights).
- [ ] No text overflow, no misaligned labels, no clipped panels at your screen size.
- [ ] Full loop: Success → "Done" → lands back on a **fresh** login (toggles/results reset).

---

## 🟡 PART 2 — Quick Polish (if time before demo)

- [ ] **Login screen visuals** — the placeholder "e" logo box is plain; make it feel properly eSewa (real logo / nicer header).
- [ ] **Intervention "Why am I seeing this?"** explainer line — plain-language education on the red screen (hits the "user awareness" impact).
- [ ] **Rehearse the spoken demo** — one clean run of all 6 scenarios with the lines from `project-narrative.md` §12.

---

## 🟢 PART 3 — Future Features (after the 2-hour reset / post-hackathon)

- [ ] **"You may have avoided a scam" exit screen** — backing out of an Intervention routes to a positive outcome screen instead of proceeding. Closes the narrative, ties to "reduced OTP sharing" impact.
- [ ] **Persist tuned weights** in localStorage so admin changes survive a refresh.
- [ ] **Standalone `/admin` route** — a separate internal-styled risk-policy dashboard (distinct from the live side panel), for the "configurable fraud-policy tool" product story.
- [ ] **More login signals** — impossible-travel (location change too fast), time-since-last-login, known-vs-new IP.
- [ ] **Unusual-amount signal** — flag a payment far outside the user's normal pattern (needs a fake "history"), distinct from flat high-value.
- [ ] **README** — "what this is / how to run / demo script" for judges and teammates.
- [ ] **Sound/haptic cue** on Intervention (optional drama for the demo).
- [ ] **Accessibility pass** — focus order, aria labels on the OTP boxes and toggles.

---

## Demo-day reminders
- Demo password is **`password`**; demo OTP is **`123456`**.
- If demoing at odd hours (11pm–5am), the **unusual-time** signal fires automatically from the clock — account for it or use the toggle deliberately.
- Run `node src/lib/riskEngine.test.mjs` once before presenting to confirm the engine still scores A/B/C correctly.
