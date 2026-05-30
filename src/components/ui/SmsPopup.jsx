import { useEffect, useState } from "react";

export default function SmsPopup({ message }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`pointer-events-none absolute left-3 right-3 top-3 transition-all duration-600 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <div className="pointer-events-none rounded-xl border border-esewa-border bg-white shadow-popup p-4">
        <div className="flex items-center justify-between text-[11px] text-esewa-textMuted">
          <span className="font-semibold text-esewa-green">eSewa</span>
          <span>now</span>
        </div>
        <p className="mt-1 text-sm text-esewa-text">{message}</p>
      </div>
    </div>
  );
}
