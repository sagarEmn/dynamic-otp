import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useRisk } from "../context/useRisk.js";
import Button from "../components/ui/Button.jsx";

export default function Success() {
  const navigate = useNavigate();
  const { transaction, resetFlow } = useRisk();

  const done = () => {
    resetFlow();
    navigate("/");
  };

  const amount = Number(transaction.amount || 0).toLocaleString("en-IN");
  const payee = transaction.payeeId || "recipient";

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5 text-center">
      <CheckCircle2 size={64} className="text-esewa-green" />
      <p className="text-lg font-semibold">Payment Successful</p>
      <div className="bg-esewa-surface rounded-xl px-6 py-4 w-full flex flex-col gap-1">
        <p className="text-2xl font-bold text-esewa-text">Rs. {amount}</p>
        <p className="text-sm text-esewa-textMuted">sent to</p>
        <p className="text-base font-semibold text-esewa-text">{payee}</p>
      </div>
      <div className="w-full mt-2">
        <Button onClick={done}>Done</Button>
      </div>
    </div>
  );
}
