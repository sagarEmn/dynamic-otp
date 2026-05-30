// Act 1 — the LOGIN authentication phase. Same context-aware tier engine as
// the transaction OTP, but driven by login signals (environmental + repeated
// failed password attempts). Low risk logs straight in; medium/high shows an
// escalating warning + a login OTP before access is granted.
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRisk } from "../context/useRisk.js";
import ScreenHeader from "../components/ui/ScreenHeader.jsx";
import Banner from "../components/ui/Banner.jsx";
import Button from "../components/ui/Button.jsx";
import Input, { Field } from "../components/ui/Input.jsx";
import SmsPopup from "../components/ui/SmsPopup.jsx";
import RiskBreakdown from "../components/ui/RiskBreakdown.jsx";
import OtpInput from "../components/ui/OtpInput.jsx";
import { buildBannerMessage } from "../lib/bannerMessage.js";
import { buildLoginSmsMessage } from "../lib/smsMessage.js";

const DEMO_PASSWORD = "password";
const DEMO_OTP = "123456";
const INTERVENTION_TIMER_SECONDS = 10;

export default function LoginScreen() {
  const navigate = useNavigate();
  const { simulation, runLoginScoring, loginResult } = useRisk();

  const [esewaId, setEsewaId] = useState("9801000001");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [stage, setStage] = useState("credentials"); // 'credentials' | 'otp'
  const failedRef = useRef(0);

  // OTP stage state
  const [otp, setOtp] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const tier = loginResult.tier;

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

  const smsMessage = useMemo(
    () => buildLoginSmsMessage({ tier, firedSignals: loginResult.firedSignals, otp: DEMO_OTP }),
    [tier, loginResult.firedSignals],
  );

  const submitCredentials = (event) => {
    event.preventDefault();
    if (!esewaId.trim() || !password) return;

    if (password !== DEMO_PASSWORD) {
      failedRef.current += 1;
      setError(
        `Incorrect password. (Demo password is "${DEMO_PASSWORD}".) Attempt ${failedRef.current}.`,
      );
      setPassword("");
      return;
    }

    setError("");
    // Score the login context. failedAttempts fires if a scenario preset set
    // it, OR the user fumbled the password 2+ times before getting in — a
    // classic account-takeover signal.
    const result = runLoginScoring({
      ...simulation,
      failedAttempts: simulation.failedAttempts || failedRef.current >= 2,
    });

    if (result.tier === "stealth") {
      navigate("/send"); // frictionless — straight to the transaction app
    } else {
      setStage("otp"); // risky login — verify with an OTP first
    }
  };

  const canVerify = (() => {
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

          <Field label="Password">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </Field>

          {error ? <p className="text-xs text-danger-accent">{error}</p> : null}

          <div className="mt-auto">
            <Button type="submit" disabled={!esewaId.trim() || !password}>
              Log in
            </Button>
          </div>
        </form>
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
          <Banner tone={tier}>{bannerMessage}</Banner>

          <RiskBreakdown
            score={loginResult.score}
            firedSignals={loginResult.firedSignals}
            tier={tier}
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-esewa-textMuted px-1">
              Enter the login code sent to your phone
            </label>
            <OtpInput value={otp} tier={tier} disabled={!canVerify} onChange={setOtp} />
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
