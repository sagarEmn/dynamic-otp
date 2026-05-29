// Full-width, solid, bold. The ONLY button in the app — never style a
// <button> inline on a screen. Add a variant here if you need a new look.
// See documentation/design-system.md > Core Components.

const VARIANTS = {
  primary: "bg-esewa-green text-white hover:bg-esewa-greenAlt",
  danger: "bg-danger-accent text-white hover:opacity-90",
};

export default function Button({
  variant = "primary",
  disabled = false,
  className = "",
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled}
      className={[
        "w-full rounded-lg text-sm font-semibold py-3 transition-colors",
        VARIANTS[variant] ?? VARIANTS.primary,
        disabled ? "opacity-50 cursor-not-allowed" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
