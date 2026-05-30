export default function Chip({ selected = false, className = "", children, ...props }) {
  return (
    <button
      type="button"
      className={[
        "rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-150",
        selected
          ? "bg-esewa-green text-white border border-esewa-green"
          : "bg-esewa-inputBg border border-esewa-border text-esewa-text hover:border-esewa-green hover:text-esewa-green",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
