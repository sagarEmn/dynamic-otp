import { useRef } from "react";

export default function OtpInput({ value, onChange, onPaste, disabled, tier }) {
  const boxRefs = useRef([]);

  const boxBase = [
    "w-11 h-12 rounded-lg border text-center text-lg font-bold outline-none transition-colors duration-150",
    "bg-white text-esewa-text",
    disabled ? "opacity-40 cursor-not-allowed" : "",
  ].join(" ");

  const boxColor =
    tier === "intervention"
      ? "border-danger-border focus:border-danger-accent focus:ring-2 focus:ring-danger-accent/30"
      : "border-esewa-border focus:border-esewa-green focus:ring-2 focus:ring-esewa-green/20";

  const handleChange = (index, e) => {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);
    const chars = value.split("");
    chars[index] = digit;
    const next = chars.join("").slice(0, 6);
    onChange(next);
    if (digit && index < 5) boxRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      boxRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      onChange(pasted);
      onPaste?.();
      boxRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2 bg-esewa-surface border border-esewa-border rounded-lg px-4 py-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (boxRefs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`${boxBase} ${boxColor}`}
        />
      ))}
    </div>
  );
}
