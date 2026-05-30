import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRisk } from "../context/useRisk.js";
import ScreenHeader from "../components/ui/ScreenHeader.jsx";
import Button from "../components/ui/Button.jsx";
import Input, { Field } from "../components/ui/Input.jsx";
import Chip from "../components/ui/Chip.jsx";
import Card from "../components/ui/Card.jsx";

const AMOUNT_OPTIONS = [50, 100, 1000, 5000, 40000];
const PURPOSES = ["Family", "Rent", "Utilities", "Shopping", "Education", "Other"];

const DEFAULT_FORM = {
  payeeId: "9801000001",
  payeeName: "",
  amount: "",
  purpose: PURPOSES[0],
  remarks: "",
};

export default function TransactionForm() {
  const navigate = useNavigate();
  const { runScoring, simulation } = useRisk();
  const [form, setForm] = useState(DEFAULT_FORM);

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const normalizedAmount = Number(form.amount) || 0;
  const canProceed = form.payeeId.trim().length > 0 && normalizedAmount > 0;

  const proceed = (event) => {
    event.preventDefault();
    if (!canProceed) return;
    runScoring({
      payeeId: form.payeeId.trim(),
      payeeName: form.payeeName.trim(),
      amount: normalizedAmount,
      purpose: form.purpose,
      remarks: form.remarks.trim(),
      ...simulation,
    });
    navigate("/processing");
  };

  return (
    <>
      <ScreenHeader title="Send Money" onBack={() => navigate("/")} />
      <form onSubmit={proceed} className="flex-1 px-5 py-6 flex flex-col gap-5 overflow-y-auto">

        {/* Main form */}
        <Card className="flex flex-col gap-5">
          <div>
            <p className="text-sm font-semibold">Recipient details</p>
            <p className="text-xs text-esewa-textMuted">
              Enter eSewa ID and amount to continue.
            </p>
          </div>

          <Field label="eSewa ID">
            <div className="relative">
              <Input
                value={form.payeeId}
                onChange={(event) => setField("payeeId", event.target.value)}
                placeholder="9801000001"
                inputMode="numeric"
              />
            </div>
          </Field>

          <Field label="Amount">
            <div className="relative">
              <Input
                type="number"
                min="0"
                step="1"
                value={form.amount}
                onChange={(event) => setField("amount", event.target.value)}
                placeholder="0"
              />
            </div>
          </Field>

          <div className="flex flex-wrap gap-2">
            {AMOUNT_OPTIONS.map((amount) => (
              <Chip
                key={amount}
                selected={normalizedAmount === amount}
                onClick={() => setField("amount", String(amount))}
              >
                Rs. {amount.toLocaleString("en-IN")}
              </Chip>
            ))}
          </div>

          <Field label="Purpose">
            <select
              className="w-full rounded-lg bg-esewa-inputBg border border-esewa-border px-3 py-3 text-base font-medium text-esewa-text outline-none focus:border-esewa-green focus:ring-2 focus:ring-esewa-green/20"
              value={form.purpose}
              onChange={(event) => setField("purpose", event.target.value)}
            >
              {PURPOSES.map((purpose) => (
                <option key={purpose} value={purpose}>
                  {purpose}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Remarks (optional)">
            <Input
              value={form.remarks}
              onChange={(event) => setField("remarks", event.target.value)}
              placeholder="Add a note"
            />
          </Field>
        </Card>

        <div className="mt-auto">
          <Button type="submit" disabled={!canProceed}>
            Proceed
          </Button>
        </div>
      </form>
    </>
  );
}
