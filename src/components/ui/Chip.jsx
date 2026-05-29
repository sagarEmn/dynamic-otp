// Amount quick-pick chips (50 / 100 / 500 / 1000 / 5000).
// See documentation/design-system.md > Core Components.

export default function Chip({ selected = false, className = "", children, ...props }) {
  return (
    <button
      type="button"
      className={[
        "rounded-lg px-3 py-1.5 text-sm transition-colors",
        selected
          ? "bg-esewa-green text-white border border-esewa-green"
          : "border border-esewa-border text-esewa-text hover:border-esewa-green",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
