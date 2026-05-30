import { Outlet, useNavigate } from "react-router-dom";
import { SCENARIOS } from "../lib/scenarios.js";

export default function PhoneFrame() {
  const navigate = useNavigate();

  const launch = (scenario) => {
    navigate("/", { state: { scenarioForm: scenario.form } });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center gap-6 p-4">
      {/* Phone */}
      <div className="w-[410px] min-h-[844px] bg-esewa-surface rounded-3xl shadow-popup overflow-hidden flex flex-col">
        <Outlet />
      </div>

      {/* Scenario panel */}
      <div className="flex flex-col gap-3 w-44">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Demo scenarios</p>
        {SCENARIOS.map((scenario) => (
          <button
            key={scenario.label}
            type="button"
            onClick={() => launch(scenario)}
            style={{ borderColor: scenario.accentColor, color: scenario.accentColor }}
            className="w-full rounded-xl border-2 bg-white px-3 py-3 text-left transition-all hover:shadow-md"
          >
            <p className="text-sm font-bold">{scenario.label}</p>
            <p className="text-xs font-semibold opacity-70">{scenario.sublabel}</p>
            <p className="text-[11px] text-gray-400 font-normal mt-1">{scenario.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
