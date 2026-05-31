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
import { buildBannerMessage, bannerTone } from "../lib/bannerMessage.js";

const DEMO_OTP = "123456";
const INTERVENTION_TIMER_SECONDS = 10;
// Average gap between digits (ms) that counts as "dictated" entry on a call.
const SLOW_DICTATION_GAP_MS = 800;

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
  // Timestamp of each digit as it's typed — used to detect the slow, dictated
  // entry pattern (≈1s gaps between digits while on a call).
  const digitTimesRef = useRef([]);

  useEffect(() => {
    if (!loadTimeRef.current) loadTimeRef.current = Date.now();
  }, []);
  const [acknowledged, setAcknowledged] = useState(false);
  const [slowedAck, setSlowedAck] = useState(false); // extra "I slowed down" tick
  const [checks, setChecks] = useState({
    verifyReceiver: false,
    neverShareOtp: false,
  });
  const [secondsLeft, setSecondsLeft] = useState(() =>
    result.tier === "intervention" ? INTERVENTION_TIMER_SECONDS : 0,
  );

  useEffect(() => {
    if (result.tier !== "intervention") return;
    // Reset the countdown when intervention becomes active — covers LIVE
    // escalation (caution → intervention via slider/toggle), where the screen
    // mounted in a lower tier with secondsLeft already at 0.
    setSecondsLeft(INTERVENTION_TIMER_SECONDS);
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [result.tier]);

  const bannerMessage = useMemo(
    () => buildBannerMessage(result.tier, result.firedSignals),
    [result.tier, result.firedSignals],
  );
  const tone = bannerTone(result.tier, result.firedSignals);

  // When an active call fired, the live fraud is someone coaching the user ON
  // the call — so the acknowledgement asks them to assert that no one is.
  const onActiveCall = result.firedSignals.some((s) => s.id === "activeCall");
  const tooFastFired = result.firedSignals.some((s) => s.id === "tooFast");

  const smsMessage = useMemo(
    () =>
      buildSmsMessage({
        tier: result.tier,
        transaction,
        firedSignals: result.firedSignals,
        otp: DEMO_OTP,
      }),
    [result.tier, transaction, result.firedSignals],
  );

  const canVerify = (() => {
    // The extra "I've slowed down" tick gates verification whenever it shows.
    if (tooFastFired && !slowedAck) return false;
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
          <Banner tone={tone}>
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
                const now = Date.now();
                // Record a timestamp each time a new digit is added (typing,
                // not deleting), for the slow-dictation gap measurement.
                if (nextValue.length > otp.length) {
                  digitTimesRef.current.push(now);
                }
                setOtp(nextValue);
                if (!firstInputRef.current) {
                  firstInputRef.current = now;
                  entryStartRef.current = now;
                  if (now - loadTimeRef.current < 2000) {
                    addBehavioral("noPause");
                  }
                }
                if (nextValue.length === 6 && entryStartRef.current) {
                  const duration = now - entryStartRef.current;
                  if (!pasteRef.current && duration < 1500) {
                    addBehavioral("tooFast");
                  }
                  // Slow, dictated entry: ~1s gaps between digits WHILE on an
                  // active call — the "scammer reading the code" pattern.
                  const times = digitTimesRef.current;
                  if (!pasteRef.current && onActiveCall && times.length >= 6) {
                    const avgGap = (times[5] - times[0]) / 5;
                    if (avgGap >= SLOW_DICTATION_GAP_MS) {
                      addBehavioral("slowDictation");
                    }
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
              {onActiveCall
                ? "I have verified the recipient and amount, and no one on this call is telling me these digits."
                : "I understand this payment is high risk and I want to continue."}
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
                {onActiveCall
                  ? "No one on this call told me to enter this OTP."
                  : "I will never share my OTP with anyone."}
              </label>
            </div>
          ) : null}

          {tooFastFired ? (
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className={`mt-0.5 h-4 w-4 ${result.tier === "intervention" ? "accent-danger-accent" : "accent-caution-accent"}`}
                checked={slowedAck}
                onChange={(event) => setSlowedAck(event.target.checked)}
              />
              I've slowed down and checked the recipient and amount myself.
            </label>
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
