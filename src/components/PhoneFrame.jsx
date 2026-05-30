import { Outlet, useLocation } from "react-router-dom";
import { useRisk } from "../context/useRisk.js";
import AdminPanel from "./AdminPanel.jsx";
import SimulationPanel from "./SimulationPanel.jsx";
import RiskBreakdown from "./ui/RiskBreakdown.jsx";

export default function PhoneFrame() {
  const location = useLocation();
  const { result, loginResult } = useRisk();

  // Login is the entry route ("/"); the transaction form lives at "/send".
  const isLogin = location.pathname === "/";

  // The live score to break down: login phase on "/", transaction elsewhere.
  const breakdown = isLogin ? loginResult : result;

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-between px-6 py-8 gap-4">

      {/* Left column — simulation controls */}
      <div className="flex flex-col gap-6 w-72 shrink-0">
        <SimulationPanel isLogin={isLogin} />
      </div>

      {/* Phone — center */}
      <div className="w-[410px] min-h-[844px] bg-esewa-surface rounded-3xl shadow-popup overflow-hidden flex flex-col">
        <Outlet />
      </div>

      {/* Right column — risk weights + live risk breakdown */}
      <div className="flex flex-col gap-6 w-72 shrink-0">
        <AdminPanel isLogin={isLogin} />
        <RiskBreakdown
          score={breakdown.score}
          firedSignals={breakdown.firedSignals}
          tier={breakdown.tier}
        />
      </div>

    </div>
  );
}
