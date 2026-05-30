const formatAmount = (amount) => {
  const value = Number(amount) || 0;
  return value.toLocaleString("en-IN");
};

const summarizeSignals = (firedSignals) => {
  if (!firedSignals?.length) return "";
  const labels = firedSignals.map((signal) => signal.label);
  return labels.join(", ");
};

// Build a short "where from" clause from the ORIGIN signals only (new device,
// unusual location) — the ones that tell the user where the attempt is coming
// from. We deliberately leave out the call/behavioral signals (the on-screen
// banner already lists everything); the SMS just gains the origin context so a
// user reading it on their phone can spot "that's not me / not here".
const originClause = (firedSignals = []) => {
  const has = (id) => firedSignals.some((s) => s.id === id);
  const newDevice = has("newDevice");
  const unusualLocation = has("unusualLocation");

  if (newDevice && unusualLocation) return " from a new device in an unusual location";
  if (newDevice) return " from a new device";
  if (unusualLocation) return " from an unusual location";
  return "";
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
    return `eSewa code: ${otp} — Rs. ${amount} to ${payee}${origin}. eSewa will NEVER call or ask for this code. If someone is guiding you, STOP.`;
  }

  return `eSewa code: ${otp}. Never share it with anyone.`;
};

// Login-phase SMS — no transaction context yet, so it speaks to the login
// itself and the environmental signals that fired.
export const buildLoginSmsMessage = ({ tier, firedSignals, otp }) => {
  const signalSummary = summarizeSignals(firedSignals);

  if (tier === "caution") {
    const details = signalSummary ? ` We noticed: ${signalSummary}.` : "";
    return `eSewa OTP: ${otp}.${details} If this wasn't you, do not share it.`;
  }

  if (tier === "intervention") {
    const details = signalSummary ? ` Detected: ${signalSummary}.` : "";
    return `eSewa OTP: ${otp} — unusual sign-in attempt.${details} eSewa will NEVER call or ask for this code. If someone is guiding you, STOP.`;
  }

  return `eSewa OTP: ${otp}. Never share it with anyone.`;
};
