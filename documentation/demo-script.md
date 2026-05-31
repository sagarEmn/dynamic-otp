# Demo Script — Dynamic Alert

**Creds:** password `jjjj` · OTP `123456`
**Arc:** silent → notice → takeover → catch-it-live → engine proof. Each beat more dramatic than the last.

---

## Beat 1 — Stealth (don't punish honest users)
- **Login:** no toggles → log in → straight into app, **no OTP**.
  > "My own login — zero friction. The mode most solutions forget."
- **Transaction:** Rs.500 → Proceed → clean green OTP screen.
  > "A normal payment, no warning. Safe users never get interrupted — that's the point."

## Beat 2 — Caution (notice & slow down)
- Toggle **Active phone call** → log in → **amber** OTP, one acknowledge checkbox.
  > "On a call — mildly risky. The calm green breaks to amber. You must confirm before the OTP unlocks."

## Beat 3 — Intervention (break the script) ⭐
- Toggle **New device + Unusual location + Failed passwords** → log in → **red takeover**, 10s timer, checkboxes, OTP locked.
  > "Someone with your password, a strange device, a strange city — account takeover. The green is gone. A forced pause and active confirmations — the one screen a scammer can't smoothly talk you through. Stopped at the door."

## Beat 4 — Behavioral catch (showstopper) ⭐⭐
- On a caution screen (active call), reach the OTP, **type one digit per second**.
  > "Watch — I'm typing like someone's reading me the code on the phone."
  → escalates to red **live**.
  > "Slow, dictated entry on a call. We caught the scam *in progress* — not from metadata, from the act itself."
- *(Bonus: type fast → amber "you're going too fast" + extra checkbox.)*

## Beat 5 — Engine proof (kills "is it scripted?") ⭐
- On **Risk Weights**, drag a slider — or uncheck a toggle while on the OTP screen.
  > "Not a script. I change one weight and the same screen re-scores in real time. A live risk engine — and this panel is a fraud-policy console eSewa's team could tune."

---

## Close (10 sec)
> "A warning everyone ignores is useless. We make the OTP warning **rare, contextual, and impossible to script through** — so the one moment that matters finally gets noticed."

---

## Pre-pitch check (browser, ~10 min)
1. All 5 beats render right (color / timer / checkboxes / escalation).
2. Beat 4: slow typing flips to red; fast typing shows the **yellow** banner.
3. Beat 5: slider/toggle change visibly re-tiers **while on the OTP screen**.
4. Reset: Success → Done → fresh login.
5. SMS slides in, text matches scenario, doesn't block the OTP boxes.

## Scores (for reference)
- Login: clean 0 · active call 36 (caution) · unusual time 36 (caution) · device+location+failed 80 (intervention)
- Transaction: Rs.500 = 0 · Rs.25k+time 45 (caution) · Rs.50k+call 81 (intervention)
- Behavioral on caution: +slow-dictation → 61 (intervention) · +too-fast → 51 (caution, amber)
