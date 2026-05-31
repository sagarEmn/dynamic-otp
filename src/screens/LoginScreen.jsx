// Act 1 — the LOGIN authentication phase. Same context-aware tier engine as
// the transaction OTP, but driven by login signals (environmental + repeated
// failed password attempts). Low risk logs straight in; medium/high shows an
// escalating warning + a login OTP before access is granted.
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { useRisk } from "../context/useRisk.js";
import ScreenHeader from "../components/ui/ScreenHeader.jsx";
import Banner from "../components/ui/Banner.jsx";
import Button from "../components/ui/Button.jsx";
import Input, { Field } from "../components/ui/Input.jsx";
import SmsPopup from "../components/ui/SmsPopup.jsx";
import OtpInput from "../components/ui/OtpInput.jsx";
import DeviceApprovalCard from "../components/ui/DeviceApprovalCard.jsx";
import { buildBannerMessage, bannerTone } from "../lib/bannerMessage.js";
import { buildLoginSmsMessage } from "../lib/smsMessage.js";

const DEMO_PASSWORD = "jjjj";
const DEMO_OTP = "123456";
const INTERVENTION_TIMER_SECONDS = 10;
// Average gap between digits (ms) that counts as "dictated" entry on a call.
const SLOW_DICTATION_GAP_MS = 800;
// After this many wrong passwords we stop trusting the password entirely:
// disable it, notify the trusted device, and fall back to code-only login.
const PASSWORD_LOCK_ATTEMPTS = 2;
// The "other signed-in device" we notify for step-up approval.
const TRUSTED_DEVICE = "Pixel 7 · Kathmandu";

