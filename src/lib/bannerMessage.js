const SIGNAL_FRAGMENTS = {
  highValue:         "a large payment",
  veryHighValue:     "a very large payment",
  activeCall:        "while on an active phone call",
  newDevice:         "from an unrecognized device",
  unusualLocation:   "from an unusual location",
  unusualTime:       "at an unusual hour",
};

const BEHAVIORAL_SIGNALS = new Set([
  "paste", "noPause", "tooFast", "slowDictation", "tooManyAttempts",
]);

export function buildBannerMessage(tier, firedSignals) {
  const preOtp = firedSignals.filter((s) => !BEHAVIORAL_SIGNALS.has(s.id));
  const behavioral = firedSignals.filter((s) => BEHAVIORAL_SIGNALS.has(s.id));

  const behavioralIds = new Set(behavioral.map((s) => s.id));

  // Behavioral signals are checked FIRST — they describe what's happening
  // *right now* on this screen, and must surface even if the pre-OTP tier was
  // still stealth (e.g. a clean payment where the user then types too fast).

  // The slow, dictated-entry pattern (1s gaps while on a call) is the strongest
  // "someone is reading you the code" tell — call it out directly.
  if (behavioralIds.has("slowDictation")) {
    return "Suspicious behaviour detected. If someone is guiding you to enter this OTP, stop now and end the call.";
  }

  // Superhuman speed gets its own gentle, specific nudge.
  if (behavioralIds.has("tooFast")) {
    return "You're going too fast — slow down and check the recipient and amount.";
  }

  // Any other behavioral signal (paste, noPause, too many attempts).
  if (behavioral.length > 0) {
    return "Suspicious behaviour detected. If someone is guiding you to enter this OTP, stop now and end the call.";
  }

  // No behavioral signal — fall back to the pre-OTP tier message.
  if (tier === "stealth") return "Never share your OTP with anyone.";

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

// The TONE to render the banner in. Behavioral signals lift the tone to at
// least caution (amber) even if the pre-OTP tier was stealth — so "you're
// going too fast" shows in amber, and the dictation pattern in red. This keeps
// the banner colour in sync with the live behavioral warning text above.
export function bannerTone(tier, firedSignals = []) {
  const ids = firedSignals.map((s) => s.id);
  if (ids.includes("slowDictation")) return "intervention";
  if (BEHAVIORAL_SIGNALS_HAS(ids) && tier === "stealth") return "caution";
  return tier;
}

const BEHAVIORAL_SIGNALS_HAS = (ids) =>
  ids.some((id) => BEHAVIORAL_SIGNALS.has(id));
