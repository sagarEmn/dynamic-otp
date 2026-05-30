// Shared state: transaction inputs, the computed base result, live behavioral
// signals, and the combined (re-escalated) result. The form writes; the
// processing + OTP screens read. Plain Context + useState — no Redux needed.

import { useCallback, useMemo, useState } from "react";
import { scoreTransaction, scoreLogin, applyBehavioral } from "../lib/riskEngine.js";

import { DEFAULT_CONFIG } from "../lib/riskConfig.js";
import { EMPTY_TRANSACTION } from "./riskConstants.js";
import { RiskContext } from "./riskContextBase.js";

export function RiskProvider({ children }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  const updateWeight = useCallback((category, key, value) => {
    setConfig((prev) => ({
      ...prev,
      [category]: { ...prev[category], [key]: Number(value) },
    }));
  }, []);

  // Environment simulation toggles — shared so the left-side panel can drive
  // them while the form reads them on Proceed.
  const [simulation, setSimulation] = useState({
    activeCall: false,
    newDevice: false,
    unusualLocation: false,
    unusualTime: false,
    failedAttempts: false, // login-only — drives the failed-password signal
  });

  const toggleSimulation = useCallback((key) => {
    setSimulation((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Merge a partial set of toggles (used when a scenario preset is applied).
  const setSimulationState = useCallback((partial) => {
    setSimulation((prev) => ({ ...prev, ...partial }));
  }, []);

  const [transaction, setTransaction] = useState(EMPTY_TRANSACTION);
  // Base (pre-OTP) scoring result, computed on Proceed.
  const [baseResult, setBaseResult] = useState({
    score: 0,
    firedSignals: [],
    tier: "stealth",
  });
  // Login-phase scoring result, computed on Login submit.
  const [loginResult, setLoginResult] = useState({
    score: 0,
    firedSignals: [],
    tier: "stealth",
  });
  // Behavioral signal ids fired live on the OTP screen.
  const [behavioralIds, setBehavioralIds] = useState([]);

  // Compute base score from a transaction and store both.
  const runScoring = useCallback(
    (tx) => {
      const merged = { ...EMPTY_TRANSACTION, ...tx };
      setTransaction(merged);
      setBehavioralIds([]); // fresh run
      const result = scoreTransaction({ ...merged, now: new Date() }, config);
      setBaseResult(result);
      return result;
    },
    [config],
  );

  // Score the login phase from environmental signals + failed attempts.
  const runLoginScoring = useCallback(
    (loginInput) => {
      const result = scoreLogin({ ...loginInput, now: new Date() }, config);
      setLoginResult(result);
      return result;
    },
    [config],
  );

  // Add a behavioral signal (idempotent per id) — triggers live re-tier.
  const addBehavioral = useCallback((id) => {
    setBehavioralIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const resetFlow = useCallback(() => {
    setTransaction(EMPTY_TRANSACTION);
    setBaseResult({ score: 0, firedSignals: [], tier: "stealth" });
    setLoginResult({ score: 0, firedSignals: [], tier: "stealth" });
    setBehavioralIds([]);
    setSimulation({
      activeCall: false,
      newDevice: false,
      unusualLocation: false,
      unusualTime: false,
      failedAttempts: false,
    });
  }, []);

  // The combined result = base + behavioral, re-tiered. This is what the
  // OTP screen renders against; it rises live as behavioral signals fire.
  const result = useMemo(
    () => applyBehavioral(baseResult, behavioralIds, config),
    [baseResult, behavioralIds, config],
  );

  const value = useMemo(
    () => ({
      config,
      updateWeight,
      simulation,
      toggleSimulation,
      setSimulationState,
      transaction,
      baseResult,
      behavioralIds,
      result,
      loginResult,
      runScoring,
      runLoginScoring,
      addBehavioral,
      resetFlow,
    }),
    [
      config,
      updateWeight,
      simulation,
      toggleSimulation,
      setSimulationState,
      transaction,
      baseResult,
      behavioralIds,
      result,
      loginResult,
      runScoring,
      runLoginScoring,
      addBehavioral,
      resetFlow,
    ],
  );

  return <RiskContext.Provider value={value}>{children}</RiskContext.Provider>;
}
