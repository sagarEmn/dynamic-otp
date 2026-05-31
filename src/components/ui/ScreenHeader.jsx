import { ChevronLeft } from "lucide-react";

const TONES = {
  green: "bg-esewa-green text-white",
  dark:  "bg-danger-surface text-white",
};

export default function ScreenHeader({ title, onBack, tone = "green", right = null }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-4 transition-colors duration-500 ease-out ${TONES[tone] ?? TONES.green}`}>
      {onBack ? (
        <button onClick={onBack} aria-label="Back" className="shrink-0 p-0.5 rounded-lg cursor-pointer hover:bg-white/15 active:bg-white/20 transition-colors">
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
      ) : (
        <span className="w-7" />
      )}
      <h1 className="flex-1 text-center text-lg font-bold tracking-wide">{title}</h1>
      <span className="w-7 flex justify-end">{right}</span>
    </div>
  );
}
