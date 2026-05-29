// Phase 3 is the core — the three tier modes. Phase 1 placeholder shows the
// computed tier so we can confirm the engine -> context→screen path works.
import { useNavigate } from "react-router-dom";
import { useRisk } from "../context/RiskContext.jsx";
import ScreenHeader from "../components/ui/ScreenHeader.jsx";
import Banner from "../components/ui/Banner.jsx";
import Button from "../components/ui/Button.jsx";

export default function OtpScreen() {
  const navigate = useNavigate();
  const { result } = useRisk();

  return (
    <>
      <ScreenHeader title="Verify OTP" />
      <div className="flex-1 px-5 py-6 flex flex-col gap-4">
        <Banner tone={result.tier}>
          Tier: <strong>{result.tier}</strong> · score {result.score}
        </Banner>
        <p className="text-xs text-esewa-textMuted">
          Fired: {result.firedSignals.map((s) => s.label).join(", ") || "none"}
        </p>
        <div className="mt-auto">
          <Button onClick={() => navigate("/success")}>Verify</Button>
        </div>
      </div>
    </>
  );
}
