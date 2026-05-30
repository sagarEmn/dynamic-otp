import { useRisk } from "../context/useRisk.js";

// Environmental signals are shared by both phases. Failed-password attempts is
// a login-only signal, so it only appears on the login screen.
const ENV_TOGGLES = [
  { key: "activeCall",      label: "Active phone call" },
  { key: "newDevice",       label: "New / unrecognized device" },
  { key: "unusualLocation", label: "Unusual location" },
  { key: "unusualTime",     label: "Unusual time (odd hours)" },
];

const LOGIN_TOGGLE = { key: "failedAttempts", label: "Repeated failed passwords" };

export default function SimulationPanel({ isLogin = false }) {
  const { simulation, toggleSimulation } = useRisk();

  const toggles = isLogin ? [...ENV_TOGGLES, LOGIN_TOGGLE] : ENV_TOGGLES;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg font-bold text-gray-400 uppercase tracking-widest">
        Simulation controls
      </p>
      <div className="bg-white rounded-xl shadow-card border border-esewa-border px-5 py-5 flex flex-col gap-4 text-base font-medium">
        {toggles.map(({ key, label }) => (
          <label key={key} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={simulation[key]}
              onChange={() => toggleSimulation(key)}
            />
            <span
              className="h-6 w-6 shrink-0 rounded-[6px] border-2 border-gray-300 bg-white
                         flex items-center justify-center transition-colors
                         peer-checked:border-esewa-green peer-checked:bg-esewa-green
                         peer-focus-visible:ring-2 peer-focus-visible:ring-esewa-green/40"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </span>
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}
