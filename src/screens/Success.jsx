// Phase 4 polishes this. Phase 1 placeholder closes the loop.
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useRisk } from "../context/RiskContext.jsx";
import Button from "../components/ui/Button.jsx";

export default function Success() {
  const navigate = useNavigate();
  const { resetFlow } = useRisk();

  const done = () => {
    resetFlow();
    navigate("/");
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5 text-center">
      <CheckCircle2 size={64} className="text-esewa-green" />
      <p className="text-lg font-semibold">Transaction complete</p>
      <div className="w-full mt-4">
        <Button onClick={done}>Done</Button>
      </div>
    </div>
  );
}
