import { createRef, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Smartphone, ArrowLeft } from "lucide-react";
import FarmerAuthDesktopLayout from "../../components/farmer/FarmerAuthDesktopLayout";
import FarmerOnboarding from "../../components/farmer/FarmerOnboarding";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import {
  sendOtp,
  setFarmerSessionFromAuthResponse,
  verifyOtp,
} from "../../services/cropexApi";

const OTP_LENGTH = 6;

function PhoneStep({ onSubmit, onBack }) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (phone.trim().length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await sendOtp(phone.trim());
      onSubmit(phone.trim());
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Could not send the verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  const phoneField = (
    <div className={`mb-6 flex w-full flex-col gap-1.5 text-left ${isDesktop ? "max-w-[560px] self-start" : ""}`}>
      <label className="font-sans text-sm font-medium text-brand-text-primary">Phone Number</label>
      <div
        className={`flex w-full items-center bg-white border rounded-2xl px-4 py-3.5 gap-3 focus-within:ring-2 focus-within:ring-brand-green focus-within:border-transparent transition-all ${
          error ? "border-red-400" : "border-brand-border"
        }`}
      >
        <Smartphone size={18} className="text-brand-text-muted shrink-0" />
        <div className="w-px h-5 bg-brand-border shrink-0" />
        <span className="text-sm text-brand-text-secondary shrink-0">+234</span>
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && void handle()}
          placeholder="Input your phone number here"
          className="min-w-0 flex-1 bg-transparent text-left text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none"
        />
      </div>
      {error && <p className="mt-1 text-left text-xs text-red-500">{error}</p>}
    </div>
  );

  if (isDesktop) {
    return (
      <FarmerAuthDesktopLayout
        title="Login to your farmer profile"
        centerTitle
        contentClassName="max-w-[620px]"
        titleClassName="text-[2.7rem] leading-[1.08]"
        actions={
          <div className="w-full max-w-[560px] space-y-3">
            <button type="button" onClick={() => void handle()} disabled={loading} className="btn-primary w-full">
              {loading ? "Sending code..." : "Continue"}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="w-full py-3.5 rounded-2xl bg-gray-50 text-brand-text-secondary font-sans text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              I do not have an account
            </button>
          </div>
        }
      >
        {phoneField}
      </FarmerAuthDesktopLayout>
    );
  }

  return (
    <div className="page-white flex flex-col">
      <div className="flex-1 px-5 pt-10">
        <h1 className="font-display font-bold text-3xl text-brand-text-primary mb-8 leading-tight">
          Login to your farmer profile
        </h1>
        {phoneField}
      </div>
      <div className="px-5 pb-8 space-y-3">
        <button type="button" onClick={() => void handle()} disabled={loading} className="btn-primary">
          {loading ? "Sending code..." : "Continue"}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="w-full text-center font-sans text-sm text-brand-text-secondary py-2"
        >
          I do not have an account
        </button>
      </div>
    </div>
  );
}

