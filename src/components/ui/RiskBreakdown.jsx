import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const TIER_LABEL = {
  stealth: "LOW",
  caution: "CAUTION",
  intervention: "HIGH",
};

const TIER_COLOR = {
  stealth: "text-esewa-green",
  caution: "text-caution-accent",
  intervention: "text-danger-accent",
};

export default function RiskBreakdown({ score, firedSignals, tier }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-esewa-border bg-esewa-surface text-xs">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-esewa-textMuted"
      >
        <span>
          Risk score:{" "}
          <span className={`font-semibold ${TIER_COLOR[tier]}`}>
            {score} → {TIER_LABEL[tier]}
          </span>
        </span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div className="border-t border-esewa-border px-3 py-2.5 flex flex-col gap-1.5">
          {firedSignals.length === 0 ? (
            <p className="text-esewa-textMuted">No risk signals detected.</p>
          ) : (
            firedSignals.map((signal) => (
              <div key={signal.id} className="flex justify-between">
                <span className="text-esewa-text">{signal.label}</span>
                <span className="font-semibold text-esewa-textMuted">
                  +{signal.points}
                </span>
              </div>
            ))
          )}
          <div className="mt-1 pt-1.5 border-t border-esewa-border flex justify-between font-semibold">
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
