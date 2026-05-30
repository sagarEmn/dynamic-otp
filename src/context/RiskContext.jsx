// Shared state: transaction inputs, the computed base result, live behavioral
// signals, and the combined (re-escalated) result. The form writes; the
// processing + OTP screens read. Plain Context + useState — no Redux needed.

import { useMemo, useState } from "react";
import { scoreTransaction, applyBehavioral } from "../lib/riskEngine.js";

import { DEFAULT_CONFIG } from "../lib/riskConfig.js";
import { EMPTY_TRANSACTION } from "./riskConstants.js";
import { RiskContext } from "./riskContextBase.js";

export function RiskProvider({ children }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  const updateWeight = (category, key, value) => {
    setConfig((prev) => ({
      ...prev,
      [category]: { ...prev[category], [key]: Number(value) },
    }));
  };

  const [transaction, setTransaction] = useState(EMPTY_TRANSACTION);
  // Base (pre-OTP) scoring result, computed on Proceed.
  const [baseResult, setBaseResult] = useState({
    score: 0,
    firedSignals: [],
    tier: "stealth",
  });
  // Behavioral signal ids fired live on the OTP screen.
  const [behavioralIds, setBehavioralIds] = useState([]);

  // Compute base score from a transaction and store both.
  const runScoring = (tx) => {
    const merged = { ...EMPTY_TRANSACTION, ...tx };
    setTransaction(merged);
    setBehavioralIds([]); // fresh run
    const result = scoreTransaction({ ...merged, now: new Date() }, config);
    setBaseResult(result);
    return result;
  };

  // Add a behavioral signal (idempotent per id) — triggers live re-tier.
  const addBehavioral = (id) => {
    setBehavioralIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const resetFlow = () => {
    setTransaction(EMPTY_TRANSACTION);
    setBaseResult({ score: 0, firedSignals: [], tier: "stealth" });
    setBehavioralIds([]);
  };

  // The combined result = base + behavioral, re-tiered. This is what the
  // OTP screen renders against; it rises live as behavioral signals fire.
  const result = useMemo(
    () => applyBehavioral(baseResult, behavioralIds, config),
    [baseResult, behavioralIds, config],
  );

  const value = {
    config,
    updateWeight,
    transaction,
    baseResult,
    behavioralIds,
    result,
    runScoring,
    addBehavioral,
    resetFlow,
  };

  return <RiskContext.Provider value={value}>{children}</RiskContext.Provider>;
}
