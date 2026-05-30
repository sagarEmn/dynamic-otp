const TONES = {
  stealth:      "bg-esewa-surface text-esewa-textMuted",
  caution:      "bg-caution-bg text-caution-text border-l-4 border-caution-accent",
  intervention: "bg-danger-surface text-danger-text border-l-4 border-danger-accent",
};

export default function Banner({ tone = "stealth", className = "", children }) {
  return (
    <div className={`rounded-xl px-5 py-4 text-sm font-medium ${TONES[tone] ?? TONES.stealth} ${className}`}>
      {children}
    </div>
  );
}
