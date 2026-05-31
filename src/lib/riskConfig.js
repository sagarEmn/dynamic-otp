// Risk engine configuration — weights & thresholds.
// Kept separate so the Admin Dashboard can read/override these without
// touching the engine logic.
//
// Signals split by phase:
//   Environmental (shared by login + transaction): activeCall, unusualTime.
//   Login-only: newDevice, unusualLocation, failedAttempts.
//   Transaction-only: highValue, veryHighValue.
//
// NON-NEGOTIABLE: the three transaction demo scenarios must land every time.
//   A: Rs.500, no toggles              -> 0   -> stealth
//   B: Rs.25,000, unusual time         -> 45  -> caution      (30 + 15)
//   C: Rs.50,000, active call          -> 81  -> intervention (30 + 15 + 36)

// Tier cutoffs (inclusive lower bound). Defined first so signal weights can be
// derived from them — see activeCall below.
const CAUTION_MIN = 31; // 0–30 stealth, 31–60 caution, 61+ intervention
const INTERVENTION_MIN = 61;

export const DEFAULT_CONFIG = {
  // --- Pre-OTP signal weights ---
  weights: {
    // Transaction-only
    highValue: 30, // amount > highValueThreshold
    veryHighValue: 15, // bonus when amount > veryHighValueThreshold
    // Environmental (shared by login + transaction)
    // Active call sits 5 above the caution threshold so it ALWAYS triggers
    // caution on its own — derived from CAUTION_MIN so it stays correct if the
    // threshold ever changes.
    activeCall: CAUTION_MIN + 5,
    newDevice: 25, // sim toggle — unrecognized device
    unusualLocation: 25, // sim toggle — login/auth from a new city
    unusualTime: 15, // odd hours (toggle or system clock)
  },

  // --- Login-phase signal weights ---
  loginWeights: {
    // 2+ wrong password attempts before success — a brute-force / account-
    // takeover signal. Sits 5 above the caution threshold so it ALWAYS trips
    // caution on its own (and drives the password-lock + device-approval step-
    // up). Derived from CAUTION_MIN so it stays correct if the threshold moves.
    failedAttempts: CAUTION_MIN + 5,
    // Unusual time weighs MORE at login than at transaction: an odd-hour
    // sign-in alone should warrant a login OTP. Derived from CAUTION_MIN so it
    // alone always clears caution. (Transaction keeps the lighter weights.unusualTime.)
    unusualTime: CAUTION_MIN + 5,
  },

  // --- Behavioral signal weights (added live during authentication) ---
  behavioralWeights: {
    paste: 20, // primary, reliable
    noPause: 15, // typing starts < 2s after screen load
    tooFast: 15, // 6 digits entered under ~1.5s
    slowDictation: 25, // ~1s gaps between digits WHILE on a call (being dictated)
    tooManyAttempts: 20, // 3+ wrong OTP submissions
  },

  // --- Thresholds ---
  amount: {
    highValueThreshold: 10000,
    veryHighValueThreshold: 40000,
  },

  // --- Tier cutoffs (inclusive lower bound) ---
  tiers: {
    cautionMin: CAUTION_MIN,
    interventionMin: INTERVENTION_MIN,
  },
};
