export default function SmsPopup({ message, visible = true }) {
  return (
    <div
      className={`pointer-events-none absolute left-3 right-3 top-3 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
      }`}
    >
      <div className="rounded-xl border border-esewa-border bg-white shadow-lg p-4">
        <div className="flex items-center justify-between text-[11px] text-esewa-textMuted">
          <span>eSewa</span>
          <span>now</span>
        </div>
        <p className="mt-1 text-sm text-esewa-text">{message}</p>
      </div>
    </div>
  );
}
