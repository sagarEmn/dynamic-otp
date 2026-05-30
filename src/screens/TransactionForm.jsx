import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRisk } from "../context/useRisk.js";
import ScreenHeader from "../components/ui/ScreenHeader.jsx";
import Button from "../components/ui/Button.jsx";
import Input, { Field } from "../components/ui/Input.jsx";
import Chip from "../components/ui/Chip.jsx";
import Card from "../components/ui/Card.jsx";

const AMOUNT_OPTIONS = [50, 100, 500, 1000, 5000];
const PURPOSES = [
  "Family",
  "Rent",
  "Utilities",
  "Shopping",
  "Education",
  "Other",
];

export default function TransactionForm() {
  const navigate = useNavigate();
  const { runScoring } = useRisk();
  const [form, setForm] = useState({
    payeeId: "",
    payeeName: "",
    amount: "",
    purpose: PURPOSES[0],
    remarks: "",
    activeCall: false,
    newDevice: false,
    unusualLocation: false,
  });

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
      activeCall: form.activeCall,
      newDevice: form.newDevice,
      unusualLocation: form.unusualLocation,
    });
    navigate("/processing");
  };

  return (
    <>
      <ScreenHeader title="Send Money" />
      <form onSubmit={proceed} className="flex-1 px-5 py-6 flex flex-col gap-5">
        <Card className="flex flex-col gap-6">
          <div>
            <p className="text-sm font-semibold">Recipient details</p>
            <p className="text-xs text-esewa-textMuted">
              Enter eSewa ID and amount to continue.
            </p>
          </div>
          <Field label="eSewa ID">
            <Input
              value={form.payeeId}
              onChange={(event) => setField("payeeId", event.target.value)}
              placeholder="9801000001"
              inputMode="numeric"
            />
          </Field>

          <Field label="Amount">
            <Input
              type="number"
              min="0"
              step="1"
              value={form.amount}
              onChange={(event) => setField("amount", event.target.value)}
              placeholder="0"
            />
          </Field>

          <div className="flex flex-wrap gap-2">
            {AMOUNT_OPTIONS.map((amount) => (
              <Chip
                key={amount}
                selected={normalizedAmount === amount}
                onClick={() => setField("amount", String(amount))}
              >
                Rs. {amount}
              </Chip>
            ))}
          </div>
          <p className="text-xs text-esewa-textMuted">
            Use quick picks or type a custom amount.
          </p>

          <Field label="Purpose">
            <select
              className="w-full rounded-lg bg-esewa-surface border border-esewa-border px-3 py-2.5 text-sm outline-none focus:border-esewa-green focus:ring-1 focus:ring-esewa-green"
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

        <Card className="border border-esewa-border bg-esewa-surface">
          <p className="text-sm font-semibold">Demo controls</p>
          <p className="text-xs text-esewa-textMuted">
            Toggle signals to simulate risk for the demo.
          </p>
          <div className="mt-3 flex flex-col gap-3 text-sm">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 accent-esewa-green"
                checked={form.activeCall}
                onChange={(event) =>
                  setField("activeCall", event.target.checked)
                }
              />
              Active phone call
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 accent-esewa-green"
                checked={form.newDevice}
                onChange={(event) =>
                  setField("newDevice", event.target.checked)
                }
              />
              New / unrecognized device
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 accent-esewa-green"
                checked={form.unusualLocation}
                onChange={(event) =>
                  setField("unusualLocation", event.target.checked)
                }
              />
              Unusual location
            </label>
          </div>
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
