import { createRef, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AgentAuthDesktopLayout from "../../components/agent/AgentAuthDesktopLayout";
import AgentFormFeedback from "../../components/agent/AgentFormFeedback";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import {
  agentRegister,
  agentVerifyOtp,
  sendOtp,
  setAgentSessionFromAuthResponse,
  verifyOtp,
} from "../../services/cropexApi";

const REG_KEY = "hcx_agent_registration";
const RESET_FLAG = "hcx_agent_reset_otp_ok";
const RESET_PHONE_KEY = "hcx_agent_reset_phone";
const RESET_OTP_KEY = "hcx_agent_reset_otp";
const OTP_LENGTH = 6;

function formatPhoneForLocalStore(digits) {
  const normalized = String(digits || "").replace(/\D/g, "");
  if (!normalized) return "";
  if (normalized.startsWith("234")) return `+${normalized}`;
  if (normalized.startsWith("0")) return `+234${normalized.slice(1)}`;
  return `+234${normalized}`;
}

export default function AgentVerifyPhone() {
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const mode = location.state?.mode === "reset-password" ? "reset-password" : "register";
  const resetPhone = location.state?.phone || "";

  const [digits, setDigits] = useState(() => Array.from({ length: OTP_LENGTH }, () => ""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");

  useEffect(() => {
    if (mode !== "register") return;
    let cancelled = false;
    (async () => {
      try {
        const raw = sessionStorage.getItem(REG_KEY);
        const reg = raw ? JSON.parse(raw) : {};
        const phone = formatPhoneForLocalStore(reg.phone);
        if (!phone) {
          if (!cancelled) setError("Missing phone number. Go back to create account.");
          return;
        }
        setRegisterPhone(phone);
      } catch {
        if (!cancelled) setError("Could not prepare verification code.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const refs = useMemo(() => Array.from({ length: OTP_LENGTH }, () => createRef()), []);

  useEffect(() => {
    refs[0].current?.focus();
  }, []);

  useEffect(() => {
    if (mode === "register") {
      try {
        if (!sessionStorage.getItem(REG_KEY)) {
          navigate("/agent/create-account", { replace: true });
        }
      } catch {
        navigate("/agent/create-account", { replace: true });
      }
    } else if (!resetPhone) {
      navigate("/agent/forgot-password", { replace: true });
    }
  }, [mode, resetPhone, navigate]);

  const handleChange = (index, event) => {
    const raw = event.target.value.replace(/\D/g, "");
    const value = raw.length > 1 ? raw[raw.length - 1] : raw.slice(0, 1);
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError("");
    if (value && index < OTP_LENGTH - 1) setTimeout(() => refs[index + 1].current?.focus(), 0);
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
    pasted.split("").forEach((character, index) => {
      next[index] = character;
    });
    setDigits(next);
    const last = Math.min(pasted.length, OTP_LENGTH) - 1;
    setTimeout(() => refs[last].current?.focus(), 0);
  };

  const resetOtpInputs = () => {
    setDigits(Array.from({ length: OTP_LENGTH }, () => ""));
    setTimeout(() => refs[0].current?.focus(), 0);
  };

  const handleContinue = async () => {
    const otp = digits.join("");
    if (otp.length < OTP_LENGTH) {
      setError(`Please enter the complete ${OTP_LENGTH}-digit code.`);
      return;
    }

    setLoading(true);
    setError("");
    try {
      if (mode === "reset-password") {
        await verifyOtp(resetPhone, otp);
        sessionStorage.setItem(RESET_FLAG, "1");
        sessionStorage.setItem(RESET_PHONE_KEY, formatPhoneForLocalStore(resetPhone));
        sessionStorage.setItem(RESET_OTP_KEY, otp);
        navigate("/agent/reset-password-new", { replace: true });
        return;
      }

      if (!registerPhone) {
        setError("Missing phone number.");
        return;
      }
      const response = await agentVerifyOtp(registerPhone, otp);
      setAgentSessionFromAuthResponse(response);
      navigate("/agent/select-location");
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Verification failed.");
      resetOtpInputs();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setLoading(true);
    try {
      if (mode === "reset-password") {
        if (!resetPhone) return;
        await sendOtp(resetPhone);
      } else {
        const raw = sessionStorage.getItem(REG_KEY);
        const reg = raw ? JSON.parse(raw) : {};
        const payload = {
          full_name: reg.fullName,
          phone_number: reg.phoneNumber || registerPhone,
          email: reg.email,
          gender: reg.gender,
          password: reg.password,
        };
        await agentRegister(payload);
      }
    } catch (resendError) {
      const message = resendError instanceof Error ? resendError.message : "Could not resend code.";
      if (mode === "register" && /already exists|already in use|conflict/i.test(message)) {
        setError("This signup already exists. Use the latest OTP sent to this phone number, or restart with a fresh number.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const otpGrid = (
    <div className={`grid grid-cols-6 mb-4 ${isDesktop ? "max-w-[360px] gap-3 mx-auto" : "gap-3"}`}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={refs[index]}
          type="tel"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          autoComplete="one-time-code"
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={index === 0 ? handlePaste : undefined}
          className={`w-full ${isDesktop ? "h-[44px] text-[18px] rounded-[10px]" : "h-16 text-2xl rounded-2xl"} text-center font-bold font-display bg-white border-2 focus:outline-none transition-colors ${
            digit ? "border-brand-green text-brand-green" : "border-brand-border"
          } focus:border-brand-green`}
        />
      ))}
    </div>
  );

  const otpMeta = (
    <>
      {error && (
        <div className={`mb-4 ${isDesktop ? "flex justify-center" : ""}`}>
          <AgentFormFeedback variant="error" className={isDesktop ? "text-[13px]" : ""}>
            {error}
          </AgentFormFeedback>
        </div>
      )}
      <p className={`font-sans text-brand-text-secondary ${isDesktop ? "text-[14px] text-center" : "text-sm"}`}>
        I did not receive a code,{" "}
        <button
          type="button"
          onClick={() => void handleResend()}
          disabled={loading}
          className="text-brand-green font-semibold disabled:opacity-50"
        >
          Resend Code
        </button>
      </p>
    </>
  );

  if (isDesktop) {
    return (
      <AgentAuthDesktopLayout
        title="Verify Phone number"
        subtitle={`Enter the ${OTP_LENGTH}-digit code we sent to your registered phone number`}
        centerTitle
        titleClassName="text-[46px] leading-[1.05] mb-2"
        subtitleClassName="text-[19px] leading-[1.3] mb-8"
        actionsClassName="mt-auto pt-7"
        actions={
          <div className="space-y-3 w-full">
            <button
              type="button"
              onClick={() => void handleContinue()}
              disabled={loading || digits.join("").length < OTP_LENGTH}
              className="w-full h-[44px] rounded-2xl bg-brand-green text-white font-sans text-[20px] leading-none font-medium inline-flex items-center justify-center transition-all duration-200 active:scale-95 active:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Continue"}
            </button>
            <button
              type="button"
              onClick={() => navigate(mode === "reset-password" ? "/agent/forgot-password" : "/agent/create-account")}
              className="w-full h-[44px] rounded-2xl bg-gray-100 text-brand-green font-sans text-[20px] leading-none font-medium inline-flex items-center justify-center"
            >
              {mode === "reset-password" ? "Back" : "Edit phone number"}
            </button>
          </div>
        }
      >
        {otpGrid}
        {otpMeta}
      </AgentAuthDesktopLayout>
    );
  }

  return (
    <div className="page-white flex flex-col">
      <div className="flex-1 px-5 pt-5">
        <button
          type="button"
          onClick={() => navigate(mode === "reset-password" ? "/agent/forgot-password" : "/agent/create-account")}
          className="flex items-center gap-2 text-brand-text-secondary mb-6"
        >
          <ArrowLeft size={18} />
          <span className="font-sans text-sm">Go back</span>
        </button>
        <h1 className="font-display font-bold text-3xl text-brand-text-primary mb-2">Verify Phone number</h1>
        <p className="font-sans text-sm text-brand-text-secondary mb-8">
          {`Enter the ${OTP_LENGTH}-digit code we sent to your registered phone number`}
        </p>
        {otpGrid}
        {otpMeta}
      </div>
      <div className="px-5 pb-8 space-y-3">
        <button
          type="button"
          onClick={() => void handleContinue()}
          disabled={loading || digits.join("").length < OTP_LENGTH}
          className="btn-primary"
        >
          {loading ? "Verifying..." : "Continue"}
        </button>
        <button
          type="button"
          onClick={() => navigate(mode === "reset-password" ? "/agent/forgot-password" : "/agent/create-account")}
          className="w-full text-center text-brand-green font-sans text-sm font-medium py-2"
        >
          {mode === "reset-password" ? "Back" : "Edit phone number"}
        </button>
      </div>
    </div>
  );
}
