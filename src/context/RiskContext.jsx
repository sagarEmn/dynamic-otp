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
  // Raw transaction input captured on Proceed (incl. a frozen `now`). We store
  // the INPUT, not the result, so baseResult can be DERIVED — re-scoring live
  // when a weight slider changes the config. This is what makes the
  // transaction OTP screen escalate/de-escalate live during the demo.
  const [txInput, setTxInput] = useState(null);
  // Raw login inputs captured on Login submit. We store the INPUT (not the
  // result) so loginResult can be DERIVED — re-scoring live when a weight
  // slider changes the config, which lets the login OTP screen escalate/
  // de-escalate in real time during the demo. `now` is captured once so the
  // unusual-time clock check stays stable across slider drags.
  const [loginInput, setLoginInput] = useState(null);
  // Behavioral signal ids fired live on the OTP screen.
  const [behavioralIds, setBehavioralIds] = useState([]);

  // Capture the transaction input on Proceed. We store only the
  // transaction-specific facts (amount/payee) plus a frozen `now` — NOT the
  // environmental toggles. Those are read LIVE from `simulation` at score time
  // so toggling a signal on/off on the OTP page re-scores live, just like a
  // weight slider does. baseResult re-derives on config OR simulation change.
  const runScoring = useCallback(
    (tx) => {
      const merged = { ...EMPTY_TRANSACTION, ...tx };
      setTransaction(merged);
      setBehavioralIds([]); // fresh run
      const captured = { ...merged, now: new Date() };
      setTxInput(captured);
      return scoreTransaction({ ...captured, ...simulation }, config);
    },
    [config, simulation],
  );

  // Score the login phase from environmental signals + failed attempts.
  // Capture the input (incl. a frozen `now`) so loginResult can re-derive when
  // config changes; return the freshly computed result for the caller's
  // stealth-vs-OTP branch.
  const runLoginScoring = useCallback(
    (input) => {
      const captured = { ...input, now: new Date() };
      setLoginInput(captured);
      setBehavioralIds([]); // fresh run — drop any prior behavioral signals
      return scoreLogin(captured, config);
    },
    [config],
  );

  // Add a behavioral signal (idempotent per id) — triggers live re-tier.
  const addBehavioral = useCallback((id) => {
    setBehavioralIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const resetFlow = useCallback(() => {
    setTransaction(EMPTY_TRANSACTION);
    setTxInput(null);
    setLoginInput(null);
    setBehavioralIds([]);
    setSimulation({
      activeCall: false,
      newDevice: false,
      unusualLocation: false,
      unusualTime: false,
      failedAttempts: false,
    });
  }, []);

  // Derived base (pre-OTP) result — re-scores whenever the captured input OR
  // the live config (weights/thresholds) changes. This is what makes a weight
  // slider escalate the transaction OTP screen live during the demo.
  // Always score from the LIVE simulation toggles (amount/payee come from the
  // captured txInput, or an empty transaction before Proceed). This means
  // toggling a signal on the OTP page re-scores live in BOTH directions —
  // including off→on when the transaction started out stealth.
  const baseResult = useMemo(
    () =>
      scoreTransaction(
        { ...EMPTY_TRANSACTION, ...txInput, ...simulation, now: txInput?.now ?? new Date() },
        config,
      ),
    [txInput, simulation, config],
  );

  // The combined result = base + behavioral, re-tiered. This is what the
  // OTP screen renders against; it rises live as behavioral signals fire.
  const result = useMemo(
    () => applyBehavioral(baseResult, behavioralIds, config),
    [baseResult, behavioralIds, config],
  );

  // Derived login base result — re-scores whenever the captured input OR the
  // live config (weights/thresholds) changes. This is what makes a weight
  // slider escalate the login OTP screen live during the demo.
  const loginBaseResult = useMemo(
    () =>
      loginInput
        ? scoreLogin(loginInput, config)
        : { score: 0, firedSignals: [], tier: "stealth" },
    [loginInput, config],
  );

  // Combined login result = base + behavioral, re-tiered — mirrors the
  // transaction `result`, so typing behavior (too fast / slow dictation /
  // paste) escalates the login OTP screen live too.
  const loginResult = useMemo(
    () => applyBehavioral(loginBaseResult, behavioralIds, config),
    [loginBaseResult, behavioralIds, config],
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
