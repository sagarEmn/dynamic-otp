// Shown after repeated failed password attempts — a step-up intervention.
// We "notify" the user's other trusted device and ask them to approve the
// login there. It's a recognizable bank/wallet pattern: an attacker holding a
// stolen password can't tap "Approve" on a phone they don't have.
//
// The user taps "Approve" to simulate confirming on their trusted device — a
// brief confirmed state, then onApproved() advances to the OTP.
import { useState } from "react";
import { Smartphone, Check } from "lucide-react";

export default function DeviceApprovalCard({ device, onApproved }) {
  const [approved, setApproved] = useState(false);

  const approve = () => {
    if (approved) return;
    setApproved(true);
    setTimeout(() => onApproved?.(), 900);
  };

  return (
    <div className="rounded-xl border border-esewa-border bg-esewa-inputBg p-4 flex flex-col gap-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`h-11 w-11 shrink-0 rounded-full flex items-center justify-center transition-colors duration-300 ${
            approved ? "bg-esewa-green text-white" : "bg-esewa-surface text-esewa-textMuted"
          }`}
        >
          {approved ? <Check size={22} strokeWidth={3} /> : <Smartphone size={20} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-esewa-text">
            {approved ? "Approved on your device" : "Approve on your trusted device"}
          </p>
          <p className="text-xs text-esewa-textMuted truncate">
            {approved ? "Login confirmed — you're verified." : device}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={approve}
        disabled={approved}
        className={`w-full rounded-lg py-2.5 text-sm font-bold transition-colors ${
          approved
            ? "bg-esewa-surface text-esewa-textMuted cursor-default"
            : "bg-esewa-green text-white hover:bg-esewa-greenDark cursor-pointer"
        }`}
      >
        {approved ? "Approved ✓" : "Approve this sign-in"}
      </button>
    </div>
  );
}
