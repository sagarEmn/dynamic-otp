// Phase 2 adds the spinner + copy. Phase 1 placeholder: the 1.5s beat,
// then auto-advance to the OTP screen.
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Processing() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate("/otp"), 1500);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-esewa-text">
      <div className="h-10 w-10 rounded-full border-4 border-esewa-surface border-t-esewa-green animate-spin" />
      <p className="text-sm text-esewa-textMuted">
        Verifying transaction security…
      </p>
    </div>
  );
}
