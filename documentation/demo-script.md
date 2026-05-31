# Demo Script — Dynamic Alert

**Creds:** password `jjjj` · OTP `123456`
**Arc:** silent → notice → takeover → guard-the-payment-too → lock-out-the-attacker → catch-it-live → engine proof. Each beat more dramatic than the last.

> **The thesis to land out loud (say it on Beat 1):** "Authentication happens twice — when you log in, and when you pay. We guard **both** moments with one engine. Most solutions only watch the payment." This is the answer to the challenge's "during authentication" wording — make sure a judge hears it.

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

## Beat 4 — Guard the payment too (transaction phase) ⭐
- Log in clean → on **Send Money**, tap the **Rs.50,000** chip → keep **Active phone call** on → **Proceed**.
  > "Same engine, second moment. A big transfer while you're on a call — the classic scam-in-progress."
  → processing → **red transaction OTP**: timer, checkboxes, OTP locked, and an SMS naming the **amount + recipient**.
  > "Login wasn't a one-off. The payment screen escalates the same way — so the attacker is stopped whether they're hijacking the account or pushing a transfer."
- *(Lighter option: Rs.25,000 + Unusual time → amber caution OTP.)*

## Beat 5 — Lock out the attacker (step-up) ⭐
- Toggle **Repeated failed passwords** → click **Log in** (no password needed).
  > "Someone's been guessing the password. So we stop trusting the password entirely."
  → **password field disappears**, amber "Password login disabled" notice.
- Lands on the **trusted-device approval** screen.
  > "We alert a device the real owner already trusts. An attacker with a stolen password can't tap Approve on a phone they don't have."
- Tap **Approve this sign-in** → confirms → login OTP.
- Point at the **SMS** when it pops:
  > "And the alert names the suspicious device, city, and time — *Samsung Galaxy A14 · Dhulikhel · 2:14 AM*. The owner reads that and instantly knows 'that's not me.'"

## Beat 6 — Behavioral catch (showstopper) ⭐⭐
- On a caution screen (active call), reach the OTP, **type one digit per second**.
  > "Watch — I'm typing like someone's reading me the code on the phone."
  → escalates to red **live**.
  > "Slow, dictated entry on a call. We caught the scam *in progress* — not from metadata, from the act itself."
- *(Bonus: type fast → amber "you're going too fast" + extra checkbox.)*

## Beat 7 — Engine proof (kills "is it scripted?") ⭐
- Open the **Risk Breakdown** panel on the OTP screen first.
  > "Every point is accountable — here's exactly which signals fired and what each one added up to."
- Then on **Risk Weights**, drag a slider up → screen escalates; **uncheck a toggle** → it de-escalates, live.
  > "Not a script. I change one weight and the same screen re-scores in real time — up *and* down. A live risk engine, and this panel is a fraud-policy console eSewa's team could tune."

---

## Close (10 sec)
> "A warning everyone ignores is useless. We make the OTP warning **rare, contextual, and impossible to script through** — so the one moment that matters finally gets noticed."

---

## Pre-pitch check (browser, ~10 min)
1. All 7 beats render right (color / timer / checkboxes / escalation).
2. Beat 4 (transaction): Rs.50k + active call → **red** transaction OTP; SMS names amount + recipient. (Rs.25k + time → amber.)
3. Beat 5: failed-passwords toggle → Log in disables the password field; Approve advances to OTP; SMS names device · city · time.
4. Beat 6: slow typing flips to red; fast typing shows the **yellow** banner.
5. Beat 7: Risk Breakdown shows the math; slider up escalates, unchecking a toggle de-escalates — **live on the OTP screen**.
6. Reset between runs: Success → Done → fresh login; clear all toggles (esp. failed-passwords + active call).
7. SMS slides in, text matches scenario, doesn't block the OTP boxes.

## Scores (for reference)
- Login: clean 0 · active call 36 (caution) · unusual time 36 (caution) · **failed passwords alone 36 (caution)** · device+location+failed 86 (intervention)
- Transaction: Rs.500 = 0 · Rs.25k+time 45 (caution) · Rs.50k+call 81 (intervention)
- Behavioral on caution: +slow-dictation → 61 (intervention) · +too-fast → 51 (caution, amber)

> **Note:** Beat 4 (failed passwords) drives the step-up flow regardless of tier — clicking Log in with that toggle on always locks the password and opens trusted-device approval.
