import { useRisk } from "../context/useRisk.js";

// Transaction-only (amount-based) weights.
const AMOUNT_WEIGHTS = [
  { key: "highValue",        label: "High value",       max: 50 },
  { key: "veryHighValue",    label: "Very high value",  max: 30 },
];

// Environmental weights — shared by both authentication phases.
const ENV_WEIGHTS = [
  { key: "activeCall",       label: "Active call",      max: 50 },
  { key: "newDevice",        label: "New device",       max: 50 },
  { key: "unusualLocation",  label: "Unusual location", max: 50 },
  { key: "unusualTime",      label: "Unusual time",     max: 30 },
];

// Login-only weight.
const LOGIN_WEIGHTS = [
  { key: "failedAttempts",   label: "Failed passwords", max: 50 },
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
        <span className="text-sm text-esewa-textMuted font-medium">{label}</span>
        <span className="text-sm font-bold text-esewa-green">{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        step={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-1.5 accent-esewa-green cursor-pointer"
      />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-bold uppercase tracking-widest text-esewa-textMuted">{title}</p>
      {children}
    </div>
  );
}

export default function AdminPanel({ isLogin = false }) {
  const { config, updateWeight } = useRisk();

  // Phase-aware: login hides amount weights and shows the failed-password
  // weight; transaction shows amount weights. Environmental is shared.
  const signalWeights = isLogin
    ? [...ENV_WEIGHTS, ...LOGIN_WEIGHTS]
    : [...AMOUNT_WEIGHTS, ...ENV_WEIGHTS];

  return (
    <div className="flex flex-col gap-3 w-72 shrink-0">
      <p className="text-lg font-bold text-esewa-green uppercase tracking-widest">
        Risk weights · {isLogin ? "Login" : "Transaction"}
      </p>

      <div className="bg-white rounded-xl shadow-card border border-esewa-border px-4 py-4 flex flex-col gap-5 max-h-[820px] overflow-y-auto">
        <Section title="Signals">
          {signalWeights.map(({ key, label, max }) => (
            <WeightRow
              key={key}
              label={label}
              value={
                key === "failedAttempts"
                  ? config.loginWeights[key]
                  : config.weights[key]
              }
              max={max}
              onChange={(val) =>
                updateWeight(
                  key === "failedAttempts" ? "loginWeights" : "weights",
                  key,
                  val,
                )
              }
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
              <span className="text-sm text-esewa-textMuted font-medium">Caution ≥</span>
              <span className="text-sm font-bold text-caution-accent">{config.tiers.cautionMin}</span>
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
              <span className="text-sm text-esewa-textMuted font-medium">Intervention ≥</span>
              <span className="text-sm font-bold text-danger-accent">{config.tiers.interventionMin}</span>
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
