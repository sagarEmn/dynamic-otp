const formatAmount = (amount) => {
  const value = Number(amount) || 0;
  return value.toLocaleString("en-IN");
};

const summarizeSignals = (firedSignals) => {
  if (!firedSignals?.length) return "";
  const labels = firedSignals.map((signal) => signal.label);
  return labels.join(", ");
};

// The on-screen banner already lists the fired signals (active call, unusual
// location, etc.), so the SMS deliberately does NOT repeat them — it focuses on
// the transaction facts (amount + recipient) and the core anti-fraud warning.
export const buildSmsMessage = ({ tier, transaction, otp }) => {
  const amount = formatAmount(transaction?.amount);
  const payee = transaction?.payeeName || transaction?.payeeId || "recipient";

  if (tier === "caution") {
    return `eSewa code: ${otp} for Rs. ${amount} to ${payee}. Share with no one.`;
  }

  if (tier === "intervention") {
    return `eSewa code: ${otp} — Rs. ${amount} to ${payee}. eSewa will NEVER call or ask for this code. If someone is guiding you, STOP.`;
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
