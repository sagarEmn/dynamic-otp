// The warning strip — THIS is what changes per tier (not the whole screen,
// except in intervention where the frame itself goes dark).
// See documentation/design-system.md > Per-Tier Theming Rule.

const TONES = {
  stealth: "bg-esewa-surface text-esewa-textMuted",
  caution: "bg-caution-bg text-caution-text border-l-4 border-caution-accent",
  intervention:
    "bg-danger-surface text-white border-l-4 border-danger-accent",
};

export default function Banner({ tone = "stealth", className = "", children }) {
  return (
    <div
      className={`rounded-xl p-4 text-sm ${TONES[tone] ?? TONES.stealth} ${className}`}
    >
      {children}
    </div>
  );
}
