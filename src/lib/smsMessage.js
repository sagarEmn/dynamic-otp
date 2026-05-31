const formatAmount = (amount) => {
  const value = Number(amount) || 0;
  return value.toLocaleString("en-IN");
};

// Illustrative origin details for the alert clauses. In a real system these
// would come from IP/geo + device fingerprinting; here they're fixed demo
// values — swap freely.
const DETECTED_CITY = "Dhulikhel";
const DETECTED_DEVICE = "Samsung Galaxy A14";
// Static demo timestamp so the SMS reads naturally without tracking the live
// clock. Reads as an odd-hour sign-in (reinforces the unusual-time signal).
const DETECTED_TIME = "2:14 AM";

// Build a short "where/when from" clause from the ORIGIN signals only (new
// device, unusual location, unusual hour) — the ones that tell the user where
// and when the attempt is coming from. We deliberately leave out the call/
// behavioral signals (the on-screen banner already lists everything); the SMS
// just gains the origin context so a user reading it on their phone can spot
// "that's not me / not here / not now".
const originClause = (firedSignals = []) => {
  const has = (id) => firedSignals.some((s) => s.id === id);
  const newDevice = has("newDevice");
  const unusualLocation = has("unusualLocation");
  const unusualTime = has("unusualTime");
  const location = `an unusual location (${DETECTED_CITY})`;

  // "where" part — device and/or location.
  let where = "";
  if (newDevice && unusualLocation) where = ` from a new device in ${location}`;
  else if (newDevice) where = " from a new device";
  else if (unusualLocation) where = ` from ${location}`;

  // "when" part — unusual hour. Appended to a "where" with a comma, or stands
  // alone (no leading comma) when it's the only origin signal.
  if (!unusualTime) return where;
  return where ? `${where}, at an unusual hour` : " at an unusual hour";
};

// The closing anti-fraud warning. "If someone is guiding you, STOP" only makes
// sense when an active call is detected (the scammer is live on the phone).
// Without a call, the threat is account-takeover, so we frame it that way.
const closingWarning = (firedSignals = []) => {
  const onCall = firedSignals.some((s) => s.id === "activeCall");
  return onCall
    ? "eSewa will NEVER call or ask for this code. If someone is guiding you, STOP."
    : "Someone may be trying to access your account. eSewa will NEVER ask for this code.";
};

// The on-screen banner already lists the fired signals (active call, unusual
// location, etc.). The SMS focuses on the transaction facts (amount + recipient)
// plus a short ORIGIN clause (new device / unusual location) so the user can
// tell where the attempt is coming from — and the core anti-fraud warning.
export const buildSmsMessage = ({ tier, transaction, firedSignals, otp }) => {
  const amount = formatAmount(transaction?.amount);
  const payee = transaction?.payeeName || transaction?.payeeId || "recipient";
  const origin = originClause(firedSignals);

  if (tier === "caution") {
    return `eSewa code: ${otp} for Rs. ${amount} to ${payee}${origin}. Share with no one.`;
  }

  if (tier === "intervention") {
    return `eSewa code: ${otp} — Rs. ${amount} to ${payee}${origin}. ${closingWarning(firedSignals)}`;
  }

  return `eSewa code: ${otp}. Never share it with anyone.`;
};

// Concrete "who/where/when" line for a risky sign-in. Leads with the device,
// location and time so a user reading it on their phone can immediately tell
// "that's not my phone / not my city / not now" — far more attention-catching
// than a generic "unusual sign-in". Falls back to whatever context is present.
const signInDetails = (firedSignals = []) => {
  const has = (id) => firedSignals.some((s) => s.id === id);
  const parts = [];
  // Device: a new device names the suspicious one; otherwise it's still useful
  // context on a brute-force/failed-password alert.
  if (has("newDevice") || has("failedAttempts")) parts.push(DETECTED_DEVICE);
  if (has("unusualLocation")) parts.push(DETECTED_CITY);
  if (has("unusualTime")) parts.push(DETECTED_TIME);
  return parts.join(" · ");
};

// Login-phase SMS — no transaction context yet, so it speaks to the sign-in
// itself. For risky sign-ins it leads with concrete device · location · time
// so the user can spot an attempt that isn't theirs at a glance.
export const buildLoginSmsMessage = ({ tier, firedSignals = [], otp }) => {
  const details = signInDetails(firedSignals);
  const detailLine = details ? ` Attempt from ${details}.` : "";

  if (tier === "caution") {
    return `eSewa OTP: ${otp}.${detailLine} If this wasn't you, do not share this code.`;
  }

  if (tier === "intervention") {
    return `eSewa: unusual sign-in blocked.${detailLine} Your code is ${otp}. ${closingWarning(firedSignals)}`;
  }

  return `eSewa OTP: ${otp}. Never share it with anyone.`;
};
