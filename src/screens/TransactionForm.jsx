import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useRisk } from "../context/useRisk.js";
import ScreenHeader from "../components/ui/ScreenHeader.jsx";
import Button from "../components/ui/Button.jsx";
import Input, { Field } from "../components/ui/Input.jsx";
import Chip from "../components/ui/Chip.jsx";
import Card from "../components/ui/Card.jsx";
import { useSlotAnimation } from "../hooks/useSlotAnimation.js";

const AMOUNT_OPTIONS = [50, 100, 1000, 5000, 40000];
const PURPOSES = ["Family", "Rent", "Utilities", "Shopping", "Education", "Other"];

const DEFAULT_FORM = {
  payeeId: "9801000001",
  payeeName: "",
  amount: "",
  purpose: PURPOSES[0],
  remarks: "",
};

const SIM_KEYS = ["activeCall", "newDevice", "unusualLocation", "unusualTime"];

export default function TransactionForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { runScoring, simulation, setSimulationState } = useRisk();
  const [form, setForm] = useState(() => ({
    ...DEFAULT_FORM,
    ...(location.state?.scenarioForm ?? {}),
  }));

  useEffect(() => {
    if (location.state?.scenarioForm) {
      const sc = location.state.scenarioForm;
      setForm({ ...DEFAULT_FORM, ...sc });
      // A scenario also carries simulation toggles — push them to the
      // shared simulation panel so both stay in sync.
      const simFromScenario = {};
      for (const key of SIM_KEYS) {
        if (key in sc) simFromScenario[key] = sc[key];
      }
      if (Object.keys(simFromScenario).length) setSimulationState(simFromScenario);
    }
    // Keyed on `nonce` only: it changes on every scenario click, so this
    // re-runs reliably. `setSimulationState` is intentionally excluded — it's
    // recreated each provider render and would cause an infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.nonce]);

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const payeeAnimKey = useSlotAnimation(form.payeeId);
  const amountAnimKey = useSlotAnimation(form.amount);
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
      <ScreenHeader title="Send Money" />
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
                style={{ color: payeeAnimKey ? "transparent" : undefined }}
              />
              {payeeAnimKey ? (
                <span className="pointer-events-none absolute inset-0 flex items-center px-4 text-base font-medium text-esewa-text overflow-hidden">
                  <span key={payeeAnimKey} className="slot-in">
                    {form.payeeId}
                  </span>
                </span>
              ) : null}
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
                style={{ color: amountAnimKey ? "transparent" : undefined }}
              />
              {amountAnimKey ? (
                <span className="pointer-events-none absolute inset-0 flex items-center px-4 text-base font-medium text-esewa-text overflow-hidden">
                  <span key={amountAnimKey} className="slot-in">
                    {form.amount}
                  </span>
                </span>
              ) : null}
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
