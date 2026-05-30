import { useRisk } from "../context/useRisk.js";

const TOGGLES = [
  { key: "activeCall",      label: "Active phone call" },
  { key: "newDevice",       label: "New / unrecognized device" },
  { key: "unusualLocation", label: "Unusual location" },
  { key: "unusualTime",     label: "Unusual time (odd hours)" },
];

export default function SimulationPanel() {
  const { simulation, toggleSimulation } = useRisk();

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
        Simulation controls
      </p>
      <div className="bg-white rounded-xl shadow-card border border-esewa-border px-4 py-4 flex flex-col gap-3 text-sm font-medium">
        {TOGGLES.map(({ key, label }) => (
          <label key={key} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 accent-esewa-green"
              checked={simulation[key]}
              onChange={() => toggleSimulation(key)}
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}
