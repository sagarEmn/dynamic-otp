// The brain. Pure functions — input in, { score, firedSignals, tier } out.
// Pure = trivially testable against the demo scenarios (see riskEngine.test.js
// and the verification table in documentation/spec-rules.md).

import { DEFAULT_CONFIG } from "./riskConfig.js";

// Human-readable labels for each signal id (used by the breakdown panel
// and the dynamic warning messages). Single source of truth.
export const SIGNAL_LABELS = {
  // transaction-only
  highValue: "High value transaction",
  veryHighValue: "Very high value",
  // environmental (shared by login + transaction)
  activeCall: "Active phone call",
  newDevice: "New / unrecognized device",
  unusualLocation: "Unusual location",
  unusualTime: "Unusual time (odd hours)",
  // login-only
  failedAttempts: "Repeated failed password attempts",
  // behavioral (during OTP entry)
  paste: "OTP pasted (not typed)",
  noPause: "No pause to read warning",
  tooFast: "Superhuman typing speed",
  slowDictation: "Slow, dictated entry during a call",
  tooManyAttempts: "Too many incorrect attempts",
};

// Map a numeric score to a tier using the config thresholds.
export function tierForScore(score, config = DEFAULT_CONFIG) {
  if (score >= config.tiers.interventionMin) return "intervention";
  if (score >= config.tiers.cautionMin) return "caution";
  return "stealth";
}

// Build a {score, firedSignals, tier} result from a list of fired signals.
function buildResult(firedSignals, config) {
  const score = firedSignals.reduce((sum, s) => sum + s.points, 0);
  return { score, firedSignals, tier: tierForScore(score, config) };
}

// The environmental signals shared by BOTH authentication phases: active call.
// (Unusual time is shared too but weighted differently per phase, so each
//  scorer adds it explicitly. New device + unusual location are LOGIN-ONLY —
//  where/what-device the sign-in came from is established at login.)
// Returns the fired-signal objects so each phase can add its own on top.
function environmentalSignals(input, config) {
  const { weights } = config;
  const fired = [];
  const add = (id, points) => fired.push({ id, label: SIGNAL_LABELS[id], points });

  if (input.activeCall) add("activeCall", weights.activeCall);

  return fired;
}

/**
 * Score the LOGIN authentication phase.
 * Signals: environmental (call/location/time) + new device + repeated failed
 * password attempts. No amount — there's no transaction yet.
 * @param {Object} input  { activeCall, newDevice, unusualLocation, unusualTime,
 *                          failedAttempts:boolean, now }
 * @param {Object} config
 * @returns {{ score, firedSignals, tier }}
 */
export function scoreLogin(input, config = DEFAULT_CONFIG) {
  const fired = environmentalSignals(input, config);
  // New device + unusual location are login-only — where and on what device the
  // sign-in happened is established at login, not re-checked per transaction.
  if (input.newDevice)
    fired.push({
      id: "newDevice",
      label: SIGNAL_LABELS.newDevice,
      points: config.weights.newDevice,
    });
  if (input.unusualLocation)
    fired.push({
      id: "unusualLocation",
      label: SIGNAL_LABELS.unusualLocation,
      points: config.weights.unusualLocation,
    });
  if (input.failedAttempts)
    fired.push({
      id: "failedAttempts",
      label: SIGNAL_LABELS.failedAttempts,
      points: config.loginWeights.failedAttempts,
    });
  // Unusual time uses the heavier LOGIN weight — an odd-hour sign-in alone
  // warrants a login OTP. Toggle-only: never reads the system clock.
  if (input.unusualTime)
    fired.push({
      id: "unusualTime",
      label: SIGNAL_LABELS.unusualTime,
      points: config.loginWeights.unusualTime,
    });
  return buildResult(fired, config);
}

/**
 * Score the TRANSACTION authentication phase.
 * Signals: environmental (call/location/time) + amount (high/very-high).
 * No new-device signal — that's evaluated at login only.
 * @param {Object} input  { amount, activeCall, unusualLocation,
 *                          unusualTime, now }
 * @param {Object} config
 * @returns {{ score, firedSignals, tier }}
 */
export function scoreTransaction(input, config = DEFAULT_CONFIG) {
  const { weights, amount } = config;
  const fired = environmentalSignals(input, config);
  const add = (id, points) => fired.push({ id, label: SIGNAL_LABELS[id], points });

  // Unusual time at the lighter shared weight (login weights it more heavily).
  if (input.unusualTime) add("unusualTime", weights.unusualTime);

  const amt = Number(input.amount) || 0;
  if (amt > amount.highValueThreshold) add("highValue", weights.highValue);
  if (amt > amount.veryHighValueThreshold)
    add("veryHighValue", weights.veryHighValue);

  return buildResult(fired, config);
}

/**
 * Apply behavioral signals on top of an existing pre-OTP result and re-tier.
 * Behavioral points ADD to the base score (the chosen re-escalation policy).
 * @param {Object} base  result from scoreTransaction
 * @param {string[]} behavioralIds  e.g. ['paste','noPause']
 * @param {Object} config
 * @returns {{ score, firedSignals, tier }}  combined result
 */
export function applyBehavioral(base, behavioralIds = [], config = DEFAULT_CONFIG) {
  const { behavioralWeights } = config;
  const behavioralSignals = behavioralIds.map((id) => ({
    id,
    label: SIGNAL_LABELS[id],
    points: behavioralWeights[id] ?? 0,
  }));
  const firedSignals = [...base.firedSignals, ...behavioralSignals];
  const score = firedSignals.reduce((sum, s) => sum + s.points, 0);
  return { score, firedSignals, tier: tierForScore(score, config) };
}
