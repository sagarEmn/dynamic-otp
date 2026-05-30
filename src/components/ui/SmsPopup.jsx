import { useEffect, useRef, useState } from "react";

const ENTER_DELAY = 1500; // first appearance delay
const SWIPE_MS = 450;     // swipe-out duration before the new message pops in

// Phases:
//  'hidden'   — off-screen above, not yet shown
//  'in'       — settled in place (translate-y-0, opacity-100)
//  'swiping'  — sliding out to the right (used both for tap-dismiss and for
//               making room when the message changes)
export default function SmsPopup({ message }) {
  const [phase, setPhase] = useState("hidden");
  // The message actually rendered right now — only swapped while off-screen so
  // the swipe-out shows the OLD text and the pop-in shows the NEW text.
  const [shownMessage, setShownMessage] = useState(message);
  const dismissedRef = useRef(false); // a manual dismiss stays dismissed
  const swapTimer = useRef(null);

  // Initial entrance.
  useEffect(() => {
    const t = setTimeout(() => {
      setShownMessage(message);
      setPhase("in");
    }, ENTER_DELAY);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to message changes (e.g. tier escalates and the SMS rebuilds):
  // swipe the current one away, then pop the new one back in.
  useEffect(() => {
    if (dismissedRef.current) return;          // user dismissed — stay gone
    if (message === shownMessage) return;       // nothing new
    if (phase === "hidden") return;             // first entrance handles it

    setPhase("swiping"); // slide the OLD message out to the right
    clearTimeout(swapTimer.current);
    swapTimer.current = setTimeout(() => {
      setShownMessage(message); // swap text while off-screen
      setPhase("hidden");       // jump to the top (no transition flash)
      // next frame: animate down into place
      requestAnimationFrame(() => requestAnimationFrame(() => setPhase("in")));
    }, SWIPE_MS);
    return () => clearTimeout(swapTimer.current);
  }, [message, shownMessage, phase]);

  const dismiss = () => {
    dismissedRef.current = true;
    setPhase("swiping");
  };

  const translateClass =
    phase === "swiping"
      ? "translate-x-full opacity-0"
      : phase === "in"
      ? "translate-y-0 opacity-100"
      : "-translate-y-4 opacity-0"; // hidden (above)

  // No CSS transition while parked in the 'hidden' state, so the jump back to
  // the top is instant and only the pop-in animates.
  const transitionClass =
    phase === "hidden" ? "transition-none" : "transition-all duration-500 ease-out";

  return (
    <div
      className={`absolute left-3 right-3 top-3 ${transitionClass} ${translateClass}`}
      style={{ pointerEvents: phase === "in" ? "auto" : "none" }}
    >
      <div
        onClick={dismiss}
        className="rounded-xl border border-esewa-border bg-white shadow-popup p-4 cursor-pointer active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center justify-between text-[11px] text-esewa-textMuted">
          <span className="font-semibold text-esewa-green">eSewa</span>
          <span>now</span>
        </div>
        <p className="mt-1 text-sm text-esewa-text">{shownMessage}</p>
      </div>
    </div>
  );
}
