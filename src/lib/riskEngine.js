// The brain. Pure functions — input in, { score, firedSignals, tier } out.
// Pure = trivially testable against the demo scenarios (see riskEngine.test.js
// and the verification table in documentation/spec-rules.md).

import { DEFAULT_CONFIG } from "./riskConfig.js";
import { isKnownPayee } from "./knownPayees.js";

// Human-readable labels for each signal id (used by the breakdown panel
// and the dynamic warning messages). Single source of truth.
export const SIGNAL_LABELS = {
  highValue: "High value transaction",
  veryHighValue: "Very high value",
  newPayee: "First-time recipient",
  activeCall: "Active phone call",
  newDevice: "New / unrecognized device",
  unusualLocation: "Unusual location",
  unusualTime: "Unusual time (odd hours)",
  // behavioral
  paste: "OTP pasted (not typed)",
  noPause: "No pause to read warning",
  tooFast: "Superhuman typing speed",
  tooManyAttempts: "Too many incorrect attempts",
};

// "Unusual time" = between 23:00 and 05:00 local time.
export function isUnusualTime(date = new Date()) {
  const h = date.getHours();
  return h >= 23 || h < 5;
}

// Map a numeric score to a tier using the config thresholds.
export function tierForScore(score, config = DEFAULT_CONFIG) {
  if (score >= config.tiers.interventionMin) return "intervention";
  if (score >= config.tiers.cautionMin) return "caution";
  return "stealth";
}

/**
 * Score a transaction's PRE-OTP signals.
 * @param {Object} input
 *   amount {number}
 *   payeeId {string}
 *   activeCall {boolean}
 *   newDevice {boolean}
 *   unusualLocation {boolean}
 *   now {Date}  (optional — defaults to current clock; injectable for tests)
 * @param {Object} config
 * @returns {{ score:number, firedSignals:Array<{id,label,points}>, tier:string }}
 */
export function scoreTransaction(input, config = DEFAULT_CONFIG) {
  const { weights, amount } = config;
  const firedSignals = [];

  const add = (id, points) => {
    firedSignals.push({ id, label: SIGNAL_LABELS[id], points });
  };

  const amt = Number(input.amount) || 0;

  if (amt > amount.highValueThreshold) add("highValue", weights.highValue);
  if (amt > amount.veryHighValueThreshold)
    add("veryHighValue", weights.veryHighValue);

  if (input.payeeId && !isKnownPayee(input.payeeId))
    add("newPayee", weights.newPayee);

  if (input.activeCall) add("activeCall", weights.activeCall);
  if (input.newDevice) add("newDevice", weights.newDevice);
  if (input.unusualLocation) add("unusualLocation", weights.unusualLocation);
  // Fires if the demo toggle forces it OR the real clock is in odd hours.
  if (input.unusualTime || isUnusualTime(input.now))
    add("unusualTime", weights.unusualTime);

  const score = firedSignals.reduce((sum, s) => sum + s.points, 0);
  return { score, firedSignals, tier: tierForScore(score, config) };
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
