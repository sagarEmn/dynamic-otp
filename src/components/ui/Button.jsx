const VARIANTS = {
  primary: "bg-esewa-green text-white hover:bg-esewa-greenDark active:bg-esewa-greenDark",
  danger:  "bg-danger-accent text-white hover:opacity-90 active:opacity-80",
  ghost:   "bg-transparent text-esewa-green border border-esewa-green hover:bg-esewa-surface",
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
        "w-full rounded-lg text-base font-bold py-4 px-6",
        "transition-colors duration-150 tracking-wide",
        VARIANTS[variant] ?? VARIANTS.primary,
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
