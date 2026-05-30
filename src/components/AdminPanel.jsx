import { useRisk } from "../context/useRisk.js";

const SIGNAL_WEIGHTS = [
  { key: "highValue",        label: "High value",       max: 50 },
  { key: "veryHighValue",    label: "Very high value",  max: 30 },
  { key: "newPayee",         label: "New payee",        max: 50 },
  { key: "activeCall",       label: "Active call",      max: 50 },
  { key: "newDevice",        label: "New device",       max: 50 },
  { key: "unusualLocation",  label: "Unusual location", max: 50 },
  { key: "unusualTime",      label: "Unusual time",     max: 30 },
];

const BEHAVIORAL_WEIGHTS = [
  { key: "paste",            label: "Paste OTP",        max: 40 },
  { key: "noPause",          label: "No pause",         max: 30 },
  { key: "tooFast",          label: "Too fast",         max: 30 },
  { key: "tooManyAttempts",  label: "Many attempts",    max: 40 },
];

function WeightRow({ label, value, max, onChange }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex justify-between text-[11px]">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="font-bold text-gray-800">{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        step={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-1.5 accent-gray-700 cursor-pointer"
      />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{title}</p>
      {children}
    </div>
  );
}

export default function AdminPanel() {
  const { config, updateWeight } = useRisk();

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Risk weights</p>

      <div className="bg-white rounded-xl shadow-card border border-gray-200 px-3 py-3 flex flex-col gap-4">
        <Section title="Signals">
          {SIGNAL_WEIGHTS.map(({ key, label, max }) => (
            <WeightRow
              key={key}
              label={label}
              value={config.weights[key]}
              max={max}
              onChange={(val) => updateWeight("weights", key, val)}
            />
          ))}
        </Section>

        <Section title="Behavioral">
          {BEHAVIORAL_WEIGHTS.map(({ key, label, max }) => (
            <WeightRow
              key={key}
              label={label}
              value={config.behavioralWeights[key]}
              max={max}
              onChange={(val) => updateWeight("behavioralWeights", key, val)}
            />
          ))}
        </Section>

        <Section title="Thresholds">
          <div className="flex flex-col gap-0.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-600 font-medium">Caution ≥</span>
              <span className="font-bold text-gray-800">{config.tiers.cautionMin}</span>
            </div>
            <input
              type="range" min={10} max={80} step={5}
              value={config.tiers.cautionMin}
              onChange={(e) => updateWeight("tiers", "cautionMin", e.target.value)}
              className="w-full h-1.5 accent-yellow-500 cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-600 font-medium">Intervention ≥</span>
              <span className="font-bold text-gray-800">{config.tiers.interventionMin}</span>
            </div>
            <input
              type="range" min={30} max={120} step={5}
              value={config.tiers.interventionMin}
              onChange={(e) => updateWeight("tiers", "interventionMin", e.target.value)}
              className="w-full h-1.5 accent-red-500 cursor-pointer"
            />
          </div>
        </Section>
      </div>
    </div>
  );
}
