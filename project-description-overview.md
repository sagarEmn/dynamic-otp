**What I'm Building in One Line** A React web app simulating an eSewa-like OTP authentication flow where warning intensity dynamically escalates based on real-time risk signals detected before and during the OTP screen.

---

**Pages**

**Page 1 — Transaction Form**

- Amount input, payee name input
- Toggles: "Simulate active phone call", "Simulate new device"
- Unusual time auto-detected from system clock
- Proceed button triggers risk scoring, moves to processing

**Page 2 — Processing Screen**

- 1.5 second loading animation: "Verifying transaction security..."
- Risk engine computes score here before next screen loads
- Makes scoring feel real and deliberate

**Page 3 — OTP Screen (Core Feature)** Three completely different UI states:

- Stealth (low risk): clean minimal UI, subtle banner, zero friction
- Caution (medium risk): yellow/amber theme, dynamic message based on which specific signals fired, user must acknowledge before proceeding
- Intervention (high risk): red/dark theme, full attention takeover, countdown timer, confirmation checkboxes, long dynamic message, OTP input hidden until timer ends and checkbox confirmed

**Page 4 — Success Screen**

- Transaction confirmed, simple completion state

**SMS Popup — Overlay Component (NOT a routed page)**

- Renders *on top of* Page 3 (OTP Screen), not as a separate screen — simulates the OTP SMS arriving on the phone while the user is on the OTP screen. Both layers visible at once (this is the point of the two-layer design, see below).
- Style: Android-style heads-up notification / message bubble sliding from the top. Sender shown as "eSewa".
- Contains the OTP code + **dynamic, fact-driven** warning text. The message is assembled from the signals that actually fired (amount, payee, location, time), so it differs per transaction. Context scales with tier — Stealth carries none (stay frictionless), Caution adds the single anomaly, Intervention stacks all fired facts + an anti-coercion line. SMS = terse facts; the app UI carries the rich explanation (different voices, not redundant):
  - Stealth: "eSewa code: 482913. Never share it with anyone."
  - Caution: "eSewa code: 482913 for Rs. 25,000 to a first-time recipient. Share with no one."
  - Intervention: "eSewa code: 482913 — Rs. 50,000 to a NEW number, from an unusual location, 2:14 AM. eSewa will NEVER call or ask for this code. If someone is guiding you, STOP."
- Note: only **pre-OTP** context can appear in the SMS (transaction + environment). Behavioral signals happen after the OTP is sent, so they affect the app UI re-escalation only — never the SMS.

---

**Risk Engine**

- Rule-based scoring: each signal adds weighted points, runs before OTP screen renders
- Thresholds: 0-30 low, 31-60 medium, 61+ high
- Score and triggered signals passed via React Context to OTP screen
- Fast, synchronous — result ready before OTP screen renders

---

**Risk Signals**

Transaction anomaly detection:

- High value: amount exceeds threshold (e.g. Rs. 10,000)
- New payee: recipient is first-time
- Unusual time: transaction at odd hours (auto-detected from clock)

Environmental context:

- Active call status (simulated toggle)
- Device integrity (simulated toggle for new/unrecognized device)
- Unusual Location or Actual Location so that scammer's can't scam easily without knowing the user's latest location. 

---

**Behavioral Signals (detected on OTP screen)**

- Paste vs manual entry on OTP field
- Typing speed — unusually fast entry flagged
- Did user pause to read the warning or start typing immediately
- Too many incorrect OTP attempts

---

**OTP Warning Modes**

Stealth:

- Goal: zero friction
- Design: clean, minimal
- Message: "Never share your OTP with anyone"

Caution:

- Goal: awareness
- Design: yellow/amber theme
- Message: dynamic, based on which signals fired
- Friction: user must acknowledge/confirm before proceeding

Intervention:

- Goal: stop user's flow and break fraudster's script
- Design: red/dark theme, full attention
- Message: dynamic, interactive, verbose
- Friction: countdown timer, confirmation checkboxes, long forced read, OTP input locked until all conditions met

---

**Two Intervention Layers**

1. App UI — OTP screen transforms entirely based on risk
2. SMS layer — simulated OTP message popup with dynamic text (e.g. high risk: "eSewa will NEVER call and ask for this code. Large transfer to new recipient detected.")

---

**What's Simulated vs Built**

- Built: full React app, risk scoring engine, all three OTP screen modes, behavioral detection, dynamic SMS popup
- Simulated: active call (toggle), new device (toggle), SMS delivery (mock popup), OTP verification (any 6 digits pass)

---

**Demo Scenarios**

- Scenario A: Rs. 500, known payee, no call → Stealth mode. "Legitimate users face zero friction."
- Scenario B: Rs. 25,000, new payee, no call → Caution mode. "System detects unusual patterns."
- Scenario C: Rs. 50,000, new payee, active call ON → Intervention mode. "High-risk context triggers maximum friction."

