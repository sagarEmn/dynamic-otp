// Risk engine configuration — weights & thresholds.
// Kept separate so the Admin Dashboard (Phase 5) can read/override these
// without touching the engine logic. Defaults from documentation/spec-rules.md.
//
// NON-NEGOTIABLE: the three demo scenarios must land in their tiers every time.
//   A: Rs.500, known, no call            -> 0   -> stealth
//   B: Rs.25,000, new payee, no call      -> 55  -> caution   (30 + 25)
//   C: Rs.50,000, new payee, active call  -> 90  -> intervention (30 + 10 + 25 + 25)

export const DEFAULT_CONFIG = {
  // --- Pre-OTP signal weights ---
  weights: {
    highValue: 30, // amount > highValueThreshold
    veryHighValue: 10, // bonus when amount > veryHighValueThreshold
    newPayee: 25, // recipient not in known list
    activeCall: 25, // sim toggle
    newDevice: 20, // sim toggle
    unusualLocation: 20, // sim toggle
    unusualTime: 10, // system clock 23:00–05:00
  },

  // --- Behavioral signal weights (added live on the OTP screen) ---
  behavioralWeights: {
    paste: 20, // primary, reliable
    noPause: 15, // typing starts < 2s after screen load
    tooFast: 15, // 6 digits entered under ~1.5s
    tooManyAttempts: 20, // 3+ wrong OTP submissions
  },

  // --- Thresholds ---
  amount: {
    highValueThreshold: 10000,
    veryHighValueThreshold: 40000,
  },

  // --- Tier cutoffs (inclusive lower bound) ---
  tiers: {
    cautionMin: 31, // 0–30 stealth, 31–60 caution, 61+ intervention
    interventionMin: 61,
  },
};
