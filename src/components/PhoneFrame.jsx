import { Outlet, useNavigate } from "react-router-dom";
import { SCENARIOS } from "../lib/scenarios.js";
import AdminPanel from "./AdminPanel.jsx";
import SimulationPanel from "./SimulationPanel.jsx";

export default function PhoneFrame() {
  const navigate = useNavigate();

  const launch = (scenario) => {
    // `nonce` makes location.state a fresh value on every click so the form's
    // effect re-runs even when re-applying the same scenario on the same route.
    navigate("/", { state: { scenarioForm: scenario.form, nonce: Date.now() } });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-between px-6 py-8 gap-4">

      {/* Left column — scenarios + simulation controls */}
      <div className="flex flex-col gap-6 w-72 shrink-0">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Demo scenarios</p>
          {SCENARIOS.map((scenario) => (
            <button
              key={scenario.label}
              type="button"
              onClick={() => launch(scenario)}
              style={{ borderColor: scenario.accentColor, color: scenario.accentColor }}
              className="w-full rounded-xl border-2 bg-white px-4 py-4 text-left transition-all hover:shadow-md"
            >
              <p className="text-lg font-bold">{scenario.label}</p>
              <p className="text-sm font-semibold opacity-70">{scenario.sublabel}</p>
              <p className="text-sm text-gray-600 font-semibold mt-1">{scenario.description}</p>
            </button>
          ))}
        </div>

        <SimulationPanel />
      </div>

      {/* Phone — center */}
      <div className="w-[410px] min-h-[844px] bg-esewa-surface rounded-3xl shadow-popup overflow-hidden flex flex-col">
        <Outlet />
      </div>

      {/* Admin panel — right */}
      <AdminPanel />

    </div>
  );
}
