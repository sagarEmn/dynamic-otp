import { useEffect, useState } from "react";

export default function SmsPopup({ message }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => setDismissed(true);

  const translateClass = dismissed
    ? "translate-x-full opacity-0"
    : visible
    ? "translate-y-0 opacity-100"
    : "-translate-y-4 opacity-0";

  return (
    <div
      className={`absolute left-3 right-3 top-3 transition-all duration-600 ease-out ${translateClass}`}
      style={{ pointerEvents: visible && !dismissed ? "auto" : "none" }}
    >
      <div
        onClick={dismiss}
        className="rounded-xl border border-esewa-border bg-white shadow-popup p-4 cursor-pointer active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center justify-between text-[11px] text-esewa-textMuted">
          <span className="font-semibold text-esewa-green">eSewa</span>
          <span>now</span>
        </div>
        <p className="mt-1 text-sm text-esewa-text">{message}</p>
      </div>
    </div>
  );
}
