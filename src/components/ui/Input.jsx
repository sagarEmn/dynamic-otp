// Light surface, thin border, green focus ring. Pair with <Label>.
// See documentation/design-system.md > Core Components.

export const Label = ({ children, className = "" }) => (
  <label className={`text-xs text-esewa-textMuted ${className}`}>
    {children}
  </label>
);

const Input = ({ className = "", ...props }) => (
  <input
    className={[
      "w-full rounded-lg bg-esewa-surface border border-esewa-border",
      "px-3 py-2.5 text-sm outline-none",
      "focus:border-esewa-green focus:ring-1 focus:ring-esewa-green",
      className,
    ].join(" ")}
    {...props}
  />
);

// A label + input stacked, the standard form field.
export const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <Label>{label}</Label>
    {children}
  </div>
);

export default Input;
