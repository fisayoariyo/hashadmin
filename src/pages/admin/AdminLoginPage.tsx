import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, Eye, EyeOff, Lock, Mail } from "lucide-react";
/** Left-panel hero image (`src/assets/admin-auth/login-hero.png`). */
import heroImage from "@/assets/admin-auth/login-hero.png";
import cardPattern from "@/assets/comps/card-pattern-desktop.svg";
import { clearAdminSession, saveAdminSession } from "@/lib/adminSession";
import { enqueueOutbox } from "@/lib/syncOutbox";

type Step = "login" | "reset-otp" | "reset-password";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [step, setStep] = useState<Step>("login");
  const [showResetSuccessModal, setShowResetSuccessModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw1, setShowPw1] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (searchParams.get("logout") !== "1") return;
    void (async () => {
      await clearAdminSession();
      setSearchParams({}, { replace: true });
    })();
  }, [searchParams, setSearchParams]);

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || password.length < 1) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    await saveAdminSession(email.trim());
    await enqueueOutbox("AUTH_LOGIN", { email: email.trim(), at: Date.now() });
    setLoading(false);
    navigate("/dashboard", { replace: true });
  };

  const startForgot = () => {
    setResetEmail(email.trim());
    setDigits(["", "", "", ""]);
    setStep("reset-otp");
    setTimeout(() => otpRefs[0].current?.focus(), 0);
  };

  const handleOtpContinue = async () => {
    if (digits.join("").length < 4) {
      setError("Enter the 4-digit code.");
      return;
    }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 350));
    setLoading(false);
    setPw1("");
    setPw2("");
    setStep("reset-password");
  };

  const handlePasswordReset = async () => {
    if (pw1.length < 1 || pw1 !== pw2) {
      setError("Passwords must match.");
      return;
    }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    await enqueueOutbox("AUTH_PASSWORD_RESET", {
      email: resetEmail || email.trim(),
      at: Date.now(),
    });
    setLoading(false);
    setShowResetSuccessModal(true);
  };

  const dismissSuccessModal = () => {
    setShowResetSuccessModal(false);
    setStep("login");
    setDigits(["", "", "", ""]);
    setPw1("");
    setPw2("");
    setError("");
  };

  const desktopGate = (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-brand-bg-page px-6 py-10 text-center md:hidden">
      <p className="max-w-sm font-sans text-sm leading-relaxed text-brand-text-secondary">
        Please open the admin console on a desktop-sized window. Mobile layout is not
        available yet.
      </p>
    </div>
  );

  const rightPanel = (
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      {step === "login" && (
        <div className="flex h-full min-h-0 flex-col px-6 py-10 lg:px-12">
          <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col">
            <h1 className="mb-12 text-center font-display text-4xl font-bold leading-tight text-brand-text-primary lg:text-[2.5rem]">
              Log in to your account
            </h1>

            <div className="w-full space-y-10">
              <div className="flex flex-col gap-2">
                <label className="font-sans text-sm font-medium text-brand-text-primary">
                  Email
                </label>
                <div
                  className={`admin-input-row ${error && !email.trim() ? "border-red-400 ring-red-200" : ""}`}
                >
                  <Mail size={18} className="shrink-0 text-brand-text-muted" />
                  <div className="h-5 w-px shrink-0 bg-brand-border" />
                  <input
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email here"
                    className="min-w-0 flex-1 bg-transparent font-sans text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-sans text-sm font-medium text-brand-text-primary">
                  Password
                </label>
                <div
                  className={`admin-input-row ${error && password.length < 1 ? "border-red-400" : ""}`}
                >
                  <Lock size={18} className="shrink-0 text-brand-text-muted" />
                  <div className="h-5 w-px shrink-0 bg-brand-border" />
                  <input
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="Enter your password here"
                    className="min-w-0 flex-1 bg-transparent font-sans text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="shrink-0 text-brand-text-muted hover:text-brand-text-primary"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={startForgot}
                  className="font-sans text-sm font-semibold text-[#03624D] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {error ? (
              <p className="mt-8 text-center text-xs text-red-500">{error}</p>
            ) : null}

            <div className="flex flex-1 flex-col justify-end pb-6 pt-16">
              <div className="mx-auto w-full max-w-[440px]">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleLogin}
                  className="btn-admin-primary mx-auto block w-full"
                >
                  {loading ? "Signing in…" : "Log in"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === "reset-otp" && (
        <div className="flex h-full min-h-0 flex-col px-6 py-10 lg:px-12">
          <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col">
            <h1 className="mb-4 text-center font-display text-4xl font-bold text-brand-text-primary">
              Reset password
            </h1>
            <p className="mb-12 text-center font-sans text-lg leading-relaxed text-brand-text-secondary">
              Enter the 4-digit code we sent to your registered email
              {resetEmail ? (
                <>
                  <br />
                  <span className="font-medium text-brand-text-primary">{resetEmail}</span>
                </>
              ) : null}
            </p>
            <div className="flex justify-center gap-4">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={otpRefs[i]}
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(-1);
                    const next = [...digits];
                    next[i] = v;
                    setDigits(next);
                    setError("");
                    if (v && i < 3) otpRefs[i + 1].current?.focus();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !digits[i] && i > 0) {
                      otpRefs[i - 1].current?.focus();
                    }
                  }}
                  className="h-14 w-14 rounded-xl border border-brand-border text-center font-display text-xl text-brand-text-primary focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#03624D]"
                />
              ))}
            </div>
            <p className="mt-10 text-center font-sans text-sm text-brand-text-secondary">
              I did not receive a code,{" "}
              <button type="button" className="font-semibold text-[#03624D] hover:underline">
                Resend Code
              </button>
            </p>
            <p className="mt-3 text-center font-sans text-xs text-brand-text-muted">
              Demo: any 4 digits
            </p>
            {error ? (
              <p className="mt-8 text-center text-xs text-red-500">{error}</p>
            ) : null}
            <div className="flex flex-1 flex-col justify-end pb-6 pt-20">
              <div className="mx-auto w-full max-w-[440px]">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleOtpContinue}
                  className="btn-admin-continue mx-auto block w-full"
                >
                  {loading ? "Please wait…" : "Continue"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("login");
                    setError("");
                  }}
                  className="btn-admin-back mx-auto block"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === "reset-password" && (
        <div className="flex h-full min-h-0 flex-col px-6 py-10 lg:px-12">
          <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col">
            <h1 className="mb-12 text-center font-display text-4xl font-bold text-brand-text-primary">
              Reset password
            </h1>
            <div className="w-full space-y-10">
              <div className="flex flex-col gap-2">
                <label className="font-sans text-sm font-medium text-brand-text-primary">
                  Create your password
                </label>
                <div className="admin-input-row">
                  <Lock size={18} className="shrink-0 text-brand-text-muted" />
                  <div className="h-5 w-px shrink-0 bg-brand-border" />
                  <input
                    type={showPw1 ? "text" : "password"}
                    value={pw1}
                    onChange={(e) => setPw1(e.target.value)}
                    placeholder="Enter your password here"
                    className="min-w-0 flex-1 bg-transparent font-sans text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw1((v) => !v)}
                    className="text-brand-text-muted"
                  >
                    {showPw1 ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-sans text-sm font-medium text-brand-text-primary">
                  Confirm password
                </label>
                <div className="admin-input-row">
                  <Lock size={18} className="shrink-0 text-brand-text-muted" />
                  <div className="h-5 w-px shrink-0 bg-brand-border" />
                  <input
                    type={showPw2 ? "text" : "password"}
                    value={pw2}
                    onChange={(e) => setPw2(e.target.value)}
                    placeholder="Enter your password here"
                    className="min-w-0 flex-1 bg-transparent font-sans text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw2((v) => !v)}
                    className="text-brand-text-muted"
                  >
                    {showPw2 ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
            {error ? (
              <p className="mt-8 text-center text-xs text-red-500">{error}</p>
            ) : null}
            <div className="flex flex-1 flex-col justify-end pb-6 pt-20">
              <div className="mx-auto w-full max-w-[440px]">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handlePasswordReset}
                  className="btn-admin-continue mx-auto block w-full"
                >
                  {loading ? "Saving…" : "Continue"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("reset-otp");
                    setError("");
                  }}
                  className="btn-admin-back mx-auto block"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const leftPanel = (
    <div className="flex min-h-0 min-w-0 items-stretch">
      <div className="relative w-full min-h-[calc(100dvh-3rem)] overflow-hidden rounded-3xl border border-black/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.1)]">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Card pattern + green wash — reference `card-pattern-desktop` + Figma green depth */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.28]"
          style={{
            backgroundImage: `url(${cardPattern})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            mixBlendMode: "soft-light",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[#03624D]/35 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 lg:bottom-8 lg:left-8 lg:right-8">
          <img
            src="/brand/HFEI_Primary_Logo_White.png"
            alt="HFEI by Hashmar Cropex Ltd"
            className="mb-4 block h-11 w-auto max-w-[220px] object-contain object-left"
            draggable={false}
          />
          <h2 className="mb-2 max-w-[26rem] font-display text-3xl font-bold leading-tight text-white lg:text-[2.15rem]">
            Manage Farmers and Field Operations
          </h2>
          <p className="max-w-[28rem] font-sans text-[0.95rem] leading-snug text-white/90 lg:text-[1.05rem]">
            Access the dashboard to oversee farmer registrations, monitor agent activities, and
            keep the entire system running smoothly.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {desktopGate}
      <div className="relative hidden min-h-dvh bg-white px-6 py-6 lg:px-8 lg:py-8 md:block">
        <div
          className={`grid min-h-[calc(100dvh-3rem)] grid-cols-2 items-stretch gap-6 lg:gap-8 ${showResetSuccessModal ? "pointer-events-none opacity-40" : ""}`}
        >
          {leftPanel}
          {rightPanel}
        </div>

        {showResetSuccessModal ? (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-success-title"
            onClick={dismissSuccessModal}
          >
            <div
              className="w-full max-w-[360px] rounded-2xl border border-black/[0.06] bg-white px-10 py-10 text-center shadow-[0_24px_64px_rgba(0,0,0,0.18)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#03624D] text-white shadow-[0_6px_14px_rgba(3,98,77,0.22)]">
                <Check size={36} strokeWidth={2.5} />
              </div>
              <h2
                id="reset-success-title"
                className="font-display text-xl font-bold leading-snug text-[#03624D] lg:text-2xl"
              >
                Password reset successfully
              </h2>
              <button
                type="button"
                onClick={dismissSuccessModal}
                className="btn-admin-continue mt-10 w-full"
              >
                OK
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
