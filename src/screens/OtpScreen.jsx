// Phase 3 is the core — the three tier modes. UI changes by tier.
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRisk } from "../context/useRisk.js";
import ScreenHeader from "../components/ui/ScreenHeader.jsx";
import Banner from "../components/ui/Banner.jsx";
import Button from "../components/ui/Button.jsx";
import SmsPopup from "../components/ui/SmsPopup.jsx";
import OtpInput from "../components/ui/OtpInput.jsx";
import { buildSmsMessage } from "../lib/smsMessage.js";
import { buildBannerMessage } from "../lib/bannerMessage.js";

const DEMO_OTP = "123456";
const INTERVENTION_TIMER_SECONDS = 10;

export default function OtpScreen() {
  const navigate = useNavigate();
  const { result, transaction, addBehavioral } = useRisk();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const loadTimeRef = useRef(null);
  const firstInputRef = useRef(null);
  const entryStartRef = useRef(null);
  const pasteRef = useRef(false);
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (!loadTimeRef.current) loadTimeRef.current = Date.now();
  }, []);
  const [acknowledged, setAcknowledged] = useState(false);
  const [checks, setChecks] = useState({
    verifyReceiver: false,
    neverShareOtp: false,
  });
  const [secondsLeft, setSecondsLeft] = useState(() =>
    result.tier === "intervention" ? INTERVENTION_TIMER_SECONDS : 0,
  );

  useEffect(() => {
    if (result.tier !== "intervention") return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [result.tier]);

  const bannerMessage = useMemo(
    () => buildBannerMessage(result.tier, result.firedSignals),
    [result.tier, result.firedSignals],
  );

  const smsMessage = useMemo(
    () =>
      buildSmsMessage({
        tier: result.tier,
        transaction,
        otp: DEMO_OTP,
      }),
    [result.tier, transaction],
  );

  const canVerify = (() => {
    if (result.tier === "caution") return acknowledged;
    if (result.tier === "intervention")
      return secondsLeft === 0 && checks.verifyReceiver && checks.neverShareOtp;
    return true;
  })();

  const onSubmit = (event) => {
    event.preventDefault();
    if (!canVerify) return;
    if (otp !== DEMO_OTP) {
      setError("Incorrect OTP. Please try again.");
      attemptsRef.current += 1;
      if (attemptsRef.current >= 3) addBehavioral("tooManyAttempts");
      return;
    }
    navigate("/success");
  };

  return (
    <>
      <ScreenHeader
        title="Verify OTP"
        tone={result.tier === "intervention" ? "dark" : "green"}
        onBack={() => navigate("/send")}
      />
      <form
        onSubmit={onSubmit}
        className={`flex-1 px-5 py-6 flex flex-col gap-5 relative transition-colors duration-500 ease-out ${
          result.tier === "intervention" ? "bg-danger-bg text-white" : ""
        }`}
      >
        <SmsPopup message={smsMessage} />
        <div className="flex-1 flex flex-col justify-center gap-3">
          <Banner tone={result.tier}>
            {bannerMessage}
          </Banner>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-esewa-textMuted px-5 py-1">
              Enter 6-digit OTP
            </label>
            <OtpInput
              value={otp}
              tier={result.tier}
              disabled={!canVerify}
              onChange={(nextValue) => {
                setOtp(nextValue);
                if (!firstInputRef.current) {
                  const now = Date.now();
                  firstInputRef.current = now;
                  entryStartRef.current = now;
                  if (now - loadTimeRef.current < 2000) {
                    addBehavioral("noPause");
                  }
                }
                if (nextValue.length === 6 && entryStartRef.current) {
                  const duration = Date.now() - entryStartRef.current;
                  if (!pasteRef.current && duration < 1500) {
                    addBehavioral("tooFast");
                  }
                  pasteRef.current = false;
                }
                if (error) setError("");
              }}
              onPaste={() => {
                pasteRef.current = true;
                const now = Date.now();
                if (!firstInputRef.current) {
                  firstInputRef.current = now;
                  entryStartRef.current = now;
                  if (now - loadTimeRef.current < 2000) {
                    addBehavioral("noPause");
                  }
                }
                addBehavioral("paste");
              }}
            />
            {error ? (
              <p className="text-xs text-danger-accent">{error}</p>
            ) : null}
          </div>

          {result.tier === "caution" ? (
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-caution-accent"
                checked={acknowledged}
                onChange={(event) => setAcknowledged(event.target.checked)}
              />
              I understand this payment is high risk and I want to continue.
            </label>
          ) : null}

          {result.tier === "intervention" ? (
            <div className="flex flex-col gap-3 text-sm">
              <p className="text-danger-accent font-semibold">
                Hold on {secondsLeft}s — review before entering OTP.
              </p>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-danger-accent"
                  checked={checks.verifyReceiver}
                  onChange={(event) =>
                    setChecks((prev) => ({
                      ...prev,
                      verifyReceiver: event.target.checked,
                    }))
                  }
                />
                I have verified the recipient and amount are correct.
              </label>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-danger-accent"
                  checked={checks.neverShareOtp}
                  onChange={(event) =>
                    setChecks((prev) => ({
                      ...prev,
                      neverShareOtp: event.target.checked,
                    }))
                  }
                />
                I will never share my OTP with anyone.
              </label>
            </div>
          ) : null}

          <Button
            type="submit"
            variant={result.tier === "intervention" ? "danger" : "primary"}
            disabled={!canVerify || otp.length !== 6}
          >
            Verify OTP
          </Button>
        </div>
      </form>
    </>
  );
}
