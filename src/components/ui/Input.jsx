export const Label = ({ children, className = "" }) => (
  <label className={`text-sm font-semibold text-esewa-text ${className}`}>
    {children}
  </label>
);

const Input = ({ className = "", ...props }) => (
  <input
    className={[
      "w-full rounded-lg bg-esewa-inputBg border border-esewa-border",
      "px-4 py-3 text-base font-medium text-esewa-text outline-none",
      "placeholder:text-esewa-textLight placeholder:font-normal",
      "focus:border-esewa-green focus:ring-2 focus:ring-esewa-green/20",
      "transition-shadow duration-150",
      className,
    ].join(" ")}
    {...props}
  />
);

export const Field = ({ label, children }) => (
  <div className="flex flex-col gap-2">
    <Label>{label}</Label>
    {children}
  </div>
);

export default Input;
