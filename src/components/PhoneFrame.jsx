import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { LOGIN_SCENARIOS, TRANSACTION_SCENARIOS } from "../lib/scenarios.js";
import { useRisk } from "../context/useRisk.js";
import AdminPanel from "./AdminPanel.jsx";
import SimulationPanel from "./SimulationPanel.jsx";

export default function PhoneFrame() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSimulationState } = useRisk();

  // Login is the entry route ("/"); the transaction form lives at "/send".
  const isLogin = location.pathname === "/";

  // Transaction scenario → fill the Send Money form (nonce forces the form's
  // effect to re-run even when re-applying the same scenario).
  const launchTransaction = (scenario) => {
    navigate("/send", { state: { scenarioForm: scenario.form, nonce: Date.now() } });
  };

  // Login scenario → just set the shared simulation toggles + failedAttempts,
  // staying on the login screen so the presenter can log in and see the tier.
  const launchLogin = (scenario) => {
    setSimulationState(scenario.sim);
  };

  const scenarios = isLogin ? LOGIN_SCENARIOS : TRANSACTION_SCENARIOS;
  const onScenario = isLogin ? launchLogin : launchTransaction;
  const heading = isLogin ? "Login scenarios" : "Transaction scenarios";

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-between px-6 py-8 gap-4">

      {/* Left column — scenarios + simulation controls */}
      <div className="flex flex-col gap-6 w-72 shrink-0">
        <div className="flex flex-col gap-4">
          <p className="text-lg font-bold text-gray-400 uppercase tracking-widest">{heading}</p>
          {scenarios.map((scenario) => (
            <button
              key={scenario.label}
              type="button"
              onClick={() => onScenario(scenario)}
              style={{ borderColor: scenario.accentColor, color: scenario.accentColor }}
              className="w-full rounded-xl border-2 bg-white px-4 py-4 text-left transition-all hover:shadow-md"
            >
              <p className="text-lg font-bold">{scenario.label}</p>
              <p className="text-sm font-semibold opacity-70">{scenario.sublabel}</p>
              <p className="text-sm text-gray-600 font-semibold mt-1">{scenario.description}</p>
            </button>
          ))}
        </div>

        <SimulationPanel isLogin={isLogin} />
      </div>

      {/* Phone — center */}
      <div className="w-[410px] min-h-[844px] bg-esewa-surface rounded-3xl shadow-popup overflow-hidden flex flex-col">
        <Outlet />
      </div>

      {/* Admin panel — right */}
      <AdminPanel isLogin={isLogin} />

    </div>
  );
}
