// The green top bar (Send Money / Topup style). Sits flush at the top of
// the frame. Color shifts per tier on the OTP screen via the `tone` prop.
// See documentation/design-system.md > Core Components.

import { ChevronLeft } from "lucide-react";

const TONES = {
  green: "bg-esewa-green text-white",
  dark: "bg-danger-surface text-white", // intervention takeover
};

export default function ScreenHeader({
  title,
  onBack,
  tone = "green",
  right = null,
}) {
  return (
    <div
      className={`flex items-center gap-2 px-4 py-4 ${TONES[tone] ?? TONES.green}`}
    >
      {onBack ? (
        <button onClick={onBack} aria-label="Back" className="shrink-0">
          <ChevronLeft size={22} />
        </button>
      ) : (
        <span className="w-[22px]" />
      )}
      <h1 className="flex-1 text-center text-lg font-semibold">{title}</h1>
      <span className="w-[22px] flex justify-end">{right}</span>
    </div>
  );
}
