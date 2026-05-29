// Phase 2 builds this fully. Phase 1 placeholder: proves routing + scoring
// wiring works end to end.
import { useNavigate } from "react-router-dom";
import { useRisk } from "../context/RiskContext.jsx";
import ScreenHeader from "../components/ui/ScreenHeader.jsx";
import Button from "../components/ui/Button.jsx";

export default function TransactionForm() {
  const navigate = useNavigate();
  const { runScoring } = useRisk();

  const proceed = () => {
    // Placeholder demo input — replaced by the real form in Phase 2.
    runScoring({ payeeId: "9809999999", payeeName: "Unknown", amount: 25000 });
    navigate("/processing");
  };

  return (
    <>
      <ScreenHeader title="Send Money" />
      <div className="flex-1 px-5 py-6 flex flex-col justify-between">
        <p className="text-sm text-esewa-textMuted">
          Transaction form — built in Phase 2.
        </p>
        <Button onClick={proceed}>Proceed</Button>
      </div>
    </>
  );
}
