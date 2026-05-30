const SIGNAL_FRAGMENTS = {
  highValue:         "a large payment",
  veryHighValue:     "a very large payment",
  newPayee:          "to someone you haven't paid before",
  activeCall:        "while on an active phone call",
  newDevice:         "from an unrecognized device",
  unusualLocation:   "from an unusual location",
  unusualTime:       "at an unusual hour",
};

const BEHAVIORAL_SIGNALS = new Set([
  "paste", "noPause", "tooFast", "tooManyAttempts",
]);

export function buildBannerMessage(tier, firedSignals) {
  if (tier === "stealth") return "Never share your OTP with anyone.";

  const preOtp = firedSignals.filter((s) => !BEHAVIORAL_SIGNALS.has(s.id));
  const behavioral = firedSignals.filter((s) => BEHAVIORAL_SIGNALS.has(s.id));

  const hasBehavioral = behavioral.length > 0;

  if (hasBehavioral) {
    return "Suspicious behaviour detected. If someone is guiding you to enter this OTP, stop now and end the call.";
  }

  const ids = preOtp.map((s) => s.id);
  const fragments = ids.map((id) => SIGNAL_FRAGMENTS[id]).filter(Boolean);

  if (!fragments.length) return "This transaction has been flagged. Please verify before proceeding.";

  if (tier === "caution") {
    return `This is ${fragments.join(", ")}. Please verify the details before proceeding.`;
  }

  if (tier === "intervention") {
    const factLine = `This is ${fragments.join(", ")}.`;
    return `${factLine} Fraudsters use this exact pattern. Do not share your OTP with anyone on the phone.`;
  }

  return "Please verify before proceeding.";
}
