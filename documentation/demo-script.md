# Demo Script — Dynamic Alert

**Creds:** password `jjjj` · OTP `123456`
**Arc:** silent → notice → takeover → guard-the-payment-too → lock-out-the-attacker → catch-it-live → engine proof. Each beat more dramatic than the last.

> **The thesis to land out loud (say it on Beat 1):** "Authentication happens twice — when you log in, and when you pay. We guard **both** moments with one engine. Most solutions only watch the payment." This is the answer to the challenge's "during authentication" wording — make sure a judge hears it.

---

> **Short version (~3–4 min): all 7 beats, kept tight.** One action + one line each. Beat 5 is the least important — say it, don't click it. Fallback options + reference scores are at the bottom.

## Beat 1 — Stealth (don't punish honest users)
- Clean login → straight in, **no OTP**. Then Rs.500 → Proceed → clean green OTP.
  > "Authentication happens twice — login and payment. We guard both. My own login, my normal payment — zero friction. Safe users are never interrupted."

## Beat 2 — Caution (notice & slow down)
- Toggle **Active phone call** → log in → **amber** OTP + acknowledge checkbox.
  > "On a call — mildly risky. Green breaks to amber, and you confirm before the code unlocks."

## Beat 3 — Intervention (break the script) ⭐
- Toggle **New device + Unusual location + Failed passwords** → log in → **red takeover**: timer, checkboxes, OTP locked.
  > "Stolen password, strange device, strange city — account takeover. A forced pause and active confirmations: the one screen a scammer can't talk you through."

## Beat 4 — Guard the payment too ⭐
- Clean login → **Rs.50,000** chip + **Active phone call** on → **Proceed** → **red transaction OTP** (SMS names amount + recipient).
  > "Same engine, second moment. A big transfer on a call escalates exactly like the login did — both ends are guarded."

## Beat 5 — Lock out the attacker *(say it, don't click)*
- One line over the failed-password state:
  > "And repeated failed passwords go further — we disable the password entirely and ask the user's *trusted device* to approve. A stolen password can't tap Approve on a phone the attacker doesn't have."

## Beat 6 — Behavioral catch (showstopper) ⭐⭐
- On the amber (active-call) OTP, **type one digit per second** → escalates to **red live**.
  > "I'm typing like someone's reading me the code on the phone. Slow, dictated entry on a call — we catch the scam *in progress*, from the act itself, not metadata."

## Beat 7 — Engine proof (kills "is it scripted?") ⭐
- Open **Risk Breakdown** (the math), then on **Risk Weights** drag a slider up → escalates; uncheck a toggle → de-escalates, **live**.
  > "Not scripted. The same screen re-scores in real time, up and down. A live engine — and this panel is a fraud-policy console eSewa could tune."

---

## Close (10 sec)
> "A warning everyone ignores is useless. We make the OTP warning **rare, contextual, and impossible to script through** — so the one moment that matters finally gets noticed."

---

## Pre-pitch check (browser, ~10 min)
1. The 6 *clicked* beats render right (color / timer / checkboxes / escalation). Beat 5 is spoken — but have the failed-password lock state ready on screen in case a judge asks to see it.
2. Beat 4 (transaction): Rs.50k + active call → **red** transaction OTP; SMS names amount + recipient.
3. Beat 6: slow typing flips to red; fast typing shows the **yellow** banner.
4. Beat 7: Risk Breakdown shows the math; slider up escalates, unchecking a toggle de-escalates — **live on the OTP screen**.
5. Reset between runs: Success → Done → fresh login; clear all toggles (esp. failed-passwords + active call).
6. SMS slides in, text matches scenario, doesn't block the OTP boxes.

## Fallbacks (if a beat misbehaves)
- **Beat 2/4 too tame?** Lighter caution = Rs.25,000 + Unusual time → amber.
- **Beat 5 asked to show live?** Toggle **Repeated failed passwords** → Log in (no password) → password disables → **Approve this sign-in** → login OTP. Works regardless of tier.
- **Beat 6 won't trigger?** Slow-dictation needs **active call on** + ~1s gaps between digits; too-fast needs all 6 under ~1.5s.

## Scores (for reference)
- Login: clean 0 · active call 36 (caution) · unusual time 36 (caution) · failed passwords alone 36 (caution) · device+location+failed 86 (intervention)
- Transaction: Rs.500 = 0 · Rs.25k+time 45 (caution) · Rs.50k+call 81 (intervention)
- Behavioral on caution: +slow-dictation → 61 (intervention) · +too-fast → 51 (caution, amber)