function OTPStep({ phone, onSuccess, onBack }) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [digits, setDigits] = useState(() => Array.from({ length: OTP_LENGTH }, () => ""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refs = useMemo(() => Array.from({ length: OTP_LENGTH }, () => createRef()), []);

  useEffect(() => {
    refs[0].current?.focus();
  }, []);

  const handleChange = (index, event) => {
    const raw = event.target.value.replace(/\D/g, "");
    const value = raw.length > 1 ? raw[raw.length - 1] : raw;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError("");
    if (value && index < OTP_LENGTH - 1) {
      setTimeout(() => refs[index + 1].current?.focus(), 0);
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        setTimeout(() => refs[index - 1].current?.focus(), 0);
      }
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array.from({ length: OTP_LENGTH }, () => "");
    pasted.split("").forEach((char, index) => {
      next[index] = char;
    });
    setDigits(next);
    setTimeout(() => refs[Math.min(pasted.length, OTP_LENGTH) - 1].current?.focus(), 0);
  };

  const handleLogin = async () => {
    const otp = digits.join("");
    if (otp.length < OTP_LENGTH) {
      setError(`Enter the complete ${OTP_LENGTH}-digit code.`);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await verifyOtp(phone, otp);
      setFarmerSessionFromAuthResponse(response);
      onSuccess();
    } catch (verifyError) {
      setError(
        verifyError instanceof Error ? verifyError.message : "Verification failed. Try again."
      );
      setDigits(Array.from({ length: OTP_LENGTH }, () => ""));
      setTimeout(() => refs[0].current?.focus(), 0);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setLoading(true);
    try {
      await sendOtp(phone);
    } catch (resendError) {
      setError(
        resendError instanceof Error ? resendError.message : "Could not resend the verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  const otpGrid = (
    <div className={`mb-4 ${isDesktop ? "flex justify-center gap-3" : "grid grid-cols-6 gap-3"}`}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={refs[index]}
          type="tel"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={index === 0 ? handlePaste : undefined}
          autoComplete="one-time-code"
          className={`${isDesktop ? "w-14" : "w-full"} h-16 text-center text-2xl font-bold font-display bg-white border-2 rounded-2xl focus:outline-none transition-colors ${
            digit ? "border-brand-green text-brand-green" : "border-brand-border"
          } focus:border-brand-green`}
        />
      ))}
    </div>
  );

  const otpFooter = (
    <div className={isDesktop ? "text-center" : ""}>
      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
      <p className="font-sans text-sm text-brand-text-secondary mb-1">
        I did not receive a code,{" "}
        <button type="button" onClick={() => void handleResend()} className="text-brand-green font-semibold">
          Resend Code
        </button>
      </p>
    </div>
  );

  if (isDesktop) {
    return (
      <FarmerAuthDesktopLayout
        title={`Enter ${OTP_LENGTH}-Digit code`}
        subtitle={`Enter the ${OTP_LENGTH}-digit code we sent to your registered phone number`}
        centerTitle
        contentClassName="max-w-[620px]"
        titleClassName="text-[2.7rem] leading-[1.08]"
        actions={
          <div className="w-full max-w-[560px] space-y-3">
            <button
              type="button"
              onClick={() => void handleLogin()}
              disabled={loading || digits.join("").length < OTP_LENGTH}
              className="btn-primary w-full"
            >
              {loading ? "Verifying..." : "Login"}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="w-full py-3.5 rounded-2xl bg-gray-50 text-brand-text-secondary font-sans text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Back
            </button>
          </div>
        }
      >
        {otpGrid}
        {otpFooter}
      </FarmerAuthDesktopLayout>
    );
  }

  return (
    <div className="page-white flex flex-col">
      <div className="flex-1 px-5 pt-5">
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-brand-text-secondary mb-6">
          <ArrowLeft size={18} />
          <span className="font-sans text-sm">Go back</span>
        </button>
        <h1 className="font-display font-bold text-3xl text-brand-text-primary mb-2">{`Enter ${OTP_LENGTH}-Digit code`}</h1>
        <p className="font-sans text-sm text-brand-text-secondary mb-8">
          {`Enter the ${OTP_LENGTH}-digit code we sent to your registered phone number`}
        </p>
        {otpGrid}
        {otpFooter}
      </div>
      <div className="px-5 pb-8 space-y-3">
        <button
          type="button"
          onClick={() => void handleLogin()}
          disabled={loading || digits.join("").length < OTP_LENGTH}
          className="btn-primary"
        >
          {loading ? "Verifying..." : "Login"}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="w-full py-3.5 rounded-2xl bg-gray-50 text-brand-text-secondary font-sans text-sm font-medium"
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default function FarmerVerify() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [step, setStep] = useState(() => (window.matchMedia("(min-width: 768px)").matches ? "phone" : "onboarding"));
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (isDesktop && step === "onboarding") {
      setStep("phone");
    }
  }, [isDesktop, step]);

  if (step === "onboarding") {
    return <FarmerOnboarding onDone={() => setStep("phone")} />;
  }

  if (step === "phone") {
    return (
      <PhoneStep
        onSubmit={(nextPhone) => {
          setPhone(nextPhone);
          setStep("otp");
        }}
        onBack={() => setStep("onboarding")}
      />
    );
  }

  if (step === "otp") {
    return (
      <OTPStep
        phone={phone}
        onSuccess={() => navigate("/farmer/home")}
        onBack={() => setStep("phone")}
      />
    );
  }

  return null;
}
