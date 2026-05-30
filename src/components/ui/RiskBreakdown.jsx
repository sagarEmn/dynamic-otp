import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const TIER_LABEL = {
  stealth:      "LOW",
  caution:      "CAUTION",
  intervention: "HIGH",
};

const TIER_COLOR = {
  stealth:      "text-esewa-green",
  caution:      "text-caution-accent",
  intervention: "text-danger-accent",
};

export default function RiskBreakdown({ score, firedSignals, tier }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-esewa-border bg-esewa-surface text-sm">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 text-esewa-textMuted font-medium"
      >
        <span>
          Risk score:{" "}
          <span className={`font-bold ${TIER_COLOR[tier]}`}>
            {score} → {TIER_LABEL[tier]}
          </span>
        </span>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {open && (
        <div className="border-t border-esewa-divider px-4 py-3 flex flex-col gap-2">
          {firedSignals.length === 0 ? (
            <p className="text-esewa-textMuted">No risk signals detected.</p>
          ) : (
            firedSignals.map((signal) => (
              <div key={signal.id} className="flex justify-between">
                <span className="text-esewa-text font-medium">{signal.label}</span>
                <span className={`font-bold ${TIER_COLOR[tier]}`}>+{signal.points}</span>
              </div>
            ))
          )}
          <div className="mt-1 pt-2 border-t border-esewa-divider flex justify-between font-bold">
            <span className="text-esewa-text">Total</span>
            <span className={TIER_COLOR[tier]}>
              {score} → {TIER_LABEL[tier]}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
