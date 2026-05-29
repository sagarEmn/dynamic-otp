import { useContext } from "react";
import { RiskContext } from "./riskContextBase.js";

export function useRisk() {
  const ctx = useContext(RiskContext);
  if (!ctx) throw new Error("useRisk must be used within <RiskProvider>");
  return ctx;
}