export default function LoginScreen() {
  const navigate = useNavigate();
  const { simulation, runLoginScoring, loginResult, addBehavioral } = useRisk();

  const [esewaId, setEsewaId] = useState("9801000001");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  // 'credentials' | 'deviceApproval' | 'otp'
  const [stage, setStage] = useState("credentials");
  // Once too many passwords fail we drop into code-only mode: the password
  // field is removed and login can only continue via the device approval + OTP.
  const [otpOnly, setOtpOnly] = useState(false);
  const failedRef = useRef(0);

  // OTP stage state
  const [otp, setOtp] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [slowedAck, setSlowedAck] = useState(false); // extra "I slowed down" tick
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Behavioral-detection refs (mirror the transaction OTP screen).
  const loadTimeRef = useRef(null);
  const firstInputRef = useRef(null);
  const entryStartRef = useRef(null);
  const pasteRef = useRef(false);
  const digitTimesRef = useRef([]);

  const tier = loginResult.tier;
  const onActiveCall = loginResult.firedSignals.some((s) => s.id === "activeCall");
  const tooFastFired = loginResult.firedSignals.some((s) => s.id === "tooFast");

  // Mark when the OTP stage loads, for the no-pause detector.
  useEffect(() => {
    if (stage === "otp" && !loadTimeRef.current) loadTimeRef.current = Date.now();
  }, [stage]);

  // Behavioral detection on the login OTP input — ported from OtpScreen.
  const onOtpChange = (nextValue) => {
    const now = Date.now();
    if (nextValue.length > otp.length) digitTimesRef.current.push(now);
    setOtp(nextValue);
    if (!firstInputRef.current) {
      firstInputRef.current = now;
      entryStartRef.current = now;
      if (loadTimeRef.current && now - loadTimeRef.current < 2000) {
        addBehavioral("noPause");
      }
    }
    if (nextValue.length === 6 && entryStartRef.current) {
      const duration = now - entryStartRef.current;
      if (!pasteRef.current && duration < 1500) addBehavioral("tooFast");
      const times = digitTimesRef.current;
      if (!pasteRef.current && onActiveCall && times.length >= 6) {
        const avgGap = (times[5] - times[0]) / 5;
        if (avgGap >= SLOW_DICTATION_GAP_MS) addBehavioral("slowDictation");
      }
      pasteRef.current = false;
    }
    if (error) setError("");
  };

  const onOtpPaste = () => {
    pasteRef.current = true;
    const now = Date.now();
    if (!firstInputRef.current) {
      firstInputRef.current = now;
      entryStartRef.current = now;
      if (loadTimeRef.current && now - loadTimeRef.current < 2000) {
        addBehavioral("noPause");
      }
    }
    addBehavioral("paste");
  };

  useEffect(() => {
    if (stage !== "otp" || tier !== "intervention") return;
    setSecondsLeft(INTERVENTION_TIMER_SECONDS);
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [stage, tier]);

  const bannerMessage = useMemo(
    () => buildBannerMessage(tier, loginResult.firedSignals),
    [tier, loginResult.firedSignals],
  );
  const tone = bannerTone(tier, loginResult.firedSignals);

  const smsMessage = useMemo(
    () => buildLoginSmsMessage({ tier, firedSignals: loginResult.firedSignals, otp: DEMO_OTP }),
    [tier, loginResult.firedSignals],
  );

  // Score the login context and route into the right verification step.
  // failedAttempts fires if a scenario preset set it, OR the user fumbled the
  // password enough times — a classic account-takeover signal. When we've
  // locked the password, we always step up (device approval → OTP).
  const proceedAfterAuth = (forceStepUp) => {
    const result = runLoginScoring({
      ...simulation,
      failedAttempts:
        simulation.failedAttempts || forceStepUp || failedRef.current >= PASSWORD_LOCK_ATTEMPTS,
    });

    if (result.tier === "stealth" && !forceStepUp) {
      navigate("/send"); // frictionless — straight to the transaction app
    } else if (forceStepUp) {
      setStage("deviceApproval"); // locked out of password — verify on trusted device first
    } else {
      setStage("otp"); // risky login — verify with an OTP first
    }
  };

  const submitCredentials = (event) => {
    event.preventDefault();
    if (!esewaId.trim()) return;

    // In code-only mode the password field is gone — go straight to step-up.
    if (otpOnly) {
      setError("");
      proceedAfterAuth(true);
      return;
    }

    // The "Repeated failed passwords" simulation toggle stands in for a real
    // brute-force lockout: clicking Log in with it on jumps straight to the
    // password-lock + device-approval step-up, no need to mistype on stage.
    if (simulation.failedAttempts) {
      setOtpOnly(true);
      setPassword("");
      setError("");
      proceedAfterAuth(true);
      return;
    }

    if (!password) return;

    if (password !== DEMO_PASSWORD) {
      failedRef.current += 1;

      // Past the limit: stop trusting the password. Disable it and force a
      // trusted-device approval + OTP instead of letting the guessing continue.
      if (failedRef.current >= PASSWORD_LOCK_ATTEMPTS) {
        setOtpOnly(true);
        setPassword("");
        setError("");
        proceedAfterAuth(true);
        return;
      }

      setError(
        `Incorrect password. (Demo password is "${DEMO_PASSWORD}".) ${PASSWORD_LOCK_ATTEMPTS - failedRef.current} attempt left before password login is disabled.`,
      );
      setPassword("");
      return;
    }

    setError("");
    proceedAfterAuth(false);
  };

  const canVerify = (() => {
    // The extra "I've slowed down" tick gates verification whenever it shows.
    if (tooFastFired && !slowedAck) return false;
    if (tier === "caution") return acknowledged;
    if (tier === "intervention") return secondsLeft === 0 && acknowledged;
    return true;
  })();

  const submitOtp = (event) => {
    event.preventDefault();
    if (!canVerify || otp.length !== 6) return;
    if (otp !== DEMO_OTP) {
      setError("Incorrect OTP. Please try again.");
      return;
    }
    navigate("/send"); // login verified — into the transaction app
  };

  // ---- Credentials stage ----
  if (stage === "credentials") {
    return (
      <>
        <ScreenHeader title="Log in to eSewa" />
        <form onSubmit={submitCredentials} className="flex-1 px-5 py-8 flex flex-col gap-6">
          <div className="flex flex-col items-center gap-1 mt-4 mb-2">
            <div className="h-16 w-16 rounded-2xl bg-esewa-green flex items-center justify-center text-white text-2xl font-bold">
              e
            </div>
            <p className="text-lg font-bold mt-2">Welcome back</p>
            <p className="text-sm text-esewa-textMuted">Log in to continue</p>
          </div>

          <Field label="eSewa ID">
            <Input
              value={esewaId}
              onChange={(e) => setEsewaId(e.target.value)}
              placeholder="98XXXXXXXX"
              inputMode="numeric"
            />
          </Field>

          {otpOnly ? (
            <div className="rounded-xl border border-caution-border bg-caution-bg px-4 py-3 flex items-start gap-3">
              <Lock size={18} className="mt-0.5 shrink-0 text-caution-accent" />
              <p className="text-sm text-caution-text">
                <span className="font-bold">Password login disabled.</span> Too many
                failed attempts. For your security, verify with your trusted device
                and the code we'll send to your phone.
              </p>
            </div>
          ) : (
            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </Field>
          )}

          {error ? <p className="text-xs text-danger-accent">{error}</p> : null}

          <div className="mt-auto">
            <Button
              type="submit"
              disabled={!esewaId.trim() || (!otpOnly && !simulation.failedAttempts && !password)}
            >
              {otpOnly ? "Verify another way" : "Log in"}
            </Button>
          </div>
        </form>
      </>
    );
  }

  // ---- Device-approval step-up (after the password is locked) ----
  if (stage === "deviceApproval") {
    return (
      <>
        <ScreenHeader
          title="Confirm it's you"
          onBack={() => {
            setStage("credentials");
            setError("");
          }}
        />
        <div className="flex-1 px-5 py-8 flex flex-col gap-6">
          <div className="flex flex-col items-center gap-1 mt-2 text-center">
            <p className="text-lg font-bold">Unusual sign-in blocked</p>
            <p className="text-sm text-esewa-textMuted">
              We stopped the repeated password attempts and alerted your trusted
              device. Approve there to continue.
            </p>
          </div>

          <DeviceApprovalCard
            device={TRUSTED_DEVICE}
            onApproved={() => setStage("otp")}
          />

          <button
            type="button"
            onClick={() => setStage("otp")}
            className="text-sm font-semibold text-esewa-green cursor-pointer hover:underline"
          >
            Use the code sent to my phone instead
          </button>
        </div>
      </>
    );
  }

  // ---- Login OTP stage (only reached when login is risky) ----
  return (
    <>
      <ScreenHeader
        title="Verify it's you"
        tone={tier === "intervention" ? "dark" : "green"}
        onBack={() => {
          setStage("credentials");
          setOtp("");
          setError("");
          setAcknowledged(false);
          setSlowedAck(false);
        }}
      />
      <form
        onSubmit={submitOtp}
        className={`flex-1 px-5 py-6 flex flex-col gap-4 relative transition-colors duration-500 ease-out ${
          tier === "intervention" ? "bg-danger-bg text-white" : ""
        }`}
      >
        <SmsPopup message={smsMessage} />

        <div className="flex-1 flex flex-col justify-center gap-4">
          <Banner tone={tone}>{bannerMessage}</Banner>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-esewa-textMuted px-1">
              Enter the login code sent to your phone
            </label>
            <OtpInput
              value={otp}
              tier={tier}
              disabled={!canVerify}
              onChange={onOtpChange}
              onPaste={onOtpPaste}
            />
            {error ? <p className="text-xs text-danger-accent">{error}</p> : null}
          </div>

          {tier === "intervention" ? (
            <p className="text-danger-accent font-semibold text-sm">
              Hold on {secondsLeft}s — confirm this login is really you.
            </p>
          ) : null}

          {tier !== "stealth" ? (
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className={`mt-0.5 h-4 w-4 ${tier === "intervention" ? "accent-danger-accent" : "accent-caution-accent"}`}
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
              />
              I am logging in myself and no one is guiding me to do this.
            </label>
          ) : null}

          {tooFastFired ? (
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className={`mt-0.5 h-4 w-4 ${tier === "intervention" ? "accent-danger-accent" : "accent-caution-accent"}`}
                checked={slowedAck}
                onChange={(e) => setSlowedAck(e.target.checked)}
              />
              I've slowed down and I'm logging in myself.
            </label>
          ) : null}
        </div>

        <div className="mt-auto">
          <Button
            type="submit"
            variant={tier === "intervention" ? "danger" : "primary"}
            disabled={!canVerify || otp.length !== 6}
          >
            Verify &amp; Log in
          </Button>
        </div>
      </form>
    </>
  );
}
